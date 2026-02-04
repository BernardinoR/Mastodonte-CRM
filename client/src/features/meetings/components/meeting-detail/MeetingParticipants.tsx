import { Users } from "lucide-react";
import type { MeetingParticipant } from "@features/meetings/types/meeting";

interface MeetingParticipantsProps {
  participants: MeetingParticipant[];
}

export function MeetingParticipants({ participants }: MeetingParticipantsProps) {
  if (participants.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <Users className="h-[18px] w-[18px] text-[#8c8c8c]" />
        <h2 className="text-sm font-semibold text-[#ededed]">Participantes</h2>
        <span className="rounded bg-[#333333] px-2 py-0.5 text-xs font-medium text-[#8c8c8c]">
          {participants.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center gap-2.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3.5 py-2.5 transition-all hover:border-[#3a3a3a] hover:bg-[#202020]"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-[0.6875rem] font-semibold text-white"
              style={{ backgroundColor: participant.avatarColor }}
            >
              {participant.initials}
            </div>
            <div className="flex flex-col">
              <span className="text-[0.8125rem] font-medium text-[#ededed]">
                {participant.name}
              </span>
              <span className="text-[0.6875rem] text-[#8c8c8c]">{participant.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
