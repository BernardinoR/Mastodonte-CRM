import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Progress } from "@/shared/components/ui/progress";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  FileSpreadsheet,
  X,
} from "lucide-react";
import type { ImportExportState, ImportResult } from "../hooks/useClientImportExport";
import type { ValidationResult } from "../lib/clientImportExport";

interface ImportClientsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: ImportExportState;
  validation: ValidationResult | null;
  importResult: ImportResult | null;
  errorMessage: string;
  progress: number;
  onConfirmImport: () => void;
  onReset: () => void;
}

export function ImportClientsDialog({
  open,
  onOpenChange,
  state,
  validation,
  importResult,
  errorMessage,
  progress,
  onConfirmImport,
  onReset,
}: ImportClientsDialogProps) {
  const handleClose = () => {
    onReset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Clientes
          </DialogTitle>
          <DialogDescription>
            {state === "parsing" && "Processando arquivo..."}
            {state === "previewing" && "Revise os dados antes de importar"}
            {state === "importing" && "Importando clientes..."}
            {state === "done" && "Importação concluída"}
            {state === "error" && "Erro na importação"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Parsing state */}
          {state === "parsing" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#6db1d4]" />
              <p className="text-sm text-[#8c8c8c]">Processando arquivo...</p>
            </div>
          )}

          {/* Preview state */}
          {state === "previewing" && validation && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex gap-4">
                <div className="flex-1 rounded-lg border border-[#2d4a2d] bg-[#1a2e1a] p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-green-300">Válidos</span>
                  </div>
                  <span className="text-2xl font-bold text-green-200">
                    {validation.valid.length}
                  </span>
                </div>
                {validation.invalid.length > 0 && (
                  <div className="flex-1 rounded-lg border border-[#4a2d2d] bg-[#2e1a1a] p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-medium text-red-300">Com erros</span>
                    </div>
                    <span className="text-2xl font-bold text-red-200">
                      {validation.invalid.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Warnings */}
              {validation.warnings.length > 0 && (
                <div className="rounded-lg border border-[#4a432d] bg-[#2e2a1a] p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-300">Avisos</span>
                  </div>
                  <ul className="space-y-1">
                    {validation.warnings.map((w, i) => (
                      <li key={i} className="text-xs text-yellow-200">
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview of valid rows */}
              {validation.valid.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#8c8c8c]">
                    Preview ({Math.min(validation.valid.length, 5)} de {validation.valid.length})
                  </p>
                  <div className="overflow-hidden rounded-lg border border-[#333333]">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[#333333] bg-[#1a1a1a]">
                          <th className="px-3 py-2 text-left font-medium text-[#8c8c8c]">Nome</th>
                          <th className="px-3 py-2 text-left font-medium text-[#8c8c8c]">E-mail</th>
                          <th className="px-3 py-2 text-left font-medium text-[#8c8c8c]">Status</th>
                          <th className="px-3 py-2 text-left font-medium text-[#8c8c8c]">Cidade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validation.valid.slice(0, 5).map((row, i) => (
                          <tr key={i} className="border-b border-[#252525] last:border-0">
                            <td className="px-3 py-2 text-[#ededed]">{row.name}</td>
                            <td className="px-3 py-2 text-[#b0b0b0]">{row.emails[0]}</td>
                            <td className="px-3 py-2 text-[#b0b0b0]">{row.status}</td>
                            <td className="px-3 py-2 text-[#b0b0b0]">{row.address.city || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Invalid rows detail */}
              {validation.invalid.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#8c8c8c]">
                    Linhas com erros
                  </p>
                  <div className="max-h-32 overflow-y-auto rounded-lg border border-[#333333]">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="sticky top-0 border-b border-[#333333] bg-[#1a1a1a]">
                          <th className="w-16 px-3 py-2 text-left font-medium text-[#8c8c8c]">
                            Linha
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-[#8c8c8c]">Erros</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validation.invalid.map((inv, i) => (
                          <tr key={i} className="border-b border-[#252525] last:border-0">
                            <td className="px-3 py-2 font-mono text-red-300">{inv.row}</td>
                            <td className="px-3 py-2 text-red-200">{inv.errors.join("; ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Importing state */}
          {state === "importing" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#6db1d4]" />
              <p className="text-sm text-[#8c8c8c]">Importando clientes...</p>
              <div className="w-full max-w-xs">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          )}

          {/* Done state */}
          {state === "done" && importResult && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
                <p className="text-lg font-medium text-[#ededed]">
                  {importResult.inserted} cliente{importResult.inserted !== 1 ? "s" : ""} importado
                  {importResult.inserted !== 1 ? "s" : ""} com sucesso
                </p>
                {importResult.totalInvalid > 0 && (
                  <p className="text-sm text-[#8c8c8c]">
                    {importResult.totalInvalid} linha{importResult.totalInvalid !== 1 ? "s" : ""}{" "}
                    ignorada{importResult.totalInvalid !== 1 ? "s" : ""} por erros de validação
                  </p>
                )}
              </div>
              {importResult.errors.length > 0 && (
                <div className="rounded-lg border border-[#4a2d2d] bg-[#2e1a1a] p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span className="text-sm font-medium text-red-300">Erros de inserção</span>
                  </div>
                  <ul className="space-y-1">
                    {importResult.errors.map((e, i) => (
                      <li key={i} className="text-xs text-red-200">
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Error state */}
          {state === "error" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <AlertCircle className="h-10 w-10 text-red-400" />
              <p className="text-center text-sm text-red-300">{errorMessage}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {state === "previewing" && (
            <div className="flex w-full justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm text-[#8c8c8c] transition-colors hover:text-[#ededed]"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmImport}
                disabled={!validation || validation.valid.length === 0}
                className="rounded-md border border-[#404040] bg-[#2a2a2a] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#505050] hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Importar {validation?.valid.length || 0} cliente
                {(validation?.valid.length || 0) !== 1 ? "s" : ""}
              </button>
            </div>
          )}
          {(state === "done" || state === "error") && (
            <button
              onClick={handleClose}
              className="rounded-md border border-[#404040] bg-[#2a2a2a] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#505050] hover:bg-[#333]"
            >
              Fechar
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
