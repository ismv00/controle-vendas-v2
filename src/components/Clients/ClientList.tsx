import { Client } from '@/src/types/Client';
import { Trash2, Pencil } from 'lucide-react';

interface Props {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function ClientList({ clients, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {clients.length === 0 ? (
        <p className="p-6 text-sm text-gray-500">
          Nenhum cliente cadastrado.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Fantasia</th>
              <th className="px-4 py-3 text-left">Endereço</th>
              <th className="px-4 py-3 text-left">Telefone</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {client.name}
                </td>

                <td className="px-4 py-3 text-gray-500">
                  {client.fantasy || '-'}
                </td>

                <td className="px-4 py-3 text-gray-500">
                  {client.address || '-'}
                </td>

                <td className="px-4 py-3 text-gray-500">
                  {client.phone || '-'}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => onEdit(client)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Editar cliente"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => onDelete(client)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Excluir cliente"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
