import { useState } from "react";
import { Calendar, ChevronLeft, AlertTriangle, Mail, CheckCircle } from "lucide-react";

type ExtratoStatus = "Pendente" | "Solicitado" | "Recebido";
type CollectionMethod = "Automatico" | "Manual" | "Manual Cliente";

interface MockExtrato {
  id: string;
  clientName: string;
  institution: string;
  accountType: string;
  collectionMethod: CollectionMethod;
  status: ExtratoStatus;
  elapsedText: string;
  dotColor: string;
}

interface MonthData {
  key: string;
  label: string;
  pendentes: number;
  solicitados: number;
  recebidos: number;
  total: number;
  subtitle: string;
  extratos: MockExtrato[];
}

const STATUS_COLORS: Record<ExtratoStatus, { bg: string; text: string; dot: string }> = {
  Pendente: { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-500" },
  Solicitado: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-500" },
  Recebido: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500" },
};

const METHOD_COLORS: Record<CollectionMethod, string> = {
  Automatico: "bg-emerald-950/20 text-emerald-500 border-emerald-500/20",
  Manual: "bg-zinc-800 text-zinc-500 border-transparent",
  "Manual Cliente": "bg-amber-950/20 text-amber-500 border-amber-500/20",
};

const INSTITUTION_COLORS = [
  "text-teal-400", "text-rose-400", "text-violet-400", "text-sky-400",
  "text-amber-400", "text-lime-400", "text-pink-400", "text-cyan-400",
];

function getInstColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return INSTITUTION_COLORS[Math.abs(hash) % INSTITUTION_COLORS.length];
}

