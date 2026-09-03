'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Client } from '@/src/types/Client';
import { Product } from '@/src/types/Product';
import { Sale, SaleItem } from '@/src/types/Sale';
import { ProductPrice } from '@/src/types/ProductPrice';
import { formatBRL } from '@/src/lib/format';

interface Props {
  clients: Client[];
  products: Product[];
  prices: ProductPrice[];
  onSubmit: (data: {
    clientId: string;
    clientName: string;
    items: SaleItem[];
    totalItems: number;
    totalValue: number;
    totalProfit: number;
  }) => void | Promise<void>;
  onCancel: () => void;
  initialData?: Sale | null;
}

const inputClass =
  'w-full rounded-input border border-border-input bg-surface-subtle-2 px-3 py-2.5 text-[13px] text-ink placeholder:text-placeholder focus:outline-none focus:border-accent';
const labelClass = 'mb-1.5 block text-[12px] font-semibold text-ink-2';

export function SaleForm({ clients, products, prices, onSubmit, onCancel, initialData }: Props) {
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [pendingProductId, setPendingProductId] = useState('');
  const [pendingQty, setPendingQty] = useState(1);

  function handleAddProduct(product: Product, quantity: number) {
    const exists = items.find((i) => i.productId === product.id);
    if (exists) return;

    const productPrice = prices.find((p) => p.productId === product.id);

    if (!productPrice) {
      alert('Este produto não possui preço de venda cadastrado.');
      return;
    }

    const basePrice = Number(productPrice.salePrice.toFixed(2));
    const baseCost = Number(productPrice.baseCost.toFixed(2));
    const qty = Math.max(1, quantity);
    const subtotal = Number((basePrice * qty).toFixed(2));
    const profit = Number((subtotal - baseCost * qty).toFixed(2));

    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        baseCost,
        basePrice,
        price: basePrice,
        discountPercent: 0,
        quantity: qty,
        subtotal,
        profit,
      },
    ]);
  }

  function updateQuantity(index: number, quantity: number) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const subtotal = Number((item.price * quantity).toFixed(2));
        const profit = Number((subtotal - item.baseCost * quantity).toFixed(2));
        return { ...item, quantity, subtotal, profit };
      })
    );
  }

  function updatePrice(index: number, price: number) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const percent = item.basePrice > 0 ? ((price - item.basePrice) / item.basePrice) * 100 : 0;
        const finalPrice = Number(price.toFixed(2));
        const subtotal = Number((finalPrice * item.quantity).toFixed(2));
        const profit = Number((subtotal - item.baseCost * item.quantity).toFixed(2));

        return { ...item, price: finalPrice, discountPercent: Number(percent.toFixed(2)), subtotal, profit };
      })
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const totals = useMemo(() => {
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalValue = items.reduce((sum, i) => sum + i.subtotal, 0);
    const totalCost = items.reduce((sum, i) => sum + i.baseCost * i.quantity, 0);
    const totalProfit = totalValue - totalCost;
    const margin = totalValue > 0 ? (totalProfit / totalValue) * 100 : 0;

    return { totalItems, totalValue, totalCost, totalProfit, margin };
  }, [items]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!clientId || items.length === 0) {
      alert('Selecione um cliente e ao menos um produto.');
      return;
    }

    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    onSubmit({
      clientId,
      clientName: client.name,
      items,
      totalItems: totals.totalItems,
      totalValue: totals.totalValue,
      totalProfit: totals.totalProfit,
    });
  }

  useEffect(() => {
    if (initialData) {
      setClientId(initialData.clientId);
      setItems(initialData.items);
    } else {
      setClientId('');
      setItems([]);
    }
  }, [initialData]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.3fr_1fr]">
          <div>
            <label className={labelClass}>Cliente</label>
            <select
              className={inputClass}
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Data</label>
            <input
              className={`${inputClass} font-mono`}
              value={(initialData?.createdAt ?? new Date()).toLocaleDateString('pt-BR')}
              disabled
            />
          </div>
        </div>

        <div className="grid grid-cols-[1fr_96px_auto] items-end gap-3">
          <div>
            <label className={labelClass}>Adicionar produto</label>
            <select
              className={inputClass}
              value={pendingProductId}
              onChange={(e) => setPendingProductId(e.target.value)}
            >
              <option value="">Selecione um produto</option>
              {products.map((product) => {
                const price = prices.find((p) => p.productId === product.id);
                return (
                  <option
                    key={product.id}
                    value={product.id}
                    disabled={items.some((i) => i.productId === product.id)}
                  >
                    {product.name} {price ? `— ${formatBRL(price.salePrice)}` : '(sem preço)'}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className={labelClass}>Qtd</label>
            <input
              type="number"
              min={1}
              value={pendingQty}
              onChange={(e) => setPendingQty(Math.max(1, Number(e.target.value)))}
              className={inputClass}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              const product = products.find((p) => p.id === pendingProductId);
              if (!product) return;
              handleAddProduct(product, pendingQty);
              setPendingProductId('');
              setPendingQty(1);
            }}
            className="h-[42px] rounded-input border border-[#dcd8d0] bg-white px-4 text-[13px] font-semibold text-ink transition hover:border-ink-4"
          >
            Adicionar
          </button>
        </div>

        {items.length > 0 && (
          <div className="divide-y divide-border-row rounded-block border border-border-input">
            {items.map((item, index) => (
              <div key={item.productId} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink">{item.productName}</p>
                  <p className="flex items-center gap-1.5 text-[11.5px] text-ink-3">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(index, Math.max(1, Number(e.target.value)))}
                      className="w-14 rounded border border-border-input bg-surface-subtle-2 px-1.5 py-0.5 text-[12px] font-mono"
                    />
                    ×
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={item.price}
                      onChange={(e) => updatePrice(index, Math.max(0, Number(e.target.value)))}
                      className="w-20 rounded border border-border-input bg-surface-subtle-2 px-1.5 py-0.5 text-[12px] font-mono"
                    />
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-mono text-[13px] font-semibold text-ink">
                    {formatBRL(item.subtotal)}
                  </p>
                  <p className="font-mono text-[11.5px] font-medium text-positive">
                    {formatBRL(item.profit)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="shrink-0 text-ink-4 transition hover:text-negative"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between rounded-block bg-surface-subtle-2 px-4 py-3 text-[12.5px]">
          <div className="flex gap-5">
            <span className="text-ink-3">
              Itens <span className="font-mono font-semibold text-ink">{totals.totalItems}</span>
            </span>
            <span className="text-ink-3">
              Total{' '}
              <span className="font-mono font-semibold text-ink">{formatBRL(totals.totalValue)}</span>
            </span>
            <span className="text-ink-3">
              Lucro{' '}
              <span className="font-mono font-semibold text-positive">
                {formatBRL(totals.totalProfit)}
              </span>
            </span>
          </div>

          <span className="text-ink-3">
            Margem <span className="font-mono font-semibold text-ink">{totals.margin.toFixed(1)}%</span>
          </span>
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
          Salvar venda
        </button>
      </div>
    </form>
  );
}
