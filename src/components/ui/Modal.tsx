'use client';

import { ReactNode, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

type ModalProps = {
  open: boolean;
  title?: string;
  subtitle?: string;
  maxWidth?: number;
  onClose: () => void;
  children: ReactNode;
};

const noopSubscribe = () => () => {};

// document.body só existe no cliente — evita mismatch de hidratação sem setState em efeito.
function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

export function Modal({ open, title, subtitle, maxWidth = 560, onClose, children }: ModalProps) {
  const isClient = useIsClient();

  if (!open || !isClient) return null;

  // Renderizado via portal direto no <body>: assim o modal (position: fixed) nunca fica
  // preso dentro do elemento animado do PageTransition (transform ali quebraria o fixed).
  return createPortal(
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
    </div>,
    document.body
  );
}
