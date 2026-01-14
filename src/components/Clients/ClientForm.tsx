'use client';

import { useEffect, useState } from 'react';
import { Client } from '@/src/types/Client';

interface Props {
  onSubmit: (data: { name: string; fantasy: string; address: string; phone: string }) => void;
  initialData?: Client | null;
}

export function ClientForm({ onSubmit, initialData }: Props) {
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

    if (!name || !fantasy || !address || !phone) {
      alert('Preencha todos os campos.');
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nome</label>
        <input
          type="text"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fantasia</label>
        <input
          type="text"
          className="input"
          value={fantasy}
          onChange={(e) => setFantasy(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Endereço</label>
        <input
          type="text"
          className="input"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Telefone</label>
        <input
          type="text"
          className="input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" className="btn-primary">
          {initialData ? 'Salvar alterações' : 'Cadastrar Cliente'}{' '}
        </button>
      </div>
    </form>
  );
}
