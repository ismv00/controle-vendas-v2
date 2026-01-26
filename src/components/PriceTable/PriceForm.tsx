'use client';

import React, { useMemo, useState } from 'react';
import { Product } from '@/src/types/Product';
import { ProductPrice } from '@/src/types/ProductPrice';
import { ProductPriceFormData } from '@/src/types/ProductPriceForm';

interface Props {
  products: Product[];
  initialData?: ProductPrice | null;
  onSubmit: (data: ProductPriceFormData) => void;
}

export function PriceForm({ products, initialData, onSubmit }: Props) {
  const [productId, setProductId] = useState(() => initialData?.productId ?? '');
  const [operationalExpensePercent, setOperationalExpensePercent] = useState(
    () => initialData?.operationalExpensePercent ?? 0
  );
  const [marginPercent, setMarginPercent] = useState(() => initialData?.marginPercent ?? 0);

  // Reset form when initialData changes (switching between create/edit modes)
  const formKey = initialData?.id ?? 'new';

  // DERIVAR CUSTO: se estiver editando, usa initialData.cost; senão, usa o custo do produto selecionado
  const cost = useMemo(() => {
    if (initialData) {
      return initialData.cost;
    }
    if (productId) {
      const product = products.find((p) => p.id === productId);
      return product?.cost ?? 0;
    }
    return 0;
  }, [initialData, productId, products]);

  // CÁLCULO
  const salePrice = useMemo(() => {
    const base = cost + cost * (operationalExpensePercent / 100);
    return base + base * (marginPercent / 100);
  }, [cost, operationalExpensePercent, marginPercent]);

  //SUBMIT
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
      cost,
      operationalExpensePercent,
      marginPercent,
      salePrice,
    });
  }

  return (
    <form key={formKey} onSubmit={handleSubmit} className="space-y-6">
      {/* PRODUTO */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Produto</label>

        <select
          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* GRID DE VALORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CUSTO */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Preço de custo</label>
          <input
            type="number"
            className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm"
            value={cost}
            disabled
          />
        </div>

        {/* DESPESA */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Despesa Operacional (%)
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={operationalExpensePercent}
            onChange={(e) => setOperationalExpensePercent(Number(e.target.value))}
          />
        </div>

        {/* MARGEM */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Margem de venda (%)
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={marginPercent}
            onChange={(e) => setMarginPercent(Number(e.target.value))}
          />
        </div>
      </div>

      {/* RESULTADO */}
      <div className="bg-gray-50 rounded-lg p-4 border text-sm">
        <p className="text-gray-600">Preço de venda</p>
        <p className="text-lg font-semibold text-green-600">R$ {salePrice.toFixed(2)}</p>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end pt-4 border-t">
        <button type="submit" className="btn-primary px-6">
          {initialData ? 'Salvar alterações' : 'Salvar Preço'}
        </button>
      </div>
    </form>
  );
}
