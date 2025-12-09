// src/components/student/AchievementsScreen.tsx

import { useState, useEffect } from "react";
import type { FC } from "react";
import type { UserData, Achievement } from "../../types";
import { api } from "../../api";
import { useTheme } from "../../theme/context";
import { getThemeColors } from "../../theme/colors";

interface AchievementsScreenProps {
  user: UserData;
}

const AchievementsScreen: FC<AchievementsScreenProps> = ({ user }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  useEffect(() => {
    api.getAchievements().then(setAchievements);
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className={`min-h-screen ${colors.background} ${colors.text} pb-24`}>
      <div className={`${colors.card} border-b ${colors.border} p-6 pb-8`}>
        <h1 className={`${colors.text} text-2xl font-bold mb-4`}>
          Conquistas de {user.name}
        </h1>
        <div
          className={`${colors.card} border ${colors.border} rounded-2xl p-6 text-center`}
        >
          <div className="text-6xl mb-3">🏆</div>
          <p className={`${colors.textSecondary} text-sm mb-1`}>
            Conquistas Desbloqueadas
          </p>
          <p className={`${colors.text} text-3xl font-bold`}>
            {unlockedCount}/{achievements.length}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`rounded-xl p-4 border ${
              achievement.unlocked
                ? `${colors.card} border-lime-400`
                : `${colors.card} border ${colors.border} opacity-60`
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{achievement.icon}</div>
              <div className="flex-1">
                <h3 className={`${colors.text} font-semibold`}>
                  {achievement.name}
                </h3>
                <p className={`${colors.textSecondary} text-sm mt-1`}>
                  {achievement.description}
                </p>
                {achievement.unlocked && achievement.unlockedAt && (
                  <p className="text-lime-400 text-xs mt-2">
                    ✓ Desbloqueado em{" "}
                    {new Date(achievement.unlockedAt).toLocaleDateString(
                      "pt-BR"
                    )}
                  </p>
                )}
                {!achievement.unlocked && (
                  <p className={`${colors.textSecondary} text-xs mt-2`}>
                    🔒 Bloqueado
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsScreen;
