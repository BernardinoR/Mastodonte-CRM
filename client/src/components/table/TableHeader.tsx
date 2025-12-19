import { memo, useMemo, useRef, useEffect, useState } from "react";
import { GripVertical } from "lucide-react";
import { 
  SortableContext, 
  horizontalListSortingStrategy, 
  useSortable 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ColumnResizeHandle } from "./ColumnResizeHandle";

export interface Column {
  id: string;
  label: string;
  width: string;
}

interface SortableColumnHeaderProps {
  column: Column;
}

const SortableColumnHeader = memo(function SortableColumnHeader({ 
  column,
}: SortableColumnHeaderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `col-${column.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex items-center gap-1.5 px-3 py-2 text-xs font-normal uppercase tracking-wide select-none cursor-grab active:cursor-grabbing",
        "text-muted-foreground/70",
        isDragging && "opacity-50 bg-muted rounded"
      )}
      data-testid={`header-column-${column.id}`}
      {...attributes}
      {...listeners}
    >
      <GripVertical 
        className="w-3 h-3 text-muted-foreground/40 hover:text-muted-foreground" 
        data-testid={`drag-handle-${column.id}`}
      />
      <span>{column.label}</span>
    </div>
  );
});

interface TableHeaderProps {
  columns: Column[];
  controlWidth: string;
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  stickyOffset?: string;
  onResizeStart?: (columnId: string, clientX: number) => void;
  onResizeMove?: (clientX: number) => void;
  onResizeEnd?: (finalClientX?: number) => void;
}

export const TableHeader = memo(function TableHeader({
  columns,
  controlWidth,
  allSelected,
  someSelected,
  onSelectAll,
  stickyOffset = "0",
  onResizeStart,
  onResizeMove,
  onResizeEnd,
}: TableHeaderProps) {
  const columnIds = useMemo(() => columns.map(c => `col-${c.id}`), [columns]);
  const gridRef = useRef<HTMLDivElement>(null);
  const [columnOffsets, setColumnOffsets] = useState<number[]>([]);

  useEffect(() => {
    if (!gridRef.current || !onResizeStart) return;
    
    const updateOffsets = () => {
      const grid = gridRef.current;
      if (!grid) return;
      
      const children = Array.from(grid.children).filter(
        child => !child.classList.contains('resize-handle-overlay')
      );
      const offsets: number[] = [];
      let cumulative = 0;
      
      for (let i = 0; i < children.length - 1; i++) {
        const child = children[i] as HTMLElement;
        cumulative += child.offsetWidth;
        offsets.push(cumulative);
      }
      
      setColumnOffsets(offsets);
    };

    updateOffsets();
    const observer = new ResizeObserver(updateOffsets);
    observer.observe(gridRef.current);
    
    return () => observer.disconnect();
  }, [columns, onResizeStart]);

  return (
    <div 
      className={cn("flex sticky z-10 group bg-background")}
      style={{ top: stickyOffset }}
    >
      <div 
        className="flex items-center justify-end pr-2 py-2 relative z-30"
        style={{ width: controlWidth }}
        data-no-dnd="true"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onSelectAll(!allSelected);
        }}
      >
        <Checkbox
          checked={allSelected}
          className={cn(
            "transition-opacity cursor-pointer pointer-events-none",
            allSelected || someSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          data-testid="checkbox-select-all"
        />
      </div>
      <div 
        ref={gridRef}
        className="flex-1 grid border-b border-border bg-background relative overflow-visible"
        style={{
          gridTemplateColumns: columns.map(c => c.width).join(" "),
        }}
      >
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          {columns.map((column) => (
            <SortableColumnHeader 
              key={column.id} 
              column={column}
            />
          ))}
        </SortableContext>
        {onResizeStart && onResizeMove && onResizeEnd && columnOffsets.map((offset, index) => (
          <div
            key={`resize-${columns[index].id}`}
            className="resize-handle-overlay absolute top-0 bottom-0"
            style={{ left: `${offset}px`, transform: 'translateX(-2px)' }}
          >
            <ColumnResizeHandle
              columnId={columns[index].id}
              onResizeStart={onResizeStart}
              onResizeMove={onResizeMove}
              onResizeEnd={onResizeEnd}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
