'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { ClientForm } from '@/src/components/Clients/ClientForm';
import { ClientList } from '@/src/components/Clients/ClientList';
import { getClientsByUser, createClient, updateClient } from '@/src/services/clientService';
import { Client } from '@/src/types/Client';

const USER_ID = 'wSkNQJ8eyFh6FL4E1Z51vfopnQc2';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const searchParams = useSearchParams();
  const openNew = searchParams.get('novo');

  async function loadClients() {
    setLoading(true);
    const data = await getClientsByUser(USER_ID);
    setClients(data);
    setLoading(false);
  }

  async function handleAddOrEditClient(data: {
    name: string;
    fantasy: string;
    address: string;
    phone: string;
  }) {
    if (editingClient) {
      // Editar
      await updateClient(editingClient.id, data);

      setClients((prev) => prev.map((c) => (c.id === editingClient.id ? { ...c, ...data } : c)));
    } else {
      //  Criar
      const newClient = {
        ...data,
        userId: USER_ID,
        createdAt: new Date(),
      };

      await createClient(newClient);

      setClients((prev) => [...prev, { ...newClient, id: crypto.randomUUID() }]);
    }

    setEditingClient(null);
    setOpen(false);
  }

  useEffect(() => {
    loadClients();

    if (openNew === 'true') {
      setEditingClient(null);
      setOpen(true);
    }
  }, []);

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
