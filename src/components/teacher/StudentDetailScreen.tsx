// src/components/teacher/StudentDetailScreen.tsx

import { useState, useEffect } from "react";
import { User, Heart, AlertCircle } from "lucide-react";
import type { StudentMedicalInfo } from "../../types";
import { api } from "../../api";

const StudentDetailScreen: React.FC = () => {
  const [medicalInfo, setMedicalInfo] = useState<StudentMedicalInfo | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Nota: O ID do aluno está 'hard-coded' como 's1' para fins de mock
    api.getMedicalInfo("s1").then((data) => {
      setMedicalInfo(data);
      setLoading(false);
    });
  }, []);

  if (loading || !medicalInfo) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Carregando...</div>
      </div>
    );
  }

  // Cálculo de IMC: Peso / (Altura * Altura)
  const bmi = (
    medicalInfo.weight /
    (medicalInfo.height * medicalInfo.height)
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-900 pb-24">
      <div className="bg-slate-800 p-6 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-16 h-16 bg-lime-400 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-slate-900" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">
              {medicalInfo.studentName}
            </h1>
            <p className="text-slate-400 text-sm">{medicalInfo.age} anos</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Informações Físicas
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-xs mb-1">Peso</p>
              <p className="text-white font-semibold">
                {medicalInfo.weight} kg
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Altura</p>
              <p className="text-white font-semibold">{medicalInfo.height} m</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">IMC</p>
              <p className="text-white font-semibold">{bmi}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Pressão</p>
              <p className="text-white font-semibold">
                {medicalInfo.bloodPressure}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Condições Médicas
          </h2>
          <div className="space-y-2">
            <div>
              <p className="text-slate-400 text-xs mb-1">Problema Cardíaco</p>
              <p className="text-white">
                {medicalInfo.heartCondition ? "Sim" : "Não"}
              </p>
            </div>
            {medicalInfo.injuries.length > 0 && (
              <div>
                <p className="text-slate-400 text-xs mb-1">Lesões</p>
                {medicalInfo.injuries.map((injury, idx) => (
                  <p key={idx} className="text-white text-sm">
                    {injury}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {medicalInfo.restrictions.length > 0 && (
          <div className="bg-slate-800 border border-orange-400 rounded-xl p-4">
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
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
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h2 className="text-white font-semibold mb-3">Observações</h2>
            <p className="text-slate-300 text-sm">{medicalInfo.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetailScreen;
