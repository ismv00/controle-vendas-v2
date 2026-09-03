type Bucket = { date: Date; value: number };

type Props = {
  buckets: Bucket[];
};

const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

function formatAxis(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]}`;
}

export function TrendChart({ buckets }: Props) {
  const max = Math.max(...buckets.map((b) => b.value), 1);

  return (
    <div>
      <div className="flex h-24 items-end gap-[5px]">
        {buckets.map((bucket, i) => {
          const percent = bucket.value === 0 ? 0 : Math.max(4, Math.round((bucket.value / max) * 100));
          const color =
            percent > 85 ? '#7ee2b0' : `rgba(255,255,255, ${(0.16 + percent / 400).toFixed(3)})`;

          return (
            <div
              key={i}
              className="flex-1 rounded-t-[4px] rounded-b-[2px]"
              style={{ height: `${percent}%`, background: color }}
              title={`${bucket.date.toLocaleDateString('pt-BR')}: R$ ${bucket.value.toFixed(2)}`}
            />
          );
        })}
      </div>

      <div className="mt-2 flex justify-between font-mono text-[10.5px] text-white/40">
        <span>{formatAxis(buckets[0].date)}</span>
        <span>{formatAxis(buckets[Math.floor(buckets.length / 2)].date)}</span>
        <span>{formatAxis(buckets[buckets.length - 1].date)}</span>
      </div>
    </div>
  );
}
