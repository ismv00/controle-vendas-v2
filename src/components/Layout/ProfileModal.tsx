'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  linkGoogleToCurrentUser,
  unlinkPasswordFromCurrentUser,
  getCurrentUserProviders,
} from '@/src/services/authService';
import { updateUserProfile } from '@/src/services/userProfileService';
import { Modal } from '@/src/components/ui/Modal';
import { Avatar } from '@/src/components/ui/Avatar';

type Props = {
  open: boolean;
  onClose: () => void;
};

const inputClass =
  'w-full rounded-input border border-border-input bg-surface-subtle-2 px-3 py-2.5 text-[13px] text-ink placeholder:text-placeholder focus:outline-none focus:border-accent';
const labelClass = 'mb-1.5 block text-[12px] font-semibold text-ink-2';

export function ProfileModal({ open, onClose }: Props) {
  const { user, companyName } = useAuth();

  const [companyInput, setCompanyInput] = useState('');
  const [savingCompany, setSavingCompany] = useState(false);
  const [savedJustNow, setSavedJustNow] = useState(false);
  const [companyError, setCompanyError] = useState('');

  const [providers, setProviders] = useState<string[]>([]);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState('');

  useEffect(() => {
    if (open) {
      setCompanyInput(companyName);
      setProviders(user?.providerData.map((p) => p.providerId) ?? []);
      setLinkError('');
      setCompanyError('');
      setSavedJustNow(false);
    }
  }, [open, companyName, user]);

  async function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSavingCompany(true);
    setCompanyError('');

    try {
      await updateUserProfile(user.uid, { companyName: companyInput.trim() });
      setSavedJustNow(true);
    } catch (err) {
      console.error(err);
      setCompanyError('Não foi possível salvar. Tente novamente.');
    } finally {
      setSavingCompany(false);
    }
  }

  async function handleLinkGoogle() {
    setLinkLoading(true);
    setLinkError('');

    try {
      await linkGoogleToCurrentUser();
      setProviders(getCurrentUserProviders());
    } catch {
      setLinkError('Não foi possível vincular o Google.');
    } finally {
      setLinkLoading(false);
    }
  }

  async function handleUnlinkPassword() {
    const confirmed = window.confirm(
      'A partir de agora só será possível entrar com o Google. Continuar?'
    );
    if (!confirmed) return;

    setLinkLoading(true);
    setLinkError('');

    try {
      await unlinkPasswordFromCurrentUser();
      setProviders(getCurrentUserProviders());
    } catch {
      setLinkError('Não foi possível remover o login por senha.');
    } finally {
      setLinkLoading(false);
    }
  }

  if (!user) return null;

  const displayName = user.displayName || user.email?.split('@')[0] || 'Usuário';
  const hasGoogle = providers.includes('google.com');
  const hasPassword = providers.includes('password');

  return (
    <Modal open={open} title="Perfil" subtitle="Dados da sua conta" maxWidth={480} onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Avatar name={displayName} src={user.photoURL} size={52} />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-ink">{displayName}</p>
            <p className="truncate text-[12.5px] text-ink-3">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveCompany}>
          <label className={labelClass}>Nome da empresa</label>
          <div className="flex gap-2">
            <input
              type="text"
              className={inputClass}
              placeholder="Ex.: Papelaria Central"
              value={companyInput}
              onChange={(e) => {
                setCompanyInput(e.target.value);
                setSavedJustNow(false);
              }}
            />
            <button
              type="submit"
              disabled={savingCompany}
              className="shrink-0 rounded-input bg-accent px-4 text-[13px] font-semibold text-white shadow-btn transition hover:opacity-90 disabled:opacity-60"
            >
              {savingCompany ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
          {companyError && <p className="mt-1.5 text-[11.5px] text-negative">{companyError}</p>}
          {savedJustNow && <p className="mt-1.5 text-[11.5px] text-positive">Salvo.</p>}
          <p className="mt-1.5 text-[11.5px] text-ink-4">Aparece no menu lateral e no dashboard.</p>
        </form>

        <div className="border-t border-border-divider-2 pt-4">
          <label className={labelClass}>Login</label>

          {linkError && <p className="mb-2 text-[11.5px] text-negative">{linkError}</p>}

          <div className="flex flex-wrap gap-2">
            <span className="rounded-pill bg-[#eef1ef] px-2.5 py-1 text-[11.5px] font-medium text-ink-2">
              {hasPassword ? 'Senha vinculada' : 'Senha não vinculada'}
            </span>
            <span className="rounded-pill bg-[#eef1ef] px-2.5 py-1 text-[11.5px] font-medium text-ink-2">
              {hasGoogle ? 'Google vinculado' : 'Google não vinculado'}
            </span>
          </div>

          <div className="mt-2.5">
            {!hasGoogle && (
              <button
                type="button"
                onClick={handleLinkGoogle}
                disabled={linkLoading}
                className="text-[12.5px] font-semibold text-accent transition hover:underline disabled:opacity-60"
              >
                {linkLoading ? 'Vinculando...' : 'Vincular login com Google'}
              </button>
            )}

            {hasGoogle && hasPassword && (
              <button
                type="button"
                onClick={handleUnlinkPassword}
                disabled={linkLoading}
                className="text-[12.5px] font-semibold text-accent transition hover:underline disabled:opacity-60"
              >
                {linkLoading ? 'Removendo...' : 'Usar apenas login com Google'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