const MOCK_DATA: MonthData[] = [
  {
    key: "01/2026",
    label: "Janeiro 2026",
    pendentes: 6,
    solicitados: 3,
    recebidos: 1,
    total: 10,
    subtitle: "Consolidacao Pendente",
    extratos: [
      { id: "1", clientName: "Marco Alexandre Rodrigues", institution: "Itau", accountType: "PF", collectionMethod: "Manual", status: "Pendente", elapsedText: "Pendente ha 5 dias", dotColor: getInstColor("Itau") },
      { id: "2", clientName: "Marco Alexandre Rodrigues", institution: "XP Investimentos", accountType: "PF", collectionMethod: "Automatico", status: "Solicitado", elapsedText: "Solicitado ha 3 dias", dotColor: getInstColor("XP Investimentos") },
      { id: "3", clientName: "Bruno Bussadori Orlandi", institution: "BTG Pactual", accountType: "PJ", collectionMethod: "Manual Cliente", status: "Pendente", elapsedText: "Pendente ha 8 dias", dotColor: getInstColor("BTG Pactual") },
      { id: "4", clientName: "Bruno Bussadori Orlandi", institution: "Itau", accountType: "PF", collectionMethod: "Manual", status: "Pendente", elapsedText: "Pendente ha 4 dias", dotColor: getInstColor("Itau") },
      { id: "5", clientName: "Daniela Louise Braun", institution: "Safra", accountType: "PF", collectionMethod: "Automatico", status: "Solicitado", elapsedText: "Solicitado ha 2 dias", dotColor: getInstColor("Safra") },
      { id: "6", clientName: "Israel Schussler Da Rosa", institution: "Smart", accountType: "PF", collectionMethod: "Manual", status: "Recebido", elapsedText: "Recebido hoje", dotColor: getInstColor("Smart") },
      { id: "7", clientName: "Marcia Cristina Lopes", institution: "Genial", accountType: "PJ", collectionMethod: "Manual", status: "Pendente", elapsedText: "Pendente ha 6 dias", dotColor: getInstColor("Genial") },
      { id: "8", clientName: "Guilherme Marcondes", institution: "XP Investimentos", accountType: "PF", collectionMethod: "Automatico", status: "Solicitado", elapsedText: "Solicitado ha 1 dia", dotColor: getInstColor("XP Investimentos") },
      { id: "9", clientName: "Thyrso Camargo Michelin", institution: "Itau", accountType: "PF", collectionMethod: "Manual", status: "Pendente", elapsedText: "Pendente ha 3 dias", dotColor: getInstColor("Itau") },
      { id: "10", clientName: "Antonio Augusto Moreira", institution: "BTG Pactual", accountType: "PF", collectionMethod: "Manual Cliente", status: "Pendente", elapsedText: "Pendente ha 7 dias", dotColor: getInstColor("BTG Pactual") },
    ],
  },
  {
    key: "12/2025",
    label: "Dezembro 2025",
    pendentes: 4,
    solicitados: 3,
    recebidos: 1,
    total: 8,
    subtitle: "Consolidacao Pendente",
    extratos: [
      { id: "11", clientName: "Marco Alexandre Rodrigues", institution: "Itau", accountType: "PF", collectionMethod: "Manual", status: "Pendente", elapsedText: "Pendente ha 35 dias", dotColor: getInstColor("Itau") },
      { id: "12", clientName: "Bruno Bussadori Orlandi", institution: "BTG Pactual", accountType: "PJ", collectionMethod: "Manual Cliente", status: "Solicitado", elapsedText: "Solicitado ha 30 dias", dotColor: getInstColor("BTG Pactual") },
      { id: "13", clientName: "Daniela Louise Braun", institution: "XP Investimentos", accountType: "PF", collectionMethod: "Automatico", status: "Pendente", elapsedText: "Pendente ha 40 dias", dotColor: getInstColor("XP Investimentos") },
      { id: "14", clientName: "Israel Schussler Da Rosa", institution: "Smart", accountType: "PF", collectionMethod: "Manual", status: "Recebido", elapsedText: "Recebido ha 28 dias", dotColor: getInstColor("Smart") },
      { id: "15", clientName: "Marcia Cristina Lopes", institution: "Genial", accountType: "PJ", collectionMethod: "Manual", status: "Solicitado", elapsedText: "Solicitado ha 32 dias", dotColor: getInstColor("Genial") },
      { id: "16", clientName: "Guilherme Marcondes", institution: "Safra", accountType: "PF", collectionMethod: "Automatico", status: "Pendente", elapsedText: "Pendente ha 38 dias", dotColor: getInstColor("Safra") },
      { id: "17", clientName: "Thyrso Camargo Michelin", institution: "Itau", accountType: "PF", collectionMethod: "Manual", status: "Pendente", elapsedText: "Pendente ha 36 dias", dotColor: getInstColor("Itau") },
      { id: "18", clientName: "Antonio Augusto Moreira", institution: "BTG Pactual", accountType: "PF", collectionMethod: "Manual Cliente", status: "Solicitado", elapsedText: "Solicitado ha 29 dias", dotColor: getInstColor("BTG Pactual") },
    ],
  },
  {
    key: "11/2025",
    label: "Novembro 2025",
    pendentes: 2,
    solicitados: 4,
    recebidos: 1,
    total: 7,
    subtitle: "Acao Necessaria",
    extratos: [
      { id: "19", clientName: "Marco Alexandre Rodrigues", institution: "XP Investimentos", accountType: "PF", collectionMethod: "Automatico", status: "Solicitado", elapsedText: "Solicitado ha 60 dias", dotColor: getInstColor("XP Investimentos") },
      { id: "20", clientName: "Bruno Bussadori Orlandi", institution: "Itau", accountType: "PF", collectionMethod: "Manual", status: "Pendente", elapsedText: "Pendente ha 65 dias", dotColor: getInstColor("Itau") },
      { id: "21", clientName: "Daniela Louise Braun", institution: "BTG Pactual", accountType: "PJ", collectionMethod: "Manual Cliente", status: "Solicitado", elapsedText: "Solicitado ha 58 dias", dotColor: getInstColor("BTG Pactual") },
      { id: "22", clientName: "Marcia Cristina Lopes", institution: "Smart", accountType: "PF", collectionMethod: "Manual", status: "Solicitado", elapsedText: "Solicitado ha 55 dias", dotColor: getInstColor("Smart") },
      { id: "23", clientName: "Guilherme Marcondes", institution: "Genial", accountType: "PJ", collectionMethod: "Manual", status: "Recebido", elapsedText: "Recebido ha 50 dias", dotColor: getInstColor("Genial") },
      { id: "24", clientName: "Thyrso Camargo Michelin", institution: "Safra", accountType: "PF", collectionMethod: "Automatico", status: "Solicitado", elapsedText: "Solicitado ha 52 dias", dotColor: getInstColor("Safra") },
      { id: "25", clientName: "Antonio Augusto Moreira", institution: "XP Investimentos", accountType: "PF", collectionMethod: "Automatico", status: "Pendente", elapsedText: "Pendente ha 62 dias", dotColor: getInstColor("XP Investimentos") },
    ],
  },
  {
    key: "10/2025",
    label: "Outubro 2025",
    pendentes: 1,
    solicitados: 1,
    recebidos: 3,
    total: 5,
    subtitle: "Extratos recebidos",
    extratos: [
      { id: "26", clientName: "Marco Alexandre Rodrigues", institution: "Itau", accountType: "PF", collectionMethod: "Manual", status: "Recebido", elapsedText: "Recebido ha 85 dias", dotColor: getInstColor("Itau") },
      { id: "27", clientName: "Daniela Louise Braun", institution: "BTG Pactual", accountType: "PJ", collectionMethod: "Manual Cliente", status: "Recebido", elapsedText: "Recebido ha 80 dias", dotColor: getInstColor("BTG Pactual") },
      { id: "28", clientName: "Israel Schussler Da Rosa", institution: "XP Investimentos", accountType: "PF", collectionMethod: "Automatico", status: "Pendente", elapsedText: "Pendente ha 90 dias", dotColor: getInstColor("XP Investimentos") },
      { id: "29", clientName: "Marcia Cristina Lopes", institution: "Smart", accountType: "PF", collectionMethod: "Manual", status: "Recebido", elapsedText: "Recebido ha 82 dias", dotColor: getInstColor("Smart") },
      { id: "30", clientName: "Guilherme Marcondes", institution: "Genial", accountType: "PJ", collectionMethod: "Manual", status: "Solicitado", elapsedText: "Solicitado ha 88 dias", dotColor: getInstColor("Genial") },
    ],
  },
  {
    key: "09/2025",
    label: "Setembro 2025",
    pendentes: 0,
    solicitados: 2,
    recebidos: 3,
    total: 5,
    subtitle: "Acao Necessaria",
    extratos: [
      { id: "31", clientName: "Bruno Bussadori Orlandi", institution: "Itau", accountType: "PF", collectionMethod: "Manual", status: "Recebido", elapsedText: "Recebido ha 110 dias", dotColor: getInstColor("Itau") },
      { id: "32", clientName: "Daniela Louise Braun", institution: "Safra", accountType: "PF", collectionMethod: "Automatico", status: "Solicitado", elapsedText: "Solicitado ha 115 dias", dotColor: getInstColor("Safra") },
      { id: "33", clientName: "Israel Schussler Da Rosa", institution: "BTG Pactual", accountType: "PJ", collectionMethod: "Manual Cliente", status: "Recebido", elapsedText: "Recebido ha 108 dias", dotColor: getInstColor("BTG Pactual") },
      { id: "34", clientName: "Thyrso Camargo Michelin", institution: "XP Investimentos", accountType: "PF", collectionMethod: "Automatico", status: "Solicitado", elapsedText: "Solicitado ha 112 dias", dotColor: getInstColor("XP Investimentos") },
      { id: "35", clientName: "Antonio Augusto Moreira", institution: "Genial", accountType: "PF", collectionMethod: "Manual", status: "Recebido", elapsedText: "Recebido ha 105 dias", dotColor: getInstColor("Genial") },
    ],
  },
];

