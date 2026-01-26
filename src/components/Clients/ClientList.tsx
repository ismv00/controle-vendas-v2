import { Client } from '@/src/types/Client';
import { Trash2 } from 'lucide-react';

interface Props {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
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

          <button
            className="text-sm text-blue-600 hover:underline mt-3"
            onClick={() => onEdit(client)}
          >
            Editar
          </button>

          <button
            className="text-sm text-blue-600 hover:underline mt-3"
            onClick={() => onDelete(client)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
