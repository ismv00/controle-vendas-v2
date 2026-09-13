'use client';

import { useState } from 'react';
import { Insumo } from '@/src/types/Insumo';

export type InsumoFormData = {
  name: string;
  unit: string;
  cost: number;
  stockQuantity: number;
};

type Props = {
  onSubmit: (data: InsumoFormData) => void;
  onCancel: () => void;
  initialData?: Insumo | null;
};

const inputClass =
  'w-full rounded-input border border-border-input bg-surface-subtle-2 px-3 py-2.5 text-[13px] text-ink placeholder:text-placeholder focus:outline-none focus:border-accent';
const labelClass = 'mb-1.5 block text-[12px] font-semibold text-ink-2';

export function InsumoForm({ onSubmit, onCancel, initialData }: Props) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [unit, setUnit] = useState(initialData?.unit ?? '');
  const [cost, setCost] = useState(initialData ? String(initialData.cost) : '');
  const [stockQuantity, setStockQuantity] = useState(
    initialData ? String(initialData.stockQuantity) : '0'
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert('Informe o nome do insumo.');
      return;
    }

    if (!unit.trim()) {
      alert('Informe a unidade de medida.');
      return;
    }

    onSubmit({
      name: name.trim(),
      unit: unit.trim(),
      cost: Math.max(0, Number(cost) || 0),
      stockQuantity: Math.max(0, Number(stockQuantity) || 0),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Nome</label>
          <input
            className={inputClass}
            placeholder="Ex.: Papel fotográfico A4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Unidade de medida</label>
            <input
              className={inputClass}
              placeholder="Ex.: folha, litro, metro, un."
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Custo por unidade</label>
            <input
              type="number"
              step="0.01"
              min={0}
              className={inputClass}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
        </div>

        <div className="max-w-[200px]">
          <label className={labelClass}>Quantidade em estoque</label>
          <input
            type="number"
            step="0.001"
            min={0}
            className={inputClass}
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
          />
        </div>
      </div>

      <div className="-mx-6 -mb-5 mt-6 flex justify-end gap-2 rounded-b-modal border-t border-border-divider-2 bg-surface-subtle-2 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-input border border-[#dcd8d0] bg-white px-4 py-2 text-[13px] font-semibold text-ink transition hover:border-ink-4"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-input bg-accent px-5 py-2 text-[13px] font-semibold text-white shadow-btn transition hover:opacity-90"
        >
          {initialData ? 'Salvar alterações' : 'Cadastrar insumo'}
        </button>
      </div>
    </form>
  );
}
