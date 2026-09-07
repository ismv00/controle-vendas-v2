'use client';

import { useState } from 'react';

type Props = {
  name: string;
  src?: string | null;
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

export function Avatar({ name, src, size = 30, tone = 'light', className = '' }: Props) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-iconbtn object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-iconbtn font-semibold ${TONE_CLASSES[tone]} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {getInitials(name)}
    </div>
  );
}
