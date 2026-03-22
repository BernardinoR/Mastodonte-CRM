import { ChevronRight } from "lucide-react";

interface MonthData {
  key: string;
  label: string;
  pendentes: number;
  solicitados: number;
  recebidos: number;
  total: number;
}

const MOCK_DATA: MonthData[] = [
  { key: "01/2026", label: "Janeiro 2026", pendentes: 6, solicitados: 3, recebidos: 1, total: 10 },
  { key: "12/2025", label: "Dezembro 2025", pendentes: 4, solicitados: 3, recebidos: 1, total: 8 },
  { key: "11/2025", label: "Novembro 2025", pendentes: 2, solicitados: 4, recebidos: 1, total: 7 },
  { key: "10/2025", label: "Outubro 2025", pendentes: 1, solicitados: 1, recebidos: 3, total: 5 },
  { key: "09/2025", label: "Setembro 2025", pendentes: 0, solicitados: 2, recebidos: 3, total: 5 },
  { key: "08/2025", label: "Agosto 2025", pendentes: 0, solicitados: 0, recebidos: 4, total: 4 },
  { key: "07/2025", label: "Julho 2025", pendentes: 0, solicitados: 1, recebidos: 5, total: 6 },
];

const totalAll = MOCK_DATA.reduce((sum, m) => sum + m.total, 0);
const totalRecebidos = MOCK_DATA.reduce((sum, m) => sum + m.recebidos, 0);

function CountCell({ value, color }: { value: number; color: string }) {
  if (value === 0) return <span className="w-5 text-center text-[11px] tabular-nums text-zinc-700">-</span>;
  return (
    <span className={`flex w-5 items-center justify-center text-[11px] font-medium tabular-nums ${color}`}>
      {value}
    </span>
  );
}

export default function MockupPendenciasHistoricas() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111] p-6" data-testid="mockup-pendencias-wrapper">
      <div
        className="flex w-full max-w-[480px] flex-col overflow-hidden rounded-lg border border-zinc-800 bg-[#1a1a1a] shadow-2xl shadow-black/60"
        data-testid="pendencias-modal"
      >
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

        <div className="flex items-center gap-1 border-b border-zinc-800/40 px-5 py-2">
          <span className="flex-1 text-[10px] font-medium uppercase tracking-wider text-zinc-600">Mes</span>
          <div className="flex items-center gap-3">
            <span className="flex w-5 items-center justify-center" title="Pendentes">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            </span>
            <span className="flex w-5 items-center justify-center" title="Solicitados">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            </span>
            <span className="flex w-5 items-center justify-center" title="Recebidos">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
          </div>
          <span className="w-8" />
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: `${5 * 48}px` }}>
          {MOCK_DATA.map((month) => (
            <button
              key={month.key}
              className="group flex w-full items-center gap-1 border-b border-zinc-800/30 px-5 py-3 text-left transition-colors hover:bg-zinc-800/30"
              data-testid={`month-card-${month.key}`}
            >
              <span className="flex-1 text-[13px] text-zinc-300">
                {month.label.split(" ")[0]}
                <span className="ml-1 text-zinc-600">{month.label.split(" ")[1]}</span>
              </span>

              <div className="flex items-center gap-3">
                <CountCell value={month.pendentes} color="text-orange-400" />
                <CountCell value={month.solicitados} color="text-sky-400" />
                <CountCell value={month.recebidos} color="text-emerald-400" />
              </div>

              <ChevronRight className="ml-2 h-3.5 w-3.5 shrink-0 text-zinc-700 transition-colors group-hover:text-zinc-400" />
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
      </div>
    </div>
  );
}
