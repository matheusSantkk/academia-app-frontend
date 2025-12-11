import { useEffect, useState } from "react";
import {
  Search,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  User,
  Dumbbell,
  Check,
} from "lucide-react";
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

  function addWorkout() {
    const newType = String.fromCharCode(65 + training.length) as
      | "A"
      | "B"
      | "C";
    const newWorkout: Workout = {
      id: `w-${Date.now()}`,
      type: newType,
      name: `Treino ${newType}`,
      exercises: [],
    };
    setTraining([...training, newWorkout]);
  }

  function removeWorkout(wIdx: number) {
    if (confirm("Deseja remover este treino?")) {
      setTraining(training.filter((_, i) => i !== wIdx));
    }
  }

  function addExercise(wIdx: number) {
    const workCopy = [...training];
    const ex: Exercise = {
      id: `e-${Date.now()}`,
      name: "Novo Exercício",
      series: 3,
      reps: "8-12",
      weight: 0,
      rest: "60s",
      completed: false,
    };
    workCopy[wIdx].exercises = [...(workCopy[wIdx].exercises || []), ex];
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
    if (confirm("Deseja remover este exercício?")) {
      const workCopy = training.map((w) => ({
        ...w,
        exercises: [...(w.exercises || [])],
      }));
      workCopy[wIdx].exercises.splice(exIdx, 1);
      setTraining(workCopy);
    }
  }

  async function save() {
    if (!selectedStudentId) return;
    if (training.length === 0) {
      alert("Adicione pelo menos um treino");
      return;
    }
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
      <div className="max-w-2xl mx-auto">
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
              <h1 className="text-xl font-bold">
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

        {/* Student Card (when editing) */}
        {isEditMode && selectedStudent && (
          <div
            className={`${colors.card} border ${colors.border} p-5 rounded-2xl mb-6 shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 bg-gradient-to-br from-lime-400 to-lime-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md`}
                >
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-lg">
                    {selectedStudent.name}
                  </div>
                  <div className={`text-sm ${colors.textSecondary}`}>
                    {selectedStudent.age} anos • Nível{" "}
                    {selectedStudent.level ?? 1}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (setSelectedStudentId)
                    setSelectedStudentId(selectedStudent.id);
                  setActiveTab("student-detail");
                }}
                className="text-sm text-blue-400 hover:underline"
              >
                Ver Perfil
              </button>
            </div>

            {/* Training Editor */}
            <div className="mt-6 space-y-4">
              {training.length === 0 && (
                <div className={`${colors.input} rounded-xl p-6 text-center`}>
                  <Dumbbell
                    className={`w-12 h-12 ${colors.textSecondary} mx-auto mb-3`}
                  />
                  <p className={`${colors.textSecondary} text-sm`}>
                    Nenhum treino criado ainda
                  </p>
                </div>
              )}

              {training.map((w, wIdx) => (
                <div
                  key={w.id}
                  className={`${colors.card} border-2 ${colors.border} rounded-2xl p-5 shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-lime-400 rounded-lg flex items-center justify-center text-slate-900 font-bold shadow-sm">
                        {w.type}
                      </div>
                      <div>
                        <input
                          value={w.name}
                          onChange={(e) => {
                            const copy = [...training];
                            copy[wIdx].name = e.target.value;
                            setTraining(copy);
                          }}
                          className={`font-bold text-lg ${colors.input} ${colors.text} rounded-lg px-3 py-1 border ${colors.border} focus:border-lime-400 focus:outline-none`}
                        />
                        <p className={`text-xs ${colors.textSecondary} mt-1`}>
                          {w.exercises.length} exercícios
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeWorkout(wIdx)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(w.exercises || []).map((ex, exIdx) => (
                      <div
                        key={ex.id}
                        className={`${colors.input} rounded-xl p-4 border ${colors.border}`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className={`w-8 h-8 rounded-lg ${colors.card} flex items-center justify-center text-xs font-bold shrink-0`}
                          >
                            {exIdx + 1}
                          </div>
                          <input
                            value={ex.name}
                            onChange={(e) =>
                              updateExercise(wIdx, exIdx, {
                                name: e.target.value,
                              })
                            }
                            placeholder="Nome do exercício"
                            className={`flex-1 ${colors.card} ${colors.text} rounded-lg px-3 py-2 border ${colors.border} focus:border-lime-400 focus:outline-none text-sm font-medium`}
                          />
                          <button
                            onClick={() => removeExercise(wIdx, exIdx)}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <label
                              className={`text-xs ${colors.textSecondary} mb-1 block`}
                            >
                              Séries
                            </label>
                            <input
                              type="number"
                              value={String(ex.series)}
                              onChange={(e) =>
                                updateExercise(wIdx, exIdx, {
                                  series: Number(e.target.value) || 0,
                                })
                              }
                              className={`w-full ${colors.card} ${colors.text} rounded-lg px-2 py-2 text-sm text-center font-semibold border ${colors.border} focus:border-lime-400 focus:outline-none`}
                            />
                          </div>
                          <div>
                            <label
                              className={`text-xs ${colors.textSecondary} mb-1 block`}
                            >
                              Reps
                            </label>
                            <input
                              value={ex.reps}
                              onChange={(e) =>
                                updateExercise(wIdx, exIdx, {
                                  reps: e.target.value,
                                })
                              }
                              placeholder="8-12"
                              className={`w-full ${colors.card} ${colors.text} rounded-lg px-2 py-2 text-sm text-center font-semibold border ${colors.border} focus:border-lime-400 focus:outline-none`}
                            />
                          </div>
                          <div>
                            <label
                              className={`text-xs ${colors.textSecondary} mb-1 block`}
                            >
                              Peso (kg)
                            </label>
                            <input
                              type="number"
                              value={String(ex.weight)}
                              onChange={(e) =>
                                updateExercise(wIdx, exIdx, {
                                  weight: Number(e.target.value) || 0,
                                })
                              }
                              className={`w-full ${colors.card} ${colors.text} rounded-lg px-2 py-2 text-sm text-center font-semibold border ${colors.border} focus:border-lime-400 focus:outline-none`}
                            />
                          </div>
                          <div>
                            <label
                              className={`text-xs ${colors.textSecondary} mb-1 block`}
                            >
                              Descanso
                            </label>
                            <input
                              value={ex.rest}
                              onChange={(e) =>
                                updateExercise(wIdx, exIdx, {
                                  rest: e.target.value,
                                })
                              }
                              placeholder="60s"
                              className={`w-full ${colors.card} ${colors.text} rounded-lg px-2 py-2 text-sm text-center font-semibold border ${colors.border} focus:border-lime-400 focus:outline-none`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addExercise(wIdx)}
                    className={`w-full mt-3 py-3 ${colors.input} border-2 border-dashed ${colors.border} rounded-xl font-medium text-sm hover:border-lime-400 hover:bg-lime-400/5 transition flex items-center justify-center gap-2`}
                  >
                    <Plus size={18} />
                    Adicionar Exercício
                  </button>
                </div>
              ))}

              <button
                onClick={addWorkout}
                className={`w-full py-4 ${colors.input} border-2 border-dashed ${colors.border} rounded-xl font-semibold hover:border-lime-400 hover:bg-lime-400/5 transition flex items-center justify-center gap-2`}
              >
                <Plus size={20} />
                Adicionar Novo Treino
              </button>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={save}
                  disabled={saving || training.length === 0}
                  className={`flex-1 py-4 rounded-xl font-bold shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-2 ${
                    saved ? "bg-green-500 text-white" : `${colors.button}`
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : saved ? (
                    <>
                      <Check size={20} />
                      Salvo com Sucesso!
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Salvar Treino
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student List (when not editing) */}
        {!isEditMode && (
          <>
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

            <div className="flex flex-col gap-3">
              {filtered.map((student) => (
                <div
                  key={student.id}
                  className={`${colors.card} border ${colors.border} p-5 rounded-xl shadow-md transition hover:border-lime-400 cursor-pointer`}
                  onClick={() => {
                    setSelectedStudentId?.(student.id);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br from-lime-400 to-lime-500 rounded-xl flex items-center justify-center ${colors.textInverse} font-bold text-lg shadow-md`}
                    >
                      {student.name.charAt(0)}
                    </div>

                    <div className="flex-1">
                      <div className="font-bold">{student.name}</div>
                      <div className={`text-sm ${colors.textSecondary} mt-1`}>
                        {student.age} anos • Nível {student.level ?? 1} •{" "}
                        {student.points ?? 0} XP
                      </div>
                    </div>

                    <User className={`w-5 h-5 ${colors.textSecondary}`} />
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div
                  className={`${colors.card} border ${colors.border} rounded-xl p-12 text-center`}
                >
                  <User
                    className={`w-16 h-16 ${colors.textSecondary} mx-auto mb-4`}
                  />
                  <p className={`${colors.textSecondary}`}>
                    Nenhum aluno encontrado
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
