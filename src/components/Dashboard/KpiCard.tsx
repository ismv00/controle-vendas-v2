type Tone = 'positive' | 'warn' | 'neutral';

type Props = {
  label: string;
  value: string;
  delta?: string;
  tone?: Tone;
};

const TONE_TEXT: Record<Tone, string> = {
  positive: 'text-positive',
  warn: 'text-warn-2',
  neutral: 'text-ink-3',
};

export function KpiCard({ label, value, delta, tone = 'neutral' }: Props) {
  return (
    <div className="rounded-card border border-border-divider-2 bg-surface p-4">
      <p className="text-[11.5px] text-ink-3">{label}</p>
      <p className="mt-1.5 font-mono text-2xl font-semibold tracking-[-.02em] text-ink">{value}</p>
      {delta && <p className={`mt-1 text-[11.5px] font-semibold ${TONE_TEXT[tone]}`}>{delta}</p>}
    </div>
  );
}
