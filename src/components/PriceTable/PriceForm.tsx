'use client'

import React, { useEffect, useMemo, useState } from "react";
import { Product } from "@/src/types/Product";
import { ProductPrice } from "@/src/types/ProductPrice";
import { ProductPriceFormData } from "@/src/types/ProductPriceForm";

interface Props {
    products: Product[];
    initialData?: ProductPrice | null;
    onSubmit: (data: ProductPriceFormData) => void;
}

export function PriceForm({ products, initialData, onSubmit }: Props) {
    const [productId, setProductId] = useState('');
    const [cost, setCost] = useState(0);

    const [operationalExpensePercent, setOperationalExpensePercent] = useState(0);
    const [marginPercent, setMarginPercent] = useState(0);

    // PRODUTO SELECIONADO
    useEffect(() => {
        if (!productId) return;

        const product = products.find((p) => p.id === productId);
        if (product) {
            setCost(product.cost);
        }
    }, [productId, products])

    // EDITAR PRODUTO
    useEffect(() => {
        if (initialData) {
            setProductId(initialData.productId)
            setCost(initialData.cost)
            setOperationalExpensePercent(initialData.operationalExpensePercent);
            setMarginPercent(initialData.marginPercent)
        } else {
            setProductId('')
            setCost(0);
            setOperationalExpensePercent(0);
            setMarginPercent(0);
        }
    }, [initialData]);

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
            salePrice
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* PRODUTO */}
            <div>
                <label className="block text-sm font-medium mb-1">Produto</label>
                <select className="input" value={productId} onChange={(e) => setProductId(e.target.value)}
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

            {/* CUSTO */}
            <div>
                <label className="block text-sm font-medium mb-1">Preço de custo</label>
                <input type="number" className="input bg-gray-100" value={cost} disabled />
            </div>

            {/* DESPESA */}
            <div>
                <label className="block text-sm font-medium mb-1">Despesa Operacional</label>
                <input type="number" step="0.01" className="input" value={operationalExpensePercent} onChange={(e) => setOperationalExpensePercent(Number(e.target.value))} />
            </div>

            {/* MARGEM */}
            <div>
                <label className="block text-sm font-medium mb-1">
                    Margem de venda (%)
                </label>
                <input type="number" step="0.01" className="input" value={marginPercent}
                    onChange={(e) => setMarginPercent(Number(e.target.value))}
                />
            </div>

            {/* RESULTADO */}
            <div className="border-t pt-3 text-sm">
                <p>Preço de venda: {' '}
                    <span className="font-semibold">R$ {salePrice.toFixed(2)}</span>
                </p>
            </div>

            {/* ACOES */}
            <div className="flex justify-end">
                <button
                    type="submit" className="btn-primary"
                >
                    {initialData ? 'Atualizar Preço' : 'Salvar Preço'}

                </button>
            </div>
        </form>
    );
}
