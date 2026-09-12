export type CsvColumn<T> = {
  key: string;
  label: string;
  value: (row: T) => string | number;
};

function escapeCsvValue(value: string | number): string {
  const str = String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCSV<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCsvValue(c.label)).join(';');

  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvValue(c.value(row))).join(';')
  );

  // ﻿ (BOM) ajuda o Excel a reconhecer acentuação/UTF-8 corretamente.
  return '﻿' + [header, ...lines].join('\r\n');
}
