'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { useAuth } from '@/src/contexts/AuthContext';
import { getCurrentUserProviders } from '@/src/services/authService';
import { getFirebaseErrorCode } from '@/src/lib/firebaseError';
import { exportAllData } from '@/src/services/exportService';
import {
  deleteAccount,
  reauthenticateWithPassword,
  reauthenticateWithGoogle,
} from '@/src/services/accountService';

type Props = {
  open: boolean;
  onClose: () => void;
};

const CONFIRM_WORD = 'EXCLUIR';

const inputClass =
  'w-full rounded-input border border-border-input bg-surface-subtle-2 px-3 py-2.5 text-[13px] text-ink placeholder:text-placeholder focus:outline-none focus:border-negative';

export function DeleteAccountModal({ open, onClose }: Props) {
  const router = useRouter();
  const { user } = useAuth();

  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [needsReauth, setNeedsReauth] = useState(false);
  const [password, setPassword] = useState('');
  const [exporting, setExporting] = useState(false);

  const canDelete = confirmText.trim() === CONFIRM_WORD;
  const providers = getCurrentUserProviders();
  const hasPassword = providers.includes('password');
  const hasGoogle = providers.includes('google.com');

  function handleClose() {
    if (deleting) return;
    setConfirmText('');
    setError('');
    setNeedsReauth(false);
    setPassword('');
    onClose();
  }

  async function finishDeletion() {
    await deleteAccount();
    router.replace('/login');
  }

  async function handleExport() {
    if (!user) return;

    setExporting(true);
    setError('');

    try {
      await exportAllData(user.uid);
    } catch (err) {
      console.error(err);
      setError('Não foi possível gerar o arquivo. Tente novamente.');
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (!canDelete) return;

    setDeleting(true);
    setError('');

    try {
      await finishDeletion();
    } catch (err) {
      if (getFirebaseErrorCode(err) === 'auth/requires-recent-login') {
        setNeedsReauth(true);
      } else {
        console.error(err);
        setError('Não foi possível excluir a conta. Tente novamente.');
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleReauthWithPassword(e: React.FormEvent) {
    e.preventDefault();

    setDeleting(true);
    setError('');

    try {
      await reauthenticateWithPassword(password);
      await finishDeletion();
    } catch (err) {
      console.error(err);
      setError('Senha incorreta ou não foi possível confirmar. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  }

  async function handleReauthWithGoogle() {
    setDeleting(true);
    setError('');

    try {
      await reauthenticateWithGoogle();
      await finishDeletion();
    } catch (err) {
      console.error(err);
      setError('Não foi possível confirmar com o Google. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Excluir conta"
      subtitle="Essa ação não pode ser desfeita."
      maxWidth={480}
      onClose={handleClose}
    >
      {!needsReauth ? (
        <div className="space-y-4">
          <div className="rounded-block border border-negative-border bg-negative-bg p-4 text-[12.5px] leading-relaxed text-negative">
            <p>
              Isso vai apagar permanentemente sua conta e todos os dados: clientes, produtos,
              tabela de preços, vendas, orçamentos e a logo da empresa. Não é possível recuperar
              depois.
            </p>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="mt-2.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-negative underline transition hover:opacity-80 disabled:opacity-60"
            >
              <Download size={13} />
              {exporting ? 'Gerando arquivo...' : 'Baixar uma cópia dos meus dados antes'}
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-ink-2">
              Digite <span className="font-mono text-negative">{CONFIRM_WORD}</span> para confirmar
            </label>
            <input
              type="text"
              className={inputClass}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_WORD}
              autoComplete="off"
            />
          </div>

          {error && <p className="text-[12.5px] text-negative">{error}</p>}

          <div className="-mx-6 -mb-5 mt-2 flex justify-end gap-2 rounded-b-modal border-t border-border-divider-2 bg-surface-subtle-2 px-6 py-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={deleting}
              className="rounded-input border border-[#dcd8d0] bg-white px-4 py-2 text-[13px] font-semibold text-ink transition hover:border-ink-4 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!canDelete || deleting}
              className="rounded-input bg-negative px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {deleting ? 'Excluindo...' : 'Excluir minha conta'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-[13px] text-ink-2">
            Por segurança, confirme seu login de novo antes de excluir a conta.
          </p>

          {hasPassword && (
            <form onSubmit={handleReauthWithPassword} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-ink-2">Senha</label>
                <input
                  type="password"
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {error && <p className="text-[12.5px] text-negative">{error}</p>}

              <button
                type="submit"
                disabled={deleting}
                className="w-full rounded-input bg-negative px-5 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? 'Confirmando...' : 'Confirmar e excluir'}
              </button>
            </form>
          )}

          {hasGoogle && (
            <button
              type="button"
              onClick={handleReauthWithGoogle}
              disabled={deleting}
              className="w-full rounded-input border border-[#dcd8d0] bg-white px-5 py-2.5 text-[13px] font-semibold text-ink transition hover:border-ink-4 disabled:opacity-50"
            >
              {deleting ? 'Confirmando...' : 'Confirmar com Google e excluir'}
            </button>
          )}

          {!hasPassword && error && <p className="text-[12.5px] text-negative">{error}</p>}

          <button
            type="button"
            onClick={handleClose}
            disabled={deleting}
            className="w-full text-center text-[12.5px] font-medium text-ink-4 transition hover:text-ink disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      )}
    </Modal>
  );
}
