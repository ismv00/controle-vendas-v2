'use client';

export const dynamic = 'force-dynamic';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { ClientForm } from '@/src/components/Clients/ClientForm';
import { ClientList } from '@/src/components/Clients/ClientList';
import {
  getClientsByUser,
  createClient,
  updateClient,
  deleteClient,
} from '@/src/services/clientService';
import { Client } from '@/src/types/Client';
import { useAuth } from '@/src/contexts/AuthContext';

export default function ClientsPage() {
  const { user, loading: authLoading } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);

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

      setClients((prev) => prev.map((c) => (c.id === editingClient.id ? { ...c, ...data } : c)));
    } else {
      const newClient = {
        ...data,
        userId: user.uid,
        createdAt: new Date(),
      };

      await createClient(newClient);

      setClients((prev) => [...prev, { ...newClient, id: crypto.randomUUID() }]);
    }

    setEditingClient(null);
    setOpen(false);
  }

  async function handleDelete(client: Client) {
    const confirmDelete = window.confirm(`Deseja realmente excluir o cliente "${client.name}" ?`);

    if (!confirmDelete) return;

    await deleteClient(client.id);

    setClients((prev) => prev.filter((c) => c.id !== client.id));
  }

  useEffect(() => {
    if (authLoading || !user) return;

    let active = true;

    async function fetchClients() {
      setLoading(true);

      const data = await getClientsByUser(user!.uid);

      if (active) {
        setClients(data);
        setLoading(false);
      }
    }

    fetchClients();

    return () => {
      active = false;
    };
  }, [user, authLoading, openNew]);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Clientes</h1>

        <button
          className="btn-primary"
          onClick={() => {
            setEditingClient(null);
            setOpen(true);
          }}
        >
          Novo Cliente
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-sm text-gray-500">Carregando clientes...</p>
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

      {/* Modal */}
      <Modal
        open={open}
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
        onClose={() => {
          setOpen(false);
          setEditingClient(null);
        }}
      >
        <ClientForm onSubmit={handleAddOrEditClient} initialData={editingClient} />
      </Modal>
    </>
  );
}
