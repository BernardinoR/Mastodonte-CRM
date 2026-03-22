import { useState } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle, Clock, CheckCircle2, CircleDot } from "lucide-react";

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
  shortLabel: string;
  pendentes: number;
  solicitados: number;
  recebidos: number;
  total: number;
  extratos: MockExtrato[];
}

const STATUS_CFG: Record<ExtratoStatus, { dot: string; bg: string; text: string; label: string }> = {
  Pendente: { dot: "bg-orange-500", bg: "bg-orange-500/8", text: "text-orange-400", label: "Pendente" },
  Solicitado: { dot: "bg-sky-500", bg: "bg-sky-500/8", text: "text-sky-400", label: "Solicitado" },
  Recebido: { dot: "bg-emerald-500", bg: "bg-emerald-500/8", text: "text-emerald-400", label: "Recebido" },
};

const METHOD_CFG: Record<CollectionMethod, { bg: string; text: string }> = {
  Automatico: { bg: "bg-emerald-500/8", text: "text-emerald-400" },
  Manual: { bg: "bg-zinc-500/8", text: "text-zinc-400" },
  "Manual Cliente": { bg: "bg-amber-500/8", text: "text-amber-400" },
};

const MOCK_DATA: MonthData[] = [
  {
    key: "01/2026", label: "Janeiro 2026", shortLabel: "Jan 26",
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
    key: "12/2025", label: "Dezembro 2025", shortLabel: "Dez 25",
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
    key: "11/2025", label: "Novembro 2025", shortLabel: "Nov 25",
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
    key: "10/2025", label: "Outubro 2025", shortLabel: "Out 25",
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
    key: "09/2025", label: "Setembro 2025", shortLabel: "Set 25",
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

const totalPendencias = MOCK_DATA.reduce((sum, m) => sum + m.pendentes, 0);
const totalSolicitados = MOCK_DATA.reduce((sum, m) => sum + m.solicitados, 0);
const totalRecebidos = MOCK_DATA.reduce((sum, m) => sum + m.recebidos, 0);
const totalAll = MOCK_DATA.reduce((sum, m) => sum + m.total, 0);

function MiniBar({ month }: { month: MonthData }) {
  const w = 80;
  const pW = (month.pendentes / month.total) * w;
  const sW = (month.solicitados / month.total) * w;
  const rW = (month.recebidos / month.total) * w;
  return (
    <div className="flex h-1.5 overflow-hidden rounded-full" style={{ width: w }} data-testid={`minibar-${month.key}`}>
      {pW > 0 && <div className="bg-orange-500" style={{ width: pW }} />}
      {sW > 0 && <div className="bg-sky-500" style={{ width: sW }} />}
      {rW > 0 && <div className="bg-emerald-500" style={{ width: rW }} />}
    </div>
  );
}

function DaysText({ days }: { days: number }) {
  if (days === 0) return <span className="text-emerald-400">hoje</span>;
  return <span>{days}d</span>;
}

function MonthDetailView({ month, onBack }: { month: MonthData; onBack: () => void }) {
  const sorted = [...month.extratos].sort((a, b) => {
    const order: Record<ExtratoStatus, number> = { Pendente: 0, Solicitado: 1, Recebido: 2 };
    return order[a.status] - order[b.status] || b.days - a.days;
  });

  return (
    <div className="flex flex-col" data-testid="month-detail-view">
      <div className="flex items-center gap-3 border-b border-zinc-800 px-5 py-3">
        <button
          onClick={onBack}
          className="flex items-center justify-center rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
          data-testid="button-back-to-months"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-sm font-semibold capitalize text-zinc-200" data-testid="text-month-title">
          {month.label}
        </h2>
        <div className="ml-auto flex items-center gap-3">
          {month.pendentes > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-orange-400">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              {month.pendentes}
            </span>
          )}
          {month.solicitados > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-sky-400">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              {month.solicitados}
            </span>
          )}
          {month.recebidos > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {month.recebidos}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full" data-testid="detail-table">
          <thead>
            <tr className="border-b border-zinc-800/50">
              <th className="px-5 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Status</th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Cliente</th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Instituicao</th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Tipo</th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Metodo</th>
              <th className="px-5 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Tempo</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => {
              const sc = STATUS_CFG[e.status];
              const mc = METHOD_CFG[e.collectionMethod];
              return (
                <tr
                  key={e.id}
                  className="border-b border-zinc-800/30 transition-colors hover:bg-zinc-800/20"
                  data-testid={`extrato-row-${e.id}`}
                >
                  <td className="px-5 py-2">
                    <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </td>
                  <td className="max-w-[140px] truncate px-3 py-2 text-xs font-medium text-zinc-300">{e.clientName}</td>
                  <td className="px-3 py-2 text-xs text-zinc-500">{e.institution}</td>
                  <td className="px-3 py-2">
                    <span className="text-[10px] font-medium text-zinc-500">{e.accountType}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${mc.bg} ${mc.text}`}>
                      {e.collectionMethod}
                    </span>
                  </td>
                  <td className="px-5 py-2 text-right text-[11px] font-mono text-zinc-500">
                    <DaysText days={e.days} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
        className="flex w-full max-w-[720px] flex-col overflow-hidden rounded-lg border border-zinc-800 bg-[#1a1a1a] shadow-2xl shadow-black/60"
        style={{ maxHeight: "min(82vh, 680px)" }}
        data-testid="pendencias-modal"
      >
        {activeMonth ? (
          <>
            <MonthDetailView month={activeMonth} onBack={() => setSelectedMonth(null)} />
            <div className="flex items-center justify-end border-t border-zinc-800 px-5 py-3">
              <button
                onClick={() => setSelectedMonth(null)}
                className="rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                data-testid="button-close-detail"
              >
                Fechar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 px-5 py-4">
              <div>
                <h1 className="text-base font-semibold text-zinc-100" data-testid="text-modal-title">
                  Pendencias Historicas
                </h1>
                <p className="mt-0.5 text-xs text-zinc-500">5 meses com extratos pendentes</p>
              </div>
              <div className="flex items-center gap-3 pt-0.5">
                <div className="flex items-center gap-1.5" data-testid="badge-total-pendentes">
                  <AlertTriangle className="h-3 w-3 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-400">{totalPendencias}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-sky-400" />
                  <span className="text-xs font-semibold text-sky-400">{totalSolicitados}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">{totalRecebidos}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-b border-zinc-800/50 px-5 py-2">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <span className="h-2 w-2 rounded-full bg-orange-500" /> Pendente
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <span className="h-2 w-2 rounded-full bg-sky-500" /> Solicitado
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Recebido
              </div>
              <span className="ml-auto text-[10px] font-medium text-zinc-600">{totalAll} extratos</span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {MOCK_DATA.map((month, idx) => {
                const pctDone = Math.round(((month.recebidos) / month.total) * 100);
                const isLast = idx === MOCK_DATA.length - 1;
                return (
                  <button
                    key={month.key}
                    onClick={() => setSelectedMonth(month.key)}
                    className={`group flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-zinc-800/40 ${!isLast ? "border-b border-zinc-800/40" : ""}`}
                    data-testid={`month-card-${month.key}`}
                  >
                    <div className="w-[52px] shrink-0">
                      <span className="text-xs font-semibold text-zinc-300">{month.shortLabel}</span>
                    </div>

                    <div className="flex flex-1 flex-col gap-1.5">
                      <div className="flex items-center gap-3">
                        {month.pendentes > 0 && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-orange-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                            {month.pendentes}
                          </span>
                        )}
                        {month.solicitados > 0 && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-sky-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                            {month.solicitados}
                          </span>
                        )}
                        {month.recebidos > 0 && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {month.recebidos}
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-600">/ {month.total}</span>
                      </div>
                      <MiniBar month={month} />
                    </div>

                    <span className="text-[10px] font-medium tabular-nums text-zinc-600">{pctDone}%</span>

                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-700 transition-colors group-hover:text-zinc-400" />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end border-t border-zinc-800 px-5 py-3">
              <button
                className="rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
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
