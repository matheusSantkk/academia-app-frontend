
export const API_CONFIG = {
  MODE: (import.meta.env.VITE_API_MODE || "mock") as "mock" | "server",

  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",

  TIMEOUT: 10000,

  HEADERS: {
    "Content-Type": "application/json",
  },
};


export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    MEMBER_LOGIN: "/auth/member/login",
    CHANGE_PASSWORD: "/auth/member/change-password",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    REGISTER: "/auth/register",
  },

  // Users
  USERS: {
    ME: "/users/me",
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },

  // Students
  STUDENTS: {
    LIST: "/students",
    GET: (id: string) => `/students/${id}`,
    CREATE: "/students",
    UPDATE: (id: string) => `/students/${id}`,
    DELETE: (id: string) => `/students/${id}`,
    MEDICAL_INFO: (id: string) => `/students/${id}/medical`,
  },

  // Members (backend endpoint)
  MEMBERS: {
    LIST: "/members",
    GET: (id: string) => `/members/${id}`,
    CREATE: "/members",
    UPDATE: (id: string) => `/members/${id}`,
    DELETE: (id: string) => `/members/${id}`,
  },

  // Workouts
  WORKOUTS: {
    LIST: "/workouts",
    GET: (id: string) => `/workouts/${id}`,
    BY_STUDENT: (studentId: string) => `/workouts/student/${studentId}`,
    CREATE: "/workouts",
    UPDATE: (id: string) => `/workouts/${id}`,
    DELETE: (id: string) => `/workouts/${id}`,
    COMPLETE_EXERCISE: (workoutId: string, exerciseId: string) =>
      `/workouts/${workoutId}/exercises/${exerciseId}/complete`,
  },

  // Training Plans
  TRAINING: {
    GET: (studentId: string) => `/workouts/training/${studentId}`,
    SAVE: (studentId: string) => `/workouts/training/${studentId}`,
  },

  // Achievements
  ACHIEVEMENTS: {
    LIST: "/achievements",
    BY_MEMBER: (memberId: string) => `/achievements/member/${memberId}`,
  },

  // Workout History
  WORKOUT_HISTORY: {
    CREATE: "/workout-history",
    BY_MEMBER: (memberId: string) => `/workout-history/member/${memberId}`,
    COMPLETE_WORKOUT: "/workout-history/complete",
  },

  // Ranking
  RANKING: {
    MONTHLY: "/members/ranking/monthly",
    TOTAL: "/members/ranking/total",
  },

  // Preferences
  PREFERENCES: {
    GET: "/preferences",
    UPDATE: "/preferences",
  },
};


export const API_ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
};


export const ERROR_MESSAGES: Record<number, string> = {
  [API_ERROR_CODES.UNAUTHORIZED]: "Sessão expirada. Faça login novamente.",
  [API_ERROR_CODES.FORBIDDEN]: "Você não tem permissão para esta ação.",
  [API_ERROR_CODES.NOT_FOUND]: "Recurso não encontrado.",
  [API_ERROR_CODES.VALIDATION_ERROR]:
    "Dados inválidos. Verifique e tente novamente.",
  [API_ERROR_CODES.SERVER_ERROR]:
    "Erro no servidor. Tente novamente mais tarde.",
};


export const isDevelopment = () => {
  return import.meta.env.DEV;
};


export const isMockMode = () => {
  return API_CONFIG.MODE === "mock";
};

export const logRequest = (method: string, url: string, data?: unknown) => {
  if (isDevelopment()) {
    console.log(`[API] ${method} ${url}`, data ? data : "");
  }
};


export const logResponse = (url: string, data: unknown) => {
  if (isDevelopment()) {
    console.log(`[API Response] ${url}`, data);
  }
};
