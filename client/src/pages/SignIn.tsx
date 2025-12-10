import { useSignIn } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

const quotes = [
  {
    id: "senna",
    text: '"Não tenho ídolos. Tenho admiração por trabalho, dedicação e competência."',
    author: "Ayrton Senna",
    background: "radial-gradient(circle at bottom, #222 0%, #000 100%)",
    effect: "track-lines",
  },
  {
    id: "rocky",
    text: '"Ninguém vai bater tão forte como a vida. Mas não se trata de bater forte."',
    author: "Rocky Balboa",
    background: "radial-gradient(circle at center, #1a1a1a 0%, #000000 70%)",
    effect: "pulse-bg",
  },
  {
    id: "aurelius",
    text: '"Você tem poder sobre sua mente - não sobre eventos externos. Perceba isso e você encontrará a força."',
    author: "Marco Aurélio",
    background: "#080808",
    effect: "stoic-circle",
  },
  {
    id: "jordan",
    text: '"Algumas pessoas querem que aconteça, outras desejam que aconteça, outras fazem acontecer."',
    author: "Michael Jordan",
    background: "linear-gradient(135deg, #000 0%, #1a1a1a 100%)",
    effect: "spotlight",
  },
  {
    id: "kobe",
    text: '"Tudo o que é negativo - pressão, desafios - é uma oportunidade para eu crescer."',
    author: "Kobe Bryant",
    background: "#000",
    effect: "speed-lines",
  },
];

function MastodonteLogo() {
  return (
    <svg
      width="200"
      height="50"
      viewBox="0 0 280 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-fadeInDown"
    >
      <rect x="0" y="25" width="10" height="25" rx="2" fill="currentColor" />
      <rect x="15" y="15" width="10" height="35" rx="2" fill="currentColor" />
      <path
        d="M30 15H40V35C40 45 50 45 50 35"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <text
        x="70"
        y="45"
        fontWeight="900"
        fontSize="32"
        letterSpacing="0"
        fill="currentColor"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Mastodonte.
      </text>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.52 12.29C23.52 11.43 23.44 10.61 23.3 9.82H12V14.45H18.46C18.18 15.92 17.33 17.17 16.06 18.01V20.97H19.93C22.2 18.88 23.52 15.8 23.52 12.29Z" fill="#4285F4"/>
      <path d="M12 24C15.24 24 17.96 22.92 19.93 21.1L16.06 18.14C14.99 18.86 13.61 19.28 12 19.28C8.87 19.28 6.22 17.17 5.27 14.33H1.26V17.43C3.25 21.38 7.34 24 12 24Z" fill="#34A853"/>
      <path d="M5.27 14.33C5.03 13.61 4.89 12.82 4.89 12C4.89 11.18 5.03 10.39 5.27 9.67V6.57H1.26C0.46 8.18 0 10.03 0 12C0 13.97 0.46 15.82 1.26 17.43L5.27 14.33Z" fill="#FBBC05"/>
      <path d="M12 4.72C13.76 4.72 15.34 5.33 16.58 6.51L19.99 3.1C17.95 1.19 15.23 0 12 0C7.34 0 3.25 2.62 1.26 6.57L5.27 9.67C6.22 6.83 8.87 4.72 12 4.72Z" fill="#EA4335"/>
    </svg>
  );
}

function TrackLines() {
  return (
    <div
      className="absolute w-full h-full opacity-50"
      style={{
        background:
          "repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.03) 50px, rgba(255,255,255,0.03) 51px)",
        transform: "perspective(500px) rotateX(60deg) scale(2)",
        animation: "moveTrack 2s linear infinite",
      }}
    />
  );
}

function PulseBg() {
  return (
    <div
      className="absolute top-1/2 left-1/2 w-[60vw] h-[60vw] rounded-full"
      style={{
        transform: "translate(-50%, -50%)",
        background:
          "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)",
        animation: "heartbeat 4s infinite ease-in-out",
      }}
    />
  );
}

function StoicCircle() {
  return (
    <div
      className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
      style={{
        border: "1px solid rgba(255,255,255,0.1)",
        animation: "rotateCircle 60s linear infinite",
      }}
    />
  );
}

function Spotlight() {
  return (
    <div
      className="absolute w-[200%] h-[200%]"
      style={{
        top: "-50%",
        left: "-50%",
        background:
          "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 40%)",
        animation: "spotlightMove 10s infinite alternate ease-in-out",
      }}
    />
  );
}

function SpeedLines() {
  return (
    <div
      className="absolute top-0 left-0 w-full h-full"
      style={{
        background:
          "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px)",
      }}
    />
  );
}

function VisualEffect({ effect }: { effect: string }) {
  switch (effect) {
    case "track-lines":
      return <TrackLines />;
    case "pulse-bg":
      return <PulseBg />;
    case "stoic-circle":
      return <StoicCircle />;
    case "spotlight":
      return <Spotlight />;
    case "speed-lines":
      return <SpeedLines />;
    default:
      return null;
  }
}

