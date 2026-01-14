'use client';

import { useEffect, useState } from 'react';
import { Client } from '@/src/types/Client';
import { getClientsByUser, deleteClient } from '@/src/services/clientService';

import { ClientList } from './ClientList';

const USER_ID = 'wSkNQJ8eyFh6FL4E1Z51vfopnQc2';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);

  async function loadCLients() {
    const data = await getClientsByUser(USER_ID);
    setClients(data);
  }

  useEffect(() => {
    loadCLients();
  }, []);

  function handleEdit(client: Client) {
    console.log('Editar cliente: ', client);
  }

  async function handleDeleteClient(id: string) {
    const confirmDelete = confirm('Tem certeza que deseja excluir este cliente?');

    if (!confirmDelete) return;

    await deleteClient(id);

    setClients((prev) => prev.filter((client) => client.id !== id));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Clientes</h1>

      <ClientList clients={clients} onEdit={handleEdit} onDelete={handleDeleteClient} />
    </div>
  );
}
