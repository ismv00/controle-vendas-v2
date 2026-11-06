'use client';

import React, { useMemo, useState } from 'react';
import { Product } from '@/src/types/Product';
import { ProductPrice } from '@/src/types/ProductPrice';
import { ProductPriceFormData } from '@/src/types/ProductPriceForm';
import { formatBRL } from '@/src/lib/format';

interface Props {
  products: Product[];
  initialData?: ProductPrice | null;
  onSubmit: (data: ProductPriceFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full rounded-input border border-border-input bg-surface-subtle-2 px-3 py-2.5 text-[13px] text-ink placeholder:text-placeholder focus:outline-none focus:border-accent disabled:bg-fill-input disabled:text-ink-3';
const labelClass = 'mb-1.5 block text-[12px] font-semibold text-ink-2';

export function PriceForm({ products, initialData, onSubmit, onCancel }: Props) {
  const [productId, setProductId] = useState(() => initialData?.productId ?? '');
  const [operationalExpensePercent, setOperationalExpensePercent] = useState(
    () => initialData?.operationalExpensePercent ?? 0
  );
  const [marginPercent, setMarginPercent] = useState(() => initialData?.marginPercent ?? 0);
  const [salePriceInput, setSalePriceInput] = useState(() => String(initialData?.salePrice ?? 0));

  const formKey = initialData?.id ?? 'new';

  // Sempre lê o custo bruto direto do produto — nunca do preço já salvo (que já tem a
  // despesa embutida), senão a despesa acaba sendo aplicada de novo a cada edição.
  const cost = useMemo(() => {
    if (!productId) return 0;
    return products.find((p) => p.id === productId)?.cost ?? 0;
  }, [productId, products]);

  const baseCost = useMemo(
    () => cost + cost * (operationalExpensePercent / 100),
    [cost, operationalExpensePercent]
  );

  const salePrice = Number(salePriceInput) || 0;

  // Despesa muda mantendo o markup fixo (recalcula o preço). Markup e Preço de venda se
  // alimentam um do outro: editar qualquer um dos dois recalcula o outro na hora.
  function handleExpenseChange(value: number) {
    setOperationalExpensePercent(value);
    const newBaseCost = cost + cost * (value / 100);
    setSalePriceInput((newBaseCost + newBaseCost * (marginPercent / 100)).toFixed(2));
  }

  function handleMarginChange(value: number) {
    setMarginPercent(value);
    setSalePriceInput((baseCost + baseCost * (value / 100)).toFixed(2));
  }

  function handleSalePriceChange(value: string) {
    setSalePriceInput(value);
    const newPrice = Number(value) || 0;
    const newMargin = baseCost > 0 ? ((newPrice - baseCost) / baseCost) * 100 : 0;
    setMarginPercent(Number(newMargin.toFixed(2)));
  }

  function handleProductChange(value: string) {
    setProductId(value);
    const newCost = products.find((p) => p.id === value)?.cost ?? 0;
    const newBaseCost = newCost + newCost * (operationalExpensePercent / 100);
    setSalePriceInput((newBaseCost + newBaseCost * (marginPercent / 100)).toFixed(2));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!productId) {
      alert('Selecione um produto.');
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    onSubmit({
      productId,
      productName: product.name,
      baseCost,
      operationalExpensePercent,
      marginPercent,
      salePrice,
    });
  }

  return (
    <form key={formKey} onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Produto</label>
          <select
            className={inputClass}
            value={productId}
            onChange={(e) => handleProductChange(e.target.value)}
            required
            disabled={!!initialData}
          >
            <option value="">Selecione um produto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Preço de custo</label>
            <input type="number" className={inputClass} value={cost} disabled />
          </div>

          <div>
            <label className={labelClass}>Despesa (%)</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={operationalExpensePercent}
              onChange={(e) => handleExpenseChange(Number(e.target.value))}
            />
          </div>

          <div>
            <label className={labelClass}>Markup (%)</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={marginPercent}
              onChange={(e) => handleMarginChange(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="rounded-block border border-[#e0eae4] bg-[#f3f6f4] px-4 py-3">
          <p className="text-[12px] text-ink-2">Custo real (custo + despesa)</p>
          <p className="mt-0.5 font-mono text-[13px] font-medium text-ink">{formatBRL(baseCost)}</p>

          <label className="mt-3 block text-[12px] text-ink-2">Preço de venda</label>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[18px] font-semibold text-[#14663f]">R$</span>
            <input
              type="number"
              step="0.01"
              className="w-full border-none bg-transparent font-mono text-[18px] font-semibold text-[#14663f] focus:outline-none"
              value={salePriceInput}
              onChange={(e) => handleSalePriceChange(e.target.value)}
            />
          </div>
          <p className="mt-1 text-[11px] text-ink-4">
            Altere o preço direto aqui, ou o markup acima — um recalcula o outro.
          </p>
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
          {initialData ? 'Salvar alterações' : 'Salvar preço'}
        </button>
      </div>
    </form>
  );
}
