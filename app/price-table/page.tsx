'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';

import { PriceForm } from '@/src/components/PriceTable/PriceForm';
import { PriceList } from '@/src/components/PriceTable/PriceList';

import { getProductsByUser } from '@/src/services/productService';
import { getProductPricesByUser, createProductPrice, deleteProductPrice, updateProductPrice } from '@/src/services/priceService';

import { Product } from '@/src/types/Product';
import { ProductPrice } from '@/src/types/ProductPrice';
import { ProductPriceFormData } from '@/src/types/ProductPriceForm';

const USER_ID = 'wSkNQJ8eyFh6FL4E1Z51vfopnQc2';

export default function PriceTablePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [prices, setPrices] = useState<ProductPrice[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [editingPrice, setEditingPrice] = useState<ProductPrice | null>(null);

    async function loadData() {
        setLoading(true);

        const [productsData, pricesData] = await Promise.all([
            getProductsByUser(USER_ID),
            getProductPricesByUser(USER_ID),
        ]);

        setProducts(productsData);
        setPrices(pricesData);
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    async function handleCreatePrice(data: ProductPriceFormData) {
        if (editingPrice) {
            await updateProductPrice(editingPrice.id, data);

        } else {
            await createProductPrice({
                ...data,
                userId: USER_ID
            })
        }

        setOpen(false);
        setEditingPrice(null);
        loadData();
    }

    async function handleDeletePrice(id: string) {
        const confirm = window.confirm("Deseja realmente excluir este preço?")
        if (!confirm) return;

        await deleteProductPrice(id);
        loadData()
    }

    function handleEditPrice(price: ProductPrice) {
        setEditingPrice(price);
        setOpen(true)
    }

    return (
        <>
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold">Tabela de Preços</h1>

                <button className="btn-primary" onClick={() => {
                    setEditingPrice(null)
                    setOpen(true);
                }}>
                    Novo Preço
                </button>
            </div>

            {/* LISTA */}
            {loading ? (
                <p className="text-sm text-gray-500">Carregando preços...</p>
            ) : (
                <PriceList prices={prices} onEdit={handleEditPrice} onDelete={handleDeletePrice} />
            )}

            {/* MODAL */}
            <Modal open={open} title={editingPrice ? 'Editar Preço' : 'Novo Preço'
            } onClose={() => {
                setOpen(false)
                setEditingPrice(null);
            }}>
                <PriceForm
                    products={products}
                    onSubmit={handleCreatePrice}
                    initialData={editingPrice}
                />
            </Modal>
        </>
    );
}
