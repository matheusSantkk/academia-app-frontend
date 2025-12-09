// src/data/mockData.ts

import type {
  UserData,
  Workout,
  Achievement,
  RankingUser,
  StudentData,
  StudentMedicalInfo,
  Exercise,
} from "../types";

// MOCK USER DATA
export const mockStudentUser: UserData = {
  id: "1",
  name: "João Silva",
  email: "joao@email.com",
  role: "student",
  level: 5,
  points: 280,
  streak: 7,
};

export const mockTeacherUser: UserData = {
  id: "teacher1",
  name: "Prof. Carlos",
  email: "professor@academia.com",
  role: "teacher",
};

// MOCK WORKOUTS
export const mockWorkouts: Workout[] = [
  {
    id: "1",
    type: "A",
    name: "Treino A - Peito e Tríceps",
    exercises: [
      {
        id: "e1",
        name: "Supino Reto",
        series: 4,
        reps: "8-12",
        weight: 60,
        rest: "90s",
        completed: true,
        isPR: true,
      },
      {
        id: "e2",
        name: "Supino Inclinado",
        series: 3,
        reps: "10-12",
        weight: 50,
        rest: "90s",
        completed: true,
      },
      {
        id: "e3",
        name: "Crucifixo",
        series: 3,
        reps: "12-15",
        weight: 15,
        rest: "60s",
        completed: false,
      },
      {
        id: "e4",
        name: "Tríceps Testa",
        series: 3,
        reps: "10-12",
        weight: 25,
        rest: "60s",
        completed: false,
      },
    ] as Exercise[],
  },
  {
    id: "2",
    type: "B",
    name: "Treino B - Costas e Bíceps",
    exercises: [
      {
        id: "e5",
        name: "Barra Fixa",
        series: 4,
        reps: "8-10",
        weight: 0,
        rest: "90s",
        completed: false,
      },
      {
        id: "e6",
        name: "Remada Curvada",
        series: 4,
        reps: "8-12",
        weight: 50,
        rest: "90s",
        completed: false,
      },
      {
        id: "e7",
        name: "Pulldown",
        series: 3,
        reps: "10-12",
        weight: 45,
        rest: "60s",
        completed: false,
      },
      {
        id: "e8",
        name: "Rosca Direta",
        series: 3,
        reps: "10-12",
        weight: 20,
        rest: "60s",
        completed: false,
      },
    ] as Exercise[],
  },
  {
    id: "3",
    type: "C",
    name: "Treino C - Pernas",
    exercises: [
      {
        id: "e9",
        name: "Agachamento",
        series: 4,
        reps: "8-12",
        weight: 80,
        rest: "120s",
        completed: false,
      },
      {
        id: "e10",
        name: "Leg Press",
        series: 3,
        reps: "10-15",
        weight: 150,
        rest: "90s",
        completed: false,
      },
      {
        id: "e11",
        name: "Cadeira Extensora",
        series: 3,
        reps: "12-15",
        weight: 40,
        rest: "60s",
        completed: false,
      },
      {
        id: "e12",
        name: "Mesa Flexora",
        series: 3,
        reps: "12-15",
        weight: 35,
        rest: "60s",
        completed: false,
      },
    ] as Exercise[],
  },
];

// MOCK ACHIEVEMENTS
export const mockAchievements: Achievement[] = [
  {
    id: "a1",
    name: "Primeiro Passo",
    description: "Complete seu primeiro treino",
    icon: "🎯",
    unlocked: true,
    unlockedAt: "2024-01-15",
  },
  {
    id: "a2",
    name: "Guerreiro",
    description: "Mantenha 7 dias de streak",
    icon: "🔥",
    unlocked: true,
    unlockedAt: "2024-02-01",
  },
  {
    id: "a3",
    name: "Força Bruta",
    description: "Bata 5 PRs em um dia",
    icon: "💪",
    unlocked: false,
  },
  {
    id: "a4",
    name: "Dedicado",
    description: "Complete 50 treinos",
    icon: "⭐",
    unlocked: false,
  },
  {
    id: "a5",
    name: "Lendário",
    description: "Alcance nível 10",
    icon: "👑",
    unlocked: false,
  },
];

// MOCK RANKING
export const mockRankingMonthly: RankingUser[] = [
  { id: "1", name: "Ana Costa", points: 450, level: 8, position: 1 },
  { id: "2", name: "João Silva", points: 280, level: 5, position: 2 },
  { id: "3", name: "Pedro Santos", points: 240, level: 4, position: 3 },
  { id: "4", name: "Maria Oliveira", points: 210, level: 4, position: 4 },
  { id: "5", name: "Carlos Mendes", points: 180, level: 3, position: 5 },
];

export const mockRankingTotal: RankingUser[] = [
  { id: "5", name: "Carlos Mendes", points: 2840, level: 25, position: 1 },
  { id: "6", name: "Ana Costa", points: 2150, level: 20, position: 2 },
  { id: "1", name: "João Silva", points: 1680, level: 15, position: 3 },
  { id: "3", name: "Pedro Santos", points: 1420, level: 12, position: 4 },
  { id: "4", name: "Maria Oliveira", points: 1200, level: 10, position: 5 },
];

// MOCK STUDENTS
export const mockStudents: StudentData[] = [
  {
    id: "s1",
    name: "Ana Costa",
    email: "ana@email.com",
    role: "student",
    age: 25,
    level: 8,
    points: 450,
  },
  {
    id: "s2",
    name: "Pedro Santos",
    email: "pedro@email.com",
    role: "student",
    age: 32,
    level: 4,
    points: 240,
  },
  {
    id: "s3",
    name: "Maria Oliveira",
    email: "maria@email.com",
    role: "student",
    age: 28,
    level: 4,
    points: 210,
  },
  {
    id: "s4",
    name: "Lucas Ferreira",
    email: "lucas@email.com",
    role: "student",
    age: 22,
    level: 6,
    points: 320,
  },
];

// MOCK MEDICAL INFO
export const mockMedicalInfo: StudentMedicalInfo = {
  studentId: "s1",
  studentName: "Ana Costa",
  age: 25,
  weight: 65,
  height: 1.68,
  bloodPressure: "120/80",
  heartCondition: false,
  injuries: ["Joelho esquerdo - 2023"],
  restrictions: ["Evitar agachamento profundo"],
  notes: "Paciente recuperada de lesão no joelho. Liberar progressão gradual.",
};
