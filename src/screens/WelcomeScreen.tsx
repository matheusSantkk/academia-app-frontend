import { Dumbbell, User, GraduationCap } from "lucide-react";

interface Props {
  onSelectType: (type: "student" | "teacher") => void;
}

const WelcomeScreen: React.FC<Props> = ({ onSelectType }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo e Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-lime-400 rounded-2xl mb-4 shadow-lg shadow-lime-400/20">
            <Dumbbell className="w-10 h-10 text-slate-900" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">FormaMais</h1>
          <p className="text-slate-400">Seu treino, seu progresso</p>
        </div>

        {/* Selection Cards */}
        <div className="space-y-4">
          <button
            onClick={() => onSelectType("teacher")}
            className="w-full bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-lime-400 rounded-2xl p-6 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-lime-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8 text-slate-900" />
              </div>
              <div className="text-left flex-1">
                <h2 className="text-xl font-bold text-white mb-1">Professor</h2>
                <p className="text-slate-400 text-sm">
                  Acesse como instrutor para gerenciar alunos e treinos
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectType("student")}
            className="w-full bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-lime-400 rounded-2xl p-6 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="text-left flex-1">
                <h2 className="text-xl font-bold text-white mb-1">Aluno</h2>
                <p className="text-slate-400 text-sm">
                  Acesse como aluno para ver seus treinos e progresso
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs">
            Selecione o tipo de acesso para continuar
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;







