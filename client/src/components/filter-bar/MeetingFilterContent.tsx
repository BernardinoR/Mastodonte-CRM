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
import { Badge } from "@/components/ui/badge";

export const MeetingTypeFilterContent = memo(function MeetingTypeFilterContent({
  selectedValues,
  onToggle,
}: {
  selectedValues: MeetingType[];
  onToggle: (type: MeetingType) => void;
}) {
  return (
    <BadgeFilterContent
      options={MEETING_TYPE_OPTIONS}
      selectedValues={selectedValues}
      onToggle={onToggle}
      colorMap={MEETING_TYPE_COLORS}
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
  return (
    <BadgeFilterContent
      options={MEETING_STATUS_OPTIONS}
      selectedValues={selectedValues}
      onToggle={onToggle}
      colorMap={MEETING_STATUS_BADGE_COLORS}
      label="Status selecionado"
    />
  );
});

