import {
  mockStudentUser,
  mockTeacherUser,
  mockWorkouts,
  mockAchievements,
  mockRankingMonthly,
  mockRankingTotal,
  mockStudents as initialMockStudents,
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
  level: number
): number => {
  const pointsForNextLevel = level * 50;
  if (pointsForNextLevel === 0) return 0;
  const pointsInCurrentLevel = points % pointsForNextLevel;
  return (pointsInCurrentLevel / pointsForNextLevel) * 100;
};

export const calculateBonusXP = (
  baseXP: number,
  streak: number,
  prsCount: number
): number => {
  const streakBonus = Math.min(streak * 10, 100);
  const prBonus = prsCount * 10;
  const totalBonus = streakBonus + prBonus;
  return Math.round(baseXP * (1 + totalBonus / 100));
};

// --- Storage helpers ---
const LOCAL_STUDENTS_KEY = "app_students_v2";
const LOCAL_TRAININGS_KEY = "app_trainings_v1";
const LOCAL_MEDICAL_INFO_KEY = "app_medical_info_v2";

type TrainingsMap = Record<string, Workout[]>;
type MedicalInfoMap = Record<string, StudentMedicalInfo>;

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
        weight: partial.weight,
        height: partial.height,
        gender: partial.gender,
        phone: partial.phone,
        birthDate: partial.birthDate,
        emergencyContact: partial.emergencyContact,
        emergencyPhone: partial.emergencyPhone,
        goal: partial.goal,
        experience: partial.experience,
        frequency: partial.frequency,
        healthNotes: partial.healthNotes,
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

const medicalInfoStore = (() => {
  let map: MedicalInfoMap = {};

  const load = () => {
    try {
      const raw = localStorage.getItem(LOCAL_MEDICAL_INFO_KEY);
      if (raw) {
        map = JSON.parse(raw) as MedicalInfoMap;
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
      localStorage.setItem(LOCAL_MEDICAL_INFO_KEY, JSON.stringify(map));
    } catch {
      // ignore
    }
  };

  load();

  return {
    get: (studentId: string): StudentMedicalInfo | null => {
      return map[studentId] || null;
    },
    set: (info: StudentMedicalInfo) => {
      map[info.studentId] = info;
      save();
      return info;
    },
  };
})();

// --- Mock API Implementation ---
const mockAPI = {
  login: async (email: string, _password: string): Promise<UserData> => {
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

  getWorkouts: async (): Promise<Workout[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockWorkouts), 300)
    );
  },

  getAchievements: async (): Promise<Achievement[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockAchievements), 300)
    );
  },

  getRanking: async (type: "monthly" | "total"): Promise<RankingUser[]> => {
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve(type === "monthly" ? mockRankingMonthly : mockRankingTotal),
        300
      );
    });
  },

  getStudents: async (): Promise<StudentData[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(studentsStore.list()), 300)
    );
  },

  getMedicalInfo: async (studentId: string): Promise<StudentMedicalInfo> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const info = medicalInfoStore.get(studentId);
        if (info) {
          resolve(info);
        } else {
          // Criar info médica padrão se não existir
          const student = studentsStore.list().find((s) => s.id === studentId);
          const defaultInfo: StudentMedicalInfo = {
            studentId,
            studentName: student?.name || "Aluno",
            age: student?.age || 18,
            weight: student?.weight || 70,
            height: student?.height || 1.75,
            bloodPressure: "120/80",
            heartCondition: false,
            injuries: [],
            restrictions: [],
            notes: student?.healthNotes || "",
          };
          medicalInfoStore.set(defaultInfo);
          resolve(defaultInfo);
        }
      }, 300);
    });
  },

  createStudent: async (
    student: Partial<StudentData>
  ): Promise<StudentData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newStudent = studentsStore.create(student);

        // Criar informações médicas se tiver peso e altura
        if (student.weight && student.height) {
          const medicalInfo: StudentMedicalInfo = {
            studentId: newStudent.id,
            studentName: newStudent.name,
            age: newStudent.age,
            weight: student.weight,
            height: student.height,
            bloodPressure: "120/80",
            heartCondition: false,
            injuries: [],
            restrictions: [],
            notes: student.healthNotes || "",
          };
          medicalInfoStore.set(medicalInfo);
        }

        resolve(newStudent);
      }, 400);
    });
  },

  updateStudent: async (id: string, patch: Partial<StudentData>) => {
    return new Promise<StudentData | null>((resolve) => {
      setTimeout(() => {
        const updated = studentsStore.update(id, patch);

        // Atualizar informações médicas se necessário
        if (updated && (patch.weight || patch.height || patch.healthNotes)) {
          const medicalInfo = medicalInfoStore.get(id);
          if (medicalInfo) {
            medicalInfoStore.set({
              ...medicalInfo,
              weight: patch.weight ?? medicalInfo.weight,
              height: patch.height ?? medicalInfo.height,
              notes: patch.healthNotes ?? medicalInfo.notes,
              studentName: patch.name ?? medicalInfo.studentName,
              age: patch.age ?? medicalInfo.age,
            });
          } else if (patch.weight && patch.height) {
            // Criar se não existir
            const newMedicalInfo: StudentMedicalInfo = {
              studentId: id,
              studentName: updated.name,
              age: updated.age,
              weight: patch.weight,
              height: patch.height,
              bloodPressure: "120/80",
              heartCondition: false,
              injuries: [],
              restrictions: [],
              notes: patch.healthNotes || "",
            };
            medicalInfoStore.set(newMedicalInfo);
          }
        }

        resolve(updated);
      }, 300);
    });
  },

  getTraining: async (studentId: string): Promise<Workout[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(trainingsStore.get(studentId)), 250)
    );
  },

  saveTraining: async (
    studentId: string,
    workouts: Workout[]
  ): Promise<Workout[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(trainingsStore.set(studentId, workouts)), 400)
    );
  },
};

