'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Printer, ShoppingBag } from 'lucide-react';
import { Budget } from '@/src/types/Budget';
import { Avatar } from '@/src/components/ui/Avatar';
import { Pill } from '@/src/components/ui/Pill';
import { formatBRL } from '@/src/lib/format';

interface Props {
  budgets: Budget[];
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
  onConvert: (budget: Budget) => void;
}

function formatControlNumber(n: number) {
  return `#${String(n).padStart(4, '0')}`;
}

export function BudgetList({ budgets, onEdit, onDelete, onConvert }: Props) {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return budgets;

    return budgets.filter((b) => b.clientName?.toLowerCase().includes(term));
  }, [budgets, filter]);

  if (!budgets.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card border border-border-divider-2 bg-surface py-16 text-center">
        <p className="text-[13px] text-mute">Nenhum orçamento registrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-border-divider-2 bg-surface">
      <div className="border-b border-border-divider-2 px-4 py-3">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Buscar orçamento pelo nome do cliente"
          className="w-full max-w-[280px] rounded-block bg-fill-chip px-3 py-2 text-[12.5px] text-ink placeholder:text-placeholder focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="px-4 py-8 text-center text-[13px] text-mute">Nenhum orçamento encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[.06em] text-ink-4">
                <th className="px-4 py-3">Nº</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3 text-right">Itens</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((budget) => {
                const converted = Boolean(budget.convertedSaleId);

                return (
                  <tr
                    key={budget.id}
                    className="border-t border-border-row transition hover:bg-surface-subtle-2"
                  >
                    <td className="px-4 py-3 font-mono text-ink-3">
                      {formatControlNumber(budget.controlNumber)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={budget.clientName} size={28} />
                        <span className="font-semibold text-ink">{budget.clientName}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-ink-2">{budget.clientPhone || '-'}</td>

                    <td className="px-4 py-3 font-mono text-ink-3">
                      {budget.createdAt.toLocaleDateString('pt-BR')}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-ink-2">{budget.totalItems}</td>

                    <td className="px-4 py-3 text-right font-mono text-[13px] font-semibold text-ink">
                      {formatBRL(budget.totalValue)}
                    </td>

                    <td className="px-4 py-3">
                      {converted ? (
                        <Pill tone="positive">Convertido</Pill>
                      ) : (
                        <Pill tone="neutral">Em aberto</Pill>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {!converted && (
                          <button
                            onClick={() => onConvert(budget)}
                            title="Transformar em venda"
                            className="flex h-7 w-7 items-center justify-center rounded-iconbtn border border-[#e6e3dc] text-ink-3 transition hover:border-[#dcd8d0]"
                          >
                            <ShoppingBag size={14} />
                          </button>
                        )}

                        <Link
                          href={`/orcamentos/${budget.id}`}
                          target="_blank"
                          title="Imprimir / salvar PDF"
                          className="flex h-7 w-7 items-center justify-center rounded-iconbtn border border-[#e6e3dc] text-ink-3 transition hover:border-[#dcd8d0]"
                        >
                          <Printer size={14} />
                        </Link>

                        <button
                          onClick={() => onEdit(budget)}
                          title="Editar orçamento"
                          className="flex h-7 w-7 items-center justify-center rounded-iconbtn border border-[#e6e3dc] text-ink-3 transition hover:border-[#dcd8d0]"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          onClick={() => onDelete(budget.id)}
                          title="Excluir orçamento"
                          className="flex h-7 w-7 items-center justify-center rounded-iconbtn border border-negative-border text-negative transition hover:bg-negative-bg"
                        >
                          <Trash2 size={14} />
                        </button>
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
  );
}
