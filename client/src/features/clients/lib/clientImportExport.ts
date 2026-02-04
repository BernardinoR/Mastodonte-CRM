import * as XLSX from "xlsx";
import type { Address } from "../types/client";

// ============================================
// Types
// ============================================

export interface ClientImportRow {
  name: string;
  emails: string[];
  cpf: string;
  phone: string;
  status: string;
  patrimony: number | null;
  clientSince: string | null; // ISO date string
  foundationCode: string;
  address: Address;
}

export interface ValidationResult {
  valid: ClientImportRow[];
  invalid: { row: number; data: Record<string, string>; errors: string[] }[];
  warnings: string[];
}

// ============================================
// Column Mapping (PT-BR → DB fields)
// ============================================

const COLUMN_MAP: Record<string, string> = {
  Nome: "name",
  "E-mail": "emails",
  CPF: "cpf",
  Telefone: "phone",
  Status: "status",
  Patrimônio: "patrimony",
  "Cliente Desde": "clientSince",
  "Código Foundation": "foundationCode",
  Logradouro: "address.street",
  Complemento: "address.complement",
  Bairro: "address.neighborhood",
  Cidade: "address.city",
  Estado: "address.state",
  CEP: "address.zipCode",
};

const VALID_STATUSES = ["Ativo", "Prospect", "Distrato", "Inativo"];

const HEADERS_PT = Object.keys(COLUMN_MAP);

// ============================================
// Parsing Utilities
// ============================================

function normalizeHeader(header: string): string | null {
  const trimmed = header.trim();
  for (const ptHeader of HEADERS_PT) {
    if (trimmed.toLowerCase() === ptHeader.toLowerCase()) {
      return ptHeader;
    }
  }
  return null;
}

function parsePatrimony(value: string): number | null {
  if (!value || !value.trim()) return null;
  // Remove "R$", spaces, dots (thousand sep), replace comma with dot (decimal)
  const cleaned = value
    .replace(/R\$\s*/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseClientSince(value: string): string | null {
  if (!value || !value.trim()) return null;
  const trimmed = value.trim();

  // Try DD/MM/YYYY
  const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date.toISOString();
  }

  // Try YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) return date.toISOString();
  }

  return null;
}

function parseEmails(value: string): string[] {
  if (!value || !value.trim()) return [];
  return value
    .split(";")
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
}

// ============================================
// File Parsing
// ============================================

export async function parseFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(new Error("Arquivo vazio ou sem abas."));
          return;
        }
        const sheet = workbook.Sheets[sheetName];
        const jsonRows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
          defval: "",
          raw: false,
        });
        resolve(jsonRows);
      } catch (err) {
        reject(new Error("Erro ao ler o arquivo. Verifique se é um CSV ou Excel válido."));
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
    reader.readAsArrayBuffer(file);
  });
}

// ============================================
// Validation
// ============================================

export function validateRows(rawRows: Record<string, string>[]): ValidationResult {
  const valid: ClientImportRow[] = [];
  const invalid: ValidationResult["invalid"] = [];
  const warnings: string[] = [];

  if (rawRows.length === 0) {
    warnings.push("O arquivo não contém dados.");
    return { valid, invalid, warnings };
  }

  // Map headers from raw data
  const sampleRow = rawRows[0];
  const rawHeaders = Object.keys(sampleRow);
  const headerMap: Record<string, string> = {};

  for (const rawHeader of rawHeaders) {
    const normalized = normalizeHeader(rawHeader);
    if (normalized) {
      headerMap[rawHeader] = COLUMN_MAP[normalized];
    }
  }

  if (!Object.values(headerMap).includes("name")) {
    warnings.push('Coluna "Nome" não encontrada. Verifique os headers do arquivo.');
    return { valid, invalid, warnings };
  }

  if (!Object.values(headerMap).includes("emails")) {
    warnings.push('Coluna "E-mail" não encontrada. Verifique os headers do arquivo.');
    return { valid, invalid, warnings };
  }

  for (let i = 0; i < rawRows.length; i++) {
    const raw = rawRows[i];
    const errors: string[] = [];

    // Extract mapped values
    const mapped: Record<string, string> = {};
    for (const [rawKey, dbField] of Object.entries(headerMap)) {
      mapped[dbField] = (raw[rawKey] || "").trim();
    }

    // Required: name
    if (!mapped["name"]) {
      errors.push("Nome é obrigatório");
    }

    // Required: emails
    const emails = parseEmails(mapped["emails"] || "");
    if (emails.length === 0) {
      errors.push("E-mail é obrigatório");
    }

    // Validate status if provided
    const status = mapped["status"] || "Ativo";
    if (mapped["status"] && !VALID_STATUSES.includes(status)) {
      errors.push(`Status inválido: "${status}". Use: ${VALID_STATUSES.join(", ")}`);
    }

    // Validate clientSince format if provided
    const rawClientSince = mapped["clientSince"] || "";
    let clientSince: string | null = null;
    if (rawClientSince) {
      clientSince = parseClientSince(rawClientSince);
      if (!clientSince) {
        errors.push(
          `Data "Cliente Desde" inválida: "${rawClientSince}". Use DD/MM/YYYY ou YYYY-MM-DD`,
        );
      }
    }

    if (errors.length > 0) {
      invalid.push({
        row: i + 2, // +2 for header row + 1-based index
        data: raw,
        errors,
      });
    } else {
      valid.push({
        name: mapped["name"],
        emails,
        cpf: mapped["cpf"] || "",
        phone: mapped["phone"] || "",
        status: mapped["status"] || "Ativo",
        patrimony: parsePatrimony(mapped["patrimony"] || ""),
        clientSince,
        foundationCode: mapped["foundationCode"] || "",
        address: {
          street: mapped["address.street"] || "",
          complement: mapped["address.complement"] || "",
          neighborhood: mapped["address.neighborhood"] || "",
          city: mapped["address.city"] || "",
          state: mapped["address.state"] || "",
          zipCode: mapped["address.zipCode"] || "",
        },
      });
    }
  }

  return { valid, invalid, warnings };
}

