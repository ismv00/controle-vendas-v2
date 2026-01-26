'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { SaleList } from '@/src/components/Sales/SaleList';
import { SaleForm } from '@/src/components/Sales/SaleForm';

import { getSalesByUser, deleteSale, createSale, updateSale } from '@/src/services/saleService';
import { getClientsByUser } from '@/src/services/clientService';
import { getProductsByUser } from '@/src/services/productService';
import { getProductPricesByUser } from '@/src/services/priceService';
import { ProductPrice } from '@/src/types/ProductPrice';

import { Sale } from '@/src/types/Sale';
import { Client } from '@/src/types/Client';
import { Product } from '@/src/types/Product';

import { useAuth } from '@/src/contexts/AuthContext';



export default function SalesPage() {
  const { user, loading: authLoading } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const [prices, setPrices] = useState<ProductPrice[]>([]);

  async function loadData(userId: string) {
    setLoading(true);

    const [salesData, clientsData, productsData, pricesData] = await Promise.all([
      getSalesByUser(userId),
      getClientsByUser(userId),
      getProductsByUser(userId),
      getProductPricesByUser(userId)
    ]);

    setSales(salesData);
    setClients(clientsData);
    setProducts(productsData);
    setPrices(pricesData);

    setLoading(false);
  }

  useEffect(() => {
    if (authLoading || !user) return;
    loadData(user.uid);
  }, [authLoading, user]);


  async function handleSaveSale(data: any) {
    if (editingSale) {
      await updateSale(editingSale.id, data)

      setSales((prev) =>
        prev.map((s) => (s.id === editingSale.id ? { ...s, ...data } : s))
      );
    } else {
      await createSale({
        ...data,
        userId: user!.uid,
        createdAt: new Date(),
      });

      loadData(user!.uid);
    }

    setEditingSale(null);
    setOpen(false)
  }

  async function handleDeleteSale(id: string) {
    const confirmDelete = confirm('Deseja realmente excluir esta venda?');
    if (!confirmDelete) return;

    deleteSale(id)
      .then(() => {
        setSales((prev) => prev.filter((sale) => sale.id !== id))
      })
      .catch((error) => {
        console.error(error)
        alert('Erro ao excluir a venda')
      })
  }

  return (
    <>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Vendas</h1>

        <button className="btn-primary" onClick={() => setOpen(true)}>
          Nova Venda
        </button>
      </div>

      {/* LISTA */}
      {loading ? (
        <p className="text-sm text-gray-500">Carregando vendas...</p>
      ) : (
        <SaleList sales={sales} onDelete={handleDeleteSale} onEdit={(sale) => {
          setEditingSale(sale);
          setOpen(true)
        }} />
      )}

      {/* MODAL */}
      <Modal
        open={open}
        title={editingSale ? 'Editar Venda' : 'Nova Venda'}
        onClose={() => {
          setOpen(false)
          setEditingSale(null)
        }}>

        <SaleForm clients={clients} products={products} prices={prices} initialData={editingSale} onSubmit={handleSaveSale} />


      </Modal>
    </>
  );
}
