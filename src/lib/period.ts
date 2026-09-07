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

export type PeriodRange = { start: Date; end: Date };

export function getPeriodRange(period: Period, reference: Date = new Date()): PeriodRange {
  if (period === 'today') {
    const start = new Date(reference);
    start.setHours(0, 0, 0, 0);
    const end = new Date(reference);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (period === 'month') {
    const start = new Date(reference.getFullYear(), reference.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  const start = new Date(reference.getFullYear(), 0, 1, 0, 0, 0, 0);
  const end = new Date(reference.getFullYear(), 11, 31, 23, 59, 59, 999);
  return { start, end };
}

export function getPreviousPeriodRange(period: Period, reference: Date = new Date()): PeriodRange {
  if (period === 'today') {
    const yesterday = new Date(reference);
    yesterday.setDate(yesterday.getDate() - 1);
    return getPeriodRange('today', yesterday);
  }

  if (period === 'month') {
    const lastMonth = new Date(reference.getFullYear(), reference.getMonth() - 1, 1);
    return getPeriodRange('month', lastMonth);
  }

  const lastYear = new Date(reference.getFullYear() - 1, reference.getMonth(), 1);
  return getPeriodRange('year', lastYear);
}

/** Janela imediatamente anterior a `range`, com a mesma duração — usada para comparar períodos customizados. */
export function getPrecedingRange(range: PeriodRange): PeriodRange {
  const durationMs = range.end.getTime() - range.start.getTime();
  const end = new Date(range.start.getTime() - 1);
  const start = new Date(end.getTime() - durationMs);
  return { start, end };
}

export function isInRange(date: Date, range: PeriodRange): boolean {
  return date >= range.start && date <= range.end;
}
