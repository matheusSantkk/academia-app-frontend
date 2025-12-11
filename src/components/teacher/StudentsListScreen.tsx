import { useState, useEffect } from "react";
import { Search, ArrowLeft, Edit3 } from "lucide-react";
import type { StudentData } from "../../types";
import { api } from "../../api";
import { useTheme } from "../../theme/context";
import { getThemeColors } from "../../theme/colors";

interface Props {
  setActiveTab: (tab: string) => void;
  setSelectedStudentId: (id: string | null) => void;
}

export default function StudentsListScreen({
  setActiveTab,
  setSelectedStudentId,
}: Props) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [query, setQuery] = useState("");

  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  useEffect(() => {
    api.getStudents().then(setStudents);
  }, []);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div
      className={`min-h-screen ${colors.background} ${colors.text} px-4 py-6 pb-24`}
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className={`${colors.card} rounded-b-xl p-4 mb-6 shadow-lg`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("dashboard")}
              className="p-2 rounded-md"
              aria-label="Voltar"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-xl font-semibold">Meus Alunos</h1>
              <p className={`${colors.textSecondary} text-sm`}>
                {students.length} alunos cadastrados
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${colors.textSecondary}`}
              size={20}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar aluno por nome..."
              className={`w-full ${colors.input} ${colors.text} placeholder-gray-500 rounded-xl px-10 py-3 focus:outline-none`}
            />
          </div>
        </div>

        {/* Students List */}
        <div className="flex flex-col gap-3">
          {filtered.map((student) => (
            <div
              key={student.id}
              className={`${colors.card} p-4 rounded-xl shadow-md transition flex items-center justify-between`}
            >
              <div
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => {
                  setSelectedStudentId(student.id);
                  setActiveTab("student-detail");
                }}
              >
                <div
                  className={`w-12 h-12 ${colors.accent} rounded-full flex items-center justify-center shrink-0`}
                >
                  <span className={`font-semibold ${colors.textInverse}`}>
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{student.name}</h3>
                  <p className={`text-xs ${colors.textSecondary}`}>
                    {student.age ?? 0} anos •{" "}
                    {mapLevelToGoal(student.level ?? 1)}
                  </p>
                </div>
              </div>

              <div className="ml-4 shrink-0">
                <button
                  onClick={() => {
                    setSelectedStudentId(student.id);
                    setActiveTab("create-training");
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${colors.button} ${colors.text}`}
                >
                  <div className="flex items-center gap-2">
                    <Edit3 size={14} /> <span>Editar Treino</span>
                  </div>
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className={`text-center ${colors.textSecondary} mt-8 py-6`}>
              <p className="text-sm">Nenhum aluno encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function mapLevelToGoal(level: number) {
  if (level >= 8) return "Hipertrofia";
  if (level >= 5) return "Condicionamento";
  return "Emagrecimento";
}
