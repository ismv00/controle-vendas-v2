'use client';

import { useRouter } from 'next/navigation';
import { Plus, Menu } from 'lucide-react';

type Props = {
  onMenuClick: () => void;
};

export function Topbar({ onMenuClick }: Props) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border-main bg-white/72 px-4 py-4 backdrop-blur-[8px] sm:px-8">
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-iconbtn border border-border-input text-ink-3 transition hover:border-ink-4 lg:hidden"
      >
        <Menu size={16} />
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => router.push('/clients?novo=true')}
          className="hidden rounded-input border border-[#dcd8d0] bg-white px-[14px] py-[9px] text-[13px] font-semibold text-ink transition hover:border-ink-4 sm:inline-flex"
        >
          Novo cliente
        </button>

        <button
          onClick={() => router.push('/produtos?novo=true')}
          className="hidden rounded-input border border-[#dcd8d0] bg-white px-[14px] py-[9px] text-[13px] font-semibold text-ink transition hover:border-ink-4 sm:inline-flex"
        >
          Novo produto
        </button>

        <button
          onClick={() => router.push('/vendas?novo=true')}
          className="flex items-center gap-1.5 rounded-input bg-accent px-4 py-[9px] text-[13px] font-semibold text-white shadow-btn transition hover:opacity-90"
        >
          <Plus size={15} />
          Nova venda
        </button>
      </div>
    </header>
  );
}