// --- Server API Implementation ---
const serverAPI = {
  login: async (email: string, password: string): Promise<UserData> => {
    const response = await httpClient.post<{ user: UserData; token: string }>(
      API_ENDPOINTS.AUTH.LOGIN,
      { email, password }
    );

    if (response.token) {
      httpClient.setAuthToken(response.token);
      localStorage.setItem("auth_token", response.token);
    }

    return response.user;
  },

  getWorkouts: async (): Promise<Workout[]> => {
    return httpClient.get<Workout[]>(API_ENDPOINTS.WORKOUTS.LIST);
  },

  getAchievements: async (): Promise<Achievement[]> => {
    return httpClient.get<Achievement[]>(
      API_ENDPOINTS.ACHIEVEMENTS.USER_ACHIEVEMENTS
    );
  },

  getRanking: async (type: "monthly" | "total"): Promise<RankingUser[]> => {
    const endpoint =
      type === "monthly"
        ? API_ENDPOINTS.RANKING.MONTHLY
        : API_ENDPOINTS.RANKING.TOTAL;
    return httpClient.get<RankingUser[]>(endpoint);
  },

  getStudents: async (): Promise<StudentData[]> => {
    return httpClient.get<StudentData[]>(API_ENDPOINTS.STUDENTS.LIST);
  },

  getMedicalInfo: async (studentId: string): Promise<StudentMedicalInfo> => {
    return httpClient.get<StudentMedicalInfo>(
      API_ENDPOINTS.STUDENTS.MEDICAL_INFO(studentId)
    );
  },

  createStudent: async (
    student: Partial<StudentData>
  ): Promise<StudentData> => {
    return httpClient.post<StudentData>(API_ENDPOINTS.STUDENTS.CREATE, student);
  },

  updateStudent: async (
    id: string,
    patch: Partial<StudentData>
  ): Promise<StudentData | null> => {
    return httpClient.patch<StudentData>(
      API_ENDPOINTS.STUDENTS.UPDATE(id),
      patch
    );
  },

  getTraining: async (studentId: string): Promise<Workout[]> => {
    return httpClient.get<Workout[]>(API_ENDPOINTS.TRAINING.GET(studentId));
  },

  saveTraining: async (
    studentId: string,
    workouts: Workout[]
  ): Promise<Workout[]> => {
    return httpClient.post<Workout[]>(API_ENDPOINTS.TRAINING.SAVE(studentId), {
      workouts,
    });
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
