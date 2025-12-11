// src/types/index.ts
export interface StudentData extends UserData {
  age: number;
  weight?: number;
  height?: number;
  gender?: "male" | "female" | "other";
  healthNotes?: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher";
  level?: number;
  points?: number;
  streak?: number;
  avatar?: string;
}

export interface Exercise {
  id: string;
  name: string;
  series: number;
  reps: string;
  weight: number;
  rest: string;
  completed: boolean;
  isPR?: boolean;
}

export interface Workout {
  id: string;
  type: "A" | "B" | "C";
  name: string;
  exercises: Exercise[];
  completedAt?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface RankingUser {
  id: string;
  name: string;
  points: number;
  level: number;
  position: number;
}

export interface StudentMedicalInfo {
  studentId: string;
  studentName: string;
  age: number;
  weight: number;
  height: number;
  bloodPressure: string;
  heartCondition: boolean;
  injuries: string[];
  restrictions: string[];
  notes: string;
}

export interface StudentData extends UserData {
  age: number;
}
