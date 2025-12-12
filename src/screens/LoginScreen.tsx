import { useState, useEffect } from "react";
import { Dumbbell, Eye, EyeOff, AlertCircle, Wifi, WifiOff } from "lucide-react";
import type { UserData } from "../types";
import { api } from "../api";
import { APIError, handleAPIError } from "../api/client";
import { isMockMode, API_CONFIG } from "../api/config";

const LoginScreen: React.FC<{ 
  onLogin: (user: UserData) => void;
  userType?: "student" | "teacher";
}> = ({
  onLogin,
  userType,
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

  // Verificar modo e status do servidor
  useEffect(() => {
    const checkServerMode = () => {
      const mode = !isMockMode();
      setIsServerMode(mode);
      
      if (mode) {
        setServerStatus("checking");
        // Tentar fazer uma requisição simples para verificar se o servidor está online
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
      // Verificar se está em modo server e se o servidor está offline
      if (isServerMode && serverStatus === "offline") {
        setError("Servidor offline. Verifique se o backend está rodando.");
        setLoading(false);
        return;
      }

      // Normalizar email (trim e lowercase)
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();

      console.log("Tentando login com email:", normalizedEmail, "Tipo:", userType || "auto");

      let user: UserData & { needsPasswordChange?: boolean };
      
      // Se userType não foi especificado, tentar detectar automaticamente
      // ou tentar primeiro como professor, depois como aluno
      if (!userType) {
        try {
          // Tentar primeiro como professor
          user = await api.login(normalizedEmail, normalizedPassword);
          if (user.role !== "teacher") {
            throw new Error("Não é professor");
          }
        } catch (error) {
          // Se falhar, tentar como aluno
          console.log("Tentando login como aluno...");
          const memberApi = api as typeof api & {
            memberLogin: (email: string, password: string) => Promise<UserData & { needsPasswordChange?: boolean }>;
          };
          user = await memberApi.memberLogin(normalizedEmail, normalizedPassword);
        }
      } else if (userType === "teacher") {
        user = await api.login(normalizedEmail, normalizedPassword);
      } else {
        const memberApi = api as typeof api & {
          memberLogin: (email: string, password: string) => Promise<UserData & { needsPasswordChange?: boolean }>;
        };
        user = await memberApi.memberLogin(normalizedEmail, normalizedPassword);
      }
      
      // Verificar se o login retornou um usuário válido
      if (!user || !user.id) {
        setError("Resposta inválida do servidor. Tente novamente.");
        setLoading(false);
        return;
      }

      // Login bem-sucedido
      onLogin(user);
    } catch (error) {
      let errorMessage = "Erro ao fazer login. Tente novamente.";
      
      if (error instanceof APIError) {
        if (error.statusCode === 401) {
          errorMessage = "Email ou senha incorretos. Verifique suas credenciais.";
        } else if (error.statusCode === 404) {
          errorMessage = "Instrutor não encontrado. Verifique se o email está correto ou se o cadastro foi realizado.";
        } else if (error.statusCode === 0) {
          errorMessage = "Erro de conexão. Verifique se o servidor está rodando em " + API_CONFIG.BASE_URL;
        } else if (error.statusCode === 422) {
          errorMessage = "Dados inválidos. Verifique o formato do email.";
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

  const handleQuickLogin = (userType: "student" | "teacher") => {
    if (userType === "teacher") {
      setEmail("professor@academia.com");
      setPassword("senha123");
    } else {
      // Para aluno, não podemos preencher automaticamente pois precisa do email e telefone do aluno cadastrado
      setEmail("");
      setPassword("");
      setError("Para login de aluno, use o email cadastrado e a senha padrão: 123");
    }
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
          
          {/* Indicador de Status do Servidor */}
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
          {!isServerMode && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
              <span>Modo de desenvolvimento (Mock)</span>
            </div>
          )}
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
        <div className="mt-8 text-center space-y-2">
          <p className="text-slate-500 text-xs">
            {isServerMode 
              ? "Faça login com suas credenciais cadastradas no sistema"
              : "Use as contas de teste acima ou qualquer email válido"
            }
          </p>
          {isServerMode && (
            <div className="space-y-1">
              <p className="text-slate-600 text-xs">
                <strong>Professor:</strong> Email e senha cadastrados
              </p>
              <p className="text-slate-600 text-xs">
                <strong>Aluno:</strong> Email cadastrado e senha padrão: 123
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