export default function SignIn() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const [, setLocation] = useLocation();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const currentQuote = quotes[currentIndex];

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
        setLocation("/");
      } else {
        setError("Verificação adicional necessária. Entre em contato com o suporte.");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string; code: string }> };
      if (clerkError.errors && clerkError.errors.length > 0) {
        const errorCode = clerkError.errors[0].code;
        if (errorCode === "form_password_incorrect") {
          setError("Senha incorreta. Tente novamente.");
        } else if (errorCode === "form_identifier_not_found") {
          setError("Email não encontrado. Verifique o endereço.");
        } else {
          setError(clerkError.errors[0].message);
        }
      } else {
        setError("Erro ao fazer login. Tente novamente.");
      }
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
      const clerkError = err as { errors?: Array<{ message: string }> };
      if (clerkError.errors && clerkError.errors.length > 0) {
        setError(clerkError.errors[0].message);
      } else {
        setError("Erro ao conectar com Google. Tente novamente.");
      }
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInOption {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes moveTrack {
          from { background-position: 0 0; }
          to { background-position: 0 100px; }
        }
        @keyframes heartbeat {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
        }
        @keyframes rotateCircle {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spotlightMove {
          from { transform: translate(-10%, -10%); }
          to { transform: translate(10%, 10%); }
        }
        @keyframes shineText {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.8s ease-out;
        }
        .shine-text {
          background: linear-gradient(110deg, #888 30%, #fff 50%, #888 70%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shineText 5s linear infinite;
        }
        .input-dark {
          width: 100%;
          padding: 12px 16px;
          background-color: #222;
          border: 1px solid #333;
          border-radius: 6px;
          color: white;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s ease;
        }
        .input-dark:focus {
          outline: none;
          border-color: #666;
          background-color: #252525;
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.05);
        }
        .input-dark::placeholder {
          color: #666;
        }
        .btn-google {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px;
          background-color: #222;
          border: 1px solid #333;
          border-radius: 6px;
          color: #FFF;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s, border-color 0.2s;
        }
        .btn-google:hover:not(:disabled) {
          background-color: #2a2a2a;
          border-color: #444;
        }
        .btn-google:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .btn-submit {
          width: 100%;
          padding: 12px;
          background-color: #FFFFFF;
          color: #000000;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.1s, background-color 0.2s;
          margin-top: 8px;
        }
        .btn-submit:hover:not(:disabled) {
          background-color: #e0e0e0;
        }
        .btn-submit:active:not(:disabled) {
          transform: scale(0.98);
        }
        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>

      {/* LEFT SIDE: LOGIN FORM */}
      <div
        className="flex-1 flex flex-col justify-center items-center p-10 relative z-10"
        style={{
          backgroundColor: "#191919",
          borderRight: "1px solid #2a2a2a",
        }}
      >
        <div className="w-full max-w-[380px]">
          <div className="mb-8 text-white">
            <MastodonteLogo />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Bem-vindo de volta
          </h2>
          <p className="text-sm text-[#888] mb-6">
            Insira seus dados para acessar o painel.
          </p>

          {/* Google Button */}
          <button
            type="button"
            className="btn-google"
            onClick={handleGoogleSignIn}
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

          {/* Divider */}
          <div className="flex items-center my-6 text-[#555] text-xs uppercase tracking-wider">
            <div className="flex-1 h-px bg-[#333]" />
            <span className="px-3">ou continue com</span>
            <div className="flex-1 h-px bg-[#333]" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignIn}>
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
                onChange={(e) => setPassword(e.target.value)}
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
              <a
                href="#"
                className="text-[#666] hover:text-white transition-colors"
                data-testid="link-forgot-password"
              >
                Esqueceu a senha?
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE: VISUAL */}
      <div
        className="hidden lg:flex flex-[1.2] relative items-center justify-center overflow-hidden transition-all duration-500"
        style={{ background: currentQuote.background }}
        key={currentQuote.id}
      >
        <VisualEffect effect={currentQuote.effect} />

        <div
          className="max-w-[600px] p-10 text-center z-10 relative"
          style={{ animation: "fadeInOption 0.8s ease forwards" }}
        >
          <p
            className={`text-[32px] leading-tight font-bold text-white mb-6 tracking-tight ${
              currentQuote.effect === "speed-lines" ? "shine-text" : ""
            } ${currentQuote.effect === "track-lines" ? "italic font-light" : ""}`}
          >
            {currentQuote.text}
          </p>
          {currentQuote.effect === "pulse-bg" && (
            <div
              className="w-[60px] h-[3px] mx-auto mb-5 rounded-sm"
              style={{
                backgroundColor: "#C5A059",
                boxShadow: "0 0 10px rgba(197, 160, 89, 0.3)",
              }}
            />
          )}
          <p
            className="text-[13px] uppercase tracking-[3px] font-semibold"
            style={{
              color:
                currentQuote.effect === "pulse-bg" ? "#C5A059" : "#888",
            }}
          >
            {currentQuote.author}
          </p>
        </div>

        {/* Navigation dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {quotes.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/30 hover:bg-white/50"
              }`}
              data-testid={`quote-dot-${idx}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
