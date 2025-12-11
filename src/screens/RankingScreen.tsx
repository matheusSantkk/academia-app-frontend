import { useState, useEffect } from "react";
import { User, TrendingUp, Medal } from "lucide-react";
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
    api.getRanking(tab).then((data) => {
      setRanking(data);
      setLoading(false);
    });
  }, [tab]);

  const topThree = ranking.slice(0, 3);
  const others = ranking.slice(3);

  return (
    <div className={`min-h-screen ${colors.background} ${colors.text} pb-24`}>
      {/* Header */}
      <div className={`${colors.card} border-b ${colors.border} p-6 pb-6`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
            <Medal className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`${colors.text} text-2xl font-bold`}>Ranking</h1>
            <p className={`${colors.textSecondary} text-sm`}>
              Competição entre alunos
            </p>
          </div>
        </div>

        <div className={`flex gap-2 ${colors.input} p-1 rounded-xl`}>
          <button
            onClick={() => {
              setLoading(true);
              setTab("monthly");
            }}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              tab === "monthly"
                ? "bg-lime-400 text-slate-900 shadow-md"
                : `${colors.textSecondary}`
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp size={18} />
              <span>Mensal</span>
            </div>
          </button>
          <button
            onClick={() => {
              setLoading(true);
              setTab("total");
            }}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              tab === "total"
                ? "bg-lime-400 text-slate-900 shadow-md"
                : `${colors.textSecondary}`
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Medal size={18} />
              <span>Total</span>
            </div>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="w-8 h-8 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Top 3 */}
          {topThree.length > 0 && (
            <div
              className={`${colors.card} border ${colors.border} rounded-2xl p-6 shadow-lg`}
            >
              <h2
                className={`${colors.text} font-bold text-lg mb-4 flex items-center gap-2`}
              >
                <Medal className="w-5 h-5 text-yellow-400" />
                Top 3
              </h2>

              <div className="flex items-end justify-center gap-3 mb-6">
                {/* 2º */}
                {topThree[1] && (
                  <div className="flex flex-col items-center flex-1">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg mb-2">
                        <User className="w-8 h-8 text-slate-900" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-lg shadow-md">
                        🥈
                      </div>
                    </div>
                    <span
                      className={`${colors.text} font-semibold text-sm text-center`}
                    >
                      {topThree[1].name}
                    </span>
                    <span className="text-lime-400 font-bold text-lg">
                      {topThree[1].points}
                    </span>
                    <span className={`${colors.textSecondary} text-xs`}>
                      XP
                    </span>
                  </div>
                )}

                {/* 1º */}
                {topThree[0] && (
                  <div className="flex flex-col items-center flex-1">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-xl mb-2">
                        <User className="w-10 h-10 text-slate-900" />
                      </div>
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                        👑
                      </div>
                    </div>
                    <span
                      className={`${colors.text} font-bold text-base text-center`}
                    >
                      {topThree[0].name}
                    </span>
                    <span className="text-lime-400 font-bold text-2xl">
                      {topThree[0].points}
                    </span>
                    <span className={`${colors.textSecondary} text-xs`}>
                      XP
                    </span>
                  </div>
                )}

                {/* 3º */}
                {topThree[2] && (
                  <div className="flex flex-col items-center flex-1">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg mb-2">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-lg shadow-md">
                        🥉
                      </div>
                    </div>
                    <span
                      className={`${colors.text} font-semibold text-sm text-center`}
                    >
                      {topThree[2].name}
                    </span>
                    <span className="text-lime-400 font-bold text-lg">
                      {topThree[2].points}
                    </span>
                    <span className={`${colors.textSecondary} text-xs`}>
                      XP
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Demais */}
          {others.length > 0 && (
            <div className="space-y-2">
              <h3
                className={`${colors.textSecondary} text-sm font-semibold uppercase tracking-wider px-2`}
              >
                Demais Classificados
              </h3>

              {others.map((user) => (
                <div
                  key={user.id}
                  className={`${colors.card} border rounded-xl p-4 flex items-center gap-4 shadow-sm ${colors.border}`}
                >
                  <div
                    className={`text-xl font-bold ${colors.textSecondary} w-10 text-center`}
                  >
                    #{user.position}
                  </div>

                  <div className="w-12 h-12 bg-lime-400 rounded-full flex items-center justify-center shadow-md">
                    <User className="w-6 h-6 text-slate-900" />
                  </div>

                  <div className="flex-1">
                    <h3 className={`${colors.text} font-semibold`}>
                      {user.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`${colors.textSecondary} text-sm`}>
                        Nível {user.level}
                      </span>
                      <span className={`${colors.textSecondary} text-xs`}>
                        •
                      </span>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={12} className="text-lime-400" />
                        <span className="text-lime-400 text-xs font-medium">
                          Ativo
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lime-400 font-bold text-lg">
                      {user.points}
                    </p>
                    <p className={`${colors.textSecondary} text-xs`}>XP</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {ranking.length === 0 && (
            <div
              className={`${colors.card} border ${colors.border} rounded-xl p-8 text-center`}
            >
              <Medal
                className={`w-12 h-12 ${colors.textSecondary} mx-auto mb-3`}
              />
              <p className={`${colors.textSecondary}`}>
                Nenhum dado de ranking disponível
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RankingScreen;
