import { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Check,
  X,
  Trophy,
  Dumbbell,
  Calendar,
  Clock,
  Target,
  Flame,
  TrendingUp,
} from "lucide-react";
import type { UserData, Workout } from "../../types";
import { api } from "../../api";
import { useTheme } from "../../theme/context";
import { getThemeColors } from "../../theme/colors";

interface WorkoutsListScreenProps {
  user: UserData;
  onUserDataUpdate?: () => void;
}

function calculateBonusXP(
  baseXP: number,
  streak: number,
  prsCount: number
): number {
  const streakBonus = Math.min(streak * 10, 100);
  const prBonus = prsCount * 10;
  const totalBonus = streakBonus + prBonus;
  return Math.round(baseXP * (1 + totalBonus / 100));
}

const WorkoutsListScreen: React.FC<WorkoutsListScreenProps> = ({ user, onUserDataUpdate }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [userData, setUserData] = useState<UserData>(user);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  useEffect(() => {
    // Buscar treinos específicos do aluno logado
    api.getWorkouts(user.id).then(setWorkouts).catch((error) => {
      console.error("[WorkoutsListScreen] Erro ao buscar treinos:", error);
      setWorkouts([]);
    });
  }, [user.id]);

  const updateWeight = (
    workoutId: string,
    exerciseId: string,
    newWeight: number
  ) => {
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === workoutId
          ? {
              ...w,
              exercises: w.exercises.map((e) =>
                e.id === exerciseId
                  ? { ...e, weight: Math.max(0, newWeight) }
                  : e
              ),
            }
          : w
      )
    );
  };

  const toggleComplete = (workoutId: string, exerciseId: string) => {
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === workoutId
          ? {
              ...w,
              exercises: w.exercises.map((e) =>
                e.id === exerciseId ? { ...e, completed: !e.completed } : e
              ),
            }
          : w
      )
    );
  };

  const completeAllExercises = async (workoutId: string) => {
    // Marcar todos os exercícios como completos localmente
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === workoutId
          ? {
              ...w,
              exercises: w.exercises.map((e) => ({ ...e, completed: true })),
            }
          : w
      )
    );

    try {
      // Chamar o backend para completar o treino e ganhar XP
      const result = await api.completeWorkout(workoutId, user.id);
      
      // Atualizar XP e level do usuário
      if (result.member) {
        setUserData({
          ...userData,
          points: result.member.xp,
          level: result.member.level,
        });
        setEarnedXP(result.xpEarned);
      }
      
      setShowCompletionModal(true);
      setTimeout(() => {
        setShowCompletionModal(false);
        // Recarregar dados do usuário para atualizar XP
        api.getMemberData(user.id).then((memberData) => {
          setUserData({
            ...userData,
            points: memberData.xp,
            level: memberData.level,
          });
          // Notificar o App.tsx para atualizar o user global
          if (onUserDataUpdate) {
            onUserDataUpdate();
          }
        }).catch(console.error);
      }, 3000);
    } catch (error) {
      console.error("[WorkoutsListScreen] Erro ao completar treino:", error);
      // Mesmo com erro, mostrar o modal
      setEarnedXP(10);
      setShowCompletionModal(true);
      setTimeout(() => setShowCompletionModal(false), 3000);
    }
  };

  if (selectedWorkout) {
    const workout =
      workouts.find((w) => w.id === selectedWorkout.id) || selectedWorkout;
    const completedCount = workout.exercises.filter((e) => e.completed).length;
    const prCount = workout.exercises.filter(
      (e) => e.isPR && e.completed
    ).length;
    const allCompleted = completedCount === workout.exercises.length;
    const progress = (completedCount / workout.exercises.length) * 100;
    const baseXP = 10;
    const calculatedXP = calculateBonusXP(baseXP, userData.streak || 0, prCount);
    const displayedXP = earnedXP > 0 ? earnedXP : (allCompleted ? baseXP : calculatedXP);

    return (
      <div className={`min-h-screen ${colors.background} ${colors.text} pb-24`}>
        {/* Completion Modal */}
        {showCompletionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div
              className={`${colors.card} rounded-2xl p-8 max-w-sm w-full shadow-2xl border ${colors.border} animate-scale-in`}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-lime-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Trophy className="w-10 h-10 text-slate-900" />
                </div>
                <h3 className={`${colors.text} text-2xl font-bold mb-2`}>
                  🎉 Parabéns!
                </h3>
                <p className={`${colors.textSecondary} mb-4`}>
                  Treino concluído com sucesso!
                </p>
                <div className="bg-gradient-to-r from-lime-400/20 to-lime-500/20 rounded-xl p-4 border border-lime-400/30">
                  <p className="text-lime-400 font-bold text-3xl">
                    +{displayedXP} XP
                  </p>
                  <p className={`text-sm ${colors.textSecondary} mt-1`}>
                    Experiência ganha
                  </p>
                </div>
                {prCount > 0 && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-yellow-400">
                    <Trophy className="w-5 h-5" />
                    <span className="font-semibold">
                      {prCount} Novo{prCount > 1 ? "s" : ""} PR!
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div
          className={`${colors.card} p-6 pb-8 border-b ${colors.border} shadow-sm`}
        >
          <button
            onClick={() => setSelectedWorkout(null)}
            className="flex items-center gap-2 text-lime-400 mb-4 hover:opacity-80 transition-opacity active:scale-95"
          >
            <ChevronLeft size={20} />
            <span className="font-medium">Voltar</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-lime-500 rounded-xl flex items-center justify-center shadow-md">
              <Dumbbell className="w-6 h-6 text-slate-900" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-lime-400 text-slate-900 font-bold px-3 py-1 rounded-lg text-xs">
                  Treino {workout.type}
                </span>
                {allCompleted && (
                  <span className="flex items-center gap-1 text-lime-400 text-xs font-semibold">
                    <Check size={14} />
                    Completo
                  </span>
                )}
              </div>
              <h1 className={`${colors.text} text-xl font-bold`}>
                {workout.name}
              </h1>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className={`${colors.input} rounded-lg p-3 text-center`}>
              <Target
                className={`w-5 h-5 ${colors.textSecondary} mx-auto mb-1`}
              />
              <div className="text-lime-400 font-bold text-lg">
                {workout.exercises.length}
              </div>
              <div className={`text-xs ${colors.textSecondary}`}>
                Exercícios
              </div>
            </div>
            <div className={`${colors.input} rounded-lg p-3 text-center`}>
              <Clock
                className={`w-5 h-5 ${colors.textSecondary} mx-auto mb-1`}
              />
              <div className="text-blue-400 font-bold text-lg">
                {completedCount}
              </div>
              <div className={`text-xs ${colors.textSecondary}`}>Completos</div>
            </div>
            <div className={`${colors.input} rounded-lg p-3 text-center`}>
              <Trophy
                className={`w-5 h-5 ${colors.textSecondary} mx-auto mb-1`}
              />
              <div className="text-yellow-400 font-bold text-lg">{prCount}</div>
              <div className={`text-xs ${colors.textSecondary}`}>PRs</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className={colors.textSecondary}>Progresso do Treino</span>
              <span className="text-lime-400 font-semibold">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-lime-200/20 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-lime-400 to-lime-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {!allCompleted && (
            <button
              onClick={() => completeAllExercises(workout.id)}
              className="w-full py-4 bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-500 hover:to-lime-600 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
            >
              <Check size={20} />
              Concluir Todos os Exercícios
            </button>
          )}

          {allCompleted && (
            <div className="bg-gradient-to-r from-lime-400/10 to-lime-500/10 border-2 border-lime-400 rounded-xl p-4 text-center shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-6 h-6 text-lime-400" />
                <p className="text-lime-400 font-bold text-xl">
                  +{earnedXP || 10} XP Ganhos!
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className={colors.textSecondary}>
                    Streak: {userData.streak || 0} dias
                  </span>
                </div>
                {prCount > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-yellow-400" />
                    <span className={colors.textSecondary}>
                      {prCount} PR{prCount > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Exercises List */}
        <div className="p-6 space-y-3">
          {workout.exercises.map((exercise, idx) => (
            <div
              key={exercise.id}
              className={`${
                colors.card
              } border rounded-xl p-4 transition-all shadow-md ${
                exercise.completed
                  ? "border-lime-400 bg-lime-400/5 shadow-lime-400/20"
                  : colors.border
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-7 h-7 rounded-lg ${colors.input} flex items-center justify-center text-xs font-bold ${colors.text}`}
                    >
                      {idx + 1}
                    </span>
                    <h3
                      className={`${colors.text} font-semibold flex items-center gap-2 flex-1`}
                    >
                      {exercise.name}
                      {exercise.isPR && (
                        <span className="text-xs bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 px-2 py-1 rounded-md font-bold shadow-sm">
                          🏆 PR
                        </span>
                      )}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={colors.textSecondary}>
                      <strong>{exercise.series}</strong> séries
                    </span>
                    <span className={colors.textSecondary}>•</span>
                    <span className={colors.textSecondary}>
                      <strong>{exercise.reps}</strong> reps
                    </span>
                    <span className={colors.textSecondary}>•</span>
                    <span className={colors.textSecondary}>
                      Descanso: <strong>{exercise.rest}</strong>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleComplete(workout.id, exercise.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                    exercise.completed
                      ? "bg-lime-400 text-slate-900 shadow-lime-400/30"
                      : `${colors.input} ${colors.textSecondary} hover:bg-lime-400/20`
                  }`}
                >
                  {exercise.completed ? <Check size={20} /> : <X size={20} />}
                </button>
              </div>

              {/* Weight Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateWeight(workout.id, exercise.id, exercise.weight - 2.5)
                  }
                  className={`w-12 h-12 ${colors.input} rounded-xl ${colors.text} font-bold hover:bg-lime-400/20 transition-colors flex items-center justify-center shadow-sm active:scale-95`}
                >
                  <Minus size={18} />
                </button>
                <div
                  className={`flex-1 ${colors.input} rounded-xl px-4 py-3 text-center shadow-sm`}
                >
                  <span className={`${colors.text} font-bold text-2xl`}>
                    {exercise.weight}
                  </span>
                  <span className={`${colors.textSecondary} text-sm ml-2`}>
                    kg
                  </span>
                </div>
                <button
                  onClick={() =>
                    updateWeight(workout.id, exercise.id, exercise.weight + 2.5)
                  }
                  className={`w-12 h-12 ${colors.input} rounded-xl ${colors.text} font-bold hover:bg-lime-400/20 transition-colors flex items-center justify-center shadow-sm active:scale-95`}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Lista de Treinos
  const totalExercises = workouts.reduce(
    (acc, w) => acc + w.exercises.length,
    0
  );
  const completedWorkouts = workouts.filter((w) =>
    w.exercises.every((e) => e.completed)
  ).length;

  return (
    <div className={`min-h-screen ${colors.background} ${colors.text} pb-24`}>
      <div
        className={`${colors.card} border-b ${colors.border} p-6 pb-8 shadow-sm`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-lime-500 rounded-xl flex items-center justify-center shadow-md">
            <Dumbbell className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h1 className={`${colors.text} text-2xl font-bold`}>
              Meus Treinos
            </h1>
            <p className={`${colors.textSecondary} text-sm`}>
              {workouts.length} treinos • {totalExercises} exercícios
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`${colors.input} rounded-xl p-3 text-center`}>
            <Calendar
              className={`w-5 h-5 ${colors.textSecondary} mx-auto mb-1`}
            />
            <div className="text-lime-400 font-bold text-xl">
              {workouts.length}
            </div>
            <div className={`text-xs ${colors.textSecondary}`}>Treinos</div>
          </div>
          <div className={`${colors.input} rounded-xl p-3 text-center`}>
            <Check className={`w-5 h-5 ${colors.textSecondary} mx-auto mb-1`} />
            <div className="text-blue-400 font-bold text-xl">
              {completedWorkouts}
            </div>
            <div className={`text-xs ${colors.textSecondary}`}>Completos</div>
          </div>
          <div className={`${colors.input} rounded-xl p-3 text-center`}>
            <Target
              className={`w-5 h-5 ${colors.textSecondary} mx-auto mb-1`}
            />
            <div className="text-purple-400 font-bold text-xl">
              {totalExercises}
            </div>
            <div className={`text-xs ${colors.textSecondary}`}>Exercícios</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {workouts.map((workout) => {
          const completedCount = workout.exercises.filter(
            (e) => e.completed
          ).length;
          const totalCount = workout.exercises.length;
          const progress =
            totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
          const allCompleted = completedCount === totalCount;

          return (
            <button
              key={workout.id}
              onClick={() => setSelectedWorkout(workout)}
              className={`${
                colors.card
              } border rounded-xl p-5 w-full transition-all shadow-md active:scale-[0.98] ${
                allCompleted
                  ? "border-lime-400 bg-lime-400/5 shadow-lime-400/20"
                  : `${colors.border} hover:border-lime-400`
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-gradient-to-r from-lime-400 to-lime-500 text-slate-900 font-bold px-3 py-1.5 rounded-lg text-sm shadow-sm">
                      Treino {workout.type}
                    </span>
                    {allCompleted && (
                      <span className="flex items-center gap-1 text-lime-400 text-xs font-semibold">
                        <Check size={14} />
                        Completo
                      </span>
                    )}
                  </div>
                  <h3 className={`${colors.text} font-bold text-lg`}>
                    {workout.name}
                  </h3>
                  <p className={`${colors.textSecondary} text-sm mt-1`}>
                    {workout.exercises.length} exercícios • {completedCount}{" "}
                    completos
                  </p>
                </div>
                <ChevronRight
                  className={`w-6 h-6 ${colors.textSecondary} shrink-0`}
                />
              </div>

              {completedCount > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-2">
                    <span className={colors.textSecondary}>Progresso</span>
                    <span className="text-lime-400 font-semibold">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-lime-200/20 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-lime-400 to-lime-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </button>
          );
        })}

        {workouts.length === 0 && (
          <div
            className={`${colors.card} border ${colors.border} rounded-xl p-12 text-center`}
          >
            <Dumbbell
              className={`w-16 h-16 ${colors.textSecondary} mx-auto mb-4`}
            />
            <h3 className={`${colors.text} font-semibold text-lg mb-2`}>
              Nenhum treino disponível
            </h3>
            <p className={`${colors.textSecondary} text-sm`}>
              Aguarde seu professor criar um treino para você
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutsListScreen;
