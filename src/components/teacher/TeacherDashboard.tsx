import { useState, useEffect } from "react";
import {
  Users,
  Dumbbell,
  UserPlus,
  ClipboardList,
  TrendingUp,
  Award,
  Calendar,
  Activity,
} from "lucide-react";
import type { StudentData } from "../../types";
import { api } from "../../api";
import { useTheme } from "../../theme/context";
import { getThemeColors } from "../../theme/colors";

interface TeacherDashboardProps {
  setActiveTab: (tab: string) => void;
  setSelectedStudentId: (id: string | null) => void;
}

export default function TeacherDashboard({
  setActiveTab,
  setSelectedStudentId,
}: TeacherDashboardProps) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  useEffect(() => {
    api.getStudents().then(setStudents);
  }, []);

  // Estatísticas calculadas
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => (s.points ?? 0) > 0).length;
  const totalWorkouts = students.reduce((acc, s) => {
    return acc + (s.points ? Math.floor(s.points / 10) : 0);
  }, 0);
  const avgLevel =
    totalStudents > 0
      ? (
          students.reduce((acc, s) => acc + (s.level ?? 0), 0) / totalStudents
        ).toFixed(1)
      : "0";

  // Alunos mais ativos (top 5 por pontos)
  const topStudents = [...students]
    .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
    .slice(0, 5);

  // Alunos recentes (últimos 3)
  const recentStudents = students.slice(-3).reverse();

  return (
    <div
      className={`min-h-screen ${colors.background} ${colors.text} px-4 py-6 pb-24`}
    >
      <div className="max-w-md mx-auto">
        {/* Header com Perfil do Instrutor */}
        <div
          className={`${colors.card} rounded-2xl p-5 mb-6 shadow-lg border ${colors.border}`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-16 h-16 bg-linear-to-br from-lime-400 to-lime-500 rounded-full flex items-center justify-center shrink-0 shadow-md`}
            >
              <span className="text-2xl font-bold text-slate-900">JS</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Prof. João Silva</h1>
              <p className={`${colors.textSecondary} text-sm`}>
                Instrutor de Musculação
              </p>
            </div>
          </div>

          <div
            className={`${colors.input} rounded-xl p-3 flex items-center justify-between`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-lime-400" />
              <span className={`${colors.textSecondary} text-sm`}>Hoje</span>
            </div>
            <span className="text-lime-400 font-semibold text-sm">
              {new Date().toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
              })}
            </span>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="mb-6">
          <h2
            className={`${colors.textSecondary} text-xs font-semibold uppercase tracking-wider mb-3 px-1`}
          >
            Estatísticas Gerais
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab("students-list")}
              className={`${colors.card} border ${colors.border} p-4 rounded-2xl flex flex-col gap-2 items-start shadow-md cursor-pointer transition hover:border-lime-400 active:scale-[0.98]`}
            >
              <Users size={24} className="text-lime-400" />
              <span className="text-3xl font-bold">{totalStudents}</span>
              <span className={`text-sm ${colors.textSecondary}`}>
                Total de Alunos
              </span>
            </button>

            <div
              className={`${colors.card} border ${colors.border} p-4 rounded-2xl flex flex-col gap-2 items-start shadow-md`}
            >
              <Activity size={24} className="text-blue-400" />
              <span className="text-3xl font-bold">{activeStudents}</span>
              <span className={`text-sm ${colors.textSecondary}`}>
                Alunos Ativos
              </span>
            </div>

            <div
              className={`${colors.card} border ${colors.border} p-4 rounded-2xl flex flex-col gap-2 items-start shadow-md`}
            >
              <Dumbbell size={24} className="text-purple-400" />
              <span className="text-3xl font-bold">{totalWorkouts}</span>
              <span className={`text-sm ${colors.textSecondary}`}>
                Treinos Criados
              </span>
            </div>

            <div
              className={`${colors.card} border ${colors.border} p-4 rounded-2xl flex flex-col gap-2 items-start shadow-md`}
            >
              <TrendingUp size={24} className="text-orange-400" />
              <span className="text-3xl font-bold">{avgLevel}</span>
              <span className={`text-sm ${colors.textSecondary}`}>
                Nível Médio
              </span>
            </div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="mb-6">
          <h2
            className={`${colors.textSecondary} text-xs font-semibold uppercase tracking-wider mb-3 px-1`}
          >
            Ações Rápidas
          </h2>
          <div className="flex flex-col gap-3">
            <button
              className={`${colors.card} border ${colors.border} w-full rounded-2xl p-4 flex items-center gap-4 shadow-md transition hover:border-lime-400 active:scale-[0.98]`}
              onClick={() => setActiveTab("create-student")}
            >
              <div className="w-12 h-12 bg-lime-400/20 rounded-xl flex items-center justify-center">
                <UserPlus size={24} className="text-lime-400" />
              </div>

              <div className="flex flex-col text-left flex-1">
                <span className="font-semibold">Cadastrar Novo Aluno</span>
                <span className={`${colors.textSecondary} text-sm`}>
                  Registre avaliações físicas
                </span>
              </div>
            </button>

            <button
              className={`${colors.card} border ${colors.border} w-full rounded-2xl p-4 flex items-center gap-4 shadow-md transition hover:border-lime-400 active:scale-[0.98]`}
              onClick={() => setActiveTab("create-training")}
            >
              <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center">
                <ClipboardList size={24} className="text-blue-400" />
              </div>

              <div className="flex flex-col text-left flex-1">
                <span className="font-semibold">Templates de Treino</span>
                <span className={`${colors.textSecondary} text-sm`}>
                  Gerencie templates reutilizáveis
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Alunos Destaques */}
        {topStudents.length > 0 && (
          <div className="mb-6">
            <h2
              className={`${colors.textSecondary} text-xs font-semibold uppercase tracking-wider mb-3 px-1`}
            >
              🏆 Alunos Destaques
            </h2>
            <div className="space-y-2">
              {topStudents.map((student, idx) => (
                <div
                  key={student.id}
                  className={`${colors.card} border ${
                    idx === 0 ? "border-yellow-400" : colors.border
                  } p-4 rounded-xl shadow-md cursor-pointer transition hover:border-lime-400 active:scale-[0.98]`}
                  onClick={() => {
                    setSelectedStudentId(student.id);
                    setActiveTab("student-detail");
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className={`w-12 h-12 ${
                          idx === 0
                            ? "bg-linear-to-br from-yellow-400 to-yellow-500"
                            : "bg-lime-400"
                        } rounded-full flex items-center justify-center font-bold text-slate-900 shadow-md`}
                      >
                        {student.name.charAt(0)}
                      </div>
                      {idx === 0 && (
                        <div className="absolute -top-1 -right-1 text-lg">
                          👑
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{student.name}</span>
                        {idx < 3 && (
                          <span className="text-xs">
                            {["🥇", "🥈", "🥉"][idx]}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm ${colors.textSecondary}`}>
                          Nível {student.level ?? 1}
                        </span>
                        <span className={`text-xs ${colors.textSecondary}`}>
                          •
                        </span>
                        <span className="text-lime-400 text-sm font-semibold">
                          {student.points ?? 0} XP
                        </span>
                      </div>
                    </div>

                    <Award
                      className={`w-5 h-5 ${
                        idx === 0 ? "text-yellow-400" : "text-lime-400"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alunos recentes */}
        {recentStudents.length > 0 && (
          <div>
            <h2
              className={`${colors.textSecondary} text-xs font-semibold uppercase tracking-wider mb-3 px-1`}
            >
              Alunos Recentes
            </h2>
            <div className="flex flex-col gap-3">
              {recentStudents.map((student) => (
                <div
                  key={student.id}
                  className={`${colors.card} border ${colors.border} p-4 rounded-xl shadow-md cursor-pointer transition hover:border-lime-400 active:scale-[0.98]`}
                  onClick={() => {
                    setSelectedStudentId(student.id);
                    setActiveTab("student-detail");
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 ${colors.cardSecondary} rounded-full flex items-center justify-center ${colors.textSecondary} font-semibold text-lg shadow-sm`}
                      >
                        {student.name.charAt(0)}
                      </div>

                      <div className="flex flex-col">
                        <span className="font-semibold">{student.name}</span>
                        <span className={`text-sm ${colors.textSecondary}`}>
                          {student.age} anos • Nível {student.level ?? 1}
                        </span>
                      </div>
                    </div>

                    <span className={`text-xs ${colors.textSecondary}`}>
                      Novo
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStudentId(student.id);
                        setActiveTab("student-detail");
                      }}
                      className={`flex-1 border-2 ${colors.border} hover:border-lime-400 py-2 rounded-lg text-sm font-medium transition`}
                    >
                      Ver Perfil
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStudentId(student.id);
                        setActiveTab("edit-training");
                      }}
                      className={`${colors.button} flex-1 py-2 rounded-lg text-sm font-medium shadow-sm transition active:scale-[0.98]`}
                    >
                      Criar Treino
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {students.length === 0 && (
          <div
            className={`${colors.card} border ${colors.border} rounded-2xl p-8 text-center mt-6`}
          >
            <Users
              className={`w-16 h-16 ${colors.textSecondary} mx-auto mb-4`}
            />
            <h3 className={`${colors.text} font-semibold mb-2`}>
              Nenhum aluno cadastrado
            </h3>
            <p className={`${colors.textSecondary} text-sm mb-4`}>
              Comece cadastrando seu primeiro aluno
            </p>
            <button
              onClick={() => setActiveTab("create-student")}
              className={`${colors.button} px-6 py-3 rounded-xl font-semibold shadow-md transition active:scale-[0.98]`}
            >
              Cadastrar Aluno
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
