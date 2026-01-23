import { useState, useEffect } from "react";
import {
  Search,
  ArrowLeft,
  Edit3,
  User,
  TrendingUp,
  Award,
  Eye,
} from "lucide-react";
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
  const [loading, setLoading] = useState(true);

  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  useEffect(() => {
    api
      .getStudents()
      .then((list) => {
        setStudents(list);
        setLoading(false);
      })
      .catch((error) => {
        console.error("[StudentsListScreen] Erro ao buscar alunos:", error);
        setStudents([]);
        setLoading(false);
      });
  }, []);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const activeStudents = students.filter((s) => (s.points ?? 0) > 0).length;

  return (
    <div
      className={`min-h-screen ${colors.background} ${colors.text} px-4 py-6 pb-24`}
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div
          className={`${colors.card} rounded-b-2xl p-5 mb-6 shadow-lg border ${colors.border}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setActiveTab("dashboard")}
              className="p-2 rounded-lg hover:bg-lime-400/10 transition active:scale-95"
              aria-label="Voltar"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex-1">
              <h1 className="text-xl font-bold">Meus Alunos</h1>
              <p className={`${colors.textSecondary} text-sm`}>
                {students.length} alunos cadastrados
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`${colors.input} rounded-xl p-3 text-center`}>
              <User
                className={`w-5 h-5 ${colors.textSecondary} mx-auto mb-1`}
              />
              <div className="text-lime-400 font-bold text-2xl">
                {students.length}
              </div>
              <div className={`text-xs ${colors.textSecondary}`}>Total</div>
            </div>
            <div className={`${colors.input} rounded-xl p-3 text-center`}>
              <TrendingUp
                className={`w-5 h-5 ${colors.textSecondary} mx-auto mb-1`}
              />
              <div className="text-blue-400 font-bold text-2xl">
                {activeStudents}
              </div>
              <div className={`text-xs ${colors.textSecondary}`}>Ativos</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${colors.textSecondary}`}
              size={20}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar aluno por nome..."
              className={`w-full ${colors.input} ${colors.text} placeholder-gray-500 rounded-xl pl-12 pr-4 py-4 focus:outline-none border ${colors.border} focus:border-lime-400 transition`}
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center p-12">
            <div className="w-8 h-8 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Students List */}
        {!loading && (
          <div className="flex flex-col gap-3">
            {filtered.map((student) => (
              <div
                key={student.id}
                className={`${colors.card} border ${colors.border} p-5 rounded-xl shadow-md transition hover:border-lime-400`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-14 h-14 bg-linear-to-br from-lime-400 to-lime-500 rounded-xl flex items-center justify-center shrink-0 shadow-md relative`}
                  >
                    <span className="font-bold text-slate-900 text-lg">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                    {(student.points ?? 0) > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Award className="w-3 h-3 text-slate-900" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-base">{student.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-sm ${colors.textSecondary}`}>
                        {student.age ?? 0} anos
                      </span>
                      <span className={`text-xs ${colors.textSecondary}`}>
                        •
                      </span>
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
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedStudentId(student.id);
                      setActiveTab("student-detail");
                    }}
                    className={`flex-1 ${colors.input} border ${colors.border} hover:border-lime-400 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 active:scale-95`}
                  >
                    <Eye size={16} />
                    Ver Perfil
                  </button>

                  <button
                    onClick={() => {
                      setSelectedStudentId(student.id);
                      setActiveTab("edit-training");
                    }}
                    className={`${colors.button} flex-1 py-2.5 rounded-lg text-sm font-medium shadow-sm transition flex items-center justify-center gap-2 active:scale-95`}
                  >
                    <Edit3 size={16} />
                    Editar Treino
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && !loading && (
              <div
                className={`${colors.card} border ${colors.border} rounded-xl p-12 text-center`}
              >
                <User
                  className={`w-16 h-16 ${colors.textSecondary} mx-auto mb-4`}
                />
                <h3 className={`${colors.text} font-semibold text-lg mb-2`}>
                  Nenhum aluno encontrado
                </h3>
                <p className={`${colors.textSecondary} text-sm`}>
                  {query
                    ? "Tente outra pesquisa"
                    : "Comece cadastrando seu primeiro aluno"}
                </p>
                {!query && (
                  <button
                    onClick={() => setActiveTab("create-student")}
                    className={`${colors.button} px-6 py-3 rounded-xl font-semibold shadow-md transition active:scale-[0.98] mt-4`}
                  >
                    Cadastrar Aluno
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
