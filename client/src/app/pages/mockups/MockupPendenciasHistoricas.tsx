import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ExtratoStatus = "Pendente" | "Solicitado" | "Recebido";
type CollectionMethod = "Automatico" | "Manual" | "Manual Cliente";

interface MockExtrato {
  id: string;
  clientName: string;
  institution: string;
  accountType: string;
  collectionMethod: CollectionMethod;
  status: ExtratoStatus;
  days: number;
}

interface MonthData {
  key: string;
  label: string;
  pendentes: number;
  solicitados: number;
  recebidos: number;
  total: number;
  extratos: MockExtrato[];
}

const STATUS_DOT: Record<ExtratoStatus, string> = {
  Pendente: "bg-orange-500",
  Solicitado: "bg-sky-500",
  Recebido: "bg-emerald-500",
};

const STATUS_TEXT: Record<ExtratoStatus, string> = {
  Pendente: "text-orange-400",
  Solicitado: "text-sky-400",
  Recebido: "text-emerald-400",
};

const MOCK_DATA: MonthData[] = [
  {
    key: "01/2026", label: "Janeiro 2026",
    pendentes: 6, solicitados: 3, recebidos: 1, total: 10,
    extratos: [
      { id: "1", clientName: "Marco A. Rodrigues", institution: "Itau", accountType: "PF", collectionMethod: "Manual", status: "Pendente", days: 5 },
      { id: "2", clientName: "Marco A. Rodrigues", institution: "XP Investimentos", accountType: "PF", collectionMethod: "Automatico", status: "Solicitado", days: 3 },
      { id: "3", clientName: "Bruno B. Orlandi", institution: "BTG Pactual", accountType: "PJ", collectionMethod: "Manual Cliente", status: "Pendente", days: 8 },
      { id: "4", clientName: "Bruno B. Orlandi", institution: "Itau", accountType: "PF", collectionMethod: "Manual", status: "Pendente", days: 4 },
      { id: "5", clientName: "Daniela L. Braun", institution: "Safra", accountType: "PF", collectionMethod: "Automatico", status: "Solicitado", days: 2 },
      { id: "6", clientName: "Israel S. Da Rosa", institution: "Smart", accountType: "PF", collectionMethod: "Manual", status: "Recebido", days: 0 },
      { id: "7", clientName: "Marcia C. Lopes", institution: "Genial", accountType: "PJ", collectionMethod: "Manual", status: "Pendente", days: 6 },
      { id: "8", clientName: "Guilherme Marcondes", institution: "XP Investimentos", accountType: "PF", collectionMethod: "Automatico", status: "Solicitado", days: 1 },
      { id: "9", clientName: "Thyrso C. Michelin", institution: "Itau", accountType: "PF", collectionMethod: "Manual", status: "Pendente", days: 3 },
      { id: "10", clientName: "Antonio A. Moreira", institution: "BTG Pactual", accountType: "PF", collectionMethod: "Manual Cliente", status: "Pendente", days: 7 },
    ],
  },
  {
    key: "12/2025", label: "Dezembro 2025",
    pendentes: 4, solicitados: 3, recebidos: 1, total: 8,
    extratos: [
      { id: "11", clientName: "Marco A. Rodrigues", institution: "Itau", accountType: "PF", collectionMethod: "Manual", status: "Pendente", days: 35 },
      { id: "12", clientName: "Bruno B. Orlandi", institution: "BTG Pactual", accountType: "PJ", collectionMethod: "Manual Cliente", status: "Solicitado", days: 30 },
      { id: "13", clientName: "Daniela L. Braun", institution: "XP Investimentos", accountType: "PF", collectionMethod: "Automatico", status: "Pendente", days: 40 },
      { id: "14", clientName: "Israel S. Da Rosa", institution: "Smart", accountType: "PF", collectionMethod: "Manual", status: "Recebido", days: 28 },
      { id: "15", clientName: "Marcia C. Lopes", institution: "Genial", accountType: "PJ", collectionMethod: "Manual", status: "Solicitado", days: 32 },
      { id: "16", clientName: "Guilherme Marcondes", institution: "Safra", accountType: "PF", collectionMethod: "Automatico", status: "Pendente", days: 38 },
      { id: "17", clientName: "Thyrso C. Michelin", institution: "Itau", accountType: "PF", collectionMethod: "Manual", status: "Pendente", days: 36 },
      { id: "18", clientName: "Antonio A. Moreira", institution: "BTG Pactual", accountType: "PF", collectionMethod: "Manual Cliente", status: "Solicitado", days: 29 },
    ],
  },
  {
    key: "11/2025", label: "Novembro 2025",
    pendentes: 2, solicitados: 4, recebidos: 1, total: 7,
    extratos: [
      { id: "19", clientName: "Marco A. Rodrigues", institution: "XP Investimentos", accountType: "PF", collectionMethod: "Automatico", status: "Solicitado", days: 60 },
      { id: "20", clientName: "Bruno B. Orlandi", institution: "Itau", accountType: "PF", collectionMethod: "Manual", status: "Pendente", days: 65 },
      { id: "21", clientName: "Daniela L. Braun", institution: "BTG Pactual", accountType: "PJ", collectionMethod: "Manual Cliente", status: "Solicitado", days: 58 },
      { id: "22", clientName: "Marcia C. Lopes", institution: "Smart", accountType: "PF", collectionMethod: "Manual", status: "Solicitado", days: 55 },
      { id: "23", clientName: "Guilherme Marcondes", institution: "Genial", accountType: "PJ", collectionMethod: "Manual", status: "Recebido", days: 50 },
      { id: "24", clientName: "Thyrso C. Michelin", institution: "Safra", accountType: "PF", collectionMethod: "Automatico", status: "Solicitado", days: 52 },
      { id: "25", clientName: "Antonio A. Moreira", institution: "XP Investimentos", accountType: "PF", collectionMethod: "Automatico", status: "Pendente", days: 62 },
    ],
  },
  {
    key: "10/2025", label: "Outubro 2025",
    pendentes: 1, solicitados: 1, recebidos: 3, total: 5,
    extratos: [
      { id: "26", clientName: "Marco A. Rodrigues", institution: "Itau", accountType: "PF", collectionMethod: "Manual", status: "Recebido", days: 85 },
      { id: "27", clientName: "Daniela L. Braun", institution: "BTG Pactual", accountType: "PJ", collectionMethod: "Manual Cliente", status: "Recebido", days: 80 },
      { id: "28", clientName: "Israel S. Da Rosa", institution: "XP Investimentos", accountType: "PF", collectionMethod: "Automatico", status: "Pendente", days: 90 },
      { id: "29", clientName: "Marcia C. Lopes", institution: "Smart", accountType: "PF", collectionMethod: "Manual", status: "Recebido", days: 82 },
      { id: "30", clientName: "Guilherme Marcondes", institution: "Genial", accountType: "PJ", collectionMethod: "Manual", status: "Solicitado", days: 88 },
    ],
  },
  {
    key: "09/2025", label: "Setembro 2025",
    pendentes: 0, solicitados: 2, recebidos: 3, total: 5,
    extratos: [
      { id: "31", clientName: "Bruno B. Orlandi", institution: "Itau", accountType: "PF", collectionMethod: "Manual", status: "Recebido", days: 110 },
      { id: "32", clientName: "Daniela L. Braun", institution: "Safra", accountType: "PF", collectionMethod: "Automatico", status: "Solicitado", days: 115 },
      { id: "33", clientName: "Israel S. Da Rosa", institution: "BTG Pactual", accountType: "PJ", collectionMethod: "Manual Cliente", status: "Recebido", days: 108 },
      { id: "34", clientName: "Thyrso C. Michelin", institution: "XP Investimentos", accountType: "PF", collectionMethod: "Automatico", status: "Solicitado", days: 112 },
      { id: "35", clientName: "Antonio A. Moreira", institution: "Genial", accountType: "PF", collectionMethod: "Manual", status: "Recebido", days: 105 },
    ],
  },
];

