import { memo, useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ColumnResizeHandleProps {
  columnId: string;
  onResizeStart: (columnId: string, clientX: number) => void;
  onResizeMove: (clientX: number) => void;
  onResizeEnd: (finalClientX?: number) => void;
}

export const ColumnResizeHandle = memo(function ColumnResizeHandle({
  columnId,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
}: ColumnResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const handlersRef = useRef<{
    move: (e: MouseEvent) => void;
    up: (e: MouseEvent) => void;
  } | null>(null);

  const cleanup = useCallback(() => {
    if (handlersRef.current) {
      document.removeEventListener("mousemove", handlersRef.current.move);
      document.removeEventListener("mouseup", handlersRef.current.up);
      handlersRef.current = null;
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    cleanup();
    
    const startX = e.clientX;
    let lastX = startX;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      lastX = moveEvent.clientX;
      onResizeMove(moveEvent.clientX);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      cleanup();
      setIsDragging(false);
      onResizeEnd(upEvent.clientX);
    };

    handlersRef.current = { move: handleMouseMove, up: handleMouseUp };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    
    setIsDragging(true);
    onResizeStart(columnId, startX);
  }, [columnId, onResizeStart, onResizeMove, onResizeEnd, cleanup]);

  return (
    <div
      className={cn(
        "w-4 h-full cursor-col-resize z-20 flex items-center justify-center group/resize",
      )}
      onMouseDown={handleMouseDown}
      data-testid={`resize-handle-${columnId}`}
    >
      <div 
        className={cn(
          "w-0.5 h-full transition-colors",
          "group-hover/resize:bg-primary/50",
          isDragging && "bg-primary"
        )}
      />
    </div>
  );
});
