export interface LimitRingModel {
  /** Gastado dentro del límite (verde). */
  usedFraction: number;
  /** Excedido sobre el límite (rojo), 0 cuando no hay exceso. */
  excessFraction: number;
  percent: number;
  exceeded: boolean;
}

/**
 * Modelo puro del anillo de "¿En qué se va tu dinero?" por categoría:
 * el círculo completo es el 100% del límite cuando no se superó, o el 100%
 * del gasto con el tramo de exceso en rojo cuando sí.
 */
export function limitRingModel(spent: number, limit: number): LimitRingModel {
  const safeSpent = Math.max(0, spent);
  const safeLimit = Math.max(0, limit);
  if (safeLimit <= 0) {
    // Sin límite asignado: anillo verde lleno, porcentaje no aplica.
    return { usedFraction: safeSpent > 0 ? 1 : 0, excessFraction: 0, percent: 0, exceeded: safeSpent > 0 };
  }
  if (safeSpent <= safeLimit) {
    return {
      usedFraction: safeSpent / safeLimit,
      excessFraction: 0,
      percent: (safeSpent / safeLimit) * 100,
      exceeded: false,
    };
  }
  return {
    usedFraction: safeLimit / safeSpent,
    excessFraction: (safeSpent - safeLimit) / safeSpent,
    percent: (safeSpent / safeLimit) * 100,
    exceeded: true,
  };
}
