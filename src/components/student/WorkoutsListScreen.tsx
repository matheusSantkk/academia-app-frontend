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
  ChevronDown,
  ChevronUp,
  Repeat,
  Activity,
  Weight,
} from "lucide-react";
import type { UserData, Workout } from "../../types";
import { api } from "../../api";
import { useTheme } from "../../theme/context";
import { getThemeColors } from "../../theme/colors";

interface WorkoutsListScreenProps {
  user: UserData;
  onUserDataUpdate?: () => void;
}

const WorkoutsListScreen: React.FC<WorkoutsListScreenProps> = ({ user, onUserDataUpdate }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<Array<{
    id: string;
    endTime: string;
  }>>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [previousAchievements, setPreviousAchievements] = useState<Set<string>>(new Set());
  const [userData, setUserData] = useState<UserData>(user);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  useEffect(() => {
    // Buscar treinos específicos do aluno logado
    api.getWorkouts(user.id).then(setWorkouts).catch((error) => {
      console.error("[WorkoutsListScreen] Erro ao buscar treinos:", error);
      setWorkouts([]);
    });
    
    // Buscar histórico de treinos
    api.getWorkoutHistory(user.id).then(setWorkoutHistory).catch((error) => {
      console.error("[WorkoutsListScreen] Erro ao buscar histórico:", error);
      setWorkoutHistory([]);
    });
    
    // Buscar conquistas iniciais para comparação
    api.getAchievements(user.id).then((achievements) => {
      const unlockedIds = new Set(
        achievements.filter(a => a.unlocked).map(a => a.id)
      );
      setPreviousAchievements(unlockedIds);
    }).catch(() => {});
  }, [user.id]);

  // Recarregar histórico quando os pontos mudarem (indicando que um treino foi completado)
  useEffect(() => {
    api
      .getWorkoutHistory(user.id)
      .then(setWorkoutHistory)
      .catch((error) => {
        console.error("[WorkoutsListScreen] Erro ao atualizar histórico:", error);
      });
  }, [userData.points, user.id]);

  function toggleWorkoutExpanded(workoutId: string) {
    setExpandedWorkouts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(workoutId)) {
        newSet.delete(workoutId);
      } else {
        newSet.add(workoutId);
      }
      return newSet;
    });
  }

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
      console.log('[WorkoutsListScreen] Iniciando completar treino:', { workoutId, userId: user.id });
      
      // Chamar o backend para completar o treino e ganhar XP
      // O memberId é extraído automaticamente do token JWT no backend
      const result = await api.completeWorkout(workoutId);
      
      console.log('[WorkoutsListScreen] Resposta do backend:', result);
      
      // Atualizar XP, level e streak do usuário imediatamente
      if (result && result.member) {
        const newXP = Number(result.member.xp) || 0;
        const newLevel = Number(result.member.level) || 1;
        const newStreak = Number(result.member.currentStreak) || 0;
        const xpGained = Number(result.xpEarned) || 10;
        
        console.log('[WorkoutsListScreen] Atualizando dados:', { 
          newXP, 
          newLevel, 
          newStreak,
          xpGained,
          oldXP: userData.points,
          oldLevel: userData.level,
          oldStreak: userData.streak
        });
        
        setUserData(prev => ({
          ...prev,
          points: newXP,
          level: newLevel,
          streak: newStreak,
        }));
        setEarnedXP(xpGained);
      } else {
        console.warn('[WorkoutsListScreen] Resposta não contém member, usando fallback');
        // Fallback se não vier member no resultado
        setEarnedXP(10);
      }
      
      setShowCompletionModal(true);
      
      // Recarregar dados do usuário para atualizar XP, streak e conquistas
      setTimeout(async () => {
        try {
          const memberData = await api.getMemberData(user.id);
          setUserData({
            ...userData,
            points: memberData.xp,
            level: memberData.level,
            streak: memberData.currentStreak,
          });
          
          // Verificar se novas conquistas foram desbloqueadas
          const achievements = await api.getAchievements(user.id);
          const currentUnlockedIds = new Set(
            achievements.filter(a => a.unlocked).map(a => a.id)
          );
          
          // Encontrar conquistas que foram desbloqueadas agora
          const newlyUnlocked = achievements
            .filter(a => a.unlocked && !previousAchievements.has(a.id))
            .map(a => a.name);
          
          if (newlyUnlocked.length > 0) {
            setNewAchievements(newlyUnlocked);
          }
          
          // Atualizar conjunto de conquistas anteriores
          setPreviousAchievements(currentUnlockedIds);
          
          // Notificar o App.tsx para atualizar o user global
          if (onUserDataUpdate) {
            onUserDataUpdate();
          }
          
          // Recarregar treinos para atualizar status
          const updatedWorkouts = await api.getWorkouts(user.id);
          setWorkouts(updatedWorkouts);
          
          // Recarregar histórico de treinos para atualizar contador
          const updatedHistory = await api.getWorkoutHistory(user.id);
          setWorkoutHistory(updatedHistory);
        } catch (error) {
          console.error("[WorkoutsListScreen] Erro ao atualizar dados:", error);
        }
        
        setShowCompletionModal(false);
        setNewAchievements([]);
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

    return (
      <div className={`min-h-screen ${colors.background} ${colors.text} pb-24`}>
        {/* Completion Modal */}
        {showCompletionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
            <div
              className={`${colors.card} rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-lime-400/30 animate-scale-in relative overflow-hidden`}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/10 rounded-full -ml-12 -mb-12 blur-xl" />
              
              <div className="text-center relative z-10">
                {/* Animated trophy icon */}
                <div className="w-24 h-24 bg-gradient-to-br from-lime-400 via-lime-500 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce">
                  <Trophy className="w-12 h-12 text-slate-900" />
                </div>
                
                <h3 className={`${colors.text} text-3xl font-black mb-2 bg-gradient-to-r from-lime-400 to-yellow-400 bg-clip-text text-transparent`}>
                  🎉 Parabéns!
                </h3>
                <p className={`${colors.textSecondary} mb-6 text-lg`}>
                  Treino concluído com sucesso!
                </p>
                
                {/* XP Card - Enhanced */}
                <div className="bg-gradient-to-br from-lime-400/20 via-lime-500/20 to-yellow-400/20 rounded-2xl p-6 border-2 border-lime-400/40 shadow-lg mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-lime-400/5 to-transparent animate-pulse" />
                  <div className="relative z-10">
                    {earnedXP > 0 ? (
                      <>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <TrendingUp className="w-6 h-6 text-lime-400 animate-bounce" />
                          <p className="text-lime-400 font-black text-5xl animate-pulse">
                            +{earnedXP} XP
                          </p>
                        </div>
                        <p className={`text-sm ${colors.textSecondary} font-medium`}>
                          Experiência ganha
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Clock className="w-6 h-6 text-orange-400" />
                          <p className="text-orange-400 font-black text-3xl">
                            Treino Registrado
                          </p>
                        </div>
                        <p className={`text-sm ${colors.textSecondary} font-medium`}>
                          Você já ganhou XP hoje! Volte amanhã para ganhar mais.
                        </p>
                      </>
                    )}
                    {userData.level && (
                      <div className="mt-3 pt-3 border-t border-lime-400/20">
                        <div className="flex items-center justify-between text-xs">
                          <span className={colors.textSecondary}>Nível {userData.level}</span>
                          <span className="text-lime-400 font-bold">
                            {userData.points || 0} / {(userData.level || 1) * 50} XP
                          </span>
                        </div>
                        <div className="w-full bg-gray-700/30 rounded-full h-2 mt-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-lime-400 to-lime-500 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(((userData.points || 0) % ((userData.level || 1) * 50)) / ((userData.level || 1) * 50) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* PRs */}
                {prCount > 0 && (
                  <div className="mt-4 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-xl p-4 border border-yellow-400/40 flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">
                      {prCount} Novo{prCount > 1 ? "s" : ""} PR{prCount > 1 ? "s" : ""}!
                    </span>
                  </div>
                )}
                
                {/* Achievements */}
                {newAchievements.length > 0 && (
                  <div className="mt-4 bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-pink-500/20 rounded-2xl p-5 border-2 border-yellow-400/40 shadow-lg">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                      <span className="text-yellow-400 font-black text-xl">
                        {newAchievements.length} Conquista{newAchievements.length > 1 ? "s" : ""} Desbloqueada{newAchievements.length > 1 ? "s" : ""}!
                      </span>
                    </div>
                    <div className="space-y-2">
                      {newAchievements.slice(0, 3).map((achievement, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-yellow-300 font-semibold bg-yellow-400/10 rounded-lg px-3 py-2">
                          <span className="text-lg">🏆</span>
                          <span>{achievement}</span>
                        </div>
                      ))}
                      {newAchievements.length > 3 && (
                        <div className="text-xs text-yellow-400/80 font-medium text-center pt-1">
                          +{newAchievements.length - 3} mais conquista{newAchievements.length - 3 > 1 ? "s" : ""}...
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Close button hint */}
                <p className={`${colors.textSecondary} text-xs mt-6 opacity-70`}>
                  Fechando automaticamente...
                </p>
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
              {earnedXP > 0 ? (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-6 h-6 text-lime-400" />
                  <p className="text-lime-400 font-bold text-xl">
                    +{earnedXP} XP Ganhos!
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <p className="text-orange-400 font-bold text-lg">
                    Treino registrado! Você já ganhou XP hoje.
                  </p>
                </div>
              )}
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
  
  // Calcular treinos completos do mês atual (igual à tela inicial)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const completedWorkoutsCount = workoutHistory.filter((h) => {
    const workoutDate = new Date(h.endTime);
    return workoutDate.getMonth() === currentMonth && 
           workoutDate.getFullYear() === currentYear;
  }).length;

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
              {completedWorkoutsCount}
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
          const isExpanded = expandedWorkouts.has(workout.id);

          return (
            <div
              key={workout.id}
              className={`${
                colors.card
              } border rounded-xl p-5 w-full transition-all shadow-md ${
                allCompleted
                  ? "border-lime-400 bg-lime-400/5 shadow-lime-400/20"
                  : `${colors.border} hover:border-lime-400`
              }`}
            >
              <div 
                className="flex items-center justify-between mb-3 cursor-pointer"
                onClick={() => toggleWorkoutExpanded(workout.id)}
              >
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWorkoutExpanded(workout.id);
                      }}
                      className="p-1 rounded-lg text-lime-400 hover:bg-lime-400/10 transition"
                      title={isExpanded ? "Recolher exercícios" : "Expandir exercícios"}
                    >
                      {isExpanded ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                  </div>
                  <h3 className={`${colors.text} font-bold text-lg`}>
                    {workout.name}
                  </h3>
                  <p className={`${colors.textSecondary} text-sm mt-1`}>
                    {workout.exercises.length} exercícios • {completedCount}{" "}
                    completos
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWorkout(workout);
                  }}
                  className="p-2 rounded-lg text-lime-400 hover:bg-lime-400/10 transition"
                  title="Ver detalhes do treino"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
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

              {/* Lista de Exercícios (quando expandido) */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-lime-400/20 space-y-2 animate-fade-in">
                  {workout.exercises.map((exercise, idx) => (
                    <div
                      key={exercise.id}
                      className={`${colors.input} rounded-lg p-3 border ${colors.border} ${
                        exercise.completed ? "border-lime-400 bg-lime-400/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                          exercise.completed 
                            ? "bg-lime-400 text-slate-900" 
                            : "bg-lime-400/20 text-lime-400 border border-lime-400/30"
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`${colors.text} font-semibold text-sm mb-2 flex items-center gap-2`}>
                            {exercise.name}
                            {exercise.completed && (
                              <Check size={14} className="text-lime-400" />
                            )}
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="flex items-center gap-1.5">
                              <Repeat size={12} className={colors.textSecondary} />
                              <span className={colors.textSecondary}>
                                {exercise.series} séries
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Activity size={12} className={colors.textSecondary} />
                              <span className={colors.textSecondary}>
                                {exercise.reps} reps
                              </span>
                            </div>
                            {exercise.weight > 0 && (
                              <div className="flex items-center gap-1.5">
                                <Weight size={12} className={colors.textSecondary} />
                                <span className={colors.textSecondary}>
                                  {exercise.weight} kg
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Clock size={12} className={colors.textSecondary} />
                              <span className={colors.textSecondary}>
                                {exercise.rest}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
