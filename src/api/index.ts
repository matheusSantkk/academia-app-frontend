// src/api/index.ts

import {
  mockStudentUser,
  mockTeacherUser,
  mockWorkouts,
  mockAchievements,
  mockRankingMonthly,
  mockRankingTotal,
  mockStudents,
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
      setTimeout(() => resolve(mockStudents), 300)
    );
  },
  getMedicalInfo: async (_studentId: string): Promise<StudentMedicalInfo> => {
    // referência para evitar warning de parâmetro não utilizado em mock
    void _studentId;
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockMedicalInfo), 300)
    );
  },
};
