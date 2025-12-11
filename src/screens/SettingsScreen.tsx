import { useState, useEffect } from "react";
import {
  User,
  Palette,
  Phone,
  Sliders,
  Bell,
  Trophy,
  Crown,
} from "lucide-react";
import { useTheme } from "../theme/context";
import { getThemeColors } from "../theme/colors";
import type { UserData } from "../types";

type SettingsScreenProps = {
  user: UserData | null;
  onLogout: () => void;
};

interface UserPreferences {
  reminders: boolean;
  achievements: boolean;
  ranking: boolean;
}

const PREFERENCES_KEY = "user_preferences";

function loadPreferences(): UserPreferences {
  try {
    const saved = localStorage.getItem(PREFERENCES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return {
    reminders: true,
    achievements: true,
    ranking: true,
  };
}

function savePreferences(prefs: UserPreferences) {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export default function SettingsScreen({
  user,
  onLogout,
}: SettingsScreenProps) {
  const { theme, setTheme } = useTheme();
  const colors = getThemeColors(theme);

  const [preferences, setPreferences] = useState<UserPreferences>(
    loadPreferences()
  );
  const [personalData, setPersonalData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });
  const [emergencyContact, setEmergencyContact] = useState({
    name: "",
    phone: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  const updatePreference = (key: keyof UserPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleSavePersonalData = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveEmergency = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    if (confirm("Tem certeza que deseja sair?")) {
      onLogout();
    }
  };

  return (
    <div
      className={`min-h-screen ${colors.background} ${colors.text} px-4 py-6 flex flex-col gap-6 overflow-y-auto pb-24`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-lime-500 flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.charAt(0).toUpperCase() || "U"}
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
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className={`${colors.textSecondary} text-sm`}>
          Gerencie suas preferências e dados
        </p>
      </div>

      {/* Tema */}
      <div
        className={`${colors.card} w-full rounded-2xl p-5 flex flex-col gap-3 border ${colors.border} shadow-sm`}
      >
        <div className={`flex items-center gap-2 ${colors.text} mb-1`}>
          <Palette size={20} />
          <span className="font-semibold">Aparência</span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className={`text-sm ${colors.text}`}>Modo Escuro</span>
            <p className={`text-xs ${colors.textSecondary} mt-0.5`}>
              {theme === "dark" ? "Ativado" : "Desativado"}
            </p>
          </div>
          <Toggle
            value={theme === "dark"}
            onChange={(newVal) => setTheme(newVal ? "dark" : "light")}
          />
        </div>
      </div>

      {/* Preferências */}
      <div
        className={`${colors.card} rounded-2xl p-5 flex flex-col gap-4 border ${colors.border} shadow-sm`}
      >
        <div className={`flex items-center gap-2 ${colors.text}`}>
          <Sliders size={20} />
          <span className="font-semibold">Preferências</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className={colors.textSecondary} />
            <div>
              <span className={`text-sm ${colors.text}`}>
                Lembretes de Treino
              </span>
              <p className={`text-xs ${colors.textSecondary}`}>
                Receba notificações diárias
              </p>
            </div>
          </div>
          <Toggle
            value={preferences.reminders}
            onChange={(val) => updatePreference("reminders", val)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={18} className={colors.textSecondary} />
            <div>
              <span className={`text-sm ${colors.text}`}>Conquistas</span>
              <p className={`text-xs ${colors.textSecondary}`}>
                Notificações de conquistas
              </p>
            </div>
          </div>
          <Toggle
            value={preferences.achievements}
            onChange={(val) => updatePreference("achievements", val)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown size={18} className={colors.textSecondary} />
            <div>
              <span className={`text-sm ${colors.text}`}>Ranking</span>
              <p className={`text-xs ${colors.textSecondary}`}>
                Aparecer no ranking público
              </p>
            </div>
          </div>
          <Toggle
            value={preferences.ranking}
            onChange={(val) => updatePreference("ranking", val)}
          />
        </div>
      </div>

      {/* Dados Pessoais */}
      <div
        className={`${colors.card} rounded-2xl p-5 flex flex-col gap-3 border ${colors.border} shadow-sm`}
      >
        <div className={`flex items-center gap-2 ${colors.text}`}>
          <User size={20} />
          <span className="font-semibold">Dados Pessoais</span>
        </div>

        <div>
          <label className={`text-xs ${colors.textSecondary} mb-1 block`}>
            Nome Completo
          </label>
          <input
            type="text"
            value={personalData.name}
            onChange={(e) =>
              setPersonalData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Nome Completo"
            className={`${colors.input} text-sm rounded-lg p-3 w-full ${colors.text}`}
          />
        </div>

        <div>
          <label className={`text-xs ${colors.textSecondary} mb-1 block`}>
            E-mail
          </label>
          <input
            type="email"
            value={personalData.email}
            onChange={(e) =>
              setPersonalData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="email@gmail.com"
            className={`${colors.input} text-sm rounded-lg p-3 w-full ${colors.text}`}
          />
        </div>

        <div>
          <label className={`text-xs ${colors.textSecondary} mb-1 block`}>
            Telefone
          </label>
          <input
            type="text"
            value={personalData.phone}
            onChange={(e) =>
              setPersonalData((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="(00) 00000-0000"
            className={`${colors.input} text-sm rounded-lg p-3 w-full ${colors.text}`}
          />
        </div>

        <button
          onClick={handleSavePersonalData}
          className={`${colors.button} rounded-lg font-semibold py-3 mt-1 shadow-sm transition-all active:scale-[0.98]`}
        >
          {saved ? "✓ Salvo!" : "Salvar Alterações"}
        </button>
      </div>

      {/* Contato Emergência */}
      <div
        className={`${colors.card} rounded-2xl p-5 flex flex-col gap-3 border ${colors.border} shadow-sm`}
      >
        <div className={`flex items-center gap-2 ${colors.text}`}>
          <Phone size={20} />
          <span className="font-semibold">Contato de Emergência</span>
        </div>

        <div>
          <label className={`text-xs ${colors.textSecondary} mb-1 block`}>
            Nome do contato
          </label>
          <input
            type="text"
            value={emergencyContact.name}
            onChange={(e) =>
              setEmergencyContact((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Nome do contato"
            className={`${colors.input} text-sm rounded-lg p-3 w-full ${colors.text}`}
          />
        </div>

        <div>
          <label className={`text-xs ${colors.textSecondary} mb-1 block`}>
            Telefone
          </label>
          <input
            type="text"
            value={emergencyContact.phone}
            onChange={(e) =>
              setEmergencyContact((prev) => ({
                ...prev,
                phone: e.target.value,
              }))
            }
            placeholder="(00) 00000-0000"
            className={`${colors.input} text-sm rounded-lg p-3 w-full ${colors.text}`}
          />
        </div>

        <button
          onClick={handleSaveEmergency}
          className={`${colors.button} rounded-lg font-semibold py-3 mt-1 shadow-sm transition-all active:scale-[0.98]`}
        >
          {saved ? "✓ Salvo!" : "Salvar Alterações"}
        </button>
      </div>

      {/* Sair */}
      <button
        onClick={handleLogout}
        className="text-red-400 border-2 border-red-500 rounded-lg py-3 font-semibold mt-2 hover:bg-red-500/10 transition-all active:scale-[0.98]"
      >
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
      className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 shadow-inner
        ${value ? "bg-lime-400" : "bg-gray-600"}`}
    >
      <div
        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300
          ${value ? "translate-x-7" : "translate-x-0"}`}
      />
    </div>
  );
}
