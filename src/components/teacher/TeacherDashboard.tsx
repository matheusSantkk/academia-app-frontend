import { useState, useEffect } from "react";
import { Users, Dumbbell, UserPlus, ClipboardList } from "lucide-react";
import type { StudentData } from "../../types";
import { api } from "../../api";
import { useTheme } from "../../theme/context";
import { getThemeColors, themeClass } from "../../theme/colors";

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

  return (
    <div
      className={`min-h-screen ${colors.background} ${colors.text} px-4 py-6 pb-24`}
    >
      <div className="max-w-md mx-auto">
        {/* Header com Perfil do Instrutor */}
        <div className={`${colors.card} rounded-xl p-4 mb-6 shadow-lg`}>
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 ${colors.accent} rounded-full flex items-center justify-center shrink-0`}
            >
              <span className={`text-xl font-bold ${colors.textInverse}`}>
                JS
              </span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Prof. João Silva</h1>
              <p className={`${colors.textSecondary} text-xs`}>
                Olá, bem-vindo!
              </p>
            </div>
          </div>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setActiveTab("students-list")}
            className={`${colors.card} p-4 rounded-xl flex flex-col gap-2 shadow-md cursor-pointer transition hover:opacity-80`}
          >
            <Users size={26} className={colors.textSecondary} />
            <span className="text-2xl font-bold">{students.length}</span>
            <span className={`text-sm ${colors.textSecondary}`}>
              Alunos ativos
            </span>
          </button>

          <div
            className={`${colors.card} p-4 rounded-xl flex flex-col gap-2 shadow-md`}
          >
            <Dumbbell size={26} className={colors.textSecondary} />
            <span className="text-2xl font-bold">
              {students.filter((s) => (s.points ?? 0) > 0).length}
            </span>
            <span className={`text-sm ${colors.textSecondary}`}>
              Treinos Criados
            </span>
          </div>
        </div>

        {/* Ações rápidas */}
        <h2 className="text-lg font-semibold mb-3">Ações Rápidas</h2>

        <div className="flex flex-col gap-4 mb-8">
          <button
            className={`${colors.card} w-full rounded-xl p-4 flex items-center gap-4 shadow-md transition`}
            onClick={() => setActiveTab("create-student")}
          >
            <div
              className={`w-10 h-10 ${colors.accent} ${colors.textInverse} rounded-xl flex items-center justify-center`}
            >
              <UserPlus size={22} />
            </div>

            <div className="flex flex-col text-left">
              <span className="font-semibold text-sm">
                Cadastrar Novo Aluno
              </span>
              <span className={`${colors.textSecondary} text-xs`}>
                Registre avaliações físicas
              </span>
            </div>
          </button>

          <button
            className={`${colors.card} w-full rounded-xl p-4 flex items-center gap-4 shadow-md transition`}
            onClick={() => setActiveTab("create-training")}
          >
            <div
              className={`w-10 h-10 ${colors.accent} ${colors.textInverse} rounded-xl flex items-center justify-center`}
            >
              <ClipboardList size={22} />
            </div>

            <div className="flex flex-col text-left">
              <span className="font-semibold text-sm">Criar Treino</span>
              <span className={`${colors.textSecondary} text-xs`}>
                Monte planos personalizados
              </span>
            </div>
          </button>
        </div>

        {/* Alunos recentes */}
        <h2 className="text-lg font-semibold mb-3">Alunos recentes</h2>

        <div className="flex flex-col gap-4">
          {students.map((student, i) => (
            <div
              key={student.id}
              className={`${colors.card} p-4 rounded-xl shadow-md cursor-pointer transition`}
              onClick={() => {
                setSelectedStudentId(student.id);
                setActiveTab("student-detail");
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${colors.cardSecondary} rounded-full flex items-center justify-center ${colors.textSecondary} font-semibold`}
                  >
                    {student.name.charAt(0)}
                  </div>

                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">
                      {student.name}
                    </span>
                    <span className={`text-xs ${colors.textSecondary}`}>
                      Treino Ativo
                    </span>
                  </div>
                </div>

                <span className={`text-xs ${colors.textSecondary}`}>
                  {new Date().toLocaleDateString("pt-BR")}
                </span>
              </div>

              {i % 2 === 0 ? (
                <button
                  className={`${colors.button} font-semibold w-full py-2 rounded-lg text-sm`}
                >
                  Criar Treino
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    className={`flex-1 border ${themeClass(
                      theme === "dark",
                      "border-lime-400 text-lime-400",
                      "border-lime-500 text-lime-600"
                    )} py-1.5 rounded-lg text-sm`}
                  >
                    Ver Avaliação
                  </button>

                  <button
                    className={`${colors.button} flex-1 py-1.5 rounded-lg text-sm`}
                  >
                    Editar Treino
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
