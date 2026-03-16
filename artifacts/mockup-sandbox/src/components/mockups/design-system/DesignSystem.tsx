import { useState, useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LayoutDashboard, Users, CheckSquare, Layers, Plus, ChevronLeft, ChevronRight,
  LogOut, Shield, Search, Settings, Bell, Calendar, Mail, MessageSquare,
  Home, Inbox, Star, Heart, Zap, Eye, Download, Upload, Trash2, Edit,
  Filter, BarChart3, PieChart, TrendingUp, Globe, Lock, Unlock, Copy,
  Check, X, AlertTriangle, Info, HelpCircle, ArrowRight, ArrowUp, ArrowDown,
  RefreshCw, ExternalLink, Bookmark, Share2, MoreHorizontal, Menu, Moon, Sun,
} from "lucide-react";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, isVisible };
}

function RevealSection({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function SectionWrapper({ id, children, title, subtitle }: { id: string; children: ReactNode; title: string; subtitle: string }) {
  return (
    <section id={id} className="relative px-6 py-20 md:px-12 lg:px-24">
      <div className="relative z-10 mx-auto max-w-7xl">
        <RevealSection>
          <div className="mb-12">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">{subtitle}</p>
            <h2 className="text-3xl font-bold text-white md:text-4xl">{title}</h2>
            <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-300" />
          </div>
        </RevealSection>
        {children}
      </div>
    </section>
  );
}

function MeshGradientBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
      <div
        className="absolute -left-1/4 -top-1/4 h-[60%] w-[60%] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          animation: "meshFloat1 20s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 h-[50%] w-[50%] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          animation: "meshFloat2 25s ease-in-out infinite",
        }}
      />
      <div
        className="absolute left-1/3 top-1/2 h-[40%] w-[40%] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 60%)",
          animation: "meshFloat3 18s ease-in-out infinite",
        }}
      />
    </div>
  );
}

function GeometricLines() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04]">
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070709]">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 60%)",
            animation: "heroGlow 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.02) 80px, rgba(255,255,255,0.02) 81px)",
            transform: "perspective(500px) rotateX(60deg) scale(2)",
            animation: "heroTrack 3s linear infinite",
          }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            border: "1px solid rgba(255,255,255,0.06)",
            animation: "heroRotate 60s linear infinite",
          }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            border: "1px solid rgba(255,255,255,0.04)",
            animation: "heroRotate 45s linear infinite reverse",
          }}
        />
        <div
          className="absolute h-[200%] w-[200%]"
          style={{
            top: "-50%", left: "-50%",
            background: "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 40%)",
            animation: "heroSpotlight 12s infinite alternate ease-in-out",
          }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[5] hidden overflow-hidden lg:block">
        <div
          className="absolute left-[8%] top-[20%] rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-sm"
          style={{
            opacity: mounted ? 0.7 : 0,
            transform: mounted ? "translateY(0)" : "translateY(30px)",
            transition: "all 1.2s ease 0.8s",
            animation: mounted ? "heroFloat1 6s ease-in-out infinite 1.2s" : "none",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-xs text-white/60">Online</span>
          </div>
        </div>
        <div
          className="absolute right-[10%] top-[25%] rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 backdrop-blur-sm"
          style={{
            opacity: mounted ? 0.6 : 0,
            transform: mounted ? "translateY(0)" : "translateY(30px)",
            transition: "all 1.2s ease 1s",
            animation: mounted ? "heroFloat2 7s ease-in-out infinite 1.4s" : "none",
          }}
        >
          <span className="text-xs font-medium text-blue-400">Primary</span>
        </div>
        <div
          className="absolute bottom-[25%] left-[12%] rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 backdrop-blur-sm"
          style={{
            opacity: mounted ? 0.5 : 0,
            transform: mounted ? "translateY(0)" : "translateY(30px)",
            transition: "all 1.2s ease 1.2s",
            animation: mounted ? "heroFloat3 8s ease-in-out infinite 1.6s" : "none",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-300" />
            <div>
              <p className="text-[10px] text-white/40">Color</p>
              <p className="font-mono text-xs text-white/60">#1370E8</p>
            </div>
          </div>
        </div>
        <div
          className="absolute bottom-[30%] right-[8%] rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 backdrop-blur-sm"
          style={{
            opacity: mounted ? 0.5 : 0,
            transform: mounted ? "translateY(0)" : "translateY(30px)",
            transition: "all 1.2s ease 1.4s",
            animation: mounted ? "heroFloat1 9s ease-in-out infinite 1.8s" : "none",
          }}
        >
          <p className="text-xs text-white/50" style={{ fontFamily: "'Inter', sans-serif" }}>Aa</p>
          <p className="text-[10px] text-white/30">Inter · 400</p>
        </div>
      </div>
      <div className="relative z-10 text-center px-6">
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-30px)",
            transition: "all 0.8s ease",
          }}
        >
          <svg width="220" height="55" viewBox="0 0 280 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="25" width="10" height="25" rx="2" fill="white" />
            <rect x="15" y="15" width="10" height="35" rx="2" fill="white" />
            <path d="M30 15H40V35C40 45 50 45 50 35" stroke="white" strokeWidth="10" strokeLinecap="round" />
            <text x="70" y="45" fontWeight="900" fontSize="32" letterSpacing="0" fill="white" style={{ fontFamily: "'Inter', sans-serif" }}>Mastodonte.</text>
          </svg>
        </div>
        <h1
          className="hero-shine-text mt-8 text-5xl font-black tracking-tight md:text-7xl"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: "all 1s ease 0.3s",
          }}
        >
          Design System
        </h1>
        <p
          className="mx-auto mt-6 max-w-xl text-lg text-white/50"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: "all 1s ease 0.5s",
          }}
        >
          A referência visual completa para o ecossistema Mastodonte CRM.
          Tokens, tipografia, cores, componentes e animações documentados.
        </p>
        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: "all 1s ease 0.7s",
          }}
        >
          <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-300">v1.0</Badge>
          <Badge variant="outline" className="border-white/10 bg-white/5 text-white/60">Inter · Tailwind · Shadcn</Badge>
          <Badge variant="outline" className="border-white/10 bg-white/5 text-white/60">Dark + Light</Badge>
        </div>
        <div
          className="mt-16 flex items-center justify-center gap-2 text-white/30"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 1.2s ease 1s",
            animation: mounted ? "heroBounce 2s ease-in-out infinite" : "none",
          }}
        >
          <ArrowDown className="h-5 w-5" />
          <span className="text-xs uppercase tracking-widest">Scroll para explorar</span>
        </div>
      </div>
    </section>
  );
}

