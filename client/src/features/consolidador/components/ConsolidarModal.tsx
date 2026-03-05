import { useState } from "react";
import { Upload } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Extrato } from "../types/extrato";

interface ConsolidarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extrato: Extrato | null;
  onConfirm: (extratoId: string) => void;
}

export function ConsolidarModal({ open, onOpenChange, extrato, onConfirm }: ConsolidarModalProps) {
  const [currency, setCurrency] = useState("BRL");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  if (!extrato) return null;

  const referenceLabel = format(extrato.referenceMonth, "MMMM yyyy", { locale: ptBR });
  const institutionInitial = extrato.institution.charAt(0).toUpperCase();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") {
      setFile(dropped);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleConfirm = () => {
    onConfirm(extrato.id);
    setFile(null);
    setCurrency("BRL");
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      setFile(null);
      setCurrency("BRL");
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg border-[#3a3a3a] bg-[#1a1a1a]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Upload className="h-5 w-5 text-teal-400" />
            Consolidar Extrato
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-gray-400">Instituicao</Label>
            <div className="flex items-center gap-2 rounded-md border border-[#3a3a3a] bg-[#0f0f0f] px-3 py-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-600 text-[10px] font-bold text-white">
                {institutionInitial}
              </span>
              <span className="text-sm text-white">{extrato.institution}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-gray-400">Cliente</Label>
            <div className="flex items-center gap-2 rounded-md border border-[#3a3a3a] bg-[#0f0f0f] px-3 py-2">
              <span className="text-sm text-white">{extrato.clientName}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-gray-400">Moeda</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="border-[#3a3a3a] bg-[#0f0f0f] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">BRL</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-gray-400">Referencia / Competencia</Label>
            <div className="rounded-md border border-[#3a3a3a] bg-[#0f0f0f] px-3 py-2">
              <span className="text-sm capitalize text-white">{referenceLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-gray-400">Nome da Conta</Label>
          <Input
            readOnly
            value={extrato.accountType}
            className="border-[#3a3a3a] bg-[#0f0f0f] text-white"
          />
        </div>

        <div
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
            dragOver
              ? "border-teal-400 bg-teal-400/10"
              : file
                ? "border-green-500/50 bg-green-500/5"
                : "border-teal-600/40 bg-[#0f0f0f]"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {file ? (
            <>
              <Upload className="h-8 w-8 text-green-400" />
              <span className="text-sm font-medium text-green-400">{file.name}</span>
              <button
                onClick={() => setFile(null)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Remover
              </button>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-teal-400" />
              <span className="text-sm text-gray-400">Arraste o extrato PDF aqui</span>
              <label className="cursor-pointer text-xs font-medium text-teal-400 hover:text-teal-300">
                ou clique para selecionar
                <input type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
              </label>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleClose(false)}
            className="border-[#3a3a3a]"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            className="bg-teal-600 text-white hover:bg-teal-700"
          >
            Enviar e Consolidar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
