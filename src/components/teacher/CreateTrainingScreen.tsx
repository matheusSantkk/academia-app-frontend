import { useEffect, useState } from "react";
import { Search, ArrowLeft } from "lucide-react";
import type { StudentData, Workout, Exercise } from "../../types";
import { api } from "../../api";
import { useTheme } from "../../theme/context";
import { getThemeColors } from "../../theme/colors";

interface Props {
  setActiveTab: (tab: string) => void;
  selectedStudentId?: string | null;
  setSelectedStudentId?: (id: string | null) => void;
}

export default function CreateTrainingScreen({
  setActiveTab,
  selectedStudentId,
  setSelectedStudentId,
}: Props) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [query, setQuery] = useState("");
  const [training, setTraining] = useState<Workout[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  useEffect(() => {
    api.getStudents().then((list) => setStudents(list));
  }, []);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || null;
  const isEditMode = Boolean(selectedStudent);

  useEffect(() => {
    if (!selectedStudentId) {
      setTraining([]);
      return;
    }

    (
      api as unknown as {
        getTraining: (studentId: string) => Promise<Workout[]>;
      }
    )
      .getTraining(selectedStudentId)
      .then((ws) => setTraining(ws || []));
  }, [selectedStudentId]);

  function addExercise() {
    if (!selectedStudentId) return;
    const workCopy = [...training];
    if (workCopy.length === 0) {
      workCopy.push({
        id: `w-${Date.now()}`,
        type: "A",
        name: "Treino A",
        exercises: [],
      });
    }
    const ex: Exercise = {
      id: `e-${Date.now()}`,
      name: "Novo Exercício",
      series: 3,
      reps: "8-12",
      weight: 0,
      rest: "60s",
      completed: false,
    };
    workCopy[0].exercises = [...(workCopy[0].exercises || []), ex];
    setTraining(workCopy);
  }

  function updateExercise(
    wIdx: number,
    exIdx: number,
    patch: Partial<Exercise>
  ) {
    const workCopy = training.map((w) => ({
      ...w,
      exercises: [...(w.exercises || [])],
    }));
    const ex = workCopy[wIdx].exercises[exIdx];
    workCopy[wIdx].exercises[exIdx] = { ...ex, ...patch };
    setTraining(workCopy);
  }

  function removeExercise(wIdx: number, exIdx: number) {
    const workCopy = training.map((w) => ({
      ...w,
      exercises: [...(w.exercises || [])],
    }));
    workCopy[wIdx].exercises.splice(exIdx, 1);
    setTraining(workCopy);
  }

  async function save() {
    if (!selectedStudentId) return;
    setSaving(true);
    try {
      await (
        api as unknown as {
          saveTraining: (
            studentId: string,
            workouts: Workout[]
          ) => Promise<Workout[]>;
        }
      ).saveTraining(selectedStudentId, training);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`min-h-screen ${colors.background} ${colors.text} px-4 py-6 pb-24`}
    >
      <div className="max-w-md mx-auto">
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
              <h1 className="text-xl font-semibold">
                {isEditMode
                  ? "Editar Plano de Treino"
                  : "Criar Plano de Treino"}
              </h1>
              <p className={`${colors.textSecondary} text-sm`}>
                {isEditMode
                  ? `Editando treino de ${selectedStudent?.name}`
                  : "Selecione um aluno para começar"}
              </p>
            </div>
          </div>
        </div>

        {isEditMode && selectedStudent && (
          <div className={`${colors.card} p-4 rounded-xl mb-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 ${colors.cardSecondary} rounded-full flex items-center justify-center ${colors.textSecondary} font-semibold text-lg`}
                >
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold">{selectedStudent.name}</div>
                  <div className={`text-xs ${colors.textSecondary}`}>
                    {selectedStudent.age} anos •{" "}
                    {mapLevelToGoal(selectedStudent.level ?? 1)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Ir para detalhes do aluno
                    if (setSelectedStudentId)
                      setSelectedStudentId(selectedStudent.id);
                    setActiveTab("student-detail");
                  }}
                  className="text-sm text-sky-400"
                >
                  Ver detalhes
                </button>
              </div>
            </div>
            {/* Treino atual (edição simples) */}
            <div className="mt-4">
              {training.length === 0 && (
                <div className={`text-sm ${colors.textSecondary} mb-3`}>
                  Nenhum treino salvo para este aluno.
                </div>
              )}

              {training.map((w, wIdx) => (
                <div key={w.id} className="mb-3">
                  <div className="font-semibold mb-2">{w.name}</div>
                  <div className="space-y-2">
                    {(w.exercises || []).map((ex, exIdx) => (
                      <div
                        key={ex.id}
                        className={`${colors.card} p-3 rounded-md flex items-start gap-3`}
                      >
                        <div className="flex-1">
                          <input
                            value={ex.name}
                            onChange={(e) =>
                              updateExercise(wIdx, exIdx, {
                                name: e.target.value,
                              })
                            }
                            className={`w-full ${colors.input} ${colors.text} rounded-md px-2 py-1 mb-2`}
                          />
                          <div className="flex gap-2">
                            <input
                              value={String(ex.series)}
                              onChange={(e) =>
                                updateExercise(wIdx, exIdx, {
                                  series: Number(e.target.value) || 0,
                                })
                              }
                              className={`w-20 ${colors.input} ${colors.text} rounded-md px-2 py-1`}
                            />
                            <input
                              value={ex.reps}
                              onChange={(e) =>
                                updateExercise(wIdx, exIdx, {
                                  reps: e.target.value,
                                })
                              }
                              className={`w-24 ${colors.input} ${colors.text} rounded-md px-2 py-1`}
                            />
                            <input
                              value={String(ex.weight)}
                              onChange={(e) =>
                                updateExercise(wIdx, exIdx, {
                                  weight: Number(e.target.value) || 0,
                                })
                              }
                              className={`w-24 ${colors.input} ${colors.text} rounded-md px-2 py-1`}
                            />
                          </div>
                        </div>
                        <div className="shrink-0">
                          <button
                            onClick={() => removeExercise(wIdx, exIdx)}
                            className="text-sm text-red-400"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={addExercise}
                  className={`px-3 py-2 rounded-md ${colors.button} ${colors.text}`}
                >
                  + Adicionar Exercício
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className={`px-3 py-2 rounded-md bg-green-500 text-white`}
                >
                  {saving ? "Salvando..." : "Salvar Treino"}
                </button>
                {saved && (
                  <span className={`text-sm ${colors.textSecondary}`}>
                    Salvo!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar aluno por nome..."
              className={`w-full ${colors.input} ${colors.text} placeholder-gray-500 rounded-xl px-10 py-3 focus:outline-none`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {filtered.map((student) => (
            <div
              key={student.id}
              className={`${colors.card} p-4 rounded-xl shadow-md cursor-pointer transition`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 ${colors.cardSecondary} rounded-full flex items-center justify-center ${colors.textSecondary} font-semibold text-lg`}
                >
                  {student.name.charAt(0)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      {student.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {student.age} anos
                      </span>
                      <button
                        onClick={() => {
                          setSelectedStudentId?.(student.id);
                          setActiveTab("create-training");
                        }}
                        className="ml-2 text-sm px-3 py-1 rounded-lg bg-sky-500 text-white"
                      >
                        Editar treino
                      </button>
                    </div>
                  </div>

                  <div className={`text-xs ${colors.textSecondary} mt-1`}>
                    {student.level
                      ? mapLevelToGoal(student.level)
                      : "Objetivo não definido"}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className={`text-center ${colors.textSecondary} mt-6`}>
              Nenhum aluno encontrado
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