function TypographySection() {
  const typographyScale = [
    { label: "h1", element: "h1", size: "48px / 3rem", weight: "800", lineHeight: "1.1", letterSpacing: "-0.02em", sample: "Heading One" },
    { label: "h2", element: "h2", size: "36px / 2.25rem", weight: "700", lineHeight: "1.2", letterSpacing: "-0.015em", sample: "Heading Two" },
    { label: "h3", element: "h3", size: "30px / 1.875rem", weight: "700", lineHeight: "1.25", letterSpacing: "-0.01em", sample: "Heading Three" },
    { label: "h4", element: "h4", size: "24px / 1.5rem", weight: "600", lineHeight: "1.3", letterSpacing: "-0.005em", sample: "Heading Four" },
    { label: "h5", element: "h5", size: "20px / 1.25rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", sample: "Heading Five" },
    { label: "h6", element: "h6", size: "16px / 1rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", sample: "Heading Six" },
  ];

  const bodyScale = [
    { label: "body-lg", size: "18px / 1.125rem", weight: "400", lineHeight: "1.75", letterSpacing: "0", sample: "Body large text for important content and descriptions." },
    { label: "body", size: "16px / 1rem", weight: "400", lineHeight: "1.75", letterSpacing: "0", sample: "Default body text used across the application interface." },
    { label: "body-sm", size: "14px / 0.875rem", weight: "400", lineHeight: "1.7", letterSpacing: "0", sample: "Small body text for secondary information and details." },
    { label: "caption", size: "12px / 0.75rem", weight: "500", lineHeight: "1.5", letterSpacing: "0.02em", sample: "CAPTION TEXT FOR LABELS AND METADATA" },
    { label: "label", size: "14px / 0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", sample: "Form label text" },
    { label: "helper", size: "12px / 0.75rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", sample: "Helper text providing additional context for form fields." },
  ];

  return (
    <SectionWrapper id="typography" title="Tipografia" subtitle="Typography">
      <RevealSection delay={0.1}>
        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { name: "Inter", role: "Primary", stack: "Inter, system-ui, sans-serif", variable: "--font-sans" },
            { name: "System UI", role: "Fallback", stack: "system-ui, -apple-system, sans-serif", variable: "fallback" },
            { name: "Menlo", role: "Monospace", stack: "Menlo, Monaco, monospace", variable: "--font-mono" },
          ].map((f) => (
            <Card key={f.name} className="border-white/10 bg-white/[0.03]">
              <CardContent className="p-5">
                <p className="text-xs text-white/40">{f.role}</p>
                <p className="mt-1 text-xl font-bold text-white" style={{ fontFamily: f.stack }}>{f.name}</p>
                <p className="mt-2 font-mono text-xs text-white/30">{f.variable}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </RevealSection>

      <RevealSection delay={0.2}>
        <h3 className="mb-6 text-lg font-semibold text-white/80">Escala de Headings</h3>
        <div className="space-y-1">
          {typographyScale.map((t) => (
            <div
              key={t.label}
              className="flex flex-wrap items-baseline gap-4 rounded-lg border border-white/5 px-5 py-4 transition-colors hover:bg-white/[0.02]"
            >
              <span className="w-10 shrink-0 font-mono text-xs text-blue-400">{t.label}</span>
              <span
                className="flex-1 text-white"
                style={{ fontSize: t.size.split(" / ")[0], fontWeight: Number(t.weight), lineHeight: t.lineHeight, letterSpacing: t.letterSpacing }}
              >
                {t.sample}
              </span>
              <div className="flex flex-wrap gap-3 text-xs text-white/30">
                <span>{t.size}</span>
                <span>w{t.weight}</span>
                <span>lh {t.lineHeight}</span>
                <span>ls {t.letterSpacing}</span>
              </div>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection delay={0.3}>
        <h3 className="mb-6 mt-12 text-lg font-semibold text-white/80">Body, Captions & Labels</h3>
        <div className="space-y-1">
          {bodyScale.map((t) => (
            <div
              key={t.label}
              className="flex flex-wrap items-baseline gap-4 rounded-lg border border-white/5 px-5 py-4 transition-colors hover:bg-white/[0.02]"
            >
              <span className="w-16 shrink-0 font-mono text-xs text-blue-400">{t.label}</span>
              <span
                className="flex-1 text-white/80"
                style={{ fontSize: t.size.split(" / ")[0], fontWeight: Number(t.weight), lineHeight: t.lineHeight, letterSpacing: t.letterSpacing }}
              >
                {t.sample}
              </span>
              <div className="flex flex-wrap gap-3 text-xs text-white/30">
                <span>{t.size}</span>
                <span>w{t.weight}</span>
                <span>lh {t.lineHeight}</span>
              </div>
            </div>
          ))}
        </div>
      </RevealSection>
    </SectionWrapper>
  );
}

interface ColorSwatchData {
  name: string;
  cssVar: string;
  hsl: string;
  hex: string;
  rgb: string;
}

function ColorSwatch({ color }: { color: ColorSwatchData }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      className="group rounded-lg border border-white/5 p-3 text-left transition-colors hover:bg-white/[0.03]"
      onClick={handleCopy}
      aria-label={`Copy ${color.name} hex value`}
    >
      <div
        className="mb-3 h-16 w-full rounded-md"
        style={{ backgroundColor: color.hex }}
      />
      <p className="text-sm font-medium text-white">{color.name}</p>
      <p className="mt-1 font-mono text-xs text-white/40">{color.hex}</p>
      <p className="font-mono text-xs text-white/25">rgb({color.rgb})</p>
      <p className="font-mono text-xs text-white/25">hsl({color.hsl})</p>
      <p className={`mt-1 text-xs text-green-400 ${copied ? "visible" : "invisible"}`}>Copied!</p>
    </button>
  );
}

function ColorsSection() {
  const colorGroups: { group: string; colors: ColorSwatchData[] }[] = [
    {
      group: "Primary (217° Blue)",
      colors: [
        { name: "Primary", cssVar: "--primary", hsl: "217 85% 50%", hex: "#1370E8", rgb: "19, 112, 232" },
        { name: "Primary Foreground", cssVar: "--primary-foreground", hsl: "217 91% 98%", hex: "#F5F8FE", rgb: "245, 248, 254" },
      ],
    },
    {
      group: "Secondary (Neutral)",
      colors: [
        { name: "Secondary", cssVar: "--secondary", hsl: "0 0% 20%", hex: "#333333", rgb: "51, 51, 51" },
        { name: "Secondary Foreground", cssVar: "--secondary-foreground", hsl: "0 0% 93%", hex: "#EDEDED", rgb: "237, 237, 237" },
      ],
    },
    {
      group: "Accent",
      colors: [
        { name: "Accent", cssVar: "--accent", hsl: "217 10% 20%", hex: "#2E3239", rgb: "46, 50, 57" },
        { name: "Accent Foreground", cssVar: "--accent-foreground", hsl: "217 12% 90%", hex: "#E1E4EA", rgb: "225, 228, 234" },
      ],
    },
    {
      group: "Muted",
      colors: [
        { name: "Muted", cssVar: "--muted", hsl: "0 0% 13%", hex: "#212121", rgb: "33, 33, 33" },
        { name: "Muted Foreground", cssVar: "--muted-foreground", hsl: "0 0% 55%", hex: "#8C8C8C", rgb: "140, 140, 140" },
      ],
    },
    {
      group: "Destructive",
      colors: [
        { name: "Destructive", cssVar: "--destructive", hsl: "0 72% 45%", hex: "#C52020", rgb: "197, 32, 32" },
        { name: "Destructive Foreground", cssVar: "--destructive-foreground", hsl: "0 84% 98%", hex: "#FEF5F5", rgb: "254, 245, 245" },
      ],
    },
    {
      group: "Background & Surface",
      colors: [
        { name: "Background", cssVar: "--background", hsl: "0 0% 7%", hex: "#121212", rgb: "18, 18, 18" },
        { name: "Foreground", cssVar: "--foreground", hsl: "0 0% 93%", hex: "#EDEDED", rgb: "237, 237, 237" },
        { name: "Card", cssVar: "--card", hsl: "0 0% 10%", hex: "#1A1A1A", rgb: "26, 26, 26" },
        { name: "Border", cssVar: "--border", hsl: "0 0% 23%", hex: "#3B3B3B", rgb: "59, 59, 59" },
      ],
    },
    {
      group: "Sidebar",
      colors: [
        { name: "Sidebar", cssVar: "--sidebar", hsl: "0 0% 8%", hex: "#141414", rgb: "20, 20, 20" },
        { name: "Sidebar Primary", cssVar: "--sidebar-primary", hsl: "217 85% 50%", hex: "#1370E8", rgb: "19, 112, 232" },
        { name: "Sidebar Accent", cssVar: "--sidebar-accent", hsl: "0 0% 13%", hex: "#212121", rgb: "33, 33, 33" },
      ],
    },
    {
      group: "Chart Colors",
      colors: [
        { name: "Chart 1", cssVar: "--chart-1", hsl: "217 91% 65%", hex: "#5B9CF5", rgb: "91, 156, 245" },
        { name: "Chart 2", cssVar: "--chart-2", hsl: "142 76% 60%", hex: "#4ADE80", rgb: "74, 222, 128" },
        { name: "Chart 3", cssVar: "--chart-3", hsl: "271 81% 65%", hex: "#A07EF5", rgb: "160, 126, 245" },
        { name: "Chart 4", cssVar: "--chart-4", hsl: "43 87% 65%", hex: "#EFC94C", rgb: "239, 201, 76" },
        { name: "Chart 5", cssVar: "--chart-5", hsl: "12 76% 65%", hex: "#E87B5B", rgb: "232, 123, 91" },
      ],
    },
    {
      group: "Status Colors",
      colors: [
        { name: "Online", cssVar: "status-online", hsl: "142 71% 45%", hex: "#22C55E", rgb: "34, 197, 94" },
        { name: "Away", cssVar: "status-away", hsl: "38 92% 50%", hex: "#F59E0B", rgb: "245, 158, 11" },
        { name: "Busy", cssVar: "status-busy", hsl: "0 84% 60%", hex: "#EF4444", rgb: "239, 68, 68" },
        { name: "Offline", cssVar: "status-offline", hsl: "220 9% 60%", hex: "#9CA3AF", rgb: "156, 163, 175" },
      ],
    },
  ];

  const gradients = [
    { name: "Primary Gradient", css: "linear-gradient(135deg, #1370E8, #5B9CF5)", from: "#1370E8", to: "#5B9CF5" },
    { name: "Purple Accent", css: "linear-gradient(135deg, #7C3AED, #A07EF5)", from: "#7C3AED", to: "#A07EF5" },
    { name: "Success", css: "linear-gradient(135deg, #059669, #4ADE80)", from: "#059669", to: "#4ADE80" },
    { name: "Warning", css: "linear-gradient(135deg, #D97706, #EFC94C)", from: "#D97706", to: "#EFC94C" },
    { name: "Danger", css: "linear-gradient(135deg, #C52020, #F87171)", from: "#C52020", to: "#F87171" },
    { name: "Dark Surface", css: "linear-gradient(135deg, #121212, #1A1A1A)", from: "#121212", to: "#1A1A1A" },
  ];

  return (
    <SectionWrapper id="colors" title="Sistema de Cores" subtitle="Colors">
      {colorGroups.map((group, gi) => (
        <RevealSection key={group.group} delay={gi * 0.05}>
          <h3 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wider text-white/50">{group.group}</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {group.colors.map((color) => (
              <ColorSwatch key={color.name} color={color} />
            ))}
          </div>
        </RevealSection>
      ))}

      <RevealSection delay={0.3}>
        <h3 className="mb-4 mt-12 text-sm font-semibold uppercase tracking-wider text-white/50">Gradientes</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {gradients.map((g) => (
            <div key={g.name} className="rounded-lg border border-white/5 p-3">
              <div className="mb-3 h-20 w-full rounded-md" style={{ background: g.css }} />
              <p className="text-sm font-medium text-white">{g.name}</p>
              <p className="mt-1 font-mono text-xs text-white/30">{g.from} → {g.to}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection delay={0.4}>
        <h3 className="mb-4 mt-12 text-sm font-semibold uppercase tracking-wider text-white/50">Opacidade</h3>
        <div className="flex flex-wrap gap-3">
          {[100, 80, 60, 40, 20, 10, 5].map((op) => (
            <div key={op} className="text-center">
              <div
                className="mb-2 h-14 w-14 rounded-md border border-white/10"
                style={{ backgroundColor: `rgba(19, 112, 232, ${op / 100})` }}
              />
              <span className="font-mono text-xs text-white/40">{op}%</span>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection delay={0.5}>
        <h3 className="mb-4 mt-12 text-sm font-semibold uppercase tracking-wider text-white/50">Uso Contextual & Contraste</h3>
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { role: "Text", desc: "foreground para texto principal, muted-foreground para texto secundário, white/30 para texto terciário", example: "text-foreground" },
                { role: "Background", desc: "background para superfície base, card para cards elevados, muted para containers agrupadores", example: "bg-background" },
                { role: "Border", desc: "border para separadores padrão, input para campos de formulário, white/5 para divisões sutis", example: "border-border" },
                { role: "Hover", desc: "Utilizar hover-elevate (overlay sutil) em vez de cores manuais. Buttons/Badges já incluem interações", example: "hover-elevate" },
                { role: "Active", desc: "active-elevate-2 para feedback de clique. Mais intenso que hover. Já aplicado em Buttons", example: "active-elevate-2" },
                { role: "Disabled", desc: "opacity-50 + pointer-events-none. Todos os componentes aplicam automaticamente via prop disabled", example: "disabled:opacity-50" },
              ].map((item) => (
                <div key={item.role} className="rounded-md border border-white/5 p-4">
                  <p className="text-sm font-semibold text-white">{item.role}</p>
                  <p className="mt-1 text-xs text-white/50">{item.desc}</p>
                  <p className="mt-2 font-mono text-xs text-blue-400">{item.example}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-md border border-white/5 p-4">
              <p className="text-sm font-semibold text-white">Notas de Contraste</p>
              <ul className="mt-2 space-y-1 text-xs text-white/50">
                <li>Primary (#1370E8) sobre background (#121212): ratio 4.6:1 — passa AA para texto grande</li>
                <li>Foreground (#EDEDED) sobre background (#121212): ratio 14.5:1 — passa AAA</li>
                <li>Foreground (#EDEDED) sobre card (#1A1A1A): ratio 12.8:1 — passa AAA</li>
                <li>Muted-foreground (#8C8C8C) sobre background (#121212): ratio 5.2:1 — passa AA</li>
                <li>Destructive-foreground (#FEF5F5) sobre destructive (#C52020): ratio 6.8:1 — passa AA</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </RevealSection>
    </SectionWrapper>
  );
}

function ComponentsSection() {
  const [progress, setProgress] = useState(35);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => (p >= 90 ? 35 : p + 5));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <SectionWrapper id="components" title="UI Components" subtitle="Components">
      <RevealSection delay={0.1}>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">Buttons</h3>
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="space-y-6 p-6">
            <div>
              <p className="mb-3 text-xs text-white/40">Variants</p>
              <div className="flex flex-wrap gap-3">
                <Button data-testid="button-default">Default</Button>
                <Button variant="secondary" data-testid="button-secondary">Secondary</Button>
                <Button variant="destructive" data-testid="button-destructive">Destructive</Button>
                <Button variant="outline" data-testid="button-outline">Outline</Button>
                <Button variant="ghost" data-testid="button-ghost">Ghost</Button>
                <Button variant="link" data-testid="button-link">Link</Button>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs text-white/40">Sizes</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" data-testid="button-sm">Small</Button>
                <Button data-testid="button-md">Default</Button>
                <Button size="lg" data-testid="button-lg">Large</Button>
                <Button size="icon" data-testid="button-icon"><Plus /></Button>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs text-white/40">With Icons</p>
              <div className="flex flex-wrap gap-3">
                <Button data-testid="button-with-icon-download"><Download className="mr-1 h-4 w-4" /> Download</Button>
                <Button variant="outline" data-testid="button-with-icon-settings"><Settings className="mr-1 h-4 w-4" /> Settings</Button>
                <Button variant="destructive" data-testid="button-with-icon-trash"><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs text-white/40">States</p>
              <div className="flex flex-wrap gap-3">
                <Button disabled data-testid="button-disabled">Disabled</Button>
                <Button className="pointer-events-none opacity-70" data-testid="button-loading">
                  <RefreshCw className="mr-1 h-4 w-4 animate-spin" /> Loading...
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </RevealSection>

      <RevealSection delay={0.15}>
        <h3 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-wider text-white/50">Badges</h3>
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              <Badge data-testid="badge-default">Default</Badge>
              <Badge variant="secondary" data-testid="badge-secondary">Secondary</Badge>
              <Badge variant="destructive" data-testid="badge-destructive">Destructive</Badge>
              <Badge variant="outline" data-testid="badge-outline">Outline</Badge>
              <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400" data-testid="badge-success">Success</Badge>
              <Badge variant="outline" className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400" data-testid="badge-warning">Warning</Badge>
              <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400" data-testid="badge-info">Info</Badge>
            </div>
          </CardContent>
        </Card>
      </RevealSection>

      <RevealSection delay={0.2}>
        <h3 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-wider text-white/50">Inputs</h3>
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="grid gap-4 p-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs text-white/40">Text Input</label>
              <Input placeholder="Digite algo..." data-testid="input-text" />
            </div>
            <div>
              <label className="mb-2 block text-xs text-white/40">With Icon</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input className="pl-9" placeholder="Buscar..." data-testid="input-search" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs text-white/40">Disabled</label>
              <Input disabled placeholder="Desabilitado" data-testid="input-disabled" />
            </div>
            <div>
              <label className="mb-2 block text-xs text-white/40">With Value</label>
              <Input defaultValue="client@mastodonte.com" data-testid="input-value" />
            </div>
          </CardContent>
        </Card>
      </RevealSection>

      <RevealSection delay={0.25}>
        <h3 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-wider text-white/50">Cards</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Leads Ativos", value: "1,284", trend: "+12%", icon: Users },
            { title: "Tarefas Hoje", value: "23", trend: "+3", icon: CheckSquare },
            { title: "Receita Mensal", value: "R$ 84.5K", trend: "+8.2%", icon: TrendingUp },
          ].map((item) => (
            <Card key={item.title} className="border-white/10 bg-white/[0.03]">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardDescription className="text-white/40">{item.title}</CardDescription>
                <item.icon className="h-4 w-4 text-white/30" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="mt-1 text-xs text-green-400">{item.trend} em relação ao mês anterior</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </RevealSection>

      <RevealSection delay={0.3}>
        <h3 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-wider text-white/50">Tabs</h3>
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="p-6">
            <Tabs defaultValue="overview" data-testid="tabs-demo">
              <TabsList data-testid="tabs-list">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports" data-testid="tab-reports">Reports</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <p className="text-sm text-white/60">Visão geral dos indicadores do CRM com dados em tempo real.</p>
              </TabsContent>
              <TabsContent value="analytics" className="mt-4">
                <p className="text-sm text-white/60">Métricas detalhadas de performance e conversão.</p>
              </TabsContent>
              <TabsContent value="reports" className="mt-4">
                <p className="text-sm text-white/60">Relatórios exportáveis e dashboards customizados.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </RevealSection>

      <RevealSection delay={0.35}>
        <h3 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-wider text-white/50">Dialog / Modal</h3>
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="p-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-open-dialog">Abrir Dialog</Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-demo">
                <DialogHeader>
                  <DialogTitle>Confirmar Ação</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja executar esta ação? Esta operação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" data-testid="button-dialog-cancel">Cancelar</Button>
                  <Button data-testid="button-dialog-confirm">Confirmar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </RevealSection>

      <RevealSection delay={0.38}>
        <h3 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-wider text-white/50">Toggles</h3>
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              <Toggle data-testid="toggle-default" aria-label="Toggle bold"><Star className="h-4 w-4" /></Toggle>
              <Toggle variant="outline" data-testid="toggle-outline" aria-label="Toggle italic"><Heart className="h-4 w-4" /></Toggle>
              <Toggle size="sm" data-testid="toggle-sm" aria-label="Toggle small"><Bookmark className="h-4 w-4" /></Toggle>
              <Toggle size="lg" data-testid="toggle-lg" aria-label="Toggle large"><Eye className="h-4 w-4" /></Toggle>
            </div>
            <p className="mt-3 text-xs text-white/30">Toggles are stateful controls that switch between on/off states. Click to toggle.</p>
          </CardContent>
        </Card>
      </RevealSection>

      <RevealSection delay={0.4}>
        <h3 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-wider text-white/50">Tooltips, Progress, Switches & Avatars</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-white/10 bg-white/[0.03]">
            <CardContent className="space-y-6 p-6">
              <div>
                <p className="mb-3 text-xs text-white/40">Tooltips</p>
                <div className="flex flex-wrap gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" data-testid="button-tooltip-info"><Info /></Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Informação adicional</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" data-testid="button-tooltip-help"><HelpCircle /></Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Precisa de ajuda?</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" data-testid="button-tooltip-settings"><Settings /></Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Configurações</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs text-white/40">Switch</p>
                <div className="flex items-center gap-3">
                  <Switch data-testid="switch-demo-1" />
                  <span className="text-sm text-white/60">Notificações ativas</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.03]">
            <CardContent className="space-y-6 p-6">
              <div>
                <p className="mb-3 text-xs text-white/40">Progress</p>
                <Progress value={progress} className="h-2" data-testid="progress-demo" />
                <p className="mt-2 text-xs text-white/30">{progress}% completo</p>
              </div>
              <div>
                <p className="mb-3 text-xs text-white/40">Avatars</p>
                <div className="flex gap-2">
                  {["JD", "AS", "MK", "RL", "TC"].map((initials, i) => (
                    <Avatar key={i} data-testid={`avatar-${i}`}>
                      <AvatarFallback className="bg-blue-500/20 text-blue-300 text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </RevealSection>
    </SectionWrapper>
  );
}

function IconsSection() {
  const iconCategories = [
    {
      category: "Navegação",
      icons: [
        { name: "LayoutDashboard", Icon: LayoutDashboard },
        { name: "Home", Icon: Home },
        { name: "Menu", Icon: Menu },
        { name: "ChevronLeft", Icon: ChevronLeft },
        { name: "ChevronRight", Icon: ChevronRight },
        { name: "ArrowRight", Icon: ArrowRight },
        { name: "ArrowUp", Icon: ArrowUp },
        { name: "ArrowDown", Icon: ArrowDown },
        { name: "ExternalLink", Icon: ExternalLink },
      ],
    },
    {
      category: "Ações",
      icons: [
        { name: "Plus", Icon: Plus },
        { name: "Edit", Icon: Edit },
        { name: "Trash2", Icon: Trash2 },
        { name: "Copy", Icon: Copy },
        { name: "Download", Icon: Download },
        { name: "Upload", Icon: Upload },
        { name: "Search", Icon: Search },
        { name: "Filter", Icon: Filter },
        { name: "RefreshCw", Icon: RefreshCw },
        { name: "Share2", Icon: Share2 },
        { name: "MoreHorizontal", Icon: MoreHorizontal },
      ],
    },
    {
      category: "CRM",
      icons: [
        { name: "Users", Icon: Users },
        { name: "CheckSquare", Icon: CheckSquare },
        { name: "Layers", Icon: Layers },
        { name: "BarChart3", Icon: BarChart3 },
        { name: "PieChart", Icon: PieChart },
        { name: "TrendingUp", Icon: TrendingUp },
        { name: "Calendar", Icon: Calendar },
        { name: "Inbox", Icon: Inbox },
        { name: "Mail", Icon: Mail },
        { name: "MessageSquare", Icon: MessageSquare },
      ],
    },
    {
      category: "Status & Feedback",
      icons: [
        { name: "Check", Icon: Check },
        { name: "X", Icon: X },
        { name: "AlertTriangle", Icon: AlertTriangle },
        { name: "Info", Icon: Info },
        { name: "HelpCircle", Icon: HelpCircle },
        { name: "Star", Icon: Star },
        { name: "Heart", Icon: Heart },
        { name: "Zap", Icon: Zap },
        { name: "Eye", Icon: Eye },
        { name: "Bookmark", Icon: Bookmark },
      ],
    },
    {
      category: "Sistema",
      icons: [
        { name: "Settings", Icon: Settings },
        { name: "Bell", Icon: Bell },
        { name: "LogOut", Icon: LogOut },
        { name: "Shield", Icon: Shield },
        { name: "Lock", Icon: Lock },
        { name: "Unlock", Icon: Unlock },
        { name: "Globe", Icon: Globe },
        { name: "Moon", Icon: Moon },
        { name: "Sun", Icon: Sun },
      ],
    },
  ];

  return (
    <SectionWrapper id="icons" title="Ícones" subtitle="Icons · Lucide React">
      {iconCategories.map((cat, ci) => (
        <RevealSection key={cat.category} delay={ci * 0.05}>
          <h3 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wider text-white/50">{cat.category}</h3>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11">
            {cat.icons.map(({ name, Icon }) => (
              <div
                key={name}
                className="group flex flex-col items-center gap-2 rounded-lg border border-white/5 p-3 text-center transition-colors hover:bg-white/[0.03]"
                data-testid={`icon-${name}`}
              >
                <Icon className="h-5 w-5 text-white/60 transition-colors group-hover:text-blue-400" />
                <span className="text-[10px] leading-tight text-white/30 group-hover:text-white/50">{name}</span>
              </div>
            ))}
          </div>
        </RevealSection>
      ))}
    </SectionWrapper>
  );
}

function AnimationDemo({ name, description, children }: { name: string; description: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-white/5 p-5">
      <div className="mb-4 flex min-h-[80px] items-center justify-center rounded-md bg-white/[0.02]">
        {children}
      </div>
      <p className="text-sm font-medium text-white">{name}</p>
      <p className="mt-1 text-xs text-white/40">{description}</p>
    </div>
  );
}

function AnimationsSection() {

  return (
    <SectionWrapper id="animations" title="Animações" subtitle="Animations">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RevealSection delay={0}>
          <AnimationDemo name="fadeInDown" description="Entrada de cima para baixo com fade">
            <div
              key="fid-anim"
              className="rounded-md bg-blue-500/20 px-4 py-2 text-sm text-blue-300"
              style={{ animation: "dsFadeInDown 1s ease-out infinite" }}
            >
              Fade In Down
            </div>
          </AnimationDemo>
        </RevealSection>

        <RevealSection delay={0.05}>
          <AnimationDemo name="fadeInUp" description="Entrada de baixo para cima com fade">
            <div
              className="rounded-md bg-purple-500/20 px-4 py-2 text-sm text-purple-300"
              style={{ animation: "dsFadeInUp 1s ease-out infinite" }}
            >
              Fade In Up
            </div>
          </AnimationDemo>
        </RevealSection>

        <RevealSection delay={0.1}>
          <AnimationDemo name="heartbeat" description="Pulsação suave para chamar atenção">
            <div
              className="h-12 w-12 rounded-full bg-blue-500/30"
              style={{ animation: "dsHeartbeat 2s ease-in-out infinite" }}
            />
          </AnimationDemo>
        </RevealSection>

        <RevealSection delay={0.15}>
          <AnimationDemo name="spotlight" description="Luz de destaque que se move suavemente">
            <div className="relative h-16 w-full overflow-hidden rounded-md">
              <div
                className="absolute h-full w-full"
                style={{
                  background: "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.2) 0%, transparent 60%)",
                  animation: "dsSpotlight 4s alternate ease-in-out infinite",
                }}
              />
              <div className="relative flex h-full items-center justify-center text-xs text-white/40">Spotlight</div>
            </div>
          </AnimationDemo>
        </RevealSection>

        <RevealSection delay={0.2}>
          <AnimationDemo name="rotateCircle" description="Rotação contínua para elementos decorativos">
            <div
              className="h-14 w-14 rounded-full border border-blue-500/30"
              style={{ animation: "dsRotate 4s linear infinite" }}
            >
              <div className="absolute ml-6 mt-0 h-2 w-2 rounded-full bg-blue-400" />
            </div>
          </AnimationDemo>
        </RevealSection>

        <RevealSection delay={0.25}>
          <AnimationDemo name="shine-text" description="Brilho que percorre o texto">
            <span
              className="text-lg font-bold"
              style={{
                background: "linear-gradient(110deg, #888 30%, #fff 50%, #888 70%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                animation: "dsShineText 3s linear infinite",
              }}
            >
              Mastodonte.
            </span>
          </AnimationDemo>
        </RevealSection>

        <RevealSection delay={0.3}>
          <AnimationDemo name="turbo-progress-pulse" description="Pulso de progresso no modo Turbo">
            <div className="w-full px-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  key="turbo-anim"
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-green-500"
                  style={{
                    width: "70%",
                    animation: "dsTurboPulse 1.5s ease-out infinite",
                  }}
                />
              </div>
            </div>
          </AnimationDemo>
        </RevealSection>

        <RevealSection delay={0.35}>
          <AnimationDemo name="turbo-celebration" description="Celebração ao completar tarefas no modo Turbo">
            <div
              className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300"
              style={{ animation: "dsTurboCelebration 2s ease-out infinite" }}
            >
              Task Complete!
            </div>
          </AnimationDemo>
        </RevealSection>

        <RevealSection delay={0.4}>
          <AnimationDemo name="hover-elevate" description="Elevação sutil ao passar o mouse (classe utilitária)">
            <div className="flex gap-3">
              <Button variant="outline" data-testid="hover-elevate-demo">
                Hover me
              </Button>
            </div>
          </AnimationDemo>
        </RevealSection>

        <RevealSection delay={0.45}>
          <AnimationDemo name="active-elevate-2" description="Elevação mais intensa ao clicar (classe utilitária)">
            <div className="flex gap-3">
              <Button variant="secondary" data-testid="active-elevate-demo">
                Click/Press me
              </Button>
            </div>
          </AnimationDemo>
        </RevealSection>

        <RevealSection delay={0.5}>
          <AnimationDemo name="toggle-elevate" description="Estado alternável com elevação visual">
            <ToggleDemo />
          </AnimationDemo>
        </RevealSection>
      </div>
    </SectionWrapper>
  );
}

function ToggleDemo() {
  const [on, setOn] = useState(false);
  return (
    <Button
      variant={on ? "default" : "outline"}
      onClick={() => setOn(!on)}
      data-testid="toggle-elevate-demo"
    >
      {on ? "ON" : "OFF"} — Click to toggle
    </Button>
  );
}

function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { label: "Tipografia", href: "#typography" },
    { label: "Cores", href: "#colors" },
    { label: "Componentes", href: "#components" },
    { label: "Ícones", href: "#icons" },
    { label: "Animações", href: "#animations" },
  ];

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-3 transition-all duration-300 ${
        scrolled ? "bg-[#070709]/90 backdrop-blur-md border-b border-white/5" : "bg-transparent"
      }`}
      data-testid="navbar"
    >
      <div className="flex items-center gap-2">
        <svg width="100" height="25" viewBox="0 0 280 70" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="25" width="10" height="25" rx="2" fill="white" />
          <rect x="15" y="15" width="10" height="35" rx="2" fill="white" />
          <path d="M30 15H40V35C40 45 50 45 50 35" stroke="white" strokeWidth="10" strokeLinecap="round" />
          <text x="70" y="45" fontWeight="900" fontSize="32" letterSpacing="0" fill="white" style={{ fontFamily: "'Inter', sans-serif" }}>Mastodonte.</text>
        </svg>
      </div>
      <div className="hidden items-center gap-1 md:flex">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-md px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white/80"
            data-testid={`nav-${link.label.toLowerCase()}`}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function FooterSection() {
  return (
    <footer className="border-t border-white/5 px-6 py-16 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl text-center">
        <svg width="140" height="35" viewBox="0 0 280 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
          <rect x="0" y="25" width="10" height="25" rx="2" fill="white" />
          <rect x="15" y="15" width="10" height="35" rx="2" fill="white" />
          <path d="M30 15H40V35C40 45 50 45 50 35" stroke="white" strokeWidth="10" strokeLinecap="round" />
          <text x="70" y="45" fontWeight="900" fontSize="32" letterSpacing="0" fill="white" style={{ fontFamily: "'Inter', sans-serif" }}>Mastodonte.</text>
        </svg>
        <p className="text-sm text-white/30">Design System v1.0 — Mastodonte CRM</p>
        <p className="mt-1 text-xs text-white/15">Todos os tokens, componentes e animações documentados.</p>
      </div>
    </footer>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @keyframes meshFloat1 {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(50px, 30px); }
      }
      @keyframes meshFloat2 {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(-40px, -20px); }
      }
      @keyframes meshFloat3 {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(30px, -40px); }
      }
      @keyframes heroGlow {
        0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
      }
      @keyframes heroTrack {
        from { transform: perspective(500px) rotateX(60deg) scale(2) translateY(0); }
        to { transform: perspective(500px) rotateX(60deg) scale(2) translateY(81px); }
      }
      @keyframes heroRotate {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
      @keyframes heroSpotlight {
        from { transform: translate(-10%, -10%); }
        to { transform: translate(10%, 10%); }
      }
      @keyframes heroBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(8px); }
      }
      @keyframes dsFadeInDown {
        0%, 100% { opacity: 0; transform: translateY(-20px); }
        30%, 70% { opacity: 1; transform: translateY(0); }
      }
      @keyframes dsFadeInUp {
        0%, 100% { opacity: 0; transform: translateY(20px); }
        30%, 70% { opacity: 1; transform: translateY(0); }
      }
      @keyframes dsHeartbeat {
        0%, 100% { transform: scale(1); opacity: 0.4; }
        50% { transform: scale(1.2); opacity: 0.8; }
      }
      @keyframes dsSpotlight {
        0% { transform: translateX(-30%); }
        100% { transform: translateX(30%); }
      }
      @keyframes dsRotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes dsShineText {
        0% { background-position: 100% 0; }
        100% { background-position: -100% 0; }
      }
      @keyframes dsTurboPulse {
        0% { box-shadow: 0 0 8px rgba(249,115,22,0.4); }
        50% { box-shadow: 0 0 20px rgba(34,197,94,0.8); }
        100% { box-shadow: 0 0 12px rgba(34,197,94,0.5); }
      }
      @keyframes dsTurboCelebration {
        0%, 100% { transform: scale(1); box-shadow: none; }
        25% { transform: scale(1.02); box-shadow: 0 0 30px rgba(16,185,129,0.4); }
        50% { transform: scale(1.01); box-shadow: 0 0 20px rgba(16,185,129,0.2); }
      }
      @keyframes heroFloat1 {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-12px); }
      }
      @keyframes heroFloat2 {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      @keyframes heroFloat3 {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-15px); }
      }
      .hero-shine-text {
        background: linear-gradient(110deg, #555 20%, #fff 40%, #fff 60%, #555 80%);
        background-size: 200% 100%;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: dsShineText 4s linear infinite;
      }
      html { scroll-behavior: smooth; }
    `}</style>
  );
}

export default function DesignSystem() {
  useEffect(() => {
    const wasDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.add("dark");
    return () => {
      if (!wasDark) {
        document.documentElement.classList.remove("dark");
      }
    };
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#070709] text-white antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <GlobalStyles />
        <NavBar />
        <HeroSection />
        <div className="relative">
          <MeshGradientBg />
          <GeometricLines />
          <TypographySection />
        </div>
        <div className="relative">
          <MeshGradientBg />
          <ColorsSection />
        </div>
        <div className="relative">
          <MeshGradientBg />
          <GeometricLines />
          <ComponentsSection />
        </div>
        <div className="relative">
          <MeshGradientBg />
          <IconsSection />
        </div>
        <div className="relative">
          <MeshGradientBg />
          <GeometricLines />
          <AnimationsSection />
        </div>
        <FooterSection />
      </div>
    </TooltipProvider>
  );
}
