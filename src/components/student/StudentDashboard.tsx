import { useState, useEffect } from "react";
import {
  User,
  Dumbbell,
  Target,
  Flame,
  Trophy,
  Crown,
  ChevronRight,
  TrendingUp,
  Calendar,
  Award,
  MapPin,
  Clock,
} from "lucide-react";
import type { UserData, Workout } from "../../types";
import { api } from "../../api";
import { useTheme } from "../../theme/context";
import { getThemeColors } from "../../theme/colors";

interface StudentDashboardProps {
  user: UserData;
  setActiveTab: (tab: string) => void;
  onUserDataUpdate?: () => void;
}

function calculateLevelProgress(points: number, level: number): number {
  const pointsForNextLevel = level * 50;
  if (pointsForNextLevel === 0) return 0;
  const pointsInCurrentLevel = points % pointsForNextLevel;
  return (pointsInCurrentLevel / pointsForNextLevel) * 100;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  setActiveTab,
  onUserDataUpdate,
}) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<Array<{
    id: string;
    endTime: string;
  }>>([]);
  const [achievements, setAchievements] = useState<Array<{ unlocked: boolean }>>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [userData, setUserData] = useState<UserData>(user);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  useEffect(() => {
    // Buscar dados atualizados do aluno (level, xp, streak)
    api
      .getMemberData(user.id)
      .then((memberData) => {
        setUserData({
          ...user,
          level: memberData.level,
          points: memberData.xp,
          streak: memberData.currentStreak,
        });
        // Notificar o App.tsx para atualizar o user global
        if (onUserDataUpdate) {
          onUserDataUpdate();
        }
      })
      .catch((error) => {
        console.error(
          "[StudentDashboard] Erro ao buscar dados do membro:",
          error,
        );
        // Manter os dados do user original em caso de erro
      });

    // Buscar treinos específicos do aluno logado
    api
      .getWorkouts(user.id)
      .then(setWorkouts)
      .catch((error) => {
        console.error("[StudentDashboard] Erro ao buscar treinos:", error);
        setWorkouts([]);
      });

    // Buscar histórico de treinos
    api
      .getWorkoutHistory(user.id)
      .then(setWorkoutHistory)
      .catch((error) => {
        console.error("[StudentDashboard] Erro ao buscar histórico:", error);
        setWorkoutHistory([]);
      });

    // Buscar conquistas
    api
      .getAchievements(user.id)
      .then(setAchievements)
      .catch((error) => {
        console.error("[StudentDashboard] Erro ao buscar conquistas:", error);
        setAchievements([]);
      });

    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, [user, onUserDataUpdate]);

  // Calcular treinos completos baseado no histórico
  const completedWorkoutsCount = workoutHistory.length;
  
  // Calcular frequência semanal baseada no histórico real
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const today = new Date();
  const todayDay = today.getDay();
  
  // Calcular quais dias da semana atual tiveram treinos
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - todayDay);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const activeDays = workoutHistory
    .map((h) => {
      const workoutDate = new Date(h.endTime);
      if (workoutDate >= startOfWeek) {
        return workoutDate.getDay();
      }
      return null;
    })
    .filter((day): day is number => day !== null);

  const uniqueActiveDays = [...new Set(activeDays)];

  const levelProgress = calculateLevelProgress(
    userData.points || 0,
    userData.level || 1,
  );
  const nextLevelPoints = (userData.level || 1) * 50;

  const unlockedAchievements = achievements.filter(
    (a) => a.unlocked,
  ).length;

  return (
    <div className={`min-h-screen ${colors.background} ${colors.text} pb-24`}>
      <div
        className={`${colors.card} bg-opacity-50 backdrop-blur p-6 pb-6 border-b ${colors.border}`}
      >
        {showWelcome && (
          <div className="mb-4 bg-lime-400/10 border border-lime-400/20 rounded-xl p-3 animate-fade-in">
            <p className="text-lime-400 text-sm font-medium">
              🎯 Bom te ver por aqui, {user.name.split(" ")[0]}!
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-lime-400 to-lime-500 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-7 h-7 text-slate-900" />
            </div>
            <div>
              <p className={`${colors.textSecondary} text-xs`}>Olá,</p>
              <h1 className={`${colors.text} text-xl font-bold`}>
                {userData.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-lime-400/20 text-lime-400 px-2 py-0.5 rounded-full font-medium">
                  Nível {userData.level || 1}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-lime-400 to-lime-500 rounded-2xl p-4 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
            <div className="relative">
              <div className="flex items-center gap-1 text-slate-900 text-xs font-bold mb-2">
                <Flame className="w-4 h-4" />
                Nível
              </div>
              <div className="text-5xl font-black text-slate-900 mb-1">
                {userData.level || 1}
              </div>
              <div className="text-slate-700 text-xs font-semibold">
                {userData.points || 0} / {nextLevelPoints} XP
              </div>
              <div className="w-full bg-lime-600 rounded-full h-1.5 mt-2">
                <div
                  className="bg-slate-900 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div
            className={`${colors.card} border ${colors.border} rounded-2xl p-4 shadow-md`}
          >
            <div
              className={`${colors.textSecondary} text-xs font-medium mb-2 flex items-center gap-1`}
            >
              <Target className="w-4 h-4" />
              Completos
            </div>
            <div className={`text-5xl font-black ${colors.text} mb-1`}>
              {completedWorkoutsCount}
            </div>
            <div className={`${colors.textSecondary} text-xs`}>
              treinos completos
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-lime-400" />
              <span className="text-lime-400 text-xs font-medium">
                {workouts.length} disponíveis
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div
            className={`${colors.card} border ${colors.border} rounded-2xl p-4 text-center shadow-md`}
          >
            <div className={`${colors.textSecondary} text-xs font-medium mb-1`}>
              Sequência atual
            </div>
            <div className="flex items-center justify-center gap-1">
              <div className={`text-4xl font-black ${colors.text}`}>
                {userData.streak || 0}
              </div>
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-lime-400 text-xs font-medium mt-1">dias</div>
          </div>

          <div
            className={`${colors.card} border ${colors.border} rounded-2xl p-4 text-center shadow-md`}
          >
            <div className={`${colors.textSecondary} text-xs font-medium mb-1`}>
              Esta semana
            </div>
            <div className={`text-4xl font-black ${colors.text}`}>
              {uniqueActiveDays.length}
            </div>
            <div className={`${colors.textSecondary} text-xs mt-1`}>
              dias ativos
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-6 pb-4">
        <h2
          className={`${colors.text} font-semibold mb-3 flex items-center gap-2`}
        >
          <Calendar size={18} />
          Frequência Semanal
        </h2>
        <div
          className={`${colors.card} border ${colors.border} rounded-xl p-4 shadow-md`}
        >
          <div className="flex justify-between gap-2">
            {weekDays.map((day, idx) => {
              const isToday = idx === todayDay;
              const isActive = uniqueActiveDays.includes(idx);

              return (
                <div
                  key={day}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <span
                    className={`text-xs ${
                      isToday ? "text-lime-400 font-bold" : colors.textSecondary
                    }`}
                  >
                    {day}
                  </span>
                  <div
                    className={`w-full h-16 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-lime-400 text-slate-900"
                        : isToday
                          ? `${colors.input} ring-2 ring-lime-400`
                          : colors.input
                    }`}
                  >
                    {isActive && <Award className="w-5 h-5" />}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-between items-center">
            <span className={`${colors.textSecondary} text-xs`}>
              Meta: 5 dias/semana
            </span>
            <span className="text-lime-400 font-bold text-sm">
              {uniqueActiveDays.length}/5
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-4">
        <h2
          className={`${colors.textSecondary} text-xs font-semibold uppercase tracking-wider mb-3`}
        >
          Ações rápidas
        </h2>
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab("workouts")}
            className={`${colors.card} border ${colors.border} rounded-xl p-4 flex items-center gap-3 w-full hover:border-lime-400 transition-all shadow-md active:scale-[0.98]`}
          >
            <div className="w-12 h-12 bg-lime-400/20 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-lime-400" />
            </div>
            <div className="flex-1 text-left">
              <h3 className={`${colors.text} font-semibold`}>Meus treinos</h3>
              <p className={`${colors.textSecondary} text-sm`}>
                {workouts.length} treinos disponíveis
              </p>
            </div>
            <ChevronRight className={`w-5 h-5 ${colors.textSecondary}`} />
          </button>

          <button
            onClick={() => setActiveTab("achievements")}
            className={`${colors.card} border ${colors.border} rounded-xl p-4 flex items-center gap-3 w-full hover:border-lime-400 transition-all shadow-md active:scale-[0.98]`}
          >
            <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1 text-left">
              <h3 className={`${colors.text} font-semibold`}>Conquistas</h3>
              <p className={`${colors.textSecondary} text-sm`}>
                {unlockedAchievements} desbloqueadas
              </p>
            </div>
            <ChevronRight className={`w-5 h-5 ${colors.textSecondary}`} />
          </button>

          <button
            onClick={() => setActiveTab("ranking")}
            className={`${colors.card} border ${colors.border} rounded-xl p-4 flex items-center gap-3 w-full hover:border-lime-400 transition-all shadow-md active:scale-[0.98]`}
          >
            <div className="w-12 h-12 bg-purple-400/20 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1 text-left">
              <h3 className={`${colors.text} font-semibold`}>Ranking</h3>
              <p className={`${colors.textSecondary} text-sm`}>
                Ver classificação
              </p>
            </div>
            <ChevronRight className={`w-5 h-5 ${colors.textSecondary}`} />
          </button>
        </div>
      </div>

      <div className="px-6 pb-6">
        <h2 className={`${colors.text} font-semibold mb-3`}>
          Academia Forma Mais
        </h2>
        <div
          className={`${colors.card} border ${colors.border} rounded-xl p-4 shadow-md`}
        >
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-lime-400/20 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-lime-400" />
              </div>
              <div>
                <p className={`${colors.text} font-medium`}>
                  Praça Pedro Coutteiro, nº 55
                </p>
                <p className={`${colors.textSecondary} text-sm`}>
                  Paulista - Recife/PE
                </p>
              </div>
            </div>

            <div className={`${colors.input} rounded-lg p-3`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-lime-400" />
                <p className={`${colors.textSecondary} text-xs font-medium`}>
                  Horário de Funcionamento
                </p>
              </div>
              <div className="space-y-1">
                <p className={`${colors.text} text-sm`}>
                  Seg-Sex: 6:30h às 21h
                </p>
                <p className={`${colors.text} text-sm`}>Sábado: 7h às 17h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
