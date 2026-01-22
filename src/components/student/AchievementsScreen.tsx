import { useState, useEffect } from "react";
import type { FC } from "react";
import { Trophy, Award, Lock, Star, TrendingUp, Calendar } from "lucide-react";
import type { UserData, Achievement } from "../../types";
import { api } from "../../api";
import { useTheme } from "../../theme/context";
import { getThemeColors } from "../../theme/colors";

interface AchievementsScreenProps {
  user: UserData;
  onUserDataUpdate?: () => void;
}

const AchievementsScreen: FC<AchievementsScreenProps> = ({ user }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const userName = user.name;

  useEffect(() => {
    // Buscar achievements específicos do aluno logado
    api
      .getAchievements(user.id)
      .then(setAchievements)
      .catch((error) => {
        console.error(
          "[AchievementsScreen] Erro ao buscar achievements:",
          error,
        );
        setAchievements([]);
      });
  }, [user.id]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalPoints = unlockedCount * 50;

  const getRarityColor = (id: string) => {
    // Lendárias (a13-a16)
    if (["a13", "a14", "a15", "a16"].includes(id))
      return "from-purple-500 to-pink-500";
    // Raras (a9-a12)
    if (["a9", "a10", "a11", "a12"].includes(id))
      return "from-blue-500 to-cyan-500";
    // Incomuns (a5-a8)
    if (["a5", "a6", "a7", "a8"].includes(id))
      return "from-green-500 to-lime-500";
    // Comuns (a1-a4)
    return "from-gray-500 to-gray-600";
  };

  const getRarityLabel = (id: string) => {
    if (["a13", "a14", "a15", "a16"].includes(id)) return "Lendário";
    if (["a9", "a10", "a11", "a12"].includes(id)) return "Raro";
    if (["a5", "a6", "a7", "a8"].includes(id)) return "Incomum";
    return "Comum";
  };

  return (
    <div className={`min-h-screen ${colors.background} ${colors.text} pb-24`}>
      <div
        className={`${colors.card} border-b ${colors.border} p-6 pb-8 shadow-sm`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-linear-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`${colors.text} text-2xl font-bold`}>
              Conquistas de {userName}
            </h1>
            <p className={`${colors.textSecondary} text-sm`}>
              Desbloqueie todas as conquistas
            </p>
          </div>
        </div>

        <div
          className={`${colors.card} border-2 border-yellow-400/50 rounded-2xl p-5 text-center shadow-lg bg-linear-to-br from-yellow-400/5 to-orange-500/5`}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Award className="w-8 h-8 text-yellow-400" />
            <div>
              <p className={`${colors.textSecondary} text-sm`}>
                Conquistas Desbloqueadas
              </p>
              <p className={`${colors.text} text-3xl font-black`}>
                {unlockedCount}/{achievements.length}
              </p>
            </div>
          </div>

          <div className="w-full bg-gray-700/30 rounded-full h-3 mb-3 overflow-hidden">
            <div
              className="bg-linear-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${
                  achievements.length > 0
                    ? (unlockedCount / achievements.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className={colors.textSecondary}>{totalPoints} pontos</span>
            </div>
            <span className={colors.textSecondary}>•</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-lime-400" />
              <span className={colors.textSecondary}>
                {achievements.length > 0
                  ? Math.round((unlockedCount / achievements.length) * 100)
                  : 0}
                % completo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Conquistas */}
      <div className="p-6 space-y-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`rounded-2xl p-5 border transition-all shadow-md ${
              achievement.unlocked
                ? `${colors.card} border-lime-400 bg-lime-400/5 shadow-lime-400/20`
                : `${colors.card} border ${colors.border} opacity-70`
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`relative w-16 h-16 rounded-xl flex items-center justify-center text-4xl shrink-0 ${
                  achievement.unlocked
                    ? `bg-linear-to-br ${getRarityColor(
                        achievement.id,
                      )} shadow-lg`
                    : `${colors.input}`
                }`}
              >
                {achievement.unlocked ? (
                  <span className="drop-shadow-md">{achievement.icon}</span>
                ) : (
                  <Lock className="w-6 h-6 text-gray-500" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className={`${colors.text} font-bold text-lg mb-1`}>
                      {achievement.name}
                    </h3>
                    {achievement.unlocked && (
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-md bg-linear-to-r ${getRarityColor(
                          achievement.id,
                        )} text-white shadow-sm`}
                      >
                        {getRarityLabel(achievement.id)}
                      </span>
                    )}
                  </div>

                  {achievement.unlocked && (
                    <Star className="w-6 h-6 text-yellow-400 shrink-0" />
                  )}
                </div>

                <p className={`${colors.textSecondary} text-sm mb-3`}>
                  {achievement.description}
                </p>

                {achievement.unlocked && achievement.unlockedAt ? (
                  <div className="flex items-center gap-2 bg-lime-400/10 rounded-lg px-3 py-2 border border-lime-400/30">
                    <Calendar className="w-4 h-4 text-lime-400" />
                    <span className="text-lime-400 text-xs font-medium">
                      Desbloqueado em{" "}
                      {new Date(achievement.unlockedAt).toLocaleDateString(
                        "pt-BR",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-700/20 rounded-lg px-3 py-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    <span className={`${colors.textSecondary} text-xs`}>
                      Continue treinando para desbloquear
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {achievements.length === 0 && (
          <div
            className={`${colors.card} border ${colors.border} rounded-xl p-12 text-center`}
          >
            <Trophy
              className={`w-16 h-16 ${colors.textSecondary} mx-auto mb-4`}
            />
            <h3 className={`${colors.text} font-semibold text-lg mb-2`}>
              Nenhuma conquista encontrada
            </h3>
            <p className={`${colors.textSecondary} text-sm`}>
              Continue treinando para desbloquear conquistas
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsScreen;
