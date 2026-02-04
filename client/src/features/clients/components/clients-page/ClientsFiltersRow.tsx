import { useState, useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Upload,
  Download,
  Plus,
  X,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface ClientsFiltersRowProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewClient: () => void;
  onImportFile?: (file: File) => void;
  onExportClients?: () => void;
  onDownloadTemplate?: () => void;
}

export function ClientsFiltersRow({
  searchQuery,
  onSearchChange,
  onNewClient,
  onImportFile,
  onExportClients,
  onDownloadTemplate,
}: ClientsFiltersRowProps) {
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const acceptRef = useRef<string>("");

  const handleImportClick = (accept: string) => {
    acceptRef.current = accept;
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportFile) {
      onImportFile(file);
    }
  };

  return (
    <>
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

      {/* Filters Row */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Search Box */}
        <div className="flex max-w-[320px] flex-1 items-center gap-2 rounded-md border border-[#333333] bg-[#1a1a1a] px-3 py-2">
          <Search className="h-4 w-4 text-[#8c8c8c]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nome, email, telefone..."
            className="flex-1 border-none bg-transparent text-sm text-[#ededed] outline-none placeholder:text-[#666666]"
            data-testid="input-search-clients"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="text-[#8c8c8c] hover:text-[#ededed]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className={cn(
            "flex items-center gap-1.5 rounded-md border border-[#333333] bg-[#1a1a1a] px-3 py-2 text-[13px] transition-colors",
            showFilterPanel
              ? "border-[#3a5068] bg-[#243041] text-[#6db1d4]"
              : "text-[#8c8c8c] hover:border-[#444444] hover:text-[#ededed]",
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

        {/* Action Buttons */}
        <div className="ml-auto flex items-center gap-3">
          {/* Import Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-md bg-transparent px-4 py-2 text-sm text-[#8c8c8c] transition-colors hover:bg-[#212121] hover:text-[#ededed]">
                <Upload className="h-4 w-4" />
                Importar
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleImportClick(".csv")}>
                <FileText className="mr-2 h-4 w-4" />
                Importar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleImportClick(".xlsx,.xls")}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Importar Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Baixar Modelo Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export Button */}
          <button
            onClick={onExportClients}
            className="flex items-center gap-2 rounded-md bg-transparent px-4 py-2 text-sm text-[#8c8c8c] transition-colors hover:bg-[#212121] hover:text-[#ededed]"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>

          {/* New Client Button */}
          <button
            onClick={onNewClient}
            className="flex h-8 items-center gap-1.5 rounded-md border border-[#404040] bg-[#2a2a2a] px-3 text-sm font-medium text-white transition-colors hover:border-[#505050] hover:bg-[#333]"
            data-testid="button-newclient"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="mb-6 rounded-lg border border-[#333333] bg-[#1a1a1a] p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold">Filtros Avançados</span>
            <button
              onClick={() => setShowFilterPanel(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#8c8c8c] hover:text-[#ededed]"
            >
              <X className="h-3.5 w-3.5" />
              Limpar filtros
            </button>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {/* Consultor */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wide text-[#8c8c8c]">
                Consultor
              </label>
              <select className="cursor-pointer rounded-md border border-[#333333] bg-[#252525] px-3 py-2 text-[13px] text-[#ededed]">
                <option value="">Todos</option>
                <option value="rafael">Rafael Bernardino Silveira</option>
                <option value="ana">Ana Paula Santos</option>
              </select>
            </div>

            {/* AUM Mínimo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wide text-[#8c8c8c]">
                AUM Mínimo
              </label>
              <input
                type="text"
                placeholder="R$ 0"
                className="rounded-md border border-[#333333] bg-[#252525] px-3 py-2 text-[13px] text-[#ededed] outline-none placeholder:text-[#666666] focus:border-[#2eaadc]"
              />
            </div>

            {/* AUM Máximo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wide text-[#8c8c8c]">
                AUM Máximo
              </label>
              <input
                type="text"
                placeholder="R$ 100M"
                className="rounded-md border border-[#333333] bg-[#252525] px-3 py-2 text-[13px] text-[#ededed] outline-none placeholder:text-[#666666] focus:border-[#2eaadc]"
              />
            </div>

            {/* Cidade */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wide text-[#8c8c8c]">
                Cidade
              </label>
              <select className="cursor-pointer rounded-md border border-[#333333] bg-[#252525] px-3 py-2 text-[13px] text-[#ededed]">
                <option value="">Todas</option>
                <option value="sp">São Paulo</option>
                <option value="blumenau">Blumenau</option>
                <option value="rj">Rio de Janeiro</option>
              </select>
            </div>

            {/* Cliente Desde */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wide text-[#8c8c8c]">
                Cliente Desde
              </label>
              <input
                type="month"
                className="rounded-md border border-[#333333] bg-[#252525] px-3 py-2 text-[13px] text-[#ededed] outline-none focus:border-[#2eaadc]"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
