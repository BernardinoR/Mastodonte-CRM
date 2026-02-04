import { Loader2 } from "lucide-react";

export type TwoFactorStrategy = "totp" | "phone_code" | "backup_code" | "email_code";

interface TwoFactorFormProps {
  email: string;
  code: string;
  strategy: TwoFactorStrategy;
  error: string;
  loading: boolean;
  isLoaded: boolean;
  onCodeChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResendCode?: () => void;
  onBack: () => void;
}

function getStrategyDescription(strategy: TwoFactorStrategy, email: string): string {
  switch (strategy) {
    case "totp":
      return "Insira o código do seu aplicativo autenticador (Google Authenticator, Authy, etc.).";
    case "backup_code":
      return "Insira um dos seus códigos de backup.";
    case "email_code":
      return `Enviamos um código de verificação para ${email}. Insira-o abaixo.`;
    case "phone_code":
      return "Enviamos um código de verificação para seu telefone. Insira-o abaixo.";
    default:
      return "Insira o código de verificação.";
  }
}

function getStrategyLabel(strategy: TwoFactorStrategy): string {
  switch (strategy) {
    case "totp":
      return "Código do autenticador";
    case "backup_code":
      return "Código de backup";
    case "email_code":
      return "Código de verificação";
    case "phone_code":
      return "Código SMS";
    default:
      return "Código de verificação";
  }
}

export function TwoFactorForm({
  email,
  code,
  strategy,
  error,
  loading,
  isLoaded,
  onCodeChange,
  onSubmit,
  onResendCode,
  onBack,
}: TwoFactorFormProps) {
  const isBackupCode = strategy === "backup_code";
  const canResend = strategy === "phone_code" || strategy === "email_code";
  const maxLength = isBackupCode ? 10 : 6;
  const placeholder = isBackupCode ? "xxxxxxxx" : "000000";

  const handleCodeChange = (value: string) => {
    if (isBackupCode) {
      onCodeChange(value.slice(0, maxLength));
    } else {
      onCodeChange(value.replace(/\D/g, "").slice(0, maxLength));
    }
  };

  const isCodeValid = isBackupCode ? code.length >= 6 : code.length === 6;

  return (
    <>
      <h2 className="mb-2 text-2xl font-semibold text-white">Verificação em Duas Etapas</h2>
      <p className="mb-6 text-sm text-[#888]">{getStrategyDescription(strategy, email)}</p>

      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-[#888]">
            {getStrategyLabel(strategy)}
          </label>
          <input
            type="text"
            className={`input-dark text-center text-lg ${isBackupCode ? "tracking-normal" : "tracking-[0.5em]"}`}
            placeholder={placeholder}
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            maxLength={maxLength}
            autoComplete="one-time-code"
            required
            data-testid="input-2fa-code"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3">
            <p className="text-sm text-red-400" data-testid="text-error">
              {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          className="btn-submit flex items-center justify-center gap-2"
          disabled={loading || !isLoaded || !isCodeValid}
          data-testid="button-verify-2fa"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Verificar
        </button>

        <div className="mt-6 flex justify-center gap-5 text-sm">
          {canResend && onResendCode && (
            <>
              <button
                type="button"
                onClick={onResendCode}
                disabled={loading}
                className="text-[#666] transition-colors hover:text-white"
                data-testid="button-resend-2fa-code"
              >
                Reenviar código
              </button>
              <span className="text-[#444]">|</span>
            </>
          )}
          <button
            type="button"
            onClick={onBack}
            className="text-[#666] transition-colors hover:text-white"
            data-testid="button-back-to-login"
          >
            Voltar
          </button>
        </div>
      </form>
    </>
  );
}
