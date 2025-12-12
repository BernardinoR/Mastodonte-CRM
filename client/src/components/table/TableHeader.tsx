import { memo, useMemo } from "react";
import { GripVertical } from "lucide-react";
import { 
  SortableContext, 
  horizontalListSortingStrategy, 
  useSortable 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface Column {
  id: string;
  label: string;
  width: string;
}

interface SortableColumnHeaderProps {
  column: Column;
}

const SortableColumnHeader = memo(function SortableColumnHeader({ 
  column 
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
        "flex items-center gap-1.5 px-3 py-2 text-xs font-normal uppercase tracking-wide select-none cursor-grab active:cursor-grabbing",
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
}

export const TableHeader = memo(function TableHeader({
  columns,
  controlWidth,
  allSelected,
  someSelected,
  onSelectAll,
  stickyOffset = "0",
}: TableHeaderProps) {
  const columnIds = useMemo(() => columns.map(c => `col-${c.id}`), [columns]);

  return (
    <div 
      className={cn("flex sticky z-10 group bg-background")}
      style={{ top: stickyOffset }}
    >
      <div 
        className="flex items-center justify-end pr-2 py-2"
        style={{ width: controlWidth }}
      >
        <Checkbox
          checked={allSelected}
          onCheckedChange={(checked) => onSelectAll(!!checked)}
          className={cn(
            "transition-opacity",
            allSelected || someSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          data-testid="checkbox-select-all"
        />
      </div>
      <div 
        className="flex-1 grid border-b border-border bg-background"
        style={{
          gridTemplateColumns: columns.map(c => c.width).join(" "),
        }}
      >
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          {columns.map((column) => (
            <SortableColumnHeader key={column.id} column={column} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
});
