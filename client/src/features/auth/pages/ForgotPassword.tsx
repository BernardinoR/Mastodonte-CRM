import { useSignIn } from "@clerk/clerk-react";
import { useState } from "react";
import { Link } from "wouter";
import { Loader2, ArrowLeft, Mail, KeyRound, CheckCircle } from "lucide-react";
import { MastodonteLogo } from "../components/MastodonteLogo";
import { AuthStyles } from "../components/AuthStyles";
import { handleClerkError, redirectAfterAuth } from "../lib/authHelpers";

type Step = "email" | "code" | "success";

export default function ForgotPassword() {
  const { signIn, isLoaded, setActive } = useSignIn();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setLoading(true);
    setError("");

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep("code");
    } catch (err: unknown) {
      const errorResult = handleClerkError(err);
      setError(errorResult.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });

      if (result.status === "complete") {
        try {
          await setActive({ session: result.createdSessionId });
          setStep("success");
          setTimeout(() => {
            redirectAfterAuth("/");
          }, 2000);
        } catch (sessionErr) {
          console.error("Failed to activate session:", sessionErr);
          setError("Erro ao ativar sessão. Faça login novamente.");
        }
      } else {
        setError("Verificação adicional necessária. Entre em contato com o suporte.");
      }
    } catch (err: unknown) {
      const errorResult = handleClerkError(err);
      setError(errorResult.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signIn) return;
    
    if (!email || !email.trim()) {
      setError("Email não disponível. Por favor, volte e insira o email novamente.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setError("");
    } catch (err: unknown) {
      setError("Erro ao reenviar código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AuthStyles />

      <div
        className="flex-1 flex flex-col justify-center items-center p-10 relative z-10"
        style={{ backgroundColor: "#191919" }}
      >
        <div className="w-full max-w-[380px]">
          <div className="mb-8 text-white">
            <MastodonteLogo />
          </div>

          {step === "email" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-[#222] border border-[#333]">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    Esqueceu a senha?
                  </h2>
                  <p className="text-sm text-[#888]">
                    Enviaremos um código para seu email
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendCode}>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#888] mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    className="input-dark"
                    placeholder="nome@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    data-testid="input-forgot-email"
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
                  data-testid="button-send-code"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enviar código
                </button>

                <Link
                  href="/sign-in"
                  className="flex items-center justify-center gap-2 mt-6 text-sm text-[#666] hover:text-white transition-colors"
                  data-testid="link-back-to-login"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao login
                </Link>
              </form>
            </>
          )}

          {step === "code" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-[#222] border border-[#333]">
                  <KeyRound className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    Digite o código
                  </h2>
                  <p className="text-sm text-[#888]">
                    Enviamos um código para {email}
                  </p>
                </div>
              </div>

              <form onSubmit={handleResetPassword}>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#888] mb-1.5">
                    Código de verificação
                  </label>
                  <input
                    type="text"
                    className="input-dark text-center tracking-[0.5em] text-lg"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    required
                    data-testid="input-verification-code"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#888] mb-1.5">
                    Nova senha
                  </label>
                  <input
                    type="password"
                    className="input-dark"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    data-testid="input-new-password"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#888] mb-1.5">
                    Confirmar nova senha
                  </label>
                  <input
                    type="password"
                    className="input-dark"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    data-testid="input-confirm-password"
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
                  data-testid="button-reset-password"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Redefinir senha
                </button>

                <div className="mt-6 flex justify-center gap-5 text-sm">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-[#666] hover:text-white transition-colors"
                    disabled={loading}
                    data-testid="button-resend-code"
                  >
                    Reenviar código
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-[#666] hover:text-white transition-colors"
                    data-testid="button-change-email"
                  >
                    Alterar email
                  </button>
                </div>
              </form>
            </>
          )}

          {step === "success" && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-green-500/10 border border-green-500/30">
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Senha redefinida!
              </h2>
              <p className="text-sm text-[#888] mb-6">
                Você será redirecionado em instantes...
              </p>
              <Loader2 className="w-6 h-6 animate-spin text-white mx-auto" />
            </div>
          )}
        </div>
      </div>

      {/* Right side - Visual */}
      <div
        className="hidden lg:flex flex-[1.2] relative items-center justify-center overflow-hidden"
        style={{ background: "radial-gradient(circle at center, #1a1a1a 0%, #000000 70%)" }}
      >
        <div className="max-w-[500px] p-10 text-center z-10">
          <p className="text-[28px] leading-tight font-bold text-white mb-4 tracking-tight">
            "A segurança dos seus dados é nossa prioridade."
          </p>
          <p className="text-[13px] uppercase tracking-[3px] font-semibold text-[#888]">
            Mastodonte CRM
          </p>
        </div>
      </div>
    </div>
  );
}
