import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { api } from "../../api";
import type { StudentData } from "../../types";
import { useTheme } from "../../theme/context";
import { getThemeColors } from "../../theme/colors";

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
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Step 2 - Objetivos e Experiência
  const [goal, setGoal] = useState("");
  const [experience, setExperience] = useState("");
  const [frequency, setFrequency] = useState("");
  const [times, setTimes] = useState<string[]>([]);

  const toggleTime = (t: string) => {
    setTimes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleNext = () => setStep((s) => Math.min(2, s + 1));
  const handleBack = () =>
    step === 1 ? setActiveTab("dashboard") : setStep((s) => s - 1);

  const handleSubmit = async () => {
    // validação simples
    if (!name.trim() || !email.trim()) {
      alert("Por favor preencha nome e e-mail antes de continuar.");
      return;
    }
    setSubmitting(true);
    try {
      // Criar estudante com dados mínimos; mock API retornará o aluno criado
      const age = calcAgeFromBirth(birthDate) || 18;
      const created = await api.createStudent({
        name,
        email,
        age,
        level: mapGoalToLevel(goal),
      } as Partial<StudentData>);

      // navegar para detalhe do aluno recém-criado
      setSelectedStudentId(created.id);
      setActiveTab("student-detail");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${colors.background} ${colors.text} px-4 py-6 pb-24`}
    >
      <div className="max-w-md mx-auto">
        <div className={`${colors.card} rounded-b-xl p-4 mb-6 shadow-lg`}>
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-2 rounded-md">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Cadastro Novo Aluno</h1>
              <p className={`${colors.textSecondary} text-sm`}>
                Dados Pessoais
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {step === 1 && (
            <div className={`${colors.card} p-4 rounded-xl shadow-md`}>
              <label className={`block text-sm ${colors.textSecondary} mb-2`}>
                Nome Completo*
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-md p-3 ${colors.input} ${colors.text}`}
                placeholder="Digite seu nome completo"
              />

              <label
                className={`block text-sm ${colors.textSecondary} mt-4 mb-2`}
              >
                Data de Nascimento*
              </label>
              <input
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="dd/mm/aaaa"
                className={`w-full rounded-md p-3 ${colors.input} ${colors.text}`}
              />

              <label
                className={`block text-sm ${colors.textSecondary} mt-4 mb-2`}
              >
                Telefone*
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className={`w-full rounded-md p-3 ${colors.input} ${colors.text}`}
              />

              <label
                className={`block text-sm ${colors.textSecondary} mt-4 mb-2`}
              >
                E-mail*
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={`w-full rounded-md p-3 ${colors.input} ${colors.text}`}
              />

              <label
                className={`block text-sm ${colors.textSecondary} mt-4 mb-2`}
              >
                Contato de Emergência - Nome
              </label>
              <input
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className={`w-full rounded-md p-3 ${colors.input} ${colors.text}`}
              />

              <label
                className={`block text-sm ${colors.textSecondary} mt-4 mb-2`}
              >
                Contato de Emergência - Telefone
              </label>
              <input
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className={`w-full rounded-md p-3 ${colors.input} ${colors.text}`}
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleBack}
                  className={`flex-1 ${colors.cardSecondary} py-2 rounded-lg`}
                >
                  Voltar
                </button>
                <button
                  onClick={handleNext}
                  className={`${colors.button} flex-1 py-2 rounded-lg`}
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={`${colors.card} p-4 rounded-xl shadow-md`}>
              <h2 className={`${colors.text} font-semibold mb-3`}>
                Objetivos e Experiência
              </h2>

              <label className={`block text-sm ${colors.textSecondary} mb-2`}>
                Qual seu principal objetivo?*
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className={`w-full rounded-md p-3 ${colors.input} ${colors.text}`}
              >
                <option value="">Selecione...</option>
                <option value="emagrecimento">Emagrecimento</option>
                <option value="hipertrofia">
                  Ganho de massa muscular (Hipertrofia)
                </option>
                <option value="condicionamento">Condicionamento físico</option>
                <option value="saude">Saúde e Bem-estar</option>
              </select>

              <label
                className={`block text-sm ${colors.textSecondary} mt-4 mb-2`}
              >
                Experiência com exercícios físicos*
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className={`w-full rounded-md p-3 ${colors.input} ${colors.text}`}
              >
                <option value="">Selecione...</option>
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>

              <label
                className={`block text-sm ${colors.textSecondary} mt-4 mb-2`}
              >
                Frequência de treino*
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className={`w-full rounded-md p-3 ${colors.input} ${colors.text}`}
              >
                <option value="">Selecione...</option>
                <option value="2-3">2 a 3 dias</option>
                <option value="4-5">4 a 5 dias</option>
                <option value="6-7">6 a 7 dias</option>
              </select>

              <label
                className={`block text-sm ${colors.textSecondary} mt-4 mb-2`}
              >
                Horários de preferência*
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={times.includes("manha")}
                    onChange={() => toggleTime("manha")}
                  />
                  <span className={`${colors.textSecondary} text-sm`}>
                    Manhã (6h-12h)
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={times.includes("tarde")}
                    onChange={() => toggleTime("tarde")}
                  />
                  <span className={`${colors.textSecondary} text-sm`}>
                    Tarde (12h-18h)
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={times.includes("noite")}
                    onChange={() => toggleTime("noite")}
                  />
                  <span className={`${colors.textSecondary} text-sm`}>
                    Noite (18h-21h)
                  </span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className={`flex-1 ${colors.cardSecondary} py-2 rounded-lg`}
                >
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`${colors.button} flex-1 py-2 rounded-lg`}
                >
                  {submitting ? "Cadastrando..." : "Próximo →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function calcAgeFromBirth(birth: string) {
  if (!birth) return undefined;
  // esperar dd/mm/aaaa
  const parts = birth.split("/");
  if (parts.length !== 3) return undefined;
  const d = Number(parts[0]);
  const m = Number(parts[1]) - 1;
  const y = Number(parts[2]);
  const dob = new Date(y, m, d);
  const diff = Date.now() - dob.getTime();
  const ageDt = new Date(diff);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

function mapGoalToLevel(goal: string) {
  if (goal === "hipertrofia") return 8;
  if (goal === "condicionamento") return 5;
  return 1;
}
