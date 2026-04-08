import { useState, useMemo, useRef, useCallback, Fragment } from "react";
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
import { getInstitutionColor } from "@/features/clients/lib/institutionColors";

type BalanceStatus = "ok" | "atencao" | "desbalanceado";
type FGCStatus = "ok" | "alerta" | "critico";

interface Account {
  name: string;
  institution: string;
  colorKey: string;
  initials: string;
}

interface Asset {
  id: string;
  name: string;
  account: string;
  value: number;
  pctSub: number;
  maturity?: string;
  rate?: string;
  liquidity?: string;
  isFGTS?: boolean;
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
  byAccount: Record<string, number>;
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

const ALL_CLIENT_ACCOUNTS: Account[] = [
  { name: "XP PF", account: "XP PF", colorKey: "XP", initials: "XP" },
  { name: "XP PJ", account: "XP PF", colorKey: "XP", initials: "XP" },
  { name: "BTG Principal", account: "BTG Principal", colorKey: "BTG", initials: "BT" },
  { name: "Itaú Joint", account: "Itaú Joint", colorKey: "Itaú", initials: "IT" },
  { name: "Safra", account: "Safra", colorKey: "Safra", initials: "SF" },
  { name: "Bradesco", account: "Bradesco", colorKey: "Bradesco", initials: "BR" },
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
        pctPL: 12.0,
        status: "ok",
        pctForaIdeal: 1.2,
        alocIdeal: 1_590_000,
        alocAtual: 1_570_800,
        sugestao: 19_200,
        byAccount: {
          "XP PF": 300_000,
          "XP PJ": 170_000,
          "BTG Principal": 340_000,
          "Itaú Joint": 285_000,
          Safra: 245_800,
          Bradesco: 230_000,
        },
        assets: [
          {
            id: "a1",
            name: "CDB Liquidez Diária XP",
            account: "XP PF",
            value: 300_000,
            pctSub: 19.1,
          },
          {
            id: "a1_pj",
            name: "CDB Caixa XP PJ",
            account: "XP PJ",
            value: 170_000,
            pctSub: 10.8,
            rate: "100% CDI",
            liquidity: "D+0",
          },
          {
            id: "a2",
            name: "CDB Liquidez BTG",
            account: "BTG Principal",
            value: 340_000,
            pctSub: 21.6,
            rate: "101% CDI",
            liquidity: "D+0",
          },
          {
            id: "a3",
            name: "Fundo DI Itaú Soberano",
            account: "Itaú Joint",
            value: 285_000,
            pctSub: 18.1,
            rate: "99.5% CDI",
            liquidity: "D+1",
          },
          {
            id: "a4",
            name: "CDB Liquidez Safra",
            account: "Safra",
            value: 245_800,
            pctSub: 15.7,
            rate: "100.5% CDI",
            liquidity: "D+0",
          },
          {
            id: "a5",
            name: "CDB Liquidez Bradesco",
            account: "Bradesco",
            value: 230_000,
            pctSub: 14.7,
            rate: "99% CDI",
            liquidity: "D+0",
          },
        ],
      },
      {
        id: "cdi-tit",
        name: "CDI - Títulos",
        pctPL: 8.5,
        status: "atencao",
        pctForaIdeal: 3.8,
        alocIdeal: 1_126_250,
        alocAtual: 1_168_950,
        sugestao: -42_700,
        byAccount: {
          "XP PF": 380_000,
          "BTG Principal": 270_000,
          "Itaú Joint": 230_000,
          Safra: 178_950,
          Bradesco: 110_000,
        },
        assets: [
          {
            id: "a6",
            name: "CDB XP 2027",
            account: "XP PF",
            value: 380_000,
            pctSub: 32.5,
            rate: "CDI+1.2%",
            maturity: "Mar/2027",
            liquidity: "Vencimento",
          },
          {
            id: "a7",
            name: "CDB BTG 2026",
            account: "BTG Principal",
            value: 270_000,
            pctSub: 23.1,
            rate: "CDI+0.8%",
            maturity: "Set/2026",
            liquidity: "Vencimento",
          },
          {
            id: "a8",
            name: "LCI Itaú 2026",
            account: "Itaú Joint",
            value: 230_000,
            pctSub: 19.7,
            rate: "94% CDI",
            maturity: "Jul/2026",
            liquidity: "Vencimento",
          },
          {
            id: "a9",
            name: "CDB Safra 2027",
            account: "Safra",
            value: 178_950,
            pctSub: 15.3,
            rate: "CDI+1.5%",
            maturity: "Jan/2027",
            liquidity: "Vencimento",
          },
          {
            id: "a10",
            name: "LCA Bradesco 2026",
            account: "Bradesco",
            value: 110_000,
            pctSub: 9.4,
            rate: "92% CDI",
            maturity: "Jun/2026",
            liquidity: "Vencimento",
          },
        ],
      },
      {
        id: "cdi-fund",
        name: "CDI - Fundos",
        pctPL: 6.5,
        status: "ok",
        pctForaIdeal: 0.1,
        alocIdeal: 861_250,
        alocAtual: 855_000,
        sugestao: 6_250,
        byAccount: {
          "XP PF": 280_000,
          "BTG Principal": 220_000,
          "Itaú Joint": 165_000,
          Safra: 100_000,
          Bradesco: 90_000,
        },
        assets: [
          {
            id: "a11",
            name: "Trend DI FIC",
            account: "XP PF",
            value: 280_000,
            pctSub: 32.7,
            rate: "CDI+0.05%",
            liquidity: "D+1",
          },
          {
            id: "a12",
            name: "BTG Digital Tesouro",
            account: "BTG Principal",
            value: 220_000,
            pctSub: 25.7,
            rate: "CDI+0.02%",
            liquidity: "D+1",
          },
          {
            id: "a13",
            name: "Itaú Privilège DI",
            account: "Itaú Joint",
            value: 165_000,
            pctSub: 19.3,
            rate: "99.8% CDI",
            liquidity: "D+1",
          },
          {
            id: "a14",
            name: "Safra Corporate DI",
            account: "Safra",
            value: 100_000,
            pctSub: 11.7,
            rate: "100% CDI",
            liquidity: "D+1",
          },
          {
            id: "a15",
            name: "Bradesco FI Ref DI",
            account: "Bradesco",
            value: 90_000,
            pctSub: 10.5,
            rate: "99% CDI",
            liquidity: "D+1",
          },
        ],
      },
      {
        id: "infl-tit",
        name: "Inflação - Títulos",
        pctPL: 10.0,
        status: "desbalanceado",
        pctForaIdeal: 8.2,
        alocIdeal: 1_325_000,
        alocAtual: 1_433_600,
        sugestao: -108_600,
        byAccount: {
          "XP PF": 450_000,
          "BTG Principal": 340_000,
          "Itaú Joint": 280_000,
          Safra: 223_600,
          Bradesco: 140_000,
        },
        assets: [
          {
            id: "a16",
            name: "NTN-B 2030",
            account: "XP PF",
            value: 250_000,
            pctSub: 17.4,
            rate: "IPCA+6.2%",
            maturity: "Ago/2030",
            liquidity: "D+1",
          },
          {
            id: "a17",
            name: "NTN-B 2028",
            account: "XP PF",
            value: 200_000,
            pctSub: 14.0,
            rate: "IPCA+5.8%",
            maturity: "Mai/2028",
            liquidity: "D+1",
          },
          {
            id: "a18",
            name: "NTN-B 2029",
            account: "BTG Principal",
            value: 340_000,
            pctSub: 23.7,
            rate: "IPCA+6.0%",
            maturity: "Ago/2029",
            liquidity: "D+1",
          },
          {
            id: "a19",
            name: "Debênture IPCA Itaú",
            account: "Itaú Joint",
            value: 280_000,
            pctSub: 19.5,
            rate: "IPCA+7.2%",
            maturity: "Dez/2029",
            liquidity: "D+90",
          },
          {
            id: "a20",
            name: "CRI IPCA Safra",
            account: "Safra",
            value: 223_600,
            pctSub: 15.6,
            rate: "IPCA+7.5%",
            maturity: "Mar/2031",
            liquidity: "D+180",
          },
          {
            id: "a21",
            name: "NTN-B 2032",
            account: "Bradesco",
            value: 140_000,
            pctSub: 9.8,
            rate: "IPCA+6.5%",
            maturity: "Ago/2032",
            liquidity: "D+1",
          },
        ],
      },
      {
        id: "infl-fund",
        name: "Inflação - Fundos",
        pctPL: 6.0,
        status: "ok",
        pctForaIdeal: 0.4,
        alocIdeal: 795_000,
        alocAtual: 791_800,
        sugestao: 3_200,
        byAccount: {
          "XP PF": 250_000,
          "BTG Principal": 200_000,
          "Itaú Joint": 160_000,
          Safra: 101_800,
          Bradesco: 80_000,
        },
        assets: [
          {
            id: "a22",
            name: "Kinea IPCA Dinâmico",
            account: "XP PF",
            value: 250_000,
            pctSub: 31.6,
            rate: "IPCA+5.5%",
            liquidity: "D+30",
          },
          {
            id: "a23",
            name: "SPX Seahawk IPCA",
            account: "BTG Principal",
            value: 200_000,
            pctSub: 25.3,
            rate: "IPCA+6.1%",
            liquidity: "D+30",
          },
          {
            id: "a24",
            name: "Itaú Flexprev IMA-B",
            account: "Itaú Joint",
            value: 160_000,
            pctSub: 20.2,
            rate: "IMA-B",
            liquidity: "D+30",
          },
          {
            id: "a25",
            name: "Safra IMA-B 5",
            account: "Safra",
            value: 101_800,
            pctSub: 12.9,
            rate: "IMA-B 5",
            liquidity: "D+30",
          },
          {
            id: "a26",
            name: "Bradesco Inflação FI",
            account: "Bradesco",
            value: 80_000,
            pctSub: 10.1,
            rate: "IPCA+4.8%",
            liquidity: "D+30",
          },
        ],
      },
      {
        id: "pre-tit",
        name: "Pré Fixado - Títulos",
        pctPL: 5.5,
        status: "atencao",
        pctForaIdeal: 4.6,
        alocIdeal: 728_750,
        alocAtual: 695_250,
        sugestao: 33_500,
        byAccount: {
          "XP PF": 230_000,
          "BTG Principal": 170_000,
          "Itaú Joint": 140_000,
          Safra: 90_250,
          Bradesco: 65_000,
        },
        assets: [
          {
            id: "a27",
            name: "LTN 2027",
            account: "XP PF",
            value: 230_000,
            pctSub: 33.1,
            rate: "12.8% a.a.",
            maturity: "Jan/2027",
            liquidity: "Vencimento",
          },
          {
            id: "a28",
            name: "CDB Pré BTG",
            account: "BTG Principal",
            value: 170_000,
            pctSub: 24.5,
            rate: "13.2% a.a.",
            maturity: "Jul/2027",
            liquidity: "Vencimento",
          },
          {
            id: "a29",
            name: "LTN 2026",
            account: "Itaú Joint",
            value: 140_000,
            pctSub: 20.1,
            rate: "11.5% a.a.",
            maturity: "Jul/2026",
            liquidity: "Vencimento",
          },
          {
            id: "a30",
            name: "CDB Pré Safra",
            account: "Safra",
            value: 90_250,
            pctSub: 13.0,
            rate: "13.5% a.a.",
            maturity: "Dez/2027",
            liquidity: "Vencimento",
          },
          {
            id: "a31",
            name: "CDB Pré Bradesco",
            account: "Bradesco",
            value: 65_000,
            pctSub: 9.3,
            rate: "12.0% a.a.",
            maturity: "Mar/2027",
            liquidity: "Vencimento",
          },
        ],
      },
      {
        id: "pre-fund",
        name: "Pré Fixado - Fundos",
        pctPL: 3.5,
        status: "ok",
        pctForaIdeal: 1.8,
        alocIdeal: 463_750,
        alocAtual: 460_000,
        sugestao: 3_750,
        byAccount: {
          "XP PF": 160_000,
          "BTG Principal": 120_000,
          "Itaú Joint": 85_000,
          Safra: 60_000,
          Bradesco: 35_000,
        },
        assets: [
          {
            id: "a200",
            name: "Kinea Pré FIC",
            account: "XP PF",
            value: 160_000,
            pctSub: 34.8,
            rate: "Pré 12.5%",
            liquidity: "D+30",
          },
          {
            id: "a201",
            name: "BTG Pré Fixado RF",
            account: "BTG Principal",
            value: 120_000,
            pctSub: 26.1,
            rate: "Pré 12.8%",
            liquidity: "D+30",
          },
          {
            id: "a202",
            name: "Itaú Pré DI Mix",
            account: "Itaú Joint",
            value: 85_000,
            pctSub: 18.5,
            rate: "Pré 12.0%",
            liquidity: "D+30",
          },
          {
            id: "a203",
            name: "Safra Pré Select",
            account: "Safra",
            value: 60_000,
            pctSub: 13.0,
            rate: "Pré 13.0%",
            liquidity: "D+30",
          },
          {
            id: "a204",
            name: "Bradesco FI Pré",
            account: "Bradesco",
            value: 35_000,
            pctSub: 7.6,
            rate: "Pré 11.8%",
            liquidity: "D+30",
          },
        ],
      },
    ],
  },
  {
    id: "mm",
    name: "Multimercado",
    subs: [
      {
        id: "mm-gen",
        name: "Multimercado",
        pctPL: 4.0,
        status: "atencao",
        pctForaIdeal: 5.2,
        alocIdeal: 530_000,
        alocAtual: 502_500,
        sugestao: 27_500,
        byAccount: {
          "XP PF": 200_000,
          "BTG Principal": 140_000,
          "Itaú Joint": 80_000,
          Safra: 52_500,
          Bradesco: 30_000,
        },
        assets: [
          {
            id: "a70",
            name: "Bridgewater All Weather",
            account: "XP PF",
            value: 200_000,
            pctSub: 39.8,
            liquidity: "D+90",
          },
          {
            id: "a71",
            name: "AQR Risk Parity",
            account: "BTG Principal",
            value: 140_000,
            pctSub: 27.9,
            liquidity: "D+90",
          },
          {
            id: "a72",
            name: "Itaú Global Macro",
            account: "Itaú Joint",
            value: 80_000,
            pctSub: 15.9,
            liquidity: "D+30",
          },
          {
            id: "a73",
            name: "Safra Multi Global",
            account: "Safra",
            value: 52_500,
            pctSub: 10.4,
            liquidity: "D+30",
          },
          {
            id: "a74",
            name: "Bradesco Global Alloc.",
            account: "Bradesco",
            value: 30_000,
            pctSub: 6.0,
            liquidity: "D+30",
          },
        ],
      },
    ],
  },
  {
    id: "imob-cat",
    name: "Imobiliário",
    subs: [
      {
        id: "imob-atv",
        name: "Imobiliário - Ativos",
        pctPL: 4.5,
        status: "ok",
        pctForaIdeal: 1.5,
        alocIdeal: 596_250,
        alocAtual: 605_300,
        sugestao: -9_050,
        byAccount: {
          "XP PF": 240_000,
          "BTG Principal": 170_000,
          "Itaú Joint": 95_000,
          Safra: 60_300,
          Bradesco: 40_000,
        },
        assets: [
          {
            id: "a86",
            name: "HGLG11 - CSHG Logística",
            account: "XP PF",
            value: 130_000,
            pctSub: 21.5,
            liquidity: "D+2",
          },
          {
            id: "a87",
            name: "XPML11 - XP Malls",
            account: "XP PF",
            value: 110_000,
            pctSub: 18.2,
            liquidity: "D+2",
          },
          {
            id: "a88",
            name: "BTLG11 - BTG Log.",
            account: "BTG Principal",
            value: 170_000,
            pctSub: 28.1,
            liquidity: "D+2",
          },
          {
            id: "a89",
            name: "IRDM11 - Iridium Receb.",
            account: "Itaú Joint",
            value: 95_000,
            pctSub: 15.7,
            liquidity: "D+2",
          },
          {
            id: "a90",
            name: "KNCR11 - Kinea Rend.",
            account: "Safra",
            value: 60_300,
            pctSub: 10.0,
            liquidity: "D+2",
          },
          {
            id: "a91",
            name: "HGRE11 - CSHG Real Est.",
            account: "Bradesco",
            value: 40_000,
            pctSub: 6.6,
            liquidity: "D+2",
          },
        ],
      },
      {
        id: "imob-fund",
        name: "Imobiliário - Fundos",
        pctPL: 2.1,
        status: "ok",
        pctForaIdeal: 2.0,
        alocIdeal: 278_250,
        alocAtual: 280_000,
        sugestao: -1_750,
        byAccount: {
          "XP PF": 100_000,
          "BTG Principal": 75_000,
          "Itaú Joint": 50_000,
          Safra: 35_000,
          Bradesco: 20_000,
        },
        assets: [
          {
            id: "a210",
            name: "Kinea Renda Imob. FII",
            account: "XP PF",
            value: 100_000,
            pctSub: 35.7,
            liquidity: "D+30",
          },
          {
            id: "a211",
            name: "BTG Real Estate FoF",
            account: "BTG Principal",
            value: 75_000,
            pctSub: 26.8,
            liquidity: "D+30",
          },
          {
            id: "a212",
            name: "Itaú Imob. Renda FIC",
            account: "Itaú Joint",
            value: 50_000,
            pctSub: 17.9,
            liquidity: "D+30",
          },
          {
            id: "a213",
            name: "Safra FoF Imob.",
            account: "Safra",
            value: 35_000,
            pctSub: 12.5,
            liquidity: "D+30",
          },
          {
            id: "a214",
            name: "Bradesco FII Mix",
            account: "Bradesco",
            value: 20_000,
            pctSub: 7.1,
            liquidity: "D+30",
          },
        ],
      },
    ],
  },
  {
    id: "acoes-cat",
    name: "Ações",
    subs: [
      {
        id: "acoes-atv",
        name: "Ações - Ativos",
        pctPL: 7.0,
        status: "desbalanceado",
        pctForaIdeal: 12.5,
        alocIdeal: 927_500,
        alocAtual: 985_500,
        sugestao: -58_000,
        byAccount: {
          "XP PF": 400_000,
          "BTG Principal": 280_000,
          "Itaú Joint": 165_000,
          Safra: 85_500,
          Bradesco: 55_000,
        },
        assets: [
          {
            id: "a42",
            name: "PETR4",
            account: "XP PF",
            value: 180_000,
            pctSub: 18.3,
            liquidity: "D+2",
            isFGTS: true,
          },
          {
            id: "a43",
            name: "VALE3",
            account: "XP PF",
            value: 120_000,
            pctSub: 12.2,
            liquidity: "D+2",
            isFGTS: true,
          },
          {
            id: "a44",
            name: "ITUB4",
            account: "BTG Principal",
            value: 150_000,
            pctSub: 15.2,
            liquidity: "D+2",
          },
          {
            id: "a45",
            name: "BBDC4",
            account: "BTG Principal",
            value: 130_000,
            pctSub: 13.2,
            liquidity: "D+2",
          },
          {
            id: "a46",
            name: "WEGE3",
            account: "Itaú Joint",
            value: 165_000,
            pctSub: 16.7,
            liquidity: "D+2",
          },
          {
            id: "a47",
            name: "RENT3",
            account: "XP PF",
            value: 100_000,
            pctSub: 10.1,
            liquidity: "D+2",
          },
          {
            id: "a48",
            name: "B3SA3",
            account: "Safra",
            value: 85_500,
            pctSub: 8.7,
            liquidity: "D+2",
          },
          {
            id: "a49",
            name: "SUZB3",
            account: "Bradesco",
            value: 55_000,
            pctSub: 5.6,
            liquidity: "D+2",
          },
        ],
      },
      {
        id: "acoes-etf",
        name: "Ações - ETFs",
        pctPL: 2.2,
        status: "ok",
        pctForaIdeal: 2.5,
        alocIdeal: 291_500,
        alocAtual: 285_000,
        sugestao: 6_500,
        byAccount: {
          "XP PF": 110_000,
          "BTG Principal": 75_000,
          "Itaú Joint": 50_000,
          Safra: 30_000,
          Bradesco: 20_000,
        },
        assets: [
          {
            id: "a220",
            name: "BOVA11 - Ibovespa ETF",
            account: "XP PF",
            value: 110_000,
            pctSub: 38.6,
            liquidity: "D+2",
          },
          {
            id: "a221",
            name: "SMAL11 - Small Cap ETF",
            account: "BTG Principal",
            value: 75_000,
            pctSub: 26.3,
            liquidity: "D+2",
          },
          {
            id: "a222",
            name: "IVVB11 - S&P 500 ETF",
            account: "Itaú Joint",
            value: 50_000,
            pctSub: 17.5,
            liquidity: "D+2",
          },
          {
            id: "a223",
            name: "DIVO11 - Dividendos ETF",
            account: "Safra",
            value: 30_000,
            pctSub: 10.5,
            liquidity: "D+2",
          },
          {
            id: "a224",
            name: "HASH11 - Crypto ETF",
            account: "Bradesco",
            value: 20_000,
            pctSub: 7.0,
            liquidity: "D+2",
          },
        ],
      },
      {
        id: "acoes-fund",
        name: "Ações - Fundos",
        pctPL: 2.5,
        status: "desbalanceado",
        pctForaIdeal: 18.0,
        alocIdeal: 331_250,
        alocAtual: 271_625,
        sugestao: 59_625,
        byAccount: {
          "XP PF": 110_000,
          "BTG Principal": 75_000,
          "Itaú Joint": 45_000,
          Safra: 26_625,
          Bradesco: 15_000,
        },
        assets: [
          {
            id: "a60",
            name: "Trígono Flagship SC",
            account: "XP PF",
            value: 110_000,
            pctSub: 40.5,
            liquidity: "D+30",
          },
          {
            id: "a61",
            name: "HIX Capital FIA",
            account: "BTG Principal",
            value: 75_000,
            pctSub: 27.6,
            liquidity: "D+30",
          },
          {
            id: "a62",
            name: "Brasil Capital SC",
            account: "Itaú Joint",
            value: 45_000,
            pctSub: 16.6,
            liquidity: "D+30",
          },
          {
            id: "a63",
            name: "Organon FIA",
            account: "Safra",
            value: 26_625,
            pctSub: 9.8,
            liquidity: "D+30",
          },
          {
            id: "a64",
            name: "Constellation Compounders",
            account: "Bradesco",
            value: 15_000,
            pctSub: 5.5,
            liquidity: "D+30",
          },
        ],
      },
      {
        id: "acoes-lb",
        name: "Ações - Long Biased",
        pctPL: 4.5,
        status: "ok",
        pctForaIdeal: 2.0,
        alocIdeal: 596_250,
        alocAtual: 608_150,
        sugestao: -11_900,
        byAccount: {
          "XP PF": 250_000,
          "BTG Principal": 175_000,
          "Itaú Joint": 100_000,
          Safra: 53_150,
          Bradesco: 30_000,
        },
        assets: [
          {
            id: "a50",
            name: "SPX Nimitz Feeder",
            account: "XP PF",
            value: 250_000,
            pctSub: 41.1,
            liquidity: "D+30",
          },
          {
            id: "a51",
            name: "Verde AM Long Bias",
            account: "BTG Principal",
            value: 175_000,
            pctSub: 28.8,
            liquidity: "D+30",
          },
          {
            id: "a52",
            name: "Dynamo Cougar",
            account: "Itaú Joint",
            value: 100_000,
            pctSub: 16.4,
            liquidity: "D+60",
          },
          {
            id: "a53",
            name: "Atmos Ações FIC",
            account: "Safra",
            value: 53_150,
            pctSub: 8.7,
            liquidity: "D+30",
          },
          {
            id: "a54",
            name: "Bogari Value FIC",
            account: "Bradesco",
            value: 30_000,
            pctSub: 4.9,
            liquidity: "D+30",
          },
        ],
      },
      {
        id: "pe-vc",
        name: "PE / VC / Special Sits",
        pctPL: 6.3,
        status: "ok",
        pctForaIdeal: 0.6,
        alocIdeal: 834_750,
        alocAtual: 830_000,
        sugestao: 4_750,
        byAccount: {
          "XP PF": 320_000,
          "BTG Principal": 230_000,
          "Itaú Joint": 140_000,
          Safra: 85_000,
          Bradesco: 55_000,
        },
        assets: [
          {
            id: "a55",
            name: "Vinci Partners Private",
            account: "XP PF",
            value: 180_000,
            pctSub: 21.7,
            liquidity: "Ilíquido",
          },
          {
            id: "a92",
            name: "Pátria Growth Fund V",
            account: "XP PF",
            value: 140_000,
            pctSub: 16.9,
            liquidity: "Ilíquido",
          },
          {
            id: "a56",
            name: "Pátria Infra BR IV",
            account: "BTG Principal",
            value: 120_000,
            pctSub: 14.5,
            liquidity: "Ilíquido",
          },
          {
            id: "a93",
            name: "Vinci Capital Partners IV",
            account: "BTG Principal",
            value: 110_000,
            pctSub: 13.3,
            liquidity: "Ilíquido",
          },
          {
            id: "a57",
            name: "Itaú Private Equity II",
            account: "Itaú Joint",
            value: 80_000,
            pctSub: 9.6,
            liquidity: "Ilíquido",
          },
          {
            id: "a94",
            name: "Itaú PE Fund III",
            account: "Itaú Joint",
            value: 60_000,
            pctSub: 7.2,
            liquidity: "Ilíquido",
          },
          {
            id: "a58",
            name: "Spectra Private V",
            account: "Safra",
            value: 55_000,
            pctSub: 6.6,
            liquidity: "Ilíquido",
          },
          {
            id: "a95",
            name: "Spectra Ventures VII",
            account: "Safra",
            value: 30_000,
            pctSub: 3.6,
            liquidity: "Ilíquido",
          },
          {
            id: "a59",
            name: "Kinea Private Equity",
            account: "Bradesco",
            value: 30_000,
            pctSub: 3.6,
            liquidity: "Ilíquido",
          },
          {
            id: "a96",
            name: "EB Capital FIP",
            account: "Bradesco",
            value: 25_000,
            pctSub: 3.0,
            liquidity: "Ilíquido",
          },
        ],
      },
    ],
  },
  {
    id: "ext",
    name: "Exterior",
    subs: [
      {
        id: "ext-rf",
        name: "Exterior - Renda Fixa",
        pctPL: 4.5,
        status: "ok",
        pctForaIdeal: 0.8,
        alocIdeal: 596_250,
        alocAtual: 601_000,
        sugestao: -4_750,
        byAccount: {
          "XP PF": 240_000,
          "BTG Principal": 170_000,
          "Itaú Joint": 90_000,
          Safra: 61_000,
          Bradesco: 40_000,
        },
        assets: [
          {
            id: "a65",
            name: "iShares US Bond (AGG)",
            account: "XP PF",
            value: 240_000,
            pctSub: 39.9,
            rate: "USD Bonds",
            liquidity: "D+3",
          },
          {
            id: "a66",
            name: "Pimco Income Fund",
            account: "BTG Principal",
            value: 170_000,
            pctSub: 28.3,
            rate: "USD Income",
            liquidity: "D+30",
          },
          {
            id: "a67",
            name: "Itaú RF Global FIC",
            account: "Itaú Joint",
            value: 90_000,
            pctSub: 15.0,
            rate: "USD + Hedge",
            liquidity: "D+30",
          },
          {
            id: "a68",
            name: "Safra Bond Global",
            account: "Safra",
            value: 61_000,
            pctSub: 10.1,
            rate: "USD Bonds",
            liquidity: "D+30",
          },
          {
            id: "a69",
            name: "Bradesco Global Fixed",
            account: "Bradesco",
            value: 40_000,
            pctSub: 6.7,
            rate: "USD + Hedge",
            liquidity: "D+30",
          },
        ],
      },
      {
        id: "ext-acoes",
        name: "Exterior - Ações",
        pctPL: 4.0,
        status: "desbalanceado",
        pctForaIdeal: 15.3,
        alocIdeal: 530_000,
        alocAtual: 449_000,
        sugestao: 81_000,
        byAccount: {
          "XP PF": 180_000,
          "BTG Principal": 120_000,
          "Itaú Joint": 75_000,
          Safra: 44_000,
          Bradesco: 30_000,
        },
        assets: [
          {
            id: "a75",
            name: "iShares S&P 500 (IVV)",
            account: "XP PF",
            value: 100_000,
            pctSub: 22.3,
            liquidity: "D+3",
          },
          {
            id: "a76",
            name: "Nasdaq 100 ETF (QQQ)",
            account: "XP PF",
            value: 80_000,
            pctSub: 17.8,
            liquidity: "D+3",
          },
          {
            id: "a77",
            name: "Morgan Stanley Global",
            account: "BTG Principal",
            value: 120_000,
            pctSub: 26.7,
            liquidity: "D+30",
          },
          {
            id: "a78",
            name: "Itaú USA Equities",
            account: "Itaú Joint",
            value: 75_000,
            pctSub: 16.7,
            liquidity: "D+30",
          },
          {
            id: "a79",
            name: "Safra International Eq.",
            account: "Safra",
            value: 44_000,
            pctSub: 9.8,
            liquidity: "D+30",
          },
          {
            id: "a80",
            name: "Bradesco Global Eq.",
            account: "Bradesco",
            value: 30_000,
            pctSub: 6.7,
            liquidity: "D+30",
          },
        ],
      },
    ],
  },
  {
    id: "alt-cat",
    name: "Alternativos",
    subs: [
      {
        id: "coe",
        name: "COE",
        pctPL: 1.4,
        status: "ok",
        pctForaIdeal: 3.0,
        alocIdeal: 185_500,
        alocAtual: 180_000,
        sugestao: 5_500,
        byAccount: {
          "XP PF": 75_000,
          "BTG Principal": 50_000,
          "Itaú Joint": 28_000,
          Safra: 15_000,
          Bradesco: 12_000,
        },
        assets: [
          {
            id: "a230",
            name: "COE S&P Capital Protegido XP",
            account: "XP PF",
            value: 75_000,
            pctSub: 41.7,
            maturity: "Mar/2027",
            liquidity: "Vencimento",
          },
          {
            id: "a231",
            name: "COE Autocallable BTG",
            account: "BTG Principal",
            value: 50_000,
            pctSub: 27.8,
            maturity: "Jun/2027",
            liquidity: "Vencimento",
          },
          {
            id: "a232",
            name: "COE Euro Stoxx Itaú",
            account: "Itaú Joint",
            value: 28_000,
            pctSub: 15.6,
            maturity: "Set/2027",
            liquidity: "Vencimento",
          },
          {
            id: "a233",
            name: "COE Ouro Safra",
            account: "Safra",
            value: 15_000,
            pctSub: 8.3,
            maturity: "Dez/2026",
            liquidity: "Vencimento",
          },
          {
            id: "a234",
            name: "COE Ibov Bradesco",
            account: "Bradesco",
            value: 12_000,
            pctSub: 6.7,
            maturity: "Mar/2027",
            liquidity: "Vencimento",
          },
        ],
      },
      {
        id: "ouro",
        name: "Ouro",
        pctPL: 0.9,
        status: "ok",
        pctForaIdeal: 1.5,
        alocIdeal: 119_250,
        alocAtual: 120_000,
        sugestao: -750,
        byAccount: {
          "XP PF": 50_000,
          "BTG Principal": 32_000,
          "Itaú Joint": 20_000,
          Safra: 11_000,
          Bradesco: 7_000,
        },
        assets: [
          {
            id: "a240",
            name: "Trend Ouro FIC",
            account: "XP PF",
            value: 50_000,
            pctSub: 41.7,
            liquidity: "D+1",
          },
          {
            id: "a241",
            name: "BTG Gold FI",
            account: "BTG Principal",
            value: 32_000,
            pctSub: 26.7,
            liquidity: "D+1",
          },
          {
            id: "a242",
            name: "Itaú Ouro FIC",
            account: "Itaú Joint",
            value: 20_000,
            pctSub: 16.7,
            liquidity: "D+1",
          },
          {
            id: "a243",
            name: "Safra Gold Plus",
            account: "Safra",
            value: 11_000,
            pctSub: 9.2,
            liquidity: "D+1",
          },
          {
            id: "a244",
            name: "Bradesco FI Ouro",
            account: "Bradesco",
            value: 7_000,
            pctSub: 5.8,
            liquidity: "D+1",
          },
        ],
      },
      {
        id: "cripto",
        name: "Criptoativos",
        pctPL: 0.9,
        status: "atencao",
        pctForaIdeal: 8.0,
        alocIdeal: 119_250,
        alocAtual: 115_000,
        sugestao: 4_250,
        byAccount: {
          "XP PF": 48_000,
          "BTG Principal": 30_000,
          "Itaú Joint": 18_000,
          Safra: 12_000,
          Bradesco: 7_000,
        },
        assets: [
          {
            id: "a250",
            name: "Hashdex Bitcoin FIC",
            account: "XP PF",
            value: 48_000,
            pctSub: 41.7,
            liquidity: "D+1",
          },
          {
            id: "a251",
            name: "BTG Digital Assets",
            account: "BTG Principal",
            value: 30_000,
            pctSub: 26.1,
            liquidity: "D+1",
          },
          {
            id: "a252",
            name: "Itaú Crypto Allocation",
            account: "Itaú Joint",
            value: 18_000,
            pctSub: 15.7,
            liquidity: "D+1",
          },
          {
            id: "a253",
            name: "Safra Blockchain FIC",
            account: "Safra",
            value: 12_000,
            pctSub: 10.4,
            liquidity: "D+1",
          },
          {
            id: "a254",
            name: "Bradesco Cripto FI",
            account: "Bradesco",
            value: 7_000,
            pctSub: 6.1,
            liquidity: "D+1",
          },
        ],
      },
      {
        id: "alt-gen",
        name: "Alternativo",
        pctPL: 3.3,
        status: "ok",
        pctForaIdeal: 2.1,
        alocIdeal: 437_250,
        alocAtual: 440_475,
        sugestao: -3_225,
        byAccount: {
          "XP PF": 190_000,
          "BTG Principal": 121_000,
          "Itaú Joint": 55_000,
          Safra: 49_475,
          Bradesco: 25_000,
        },
        assets: [
          {
            id: "a97",
            name: "Pátria Infra Energy III",
            account: "XP PF",
            value: 150_000,
            pctSub: 34.1,
            liquidity: "Ilíquido",
          },
          {
            id: "a98",
            name: "BTG Infra Core Fund",
            account: "BTG Principal",
            value: 105_000,
            pctSub: 23.8,
            liquidity: "Ilíquido",
          },
          {
            id: "a99",
            name: "Itaú Infra FIP-IE",
            account: "Itaú Joint",
            value: 55_000,
            pctSub: 12.5,
            liquidity: "Ilíquido",
          },
          {
            id: "a100",
            name: "Safra Infra Debentures",
            account: "Safra",
            value: 40_000,
            pctSub: 9.1,
            liquidity: "D+360",
          },
          {
            id: "a102",
            name: "Fiagro KNCA11",
            account: "XP PF",
            value: 40_000,
            pctSub: 9.1,
            liquidity: "D+2",
          },
          {
            id: "a101",
            name: "Bradesco FIP Infra",
            account: "Bradesco",
            value: 25_000,
            pctSub: 5.7,
            liquidity: "Ilíquido",
          },
          {
            id: "a103",
            name: "BTG Agro Strategy",
            account: "BTG Principal",
            value: 16_000,
            pctSub: 3.6,
            liquidity: "D+90",
          },
          {
            id: "a105",
            name: "Safra Agribusiness",
            account: "Safra",
            value: 9_475,
            pctSub: 2.2,
            liquidity: "D+90",
          },
        ],
      },
    ],
  },
];

