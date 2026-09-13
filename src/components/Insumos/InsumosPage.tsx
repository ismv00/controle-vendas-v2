'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { InsumoForm, InsumoFormData } from '@/src/components/Insumos/InsumoForm';
import { InsumoList } from '@/src/components/Insumos/InsumoList';
import {
  createInsumo,
  getInsumosByUser,
  updateInsumo,
  deleteInsumo,
} from '@/src/services/insumoService';
import { Insumo } from '@/src/types/Insumo';
import { useAuth } from '@/src/contexts/AuthContext';

export default function InsumosPage() {
  const { user, loading: authLoading } = useAuth();
  const [insumos, setInsumos] = useState<Insumo[]>([]);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);

  async function handleAddOrEditInsumo(data: InsumoFormData) {
    if (!user) return;

    try {
      if (editingInsumo) {
        await updateInsumo(editingInsumo.id, data);
      } else {
        await createInsumo({ ...data, userId: user.uid, createdAt: new Date() });
      }

      const updated = await getInsumosByUser(user.uid);
      setInsumos(updated);
      setOpen(false);
      setEditingInsumo(null);
    } catch (err) {
      console.error(err);
      alert('Não foi possível salvar o insumo. Tente novamente.');
    }
  }

  async function handleDeleteInsumo(id: string) {
    const confirmed = confirm('Tem certeza que deseja excluir este insumo?');

    if (!confirmed) return;

    try {
      await deleteInsumo(id);
      setInsumos((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
      alert('Não foi possível excluir o insumo. Tente novamente.');
    }
  }

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;

    async function fetchInsumos() {
      if (!user) return;
      setLoading(true);
      const data = await getInsumosByUser(user.uid);
      if (!cancelled) {
        setInsumos(data);
        setLoading(false);
      }
    }

    void fetchInsumos();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  return (
    <div className="animate-vf-in space-y-5">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h1 className="text-[25px] font-bold tracking-[-.025em] text-ink">Insumos</h1>
          <p className="mt-1 text-[13.5px] text-ink-3">
            {insumos.length} itens · matéria-prima usada nas fichas técnicas dos produtos
          </p>
        </div>

        <button
          onClick={() => {
            setEditingInsumo(null);
            setOpen(true);
          }}
          className="rounded-input bg-accent px-4 py-[9px] text-[13px] font-semibold text-white shadow-btn transition hover:opacity-90"
        >
          + Novo insumo
        </button>
      </div>

      {loading ? (
        <p className="text-[13px] text-mute">Carregando insumos...</p>
      ) : (
        <InsumoList
          insumos={insumos}
          onEdit={(insumo) => {
            setEditingInsumo(insumo);
            setOpen(true);
          }}
          onDelete={handleDeleteInsumo}
        />
      )}

      <Modal
        open={open}
        title={editingInsumo ? 'Editar insumo' : 'Novo insumo'}
        subtitle="Matéria-prima consumida na produção — controle o estoque aqui."
        maxWidth={520}
        onClose={() => {
          setOpen(false);
          setEditingInsumo(null);
        }}
      >
        <InsumoForm
          key={editingInsumo?.id ?? 'new'}
          onSubmit={handleAddOrEditInsumo}
          onCancel={() => {
            setOpen(false);
            setEditingInsumo(null);
          }}
          initialData={editingInsumo}
        />
      </Modal>
    </div>
  );
}
