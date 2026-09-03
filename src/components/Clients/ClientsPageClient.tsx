'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { ClientForm } from '@/src/components/Clients/ClientForm';
import { ClientList } from '@/src/components/Clients/ClientList';
import {
    getClientsByUser,
    createClient,
    updateClient,
    deleteClient,
} from '@/src/services/clientService';
import { getSalesByUser } from '@/src/services/saleService';
import { isInPeriod } from '@/src/lib/period';
import { Client } from '@/src/types/Client';
import { useAuth } from '@/src/contexts/AuthContext';

export default function ClientsPageClient() {
    const { user, loading: authLoading } = useAuth();

    const [clients, setClients] = useState<Client[]>([]);
    const [buyersThisMonth, setBuyersThisMonth] = useState(0);
    const [loading, setLoading] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const searchParams = useSearchParams();
    const openNew = searchParams.get('novo') === 'true';

    const [open, setOpen] = useState(openNew);

    async function handleAddOrEditClient(data: {
        name: string;
        fantasy: string;
        address: string;
        phone: string;
    }) {
        if (!user) return;

        if (editingClient) {
            await updateClient(editingClient.id, data);

            setClients((prev) =>
                prev.map((c) =>
                    c.id === editingClient.id ? { ...c, ...data } : c
                )
            );
        } else {
            const newClientData = {
                ...data,
                userId: user.uid,
            };

            const id = await createClient(newClientData);

            setClients((prev) => [
                ...prev,
                {
                    id,
                    ...newClientData,
                    createdAt: new Date(),
                },
            ]);
        }

        setEditingClient(null);
        setOpen(false);
    }

    async function handleDelete(client: Client) {
        const confirmDelete = window.confirm(
            `Deseja realmente excluir o cliente "${client.name}" ?`
        );

        if (!confirmDelete) return;

        await deleteClient(client.id);

        setClients((prev) => prev.filter((c) => c.id !== client.id));
    }

    useEffect(() => {
        if (authLoading || !user) return;

        let active = true;

        async function fetchData() {
            setLoading(true);

            const [clientsData, salesData] = await Promise.all([
                getClientsByUser(user!.uid),
                getSalesByUser(user!.uid),
            ]);

            if (active) {
                setClients(clientsData);

                const buyers = new Set(
                    salesData
                        .filter((sale) => isInPeriod(sale.createdAt, 'month'))
                        .map((sale) => sale.clientId)
                );
                setBuyersThisMonth(buyers.size);

                setLoading(false);
            }
        }

        fetchData();

        return () => {
            active = false;
        };
    }, [user, authLoading]);

    const subtitle = useMemo(
        () => `${clients.length} cadastrados · ${buyersThisMonth} compraram este mês`,
        [clients.length, buyersThisMonth]
    );

    return (
        <div className="animate-vf-in space-y-5">
            <div className="mb-1 flex items-center justify-between">
                <div>
                    <h1 className="text-[25px] font-bold tracking-[-.025em] text-ink">Clientes</h1>
                    <p className="mt-1 text-[13.5px] text-ink-3">{subtitle}</p>
                </div>

                <button
                    className="rounded-input bg-accent px-4 py-[9px] text-[13px] font-semibold text-white shadow-btn transition hover:opacity-90"
                    onClick={() => {
                        setEditingClient(null);
                        setOpen(true);
                    }}
                >
                    + Novo cliente
                </button>
            </div>

            {loading ? (
                <p className="text-[13px] text-mute">Carregando clientes...</p>
            ) : (
                <ClientList
                    clients={clients}
                    onEdit={(client) => {
                        setEditingClient(client);
                        setOpen(true);
                    }}
                    onDelete={handleDelete}
                />
            )}

            <Modal
                open={open}
                title={editingClient ? 'Editar cliente' : 'Novo cliente'}
                subtitle="Só o nome é obrigatório — o resto pode vir depois."
                maxWidth={520}
                onClose={() => {
                    setOpen(false);
                    setEditingClient(null);
                }}
            >
                <ClientForm
                    onSubmit={handleAddOrEditClient}
                    onCancel={() => {
                        setOpen(false);
                        setEditingClient(null);
                    }}
                    initialData={editingClient}
                />
            </Modal>
        </div>
    );
}
