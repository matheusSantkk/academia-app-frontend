import {
  mockStudentUser,
  mockTeacherUser,
  mockWorkouts,
  mockAchievements,
  mockRankingMonthly,
  mockRankingTotal,
  mockStudents as initialMockStudents,
  mockMedicalInfo,
} from "../data/MockData";
import type {
  UserData,
  Workout,
  Achievement,
  RankingUser,
  StudentData,
  StudentMedicalInfo,
} from "../types";
import { isMockMode } from "./config";
import { httpClient } from "./client";
import { API_ENDPOINTS } from "./config";

// FUNÇÕES AUXILIARES
export const calculateLevelProgress = (
  points: number,
  level: number,
): number => {
  const pointsForNextLevel = level * 50;
  if (pointsForNextLevel === 0) return 0;
  const pointsInCurrentLevel = points % pointsForNextLevel;
  return (pointsInCurrentLevel / pointsForNextLevel) * 100;
};

export const calculateBonusXP = (
  baseXP: number,
  streak: number,
  prsCount: number,
): number => {
  const streakBonus = Math.min(streak * 10, 100);
  const prBonus = prsCount * 10;
  const totalBonus = streakBonus + prBonus;
  return Math.round(baseXP * (1 + totalBonus / 100));
};

// --- Storage helpers ---
const LOCAL_STUDENTS_KEY = "app_students_v1";
const LOCAL_TRAININGS_KEY = "app_trainings_v1";
const LOCAL_TEMPLATES_KEY = "app_workout_templates_v1";
const LOCAL_WORKOUT_HISTORY_KEY = "app_workout_history_v1";

type TrainingsMap = Record<string, Workout[]>;

const studentsStore = (() => {
  let students: StudentData[] = [];

  const load = (): StudentData[] => {
    try {
      const raw = localStorage.getItem(LOCAL_STUDENTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StudentData[];
        students = parsed;
        return students;
      }
    } catch {
      // ignore parse errors
    }
    students = initialMockStudents.slice();
    save();
    return students;
  };

  const save = () => {
    try {
      localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(students));
    } catch {
      // ignore
    }
  };

  load();

  return {
    list: () => students,
    create: (partial: Partial<StudentData>): StudentData => {
      const id = `s${Date.now()}`;
      const newStudent: StudentData = {
        id,
        name: partial.name || "Novo Aluno",
        email: partial.email || "",
        role: "student",
        age: partial.age || 18,
        level: partial.level ?? 1,
        points: partial.points ?? 0,
      };
      students.push(newStudent);
      save();
      return newStudent;
    },
    update: (id: string, patch: Partial<StudentData>): StudentData | null => {
      const idx = students.findIndex((s) => s.id === id);
      if (idx === -1) return null;
      students[idx] = { ...students[idx], ...patch };
      save();
      return students[idx];
    },
  };
})();

const trainingsStore = (() => {
  let map: TrainingsMap = {};

  const load = () => {
    try {
      const raw = localStorage.getItem(LOCAL_TRAININGS_KEY);
      if (raw) {
        map = JSON.parse(raw) as TrainingsMap;
        return;
      }
    } catch {
      // ignore
    }
    map = {};
    save();
  };

  const save = () => {
    try {
      localStorage.setItem(LOCAL_TRAININGS_KEY, JSON.stringify(map));
    } catch {
      // ignore
    }
  };

  load();

  return {
    get: (studentId: string) => map[studentId] ?? [],
    set: (studentId: string, workouts: Workout[]) => {
      map[studentId] = workouts;
      save();
      return map[studentId];
    },
  } as const;
})();

type WorkoutHistoryItem = {
  id: string;
  workoutId: string;
  memberId: string;
  startTime: string;
  endTime: string;
  xpEarned: number;
  createdAt: string;
};

