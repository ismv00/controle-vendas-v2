'use client';

import Link from 'next/link';
import { Sale } from '@/src/types/Sale';
import { Avatar } from '@/src/components/ui/Avatar';

interface Props {
  sales: Sale[];
}

export function RecentSales({ sales }: Props) {
  return (
    <div className="rounded-card border border-border-divider bg-surface">
      <div className="flex items-center justify-between border-b border-border-divider-2 px-5 py-4">
        <h2 className="text-[14px] font-semibold text-ink">Vendas recentes</h2>
        <Link href="/vendas" className="text-[12.5px] font-semibold text-accent hover:underline">
          Ver todas
        </Link>
      </div>

      {sales.length === 0 ? (
        <p className="px-5 py-8 text-center text-[13px] text-mute">
          Nenhuma venda registrada neste período.
        </p>
      ) : (
        <div>
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center gap-3 border-b border-border-row px-5 py-3 last:border-0 hover:bg-surface-subtle-2"
            >
              <Avatar name={sale.clientName} size={28} />

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-ink">{sale.clientName}</p>
                <p className="text-[11.5px] text-ink-3">
                  {sale.totalItems} {sale.totalItems === 1 ? 'item' : 'itens'} ·{' '}
                  {sale.createdAt.toLocaleDateString('pt-BR')}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="font-mono text-[13px] font-semibold text-ink">
                  R$ {sale.totalValue.toFixed(2)}
                </p>
                <p className="font-mono text-[11.5px] font-medium text-positive">
                  R$ {sale.totalProfit.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
