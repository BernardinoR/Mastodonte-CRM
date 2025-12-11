import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import { GoogleIcon } from "../GoogleIcon";

interface LoginFormProps {
  email: string;
  password: string;
  error: string;
  loading: boolean;
  googleLoading: boolean;
  isLoaded: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleSignIn: () => void;
}

export function LoginForm({
  email,
  password,
  error,
  loading,
  googleLoading,
  isLoaded,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onGoogleSignIn,
}: LoginFormProps) {
  return (
    <>
      <h2 className="text-2xl font-semibold text-white mb-2">
        Bem-vindo de volta
      </h2>
      <p className="text-sm text-[#888] mb-6">
        Insira seus dados para acessar o painel.
      </p>

      <button
        type="button"
        className="btn-google"
        onClick={onGoogleSignIn}
        disabled={googleLoading || !isLoaded}
        data-testid="button-google-signin"
      >
        {googleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Continuar com Google
      </button>

      <div className="flex items-center my-6 text-[#555] text-xs uppercase tracking-wider">
        <div className="flex-1 h-px bg-[#333]" />
        <span className="px-3">ou continue com</span>
        <div className="flex-1 h-px bg-[#333]" />
      </div>

      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-xs font-medium text-[#888] mb-1.5">
            E-mail
          </label>
          <input
            type="email"
            className="input-dark"
            placeholder="nome@exemplo.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            autoComplete="email"
            required
            data-testid="input-email"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-[#888] mb-1.5">
            Senha
          </label>
          <input
            type="password"
            className="input-dark"
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            autoComplete="current-password"
            required
            data-testid="input-password"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
            <p className="text-sm text-red-400" data-testid="text-error">
              {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          className="btn-submit flex items-center justify-center gap-2"
          disabled={loading || !isLoaded}
          data-testid="button-signin"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Entrar
        </button>

        <div className="mt-6 flex justify-center gap-5 text-sm">
          <Link
            href="/forgot-password"
            className="text-[#666] hover:text-white transition-colors"
            data-testid="link-forgot-password"
          >
            Esqueceu a senha?
          </Link>
        </div>
      </form>
    </>
  );
}
