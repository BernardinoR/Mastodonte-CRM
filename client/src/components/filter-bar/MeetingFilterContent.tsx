/**
 * Componentes de filtro específicos para reuniões
 * Usam BadgeFilterContent genérico com configurações de reunião
 */
import { memo } from "react";
import { BadgeFilterContent } from "./BadgeFilterContent";
import { 
  MEETING_TYPE_COLORS, 
  MEETING_TYPE_OPTIONS,
  MEETING_STATUS_OPTIONS,
  type MeetingType,
  type MeetingStatus 
} from "@shared/config/meetingConfig";
import { MEETING_STATUS_BADGE_COLORS } from "@/lib/statusConfig";

export const MeetingTypeFilterContent = memo(function MeetingTypeFilterContent({
  selectedValues,
  onToggle,
}: {
  selectedValues: MeetingType[];
  onToggle: (type: MeetingType) => void;
}) {
  // Tipos genéricos inferidos para evitar conflito com metadados do Replit
  const colorMap = MEETING_TYPE_COLORS as Record<MeetingType, string>;
  return (
    <BadgeFilterContent
      options={MEETING_TYPE_OPTIONS}
      selectedValues={selectedValues}
      onToggle={onToggle}
      colorMap={colorMap}
      label="Tipo selecionado"
    />
  );
});

export const MeetingStatusFilterContent = memo(function MeetingStatusFilterContent({
  selectedValues,
  onToggle,
}: {
  selectedValues: MeetingStatus[];
  onToggle: (status: MeetingStatus) => void;
}) {
  // Tipos genéricos inferidos para evitar conflito com metadados do Replit
  const colorMap = MEETING_STATUS_BADGE_COLORS as Record<MeetingStatus, string>;
  return (
    <BadgeFilterContent
      options={MEETING_STATUS_OPTIONS}
      selectedValues={selectedValues}
      onToggle={onToggle}
      colorMap={colorMap}
      label="Status selecionado"
    />
  );
});