// ============================================
// Template Generation
// ============================================

export function generateTemplate(): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Clientes (headers + example row)
  const exampleData = [
    {
      Nome: "João da Silva",
      "E-mail": "joao@email.com;joao.pessoal@email.com",
      CPF: "123.456.789-00",
      Telefone: "+55 (11) 98888-7777",
      Status: "Ativo",
      Patrimônio: "R$ 1.500.000,00",
      "Cliente Desde": "15/03/2022",
      "Código Foundation": "FDN-001",
      Logradouro: "Rua das Flores, 123",
      Complemento: "Apt 45",
      Bairro: "Jardim Paulista",
      Cidade: "São Paulo",
      Estado: "SP",
      CEP: "01234-567",
    },
  ];

  const clientsSheet = XLSX.utils.json_to_sheet(exampleData);

  // Set column widths
  clientsSheet["!cols"] = [
    { wch: 25 }, // Nome
    { wch: 40 }, // E-mail
    { wch: 18 }, // CPF
    { wch: 22 }, // Telefone
    { wch: 12 }, // Status
    { wch: 20 }, // Patrimônio
    { wch: 16 }, // Cliente Desde
    { wch: 20 }, // Código Foundation
    { wch: 30 }, // Logradouro
    { wch: 20 }, // Complemento
    { wch: 20 }, // Bairro
    { wch: 20 }, // Cidade
    { wch: 8 }, // Estado
    { wch: 12 }, // CEP
  ];

  XLSX.utils.book_append_sheet(workbook, clientsSheet, "Clientes");

  // Sheet 2: Instruções
  const instructions = [
    ["Instruções de Preenchimento"],
    [""],
    ["Campos Obrigatórios:"],
    ["  - Nome: Nome completo do cliente"],
    ["  - E-mail: Pelo menos um e-mail válido. Para múltiplos, separe com ponto-e-vírgula (;)"],
    [""],
    ["Campos Opcionais:"],
    ["  - CPF: Formato livre (com ou sem pontuação)"],
    ["  - Telefone: Formato livre (ex: +55 11 98888-7777)"],
    ["  - Status: Ativo, Prospect, Distrato ou Inativo (padrão: Ativo)"],
    ["  - Patrimônio: Aceita 'R$ 1.234.567,89' ou número puro (ex: 1234567.89)"],
    ["  - Cliente Desde: Aceita DD/MM/YYYY ou YYYY-MM-DD"],
    ["  - Código Foundation: Código identificador no sistema Foundation"],
    ["  - Endereço: Logradouro, Complemento, Bairro, Cidade, Estado, CEP"],
    [""],
    ["Dicas:"],
    ["  - A primeira linha deve conter os headers exatamente como na aba 'Clientes'"],
    ["  - Remova a linha de exemplo antes de importar"],
    ["  - Salve como .xlsx ou .csv para importar"],
  ];

  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
  instructionsSheet["!cols"] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instruções");

  return workbook;
}

// ============================================
// Export Generation
// ============================================

interface ExportableClient {
  name: string;
  emails: string[];
  cpf: string;
  phone: string;
  status: string;
  patrimony?: number | string | null;
  clientSince: string;
  foundationCode: string;
  address: Address;
}

export function generateExport(clients: ExportableClient[]): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  const rows = clients.map((client) => ({
    Nome: client.name,
    "E-mail": client.emails.join(";"),
    CPF: client.cpf || "",
    Telefone: client.phone || "",
    Status: client.status || "",
    Patrimônio: client.patrimony != null ? String(client.patrimony) : "",
    "Cliente Desde": client.clientSince || "",
    "Código Foundation": client.foundationCode || "",
    Logradouro: client.address?.street || "",
    Complemento: client.address?.complement || "",
    Bairro: client.address?.neighborhood || "",
    Cidade: client.address?.city || "",
    Estado: client.address?.state || "",
    CEP: client.address?.zipCode || "",
  }));

  const sheet = XLSX.utils.json_to_sheet(rows);

  sheet["!cols"] = [
    { wch: 25 },
    { wch: 40 },
    { wch: 18 },
    { wch: 22 },
    { wch: 12 },
    { wch: 20 },
    { wch: 16 },
    { wch: 20 },
    { wch: 30 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 8 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(workbook, sheet, "Clientes");

  return workbook;
}

// ============================================
// Download Trigger
// ============================================

export function triggerDownload(workbook: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(workbook, filename);
}
