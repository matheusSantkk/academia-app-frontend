// src/components/student/StudentDashboard.tsx

import { useState, useEffect } from "react";
import {
  User,
  Dumbbell,
  Target,
  Flame,
  Trophy,
  Crown,
  ChevronRight,
} from "lucide-react";
import type { UserData, Workout } from "../../types";
import { api } from "../../api";
import { mockAchievements } from "../../data/MockData";
import { useTheme } from "../../theme/context";
import { getThemeColors } from "../../theme/colors";

interface StudentDashboardProps {
  user: UserData;
  setActiveTab: (tab: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  setActiveTab,
}) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  useEffect(() => {
    api.getWorkouts().then(setWorkouts);
  }, []);

  return (
    <div className={`min-h-screen ${colors.background} ${colors.text} pb-24`}>
      <div
        className={`${colors.card} bg-opacity-50 backdrop-blur p-6 pb-4 border-b ${colors.border}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-lime-400 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <p className={`${colors.textSecondary} text-xs`}>Olá,</p>
              <h1 className={`${colors.text} text-lg font-bold`}>
                {user.name}
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-lime-400 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-2 left-2 bg-lime-500 rounded-full px-2 py-0.5">
              <span className="text-slate-900 text-xs font-bold flex items-center gap-1">
                <Flame className="w-3 h-3" />
                Nível
              </span>
            </div>
            <div className="mt-6">
              <div className="text-5xl font-black text-slate-900">
                {user.level}
              </div>
              <div className="text-slate-700 text-xs font-medium mt-1">
                {user.points} XP
              </div>
            </div>
          </div>

          <div
            className={`${colors.card} border ${colors.border} rounded-2xl p-5`}
          >
            <div
              className={`${colors.textSecondary} text-xs font-medium mb-2 flex items-center gap-1`}
            >
              <Target className="w-3 h-3" />
              Completos
            </div>
            <div className={`text-5xl font-black ${colors.text}`}>8</div>
            <div className={`${colors.textSecondary} text-xs mt-1`}>
              Treinos
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div
            className={`${colors.card} border ${colors.border} rounded-2xl p-4 text-center`}
          >
            <div className={`${colors.textSecondary} text-xs font-medium mb-1`}>
              Sequência atual
            </div>
            <div className={`text-3xl font-black ${colors.text}`}>
              {user.streak}
            </div>
            <div className="text-lime-400 text-xs font-medium mt-1">dias</div>
          </div>

          <div
            className={`${colors.card} border ${colors.border} rounded-2xl p-4 text-center`}
          >
            <div className={`${colors.textSecondary} text-xs font-medium mb-1`}>
              Dias
            </div>
            <div className={`text-3xl font-black ${colors.text}`}>3</div>
            <div className={`${colors.textSecondary} text-xs mt-1`}>
              esta semana
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-6 pb-4">
        <h2
          className={`${colors.textSecondary} text-xs font-semibold uppercase tracking-wider mb-3`}
        >
          Ações rápidas
        </h2>
        <div className="space-y-2">
          <div
            onClick={() => setActiveTab("workouts")}
            className={`${colors.card} border ${colors.border} rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-lime-400 transition-all`}
          >
            <div className="w-10 h-10 bg-lime-400/20 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-lime-400" />
            </div>
            <div className="flex-1">
              <h3 className={`${colors.text} font-semibold text-sm`}>
                Meus treinos
              </h3>
              <p className={`${colors.textSecondary} text-xs`}>
                {workouts.length} treinos disponíveis
              </p>
            </div>
            <ChevronRight className={`w-5 h-5 ${colors.textSecondary}`} />
          </div>

          <div
            onClick={() => setActiveTab("achievements")}
            className={`${colors.card} border ${colors.border} rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-lime-400 transition-all`}
          >
            <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className={`${colors.text} font-semibold text-sm`}>
                Conquistas
              </h3>
              <p className={`${colors.textSecondary} text-xs`}>
                {mockAchievements.filter((a) => a.unlocked).length}{" "}
                desbloqueadas
              </p>
            </div>
            <ChevronRight className={`w-5 h-5 ${colors.textSecondary}`} />
          </div>

          <div
            onClick={() => setActiveTab("ranking")}
            className={`${colors.card} border ${colors.border} rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-lime-400 transition-all`}
          >
            <div className="w-10 h-10 bg-purple-400/20 rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className={`${colors.text} font-semibold text-sm`}>
                Ranking
              </h3>
              <p className={`${colors.textSecondary} text-xs`}>
                Ver classificação
              </p>
            </div>
            <ChevronRight className={`w-5 h-5 ${colors.textSecondary}`} />
          </div>
        </div>
      </div>

      <div className="px-6 pt-4 pb-6">
        <h2
          className={`${colors.textSecondary} text-xs font-semibold uppercase tracking-wider mb-3`}
        >
          Progresso semanal
        </h2>
        <div
          className={`${colors.card} border ${colors.border} rounded-xl p-4`}
        >
          <div className="flex justify-between items-center mb-3">
            <span className={`${colors.text} font-semibold text-sm`}>
              Meta Semanal
            </span>
            <span className="text-lime-400 font-bold">3/5</span>
          </div>
          <div className="w-full bg-lime-200/20 rounded-full h-2.5 mb-2">
            <div
              className="bg-lime-400 h-2.5 rounded-full"
              style={{ width: "60%" }}
            ></div>
          </div>
          <p className={`${colors.textSecondary} text-xs`}>
            Faltam 2 treinos para bater a meta!
          </p>
        </div>
      </div>

      <div className="px-6 pb-6">
        <h2 className={`${colors.text} font-semibold mb-3`}>
          Academia Forma Mais
        </h2>
        <div
          className={`${colors.card} border ${colors.border} rounded-xl p-4`}
        >
          <p className={`${colors.textSecondary} text-sm mb-2`}>
            📍 Praça Pedro Coutteiro, nº 55
          </p>
          <p className={`${colors.textSecondary} text-sm mb-2`}>
            Paulista - Recife/PE
          </p>
          <div className={`${colors.textSecondary} text-xs mt-3`}>
            <p>Seg-Sex: 6:30h às 21h</p>
            <p>Sábado: 7h às 17h</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
