import React from "react";
import { Dumbbell, Trophy, Crown, User, Home, Settings } from "lucide-react";
import { useTheme } from "../../theme/context";
import { getThemeColors } from "../../theme/colors";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: "student" | "teacher";
}

const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  role,
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  if (role === "teacher") {
    return (
      <div
        className={`fixed bottom-0 left-0 right-0 ${colors.card} border-t ${colors.border} px-6 py-4 z-10`}
      >
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "dashboard" ? "text-lime-400" : colors.textSecondary
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Início</span>
          </button>

          <button
            onClick={() => setActiveTab("students-list")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "students-list" || activeTab === "student-detail"
                ? "text-lime-400"
                : colors.textSecondary
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Alunos</span>
          </button>

          <button
            onClick={() => setActiveTab("ranking")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "ranking" ? "text-lime-400" : colors.textSecondary
            }`}
          >
            <Crown className="w-6 h-6" />
            <span className="text-xs font-medium">Ranking</span>
          </button>

          {/* Configurações para professor */}
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "settings" ? "text-lime-400" : colors.textSecondary
            }`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs font-medium">Config</span>
          </button>
        </div>
      </div>
    );
  }

  // Navegação do Aluno
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 ${colors.card} border-t ${colors.border} px-6 py-4 z-10`}
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "dashboard" ? "text-lime-400" : colors.textSecondary
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Início</span>
        </button>

        <button
          onClick={() => setActiveTab("workouts")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "workouts" ? "text-lime-400" : colors.textSecondary
          }`}
        >
          <Dumbbell className="w-6 h-6" />
          <span className="text-xs font-medium">Treinos</span>
        </button>

        <button
          onClick={() => setActiveTab("achievements")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "achievements"
              ? "text-lime-400"
              : colors.textSecondary
          }`}
        >
          <Trophy className="w-6 h-6" />
          <span className="text-xs font-medium">Conquistas</span>
        </button>

        <button
          onClick={() => setActiveTab("ranking")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "ranking" ? "text-lime-400" : colors.textSecondary
          }`}
        >
          <Crown className="w-6 h-6" />
          <span className="text-xs font-medium">Ranking</span>
        </button>

        {/* Nova aba Configurações */}
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "settings" ? "text-lime-400" : colors.textSecondary
          }`}
        >
          <Settings className="w-6 h-6" />
          <span className="text-xs font-medium">Config</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
