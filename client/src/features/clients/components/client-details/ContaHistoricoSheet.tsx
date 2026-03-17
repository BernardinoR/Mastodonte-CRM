import { useState, useEffect } from "react";
import { Check, AlertTriangle, Plus, Landmark, ChevronDown, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { Sheet, SheetContent, SheetTitle } from "@/shared/components/ui/sheet";
import { Badge } from "@/shared/components/ui/badge";
import type { Conta } from "../../types/conta";
import type { ContaHistoricoEntry, ContaHistoricoStatus } from "../../types/contaHistorico";
import { getInstitutionColor } from "../../lib/institutionColors";
import { apiRequest } from "@/shared/lib/queryClient";

interface ContaHistoricoSheetProps {
  conta: Conta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<
  ContaHistoricoStatus,
  { icon: typeof Check; iconClass: string; badgeClass: string }
> = {
  Consolidado: {
    icon: Check,
    iconClass: "bg-emerald-950 text-emerald-400 border-emerald-800",
    badgeClass: "bg-emerald-950/50 text-emerald-400 border-emerald-800",
  },
  "Pedir Extrato": {
    icon: AlertTriangle,
    iconClass: "bg-red-950 text-red-400 border-red-800",
    badgeClass: "bg-red-950/50 text-red-400 border-red-800",
  },
  "Em Andamento": {
    icon: Check,
    iconClass: "bg-amber-950 text-amber-400 border-amber-800",
    badgeClass: "bg-amber-950/50 text-amber-400 border-amber-800",
  },
  Aguardando: {
    icon: Check,
    iconClass: "bg-zinc-800 text-zinc-400 border-zinc-700",
    badgeClass: "bg-zinc-800 text-zinc-400 border-zinc-700",
  },
};

function formatAtivoDesde(date?: string): string {
  if (!date) return "data desconhecida";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
}

const PAGE_SIZE = 10;

export function ContaHistoricoSheet({ conta, open, onOpenChange }: ContaHistoricoSheetProps) {
  const { getToken } = useAuth();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [historico, setHistorico] = useState<ContaHistoricoEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [conta?.id]);

  useEffect(() => {
    if (!conta?.id || !open) return;
    setLoading(true);
    (async () => {
      try {
        const token = await getToken();
        const res = await apiRequest("GET", `/api/contas/${conta.id}/historico`, undefined, {
          Authorization: `Bearer ${token}`,
        });
        const data = await res.json();
        setHistorico(data.historico);
      } catch {
        setHistorico([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [conta?.id, open, getToken]);

  if (!conta) return null;

  const visibleHistorico = historico.slice(0, visibleCount);
  const hasMore = historico.length > visibleCount;
  const color = getInstitutionColor(conta.institution.name);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-[450px] flex-col border-[#363b47] bg-[#1a1d23] p-0 sm:max-w-[450px]"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#363b47] px-5 py-4">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded ${color.bg} ${color.text} border ${color.border}`}
          >
            <Landmark className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <SheetTitle className="text-sm font-semibold text-foreground">
              Historico — {conta.institution.name}
            </SheetTitle>
            <p className="text-xs text-muted-foreground">Extratos Bancarios</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute bottom-3 left-[13px] top-3 w-px bg-[#363b47]" />

              <div className="space-y-5">
                {visibleHistorico.map((entry) => {
                  const config = statusConfig[entry.status];
                  const Icon = config.icon;

                  return (
                    <div key={entry.id} className="relative flex items-start gap-3">
                      <div
                        className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${config.iconClass}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-1 items-center justify-between pt-0.5">
                        <div>
                          <span className="text-sm font-medium text-foreground">
                            {entry.competencia}
                          </span>
                          {entry.description && (
                            <p className="text-xs text-muted-foreground">{entry.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className={`text-xs ${config.badgeClass}`}>
                          {entry.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}

                {hasMore && (
                  <div className="relative flex items-start gap-3">
                    <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#363b47] bg-[#22262e] text-muted-foreground">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </div>
                    <button
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      className="pt-0.5 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
                    >
                      Carregar mais
                    </button>
                  </div>
                )}

                {/* Last item - Conta adicionada */}
                <div className="relative flex items-start gap-3">
                  <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#363b47] bg-[#22262e] text-muted-foreground">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                  <div className="pt-0.5">
                    <span className="text-sm text-muted-foreground">
                      Conta adicionada em {formatAtivoDesde(conta.ativoDesde)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
