import { useState, useMemo, Fragment } from "react";
import {
  ChevronDown,
  ChevronRight,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowLeft,
  Save,
  PanelRightOpen,
  PanelRightClose,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { getInstitutionColor } from "@/features/clients/lib/institutionColors";

type BalanceStatus = "ok" | "atencao" | "desbalanceado";
type FGCStatus = "ok" | "alerta" | "critico";

interface Institution {
  name: string;
  colorKey: string;
  initials: string;
}

interface SubCategory {
  id: string;
  name: string;
  pctPL: number;
  status: BalanceStatus;
  pctForaIdeal: number;
  alocIdeal: number;
  alocAtual: number;
  sugestao: number;
  byInstitution: Record<string, number>;
}

interface Category {
  id: string;
  name: string;
  subs: SubCategory[];
}

interface FGCInfo {
  institution: string;
  colorKey: string;
  covered: number;
  limit: number;
  status: FGCStatus;
}

interface PolicyData {
  suitability: string;
  fgcComfort: string;
  maxLoss: string;
  returnTarget: string;
  maxTerm: string;
  liquidityMin: string;
  platforms: string[];
  assetRestrictions: string[];
  exposureAreas: string[];
}

const INSTITUTIONS: Institution[] = [
  { name: "XP", colorKey: "XP", initials: "XP" },
  { name: "BTG", colorKey: "BTG", initials: "BT" },
  { name: "Itaú", colorKey: "Itaú", initials: "IT" },
  { name: "Safra", colorKey: "Safra", initials: "SF" },
  { name: "Bradesco", colorKey: "Bradesco", initials: "BR" },
];

const TOTAL_AUM = 13_250_000;

const CATEGORIES: Category[] = [
  {
    id: "rf",
    name: "Renda Fixa",
    subs: [
      {
        id: "cdi-liq",
        name: "CDI - Liquidez",
        pctPL: 14.8,
        status: "ok",
        pctForaIdeal: 1.2,
        alocIdeal: 1_987_500,
        alocAtual: 1_961_000,
        sugestao: 26_500,
        byInstitution: { XP: 580_000, BTG: 420_000, "Itaú": 350_000, Safra: 311_000, Bradesco: 300_000 },
      },
      {
        id: "cdi-tit",
        name: "CDI - Títulos",
        pctPL: 10.2,
        status: "atencao",
        pctForaIdeal: 3.8,
        alocIdeal: 1_325_000,
        alocAtual: 1_351_500,
        sugestao: -26_500,
        byInstitution: { XP: 450_000, BTG: 310_000, "Itaú": 280_000, Safra: 191_500, Bradesco: 120_000 },
      },
      {
        id: "cdi-fund",
        name: "CDI - Fundos",
        pctPL: 7.9,
        status: "ok",
        pctForaIdeal: 0.1,
        alocIdeal: 1_060_000,
        alocAtual: 1_046_750,
        sugestao: 13_250,
        byInstitution: { XP: 350_000, BTG: 280_000, "Itaú": 200_000, Safra: 116_750, Bradesco: 100_000 },
      },
      {
        id: "infl-tit",
        name: "Inflação - Títulos",
        pctPL: 12.1,
        status: "desbalanceado",
        pctForaIdeal: 8.2,
        alocIdeal: 1_590_000,
        alocAtual: 1_603_250,
        sugestao: -13_250,
        byInstitution: { XP: 520_000, BTG: 380_000, "Itaú": 310_000, Safra: 243_250, Bradesco: 150_000 },
      },
      {
        id: "infl-fund",
        name: "Inflação - Fundos",
        pctPL: 7.6,
        status: "ok",
        pctForaIdeal: 0.4,
        alocIdeal: 1_060_000,
        alocAtual: 1_007_000,
        sugestao: 53_000,
        byInstitution: { XP: 320_000, BTG: 250_000, "Itaú": 200_000, Safra: 137_000, Bradesco: 100_000 },
      },
      {
        id: "pre",
        name: "Pré-Fixado",
        pctPL: 6.8,
        status: "atencao",
        pctForaIdeal: 4.6,
        alocIdeal: 927_500,
        alocAtual: 901_000,
        sugestao: 26_500,
        byInstitution: { XP: 300_000, BTG: 220_000, "Itaú": 180_000, Safra: 121_000, Bradesco: 80_000 },
      },
      {
        id: "debent",
        name: "Debêntures",
        pctPL: 3.2,
        status: "ok",
        pctForaIdeal: 0.8,
        alocIdeal: 430_000,
        alocAtual: 423_800,
        sugestao: 6_200,
        byInstitution: { XP: 180_000, BTG: 120_000, "Itaú": 60_000, Safra: 43_800, Bradesco: 20_000 },
      },
      {
        id: "cri-cra",
        name: "CRI / CRA",
        pctPL: 2.1,
        status: "atencao",
        pctForaIdeal: 6.3,
        alocIdeal: 265_000,
        alocAtual: 278_250,
        sugestao: -13_250,
        byInstitution: { XP: 110_000, BTG: 80_000, "Itaú": 45_000, Safra: 28_250, Bradesco: 15_000 },
      },
    ],
  },
  {
    id: "eq-br",
    name: "Equities Brasil",
    subs: [
      {
        id: "acoes",
        name: "Ações",
        pctPL: 9.8,
        status: "desbalanceado",
        pctForaIdeal: 12.5,
        alocIdeal: 1_325_000,
        alocAtual: 1_298_500,
        sugestao: 26_500,
        byInstitution: { XP: 520_000, BTG: 380_000, "Itaú": 220_000, Safra: 118_500, Bradesco: 60_000 },
      },
      {
        id: "long-biased",
        name: "Long Biased",
        pctPL: 5.1,
        status: "ok",
        pctForaIdeal: 2.0,
        alocIdeal: 662_500,
        alocAtual: 675_750,
        sugestao: -13_250,
        byInstitution: { XP: 280_000, BTG: 200_000, "Itaú": 110_000, Safra: 55_750, Bradesco: 30_000 },
      },
      {
        id: "private-br",
        name: "Private Brasil",
        pctPL: 4.9,
        status: "ok",
        pctForaIdeal: 1.0,
        alocIdeal: 662_500,
        alocAtual: 649_250,
        sugestao: 13_250,
        byInstitution: { XP: 260_000, BTG: 180_000, "Itaú": 100_000, Safra: 79_250, Bradesco: 30_000 },
      },
      {
        id: "small-caps",
        name: "Small Caps",
        pctPL: 1.8,
        status: "desbalanceado",
        pctForaIdeal: 18.0,
        alocIdeal: 265_000,
        alocAtual: 238_500,
        sugestao: 26_500,
        byInstitution: { XP: 100_000, BTG: 70_000, "Itaú": 40_000, Safra: 18_500, Bradesco: 10_000 },
      },
    ],
  },
  {
    id: "ext",
    name: "Exterior",
    subs: [
      {
        id: "ext-rf",
        name: "RF Exterior",
        pctPL: 5.2,
        status: "ok",
        pctForaIdeal: 0.8,
        alocIdeal: 662_500,
        alocAtual: 689_000,
        sugestao: -26_500,
        byInstitution: { XP: 280_000, BTG: 200_000, "Itaú": 100_000, Safra: 69_000, Bradesco: 40_000 },
      },
      {
        id: "ext-mm",
        name: "Multimercado Ext.",
        pctPL: 5.0,
        status: "atencao",
        pctForaIdeal: 5.2,
        alocIdeal: 662_500,
        alocAtual: 662_500,
        sugestao: 0,
        byInstitution: { XP: 250_000, BTG: 180_000, "Itaú": 120_000, Safra: 72_500, Bradesco: 40_000 },
      },
      {
        id: "ext-acoes",
        name: "Ações Exterior",
        pctPL: 4.8,
        status: "desbalanceado",
        pctForaIdeal: 15.3,
        alocIdeal: 662_500,
        alocAtual: 636_000,
        sugestao: 26_500,
        byInstitution: { XP: 240_000, BTG: 170_000, "Itaú": 110_000, Safra: 76_000, Bradesco: 40_000 },
      },
      {
        id: "ext-hedge",
        name: "Hedge Cambial",
        pctPL: 1.5,
        status: "ok",
        pctForaIdeal: 0.5,
        alocIdeal: 198_750,
        alocAtual: 198_750,
        sugestao: 0,
        byInstitution: { XP: 80_000, BTG: 55_000, "Itaú": 35_000, Safra: 18_750, Bradesco: 10_000 },
      },
    ],
  },
  {
    id: "alt",
    name: "Alternativo",
    subs: [
      {
        id: "imob",
        name: "Imobiliário",
        pctPL: 3.1,
        status: "ok",
        pctForaIdeal: 1.5,
        alocIdeal: 397_500,
        alocAtual: 410_750,
        sugestao: -13_250,
        byInstitution: { XP: 160_000, BTG: 120_000, "Itaú": 70_000, Safra: 40_750, Bradesco: 20_000 },
      },
      {
        id: "pe",
        name: "Private Equity",
        pctPL: 2.7,
        status: "ok",
        pctForaIdeal: 0.3,
        alocIdeal: 265_000,
        alocAtual: 357_750,
        sugestao: -92_750,
        byInstitution: { XP: 140_000, BTG: 100_000, "Itaú": 60_000, Safra: 37_750, Bradesco: 20_000 },
      },
      {
        id: "infra",
        name: "Infraestrutura",
        pctPL: 1.4,
        status: "ok",
        pctForaIdeal: 2.1,
        alocIdeal: 198_750,
        alocAtual: 185_500,
        sugestao: 13_250,
        byInstitution: { XP: 75_000, BTG: 55_000, "Itaú": 30_000, Safra: 15_500, Bradesco: 10_000 },
      },
      {
        id: "agro",
        name: "Agronegócio",
        pctPL: 0.9,
        status: "atencao",
        pctForaIdeal: 7.5,
        alocIdeal: 132_500,
        alocAtual: 119_250,
        sugestao: 13_250,
        byInstitution: { XP: 50_000, BTG: 35_000, "Itaú": 18_000, Safra: 10_250, Bradesco: 6_000 },
      },
    ],
  },
];

const FGC_DATA: FGCInfo[] = [
  { institution: "XP", colorKey: "XP", covered: 145_000, limit: 250_000, status: "ok" },
  { institution: "BTG", colorKey: "BTG", covered: 210_000, limit: 250_000, status: "alerta" },
  { institution: "Itaú", colorKey: "Itaú", covered: 248_500, limit: 250_000, status: "critico" },
  { institution: "Safra", colorKey: "Safra", covered: 92_000, limit: 250_000, status: "ok" },
  { institution: "Bradesco", colorKey: "Bradesco", covered: 55_000, limit: 250_000, status: "ok" },
];

const POLICY: PolicyData = {
  suitability: "Moderado",
  fgcComfort: "Até R$ 200.000 por inst.",
  maxLoss: "-12% no ano",
  returnTarget: "IPCA + 6% a.a.",
  maxTerm: "5 anos (RF), 7 anos (PE)",
  liquidityMin: "30% em D+0/D+1",
  platforms: ["XP", "BTG", "Itaú", "Safra", "Bradesco"],
  assetRestrictions: ["Cripto", "COE sem capital protegido", "Derivativos alavancados"],
  exposureAreas: ["Brasil 70-80%", "EUA 10-15%", "Europa 5-10%", "Ásia < 5%"],
};

function formatBRL(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(2).replace(".", ",")}M`;
  }
  return `R$ ${(value / 1_000).toFixed(0)}k`;
}

function formatBRLFull(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const STATUS_STYLES: Record<BalanceStatus, { label: string; color: string; bg: string; border: string }> = {
  ok: {
    label: "Ok",
    color: "text-[#6ecf8e]",
    bg: "bg-[rgba(110,207,142,0.1)]",
    border: "border-[rgba(110,207,142,0.25)]",
  },
  atencao: {
    label: "Atenção",
    color: "text-[#dcb092]",
    bg: "bg-[rgba(220,176,146,0.1)]",
    border: "border-[rgba(220,176,146,0.25)]",
  },
  desbalanceado: {
    label: "Desbalanceado",
    color: "text-[#e05c5c]",
    bg: "bg-[rgba(224,92,92,0.1)]",
    border: "border-[rgba(224,92,92,0.25)]",
  },
};

const FGC_STYLES: Record<FGCStatus, { color: string; bg: string; border: string }> = {
  ok: {
    color: "text-[#6ecf8e]",
    bg: "bg-[rgba(110,207,142,0.08)]",
    border: "border-[rgba(110,207,142,0.2)]",
  },
  alerta: {
    color: "text-[#dcb092]",
    bg: "bg-[rgba(220,176,146,0.08)]",
    border: "border-[rgba(220,176,146,0.2)]",
  },
  critico: {
    color: "text-[#e05c5c]",
    bg: "bg-[rgba(224,92,92,0.08)]",
    border: "border-[rgba(224,92,92,0.2)]",
  },
};

function StatusBadge({ status }: { status: BalanceStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${s.color} ${s.bg} ${s.border}`}
    >
      {status === "ok" && <CheckCircle className="h-3 w-3" />}
      {status === "atencao" && <AlertTriangle className="h-3 w-3" />}
      {status === "desbalanceado" && <AlertTriangle className="h-3 w-3" />}
      {s.label}
    </span>
  );
}

