import { ReactNode } from "react";
import { MastodonteLogo } from "./MastodonteLogo";
import { QuoteCarousel } from "./QuoteCarousel";

interface AuthLayoutProps {
  children: ReactNode;
  showQuotes?: boolean;
}

export function AuthLayout({ children, showQuotes = true }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#191919" }}>
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes moveTrack {
          from { transform: perspective(500px) rotateX(60deg) scale(2) translateY(0); }
          to { transform: perspective(500px) rotateX(60deg) scale(2) translateY(51px); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.5; }
        }
        @keyframes rotateCircle {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spotlightMove {
          from { transform: translate(-10%, -10%); }
          to { transform: translate(10%, 10%); }
        }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out; }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out; }
        .animation-delay-200 { animation-delay: 0.2s; animation-fill-mode: both; }
      `}</style>

      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10 text-white">
            <MastodonteLogo />
          </div>
          {children}
        </div>
      </div>

      {showQuotes && <QuoteCarousel />}
    </div>
  );
}
