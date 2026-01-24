import { useState, useMemo, useCallback } from "react";

/**
 * Hook genérico para paginação de listas com "load more"
 * 
 * @example
 * ```tsx
 * const { visibleItems, hasMore, remainingCount, loadMore, reset } = usePaginatedList(meetings, 5);
 * 
 * // Renderizar
 * {visibleItems.map(meeting => <MeetingRow key={meeting.id} meeting={meeting} />)}
 * 
 * {hasMore && (
 *   <button onClick={loadMore}>
 *     Ver mais {remainingCount} itens
 *   </button>
 * )}
 * ```
 */
export interface UsePaginatedListOptions {
  /** Tamanho inicial e incremento por página */
  pageSize?: number;
  /** Valor inicial de itens visíveis (default: pageSize) */
  initialCount?: number;
}

export interface UsePaginatedListReturn<T> {
  /** Items visíveis com base na paginação atual */
  visibleItems: T[];
  /** True se há mais itens para carregar */
  hasMore: boolean;
  /** Quantidade de itens restantes */
  remainingCount: number;
  /** Total de itens na lista */
  totalCount: number;
  /** Quantidade atual de itens visíveis */
  visibleCount: number;
  /** Carrega mais itens (incrementa por pageSize) */
  loadMore: () => void;
  /** Reseta para a quantidade inicial */
  reset: () => void;
  /** Define manualmente a quantidade de itens visíveis */
  setVisibleCount: (count: number) => void;
}

export function usePaginatedList<T>(
  items: T[],
  options: UsePaginatedListOptions | number = {}
): UsePaginatedListReturn<T> {
  // Suportar tanto objeto de opções quanto número direto para pageSize
  const normalizedOptions: UsePaginatedListOptions = typeof options === "number" 
    ? { pageSize: options } 
    : options;
  
  const { pageSize = 5, initialCount } = normalizedOptions;
  const effectiveInitialCount = initialCount ?? pageSize;

  const [visibleCount, setVisibleCount] = useState(effectiveInitialCount);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  const hasMore = items.length > visibleCount;
  const remainingCount = Math.max(0, items.length - visibleCount);
  const totalCount = items.length;

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + pageSize, items.length));
  }, [pageSize, items.length]);

  const reset = useCallback(() => {
    setVisibleCount(effectiveInitialCount);
  }, [effectiveInitialCount]);

  return {
    visibleItems,
    hasMore,
    remainingCount,
    totalCount,
    visibleCount,
    loadMore,
    reset,
    setVisibleCount,
  };
}

