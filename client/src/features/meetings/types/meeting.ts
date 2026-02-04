// Meeting Detail Types - Extended structure for detailed meeting view

export interface MeetingAgendaSubitem {
  id: string;
  title: string;
  description: string;
}

export interface MeetingAgendaItem {
  id: string;
  number: number;
  title: string;
  status: "discussed" | "action_pending";
  subitems: MeetingAgendaSubitem[];
}

export interface MeetingDecision {
  id: string;
  content: string;
  type: "normal" | "warning";
}

export interface MeetingAttachment {
  id: string;
  name: string;
  type: "pdf" | "excel" | "doc" | "image";
  size: string;
  addedAt: Date;
}

export interface MeetingParticipant {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  initials: string;
}

export interface MeetingClientContext {
  points: {
    id: string;
    icon: string;
    text: string;
  }[];
}

export interface MeetingHighlight {
  id: string;
  icon: string;
  text: string;
  type: "normal" | "warning";
}

export interface MeetingLinkedTask {
  id: string;
  title: string;
  dueDate: Date;
  assignee: string;
  priority: "Importante" | "Normal";
  completed: boolean;
}

export interface MeetingDetail {
  id: string;
  name: string;
  type: string;
  status: "Agendada" | "Realizada" | "Cancelada";
  date: Date;
  startTime: string;
  endTime: string;
  duration: string;
  location: string;
  assignees: string[];
  responsible: {
    name: string;
    initials: string;
  };
  clientName: string;

  // Extended fields
  summary: string;
  clientContext: MeetingClientContext;
  highlights: MeetingHighlight[];
  agenda: MeetingAgendaItem[];
  decisions: MeetingDecision[];
  linkedTasks: MeetingLinkedTask[];
  participants: MeetingParticipant[];
  attachments: MeetingAttachment[];
}

// Basic meeting type (for list views)
export interface ClientMeeting {
  id: string;
  name: string;
  type: string;
  status: "Agendada" | "Realizada" | "Cancelada";
  date: Date;
  assignees: string[];
}
