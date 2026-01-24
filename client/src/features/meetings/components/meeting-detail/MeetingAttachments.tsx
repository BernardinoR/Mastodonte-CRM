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
          <Paperclip className="w-[18px] h-[18px] text-[#8c8c8c]" />
          <h2 className="text-sm font-semibold text-[#ededed]">Anexos</h2>
          <span className="bg-[#333333] text-[#8c8c8c] text-xs font-medium px-2 py-0.5 rounded">
            {attachments.length}
          </span>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-dashed border-[#333333] rounded-md text-[#2eaadc] text-[0.8125rem] font-medium hover:bg-[#1c3847] hover:border-[#2eaadc] transition-all">
          <Upload className="w-3.5 h-3.5" />
          Upload
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {attachments.map((attachment) => {
          const config = typeConfig[attachment.type] || typeConfig.pdf;
          const IconComponent = config.icon;
          
          return (
            <div 
              key={attachment.id}
              className="flex items-center gap-3 px-4 py-3.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg cursor-pointer hover:bg-[#202020] hover:border-[#3a3a3a] transition-all"
            >
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", config.bg)}>
                <IconComponent className={cn("w-5 h-5", config.color)} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-[0.8125rem] font-medium text-[#ededed] truncate">
                  {attachment.name}
                </div>
                <div className="text-[0.6875rem] text-[#8c8c8c] mt-0.5">
                  {typeLabels[attachment.type]} • {attachment.size} • Adicionado em {format(attachment.addedAt, "dd MMM", { locale: ptBR })}
                </div>
              </div>

              <div className="flex gap-1">
                <button className="w-7 h-7 rounded-md flex items-center justify-center text-[#8c8c8c] hover:bg-[#333333] hover:text-[#ededed] transition-all">
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 rounded-md flex items-center justify-center text-[#8c8c8c] hover:bg-[#333333] hover:text-[#ededed] transition-all">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Upload Zone */}
        <div className="flex flex-col items-center justify-center gap-2 p-6 bg-[#1a1a1a] border-2 border-dashed border-[#333333] rounded-lg cursor-pointer hover:bg-[#1e1e1e] hover:border-[#2eaadc] transition-all">
          <Upload className="w-8 h-8 text-[#8c8c8c]" />
          <div className="text-[0.8125rem] text-[#8c8c8c] text-center">
            Arraste arquivos aqui ou <span className="text-[#2eaadc] font-medium">clique para selecionar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
