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
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Filters Row */}
      <div className="flex items-center gap-3 mb-6 flex-wrap justify-between">
        {/* Search Box */}
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#333333] rounded-md px-3 py-2 flex-1 max-w-[320px]">
          <Search className="w-4 h-4 text-[#8c8c8c]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nome, email, telefone..."
            className="bg-transparent border-none text-[#ededed] text-sm flex-1 outline-none placeholder:text-[#666666]"
            data-testid="input-search-clients"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-[#8c8c8c] hover:text-[#ededed]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 bg-[#1a1a1a] border border-[#333333] rounded-md text-[13px] transition-colors",
            showFilterPanel
              ? "bg-[#243041] border-[#3a5068] text-[#6db1d4]"
              : "text-[#8c8c8c] hover:border-[#444444] hover:text-[#ededed]"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Import Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-transparent text-[#8c8c8c] hover:bg-[#212121] hover:text-[#ededed] rounded-md text-sm transition-colors">
                <Upload className="w-4 h-4" />
                Importar
                <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleImportClick(".csv")}>
                <FileText className="w-4 h-4 mr-2" />
                Importar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleImportClick(".xlsx,.xls")}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Importar Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Baixar Modelo Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export Button */}
          <button
            onClick={onExportClients}
            className="flex items-center gap-2 px-4 py-2 bg-transparent text-[#8c8c8c] hover:bg-[#212121] hover:text-[#ededed] rounded-md text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>

          {/* New Client Button */}
          <button
            onClick={onNewClient}
            className="flex items-center gap-1.5 px-3 h-8 rounded-md text-sm font-medium bg-[#2a2a2a] border border-[#404040] text-white hover:bg-[#333] hover:border-[#505050] transition-colors"
            data-testid="button-newclient"
          >
            <Plus className="w-4 h-4" />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold">Filtros Avançados</span>
            <button
              onClick={() => setShowFilterPanel(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[#8c8c8c] hover:text-[#ededed] text-xs"
            >
              <X className="w-3.5 h-3.5" />
              Limpar filtros
            </button>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {/* Consultor */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-[#8c8c8c] uppercase tracking-wide">
                Consultor
              </label>
              <select className="bg-[#252525] border border-[#333333] rounded-md px-3 py-2 text-[13px] text-[#ededed] cursor-pointer">
                <option value="">Todos</option>
                <option value="rafael">Rafael Bernardino Silveira</option>
                <option value="ana">Ana Paula Santos</option>
              </select>
            </div>

            {/* AUM Mínimo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-[#8c8c8c] uppercase tracking-wide">
                AUM Mínimo
              </label>
              <input
                type="text"
                placeholder="R$ 0"
                className="bg-[#252525] border border-[#333333] rounded-md px-3 py-2 text-[13px] text-[#ededed] placeholder:text-[#666666] outline-none focus:border-[#2eaadc]"
              />
            </div>

            {/* AUM Máximo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-[#8c8c8c] uppercase tracking-wide">
                AUM Máximo
              </label>
              <input
                type="text"
                placeholder="R$ 100M"
                className="bg-[#252525] border border-[#333333] rounded-md px-3 py-2 text-[13px] text-[#ededed] placeholder:text-[#666666] outline-none focus:border-[#2eaadc]"
              />
            </div>

            {/* Cidade */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-[#8c8c8c] uppercase tracking-wide">
                Cidade
              </label>
              <select className="bg-[#252525] border border-[#333333] rounded-md px-3 py-2 text-[13px] text-[#ededed] cursor-pointer">
                <option value="">Todas</option>
                <option value="sp">São Paulo</option>
                <option value="blumenau">Blumenau</option>
                <option value="rj">Rio de Janeiro</option>
              </select>
            </div>

            {/* Cliente Desde */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-[#8c8c8c] uppercase tracking-wide">
                Cliente Desde
              </label>
              <input
                type="month"
                className="bg-[#252525] border border-[#333333] rounded-md px-3 py-2 text-[13px] text-[#ededed] outline-none focus:border-[#2eaadc]"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
