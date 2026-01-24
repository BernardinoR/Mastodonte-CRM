import { useState, useCallback, useRef, useEffect } from "react";
import type { Column } from "@features/tasks/components/table/TableHeader";

const STORAGE_KEY = "crm-table-column-widths";
const MIN_COLUMN_WIDTH = 60;
const MAX_COLUMN_WIDTH = 600;

interface ColumnWidths {
  [columnId: string]: number;
}

function parseWidth(width: string): number {
  const match = width.match(/(\d+)px/);
  if (match) return parseInt(match[1], 10);
  
  const minmaxMatch = width.match(/minmax\((\d+)px/);
  if (minmaxMatch) return parseInt(minmaxMatch[1], 10);
  
  return 100;
}

function loadSavedWidths(): ColumnWidths {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveWidths(widths: ColumnWidths): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widths));
  } catch {
    // Silently fail if localStorage is not available
  }
}

export function useColumnResize(initialColumns: Column[]) {
  const [columns, setColumns] = useState<Column[]>(() => {
    const savedWidths = loadSavedWidths();
    if (Object.keys(savedWidths).length === 0) return initialColumns;
    
    return initialColumns.map(col => ({
      ...col,
      width: savedWidths[col.id] ? `${savedWidths[col.id]}px` : col.width,
    }));
  });

  const resizingRef = useRef<{
    columnId: string;
    startX: number;
    startWidth: number;
    lastClientX: number;
  } | null>(null);
  
  const rafRef = useRef<number | null>(null);
  const columnsRef = useRef(columns);
  
  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  const getColumnWidth = useCallback((columnId: string): number => {
    const col = columnsRef.current.find(c => c.id === columnId);
    if (!col) return 100;
    return parseWidth(col.width);
  }, []);

  const handleResizeStart = useCallback((columnId: string, clientX: number) => {
    const currentWidth = getColumnWidth(columnId);
    resizingRef.current = {
      columnId,
      startX: clientX,
      startWidth: currentWidth,
      lastClientX: clientX,
    };
  }, [getColumnWidth]);

  const handleResizeMove = useCallback((clientX: number) => {
    if (!resizingRef.current) return;
    
    resizingRef.current.lastClientX = clientX;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (!resizingRef.current) return;
      
      const { columnId, startX, startWidth, lastClientX } = resizingRef.current;
      const delta = lastClientX - startX;
      const newWidth = Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, startWidth + delta));

      setColumns(prev => prev.map(col => 
        col.id === columnId ? { ...col, width: `${newWidth}px` } : col
      ));
    });
  }, []);

  const handleResizeEnd = useCallback((finalClientX?: number) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (resizingRef.current) {
      const { columnId, startX, startWidth, lastClientX } = resizingRef.current;
      const clientX = finalClientX ?? lastClientX;
      const delta = clientX - startX;
      const newWidth = Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, startWidth + delta));

      setColumns(prev => {
        const updated = prev.map(col => 
          col.id === columnId ? { ...col, width: `${newWidth}px` } : col
        );
        
        const widths: ColumnWidths = {};
        updated.forEach(col => {
          widths[col.id] = parseWidth(col.width);
        });
        saveWidths(widths);
        
        return updated;
      });
    }

    resizingRef.current = null;
  }, []);

  const resetColumnWidths = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setColumns(initialColumns);
  }, [initialColumns]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      resizingRef.current = null;
    };
  }, []);

  return {
    columns,
    setColumns,
    isResizing: resizingRef.current !== null,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
    resetColumnWidths,
  };
}
