'use client';

import { useMemo, useState } from 'react';
import { Insumo } from '@/src/types/Insumo';
import { Pencil, Trash2, Boxes } from 'lucide-react';
import { formatBRL } from '@/src/lib/format';

interface Props {
  insumos: Insumo[];
  onEdit: (insumo: Insumo) => void;
  onDelete: (id: string) => void;
}

const LOW_STOCK_THRESHOLD = 5;

export function InsumoList({ insumos, onEdit, onDelete }: Props) {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return insumos;

    return insumos.filter((i) => i.name?.toLowerCase().includes(term));
  }, [insumos, filter]);

  if (insumos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card border border-border-divider-2 bg-surface py-20 text-center">
        <Boxes size={40} className="mb-3 text-mute-2" />
        <p className="text-[13px] text-mute">Nenhum insumo cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Buscar insumo"
        className="w-full max-w-[280px] rounded-block bg-fill-chip px-3 py-2 text-[12.5px] text-ink placeholder:text-placeholder focus:outline-none"
      />

      {filtered.length === 0 ? (
        <p className="rounded-card border border-border-divider-2 bg-surface py-10 text-center text-[13px] text-mute">
          Nenhum insumo encontrado.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((insumo) => {
            const lowStock = insumo.stockQuantity <= LOW_STOCK_THRESHOLD;

            return (
              <div
                key={insumo.id}
                className="rounded-card border border-border-divider-2 bg-surface p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-semibold text-ink">{insumo.name}</p>
                  <p className="text-[11.5px] text-mute">{insumo.unit}</p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border-divider-2 pt-3">
                  <div>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[.06em] text-ink-4">
                      Custo/un.
                    </p>
                    <p className="mt-1 font-mono text-[14px] text-ink">{formatBRL(insumo.cost)}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[.06em] text-ink-4">
                      Estoque
                    </p>
                    <p
                      className={`mt-1 font-mono text-[14px] font-semibold ${
                        insumo.stockQuantity <= 0
                          ? 'text-negative'
                          : lowStock
                          ? 'text-warn-2'
                          : 'text-ink'
                      }`}
                    >
                      {insumo.stockQuantity} {insumo.unit}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex justify-end gap-2 border-t border-border-divider-2 pt-3">
                  <button
                    onClick={() => onEdit(insumo)}
                    title="Editar insumo"
                    className="flex h-7 w-7 items-center justify-center rounded-iconbtn border border-[#e6e3dc] text-ink-3 transition hover:border-[#dcd8d0]"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() => onDelete(insumo.id)}
                    title="Excluir insumo"
                    className="flex h-7 w-7 items-center justify-center rounded-iconbtn border border-negative-border text-negative transition hover:bg-negative-bg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
