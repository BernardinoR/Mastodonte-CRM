import { getVisibleContaTypes } from "./businessDays";
import type { DbConta } from "./buildExtratos";

export function filterContasByVisibility(
  contas: DbConta[],
  month: string,
  today?: Date,
): DbConta[] {
  const visibleTypes = getVisibleContaTypes(month, today);
  if (visibleTypes.size === 3) return contas;
  return contas.filter((c) => visibleTypes.has(c.type));
}
