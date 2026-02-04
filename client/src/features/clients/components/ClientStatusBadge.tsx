import { useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import {
  CLIENT_STATUS_CONFIG,
  CLIENT_STATUS_OPTIONS,
  type ClientStatus,
  UI_CLASSES,
} from "@features/tasks/lib/statusConfig";

interface ClientStatusBadgeProps {
  status: ClientStatus;
  onStatusChange: (status: ClientStatus) => void;
}

export function ClientStatusBadge({ status, onStatusChange }: ClientStatusBadgeProps) {
  const [open, setOpen] = useState(false);
  const config = CLIENT_STATUS_CONFIG[status] || CLIENT_STATUS_CONFIG["Ativo"];

  const handleStatusSelect = (newStatus: ClientStatus) => {
    onStatusChange(newStatus);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="inline-block cursor-pointer" data-testid="badge-client-status">
          <Badge
            className={`${config.bgColor} ${config.textColor} cursor-pointer text-sm font-normal`}
          >
            {status}
          </Badge>
        </div>
      </PopoverTrigger>
      <PopoverContent className={`w-44 p-0 ${UI_CLASSES.popover}`} align="start">
        <div className="py-1">
          <div className={`border-b ${UI_CLASSES.border}`}>
            <div className="px-3 py-1.5 text-xs text-gray-500">Status atual</div>
            <div className="px-3 py-1">
              <div
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${UI_CLASSES.selectedItem}`}
              >
                <Badge className={`${config.bgColor} ${config.textColor} text-xs`}>{status}</Badge>
              </div>
            </div>
          </div>
          <div className="px-3 py-1.5 text-xs text-gray-500">Alterar para</div>
          <div className="pb-1">
            {CLIENT_STATUS_OPTIONS.filter((s) => s !== status).map((s) => {
              const optConfig = CLIENT_STATUS_CONFIG[s];
              return (
                <div
                  key={s}
                  className={UI_CLASSES.dropdownItem}
                  onClick={() => handleStatusSelect(s)}
                  data-testid={`option-status-${s.toLowerCase()}`}
                >
                  <Badge className={`${optConfig.bgColor} ${optConfig.textColor} text-xs`}>
                    {s}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
