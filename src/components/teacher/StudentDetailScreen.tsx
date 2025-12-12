import { useState, useEffect } from "react";
import { User, Heart, AlertCircle } from "lucide-react";
import type { StudentMedicalInfo, StudentData } from "../../types";
import { api } from "../../api";
import { useTheme } from "../../theme/context";
import { getThemeColors } from "../../theme/colors";

interface Props {
  studentId?: string | null;
  setActiveTab?: (tab: string) => void;
  setSelectedStudentId?: (id: string | null) => void;
}

const StudentDetailScreen: React.FC<Props> = ({
  studentId,
  setActiveTab,
  setSelectedStudentId,
}) => {
  const [medicalInfo, setMedicalInfo] = useState<StudentMedicalInfo | null>(
    null
  );
  const [studentName, setStudentName] = useState<string | null>(null);
  const [studentAge, setStudentAge] = useState<number | null>(null);

  const [studentLevel, setStudentLevel] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    const loadStudentData = async () => {
      try {
        setLoading(true);
        
        // Buscar dados do estudante primeiro
        const students = await api.getStudents();
        const found = students.find((s) => s.id === studentId);
        
        if (found) {
          setStudentName(found.name);
          setStudentAge(found.age);
          setStudentLevel(found.level ?? 1);
        }

        // Buscar informações médicas
        try {
          const medicalData = await api.getMedicalInfo(studentId);
          setMedicalInfo(medicalData);
          
          // Se não encontrou o estudante na lista, usar dados médicos
          if (!found) {
            setStudentName(medicalData.studentName);
            setStudentAge(medicalData.age);
          }
        } catch (medicalError) {
          console.error("Erro ao carregar informações médicas:", medicalError);
          // Se não conseguir carregar dados médicos, criar um objeto mínimo
          if (found) {
            setMedicalInfo({
              studentId: found.id,
              studentName: found.name,
              age: found.age,
              weight: found.weight || 0,
              height: found.height || 0,
              bloodPressure: 'Não informado',
              heartCondition: false,
              injuries: [],
              restrictions: [],
              notes: 'Nenhuma informação médica disponível',
            });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do estudante:", error);
        // Mostrar mensagem de erro ao usuário
        setMedicalInfo({
          studentId: studentId || '',
          studentName: 'Erro ao carregar',
          age: 0,
          weight: 0,
          height: 0,
          bloodPressure: 'Não informado',
          heartCondition: false,
          injuries: [],
          restrictions: [],
          notes: 'Erro ao carregar dados do estudante',
        });
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [studentId]);

  if (loading) {
    return (
      <div
        className={`min-h-screen ${colors.background} flex items-center justify-center`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
          <div className={colors.textSecondary}>Carregando dados do estudante...</div>
        </div>
      </div>
    );
  }

  if (!medicalInfo) {
    return (
      <div
        className={`min-h-screen ${colors.background} flex items-center justify-center p-6`}
      >
        <div className={`${colors.card} border ${colors.border} rounded-xl p-6 text-center max-w-md`}>
          <AlertCircle className={`w-12 h-12 ${colors.textSecondary} mx-auto mb-4`} />
          <h2 className={`${colors.text} font-semibold text-lg mb-2`}>
            Estudante não encontrado
          </h2>
          <p className={`${colors.textSecondary} text-sm mb-4`}>
            Não foi possível carregar os dados do estudante.
          </p>
          {setActiveTab && (
            <button
              onClick={() => setActiveTab("students-list")}
              className={`${colors.button} px-4 py-2 rounded-lg text-sm font-medium`}
            >
              Voltar para lista
            </button>
          )}
        </div>
      </div>
    );
  }

  const bmi = medicalInfo.weight > 0 && medicalInfo.height > 0
    ? (medicalInfo.weight / (medicalInfo.height * medicalInfo.height)).toFixed(1)
    : 'N/A';

  return (
    <div className={`min-h-screen ${colors.background} pb-24`}>
      <div className="max-w-md mx-auto">
        <div className={`${colors.card} p-6 border-b ${colors.border}`}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-16 h-16 ${colors.accent} rounded-full flex items-center justify-center`}
            >
              <User className={`w-8 h-8 ${colors.textInverse}`} />
            </div>

            <div>
              {!editing ? (
                <>
                  <h1 className={`${colors.text} text-xl font-bold`}>
                    {studentName ?? medicalInfo.studentName}
                  </h1>
                  <p className={`${colors.textSecondary} text-sm`}>
                    {studentAge ?? medicalInfo.age} anos
                  </p>
                </>
              ) : (
                <div className="space-y-2 w-full">
                  <input
                    value={studentName ?? ""}
                    onChange={(e) => setStudentName(e.target.value)}
                    className={`w-full ${colors.input} ${colors.text} rounded-md px-3 py-2`}
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={String(studentAge ?? "")}
                      onChange={(e) =>
                        setStudentAge(Number(e.target.value) || 0)
                      }
                      className={`w-24 ${colors.input} ${colors.text} rounded-md px-3 py-2`}
                      placeholder="Idade"
                    />
                    <input
                      type="number"
                      value={String(studentLevel ?? "")}
                      onChange={(e) =>
                        setStudentLevel(Number(e.target.value) || 0)
                      }
                      className={`w-24 ${colors.input} ${colors.text} rounded-md px-3 py-2`}
                      placeholder="Nível"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing((s) => !s)}
                className={`px-3 py-1 rounded-md text-sm ${colors.button} ${colors.text}`}
              >
                {editing ? "Cancelar" : "Editar"}
              </button>
              {editing && (
                <button
                  onClick={async () => {
                    if (!studentName || !studentId) return;
                    setSaving(true);
                    try {
                      // Por enquanto, apenas atualizar localmente
                      // TODO: Implementar endpoint de update no backend
                      alert("Funcionalidade de edição será implementada em breve. Por enquanto, os dados são apenas exibidos.");
                      setEditing(false);
                    } catch (error) {
                      console.error("Erro ao salvar:", error);
                      alert("Erro ao salvar alterações");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="px-3 py-1 rounded-md bg-green-600 text-white text-sm disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              )}
            </div>

            <div>
              <button
                onClick={() => {
                  if (setSelectedStudentId)
                    setSelectedStudentId(studentId ?? null);
                  if (setActiveTab) setActiveTab("create-training");
                }}
                className="px-3 py-1 rounded-md bg-sky-600 text-white text-sm"
              >
                Editar Treino
              </button>
            </div>
          </div>

          <div
            className={`${colors.card} border ${colors.border} rounded-xl p-4`}
          >
            <h2
              className={`${colors.text} font-semibold mb-3 flex items-center gap-2`}
            >
              <Heart className="w-5 h-5 text-red-400" />
              Informações Físicas
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`${colors.textSecondary} text-xs mb-1`}>Peso</p>
                <p className={`${colors.text} font-semibold`}>
                  {medicalInfo.weight > 0 ? `${medicalInfo.weight} kg` : 'Não informado'}
                </p>
              </div>

              <div>
                <p className={`${colors.textSecondary} text-xs mb-1`}>Altura</p>
                <p className={`${colors.text} font-semibold`}>
                  {medicalInfo.height > 0 ? `${medicalInfo.height} m` : 'Não informado'}
                </p>
              </div>

              <div>
                <p className={`${colors.textSecondary} text-xs mb-1`}>IMC</p>
                <p className={`${colors.text} font-semibold`}>{bmi}</p>
              </div>

              <div>
                <p className={`${colors.textSecondary} text-xs mb-1`}>
                  Pressão
                </p>
                <p className={`${colors.text} font-semibold`}>
                  {medicalInfo.bloodPressure || 'Não informado'}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`${colors.card} border ${colors.border} rounded-xl p-4`}
          >
            <h2
              className={`${colors.text} font-semibold mb-3 flex items-center gap-2`}
            >
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              Condições Médicas
            </h2>

            <div className="space-y-2">
              <div>
                <p className={`${colors.textSecondary} text-xs mb-1`}>
                  Problema Cardíaco
                </p>
                <p className={`${colors.text}`}>
                  {medicalInfo.heartCondition ? "Sim" : "Não"}
                </p>
              </div>

              {medicalInfo.injuries.length > 0 && (
                <div>
                  <p className={`${colors.textSecondary} text-xs mb-1`}>
                    Lesões
                  </p>
                  {medicalInfo.injuries.map((injury, idx) => (
                    <p key={idx} className={`${colors.text} text-sm`}>
                      {injury}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {medicalInfo.restrictions.length > 0 && (
            <div
              className={`${colors.card} border border-orange-400 rounded-xl p-4`}
            >
              <h2
                className={`${colors.text} font-semibold mb-3 flex items-center gap-2`}
              >
                <AlertCircle className="w-5 h-5 text-orange-400" />
                Restrições
              </h2>
              {medicalInfo.restrictions.map((restriction, idx) => (
                <p key={idx} className="text-orange-300 text-sm mb-1">
                  • {restriction}
                </p>
              ))}
            </div>
          )}

          {medicalInfo.notes && (
            <div
              className={`${colors.card} border ${colors.border} rounded-xl p-4`}
            >
              <h2 className={`${colors.text} font-semibold mb-3`}>
                Observações
              </h2>
              <p className={`${colors.textSecondary} text-sm`}>
                {medicalInfo.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailScreen;
