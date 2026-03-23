import { useState, useEffect } from "react";
import { Upload, FileText, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Extrato } from "../types/extrato";

type FileSlot = {
  label: string;
  file: File | null;
};

interface ConsolidarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extrato: Extrato | null;
  onConfirm: (extratoId: string) => void;
}

function getSlotCount(extrato: Extrato): number {
  return extrato.attachmentCount;
}

function buildSlots(count: number): FileSlot[] {
  return Array.from({ length: count }, (_, i) => ({
    label: `Extrato ${i + 1}`,
    file: null,
  }));
}

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
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
          <p className="truncate text-sm text-zinc-200" data-testid="text-file-name">
            {slot.file.name}
          </p>
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
        dragOver ? "border-orange-400/60 bg-orange-400/5" : "border-zinc-700/60 bg-zinc-900/30"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onDrop(e);
      }}
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
      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
        {label}
      </span>
      <div className="text-sm text-zinc-300">{children}</div>
    </div>
  );
}

export function ConsolidarModal({ open, onOpenChange, extrato, onConfirm }: ConsolidarModalProps) {
  const [currency, setCurrency] = useState("BRL");
  const slotCount = extrato ? getSlotCount(extrato) : 1;
  const [slots, setSlots] = useState<FileSlot[]>(() => buildSlots(slotCount));

  useEffect(() => {
    if (extrato) {
      setSlots(buildSlots(getSlotCount(extrato)));
      setCurrency("BRL");
    }
  }, [extrato?.id]);

  if (!extrato) return null;

  const [mm, yyyy] = extrato.referenceMonth.split("/");
  const referenceDate = new Date(parseInt(yyyy), parseInt(mm) - 1, 1);
  const referenceLabel = format(referenceDate, "MMMM yyyy", { locale: ptBR });
  const institutionInitial = extrato.institution.charAt(0).toUpperCase();

  const updateSlotFile = (index: number, file: File | null) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, file } : s)));
  };

  const handleDrop = (index: number, e: React.DragEvent) => {
    const dropped = e.dataTransfer.files[0];
    if (dropped && isPdf(dropped)) {
      updateSlotFile(index, dropped);
    }
  };

  const handleSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && isPdf(selected)) updateSlotFile(index, selected);
  };

  const hasFiles = slots.some((s) => s.file !== null);

  const handleConfirm = () => {
    onConfirm(extrato.id);
    resetState();
  };

  const resetState = () => {
    setCurrency("BRL");
    setSlots(buildSlots(slotCount));
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      resetState();
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        hideCloseButton
        className="max-w-[640px] gap-0 border-zinc-800 bg-[#1a1a1a] p-0"
      >
        <VisuallyHidden>
          <DialogTitle>Consolidar Extrato</DialogTitle>
        </VisuallyHidden>

        <div className="border-b border-zinc-800/60 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-zinc-100" data-testid="text-modal-title">
              Consolidar Extrato
            </h2>
            <div className="flex h-8 items-center rounded-md bg-zinc-800/60 px-2.5">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-orange-500/20 text-[10px] font-bold text-orange-400">
                {institutionInitial}
              </span>
              <span className="ml-1.5 text-sm font-medium text-zinc-300">
                {extrato.institution}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
            <InfoField label="Cliente">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-800 text-[9px] font-bold text-zinc-400">
                  {extrato.clientInitials}
                </span>
                <span className="truncate">{extrato.clientName}</span>
              </div>
            </InfoField>
            <InfoField label="Competencia">
              <span className="capitalize">{referenceLabel}</span>
            </InfoField>
            <InfoField label="Nome da Conta">{extrato.accountType || "\u2014"}</InfoField>
            <InfoField label="Moeda">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger
                  className="h-9 border-zinc-800 bg-zinc-900/60 text-sm text-zinc-200 hover:border-zinc-700"
                  data-testid="select-currency"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-[#1a1a1a]">
                  <SelectItem value="BRL">BRL</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                </SelectContent>
              </Select>
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
            onClick={() => handleClose(false)}
            className="rounded-md px-4 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
            data-testid="button-cancel"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              hasFiles
                ? "bg-orange-500/15 text-orange-400 hover:bg-orange-500/25"
                : "cursor-not-allowed bg-zinc-800/60 text-zinc-600"
            }`}
            disabled={!hasFiles}
            data-testid="button-consolidar"
          >
            Enviar e Consolidar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
