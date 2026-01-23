import { useState, useEffect } from "react";
import { Heart, AlertCircle, Phone, Mail, UserCircle, Calendar, Award, TrendingUp, ArrowLeft } from "lucide-react";
import type { StudentMedicalInfo, StudentData } from "../../types";
import { api } from "../../api";
import { httpClient } from "../../api/client";
import { API_ENDPOINTS } from "../../api/config";
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
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [memberFullData, setMemberFullData] = useState<{
    phone?: string;
    email?: string;
    emergencyPhone?: string;
    emergencyEmail?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

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
        
        let foundStudent: StudentData | null = null;
        
        // Buscar dados completos do membro
        try {
          const memberData = await api.getMemberData(studentId);
          const students = await api.getStudents();
          foundStudent = students.find((s) => s.id === studentId) || null;
          
          if (foundStudent) {
            setStudentData({
              ...foundStudent,
              email: memberData.email || foundStudent.email,
            });
          } else {
            setStudentData({
              id: studentId || '',
              name: memberData.name,
              email: memberData.email,
              role: 'student',
              age: 0,
              level: memberData.level,
              points: memberData.xp,
              streak: memberData.currentStreak,
            });
          }
          
          // Buscar dados completos do membro (phone, emergency contacts)
          try {
            const fullData = await httpClient.get<{
              phone: string;
              email: string;
              emergencyPhone: string;
              emergencyEmail: string;
            }>(API_ENDPOINTS.MEMBERS.GET(studentId));
            setMemberFullData({
              phone: fullData.phone,
              email: fullData.email,
              emergencyPhone: fullData.emergencyPhone,
              emergencyEmail: fullData.emergencyEmail,
            });
          } catch (fetchError) {
            console.error("Erro ao buscar dados completos:", fetchError);
          }
        } catch (error) {
          console.error("Erro ao buscar dados do membro:", error);
          // Fallback para getStudents
          const students = await api.getStudents();
          foundStudent = students.find((s) => s.id === studentId) || null;
          if (foundStudent) {
            setStudentData(foundStudent);
          }
        }

        // Buscar informações médicas
        try {
          const medicalData = await api.getMedicalInfo(studentId);
          setMedicalInfo(medicalData);
          
          // Se não encontrou o estudante na lista, criar dados básicos
          if (!foundStudent) {
            setStudentData({
              id: studentId || '',
              name: medicalData.studentName,
              email: '',
              role: 'student',
              age: medicalData.age,
              level: 1,
              points: 0,
            });
          }
        } catch (medicalError) {
          console.error("Erro ao carregar informações médicas:", medicalError);
          // Se não conseguir carregar dados médicos, criar um objeto mínimo
          if (foundStudent) {
            setMedicalInfo({
              studentId: foundStudent.id,
              studentName: foundStudent.name,
              age: foundStudent.age,
              weight: foundStudent.weight || 0,
              height: foundStudent.height || 0,
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

  const studentName = studentData?.name || medicalInfo.studentName;
  const studentAge = studentData?.age || medicalInfo.age;
  const studentLevel = studentData?.level || 1;
  const studentXP = studentData?.points || 0;
  const studentStreak = studentData?.streak || 0;

  return (
    <div className={`min-h-screen ${colors.background} pb-24`}>
      <div className="max-w-md mx-auto">
        {/* Header com botão voltar */}
        <div className={`${colors.card} p-4 border-b ${colors.border} sticky top-0 z-10`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (setActiveTab) setActiveTab("students-list");
                if (setSelectedStudentId) setSelectedStudentId(null);
              }}
              className={`p-2 rounded-lg hover:bg-lime-400/10 transition ${colors.text}`}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className={`${colors.text} text-lg font-bold`}>Perfil do Aluno</h1>
          </div>
        </div>

        {/* Card Principal do Aluno */}
        <div className={`${colors.card} p-6 border-b ${colors.border}`}>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-lime-500 rounded-2xl flex items-center justify-center text-slate-900 font-bold text-3xl shadow-lg">
              {studentName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className={`${colors.text} text-2xl font-bold mb-1`}>
                {studentName}
              </h2>
              <div className="flex items-center gap-2 text-sm text-lime-400 mb-2">
                <Award size={16} />
                <span className={colors.textSecondary}>Nível {studentLevel}</span>
                <span className={colors.textSecondary}>•</span>
                <TrendingUp size={16} />
                <span className={colors.textSecondary}>{studentXP} XP</span>
                {studentStreak > 0 && (
                  <>
                    <span className={colors.textSecondary}>•</span>
                    <span className="text-orange-400">🔥 {studentStreak} dias</span>
                  </>
                )}
              </div>
              <p className={`${colors.textSecondary} text-sm flex items-center gap-1.5`}>
                <Calendar size={14} />
                {studentAge} anos
              </p>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (setSelectedStudentId)
                  setSelectedStudentId(studentId ?? null);
                if (setActiveTab) setActiveTab("edit-training");
              }}
              className={`flex-1 py-2.5 rounded-xl ${colors.button} font-medium text-sm transition active:scale-95`}
            >
              Editar Treino
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Informações de Contato */}
          <div className={`${colors.card} border ${colors.border} rounded-xl p-4`}>
            <h3 className={`${colors.text} font-semibold mb-4 flex items-center gap-2`}>
              <UserCircle className="w-5 h-5 text-lime-400" />
              Informações de Contato
            </h3>
            <div className="space-y-3">
              {(memberFullData?.email || studentData?.email) && (
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-lime-400/5 border border-lime-400/20">
                  <Mail className={`w-4 h-4 text-lime-400`} />
                  <div className="flex-1">
                    <p className={`${colors.textSecondary} text-xs mb-0.5`}>E-mail</p>
                    <p className={`${colors.text} text-sm font-medium`}>
                      {memberFullData?.email || studentData?.email}
                    </p>
                  </div>
                </div>
              )}
              {memberFullData?.phone && (
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-lime-400/5 border border-lime-400/20">
                  <Phone className={`w-4 h-4 text-lime-400`} />
                  <div className="flex-1">
                    <p className={`${colors.textSecondary} text-xs mb-0.5`}>Telefone</p>
                    <p className={`${colors.text} text-sm font-medium`}>{memberFullData.phone}</p>
                  </div>
                </div>
              )}
              {memberFullData?.emergencyPhone && (
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-orange-400/5 border border-orange-400/20">
                  <Phone className={`w-4 h-4 text-orange-400`} />
                  <div className="flex-1">
                    <p className={`${colors.textSecondary} text-xs mb-0.5`}>Telefone de Emergência</p>
                    <p className={`${colors.text} text-sm font-medium`}>{memberFullData.emergencyPhone}</p>
                  </div>
                </div>
              )}
              {memberFullData?.emergencyEmail && (
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-orange-400/5 border border-orange-400/20">
                  <Mail className={`w-4 h-4 text-orange-400`} />
                  <div className="flex-1">
                    <p className={`${colors.textSecondary} text-xs mb-0.5`}>E-mail de Emergência</p>
                    <p className={`${colors.text} text-sm font-medium`}>{memberFullData.emergencyEmail}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informações Físicas */}
          <div className={`${colors.card} border ${colors.border} rounded-xl p-4`}>
            <h3 className={`${colors.text} font-semibold mb-4 flex items-center gap-2`}>
              <Heart className="w-5 h-5 text-red-400" />
              Informações Físicas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className={`${colors.textSecondary} text-xs`}>Peso</p>
                <p className={`${colors.text} font-bold text-lg`}>
                  {medicalInfo.weight > 0 ? `${medicalInfo.weight} kg` : 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <p className={`${colors.textSecondary} text-xs`}>Altura</p>
                <p className={`${colors.text} font-bold text-lg`}>
                  {medicalInfo.height > 0 ? `${medicalInfo.height.toFixed(2)} m` : 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <p className={`${colors.textSecondary} text-xs`}>IMC</p>
                <p className={`${colors.text} font-bold text-lg ${bmi !== 'N/A' && Number(bmi) > 25 ? 'text-orange-400' : bmi !== 'N/A' && Number(bmi) < 18.5 ? 'text-yellow-400' : ''}`}>
                  {bmi}
                </p>
              </div>
              <div className="space-y-1">
                <p className={`${colors.textSecondary} text-xs`}>Pressão Arterial</p>
                <p className={`${colors.text} font-bold text-lg`}>
                  {medicalInfo.bloodPressure || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Condições Médicas */}
          <div className={`${colors.card} border ${colors.border} rounded-xl p-4`}>
            <h3 className={`${colors.text} font-semibold mb-4 flex items-center gap-2`}>
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              Condições Médicas
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
                <span className={`${colors.textSecondary} text-sm`}>Problema Cardíaco</span>
                <span className={`${colors.text} font-semibold ${medicalInfo.heartCondition ? 'text-red-400' : 'text-green-400'}`}>
                  {medicalInfo.heartCondition ? "Sim" : "Não"}
                </span>
              </div>

              {medicalInfo.injuries.length > 0 && (
                <div>
                  <p className={`${colors.textSecondary} text-xs mb-2 font-medium`}>
                    Lesões Registradas
                  </p>
                  <div className="space-y-1.5">
                    {medicalInfo.injuries.map((injury, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-orange-400/10 border border-orange-400/20">
                        <p className={`${colors.text} text-sm`}>• {injury}</p>
                      </div>
                    ))}
                  </div>
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
