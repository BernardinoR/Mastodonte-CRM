import { useState, useEffect, useCallback, useMemo, useRef } from "react";

interface VirtualizedListOptions {
  itemHeight: number;
  overscan?: number;
  containerRef: React.RefObject<HTMLElement | null>;
}

interface VirtualizedResult<T> {
  visibleItems: T[];
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetTop: number;
}

export function useVirtualizedList<T>(
  items: T[],
  options: VirtualizedListOptions
): VirtualizedResult<T> {
  const { itemHeight, overscan = 3, containerRef } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const rafRef = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      if (containerRef.current) {
        setScrollTop(containerRef.current.scrollTop);
      }
    });
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    setContainerHeight(container.clientHeight);
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [containerRef, handleScroll]);

  const result = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    
    if (containerHeight === 0) {
      return {
        visibleItems: items.slice(0, overscan * 2),
        startIndex: 0,
        endIndex: Math.min(overscan * 2, items.length),
        totalHeight,
        offsetTop: 0,
      };
    }

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);

    return {
      visibleItems: items.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      totalHeight,
      offsetTop: startIndex * itemHeight,
    };
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  return result;
}
