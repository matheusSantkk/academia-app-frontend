import { useState } from "react";
import { User, Palette, Phone, Sliders } from "lucide-react";
import { useTheme } from "../theme/context";
import { getThemeColors } from "../theme/colors";
import type { UserData } from "../types";

type SettingsScreenProps = {
  user: UserData | null;
};

export default function SettingsScreen({ user }: SettingsScreenProps) {
  const { theme, setTheme } = useTheme();
  const colors = getThemeColors(theme);
  const [reminders, setReminders] = useState(true);
  const [achievements, setAchievements] = useState(true);
  const [ranking, setRanking] = useState(false);

  return (
    <div
      className={`min-h-screen ${colors.background} ${colors.text} px-4 py-6 flex flex-col gap-6 overflow-y-auto pb-24`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-lime-500 flex items-center justify-center text-white font-bold">
            NS
          </div>
          <div className="flex flex-col leading-tight">
            <span className={`text-sm ${colors.textSecondary}`}>
              Bem-vindo(a)!
            </span>
            <span className="text-base font-semibold">{user?.name}</span>
          </div>
        </div>
      </div>

      {/* Título */}
      <div>
        <h1 className="text-xl font-semibold">Configurações</h1>
        <p className={`${colors.textSecondary} text-sm`}>
          Gerencie suas preferências
        </p>
      </div>

      {/* Tema */}
      <div
        className={`${colors.card} w-full rounded-2xl p-4 flex flex-col gap-2 border ${colors.border}`}
      >
        <div className={`flex items-center gap-2 ${colors.textSecondary} mb-1`}>
          <Palette size={18} />
          <span className="font-semibold text-sm">Tema</span>
        </div>

        <div className="flex justify-between items-center mt-2">
          <span className={`text-sm ${colors.textSecondary}`}>Modo Escuro</span>
          <Toggle
            value={theme === "dark"}
            onChange={(newVal) => setTheme(newVal ? "dark" : "light")}
          />
        </div>
      </div>

      {/* Dados Pessoais */}
      <div
        className={`${colors.card} rounded-2xl p-4 flex flex-col gap-3 border ${colors.border}`}
      >
        <div className={`flex items-center gap-2 ${colors.textSecondary}`}>
          <User size={18} />
          <span className="font-semibold text-sm">Dados Pessoais</span>
        </div>

        <input
          type="text"
          placeholder="Nome Completo"
          className={`${colors.input} text-sm rounded-lg p-2 w-full ${colors.text}`}
        />

        <input
          type="email"
          placeholder="email@gmail.com"
          className={`${colors.input} text-sm rounded-lg p-2 w-full ${colors.text}`}
        />

        <input
          type="text"
          placeholder="(00) 0000-0000"
          className={`${colors.input} text-sm rounded-lg p-2 w-full ${colors.text}`}
        />

        <button
          className={`${colors.button} rounded-lg font-semibold py-2 mt-1`}
        >
          Salvar Alterações
        </button>
      </div>

      {/* Preferências */}
      <div
        className={`${colors.card} rounded-2xl p-4 flex flex-col gap-4 border ${colors.border}`}
      >
        <div className={`flex items-center gap-2 ${colors.textSecondary}`}>
          <Sliders size={18} />
          <span className="font-semibold text-sm">Preferências</span>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm ${colors.textSecondary}`}>
            Lembretes de Treino
          </span>
          <Toggle value={reminders} onChange={setReminders} />
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm ${colors.textSecondary}`}>Conquistas</span>
          <Toggle value={achievements} onChange={setAchievements} />
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm ${colors.textSecondary}`}>Ranking</span>
          <Toggle value={ranking} onChange={setRanking} />
        </div>
      </div>

      {/* Contato Emergência */}
      <div
        className={`${colors.card} rounded-2xl p-4 flex flex-col gap-3 border ${colors.border}`}
      >
        <div className={`flex items-center gap-2 ${colors.textSecondary}`}>
          <Phone size={18} />
          <span className="font-semibold text-sm">Contato de Emergência</span>
        </div>

        <input
          type="text"
          placeholder="Nome do contato"
          className={`${colors.input} text-sm rounded-lg p-2 w-full ${colors.text}`}
        />

        <input
          type="text"
          placeholder="(00) 0000-0000"
          className={`${colors.input} text-sm rounded-lg p-2 w-full ${colors.text}`}
        />

        <button
          className={`${colors.button} rounded-lg font-semibold py-2 mt-1`}
        >
          Salvar Alterações
        </button>
      </div>

      {/* Sair */}
      <button className="text-red-400 border border-red-500 rounded-lg py-2 mt-2">
        Sair da conta
      </button>
    </div>
  );
}

type ToggleProps = {
  value: boolean;
  onChange: (newValue: boolean) => void;
};

function Toggle({ value, onChange }: ToggleProps) {
  return (
    <div
      onClick={() => onChange(!value)}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300
        ${value ? "bg-lime-400" : "bg-gray-600"}`}
    >
      <div
        className={`bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-300
          ${value ? "translate-x-6" : "translate-x-0"}`}
      />
    </div>
  );
}
