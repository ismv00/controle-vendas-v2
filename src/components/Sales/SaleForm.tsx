'use client';

import { useEffect, useMemo, useState } from 'react';
import { Client } from '@/src/types/Client';
import { Product } from '@/src/types/Product';
import { Sale, SaleItem } from '@/src/types/Sale';
import { ProductPrice } from '@/src/types/ProductPrice';

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
  initialData?: Sale | null;
}

export function SaleForm({ clients, products, prices, onSubmit, initialData }: Props) {
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);

  /* =====================
     ADICIONAR PRODUTO
     ===================== */
  function handleAddProduct(product: Product) {
    const exists = items.find((i) => i.productId === product.id);
    if (exists) return;

    const productPrice = prices.find(
      (p) => p.productId === product.id
    );

    if (!productPrice) {
      alert('Este produto não possui preço de venda cadastrado.');
      return;
    }

    const basePrice = Number(productPrice.salePrice.toFixed(2));
    const baseCost = Number(productPrice.baseCost.toFixed(2));

    const profit = Number((basePrice - baseCost).toFixed(2));
    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        baseCost,
        basePrice,
        price: basePrice,
        discountPercent: 0,
        quantity: 1,
        subtotal: basePrice,
        profit,
      },
    ]);
  }

  /* =====================
     ATUALIZA POR %
     ===================== */
  function updateDiscountPercent(index: number, percent: number) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const price = item.basePrice * (1 + percent / 100);
        const finalPrice = Number(price.toFixed(2));

        const subtotal = Number((finalPrice * item.quantity).toFixed(2));
        const profit = Number((subtotal - item.baseCost * item.quantity).toFixed(2));
        return {
          ...item,
          discountPercent: percent,
          price: finalPrice,
          subtotal,
          profit,
        };
      })
    );
  }

  /* =====================
     ATUALIZA POR PREÇO
     ===================== */
  function updatePrice(index: number, price: number) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const percent =
          ((price - item.basePrice) / item.basePrice) * 100;

        const finalPrice = Number(price.toFixed(2));

        const subtotal = Number((finalPrice * item.quantity).toFixed(2));
        const profit = Number((subtotal - item.baseCost * item.quantity).toFixed(2));
        return {
          ...item,
          price: finalPrice,
          discountPercent: Number(percent.toFixed(2)),
          subtotal,
          profit,
        };
      })
    );
  }

  /* =====================
     QUANTIDADE
     ===================== */
  function updateQuantity(index: number, quantity: number) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? (() => {
            const subtotal = Number((item.price * quantity).toFixed(2));
            const profit = Number((subtotal - item.baseCost * quantity).toFixed(2));
            return { ...item, quantity, subtotal, profit };
          })()
          : item
      )
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  /* =====================
     CÁLCULOS
     ===================== */
  const totals = useMemo(() => {
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalValue = items.reduce((sum, i) => sum + i.subtotal, 0);
    const totalCost = items.reduce((sum, i) => sum + i.baseCost * i.quantity, 0);
    const totalProfit = totalValue - totalCost

    return { totalItems, totalValue, totalCost, totalProfit };
  }, [items]);

  /* =====================
     SUBMIT
     ===================== */
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
      ...totals,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* CLIENTE */}
      <div>
        <label className="block text-sm font-medium mb-1">Cliente</label>
        <select
          className="input"
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

      {/* PRODUTOS */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Adicionar Produto
        </label>

        <select
          className="input"
          defaultValue=""
          onChange={(e) => {
            const product = products.find((p) => p.id === e.target.value);
            if (product) handleAddProduct(product);
            e.target.value = '';
          }}
        >
          <option value="">Selecione um produto</option>
          {products.map((product) => (
            <option
              key={product.id}
              value={product.id}
              disabled={items.some((i) => i.productId === product.id)}
            >
              {product.name}
            </option>
          ))}
        </select>
      </div>

      {/* ITENS */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.productId}
              className="rounded-lg border bg-gray-50 p-4 space-y-3"
            >
              {/* Cabeçalho */}
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">
                  {item.productName}
                </span>

                <button
                  type="button"
                  className="text-xs text-red-500 hover:text-red-700"
                  onClick={() => removeItem(index)}
                >
                  Remover
                </button>
              </div>

              {/* Campos */}
              <div className="grid grid-cols-4 gap-4 items-end">
                {/* Quantidade */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Qtd
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="input"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(index, Number(e.target.value))
                    }
                  />
                </div>

                {/* Preço */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Preço Unit. (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={item.price}
                    onChange={(e) =>
                      updatePrice(index, Number(e.target.value))
                    }
                  />
                </div>

                {/* Desconto / Acréscimo */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    DESC / ACRES %
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={item.discountPercent}
                    onChange={(e) =>
                      updateDiscountPercent(index, Number(e.target.value))
                    }
                  />
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <span className="block text-xs text-gray-500 mb-1">
                    Subtotal
                  </span>
                  <span className="font-semibold">
                    R$ {item.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RESUMO */}
      <div className="mt-6 border-t pt-4 text-sm space-y-1">
        <p>
          Itens: <span className="font-medium">{totals.totalItems}</span>
        </p>
        <p>
          Total:{' '}
          <span className="font-medium">
            R$ {totals.totalValue.toFixed(2)}
          </span>
        </p>
        <p className="text-green-600">
          Lucro:{' '}
          <span className="font-medium">
            R$ {totals.totalProfit.toFixed(2)}
          </span>
        </p>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary">
          Salvar Venda
        </button>
      </div>
    </form>
  );
}
