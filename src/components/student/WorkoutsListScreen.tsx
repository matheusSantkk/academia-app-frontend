// src/components/student/WorkoutsListScreen.tsx

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import type { UserData, Workout } from "../../types";
import { api, calculateBonusXP } from "../../api";
import { useTheme } from "../../theme/context";
import { getThemeColors } from "../../theme/colors";

interface WorkoutsListScreenProps {
  user: UserData;
}

const WorkoutsListScreen: React.FC<WorkoutsListScreenProps> = ({ user }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  useEffect(() => {
    api.getWorkouts().then(setWorkouts);
  }, []);

  // --- Funções de Manipulação de Treino (Movemos para o estado local para simplificar o mock) ---
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
                e.id === exerciseId ? { ...e, weight: newWeight } : e
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
  };
  // ---------------------------------------------------------------------------------------------

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

    return (
      <div className={`min-h-screen ${colors.background} ${colors.text} pb-24`}>
        <div className={`${colors.card} p-6 pb-8 border-b ${colors.border}`}>
          <button
            onClick={() => setSelectedWorkout(null)}
            className="text-lime-400 mb-4"
          >
            ← Voltar
          </button>
          <h1 className={`${colors.text} text-2xl font-bold mb-2`}>
            {workout.name}
          </h1>
          <div className="flex gap-3 mb-4">
            <div className={`${colors.input} px-3 py-1 rounded-lg text-sm`}>
              <span className={`${colors.textSecondary}`}>Progresso: </span>
              <span className={`${colors.text} font-semibold`}>
                {completedCount}/{workout.exercises.length}
              </span>
            </div>
            {prCount > 0 && (
              <div className="bg-lime-400/20 px-3 py-1 rounded-lg text-sm">
                <span className="text-lime-400 font-semibold">
                  🔥 {prCount} PR{prCount > 1 ? "s" : ""}!
                </span>
              </div>
            )}
          </div>

          {!allCompleted && (
            <button
              onClick={() => completeAllExercises(workout.id)}
              className="w-full py-4 bg-lime-400 hover:bg-lime-500 text-slate-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              ✓ Concluir Todos os Exercícios
            </button>
          )}

          {allCompleted && (
            <div className="bg-lime-400 rounded-xl p-4 text-center">
              <p className="text-slate-900 font-bold text-lg">
                +{earnedXP} XP Ganhos!
              </p>
              <p className="text-slate-700 text-sm">
                Streak: {user.streak} dias (+
                {Math.min((user.streak || 0) * 10, 100)}%) • PRs: {prCount} (+
                {prCount * 10}%)
              </p>
            </div>
          )}
        </div>

        <div className="p-6 space-y-3">
          {workout.exercises.map((exercise) => (
            <div
              key={exercise.id}
              className={`${colors.card} border ${colors.border} rounded-xl p-4`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3
                    className={`${colors.text} font-semibold flex items-center gap-2`}
                  >
                    {exercise.name}
                    {exercise.isPR && (
                      <span className="text-xs bg-yellow-400 text-slate-900 px-2 py-0.5 rounded">
                        PR
                      </span>
                    )}
                  </h3>
                  <p className={`${colors.textSecondary} text-sm mt-1`}>
                    {exercise.series}x {exercise.reps} • Descanso:{" "}
                    {exercise.rest}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={exercise.completed}
                  onChange={() => toggleComplete(workout.id, exercise.id)}
                  className="w-6 h-6 accent-lime-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateWeight(
                      workout.id,
                      exercise.id,
                      Math.max(0, exercise.weight - 2.5)
                    )
                  }
                  className={`w-10 h-10 ${colors.input} rounded-lg ${colors.text} font-bold hover:opacity-80`}
                >
                  -
                </button>
                <div
                  className={`flex-1 ${colors.input} rounded-lg px-4 py-2 text-center`}
                >
                  <span className={`${colors.text} font-bold text-lg`}>
                    {exercise.weight}
                  </span>
                  <span className={`${colors.textSecondary} text-sm ml-1`}>
                    kg
                  </span>
                </div>
                <button
                  onClick={() =>
                    updateWeight(workout.id, exercise.id, exercise.weight + 2.5)
                  }
                  className={`w-10 h-10 ${colors.input} rounded-lg ${colors.text} font-bold hover:opacity-80`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Tela de Lista de Treinos
  return (
    <div className={`min-h-screen ${colors.background} ${colors.text} pb-24`}>
      <div className={`${colors.card} border-b ${colors.border} p-6 pb-8`}>
        <h1 className={`${colors.text} text-2xl font-bold mb-4`}>
          Meus Treinos
        </h1>
      </div>

      <div className="p-6 space-y-3">
        {workouts.map((workout) => {
          const completedCount = workout.exercises.filter(
            (e) => e.completed
          ).length;
          const totalCount = workout.exercises.length;
          const progress =
            totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

          return (
            <div
              key={workout.id}
              onClick={() => setSelectedWorkout(workout)}
              className={`${colors.card} border ${colors.border} rounded-xl p-4 cursor-pointer hover:border-lime-400 transition-colors`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-lime-400 text-slate-900 font-bold px-2 py-1 rounded text-sm">
                      {workout.type}
                    </span>
                    <h3 className={`${colors.text} font-semibold`}>
                      {workout.name}
                    </h3>
                  </div>
                  <p className={`${colors.textSecondary} text-sm`}>
                    {workout.exercises.length} exercícios
                  </p>
                </div>
                <ChevronRight className={`w-5 h-5 ${colors.textSecondary}`} />
              </div>

              {completedCount > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={colors.textSecondary}>Progresso</span>
                    <span className="text-lime-400 font-semibold">
                      {completedCount}/{totalCount}
                    </span>
                  </div>
                  <div className="w-full bg-lime-200/20 rounded-full h-1.5">
                    <div
                      className="bg-lime-400 h-1.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutsListScreen;
