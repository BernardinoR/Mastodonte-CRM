import { memo, useMemo, useRef, useEffect, useState, useCallback } from "react";
import { GripVertical } from "lucide-react";
import { 
  DndContext,
  closestCenter,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { 
  SortableContext, 
  horizontalListSortingStrategy, 
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ColumnResizeHandle } from "./ColumnResizeHandle";
import { SmartPointerSensor } from "@/lib/dndSensors";

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
        isDragging && "opacity-0"
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
  onColumnReorder?: (event: DragEndEvent) => void;
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
  onColumnReorder,
}: TableHeaderProps) {
  const columnIds = useMemo(() => columns.map(c => `col-${c.id}`), [columns]);
  const gridRef = useRef<HTMLDivElement>(null);
  const [columnOffsets, setColumnOffsets] = useState<number[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  // Sensors para drag de colunas
  const sensors = useSensors(
    useSensor(SmartPointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handler de drag para colunas (restrito ao eixo horizontal)
  const handleColumnDragStart = useCallback((event: DragStartEvent) => {
    const columnId = (event.active.id as string).replace("col-", "");
    const column = columns.find(c => c.id === columnId);
    setActiveColumn(column || null);
  }, [columns]);

  const handleColumnDragEnd = useCallback((event: DragEndEvent) => {
    setActiveColumn(null);
    onColumnReorder?.(event);
  }, [onColumnReorder]);

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
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={allSelected}
          onCheckedChange={(checked) => {
            onSelectAll(checked === true);
          }}
          className={cn(
            "transition-opacity cursor-pointer",
            allSelected || someSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          data-testid="checkbox-select-all"
          data-no-dnd="true"
        />
      </div>
      <div 
        ref={gridRef}
        className="flex-1 grid border-b border-border bg-background relative overflow-visible"
        style={{
          gridTemplateColumns: columns.map(c => c.width).join(" "),
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToHorizontalAxis]}
          onDragStart={handleColumnDragStart}
          onDragEnd={handleColumnDragEnd}
        >
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            {columns.map((column) => (
              <SortableColumnHeader 
                key={column.id} 
                column={column}
              />
            ))}
          </SortableContext>
          <DragOverlay>
            {activeColumn && (
              <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-normal uppercase tracking-wide bg-background border border-border rounded shadow-lg">
                <GripVertical className="w-3 h-3 text-muted-foreground" />
                <span>{activeColumn.label}</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
        {onResizeStart && onResizeMove && onResizeEnd && 
          columns.slice(0, -1).map((column, index) => {
            const offset = columnOffsets[index];
            if (offset === undefined) return null;
            
            return (
              <div
                key={`resize-${column.id}`}
                className="resize-handle-overlay absolute top-0 bottom-0"
                style={{ left: `${offset}px`, transform: 'translateX(-2px)' }}
              >
                <ColumnResizeHandle
                  columnId={column.id}
                  onResizeStart={onResizeStart}
                  onResizeMove={onResizeMove}
                  onResizeEnd={onResizeEnd}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
});
