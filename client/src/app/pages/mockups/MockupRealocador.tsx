import { useState, useMemo, Fragment } from "react";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Layers,
  ArrowDownUp,
  Scale,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  Shield,
  Info,
  Save,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";
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
        id: "cdi-liq", name: "CDI - Liquidez", pctPL: 12.0, status: "ok", pctForaIdeal: 1.2,
        alocIdeal: 1_590_000, alocAtual: 1_570_800, sugestao: 19_200,
        byInstitution: { XP: 470_000, BTG: 340_000, "Itaú": 285_000, Safra: 245_800, Bradesco: 230_000 },
      },
      {
        id: "cdi-tit", name: "CDI - Títulos", pctPL: 8.5, status: "atencao", pctForaIdeal: 3.8,
        alocIdeal: 1_126_250, alocAtual: 1_168_950, sugestao: -42_700,
        byInstitution: { XP: 380_000, BTG: 270_000, "Itaú": 230_000, Safra: 178_950, Bradesco: 110_000 },
      },
      {
        id: "cdi-fund", name: "CDI - Fundos", pctPL: 6.5, status: "ok", pctForaIdeal: 0.1,
        alocIdeal: 861_250, alocAtual: 855_000, sugestao: 6_250,
        byInstitution: { XP: 280_000, BTG: 220_000, "Itaú": 165_000, Safra: 100_000, Bradesco: 90_000 },
      },
      {
        id: "infl-tit", name: "Inflação - Títulos", pctPL: 10.0, status: "desbalanceado", pctForaIdeal: 8.2,
        alocIdeal: 1_325_000, alocAtual: 1_433_600, sugestao: -108_600,
        byInstitution: { XP: 450_000, BTG: 340_000, "Itaú": 280_000, Safra: 223_600, Bradesco: 140_000 },
      },
      {
        id: "infl-fund", name: "Inflação - Fundos", pctPL: 6.0, status: "ok", pctForaIdeal: 0.4,
        alocIdeal: 795_000, alocAtual: 791_800, sugestao: 3_200,
        byInstitution: { XP: 250_000, BTG: 200_000, "Itaú": 160_000, Safra: 101_800, Bradesco: 80_000 },
      },
      {
        id: "pre", name: "Pré-Fixado", pctPL: 5.5, status: "atencao", pctForaIdeal: 4.6,
        alocIdeal: 728_750, alocAtual: 695_250, sugestao: 33_500,
        byInstitution: { XP: 230_000, BTG: 170_000, "Itaú": 140_000, Safra: 90_250, Bradesco: 65_000 },
      },
      {
        id: "debent", name: "Debêntures", pctPL: 3.5, status: "ok", pctForaIdeal: 0.8,
        alocIdeal: 463_750, alocAtual: 460_100, sugestao: 3_650,
        byInstitution: { XP: 180_000, BTG: 130_000, "Itaú": 72_000, Safra: 53_100, Bradesco: 25_000 },
      },
      {
        id: "cri-cra", name: "CRI / CRA", pctPL: 2.5, status: "atencao", pctForaIdeal: 6.3,
        alocIdeal: 331_250, alocAtual: 352_000, sugestao: -20_750,
        byInstitution: { XP: 140_000, BTG: 100_000, "Itaú": 55_000, Safra: 37_000, Bradesco: 20_000 },
      },
    ],
  },
  {
    id: "eq-br",
    name: "Equities Brasil",
    subs: [
      {
        id: "acoes", name: "Ações", pctPL: 8.5, status: "desbalanceado", pctForaIdeal: 12.5,
        alocIdeal: 1_126_250, alocAtual: 985_500, sugestao: 140_750,
        byInstitution: { XP: 400_000, BTG: 280_000, "Itaú": 165_000, Safra: 85_500, Bradesco: 55_000 },
      },
      {
        id: "long-biased", name: "Long Biased", pctPL: 4.5, status: "ok", pctForaIdeal: 2.0,
        alocIdeal: 596_250, alocAtual: 608_150, sugestao: -11_900,
        byInstitution: { XP: 250_000, BTG: 175_000, "Itaú": 100_000, Safra: 53_150, Bradesco: 30_000 },
      },
      {
        id: "private-br", name: "Private Brasil", pctPL: 4.0, status: "ok", pctForaIdeal: 1.0,
        alocIdeal: 530_000, alocAtual: 524_700, sugestao: 5_300,
        byInstitution: { XP: 210_000, BTG: 150_000, "Itaú": 80_000, Safra: 54_700, Bradesco: 30_000 },
      },
      {
        id: "small-caps", name: "Small Caps", pctPL: 2.5, status: "desbalanceado", pctForaIdeal: 18.0,
        alocIdeal: 331_250, alocAtual: 271_625, sugestao: 59_625,
        byInstitution: { XP: 110_000, BTG: 75_000, "Itaú": 45_000, Safra: 26_625, Bradesco: 15_000 },
      },
    ],
  },
  {
    id: "ext",
    name: "Exterior",
    subs: [
      {
        id: "ext-rf", name: "RF Exterior", pctPL: 4.5, status: "ok", pctForaIdeal: 0.8,
        alocIdeal: 596_250, alocAtual: 601_000, sugestao: -4_750,
        byInstitution: { XP: 240_000, BTG: 170_000, "Itaú": 90_000, Safra: 61_000, Bradesco: 40_000 },
      },
      {
        id: "ext-mm", name: "Multimercado Ext.", pctPL: 4.0, status: "atencao", pctForaIdeal: 5.2,
        alocIdeal: 530_000, alocAtual: 502_500, sugestao: 27_500,
        byInstitution: { XP: 200_000, BTG: 140_000, "Itaú": 80_000, Safra: 52_500, Bradesco: 30_000 },
      },
      {
        id: "ext-acoes", name: "Ações Exterior", pctPL: 4.0, status: "desbalanceado", pctForaIdeal: 15.3,
        alocIdeal: 530_000, alocAtual: 449_000, sugestao: 81_000,
        byInstitution: { XP: 180_000, BTG: 120_000, "Itaú": 75_000, Safra: 44_000, Bradesco: 30_000 },
      },
      {
        id: "ext-hedge", name: "Hedge Cambial", pctPL: 1.5, status: "ok", pctForaIdeal: 0.5,
        alocIdeal: 198_750, alocAtual: 199_750, sugestao: -1_000,
        byInstitution: { XP: 80_000, BTG: 55_000, "Itaú": 35_000, Safra: 19_750, Bradesco: 10_000 },
      },
    ],
  },
  {
    id: "alt",
    name: "Alternativo",
    subs: [
      {
        id: "imob", name: "Imobiliário", pctPL: 4.5, status: "ok", pctForaIdeal: 1.5,
        alocIdeal: 596_250, alocAtual: 605_300, sugestao: -9_050,
        byInstitution: { XP: 240_000, BTG: 170_000, "Itaú": 95_000, Safra: 60_300, Bradesco: 40_000 },
      },
      {
        id: "pe", name: "Private Equity", pctPL: 3.5, status: "ok", pctForaIdeal: 0.3,
        alocIdeal: 463_750, alocAtual: 465_150, sugestao: -1_400,
        byInstitution: { XP: 185_000, BTG: 130_000, "Itaú": 75_000, Safra: 45_150, Bradesco: 30_000 },
      },
      {
        id: "infra", name: "Infraestrutura", pctPL: 2.5, status: "ok", pctForaIdeal: 2.1,
        alocIdeal: 331_250, alocAtual: 324_300, sugestao: 6_950,
        byInstitution: { XP: 130_000, BTG: 90_000, "Itaú": 55_000, Safra: 29_300, Bradesco: 20_000 },
      },
      {
        id: "agro", name: "Agronegócio", pctPL: 1.5, status: "atencao", pctForaIdeal: 7.5,
        alocIdeal: 198_750, alocAtual: 183_825, sugestao: 14_925,
        byInstitution: { XP: 75_000, BTG: 50_000, "Itaú": 30_000, Safra: 18_825, Bradesco: 10_000 },
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

const POLICY = {
  suitability: "Moderado",
  fgcComfort: "Até R$ 200.000 por instituição",
  maxLoss: "-12% no ano",
  returnTarget: "IPCA + 6% a.a.",
  maxTerm: "5 anos (RF), 7 anos (PE)",
  liquidityMin: "30% em D+0/D+1",
  platforms: ["XP", "BTG", "Itaú", "Safra", "Bradesco"],
  assetRestrictions: ["Cripto", "COE sem capital protegido", "Derivativos alavancados"],
  exposureAreas: ["Brasil 70-80%", "EUA 10-15%", "Europa 5-10%", "Ásia < 5%"],
};

function formatBRL(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(2).replace(".", ",")}M`;
  return `R$ ${(value / 1_000).toFixed(0)}k`;
}

function formatBRLFull(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

const STATUS_STYLES: Record<BalanceStatus, { label: string; color: string; bg: string; border: string }> = {
  ok: { label: "Ok", color: "text-[#6ecf8e]", bg: "bg-[rgba(110,207,142,0.1)]", border: "border-[rgba(110,207,142,0.25)]" },
  atencao: { label: "Atenção", color: "text-[#dcb092]", bg: "bg-[rgba(220,176,146,0.1)]", border: "border-[rgba(220,176,146,0.25)]" },
  desbalanceado: { label: "Desbalanceado", color: "text-[#e05c5c]", bg: "bg-[rgba(224,92,92,0.1)]", border: "border-[rgba(224,92,92,0.25)]" },
};

const FGC_STYLES: Record<FGCStatus, { color: string; bg: string; border: string }> = {
  ok: { color: "text-[#6ecf8e]", bg: "bg-[rgba(110,207,142,0.08)]", border: "border-[rgba(110,207,142,0.2)]" },
  alerta: { color: "text-[#dcb092]", bg: "bg-[rgba(220,176,146,0.08)]", border: "border-[rgba(220,176,146,0.2)]" },
  critico: { color: "text-[#e05c5c]", bg: "bg-[rgba(224,92,92,0.08)]", border: "border-[rgba(224,92,92,0.2)]" },
};

function StatusBadge({ status }: { status: BalanceStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${s.color} ${s.bg} ${s.border}`}>
      {status === "ok" ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
      {s.label}
    </span>
  );
}

function SugestaoCell({ value }: { value: number }) {
  if (value === 0) return <span className="text-[#8c8c8c]"><Minus className="inline h-3 w-3" /></span>;
  const pos = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${pos ? "text-[#6ecf8e]" : "text-[#e05c5c]"}`}>
      {pos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {pos ? "+" : ""}{formatBRL(value)}
    </span>
  );
}

function InstitutionAvatar({ colorKey, initials }: { colorKey: string; initials: string }) {
  const c = getInstitutionColor(colorKey);
  return (
    <Avatar className="h-6 w-6">
      <AvatarFallback className={`text-[10px] font-bold ${c.bg} ${c.text} ${c.border} border`}>{initials}</AvatarFallback>
    </Avatar>
  );
}

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Tarefas", url: "/tasks", icon: CheckSquare },
  { title: "Consolidador", url: "/consolidador", icon: Layers },
  { title: "Varredura", url: "/varredura", icon: ArrowDownUp },
  { title: "Realocador", url: "/realocador", icon: Scale },
];

function MockupSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="25" width="8" height="20" rx="2" fill="currentColor" />
            <rect x="18" y="15" width="8" height="30" rx="2" fill="currentColor" />
            <path d="M31 15H39V30C39 38 47 38 47 30" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
          </svg>
          <span className="text-lg font-bold tracking-tight">Mastodonte</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild data-active={item.title === "Realocador"} data-testid={`nav-${item.title.toLowerCase()}`}>
                    <a href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-md p-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-sm">JR</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">João Rossi</p>
            <Badge variant="outline" className="mt-1 h-4 px-1.5 py-0 text-[10px] bg-orange-500/20 text-orange-400 border-orange-500/30">Alocador</Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
          <LogOut className="mr-2 h-4 w-4" />Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
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
            (instAcc, inst) => ({ ...instAcc, [inst.name]: (instAcc[inst.name] || 0) + (sub.byInstitution[inst.name] || 0) }),
            acc.byInstitution
          ),
        }),
        { alocIdeal: 0, alocAtual: 0, sugestao: 0, pctPL: 0, byInstitution: {} as Record<string, number> }
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
          (instAcc, inst) => ({ ...instAcc, [inst.name]: (instAcc[inst.name] || 0) + (ct.byInstitution[inst.name] || 0) }),
          acc.byInstitution
        ),
      }),
      { alocIdeal: 0, alocAtual: 0, sugestao: 0, pctPL: 0, byInstitution: {} as Record<string, number> }
    );
  }, [categoryTotals]);

  return (
    <div className="overflow-x-auto rounded-md border border-[#2a2a2a]" data-testid="matrix-table-container">
      <table className="w-full min-w-[1100px] border-collapse text-xs">
        <thead className="bg-[#1a1a1a]">
          <tr className="border-b border-[#2a2a2a]">
            <th rowSpan={2} className="w-44 px-4 py-2.5 text-left font-medium text-[#8c8c8c]">Classificação</th>
            <th rowSpan={2} className="w-14 px-2 py-2.5 text-right font-medium text-[#8c8c8c]">% P.L.</th>
            <th rowSpan={2} className="w-20 px-2 py-2.5 text-center font-medium text-[#8c8c8c]">Status</th>
            <th rowSpan={2} className="w-14 px-2 py-2.5 text-right font-medium text-[#8c8c8c]">% Fora</th>
            <th rowSpan={2} className="w-24 px-2 py-2.5 text-right font-medium text-[#8c8c8c]">Ideal</th>
            <th rowSpan={2} className="w-24 px-2 py-2.5 text-right font-medium text-[#8c8c8c]">Atual</th>
            <th rowSpan={2} className="w-24 px-2 py-2.5 text-right font-medium text-[#8c8c8c]">Sugestão</th>
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
                <th className="border-l border-[#2a2a2a] px-2 py-1 text-center text-[10px] font-normal text-[#555]">$ Atual</th>
                <th className="px-2 py-1 text-center text-[10px] font-normal text-[#555]">Alocador</th>
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
              : cat.subs.some((s) => s.status === "atencao") ? "atencao" : "ok";
            return (
              <Fragment key={cat.id}>
                <tr
                  className="cursor-pointer border-b border-[#2a2a2a] bg-[#161616] hover-elevate"
                  onClick={() => toggleCategory(cat.id)}
                  data-testid={`category-row-${cat.id}`}
                >
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {isCollapsed ? <ChevronRight className="h-3.5 w-3.5 text-[#8c8c8c]" /> : <ChevronDown className="h-3.5 w-3.5 text-[#8c8c8c]" />}
                      <span className="font-semibold text-[#ededed]">{cat.name}</span>
                      <span className="text-[10px] text-[#555]">({cat.subs.length})</span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-[#ededed]">{ct.pctPL.toFixed(1)}%</td>
                  <td className="px-2 py-2 text-center"><StatusBadge status={worstStatus} /></td>
                  <td className="px-2 py-2 text-right text-[#555]">—</td>
                  <td className="px-2 py-2 text-right font-medium text-[#ededed]">{formatBRL(ct.alocIdeal)}</td>
                  <td className="px-2 py-2 text-right font-medium text-[#ededed]">{formatBRL(ct.alocAtual)}</td>
                  <td className="px-2 py-2 text-right"><SugestaoCell value={ct.sugestao} /></td>
                  {INSTITUTIONS.map((inst) => (
                    <Fragment key={`${cat.id}-${inst.name}`}>
                      <td className="border-l border-[#2a2a2a] px-2 py-2 text-right font-medium text-[#bbb]">{formatBRL(ct.byInstitution[inst.name] || 0)}</td>
                      <td className="px-2 py-2 text-center text-[#444]">—</td>
                    </Fragment>
                  ))}
                </tr>

                {!isCollapsed && cat.subs.map((sub) => (
                  <tr key={sub.id} className="border-b border-[#1e1e1e] transition-colors hover:bg-[#161616]/50" data-testid={`sub-row-${sub.id}`}>
                    <td className="px-4 py-2 pl-10"><span className="text-[#bbb]">{sub.name}</span></td>
                    <td className="px-2 py-2 text-right text-[#bbb]">{sub.pctPL.toFixed(1)}%</td>
                    <td className="px-2 py-2 text-center"><StatusBadge status={sub.status} /></td>
                    <td className="px-2 py-2 text-right">
                      <span className={sub.pctForaIdeal > 10 ? "text-[#e05c5c]" : sub.pctForaIdeal > 3 ? "text-[#dcb092]" : "text-[#8c8c8c]"}>
                        {sub.pctForaIdeal.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right text-[#bbb]">{formatBRL(sub.alocIdeal)}</td>
                    <td className="px-2 py-2 text-right text-[#bbb]">{formatBRL(sub.alocAtual)}</td>
                    <td className="px-2 py-2 text-right"><SugestaoCell value={sub.sugestao} /></td>
                    {INSTITUTIONS.map((inst) => (
                      <Fragment key={`${sub.id}-${inst.name}`}>
                        <td className="border-l border-[#2a2a2a] px-2 py-2 text-right text-[#888]">{formatBRL(sub.byInstitution[inst.name] || 0)}</td>
                        <td className="px-1 py-1.5">
                          <input
                            type="text"
                            placeholder="—"
                            value={allocatorValues[sub.id]?.[inst.name] ?? ""}
                            onChange={(e) => onAllocatorChange(sub.id, inst.name, e.target.value)}
                            className="w-full rounded border border-[#2a2a2a] bg-[#161616] px-2 py-1 text-center text-xs text-[#ededed] outline-none placeholder:text-[#333] focus:border-[#6db1d4]"
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

        <tfoot className="bg-[#1a1a1a]">
          <tr className="border-t-2 border-[#3a3a3a]">
            <td className="px-4 py-2.5 font-semibold text-[#ededed]">Total</td>
            <td className="px-2 py-2.5 text-right font-semibold text-[#ededed]">{grandTotals.pctPL.toFixed(1)}%</td>
            <td />
            <td />
            <td className="px-2 py-2.5 text-right font-semibold text-[#ededed]">{formatBRLFull(grandTotals.alocIdeal)}</td>
            <td className="px-2 py-2.5 text-right font-semibold text-[#ededed]">{formatBRLFull(grandTotals.alocAtual)}</td>
            <td className="px-2 py-2.5 text-right"><SugestaoCell value={grandTotals.sugestao} /></td>
            {INSTITUTIONS.map((inst) => (
              <Fragment key={`total-${inst.name}`}>
                <td className="border-l border-[#2a2a2a] px-2 py-2.5 text-right font-semibold text-[#ededed]">{formatBRL(grandTotals.byInstitution[inst.name] || 0)}</td>
                <td className="px-2 py-2.5 text-center text-[#444]">—</td>
              </Fragment>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function FGCSection() {
  return (
    <section data-testid="fgc-section">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-[#ededed]">
        <Shield className="h-4 w-4 text-[#6db1d4]" />
        FGC — Fundo Garantidor de Créditos
      </h2>
      <div className="grid grid-cols-5 gap-3">
        {FGC_DATA.map((fgc) => {
          const s = FGC_STYLES[fgc.status];
          const instC = getInstitutionColor(fgc.colorKey);
          const pct = ((fgc.covered / fgc.limit) * 100).toFixed(0);
          return (
            <div key={fgc.institution} className={`rounded-md border p-3 ${s.bg} ${s.border}`} data-testid={`fgc-card-${fgc.institution}`}>
              <div className="mb-2 flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className={`text-[10px] font-bold ${instC.bg} ${instC.text}`}>{fgc.institution.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-[#ededed]">{fgc.institution}</span>
                {fgc.status === "critico" && <AlertTriangle className="ml-auto h-3.5 w-3.5 text-[#e05c5c]" />}
                {fgc.status === "alerta" && <AlertTriangle className="ml-auto h-3.5 w-3.5 text-[#dcb092]" />}
                {fgc.status === "ok" && <CheckCircle className="ml-auto h-3.5 w-3.5 text-[#6ecf8e]" />}
              </div>
              <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#2a2a2a]">
                <div
                  className={`h-full rounded-full transition-all ${fgc.status === "critico" ? "bg-[#e05c5c]" : fgc.status === "alerta" ? "bg-[#dcb092]" : "bg-[#6ecf8e]"}`}
                  style={{ width: `${Math.min(Number(pct), 100)}%` }}
                />
              </div>
              <div className="flex items-baseline justify-between">
                <span className={`text-xs font-medium ${s.color}`}>{formatBRLFull(fgc.covered)}</span>
                <span className="text-[10px] text-[#555]">/ {formatBRLFull(fgc.limit)}</span>
              </div>
              <p className={`mt-0.5 text-[10px] ${s.color}`}>{pct}% utilizado</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PolicySection() {
  const row = "flex items-baseline justify-between border-b border-[#1e1e1e] py-2";
  const lbl = "text-xs text-[#8c8c8c]";
  const val = "text-xs text-[#ccc]";

  return (
    <section data-testid="policy-section">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-[#ededed]">
        <Info className="h-4 w-4 text-[#6db1d4]" />
        Política de Investimentos — Foundation
      </h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-md border border-[#2a2a2a] bg-[#161616] p-4">
          <div className={row}>
            <span className={lbl}>Suitability</span>
            <Badge className="no-default-hover-elevate no-default-active-elevate border-[rgba(109,177,212,0.25)] bg-[rgba(109,177,212,0.1)] text-[11px] text-[#6db1d4]">{POLICY.suitability}</Badge>
          </div>
          <div className={row}>
            <span className={lbl}>FGC Conforto</span>
            <span className={val}>{POLICY.fgcComfort}</span>
          </div>
          <div className={row}>
            <span className={lbl}>Perda Máxima</span>
            <span className="text-xs text-[#e05c5c]">{POLICY.maxLoss}</span>
          </div>
          <div className={row}>
            <span className={lbl}>Retorno Alvo</span>
            <span className="text-xs text-[#6ecf8e]">{POLICY.returnTarget}</span>
          </div>
          <div className={`${row} border-b-0`}>
            <span className={lbl}>Prazo Máximo</span>
            <span className={val}>{POLICY.maxTerm}</span>
          </div>
        </div>

        <div className="rounded-md border border-[#2a2a2a] bg-[#161616] p-4">
          <div className={`${row}`}>
            <span className={lbl}>Liquidez Mínima</span>
            <span className={val}>{POLICY.liquidityMin}</span>
          </div>
          <div className="border-b border-[#1e1e1e] py-2">
            <span className={lbl}>Plataformas</span>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {POLICY.platforms.map((p) => {
                const c = getInstitutionColor(p);
                return <span key={p} className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${c.bg} ${c.text} ${c.border}`}>{p}</span>;
              })}
            </div>
          </div>
          <div className="border-b border-[#1e1e1e] py-2">
            <span className={lbl}>Restrições de Ativos</span>
            <div className="mt-1.5 flex flex-col gap-1">
              {POLICY.assetRestrictions.map((r) => (
                <div key={r} className="flex items-center gap-1.5 text-xs text-[#e05c5c]">
                  <AlertTriangle className="h-3 w-3 shrink-0" />{r}
                </div>
              ))}
            </div>
          </div>
          <div className="py-2">
            <span className={lbl}>Exposição Geográfica</span>
            <div className="mt-1.5 flex flex-col gap-0.5">
              {POLICY.exposureAreas.map((a) => <p key={a} className={val}>{a}</p>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MockupRealocador() {
  const [allocatorValues, setAllocatorValues] = useState<Record<string, Record<string, string>>>({});
  const handleAllocatorChange = (subId: string, inst: string, val: string) => {
    setAllocatorValues((prev) => ({ ...prev, [subId]: { ...prev[subId], [inst]: val } }));
  };

  const overallStatus: BalanceStatus = "atencao";

  const style = { "--sidebar-width": "16rem", "--sidebar-width-icon": "3rem" };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-[#121212]" data-testid="mockup-realocador">
        <MockupSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-[#2a2a2a] p-3">
            <div className="flex flex-wrap items-center gap-1">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <Button size="icon" variant="ghost" data-testid="button-nav-back">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="flex flex-col gap-6 px-8 pb-32 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-[#ededed]" data-testid="text-client-name">Roberto Mendes</h1>
                  <Badge className="no-default-hover-elevate no-default-active-elevate border-[rgba(109,177,212,0.25)] bg-[rgba(109,177,212,0.1)] text-[11px] text-[#6db1d4]" data-testid="badge-suitability">Moderado</Badge>
                  <StatusBadge status={overallStatus} />
                  <div className="h-5 w-px bg-[#2a2a2a]" />
                  <span className="text-sm font-medium text-[#ededed]" data-testid="text-aum">{formatBRLFull(TOTAL_AUM)}</span>
                  <span className="text-xs text-[#555]" data-testid="text-last-consolidation">Consolidado 28/02/2026</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 rounded-md border border-[#2a2a2a] bg-[#161616] px-3 py-1.5">
                    <span className="text-xs text-[#8c8c8c]">Aporte/resgate</span>
                    <input type="text" placeholder="R$ 0" className="w-20 bg-transparent text-sm text-[#ededed] outline-none placeholder:text-[#444]" data-testid="input-aporte-resgate" />
                  </div>
                  <Button className="border-[rgba(110,207,142,0.3)] bg-[rgba(110,207,142,0.12)] text-[#6ecf8e]" data-testid="button-save">
                    <Save className="mr-1.5 h-3.5 w-3.5" />Salvar ajustes
                  </Button>
                </div>
              </div>

              <MatrixTable allocatorValues={allocatorValues} onAllocatorChange={handleAllocatorChange} />

              <FGCSection />

              <PolicySection />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
