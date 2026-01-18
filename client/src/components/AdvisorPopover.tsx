import { useState } from "react";
import { User, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useUsers } from "@/contexts/UsersContext";

interface AdvisorPopoverProps {
  currentAdvisor: string;
  onAdvisorChange: (advisorName: string) => void;
}

export function AdvisorPopover({
  currentAdvisor,
  onAdvisorChange,
}: AdvisorPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { teamUsers, getUserByName } = useUsers();

  const filteredConsultores = teamUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    user.name !== currentAdvisor
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
        <div className="flex flex-col gap-1 cursor-pointer">
          <span className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            Consultor
          </span>
          <span 
            className="text-sm font-medium text-foreground px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-md hover:bg-[#2c2c2c] transition-colors"
            data-testid="text-client-advisor"
          >
            {currentAdvisor || "Não atribuído"}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-[#252525] border-[#333333]"
        align="start"
      >
        <div className="px-3 py-2.5 border-b border-[#333333]">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar consultor..."
            className="bg-transparent border-0 text-sm text-gray-400 placeholder:text-gray-500 focus-visible:ring-0 p-0 h-auto"
            onClick={(e) => e.stopPropagation()}
            data-testid="input-search-advisor"
          />
        </div>
        
        {currentAdvisor && (
          <div className="border-b border-[#333333]">
            <div className="px-3 py-1.5 text-xs text-gray-500">
              Consultor atual
            </div>
            <div className="px-3 py-1">
              <div 
                className="flex items-center gap-2 px-2 py-1.5 bg-[#2a2a2a] rounded-md"
              >
                <div className={`w-6 h-6 rounded-full ${currentAdvisorData?.avatarColor || 'bg-slate-600'} flex items-center justify-center text-xs text-white font-medium`}>
                  {currentAdvisorData?.initials || getInitials(currentAdvisor)}
                </div>
                <span className="text-sm text-foreground flex-1">{currentAdvisor}</span>
                <Check className="w-4 h-4 text-emerald-500/70" />
              </div>
            </div>
          </div>
        )}
        
        <div className="px-3 py-1.5 text-xs text-gray-500">
          {currentAdvisor ? "Selecionar outro" : "Selecionar consultor"}
        </div>
        
        <div 
          className="max-h-52 overflow-y-auto"
          onWheel={(e) => e.stopPropagation()}
        >
          {filteredConsultores.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
              onClick={() => handleSelect(user.name)}
              data-testid={`option-advisor-${user.id}`}
            >
              <div className={`w-6 h-6 rounded-full ${user.avatarColor} flex items-center justify-center text-xs text-white font-medium`}>
                {user.initials}
              </div>
              <span className="text-sm text-foreground flex-1">{user.name}</span>
              {user.isCurrentUser && (
                <span className="text-xs text-muted-foreground">(você)</span>
              )}
            </div>
          ))}
          {filteredConsultores.length === 0 && (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
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
