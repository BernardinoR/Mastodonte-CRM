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
  Plus,
  X,
  Clock,
  Mail,
  MessageCircle,
  Check,
  Trash2,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { getInstitutionColor } from "@/features/clients/lib/institutionColors";

type BalanceStatus = "ok" | "atencao" | "desbalanceado";
type FGCStatus = "ok" | "alerta" | "critico";

interface Institution {
  name: string;
  colorKey: string;
  initials: string;
}

interface Asset {
  id: string;
  name: string;
  institution: string;
  value: number;
  pctSub: number;
  maturity?: string;
  rate?: string;
  liquidity?: string;
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
  assets: Asset[];
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

const ALL_CLIENT_INSTITUTIONS: Institution[] = [
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
        assets: [
          { id: "a1", name: "CDB Liquidez Diária XP", institution: "XP", value: 470_000, pctSub: 29.9, rate: "100% CDI", liquidity: "D+0" },
          { id: "a2", name: "CDB Liquidez BTG", institution: "BTG", value: 340_000, pctSub: 21.6, rate: "101% CDI", liquidity: "D+0" },
          { id: "a3", name: "Fundo DI Itaú Soberano", institution: "Itaú", value: 285_000, pctSub: 18.1, rate: "99.5% CDI", liquidity: "D+1" },
          { id: "a4", name: "CDB Liquidez Safra", institution: "Safra", value: 245_800, pctSub: 15.7, rate: "100.5% CDI", liquidity: "D+0" },
          { id: "a5", name: "CDB Liquidez Bradesco", institution: "Bradesco", value: 230_000, pctSub: 14.7, rate: "99% CDI", liquidity: "D+0" },
        ],
      },
      {
        id: "cdi-tit", name: "CDI - Títulos", pctPL: 8.5, status: "atencao", pctForaIdeal: 3.8,
        alocIdeal: 1_126_250, alocAtual: 1_168_950, sugestao: -42_700,
        byInstitution: { XP: 380_000, BTG: 270_000, "Itaú": 230_000, Safra: 178_950, Bradesco: 110_000 },
        assets: [
          { id: "a6", name: "CDB XP 2027", institution: "XP", value: 380_000, pctSub: 32.5, rate: "CDI+1.2%", maturity: "Mar/2027", liquidity: "Vencimento" },
          { id: "a7", name: "CDB BTG 2026", institution: "BTG", value: 270_000, pctSub: 23.1, rate: "CDI+0.8%", maturity: "Set/2026", liquidity: "Vencimento" },
          { id: "a8", name: "LCI Itaú 2026", institution: "Itaú", value: 230_000, pctSub: 19.7, rate: "94% CDI", maturity: "Jul/2026", liquidity: "Vencimento" },
          { id: "a9", name: "CDB Safra 2027", institution: "Safra", value: 178_950, pctSub: 15.3, rate: "CDI+1.5%", maturity: "Jan/2027", liquidity: "Vencimento" },
          { id: "a10", name: "LCA Bradesco 2026", institution: "Bradesco", value: 110_000, pctSub: 9.4, rate: "92% CDI", maturity: "Jun/2026", liquidity: "Vencimento" },
        ],
      },
      {
        id: "cdi-fund", name: "CDI - Fundos", pctPL: 6.5, status: "ok", pctForaIdeal: 0.1,
        alocIdeal: 861_250, alocAtual: 855_000, sugestao: 6_250,
        byInstitution: { XP: 280_000, BTG: 220_000, "Itaú": 165_000, Safra: 100_000, Bradesco: 90_000 },
        assets: [
          { id: "a11", name: "Trend DI FIC", institution: "XP", value: 280_000, pctSub: 32.7, rate: "CDI+0.05%", liquidity: "D+1" },
          { id: "a12", name: "BTG Digital Tesouro", institution: "BTG", value: 220_000, pctSub: 25.7, rate: "CDI+0.02%", liquidity: "D+1" },
          { id: "a13", name: "Itaú Privilège DI", institution: "Itaú", value: 165_000, pctSub: 19.3, rate: "99.8% CDI", liquidity: "D+1" },
          { id: "a14", name: "Safra Corporate DI", institution: "Safra", value: 100_000, pctSub: 11.7, rate: "100% CDI", liquidity: "D+1" },
          { id: "a15", name: "Bradesco FI Ref DI", institution: "Bradesco", value: 90_000, pctSub: 10.5, rate: "99% CDI", liquidity: "D+1" },
        ],
      },
      {
        id: "infl-tit", name: "Inflação - Títulos", pctPL: 10.0, status: "desbalanceado", pctForaIdeal: 8.2,
        alocIdeal: 1_325_000, alocAtual: 1_433_600, sugestao: -108_600,
        byInstitution: { XP: 450_000, BTG: 340_000, "Itaú": 280_000, Safra: 223_600, Bradesco: 140_000 },
        assets: [
          { id: "a16", name: "NTN-B 2030", institution: "XP", value: 250_000, pctSub: 17.4, rate: "IPCA+6.2%", maturity: "Ago/2030", liquidity: "D+1" },
          { id: "a17", name: "NTN-B 2028", institution: "XP", value: 200_000, pctSub: 14.0, rate: "IPCA+5.8%", maturity: "Mai/2028", liquidity: "D+1" },
          { id: "a18", name: "NTN-B 2029", institution: "BTG", value: 340_000, pctSub: 23.7, rate: "IPCA+6.0%", maturity: "Ago/2029", liquidity: "D+1" },
          { id: "a19", name: "Debênture IPCA Itaú", institution: "Itaú", value: 280_000, pctSub: 19.5, rate: "IPCA+7.2%", maturity: "Dez/2029", liquidity: "D+90" },
          { id: "a20", name: "CRI IPCA Safra", institution: "Safra", value: 223_600, pctSub: 15.6, rate: "IPCA+7.5%", maturity: "Mar/2031", liquidity: "D+180" },
          { id: "a21", name: "NTN-B 2032", institution: "Bradesco", value: 140_000, pctSub: 9.8, rate: "IPCA+6.5%", maturity: "Ago/2032", liquidity: "D+1" },
        ],
      },
      {
        id: "infl-fund", name: "Inflação - Fundos", pctPL: 6.0, status: "ok", pctForaIdeal: 0.4,
        alocIdeal: 795_000, alocAtual: 791_800, sugestao: 3_200,
        byInstitution: { XP: 250_000, BTG: 200_000, "Itaú": 160_000, Safra: 101_800, Bradesco: 80_000 },
        assets: [
          { id: "a22", name: "Kinea IPCA Dinâmico", institution: "XP", value: 250_000, pctSub: 31.6, rate: "IPCA+5.5%", liquidity: "D+30" },
          { id: "a23", name: "SPX Seahawk IPCA", institution: "BTG", value: 200_000, pctSub: 25.3, rate: "IPCA+6.1%", liquidity: "D+30" },
          { id: "a24", name: "Itaú Flexprev IMA-B", institution: "Itaú", value: 160_000, pctSub: 20.2, rate: "IMA-B", liquidity: "D+30" },
          { id: "a25", name: "Safra IMA-B 5", institution: "Safra", value: 101_800, pctSub: 12.9, rate: "IMA-B 5", liquidity: "D+30" },
          { id: "a26", name: "Bradesco Inflação FI", institution: "Bradesco", value: 80_000, pctSub: 10.1, rate: "IPCA+4.8%", liquidity: "D+30" },
        ],
      },
      {
        id: "pre", name: "Pré-Fixado", pctPL: 5.5, status: "atencao", pctForaIdeal: 4.6,
        alocIdeal: 728_750, alocAtual: 695_250, sugestao: 33_500,
        byInstitution: { XP: 230_000, BTG: 170_000, "Itaú": 140_000, Safra: 90_250, Bradesco: 65_000 },
        assets: [
          { id: "a27", name: "LTN 2027", institution: "XP", value: 230_000, pctSub: 33.1, rate: "12.8% a.a.", maturity: "Jan/2027", liquidity: "Vencimento" },
          { id: "a28", name: "CDB Pré BTG", institution: "BTG", value: 170_000, pctSub: 24.5, rate: "13.2% a.a.", maturity: "Jul/2027", liquidity: "Vencimento" },
          { id: "a29", name: "LTN 2026", institution: "Itaú", value: 140_000, pctSub: 20.1, rate: "11.5% a.a.", maturity: "Jul/2026", liquidity: "Vencimento" },
          { id: "a30", name: "CDB Pré Safra", institution: "Safra", value: 90_250, pctSub: 13.0, rate: "13.5% a.a.", maturity: "Dez/2027", liquidity: "Vencimento" },
          { id: "a31", name: "CDB Pré Bradesco", institution: "Bradesco", value: 65_000, pctSub: 9.3, rate: "12.0% a.a.", maturity: "Mar/2027", liquidity: "Vencimento" },
        ],
      },
      {
        id: "debent", name: "Debêntures", pctPL: 3.5, status: "ok", pctForaIdeal: 0.8,
        alocIdeal: 463_750, alocAtual: 460_100, sugestao: 3_650,
        byInstitution: { XP: 180_000, BTG: 130_000, "Itaú": 72_000, Safra: 53_100, Bradesco: 25_000 },
        assets: [
          { id: "a32", name: "Deb. Eletrobras", institution: "XP", value: 180_000, pctSub: 39.1, rate: "IPCA+7.8%", maturity: "Jun/2030", liquidity: "D+180" },
          { id: "a33", name: "Deb. Rumo", institution: "BTG", value: 130_000, pctSub: 28.3, rate: "CDI+2.1%", maturity: "Dez/2029", liquidity: "D+90" },
          { id: "a34", name: "Deb. Energisa", institution: "Itaú", value: 72_000, pctSub: 15.6, rate: "IPCA+6.5%", maturity: "Set/2031", liquidity: "D+180" },
          { id: "a35", name: "Deb. CCR", institution: "Safra", value: 53_100, pctSub: 11.5, rate: "CDI+1.8%", maturity: "Mar/2028", liquidity: "D+90" },
          { id: "a36", name: "Deb. Sabesp", institution: "Bradesco", value: 25_000, pctSub: 5.4, rate: "IPCA+6.0%", maturity: "Jul/2032", liquidity: "D+360" },
        ],
      },
      {
        id: "cri-cra", name: "CRI / CRA", pctPL: 2.5, status: "atencao", pctForaIdeal: 6.3,
        alocIdeal: 331_250, alocAtual: 352_000, sugestao: -20_750,
        byInstitution: { XP: 140_000, BTG: 100_000, "Itaú": 55_000, Safra: 37_000, Bradesco: 20_000 },
        assets: [
          { id: "a37", name: "CRI MRV", institution: "XP", value: 140_000, pctSub: 39.8, rate: "IPCA+8.5%", maturity: "Dez/2030", liquidity: "D+360" },
          { id: "a38", name: "CRA BRF", institution: "BTG", value: 100_000, pctSub: 28.4, rate: "CDI+2.5%", maturity: "Jun/2029", liquidity: "D+180" },
          { id: "a39", name: "CRI Cyrela", institution: "Itaú", value: 55_000, pctSub: 15.6, rate: "IPCA+7.8%", maturity: "Set/2031", liquidity: "D+360" },
          { id: "a40", name: "CRA JBS", institution: "Safra", value: 37_000, pctSub: 10.5, rate: "CDI+2.0%", maturity: "Mar/2028", liquidity: "D+180" },
          { id: "a41", name: "CRI Log CP", institution: "Bradesco", value: 20_000, pctSub: 5.7, rate: "IPCA+8.0%", maturity: "Dez/2029", liquidity: "D+360" },
        ],
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
        assets: [
          { id: "a42", name: "PETR4", institution: "XP", value: 180_000, pctSub: 18.3, liquidity: "D+2" },
          { id: "a43", name: "VALE3", institution: "XP", value: 120_000, pctSub: 12.2, liquidity: "D+2" },
          { id: "a44", name: "ITUB4", institution: "BTG", value: 150_000, pctSub: 15.2, liquidity: "D+2" },
          { id: "a45", name: "BBDC4", institution: "BTG", value: 130_000, pctSub: 13.2, liquidity: "D+2" },
          { id: "a46", name: "WEGE3", institution: "Itaú", value: 165_000, pctSub: 16.7, liquidity: "D+2" },
          { id: "a47", name: "RENT3", institution: "XP", value: 100_000, pctSub: 10.1, liquidity: "D+2" },
          { id: "a48", name: "B3SA3", institution: "Safra", value: 85_500, pctSub: 8.7, liquidity: "D+2" },
          { id: "a49", name: "SUZB3", institution: "Bradesco", value: 55_000, pctSub: 5.6, liquidity: "D+2" },
        ],
      },
      {
        id: "long-biased", name: "Long Biased", pctPL: 4.5, status: "ok", pctForaIdeal: 2.0,
        alocIdeal: 596_250, alocAtual: 608_150, sugestao: -11_900,
        byInstitution: { XP: 250_000, BTG: 175_000, "Itaú": 100_000, Safra: 53_150, Bradesco: 30_000 },
        assets: [
          { id: "a50", name: "SPX Nimitz Feeder", institution: "XP", value: 250_000, pctSub: 41.1, liquidity: "D+30" },
          { id: "a51", name: "Verde AM Long Bias", institution: "BTG", value: 175_000, pctSub: 28.8, liquidity: "D+30" },
          { id: "a52", name: "Dynamo Cougar", institution: "Itaú", value: 100_000, pctSub: 16.4, liquidity: "D+60" },
          { id: "a53", name: "Atmos Ações FIC", institution: "Safra", value: 53_150, pctSub: 8.7, liquidity: "D+30" },
          { id: "a54", name: "Bogari Value FIC", institution: "Bradesco", value: 30_000, pctSub: 4.9, liquidity: "D+30" },
        ],
      },
      {
        id: "private-br", name: "Private Brasil", pctPL: 4.0, status: "ok", pctForaIdeal: 1.0,
        alocIdeal: 530_000, alocAtual: 524_700, sugestao: 5_300,
        byInstitution: { XP: 210_000, BTG: 150_000, "Itaú": 80_000, Safra: 54_700, Bradesco: 30_000 },
        assets: [
          { id: "a55", name: "Vinci Partners Private", institution: "XP", value: 210_000, pctSub: 40.0, liquidity: "Ilíquido" },
          { id: "a56", name: "Pátria Infra BR IV", institution: "BTG", value: 150_000, pctSub: 28.6, liquidity: "Ilíquido" },
          { id: "a57", name: "Itaú Private Equity II", institution: "Itaú", value: 80_000, pctSub: 15.2, liquidity: "Ilíquido" },
          { id: "a58", name: "Spectra Private V", institution: "Safra", value: 54_700, pctSub: 10.4, liquidity: "Ilíquido" },
          { id: "a59", name: "Kinea Private Equity", institution: "Bradesco", value: 30_000, pctSub: 5.7, liquidity: "Ilíquido" },
        ],
      },
      {
        id: "small-caps", name: "Small Caps", pctPL: 2.5, status: "desbalanceado", pctForaIdeal: 18.0,
        alocIdeal: 331_250, alocAtual: 271_625, sugestao: 59_625,
        byInstitution: { XP: 110_000, BTG: 75_000, "Itaú": 45_000, Safra: 26_625, Bradesco: 15_000 },
        assets: [
          { id: "a60", name: "Trígono Flagship SC", institution: "XP", value: 110_000, pctSub: 40.5, liquidity: "D+30" },
          { id: "a61", name: "HIX Capital FIA", institution: "BTG", value: 75_000, pctSub: 27.6, liquidity: "D+30" },
          { id: "a62", name: "Brasil Capital SC", institution: "Itaú", value: 45_000, pctSub: 16.6, liquidity: "D+30" },
          { id: "a63", name: "Organon FIA", institution: "Safra", value: 26_625, pctSub: 9.8, liquidity: "D+30" },
          { id: "a64", name: "Constellation Compounders", institution: "Bradesco", value: 15_000, pctSub: 5.5, liquidity: "D+30" },
        ],
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
        assets: [
          { id: "a65", name: "iShares US Bond (AGG)", institution: "XP", value: 240_000, pctSub: 39.9, rate: "USD Bonds", liquidity: "D+3" },
          { id: "a66", name: "Pimco Income Fund", institution: "BTG", value: 170_000, pctSub: 28.3, rate: "USD Income", liquidity: "D+30" },
          { id: "a67", name: "Itaú RF Global FIC", institution: "Itaú", value: 90_000, pctSub: 15.0, rate: "USD + Hedge", liquidity: "D+30" },
          { id: "a68", name: "Safra Bond Global", institution: "Safra", value: 61_000, pctSub: 10.1, rate: "USD Bonds", liquidity: "D+30" },
          { id: "a69", name: "Bradesco Global Fixed", institution: "Bradesco", value: 40_000, pctSub: 6.7, rate: "USD + Hedge", liquidity: "D+30" },
        ],
      },
      {
        id: "ext-mm", name: "Multimercado Ext.", pctPL: 4.0, status: "atencao", pctForaIdeal: 5.2,
        alocIdeal: 530_000, alocAtual: 502_500, sugestao: 27_500,
        byInstitution: { XP: 200_000, BTG: 140_000, "Itaú": 80_000, Safra: 52_500, Bradesco: 30_000 },
        assets: [
          { id: "a70", name: "Bridgewater All Weather", institution: "XP", value: 200_000, pctSub: 39.8, liquidity: "D+90" },
          { id: "a71", name: "AQR Risk Parity", institution: "BTG", value: 140_000, pctSub: 27.9, liquidity: "D+90" },
          { id: "a72", name: "Itaú Global Macro", institution: "Itaú", value: 80_000, pctSub: 15.9, liquidity: "D+30" },
          { id: "a73", name: "Safra Multi Global", institution: "Safra", value: 52_500, pctSub: 10.4, liquidity: "D+30" },
          { id: "a74", name: "Bradesco Global Alloc.", institution: "Bradesco", value: 30_000, pctSub: 6.0, liquidity: "D+30" },
        ],
      },
      {
        id: "ext-acoes", name: "Ações Exterior", pctPL: 4.0, status: "desbalanceado", pctForaIdeal: 15.3,
        alocIdeal: 530_000, alocAtual: 449_000, sugestao: 81_000,
        byInstitution: { XP: 180_000, BTG: 120_000, "Itaú": 75_000, Safra: 44_000, Bradesco: 30_000 },
        assets: [
          { id: "a75", name: "iShares S&P 500 (IVV)", institution: "XP", value: 100_000, pctSub: 22.3, liquidity: "D+3" },
          { id: "a76", name: "Nasdaq 100 ETF (QQQ)", institution: "XP", value: 80_000, pctSub: 17.8, liquidity: "D+3" },
          { id: "a77", name: "Morgan Stanley Global", institution: "BTG", value: 120_000, pctSub: 26.7, liquidity: "D+30" },
          { id: "a78", name: "Itaú USA Equities", institution: "Itaú", value: 75_000, pctSub: 16.7, liquidity: "D+30" },
          { id: "a79", name: "Safra International Eq.", institution: "Safra", value: 44_000, pctSub: 9.8, liquidity: "D+30" },
          { id: "a80", name: "Bradesco Global Eq.", institution: "Bradesco", value: 30_000, pctSub: 6.7, liquidity: "D+30" },
        ],
      },
      {
        id: "ext-hedge", name: "Hedge Cambial", pctPL: 1.5, status: "ok", pctForaIdeal: 0.5,
        alocIdeal: 198_750, alocAtual: 199_750, sugestao: -1_000,
        byInstitution: { XP: 80_000, BTG: 55_000, "Itaú": 35_000, Safra: 19_750, Bradesco: 10_000 },
        assets: [
          { id: "a81", name: "Trend Dólar FIC", institution: "XP", value: 80_000, pctSub: 40.1, liquidity: "D+1" },
          { id: "a82", name: "BTG Cambial USD", institution: "BTG", value: 55_000, pctSub: 27.5, liquidity: "D+1" },
          { id: "a83", name: "Itaú Cambial FIC", institution: "Itaú", value: 35_000, pctSub: 17.5, liquidity: "D+1" },
          { id: "a84", name: "Safra Hedge FX", institution: "Safra", value: 19_750, pctSub: 9.9, liquidity: "D+1" },
          { id: "a85", name: "Bradesco Cambial", institution: "Bradesco", value: 10_000, pctSub: 5.0, liquidity: "D+1" },
        ],
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
        assets: [
          { id: "a86", name: "HGLG11 - CSHG Logística", institution: "XP", value: 130_000, pctSub: 21.5, liquidity: "D+2" },
          { id: "a87", name: "XPML11 - XP Malls", institution: "XP", value: 110_000, pctSub: 18.2, liquidity: "D+2" },
          { id: "a88", name: "BTLG11 - BTG Log.", institution: "BTG", value: 170_000, pctSub: 28.1, liquidity: "D+2" },
          { id: "a89", name: "IRDM11 - Iridium Receb.", institution: "Itaú", value: 95_000, pctSub: 15.7, liquidity: "D+2" },
          { id: "a90", name: "KNCR11 - Kinea Rend.", institution: "Safra", value: 60_300, pctSub: 10.0, liquidity: "D+2" },
          { id: "a91", name: "HGRE11 - CSHG Real Est.", institution: "Bradesco", value: 40_000, pctSub: 6.6, liquidity: "D+2" },
        ],
      },
      {
        id: "pe", name: "Private Equity", pctPL: 3.5, status: "ok", pctForaIdeal: 0.3,
        alocIdeal: 463_750, alocAtual: 465_150, sugestao: -1_400,
        byInstitution: { XP: 185_000, BTG: 130_000, "Itaú": 75_000, Safra: 45_150, Bradesco: 30_000 },
        assets: [
          { id: "a92", name: "Pátria Growth Fund V", institution: "XP", value: 185_000, pctSub: 39.8, liquidity: "Ilíquido" },
          { id: "a93", name: "Vinci Capital Partners IV", institution: "BTG", value: 130_000, pctSub: 27.9, liquidity: "Ilíquido" },
          { id: "a94", name: "Itaú PE Fund III", institution: "Itaú", value: 75_000, pctSub: 16.1, liquidity: "Ilíquido" },
          { id: "a95", name: "Spectra Ventures VII", institution: "Safra", value: 45_150, pctSub: 9.7, liquidity: "Ilíquido" },
          { id: "a96", name: "EB Capital FIP", institution: "Bradesco", value: 30_000, pctSub: 6.4, liquidity: "Ilíquido" },
        ],
      },
      {
        id: "infra", name: "Infraestrutura", pctPL: 2.5, status: "ok", pctForaIdeal: 2.1,
        alocIdeal: 331_250, alocAtual: 324_300, sugestao: 6_950,
        byInstitution: { XP: 130_000, BTG: 90_000, "Itaú": 55_000, Safra: 29_300, Bradesco: 20_000 },
        assets: [
          { id: "a97", name: "Pátria Infra Energy III", institution: "XP", value: 130_000, pctSub: 40.1, liquidity: "Ilíquido" },
          { id: "a98", name: "BTG Infra Core Fund", institution: "BTG", value: 90_000, pctSub: 27.7, liquidity: "Ilíquido" },
          { id: "a99", name: "Itaú Infra FIP-IE", institution: "Itaú", value: 55_000, pctSub: 17.0, liquidity: "Ilíquido" },
          { id: "a100", name: "Safra Infra Debentures", institution: "Safra", value: 29_300, pctSub: 9.0, liquidity: "D+360" },
          { id: "a101", name: "Bradesco FIP Infra", institution: "Bradesco", value: 20_000, pctSub: 6.2, liquidity: "Ilíquido" },
        ],
      },
      {
        id: "agro", name: "Agronegócio", pctPL: 1.5, status: "atencao", pctForaIdeal: 7.5,
        alocIdeal: 198_750, alocAtual: 183_825, sugestao: 14_925,
        byInstitution: { XP: 75_000, BTG: 50_000, "Itaú": 30_000, Safra: 18_825, Bradesco: 10_000 },
        assets: [
          { id: "a102", name: "Fiagro KNCA11", institution: "XP", value: 75_000, pctSub: 40.8, liquidity: "D+2" },
          { id: "a103", name: "BTG Agro Strategy", institution: "BTG", value: 50_000, pctSub: 27.2, liquidity: "D+90" },
          { id: "a104", name: "Itaú Fiagro Plus", institution: "Itaú", value: 30_000, pctSub: 16.3, liquidity: "D+30" },
          { id: "a105", name: "Safra Agribusiness", institution: "Safra", value: 18_825, pctSub: 10.2, liquidity: "D+90" },
          { id: "a106", name: "Bradesco Fiagro FIC", institution: "Bradesco", value: 10_000, pctSub: 5.4, liquidity: "D+30" },
        ],
      },
    ],
  },
];

