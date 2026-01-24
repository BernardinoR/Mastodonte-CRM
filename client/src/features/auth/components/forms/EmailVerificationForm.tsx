import { Loader2 } from "lucide-react";

interface EmailVerificationFormProps {
  email: string;
  code: string;
  error: string;
  loading: boolean;
  isLoaded: boolean;
  onCodeChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResendCode: () => void;
  onBack: () => void;
}

export function EmailVerificationForm({
  email,
  code,
  error,
  loading,
  isLoaded,
  onCodeChange,
  onSubmit,
  onResendCode,
  onBack,
}: EmailVerificationFormProps) {
  return (
    <>
      <h2 className="text-2xl font-semibold text-white mb-2">
        Verificação de Email
      </h2>
      <p className="text-sm text-[#888] mb-6">
        Enviamos um código de verificação para <strong className="text-white">{email}</strong>. Insira-o abaixo para continuar.
      </p>
      
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-xs font-medium text-[#888] mb-1.5">
            Código de verificação
          </label>
          <input
            type="text"
            className="input-dark text-center tracking-[0.5em] text-lg"
            placeholder="000000"
            value={code}
            onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            autoComplete="one-time-code"
            required
            data-testid="input-verification-code"
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
          disabled={loading || !isLoaded || code.length !== 6}
          data-testid="button-verify-code"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Verificar
        </button>

        <div className="mt-6 flex justify-center gap-5 text-sm">
          <button
            type="button"
            onClick={onResendCode}
            disabled={loading}
            className="text-[#666] hover:text-white transition-colors"
            data-testid="button-resend-code"
          >
            Reenviar código
          </button>
          <span className="text-[#444]">|</span>
          <button
            type="button"
            onClick={onBack}
            className="text-[#666] hover:text-white transition-colors"
            data-testid="button-back-to-login"
          >
            Voltar
          </button>
        </div>
      </form>
    </>
  );
}
