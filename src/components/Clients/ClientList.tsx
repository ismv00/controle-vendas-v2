'use client';

import { useMemo, useState } from 'react';
import { Client } from '@/src/types/Client';
import { Pencil, Trash2 } from 'lucide-react';
import { Avatar } from '@/src/components/ui/Avatar';
import { formatPhone } from '@/src/lib/format';

interface Props {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function ClientList({ clients, onEdit, onDelete }: Props) {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return clients;

    return clients.filter((c) =>
      [c.name, c.fantasy, c.address, c.phone].some((field) => field?.toLowerCase().includes(term))
    );
  }, [clients, filter]);

  return (
    <div className="overflow-hidden rounded-card border border-border-divider-2 bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border-divider-2 px-4 py-3">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrar clientes"
          className="w-full max-w-[280px] rounded-block bg-fill-chip px-3 py-2 text-[12.5px] text-ink placeholder:text-placeholder focus:outline-none"
        />
        <span className="shrink-0 text-[12px] text-ink-3">Ordenado por nome</span>
      </div>

      {filtered.length === 0 ? (
        <p className="px-4 py-8 text-center text-[13px] text-mute">
          {clients.length === 0 ? 'Nenhum cliente cadastrado.' : 'Nenhum cliente encontrado.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[.06em] text-ink-4">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Fantasia</th>
                <th className="px-4 py-3">Endereço</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((client) => (
                <tr
                  key={client.id}
                  className="border-t border-border-row transition hover:bg-surface-subtle-2"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={client.name} size={30} />
                      <span className="font-semibold text-ink">{client.name}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-ink-2">{client.fantasy || '-'}</td>

                  <td className="px-4 py-3">
                    {client.address ? (
                      <span className="text-ink-2">{client.address}</span>
                    ) : (
                      <span className="text-mute-2">Não informado</span>
                    )}
                  </td>

                  <td className="px-4 py-3 font-mono text-ink-2">
                    {client.phone ? formatPhone(client.phone) : '-'}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(client)}
                        title="Editar cliente"
                        className="flex h-7 w-7 items-center justify-center rounded-iconbtn border border-[#e6e3dc] text-ink-3 transition hover:border-[#dcd8d0]"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        onClick={() => onDelete(client)}
                        title="Excluir cliente"
                        className="flex h-7 w-7 items-center justify-center rounded-iconbtn border border-negative-border text-negative transition hover:bg-negative-bg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
