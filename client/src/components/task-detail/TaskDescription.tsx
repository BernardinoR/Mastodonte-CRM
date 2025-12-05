import { useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { UI_CLASSES } from "@/lib/statusConfig";
import { cn } from "@/lib/utils";

interface TaskDescriptionProps {
  description: string;
  onChange: (description: string) => void;
  onSave: () => void;
}

export function TaskDescription({ description, onChange, onSave }: TaskDescriptionProps) {
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = 'auto';
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }, [description]);

  const handleBlur = useCallback(() => {
    onSave();
  }, [onSave]);

  return (
    <div className="flex-[0.6] min-h-0 flex flex-col">
      <label className={cn("block text-xs font-bold uppercase mb-3 flex-shrink-0", UI_CLASSES.labelText)}>
        Descrição
      </label>
      <div className="flex-1 min-h-0 -ml-2 -mr-2">
        <Textarea
          ref={descriptionRef}
          value={description}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="Adicione detalhes..."
          className="w-full h-full bg-transparent !border-none !outline-none text-gray-300 text-base leading-relaxed resize-none focus:text-white !ring-0 focus:!ring-0 focus-visible:!ring-0 focus-visible:!ring-offset-0 px-2 py-1 rounded-md hover:bg-gray-700/80 focus:bg-transparent focus:hover:bg-transparent transition-colors cursor-pointer"
          data-testid="textarea-description"
        />
      </div>
    </div>
  );
}
