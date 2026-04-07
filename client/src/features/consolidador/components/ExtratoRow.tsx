import type {
  Extrato,
  ExtratoStatus,
  ExtratoCollectionMethod,
  VerificationResult,
} from "../types/extrato";
import { verificationKey } from "../types/extrato";
import { ExtratoStatusBadge } from "./ExtratoStatusBadge";
import { CollectionMethodBadge } from "./CollectionMethodBadge";
import { ExtratoActionButtons } from "./ExtratoActionButtons";
import { getInstitutionColor } from "@/features/clients/lib/institutionColors";
import { getClientAvatarColor } from "../lib/avatarColors";
import { useToast } from "@/shared/hooks/use-toast";
import {
  buildExtratoRequestMessage,
  buildExtratoWhatsAppUrl,
  buildExtratoEmailUrl,
} from "../lib/extratoMessages";

interface ExtratoRowProps {
  extrato: Extrato;
  onConsolidar?: (extrato: Extrato) => void;
  onStatusChange?: (extratoId: string, status: ExtratoStatus) => void;
  onMethodChange?: (extratoId: string, method: ExtratoCollectionMethod) => void;
  onSync?: (extrato: Extrato) => Promise<void>;
  pendingMonths?: string[];
  onBatchStatusChange?: (contaId: string, months: string[], status: ExtratoStatus) => void;
  labelField?: "institution" | "client";
  groupBy?: "client" | "institution";
  verificationMap?: Map<string, VerificationResult>;
}

export function ExtratoRow({
  extrato,
  onConsolidar,
  onStatusChange,
  onMethodChange,
  onSync,
  pendingMonths,
  onBatchStatusChange,
  labelField = "institution",
  groupBy = "client",
  verificationMap,
}: ExtratoRowProps) {
  const { toast } = useToast();

  const months = pendingMonths?.length ? pendingMonths : [extrato.referenceMonth];

  const handleWhatsApp = () => {
    const msg = buildExtratoRequestMessage({ ...extrato, referenceMonths: months });
    if (extrato.whatsappIsGroup) {
      navigator.clipboard.writeText(msg);
      toast({ title: "Mensagem copiada!" });
      if (extrato.whatsappGroupLink) window.open(extrato.whatsappGroupLink, "_blank");
    } else {
      window.open(buildExtratoWhatsAppUrl(extrato.contactPhone ?? "", msg), "_blank");
    }
    if (extrato.status !== "Consolidado") {
      if (onBatchStatusChange && months.length > 0) {
        onBatchStatusChange(extrato.contaId, months, "Solicitado");
      } else {
        onStatusChange?.(extrato.id, "Solicitado");
      }
    }
  };

  const handleEmail = () => {
    const url = buildExtratoEmailUrl({
      ...extrato,
      referenceMonths: months,
      to: extrato.contactEmail ?? "",
      cc: extrato.collectionMethod === "Manual" ? extrato.clientEmail : undefined,
    });
    window.open(url);
    if (extrato.status !== "Consolidado") {
      if (onBatchStatusChange && months.length > 0) {
        onBatchStatusChange(extrato.contaId, months, "Solicitado");
      } else {
        onStatusChange?.(extrato.id, "Solicitado");
      }
    }
  };

  const dotTextColor =
    groupBy === "client"
      ? getInstitutionColor(extrato.institution).text
      : getClientAvatarColor(extrato.clientName).text;

  return (
    <div className="group flex items-center gap-4 rounded-lg px-5 py-2 hover:bg-white/5">
      <span className={`h-2 w-2 flex-shrink-0 rounded-full bg-current ${dotTextColor}`} />
      <span className="w-48 text-sm font-medium text-zinc-300">
        {labelField === "client" ? extrato.clientName : extrato.institution}
      </span>
      <span className="w-16 text-xs text-zinc-600">{extrato.accountType}</span>
      <CollectionMethodBadge
        method={extrato.collectionMethod}
        onMethodChange={(method) => onMethodChange?.(extrato.id, method)}
      />
      <ExtratoStatusBadge
        extrato={extrato}
        onStatusChange={(status) => onStatusChange?.(extrato.id, status)}
      />
      <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
        <ExtratoActionButtons
          clientName={extrato.clientName}
          hasWhatsApp={extrato.hasWhatsApp}
          hasEmail={extrato.hasEmail}
          contactPhone={extrato.contactPhone}
          contactEmail={extrato.contactEmail}
          onWhatsApp={handleWhatsApp}
          onEmail={handleEmail}
          onConsolidar={() => onConsolidar?.(extrato)}
          onSync={onSync ? () => onSync(extrato) : undefined}
          verificationStatus={
            extrato.status === "Consolidado"
              ? verificationMap?.get(
                  verificationKey(
                    extrato.clientName,
                    extrato.referenceMonth,
                    extrato.institution,
                    extrato.accountType,
                  ),
                )
              : undefined
          }
        />
      </div>
    </div>
  );
}