const FGC_DATA: FGCInfo[] = [
  { account: "XP PF", colorKey: "XP", covered: 145_000, limit: 250_000, status: "ok" },
  { account: "BTG Principal", colorKey: "BTG", covered: 210_000, limit: 250_000, status: "alerta" },
  { account: "Itaú Joint", colorKey: "Itaú", covered: 268_500, limit: 250_000, status: "critico" },
  { account: "Safra", colorKey: "Safra", covered: 92_000, limit: 250_000, status: "ok" },
  { account: "Bradesco", colorKey: "Bradesco", covered: 55_000, limit: 250_000, status: "ok" },
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
  {
    year: 2026,
    posFixado: 50_000,
    inflacao: 0,
    preFixado: 140_000,
    avgRatePos: 100.5,
    avgRateInfl: 0,
    avgRatePre: 11.5,
  },
  {
    year: 2027,
    posFixado: 88_950,
    inflacao: 0,
    preFixado: 555_250,
    avgRatePos: 101.2,
    avgRateInfl: 0,
    avgRatePre: 12.9,
  },
  {
    year: 2028,
    posFixado: 53_100,
    inflacao: 200_000,
    preFixado: 0,
    avgRatePos: 101.8,
    avgRateInfl: 5.8,
    avgRatePre: 0,
  },
  {
    year: 2029,
    posFixado: 100_000,
    inflacao: 563_600,
    preFixado: 0,
    avgRatePos: 102.5,
    avgRateInfl: 6.1,
    avgRatePre: 0,
  },
  {
    year: 2030,
    posFixado: 0,
    inflacao: 390_000,
    preFixado: 0,
    avgRatePos: 0,
    avgRateInfl: 6.5,
    avgRatePre: 0,
  },
  {
    year: 2031,
    posFixado: 0,
    inflacao: 278_600,
    preFixado: 0,
    avgRatePos: 0,
    avgRateInfl: 7.1,
    avgRatePre: 0,
  },
  {
    year: 2032,
    posFixado: 0,
    inflacao: 165_000,
    preFixado: 0,
    avgRatePos: 0,
    avgRateInfl: 6.5,
    avgRatePre: 0,
  },
  {
    year: 2033,
    posFixado: 0,
    inflacao: 0,
    preFixado: 0,
    avgRatePos: 0,
    avgRateInfl: 0,
    avgRatePre: 0,
  },
  {
    year: 2034,
    posFixado: 0,
    inflacao: 120_000,
    preFixado: 0,
    avgRatePos: 0,
    avgRateInfl: 6.8,
    avgRatePre: 0,
  },
  {
    year: 2035,
    posFixado: 0,
    inflacao: 80_000,
    preFixado: 0,
    avgRatePos: 0,
    avgRateInfl: 7.0,
    avgRatePre: 0,
  },
  {
    year: 2036,
    posFixado: 0,
    inflacao: 0,
    preFixado: 0,
    avgRatePos: 0,
    avgRateInfl: 0,
    avgRatePre: 0,
  },
  {
    year: 2037,
    posFixado: 0,
    inflacao: 55_000,
    preFixado: 0,
    avgRatePos: 0,
    avgRateInfl: 7.2,
    avgRatePre: 0,
  },
  {
    year: 2038,
    posFixado: 0,
    inflacao: 0,
    preFixado: 0,
    avgRatePos: 0,
    avgRateInfl: 0,
    avgRatePre: 0,
  },
  {
    year: 2039,
    posFixado: 0,
    inflacao: 0,
    preFixado: 0,
    avgRatePos: 0,
    avgRateInfl: 0,
    avgRatePre: 0,
  },
  {
    year: 2040,
    posFixado: 0,
    inflacao: 35_000,
    preFixado: 0,
    avgRatePos: 0,
    avgRateInfl: 7.5,
    avgRatePre: 0,
  },
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
  {
    name: "Exterior",
    idealPct: 14.0,
    actualPct: 10.0,
    status: "desbalanceado",
    pctForaIdeal: -28.6,
  },
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
  {
    name: "CDI - Liquidez",
    macroClass: "Renda Fixa",
    idealPct: 12.0,
    rangeMinus: 2.0,
    rangePlus: 3.0,
    minPct: 10.0,
    maxPct: 15.0,
    atualPct: 11.9,
  },
  {
    name: "CDI - Títulos",
    macroClass: "Renda Fixa",
    idealPct: 8.5,
    rangeMinus: 1.5,
    rangePlus: 2.0,
    minPct: 7.0,
    maxPct: 10.5,
    atualPct: 8.8,
  },
  {
    name: "CDI - Fundos",
    macroClass: "Renda Fixa",
    idealPct: 6.5,
    rangeMinus: 1.0,
    rangePlus: 1.5,
    minPct: 5.5,
    maxPct: 8.0,
    atualPct: 6.5,
  },
  {
    name: "Inflação - Títulos",
    macroClass: "Renda Fixa",
    idealPct: 10.0,
    rangeMinus: 2.0,
    rangePlus: 2.0,
    minPct: 8.0,
    maxPct: 12.0,
    atualPct: 10.8,
  },
  {
    name: "Inflação - Fundos",
    macroClass: "Renda Fixa",
    idealPct: 6.0,
    rangeMinus: 1.0,
    rangePlus: 1.5,
    minPct: 5.0,
    maxPct: 7.5,
    atualPct: 6.0,
  },
  {
    name: "Pré-Fixado",
    macroClass: "Renda Fixa",
    idealPct: 5.5,
    rangeMinus: 1.5,
    rangePlus: 1.0,
    minPct: 4.0,
    maxPct: 6.5,
    atualPct: 5.2,
  },
  {
    name: "Debêntures",
    macroClass: "Renda Fixa",
    idealPct: 3.5,
    rangeMinus: 0.5,
    rangePlus: 1.0,
    minPct: 3.0,
    maxPct: 4.5,
    atualPct: 3.5,
  },
  {
    name: "CRI / CRA",
    macroClass: "Renda Fixa",
    idealPct: 2.5,
    rangeMinus: 0.5,
    rangePlus: 0.5,
    minPct: 2.0,
    maxPct: 3.0,
    atualPct: 2.7,
  },
  {
    name: "Ações",
    macroClass: "Ações",
    idealPct: 8.5,
    rangeMinus: 2.0,
    rangePlus: 2.0,
    minPct: 6.5,
    maxPct: 10.5,
    atualPct: 7.4,
  },
  {
    name: "Long Biased",
    macroClass: "Ações",
    idealPct: 4.5,
    rangeMinus: 1.0,
    rangePlus: 1.0,
    minPct: 3.5,
    maxPct: 5.5,
    atualPct: 4.6,
  },
  {
    name: "Private Brasil",
    macroClass: "Ações",
    idealPct: 4.0,
    rangeMinus: 1.0,
    rangePlus: 1.0,
    minPct: 3.0,
    maxPct: 5.0,
    atualPct: 4.0,
  },
  {
    name: "Small Caps",
    macroClass: "Ações",
    idealPct: 2.5,
    rangeMinus: 0.5,
    rangePlus: 0.5,
    minPct: 2.0,
    maxPct: 3.0,
    atualPct: 2.1,
  },
  {
    name: "RF Exterior",
    macroClass: "Exterior",
    idealPct: 4.5,
    rangeMinus: 1.0,
    rangePlus: 1.0,
    minPct: 3.5,
    maxPct: 5.5,
    atualPct: 4.5,
  },
  {
    name: "Multimercado Ext.",
    macroClass: "Exterior",
    idealPct: 4.0,
    rangeMinus: 1.0,
    rangePlus: 1.0,
    minPct: 3.0,
    maxPct: 5.0,
    atualPct: 3.8,
  },
  {
    name: "Ações Exterior",
    macroClass: "Exterior",
    idealPct: 4.0,
    rangeMinus: 1.0,
    rangePlus: 1.5,
    minPct: 3.0,
    maxPct: 5.5,
    atualPct: 3.4,
  },
  {
    name: "Hedge Cambial",
    macroClass: "Exterior",
    idealPct: 1.5,
    rangeMinus: 0.5,
    rangePlus: 0.5,
    minPct: 1.0,
    maxPct: 2.0,
    atualPct: 1.5,
  },
  {
    name: "Imobiliário",
    macroClass: "Alternativo",
    idealPct: 4.5,
    rangeMinus: 1.0,
    rangePlus: 1.0,
    minPct: 3.5,
    maxPct: 5.5,
    atualPct: 4.6,
  },
  {
    name: "Private Equity",
    macroClass: "Alternativo",
    idealPct: 3.5,
    rangeMinus: 0.5,
    rangePlus: 1.0,
    minPct: 3.0,
    maxPct: 4.5,
    atualPct: 3.5,
  },
  {
    name: "Infraestrutura",
    macroClass: "Alternativo",
    idealPct: 2.5,
    rangeMinus: 0.5,
    rangePlus: 0.5,
    minPct: 2.0,
    maxPct: 3.0,
    atualPct: 2.4,
  },
  {
    name: "Agronegócio",
    macroClass: "Alternativo",
    idealPct: 1.5,
    rangeMinus: 0.3,
    rangePlus: 0.5,
    minPct: 1.2,
    maxPct: 2.0,
    atualPct: 1.4,
  },
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
  {
    type: "CDI / Pós Fixado",
    d0: 1_570_800,
    d1: 855_000,
    d30: 0,
    d90: 0,
    d180: 0,
    d360: 0,
    iliquido: 0,
  },
  {
    type: "Inflação",
    d0: 0,
    d1: 791_800,
    d30: 0,
    d90: 433_600,
    d180: 500_000,
    d360: 500_000,
    iliquido: 0,
  },
  {
    type: "Pré Fixado",
    d0: 0,
    d1: 0,
    d30: 140_000,
    d90: 0,
    d180: 320_250,
    d360: 235_000,
    iliquido: 0,
  },
  {
    type: "Debêntures / CRI / CRA",
    d0: 0,
    d1: 0,
    d30: 0,
    d90: 180_100,
    d180: 232_000,
    d360: 200_000,
    iliquido: 200_000,
  },
  {
    type: "Ações / Fundos Eq.",
    d0: 880_450,
    d1: 234_700,
    d30: 608_150,
    d90: 271_625,
    d180: 0,
    d360: 0,
    iliquido: 0,
  },
  {
    type: "Exterior",
    d0: 0,
    d1: 0,
    d30: 601_000,
    d90: 502_500,
    d180: 312_750,
    d360: 0,
    iliquido: 0,
  },
  {
    type: "Alternativo / PE / Infra",
    d0: 0,
    d1: 0,
    d30: 346_850,
    d90: 666_025,
    d180: 0,
    d360: 217_750,
    iliquido: 2_450_000,
  },
];

