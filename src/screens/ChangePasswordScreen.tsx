import { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "../api";
import { APIError, handleAPIError } from "../api/client";

interface Props {
  user: { id: string; name: string; email: string };
  onPasswordChanged: () => void;
}

const ChangePasswordScreen: React.FC<Props> = ({ user, onPasswordChanged }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!newPassword || !confirmPassword) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      await api.changePassword(newPassword);
      setSuccess(true);
      
      // Aguardar um pouco antes de chamar onPasswordChanged
      setTimeout(() => {
        onPasswordChanged();
      }, 1500);
    } catch (error) {
      let errorMessage = "Erro ao alterar senha. Tente novamente.";
      
      if (error instanceof APIError) {
        if (error.statusCode === 401) {
          errorMessage = "Sessão expirada. Por favor, faça login novamente.";
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
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-lime-400 rounded-2xl mb-4 shadow-lg shadow-lime-400/20">
            <Lock className="w-10 h-10 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Trocar Senha</h1>
          <p className="text-slate-400">
            Olá, <span className="text-lime-400 font-semibold">{user.name}</span>
          </p>
          <p className="text-slate-400 text-sm mt-2">
            Por favor, defina uma nova senha para sua conta
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* New Password Input */}
          <div>
            <label className="block text-sm text-slate-300 mb-2 font-medium">
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                }}
                placeholder="Mínimo 6 caracteres"
                className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors ${
                  error && !validatePassword(newPassword) && newPassword
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
            {newPassword && !validatePassword(newPassword) && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                A senha deve ter no mínimo 6 caracteres
              </p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm text-slate-300 mb-2 font-medium">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                placeholder="Digite a senha novamente"
                className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors ${
                  error && confirmPassword && newPassword !== confirmPassword
                    ? "border-red-500"
                    : "border-slate-700 focus:border-lime-400"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                As senhas não coincidem
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

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-3 flex items-center gap-2 text-green-400">
              <CheckCircle2 size={18} />
              <span className="text-sm">Senha alterada com sucesso! Redirecionando...</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || success || !newPassword || !confirmPassword || newPassword !== confirmPassword || !validatePassword(newPassword)}
            className="w-full py-4 bg-lime-400 hover:bg-lime-500 text-slate-900 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-lime-400/20"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                Alterando...
              </div>
            ) : success ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 size={20} />
                Senha Alterada!
              </div>
            ) : (
              "Alterar Senha"
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-xs">
            Use uma senha segura com pelo menos 6 caracteres
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordScreen;




