const totalAll = MOCK_DATA.reduce((sum, m) => sum + m.total, 0);
const totalRecebidos = MOCK_DATA.reduce((sum, m) => sum + m.recebidos, 0);

function MonthDetailView({ month, onBack }: { month: MonthData; onBack: () => void }) {
  const sorted = [...month.extratos].sort((a, b) => {
    const order: Record<ExtratoStatus, number> = { Pendente: 0, Solicitado: 1, Recebido: 2 };
    return order[a.status] - order[b.status] || b.days - a.days;
  });

  return (
    <div className="flex flex-col" data-testid="month-detail-view">
      <div className="flex items-center gap-2.5 border-b border-zinc-800/60 px-5 py-3">
        <button
          onClick={onBack}
          className="flex items-center justify-center rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
          data-testid="button-back-to-months"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium capitalize text-zinc-200" data-testid="text-month-title">
          {month.label}
        </span>
        <span className="text-xs text-zinc-600">{month.total} extratos</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sorted.map((e) => (
          <div
            key={e.id}
            className="flex items-center gap-3 border-b border-zinc-800/30 px-5 py-2.5 transition-colors hover:bg-zinc-800/20"
            data-testid={`extrato-row-${e.id}`}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[e.status]}`} />
            <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-300">{e.clientName}</span>
            <span className="shrink-0 text-xs text-zinc-500">{e.institution}</span>
            <span className={`shrink-0 text-right text-[11px] tabular-nums ${e.days === 0 ? "text-emerald-400" : e.days > 30 ? "text-orange-400/70" : "text-zinc-600"}`}>
              {e.days === 0 ? "hoje" : `${e.days}d`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MockupPendenciasHistoricas() {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const activeMonth = MOCK_DATA.find(m => m.key === selectedMonth);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111] p-6" data-testid="mockup-pendencias-wrapper">
      <div
        className="flex w-full max-w-[540px] flex-col overflow-hidden rounded-lg border border-zinc-800 bg-[#1a1a1a] shadow-2xl shadow-black/60"
        style={{ maxHeight: "min(80vh, 620px)" }}
        data-testid="pendencias-modal"
      >
        {activeMonth ? (
          <>
            <MonthDetailView month={activeMonth} onBack={() => setSelectedMonth(null)} />
            <div className="flex items-center justify-end border-t border-zinc-800/60 px-5 py-2.5">
              <button
                onClick={() => setSelectedMonth(null)}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                data-testid="button-close-detail"
              >
                Fechar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 border-b border-zinc-800/60 px-5 py-4">
              <div>
                <h1 className="text-[15px] font-semibold text-zinc-100" data-testid="text-modal-title">
                  Pendencias Historicas
                </h1>
                <p className="mt-0.5 text-[11px] text-zinc-500">{totalRecebidos} de {totalAll} extratos recebidos</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-500/10">
                <span className="text-sm font-bold text-orange-400" data-testid="badge-total-pendentes">
                  {totalAll - totalRecebidos}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {MOCK_DATA.map((month) => (
                <button
                  key={month.key}
                  onClick={() => setSelectedMonth(month.key)}
                  className="group flex w-full items-center gap-4 border-b border-zinc-800/30 px-5 py-3.5 text-left transition-colors hover:bg-zinc-800/30"
                  data-testid={`month-card-${month.key}`}
                >
                  <span className="w-24 shrink-0 text-[13px] font-medium capitalize text-zinc-300">
                    {month.label.split(" ")[0]}
                    <span className="ml-1.5 text-zinc-600">{month.label.split(" ")[1]}</span>
                  </span>

                  <div className="flex flex-1 items-center gap-2">
                    {month.pendentes > 0 && (
                      <span className="flex items-center gap-1 text-[11px] tabular-nums text-orange-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                        {month.pendentes}
                      </span>
                    )}
                    {month.solicitados > 0 && (
                      <span className="flex items-center gap-1 text-[11px] tabular-nums text-sky-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                        {month.solicitados}
                      </span>
                    )}
                    {month.recebidos > 0 && (
                      <span className="flex items-center gap-1 text-[11px] tabular-nums text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {month.recebidos}
                      </span>
                    )}
                  </div>

                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-700 transition-colors group-hover:text-zinc-400" />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end border-t border-zinc-800/60 px-5 py-2.5">
              <button
                className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                data-testid="button-close-modal"
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
