import { Pencil, Trash2 } from 'lucide-react';
import { Client } from '@/src/types/Client';

interface Props {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

export function ClientList({ clients, onEdit, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3  gap-4">
      {clients.map((client) => (
        <div key={client.id} className="bg-white border rounded-xl p-4">
          <h3 className="font-medium">{client.name}</h3>
          <p className="text-sm text-gray-500">{client.fantasy}</p>

          <p className="text-xs text-gray-400 mt-1">{client.address}</p>

          <p className="text-xs text-gray-400">✆ {client.phone}</p>
          <div className="flex items-center gap-3 mt-3">
            <button
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => onEdit(client)}
              title="Editar"
            >
              <Pencil size={16} />
            </button>

            <button
              className="text-red-600 hover:text-red-800"
              onClick={() => onDelete(client.id)}
              title="Excluir"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
