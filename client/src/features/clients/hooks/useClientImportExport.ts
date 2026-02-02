import { useState, useCallback, useRef } from "react";
import { useClients } from "../contexts/ClientsContext";
import {
  parseFile,
  validateRows,
  generateTemplate,
  generateExport,
  triggerDownload,
  type ClientImportRow,
  type ValidationResult,
} from "../lib/clientImportExport";

export type ImportExportState =
  | "idle"
  | "parsing"
  | "previewing"
  | "importing"
  | "done"
  | "error";

export interface ImportResult {
  inserted: number;
  errors: string[];
  totalValid: number;
  totalInvalid: number;
}

export function useClientImportExport() {
  const { clients, bulkInsertClients } = useClients();

  const [state, setState] = useState<ImportExportState>("idle");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [progress, setProgress] = useState(0);

  const validRowsRef = useRef<ClientImportRow[]>([]);

  const reset = useCallback(() => {
    setState("idle");
    setValidation(null);
    setImportResult(null);
    setErrorMessage("");
    setProgress(0);
    validRowsRef.current = [];
  }, []);

  const handleFileSelected = useCallback(async (file: File) => {
    try {
      setState("parsing");
      setErrorMessage("");

      const rawRows = await parseFile(file);
      const result = validateRows(rawRows);

      if (result.warnings.length > 0 && result.valid.length === 0) {
        setState("error");
        setErrorMessage(result.warnings.join(". "));
        return;
      }

      validRowsRef.current = result.valid;
      setValidation(result);
      setState("previewing");
    } catch (err) {
      setState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Erro ao processar o arquivo."
      );
    }
  }, []);

  const confirmImport = useCallback(async () => {
    const rows = validRowsRef.current;
    if (rows.length === 0) return;

    setState("importing");
    setProgress(0);

    const BATCH_SIZE = 50;
    const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

    const result = await bulkInsertClients(rows);

    // Simulate progress reaching 100%
    setProgress(100);

    setImportResult({
      inserted: result.inserted,
      errors: result.errors,
      totalValid: rows.length,
      totalInvalid: validation?.invalid.length || 0,
    });
    setState("done");
  }, [bulkInsertClients, validation]);

  const exportClients = useCallback(() => {
    if (clients.length === 0) return;

    const workbook = generateExport(clients);
    const date = new Date().toISOString().split("T")[0];
    triggerDownload(workbook, `clientes_export_${date}.xlsx`);
  }, [clients]);

  const downloadTemplate = useCallback(() => {
    const workbook = generateTemplate();
    triggerDownload(workbook, "modelo_importacao_clientes.xlsx");
  }, []);

  return {
    state,
    validation,
    importResult,
    errorMessage,
    progress,
    handleFileSelected,
    confirmImport,
    exportClients,
    downloadTemplate,
    reset,
  };
}
