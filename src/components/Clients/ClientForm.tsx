'use client';

import { useEffect, useState } from 'react';
import { Client } from '@/src/types/Client';

interface Props {
  onSubmit: (data: { name: string; fantasy: string; address: string; phone: string }) => void;
  onCancel: () => void;
  initialData?: Client | null;
}

const inputClass =
  'w-full rounded-input border border-border-input bg-surface-subtle-2 px-3 py-2.5 text-[13px] text-ink placeholder:text-placeholder focus:outline-none focus:border-accent';
const labelClass = 'mb-1.5 block text-[12px] font-semibold text-ink-2';

export function ClientForm({ onSubmit, onCancel, initialData }: Props) {
  const [name, setName] = useState('');
  const [fantasy, setFantasy] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setFantasy(initialData.fantasy);
      setAddress(initialData.address);
      setPhone(initialData.phone);
    } else {
      setName('');
      setFantasy('');
      setAddress('');
      setPhone('');
    }
  }, [initialData]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert('Informe o nome do cliente.');
      return;
    }

    onSubmit({
      name: name.toUpperCase(),
      fantasy: fantasy.toUpperCase(),
      address: address.toUpperCase(),
      phone,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Nome</label>
          <input
            type="text"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Fantasia</label>
          <input
            type="text"
            className={inputClass}
            value={fantasy}
            onChange={(e) => setFantasy(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Endereço</label>
          <input
            type="text"
            className={inputClass}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Telefone</label>
          <input
            type="text"
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      <div className="-mx-6 -mb-5 mt-6 flex justify-end gap-2 rounded-b-modal border-t border-border-divider-2 bg-surface-subtle-2 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-input border border-[#dcd8d0] bg-white px-4 py-2 text-[13px] font-semibold text-ink transition hover:border-ink-4"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-input bg-accent px-5 py-2 text-[13px] font-semibold text-white shadow-btn transition hover:opacity-90"
        >
          {initialData ? 'Salvar alterações' : 'Cadastrar cliente'}
        </button>
      </div>
    </form>
  );
}