const totalPendencias = MOCK_DATA.reduce((sum, m) => sum + m.total, 0);

function StatusDots({ month }: { month: MonthData }) {
  return (
    <div className="flex items-center gap-4" data-testid={`status-dots-${month.key}`}>
      {month.pendentes > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-orange-400" />
          <span className="text-xs font-medium text-zinc-400">{month.pendentes}</span>
        </div>
      )}
      {month.solicitados > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-400" />
          <span className="text-xs font-medium text-zinc-400">{month.solicitados}</span>
        </div>
      )}
      {month.recebidos > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-zinc-400">{month.recebidos}</span>
        </div>
      )}
    </div>
  );
}

function MethodBadge({ method }: { method: CollectionMethod }) {
  return (
    <span className={`inline-flex items-center rounded-lg border px-3 py-1 text-[11px] font-bold ${METHOD_COLORS[method]}`}>
      {method}
    </span>
  );
}

function StatusBadge({ status, elapsedText }: { status: ExtratoStatus; elapsedText: string }) {
  const colors = STATUS_COLORS[status];
  return (
    <span className={`inline-flex items-center rounded-lg border-transparent px-3 py-1 text-[11px] font-bold ${colors.bg} ${colors.text}`}>
      {elapsedText}
    </span>
  );
}

function MonthDetailView({ month, onBack }: { month: MonthData; onBack: () => void }) {
  const summary = {
    pendentes: month.extratos.filter(e => e.status === "Pendente").length,
    solicitados: month.extratos.filter(e => e.status === "Solicitado").length,
    recebidos: month.extratos.filter(e => e.status === "Recebido").length,
  };

  return (
    <div className="flex flex-col" data-testid="month-detail-view">
      <div className="border-b border-white/5 px-8 pb-5 pt-8">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
          data-testid="button-back-to-months"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Voltar aos meses
        </button>
        <h2 className="text-[28px] font-bold capitalize text-white" data-testid="text-month-title">
          {month.label}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{month.subtitle}</p>
        <div className="mt-4 flex items-center gap-3">
          {summary.pendentes > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-950/30 px-3 py-1 text-[11px] font-black uppercase text-orange-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              {summary.pendentes} Pendentes
            </span>
          )}
          {summary.solicitados > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-950/30 px-3 py-1 text-[11px] font-black uppercase text-blue-400">
              <Mail className="h-3.5 w-3.5" />
              {summary.solicitados} Solicitados
            </span>
          )}
          {summary.recebidos > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-950/30 px-3 py-1 text-[11px] font-black uppercase text-green-400">
              <CheckCircle className="h-3.5 w-3.5" />
              {summary.recebidos} Recebidos
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#111718]">
        <div className="px-6 py-2">
          <div className="mb-1 flex items-center gap-4 px-5 py-2">
            <span className="w-2" />
            <span className="w-48 text-[10px] font-black uppercase tracking-wider text-zinc-600">Cliente</span>
            <span className="w-32 text-[10px] font-black uppercase tracking-wider text-zinc-600">Instituicao</span>
            <span className="w-12 text-[10px] font-black uppercase tracking-wider text-zinc-600">Tipo</span>
            <span className="w-28 text-[10px] font-black uppercase tracking-wider text-zinc-600">Metodo</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600">Status</span>
          </div>
          {month.extratos.map((extrato) => (
            <div
              key={extrato.id}
              className="group flex items-center gap-4 rounded-lg px-5 py-2.5 hover:bg-white/5"
              data-testid={`extrato-row-${extrato.id}`}
            >
              <span className={`h-2 w-2 flex-shrink-0 rounded-full bg-current ${extrato.dotColor}`} />
              <span className="w-48 truncate text-sm font-medium text-zinc-300">
                {extrato.clientName}
              </span>
              <span className="w-32 truncate text-xs text-zinc-500">
                {extrato.institution}
              </span>
              <span className="w-12 text-xs text-zinc-600">{extrato.accountType}</span>
              <span className="w-28">
                <MethodBadge method={extrato.collectionMethod} />
              </span>
              <StatusBadge status={extrato.status} elapsedText={extrato.elapsedText} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PendenciasHistoricas() {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const activeMonth = MOCK_DATA.find(m => m.key === selectedMonth);

  if (activeMonth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0f11] p-8">
        <div className="flex max-h-[90vh] w-full max-w-[860px] flex-col overflow-hidden rounded-xl border border-[#3b4f54] bg-[#171b20] shadow-2xl shadow-black/40">
          <MonthDetailView month={activeMonth} onBack={() => setSelectedMonth(null)} />
          <div className="flex items-center justify-end border-t border-white/5 px-8 py-4">
            <button
              onClick={() => setSelectedMonth(null)}
              className="inline-flex items-center rounded-md border border-[#3b4f54] bg-transparent px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              data-testid="button-close-detail"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0f11] p-8">
      <div className="flex max-h-[90vh] w-full max-w-[860px] flex-col overflow-hidden rounded-xl border border-[#3b4f54] bg-[#171b20] shadow-2xl shadow-black/40" data-testid="pendencias-modal">
        <div className="border-b border-white/5 px-8 pb-5 pt-8">
          <h1 className="text-[28px] font-bold text-white" data-testid="text-modal-title">
            Pendencias Historicas
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Acompanhamento de consolidacoes passadas</p>
          <div className="mt-3 inline-flex w-fit items-center rounded-md bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400" data-testid="badge-total-pendencias">
            {totalPendencias} pendencias no total
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#111718]">
          <div className="flex flex-col gap-3 p-6">
            {MOCK_DATA.map((month) => (
              <div
                key={month.key}
                className="flex cursor-pointer items-center gap-5 rounded-xl border border-[#3b4f54] bg-[#22262e] p-5 transition-all hover:border-[#4a6369]"
                onClick={() => setSelectedMonth(month.key)}
                data-testid={`month-card-${month.key}`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5">
                  <Calendar className="h-5 w-5 text-zinc-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold capitalize text-white">{month.label}</p>
                  <p className="text-xs text-zinc-500">{month.subtitle}</p>
                </div>

                <div className="flex items-center gap-4 border-l border-white/10 pl-5">
                  <StatusDots month={month} />
                </div>

                <span className="text-xs font-medium text-blue-400 hover:text-blue-300" data-testid={`link-ver-mes-${month.key}`}>
                  Ver Mes
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-white/5 px-8 py-4">
          <button
            className="inline-flex items-center rounded-md border border-[#3b4f54] bg-transparent px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            data-testid="button-close-modal"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
