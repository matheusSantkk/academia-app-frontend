// src/api/index.ts

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
// Nota: Os mocks e tipos agora são importados dos arquivos acima

// FUNÇÕES AUXILIARES
export const calculateLevelProgress = (
  points: number,
  level: number
): number => {
  const pointsForNextLevel = level * 50;
  // Correção: Se pointsForNextLevel for 0 (no nível 0, embora improvável), evite divisão por zero.
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

// API MOCK
export const api = {
  login: async (email: string, _password: string): Promise<UserData> => {
    // referência para evitar warning de parâmetro não utilizado
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
  getMedicalInfo: async (_studentId: string): Promise<StudentMedicalInfo> => {
    // referência para evitar warning de parâmetro não utilizado em mock
    void _studentId;
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockMedicalInfo), 300)
    );
  },
  createStudent: async (
    student: Partial<StudentData>
  ): Promise<StudentData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newStudent = studentsStore.create(student);
        resolve(newStudent);
      }, 400);
    });
  },
};

// --- Persistence helpers (students + trainings) ---
// Use localStorage to persist created/updated students and trainings between reloads.
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
    // fallback to initial mock
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

  // initialize
  load();

  return {
    list: () => students,
    create: (partial: Partial<StudentData>): StudentData => {
      const id = `s${students.length + 1}`;
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

// expose helper methods on api
Object.assign(api, {
  updateStudent: async (id: string, patch: Partial<StudentData>) => {
    return new Promise<StudentData | null>((resolve) => {
      setTimeout(() => resolve(studentsStore.update(id, patch)), 300);
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
});
