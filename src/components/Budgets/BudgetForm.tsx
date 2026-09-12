'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Client } from '@/src/types/Client';
import { Product } from '@/src/types/Product';
import { Budget, BudgetItem } from '@/src/types/Budget';
import { ProductPrice } from '@/src/types/ProductPrice';
import { formatBRL } from '@/src/lib/format';

interface Props {
  clients: Client[];
  products: Product[];
  prices: ProductPrice[];
  onSubmit: (data: {
    clientId: string | null;
    clientName: string;
    clientPhone: string;
    items: BudgetItem[];
    totalItems: number;
    totalValue: number;
  }) => void | Promise<void>;
  onCancel: () => void;
  initialData?: Budget | null;
}

const inputClass =
  'w-full rounded-input border border-border-input bg-surface-subtle-2 px-3 py-2.5 text-[13px] text-ink placeholder:text-placeholder focus:outline-none focus:border-accent';
const labelClass = 'mb-1.5 block text-[12px] font-semibold text-ink-2';

export function BudgetForm({ clients, products, prices, onSubmit, onCancel, initialData }: Props) {
  const [clientId, setClientId] = useState(initialData?.clientId ?? '');
  const [clientName, setClientName] = useState(initialData?.clientName ?? '');
  const [clientPhone, setClientPhone] = useState(initialData?.clientPhone ?? '');
  const [items, setItems] = useState<BudgetItem[]>(initialData?.items ?? []);
  const [pendingProductId, setPendingProductId] = useState('');
  const [pendingQty, setPendingQty] = useState(1);

  function handleSelectClient(id: string) {
    setClientId(id);

    const client = clients.find((c) => c.id === id);
    if (client) {
      setClientName(client.name);
      setClientPhone(client.phone);
    }
  }

  function handleAddProduct(product: Product, quantity: number) {
    const exists = items.find((i) => i.productId === product.id);
    if (exists) return;

    const productPrice = prices.find((p) => p.productId === product.id);
    const unitPrice = productPrice ? Number(productPrice.salePrice.toFixed(2)) : 0;
    const qty = Math.max(1, quantity);
    const subtotal = Number((unitPrice * qty).toFixed(2));

    setItems((prev) => [
      ...prev,
      { productId: product.id, productName: product.name, quantity: qty, unitPrice, subtotal },
    ]);
  }

  function updateQuantity(index: number, quantity: number) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const subtotal = Number((item.unitPrice * quantity).toFixed(2));
        return { ...item, quantity, subtotal };
      })
    );
  }

  function updateUnitPrice(index: number, unitPrice: number) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const finalPrice = Number(unitPrice.toFixed(2));
        const subtotal = Number((finalPrice * item.quantity).toFixed(2));
        return { ...item, unitPrice: finalPrice, subtotal };
      })
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const totals = useMemo(() => {
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalValue = items.reduce((sum, i) => sum + i.subtotal, 0);
    return { totalItems, totalValue };
  }, [items]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!clientName.trim() || !clientPhone.trim() || items.length === 0) {
      alert('Informe o nome e telefone do cliente e ao menos um produto.');
      return;
    }

    onSubmit({
      clientId: clientId || null,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      items,
      totalItems: totals.totalItems,
      totalValue: totals.totalValue,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {clients.length > 0 && (
          <div>
            <label className={labelClass}>Cliente cadastrado (opcional)</label>
            <select
              className={inputClass}
              value={clientId}
              onChange={(e) => handleSelectClient(e.target.value)}
            >
              <option value="">Digitar manualmente...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]">
          <div>
            <label className={labelClass}>Nome do cliente</label>
            <input
              type="text"
              className={inputClass}
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                setClientId('');
              }}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Telefone</label>
            <input
              type="text"
              className={inputClass}
              value={clientPhone}
              onChange={(e) => {
                setClientPhone(e.target.value);
                setClientId('');
              }}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_140px_auto]">
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
                      value={item.unitPrice}
                      onChange={(e) => updateUnitPrice(index, Math.max(0, Number(e.target.value)))}
                      className="w-20 rounded border border-border-input bg-surface-subtle-2 px-1.5 py-0.5 text-[12px] font-mono"
                    />
                  </p>
                </div>

                <p className="shrink-0 font-mono text-[13px] font-semibold text-ink">
                  {formatBRL(item.subtotal)}
                </p>

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
          <span className="text-ink-3">
            Itens <span className="font-mono font-semibold text-ink">{totals.totalItems}</span>
          </span>
          <span className="text-ink-3">
            Total <span className="font-mono font-semibold text-ink">{formatBRL(totals.totalValue)}</span>
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
          Salvar orçamento
        </button>
      </div>
    </form>
  );
}
