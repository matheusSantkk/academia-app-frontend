import { useState } from "react";
import { Dumbbell, Eye, EyeOff, AlertCircle } from "lucide-react";
import type { UserData } from "../types";
import { api } from "../api";

const LoginScreen: React.FC<{ onLogin: (user: UserData) => void }> = ({
  onLogin,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const emailError = touched.email && email && !validateEmail(email);
  const passwordError = touched.password && password.length < 1;

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      setTouched({ email: true, password: true });
      return;
    }

    if (!validateEmail(email)) {
      setError("Email inválido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await api.login(email, password);
      onLogin(user);
    } catch {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (userType: "student" | "teacher") => {
    const quickEmail =
      userType === "teacher" ? "professor@academia.com" : "aluno@email.com";
    setEmail(quickEmail);
    setPassword("senha123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo e Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-lime-400 rounded-2xl mb-4 shadow-lg shadow-lime-400/20">
            <Dumbbell className="w-10 h-10 text-slate-900" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">FitTrack</h1>
          <p className="text-slate-400">Seu treino, seu progresso</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Email Input */}
          <div>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onBlur={() => setTouched({ ...touched, email: true })}
                placeholder="E-mail"
                className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors ${
                  emailError
                    ? "border-red-500"
                    : "border-slate-700 focus:border-lime-400"
                }`}
              />
            </div>
            {emailError && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                Email inválido
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onBlur={() => setTouched({ ...touched, password: true })}
                placeholder="Senha"
                className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors ${
                  passwordError
                    ? "border-red-500"
                    : "border-slate-700 focus:border-lime-400"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                Senha é obrigatória
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 flex items-center gap-2 text-red-400">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 bg-lime-400 hover:bg-lime-500 text-slate-900 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-lime-400/20"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                Entrando...
              </div>
            ) : (
              "Entrar"
            )}
          </button>
        </div>

        {/* Quick Access */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-slate-400">
                Acesso rápido
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin("student")}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-lime-400 text-white rounded-xl transition-all text-sm font-medium"
            >
              👤 Aluno
            </button>
            <button
              onClick={() => handleQuickLogin("teacher")}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-lime-400 text-white rounded-xl transition-all text-sm font-medium"
            >
              👨‍🏫 Professor
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs">
            Use as contas de teste acima ou qualquer email válido
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
