type Row = { name: string; quantity: number };

type Props = {
  rows: Row[];
};

const RANK_OPACITY = [1, 0.8, 0.6, 0.42];

export function TopProducts({ rows }: Props) {
  const max = Math.max(...rows.map((r) => r.quantity), 1);

  if (rows.length === 0) {
    return <p className="py-6 text-center text-[13px] text-mute">Nenhuma venda no período.</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={row.name}>
          <div className="mb-1.5 flex items-center justify-between text-[13px]">
            <span className="truncate pr-2 font-medium text-ink">{row.name}</span>
            <span className="shrink-0 font-mono text-ink-2">{row.quantity} un</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-pill bg-[#f0eee9]">
            <div
              className="h-full rounded-pill bg-accent"
              style={{ width: `${(row.quantity / max) * 100}%`, opacity: RANK_OPACITY[i] ?? 0.4 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
