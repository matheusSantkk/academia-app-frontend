// src/screens/RankingScreen.tsx

import { useState, useEffect } from "react";
import { User } from "lucide-react";
import type { RankingUser } from "../types";
import { api } from "../api";
import { useTheme } from "../theme/context";
import { getThemeColors } from "../theme/colors";

const RankingScreen: React.FC = () => {
  const [tab, setTab] = useState<"monthly" | "total">("monthly");
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  useEffect(() => {
    // Carrega ranking quando a aba (tab) mudar. O loading é ativado pelos botões
    // que trocam a aba para evitar chamar setState() sincronamente dentro do effect.
    api.getRanking(tab).then((data) => {
      setRanking(data);
      setLoading(false);
    });
  }, [tab]);

  const getMedalColor = (position: number) => {
    if (position === 1) return "text-yellow-400";
    if (position === 2) return "text-slate-300";
    if (position === 3) return "text-orange-400";
    return "text-slate-500";
  };

  return (
    <div className={`min-h-screen ${colors.background} ${colors.text} pb-24`}>
      <div className={`${colors.card} border-b ${colors.border} p-6 pb-6`}>
        <h1 className={`${colors.text} text-2xl font-bold mb-4`}>Ranking</h1>

        <div className={`flex gap-2 ${colors.input} p-1 rounded-xl`}>
          <button
            onClick={() => {
              setLoading(true);
              setTab("monthly");
            }}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
              tab === "monthly"
                ? "bg-lime-400 text-slate-900"
                : `${colors.textSecondary}`
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => {
              setLoading(true);
              setTab("total");
            }}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
              tab === "total"
                ? "bg-lime-400 text-slate-900"
                : `${colors.textSecondary}`
            }`}
          >
            Total
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className={colors.textSecondary}>Carregando...</div>
        </div>
      ) : (
        <div className="px-6 space-y-2">
          {ranking.map((user) => (
            <div
              key={user.id}
              className={`${
                colors.card
              } border rounded-xl p-4 flex items-center gap-4 ${
                user.position <= 3 ? "border-lime-400" : colors.border
              }`}
            >
              <div
                className={`text-2xl font-bold ${getMedalColor(
                  user.position
                )} w-8 text-center`}
              >
                {user.position <= 3
                  ? ["🥇", "🥈", "🥉"][user.position - 1]
                  : `#${user.position}`}
              </div>

              <div className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-900" />
              </div>

              <div className="flex-1">
                <h3 className={`${colors.text} font-semibold`}>{user.name}</h3>
                <p className={`${colors.textSecondary} text-sm`}>
                  Nível {user.level}
                </p>
              </div>

              <div className="text-right">
                <p className="text-lime-400 font-bold">{user.points}</p>
                <p className={`${colors.textSecondary} text-xs`}>XP</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RankingScreen;
