import { useEffect, useState, useCallback } from "react";
import {
  Search,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  User,
  Dumbbell,
  Check,
  Edit2,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { StudentData, Workout, Exercise } from "../../types";
import { api } from "../../api";
import { useTheme } from "../../theme/context";
import { getThemeColors } from "../../theme/colors";

// Definindo o tipo de Props (mantido)
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
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(
    new Set()
  );
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);

  // ESTADOS NOVOS PARA O TOAST/POPOUT
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"error" | "info" | "success">(
    "info"
  );
  const [toastVisible, setToastVisible] = useState(false);

  // ESTADOS NOVOS PARA O MODAL DE CONFIRMAÇÃO
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  // FUNÇÃO PARA MOSTRAR O TOAST
  const showToast = useCallback(
    (message: string, type: "error" | "info" | "success" = "info") => {
      if (toastVisible) return;
      setToastMessage(message);
      setToastType(type);
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
      }, 3500);
    },
    [toastVisible]
  );

  // LÓGICA DO MODAL DE CONFIRMAÇÃO
  const openConfirmModal = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setIsConfirmModalOpen(true);
  };

  const handleConfirm = () => {
    confirmAction();
    setIsConfirmModalOpen(false);
    setConfirmAction(() => {});
  };

  const handleCancel = () => {
    setIsConfirmModalOpen(false);
    setConfirmAction(() => {});
  };

  // EFEITOS E LÓGICA DE DADOS (MANTIDOS)
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
      .then((ws) => {
        setTraining(ws || []);
        setExpandedWorkouts(new Set(ws.map((w) => w.id)));
      });
  }, [selectedStudentId]);

  function toggleWorkout(workoutId: string) {
    setExpandedWorkouts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(workoutId)) {
        newSet.delete(workoutId);
      } else {
        newSet.add(workoutId);
      }
      return newSet;
    });
  }

  function updateWorkoutName(wIdx: number, newName: string) {
    const workCopy = [...training];
    workCopy[wIdx].name = newName;
    setTraining(workCopy);
  }

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
    toggleWorkout(newWorkout.id);
    setEditingWorkoutId(newWorkout.id);
  }

  // REFACTOR: Usando o Modal de Confirmação
  const executeRemoveWorkout = (wIdx: number) => {
    const removed = training[wIdx];
    setTraining(training.filter((_, i) => i !== wIdx));
    setExpandedWorkouts((prev) => {
      const newSet = new Set(prev);
      newSet.delete(removed.id);
      return newSet;
    });
    showToast(`Treino ${removed.type} removido.`, "info");
  };

  function removeWorkout(wIdx: number) {
    openConfirmModal(
      `Tem certeza que deseja remover o treino "${training[wIdx].name}"? Esta ação é irreversível.`,
      () => executeRemoveWorkout(wIdx)
    );
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

  // REFACTOR: Usando o Modal de Confirmação
  const executeRemoveExercise = (wIdx: number, exIdx: number) => {
    const workCopy = training.map((w) => ({
      ...w,
      exercises: [...(w.exercises || [])],
    }));
    const removedName = workCopy[wIdx].exercises[exIdx].name;
    workCopy[wIdx].exercises.splice(exIdx, 1);
    setTraining(workCopy);
    showToast(`Exercício "${removedName}" removido.`, "info");
  };

  function removeExercise(wIdx: number, exIdx: number) {
    const exName = training[wIdx].exercises[exIdx].name;
    openConfirmModal(
      `Tem certeza que deseja remover o exercício "${exName}"?`,
      () => executeRemoveExercise(wIdx, exIdx)
    );
  }

  async function save() {
    if (!selectedStudentId) return;

    // Treino Vazio
    if (training.length === 0) {
      showToast("Adicione pelo menos um treino.", "info");
      return;
    }

    // Exercício Vazio
    const hasEmptyExercises = training.some((w) =>
      w.exercises.some((e) => !e.name.trim() || e.name === "Novo Exercício")
    );

    if (hasEmptyExercises) {
      showToast(
        "Preencha o nome de todos os exercícios antes de salvar.",
        "error"
      );
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
      showToast("Plano de Treino salvo com sucesso!", "success");
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      showToast("Erro ao salvar o treino. Tente novamente.", "error");
    } finally {
      setSaving(false);
    }
  }

  // --- Componentes de Feedback (Modal e Toast) ---

  const ToastComponent = () => {
    if (!toastVisible) return null;

    let toastClasses = "";
    let Icon = AlertCircle;

    switch (toastType) {
      case "error":
        toastClasses = "bg-red-500 text-white shadow-lg";
        Icon = X;
        break;
      case "success":
        toastClasses = "bg-green-500 text-white shadow-lg";
        Icon = Check;
        break;
      case "info":
      default:
        toastClasses = "bg-blue-500 text-white shadow-lg";
        Icon = AlertCircle;
        break;
    }

    return (
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 max-w-sm w-[90%] z-50 p-4 rounded-xl flex items-center gap-3 transition-all duration-300 ${toastClasses} ${
          toastVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full"
        }`}
        role="alert"
      >
        <Icon size={20} className="shrink-0" />
        <span className="text-sm font-medium flex-1">{toastMessage}</span>
      </div>
    );
  };

  const ConfirmationModal = () => {
    if (!isConfirmModalOpen) return null;

    return (
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/10 backdrop-blur-lg p-4"
        aria-modal="true"
        role="dialog"
      >
        <div
          className={`${colors.card} rounded-xl shadow-2xl p-6 w-full max-w-sm border ${colors.border} transform transition-all scale-100 opacity-100`}
        >
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-6 h-6 text-red-500 shrink-0" />

            {/* AJUSTE: Título com cor de texto do tema */}
            <h3 className={`text-lg font-bold ${colors.text}`}>
              Confirmação de Exclusão
            </h3>
          </div>

          {/* AJUSTE: Mensagem com cor de texto secundária do tema */}
          <p className={`${colors.textSecondary} mb-6 text-sm`}>
            {confirmMessage}
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              // AJUSTE: Botão 'Cancelar' com cor de texto do tema
              className={`py-2 px-4 rounded-lg font-semibold ${colors.input} border ${colors.border} hover:bg-opacity-80 transition ${colors.text}`}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="py-2 px-4 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition active:scale-95 shadow-md"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. Componentes de Feedback */}
      <ToastComponent />
      <ConfirmationModal />

      {/* 2. Conteúdo da tela */}
      <div
        className={`min-h-screen ${colors.background} ${colors.text} px-4 py-6 pb-28 transition-colors duration-300`}
      >
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div
            className={`${colors.card} rounded-2xl p-5 mb-6 shadow-xl border ${colors.border}`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("dashboard")}
                className="p-2 rounded-lg hover:bg-lime-400/10 transition active:scale-95 shrink-0"
                aria-label="Voltar para Dashboard"
              >
                <ArrowLeft size={24} />
              </button>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate">
                  {isEditMode ? "Editar Plano de Treino" : "Criar Novo Plano"}
                </h1>
                <p className={`${colors.textSecondary} text-sm truncate`}>
                  {isEditMode
                    ? selectedStudent?.name
                    : "Selecione um aluno para começar"}
                </p>
              </div>
              {isEditMode && selectedStudent && (
                <button
                  onClick={() => {
                    if (setSelectedStudentId)
                      setSelectedStudentId(selectedStudent.id);
                    setActiveTab("student-detail");
                  }}
                  className="text-sm text-lime-400 font-medium hover:underline shrink-0"
                >
                  Perfil
                </button>
              )}
            </div>
          </div>

          {/* MODO EDIÇÃO (Student Selected) */}
          {isEditMode && selectedStudent && (
            <div className="space-y-6">
              {/* Training Editor */}
              <div className="space-y-4">
                {training.length === 0 && (
                  <div
                    className={`${colors.input} border-2 border-dashed ${colors.border} rounded-xl p-8 text-center shadow-inner`}
                  >
                    <Dumbbell
                      className={`w-12 h-12 text-lime-500 mx-auto mb-3 opacity-60`}
                    />
                    <p className={`${colors.textSecondary} text-sm mb-4`}>
                      Nenhum treino criado ainda.
                    </p>
                    <button
                      onClick={addWorkout}
                      className="bg-lime-400 text-slate-900 px-5 py-2 rounded-lg font-semibold shadow-md active:scale-95 transition flex items-center justify-center gap-2 mx-auto"
                    >
                      <Plus size={18} />
                      Criar Primeiro Treino
                    </button>
                  </div>
                )}

                {training.map((w, wIdx) => {
                  const isExpanded = expandedWorkouts.has(w.id);
                  const isEditingName = editingWorkoutId === w.id;

                  return (
                    <div
                      key={w.id}
                      className={`${colors.card} border-2 ${colors.border} rounded-2xl overflow-hidden shadow-lg hover:border-lime-400/50 transition`}
                    >
                      {/* Workout Header */}
                      <div
                        className={`p-4 flex items-center gap-3 cursor-pointer ${colors.input} border-b ${colors.border} `}
                        onClick={() => toggleWorkout(w.id)}
                      >
                        <div className="w-10 h-10 bg-lime-400 rounded-lg flex items-center justify-center text-slate-900 font-bold text-lg shadow-sm shrink-0">
                          {w.type}
                        </div>

                        <div className="flex-1 min-w-0">
                          {isEditingName ? (
                            <input
                              autoFocus
                              value={w.name}
                              onChange={(e) =>
                                updateWorkoutName(wIdx, e.target.value)
                              }
                              onBlur={() => setEditingWorkoutId(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  setEditingWorkoutId(null);
                              }}
                              className={`w-full font-bold text-lg bg-transparent ${colors.text} focus:outline-none border-b-2 border-lime-400 px-1 py-0`}
                              placeholder="Nome do Treino (ex: Pernas)"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg truncate">
                                {w.name}
                              </h3>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingWorkoutId(w.id);
                                }}
                                className={`p-1 rounded text-lime-400 hover:bg-lime-400/10 transition`}
                                title="Editar nome do treino"
                              >
                                <Edit2 size={16} />
                              </button>
                            </div>
                          )}
                          <p
                            className={`text-xs ${colors.textSecondary} mt-0.5`}
                          >
                            {w.exercises.length} exercício
                            {w.exercises.length !== 1 ? "s" : ""}
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeWorkout(wIdx);
                          }}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition shrink-0"
                          title="Remover treino"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      {/* Exercises List (Collapsible) */}
                      {isExpanded && (
                        <div className="p-4 space-y-4">
                          {w.exercises.length === 0 && (
                            <div
                              className={`py-6 ${colors.input} rounded-lg text-center border border-dashed ${colors.border}`}
                            >
                              <AlertCircle
                                className={`w-8 h-8 ${colors.textSecondary} mx-auto mb-2`}
                              />
                              <p className={`${colors.textSecondary} text-sm`}>
                                Nenhum exercício adicionado.
                              </p>
                            </div>
                          )}

                          {(w.exercises || []).map((ex, exIdx) => (
                            <div
                              key={ex.id}
                              className={`${colors.input} rounded-xl p-4 border ${colors.border} shadow-inner`}
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div
                                  className={`w-8 h-8 rounded-md bg-lime-400 flex items-center justify-center text-slate-900 text-sm font-bold shrink-0`}
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
                                  placeholder="Nome do exercício..."
                                  className={`flex-1 min-w-0 bg-transparent ${colors.text} border-b ${colors.border} focus:border-lime-400 focus:outline-none text-base py-1 font-medium`}
                                />
                                <button
                                  onClick={() => removeExercise(wIdx, exIdx)}
                                  className="p-2 -mr-2 text-red-400 hover:bg-red-400/10 transition shrink-0"
                                  title="Remover exercício"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2">
                                <div>
                                  <label
                                    className={`text-[10px] uppercase tracking-wider ${colors.textSecondary} mb-1 block`}
                                  >
                                    Séries
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={String(ex.series)}
                                    onChange={(e) =>
                                      updateExercise(wIdx, exIdx, {
                                        series: Number(e.target.value) || 1,
                                      })
                                    }
                                    className={`w-full ${colors.card} ${colors.text} rounded-lg px-2 py-2.5 text-sm text-center font-bold border ${colors.border} focus:border-lime-400 focus:outline-none`}
                                  />
                                </div>
                                <div>
                                  <label
                                    className={`text-[10px] uppercase tracking-wider ${colors.textSecondary} mb-1 block`}
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
                                    className={`w-full ${colors.card} ${colors.text} rounded-lg px-2 py-2.5 text-sm text-center font-bold border ${colors.border} focus:border-lime-400 focus:outline-none`}
                                  />
                                </div>
                                <div>
                                  <label
                                    className={`text-[10px] uppercase tracking-wider ${colors.textSecondary} mb-1 block`}
                                  >
                                    Carga (kg)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="2.5"
                                    value={String(ex.weight)}
                                    onChange={(e) =>
                                      updateExercise(wIdx, exIdx, {
                                        weight: Number(e.target.value) || 0,
                                      })
                                    }
                                    className={`w-full ${colors.card} ${colors.text} rounded-lg px-2 py-2.5 text-sm text-center font-bold border ${colors.border} focus:border-lime-400 focus:outline-none`}
                                  />
                                </div>
                                <div>
                                  <label
                                    className={`text-[10px] uppercase tracking-wider ${colors.textSecondary} mb-1 block`}
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
                                    className={`w-full ${colors.card} ${colors.text} rounded-lg px-2 py-2.5 text-sm text-center font-bold border ${colors.border} focus:border-lime-400 focus:outline-none`}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          <button
                            onClick={() => addExercise(wIdx)}
                            className={`w-full py-3 bg-transparent border-2 border-dashed ${colors.border} rounded-xl font-medium text-sm text-lime-500 hover:bg-lime-400/10 transition flex items-center justify-center gap-2 active:scale-[0.99]`}
                          >
                            <Plus size={18} />
                            Adicionar Exercício
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {training.length < 3 && (
                  <button
                    onClick={addWorkout}
                    className={`w-full py-4 ${colors.card} border-2 border-dashed ${colors.border} rounded-2xl font-bold shadow-sm active:scale-95 transition flex items-center justify-center gap-2 text-base text-lime-500 hover:border-lime-400/70`}
                  >
                    <Plus size={20} />
                    Adicionar Treino {String.fromCharCode(65 + training.length)}
                  </button>
                )}
              </div>

              {/* Floating Save Button Area */}
              <div
                className={`fixed bottom-0 left-0 right-0 p-4 ${colors.card} border-t ${colors.border} z-20 md:relative md:bg-transparent md:border-0 md:p-0`}
              >
                <button
                  onClick={save}
                  disabled={saving || training.length === 0}
                  className={`w-full max-w-2xl mx-auto py-4 rounded-xl font-bold shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-2 text-lg ${
                    saved
                      ? "bg-green-500 text-white shadow-green-500/50"
                      : "bg-lime-400 text-slate-900 hover:bg-lime-500 shadow-lime-400/50"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {saving ? (
                    <span className="flex items-center gap-3">
                      <Loader2 size={24} className="animate-spin" />
                      Salvando Treino...
                    </span>
                  ) : saved ? (
                    <span className="flex items-center gap-3">
                      <Check size={24} className="animate-bounce" />
                      Treino Salvo!
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <Save size={24} />
                      Salvar Plano de Treino
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* MODO LISTA (Seleção de Aluno) */}
          {!isEditMode && (
            <div className="pb-20">
              <div className="mb-6 sticky top-0 z-10 pt-2">
                <div className="relative">
                  <Search
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${colors.textSecondary}`}
                    size={20}
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar aluno por nome..."
                    className={`w-full ${colors.card} ${colors.text} placeholder-gray-500 rounded-xl pl-12 pr-4 py-4 focus:outline-none border ${colors.border} focus:border-lime-400 transition shadow-md`}
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full ${colors.input} hover:bg-lime-400/10 transition`}
                      title="Limpar busca"
                    >
                      <X size={16} className={colors.textSecondary} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-3">
                {filtered.map((student) => (
                  <button
                    key={student.id}
                    className={`${colors.card} border ${colors.border} p-4 rounded-xl shadow-md transition hover:border-lime-400 cursor-pointer active:scale-[0.98] flex items-center gap-4 group`}
                    onClick={() => setSelectedStudentId?.(student.id)}
                  >
                    <div
                      className={`w-12 h-12 bg-linear-to-br from-lime-400 to-lime-500 rounded-full flex items-center justify-center text-slate-900 font-bold text-lg shadow-sm shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      {student.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-bold truncate">{student.name}</div>
                      <div className={`text-xs ${colors.textSecondary} mt-0.5`}>
                        {student.age} anos • Nvl {student.level ?? 1} •{" "}
                        {student.points ?? 0} XP
                      </div>
                    </div>

                    <div className={`p-2 rounded-full ${colors.input}`}>
                      <ArrowLeft
                        className={`w-5 h-5 ${colors.textSecondary} group-hover:text-lime-400 rotate-180 transition`}
                      />
                    </div>
                  </button>
                ))}

                {filtered.length === 0 && (
                  <div
                    className={`${colors.card} border ${colors.border} rounded-xl p-12 text-center shadow-inner`}
                  >
                    <User
                      className={`w-12 h-12 ${colors.textSecondary} mx-auto mb-4 opacity-50`}
                    />
                    <p className={`${colors.textSecondary}`}>
                      Nenhum aluno encontrado
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
