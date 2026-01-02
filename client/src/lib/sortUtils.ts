/**
 * Utilitários genéricos para ordenação
 */

export type SortOrder = "asc" | "desc";

export interface SortField<T> {
  key: keyof T | ((item: T) => any);
  order?: SortOrder;
  priority?: number; // Menor número = maior prioridade
}

/**
 * Cria uma função de ordenação genérica baseada em múltiplos campos
 * @param fields Array de campos para ordenar, em ordem de prioridade
 * @returns Função de comparação para usar com Array.sort()
 */
export function createSorter<T>(fields: SortField<T>[]): (a: T, b: T) => number {
  // Ordenar campos por prioridade (menor primeiro)
  const sortedFields = [...fields].sort((a, b) => (a.priority || 0) - (b.priority || 0));

  return (a: T, b: T) => {
    for (const field of sortedFields) {
      const getValue = typeof field.key === "function" 
        ? field.key 
        : (item: T) => item[field.key];
      
      const valueA = getValue(a);
      const valueB = getValue(b);
      
      // Tratar valores nulos/undefined
      if (valueA == null && valueB == null) continue;
      if (valueA == null) return field.order === "asc" ? -1 : 1;
      if (valueB == null) return field.order === "asc" ? 1 : -1;
      
      // Comparação numérica
      if (typeof valueA === "number" && typeof valueB === "number") {
        const diff = valueA - valueB;
        if (diff !== 0) {
          return field.order === "desc" ? -diff : diff;
        }
        continue;
      }
      
      // Comparação de datas
      if (valueA instanceof Date && valueB instanceof Date) {
        const diff = valueA.getTime() - valueB.getTime();
        if (diff !== 0) {
          return field.order === "desc" ? -diff : diff;
        }
        continue;
      }
      
      // Comparação de strings
      const strA = String(valueA);
      const strB = String(valueB);
      const diff = strA.localeCompare(strB);
      if (diff !== 0) {
        return field.order === "desc" ? -diff : diff;
      }
    }
    
    return 0;
  };
}

/**
 * Ordena um array usando múltiplos campos
 */
export function sortBy<T>(items: T[], ...fields: SortField<T>[]): T[] {
  const sorter = createSorter(fields);
  return [...items].sort(sorter);
}

