import type { CriterioRanking } from "@prisma/client";

export interface ItemParaDescuento {
  precioTachado: number;
  precioOferta: number;
}

export interface PropuestaParaRanking {
  items: ItemParaDescuento[];
  seller?: { scoreHistorico: number | null };
}

export function descuentoPromedio(items: ItemParaDescuento[]): number {
  if (items.length === 0) return 0;
  const total = items.reduce(
    (sum, item) => sum + (item.precioTachado - item.precioOferta) / item.precioTachado,
    0,
  );
  return (total / items.length) * 100;
}

/**
 * Score de una propuesta según el criterio del espacio.
 * SCORE_COMPUESTO: en el MVP devuelve lo mismo que DESCUENTO -- fase 2
 * combina descuento + stock + scoreHistorico del seller.
 */
export function calcularScore(propuesta: PropuestaParaRanking, criterio: CriterioRanking): number {
  const descuento = descuentoPromedio(propuesta.items);
  if (criterio === "SCORE_COMPUESTO") {
    // TODO (fase 2): combinar descuento + stock + propuesta.seller?.scoreHistorico
    return descuento;
  }
  return descuento;
}

/**
 * Ordena propuestas de mejor a peor según el criterio del espacio. Si el
 * espacio define un descuentoMinimo, las propuestas que no lo cumplen
 * quedan afuera del ranking (no ganan, aunque hayan sido enviadas).
 */
export function rankearPropuestas<T extends PropuestaParaRanking>(
  propuestas: T[],
  criterio: CriterioRanking,
  descuentoMinimo: number | null,
): T[] {
  const elegibles =
    descuentoMinimo != null
      ? propuestas.filter((p) => descuentoPromedio(p.items) >= descuentoMinimo)
      : propuestas;

  return [...elegibles].sort((a, b) => calcularScore(b, criterio) - calcularScore(a, criterio));
}
