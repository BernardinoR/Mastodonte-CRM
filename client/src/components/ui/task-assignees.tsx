import { memo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MOCK_RESPONSIBLES } from "@/lib/mock-users";

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export const abbreviateName = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) return fullName;
  
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const middleNames = parts.slice(1, -1);
  
  const abbreviatedMiddle = middleNames.map(name => `${name[0].toUpperCase()}.`).join(' ');
  
  return `${firstName} ${abbreviatedMiddle} ${lastName}`;
};

export const getAvatarColor = (index: number): string => {
  const colors = ["bg-slate-600", "bg-slate-500", "bg-slate-400", "bg-slate-700", "bg-slate-300"];
  return colors[index % colors.length];
};

interface AssigneeBadgeProps {
  name: string;
  size?: "sm" | "md";
  showName?: boolean;
  className?: string;
}

export const AssigneeBadge = memo(function AssigneeBadge({
  name,
  size = "md",
  showName = true,
  className
}: AssigneeBadgeProps) {
  const consultant = MOCK_RESPONSIBLES.find(c => c.name === name);
  const grayColor = consultant?.grayColor || "bg-gray-600";
  
  const avatarSize = size === "sm" ? "w-5 h-5" : "w-6 h-6";
  const textSize = size === "sm" ? "text-[9px]" : "text-[10px]";
  const nameSize = size === "sm" ? "text-xs" : "text-[13px]";
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar className={cn(avatarSize, "shrink-0")}>
        <AvatarFallback className={cn(textSize, "font-normal text-white", grayColor)}>
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <span className={cn(nameSize, "font-normal")}>
          {abbreviateName(name)}
        </span>
      )}
    </div>
  );
});

interface AssigneeListProps {
  assignees: string[];
  isEditing?: boolean;
  taskId: string;
  maxDisplay?: number;
  className?: string;
}

export const AssigneeList = memo(function AssigneeList({ 
  assignees, 
  isEditing = false, 
  taskId,
  maxDisplay,
  className
}: AssigneeListProps) {
  if (assignees.length === 0) {
    return (
      <span 
        className="inline-flex px-2 py-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-gray-700/80 text-xs md:text-sm"
        data-testid={`button-add-assignee-${taskId}`}
      >
        + Adicionar Responsável
      </span>
    );
  }

  const displayAssignees = maxDisplay ? assignees.slice(0, maxDisplay) : assignees;
  const remainingCount = maxDisplay ? Math.max(0, assignees.length - maxDisplay) : 0;

  return (
    <div className={cn("space-y-0.5", className)}>
      {displayAssignees.map((assignee, index) => (
        <div 
          key={index} 
          className={cn(
            "flex items-center rounded-full group/edit-assignee",
            isEditing ? "px-2 py-0.5" : "py-0.5",
            "hover:bg-gray-700/80"
          )}
        >
          <AssigneeBadge 
            name={assignee}
            data-testid={index === 0 ? `text-assignee-${taskId}` : undefined}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-muted-foreground pl-2">
          +{remainingCount} mais
        </span>
      )}
    </div>
  );
});

interface AssigneeAvatarStackProps {
  assignees: string[];
  maxDisplay?: number;
  size?: "sm" | "md";
  className?: string;
}

export const AssigneeAvatarStack = memo(function AssigneeAvatarStack({
  assignees,
  maxDisplay = 3,
  size = "sm",
  className
}: AssigneeAvatarStackProps) {
  if (assignees.length === 0) return null;

  const displayAssignees = assignees.slice(0, maxDisplay);
  const remainingCount = Math.max(0, assignees.length - maxDisplay);

  const avatarSize = size === "sm" ? "w-5 h-5" : "w-6 h-6";
  const textSize = size === "sm" ? "text-[9px]" : "text-[10px]";
  const overlapMargin = size === "sm" ? "-ml-1.5" : "-ml-2";

  return (
    <div className={cn("flex items-center", className)}>
      {displayAssignees.map((assignee, index) => {
        const consultant = MOCK_RESPONSIBLES.find(c => c.name === assignee);
        const grayColor = consultant?.grayColor || "bg-gray-600";
        
        return (
          <Avatar 
            key={index}
            className={cn(
              avatarSize,
              "shrink-0 ring-2 ring-background",
              index > 0 && overlapMargin
            )}
          >
            <AvatarFallback className={cn(textSize, "font-normal text-white", grayColor)}>
              {getInitials(assignee)}
            </AvatarFallback>
          </Avatar>
        );
      })}
      {remainingCount > 0 && (
        <span className={cn("text-xs text-muted-foreground ml-1.5")}>
          +{remainingCount}
        </span>
      )}
    </div>
  );
});
