export type ThemeMode = "dark" | "light";

export interface ThemeColors {
  // Backgrounds
  background: string; // tela principal
  card: string; // cards/containers
  cardSecondary: string; // cards secundários
  input: string; // inputs
  button: string; // buttons primários

  // Borders
  border: string; // borders padrão

  // Text
  text: string; // texto primário
  textSecondary: string; // texto secundário
  textInverse: string; // texto em fundo escuro

  // Accent
  accent: string; // cor de acento (verde)
  accentLight: string; // acento claro

  // Status
  error: string; // erro
}

export const darkColors: ThemeColors = {
  background: "bg-[#0B1D33]",
  card: "bg-[#10243F]",
  cardSecondary: "bg-[#0B1D33]",
  input: "bg-[#0B1D33] border-gray-700",
  button: "bg-lime-400 text-slate-900",

  border: "border-gray-700",

  text: "text-white",
  textSecondary: "text-gray-300",
  textInverse: "text-slate-900",

  accent: "bg-lime-400",
  accentLight: "text-lime-400",

  error: "text-red-400",
};

export const lightColors: ThemeColors = {
  background: "bg-gray-50",
  card: "bg-white",
  cardSecondary: "bg-white",
  input: "bg-white border-gray-200",
  button: "bg-lime-500 text-white",

  border: "border-gray-200",

  text: "text-slate-900",
  textSecondary: "text-slate-600",
  textInverse: "text-white",

  accent: "bg-lime-500",
  accentLight: "text-lime-600",

  error: "text-red-600",
};

export function getThemeColors(theme: ThemeMode): ThemeColors {
  return theme === "dark" ? darkColors : lightColors;
}

/**
 * Helper para construir classes condicionais baseado no tema
 * @param isDark - true se dark mode, false se light mode
 * @param darkClass - classe para dark mode
 * @param lightClass - classe para light mode
 */
export function themeClass(
  isDark: boolean,
  darkClass: string,
  lightClass: string
): string {
  return isDark ? darkClass : lightClass;
}

/**
 * Combina múltiplas classes com suporte a tema
 */
export function combineThemeClasses(
  isDark: boolean,
  base: string,
  darkExtras: string = "",
  lightExtras: string = ""
): string {
  const extras = isDark ? darkExtras : lightExtras;
  return `${base} ${extras}`.trim();
}