const INST_HEX: Record<string, string> = {
  XP: "#a1a1aa",
  BTG: "#93c5fd",
  Itaú: "#fdba74",
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
  {
    label: "Liquidez Mínima D+0/D+1",
    status: "ok",
    detail: `${(18.5 + 14.2).toFixed(1)}% > 30% mínimo`,
  },
  { label: "Perda Máxima", status: "ok", detail: "VaR 95% = -8.2% < -12% limite" },
  { label: "Retorno Alvo", status: "atencao", detail: "IPCA+5.4% vs meta IPCA+6%" },
  {
    label: "FGC por Instituição",
    status: "violado",
    detail: "Itaú R$ 268.500 acima do limite R$ 250.000",
  },
  { label: "Prazo Máximo RF", status: "ok", detail: "NTN-B 2040 dentro do tolerado" },
  {
    label: "Restrições de Ativos",
    status: "ok",
    detail: "Sem Cripto, COE sem capital, derivativos alav.",
  },
  {
    label: "Exposição Geográfica",
    status: "ok",
    detail: "Brasil 73%, EUA 12%, Europa 8%, Ásia 3%",
  },
  {
    label: "Concentração por Macro Classe",
    status: "violado",
    detail: "Ações 27.0% vs ideal 19.5% (+38.5%)",
  },
  { label: "Diversificação Plataformas", status: "ok", detail: "5 instituições ativas" },
];

function formatBRL(value: number): string {
  if (Math.abs(value) >= 1_000_000)
    return `R$ ${(value / 1_000_000).toFixed(2).replace(".", ",")}M`;
  if (Math.abs(value) >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`;
  return `R$ ${value.toFixed(0)}`;
}

function formatBRLFull(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function parseBRLInput(raw: string): number {
  const cleaned = String(raw)
    .replace(/[^\d.,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return parseFloat(cleaned) || 0;
}

function formatInputBRL(raw: string): string {
  const num = parseBRLInput(raw);
  if (num === 0) return "";
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(num);
}

const STATUS_STYLES: Record<
  BalanceStatus,
  { label: string; color: string; bg: string; border: string }
> = {
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
      {status === "ok" ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <AlertTriangle className="h-3 w-3" />
      )}
      {s.label}
    </span>
  );
}

function SugestaoCell({ value }: { value: number }) {
  if (value === 0)
    return (
      <span className="text-[#8c8c8c]">
        <Minus className="inline h-3 w-3" />
      </span>
    );
  const pos = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${pos ? "text-[#6ecf8e]" : "text-[#e05c5c]"}`}
    >
      {pos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {pos ? "+" : ""}
      {formatBRL(value)}
    </span>
  );
}

