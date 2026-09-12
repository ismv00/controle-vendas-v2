'use client';

import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Download } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  linkGoogleToCurrentUser,
  unlinkPasswordFromCurrentUser,
  getCurrentUserProviders,
} from '@/src/services/authService';
import {
  updateUserProfile,
  uploadCompanyLogo,
  removeCompanyLogo,
} from '@/src/services/userProfileService';
import { exportAllData } from '@/src/services/exportService';
import { Avatar } from '@/src/components/ui/Avatar';
import { DeleteAccountModal } from '@/src/components/Layout/DeleteAccountModal';
import { formatBRL } from '@/src/lib/format';

const inputClass =
  'w-full rounded-input border border-border-input bg-surface-subtle-2 px-3 py-2.5 text-[13px] text-ink placeholder:text-placeholder focus:outline-none focus:border-accent';
const labelClass = 'mb-1.5 block text-[13px] font-semibold text-ink-2';
const cardClass = 'rounded-card border border-border-divider-2 bg-surface p-6';

export default function ProfilePage() {
  const { user, companyName, logoUrl, monthlyGoal } = useAuth();

  const [companyInput, setCompanyInput] = useState('');
  const [savingCompany, setSavingCompany] = useState(false);
  const [savedJustNow, setSavedJustNow] = useState(false);
  const [companyError, setCompanyError] = useState('');

  const [goalInput, setGoalInput] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalSavedJustNow, setGoalSavedJustNow] = useState(false);
  const [goalError, setGoalError] = useState('');

  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [providers, setProviders] = useState<string[]>([]);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    setCompanyInput(companyName);
  }, [companyName]);

  useEffect(() => {
    setGoalInput(monthlyGoal > 0 ? String(monthlyGoal) : '');
  }, [monthlyGoal]);

  useEffect(() => {
    setProviders(user?.providerData.map((p) => p.providerId) ?? []);
  }, [user]);

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

  async function handleSaveGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const value = Number(goalInput);

    if (!goalInput.trim() || Number.isNaN(value) || value < 0) {
      setGoalError('Informe um valor válido.');
      return;
    }

    setSavingGoal(true);
    setGoalError('');

    try {
      await updateUserProfile(user.uid, { monthlyGoal: value });
      setGoalSavedJustNow(true);
    } catch (err) {
      console.error(err);
      setGoalError('Não foi possível salvar. Tente novamente.');
    } finally {
      setSavingGoal(false);
    }
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;

    setLogoUploading(true);
    setLogoError('');

    try {
      await uploadCompanyLogo(user.uid, file);
    } catch (err) {
      console.error(err);
      setLogoError(err instanceof Error ? err.message : 'Não foi possível enviar a imagem.');
    } finally {
      setLogoUploading(false);
    }
  }

  async function handleRemoveLogo() {
    if (!user || !logoUrl) return;

    setLogoUploading(true);
    setLogoError('');

    try {
      await removeCompanyLogo(user.uid, logoUrl);
    } catch (err) {
      console.error(err);
      setLogoError('Não foi possível remover a logo.');
    } finally {
      setLogoUploading(false);
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

  async function handleExport() {
    if (!user) return;

    setExporting(true);
    setExportError('');

    try {
      await exportAllData(user.uid);
    } catch (err) {
      console.error(err);
      setExportError('Não foi possível gerar o arquivo. Tente novamente.');
    } finally {
      setExporting(false);
    }
  }

  if (!user) return null;

  const displayName = user.displayName || user.email?.split('@')[0] || 'Usuário';
  const hasGoogle = providers.includes('google.com');
  const hasPassword = providers.includes('password');

  return (
    <div className="animate-vf-in mx-auto max-w-[720px] space-y-5">
      <div>
        <h1 className="text-[25px] font-bold tracking-[-.025em] text-ink">Perfil</h1>
        <p className="mt-1 text-[13.5px] text-ink-3">Dados da sua conta e da empresa.</p>
      </div>

      {/* Identidade */}
      <div className={cardClass}>
        <div className="flex items-center gap-4">
          <Avatar name={displayName} src={user.photoURL} size={72} />
          <div className="min-w-0">
            <p className="truncate text-[17px] font-semibold text-ink">{displayName}</p>
            <p className="truncate text-[13.5px] text-ink-3">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className={cardClass}>
        <label className={labelClass}>Logo da empresa</label>

        <div className="flex items-center gap-5">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-input bg-surface-subtle-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo da empresa" className="h-full w-full object-contain" />
            ) : (
              <ImageIcon size={28} className="text-ink-4" />
            )}
          </div>

          <div className="flex flex-col items-start gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={logoUploading}
              className="rounded-input border border-[#dcd8d0] bg-white px-4 py-2 text-[13px] font-semibold text-ink transition hover:border-ink-4 disabled:opacity-60"
            >
              {logoUploading ? 'Enviando...' : logoUrl ? 'Trocar logo' : 'Enviar logo'}
            </button>

            {logoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                disabled={logoUploading}
                className="text-[12px] font-medium text-ink-4 transition hover:text-negative disabled:opacity-60"
              >
                Remover logo
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="hidden"
          />
        </div>

        {logoError && <p className="mt-3 text-[12px] text-negative">{logoError}</p>}
        <p className="mt-3 text-[12px] text-ink-4">
          Aparece no menu lateral e nos orçamentos impressos. PNG ou JPG, até 2MB.
        </p>
      </div>

      {/* Empresa */}
      <div className={cardClass}>
        <form onSubmit={handleSaveCompany}>
          <label className={labelClass}>Nome da empresa</label>
          <div className="flex max-w-md gap-2">
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
          {companyError && <p className="mt-2 text-[12px] text-negative">{companyError}</p>}
          {savedJustNow && <p className="mt-2 text-[12px] text-positive">Salvo.</p>}
          <p className="mt-2 text-[12px] text-ink-4">Aparece no menu lateral e no dashboard.</p>
        </form>
      </div>

      {/* Meta mensal */}
      <div className={cardClass}>
        <form onSubmit={handleSaveGoal}>
          <label className={labelClass}>Meta mensal de faturamento</label>
          <div className="flex max-w-md gap-2">
            <input
              type="number"
              min={0}
              step="0.01"
              className={inputClass}
              placeholder="Ex.: 18000"
              value={goalInput}
              onChange={(e) => {
                setGoalInput(e.target.value);
                setGoalSavedJustNow(false);
              }}
            />
            <button
              type="submit"
              disabled={savingGoal}
              className="shrink-0 rounded-input bg-accent px-4 text-[13px] font-semibold text-white shadow-btn transition hover:opacity-90 disabled:opacity-60"
            >
              {savingGoal ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
          {goalError && <p className="mt-2 text-[12px] text-negative">{goalError}</p>}
          {goalSavedJustNow && <p className="mt-2 text-[12px] text-positive">Salvo.</p>}
          <p className="mt-2 text-[12px] text-ink-4">
            {monthlyGoal > 0
              ? `Meta atual: ${formatBRL(monthlyGoal)} por mês. Aparece na sidebar e no dashboard.`
              : 'Aparece na sidebar e no dashboard, com o quanto já foi faturado no mês.'}
          </p>
        </form>
      </div>

      {/* Login */}
      <div className={cardClass}>
        <label className={labelClass}>Login</label>

        {linkError && <p className="mb-2 text-[12px] text-negative">{linkError}</p>}

        <div className="flex flex-wrap gap-2">
          <span className="rounded-pill bg-[#eef1ef] px-2.5 py-1 text-[12px] font-medium text-ink-2">
            {hasPassword ? 'Senha vinculada' : 'Senha não vinculada'}
          </span>
          <span className="rounded-pill bg-[#eef1ef] px-2.5 py-1 text-[12px] font-medium text-ink-2">
            {hasGoogle ? 'Google vinculado' : 'Google não vinculado'}
          </span>
        </div>

        <div className="mt-3">
          {!hasGoogle && (
            <button
              type="button"
              onClick={handleLinkGoogle}
              disabled={linkLoading}
              className="text-[13px] font-semibold text-accent transition hover:underline disabled:opacity-60"
            >
              {linkLoading ? 'Vinculando...' : 'Vincular login com Google'}
            </button>
          )}

          {hasGoogle && hasPassword && (
            <button
              type="button"
              onClick={handleUnlinkPassword}
              disabled={linkLoading}
              className="text-[13px] font-semibold text-accent transition hover:underline disabled:opacity-60"
            >
              {linkLoading ? 'Removendo...' : 'Usar apenas login com Google'}
            </button>
          )}
        </div>
      </div>

      {/* Exportar dados */}
      <div className={cardClass}>
        <label className={labelClass}>Exportar meus dados</label>
        <p className="text-[12.5px] text-ink-3">
          Baixa um .zip com clientes, produtos, tabela de preços, vendas e orçamentos em planilhas
          (.csv), pra guardar uma cópia ou usar em outro lugar.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="mt-3 flex items-center gap-1.5 rounded-input border border-[#dcd8d0] bg-white px-4 py-2 text-[13px] font-semibold text-ink transition hover:border-ink-4 disabled:opacity-60"
        >
          <Download size={14} />
          {exporting ? 'Gerando arquivo...' : 'Baixar meus dados (.zip)'}
        </button>
        {exportError && <p className="mt-2 text-[12px] text-negative">{exportError}</p>}
      </div>

      {/* Zona de perigo */}
      <div className="rounded-card border border-negative-border bg-surface p-6">
        <label className="mb-1.5 block text-[13px] font-semibold text-negative">
          Excluir conta
        </label>
        <p className="text-[12.5px] text-ink-3">
          Apaga permanentemente sua conta e todos os dados cadastrados. Não é possível desfazer.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="mt-3 mr-2 rounded-input border border-[#dcd8d0] bg-white px-4 py-2 text-[13px] font-semibold text-ink transition hover:border-ink-4 disabled:opacity-60"
        >
          {exporting ? 'Gerando...' : 'Baixar meus dados antes'}
        </button>
        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="mt-3 rounded-input border border-negative-border bg-white px-4 py-2 text-[13px] font-semibold text-negative transition hover:bg-negative-bg"
        >
          Excluir minha conta
        </button>
      </div>

      <DeleteAccountModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </div>
  );
}
