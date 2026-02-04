import { Paperclip, Plus, Upload, Download, ExternalLink, FileText, Table } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import type { MeetingAttachment } from "@features/meetings/types/meeting";

interface MeetingAttachmentsProps {
  attachments: MeetingAttachment[];
}

const typeConfig: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
  pdf: { bg: "bg-[#3d2424]", color: "text-[#ef4444]", icon: FileText },
  excel: { bg: "bg-[#1e3a2f]", color: "text-[#10b981]", icon: Table },
  doc: { bg: "bg-[#1e3a5f]", color: "text-[#3b82f6]", icon: FileText },
  image: { bg: "bg-[#3d2f4a]", color: "text-[#a78bfa]", icon: FileText },
};

const typeLabels: Record<string, string> = {
  pdf: "PDF",
  excel: "Excel",
  doc: "Word",
  image: "Imagem",
};

export function MeetingAttachments({ attachments }: MeetingAttachmentsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Paperclip className="h-[18px] w-[18px] text-[#8c8c8c]" />
          <h2 className="text-sm font-semibold text-[#ededed]">Anexos</h2>
          <span className="rounded bg-[#333333] px-2 py-0.5 text-xs font-medium text-[#8c8c8c]">
            {attachments.length}
          </span>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-[#333333] bg-transparent px-3 py-1.5 text-[0.8125rem] font-medium text-[#2eaadc] transition-all hover:border-[#2eaadc] hover:bg-[#1c3847]">
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {attachments.map((attachment) => {
          const config = typeConfig[attachment.type] || typeConfig.pdf;
          const IconComponent = config.icon;

          return (
            <div
              key={attachment.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3.5 transition-all hover:border-[#3a3a3a] hover:bg-[#202020]"
            >
              <div
                className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                  config.bg,
                )}
              >
                <IconComponent className={cn("h-5 w-5", config.color)} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-[0.8125rem] font-medium text-[#ededed]">
                  {attachment.name}
                </div>
                <div className="mt-0.5 text-[0.6875rem] text-[#8c8c8c]">
                  {typeLabels[attachment.type]} • {attachment.size} • Adicionado em{" "}
                  {format(attachment.addedAt, "dd MMM", { locale: ptBR })}
                </div>
              </div>

              <div className="flex gap-1">
                <button className="flex h-7 w-7 items-center justify-center rounded-md text-[#8c8c8c] transition-all hover:bg-[#333333] hover:text-[#ededed]">
                  <Download className="h-3.5 w-3.5" />
                </button>
                <button className="flex h-7 w-7 items-center justify-center rounded-md text-[#8c8c8c] transition-all hover:bg-[#333333] hover:text-[#ededed]">
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Upload Zone */}
        <div className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#333333] bg-[#1a1a1a] p-6 transition-all hover:border-[#2eaadc] hover:bg-[#1e1e1e]">
          <Upload className="h-8 w-8 text-[#8c8c8c]" />
          <div className="text-center text-[0.8125rem] text-[#8c8c8c]">
            Arraste arquivos aqui ou{" "}
            <span className="font-medium text-[#2eaadc]">clique para selecionar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
