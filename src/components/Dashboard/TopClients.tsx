import { Avatar } from '@/src/components/ui/Avatar';
import { formatBRL } from '@/src/lib/format';

type Row = { name: string; total: number; purchases: number };

type Props = {
  rows: Row[];
};

const RANK_OPACITY = [1, 0.8, 0.6, 0.42, 0.3];

export function TopClients({ rows }: Props) {
  const max = Math.max(...rows.map((r) => r.total), 1);

  if (rows.length === 0) {
    return <p className="py-6 text-center text-[13px] text-mute">Nenhuma venda no período.</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={row.name}>
          <div className="mb-1.5 flex items-center gap-2.5">
            <Avatar name={row.name} size={22} />
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">{row.name}</span>
            <span className="shrink-0 font-mono text-[12.5px] text-ink-2">{formatBRL(row.total)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-pill bg-[#f0eee9]">
            <div
              className="h-full rounded-pill bg-accent"
              style={{ width: `${(row.total / max) * 100}%`, opacity: RANK_OPACITY[i] ?? 0.3 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
