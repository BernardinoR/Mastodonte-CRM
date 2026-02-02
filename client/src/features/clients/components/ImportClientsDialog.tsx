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
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
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
              <Loader2 className="w-8 h-8 text-[#6db1d4] animate-spin" />
              <p className="text-sm text-[#8c8c8c]">Processando arquivo...</p>
            </div>
          )}

          {/* Preview state */}
          {state === "previewing" && validation && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex gap-4">
                <div className="flex-1 bg-[#1a2e1a] border border-[#2d4a2d] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-300">
                      Válidos
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-green-200">
                    {validation.valid.length}
                  </span>
                </div>
                {validation.invalid.length > 0 && (
                  <div className="flex-1 bg-[#2e1a1a] border border-[#4a2d2d] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium text-red-300">
                        Com erros
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-red-200">
                      {validation.invalid.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Warnings */}
              {validation.warnings.length > 0 && (
                <div className="bg-[#2e2a1a] border border-[#4a432d] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-300">
                      Avisos
                    </span>
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
                  <p className="text-xs text-[#8c8c8c] mb-2 font-medium uppercase tracking-wide">
                    Preview ({Math.min(validation.valid.length, 5)} de {validation.valid.length})
                  </p>
                  <div className="border border-[#333333] rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#1a1a1a] border-b border-[#333333]">
                          <th className="text-left px-3 py-2 text-[#8c8c8c] font-medium">Nome</th>
                          <th className="text-left px-3 py-2 text-[#8c8c8c] font-medium">E-mail</th>
                          <th className="text-left px-3 py-2 text-[#8c8c8c] font-medium">Status</th>
                          <th className="text-left px-3 py-2 text-[#8c8c8c] font-medium">Cidade</th>
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
                  <p className="text-xs text-[#8c8c8c] mb-2 font-medium uppercase tracking-wide">
                    Linhas com erros
                  </p>
                  <div className="max-h-32 overflow-y-auto border border-[#333333] rounded-lg">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#1a1a1a] border-b border-[#333333] sticky top-0">
                          <th className="text-left px-3 py-2 text-[#8c8c8c] font-medium w-16">Linha</th>
                          <th className="text-left px-3 py-2 text-[#8c8c8c] font-medium">Erros</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validation.invalid.map((inv, i) => (
                          <tr key={i} className="border-b border-[#252525] last:border-0">
                            <td className="px-3 py-2 text-red-300 font-mono">{inv.row}</td>
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
              <Loader2 className="w-8 h-8 text-[#6db1d4] animate-spin" />
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
                <CheckCircle2 className="w-10 h-10 text-green-400" />
                <p className="text-lg font-medium text-[#ededed]">
                  {importResult.inserted} cliente{importResult.inserted !== 1 ? "s" : ""} importado{importResult.inserted !== 1 ? "s" : ""} com sucesso
                </p>
                {importResult.totalInvalid > 0 && (
                  <p className="text-sm text-[#8c8c8c]">
                    {importResult.totalInvalid} linha{importResult.totalInvalid !== 1 ? "s" : ""} ignorada{importResult.totalInvalid !== 1 ? "s" : ""} por erros de validação
                  </p>
                )}
              </div>
              {importResult.errors.length > 0 && (
                <div className="bg-[#2e1a1a] border border-[#4a2d2d] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-red-300">
                      Erros de inserção
                    </span>
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
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-sm text-red-300 text-center">{errorMessage}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {state === "previewing" && (
            <div className="flex gap-3 w-full justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm text-[#8c8c8c] hover:text-[#ededed] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmImport}
                disabled={!validation || validation.valid.length === 0}
                className="px-4 py-2 text-sm font-medium bg-[#2a2a2a] border border-[#404040] text-white hover:bg-[#333] hover:border-[#505050] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Importar {validation?.valid.length || 0} cliente{(validation?.valid.length || 0) !== 1 ? "s" : ""}
              </button>
            </div>
          )}
          {(state === "done" || state === "error") && (
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium bg-[#2a2a2a] border border-[#404040] text-white hover:bg-[#333] hover:border-[#505050] rounded-md transition-colors"
            >
              Fechar
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
