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
        <Users className="w-[18px] h-[18px] text-[#8c8c8c]" />
        <h2 className="text-sm font-semibold text-[#ededed]">Participantes</h2>
        <span className="bg-[#333333] text-[#8c8c8c] text-xs font-medium px-2 py-0.5 rounded">
          {participants.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {participants.map((participant) => (
          <div 
            key={participant.id}
            className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:bg-[#202020] hover:border-[#3a3a3a] transition-all"
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-[0.6875rem] font-semibold text-white"
              style={{ backgroundColor: participant.avatarColor }}
            >
              {participant.initials}
            </div>
            <div className="flex flex-col">
              <span className="text-[0.8125rem] font-medium text-[#ededed]">
                {participant.name}
              </span>
              <span className="text-[0.6875rem] text-[#8c8c8c]">
                {participant.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
