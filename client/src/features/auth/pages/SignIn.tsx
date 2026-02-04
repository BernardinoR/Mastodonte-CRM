import { useSignIn } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { MastodonteLogo } from "../components/MastodonteLogo";
import { AuthStyles } from "../components/AuthStyles";
import { VisualEffect } from "../components/VisualEffects";
import { quotes } from "../components/QuoteCarousel";
import { LoginForm } from "../components/forms/LoginForm";
import { EmailVerificationForm } from "../components/forms/EmailVerificationForm";
import { TwoFactorForm, TwoFactorStrategy } from "../components/forms/TwoFactorForm";
import { handleClerkError, redirectAfterAuth } from "../lib/authHelpers";

type AuthView = "login" | "email-verification" | "two-factor";

export default function SignIn() {
  const { signIn, isLoaded, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const [authView, setAuthView] = useState<AuthView>("login");
  const [verificationCode, setVerificationCode] = useState("");
  const [emailAddressId, setEmailAddressId] = useState<string | null>(null);

  const [secondFactorCode, setSecondFactorCode] = useState("");
  const [secondFactorStrategy, setSecondFactorStrategy] = useState<TwoFactorStrategy | null>(null);
  const [secondFactorEmailId, setSecondFactorEmailId] = useState<string | null>(null);
  const [phoneId, setPhoneId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const currentQuote = quotes[currentQuoteIndex];

  const resetToLogin = () => {
    setAuthView("login");
    setVerificationCode("");
    setEmailAddressId(null);
    setSecondFactorCode("");
    setSecondFactorStrategy(null);
    setSecondFactorEmailId(null);
    setPhoneId(null);
    setError("");
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        redirectAfterAuth("/");
      } else if (result.status === "needs_first_factor") {
        const emailFactor = result.supportedFirstFactors?.find(
          (factor) => factor.strategy === "email_code",
        );
        if (emailFactor && "emailAddressId" in emailFactor) {
          const factorEmailId = emailFactor.emailAddressId;
          setEmailAddressId(factorEmailId);
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: factorEmailId,
          });
          setAuthView("email-verification");
          setError("");
        } else {
          setError("Verificação adicional necessária. Entre em contato com o suporte.");
        }
      } else if (result.status === "needs_second_factor") {
        await handleSecondFactorSetup(result);
      } else {
        setError("Verificação adicional necessária. Entre em contato com o suporte.");
      }
    } catch (err: unknown) {
      const errorResult = handleClerkError(err);
      if (errorResult.shouldRedirect && errorResult.redirectUrl) {
        redirectAfterAuth(errorResult.redirectUrl);
      } else if (errorResult.code === "strategy_for_user_invalid") {
        resetToLogin();
        setError(errorResult.message);
      } else {
        setError(errorResult.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSecondFactorSetup = async (result: {
    supportedSecondFactors?: Array<{
      strategy: string;
      phoneNumberId?: string;
      emailAddressId?: string;
    }> | null;
  }) => {
    if (!signIn) return;

    const totpFactor = result.supportedSecondFactors?.find((factor) => factor.strategy === "totp");
    const phoneFactor = result.supportedSecondFactors?.find(
      (factor) => factor.strategy === "phone_code",
    );
    const backupCodeFactor = result.supportedSecondFactors?.find(
      (factor) => factor.strategy === "backup_code",
    );

    if (totpFactor) {
      setSecondFactorStrategy("totp");
      setAuthView("two-factor");
      setError("");
    } else if (phoneFactor && phoneFactor.phoneNumberId) {
      setPhoneId(phoneFactor.phoneNumberId);
      setSecondFactorStrategy("phone_code");
      await signIn.prepareSecondFactor({
        strategy: "phone_code",
        phoneNumberId: phoneFactor.phoneNumberId,
      });
      setAuthView("two-factor");
      setError("");
    } else if (backupCodeFactor) {
      setSecondFactorStrategy("backup_code");
      setAuthView("two-factor");
      setError("");
    } else {
      const emailCodeFactor = result.supportedSecondFactors?.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor && emailCodeFactor.emailAddressId) {
        const factorEmailId = emailCodeFactor.emailAddressId;
        setSecondFactorEmailId(factorEmailId);
        setSecondFactorStrategy("email_code");
        await signIn.prepareSecondFactor({
          strategy: "email_code",
          emailAddressId: factorEmailId,
        });
        setAuthView("two-factor");
        setError("");
      } else {
        const factorStrategies =
          result.supportedSecondFactors?.map((f) => f.strategy).join(", ") || "nenhum";
        setError(
          `Método de 2FA não suportado (${factorStrategies}). Entre em contato com o suporte.`,
        );
      }
    }
  };

  const handleVerifyEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: verificationCode,
      });

      if (result.status === "complete") {
        try {
          await setActive({ session: result.createdSessionId });
          redirectAfterAuth("/");
        } catch (sessionErr) {
          console.error("Failed to activate session:", sessionErr);
          setError("Erro ao ativar sessão. Tente novamente.");
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

  const handleResendEmailCode = async () => {
    if (!isLoaded || !signIn || !emailAddressId) return;

    setLoading(true);
    setError("");

    try {
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailAddressId,
      });
      setError("");
    } catch (err: unknown) {
      setError("Erro ao reenviar código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySecondFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn || !secondFactorStrategy) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: secondFactorStrategy,
        code: secondFactorCode,
      });

      if (result.status === "complete") {
        try {
          await setActive({ session: result.createdSessionId });
          redirectAfterAuth("/");
        } catch (sessionErr) {
          console.error("Failed to activate session:", sessionErr);
          setError("Erro ao ativar sessão. Tente novamente.");
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

  const handleResendSecondFactorCode = async () => {
    if (!isLoaded || !signIn) return;
    if (secondFactorStrategy !== "phone_code" && secondFactorStrategy !== "email_code") return;

    setLoading(true);
    setError("");

    try {
      if (secondFactorStrategy === "phone_code" && phoneId) {
        await signIn.prepareSecondFactor({
          strategy: "phone_code",
          phoneNumberId: phoneId,
        });
      } else if (secondFactorStrategy === "email_code" && secondFactorEmailId) {
        await signIn.prepareSecondFactor({
          strategy: "email_code",
          emailAddressId: secondFactorEmailId,
        });
      }
      setError("");
    } catch (err: unknown) {
      setError("Erro ao reenviar código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn) return;

    setGoogleLoading(true);
    setError("");

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: unknown) {
      console.error("Google OAuth error:", err);
      const clerkError = err as { errors?: Array<{ message: string; longMessage?: string }> };
      if (clerkError.errors && clerkError.errors.length > 0) {
        setError(clerkError.errors[0].longMessage || clerkError.errors[0].message);
      } else {
        setError("Erro ao conectar com Google. Tente novamente.");
      }
      setGoogleLoading(false);
    }
  };

  const renderAuthForm = () => {
    switch (authView) {
      case "email-verification":
        return (
          <EmailVerificationForm
            email={email}
            code={verificationCode}
            error={error}
            loading={loading}
            isLoaded={isLoaded}
            onCodeChange={setVerificationCode}
            onSubmit={handleVerifyEmailCode}
            onResendCode={handleResendEmailCode}
            onBack={resetToLogin}
          />
        );

      case "two-factor":
        return secondFactorStrategy ? (
          <TwoFactorForm
            email={email}
            code={secondFactorCode}
            strategy={secondFactorStrategy}
            error={error}
            loading={loading}
            isLoaded={isLoaded}
            onCodeChange={setSecondFactorCode}
            onSubmit={handleVerifySecondFactor}
            onResendCode={handleResendSecondFactorCode}
            onBack={resetToLogin}
          />
        ) : null;

      default:
        return (
          <LoginForm
            email={email}
            password={password}
            error={error}
            loading={loading}
            googleLoading={googleLoading}
            isLoaded={isLoaded}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleEmailSignIn}
            onGoogleSignIn={handleGoogleSignIn}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AuthStyles />

      {/* LEFT SIDE: LOGIN FORM */}
      <div
        className="relative z-10 flex flex-1 flex-col items-center justify-center p-10"
        style={{
          backgroundColor: "#191919",
          borderRight: "1px solid #2a2a2a",
        }}
      >
        <div className="w-full max-w-[380px]">
          <div className="mb-8 text-white">
            <MastodonteLogo />
          </div>
          {renderAuthForm()}
        </div>
      </div>

      {/* RIGHT SIDE: VISUAL QUOTES */}
      <div
        className="relative hidden flex-[1.2] items-center justify-center overflow-hidden transition-all duration-500 lg:flex"
        style={{ background: currentQuote.background }}
        key={currentQuote.id}
      >
        <VisualEffect effect={currentQuote.effect} />

        <div
          className="relative z-10 max-w-[600px] p-10 text-center"
          style={{ animation: "fadeInOption 0.8s ease forwards" }}
        >
          <p
            className={`mb-6 text-[32px] font-bold leading-tight tracking-tight text-white ${
              currentQuote.effect === "speed-lines" ? "shine-text" : ""
            } ${currentQuote.effect === "track-lines" ? "font-light italic" : ""}`}
          >
            {currentQuote.text}
          </p>
          {currentQuote.effect === "pulse-bg" && (
            <div
              className="mx-auto mb-5 h-[3px] w-[60px] rounded-sm"
              style={{
                backgroundColor: "#C5A059",
                boxShadow: "0 0 10px rgba(197, 160, 89, 0.3)",
              }}
            />
          )}
          <p
            className="text-[13px] font-semibold uppercase tracking-[3px]"
            style={{
              color: currentQuote.effect === "pulse-bg" ? "#C5A059" : "#888",
            }}
          >
            {currentQuote.author}
          </p>
        </div>

        {/* Navigation dots */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
          {quotes.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuoteIndex(idx)}
              className={`h-2 w-2 rounded-full transition-all ${
                idx === currentQuoteIndex ? "w-6 bg-white" : "bg-white/30 hover:bg-white/50"
              }`}
              data-testid={`quote-dot-${idx}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