function SugestaoCell({ value }: { value: number }) {
  if (value === 0) return <span className="text-[#8c8c8c]"><Minus className="inline h-3 w-3" /></span>;
  const isPositive = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? "text-[#6ecf8e]" : "text-[#e05c5c]"}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isPositive ? "+" : ""}{formatBRL(value)}
    </span>
  );
}

function InstitutionAvatar({ colorKey, initials }: { colorKey: string; initials: string }) {
  const c = getInstitutionColor(colorKey);
  return (
    <Avatar className="h-6 w-6">
      <AvatarFallback className={`text-[10px] font-bold ${c.bg} ${c.text} ${c.border} border`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

function HeaderSection({
  onTogglePanel,
  panelOpen,
}: {
  onTogglePanel: () => void;
  panelOpen: boolean;
}) {
  const overallStatus: BalanceStatus = "atencao";
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3a3a3a] bg-[#1a1a1a] px-6 py-4">
      <div className="flex flex-wrap items-center gap-4">
        <Button size="icon" variant="ghost" data-testid="button-back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold text-[#ededed]" data-testid="text-client-name">
              Roberto Mendes
            </h1>
            <Badge
              className="no-default-hover-elevate no-default-active-elevate border-[rgba(109,177,212,0.25)] bg-[rgba(109,177,212,0.1)] text-[11px] text-[#6db1d4]"
              data-testid="badge-suitability"
            >
              Moderado
            </Badge>
            <StatusBadge status={overallStatus} />
          </div>
          <p className="mt-0.5 text-xs text-[#8c8c8c]" data-testid="text-last-consolidation">
            Última consolidação: 28/02/2026
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-md border border-[#3a3a3a] bg-[#121212] px-3 py-1.5">
          <span className="text-xs text-[#8c8c8c]">PL Total</span>
          <span className="text-sm font-semibold text-[#ededed]" data-testid="text-aum">
            {formatBRLFull(TOTAL_AUM)}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[#3a3a3a] bg-[#121212] px-3 py-1.5">
          <span className="text-xs text-[#8c8c8c]">Novo aporte/resgate</span>
          <input
            type="text"
            placeholder="R$ 0"
            className="w-24 bg-transparent text-sm text-[#ededed] outline-none placeholder:text-[#555]"
            data-testid="input-aporte-resgate"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onTogglePanel}
          data-testid="button-toggle-panel"
        >
          {panelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
        </Button>
        <Button
          className="border-[rgba(110,207,142,0.3)] bg-[rgba(110,207,142,0.12)] text-[#6ecf8e]"
          data-testid="button-save"
        >
          <Save className="mr-1.5 h-3.5 w-3.5" />
          Salvar ajustes
        </Button>
      </div>
    </div>
  );
}

function ComplianceBar() {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[#3a3a3a] bg-[#1a1a1a]/60 px-6 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-[#8c8c8c]">
        <Shield className="h-3.5 w-3.5" />
        <span className="font-medium">Compliance</span>
      </div>
      <span className="text-[#3a3a3a]">|</span>

      {FGC_DATA.map((fgc) => {
        const s = FGC_STYLES[fgc.status];
        const instC = getInstitutionColor(fgc.colorKey);
        return (
          <div
            key={fgc.institution}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 ${s.bg} ${s.border}`}
            data-testid={`fgc-chip-${fgc.institution}`}
          >
            <Avatar className="h-4 w-4">
              <AvatarFallback className={`text-[8px] font-bold ${instC.bg} ${instC.text}`}>
                {fgc.institution.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className={`text-[11px] font-medium ${s.color}`}>
              FGC {formatBRL(fgc.covered)}/{formatBRL(fgc.limit)}
            </span>
            {fgc.status === "critico" && <AlertTriangle className="h-3 w-3 text-[#e05c5c]" />}
            {fgc.status === "alerta" && <AlertTriangle className="h-3 w-3 text-[#dcb092]" />}
          </div>
        );
      })}

      <span className="text-[#3a3a3a]">|</span>

      <div className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(110,207,142,0.2)] bg-[rgba(110,207,142,0.08)] px-2 py-1">
        <CheckCircle className="h-3 w-3 text-[#6ecf8e]" />
        <span className="text-[11px] font-medium text-[#6ecf8e]">Suitability</span>
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(110,207,142,0.2)] bg-[rgba(110,207,142,0.08)] px-2 py-1">
        <CheckCircle className="h-3 w-3 text-[#6ecf8e]" />
        <span className="text-[11px] font-medium text-[#6ecf8e]">Prazo máx.</span>
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(220,176,146,0.2)] bg-[rgba(220,176,146,0.08)] px-2 py-1">
        <AlertTriangle className="h-3 w-3 text-[#dcb092]" />
        <span className="text-[11px] font-medium text-[#dcb092]">Restrição ativo</span>
      </div>
    </div>
  );
}

function MatrixTable({
  allocatorValues,
  onAllocatorChange,
}: {
  allocatorValues: Record<string, Record<string, string>>;
  onAllocatorChange: (subId: string, inst: string, val: string) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setCollapsed((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const categoryTotals = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const total = cat.subs.reduce(
        (acc, sub) => ({
          alocIdeal: acc.alocIdeal + sub.alocIdeal,
          alocAtual: acc.alocAtual + sub.alocAtual,
          sugestao: acc.sugestao + sub.sugestao,
          pctPL: acc.pctPL + sub.pctPL,
          byInstitution: INSTITUTIONS.reduce(
            (instAcc, inst) => ({
              ...instAcc,
              [inst.name]: (instAcc[inst.name] || 0) + (sub.byInstitution[inst.name] || 0),
            }),
            acc.byInstitution
          ),
        }),
        {
          alocIdeal: 0,
          alocAtual: 0,
          sugestao: 0,
          pctPL: 0,
          byInstitution: {} as Record<string, number>,
        }
      );
      return { catId: cat.id, ...total };
    });
  }, []);

  const grandTotals = useMemo(() => {
    return categoryTotals.reduce(
      (acc, ct) => ({
        alocIdeal: acc.alocIdeal + ct.alocIdeal,
        alocAtual: acc.alocAtual + ct.alocAtual,
        sugestao: acc.sugestao + ct.sugestao,
        pctPL: acc.pctPL + ct.pctPL,
        byInstitution: INSTITUTIONS.reduce(
          (instAcc, inst) => ({
            ...instAcc,
            [inst.name]: (instAcc[inst.name] || 0) + (ct.byInstitution[inst.name] || 0),
          }),
          acc.byInstitution
        ),
      }),
      {
        alocIdeal: 0,
        alocAtual: 0,
        sugestao: 0,
        pctPL: 0,
        byInstitution: {} as Record<string, number>,
      }
    );
  }, [categoryTotals]);

  return (
    <div className="flex-1 overflow-auto" data-testid="matrix-table-container">
      <table className="w-full min-w-[1200px] border-collapse text-xs">
        <thead className="sticky top-0 z-20 bg-[#121212]">
          <tr className="border-b border-[#3a3a3a]">
            <th rowSpan={2} className="sticky left-0 z-30 w-48 bg-[#121212] px-4 py-2.5 text-left font-medium text-[#8c8c8c]">
              Classificação
            </th>
            <th rowSpan={2} className="w-16 px-3 py-2.5 text-right font-medium text-[#8c8c8c]">% P.L.</th>
            <th rowSpan={2} className="w-24 px-3 py-2.5 text-center font-medium text-[#8c8c8c]">Status</th>
            <th rowSpan={2} className="w-20 px-3 py-2.5 text-right font-medium text-[#8c8c8c]">% Fora</th>
            <th rowSpan={2} className="w-28 px-3 py-2.5 text-right font-medium text-[#8c8c8c]">Ideal (R$)</th>
            <th rowSpan={2} className="w-28 px-3 py-2.5 text-right font-medium text-[#8c8c8c]">Atual (R$)</th>
            <th rowSpan={2} className="w-28 px-3 py-2.5 text-right font-medium text-[#8c8c8c]">Sugestão</th>
            {INSTITUTIONS.map((inst) => (
              <th key={inst.name} colSpan={2} className="border-l border-[#2a2a2a] px-2 py-2 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <InstitutionAvatar colorKey={inst.colorKey} initials={inst.initials} />
                  <span className="font-medium text-[#ededed]">{inst.name}</span>
                </div>
              </th>
            ))}
          </tr>
          <tr className="border-b border-[#2a2a2a]">
            {INSTITUTIONS.map((inst) => (
              <Fragment key={`${inst.name}-sub`}>
                <th className="border-l border-[#2a2a2a] px-2 py-1 text-center text-[10px] font-normal text-[#666]">
                  $ Atual
                </th>
                <th className="px-2 py-1 text-center text-[10px] font-normal text-[#666]">
                  Alocador
                </th>
              </Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {CATEGORIES.map((cat, catIdx) => {
            const ct = categoryTotals[catIdx];
            const isCollapsed = collapsed[cat.id] ?? false;
            const worstStatus: BalanceStatus = cat.subs.some((s) => s.status === "desbalanceado")
              ? "desbalanceado"
              : cat.subs.some((s) => s.status === "atencao")
                ? "atencao"
                : "ok";
            return (
              <Fragment key={cat.id}>
                <tr
                  className="cursor-pointer border-b border-[#2a2a2a] bg-[#1a1a1a]/80 hover-elevate"
                  onClick={() => toggleCategory(cat.id)}
                  data-testid={`category-row-${cat.id}`}
                >
                  <td className="sticky left-0 z-10 bg-[#1a1a1a]/80 px-4 py-2">
                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronRight className="h-3.5 w-3.5 text-[#8c8c8c]" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-[#8c8c8c]" />
                      )}
                      <span className="font-semibold text-[#ededed]">{cat.name}</span>
                      <span className="text-[10px] text-[#666]">({cat.subs.length})</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-[#ededed]">
                    {ct.pctPL.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-center">
                    <StatusBadge status={worstStatus} />
                  </td>
                  <td className="px-3 py-2 text-right text-[#8c8c8c]">—</td>
                  <td className="px-3 py-2 text-right font-medium text-[#ededed]">
                    {formatBRL(ct.alocIdeal)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-[#ededed]">
                    {formatBRL(ct.alocAtual)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <SugestaoCell value={ct.sugestao} />
                  </td>
                  {INSTITUTIONS.map((inst) => (
                    <Fragment key={`${cat.id}-${inst.name}`}>
                      <td
                        className="border-l border-[#2a2a2a] px-3 py-2 text-right font-medium text-[#ccc]"
                      >
                        {formatBRL(ct.byInstitution[inst.name] || 0)}
                      </td>
                      <td className="px-2 py-2 text-center text-[#555]">
                        —
                      </td>
                    </Fragment>
                  ))}
                </tr>

                {!isCollapsed &&
                  cat.subs.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-[#222] transition-colors hover:bg-[#1a1a1a]/40"
                      data-testid={`sub-row-${sub.id}`}
                    >
                      <td className="sticky left-0 z-10 bg-[#121212] px-4 py-2 pl-10">
                        <span className="text-[#ccc]">{sub.name}</span>
                      </td>
                      <td className="px-3 py-2 text-right text-[#ccc]">{sub.pctPL.toFixed(1)}%</td>
                      <td className="px-3 py-2 text-center">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span
                          className={
                            sub.pctForaIdeal > 10
                              ? "text-[#e05c5c]"
                              : sub.pctForaIdeal > 3
                                ? "text-[#dcb092]"
                                : "text-[#8c8c8c]"
                          }
                        >
                          {sub.pctForaIdeal.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-[#ccc]">{formatBRL(sub.alocIdeal)}</td>
                      <td className="px-3 py-2 text-right text-[#ccc]">{formatBRL(sub.alocAtual)}</td>
                      <td className="px-3 py-2 text-right">
                        <SugestaoCell value={sub.sugestao} />
                      </td>
                      {INSTITUTIONS.map((inst) => (
                        <Fragment key={`${sub.id}-${inst.name}`}>
                          <td
                            className="border-l border-[#2a2a2a] px-3 py-2 text-right text-[#999]"
                          >
                            {formatBRL(sub.byInstitution[inst.name] || 0)}
                          </td>
                          <td className="px-1 py-1.5">
                            <input
                              type="text"
                              placeholder="—"
                              value={allocatorValues[sub.id]?.[inst.name] ?? ""}
                              onChange={(e) => onAllocatorChange(sub.id, inst.name, e.target.value)}
                              className="w-full rounded border border-[#333] bg-[#1a1a1a] px-2 py-1 text-center text-xs text-[#ededed] outline-none transition-colors placeholder:text-[#444] focus:border-[#6db1d4] focus:bg-[#1e1e1e]"
                              data-testid={`input-allocator-${sub.id}-${inst.name}`}
                            />
                          </td>
                        </Fragment>
                      ))}
                    </tr>
                  ))}
              </Fragment>
            );
          })}
        </tbody>

        <tfoot className="sticky bottom-0 z-20 bg-[#1a1a1a]">
          <tr className="border-t-2 border-[#3a3a3a]">
            <td className="sticky left-0 z-30 bg-[#1a1a1a] px-4 py-3 font-semibold text-[#ededed]">
              Total
            </td>
            <td className="px-3 py-3 text-right font-semibold text-[#ededed]">
              {grandTotals.pctPL.toFixed(1)}%
            </td>
            <td />
            <td />
            <td className="px-3 py-3 text-right font-semibold text-[#ededed]">
              {formatBRLFull(grandTotals.alocIdeal)}
            </td>
            <td className="px-3 py-3 text-right font-semibold text-[#ededed]">
              {formatBRLFull(grandTotals.alocAtual)}
            </td>
            <td className="px-3 py-3 text-right">
              <SugestaoCell value={grandTotals.sugestao} />
            </td>
            {INSTITUTIONS.map((inst) => (
              <Fragment key={`total-${inst.name}`}>
                <td
                  className="border-l border-[#2a2a2a] px-3 py-3 text-right font-semibold text-[#ededed]"
                >
                  {formatBRL(grandTotals.byInstitution[inst.name] || 0)}
                </td>
                <td className="px-2 py-3 text-center text-[#555]">
                  —
                </td>
              </Fragment>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function PolicyPanel({ open }: { open: boolean }) {
  if (!open) return null;

  const sectionClass = "mb-4";
  const labelClass = "mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8c8c8c]";
  const valueClass = "text-xs text-[#ccc]";

  return (
    <div
      className="flex w-72 shrink-0 flex-col border-l border-[#3a3a3a] bg-[#1a1a1a]"
      data-testid="policy-panel"
    >
      <div className="flex items-center gap-2 border-b border-[#3a3a3a] px-4 py-3">
        <Info className="h-4 w-4 text-[#6db1d4]" />
        <span className="text-sm font-semibold text-[#ededed]">Política de Investimentos</span>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className={sectionClass}>
          <p className={labelClass}>Suitability</p>
          <div className="flex items-center gap-2">
            <Badge className="no-default-hover-elevate no-default-active-elevate border-[rgba(109,177,212,0.25)] bg-[rgba(109,177,212,0.1)] text-[11px] text-[#6db1d4]">
              {POLICY.suitability}
            </Badge>
          </div>
        </div>

        <div className={sectionClass}>
          <p className={labelClass}>FGC Conforto</p>
          <p className={valueClass}>{POLICY.fgcComfort}</p>
        </div>

        <div className={sectionClass}>
          <p className={labelClass}>Perda Máxima</p>
          <p className={`${valueClass} text-[#e05c5c]`}>{POLICY.maxLoss}</p>
        </div>

        <div className={sectionClass}>
          <p className={labelClass}>Retorno Alvo</p>
          <p className={`${valueClass} text-[#6ecf8e]`}>{POLICY.returnTarget}</p>
        </div>

        <div className={sectionClass}>
          <p className={labelClass}>Prazo Máximo</p>
          <p className={valueClass}>{POLICY.maxTerm}</p>
        </div>

        <div className={sectionClass}>
          <p className={labelClass}>Liquidez Mínima</p>
          <p className={valueClass}>{POLICY.liquidityMin}</p>
        </div>

        <div className={sectionClass}>
          <p className={labelClass}>Plataformas</p>
          <div className="flex flex-wrap gap-1">
            {POLICY.platforms.map((p) => {
              const c = getInstitutionColor(p);
              return (
                <span
                  key={p}
                  className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${c.bg} ${c.text} ${c.border}`}
                >
                  {p}
                </span>
              );
            })}
          </div>
        </div>

        <div className={sectionClass}>
          <p className={labelClass}>Restrições de Ativos</p>
          <div className="flex flex-col gap-1">
            {POLICY.assetRestrictions.map((r) => (
              <div
                key={r}
                className="flex items-center gap-1.5 text-xs text-[#e05c5c]"
              >
                <AlertTriangle className="h-3 w-3 shrink-0" />
                {r}
              </div>
            ))}
          </div>
        </div>

        <div className={sectionClass}>
          <p className={labelClass}>Exposição Geográfica</p>
          <div className="flex flex-col gap-1">
            {POLICY.exposureAreas.map((a) => (
              <p key={a} className={valueClass}>
                {a}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MockupRealocador() {
  const [panelOpen, setPanelOpen] = useState(true);
  const [allocatorValues, setAllocatorValues] = useState<Record<string, Record<string, string>>>({});

  const handleAllocatorChange = (subId: string, inst: string, val: string) => {
    setAllocatorValues((prev) => ({
      ...prev,
      [subId]: {
        ...prev[subId],
        [inst]: val,
      },
    }));
  };

  return (
    <div className="flex h-screen flex-col bg-[#121212] text-[#ededed]" data-testid="mockup-realocador">
      <HeaderSection onTogglePanel={() => setPanelOpen(!panelOpen)} panelOpen={panelOpen} />
      <ComplianceBar />
      <div className="flex flex-1 overflow-hidden">
        <MatrixTable allocatorValues={allocatorValues} onAllocatorChange={handleAllocatorChange} />
        <PolicyPanel open={panelOpen} />
      </div>
    </div>
  );
}