const workoutHistoryStore = (() => {
  let history: WorkoutHistoryItem[] = [];

  const load = (): WorkoutHistoryItem[] => {
    try {
      const raw = localStorage.getItem(LOCAL_WORKOUT_HISTORY_KEY);
      if (raw) {
        history = JSON.parse(raw) as WorkoutHistoryItem[];
        return history;
      }
    } catch {
      // ignore
    }
    history = [];
    save();
    return history;
  };

  const save = () => {
    try {
      localStorage.setItem(LOCAL_WORKOUT_HISTORY_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  };

  load();

  return {
    getByMember: (memberId: string): WorkoutHistoryItem[] => {
      return history.filter((h) => h.memberId === memberId);
    },
    add: (item: WorkoutHistoryItem): WorkoutHistoryItem => {
      history.push(item);
      save();
      return item;
    },
    hasCompletedToday: (memberId: string): boolean => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return history.some((h) => {
        if (h.memberId !== memberId) return false;
        const endTime = new Date(h.endTime);
        return endTime >= today && endTime < tomorrow;
      });
    },
  } as const;
})();

type StoredWorkoutTemplate = {
  id: string;
  title: string;
  description?: string | null;
  items: Array<{
    id: string;
    exercise: { id: string; name: string };
    sets: number;
    repetitions: number;
    weight: number | null;
    restTime: number;
    observations: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
};

const templatesStore = (() => {
  let templates: StoredWorkoutTemplate[] = [];

  const load = (): StoredWorkoutTemplate[] => {
    try {
      const raw = localStorage.getItem(LOCAL_TEMPLATES_KEY);
      if (raw) {
        templates = JSON.parse(raw) as StoredWorkoutTemplate[];
        return templates;
      }
    } catch {
      // ignore
    }
    templates = [];
    save();
    return templates;
  };

  const save = () => {
    try {
      localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(templates));
    } catch {
      // ignore
    }
  };

  load();

  return {
    list: () => templates,
    create: (payload: {
      title: string;
      description?: string;
      items: Array<{
        exerciseName: string;
        sets: number;
        reps: string;
        weight?: number;
        rest?: string;
        observations?: string;
      }>;
    }): StoredWorkoutTemplate => {
      const now = new Date().toISOString();
      const id = `t${Date.now()}`;
      const tpl: StoredWorkoutTemplate = {
        id,
        title: payload.title,
        description: payload.description ?? null,
        items: payload.items.map((it, idx) => ({
          id: `${id}-i${idx}-${Date.now()}`,
          exercise: { id: `ex-${Date.now()}-${idx}`, name: it.exerciseName },
          sets: it.sets,
          repetitions: (() => {
            const m = String(it.reps || "").match(/(\d+)/);
            return m ? Number(m[1]) : 10;
          })(),
          weight: it.weight && it.weight > 0 ? it.weight : null,
          restTime: (() => {
            const m = String(it.rest || "60").replace(/[^0-9]/g, "");
            const n = Number(m);
            return Number.isFinite(n) && n > 0 ? n : 60;
          })(),
          observations: it.observations ?? null,
        })),
        createdAt: now,
        updatedAt: now,
      };
      templates = [tpl, ...templates];
      save();
      return tpl;
    },
    update: (id: string, payload: {
      title: string;
      description?: string;
      items: Array<{
        exerciseName: string;
        sets: number;
        reps: string;
        weight?: number;
        rest?: string;
        observations?: string;
      }>;
    }): StoredWorkoutTemplate | null => {
      const idx = templates.findIndex((t) => t.id === id);
      if (idx === -1) return null;
      
      const now = new Date().toISOString();
      const updated: StoredWorkoutTemplate = {
        ...templates[idx],
        title: payload.title,
        description: payload.description ?? null,
        items: payload.items.map((it, itemIdx) => ({
          id: `${id}-i${itemIdx}-${Date.now()}`,
          exercise: { id: `ex-${Date.now()}-${itemIdx}`, name: it.exerciseName },
          sets: it.sets,
          repetitions: (() => {
            const m = String(it.reps || "").match(/(\d+)/);
            return m ? Number(m[1]) : 10;
          })(),
          weight: it.weight && it.weight > 0 ? it.weight : null,
          restTime: (() => {
            const m = String(it.rest || "60").replace(/[^0-9]/g, "");
            const n = Number(m);
            return Number.isFinite(n) && n > 0 ? n : 60;
          })(),
          observations: it.observations ?? null,
        })),
        updatedAt: now,
      };
      templates[idx] = updated;
      save();
      return updated;
    },
    delete: (id: string) => {
      templates = templates.filter((t) => t.id !== id);
      save();
    },
  } as const;
})();

// --- Mock API Implementation ---
const mockAPI = {
  login: async (email: string, _password: string): Promise<UserData> => {
    // marcar _password como usado para satisfazer linter (mock)
    void _password;
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email.includes("professor")) {
          resolve(mockTeacherUser);
        } else {
          resolve(mockStudentUser);
        }
      }, 500);
    });
  },

  getWorkouts: async (_memberId?: string): Promise<Workout[]> => {
    // marcar _memberId como usado para satisfazer linter (mock)
    void _memberId;
    // No mock, retorna os treinos mockados independente do memberId
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockWorkouts), 300),
    );
  },

  getAchievements: async (_memberId?: string): Promise<Achievement[]> => {
    // marcar _memberId como usado para satisfazer linter (mock)
    void _memberId;
    // No mock, retorna os achievements mockados independente do memberId
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockAchievements), 300),
    );
  },

  getRanking: async (type: "monthly" | "total"): Promise<RankingUser[]> => {
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve(type === "monthly" ? mockRankingMonthly : mockRankingTotal),
        300,
      );
    });
  },

  getMemberData: async (
    _memberId: string,
  ): Promise<{
    id: string;
    name: string;
    email: string;
    level: number;
    xp: number;
    currentStreak: number;
  }> => {
    // marcar _memberId como usado para satisfazer linter (mock)
    void _memberId;
    // No mock, retorna dados do mockStudentUser
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: mockStudentUser.id,
          name: mockStudentUser.name,
          email: mockStudentUser.email,
          level: mockStudentUser.level || 1,
          xp: mockStudentUser.points || 0,
          currentStreak: mockStudentUser.streak || 0,
        });
      }, 300);
    });
  },

  getStudents: async (): Promise<StudentData[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(studentsStore.list()), 300),
    );
  },

  getMedicalInfo: async (_studentId: string): Promise<StudentMedicalInfo> => {
    void _studentId;
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockMedicalInfo), 300),
    );
  },

  createStudent: async (
    student: Partial<StudentData>,
  ): Promise<StudentData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newStudent = studentsStore.create(student);
        resolve(newStudent);
      }, 400);
    });
  },

  updateStudent: async (id: string, patch: Partial<StudentData>) => {
    return new Promise<StudentData | null>((resolve) => {
      setTimeout(() => resolve(studentsStore.update(id, patch)), 300);
    });
  },

  getTraining: async (studentId: string): Promise<Workout[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(trainingsStore.get(studentId)), 250),
    );
  },

  saveTraining: async (
    studentId: string,
    workouts: Workout[],
  ): Promise<Workout[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(trainingsStore.set(studentId, workouts)), 400),
    );
  },

  memberLogin: async (
    _email: string,
    _password: string,
  ): Promise<UserData & { needsPasswordChange?: boolean }> => {
    // marcar parâmetros como usados para satisfazer linter (mock)
    void _email;
    void _password;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...mockStudentUser,
          needsPasswordChange: false, // No mock, não precisa trocar senha
        });
      }, 500);
    });
  },

  changePassword: async (_newPassword: string): Promise<void> => {
    void _newPassword;
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 300);
    });
  },

  completeWorkout: async (
    _workoutId: string,
  ): Promise<{
    id: string;
    xpEarned: number;
    member: {
      id: string;
      xp: number;
      level: number;
      currentStreak?: number;
    };
  }> => {
    // No mock, simula completar treino e ganhar XP
    return new Promise((resolve) => {
      setTimeout(() => {
        const memberId = mockStudentUser.id;
        
        // Verificar se já completou um treino hoje
        const alreadyCompletedToday = workoutHistoryStore.hasCompletedToday(memberId);
        
        let xpEarned = 0;
        let newXP = mockStudentUser.points || 0;
        let newLevel = Math.floor(newXP / 100) + 1;
        let newStreak = mockStudentUser.streak || 0;

        if (!alreadyCompletedToday) {
          // Primeiro treino do dia, ganha XP
          xpEarned = Math.floor(Math.random() * 50) + 10; // 10-60 XP
          newXP = newXP + xpEarned;
          newLevel = Math.floor(newXP / 100) + 1;
          newStreak = (mockStudentUser.streak || 0) + 1;
          
          // Atualizar mockStudentUser
          mockStudentUser.points = newXP;
          mockStudentUser.level = newLevel;
          mockStudentUser.streak = newStreak;
          
          // Salvar no histórico
          const now = new Date().toISOString();
          workoutHistoryStore.add({
            id: `h${Date.now()}`,
            workoutId: _workoutId,
            memberId: memberId,
            startTime: now,
            endTime: now,
            xpEarned: xpEarned,
            createdAt: now,
          });
        } else {
          // Já completou um treino hoje, não ganha XP
          // Mas ainda atualiza o histórico (sem XP)
          const now = new Date().toISOString();
          workoutHistoryStore.add({
            id: `h${Date.now()}`,
            workoutId: _workoutId,
            memberId: memberId,
            startTime: now,
            endTime: now,
            xpEarned: 0,
            createdAt: now,
          });
        }

        resolve({
          id: _workoutId,
          xpEarned,
          member: {
            id: mockStudentUser.id,
            xp: newXP,
            level: newLevel,
            currentStreak: newStreak,
          },
        });
      }, 500);
    });
  },

  getWorkoutHistory: async (memberId: string): Promise<Array<{
    id: string;
    workoutId: string;
    memberId: string;
    startTime: string;
    endTime: string;
    xpEarned: number;
    createdAt: string;
  }>> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(workoutHistoryStore.getByMember(memberId)), 300),
    );
  },

  // Workout Templates (mock)
  getWorkoutTemplates: async (): Promise<import("../types").WorkoutTemplate[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(templatesStore.list() as any), 200),
    );
  },

  createWorkoutTemplate: async (template: {
    title: string;
    description?: string;
    items: Array<{
      exerciseName: string;
      sets: number;
      reps: string;
      weight?: number;
      rest?: string;
      observations?: string;
    }>;
  }): Promise<import("../types").WorkoutTemplate> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(templatesStore.create(template) as any), 300),
    );
  },

  applyWorkoutTemplate: async (
    templateId: string,
    memberId: string,
  ): Promise<Workout[]> => {
    const tpl = templatesStore.list().find((t) => t.id === templateId);
    if (!tpl) {
      throw new Error("Template não encontrado");
    }

    // Verificar se já existe um treino com este título para este aluno
    const current = trainingsStore.get(memberId);
    const existingWorkout = current.find((w) => w.name === tpl.title);
    
    // Se já existe, retornar os treinos sem criar um novo
    if (existingWorkout) {
      return new Promise((resolve) => setTimeout(() => resolve(current), 250));
    }

    // Determinar o tipo baseado na quantidade de treinos existentes
    const types = ['A', 'B', 'C'] as const;
    const type = types[current.length % 3] || 'A';

    const workout: Workout = {
      id: `w-${Date.now()}`,
      type: type,
      name: tpl.title,
      exercises: tpl.items.map((it, idx) => ({
        id: `e-${Date.now()}-${idx}`,
        name: it.exercise.name,
        series: it.sets,
        reps: String(it.repetitions),
        weight: it.weight ?? 0,
        rest: `${it.restTime}s`,
        completed: false,
      })),
    };

    const updated = trainingsStore.set(memberId, [...current, workout]);
    return new Promise((resolve) => setTimeout(() => resolve(updated), 250));
  },

  updateWorkoutTemplate: async (
    id: string,
    template: {
      title: string;
      description?: string;
      items: Array<{
        exerciseName: string;
        sets: number;
        reps: string;
        weight?: number;
        rest?: string;
        observations?: string;
      }>;
    },
  ): Promise<import("../types").WorkoutTemplate> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const updated = templatesStore.update(id, template);
        if (!updated) {
          reject(new Error("Template não encontrado"));
          return;
        }
        resolve(updated as any);
      }, 300);
    });
  },

  deleteWorkoutTemplate: async (id: string): Promise<void> => {
    return new Promise((resolve) =>
      setTimeout(() => {
        templatesStore.delete(id);
        resolve();
      }, 200),
    );
  },
};

