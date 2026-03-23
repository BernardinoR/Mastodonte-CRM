import { useState } from "react";
import { Upload, FileText, X, ChevronDown } from "lucide-react";

type FileSlot = {
  label: string;
  file: File | null;
};

const CURRENCIES = ["BRL", "USD", "EUR", "GBP", "CHF"] as const;

function CurrencySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className="flex h-9 w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/60 px-3 text-sm text-zinc-200 transition-colors hover:border-zinc-700"
        onClick={() => setOpen(!open)}
        data-testid="select-currency"
      >
        <span>{value}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-10 z-50 rounded-md border border-zinc-800 bg-[#1a1a1a] py-1 shadow-xl shadow-black/40">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              className={`flex w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-zinc-800/60 ${c === value ? "text-zinc-100" : "text-zinc-400"}`}
              onClick={() => { onChange(c); setOpen(false); }}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UploadZone({
  slot,
  onDrop,
  onSelect,
  onRemove,
}: {
  slot: FileSlot;
  onDrop: (e: React.DragEvent) => void;
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  if (slot.file) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/10">
          <FileText className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-zinc-200">{slot.file.name}</p>
          <p className="text-[11px] text-zinc-600">{(slot.file.size / 1024).toFixed(0)} KB</p>
        </div>
        <button
          onClick={onRemove}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-400"
          data-testid="button-remove-file"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed px-4 py-5 transition-colors ${
        dragOver
          ? "border-orange-400/60 bg-orange-400/5"
          : "border-zinc-700/60 bg-zinc-900/30"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); onDrop(e); }}
    >
      <Upload className="h-5 w-5 text-zinc-600" />
      <p className="text-xs text-zinc-500">
        Arraste o PDF ou{" "}
        <label className="cursor-pointer text-zinc-300 underline decoration-zinc-600 underline-offset-2 transition-colors hover:text-zinc-100">
          selecione
          <input type="file" accept=".pdf" className="hidden" onChange={onSelect} />
        </label>
      </p>
    </div>
  );
}

function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">{label}</span>
      <div className="text-sm text-zinc-300">{children}</div>
    </div>
  );
}

function ConsolidarModal({ slotCount }: { slotCount: 1 | 2 }) {
  const [currency, setCurrency] = useState("BRL");
  const initialSlots: FileSlot[] = slotCount === 1
    ? [{ label: "Extrato 1", file: null }]
    : [{ label: "Extrato 1", file: null }, { label: "Extrato 2", file: null }];
  const [slots, setSlots] = useState<FileSlot[]>(initialSlots);

  const updateSlotFile = (index: number, file: File | null) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, file } : s)));
  };

  const handleDrop = (index: number, e: React.DragEvent) => {
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") {
      updateSlotFile(index, dropped);
    }
  };

  const handleSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) updateSlotFile(index, selected);
  };

  const mockExtrato = {
    institution: "Avenue",
    institutionInitial: "A",
    clientName: "Marco Alexandre Rodrigues Oliveira",
    clientInitials: "MO",
    referenceLabel: "Fevereiro 2026",
    accountName: "Avenue Securities LLC",
  };

  const hasFiles = slots.some((s) => s.file !== null);

  return (
    <div
      className="flex w-full max-w-[520px] flex-col overflow-hidden rounded-lg border border-zinc-800 bg-[#1a1a1a] shadow-2xl shadow-black/60"
      data-testid="consolidar-modal"
    >
      <div className="border-b border-zinc-800/60 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-100" data-testid="text-modal-title">
            Consolidar Extrato
          </h2>
          <div className="flex h-8 items-center rounded-md bg-zinc-800/60 px-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-orange-500/20 text-[10px] font-bold text-orange-400">
              {mockExtrato.institutionInitial}
            </span>
            <span className="ml-1.5 text-sm font-medium text-zinc-300">{mockExtrato.institution}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
          <InfoField label="Cliente">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-800 text-[9px] font-bold text-zinc-400">
                {mockExtrato.clientInitials}
              </span>
              <span className="truncate">{mockExtrato.clientName}</span>
            </div>
          </InfoField>
          <InfoField label="Competencia">
            <span className="capitalize">{mockExtrato.referenceLabel}</span>
          </InfoField>
          <InfoField label="Nome da Conta">
            {mockExtrato.accountName}
          </InfoField>
          <InfoField label="Moeda">
            <CurrencySelect value={currency} onChange={setCurrency} />
          </InfoField>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-6 py-4">
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
          Anexar Extratos ({slots.length})
        </span>
        {slots.map((slot, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <span className="text-xs text-zinc-500">{slot.label}</span>
            <UploadZone
              slot={slot}
              onDrop={(e) => handleDrop(i, e)}
              onSelect={(e) => handleSelect(i, e)}
              onRemove={() => updateSlotFile(i, null)}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800/60 px-6 py-3">
        <button
          className="rounded-md px-4 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
          data-testid="button-cancel"
        >
          Cancelar
        </button>
        <button
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            hasFiles
              ? "bg-orange-500/15 text-orange-400 hover:bg-orange-500/25"
              : "bg-zinc-800/60 text-zinc-600 cursor-not-allowed"
          }`}
          disabled={!hasFiles}
          data-testid="button-consolidar"
        >
          Enviar e Consolidar
        </button>
      </div>
    </div>
  );
}

export default function MockupConsolidarExtrato() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-10 bg-[#111] p-6" data-testid="mockup-consolidar-wrapper">
      <div className="flex flex-col items-center gap-3">
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">1 Anexo</span>
        <ConsolidarModal slotCount={1} />
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">2 Anexos</span>
        <ConsolidarModal slotCount={2} />
      </div>
    </div>
  );
}
