import { useState } from "react";
import { ArrowLeft, User, Heart, FileText, Check } from "lucide-react";
import { api } from "../../api";
import { useTheme } from "../../theme/context";
import { getThemeColors } from "../../theme/colors";
import { APIError, handleAPIError } from "../../api/client";

interface Props {
  setActiveTab: (tab: string) => void;
  setSelectedStudentId: (id: string | null) => void;
}

export default function CreateStudentScreen({
  setActiveTab,
  setSelectedStudentId,
}: Props) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  // Step 1 - Dados Pessoais
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");

  // Step 2 - Dados Físicos
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyEmail, setEmergencyEmail] = useState("");

  // Step 3 - Objetivos e Saúde
  const [goal, setGoal] = useState("");
  const [experience, setExperience] = useState("");
  const [frequency, setFrequency] = useState("");
  const [healthNotes, setHealthNotes] = useState("");

  const handleNext = () => {
    if (step === 1 && (!name.trim() || !email.trim())) {
      alert("Por favor, preencha nome e e-mail");
      return;
    }
    if (step === 2 && (!weight || !height)) {
      alert("Por favor, preencha peso e altura");
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const handleBack = () => {
    if (step === 1) {
      setActiveTab("dashboard");
    } else {
      setStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    // Validação dos campos obrigatórios
    if (!name.trim()) {
      alert("Por favor, preencha o nome completo");
      return;
    }

    if (!birthDate) {
      alert("Por favor, preencha a data de nascimento");
      return;
    }

    if (!phone.trim()) {
      alert("Por favor, preencha o telefone");
      return;
    }

    if (!email.trim()) {
      alert("Por favor, preencha o e-mail");
      return;
    }

    if (!emergencyPhone.trim()) {
      alert("Por favor, preencha o telefone de emergência");
      return;
    }

    if (!emergencyEmail.trim()) {
      alert("Por favor, preencha o e-mail de emergência");
      return;
    }

    if (!weight || !height) {
      alert("Por favor, preencha peso e altura");
      return;
    }

    if (!goal || !experience || !frequency) {
      alert(
        "Por favor, preencha todos os campos obrigatórios (objetivo, experiência e frequência)",
      );
      return;
    }

    setSubmitting(true);
    try {
      // Preparar dados para o backend no formato esperado pelo CreateMemberDto
      const memberData: Record<string, unknown> = {
        name: name.trim(),
        birthDate, // Formato YYYY-MM-DD
        phone: phone.trim(),
        email: email.trim(),
        emergencyPhone: emergencyPhone.trim(),
        emergencyEmail: emergencyEmail.trim(),
      };

      // Adicionar campos opcionais apenas se tiverem valores
      if (weight && Number(weight) > 0) {
        memberData.weight = Number(weight);
      }
      if (height && Number(height) > 0) {
        memberData.height = Number(height);
      }
      if (gender) {
        memberData.gender = gender;
      }

      // Campos da anamnese
      if (goal) {
        memberData.mainGoal = goal;
      }
      if (experience) {
        memberData.experienceLevel = experience;
      }
      if (frequency) {
        memberData.weeklyFrequency = frequency;
      }
      if (healthNotes.trim()) {
        memberData.healthNotes = healthNotes.trim();
      }

      console.log("Enviando dados do aluno:", memberData);

      const created = await api.createStudent(memberData);

      console.log("Aluno cadastrado com sucesso:", created);

      // O backend retorna um Member completo, então usamos o id diretamente
      if (created && created.id) {
        setSelectedStudentId(created.id);
        setActiveTab("student-detail");
      } else {
        throw new Error("Resposta inválida do servidor");
      }
    } catch (error: unknown) {
      console.error("Erro ao cadastrar aluno:", error);

      // Tratar diferentes tipos de erro
      let errorMessage = "Erro ao cadastrar aluno. Tente novamente.";

      if (error instanceof APIError) {
        if (error.statusCode === 401) {
          errorMessage = "Sessão expirada. Por favor, faça login novamente.";
        } else if (error.statusCode === 403) {
          errorMessage = "Você não tem permissão para cadastrar alunos.";
        } else if (error.statusCode === 400 || error.statusCode === 422) {
          // Tentar extrair mensagens de validação do backend
          const errorData = (error as APIError).data as
            | { message?: string | string[] }
            | undefined;
          if (errorData?.message) {
            errorMessage = Array.isArray(errorData.message)
              ? errorData.message.join(", ")
              : errorData.message;
          } else {
            errorMessage =
              error.message ||
              "Dados inválidos. Verifique os campos preenchidos.";
          }
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = handleAPIError(error);
      }

      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getStepTitle = () => {
    if (step === 1) return "Dados Pessoais";
    if (step === 2) return "Dados Físicos";
    return "Objetivos e Saúde";
  };

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
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-lime-400/10 transition active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Cadastro Novo Aluno</h1>
              <p className={`${colors.textSecondary} text-sm`}>
                {getStepTitle()}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-all ${
                  s <= step
                    ? "bg-gradient-to-r from-lime-400 to-lime-500"
                    : colors.input
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span
              className={
                step >= 1 ? "text-lime-400 font-medium" : colors.textSecondary
              }
            >
              Pessoais
            </span>
            <span
              className={
                step >= 2 ? "text-lime-400 font-medium" : colors.textSecondary
              }
            >
              Físicos
            </span>
            <span
              className={
                step >= 3 ? "text-lime-400 font-medium" : colors.textSecondary
              }
            >
              Objetivos
            </span>
          </div>
        </div>

        {/* Step 1 - Dados Pessoais */}
        {step === 1 && (
          <div
            className={`${colors.card} border ${colors.border} p-5 rounded-2xl shadow-md space-y-4`}
          >
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-lime-400" />
              <h2 className="font-semibold">Informações Pessoais</h2>
            </div>

            <div>
              <label
                className={`block text-sm ${colors.textSecondary} mb-2 font-medium`}
              >
                Nome Completo*
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-xl p-3 ${colors.input} ${colors.text} border ${colors.border} focus:border-lime-400 focus:outline-none transition`}
                placeholder="Digite o nome completo"
              />
            </div>

            <div>
              <label
                className={`block text-sm ${colors.textSecondary} mb-2 font-medium`}
              >
                Data de Nascimento*
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className={`w-full rounded-xl p-3 ${colors.input} ${colors.text} border ${colors.border} focus:border-lime-400 focus:outline-none transition`}
              />
            </div>

            <div>
              <label
                className={`block text-sm ${colors.textSecondary} mb-2 font-medium`}
              >
                Sexo*
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "male", label: "Masculino", icon: "👨" },
                  { value: "female", label: "Feminino", icon: "👩" },
                  { value: "other", label: "Outro", icon: "🧑" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      setGender(opt.value as "male" | "female" | "other")
                    }
                    className={`p-3 rounded-xl font-medium text-sm transition border-2 ${
                      gender === opt.value
                        ? "border-lime-400 bg-lime-400/10 text-lime-400"
                        : `border-transparent ${colors.input} ${colors.textSecondary}`
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.icon}</div>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                className={`block text-sm ${colors.textSecondary} mb-2 font-medium`}
              >
                Telefone*
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className={`w-full rounded-xl p-3 ${colors.input} ${colors.text} border ${colors.border} focus:border-lime-400 focus:outline-none transition`}
              />
            </div>

            <div>
              <label
                className={`block text-sm ${colors.textSecondary} mb-2 font-medium`}
              >
                E-mail*
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className={`w-full rounded-xl p-3 ${colors.input} ${colors.text} border ${colors.border} focus:border-lime-400 focus:outline-none transition`}
              />
            </div>

            <button
              onClick={handleNext}
              className={`${colors.button} w-full py-3 rounded-xl font-semibold shadow-md transition active:scale-[0.98] mt-2`}
            >
              Próximo →
            </button>
          </div>
        )}

        {/* Step 2 - Dados Físicos */}
        {step === 2 && (
          <div
            className={`${colors.card} border ${colors.border} p-5 rounded-2xl shadow-md space-y-4`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-red-400" />
              <h2 className="font-semibold">Dados Físicos e Emergência</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className={`block text-sm ${colors.textSecondary} mb-2 font-medium`}
                >
                  Peso (kg)*
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                  className={`w-full rounded-xl p-3 ${colors.input} ${colors.text} border ${colors.border} focus:border-lime-400 focus:outline-none transition`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm ${colors.textSecondary} mb-2 font-medium`}
                >
                  Altura (m)*
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="1.75"
                  className={`w-full rounded-xl p-3 ${colors.input} ${colors.text} border ${colors.border} focus:border-lime-400 focus:outline-none transition`}
                />
              </div>
            </div>

            {/* IMC Preview */}
            {weight && height && (
              <div className="bg-lime-400/10 border border-lime-400/30 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${colors.textSecondary}`}>
                    IMC Calculado
                  </span>
                  <span className="text-lime-400 font-bold text-lg">
                    {(
                      Number(weight) /
                      (Number(height) * Number(height))
                    ).toFixed(1)}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-700">
              <h3 className={`text-sm font-semibold mb-3 ${colors.text}`}>
                Contato de Emergência
              </h3>

              <div className="space-y-3">
                <div>
                  <label
                    className={`block text-sm ${colors.textSecondary} mb-2 font-medium`}
                  >
                    Nome do Contato
                  </label>
                  <input
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Nome completo"
                    className={`w-full rounded-xl p-3 ${colors.input} ${colors.text} border ${colors.border} focus:border-lime-400 focus:outline-none transition`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm ${colors.textSecondary} mb-2 font-medium`}
                  >
                    Telefone do Contato*
                  </label>
                  <input
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className={`w-full rounded-xl p-3 ${colors.input} ${colors.text} border ${colors.border} focus:border-lime-400 focus:outline-none transition`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm ${colors.textSecondary} mb-2 font-medium`}
                  >
                    E-mail do Contato*
                  </label>
                  <input
                    type="email"
                    value={emergencyEmail}
                    onChange={(e) => setEmergencyEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className={`w-full rounded-xl p-3 ${colors.input} ${colors.text} border ${colors.border} focus:border-lime-400 focus:outline-none transition`}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className={`flex-1 ${colors.cardSecondary} border ${colors.border} py-3 rounded-xl font-medium transition hover:border-lime-400 active:scale-[0.98]`}
              >
                ← Voltar
              </button>
              <button
                onClick={handleNext}
                className={`${colors.button} flex-1 py-3 rounded-xl font-semibold shadow-md transition active:scale-[0.98]`}
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 - Objetivos e Saúde */}
        {step === 3 && (
          <div
            className={`${colors.card} border ${colors.border} p-5 rounded-2xl shadow-md space-y-4`}
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold">
                Objetivos e Informações de Saúde
              </h2>
            </div>

            <div>
              <label
                className={`block text-sm ${colors.textSecondary} mb-2 font-medium`}
              >
                Objetivo Principal*
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className={`w-full rounded-xl p-3 ${colors.input} ${colors.text} border ${colors.border} focus:border-lime-400 focus:outline-none transition`}
              >
                <option value="">Selecione o objetivo...</option>
                <option value="emagrecimento">Emagrecimento</option>
                <option value="hipertrofia">
                  Ganho de Massa Muscular (Hipertrofia)
                </option>
                <option value="condicionamento">Condicionamento Físico</option>
                <option value="saude">Saúde e Bem-estar</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-sm ${colors.textSecondary} mb-2 font-medium`}
              >
                Experiência com Exercícios*
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className={`w-full rounded-xl p-3 ${colors.input} ${colors.text} border ${colors.border} focus:border-lime-400 focus:outline-none transition`}
              >
                <option value="">Selecione...</option>
                <option value="iniciante">Iniciante (Nunca treinei)</option>
                <option value="intermediario">
                  Intermediário (6 meses - 2 anos)
                </option>
                <option value="avancado">Avançado (Mais de 2 anos)</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-sm ${colors.textSecondary} mb-2 font-medium`}
              >
                Frequência de Treino*
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className={`w-full rounded-xl p-3 ${colors.input} ${colors.text} border ${colors.border} focus:border-lime-400 focus:outline-none transition`}
              >
                <option value="">Selecione...</option>
                <option value="2-3">2 a 3 dias por semana</option>
                <option value="4-5">4 a 5 dias por semana</option>
                <option value="6-7">6 a 7 dias por semana</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-sm ${colors.textSecondary} mb-2 font-medium`}
              >
                Observações de Saúde
              </label>
              <p className={`text-xs ${colors.textSecondary} mb-2`}>
                Descreva problemas de saúde, lesões, cirurgias ou restrições
                médicas
              </p>
              <textarea
                value={healthNotes}
                onChange={(e) => setHealthNotes(e.target.value)}
                placeholder="Ex: Lesão no joelho esquerdo em 2023, evitar agachamento profundo. Pressão alta controlada com medicamento."
                rows={4}
                className={`w-full rounded-xl p-3 ${colors.input} ${colors.text} border ${colors.border} focus:border-lime-400 focus:outline-none transition resize-none`}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className={`flex-1 ${colors.cardSecondary} border ${colors.border} py-3 rounded-xl font-medium transition hover:border-lime-400 active:scale-[0.98]`}
              >
                ← Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`${colors.button} flex-1 py-3 rounded-xl font-semibold shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2`}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Finalizar Cadastro
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
