// src/components/teacher/TeacherDashboard.tsx

import { useState, useEffect } from "react";
import { User } from "lucide-react";
import type { StudentData } from "../../types";
import { api } from "../../api";

interface TeacherDashboardProps {
  setActiveTab: (tab: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  setActiveTab,
}) => {
  const [students, setStudents] = useState<StudentData[]>([]);

  useEffect(() => {
    api.getStudents().then(setStudents);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pb-24">
      <div className="bg-slate-800/50 backdrop-blur p-6">
        <h1 className="text-white text-2xl font-bold mb-6">
          Painel do Professor
        </h1>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-lime-400 rounded-2xl p-5">
            <div className="text-slate-700 text-xs font-medium mb-2">
              Total de Alunos
            </div>
            <div className="text-5xl font-black text-slate-900">
              {students.length}
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <div className="text-slate-400 text-xs font-medium mb-2">
              Ativos Hoje
            </div>
            <div className="text-5xl font-black text-white">3</div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-semibold">Alunos</h2>
          <button className="text-lime-400 text-sm font-semibold">
            Ver todos
          </button>
        </div>

        <div className="space-y-2">
          {students.map((student) => (
            // Ao clicar, navegamos para a tela de detalhes do aluno
            <div
              key={student.id}
              onClick={() => setActiveTab("student-detail")}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-lime-400 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-lime-400 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-900" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{student.name}</h3>
                  <p className="text-slate-400 text-sm">
                    {student.age} anos • Nível {student.level}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lime-400 font-bold text-sm">
                    {student.points}
                  </p>
                  <p className="text-slate-500 text-xs">XP</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
