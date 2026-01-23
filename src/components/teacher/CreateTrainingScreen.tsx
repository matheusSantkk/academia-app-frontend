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
  FileText,
  Sparkles,
  X,
} from "lucide-react";
import type { StudentData, Workout, Exercise, WorkoutTemplate } from "../../types";
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
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [applyingTemplate, setApplyingTemplate] = useState(false);

  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const isMockMode = () => {
    return import.meta.env.VITE_API_MODE === "mock";
  };

  useEffect(() => {
    api.getStudents().then((list) => setStudents(list));
    if (!isMockMode()) {
      api.getWorkoutTemplates().then((list) => setTemplates(list)).catch(() => {
        // Ignorar erro se não houver templates
      });
    }
  }, []);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || null;
  const isEditMode = Boolean(selectedStudent);

  useEffect(() => {
    if (!selectedStudentId) {
      setTraining([]);
      return;
    }

    api
      .getTraining(selectedStudentId)
      .then((ws) => setTraining(ws || []))
      .catch((error) => {
        console.error("[CreateTrainingScreen] Erro ao buscar treinos:", error);
        setTraining([]);
      });
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
    patch: Partial<Exercise>,
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
      await api.saveTraining(selectedStudentId, training);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        // Recarregar os treinos após salvar
        api
          .getTraining(selectedStudentId)
          .then((ws) => setTraining(ws || []))
          .catch((error) => {
            console.error(
              "[CreateTrainingScreen] Erro ao recarregar treinos:",
              error,
            );
          });
      }, 2000);
    } catch (error) {
      console.error("[CreateTrainingScreen] Erro ao salvar treino:", error);
      alert("Erro ao salvar treino. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`min-h-screen ${colors.background} ${colors.text} overflow-y-auto`}
    >
      <div className="max-w-sm md:max-w-3xl mx-auto px-4 py-4 pb-32">
        {/* Header */}
        <div
          className={`${colors.card} rounded-2xl p-4 md:p-6 mb-6 shadow-lg border ${colors.border}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`p-2 rounded-lg hover:bg-lime-400/10 transition active:scale-95 ${colors.text}`}
              aria-label="Voltar"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold">
                {isEditMode
                  ? "Editar Plano de Treino"
                  : "Criar Plano de Treino"}
              </h1>
              <p className={`${colors.textSecondary} text-sm mt-1`}>
                {isEditMode
                  ? `Editando treino de ${selectedStudent?.name}`
                  : "Selecione um aluno para começar"}
              </p>
            </div>
          </div>
        </div>

        {/* Card do Aluno (quando editando) */}
        {isEditMode && selectedStudent && (
          <div className="space-y-6">
            <div
              className={`${colors.card} border ${colors.border} p-4 md:p-6 rounded-2xl shadow-md`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 bg-linear-to-br from-lime-400 to-lime-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-md`}
                  >
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-xl">
                      {selectedStudent.name}
                    </div>
                    <div className={`text-sm ${colors.textSecondary} mt-1`}>
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
                  className="text-sm text-blue-400 hover:underline font-medium"
                >
                  Ver Perfil
                </button>
              </div>

              {/* Templates Section */}
              {templates.length > 0 && (
                <div className={`${colors.card} border ${colors.border} p-4 md:p-6 rounded-2xl mb-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className={`w-5 h-5 ${colors.textSecondary}`} />
                      <h3 className="font-semibold text-lg">Treinos Padrões</h3>
                    </div>
                    <button
                      onClick={() => setShowCreateTemplateModal(true)}
                      className={`text-sm px-3 py-1.5 rounded-lg ${colors.input} border ${colors.border} hover:border-lime-400 transition flex items-center gap-2`}
                    >
                      <Plus size={16} />
                      Criar Template
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`${colors.input} border ${colors.border} rounded-xl p-4 hover:border-lime-400 transition ${applyingTemplate ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                        onClick={async () => {
                          if (!selectedStudentId) return;
                          if (applyingTemplate) return;
                          setApplyingTemplate(true);
                          try {
                            const ws = await api.applyWorkoutTemplate(
                              template.id,
                              selectedStudentId,
                            );
                            setTraining(ws || []);
                            alert(`Template "${template.title}" aplicado com sucesso!`);
                          } catch (error) {
                            console.error("Erro ao aplicar template:", error);
                            alert("Erro ao aplicar template. Tente novamente.");
                          } finally {
                            setApplyingTemplate(false);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">{template.title}</h4>
                          <Sparkles className={`w-4 h-4 ${colors.textSecondary} shrink-0`} />
                        </div>
                        {template.description && (
                          <p className={`text-xs ${colors.textSecondary} mb-2`}>
                            {template.description}
                          </p>
                        )}
                        <p className={`text-xs ${colors.textSecondary}`}>
                          {template.items.length} exercício{template.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Training Editor */}
              <div className="space-y-5 pb-6">
                {training.length === 0 && (
                  <div className={`${colors.input} rounded-xl p-8 text-center`}>
                    <Dumbbell
                      className={`w-14 h-14 ${colors.textSecondary} mx-auto mb-3`}
                    />
                    <p className={`${colors.textSecondary} text-sm mb-4`}>
                      Nenhum treino criado ainda. Use um template padrão ou crie um treino personalizado.
                    </p>
                    {templates.length === 0 && (
                      <button
                        onClick={() => setShowCreateTemplateModal(true)}
                        className={`px-4 py-2 rounded-lg ${colors.button} text-sm font-medium`}
                      >
                        Criar Primeiro Template
                      </button>
                    )}
                  </div>
                )}

                {training.map((w, wIdx) => (
                  <div
                    key={w.id}
                    className={`${colors.card} border-2 ${colors.border} rounded-2xl p-4 md:p-6 shadow-sm hover:border-lime-400/50 transition-colors`}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-lime-400 rounded-xl flex items-center justify-center text-slate-900 font-bold text-lg shadow-sm">
                          {w.type}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <input
                              value={w.name}
                              onChange={(e) => {
                                const copy = [...training];
                                copy[wIdx].name = e.target.value;
                                setTraining(copy);
                              }}
                              className={`font-semibold text-base md:text-lg ${colors.input} ${colors.text} rounded-lg px-3 py-2 border ${colors.border} focus:border-lime-400 focus:outline-none w-full min-w-0`}
                              placeholder="Nome do treino"
                            />
                            <button
                              onClick={() => removeWorkout(wIdx)}
                              className="flex items-center justify-center px-3 py-2 md:py-2.5 rounded-lg text-red-400 hover:bg-red-400/10 transition"
                              title="Remover treino"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                          <p
                            className={`text-xs ${colors.textSecondary} mt-1 px-3`}
                          >
                            {w.exercises.length} exercício
                            {w.exercises.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {(w.exercises || []).map((ex, exIdx) => (
                        <div
                          key={ex.id}
                          className={`${colors.input} rounded-xl p-4 border ${colors.border} hover:border-lime-400/30 transition-colors`}
                        >
                          <div className="flex items-start gap-3 mb-4">
                            <div
                              className={`w-9 h-9 rounded-lg ${colors.card} border ${colors.border} flex items-center justify-center text-sm font-bold shrink-0`}
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
                              className={`flex-1 min-w-0 ${colors.card} ${colors.text} rounded-lg px-3 py-2.5 border ${colors.border} focus:border-lime-400 focus:outline-none text-sm font-medium`}
                            />
                            <button
                              onClick={() => removeExercise(wIdx, exIdx)}
                              className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition shrink-0"
                              title="Remover exercício"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <label
                                className={`text-xs ${colors.textSecondary} mb-1.5 block font-medium`}
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
                                className={`w-full ${colors.card} ${colors.text} rounded-lg px-3 py-2.5 text-sm text-center font-semibold border ${colors.border} focus:border-lime-400 focus:outline-none`}
                                min="1"
                              />
                            </div>
                            <div>
                              <label
                                className={`text-xs ${colors.textSecondary} mb-1.5 block font-medium`}
                              >
                                Repetições
                              </label>
                              <input
                                value={ex.reps}
                                onChange={(e) =>
                                  updateExercise(wIdx, exIdx, {
                                    reps: e.target.value,
                                  })
                                }
                                placeholder="8-12"
                                className={`w-full ${colors.card} ${colors.text} rounded-lg px-3 py-2.5 text-sm text-center font-semibold border ${colors.border} focus:border-lime-400 focus:outline-none`}
                              />
                            </div>
                            <div>
                              <label
                                className={`text-xs ${colors.textSecondary} mb-1.5 block font-medium`}
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
                                className={`w-full ${colors.card} ${colors.text} rounded-lg px-3 py-2.5 text-sm text-center font-semibold border ${colors.border} focus:border-lime-400 focus:outline-none`}
                                min="0"
                                step="2.5"
                              />
                            </div>
                            <div>
                              <label
                                className={`text-xs ${colors.textSecondary} mb-1.5 block font-medium`}
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
                                className={`w-full ${colors.card} ${colors.text} rounded-lg px-3 py-2.5 text-sm text-center font-semibold border ${colors.border} focus:border-lime-400 focus:outline-none`}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => addExercise(wIdx)}
                      className={`w-full mt-4 py-2.5 md:py-3 ${colors.input} border-2 border-dashed ${colors.border} rounded-xl font-medium text-sm hover:border-lime-400 hover:bg-lime-400/5 transition flex items-center justify-center gap-2 active:scale-[0.98]`}
                    >
                      <Plus size={18} />
                      Adicionar Exercício
                    </button>
                  </div>
                ))}

                <button
                  onClick={addWorkout}
                  className={`w-full py-3 md:py-4 ${colors.input} border-2 border-dashed ${colors.border} rounded-xl font-semibold hover:border-lime-400 hover:bg-lime-400/5 transition flex items-center justify-center gap-2 active:scale-[0.98]`}
                >
                  <Plus size={20} />
                  Adicionar Novo Treino
                </button>

                <div className="flex items-center gap-3 sticky bottom-0 bg-linear-to-t from-[#0B1D33] via-[#0B1D33] to-transparent pt-6 pb-4 -mx-4 px-4">
                  <button
                    onClick={save}
                    disabled={saving || training.length === 0}
                    className={`flex-1 py-4 md:py-5 rounded-2xl text-sm md:text-base font-bold shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-3 ${
                      saved
                        ? "bg-green-500 text-white"
                        : training.length === 0
                          ? `${colors.input} ${colors.textSecondary} cursor-not-allowed`
                          : `${colors.button}`
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
          </div>
        )}

        {/* Lista de estudantes (quando não está editando) */}
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
                  className={`${colors.card} border ${colors.border} p-5 rounded-xl shadow-md transition hover:border-lime-400 cursor-pointer active:scale-[0.98]`}
                  onClick={() => {
                    setSelectedStudentId?.(student.id);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 bg-linear-to-br from-lime-400 to-lime-500 rounded-xl flex items-center justify-center ${colors.textInverse} font-bold text-lg shadow-md`}
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

        {/* Modal para criar template */}
        {showCreateTemplateModal && (
          <CreateTemplateModal
            onClose={() => setShowCreateTemplateModal(false)}
            onSave={async (template) => {
              try {
                const newTemplate = await api.createWorkoutTemplate(template);
                setTemplates([...templates, newTemplate]);
                setShowCreateTemplateModal(false);
                alert("Template criado com sucesso!");
              } catch (error) {
                console.error("Erro ao criar template:", error);
                alert("Erro ao criar template. Tente novamente.");
              }
            }}
            colors={colors}
          />
        )}
      </div>
    </div>
  );
}

// Modal para criar template
function CreateTemplateModal({
  onClose,
  onSave,
  colors,
}: {
  onClose: () => void;
  onSave: (template: {
    title: string;
    description?: string;
    items: Array<{
      exerciseName: string;
      sets: number;
      reps: string;
      weight?: number;
      rest?: string;
      observations?: string;
    }>;
  }) => void;
  colors: ReturnType<typeof getThemeColors>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<Array<{
    exerciseName: string;
    sets: number;
    reps: string;
    weight?: number;
    rest?: string;
    observations?: string;
  }>>([]);

  function addItem() {
    setItems([
      ...items,
      {
        exerciseName: "",
        sets: 3,
        reps: "8-12",
        weight: 0,
        rest: "60s",
      },
    ]);
  }

  function updateItem(
    index: number,
    patch: Partial<{
      exerciseName: string;
      sets: number;
      reps: string;
      weight?: number;
      rest?: string;
      observations?: string;
    }>,
  ) {
    const copy = [...items];
    copy[index] = { ...copy[index], ...patch };
    setItems(copy);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (!title.trim()) {
      alert("Digite um título para o template");
      return;
    }
    if (items.length === 0) {
      alert("Adicione pelo menos um exercício");
      return;
    }
    if (items.some((item) => !item.exerciseName.trim())) {
      alert("Preencha o nome de todos os exercícios");
      return;
    }
    onSave({ title, description: description || undefined, items });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`${colors.card} rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border ${colors.border}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Criar Template de Treino</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-red-400/10 text-red-400 transition`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`text-sm font-medium ${colors.textSecondary} mb-2 block`}>
              Título do Template *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Treino A - Hipertrofia"
              className={`w-full ${colors.input} ${colors.text} rounded-lg px-4 py-2.5 border ${colors.border} focus:border-lime-400 focus:outline-none`}
            />
          </div>

          <div>
            <label className={`text-sm font-medium ${colors.textSecondary} mb-2 block`}>
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do template..."
              rows={3}
              className={`w-full ${colors.input} ${colors.text} rounded-lg px-4 py-2.5 border ${colors.border} focus:border-lime-400 focus:outline-none resize-none`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={`text-sm font-medium ${colors.textSecondary}`}>
                Exercícios *
              </label>
              <button
                onClick={addItem}
                className={`px-3 py-1.5 rounded-lg ${colors.input} border ${colors.border} hover:border-lime-400 transition flex items-center gap-2 text-sm`}
              >
                <Plus size={16} />
                Adicionar Exercício
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className={`${colors.input} border ${colors.border} rounded-xl p-4`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-8 h-8 rounded-lg ${colors.card} border ${colors.border} flex items-center justify-center text-sm font-bold shrink-0`}
                    >
                      {index + 1}
                    </div>
                    <input
                      value={item.exerciseName}
                      onChange={(e) =>
                        updateItem(index, { exerciseName: e.target.value })
                      }
                      placeholder="Nome do exercício"
                      className={`flex-1 min-w-0 ${colors.card} ${colors.text} rounded-lg px-3 py-2 border ${colors.border} focus:border-lime-400 focus:outline-none text-sm`}
                    />
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className={`text-xs ${colors.textSecondary} mb-1.5 block`}>
                        Séries
                      </label>
                      <input
                        type="number"
                        value={item.sets}
                        onChange={(e) =>
                          updateItem(index, { sets: Number(e.target.value) || 0 })
                        }
                        className={`w-full ${colors.card} ${colors.text} rounded-lg px-3 py-2 text-sm text-center border ${colors.border} focus:border-lime-400 focus:outline-none`}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className={`text-xs ${colors.textSecondary} mb-1.5 block`}>
                        Repetições
                      </label>
                      <input
                        value={item.reps}
                        onChange={(e) => updateItem(index, { reps: e.target.value })}
                        placeholder="8-12"
                        className={`w-full ${colors.card} ${colors.text} rounded-lg px-3 py-2 text-sm text-center border ${colors.border} focus:border-lime-400 focus:outline-none`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs ${colors.textSecondary} mb-1.5 block`}>
                        Peso (kg)
                      </label>
                      <input
                        type="number"
                        value={item.weight || 0}
                        onChange={(e) =>
                          updateItem(index, { weight: Number(e.target.value) || 0 })
                        }
                        className={`w-full ${colors.card} ${colors.text} rounded-lg px-3 py-2 text-sm text-center border ${colors.border} focus:border-lime-400 focus:outline-none`}
                        min="0"
                        step="2.5"
                      />
                    </div>
                    <div>
                      <label className={`text-xs ${colors.textSecondary} mb-1.5 block`}>
                        Descanso
                      </label>
                      <input
                        value={item.rest || "60s"}
                        onChange={(e) => updateItem(index, { rest: e.target.value })}
                        placeholder="60s"
                        className={`w-full ${colors.card} ${colors.text} rounded-lg px-3 py-2 text-sm text-center border ${colors.border} focus:border-lime-400 focus:outline-none`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl ${colors.input} border ${colors.border} font-medium transition hover:border-red-400`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 py-3 rounded-xl ${colors.button} font-medium transition`}
          >
            Salvar Template
          </button>
        </div>
      </div>
    </div>
  );
}
