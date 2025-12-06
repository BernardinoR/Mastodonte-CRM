import { useRef, useCallback, useMemo } from "react";

interface CachedDimensions {
  width: number;
  height: number;
  top: number;
  left: number;
}

interface DimensionsCacheResult {
  getRect: (id: string, element?: HTMLElement | null) => DOMRect | CachedDimensions | null;
  cacheRect: (id: string, rect: DOMRect) => void;
  invalidate: (id: string) => void;
  invalidateAll: () => void;
  measureAndCache: (id: string, element: HTMLElement | null) => DOMRect | null;
}

export function useDimensionsCache(): DimensionsCacheResult {
  const cacheRef = useRef<Map<string, CachedDimensions>>(new Map());
  const lastMeasureTimeRef = useRef<number>(0);
  const measureThrottleMs = 16;

  const getRect = useCallback((id: string, element?: HTMLElement | null): DOMRect | CachedDimensions | null => {
    const cached = cacheRef.current.get(id);
    if (cached) {
      return cached;
    }
    
    if (element) {
      const rect = element.getBoundingClientRect();
      cacheRef.current.set(id, {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      });
      return rect;
    }
    
    return null;
  }, []);

  const cacheRect = useCallback((id: string, rect: DOMRect) => {
    cacheRef.current.set(id, {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
    });
  }, []);

  const invalidate = useCallback((id: string) => {
    cacheRef.current.delete(id);
  }, []);

  const invalidateAll = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const measureAndCache = useCallback((id: string, element: HTMLElement | null): DOMRect | null => {
    if (!element) return null;
    
    const now = performance.now();
    const cached = cacheRef.current.get(id);
    
    if (cached && now - lastMeasureTimeRef.current < measureThrottleMs) {
      return cached as unknown as DOMRect;
    }
    
    lastMeasureTimeRef.current = now;
    const rect = element.getBoundingClientRect();
    cacheRef.current.set(id, {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
    });
    return rect;
  }, []);

  return useMemo(() => ({
    getRect,
    cacheRect,
    invalidate,
    invalidateAll,
    measureAndCache,
  }), [getRect, cacheRect, invalidate, invalidateAll, measureAndCache]);
}