// --- Server API Implementation ---
// Para ativar, defina VITE_API_MODE=server no .env
const serverAPI = {
  login: async (email: string, password: string): Promise<UserData> => {
    // Garantir que email está normalizado
    const normalizedEmail = email.trim().toLowerCase();

    console.log("[API] Tentando login:", { email: normalizedEmail });

    const response = await httpClient.post<{
      accessToken: string;
      instructorId: string;
      instructor: {
        id: string;
        name: string;
        email: string;
      };
    }>(API_ENDPOINTS.AUTH.LOGIN, {
      email: normalizedEmail,
      password: password.trim(),
    });

    console.log("[API] Login bem-sucedido:", response);

    // Salva o token
    if (response.accessToken) {
      httpClient.setAuthToken(response.accessToken);
      localStorage.setItem("auth_token", response.accessToken);
    }

    // Converte a resposta do backend para o formato UserData esperado pelo frontend
    return {
      id: response.instructor.id,
      name: response.instructor.name,
      email: response.instructor.email,
      role: "teacher",
    };
  },

  memberLogin: async (
    email: string,
    password: string,
  ): Promise<UserData & { needsPasswordChange?: boolean }> => {
    const normalizedEmail = email.trim().toLowerCase();

    console.log("[API] Tentando login de membro:", { email: normalizedEmail });

    const response = await httpClient.post<{
      accessToken: string;
      memberId: string;
      member: {
        id: string;
        name: string;
        email: string;
      };
      needsPasswordChange: boolean;
    }>(API_ENDPOINTS.AUTH.MEMBER_LOGIN, {
      email: normalizedEmail,
      password: password.trim(),
    });

    console.log("[API] Login de membro bem-sucedido:", response);

    // Salva o token
    if (response.accessToken) {
      httpClient.setAuthToken(response.accessToken);
      localStorage.setItem("auth_token", response.accessToken);
    }

    // Converte a resposta do backend para o formato UserData esperado pelo frontend
    return {
      id: response.member.id,
      name: response.member.name,
      email: response.member.email,
      role: "student",
      needsPasswordChange: response.needsPasswordChange,
    };
  },

  changePassword: async (newPassword: string): Promise<void> => {
    await httpClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      newPassword: newPassword.trim(),
    });
  },

  getWorkouts: async (memberId?: string): Promise<Workout[]> => {
    if (memberId) {
      // Buscar treinos específicos do aluno usando o endpoint de training
      return httpClient.get<Workout[]>(API_ENDPOINTS.TRAINING.GET(memberId));
    }
    return httpClient.get<Workout[]>(API_ENDPOINTS.WORKOUTS.LIST);
  },

  getAchievements: async (memberId?: string): Promise<Achievement[]> => {
    // Buscar todas as conquistas disponíveis
    const allAchievements = await httpClient.get<Array<{
      id: string;
      title: string;
      description: string;
      points: number;
      iconUrl?: string;
    }>>(API_ENDPOINTS.ACHIEVEMENTS.LIST);

    // Se não tiver memberId, retornar todas como bloqueadas
    if (!memberId) {
      return allAchievements.map((a) => ({
        id: a.id,
        name: a.title,
        description: a.description,
        icon: a.iconUrl || "🏆",
        unlocked: false,
      }));
    }

    // Buscar conquistas desbloqueadas do aluno
    const unlockedAchievements = await httpClient.get<Array<{
      id: string;
      title: string;
      description: string;
      points: number;
      iconUrl?: string;
      unlockedAt?: string;
    }>>(API_ENDPOINTS.ACHIEVEMENTS.BY_MEMBER(memberId));

    const unlockedIds = new Set(unlockedAchievements.map((a) => a.id));
    const unlockedMap = new Map(
      unlockedAchievements.map((a) => [a.id, a])
    );

    // Combinar: todas as conquistas, marcando quais estão desbloqueadas
    return allAchievements.map((a) => {
      const isUnlocked = unlockedIds.has(a.id);
      const unlockedAchievement = unlockedMap.get(a.id);
      
      return {
        id: a.id,
        name: a.title,
        description: a.description,
        icon: a.iconUrl || "🏆",
        unlocked: isUnlocked,
        unlockedAt: unlockedAchievement?.unlockedAt || (isUnlocked ? new Date().toISOString() : undefined),
        points: a.points,
      };
    });
  },

  getMemberData: async (
    memberId: string,
  ): Promise<{
    id: string;
    name: string;
    email: string;
    level: number;
    xp: number;
    currentStreak: number;
  }> => {
    const member = await httpClient.get<{
      id: string;
      name: string;
      email: string;
      level: number;
      xp: number;
      currentStreak: number;
    }>(API_ENDPOINTS.MEMBERS.GET(memberId));
    return member;
  },

  getRanking: async (type: "monthly" | "total"): Promise<RankingUser[]> => {
    const endpoint =
      type === "monthly"
        ? API_ENDPOINTS.RANKING.MONTHLY
        : API_ENDPOINTS.RANKING.TOTAL;
    return httpClient.get<RankingUser[]>(endpoint);
  },

  getStudents: async (): Promise<StudentData[]> => {
    // Buscar membros do backend e converter para StudentData
    const members = await httpClient.get<
      Array<{
        id: string;
        name: string;
        email: string;
        birthDate: string;
        weight?: number;
        height?: number;
        gender?: string;
        level: number;
        xp: number;
        currentStreak: number;
      }>
    >(API_ENDPOINTS.MEMBERS.LIST);

    // Converter cada Member para StudentData
    return members.map((member) => {
      const birthDate = new Date(member.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role: "student",
        age,
        level: member.level,
        points: member.xp,
        streak: member.currentStreak,
        weight: member.weight,
        height: member.height,
        gender: member.gender as "male" | "female" | "other" | undefined,
      };
    });
  },

  getMedicalInfo: async (studentId: string): Promise<StudentMedicalInfo> => {
    return httpClient.get<StudentMedicalInfo>(
      API_ENDPOINTS.MEMBERS.GET(studentId) + "/medical",
    );
  },

  createStudent: async (
    student: Partial<StudentData>,
  ): Promise<StudentData> => {
    // O backend retorna um Member, precisamos converter para StudentData
    const member = await httpClient.post<{
      id: string;
      name: string;
      email: string;
      birthDate: string;
      phone: string;
      weight?: number;
      height?: number;
      gender?: string;
      level: number;
      xp: number;
      currentStreak: number;
    }>(API_ENDPOINTS.MEMBERS.CREATE, student);

    // Calcular idade a partir da data de nascimento
    const birthDate = new Date(member.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Converter Member para StudentData
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      role: "student",
      age: age,
      level: member.level,
      points: member.xp,
      streak: member.currentStreak,
      weight: member.weight,
      height: member.height,
      gender: member.gender as "male" | "female" | "other" | undefined,
    };
  },

  updateStudent: async (
    id: string,
    patch: Partial<StudentData>,
  ): Promise<StudentData | null> => {
    return httpClient.patch<StudentData>(
      API_ENDPOINTS.STUDENTS.UPDATE(id),
      patch,
    );
  },

  getTraining: async (studentId: string): Promise<Workout[]> => {
    return httpClient.get<Workout[]>(API_ENDPOINTS.TRAINING.GET(studentId));
  },

  saveTraining: async (
    studentId: string,
    workouts: Workout[],
  ): Promise<Workout[]> => {
    return httpClient.post<Workout[]>(
      API_ENDPOINTS.TRAINING.SAVE(studentId),
      workouts,
    );
  },

  completeWorkout: async (
    workoutId: string,
  ): Promise<{
    id: string;
    xpEarned: number;
    member: {
      id: string;
      xp: number;
      level: number;
      currentStreak?: number;
    };
  }> => {
    // O memberId é extraído do token JWT no backend, não precisa ser enviado
    // O DTO só aceita workoutId
    return httpClient.post<{
      id: string;
      xpEarned: number;
      member: {
        id: string;
        xp: number;
        level: number;
        currentStreak?: number;
      };
    }>(API_ENDPOINTS.WORKOUT_HISTORY.COMPLETE_WORKOUT, {
      workoutId,
    });
  },

  getWorkoutHistory: async (memberId: string): Promise<Array<{
    id: string;
    workoutId: string;
    memberId: string;
    startTime: string;
    endTime: string;
    xpEarned: number;
    createdAt: string;
  }>> => {
    return httpClient.get<Array<{
      id: string;
      workoutId: string;
      memberId: string;
      startTime: string;
      endTime: string;
      xpEarned: number;
      createdAt: string;
    }>>(API_ENDPOINTS.WORKOUT_HISTORY.BY_MEMBER(memberId));
  },

  // Workout Templates
  getWorkoutTemplates: async (): Promise<import("../types").WorkoutTemplate[]> => {
    return httpClient.get<import("../types").WorkoutTemplate[]>(
      API_ENDPOINTS.WORKOUT_TEMPLATES.LIST,
    );
  },

  getWorkoutTemplate: async (id: string): Promise<import("../types").WorkoutTemplate> => {
    return httpClient.get<import("../types").WorkoutTemplate>(
      API_ENDPOINTS.WORKOUT_TEMPLATES.GET(id),
    );
  },

  createWorkoutTemplate: async (template: {
    title: string;
    description?: string;
    items: Array<{
      exerciseName: string;
      sets: number;
      reps: string;
      weight?: number;
      rest?: string;
      observations?: string;
    }>;
  }): Promise<import("../types").WorkoutTemplate> => {
    return httpClient.post<import("../types").WorkoutTemplate>(
      API_ENDPOINTS.WORKOUT_TEMPLATES.CREATE,
      template,
    );
  },

  applyWorkoutTemplate: async (
    templateId: string,
    memberId: string,
  ): Promise<Workout[]> => {
    return httpClient.post<Workout[]>(
      API_ENDPOINTS.WORKOUT_TEMPLATES.APPLY,
      { templateId, memberId },
    );
  },

  updateWorkoutTemplate: async (
    id: string,
    template: {
      title: string;
      description?: string;
      items: Array<{
        exerciseName: string;
        sets: number;
        reps: string;
        weight?: number;
        rest?: string;
        observations?: string;
      }>;
    },
  ): Promise<import("../types").WorkoutTemplate> => {
    return httpClient.patch<import("../types").WorkoutTemplate>(
      API_ENDPOINTS.WORKOUT_TEMPLATES.UPDATE(id),
      template,
    );
  },

  deleteWorkoutTemplate: async (id: string): Promise<void> => {
    return httpClient.delete<void>(API_ENDPOINTS.WORKOUT_TEMPLATES.DELETE(id));
  },
};

export const api = isMockMode() ? mockAPI : serverAPI;

export const logout = () => {
  httpClient.clearAuthToken();
  localStorage.removeItem("auth_token");
};

export const restoreSession = () => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    httpClient.setAuthToken(token);
  }
};

restoreSession();
