// src/screens/LoginScreen.tsx

import { useState } from "react";
import { Dumbbell } from "lucide-react";
import type { UserData } from "../types";
import { api } from "../api";

const LoginScreen: React.FC<{ onLogin: (user: UserData) => void }> = ({
  onLogin,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const user = await api.login(email, password);
      onLogin(user);
    } catch {
      alert("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-lime-400 rounded-2xl mb-4">
            <Dumbbell className="w-10 h-10 text-slate-900" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">FitTrack</h1>
          <p className="text-slate-400">Seu treino, seu progresso</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // Dica: use mock emails para testar facilmente
            placeholder="E-mail (ex: professor@academia.com)"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha (qualquer valor)"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 bg-lime-400 hover:bg-lime-500 text-slate-900 font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm mb-2">Contas de teste:</p>
          <p className="text-slate-500 text-xs">Aluno: qualquer@email.com</p>
          <p className="text-slate-500 text-xs">
            Professor: professor@academia.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