const FGC_DATA: FGCInfo[] = [
  { institution: "XP", colorKey: "XP", covered: 145_000, limit: 250_000, status: "ok" },
  { institution: "BTG", colorKey: "BTG", covered: 210_000, limit: 250_000, status: "alerta" },
  { institution: "Itaú", colorKey: "Itaú", covered: 268_500, limit: 250_000, status: "critico" },
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

type StrategyType = "posFixado" | "inflacao" | "preFixado";

interface MaturityEntry {
  year: number;
  posFixado: number;
  inflacao: number;
  preFixado: number;
  avgRatePos: number;
  avgRateInfl: number;
  avgRatePre: number;
}

const MATURITY_DATA: MaturityEntry[] = [
  { year: 2026, posFixado: 50_000, inflacao: 0, preFixado: 140_000, avgRatePos: 100.5, avgRateInfl: 0, avgRatePre: 11.5 },
  { year: 2027, posFixado: 88_950, inflacao: 0, preFixado: 555_250, avgRatePos: 101.2, avgRateInfl: 0, avgRatePre: 12.9 },
  { year: 2028, posFixado: 53_100, inflacao: 200_000, preFixado: 0, avgRatePos: 101.8, avgRateInfl: 5.8, avgRatePre: 0 },
  { year: 2029, posFixado: 100_000, inflacao: 563_600, preFixado: 0, avgRatePos: 102.5, avgRateInfl: 6.1, avgRatePre: 0 },
  { year: 2030, posFixado: 0, inflacao: 390_000, preFixado: 0, avgRatePos: 0, avgRateInfl: 6.5, avgRatePre: 0 },
  { year: 2031, posFixado: 0, inflacao: 278_600, preFixado: 0, avgRatePos: 0, avgRateInfl: 7.1, avgRatePre: 0 },
  { year: 2032, posFixado: 0, inflacao: 165_000, preFixado: 0, avgRatePos: 0, avgRateInfl: 6.5, avgRatePre: 0 },
  { year: 2033, posFixado: 0, inflacao: 0, preFixado: 0, avgRatePos: 0, avgRateInfl: 0, avgRatePre: 0 },
  { year: 2034, posFixado: 0, inflacao: 120_000, preFixado: 0, avgRatePos: 0, avgRateInfl: 6.8, avgRatePre: 0 },
  { year: 2035, posFixado: 0, inflacao: 80_000, preFixado: 0, avgRatePos: 0, avgRateInfl: 7.0, avgRatePre: 0 },
  { year: 2036, posFixado: 0, inflacao: 0, preFixado: 0, avgRatePos: 0, avgRateInfl: 0, avgRatePre: 0 },
  { year: 2037, posFixado: 0, inflacao: 55_000, preFixado: 0, avgRatePos: 0, avgRateInfl: 7.2, avgRatePre: 0 },
  { year: 2038, posFixado: 0, inflacao: 0, preFixado: 0, avgRatePos: 0, avgRateInfl: 0, avgRatePre: 0 },
  { year: 2039, posFixado: 0, inflacao: 0, preFixado: 0, avgRatePos: 0, avgRateInfl: 0, avgRatePre: 0 },
  { year: 2040, posFixado: 0, inflacao: 35_000, preFixado: 0, avgRatePos: 0, avgRateInfl: 7.5, avgRatePre: 0 },
];

interface MacroClassPolicy {
  name: string;
  idealPct: number;
  actualPct: number;
  status: BalanceStatus;
  pctForaIdeal: number;
}

const MACRO_CLASS_POLICY: MacroClassPolicy[] = [
  { name: "Renda Fixa", idealPct: 54.5, actualPct: 54.5, status: "ok", pctForaIdeal: 0 },
  { name: "Multimercado", idealPct: 4.0, actualPct: 4.0, status: "ok", pctForaIdeal: 0 },
  { name: "Imobiliário", idealPct: 4.5, actualPct: 4.5, status: "ok", pctForaIdeal: 0 },
  { name: "Ações", idealPct: 19.5, actualPct: 27.0, status: "desbalanceado", pctForaIdeal: 38.5 },
  { name: "Exterior", idealPct: 14.0, actualPct: 10.0, status: "desbalanceado", pctForaIdeal: -28.6 },
];

interface SubClassRange {
  name: string;
  macroClass: string;
  idealPct: number;
  rangeMinus: number;
  rangePlus: number;
  minPct: number;
  maxPct: number;
  atualPct: number;
}

const SUB_CLASS_RANGES: SubClassRange[] = [
  { name: "CDI - Liquidez", macroClass: "Renda Fixa", idealPct: 12.0, rangeMinus: 2.0, rangePlus: 3.0, minPct: 10.0, maxPct: 15.0, atualPct: 11.9 },
  { name: "CDI - Títulos", macroClass: "Renda Fixa", idealPct: 8.5, rangeMinus: 1.5, rangePlus: 2.0, minPct: 7.0, maxPct: 10.5, atualPct: 8.8 },
  { name: "CDI - Fundos", macroClass: "Renda Fixa", idealPct: 6.5, rangeMinus: 1.0, rangePlus: 1.5, minPct: 5.5, maxPct: 8.0, atualPct: 6.5 },
  { name: "Inflação - Títulos", macroClass: "Renda Fixa", idealPct: 10.0, rangeMinus: 2.0, rangePlus: 2.0, minPct: 8.0, maxPct: 12.0, atualPct: 10.8 },
  { name: "Inflação - Fundos", macroClass: "Renda Fixa", idealPct: 6.0, rangeMinus: 1.0, rangePlus: 1.5, minPct: 5.0, maxPct: 7.5, atualPct: 6.0 },
  { name: "Pré-Fixado", macroClass: "Renda Fixa", idealPct: 5.5, rangeMinus: 1.5, rangePlus: 1.0, minPct: 4.0, maxPct: 6.5, atualPct: 5.2 },
  { name: "Debêntures", macroClass: "Renda Fixa", idealPct: 3.5, rangeMinus: 0.5, rangePlus: 1.0, minPct: 3.0, maxPct: 4.5, atualPct: 3.5 },
  { name: "CRI / CRA", macroClass: "Renda Fixa", idealPct: 2.5, rangeMinus: 0.5, rangePlus: 0.5, minPct: 2.0, maxPct: 3.0, atualPct: 2.7 },
  { name: "Ações", macroClass: "Ações", idealPct: 8.5, rangeMinus: 2.0, rangePlus: 2.0, minPct: 6.5, maxPct: 10.5, atualPct: 7.4 },
  { name: "Long Biased", macroClass: "Ações", idealPct: 4.5, rangeMinus: 1.0, rangePlus: 1.0, minPct: 3.5, maxPct: 5.5, atualPct: 4.6 },
  { name: "Private Brasil", macroClass: "Ações", idealPct: 4.0, rangeMinus: 1.0, rangePlus: 1.0, minPct: 3.0, maxPct: 5.0, atualPct: 4.0 },
  { name: "Small Caps", macroClass: "Ações", idealPct: 2.5, rangeMinus: 0.5, rangePlus: 0.5, minPct: 2.0, maxPct: 3.0, atualPct: 2.1 },
  { name: "RF Exterior", macroClass: "Exterior", idealPct: 4.5, rangeMinus: 1.0, rangePlus: 1.0, minPct: 3.5, maxPct: 5.5, atualPct: 4.5 },
  { name: "Multimercado Ext.", macroClass: "Exterior", idealPct: 4.0, rangeMinus: 1.0, rangePlus: 1.0, minPct: 3.0, maxPct: 5.0, atualPct: 3.8 },
  { name: "Ações Exterior", macroClass: "Exterior", idealPct: 4.0, rangeMinus: 1.0, rangePlus: 1.5, minPct: 3.0, maxPct: 5.5, atualPct: 3.4 },
  { name: "Hedge Cambial", macroClass: "Exterior", idealPct: 1.5, rangeMinus: 0.5, rangePlus: 0.5, minPct: 1.0, maxPct: 2.0, atualPct: 1.5 },
  { name: "Imobiliário", macroClass: "Alternativo", idealPct: 4.5, rangeMinus: 1.0, rangePlus: 1.0, minPct: 3.5, maxPct: 5.5, atualPct: 4.6 },
  { name: "Private Equity", macroClass: "Alternativo", idealPct: 3.5, rangeMinus: 0.5, rangePlus: 1.0, minPct: 3.0, maxPct: 4.5, atualPct: 3.5 },
  { name: "Infraestrutura", macroClass: "Alternativo", idealPct: 2.5, rangeMinus: 0.5, rangePlus: 0.5, minPct: 2.0, maxPct: 3.0, atualPct: 2.4 },
  { name: "Agronegócio", macroClass: "Alternativo", idealPct: 1.5, rangeMinus: 0.3, rangePlus: 0.5, minPct: 1.2, maxPct: 2.0, atualPct: 1.4 },
];

interface LiquidityBucket {
  label: string;
  pctPL: number;
  value: number;
}

const LIQUIDITY_DATA: LiquidityBucket[] = [
  { label: "D+0", pctPL: 18.5, value: 2_451_250 },
  { label: "D+1", pctPL: 14.2, value: 1_881_500 },
  { label: "D+30", pctPL: 12.8, value: 1_696_000 },
  { label: "D+90", pctPL: 15.5, value: 2_053_750 },
  { label: "D+180", pctPL: 10.3, value: 1_364_750 },
  { label: "D+360", pctPL: 8.7, value: 1_152_750 },
  { label: "Ilíquido", pctPL: 20.0, value: 2_650_000 },
];

const LIQUIDITY_POLICY_MIN = 30;

interface LiquidityByAssetType {
  type: string;
  d0: number;
  d1: number;
  d30: number;
  d90: number;
  d180: number;
  d360: number;
  iliquido: number;
}

const LIQUIDITY_BY_ASSET: LiquidityByAssetType[] = [
  { type: "CDI / Pós Fixado", d0: 1_570_800, d1: 855_000, d30: 0, d90: 0, d180: 0, d360: 0, iliquido: 0 },
  { type: "Inflação", d0: 0, d1: 791_800, d30: 0, d90: 433_600, d180: 500_000, d360: 500_000, iliquido: 0 },
  { type: "Pré Fixado", d0: 0, d1: 0, d30: 140_000, d90: 0, d180: 320_250, d360: 235_000, iliquido: 0 },
  { type: "Debêntures / CRI / CRA", d0: 0, d1: 0, d30: 0, d90: 180_100, d180: 232_000, d360: 200_000, iliquido: 200_000 },
  { type: "Ações / Fundos Eq.", d0: 880_450, d1: 234_700, d30: 608_150, d90: 271_625, d180: 0, d360: 0, iliquido: 0 },
  { type: "Exterior", d0: 0, d1: 0, d30: 601_000, d90: 502_500, d180: 312_750, d360: 0, iliquido: 0 },
  { type: "Alternativo / PE / Infra", d0: 0, d1: 0, d30: 346_850, d90: 666_025, d180: 0, d360: 217_750, iliquido: 2_450_000 },
];

const INST_HEX: Record<string, string> = {
  XP: "#a1a1aa",
  BTG: "#93c5fd",
  "Itaú": "#fdba74",
  Safra: "#a5b4fc",
  Bradesco: "#fda4af",
};

interface ComplianceCheck {
  label: string;
  status: "ok" | "atencao" | "violado";
  detail: string;
}

const COMPLIANCE_CHECKS: ComplianceCheck[] = [
  { label: "Suitability", status: "ok", detail: "Moderado — portfólio compatível" },
  { label: "Liquidez Mínima D+0/D+1", status: "ok", detail: `${(18.5 + 14.2).toFixed(1)}% > 30% mínimo` },
  { label: "Perda Máxima", status: "ok", detail: "VaR 95% = -8.2% < -12% limite" },
  { label: "Retorno Alvo", status: "atencao", detail: "IPCA+5.4% vs meta IPCA+6%" },
  { label: "FGC por Instituição", status: "violado", detail: "Itaú R$ 268.500 acima do limite R$ 250.000" },
  { label: "Prazo Máximo RF", status: "ok", detail: "NTN-B 2040 dentro do tolerado" },
  { label: "Restrições de Ativos", status: "ok", detail: "Sem Cripto, COE sem capital, derivativos alav." },
  { label: "Exposição Geográfica", status: "ok", detail: "Brasil 73%, EUA 12%, Europa 8%, Ásia 3%" },
  { label: "Concentração por Macro Classe", status: "violado", detail: "Ações 27.0% vs ideal 19.5% (+38.5%)" },
  { label: "Diversificação Plataformas", status: "ok", detail: "5 instituições ativas" },
];

function formatBRL(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(2).replace(".", ",")}M`;
  if (Math.abs(value) >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`;
  return `R$ ${value.toFixed(0)}`;
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


interface PendingChange {
  type: "resgate" | "adicao" | "remocao";
  assetId: string;
  assetName: string;
  subId: string;
  institution: string;
  value?: number;
  rate?: string;
  maturity?: string;
  liquidity?: string;
}

interface NewAssetDraft {
  name: string;
  rate: string;
  maturity: string;
  liquidity: string;
  institution: string;
  value: string;
}

const EMPTY_DRAFT: NewAssetDraft = { name: "", rate: "", maturity: "", liquidity: "", institution: "", value: "" };

function MatrixTable({
  allocatorValues,
  onAllocatorChange,
  visibleInstitutions,
  allInstitutions,
  onToggleInstitution,
  pendingChanges,
  onAddChange,
  onRemoveChange,
}: {
  allocatorValues: Record<string, Record<string, string>>;
  onAllocatorChange: (subId: string, inst: string, val: string) => void;
  visibleInstitutions: Institution[];
  allInstitutions: Institution[];
  onToggleInstitution: (name: string) => void;
  pendingChanges: PendingChange[];
  onAddChange: (change: PendingChange) => void;
  onRemoveChange: (assetId: string) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [expandedSubs, setExpandedSubs] = useState<Record<string, boolean>>({});
  const [addingToSub, setAddingToSub] = useState<string | null>(null);
  const [newAssetDraft, setNewAssetDraft] = useState<NewAssetDraft>(EMPTY_DRAFT);

  const pendingIds = useMemo(() => new Set(pendingChanges.map((c) => c.assetId)), [pendingChanges]);
  const pendingMap = useMemo(() => {
    const m: Record<string, PendingChange> = {};
    for (const c of pendingChanges) m[c.assetId] = c;
    return m;
  }, [pendingChanges]);

  const startAddingAsset = (subId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddingToSub(subId);
    setNewAssetDraft({ ...EMPTY_DRAFT, institution: visibleInstitutions[0]?.name || "" });
    if (!expandedSubs[subId]) {
      setExpandedSubs((prev) => ({ ...prev, [subId]: true }));
    }
  };

  const confirmNewAsset = (subId: string) => {
    if (!newAssetDraft.name.trim()) return;
    const id = `new-${subId}-${Date.now()}`;
    onAddChange({
      type: "adicao",
      assetId: id,
      assetName: newAssetDraft.name.trim(),
      subId,
      institution: newAssetDraft.institution || visibleInstitutions[0]?.name || "",
      value: parseFloat(newAssetDraft.value) || 0,
      rate: newAssetDraft.rate || undefined,
      maturity: newAssetDraft.maturity || undefined,
      liquidity: newAssetDraft.liquidity || undefined,
    });
    setAddingToSub(null);
    setNewAssetDraft(EMPTY_DRAFT);
  };

  const cancelNewAsset = () => {
    setAddingToSub(null);
    setNewAssetDraft(EMPTY_DRAFT);
  };

  const removeAsset = (asset: Asset, subId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddChange({ type: "remocao", assetId: asset.id, assetName: asset.name, subId, institution: asset.institution, value: asset.value });
  };

  const resgateAsset = (asset: Asset, subId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddChange({ type: "resgate", assetId: asset.id, assetName: asset.name, subId, institution: asset.institution, value: asset.value });
  };

  const addedAssetsForSub = (subId: string) => pendingChanges.filter((c) => c.type === "adicao" && c.subId === subId);

  const toggleCategory = (catId: string) => {
    setCollapsed((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const toggleSub = (subId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSubs((prev) => ({ ...prev, [subId]: !prev[subId] }));
  };

  const categoryTotals = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const total = cat.subs.reduce(
        (acc, sub) => ({
          alocIdeal: acc.alocIdeal + sub.alocIdeal,
          alocAtual: acc.alocAtual + sub.alocAtual,
          sugestao: acc.sugestao + sub.sugestao,
          pctPL: acc.pctPL + sub.pctPL,
          byInstitution: visibleInstitutions.reduce(
            (instAcc, inst) => ({ ...instAcc, [inst.name]: (instAcc[inst.name] || 0) + (sub.byInstitution[inst.name] || 0) }),
            acc.byInstitution
          ),
        }),
        { alocIdeal: 0, alocAtual: 0, sugestao: 0, pctPL: 0, byInstitution: {} as Record<string, number> }
      );
      return { catId: cat.id, ...total };
    });
  }, [visibleInstitutions]);

  const grandTotals = useMemo(() => {
    return categoryTotals.reduce(
      (acc, ct) => ({
        alocIdeal: acc.alocIdeal + ct.alocIdeal,
        alocAtual: acc.alocAtual + ct.alocAtual,
        sugestao: acc.sugestao + ct.sugestao,
        pctPL: acc.pctPL + ct.pctPL,
        byInstitution: visibleInstitutions.reduce(
          (instAcc, inst) => ({ ...instAcc, [inst.name]: (instAcc[inst.name] || 0) + (ct.byInstitution[inst.name] || 0) }),
          acc.byInstitution
        ),
      }),
      { alocIdeal: 0, alocAtual: 0, sugestao: 0, pctPL: 0, byInstitution: {} as Record<string, number> }
    );
  }, [categoryTotals, visibleInstitutions]);

  const instColCount = visibleInstitutions.length * 2;
  const hasHiddenInsts = allInstitutions.length > visibleInstitutions.length;

  return (
    <div className="overflow-x-auto rounded-md border border-[#2a2a2a]" data-testid="matrix-table-container">
      <table className="w-full border-collapse text-xs">
        <thead className="bg-[#1a1a1a]">
          <tr className="border-b border-[#2a2a2a]">
            <th rowSpan={2} className="min-w-[180px] px-4 py-2.5 text-left font-medium text-[#8c8c8c]">Classificação</th>
            <th rowSpan={2} className="w-14 px-2 py-2.5 text-right font-medium text-[#8c8c8c]">% P.L.</th>
            <th rowSpan={2} className="w-20 px-2 py-2.5 text-center font-medium text-[#8c8c8c]">Status</th>
            <th rowSpan={2} className="w-14 px-2 py-2.5 text-right font-medium text-[#8c8c8c]">% Fora</th>
            <th rowSpan={2} className="w-24 px-2 py-2.5 text-right font-medium text-[#8c8c8c]">Ideal</th>
            <th rowSpan={2} className="w-24 px-2 py-2.5 text-right font-medium text-[#8c8c8c]">Atual</th>
            <th rowSpan={2} className="w-24 px-2 py-2.5 text-right font-medium text-[#8c8c8c]">Sugestão</th>
            {visibleInstitutions.map((inst) => (
              <th key={inst.name} colSpan={2} className="border-l border-[#2a2a2a] px-1 py-2 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <InstitutionAvatar colorKey={inst.colorKey} initials={inst.initials} />
                  <span className="font-medium text-[#ededed]">{inst.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleInstitution(inst.name); }}
                    className="ml-0.5 rounded p-0.5 text-[#555] transition-colors hover:text-[#e05c5c]"
                    data-testid={`button-remove-inst-${inst.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </th>
            ))}
            {allInstitutions.filter((i) => !visibleInstitutions.some((v) => v.name === i.name)).length > 0 && (
              <th rowSpan={2} className="border-l border-[#2a2a2a] px-2 py-2 text-center align-middle">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-[#3a3a3a] text-[#555] transition-colors hover:border-[#6db1d4] hover:text-[#6db1d4]" data-testid="button-add-institution-header">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2" align="end">
                    <p className="mb-1.5 px-1 text-[10px] font-medium uppercase tracking-wider text-[#8c8c8c]">Adicionar instituição</p>
                    {allInstitutions.filter((i) => !visibleInstitutions.some((v) => v.name === i.name)).map((inst) => {
                      const c = getInstitutionColor(inst.colorKey);
                      return (
                        <button
                          key={inst.name}
                          onClick={() => onToggleInstitution(inst.name)}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[#ccc] hover-elevate"
                          data-testid={`add-institution-${inst.name}`}
                        >
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className={`text-[9px] font-bold ${c.bg} ${c.text}`}>{inst.initials}</AvatarFallback>
                          </Avatar>
                          {inst.name}
                        </button>
                      );
                    })}
                  </PopoverContent>
                </Popover>
              </th>
            )}
          </tr>
          <tr className="border-b border-[#2a2a2a]">
            {visibleInstitutions.map((inst) => (
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
                  {visibleInstitutions.map((inst) => (
                    <Fragment key={`${cat.id}-${inst.name}`}>
                      <td className="border-l border-[#2a2a2a] px-2 py-2 text-right font-medium text-[#bbb]">{formatBRL(ct.byInstitution[inst.name] || 0)}</td>
                      <td className="px-2 py-2 text-center text-[#444]">—</td>
                    </Fragment>
                  ))}
                  {hasHiddenInsts && <td />}
                </tr>

                {!isCollapsed && cat.subs.map((sub) => {
                  const isSubExpanded = expandedSubs[sub.id] ?? false;
                  const filteredAssets = sub.assets.filter((a) => visibleInstitutions.some((vi) => vi.name === a.institution));
                  return (
                    <Fragment key={sub.id}>
                      <tr
                        className="cursor-pointer border-b border-[#1e1e1e] transition-colors hover:bg-[#161616]/50"
                        onClick={(e) => toggleSub(sub.id, e)}
                        data-testid={`sub-row-${sub.id}`}
                      >
                        <td className="px-4 py-2 pl-10">
                          <div className="flex items-center gap-1.5">
                            {isSubExpanded
                              ? <ChevronDown className="h-3 w-3 text-[#555]" />
                              : <ChevronRight className="h-3 w-3 text-[#555]" />}
                            <span className="text-[#bbb]">{sub.name}</span>
                            <span className="text-[10px] text-[#444]">({filteredAssets.length})</span>
                            <button
                              onClick={(e) => startAddingAsset(sub.id, e)}
                              className="ml-1 rounded p-0.5 text-[#444] transition-colors hover:text-[#6ecf8e]"
                              title="Adicionar ativo"
                              data-testid={`button-add-asset-${sub.id}`}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
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
                        {visibleInstitutions.map((inst) => (
                          <Fragment key={`${sub.id}-${inst.name}`}>
                            <td className="border-l border-[#2a2a2a] px-2 py-2 text-right text-[#888]">{formatBRL(sub.byInstitution[inst.name] || 0)}</td>
                            <td className="px-1 py-1.5">
                              <input
                                type="text"
                                placeholder="—"
                                value={allocatorValues[sub.id]?.[inst.name] ?? ""}
                                onChange={(e) => { e.stopPropagation(); onAllocatorChange(sub.id, inst.name, e.target.value); }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full rounded border border-[#2a2a2a] bg-[#161616] px-2 py-1 text-center text-xs text-[#ededed] outline-none placeholder:text-[#333] focus:border-[#6db1d4]"
                                data-testid={`input-allocator-${sub.id}-${inst.name}`}
                              />
                            </td>
                          </Fragment>
                        ))}
                        {hasHiddenInsts && <td />}
                      </tr>

                      {isSubExpanded && (
                        <>
                          <tr className="border-b border-[#1e1e1e] bg-[#111]">
                            <td className="py-1 pl-14 pr-4 text-[10px] font-medium text-[#555]">Ativo</td>
                            <td className="px-2 py-1 text-right text-[10px] font-medium text-[#555]">% Sub</td>
                            <td className="px-2 py-1 text-center text-[10px] font-medium text-[#555]">Taxa</td>
                            <td className="px-2 py-1 text-center text-[10px] font-medium text-[#555]">Venc.</td>
                            <td className="px-2 py-1 text-center text-[10px] font-medium text-[#555]">Liquidez</td>
                            <td className="px-2 py-1 text-right text-[10px] font-medium text-[#555]">Valor</td>
                            <td className="px-2 py-1 text-center text-[10px] font-medium text-[#555]">Inst.</td>
                            {visibleInstitutions.map((inst) => (
                              <Fragment key={`hdr-asset-${inst.name}`}>
                                <td className="border-l border-[#1a1a1a]" />
                                <td />
                              </Fragment>
                            ))}
                            {hasHiddenInsts && <td />}
                          </tr>
                          {filteredAssets.map((asset) => {
                            const instObj = visibleInstitutions.find((vi) => vi.name === asset.institution);
                            const instColor = instObj ? getInstitutionColor(instObj.colorKey) : null;
                            const instIndex = instObj ? visibleInstitutions.indexOf(instObj) : -1;
                            const pending = pendingMap[asset.id];
                            return (
                              <tr key={asset.id} className={`group border-b border-[#1a1a1a] ${pending ? "bg-[#151515]" : "bg-[#131313]"}`} data-testid={`asset-row-${asset.id}`}>
                                <td className="py-1.5 pl-14 pr-4">
                                  <div className="flex items-center gap-2">
                                    <div className="relative flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center">
                                      {pending ? (
                                        <Clock className="h-3.5 w-3.5 text-[#dcb092]" />
                                      ) : (
                                        <>
                                          <div className="h-1.5 w-1.5 rounded-full bg-[#333] group-hover:invisible" />
                                          <div className="invisible absolute inset-0 flex items-center justify-center gap-0.5 group-hover:visible">
                                            <button
                                              onClick={(e) => removeAsset(asset, sub.id, e)}
                                              className="text-[#555] transition-colors hover:text-[#e05c5c]"
                                              title="Remover ativo"
                                              data-testid={`button-remove-asset-${asset.id}`}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                    <span className={`text-[11px] ${pending ? "text-[#666] line-through" : "text-[#999]"}`}>{asset.name}</span>
                                    {!pending && (
                                      <button
                                        onClick={(e) => resgateAsset(asset, sub.id, e)}
                                        className="invisible rounded bg-[rgba(224,92,92,0.08)] px-1.5 py-0.5 text-[9px] font-medium text-[#e05c5c] transition-colors hover:bg-[rgba(224,92,92,0.15)] group-hover:visible"
                                        title="Marcar resgate total"
                                        data-testid={`button-resgate-${asset.id}`}
                                      >
                                        Resgate
                                      </button>
                                    )}
                                    {pending && (
                                      <div className="flex items-center gap-1.5">
                                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${pending.type === "resgate" ? "bg-[rgba(220,176,146,0.12)] text-[#dcb092]" : "bg-[rgba(224,92,92,0.12)] text-[#e05c5c]"}`}>
                                          {pending.type === "resgate" ? "Resgate" : "Remoção"}
                                        </span>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); onRemoveChange(asset.id); }}
                                          className="rounded p-0.5 text-[#555] transition-colors hover:text-[#999]"
                                          title="Desfazer"
                                          data-testid={`button-undo-${asset.id}`}
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-2 py-1.5 text-right text-[10px] text-[#666]">{asset.pctSub.toFixed(1)}%</td>
                                <td className="px-2 py-1.5 text-center text-[10px] text-[#888]">{asset.rate || "—"}</td>
                                <td className="px-2 py-1.5 text-center text-[10px] text-[#888]">{asset.maturity || "—"}</td>
                                <td className="px-2 py-1.5 text-center">
                                  <span className={`text-[10px] ${asset.liquidity === "Ilíquido" ? "text-[#e05c5c]" : asset.liquidity === "D+0" || asset.liquidity === "D+1" ? "text-[#6db1d4]" : "text-[#888]"}`}>
                                    {asset.liquidity || "—"}
                                  </span>
                                </td>
                                <td className="px-2 py-1.5 text-right text-[10px] text-[#888]">{formatBRL(asset.value)}</td>
                                <td className="px-2 py-1.5 text-center">
                                  {instColor && (
                                    <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-medium ${instColor.bg} ${instColor.text}`}>
                                      {asset.institution}
                                    </span>
                                  )}
                                </td>
                                {visibleInstitutions.map((inst, idx) => (
                                  <Fragment key={`${asset.id}-${inst.name}`}>
                                    <td className={`border-l border-[#1a1a1a] px-2 py-1.5 text-right text-[10px] ${idx === instIndex ? "text-[#999]" : "text-transparent"}`}>
                                      {idx === instIndex ? formatBRL(asset.value) : ""}
                                    </td>
                                    <td />
                                  </Fragment>
                                ))}
                                {hasHiddenInsts && <td />}
                              </tr>
                            );
                          })}

                          {addedAssetsForSub(sub.id).map((added) => {
                            const addedInstObj = visibleInstitutions.find((vi) => vi.name === added.institution);
                            const addedInstColor = addedInstObj ? getInstitutionColor(addedInstObj.colorKey) : null;
                            const addedInstIndex = addedInstObj ? visibleInstitutions.indexOf(addedInstObj) : -1;
                            return (
                              <tr key={added.assetId} className="border-b border-[#1a1a1a] bg-[#0e1210]" data-testid={`added-asset-row-${added.assetId}`}>
                                <td className="py-1.5 pl-14 pr-4">
                                  <div className="flex items-center gap-2">
                                    <Plus className="h-3 w-3 flex-shrink-0 text-[#6ecf8e]" />
                                    <span className="text-[11px] text-[#6ecf8e]">{added.assetName}</span>
                                    <span className="rounded bg-[rgba(110,207,142,0.12)] px-1.5 py-0.5 text-[9px] font-medium text-[#6ecf8e]">Adição</span>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); onRemoveChange(added.assetId); }}
                                      className="rounded p-0.5 text-[#555] transition-colors hover:text-[#999]"
                                      title="Desfazer"
                                      data-testid={`button-undo-${added.assetId}`}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                </td>
                                <td className="px-2 py-1.5 text-center text-[10px] text-[#555]">—</td>
                                <td className="px-2 py-1.5 text-center text-[10px] text-[#6ecf8e]/60">{added.rate || "—"}</td>
                                <td className="px-2 py-1.5 text-center text-[10px] text-[#6ecf8e]/60">{added.maturity || "—"}</td>
                                <td className="px-2 py-1.5 text-center text-[10px] text-[#6ecf8e]/60">{added.liquidity || "—"}</td>
                                <td className="px-2 py-1.5 text-right text-[10px] text-[#6ecf8e]/60">{added.value ? formatBRL(added.value) : "—"}</td>
                                <td className="px-2 py-1.5 text-center">
                                  {addedInstColor && (
                                    <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-medium ${addedInstColor.bg} ${addedInstColor.text}`}>
                                      {added.institution}
                                    </span>
                                  )}
                                </td>
                                {visibleInstitutions.map((inst, idx) => (
                                  <Fragment key={`${added.assetId}-${inst.name}`}>
                                    <td className={`border-l border-[#1a1a1a] px-2 py-1.5 text-right text-[10px] ${idx === addedInstIndex ? "text-[#6ecf8e]/60" : "text-transparent"}`}>
                                      {idx === addedInstIndex && added.value ? formatBRL(added.value) : ""}
                                    </td>
                                    <td />
                                  </Fragment>
                                ))}
                                {hasHiddenInsts && <td />}
                              </tr>
                            );
                          })}

                          {addingToSub === sub.id && (
                            <tr className="border-b border-[#1a1a1a] bg-[#0e1210]" data-testid={`new-asset-row-${sub.id}`}>
                              <td className="py-1.5 pl-14 pr-4">
                                <div className="flex items-center gap-2">
                                  <Plus className="h-3 w-3 flex-shrink-0 text-[#6ecf8e]" />
                                  <input
                                    type="text"
                                    placeholder="Nome do ativo"
                                    value={newAssetDraft.name}
                                    onChange={(e) => setNewAssetDraft((d) => ({ ...d, name: e.target.value }))}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                    className="w-full rounded border border-[#2a2a2a] bg-[#161616] px-2 py-1 text-[11px] text-[#ededed] outline-none placeholder:text-[#444] focus:border-[#6ecf8e]/50"
                                    data-testid={`input-new-asset-name-${sub.id}`}
                                  />
                                </div>
                              </td>
                              <td className="px-2 py-1.5 text-center text-[10px] text-[#555]">—</td>
                              <td className="px-1 py-1.5">
                                <input
                                  type="text"
                                  placeholder="Taxa"
                                  value={newAssetDraft.rate}
                                  onChange={(e) => setNewAssetDraft((d) => ({ ...d, rate: e.target.value }))}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full rounded border border-[#2a2a2a] bg-[#161616] px-2 py-1 text-center text-[10px] text-[#ededed] outline-none placeholder:text-[#444] focus:border-[#6ecf8e]/50"
                                  data-testid={`input-new-asset-rate-${sub.id}`}
                                />
                              </td>
                              <td className="px-1 py-1.5">
                                <input
                                  type="text"
                                  placeholder="Venc."
                                  value={newAssetDraft.maturity}
                                  onChange={(e) => setNewAssetDraft((d) => ({ ...d, maturity: e.target.value }))}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full rounded border border-[#2a2a2a] bg-[#161616] px-2 py-1 text-center text-[10px] text-[#ededed] outline-none placeholder:text-[#444] focus:border-[#6ecf8e]/50"
                                  data-testid={`input-new-asset-maturity-${sub.id}`}
                                />
                              </td>
                              <td className="px-1 py-1.5">
                                <input
                                  type="text"
                                  placeholder="Liquidez"
                                  value={newAssetDraft.liquidity}
                                  onChange={(e) => setNewAssetDraft((d) => ({ ...d, liquidity: e.target.value }))}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full rounded border border-[#2a2a2a] bg-[#161616] px-2 py-1 text-center text-[10px] text-[#ededed] outline-none placeholder:text-[#444] focus:border-[#6ecf8e]/50"
                                  data-testid={`input-new-asset-liquidity-${sub.id}`}
                                />
                              </td>
                              <td className="px-1 py-1.5">
                                <input
                                  type="text"
                                  placeholder="R$ 0"
                                  value={newAssetDraft.value}
                                  onChange={(e) => setNewAssetDraft((d) => ({ ...d, value: e.target.value }))}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full rounded border border-[#2a2a2a] bg-[#161616] px-2 py-1 text-right text-[10px] text-[#ededed] outline-none placeholder:text-[#444] focus:border-[#6ecf8e]/50"
                                  data-testid={`input-new-asset-value-${sub.id}`}
                                />
                              </td>
                              <td className="px-1 py-1.5">
                                <select
                                  value={newAssetDraft.institution}
                                  onChange={(e) => { e.stopPropagation(); setNewAssetDraft((d) => ({ ...d, institution: e.target.value })); }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full rounded border border-[#2a2a2a] bg-[#161616] px-1 py-1 text-[10px] text-[#ededed] outline-none focus:border-[#6ecf8e]/50"
                                  data-testid={`select-new-asset-inst-${sub.id}`}
                                >
                                  {visibleInstitutions.map((inst) => (
                                    <option key={inst.name} value={inst.name}>{inst.name}</option>
                                  ))}
                                </select>
                              </td>
                              {visibleInstitutions.map((inst) => (
                                <Fragment key={`new-${inst.name}`}>
                                  <td className="border-l border-[#1a1a1a] px-2 py-1.5 text-center">
                                    {inst.name === (newAssetDraft.institution || visibleInstitutions[0]?.name) && (
                                      <div className="flex items-center justify-center gap-1">
                                        <button
                                          onClick={(e) => { e.stopPropagation(); confirmNewAsset(sub.id); }}
                                          className="rounded p-0.5 text-[#6ecf8e] transition-colors hover:text-[#8fffaa]"
                                          title="Confirmar"
                                          data-testid={`button-confirm-new-${sub.id}`}
                                        >
                                          <Check className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); cancelNewAsset(); }}
                                          className="rounded p-0.5 text-[#555] transition-colors hover:text-[#e05c5c]"
                                          title="Cancelar"
                                          data-testid={`button-cancel-new-${sub.id}`}
                                        >
                                          <X className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                  <td />
                                </Fragment>
                              ))}
                              {hasHiddenInsts && <td />}
                            </tr>
                          )}
                        </>
                      )}
                    </Fragment>
                  );
                })}
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
            {visibleInstitutions.map((inst) => (
              <Fragment key={`total-${inst.name}`}>
                <td className="border-l border-[#2a2a2a] px-2 py-2.5 text-right font-semibold text-[#ededed]">{formatBRL(grandTotals.byInstitution[inst.name] || 0)}</td>
                <td className="px-2 py-2.5 text-center text-[#444]">—</td>
              </Fragment>
            ))}
            {hasHiddenInsts && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function FGCBarChart() {
  const maxVal = 300_000;
  const limitVal = 250_000;
  const limitPct = (limitVal / maxVal) * 100;

  return (
    <section data-testid="fgc-section">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#ededed]">
        <Shield className="h-4 w-4 text-[#6db1d4]" />
        FGC — Fundo Garantidor de Créditos
      </h2>
      <div className="rounded-md border border-[#2a2a2a] bg-[#161616] p-5">
        <div className="mb-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-[#6ecf8e]" />
            <span className="text-[11px] text-[#8c8c8c]">Dentro do limite</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-[#e05c5c]" />
            <span className="text-[11px] text-[#8c8c8c]">Acima do limite</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-px w-4 border-t-2 border-dashed border-[#e05c5c]" />
            <span className="text-[11px] text-[#8c8c8c]">Limite FGC R$ 250k</span>
          </div>
        </div>

        <div className="relative" style={{ height: "220px" }}>
          <div className="absolute left-0 top-0 flex h-full w-12 flex-col justify-between pb-6 text-right">
            <span className="text-[10px] text-[#555]">R$ 300k</span>
            <span className="text-[10px] text-[#555]">R$ 200k</span>
            <span className="text-[10px] text-[#555]">R$ 100k</span>
            <span className="text-[10px] text-[#555]">R$ 0</span>
          </div>

          <div className="absolute bottom-6 left-14 right-0 top-0">
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-[#e05c5c]/60"
              style={{ top: `${100 - limitPct}%` }}
            >
              <span className="absolute -top-4 right-0 text-[10px] font-medium text-[#e05c5c]">R$ 250k</span>
            </div>

            <div className="flex h-full items-end justify-around gap-3 px-2">
              {FGC_DATA.map((fgc) => {
                const barPct = (fgc.covered / maxVal) * 100;
                const overLimit = fgc.covered > limitVal;
                const overPct = overLimit ? ((fgc.covered - limitVal) / maxVal) * 100 : 0;

                return (
                  <div key={fgc.institution} className="flex flex-1 flex-col items-center gap-1" data-testid={`fgc-bar-${fgc.institution}`}>
                    <span className="text-[10px] font-medium text-[#ccc]">{formatBRLFull(fgc.covered)}</span>
                    <div className="relative flex w-full max-w-[52px] flex-col items-stretch" style={{ height: `${barPct}%`, minHeight: "8px" }}>
                      {overLimit && (
                        <div
                          className="w-full rounded-t-sm bg-[#e05c5c]"
                          style={{ height: `${(overPct / barPct) * 100}%` }}
                        />
                      )}
                      <div
                        className="w-full flex-1"
                        style={{
                          backgroundColor: INST_HEX[fgc.colorKey] || "#6db1d4",
                          borderRadius: overLimit ? "0 0 2px 2px" : "2px 2px 2px 2px",
                          opacity: 0.85,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute bottom-0 left-14 right-0 flex justify-around gap-3 px-2">
            {FGC_DATA.map((fgc) => (
              <div key={fgc.institution} className="flex flex-1 flex-col items-center">
                <span className="text-[11px] font-medium text-[#bbb]">{fgc.institution}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MaturityChart() {
  const [activeStrategies, setActiveStrategies] = useState<Set<StrategyType>>(
    () => new Set<StrategyType>(["posFixado", "inflacao", "preFixado"])
  );
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const toggleStrategy = (s: StrategyType) => {
    setActiveStrategies((prev) => {
      const next = new Set(prev);
      if (next.has(s)) {
        if (next.size <= 1) return prev;
        next.delete(s);
      } else {
        next.add(s);
      }
      return next;
    });
  };

  const strategyLabels: Record<StrategyType, { label: string; color: string }> = {
    posFixado: { label: "Pós Fixado", color: "#6db1d4" },
    inflacao: { label: "Inflação", color: "#dcb092" },
    preFixado: { label: "Pré Fixado", color: "#a5b4fc" },
  };

  const maxBarVal = useMemo(() => {
    let max = 0;
    MATURITY_DATA.forEach((d) => {
      let total = 0;
      if (activeStrategies.has("posFixado")) total += d.posFixado;
      if (activeStrategies.has("inflacao")) total += d.inflacao;
      if (activeStrategies.has("preFixado")) total += d.preFixado;
      if (total > max) max = total;
    });
    return max || 1;
  }, [activeStrategies]);

  return (
    <section data-testid="maturity-chart">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#ededed]">
        <TrendingUp className="h-4 w-4 text-[#dcb092]" />
        Vencimentos por Estratégia
      </h2>
      <div className="rounded-md border border-[#2a2a2a] bg-[#161616] p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {(Object.entries(strategyLabels) as [StrategyType, { label: string; color: string }][]).map(([key, { label, color }]) => (
            <button
              key={key}
              onClick={() => toggleStrategy(key)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-opacity ${activeStrategies.has(key) ? "opacity-100" : "opacity-30"}`}
              style={{
                borderColor: `${color}40`,
                backgroundColor: `${color}15`,
                color: color,
              }}
              data-testid={`maturity-toggle-${key}`}
            >
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </button>
          ))}
        </div>

        <div className="relative" style={{ height: "200px" }}>
          <div className="absolute left-0 top-0 flex h-full w-14 flex-col justify-between pb-6 text-right">
            <span className="text-[10px] text-[#555]">{formatBRL(maxBarVal)}</span>
            <span className="text-[10px] text-[#555]">{formatBRL(maxBarVal / 2)}</span>
            <span className="text-[10px] text-[#555]">R$ 0</span>
          </div>

          <div className="absolute bottom-6 left-16 right-0 top-0 flex items-end gap-1">
            {MATURITY_DATA.map((d) => {
              const segments: { key: StrategyType; val: number; color: string }[] = [];
              if (activeStrategies.has("posFixado") && d.posFixado > 0) segments.push({ key: "posFixado", val: d.posFixado, color: "#6db1d4" });
              if (activeStrategies.has("inflacao") && d.inflacao > 0) segments.push({ key: "inflacao", val: d.inflacao, color: "#dcb092" });
              if (activeStrategies.has("preFixado") && d.preFixado > 0) segments.push({ key: "preFixado", val: d.preFixado, color: "#a5b4fc" });
              const total = segments.reduce((sum, s) => sum + s.val, 0);
              const barPct = (total / maxBarVal) * 100;

              const avgRate = segments.length > 0
                ? segments.reduce((sum, s) => {
                    const rate = s.key === "posFixado" ? d.avgRatePos : s.key === "inflacao" ? d.avgRateInfl : d.avgRatePre;
                    return sum + rate * s.val;
                  }, 0) / total
                : 0;

              return (
                <div
                  key={d.year}
                  className="relative flex flex-1 flex-col items-center gap-0.5"
                  data-testid={`maturity-bar-${d.year}`}
                  onMouseEnter={() => total > 0 && setHoveredYear(d.year)}
                  onMouseLeave={() => setHoveredYear(null)}
                >
                  {total > 0 && (
                    <span className="text-[9px] text-[#8c8c8c]">
                      {avgRate > 0 ? `${avgRate.toFixed(1)}%` : ""}
                    </span>
                  )}
                  <div className="flex w-full max-w-[40px] flex-col items-stretch" style={{ height: `${barPct}%`, minHeight: total > 0 ? "4px" : "0" }}>
                    {segments.map((seg, i) => (
                      <div
                        key={seg.key}
                        className="w-full"
                        style={{
                          height: `${(seg.val / total) * 100}%`,
                          backgroundColor: seg.color,
                          opacity: 0.8,
                          borderRadius: i === 0 && segments.length === 1 ? "2px" : i === 0 ? "2px 2px 0 0" : i === segments.length - 1 ? "0 0 2px 2px" : "0",
                        }}
                      />
                    ))}
                  </div>
                  {hoveredYear === d.year && total > 0 && (
                    <div className="absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-[#3a3a3a] bg-[#1a1a1a] px-3 py-2 shadow-lg">
                      <p className="mb-1 text-[10px] font-semibold text-[#ededed]">{d.year}</p>
                      {segments.map((seg) => {
                        const rate = seg.key === "posFixado" ? d.avgRatePos : seg.key === "inflacao" ? d.avgRateInfl : d.avgRatePre;
                        return (
                          <div key={seg.key} className="flex items-center gap-2 text-[10px]">
                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
                            <span className="text-[#8c8c8c]">{strategyLabels[seg.key].label}:</span>
                            <span className="text-[#ededed]">{formatBRL(seg.val)}</span>
                            {rate > 0 && <span className="text-[#666]">({rate.toFixed(1)}%)</span>}
                          </div>
                        );
                      })}
                      <div className="mt-1 border-t border-[#2a2a2a] pt-1 text-[10px]">
                        <span className="text-[#8c8c8c]">Taxa Média: </span>
                        <span className="font-medium text-[#ededed]">{avgRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-0 left-16 right-0 flex gap-1">
            {MATURITY_DATA.map((d) => (
              <div key={d.year} className="flex flex-1 justify-center">
                <span className="text-[10px] text-[#666]">{d.year}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MacroClassAnalysis() {
  const macroData = useMemo(() => {
    const getSubs = (catId: string) => CATEGORIES.find((c) => c.id === catId)?.subs ?? [];
    const sumPctPL = (subs: { pctPL: number }[]) => subs.reduce((s, sub) => s + sub.pctPL, 0);

    const altSubs = getSubs("alt");
    const altRemainder = altSubs.filter((s) => s.id !== "imob");

    const macroMap: { name: string; idealPct: number; actualPct: number }[] = [
      { name: "Renda Fixa", idealPct: 54.5, actualPct: sumPctPL(getSubs("rf")) },
      { name: "Multimercado", idealPct: 4.0, actualPct: sumPctPL(getSubs("ext").filter((s) => s.id === "ext-mm")) },
      { name: "Imobiliário", idealPct: 4.5, actualPct: sumPctPL(altSubs.filter((s) => s.id === "imob")) },
      { name: "Ações", idealPct: 19.5, actualPct: sumPctPL([...getSubs("eq-br"), ...altRemainder]) },
      { name: "Exterior", idealPct: 14.0, actualPct: sumPctPL(getSubs("ext").filter((s) => s.id !== "ext-mm")) },
    ];

    return macroMap.map(({ name, idealPct, actualPct }) => {
      const diff = actualPct - idealPct;
      const pctFora = idealPct > 0 ? (diff / idealPct) * 100 : 0;
      const status: BalanceStatus = Math.abs(pctFora) <= 3 ? "ok" : Math.abs(pctFora) <= 8 ? "atencao" : "desbalanceado";
      return { name, idealPct, actualPct, status, pctForaIdeal: pctFora };
    });
  }, []);

  return (
    <section data-testid="macro-class-analysis">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#ededed]">
        <Layers className="h-4 w-4 text-[#6db1d4]" />
        Análise por Política — Macro Classes
      </h2>
      <div className="overflow-x-auto rounded-md border border-[#2a2a2a]">
        <table className="w-full border-collapse text-xs">
          <thead className="bg-[#1a1a1a]">
            <tr className="border-b border-[#2a2a2a]">
              <th className="min-w-[160px] px-4 py-2.5 text-left font-medium text-[#8c8c8c]">Classificação</th>
              <th className="w-20 px-3 py-2.5 text-right font-medium text-[#8c8c8c]">Ideal %</th>
              <th className="w-20 px-3 py-2.5 text-right font-medium text-[#8c8c8c]">Atual %</th>
              <th className="w-24 px-3 py-2.5 text-center font-medium text-[#8c8c8c]">Status</th>
              <th className="w-20 px-3 py-2.5 text-right font-medium text-[#8c8c8c]">% Fora</th>
              <th className="min-w-[180px] px-3 py-2.5 text-left font-medium text-[#8c8c8c]">Distribuição</th>
            </tr>
          </thead>
          <tbody>
            {macroData.map((mc) => {
              const barWidth = Math.min((mc.actualPct / 60) * 100, 100);
              const idealWidth = Math.min((mc.idealPct / 60) * 100, 100);
              return (
                <tr key={mc.name} className="border-b border-[#1e1e1e]" data-testid={`macro-row-${mc.name}`}>
                  <td className="px-4 py-2.5 font-medium text-[#ededed]">{mc.name}</td>
                  <td className="px-3 py-2.5 text-right text-[#8c8c8c]">{mc.idealPct.toFixed(1)}%</td>
                  <td className="px-3 py-2.5 text-right font-medium text-[#ededed]">{mc.actualPct.toFixed(1)}%</td>
                  <td className="px-3 py-2.5 text-center"><StatusBadge status={mc.status} /></td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={Math.abs(mc.pctForaIdeal) <= 3 ? "text-[#6ecf8e]" : Math.abs(mc.pctForaIdeal) <= 8 ? "text-[#dcb092]" : "text-[#e05c5c]"}>
                      {mc.pctForaIdeal > 0 ? "+" : ""}{mc.pctForaIdeal.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="relative h-3 w-full rounded-sm bg-[#2a2a2a]">
                      <div
                        className="absolute left-0 top-0 h-full rounded-sm"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: mc.status === "ok" ? "#6ecf8e" : mc.status === "atencao" ? "#dcb092" : "#e05c5c",
                          opacity: 0.6,
                        }}
                      />
                      <div
                        className="absolute top-0 h-full w-px bg-[#ededed]/50"
                        style={{ left: `${idealWidth}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SubClassRangesTable() {
  const macroGroups = useMemo(() => {
    const groups: Record<string, SubClassRange[]> = {};
    SUB_CLASS_RANGES.forEach((sc) => {
      if (!groups[sc.macroClass]) groups[sc.macroClass] = [];
      groups[sc.macroClass].push(sc);
    });
    return groups;
  }, []);

  return (
    <section data-testid="sub-class-ranges">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#ededed]">
        <Scale className="h-4 w-4 text-[#dcb092]" />
        Análise por Política — Sub-Classificações
      </h2>
      <div className="overflow-x-auto rounded-md border border-[#2a2a2a]">
        <table className="w-full border-collapse text-xs">
          <thead className="bg-[#1a1a1a]">
            <tr className="border-b border-[#2a2a2a]">
              <th className="min-w-[160px] px-4 py-2.5 text-left font-medium text-[#8c8c8c]">Sub-Classificação</th>
              <th className="w-16 px-2 py-2.5 text-right font-medium text-[#8c8c8c]">Ideal</th>
              <th className="w-16 px-2 py-2.5 text-right font-medium text-[#8c8c8c]">Range-</th>
              <th className="w-16 px-2 py-2.5 text-right font-medium text-[#8c8c8c]">Range+</th>
              <th className="w-14 px-2 py-2.5 text-right font-medium text-[#8c8c8c]">Mín.</th>
              <th className="w-14 px-2 py-2.5 text-right font-medium text-[#8c8c8c]">Máx.</th>
              <th className="w-16 px-2 py-2.5 text-right font-medium text-[#8c8c8c]">Atual</th>
              <th className="w-20 px-2 py-2.5 text-center font-medium text-[#8c8c8c]">Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(macroGroups).map(([macro, subs]) => (
              <Fragment key={macro}>
                <tr className="border-b border-[#2a2a2a] bg-[#161616]">
                  <td colSpan={8} className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#666]">{macro}</td>
                </tr>
                {subs.map((sc) => {
                  const inRange = sc.atualPct >= sc.minPct && sc.atualPct <= sc.maxPct;
                  const status: BalanceStatus = inRange
                    ? "ok"
                    : Math.abs(sc.atualPct - sc.idealPct) > sc.rangePlus * 1.5 || Math.abs(sc.atualPct - sc.idealPct) > sc.rangeMinus * 1.5
                      ? "desbalanceado"
                      : "atencao";
                  const cellBg = inRange ? "bg-[rgba(110,207,142,0.06)]" : "bg-[rgba(224,92,92,0.06)]";
                  return (
                    <tr key={sc.name} className="border-b border-[#1e1e1e]" data-testid={`subclass-row-${sc.name}`}>
                      <td className="px-4 py-2 pl-6 text-[#bbb]">{sc.name}</td>
                      <td className="px-2 py-2 text-right text-[#8c8c8c]">{sc.idealPct.toFixed(1)}%</td>
                      <td className="px-2 py-2 text-right text-[#666]">-{sc.rangeMinus.toFixed(1)}%</td>
                      <td className="px-2 py-2 text-right text-[#666]">+{sc.rangePlus.toFixed(1)}%</td>
                      <td className="px-2 py-2 text-right text-[#666]">{sc.minPct.toFixed(1)}%</td>
                      <td className="px-2 py-2 text-right text-[#666]">{sc.maxPct.toFixed(1)}%</td>
                      <td className={`px-2 py-2 text-right font-medium ${cellBg} ${inRange ? "text-[#6ecf8e]" : "text-[#e05c5c]"}`}>{sc.atualPct.toFixed(1)}%</td>
                      <td className="px-2 py-2 text-center"><StatusBadge status={status} /></td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LiquidityAnalysis() {
  const maxPct = Math.max(...LIQUIDITY_DATA.map((d) => d.pctPL));
  const cumulativeD0D1 = LIQUIDITY_DATA[0].pctPL + LIQUIDITY_DATA[1].pctPL;
  const meetsPolicy = cumulativeD0D1 >= LIQUIDITY_POLICY_MIN;

  return (
    <section data-testid="liquidity-analysis">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#ededed]">
        <ArrowDownUp className="h-4 w-4 text-[#6db1d4]" />
        Análise de Liquidez
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 rounded-md border border-[#2a2a2a] bg-[#161616] p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#8c8c8c]">Perfil de Liquidez — % do P.L.</span>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${meetsPolicy ? "border-[rgba(110,207,142,0.25)] bg-[rgba(110,207,142,0.1)] text-[#6ecf8e]" : "border-[rgba(224,92,92,0.25)] bg-[rgba(224,92,92,0.1)] text-[#e05c5c]"}`}>
                {meetsPolicy ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                D+0/D+1: {cumulativeD0D1.toFixed(1)}% {meetsPolicy ? ">" : "<"} {LIQUIDITY_POLICY_MIN}%
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {LIQUIDITY_DATA.map((bucket) => {
              const barWidth = (bucket.pctPL / maxPct) * 100;
              const isShortTerm = bucket.label === "D+0" || bucket.label === "D+1";
              return (
                <div key={bucket.label} className="flex items-center gap-3" data-testid={`liquidity-bar-${bucket.label}`}>
                  <span className={`w-14 text-right text-xs font-medium ${isShortTerm ? "text-[#6db1d4]" : "text-[#8c8c8c]"}`}>{bucket.label}</span>
                  <div className="relative flex-1">
                    <div className="h-5 w-full rounded-sm bg-[#2a2a2a]">
                      <div
                        className="h-full rounded-sm transition-all"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: isShortTerm ? "#6db1d4" : bucket.label === "Ilíquido" ? "#e05c5c" : "#dcb092",
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-right text-xs font-medium text-[#ededed]">{bucket.pctPL.toFixed(1)}%</span>
                  <span className="w-20 text-right text-[11px] text-[#666]">{formatBRL(bucket.value)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-md border border-[#2a2a2a] bg-[#161616] p-5">
          <span className="mb-3 block text-xs font-medium text-[#8c8c8c]">Resumo de Liquidez</span>
          <div className="flex flex-col gap-3">
            <div className="rounded-md border border-[#2a2a2a] bg-[#1a1a1a] p-3">
              <span className="text-[10px] uppercase tracking-wider text-[#666]">Disponível em até D+1</span>
              <p className="mt-1 text-lg font-bold text-[#6db1d4]">{formatBRLFull(LIQUIDITY_DATA[0].value + LIQUIDITY_DATA[1].value)}</p>
              <p className="text-[11px] text-[#8c8c8c]">{cumulativeD0D1.toFixed(1)}% do P.L.</p>
            </div>
            <div className="rounded-md border border-[#2a2a2a] bg-[#1a1a1a] p-3">
              <span className="text-[10px] uppercase tracking-wider text-[#666]">Ilíquido</span>
              <p className="mt-1 text-lg font-bold text-[#e05c5c]">{formatBRLFull(LIQUIDITY_DATA[LIQUIDITY_DATA.length - 1].value)}</p>
              <p className="text-[11px] text-[#8c8c8c]">{LIQUIDITY_DATA[LIQUIDITY_DATA.length - 1].pctPL.toFixed(1)}% do P.L.</p>
            </div>
            <div className="rounded-md border border-[#2a2a2a] bg-[#1a1a1a] p-3">
              <span className="text-[10px] uppercase tracking-wider text-[#666]">Política Mínima</span>
              <p className="mt-1 text-sm font-semibold text-[#ededed]">{LIQUIDITY_POLICY_MIN}% em D+0/D+1</p>
              <div className={`mt-1 flex items-center gap-1 text-[11px] ${meetsPolicy ? "text-[#6ecf8e]" : "text-[#e05c5c]"}`}>
                {meetsPolicy ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {meetsPolicy ? "Dentro da política" : "Abaixo da política"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-md border border-[#2a2a2a]">
        <div className="px-4 py-2.5 text-xs font-medium text-[#8c8c8c] bg-[#1a1a1a] border-b border-[#2a2a2a]">Breakdown por Tipo de Ativo</div>
        <table className="w-full border-collapse text-xs">
          <thead className="bg-[#1a1a1a]">
            <tr className="border-b border-[#2a2a2a]">
              <th className="min-w-[140px] px-4 py-2 text-left font-medium text-[#8c8c8c]">Tipo de Ativo</th>
              <th className="w-16 px-2 py-2 text-right font-medium text-[#8c8c8c]">D+0</th>
              <th className="w-16 px-2 py-2 text-right font-medium text-[#8c8c8c]">D+1</th>
              <th className="w-16 px-2 py-2 text-right font-medium text-[#8c8c8c]">D+30</th>
              <th className="w-16 px-2 py-2 text-right font-medium text-[#8c8c8c]">D+90</th>
              <th className="w-16 px-2 py-2 text-right font-medium text-[#8c8c8c]">D+180</th>
              <th className="w-16 px-2 py-2 text-right font-medium text-[#8c8c8c]">D+360</th>
              <th className="w-16 px-2 py-2 text-right font-medium text-[#8c8c8c]">Ilíquido</th>
              <th className="w-20 px-2 py-2 text-right font-medium text-[#8c8c8c]">Total</th>
            </tr>
          </thead>
          <tbody>
            {LIQUIDITY_BY_ASSET.map((assetRow) => {
              const total = assetRow.d0 + assetRow.d1 + assetRow.d30 + assetRow.d90 + assetRow.d180 + assetRow.d360 + assetRow.iliquido;
              const vals = [assetRow.d0, assetRow.d1, assetRow.d30, assetRow.d90, assetRow.d180, assetRow.d360, assetRow.iliquido];
              return (
                <tr key={assetRow.type} className="border-b border-[#1e1e1e]" data-testid={`liquidity-asset-${assetRow.type}`}>
                  <td className="px-4 py-2 text-[#bbb]">{assetRow.type}</td>
                  {vals.map((v, i) => (
                    <td key={i} className={`px-2 py-2 text-right ${v > 0 ? "text-[#ccc]" : "text-[#333]"}`}>
                      {v > 0 ? formatBRL(v) : "—"}
                    </td>
                  ))}
                  <td className="px-2 py-2 text-right font-medium text-[#ededed]">{formatBRL(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PolicySection() {
  const row = "flex items-baseline justify-between gap-2 border-b border-[#1e1e1e] py-2";
  const lbl = "text-xs text-[#8c8c8c]";
  const val = "text-xs text-[#ccc]";

  const complianceIcon = (status: "ok" | "atencao" | "violado") => {
    if (status === "ok") return <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#6ecf8e]" />;
    if (status === "atencao") return <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#dcb092]" />;
    return <X className="h-3.5 w-3.5 shrink-0 text-[#e05c5c]" />;
  };

  const complianceColor = (status: "ok" | "atencao" | "violado") => {
    if (status === "ok") return "border-[rgba(110,207,142,0.15)] bg-[rgba(110,207,142,0.04)]";
    if (status === "atencao") return "border-[rgba(220,176,146,0.15)] bg-[rgba(220,176,146,0.04)]";
    return "border-[rgba(224,92,92,0.15)] bg-[rgba(224,92,92,0.04)]";
  };

  const okCount = COMPLIANCE_CHECKS.filter((c) => c.status === "ok").length;
  const atencaoCount = COMPLIANCE_CHECKS.filter((c) => c.status === "atencao").length;
  const violadoCount = COMPLIANCE_CHECKS.filter((c) => c.status === "violado").length;

  return (
    <section data-testid="policy-section">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#ededed]">
        <Info className="h-4 w-4 text-[#6db1d4]" />
        Política de Investimentos — Foundation
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-md border border-[#2a2a2a] bg-[#161616] p-4">
          <span className="mb-3 block text-[11px] font-semibold uppercase tracking-wider text-[#666]">Parâmetros</span>
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
          <div className={row}>
            <span className={lbl}>Prazo Máximo</span>
            <span className={val}>{POLICY.maxTerm}</span>
          </div>
          <div className={row}>
            <span className={lbl}>Liquidez Mín.</span>
            <span className={val}>{POLICY.liquidityMin}</span>
          </div>
          <div className="py-2">
            <span className={lbl}>Plataformas</span>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {POLICY.platforms.map((p) => {
                const c = getInstitutionColor(p);
                return <span key={p} className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${c.bg} ${c.text} ${c.border}`}>{p}</span>;
              })}
            </div>
          </div>
        </div>

        <div className="col-span-2 rounded-md border border-[#2a2a2a] bg-[#161616] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#666]">Compliance Check</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-[#6ecf8e]"><CheckCircle className="h-3 w-3" />{okCount}</span>
              <span className="flex items-center gap-1 text-[11px] text-[#dcb092]"><AlertTriangle className="h-3 w-3" />{atencaoCount}</span>
              {violadoCount > 0 && <span className="flex items-center gap-1 text-[11px] text-[#e05c5c]"><X className="h-3 w-3" />{violadoCount}</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {COMPLIANCE_CHECKS.map((check) => (
              <div
                key={check.label}
                className={`flex items-start gap-2 rounded-md border p-2.5 ${complianceColor(check.status)}`}
                data-testid={`compliance-${check.label}`}
              >
                {complianceIcon(check.status)}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#ccc]">{check.label}</p>
                  <p className="mt-0.5 text-[11px] text-[#888]">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-[#2a2a2a] bg-[#161616] p-4">
        <span className="mb-3 block text-[11px] font-semibold uppercase tracking-wider text-[#666]">Ranges por Macro Classe</span>
        <div className="flex flex-col gap-3">
          {MACRO_CLASS_POLICY.map((mc) => {
            const rangeMin = mc.idealPct * 0.7;
            const rangeMax = mc.idealPct * 1.3;
            const scale = rangeMax + 5;
            const idealLeft = (mc.idealPct / scale) * 100;
            const actualLeft = (mc.actualPct / scale) * 100;
            const rangeMinLeft = (rangeMin / scale) * 100;
            const rangeWidth = ((rangeMax - rangeMin) / scale) * 100;

            return (
              <div key={mc.name} className="flex items-center gap-3" data-testid={`policy-range-${mc.name}`}>
                <span className="w-28 text-xs text-[#bbb]">{mc.name}</span>
                <div className="relative h-4 flex-1 rounded-sm bg-[#2a2a2a]">
                  <div
                    className="absolute top-0 h-full rounded-sm bg-[rgba(110,207,142,0.12)]"
                    style={{ left: `${rangeMinLeft}%`, width: `${rangeWidth}%` }}
                  />
                  <div
                    className="absolute top-0 h-full w-px bg-[#ededed]/30"
                    style={{ left: `${idealLeft}%` }}
                  />
                  <div
                    className="absolute top-0.5 h-3 w-2 rounded-sm"
                    style={{
                      left: `${actualLeft}%`,
                      transform: "translateX(-50%)",
                      backgroundColor: mc.status === "ok" ? "#6ecf8e" : mc.status === "atencao" ? "#dcb092" : "#e05c5c",
                    }}
                  />
                </div>
                <span className="w-12 text-right text-xs font-medium text-[#ededed]">{mc.actualPct.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-4 rounded-sm bg-[rgba(110,207,142,0.2)]" />
            <span className="text-[10px] text-[#666]">Range aceitável</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-px bg-[#ededed]/30" />
            <span className="text-[10px] text-[#666]">Ideal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2 rounded-sm bg-[#6ecf8e]" />
            <span className="text-[10px] text-[#666]">Posição atual</span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-[#2a2a2a] bg-[#161616] p-4">
        <span className="mb-3 block text-[11px] font-semibold uppercase tracking-wider text-[#666]">Restrições de Ativos</span>
        <div className="grid grid-cols-3 gap-2">
          {POLICY.assetRestrictions.map((r) => (
            <div key={r} className="flex items-center gap-2 rounded-md border border-[rgba(224,92,92,0.15)] bg-[rgba(224,92,92,0.04)] p-2.5">
              <X className="h-3.5 w-3.5 shrink-0 text-[#e05c5c]" />
              <span className="text-xs text-[#e05c5c]">{r}</span>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#666]">Exposição Geográfica</span>
          <div className="flex flex-wrap gap-2">
            {POLICY.exposureAreas.map((a) => (
              <span key={a} className="rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-2.5 py-1 text-xs text-[#ccc]">{a}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MockupRealocador() {
  const [allocatorValues, setAllocatorValues] = useState<Record<string, Record<string, string>>>({});
  const [visibleInstNames, setVisibleInstNames] = useState<Set<string>>(() => new Set(["XP", "BTG", "Itaú"]));
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [notifyPreview, setNotifyPreview] = useState<{ channel: "whatsapp" | "email" } | null>(null);

  const handleAllocatorChange = (subId: string, inst: string, val: string) => {
    setAllocatorValues((prev) => ({ ...prev, [subId]: { ...prev[subId], [inst]: val } }));
  };

  const toggleInstitution = (name: string) => {
    setVisibleInstNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        if (next.size <= 1) return prev;
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const addChange = (change: PendingChange) => {
    setPendingChanges((prev) => [...prev.filter((c) => c.assetId !== change.assetId), change]);
  };

  const removeChange = (assetId: string) => {
    setPendingChanges((prev) => prev.filter((c) => c.assetId !== assetId));
  };

  const confirmNotify = () => {
    setPendingChanges([]);
    setNotifyPreview(null);
  };

  const compileNotificationText = useMemo(() => {
    const resgates = pendingChanges.filter((c) => c.type === "resgate");
    const remocoes = pendingChanges.filter((c) => c.type === "remocao");
    const adicoes = pendingChanges.filter((c) => c.type === "adicao");
    const lines: string[] = ["Olá Roberto, segue o resumo das movimentações sugeridas:", ""];
    if (resgates.length > 0) {
      lines.push(`Resgates (${resgates.length}):`);
      resgates.forEach((r) => lines.push(`  - ${r.assetName} (${r.institution}) ${r.value ? formatBRL(r.value) : ""}`));
      lines.push("");
    }
    if (remocoes.length > 0) {
      lines.push(`Remoções (${remocoes.length}):`);
      remocoes.forEach((r) => lines.push(`  - ${r.assetName} (${r.institution}) ${r.value ? formatBRL(r.value) : ""}`));
      lines.push("");
    }
    if (adicoes.length > 0) {
      lines.push(`Adições (${adicoes.length}):`);
      adicoes.forEach((a) => {
        const details = [a.rate, a.maturity, a.liquidity].filter(Boolean).join(", ");
        lines.push(`  - ${a.assetName} (${a.institution})${details ? ` [${details}]` : ""} ${a.value ? formatBRL(a.value) : ""}`);
      });
      lines.push("");
    }
    lines.push("Por favor, confirme se está de acordo.");
    return lines.join("\n");
  }, [pendingChanges]);

  const visibleInstitutions = useMemo(
    () => ALL_CLIENT_INSTITUTIONS.filter((i) => visibleInstNames.has(i.name)),
    [visibleInstNames]
  );

  const hasPending = pendingChanges.length > 0;
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
                  <div className="h-5 w-px bg-[#2a2a2a]" />
                  <button
                    onClick={() => { if (hasPending) setNotifyPreview({ channel: "whatsapp" }); }}
                    disabled={!hasPending}
                    className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors ${hasPending ? "border-[rgba(110,207,142,0.3)] bg-[rgba(110,207,142,0.08)] text-[#6ecf8e] hover:bg-[rgba(110,207,142,0.15)]" : "cursor-not-allowed border-[#2a2a2a] bg-[#161616] text-[#444]"}`}
                    data-testid="button-whatsapp-global"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                    {hasPending && (
                      <span className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#6ecf8e] px-1 text-[9px] font-bold text-[#121212]">
                        {pendingChanges.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => { if (hasPending) setNotifyPreview({ channel: "email" }); }}
                    disabled={!hasPending}
                    className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors ${hasPending ? "border-[rgba(109,177,212,0.3)] bg-[rgba(109,177,212,0.08)] text-[#6db1d4] hover:bg-[rgba(109,177,212,0.15)]" : "cursor-not-allowed border-[#2a2a2a] bg-[#161616] text-[#444]"}`}
                    data-testid="button-email-global"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Email
                    {hasPending && (
                      <span className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#6db1d4] px-1 text-[9px] font-bold text-[#121212]">
                        {pendingChanges.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <MatrixTable allocatorValues={allocatorValues} onAllocatorChange={handleAllocatorChange} visibleInstitutions={visibleInstitutions} allInstitutions={ALL_CLIENT_INSTITUTIONS} onToggleInstitution={toggleInstitution} pendingChanges={pendingChanges} onAddChange={addChange} onRemoveChange={removeChange} />

              <FGCBarChart />

              <MaturityChart />

              <MacroClassAnalysis />

              <SubClassRangesTable />

              <LiquidityAnalysis />

              <PolicySection />
            </div>
          </main>
        </div>
      </div>

      {notifyPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setNotifyPreview(null)} data-testid="notify-preview-overlay">
          <div className="w-full max-w-lg rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-6" onClick={(e) => e.stopPropagation()} data-testid="notify-preview-modal">
            <div className="mb-4 flex items-center gap-2">
              {notifyPreview.channel === "whatsapp" ? (
                <MessageCircle className="h-4 w-4 text-[#6ecf8e]" />
              ) : (
                <Mail className="h-4 w-4 text-[#6db1d4]" />
              )}
              <span className="text-sm font-medium text-[#ededed]">
                {notifyPreview.channel === "whatsapp" ? "Prévia WhatsApp" : "Prévia Email"}
              </span>
              <span className="text-xs text-[#555]">Roberto Mendes</span>
            </div>
            <pre className="mb-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-[#2a2a2a] bg-[#121212] p-4 text-xs leading-relaxed text-[#bbb]" data-testid="notify-preview-text">
              {compileNotificationText}
            </pre>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setNotifyPreview(null)}
                className="rounded-md px-3 py-1.5 text-xs text-[#8c8c8c] transition-colors hover:text-[#ededed]"
                data-testid="button-cancel-notify"
              >
                Cancelar
              </button>
              <button
                onClick={confirmNotify}
                className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${notifyPreview.channel === "whatsapp" ? "border-[rgba(110,207,142,0.3)] bg-[rgba(110,207,142,0.12)] text-[#6ecf8e] hover:bg-[rgba(110,207,142,0.2)]" : "border-[rgba(109,177,212,0.3)] bg-[rgba(109,177,212,0.12)] text-[#6db1d4] hover:bg-[rgba(109,177,212,0.2)]"}`}
                data-testid="button-confirm-notify"
              >
                {notifyPreview.channel === "whatsapp" ? <MessageCircle className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                Enviar {notifyPreview.channel === "whatsapp" ? "WhatsApp" : "Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
