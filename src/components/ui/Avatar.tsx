type Props = {
  name: string;
  size?: number;
  tone?: 'light' | 'dark';
  className?: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const TONE_CLASSES = {
  light: 'bg-fill-input text-ink-2',
  dark: 'bg-white/10 text-white',
};

export function Avatar({ name, size = 30, tone = 'light', className = '' }: Props) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-iconbtn font-semibold ${TONE_CLASSES[tone]} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {getInitials(name)}
    </div>
  );
}
