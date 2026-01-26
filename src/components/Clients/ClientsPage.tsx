'use client';

import { useEffect, useState } from 'react';
import { Client } from '@/src/types/Client';
import { getClientsByUser } from '@/src/services/clientService';
import { ClientList } from './ClientList';

import { useAuth } from '@/src/contexts/AuthContext';

export default function ClientsPage() {
  const { user, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;

    async function fetchClients() {
      if (!user) return;
      const data = await getClientsByUser(user.uid);
      if (!cancelled) {
        setClients(data);
      }
    }

    void fetchClients();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  function handleEdit(client: Client) {
    console.log('Editar cliente: ', client);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Clientes</h1>

      <ClientList clients={clients} onEdit={handleEdit} />
    </div>
  );
}
