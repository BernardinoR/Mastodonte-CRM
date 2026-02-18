import { useState, useRef, useCallback } from "react";
import { Paperclip, CloudUpload, FileText, Table, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useMeetingAttachments } from "@features/meetings/hooks/useMeetingAttachments";
import type { MeetingAttachment } from "@features/meetings/types/meeting";

interface MeetingAttachmentsProps {
  meetingId: number;
}

const typeConfig: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
  pdf: { bg: "bg-red-900/20", color: "text-red-400", icon: FileText },
  excel: { bg: "bg-green-900/20", color: "text-green-400", icon: Table },
  doc: { bg: "bg-blue-900/20", color: "text-blue-400", icon: FileText },
  image: { bg: "bg-purple-900/20", color: "text-purple-400", icon: FileText },
};

const typeLabels: Record<string, string> = {
  pdf: "PDF",
  excel: "Excel",
  doc: "Word",
  image: "Imagem",
};

export function MeetingAttachments({ meetingId }: MeetingAttachmentsProps) {
  const { attachments, isUploading, uploadFiles, deleteAttachment, getSignedUrl } =
    useMeetingAttachments(meetingId);

  const [isDragOver, setIsDragOver] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<MeetingAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      uploadFiles(Array.from(files));
    },
    [uploadFiles],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleCardClick = useCallback(
    async (att: MeetingAttachment) => {
      const url = await getSignedUrl(att.storagePath);
      if (url) window.open(url, "_blank");
    },
    [getSignedUrl],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    await deleteAttachment(deleteConfirm);
    setDeleteConfirm(null);
  }, [deleteConfirm, deleteAttachment]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <Paperclip className="h-[18px] w-[18px] text-gray-400" />
        <h3 className="text-sm font-bold text-white">Anexos</h3>
        <span className="rounded bg-[#262626] px-1.5 py-0.5 text-[10px] text-gray-400">
          {attachments.length}
        </span>
        {isUploading && <Loader2 className="h-4 w-4 animate-spin text-[#2eaadc]" />}
      </div>

      <div className="rounded-lg border border-[#262626] bg-[#161616] p-4">
        <div className="grid grid-cols-2 gap-4">
          {attachments.map((attachment) => {
            const config = typeConfig[attachment.type] || typeConfig.pdf;
            const IconComponent = config.icon;

            return (
              <div
                key={attachment.id}
                className="group/card flex cursor-pointer items-center gap-3 rounded border border-[#262626] bg-[#1c1c1c] p-3 transition-all hover:border-[#333] hover:bg-[#222]"
                onClick={() => handleCardClick(attachment)}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded",
                    config.bg,
                  )}
                >
                  <IconComponent className={cn("h-4 w-4", config.color)} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-gray-200">
                    {attachment.name}
                  </div>
                  <div className="mt-0.5 text-[10px] text-gray-500">
                    {typeLabels[attachment.type] || attachment.type} &middot; {attachment.size}{" "}
                    &middot; Adicionado em {format(attachment.addedAt, "dd MMM", { locale: ptBR })}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(attachment);
                  }}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded opacity-0 transition-all hover:bg-red-500/10 group-hover/card:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </button>
              </div>
            );
          })}

          {/* Upload Zone */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 transition-all",
              isDragOver
                ? "border-[#2eaadc] bg-[#2eaadc]/10"
                : "border-[#333] hover:border-[#2eaadc] hover:bg-[#1a1a1a]",
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#262626]">
              <CloudUpload className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-gray-300">Arraste e solte arquivos aqui</div>
              <div className="mt-0.5 text-[10px] text-gray-500">
                ou <span className="text-[#2eaadc]">clique para selecionar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="border-[#3a3a3a] bg-[#2a2a2a]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir anexo?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja excluir o anexo &quot;{deleteConfirm?.name}&quot;? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#444444] bg-[#333333] text-foreground hover:bg-[#3a3a3a]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
