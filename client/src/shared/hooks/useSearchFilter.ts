import { useState, useMemo } from "react";

/**
 * Hook genérico para filtro de busca
 * @param items - Array de itens para filtrar
 * @param searchFn - Função que determina se um item corresponde ao termo de busca
 */
export function useSearchFilter<T>(
  items: T[],
  searchFn: (item: T, term: string) => boolean
) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    return items.filter(item => searchFn(item, searchTerm.toLowerCase()));
  }, [items, searchTerm, searchFn]);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => { 
    setIsSearchOpen(false); 
    setSearchTerm(""); 
  };

  return { 
    searchTerm, 
    setSearchTerm, 
    isSearchOpen, 
    openSearch, 
    closeSearch, 
    filteredItems 
  };
}

