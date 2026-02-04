import { useState, useEffect } from "react";
import { VisualEffect, VisualEffectType } from "./VisualEffects";

export interface Quote {
  id: string;
  text: string;
  author: string;
  background: string;
  effect: VisualEffectType;
}

export const quotes: Quote[] = [
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

interface QuoteCarouselProps {
  intervalMs?: number;
}

export function QuoteCarousel({ intervalMs = 20000 }: QuoteCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  const currentQuote = quotes[currentIndex];

  return (
    <div
      className="relative hidden flex-1 flex-col items-center justify-center overflow-hidden transition-all duration-1000 lg:flex"
      style={{ background: currentQuote.background }}
    >
      <VisualEffect effect={currentQuote.effect} />
      <div className="relative z-10 max-w-lg px-12 text-center">
        <p
          key={currentQuote.id}
          className="animate-fadeInUp text-2xl font-light leading-relaxed text-white md:text-3xl"
        >
          {currentQuote.text}
        </p>
        <p className="animate-fadeInUp animation-delay-200 mt-6 text-lg tracking-wide text-[#888]">
          — {currentQuote.author}
        </p>
      </div>
      <div className="absolute bottom-12 flex gap-2">
        {quotes.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              i === currentIndex ? "w-6 bg-white" : "bg-white/30"
            }`}
            aria-label={`Go to quote ${i + 1}`}
            data-testid={`button-quote-${i}`}
          />
        ))}
      </div>
    </div>
  );
}
