'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  open: boolean;
  title?: string;
  subtitle?: string;
  maxWidth?: number;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ open, title, subtitle, maxWidth = 560, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(20,19,17,.42)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[85vh] w-full flex-col rounded-modal bg-surface shadow-modal animate-vf-in-modal"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-start justify-between gap-4 px-6 py-5">
            <div>
              <h3 className="text-[18px] font-bold tracking-[-.02em] text-ink">{title}</h3>
              {subtitle && <p className="mt-1 text-[12.5px] text-ink-4">{subtitle}</p>}
            </div>

            <button
              onClick={onClose}
              className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-iconbtn border border-[#e6e3dc] text-ink-3 transition hover:bg-surface-subtle-2"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
