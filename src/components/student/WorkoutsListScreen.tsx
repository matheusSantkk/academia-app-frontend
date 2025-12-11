import { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Check,
  X,
  Trophy,
} from "lucide-react";
import type { UserData, Workout } from "../../types";
import { api } from "../../api";
import { useTheme } from "../../theme/context";
import { getThemeColors } from "../../theme/colors";

interface WorkoutsListScreenProps {
  user: UserData;
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

const WorkoutsListScreen: React.FC<WorkoutsListScreenProps> = ({ user }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  useEffect(() => {
    api.getWorkouts().then(setWorkouts);
  }, []);

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

  const completeAllExercises = (workoutId: string) => {
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
    setShowCompletionModal(true);
    setTimeout(() => setShowCompletionModal(false), 3000);
  };

  if (selectedWorkout) {
    const workout =
      workouts.find((w) => w.id === selectedWorkout.id) || selectedWorkout;
    const completedCount = workout.exercises.filter((e) => e.completed).length;
    const prCount = workout.exercises.filter(
      (e) => e.isPR && e.completed
    ).length;
    const baseXP = 10;
    const earnedXP = calculateBonusXP(baseXP, user.streak || 0, prCount);
    const allCompleted = completedCount === workout.exercises.length;
    const progress = (completedCount / workout.exercises.length) * 100;

    return (
      <div className={`min-h-screen ${colors.background} ${colors.text} pb-24`}>
        {/* Completion Modal */}
        {showCompletionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
              className={`${colors.card} rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in`}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-lime-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-slate-900" />
                </div>
                <h3 className={`${colors.text} text-xl font-bold mb-2`}>
                  Parabéns!
                </h3>
                <p className={`${colors.textSecondary} mb-4`}>
                  Treino concluído com sucesso!
                </p>
                <div className="bg-lime-400/10 rounded-xl p-4">
                  <p className="text-lime-400 font-bold text-2xl">
                    +{earnedXP} XP
                  </p>
                  <p className={`text-xs ${colors.textSecondary} mt-1`}>
                    Experiência ganha
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={`${colors.card} p-6 pb-8 border-b ${colors.border}`}>
          <button
            onClick={() => setSelectedWorkout(null)}
            className="flex items-center gap-2 text-lime-400 mb-4 hover:opacity-80 transition-opacity"
          >
            <ChevronLeft size={20} />
            Voltar
          </button>

          <div className="flex items-center gap-3 mb-4">
            <span className="bg-lime-400 text-slate-900 font-bold px-3 py-1.5 rounded-lg text-sm">
              {workout.type}
            </span>
            <h1 className={`${colors.text} text-2xl font-bold`}>
              {workout.name}
            </h1>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className={colors.textSecondary}>Progresso</span>
              <span className="text-lime-400 font-semibold">
                {completedCount}/{workout.exercises.length}
              </span>
            </div>
            <div className="w-full bg-lime-200/20 rounded-full h-3">
              <div
                className="bg-lime-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            {prCount > 0 && (
              <div className="bg-lime-400/20 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-lime-400" />
                <span className="text-lime-400 font-semibold">
                  {prCount} PR{prCount > 1 ? "s" : ""}!
                </span>
              </div>
            )}
          </div>

          {!allCompleted && (
            <button
              onClick={() => completeAllExercises(workout.id)}
              className="w-full py-4 bg-lime-400 hover:bg-lime-500 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
            >
              <Check size={20} />
              Concluir Todos os Exercícios
            </button>
          )}

          {allCompleted && (
            <div className="bg-gradient-to-r from-lime-400 to-lime-500 rounded-xl p-4 text-center shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-6 h-6 text-slate-900" />
                <p className="text-slate-900 font-bold text-xl">
                  +{earnedXP} XP Ganhos!
                </p>
              </div>
              <p className="text-slate-700 text-sm">
                Streak: {user.streak} dias (+
                {Math.min((user.streak || 0) * 10, 100)}%) • PRs: {prCount} (+
                {prCount * 10}%)
              </p>
            </div>
          )}
        </div>

        {/* Exercises List */}
        <div className="p-6 space-y-3">
          {workout.exercises.map((exercise, idx) => (
            <div
              key={exercise.id}
              className={`${colors.card} border rounded-xl p-4 transition-all ${
                exercise.completed
                  ? "border-lime-400 bg-lime-400/5"
                  : colors.border
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-bold ${colors.textSecondary}`}
                    >
                      #{idx + 1}
                    </span>
                    <h3
                      className={`${colors.text} font-semibold flex items-center gap-2`}
                    >
                      {exercise.name}
                      {exercise.isPR && (
                        <span className="text-xs bg-yellow-400 text-slate-900 px-2 py-0.5 rounded font-bold">
                          PR
                        </span>
                      )}
                    </h3>
                  </div>
                  <p className={`${colors.textSecondary} text-sm`}>
                    {exercise.series}x {exercise.reps} • Descanso:{" "}
                    {exercise.rest}
                  </p>
                </div>
                <button
                  onClick={() => toggleComplete(workout.id, exercise.id)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    exercise.completed
                      ? "bg-lime-400 text-slate-900"
                      : `${colors.input} ${colors.textSecondary}`
                  }`}
                >
                  {exercise.completed ? <Check size={18} /> : <X size={18} />}
                </button>
              </div>

              {/* Weight Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateWeight(workout.id, exercise.id, exercise.weight - 2.5)
                  }
                  className={`w-12 h-12 ${colors.input} rounded-lg ${colors.text} font-bold hover:bg-lime-400/20 transition-colors flex items-center justify-center`}
                >
                  <Minus size={18} />
                </button>
                <div
                  className={`flex-1 ${colors.input} rounded-lg px-4 py-3 text-center`}
                >
                  <span className={`${colors.text} font-bold text-xl`}>
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
                  className={`w-12 h-12 ${colors.input} rounded-lg ${colors.text} font-bold hover:bg-lime-400/20 transition-colors flex items-center justify-center`}
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
  return (
    <div className={`min-h-screen ${colors.background} ${colors.text} pb-24`}>
      <div className={`${colors.card} border-b ${colors.border} p-6 pb-8`}>
        <h1 className={`${colors.text} text-2xl font-bold mb-2`}>
          Meus Treinos
        </h1>
        <p className={`${colors.textSecondary} text-sm`}>
          {workouts.length} treinos disponíveis
        </p>
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
              } border rounded-xl p-4 w-full hover:border-lime-400 transition-all shadow-md active:scale-[0.98] ${
                allCompleted ? "border-lime-400 bg-lime-400/5" : colors.border
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-lime-400 text-slate-900 font-bold px-2 py-1 rounded text-xs">
                      {workout.type}
                    </span>
                    {allCompleted && (
                      <span className="flex items-center gap-1 text-lime-400 text-xs font-semibold">
                        <Check size={14} />
                        Completo
                      </span>
                    )}
                  </div>
                  <h3 className={`${colors.text} font-semibold text-lg`}>
                    {workout.name}
                  </h3>
                  <p className={`${colors.textSecondary} text-sm mt-1`}>
                    {workout.exercises.length} exercícios
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
                      {completedCount}/{totalCount}
                    </span>
                  </div>
                  <div className="w-full bg-lime-200/20 rounded-full h-2">
                    <div
                      className="bg-lime-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutsListScreen;
