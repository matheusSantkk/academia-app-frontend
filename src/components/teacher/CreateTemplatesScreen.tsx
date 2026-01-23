import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Sparkles,
  Edit,
  X,
  Clock,
  Weight,
  Repeat,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { WorkoutTemplate } from "../../types";
import { api } from "../../api";
import { useTheme } from "../../theme/context";
import { getThemeColors } from "../../theme/colors";

interface Props {
  setActiveTab: (tab: string) => void;
}

export default function CreateTemplatesScreen({ setActiveTab }: Props) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());

  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const isMockMode = () => {
    return import.meta.env.VITE_API_MODE === "mock";
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      if (!isMockMode()) {
        const list = await api.getWorkoutTemplates();
        setTemplates(list);
      } else {
        setTemplates([]);
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(templateId: string) {
    if (!confirm("Tem certeza que deseja deletar este template?")) return;

    try {
      await api.deleteWorkoutTemplate(templateId);
      setTemplates(templates.filter((t) => t.id !== templateId));
      // Remover do conjunto de expandidos se estiver lá
      setExpandedTemplates((prev) => {
        const newSet = new Set(prev);
        newSet.delete(templateId);
        return newSet;
      });
    } catch (error) {
      console.error("Erro ao deletar template:", error);
      alert("Erro ao deletar template. Tente novamente.");
    }
  }

  function toggleTemplateExpanded(templateId: string) {
    setExpandedTemplates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
      }
      return newSet;
    });
  }

  return (
    <div
      className={`min-h-screen ${colors.background} ${colors.text} overflow-y-auto pb-24`}
    >
      <div className="max-w-2xl mx-auto px-4 py-4">
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
              <h1 className="text-xl md:text-2xl font-bold">Templates de Treino</h1>
              <p className={`${colors.textSecondary} text-sm mt-1`}>
                Crie e gerencie templates reutilizáveis para seus alunos
              </p>
            </div>
          </div>
        </div>

        {/* Botão Criar Template */}
        <div className="mb-6">
          <button
            onClick={() => {
              setEditingTemplate(null);
              setShowCreateModal(true);
            }}
            className={`w-full py-4 rounded-2xl ${colors.button} font-semibold shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-3`}
          >
            <Plus size={24} />
            Criar Novo Template
          </button>
        </div>

        {/* Lista de Templates */}
        {loading ? (
          <div className={`${colors.card} border ${colors.border} rounded-2xl p-12 text-center`}>
            <div className="w-8 h-8 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className={colors.textSecondary}>Carregando templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className={`${colors.card} border ${colors.border} rounded-2xl p-12 text-center`}>
            <FileText className={`w-16 h-16 ${colors.textSecondary} mx-auto mb-4`} />
            <h3 className={`${colors.text} font-semibold text-lg mb-2`}>
              Nenhum template criado
            </h3>
            <p className={`${colors.textSecondary} text-sm mb-6`}>
              Crie seu primeiro template para começar a usar treinos padrões
            </p>
            <button
              onClick={() => {
                setEditingTemplate(null);
                setShowCreateModal(true);
              }}
              className={`px-6 py-3 rounded-xl ${colors.button} font-medium`}
            >
              Criar Primeiro Template
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`${colors.card} border-2 ${colors.border} rounded-2xl p-6 md:p-7 shadow-lg hover:border-lime-400/60 hover:shadow-xl transition-all duration-200`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => toggleTemplateExpanded(template.id)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-400 to-lime-500 flex items-center justify-center shadow-md">
                        <Sparkles className="w-5 h-5 text-slate-900" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-extrabold text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-500 mb-1">
                          {template.title}
                        </h3>
                        {template.description && (
                          <p className={`${colors.textSecondary} text-sm font-medium leading-relaxed`}>
                            {template.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTemplateExpanded(template.id);
                        }}
                        className="p-2 rounded-xl text-lime-400 hover:bg-lime-400/10 transition-all hover:scale-110 active:scale-95"
                        title={expandedTemplates.has(template.id) ? "Recolher exercícios" : "Expandir exercícios"}
                      >
                        {expandedTemplates.has(template.id) ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-lime-400/10 border border-lime-400/20">
                        <Activity size={16} className="text-lime-400" />
                        <span className={`${colors.text} text-sm font-semibold`}>
                          {template.items.length} exercício{template.items.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTemplate(template);
                        setShowCreateModal(true);
                      }}
                      className="p-2.5 rounded-xl text-blue-400 hover:bg-blue-400/10 transition-all hover:scale-110 active:scale-95"
                      title="Editar template"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(template.id);
                      }}
                      className="p-2.5 rounded-xl text-red-400 hover:bg-red-400/10 transition-all hover:scale-110 active:scale-95"
                      title="Deletar template"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Lista de Exercícios do Template */}
                {expandedTemplates.has(template.id) && (
                  <div className="space-y-3 mt-6 pt-6 border-t border-lime-400/30 animate-fade-in">
                    {template.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`${colors.input} rounded-xl p-4 border ${colors.border} hover:border-lime-400/40 transition-all shadow-sm`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-400 to-lime-500 border-2 border-lime-400/30 flex items-center justify-center text-base font-extrabold text-slate-900 shrink-0 shadow-md">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`${colors.text} font-bold text-base mb-3 leading-tight`}>
                            {item.exercise.name}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-lime-400/5 border border-lime-400/10">
                              <Repeat size={14} className="text-lime-400" />
                              <span className={`${colors.text} text-sm font-semibold`}>
                                {item.sets} séries
                              </span>
                            </div>
                            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-400/5 border border-blue-400/10">
                              <Activity size={14} className="text-blue-400" />
                              <span className={`${colors.text} text-sm font-semibold`}>
                                {item.repetitions} reps
                              </span>
                            </div>
                            {item.weight && (
                              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-purple-400/5 border border-purple-400/10">
                                <Weight size={14} className="text-purple-400" />
                                <span className={`${colors.text} text-sm font-semibold`}>
                                  {item.weight} kg
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-orange-400/5 border border-orange-400/10">
                              <Clock size={14} className="text-orange-400" />
                              <span className={`${colors.text} text-sm font-semibold`}>
                                {item.restTime}s
                              </span>
                            </div>
                          </div>
                          {item.observations && (
                            <div className="mt-3 pt-3 border-t border-lime-400/10">
                              <p className={`${colors.textSecondary} text-sm font-medium italic leading-relaxed`}>
                                💡 {item.observations}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal para criar/editar template */}
        {showCreateModal && (
          <CreateTemplateModal
            template={editingTemplate}
            onClose={() => {
              setShowCreateModal(false);
              setEditingTemplate(null);
            }}
            onSave={async (templateData) => {
              try {
                if (editingTemplate) {
                  await api.updateWorkoutTemplate(editingTemplate.id, templateData);
                  await loadTemplates();
                  setShowCreateModal(false);
                  setEditingTemplate(null);
                  alert("Template atualizado com sucesso!");
                } else {
                  await api.createWorkoutTemplate(templateData);
                  await loadTemplates();
                  setShowCreateModal(false);
                  alert("Template criado com sucesso!");
                }
              } catch (error) {
                console.error("Erro ao salvar template:", error);
                alert("Erro ao salvar template. Tente novamente.");
              }
            }}
            colors={colors}
          />
        )}
      </div>
    </div>
  );
}

// Modal para criar/editar template
function CreateTemplateModal({
  template,
  onClose,
  onSave,
  colors,
}: {
  template: WorkoutTemplate | null;
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
  const [title, setTitle] = useState(template?.title || "");
  const [description, setDescription] = useState(template?.description || "");
  const [items, setItems] = useState<Array<{
    exerciseName: string;
    sets: number;
    reps: string;
    weight?: number;
    rest?: string;
    observations?: string;
  }>>(
    template?.items.map((item) => ({
      exerciseName: item.exercise.name,
      sets: item.sets,
      reps: String(item.repetitions),
      weight: item.weight || undefined,
      rest: `${item.restTime}s`,
      observations: item.observations || undefined,
    })) || []
  );

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
          <h2 className="text-xl font-bold">
            {template ? "Editar Template" : "Criar Template de Treino"}
          </h2>
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
                  <div className="mt-3">
                    <label className={`text-xs ${colors.textSecondary} mb-1.5 block`}>
                      Observações (opcional)
                    </label>
                    <textarea
                      value={item.observations || ""}
                      onChange={(e) =>
                        updateItem(index, { observations: e.target.value })
                      }
                      placeholder="Observações sobre este exercício..."
                      rows={2}
                      className={`w-full ${colors.card} ${colors.text} rounded-lg px-3 py-2 text-sm border ${colors.border} focus:border-lime-400 focus:outline-none resize-none`}
                    />
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
            {template ? "Salvar Alterações" : "Criar Template"}
          </button>
        </div>
      </div>
    </div>
  );
}