function InstitutionAvatar({
  colorKey,
  initials,
  size = "md",
}: {
  colorKey: string;
  initials: string;
  size?: "sm" | "md";
}) {
  const c = getInstitutionColor(colorKey);
  const sizeClass = size === "sm" ? "h-5 w-5" : "h-7 w-7";
  const textSize = size === "sm" ? "text-[8px]" : "text-[10px]";
  return (
    <span
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-md ${textSize} font-bold ${c.bg} ${c.text} ${c.border} border`}
    >
      {initials}
    </span>
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
          <svg
            width="28"
            height="28"
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="5" y="25" width="8" height="20" rx="2" fill="currentColor" />
            <rect x="18" y="15" width="8" height="30" rx="2" fill="currentColor" />
            <path
              d="M31 15H39V30C39 38 47 38 47 30"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
            />
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
                  <SidebarMenuButton
                    asChild
                    data-active={item.title === "Realocador"}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
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
            <Badge
              variant="outline"
              className="mt-1 h-4 border-orange-500/30 bg-orange-500/20 px-1.5 py-0 text-[10px] text-orange-400"
            >
              Alocador
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
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
  account: string;
  value: string;
}

const EMPTY_DRAFT: NewAssetDraft = {
  name: "",
  account: "",
  value: "",
  rate: "",
  maturity: "",
  liquidity: "",
};

interface MovementBreakdown {
  positiveEntries: number;
  negativeEntries: number;
  netMatrix: number;
  reallocationAmount: number;
  newMoneyAllocated: number;
  unallocatedBudget: number;
  implicitAporteResgate: number;
  scenario: "idle" | "pure-reallocation" | "pure-aporte" | "pure-resgate" | "mixed";
  isBalanced: boolean;
  entriesBySub: Record<string, { positive: number; negative: number }>;
}

function MovementSummaryPanel({
  breakdown,
  globalBudgetNum,
}: {
  breakdown: MovementBreakdown;
  globalBudgetNum: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    scenario,
    reallocationAmount,
    positiveEntries,
    negativeEntries,
    netMatrix,
    isBalanced,
    entriesBySub,
    unallocatedBudget,
    implicitAporteResgate,
  } = breakdown;

  if (scenario === "idle") return null;

  const hasMovement = positiveEntries > 0 || negativeEntries > 0;
  if (!hasMovement && globalBudgetNum === 0) return null;

  const subNameMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    for (const sub of cat.subs) {
      subNameMap[sub.id] = sub.name;
    }
  }

  const summaryParts: string[] = [];
  if (globalBudgetNum > 0) summaryParts.push(`Aporte R$ ${formatBRL(globalBudgetNum)}`);
  if (globalBudgetNum < 0) summaryParts.push(`Resgate R$ ${formatBRL(Math.abs(globalBudgetNum))}`);
  if (reallocationAmount > 0) summaryParts.push(`Realocacao R$ ${formatBRL(reallocationAmount)}`);

  const balanceLabel = isBalanced
    ? "Equilibrado"
    : scenario === "pure-reallocation"
      ? netMatrix > 0
        ? `R$ ${formatBRL(netMatrix)} sem origem`
        : `R$ ${formatBRL(Math.abs(netMatrix))} sem destino`
      : `R$ ${formatBRL(Math.abs(unallocatedBudget))} ${unallocatedBudget > 0 ? "restante" : "excedido"}`;
  const balanceColor = isBalanced ? "#6ecf8e" : "#dcb092";

  const creditEntries: { label: string; value: number }[] = [];
  const debitEntries: { label: string; value: number }[] = [];

  if (globalBudgetNum > 0) {
    creditEntries.push({ label: "Aporte (dinheiro novo)", value: globalBudgetNum });
  }
  if (globalBudgetNum < 0) {
    debitEntries.push({ label: "Resgate (saida de caixa)", value: Math.abs(globalBudgetNum) });
  }

  for (const [subId, vals] of Object.entries(entriesBySub)) {
    const name = subNameMap[subId] || subId;
    if (vals.positive > 0) creditEntries.push({ label: name, value: vals.positive });
    if (vals.negative > 0) debitEntries.push({ label: name, value: vals.negative });
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#1e1e1e] bg-gradient-to-b from-[#151515] to-[#131313] transition-all duration-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-xs transition-colors hover:bg-[#1a1a1a]"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-[#555]" />
          ) : (
            <ChevronRight className="h-3 w-3 text-[#555]" />
          )}
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#555]">
            Movimentacoes
          </span>
          <div className="flex items-center gap-2">
            {summaryParts.length > 0 ? (
              summaryParts.map((part, i) => {
                const color = part.startsWith("Aporte")
                  ? "text-[#6ecf8e]"
                  : part.startsWith("Resgate")
                    ? "text-[#e05c5c]"
                    : "text-[#6db1d4]";
                return (
                  <span key={i} className={`text-[11px] font-medium ${color}`}>
                    {i > 0 && <span className="mr-2 text-[#333]">+</span>}
                    {part}
                  </span>
                );
              })
            ) : (
              <span className="text-[11px] text-[#444]">Sem movimentacoes</span>
            )}
          </div>
        </div>
        <span
          style={{ color: balanceColor }}
          className="inline-flex items-center gap-1 text-[11px] font-medium"
        >
          {isBalanced ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
          {balanceLabel}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-[#1e1e1e] px-4 py-3">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#6ecf8e]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#6ecf8e]" />
                Entradas
              </div>
              {creditEntries.length === 0 ? (
                <div className="text-[11px] text-[#444]">Nenhuma entrada</div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {creditEntries.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded px-1.5 py-0.5 text-[11px] transition-colors hover:bg-[#1a1a1a]"
                    >
                      <span className="text-[#888]">{e.label}</span>
                      <span className="font-medium tabular-nums text-[#6ecf8e]">
                        +{formatBRL(e.value)}
                      </span>
                    </div>
                  ))}
                  <div className="mt-1 flex items-center justify-between border-t border-dashed border-[#2a2a2a] px-1.5 pt-2 text-[11px]">
                    <span className="font-medium text-[#bbb]">Total entradas</span>
                    <span className="font-semibold tabular-nums text-[#6ecf8e]">
                      +{formatBRL(creditEntries.reduce((s, e) => s + e.value, 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#e05c5c]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#e05c5c]" />
                Saidas
              </div>
              {debitEntries.length === 0 ? (
                <div className="text-[11px] text-[#444]">Nenhuma saida</div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {debitEntries.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded px-1.5 py-0.5 text-[11px] transition-colors hover:bg-[#1a1a1a]"
                    >
                      <span className="text-[#888]">{e.label}</span>
                      <span className="font-medium tabular-nums text-[#e05c5c]">
                        -{formatBRL(e.value)}
                      </span>
                    </div>
                  ))}
                  <div className="mt-1 flex items-center justify-between border-t border-dashed border-[#2a2a2a] px-1.5 pt-2 text-[11px]">
                    <span className="font-medium text-[#bbb]">Total saidas</span>
                    <span className="font-semibold tabular-nums text-[#e05c5c]">
                      -{formatBRL(debitEntries.reduce((s, e) => s + e.value, 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-1.5 border-t border-[#1e1e1e] pt-3">
            {globalBudgetNum !== 0 && (
              <div className="flex items-center justify-between px-1.5 text-[11px]">
                <span className="text-[#888]">
                  Dinheiro novo ({globalBudgetNum > 0 ? "aporte" : "resgate"})
                </span>
                <span
                  className={
                    globalBudgetNum > 0
                      ? "font-medium tabular-nums text-[#6ecf8e]"
                      : "font-medium tabular-nums text-[#e05c5c]"
                  }
                >
                  {globalBudgetNum > 0 ? "+" : "-"}R$ {formatBRL(Math.abs(globalBudgetNum))}
                </span>
              </div>
            )}
            {reallocationAmount > 0 && (
              <div className="flex items-center justify-between px-1.5 text-[11px]">
                <span className="text-[#888]">Realocacao interna</span>
                <span className="font-medium tabular-nums text-[#6db1d4]">
                  R$ {formatBRL(reallocationAmount)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between rounded bg-[#1a1a1a] px-1.5 py-1 text-[11px]">
              <span className="font-medium text-[#bbb]">Saldo</span>
              <span
                style={{ color: balanceColor }}
                className="inline-flex items-center gap-1 font-semibold"
              >
                {isBalanced ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {balanceLabel}
              </span>
            </div>
            {scenario === "pure-reallocation" && !isBalanced && (
              <div className="mt-2 rounded-md border border-dashed border-[rgba(220,176,146,0.3)] bg-[rgba(220,176,146,0.04)] px-3 py-2 text-[11px] text-[#dcb092]">
                {netMatrix > 0
                  ? "Voce esta alocando dinheiro que nao tem origem. Defina um aporte no campo acima ou venda ativos equivalentes."
                  : "Voce esta vendendo mais do que comprando. Aloque o saldo em outros ativos ou defina um resgate no campo acima."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MatrixTable({
  allocatorValues,
  onAllocatorChange,
  assetAllocValues,
  onAssetAllocChange,
  expandedAccounts,
  allAccounts,
  onToggleInstitution,
  pendingChanges,
  onAddChange,
  onRemoveChange,
  globalBudgetNum,
  totalAllocated,
  movementBreakdown: mb,
  disableCOE,
  disableFGTS,
}: {
  allocatorValues: Record<string, Record<string, string>>;
  onAllocatorChange: (subId: string, inst: string, val: string) => void;
  assetAllocValues: Record<string, Record<string, string>>;
  onAssetAllocChange: (assetId: string, inst: string, val: string) => void;
  expandedAccounts: Account[];
  allAccounts: Account[];
  onToggleInstitution: (name: string) => void;
  pendingChanges: PendingChange[];
  onAddChange: (change: PendingChange) => void;
  onRemoveChange: (assetId: string) => void;
  globalBudgetNum: number;
  totalAllocated: number;
  movementBreakdown: MovementBreakdown;
  disableCOE: boolean;
  disableFGTS: boolean;
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
    setNewAssetDraft({ ...EMPTY_DRAFT, account: allAccounts[0]?.name || "" });
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
      account: newAssetDraft.account || allAccounts[0]?.name || "",
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

  const newAssetRowRef = useRef<HTMLTableRowElement>(null);
  const confirmNewAssetRef = useRef(confirmNewAsset);
  confirmNewAssetRef.current = confirmNewAsset;

  const cancelNewAssetRef = useRef(cancelNewAsset);
  cancelNewAssetRef.current = cancelNewAsset;
  const newAssetDraftRef = useRef(newAssetDraft);
  newAssetDraftRef.current = newAssetDraft;

  const handleNewAssetRowBlur = useCallback(
    (subId: string) => (e: React.FocusEvent) => {
      const row = newAssetRowRef.current;
      if (!row) return;
      const next = e.relatedTarget as Node | null;
      if (next && row.contains(next)) return;
      setTimeout(() => {
        if (newAssetRowRef.current && !newAssetRowRef.current.contains(document.activeElement)) {
          if (newAssetDraftRef.current.name.trim()) {
            confirmNewAssetRef.current(subId);
          } else {
            cancelNewAssetRef.current();
          }
        }
      }, 0);
    },
    [],
  );

  const removeAsset = (asset: Asset, subId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddChange({
      type: "remocao",
      assetId: asset.id,
      assetName: asset.name,
      subId,
      institution: asset.account,
      value: asset.value,
    });
  };

  const resgateAsset = (asset: Asset, subId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddChange({
      type: "resgate",
      assetId: asset.id,
      assetName: asset.name,
      subId,
      institution: asset.account,
      value: asset.value,
    });
  };

  const addedAssetsForSub = (subId: string) =>
    pendingChanges.filter((c) => c.type === "adicao" && c.subId === subId);

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
          byAccount: allAccounts.reduce(
            (instAcc, inst) => ({
              ...instAcc,
              [inst.name]: (instAcc[inst.name] || 0) + (sub.byAccount[inst.name] || 0),
            }),
            acc.byAccount,
          ),
        }),
        {
          alocIdeal: 0,
          alocAtual: 0,
          sugestao: 0,
          pctPL: 0,
          byAccount: {} as Record<string, number>,
        },
      );
      return { catId: cat.id, ...total };
    });
  }, [allAccounts]);

  const grandTotals = useMemo(() => {
    return categoryTotals.reduce(
      (acc, ct) => ({
        alocIdeal: acc.alocIdeal + ct.alocIdeal,
        alocAtual: acc.alocAtual + ct.alocAtual,
        sugestao: acc.sugestao + ct.sugestao,
        pctPL: acc.pctPL + ct.pctPL,
        byAccount: allAccounts.reduce(
          (instAcc, inst) => ({
            ...instAcc,
            [inst.name]: (instAcc[inst.name] || 0) + (ct.byAccount[inst.name] || 0),
          }),
          acc.byAccount,
        ),
      }),
      {
        alocIdeal: 0,
        alocAtual: 0,
        sugestao: 0,
        pctPL: 0,
        byAccount: {} as Record<string, number>,
      },
    );
  }, [categoryTotals, allAccounts]);

  const effectiveDelta = globalBudgetNum !== 0 ? globalBudgetNum : totalAllocated;
  const idealScale = globalBudgetNum !== 0 ? (TOTAL_AUM + globalBudgetNum) / TOTAL_AUM : 1;
  const newAUM = TOTAL_AUM + (globalBudgetNum !== 0 ? globalBudgetNum : totalAllocated);

  const expandedSet = useMemo(
    () => new Set(expandedAccounts.map((i) => i.name)),
    [expandedAccounts],
  );

  const hasExpanded = expandedAccounts.length > 0;

  const allocatorTotals = useMemo(() => {
    const byInst: Record<string, number> = {};
    for (const [, instMap] of Object.entries(allocatorValues)) {
      for (const [instName, val] of Object.entries(instMap)) {
        const num = parseBRLInput(val);
        byInst[instName] = (byInst[instName] || 0) + num;
      }
    }
    return byInst;
  }, [allocatorValues]);

  const allocatorBySub = useMemo(() => {
    const bySub: Record<string, number> = {};
    for (const [subId, instMap] of Object.entries(allocatorValues)) {
      for (const val of Object.values(instMap)) {
        const num = parseBRLInput(val);
        bySub[subId] = (bySub[subId] || 0) + num;
      }
    }
    return bySub;
  }, [allocatorValues]);

  const allocatorBySubByInst = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    for (const [subId, instMap] of Object.entries(allocatorValues)) {
      result[subId] = {};
      for (const [instName, val] of Object.entries(instMap)) {
        result[subId][instName] = parseBRLInput(val);
      }
    }
    return result;
  }, [allocatorValues]);

  const assetAllocBySub = useMemo(() => {
    const bySub: Record<string, number> = {};
    const assetToSub: Record<string, string> = {};
    for (const cat of CATEGORIES) {
      for (const sub of cat.subs) {
        for (const asset of sub.assets) {
          assetToSub[asset.id] = sub.id;
        }
      }
    }
    for (const [assetId, instMap] of Object.entries(assetAllocValues)) {
      const subId = assetToSub[assetId];
      if (!subId) continue;
      for (const val of Object.values(instMap)) {
        const num = parseBRLInput(val);
        bySub[subId] = (bySub[subId] || 0) + num;
      }
    }
    for (const c of pendingChanges) {
      if (c.type === "adicao" && c.value) {
        bySub[c.subId] = (bySub[c.subId] || 0) + c.value;
      }
    }
    return bySub;
  }, [assetAllocValues, pendingChanges]);

  const assetAllocBySubByInst = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    const assetToSub: Record<string, string> = {};
    for (const cat of CATEGORIES) {
      for (const sub of cat.subs) {
        for (const asset of sub.assets) {
          assetToSub[asset.id] = sub.id;
        }
      }
    }
    for (const [assetId, instMap] of Object.entries(assetAllocValues)) {
      const subId = assetToSub[assetId];
      if (!subId) continue;
      if (!result[subId]) result[subId] = {};
      for (const [instName, val] of Object.entries(instMap)) {
        const num = parseBRLInput(val);
        result[subId][instName] = (result[subId][instName] || 0) + num;
      }
    }
    return result;
  }, [assetAllocValues]);

  return (
    <div className="rounded-md border border-[#2a2a2a]" data-testid="matrix-table-container">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="bg-[#1a1a1a]">
            <tr className="border-b border-[#2a2a2a]">
              <th
                rowSpan={hasExpanded ? 2 : 1}
                className="sticky left-0 z-20 min-w-[200px] bg-[#1a1a1a] px-4 py-2.5 text-left font-medium text-[#8c8c8c]"
              >
                Classificação
              </th>
              <th
                rowSpan={hasExpanded ? 2 : 1}
                className="sticky left-[200px] z-20 whitespace-nowrap bg-[#1a1a1a] px-2 py-2.5 text-center font-medium text-[#8c8c8c]"
              >
                % P.L.
              </th>
              <th
                rowSpan={hasExpanded ? 2 : 1}
                className="sticky left-[252px] z-20 whitespace-nowrap bg-[#1a1a1a] px-2 py-2.5 text-center font-medium text-[#8c8c8c]"
              >
                Status
              </th>
              <th
                rowSpan={hasExpanded ? 2 : 1}
                className="sticky left-[340px] z-20 whitespace-nowrap bg-[#1a1a1a] px-2 py-2.5 text-center font-medium text-[#8c8c8c]"
              >
                % Fora
              </th>
              <th
                rowSpan={hasExpanded ? 2 : 1}
                className="sticky left-[392px] z-20 whitespace-nowrap bg-[#1a1a1a] px-2 py-2.5 text-center font-medium text-[#8c8c8c]"
              >
                Ideal
              </th>
              <th
                rowSpan={hasExpanded ? 2 : 1}
                className="sticky left-[452px] z-20 whitespace-nowrap bg-[#1a1a1a] px-2 py-2.5 text-center font-medium text-[#8c8c8c]"
              >
                Atual
              </th>
              <th
                rowSpan={hasExpanded ? 2 : 1}
                className="sticky left-[512px] z-20 whitespace-nowrap bg-[#1a1a1a] px-2 py-2.5 pr-4 text-center font-medium text-[#8c8c8c]"
              >
                Sugestão
              </th>
              {allAccounts.map((inst, idx) => {
                const c = getInstitutionColor(inst.colorKey);
                const isExp = expandedSet.has(inst.name);
                const hexColor = INST_HEX[inst.colorKey] || "#888";
                const isFirst = idx === 0;
                if (isExp) {
                  return (
                    <th
                      key={inst.name}
                      colSpan={2}
                      className={`relative px-2 py-2 text-center ${isFirst ? "border-l-2 border-[#3a3a3a]" : "border-l border-[#2a2a2a]"}`}
                    >
                      <div
                        className="absolute inset-x-0 top-0 h-[2px]"
                        style={{ backgroundColor: hexColor }}
                      />
                      <div className="flex justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleInstitution(inst.name);
                          }}
                          className="group inline-flex items-center gap-2 whitespace-nowrap"
                          data-testid={`header-inst-${inst.name}`}
                        >
                          <InstitutionAvatar colorKey={inst.colorKey} initials={inst.initials} />
                          <span className="text-[11px] font-bold text-[#ededed]">{inst.name}</span>
                          <X className="h-3 w-3 text-[#555] opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                      </div>
                    </th>
                  );
                }
                return (
                  <th
                    key={inst.name}
                    rowSpan={hasExpanded ? 2 : 1}
                    className={`w-12 min-w-[48px] cursor-pointer px-1 py-2 text-center transition-colors hover:bg-[#1e1e1e] ${isFirst ? "border-l-2 border-[#3a3a3a]" : "border-l border-[#2a2a2a]"}`}
                    onClick={() => onToggleInstitution(inst.name)}
                    title={`Expandir ${inst.name}`}
                    data-testid={`toggle-institution-${inst.name}`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <InstitutionAvatar colorKey={inst.colorKey} initials={inst.initials} />
                      <span className="max-w-[44px] overflow-hidden text-ellipsis whitespace-nowrap text-[8px] leading-tight text-[#555]">
                        {inst.name}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
            {hasExpanded && (
              <tr className="border-b border-[#2a2a2a]">
                {allAccounts.map((inst, idx) => {
                  if (!expandedSet.has(inst.name)) return null;
                  const isFirst = idx === 0;
                  return (
                    <Fragment key={`${inst.name}-sub`}>
                      <th
                        className={`w-[90px] whitespace-nowrap px-2 py-1 text-center text-[9px] font-normal text-[#555] ${isFirst ? "border-l-2 border-[#3a3a3a]" : "border-l border-[#2a2a2a]"}`}
                      >
                        $ Atual
                      </th>
                      <th className="w-[90px] whitespace-nowrap px-2 py-1 text-center text-[9px] font-medium text-[#6db1d4]/60">
                        Alocar
                      </th>
                    </Fragment>
                  );
                })}
              </tr>
            )}
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
                    className="hover-elevate cursor-pointer border-b border-[#2a2a2a] bg-[#161616]"
                    onClick={() => toggleCategory(cat.id)}
                    data-testid={`category-row-${cat.id}`}
                  >
                    <td className="sticky left-0 z-10 bg-[#161616] px-4 py-2">
                      <div className="flex items-center gap-2">
                        {isCollapsed ? (
                          <ChevronRight className="h-3.5 w-3.5 text-[#8c8c8c]" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-[#8c8c8c]" />
                        )}
                        <span className="font-semibold text-[#ededed]">{cat.name}</span>
                        <span className="text-[10px] text-[#555]">({cat.subs.length})</span>
                      </div>
                    </td>
                    <td className="sticky left-[200px] z-10 bg-[#161616] px-2 py-2 text-center font-medium">
                      {(() => {
                        const catProjPctPL = cat.subs.reduce((sum, s) => {
                          const sa = allocatorBySub[s.id] || 0;
                          const aa = assetAllocBySub[s.id] || 0;
                          const eff = Math.max(sa, aa);
                          return (
                            sum + (newAUM > 0 ? ((s.alocAtual + eff) / newAUM) * 100 : s.pctPL)
                          );
                        }, 0);
                        const changed = effectiveDelta !== 0 || catProjPctPL !== ct.pctPL;
                        return changed ? (
                          <span
                            className={
                              catProjPctPL > ct.pctPL
                                ? "text-[#6ecf8e]"
                                : catProjPctPL < ct.pctPL
                                  ? "text-[#dcb092]"
                                  : "text-[#ededed]"
                            }
                          >
                            {catProjPctPL.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-[#ededed]">{ct.pctPL.toFixed(1)}%</span>
                        );
                      })()}
                    </td>
                    <td className="sticky left-[252px] z-10 bg-[#161616] px-2 py-2 text-center">
                      <StatusBadge status={worstStatus} />
                    </td>
                    <td className="sticky left-[340px] z-10 bg-[#161616] px-2 py-2 text-center text-[#555]">
                      —
                    </td>
                    <td className="sticky left-[392px] z-10 bg-[#161616] px-2 py-2 text-center font-medium">
                      <div className="flex flex-col items-center">
                        <span className="text-[#ededed]">
                          {formatBRL(idealScale !== 1 ? ct.alocIdeal * idealScale : ct.alocIdeal)}
                        </span>
                        {idealScale !== 1 && (
                          <span className="text-[9px] font-normal text-[#555]">
                            era {formatBRL(ct.alocIdeal)}
                          </span>
                        )}
                      </div>
                    </td>
                    {(() => {
                      const catAlloc = cat.subs.reduce((sum, sub) => {
                        const sa = allocatorBySub[sub.id] || 0;
                        const aa = assetAllocBySub[sub.id] || 0;
                        return sum + Math.max(sa, aa);
                      }, 0);
                      const projectedAtual = ct.alocAtual + catAlloc;
                      const catSugestao = cat.subs.reduce((s, sub) => {
                        const sa = allocatorBySub[sub.id] || 0;
                        const aa = assetAllocBySub[sub.id] || 0;
                        const eff = Math.max(sa, aa);
                        const projected = sub.alocAtual + eff;
                        const projIdeal = sub.alocIdeal * idealScale;
                        return s + (projIdeal - projected);
                      }, 0);
                      return (
                        <>
                          <td className="sticky left-[452px] z-10 bg-[#161616] px-2 py-2 text-center">
                            <div className="flex flex-col items-center">
                              {catAlloc !== 0 ? (
                                <>
                                  <span
                                    className={`font-medium ${catAlloc > 0 ? "text-[#6ecf8e]" : "text-[#e05c5c]"}`}
                                  >
                                    {formatBRL(projectedAtual)}
                                  </span>
                                  <span className="text-[9px] text-[#555]">
                                    {catAlloc > 0 ? "+" : ""}
                                    {formatBRL(catAlloc)}
                                  </span>
                                </>
                              ) : (
                                <span className="font-medium text-[#ededed]">
                                  {formatBRL(ct.alocAtual)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="sticky left-[512px] z-10 bg-[#161616] px-2 py-2 pr-4 text-center">
                            <SugestaoCell value={catSugestao} />
                          </td>
                        </>
                      );
                    })()}
                    {allAccounts.map((inst, idx) => {
                      const isExp = expandedSet.has(inst.name);
                      const isFirst = idx === 0;
                      const borderCls = isFirst
                        ? "border-l-2 border-[#3a3a3a]"
                        : "border-l border-[#2a2a2a]";
                      if (isExp) {
                        return (
                          <Fragment key={`${cat.id}-${inst.name}`}>
                            {(() => {
                              const catInstAlloc = cat.subs.reduce((sum, sub) => {
                                const subAlloc = allocatorBySubByInst[sub.id]?.[inst.name] || 0;
                                const assetAlloc = assetAllocBySubByInst[sub.id]?.[inst.name] || 0;
                                return sum + Math.max(subAlloc, assetAlloc);
                              }, 0);
                              return (
                                <td
                                  className={`${borderCls} w-[90px] px-2 py-2 text-center font-medium ${catInstAlloc !== 0 ? (catInstAlloc > 0 ? "text-[#6ecf8e]" : "text-[#e05c5c]") : "text-[#bbb]"}`}
                                >
                                  {formatBRL((ct.byAccount[inst.name] || 0) + catInstAlloc)}
                                </td>
                              );
                            })()}
                            <td className="w-[90px] px-2 py-2 text-center text-[#444]">—</td>
                          </Fragment>
                        );
                      }
                      return (() => {
                        const catInstAlloc = cat.subs.reduce((sum, sub) => {
                          const subAlloc = allocatorBySubByInst[sub.id]?.[inst.name] || 0;
                          const assetAlloc = assetAllocBySubByInst[sub.id]?.[inst.name] || 0;
                          return sum + Math.max(subAlloc, assetAlloc);
                        }, 0);
                        return (
                          <td
                            key={`${cat.id}-${inst.name}`}
                            className={`${borderCls} whitespace-nowrap px-1 py-2 text-center text-[10px] font-medium ${catInstAlloc !== 0 ? (catInstAlloc > 0 ? "text-[#6ecf8e]" : "text-[#e05c5c]") : "text-[#666]"}`}
                          >
                            {formatBRL((ct.byAccount[inst.name] || 0) + catInstAlloc)}
                          </td>
                        );
                      })();
                    })}
                  </tr>

                  {!isCollapsed &&
                    cat.subs.map((sub) => {
                      const isSubExpanded = expandedSubs[sub.id] ?? false;
                      const filteredAssets = sub.assets;
                      const isSubDisabled = disableCOE && sub.id === "coe";
                      return (
                        <Fragment key={sub.id}>
                          <tr
                            className={`group/sub cursor-pointer border-b border-[#1e1e1e] transition-colors hover:bg-[#161616]/50 ${isSubDisabled ? "pointer-events-none opacity-30" : ""}`}
                            onClick={(e) => toggleSub(sub.id, e)}
                            data-testid={`sub-row-${sub.id}`}
                          >
                            <td className="sticky left-0 z-[5] bg-[#141414] px-4 py-2 pl-6">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => startAddingAsset(sub.id, e)}
                                  className="invisible rounded p-0.5 text-[#444] transition-colors hover:text-[#6ecf8e] group-hover/sub:visible"
                                  title="Adicionar ativo"
                                  data-testid={`button-add-asset-${sub.id}`}
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                                {isSubExpanded ? (
                                  <ChevronDown className="h-3 w-3 text-[#555]" />
                                ) : (
                                  <ChevronRight className="h-3 w-3 text-[#555]" />
                                )}
                                <span className="text-[#bbb]">{sub.name}</span>
                                <span className="text-[10px] text-[#444]">
                                  ({filteredAssets.length})
                                </span>
                              </div>
                            </td>
                            {(() => {
                              const subAlloc = allocatorBySub[sub.id] || 0;
                              const assetAlloc = assetAllocBySub[sub.id] || 0;
                              const effectiveSubAlloc = Math.max(subAlloc, assetAlloc);
                              const projected = sub.alocAtual + effectiveSubAlloc;
                              const projIdeal = sub.alocIdeal * idealScale;
                              const projPctPL = newAUM > 0 ? (projected / newAUM) * 100 : sub.pctPL;
                              const pctChanged = effectiveDelta !== 0 || effectiveSubAlloc !== 0;
                              const newPctFora =
                                projIdeal > 0
                                  ? Math.abs(((projected - projIdeal) / projIdeal) * 100)
                                  : sub.pctForaIdeal;
                              const sugDisplay = projIdeal - projected;
                              const pctForaDisplay =
                                effectiveSubAlloc !== 0
                                  ? newPctFora
                                  : idealScale !== 1
                                    ? Math.abs(((sub.alocAtual - projIdeal) / projIdeal) * 100)
                                    : sub.pctForaIdeal;
                              return (
                                <>
                                  <td className="sticky left-[200px] z-[5] bg-[#141414] px-2 py-2 text-center">
                                    {pctChanged ? (
                                      <span
                                        className={
                                          projPctPL > sub.pctPL
                                            ? "text-[#6ecf8e]"
                                            : projPctPL < sub.pctPL
                                              ? "text-[#dcb092]"
                                              : "text-[#bbb]"
                                        }
                                      >
                                        {projPctPL.toFixed(1)}%
                                      </span>
                                    ) : (
                                      <span className="text-[#bbb]">{sub.pctPL.toFixed(1)}%</span>
                                    )}
                                  </td>
                                  <td className="sticky left-[252px] z-[5] bg-[#141414] px-2 py-2 text-center">
                                    <StatusBadge status={sub.status} />
                                  </td>
                                  <td className="sticky left-[340px] z-[5] bg-[#141414] px-2 py-2 text-center">
                                    <span
                                      className={
                                        pctForaDisplay > 10
                                          ? "text-[#e05c5c]"
                                          : pctForaDisplay > 3
                                            ? "text-[#dcb092]"
                                            : "text-[#8c8c8c]"
                                      }
                                    >
                                      {pctForaDisplay.toFixed(1)}%
                                    </span>
                                  </td>
                                  <td className="sticky left-[392px] z-[5] bg-[#141414] px-2 py-2 text-center">
                                    <div className="flex flex-col items-center">
                                      <span className="text-[#bbb]">
                                        {formatBRL(
                                          idealScale !== 1
                                            ? sub.alocIdeal * idealScale
                                            : sub.alocIdeal,
                                        )}
                                      </span>
                                      {idealScale !== 1 && (
                                        <span className="text-[9px] text-[#555]">
                                          era {formatBRL(sub.alocIdeal)}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="sticky left-[452px] z-[5] bg-[#141414] px-2 py-2 text-center">
                                    <div className="flex flex-col items-center">
                                      {effectiveSubAlloc !== 0 ? (
                                        <>
                                          <span
                                            className={`font-medium ${effectiveSubAlloc > 0 ? "text-[#6ecf8e]" : "text-[#e05c5c]"}`}
                                          >
                                            {formatBRL(projected)}
                                          </span>
                                          <span className="text-[9px] text-[#555]">
                                            {effectiveSubAlloc > 0 ? "+" : ""}
                                            {formatBRL(effectiveSubAlloc)}
                                          </span>
                                        </>
                                      ) : (
                                        <span className="text-[#bbb]">
                                          {formatBRL(sub.alocAtual)}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="sticky left-[512px] z-[5] bg-[#141414] px-2 py-2 pr-4 text-center">
                                    <SugestaoCell value={sugDisplay} />
                                  </td>
                                </>
                              );
                            })()}
                            {allAccounts.map((inst, idx) => {
                              const isExp = expandedSet.has(inst.name);
                              const isFirst = idx === 0;
                              const borderCls = isFirst
                                ? "border-l-2 border-[#3a3a3a]"
                                : "border-l border-[#2a2a2a]";
                              if (isExp) {
                                const rawVal = allocatorValues[sub.id]?.[inst.name] ?? "";
                                const numVal = parseBRLInput(rawVal);
                                const valColor =
                                  numVal > 0
                                    ? "text-[#6ecf8e]"
                                    : numVal < 0
                                      ? "text-[#e05c5c]"
                                      : "text-[#ededed]";
                                const assetAllocInst =
                                  assetAllocBySubByInst[sub.id]?.[inst.name] || 0;
                                const effectiveInst = Math.max(numVal, assetAllocInst);
                                return (
                                  <Fragment key={`${sub.id}-${inst.name}`}>
                                    <td
                                      className={`${borderCls} w-[90px] px-2 py-2 text-center ${effectiveInst !== 0 ? (effectiveInst > 0 ? "text-[#6ecf8e]" : "text-[#e05c5c]") : "text-[#888]"}`}
                                    >
                                      {formatBRL((sub.byAccount[inst.name] || 0) + effectiveInst)}
                                    </td>
                                    <td className="w-[90px] px-0.5 py-0.5">
                                      <input
                                        type="text"
                                        placeholder="—"
                                        value={rawVal}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          onAllocatorChange(sub.id, inst.name, e.target.value);
                                        }}
                                        onBlur={() => {
                                          const formatted = formatInputBRL(rawVal);
                                          if (formatted !== rawVal)
                                            onAllocatorChange(sub.id, inst.name, formatted);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`mx-auto block w-20 rounded border ${rawVal ? "border-[#333] bg-[#111]" : "border-dashed border-[#2a2a2a] bg-[#0d0d0d]"} px-1 py-0.5 text-center text-[10px] font-medium ${valColor} outline-none transition-all placeholder:text-[#333] hover:border-[#444] hover:bg-[#151515] focus:border-[#6db1d4] focus:bg-[#111] focus:ring-1 focus:ring-[#6db1d4]/20`}
                                        data-testid={`input-allocator-${sub.id}-${inst.name}`}
                                      />
                                    </td>
                                  </Fragment>
                                );
                              }
                              return (() => {
                                const allocVal = allocatorBySubByInst[sub.id]?.[inst.name] || 0;
                                const assetAllocInst =
                                  assetAllocBySubByInst[sub.id]?.[inst.name] || 0;
                                const effectiveVal = Math.max(allocVal, assetAllocInst);
                                return (
                                  <td
                                    key={`${sub.id}-${inst.name}`}
                                    className={`${borderCls} whitespace-nowrap px-1 py-1.5 text-center text-[10px] ${effectiveVal !== 0 ? (effectiveVal > 0 ? "text-[#6ecf8e]" : "text-[#e05c5c]") : "text-[#555]"}`}
                                  >
                                    {formatBRL((sub.byAccount[inst.name] || 0) + effectiveVal)}
                                  </td>
                                );
                              })();
                            })}
                          </tr>

                          {isSubExpanded && (allocatorBySub[sub.id] || 0) !== 0 && (
                            <tr className="border-b border-[#1e1e1e] bg-[#0f1311]">
                              <td colSpan={7} className="px-4 py-1.5 pl-6">
                                {(() => {
                                  const subTotal = allocatorBySub[sub.id] || 0;
                                  const distributed = assetAllocBySub[sub.id] || 0;
                                  const pct =
                                    subTotal !== 0
                                      ? Math.min(Math.abs(distributed / subTotal) * 100, 100)
                                      : 0;
                                  const remaining = subTotal - distributed;
                                  const isComplete = Math.abs(remaining) < 1;
                                  return (
                                    <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-medium text-[#888]">
                                        Alocar:{" "}
                                        <span
                                          className={
                                            subTotal > 0 ? "text-[#6ecf8e]" : "text-[#e05c5c]"
                                          }
                                        >
                                          {formatBRL(subTotal)}
                                        </span>
                                      </span>
                                      <div
                                        className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#222]"
                                        style={{ maxWidth: 120 }}
                                      >
                                        <div
                                          className={`h-full rounded-full transition-all ${isComplete ? "bg-[#6ecf8e]" : "bg-[#6db1d4]"}`}
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                      <span className="text-[10px] text-[#666]">
                                        {pct.toFixed(0)}%
                                      </span>
                                      {isComplete ? (
                                        <span className="flex items-center gap-1 text-[10px] font-medium text-[#6ecf8e]">
                                          <CheckCircle className="h-3 w-3" /> Distribuído
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1 text-[10px] font-medium text-[#dcb092]">
                                          <AlertTriangle className="h-3 w-3" />{" "}
                                          {formatBRL(remaining)} pendente
                                        </span>
                                      )}
                                    </div>
                                  );
                                })()}
                              </td>
                              {allAccounts.map((inst, idx) => {
                                const isExp = expandedSet.has(inst.name);
                                const isFirst = idx === 0;
                                const borderCls = isFirst
                                  ? "border-l-2 border-[#3a3a3a]"
                                  : "border-l border-[#1a1a1a]";
                                if (isExp)
                                  return (
                                    <Fragment key={`dist-${inst.name}`}>
                                      <td className={borderCls} />
                                      <td />
                                    </Fragment>
                                  );
                                return <td key={`dist-${inst.name}`} className={borderCls} />;
                              })}
                            </tr>
                          )}

                          {isSubExpanded && (
                            <>
                              <tr className="border-b border-[#1e1e1e] bg-[#111]">
                                <td className="py-1 pl-10 pr-4 text-[10px] font-medium text-[#555]">
                                  Ativo
                                </td>
                                <td className="px-2 py-1 text-center text-[10px] font-medium text-[#555]">
                                  % Sub
                                </td>
                                <td className="px-2 py-1 text-center text-[10px] font-medium text-[#555]">
                                  Taxa
                                </td>
                                <td className="px-2 py-1 text-center text-[10px] font-medium text-[#555]">
                                  Venc.
                                </td>
                                <td className="px-2 py-1 text-center text-[10px] font-medium text-[#555]">
                                  Liquidez
                                </td>
                                <td className="px-2 py-1 text-center text-[10px] font-medium text-[#555]">
                                  Valor
                                </td>
                                <td className="px-2 py-1 text-center text-[10px] font-medium text-[#555]">
                                  Inst.
                                </td>
                                {allAccounts.map((inst, idx) => {
                                  const isExp = expandedSet.has(inst.name);
                                  const isFirst = idx === 0;
                                  const borderCls = isFirst
                                    ? "border-l-2 border-[#3a3a3a]"
                                    : "border-l border-[#1a1a1a]";
                                  if (isExp) {
                                    return (
                                      <Fragment key={`hdr-asset-${inst.name}`}>
                                        <td className={borderCls} />
                                        <td />
                                      </Fragment>
                                    );
                                  }
                                  return (
                                    <td key={`hdr-asset-${inst.name}`} className={borderCls} />
                                  );
                                })}
                              </tr>
                              {filteredAssets
                                .filter(
                                  (a) =>
                                    !pendingIds.has(a.id) || pendingMap[a.id]?.type !== "remocao",
                                )
                                .map((asset) => {
                                  const instObj = allAccounts.find(
                                    (vi) => vi.name === asset.account,
                                  );
                                  const instColor = instObj
                                    ? getInstitutionColor(instObj.colorKey)
                                    : null;
                                  const assetInstIdx = allAccounts.findIndex(
                                    (vi) => vi.name === asset.account,
                                  );
                                  const pending = pendingMap[asset.id];
                                  const isAssetDisabled =
                                    (disableFGTS && asset.isFGTS) || isSubDisabled;
                                  return (
                                    <tr
                                      key={asset.id}
                                      className={`group border-b border-[#1a1a1a] ${pending ? "bg-[#151515]" : "bg-[#131313]"} ${isAssetDisabled && !isSubDisabled ? "pointer-events-none opacity-30" : ""}`}
                                      data-testid={`asset-row-${asset.id}`}
                                    >
                                      <td className="py-1.5 pl-10 pr-4">
                                        <div className="flex items-center gap-2">
                                          <div className="relative flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center">
                                            {pending && (
                                              <Clock className="h-3.5 w-3.5 text-[#dcb092]" />
                                            )}
                                          </div>
                                          <span
                                            className={`text-[11px] ${pending ? "text-[#666] line-through" : "text-[#999]"}`}
                                          >
                                            {asset.name}
                                          </span>
                                          {asset.isFGTS && (
                                            <span className="rounded bg-[rgba(220,176,146,0.15)] px-1 py-px text-[8px] font-semibold text-[#dcb092]">
                                              FGTS
                                            </span>
                                          )}
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
                                              <span
                                                className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${pending.type === "resgate" ? "bg-[rgba(220,176,146,0.12)] text-[#dcb092]" : "bg-[rgba(224,92,92,0.12)] text-[#e05c5c]"}`}
                                              >
                                                {pending.type === "resgate" ? "Resgate" : "Remoção"}
                                              </span>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  onRemoveChange(asset.id);
                                                }}
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
                                      <td className="px-2 py-1.5 text-center text-[10px] text-[#666]">
                                        {asset.pctSub.toFixed(1)}%
                                      </td>
                                      <td className="px-2 py-1.5 text-center text-[10px] text-[#888]">
                                        {asset.rate || "—"}
                                      </td>
                                      <td className="px-2 py-1.5 text-center text-[10px] text-[#888]">
                                        {asset.maturity || "—"}
                                      </td>
                                      <td className="px-2 py-1.5 text-center">
                                        <span
                                          className={`text-[10px] ${asset.liquidity === "Ilíquido" ? "text-[#e05c5c]" : asset.liquidity === "D+0" || asset.liquidity === "D+1" ? "text-[#6db1d4]" : "text-[#888]"}`}
                                        >
                                          {asset.liquidity || "—"}
                                        </span>
                                      </td>
                                      <td className="px-2 py-1.5 text-center text-[10px] text-[#888]">
                                        {formatBRL(asset.value)}
                                      </td>
                                      <td className="px-2 py-1.5 text-center">
                                        {instColor && (
                                          <span
                                            className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-medium ${instColor.bg} ${instColor.text}`}
                                          >
                                            {asset.account}
                                          </span>
                                        )}
                                      </td>
                                      {allAccounts.map((inst, idx) => {
                                        const isExp = expandedSet.has(inst.name);
                                        const isFirst = idx === 0;
                                        const borderCls = isFirst
                                          ? "border-l-2 border-[#3a3a3a]"
                                          : "border-l border-[#1a1a1a]";
                                        if (isExp) {
                                          const assetRawVal =
                                            assetAllocValues[asset.id]?.[inst.name] ?? "";
                                          const assetNumVal = parseBRLInput(assetRawVal);
                                          const assetValColor =
                                            assetNumVal > 0
                                              ? "text-[#6ecf8e]"
                                              : assetNumVal < 0
                                                ? "text-[#e05c5c]"
                                                : "text-[#ededed]";
                                          return (
                                            <Fragment key={`${asset.id}-${inst.name}`}>
                                              <td
                                                className={`${borderCls} w-[90px] px-2 py-1.5 text-center text-[10px] ${idx === assetInstIdx ? (assetNumVal !== 0 ? (assetNumVal > 0 ? "text-[#6ecf8e]" : "text-[#e05c5c]") : "text-[#999]") : "text-transparent"}`}
                                              >
                                                {idx === assetInstIdx
                                                  ? formatBRL(asset.value + assetNumVal)
                                                  : ""}
                                              </td>
                                              <td className="w-[90px] px-0.5 py-0.5">
                                                <input
                                                  type="text"
                                                  placeholder="—"
                                                  value={assetRawVal}
                                                  onChange={(e) => {
                                                    e.stopPropagation();
                                                    onAssetAllocChange(
                                                      asset.id,
                                                      inst.name,
                                                      e.target.value,
                                                    );
                                                  }}
                                                  onBlur={() => {
                                                    const formatted = formatInputBRL(assetRawVal);
                                                    if (formatted !== assetRawVal)
                                                      onAssetAllocChange(
                                                        asset.id,
                                                        inst.name,
                                                        formatted,
                                                      );
                                                  }}
                                                  onClick={(e) => e.stopPropagation()}
                                                  className={`mx-auto block w-20 rounded border ${assetRawVal ? "border-[#333] bg-[#111]" : "border-dashed border-[#2a2a2a] bg-[#0d0d0d]"} px-1 py-0.5 text-center text-[10px] font-medium ${assetValColor} outline-none transition-all placeholder:text-[#333] hover:border-[#444] hover:bg-[#151515] focus:border-[#6db1d4] focus:bg-[#111] focus:ring-1 focus:ring-[#6db1d4]/20`}
                                                  data-testid={`input-asset-alloc-${asset.id}-${inst.name}`}
                                                />
                                              </td>
                                            </Fragment>
                                          );
                                        }
                                        return (() => {
                                          const assetAllocVal = parseBRLInput(
                                            assetAllocValues[asset.id]?.[inst.name] ?? "",
                                          );
                                          return (
                                            <td
                                              key={`${asset.id}-${inst.name}`}
                                              className={`${borderCls} whitespace-nowrap px-1 py-1.5 text-center text-[10px] ${idx === assetInstIdx ? (assetAllocVal !== 0 ? (assetAllocVal > 0 ? "text-[#6ecf8e]" : "text-[#e05c5c]") : "text-[#666]") : "text-transparent"}`}
                                            >
                                              {idx === assetInstIdx
                                                ? formatBRL(asset.value + assetAllocVal)
                                                : ""}
                                            </td>
                                          );
                                        })();
                                      })}
                                    </tr>
                                  );
                                })}

                              {addedAssetsForSub(sub.id).map((added) => {
                                const addedInstObj = allAccounts.find(
                                  (vi) => vi.name === added.institution,
                                );
                                const addedInstColor = addedInstObj
                                  ? getInstitutionColor(addedInstObj.colorKey)
                                  : null;
                                const addedInstIdx = allAccounts.findIndex(
                                  (vi) => vi.name === added.institution,
                                );
                                return (
                                  <tr
                                    key={added.assetId}
                                    className="border-b border-[#1a1a1a] bg-[#0e1210]"
                                    data-testid={`added-asset-row-${added.assetId}`}
                                  >
                                    <td className="py-1.5 pl-10 pr-4">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 flex-shrink-0 text-[#dcb092]" />
                                        <span className="text-[11px] text-[#6ecf8e]">
                                          {added.assetName}
                                        </span>
                                        <span className="rounded bg-[rgba(110,207,142,0.12)] px-1.5 py-0.5 text-[9px] font-medium text-[#6ecf8e]">
                                          Adição
                                        </span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveChange(added.assetId);
                                          }}
                                          className="rounded p-0.5 text-[#555] transition-colors hover:text-[#999]"
                                          title="Desfazer"
                                          data-testid={`button-undo-${added.assetId}`}
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </td>
                                    <td className="px-2 py-1.5 text-center text-[10px] text-[#555]">
                                      —
                                    </td>
                                    <td className="px-2 py-1.5 text-center text-[10px] text-[#6ecf8e]/60">
                                      {added.rate || "—"}
                                    </td>
                                    <td className="px-2 py-1.5 text-center text-[10px] text-[#6ecf8e]/60">
                                      {added.maturity || "—"}
                                    </td>
                                    <td className="px-2 py-1.5 text-center text-[10px] text-[#6ecf8e]/60">
                                      {added.liquidity || "—"}
                                    </td>
                                    <td className="px-2 py-1.5 text-center text-[10px] text-[#6ecf8e]/60">
                                      {added.value ? formatBRL(added.value) : "—"}
                                    </td>
                                    <td className="px-2 py-1.5 text-center">
                                      {addedInstColor && (
                                        <span
                                          className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-medium ${addedInstColor.bg} ${addedInstColor.text}`}
                                        >
                                          {added.institution}
                                        </span>
                                      )}
                                    </td>
                                    {allAccounts.map((inst, idx) => {
                                      const isExp = expandedSet.has(inst.name);
                                      const isFirst = idx === 0;
                                      const borderCls = isFirst
                                        ? "border-l-2 border-[#3a3a3a]"
                                        : "border-l border-[#1a1a1a]";
                                      if (isExp) {
                                        return (
                                          <Fragment key={`${added.assetId}-${inst.name}`}>
                                            <td
                                              className={`${borderCls} w-[90px] px-2 py-1.5 text-center text-[10px] text-transparent`}
                                            >
                                              {""}
                                            </td>
                                            <td className="w-[90px] px-1 py-0.5 text-center text-[10px]">
                                              {idx === addedInstIdx && added.value ? (
                                                <span className="font-medium text-[#6ecf8e]">
                                                  {formatBRL(added.value)}
                                                </span>
                                              ) : null}
                                            </td>
                                          </Fragment>
                                        );
                                      }
                                      return (
                                        <td
                                          key={`${added.assetId}-${inst.name}`}
                                          className={`${borderCls} whitespace-nowrap px-1 py-1.5 text-center text-[10px] ${idx === addedInstIdx ? "text-[#6ecf8e]/60" : "text-transparent"}`}
                                        >
                                          {idx === addedInstIdx && added.value
                                            ? formatBRL(added.value)
                                            : ""}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}

                              {addingToSub === sub.id && (
                                <tr
                                  ref={newAssetRowRef}
                                  className="border-b border-[#1a1a1a] bg-[#0e1210]"
                                  data-testid={`new-asset-row-${sub.id}`}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      confirmNewAsset(sub.id);
                                    }
                                    if (e.key === "Escape") {
                                      e.preventDefault();
                                      cancelNewAsset();
                                    }
                                  }}
                                  onBlur={handleNewAssetRowBlur(sub.id)}
                                >
                                  <td className="py-1.5 pl-10 pr-4">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3.5 w-3.5 flex-shrink-0 text-[#dcb092]" />
                                      <input
                                        type="text"
                                        placeholder="Nome do ativo"
                                        value={newAssetDraft.name}
                                        onChange={(e) =>
                                          setNewAssetDraft((d) => ({ ...d, name: e.target.value }))
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                        className="w-full bg-transparent text-[11px] text-[#6ecf8e] outline-none placeholder:text-[#444] focus:border-b focus:border-[#6ecf8e]/40"
                                        data-testid={`input-new-asset-name-${sub.id}`}
                                      />
                                      <span className="rounded bg-[rgba(110,207,142,0.12)] px-1.5 py-0.5 text-[9px] font-medium text-[#6ecf8e]">
                                        Adição
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-2 py-1.5 text-center text-[10px] text-[#555]">
                                    —
                                  </td>
                                  <td className="px-2 py-1.5">
                                    <input
                                      type="text"
                                      placeholder="—"
                                      value={newAssetDraft.rate}
                                      onChange={(e) =>
                                        setNewAssetDraft((d) => ({ ...d, rate: e.target.value }))
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full bg-transparent text-center text-[10px] text-[#6ecf8e]/60 outline-none placeholder:text-[#333] focus:border-b focus:border-[#6ecf8e]/40"
                                      data-testid={`input-new-asset-rate-${sub.id}`}
                                    />
                                  </td>
                                  <td className="px-2 py-1.5">
                                    <input
                                      type="text"
                                      placeholder="—"
                                      value={newAssetDraft.maturity}
                                      onChange={(e) =>
                                        setNewAssetDraft((d) => ({
                                          ...d,
                                          maturity: e.target.value,
                                        }))
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full bg-transparent text-center text-[10px] text-[#6ecf8e]/60 outline-none placeholder:text-[#333] focus:border-b focus:border-[#6ecf8e]/40"
                                      data-testid={`input-new-asset-maturity-${sub.id}`}
                                    />
                                  </td>
                                  <td className="px-2 py-1.5">
                                    <input
                                      type="text"
                                      placeholder="—"
                                      value={newAssetDraft.liquidity}
                                      onChange={(e) =>
                                        setNewAssetDraft((d) => ({
                                          ...d,
                                          liquidity: e.target.value,
                                        }))
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full bg-transparent text-center text-[10px] text-[#6ecf8e]/60 outline-none placeholder:text-[#333] focus:border-b focus:border-[#6ecf8e]/40"
                                      data-testid={`input-new-asset-liquidity-${sub.id}`}
                                    />
                                  </td>
                                  <td className="px-2 py-1.5">
                                    <input
                                      type="text"
                                      placeholder="R$ 0"
                                      value={newAssetDraft.value}
                                      onChange={(e) =>
                                        setNewAssetDraft((d) => ({ ...d, value: e.target.value }))
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full bg-transparent text-right text-[10px] text-[#6ecf8e]/60 outline-none placeholder:text-[#333] focus:border-b focus:border-[#6ecf8e]/40"
                                      data-testid={`input-new-asset-value-${sub.id}`}
                                    />
                                  </td>
                                  <td className="px-2 py-1.5">
                                    <div className="flex items-center gap-1">
                                      <select
                                        value={newAssetDraft.account}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          setNewAssetDraft((d) => ({
                                            ...d,
                                            institution: e.target.value,
                                          }));
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full bg-transparent text-[10px] text-[#6ecf8e]/60 outline-none"
                                        data-testid={`select-new-asset-inst-${sub.id}`}
                                      >
                                        {allAccounts.map((inst) => (
                                          <option
                                            key={inst.name}
                                            value={inst.name}
                                            className="bg-[#1a1a1a]"
                                          >
                                            {inst.name}
                                          </option>
                                        ))}
                                      </select>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          confirmNewAsset(sub.id);
                                        }}
                                        className="flex-shrink-0 rounded p-0.5 text-[#6ecf8e] transition-colors hover:text-[#8fffaa]"
                                        title="Confirmar"
                                        data-testid={`button-confirm-new-${sub.id}`}
                                      >
                                        <Check className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          cancelNewAsset();
                                        }}
                                        className="flex-shrink-0 rounded p-0.5 text-[#555] transition-colors hover:text-[#e05c5c]"
                                        title="Cancelar"
                                        data-testid={`button-cancel-new-${sub.id}`}
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </td>
                                  {allAccounts.map((inst, idx) => {
                                    const isExp = expandedSet.has(inst.name);
                                    const isFirst = idx === 0;
                                    const borderCls = isFirst
                                      ? "border-l-2 border-[#3a3a3a]"
                                      : "border-l border-[#1a1a1a]";
                                    if (isExp) {
                                      return (
                                        <Fragment key={`new-${inst.name}`}>
                                          <td
                                            className={`${borderCls} w-[90px] px-2 py-1.5 text-center text-[10px] text-transparent`}
                                          />
                                          <td className="w-[90px]" />
                                        </Fragment>
                                      );
                                    }
                                    return (
                                      <td key={`new-${inst.name}`} className={`${borderCls}`} />
                                    );
                                  })}
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
              <td className="sticky left-0 z-10 bg-[#1a1a1a] px-4 py-2.5 font-semibold text-[#ededed]">
                Total
              </td>
              <td className="sticky left-[200px] z-10 bg-[#1a1a1a] px-2 py-2.5 text-center font-semibold">
                {(() => {
                  const totalProjPctPL = CATEGORIES.reduce(
                    (catSum, cat) =>
                      catSum +
                      cat.subs.reduce((subSum, s) => {
                        const sa = allocatorBySub[s.id] || 0;
                        const aa = assetAllocBySub[s.id] || 0;
                        const eff = Math.max(sa, aa);
                        return (
                          subSum + (newAUM > 0 ? ((s.alocAtual + eff) / newAUM) * 100 : s.pctPL)
                        );
                      }, 0),
                    0,
                  );
                  const changed = effectiveDelta !== 0;
                  return changed ? (
                    <span className={totalProjPctPL < 100 ? "text-[#dcb092]" : "text-[#ededed]"}>
                      {totalProjPctPL.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-[#ededed]">{grandTotals.pctPL.toFixed(1)}%</span>
                  );
                })()}
              </td>
              <td className="sticky left-[252px] z-10 bg-[#1a1a1a]" />
              <td className="sticky left-[340px] z-10 bg-[#1a1a1a]" />
              <td className="sticky left-[392px] z-10 bg-[#1a1a1a] px-2 py-2.5 text-center font-semibold">
                <div className="flex flex-col items-center">
                  <span className="text-[#ededed]">
                    {formatBRLFull(
                      idealScale !== 1 ? grandTotals.alocIdeal * idealScale : grandTotals.alocIdeal,
                    )}
                  </span>
                  {idealScale !== 1 && (
                    <span className="text-[9px] font-normal text-[#555]">
                      era {formatBRLFull(grandTotals.alocIdeal)}
                    </span>
                  )}
                </div>
              </td>
              {(() => {
                const totalAlloc = CATEGORIES.reduce(
                  (sum, cat) =>
                    sum +
                    cat.subs.reduce((s, sub) => {
                      const sa = allocatorBySub[sub.id] || 0;
                      const aa = assetAllocBySub[sub.id] || 0;
                      return s + Math.max(sa, aa);
                    }, 0),
                  0,
                );
                const projectedAtual = grandTotals.alocAtual + totalAlloc;
                const grandSugestao = CATEGORIES.reduce(
                  (sum, cat) =>
                    sum +
                    cat.subs.reduce((s, sub) => {
                      const sa = allocatorBySub[sub.id] || 0;
                      const aa = assetAllocBySub[sub.id] || 0;
                      const eff = Math.max(sa, aa);
                      const projected = sub.alocAtual + eff;
                      const projIdeal = sub.alocIdeal * idealScale;
                      return s + (projIdeal - projected);
                    }, 0),
                  0,
                );
                return (
                  <>
                    <td className="sticky left-[452px] z-10 bg-[#1a1a1a] px-2 py-2.5 text-center">
                      <div className="flex flex-col items-center">
                        {totalAlloc !== 0 ? (
                          <>
                            <span
                              className={`font-semibold ${totalAlloc > 0 ? "text-[#6ecf8e]" : "text-[#e05c5c]"}`}
                            >
                              {formatBRLFull(projectedAtual)}
                            </span>
                            <span className="text-[9px] text-[#555]">
                              {totalAlloc > 0 ? "+" : ""}
                              {formatBRL(totalAlloc)}
                            </span>
                            {mb.scenario !== "idle" && mb.reallocationAmount > 0 && (
                              <span className="text-[8px] text-[#6db1d4]">
                                {formatBRL(mb.reallocationAmount)} realoc.
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="font-semibold text-[#ededed]">
                            {formatBRLFull(grandTotals.alocAtual)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="sticky left-[512px] z-10 bg-[#1a1a1a] px-2 py-2.5 pr-4 text-center">
                      <SugestaoCell value={grandSugestao} />
                    </td>
                  </>
                );
              })()}
              {allAccounts.map((inst, idx) => {
                const isExp = expandedSet.has(inst.name);
                const isFirst = idx === 0;
                const borderCls = isFirst
                  ? "border-l-2 border-[#3a3a3a]"
                  : "border-l border-[#2a2a2a]";
                const currentTotal = grandTotals.byAccount[inst.name] || 0;
                if (isExp) {
                  const effectiveTotal = CATEGORIES.reduce((catSum, cat) => {
                    return (
                      catSum +
                      cat.subs.reduce((subSum, sub) => {
                        const subAlloc = allocatorBySubByInst[sub.id]?.[inst.name] || 0;
                        const assetAlloc = assetAllocBySubByInst[sub.id]?.[inst.name] || 0;
                        return subSum + Math.max(subAlloc, assetAlloc);
                      }, 0)
                    );
                  }, 0);
                  return (
                    <Fragment key={`total-${inst.name}`}>
                      <td
                        className={`${borderCls} w-[90px] px-2 py-2.5 text-center font-semibold text-[#ededed]`}
                      >
                        <div className="flex flex-col items-center">
                          <span>{formatBRL(currentTotal + effectiveTotal)}</span>
                          {effectiveTotal !== 0 && (
                            <span
                              className={`text-[9px] font-medium ${effectiveTotal > 0 ? "text-[#6ecf8e]" : "text-[#e05c5c]"}`}
                            >
                              {effectiveTotal > 0 ? "+" : ""}
                              {formatBRL(effectiveTotal)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="w-[90px] px-2 py-1.5 text-center">
                        <div className="flex flex-col items-center">
                          {effectiveTotal !== 0 ? (
                            <span className="text-xs font-semibold text-[#ededed]">
                              {formatBRL(effectiveTotal)}
                            </span>
                          ) : (
                            <span className="text-xs text-[#555]">—</span>
                          )}
                        </div>
                      </td>
                    </Fragment>
                  );
                }
                return (() => {
                  const effectiveTotal = CATEGORIES.reduce((catSum, cat) => {
                    return (
                      catSum +
                      cat.subs.reduce((subSum, sub) => {
                        const subAlloc = allocatorBySubByInst[sub.id]?.[inst.name] || 0;
                        const assetAlloc = assetAllocBySubByInst[sub.id]?.[inst.name] || 0;
                        return subSum + Math.max(subAlloc, assetAlloc);
                      }, 0)
                    );
                  }, 0);
                  return (
                    <td
                      key={`total-${inst.name}`}
                      className={`${borderCls} whitespace-nowrap px-1 py-2.5 text-center text-[10px] font-medium ${effectiveTotal !== 0 ? (effectiveTotal > 0 ? "text-[#6ecf8e]" : "text-[#e05c5c]") : "text-[#888]"}`}
                    >
                      {formatBRL(currentTotal + effectiveTotal)}
                    </td>
                  );
                })();
              })}
            </tr>
          </tfoot>
        </table>
      </div>
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
              <span className="absolute -top-4 right-0 text-[10px] font-medium text-[#e05c5c]">
                R$ 250k
              </span>
            </div>

            <div className="flex h-full items-end justify-around gap-3 px-2">
              {FGC_DATA.map((fgc) => {
                const barPct = (fgc.covered / maxVal) * 100;
                const overLimit = fgc.covered > limitVal;
                const overPct = overLimit ? ((fgc.covered - limitVal) / maxVal) * 100 : 0;

                return (
                  <div
                    key={fgc.institution}
                    className="relative flex flex-1 flex-col items-center justify-end"
                    style={{ height: `${barPct}%` }}
                    data-testid={`fgc-bar-${fgc.institution}`}
                  >
                    <span className="absolute -top-5 text-[10px] font-medium text-[#ccc]">
                      {formatBRLFull(fgc.covered)}
                    </span>
                    <div
                      className="relative flex h-full w-full max-w-[52px] flex-col items-stretch"
                      style={{ minHeight: "8px" }}
                    >
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
    () => new Set<StrategyType>(["posFixado", "inflacao", "preFixado"]),
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
          {(
            Object.entries(strategyLabels) as [StrategyType, { label: string; color: string }][]
          ).map(([key, { label, color }]) => (
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
              if (activeStrategies.has("posFixado") && d.posFixado > 0)
                segments.push({ key: "posFixado", val: d.posFixado, color: "#6db1d4" });
              if (activeStrategies.has("inflacao") && d.inflacao > 0)
                segments.push({ key: "inflacao", val: d.inflacao, color: "#dcb092" });
              if (activeStrategies.has("preFixado") && d.preFixado > 0)
                segments.push({ key: "preFixado", val: d.preFixado, color: "#a5b4fc" });
              const total = segments.reduce((sum, s) => sum + s.val, 0);
              const barPct = (total / maxBarVal) * 100;

              const avgRate =
                segments.length > 0
                  ? segments.reduce((sum, s) => {
                      const rate =
                        s.key === "posFixado"
                          ? d.avgRatePos
                          : s.key === "inflacao"
                            ? d.avgRateInfl
                            : d.avgRatePre;
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
                  <div
                    className="flex w-full max-w-[40px] flex-col items-stretch"
                    style={{ height: `${barPct}%`, minHeight: total > 0 ? "4px" : "0" }}
                  >
                    {segments.map((seg, i) => (
                      <div
                        key={seg.key}
                        className="w-full"
                        style={{
                          height: `${(seg.val / total) * 100}%`,
                          backgroundColor: seg.color,
                          opacity: 0.8,
                          borderRadius:
                            i === 0 && segments.length === 1
                              ? "2px"
                              : i === 0
                                ? "2px 2px 0 0"
                                : i === segments.length - 1
                                  ? "0 0 2px 2px"
                                  : "0",
                        }}
                      />
                    ))}
                  </div>
                  {hoveredYear === d.year && total > 0 && (
                    <div className="absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-[#3a3a3a] bg-[#1a1a1a] px-3 py-2 shadow-lg">
                      <p className="mb-1 text-[10px] font-semibold text-[#ededed]">{d.year}</p>
                      {segments.map((seg) => {
                        const rate =
                          seg.key === "posFixado"
                            ? d.avgRatePos
                            : seg.key === "inflacao"
                              ? d.avgRateInfl
                              : d.avgRatePre;
                        return (
                          <div key={seg.key} className="flex items-center gap-2 text-[10px]">
                            <div
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: seg.color }}
                            />
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
      {
        name: "Multimercado",
        idealPct: 4.0,
        actualPct: sumPctPL(getSubs("ext").filter((s) => s.id === "ext-mm")),
      },
      {
        name: "Imobiliário",
        idealPct: 4.5,
        actualPct: sumPctPL(altSubs.filter((s) => s.id === "imob")),
      },
      {
        name: "Ações",
        idealPct: 19.5,
        actualPct: sumPctPL([...getSubs("eq-br"), ...altRemainder]),
      },
      {
        name: "Exterior",
        idealPct: 14.0,
        actualPct: sumPctPL(getSubs("ext").filter((s) => s.id !== "ext-mm")),
      },
    ];

    return macroMap.map(({ name, idealPct, actualPct }) => {
      const diff = actualPct - idealPct;
      const pctFora = idealPct > 0 ? (diff / idealPct) * 100 : 0;
      const status: BalanceStatus =
        Math.abs(pctFora) <= 3 ? "ok" : Math.abs(pctFora) <= 8 ? "atencao" : "desbalanceado";
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
              <th className="min-w-[160px] px-4 py-2.5 text-left font-medium text-[#8c8c8c]">
                Classificação
              </th>
              <th className="w-20 px-3 py-2.5 text-right font-medium text-[#8c8c8c]">Ideal %</th>
              <th className="w-20 px-3 py-2.5 text-right font-medium text-[#8c8c8c]">Atual %</th>
              <th className="w-24 px-3 py-2.5 text-center font-medium text-[#8c8c8c]">Status</th>
              <th className="w-20 px-3 py-2.5 text-right font-medium text-[#8c8c8c]">% Fora</th>
              <th className="min-w-[180px] px-3 py-2.5 text-left font-medium text-[#8c8c8c]">
                Distribuição
              </th>
            </tr>
          </thead>
          <tbody>
            {macroData.map((mc) => {
              const barWidth = Math.min((mc.actualPct / 60) * 100, 100);
              const idealWidth = Math.min((mc.idealPct / 60) * 100, 100);
              return (
                <tr
                  key={mc.name}
                  className="border-b border-[#1e1e1e]"
                  data-testid={`macro-row-${mc.name}`}
                >
                  <td className="px-4 py-2.5 font-medium text-[#ededed]">{mc.name}</td>
                  <td className="px-3 py-2.5 text-right text-[#8c8c8c]">
                    {mc.idealPct.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium text-[#ededed]">
                    {mc.actualPct.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <StatusBadge status={mc.status} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span
                      className={
                        Math.abs(mc.pctForaIdeal) <= 3
                          ? "text-[#6ecf8e]"
                          : Math.abs(mc.pctForaIdeal) <= 8
                            ? "text-[#dcb092]"
                            : "text-[#e05c5c]"
                      }
                    >
                      {mc.pctForaIdeal > 0 ? "+" : ""}
                      {mc.pctForaIdeal.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="relative h-3 w-full rounded-sm bg-[#2a2a2a]">
                      <div
                        className="absolute left-0 top-0 h-full rounded-sm"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor:
                            mc.status === "ok"
                              ? "#6ecf8e"
                              : mc.status === "atencao"
                                ? "#dcb092"
                                : "#e05c5c",
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
              <th className="min-w-[160px] px-4 py-2.5 text-left font-medium text-[#8c8c8c]">
                Sub-Classificação
              </th>
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
                  <td
                    colSpan={8}
                    className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#666]"
                  >
                    {macro}
                  </td>
                </tr>
                {subs.map((sc) => {
                  const inRange = sc.atualPct >= sc.minPct && sc.atualPct <= sc.maxPct;
                  const status: BalanceStatus = inRange
                    ? "ok"
                    : Math.abs(sc.atualPct - sc.idealPct) > sc.rangePlus * 1.5 ||
                        Math.abs(sc.atualPct - sc.idealPct) > sc.rangeMinus * 1.5
                      ? "desbalanceado"
                      : "atencao";
                  const cellBg = inRange
                    ? "bg-[rgba(110,207,142,0.06)]"
                    : "bg-[rgba(224,92,92,0.06)]";
                  return (
                    <tr
                      key={sc.name}
                      className="border-b border-[#1e1e1e]"
                      data-testid={`subclass-row-${sc.name}`}
                    >
                      <td className="px-4 py-2 pl-6 text-[#bbb]">{sc.name}</td>
                      <td className="px-2 py-2 text-right text-[#8c8c8c]">
                        {sc.idealPct.toFixed(1)}%
                      </td>
                      <td className="px-2 py-2 text-right text-[#666]">
                        -{sc.rangeMinus.toFixed(1)}%
                      </td>
                      <td className="px-2 py-2 text-right text-[#666]">
                        +{sc.rangePlus.toFixed(1)}%
                      </td>
                      <td className="px-2 py-2 text-right text-[#666]">{sc.minPct.toFixed(1)}%</td>
                      <td className="px-2 py-2 text-right text-[#666]">{sc.maxPct.toFixed(1)}%</td>
                      <td
                        className={`px-2 py-2 text-right font-medium ${cellBg} ${inRange ? "text-[#6ecf8e]" : "text-[#e05c5c]"}`}
                      >
                        {sc.atualPct.toFixed(1)}%
                      </td>
                      <td className="px-2 py-2 text-center">
                        <StatusBadge status={status} />
                      </td>
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
            <span className="text-xs font-medium text-[#8c8c8c]">
              Perfil de Liquidez — % do P.L.
            </span>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${meetsPolicy ? "border-[rgba(110,207,142,0.25)] bg-[rgba(110,207,142,0.1)] text-[#6ecf8e]" : "border-[rgba(224,92,92,0.25)] bg-[rgba(224,92,92,0.1)] text-[#e05c5c]"}`}
              >
                {meetsPolicy ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                D+0/D+1: {cumulativeD0D1.toFixed(1)}% {meetsPolicy ? ">" : "<"}{" "}
                {LIQUIDITY_POLICY_MIN}%
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {LIQUIDITY_DATA.map((bucket) => {
              const barWidth = (bucket.pctPL / maxPct) * 100;
              const isShortTerm = bucket.label === "D+0" || bucket.label === "D+1";
              return (
                <div
                  key={bucket.label}
                  className="flex items-center gap-3"
                  data-testid={`liquidity-bar-${bucket.label}`}
                >
                  <span
                    className={`w-14 text-right text-xs font-medium ${isShortTerm ? "text-[#6db1d4]" : "text-[#8c8c8c]"}`}
                  >
                    {bucket.label}
                  </span>
                  <div className="relative flex-1">
                    <div className="h-5 w-full rounded-sm bg-[#2a2a2a]">
                      <div
                        className="h-full rounded-sm transition-all"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: isShortTerm
                            ? "#6db1d4"
                            : bucket.label === "Ilíquido"
                              ? "#e05c5c"
                              : "#dcb092",
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-right text-xs font-medium text-[#ededed]">
                    {bucket.pctPL.toFixed(1)}%
                  </span>
                  <span className="w-20 text-right text-[11px] text-[#666]">
                    {formatBRL(bucket.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-md border border-[#2a2a2a] bg-[#161616] p-5">
          <span className="mb-3 block text-xs font-medium text-[#8c8c8c]">Resumo de Liquidez</span>
          <div className="flex flex-col gap-3">
            <div className="rounded-md border border-[#2a2a2a] bg-[#1a1a1a] p-3">
              <span className="text-[10px] uppercase tracking-wider text-[#666]">
                Disponível em até D+1
              </span>
              <p className="mt-1 text-lg font-bold text-[#6db1d4]">
                {formatBRLFull(LIQUIDITY_DATA[0].value + LIQUIDITY_DATA[1].value)}
              </p>
              <p className="text-[11px] text-[#8c8c8c]">{cumulativeD0D1.toFixed(1)}% do P.L.</p>
            </div>
            <div className="rounded-md border border-[#2a2a2a] bg-[#1a1a1a] p-3">
              <span className="text-[10px] uppercase tracking-wider text-[#666]">Ilíquido</span>
              <p className="mt-1 text-lg font-bold text-[#e05c5c]">
                {formatBRLFull(LIQUIDITY_DATA[LIQUIDITY_DATA.length - 1].value)}
              </p>
              <p className="text-[11px] text-[#8c8c8c]">
                {LIQUIDITY_DATA[LIQUIDITY_DATA.length - 1].pctPL.toFixed(1)}% do P.L.
              </p>
            </div>
            <div className="rounded-md border border-[#2a2a2a] bg-[#1a1a1a] p-3">
              <span className="text-[10px] uppercase tracking-wider text-[#666]">
                Política Mínima
              </span>
              <p className="mt-1 text-sm font-semibold text-[#ededed]">
                {LIQUIDITY_POLICY_MIN}% em D+0/D+1
              </p>
              <div
                className={`mt-1 flex items-center gap-1 text-[11px] ${meetsPolicy ? "text-[#6ecf8e]" : "text-[#e05c5c]"}`}
              >
                {meetsPolicy ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {meetsPolicy ? "Dentro da política" : "Abaixo da política"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-md border border-[#2a2a2a]">
        <div className="border-b border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2.5 text-xs font-medium text-[#8c8c8c]">
          Breakdown por Tipo de Ativo
        </div>
        <table className="w-full border-collapse text-xs">
          <thead className="bg-[#1a1a1a]">
            <tr className="border-b border-[#2a2a2a]">
              <th className="min-w-[140px] px-4 py-2 text-left font-medium text-[#8c8c8c]">
                Tipo de Ativo
              </th>
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
              const total =
                assetRow.d0 +
                assetRow.d1 +
                assetRow.d30 +
                assetRow.d90 +
                assetRow.d180 +
                assetRow.d360 +
                assetRow.iliquido;
              const vals = [
                assetRow.d0,
                assetRow.d1,
                assetRow.d30,
                assetRow.d90,
                assetRow.d180,
                assetRow.d360,
                assetRow.iliquido,
              ];
              return (
                <tr
                  key={assetRow.type}
                  className="border-b border-[#1e1e1e]"
                  data-testid={`liquidity-asset-${assetRow.type}`}
                >
                  <td className="px-4 py-2 text-[#bbb]">{assetRow.type}</td>
                  {vals.map((v, i) => (
                    <td
                      key={i}
                      className={`px-2 py-2 text-right ${v > 0 ? "text-[#ccc]" : "text-[#333]"}`}
                    >
                      {v > 0 ? formatBRL(v) : "—"}
                    </td>
                  ))}
                  <td className="px-2 py-2 text-right font-medium text-[#ededed]">
                    {formatBRL(total)}
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

function PolicySection() {
  const row = "flex items-baseline justify-between gap-2 border-b border-[#1e1e1e] py-2";
  const lbl = "text-xs text-[#8c8c8c]";
  const val = "text-xs text-[#ccc]";

  const complianceIcon = (status: "ok" | "atencao" | "violado") => {
    if (status === "ok") return <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#6ecf8e]" />;
    if (status === "atencao")
      return <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#dcb092]" />;
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
          <span className="mb-3 block text-[11px] font-semibold uppercase tracking-wider text-[#666]">
            Parâmetros
          </span>
          <div className={row}>
            <span className={lbl}>Suitability</span>
            <Badge className="no-default-hover-elevate no-default-active-elevate border-[rgba(109,177,212,0.25)] bg-[rgba(109,177,212,0.1)] text-[11px] text-[#6db1d4]">
              {POLICY.suitability}
            </Badge>
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
        </div>

        <div className="col-span-2 rounded-md border border-[#2a2a2a] bg-[#161616] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#666]">
              Compliance Check
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-[#6ecf8e]">
                <CheckCircle className="h-3 w-3" />
                {okCount}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#dcb092]">
                <AlertTriangle className="h-3 w-3" />
                {atencaoCount}
              </span>
              {violadoCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-[#e05c5c]">
                  <X className="h-3 w-3" />
                  {violadoCount}
                </span>
              )}
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
        <span className="mb-3 block text-[11px] font-semibold uppercase tracking-wider text-[#666]">
          Ranges por Macro Classe
        </span>
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
              <div
                key={mc.name}
                className="flex items-center gap-3"
                data-testid={`policy-range-${mc.name}`}
              >
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
                      backgroundColor:
                        mc.status === "ok"
                          ? "#6ecf8e"
                          : mc.status === "atencao"
                            ? "#dcb092"
                            : "#e05c5c",
                    }}
                  />
                </div>
                <span className="w-12 text-right text-xs font-medium text-[#ededed]">
                  {mc.actualPct.toFixed(1)}%
                </span>
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
        <span className="mb-3 block text-[11px] font-semibold uppercase tracking-wider text-[#666]">
          Restrições de Ativos
        </span>
        <div className="grid grid-cols-3 gap-2">
          {POLICY.assetRestrictions.map((r) => (
            <div
              key={r}
              className="flex items-center gap-2 rounded-md border border-[rgba(224,92,92,0.15)] bg-[rgba(224,92,92,0.04)] p-2.5"
            >
              <X className="h-3.5 w-3.5 shrink-0 text-[#e05c5c]" />
              <span className="text-xs text-[#e05c5c]">{r}</span>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#666]">
            Exposição Geográfica
          </span>
          <div className="flex flex-wrap gap-2">
            {POLICY.exposureAreas.map((a) => (
              <span
                key={a}
                className="rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-2.5 py-1 text-xs text-[#ccc]"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MockupRealocador() {
  const [allocatorValues, setAllocatorValues] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [assetAllocValues, setAssetAllocValues] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [globalBudget, setGlobalBudget] = useState("");
  const [expandedInstOrder, setExpandedInstOrder] = useState<string[]>([]);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [notifyPreview, setNotifyPreview] = useState<{ channel: "whatsapp" | "email" } | null>(
    null,
  );
  const [disableCOE, setDisableCOE] = useState(false);
  const [disableFGTS, setDisableFGTS] = useState(false);

  const globalBudgetNum = parseBRLInput(globalBudget);

  const totalAllocated = useMemo(() => {
    let sum = 0;
    for (const instMap of Object.values(allocatorValues)) {
      for (const val of Object.values(instMap)) {
        sum += parseBRLInput(val);
      }
    }
    return sum;
  }, [allocatorValues]);

  type MovementScenario = "idle" | "pure-reallocation" | "pure-aporte" | "pure-resgate" | "mixed";

  const movementBreakdown = useMemo(() => {
    let positiveEntries = 0;
    let negativeEntries = 0;
    const entriesBySub: Record<string, { positive: number; negative: number }> = {};

    for (const [subId, instMap] of Object.entries(allocatorValues)) {
      if (!entriesBySub[subId]) entriesBySub[subId] = { positive: 0, negative: 0 };
      for (const val of Object.values(instMap)) {
        const num = parseBRLInput(val);
        if (num > 0) {
          positiveEntries += num;
          entriesBySub[subId].positive += num;
        }
        if (num < 0) {
          negativeEntries += Math.abs(num);
          entriesBySub[subId].negative += Math.abs(num);
        }
      }
    }

    for (const [assetId, instMap] of Object.entries(assetAllocValues)) {
      const subId = CATEGORIES.flatMap((c) => c.subs).find((s) =>
        s.assets.some((a) => a.id === assetId),
      )?.id;
      if (!subId) continue;
      if (!entriesBySub[subId]) entriesBySub[subId] = { positive: 0, negative: 0 };
      for (const val of Object.values(instMap)) {
        const num = parseBRLInput(val);
        if (num > 0) {
          positiveEntries += num;
          entriesBySub[subId].positive += num;
        }
        if (num < 0) {
          negativeEntries += Math.abs(num);
          entriesBySub[subId].negative += Math.abs(num);
        }
      }
    }

    for (const c of pendingChanges) {
      if (c.type === "adicao" && c.value) {
        positiveEntries += c.value;
        if (!entriesBySub[c.subId]) entriesBySub[c.subId] = { positive: 0, negative: 0 };
        entriesBySub[c.subId].positive += c.value;
      }
    }

    const netMatrix = positiveEntries - negativeEntries;
    const reallocationAmount = Math.min(positiveEntries, negativeEntries);
    const newMoneyAllocated = globalBudgetNum !== 0 ? Math.max(0, netMatrix) : 0;
    const unallocatedBudget = globalBudgetNum !== 0 ? globalBudgetNum - netMatrix : 0;
    const implicitAporteResgate = globalBudgetNum === 0 ? netMatrix : 0;

    let scenario: MovementScenario = "idle";
    if (globalBudgetNum === 0 && positiveEntries === 0 && negativeEntries === 0) {
      scenario = "idle";
    } else if (globalBudgetNum === 0 && (positiveEntries > 0 || negativeEntries > 0)) {
      scenario = "pure-reallocation";
    } else if (globalBudgetNum !== 0 && negativeEntries === 0) {
      scenario = globalBudgetNum > 0 ? "pure-aporte" : "pure-resgate";
    } else {
      scenario = "mixed";
    }

    const isBalanced =
      scenario === "pure-reallocation"
        ? Math.abs(netMatrix) < 1
        : scenario === "mixed"
          ? Math.abs(unallocatedBudget) < 1
          : scenario === "pure-aporte" || scenario === "pure-resgate"
            ? Math.abs(globalBudgetNum - totalAllocated) < 1
            : true;

    return {
      positiveEntries,
      negativeEntries,
      netMatrix,
      reallocationAmount,
      newMoneyAllocated,
      unallocatedBudget,
      implicitAporteResgate,
      scenario,
      isBalanced,
      entriesBySub,
    };
  }, [allocatorValues, assetAllocValues, pendingChanges, globalBudgetNum, totalAllocated]);

  const handleAllocatorChange = (subId: string, inst: string, val: string) => {
    setAllocatorValues((prev) => ({ ...prev, [subId]: { ...prev[subId], [inst]: val } }));
  };

  const handleAssetAllocChange = (assetId: string, inst: string, val: string) => {
    setAssetAllocValues((prev) => ({ ...prev, [assetId]: { ...prev[assetId], [inst]: val } }));
  };

  const toggleInstitution = (name: string) => {
    setExpandedInstOrder((prev) => {
      if (prev.includes(name)) {
        return prev.filter((n) => n !== name);
      }
      const next = [...prev, name];
      if (next.length > 3) next.shift();
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
    const lines: string[] = ["Ola Roberto, segue o resumo das movimentacoes sugeridas:", ""];

    const { scenario, reallocationAmount, positiveEntries, negativeEntries } = movementBreakdown;
    const summaryParts: string[] = [];
    if (globalBudgetNum > 0) summaryParts.push(`Aporte: R$ ${formatBRL(globalBudgetNum)}`);
    if (globalBudgetNum < 0)
      summaryParts.push(`Resgate: R$ ${formatBRL(Math.abs(globalBudgetNum))}`);
    if (reallocationAmount > 0)
      summaryParts.push(`Realocacao interna: R$ ${formatBRL(reallocationAmount)}`);
    if (scenario === "pure-reallocation" && Math.abs(positiveEntries - negativeEntries) < 1) {
      summaryParts.push("PL inalterado");
    }
    if (summaryParts.length > 0) {
      lines.push(`Resumo: ${summaryParts.join(" | ")}`);
      lines.push("");
    }

    if (resgates.length > 0) {
      lines.push(`Resgates (${resgates.length}):`);
      resgates.forEach((r) =>
        lines.push(`  - ${r.assetName} (${r.institution}) ${r.value ? formatBRL(r.value) : ""}`),
      );
      lines.push("");
    }
    if (remocoes.length > 0) {
      lines.push(`Remocoes (${remocoes.length}):`);
      remocoes.forEach((r) =>
        lines.push(`  - ${r.assetName} (${r.institution}) ${r.value ? formatBRL(r.value) : ""}`),
      );
      lines.push("");
    }
    if (adicoes.length > 0) {
      lines.push(`Adicoes (${adicoes.length}):`);
      adicoes.forEach((a) => {
        const details = [a.rate, a.maturity, a.liquidity].filter(Boolean).join(", ");
        lines.push(
          `  - ${a.assetName} (${a.institution})${details ? ` [${details}]` : ""} ${a.value ? formatBRL(a.value) : ""}`,
        );
      });
      lines.push("");
    }
    lines.push("Por favor, confirme se esta de acordo.");
    return lines.join("\n");
  }, [pendingChanges, movementBreakdown, globalBudgetNum]);

  const expandedAccounts = useMemo(
    () =>
      expandedInstOrder
        .map((name) => ALL_CLIENT_ACCOUNTS.find((i) => i.name === name)!)
        .filter(Boolean),
    [expandedInstOrder],
  );

  const hasPending = pendingChanges.length > 0;
  const hasChanges = totalAllocated !== 0 || hasPending || globalBudgetNum !== 0;
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
              {/* === LINHA 1: Identidade do cliente === */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <h1
                    className="shrink-0 text-2xl font-bold text-[#ededed]"
                    data-testid="text-client-name"
                  >
                    Roberto Mendes
                  </h1>
                  <Badge
                    className="no-default-hover-elevate no-default-active-elevate shrink-0 border-[rgba(109,177,212,0.25)] bg-[rgba(109,177,212,0.1)] text-[11px] text-[#6db1d4]"
                    data-testid="badge-suitability"
                  >
                    Moderado
                  </Badge>
                  <StatusBadge status={overallStatus} />
                  <div className="h-5 w-px shrink-0 bg-[#2a2a2a]" />
                  {(() => {
                    const { scenario, reallocationAmount, netMatrix } = movementBreakdown;
                    const effectiveDelta = globalBudgetNum !== 0 ? globalBudgetNum : netMatrix;
                    const deltaColor = effectiveDelta > 0 ? "text-[#6ecf8e]" : "text-[#e05c5c]";
                    const showArrow = effectiveDelta !== 0;
                    const isPureReallocationBalanced =
                      scenario === "pure-reallocation" && Math.abs(netMatrix) < 1;

                    let annotation = "";
                    if (isPureReallocationBalanced && reallocationAmount > 0) {
                      annotation = "realocacao interna, PL inalterado";
                    } else if (
                      scenario === "pure-aporte" ||
                      (scenario === "mixed" && globalBudgetNum > 0)
                    ) {
                      annotation = `+${formatBRL(Math.abs(globalBudgetNum))} aporte`;
                      if (reallocationAmount > 0)
                        annotation += `, ${formatBRL(reallocationAmount)} realocado`;
                    } else if (
                      scenario === "pure-resgate" ||
                      (scenario === "mixed" && globalBudgetNum < 0)
                    ) {
                      annotation = `-${formatBRL(Math.abs(globalBudgetNum))} resgate`;
                      if (reallocationAmount > 0)
                        annotation += `, ${formatBRL(reallocationAmount)} realocado`;
                    } else if (scenario === "pure-reallocation" && Math.abs(netMatrix) >= 1) {
                      annotation =
                        netMatrix > 0
                          ? `+${formatBRL(netMatrix)} sem origem definida`
                          : `-${formatBRL(Math.abs(netMatrix))} sem destino definido`;
                    }

                    return (
                      <span
                        className="shrink-0 text-sm font-medium text-[#ededed]"
                        data-testid="text-aum"
                      >
                        {formatBRLFull(TOTAL_AUM)}
                        {showArrow && (
                          <span className={`ml-1.5 text-xs font-medium ${deltaColor}`}>
                            {"\u2192"} {formatBRLFull(TOTAL_AUM + effectiveDelta)}
                          </span>
                        )}
                        {annotation && (
                          <span className="ml-1.5 text-[10px] text-[#666]">({annotation})</span>
                        )}
                      </span>
                    );
                  })()}
                </div>
                <span
                  className="shrink-0 text-xs text-[#555]"
                  data-testid="text-last-consolidation"
                >
                  Consolidado 28/02/2026
                </span>
              </div>

              {/* === LINHA 2: Controles === */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Grupo esquerdo: fluxo de trabalho */}
                <div className="flex flex-wrap items-center gap-3">
                  {(() => {
                    const { scenario, reallocationAmount, isBalanced, netMatrix, negativeEntries } =
                      movementBreakdown;
                    const hasBudget = globalBudgetNum !== 0;
                    const hasImplicit = !hasBudget && scenario !== "idle";
                    const budgetColor =
                      globalBudgetNum > 0
                        ? "text-[#6ecf8e]"
                        : globalBudgetNum < 0
                          ? "text-[#e05c5c]"
                          : "";
                    const absBudget = Math.abs(globalBudgetNum);
                    const absNet = Math.abs(netMatrix);
                    const pct = absBudget > 0 ? Math.min((absNet / absBudget) * 100, 100) : 0;
                    const remaining = globalBudgetNum - netMatrix;
                    const isComplete = hasBudget && Math.abs(remaining) < 1;
                    const hasReallocation = negativeEntries > 0 && reallocationAmount > 0;
                    const isOverGenuine = hasBudget && absNet > absBudget && negativeEntries === 0;
                    const isMixedOver = hasBudget && absNet > absBudget && hasReallocation;
                    const borderStyle = hasBudget
                      ? isComplete || isMixedOver
                        ? "border-[rgba(110,207,142,0.3)] bg-[rgba(110,207,142,0.04)]"
                        : "border-[#333] bg-[#111]"
                      : hasImplicit
                        ? "border-[#333] bg-[#111]"
                        : "border-dashed border-[#333] bg-[#0d0d0d]";
                    return (
                      <div
                        className={`flex items-center gap-2.5 rounded-md border px-3 py-1.5 transition-all ${borderStyle}`}
                      >
                        <ArrowDownUp
                          className={`h-3.5 w-3.5 shrink-0 ${scenario === "idle" ? "text-[#444]" : hasBudget ? budgetColor : "text-[#6db1d4]"}`}
                        />
                        <input
                          type="text"
                          placeholder="Aporte / Resgate"
                          value={globalBudget}
                          onChange={(e) => setGlobalBudget(e.target.value)}
                          onBlur={() => {
                            const formatted = formatInputBRL(globalBudget);
                            if (formatted !== globalBudget) setGlobalBudget(formatted);
                          }}
                          className={`w-32 bg-transparent text-center text-sm font-medium ${hasBudget ? budgetColor : "text-[#ededed]"} outline-none transition-all placeholder:text-[#444] focus:placeholder:text-[#555]`}
                          data-testid="input-aporte-resgate"
                        />
                        {hasBudget && (
                          <>
                            <div className="h-4 w-px bg-[#2a2a2a]" />
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#222]">
                                <div
                                  className={`h-full rounded-full transition-all ${isComplete || isMixedOver ? "bg-[#6ecf8e]" : isOverGenuine ? "bg-[#e05c5c]" : "bg-[#6db1d4]"}`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                              {isComplete ? (
                                <>
                                  <span className="whitespace-nowrap text-[10px] text-[#666]">
                                    {formatBRL(globalBudgetNum)} alocado
                                  </span>
                                  <CheckCircle className="h-3 w-3 shrink-0 text-[#6ecf8e]" />
                                </>
                              ) : isMixedOver ? (
                                <>
                                  <span className="whitespace-nowrap text-[10px] text-[#6ecf8e]">
                                    {formatBRL(absBudget)}{" "}
                                    {globalBudgetNum > 0 ? "aporte" : "resgate"}
                                  </span>
                                  <span className="whitespace-nowrap text-[10px] text-[#6db1d4]">
                                    + {formatBRL(reallocationAmount)} realoc.
                                  </span>
                                  <CheckCircle className="h-3 w-3 shrink-0 text-[#6ecf8e]" />
                                </>
                              ) : isOverGenuine ? (
                                <>
                                  <span className="whitespace-nowrap text-[10px] text-[#666]">
                                    {formatBRL(netMatrix)} / {formatBRL(globalBudgetNum)}
                                  </span>
                                  <span className="whitespace-nowrap text-[10px] font-medium text-[#e05c5c]">
                                    {formatBRL(Math.abs(remaining))} excedido
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="whitespace-nowrap text-[10px] text-[#666]">
                                    {formatBRL(netMatrix)} / {formatBRL(globalBudgetNum)}
                                  </span>
                                  <span className="whitespace-nowrap text-[10px] font-medium text-[#dcb092]">
                                    {formatBRL(remaining)} restante
                                  </span>
                                </>
                              )}
                            </div>
                          </>
                        )}
                        {hasImplicit && (
                          <>
                            <div className="h-4 w-px bg-[#2a2a2a]" />
                            {isBalanced ? (
                              <span className="inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-medium text-[#6ecf8e]">
                                <CheckCircle className="h-3 w-3" />
                                Equilibrado
                              </span>
                            ) : netMatrix > 0 ? (
                              <span className="inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-medium text-[#dcb092]">
                                <AlertTriangle className="h-3 w-3" />
                                {formatBRL(netMatrix)} sem origem
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-medium text-[#dcb092]">
                                <AlertTriangle className="h-3 w-3" />
                                {formatBRL(Math.abs(netMatrix))} sem destino
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })()}
                  <div className="h-5 w-px bg-[#2a2a2a]" />
                  <Button
                    disabled={!hasChanges}
                    className={
                      hasChanges
                        ? "border-[rgba(110,207,142,0.3)] bg-[rgba(110,207,142,0.12)] text-[#6ecf8e] transition-all"
                        : "cursor-not-allowed border-[#2a2a2a] bg-[#161616] text-[#444] transition-all"
                    }
                    data-testid="button-save"
                  >
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    Salvar ajustes
                  </Button>
                  <div className="h-5 w-px bg-[#2a2a2a]" />
                  <button
                    onClick={() => {
                      if (hasPending) setNotifyPreview({ channel: "whatsapp" });
                    }}
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
                    onClick={() => {
                      if (hasPending) setNotifyPreview({ channel: "email" });
                    }}
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
                {/* Grupo direito: filtros de visualização */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[#444]">
                    Filtros
                  </span>
                  <button
                    onClick={() => setDisableCOE(!disableCOE)}
                    className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      disableCOE
                        ? "border-[rgba(224,92,92,0.3)] bg-[rgba(224,92,92,0.1)] text-[#e05c5c]"
                        : "border-[#2a2a2a] bg-[#161616] text-[#555] hover:border-[#444] hover:text-[#888]"
                    }`}
                    data-testid="toggle-coe"
                  >
                    {disableCOE && <X className="h-2.5 w-2.5" />}
                    {disableCOE ? "Sem COE" : "COE"}
                  </button>
                  <button
                    onClick={() => setDisableFGTS(!disableFGTS)}
                    className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      disableFGTS
                        ? "border-[rgba(224,92,92,0.3)] bg-[rgba(224,92,92,0.1)] text-[#e05c5c]"
                        : "border-[#2a2a2a] bg-[#161616] text-[#555] hover:border-[#444] hover:text-[#888]"
                    }`}
                    data-testid="toggle-fgts"
                  >
                    {disableFGTS && <X className="h-2.5 w-2.5" />}
                    {disableFGTS ? "Sem FGTS" : "FGTS"}
                  </button>
                </div>
              </div>

              <MovementSummaryPanel
                breakdown={movementBreakdown}
                globalBudgetNum={globalBudgetNum}
              />

              <MatrixTable
                allocatorValues={allocatorValues}
                onAllocatorChange={handleAllocatorChange}
                assetAllocValues={assetAllocValues}
                onAssetAllocChange={handleAssetAllocChange}
                expandedAccounts={expandedAccounts}
                allAccounts={ALL_CLIENT_ACCOUNTS}
                onToggleInstitution={toggleInstitution}
                pendingChanges={pendingChanges}
                onAddChange={addChange}
                onRemoveChange={removeChange}
                globalBudgetNum={globalBudgetNum}
                totalAllocated={totalAllocated}
                movementBreakdown={movementBreakdown}
                disableCOE={disableCOE}
                disableFGTS={disableFGTS}
              />

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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setNotifyPreview(null)}
          data-testid="notify-preview-overlay"
        >
          <div
            className="w-full max-w-lg rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-6"
            onClick={(e) => e.stopPropagation()}
            data-testid="notify-preview-modal"
          >
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
            <pre
              className="mb-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-[#2a2a2a] bg-[#121212] p-4 text-xs leading-relaxed text-[#bbb]"
              data-testid="notify-preview-text"
            >
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
                {notifyPreview.channel === "whatsapp" ? (
                  <MessageCircle className="h-3 w-3" />
                ) : (
                  <Mail className="h-3 w-3" />
                )}
                Enviar {notifyPreview.channel === "whatsapp" ? "WhatsApp" : "Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
