/**
 * Hook para ler e gerenciar parâmetros da URL relacionados a tasks
 */
export function useTaskUrlParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    clientFilter: params.get("client"),
    viewMode: params.get("view") as "board" | "table" | null,
    shouldApplyDefaultSort: params.has("client"), // ordenar quando vier de cliente
  };
}

/**
 * Constrói URL para página de tasks com filtros aplicados
 * @param clientName - Nome do cliente para filtrar
 */
export function buildTasksUrl(clientName: string): string {
  const params = new URLSearchParams({
    client: clientName,
    view: "table",
  });
  return `/tasks?${params.toString()}`;
}
