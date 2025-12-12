import { useState, useEffect } from "react";
import { ArrowLeft, Eye, EyeOff, AlertCircle, Wifi, WifiOff, GraduationCap } from "lucide-react";
import type { UserData } from "../types";
import { api } from "../api";
import { APIError, handleAPIError } from "../api/client";
import { isMockMode, API_CONFIG } from "../api/config";

const LoginTeacherScreen: React.FC<{ 
  onLogin: (user: UserData) => void;
  onBack: () => void;
}> = ({
  onLogin,
  onBack,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline" | null>(null);
  const [isServerMode, setIsServerMode] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const emailError = touched.email && email && !validateEmail(email);
  const passwordError = touched.password && password.length < 1;

  useEffect(() => {
    const checkServerMode = () => {
      const mode = !isMockMode();
      setIsServerMode(mode);
      
      if (mode) {
        setServerStatus("checking");
        fetch(`${API_CONFIG.BASE_URL}/instructors`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
          .then(() => {
            setServerStatus("online");
          })
          .catch(() => {
            setServerStatus("offline");
          });
      } else {
        setServerStatus(null);
      }
    };

    checkServerMode();
  }, []);

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
      if (isServerMode && serverStatus === "offline") {
        setError("Servidor offline. Verifique se o backend está rodando.");
        setLoading(false);
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();

      console.log("[LoginTeacher] Tentando login:", { email: normalizedEmail });

      const user = await api.login(normalizedEmail, normalizedPassword);
      
      if (!user || !user.id) {
        setError("Resposta inválida do servidor. Tente novamente.");
        setLoading(false);
        return;
      }

      if (user.role === "teacher") {
        onLogin(user);
      } else {
        setError("Este login é apenas para instrutores.");
      }
    } catch (error) {
      let errorMessage = "Erro ao fazer login. Tente novamente.";
      
      if (error instanceof APIError) {
        if (error.statusCode === 401) {
          errorMessage = "Email ou senha incorretos. Verifique suas credenciais.";
        } else if (error.statusCode === 0) {
          errorMessage = "Erro de conexão. Verifique se o servidor está rodando em " + API_CONFIG.BASE_URL;
        } else {
          errorMessage = error.message || errorMessage;
        }
      } else {
        errorMessage = handleAPIError(error);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-lime-400 rounded-2xl mb-4 shadow-lg shadow-lime-400/20">
            <GraduationCap className="w-10 h-10 text-slate-900" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Login Professor</h1>
          <p className="text-slate-400">Acesso para instrutores</p>
          
          {isServerMode && serverStatus !== null && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
              {serverStatus === "checking" && (
                <>
                  <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-slate-400">Verificando conexão...</span>
                </>
              )}
              {serverStatus === "online" && (
                <>
                  <Wifi size={16} className="text-lime-400" />
                  <span className="text-lime-400">Conectado ao servidor</span>
                </>
              )}
              {serverStatus === "offline" && (
                <>
                  <WifiOff size={16} className="text-red-400" />
                  <span className="text-red-400">Servidor offline</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-slate-400 hover:text-slate-300 transition"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Voltar</span>
        </button>

        {/* Form */}
        <div className="space-y-4">
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
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 flex items-center gap-2 text-red-400">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

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
              "Entrar como Professor"
            )}
          </button>
        </div>

        {/* Quick Login */}
        <div className="mt-6">
          <button
            onClick={() => {
              setEmail("professor@academia.com");
              setPassword("senha123");
            }}
            className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-sm transition"
          >
            Preencher credenciais de teste
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginTeacherScreen;

