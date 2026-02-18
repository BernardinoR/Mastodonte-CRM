import { Paperclip, Upload, MoreVertical, FileText, Table, CloudUpload } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import type { MeetingAttachment } from "@features/meetings/types/meeting";

interface MeetingAttachmentsProps {
  attachments: MeetingAttachment[];
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

export function MeetingAttachments({ attachments }: MeetingAttachmentsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <Paperclip className="h-[18px] w-[18px] text-gray-400" />
        <h3 className="text-sm font-bold text-white">Anexos</h3>
        <span className="rounded bg-[#262626] px-1.5 py-0.5 text-[10px] text-gray-400">
          {attachments.length}
        </span>
      </div>

      <div className="rounded-lg border border-[#262626] bg-[#161616] p-4">
        <div className="grid grid-cols-2 gap-4">
          {attachments.map((attachment) => {
            const config = typeConfig[attachment.type] || typeConfig.pdf;
            const IconComponent = config.icon;

            return (
              <div
                key={attachment.id}
                className="flex cursor-pointer items-center gap-3 rounded border border-[#262626] bg-[#1c1c1c] p-3 transition-all hover:border-[#333] hover:bg-[#222]"
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
                    {typeLabels[attachment.type]} &middot; {attachment.size} &middot; Adicionado em{" "}
                    {format(attachment.addedAt, "dd MMM", { locale: ptBR })}
                  </div>
                </div>

                <button className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-gray-500 transition-all hover:bg-[#333] hover:text-white">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            );
          })}

          {/* Upload Zone */}
          <div className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[#333] p-6 transition-all hover:border-[#2eaadc] hover:bg-[#1a1a1a]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#262626]">
              <CloudUpload className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-gray-300">
                Arraste e solte arquivos aqui
              </div>
              <div className="mt-0.5 text-[10px] text-gray-500">
                ou <span className="text-[#2eaadc]">clique para selecionar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
