import { useState } from "react";
import { User, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Input } from "@/shared/components/ui/input";
import { useUsers } from "@features/users";

interface AdvisorPopoverProps {
  currentAdvisor: string;
  onAdvisorChange: (advisorName: string) => void;
}

export function AdvisorPopover({ currentAdvisor, onAdvisorChange }: AdvisorPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { teamUsers, getUserByName } = useUsers();

  const filteredConsultores = teamUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) && user.name !== currentAdvisor,
  );

  const handleSelect = (name: string) => {
    onAdvisorChange(name);
    setIsOpen(false);
    setSearchQuery("");
  };

  const currentAdvisorData = getUserByName(currentAdvisor);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="flex cursor-pointer flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            Consultor
          </span>
          <span
            className="-mx-1.5 -my-0.5 rounded-md px-1.5 py-0.5 text-sm font-medium text-foreground transition-colors hover:bg-[#333333]"
            data-testid="text-client-advisor"
          >
            {currentAdvisor || "Não atribuído"}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 border-[#3a3a3a] bg-[#2a2a2a] p-0" align="start">
        <div className="border-b border-[#3a3a3a] px-3 py-2.5">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar consultor..."
            className="h-auto border-0 bg-transparent p-0 text-sm text-gray-400 placeholder:text-gray-500 focus-visible:ring-0"
            onClick={(e) => e.stopPropagation()}
            data-testid="input-search-advisor"
          />
        </div>

        {currentAdvisor && (
          <div className="border-b border-[#3a3a3a]">
            <div className="px-3 py-1.5 text-xs text-gray-500">Consultor atual</div>
            <div className="px-3 py-1">
              <div className="flex items-center gap-2 rounded-md bg-[#2a2a2a] px-2 py-1.5">
                <div
                  className={`h-6 w-6 rounded-full ${currentAdvisorData?.avatarColor || "bg-slate-600"} flex items-center justify-center text-xs font-medium text-white`}
                >
                  {currentAdvisorData?.initials || getInitials(currentAdvisor)}
                </div>
                <span className="flex-1 text-sm text-foreground">{currentAdvisor}</span>
                <Check className="h-4 w-4 text-emerald-500/70" />
              </div>
            </div>
          </div>
        )}

        <div className="px-3 py-1.5 text-xs text-gray-500">
          {currentAdvisor ? "Selecionar outro" : "Selecionar consultor"}
        </div>

        <div className="max-h-52 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
          {filteredConsultores.map((user) => (
            <div
              key={user.id}
              className="group flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-[#2a2a2a]"
              onClick={() => handleSelect(user.name)}
              data-testid={`option-advisor-${user.id}`}
            >
              <div
                className={`h-6 w-6 rounded-full ${user.avatarColor} flex items-center justify-center text-xs font-medium text-white`}
              >
                {user.initials}
              </div>
              <span className="flex-1 text-sm text-foreground">{user.name}</span>
              {user.isCurrentUser && <span className="text-xs text-muted-foreground">(você)</span>}
            </div>
          ))}
          {filteredConsultores.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-gray-500">
              Nenhum consultor encontrado
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
