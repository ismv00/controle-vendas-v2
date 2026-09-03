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

  const formKey = initialData?.id ?? 'new';

  const cost = useMemo(() => {
    if (initialData) return initialData.baseCost;
    if (productId) return products.find((p) => p.id === productId)?.cost ?? 0;
    return 0;
  }, [initialData, productId, products]);

  const baseCost = useMemo(
    () => cost + cost * (operationalExpensePercent / 100),
    [cost, operationalExpensePercent]
  );

  const salePrice = useMemo(() => baseCost + baseCost * (marginPercent / 100), [baseCost, marginPercent]);

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
            onChange={(e) => setProductId(e.target.value)}
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
              onChange={(e) => setOperationalExpensePercent(Number(e.target.value))}
            />
          </div>

          <div>
            <label className={labelClass}>Margem (%)</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={marginPercent}
              onChange={(e) => setMarginPercent(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="rounded-block border border-[#e0eae4] bg-[#f3f6f4] px-4 py-3">
          <p className="text-[12px] text-ink-2">Custo real (custo + despesa)</p>
          <p className="mt-0.5 font-mono text-[13px] font-medium text-ink">{formatBRL(baseCost)}</p>

          <p className="mt-2 text-[12px] text-ink-2">Preço de venda</p>
          <p className="mt-0.5 font-mono text-[18px] font-semibold text-[#14663f]">
            {formatBRL(salePrice)}
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
