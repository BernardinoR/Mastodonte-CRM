// Components
export { MeetingCard } from "./components/MeetingCard";
export { NewMeetingDialog } from "./components/NewMeetingDialog";
export type { NewMeetingFormData } from "./components/NewMeetingDialog";

// Meeting Detail Components
export {
  MeetingDetailModal,
  MeetingSummary,
  MeetingAgenda,
  MeetingDecisions,
  MeetingTasks,
  MeetingParticipants,
  MeetingAttachments,
  MeetingSummaryEditor,
  IconPicker,
  getIconComponent,
  AVAILABLE_ICONS,
  ContextCardEditor,
  ContextSectionEditor,
  TagEditorModal,
  TagDisplay,
  TAG_STYLES,
  TAG_ICONS,
  EditableSectionTitle,
  AIGenerateButton,
} from "./components/meeting-detail";

export type {
  IconName,
  ContextCardData,
  TagData,
  TagType,
  GenerateOption,
} from "./components/meeting-detail";

// Hooks
export { useAISummary } from "./hooks/useAISummary";
export type {
  AIResponse,
  AIContextPoint,
  AIHighlight,
  AIAgendaItem,
  AIDecision,
} from "./hooks/useAISummary";
export { useInlineMeetingEdit } from "./hooks/useInlineMeetingEdit";

// Types
export type {
  MeetingDetail,
  MeetingAgendaItem,
  MeetingAgendaSubitem,
  MeetingDecision,
  MeetingAttachment,
  MeetingParticipant,
  MeetingClientContext,
  MeetingHighlight,
  MeetingLinkedTask,
  ClientMeeting,
} from "./types/meeting";
