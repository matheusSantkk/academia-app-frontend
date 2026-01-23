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
    _memberId?: string,
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
    // marcar _memberId como usado (pode ser undefined)
    void _memberId;
    return new Promise((resolve) => {
      setTimeout(() => {
        const xpEarned = Math.floor(Math.random() * 50) + 10; // 10-60 XP
        const newXP = (mockStudentUser.points || 0) + xpEarned;
        const newLevel = Math.floor(newXP / 100) + 1;
        const newStreak = (mockStudentUser.streak || 0) + 1;

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

  getWorkoutHistory: async (_memberId: string): Promise<Array<{
    id: string;
    workoutId: string;
    memberId: string;
    startTime: string;
    endTime: string;
    xpEarned: number;
    createdAt: string;
  }>> => {
    void _memberId;
    // No mock, retorna histórico vazio
    return new Promise((resolve) =>
      setTimeout(() => resolve([]), 300),
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
    memberId?: string,
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
      ...(memberId && { memberId }),
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
