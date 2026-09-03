export type Period = 'today' | 'month' | 'year';

export function isInPeriod(date: Date, period: Period, reference: Date = new Date()): boolean {
  if (period === 'today') {
    return (
      date.getDate() === reference.getDate() &&
      date.getMonth() === reference.getMonth() &&
      date.getFullYear() === reference.getFullYear()
    );
  }

  if (period === 'month') {
    return (
      date.getMonth() === reference.getMonth() &&
      date.getFullYear() === reference.getFullYear()
    );
  }

  return date.getFullYear() === reference.getFullYear();
}

/** Retorna se `date` cai no período imediatamente anterior ao período de `reference` (para calcular deltas). */
export function isInPreviousPeriod(date: Date, period: Period, reference: Date = new Date()): boolean {
  if (period === 'today') {
    const yesterday = new Date(reference);
    yesterday.setDate(yesterday.getDate() - 1);
    return isInPeriod(date, 'today', yesterday);
  }

  if (period === 'month') {
    const lastMonth = new Date(reference.getFullYear(), reference.getMonth() - 1, 1);
    return isInPeriod(date, 'month', lastMonth);
  }

  const lastYear = new Date(reference.getFullYear() - 1, reference.getMonth(), 1);
  return isInPeriod(date, 'year', lastYear);
}

export function periodLabel(period: Period): string {
  if (period === 'today') return 'Hoje';
  if (period === 'month') return 'Este mês';
  return 'Ano';
}

export function percentDelta(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}
