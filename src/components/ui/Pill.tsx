type Tone = 'positive' | 'warn' | 'negative' | 'neutral';

type Props = {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
  mono?: boolean;
};

const TONE_CLASSES: Record<Tone, string> = {
  positive: 'bg-positive-bg text-positive',
  warn: 'bg-warn-bg text-warn-2',
  negative: 'bg-negative-bg text-negative',
  neutral: 'bg-[#eef1ef] text-ink-2',
};

export function Pill({ tone, children, className = '', mono = false }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-2 py-[3px] text-[11px] font-semibold ${
        mono ? 'font-mono' : ''
      } ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
