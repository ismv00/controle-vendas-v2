'use client';

import { useMemo, useState } from 'react';
import { ProductPrice } from '@/src/types/ProductPrice';
import { Pencil, Trash2 } from 'lucide-react';
import { formatBRL } from '@/src/lib/format';

interface Props {
  prices: ProductPrice[];
  onEdit?: (price: ProductPrice) => void;
  onDelete?: (id: string) => void;
}

type Filter = 'all' | 'negative' | 'lowMargin';

function calculateProfit(price: ProductPrice): number {
  const baseCost = price.baseCost ?? 0;
  const expense = baseCost * (price.operationalExpensePercent / 100);
  return price.salePrice - baseCost - expense;
}

export function PriceList({ prices, onEdit, onDelete }: Props) {
  const [filter, setFilter] = useState<Filter>('all');

  const negativeCount = useMemo(() => prices.filter((p) => calculateProfit(p) < 0).length, [prices]);
  const lowMarginCount = useMemo(() => prices.filter((p) => p.marginPercent < 60).length, [prices]);

  const filtered = useMemo(() => {
    if (filter === 'negative') return prices.filter((p) => calculateProfit(p) < 0);
    if (filter === 'lowMargin') return prices.filter((p) => p.marginPercent < 60);
    return prices;
  }, [prices, filter]);

  const chips: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'negative', label: `Lucro negativo · ${negativeCount}` },
    { key: 'lowMargin', label: `Margem abaixo de 60% · ${lowMarginCount}` },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setFilter(chip.key)}
            className={`rounded-pill px-3 py-1.5 text-[12px] font-semibold transition ${
              filter === chip.key
                ? 'bg-dark text-white'
                : 'border border-border-input bg-white text-ink-2 hover:border-ink-4'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-card border border-border-divider-2 bg-surface">
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-mute">
            {prices.length === 0 ? 'Nenhum preço cadastrado.' : 'Nenhum item nesse filtro.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-[.06em] text-ink-4">
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3 text-right">Custo</th>
                  <th className="px-4 py-3 text-right">Despesa</th>
                  <th className="px-4 py-3">Margem</th>
                  <th className="px-4 py-3 text-right">Preço de venda</th>
                  <th className="px-4 py-3 text-right">Lucro</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((price) => {
                  const profit = calculateProfit(price);
                  const lowMargin = price.marginPercent < 60;
                  const barWidth = Math.min(100, price.marginPercent / 3);

                  return (
                    <tr
                      key={price.id}
                      className="border-t border-border-row transition hover:bg-surface-subtle-2"
                    >
                      <td className="px-4 py-3 font-semibold text-ink">{price.productName}</td>

                      <td className="px-4 py-3 text-right font-mono text-ink-2">
                        {formatBRL(price.baseCost)}
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-ink-2">
                        {price.operationalExpensePercent}%
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-[5px] w-[56px] overflow-hidden rounded-pill bg-[#f0eee9]">
                            <div
                              className="h-full rounded-pill"
                              style={{
                                width: `${barWidth}%`,
                                background: lowMargin ? '#d98a3a' : '#4338ca',
                              }}
                            />
                          </div>
                          <span className="font-mono text-[12px] text-ink-2">{price.marginPercent}%</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-semibold text-ink">
                        {formatBRL(price.salePrice)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-flex rounded-chip px-2 py-[3px] font-mono text-[12.5px] font-semibold ${
                            profit >= 0 ? 'bg-positive-bg text-positive' : 'bg-negative-bg text-negative'
                          }`}
                        >
                          {formatBRL(profit)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(price)}
                              title="Editar preço"
                              className="flex h-7 w-7 items-center justify-center rounded-iconbtn border border-[#e6e3dc] text-ink-3 transition hover:border-[#dcd8d0]"
                            >
                              <Pencil size={14} />
                            </button>
                          )}

                          {onDelete && (
                            <button
                              onClick={() => onDelete(price.id)}
                              title="Excluir preço"
                              className="flex h-7 w-7 items-center justify-center rounded-iconbtn border border-negative-border text-negative transition hover:bg-negative-bg"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
