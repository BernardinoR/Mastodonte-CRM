import { useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/shared/components/ui/textarea";
import { UI_CLASSES } from "../../lib/statusConfig";
import { cn } from "@/shared/lib/utils";

interface TaskDescriptionProps {
  description: string;
  onChange: (description: string) => void;
  onSave: () => void;
}

export function TaskDescription({ description, onChange, onSave }: TaskDescriptionProps) {
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = "auto";
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }, [description]);

  const handleBlur = useCallback(() => {
    onSave();
  }, [onSave]);

  return (
    <div className="flex min-h-0 flex-[0.6] flex-col">
      <label className={UI_CLASSES.sectionLabel}>Descrição</label>
      <div
        className={cn("min-h-0 flex-1 cursor-text", UI_CLASSES.descriptionContainer)}
        onClick={() => descriptionRef.current?.focus()}
      >
        <Textarea
          ref={descriptionRef}
          value={description}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="Adicione detalhes..."
          className="h-full w-full resize-none !border-none bg-transparent p-0 text-sm font-normal leading-7 text-gray-300 !outline-none !ring-0 transition-colors focus:text-white focus:!ring-0 focus:placeholder:text-transparent focus-visible:!ring-0 focus-visible:!ring-offset-0"
          data-testid="textarea-description"
        />
      </div>
    </div>
  );
}
