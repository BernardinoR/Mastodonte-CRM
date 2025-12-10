import { SignIn as ClerkSignIn } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

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
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const currentQuote = quotes[currentIndex];

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

          <ClerkSignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none p-0 border-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "bg-[#222] border border-[#333] text-white hover:bg-[#2a2a2a] hover:border-[#444] transition-all",
                socialButtonsBlockButtonText: "text-white font-medium",
                dividerLine: "bg-[#333]",
                dividerText: "text-[#555] uppercase text-xs tracking-wider",
                formFieldLabel: "text-[#888] text-xs font-medium",
                formFieldInput:
                  "bg-[#222] border border-[#333] text-white placeholder-[#666] focus:border-[#666] focus:bg-[#252525] focus:ring-2 focus:ring-white/5",
                formButtonPrimary:
                  "bg-white text-black hover:bg-[#e0e0e0] font-semibold transition-all active:scale-[0.98]",
                footerActionLink: "text-[#666] hover:text-white transition-colors",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-[#888] hover:text-white",
                formFieldInputShowPasswordButton: "text-[#666] hover:text-white",
                alertText: "text-red-400",
                formResendCodeLink: "text-[#888] hover:text-white",
              },
              layout: {
                socialButtonsPlacement: "top",
                showOptionalFields: false,
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
          />
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
