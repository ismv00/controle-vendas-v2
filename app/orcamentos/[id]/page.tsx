'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { ArrowLeft, Printer, Copy, Check, MessageCircle, Share2 } from 'lucide-react';

import { useAuth } from '@/src/contexts/AuthContext';
import { getBudgetById } from '@/src/services/budgetService';
import { Budget } from '@/src/types/Budget';
import { formatBRL, formatClientDisplay } from '@/src/lib/format';
import { buildPixPayload } from '@/src/lib/pix';
import { buildWhatsAppLink } from '@/src/lib/whatsapp';
import { generatePdfFile, sharePdfFile } from '@/src/lib/pdf';

function formatControlNumber(n: number) {
  return `#${String(n).padStart(4, '0')}`;
}

export default function BudgetPrintPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, companyName, logoUrl, pixKey } = useAuth();

  const [budget, setBudget] = useState<Budget | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [pixQrCode, setPixQrCode] = useState('');
  const [pixCopied, setPixCopied] = useState(false);
  const [sharingPdf, setSharingPdf] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      const data = await getBudgetById(params.id);

      if (cancelled) return;

      if (!data || data.userId !== user!.uid) {
        setNotFound(true);
        return;
      }

      setBudget(data);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [params.id, user]);

  const pixPayload =
    budget && pixKey
      ? buildPixPayload({
          key: pixKey,
          merchantName: companyName || user?.displayName || user?.email?.split('@')[0] || 'Usuário',
          amount: budget.totalValue,
          txid: `ORC${budget.controlNumber}`,
        })
      : '';

  useEffect(() => {
    if (!pixPayload) return;

    let cancelled = false;

    async function generateQr() {
      try {
        const url = await QRCode.toDataURL(pixPayload, { margin: 1, width: 220 });
        if (!cancelled) setPixQrCode(url);
      } catch {
        if (!cancelled) setPixQrCode('');
      }
    }

    void generateQr();

    return () => {
      cancelled = true;
      setPixQrCode('');
    };
  }, [pixPayload]);

  async function handleCopyPix() {
    if (!pixPayload) return;

    try {
      await navigator.clipboard.writeText(pixPayload);
      setPixCopied(true);
      window.setTimeout(() => setPixCopied(false), 2000);
    } catch {
      // segue sem feedback se o navegador bloquear o acesso à área de transferência
    }
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-appbg text-center">
        <p className="text-[13px] text-mute">Orçamento não encontrado.</p>
        <button
          onClick={() => router.push('/orcamentos')}
          className="text-[13px] font-semibold text-accent hover:underline"
        >
          Voltar para orçamentos
        </button>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-appbg">
        <p className="text-[13px] text-mute">Carregando orçamento...</p>
      </div>
    );
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const headerName = companyName || displayName;

  function handleSendWhatsApp() {
    const message = `Olá, ${budget!.clientName}! Segue o orçamento ${formatControlNumber(
      budget!.controlNumber
    )} da ${headerName}, no valor de ${formatBRL(budget!.totalValue)}. Qualquer dúvida é só chamar!`;

    const link = buildWhatsAppLink(budget!.clientPhone, message);

    if (!link) {
      alert('Esse cliente não tem telefone cadastrado.');
      return;
    }

    window.open(link, '_blank');
  }

  async function handleSharePdf() {
    if (!cardRef.current) return;

    setSharingPdf(true);

    try {
      const file = await generatePdfFile(
        cardRef.current,
        `orcamento-${formatControlNumber(budget!.controlNumber)}.pdf`
      );

      await sharePdfFile(
        file,
        `Orçamento ${formatControlNumber(budget!.controlNumber)}`,
        `Orçamento da ${headerName}`
      );
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error(err);
        alert('Não foi possível gerar o PDF. Tente novamente.');
      }
    } finally {
      setSharingPdf(false);
    }
  }

  return (
    <div className="min-h-screen bg-appbg py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-5 flex w-full max-w-[720px] items-center justify-between px-4 print:hidden">
        <button
          onClick={() => router.push('/orcamentos')}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-3 transition hover:text-ink"
        >
          <ArrowLeft size={15} />
          Voltar
        </button>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={handleSendWhatsApp}
            className="flex items-center gap-1.5 rounded-input border border-[#dcd8d0] bg-white px-4 py-[9px] text-[13px] font-semibold text-ink transition hover:border-ink-4"
          >
            <MessageCircle size={15} />
            Enviar por WhatsApp
          </button>

          <button
            onClick={handleSharePdf}
            disabled={sharingPdf}
            className="flex items-center gap-1.5 rounded-input border border-[#dcd8d0] bg-white px-4 py-[9px] text-[13px] font-semibold text-ink transition hover:border-ink-4 disabled:opacity-60"
          >
            <Share2 size={15} />
            {sharingPdf ? 'Gerando PDF...' : 'Compartilhar PDF'}
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-input bg-accent px-4 py-[9px] text-[13px] font-semibold text-white shadow-btn transition hover:opacity-90"
          >
            <Printer size={15} />
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      <div
        ref={cardRef}
        className="mx-auto w-full max-w-[720px] rounded-card border border-border-divider-2 bg-white p-8 text-ink print:max-w-none print:rounded-none print:border-0 print:p-0"
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between border-b border-border-divider-2 pb-5">
          <div className="flex items-center gap-3">
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                className="h-12 w-12 shrink-0 rounded-full border border-border-divider-2 object-contain p-1"
              />
            )}
            <div>
              <p className="text-[20px] font-bold tracking-[-.01em] text-ink">{headerName}</p>
              <p className="mt-1 text-[12px] text-ink-3">Orçamento</p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-mono text-[16px] font-semibold text-ink">
              {formatControlNumber(budget.controlNumber)}
            </p>
            <p className="mt-1 font-mono text-[12px] text-ink-3">
              {budget.createdAt.toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Cliente */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[.06em] text-ink-4">Cliente</p>
            <p className="mt-1 text-[13.5px] font-semibold text-ink">
              {formatClientDisplay(budget.clientName, budget.clientFantasy)}
            </p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[.06em] text-ink-4">
              Telefone
            </p>
            <p className="mt-1 font-mono text-[13.5px] text-ink">{budget.clientPhone || '-'}</p>
          </div>
        </div>

        {/* Itens */}
        <table className="mt-6 w-full text-[13px]">
          <thead>
            <tr className="border-b border-border-divider-2 text-left text-[10.5px] font-semibold uppercase tracking-[.06em] text-ink-4">
              <th className="pb-2">Produto</th>
              <th className="pb-2 text-right">Qtd</th>
              <th className="pb-2 text-right">Preço unit.</th>
              <th className="pb-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {budget.items.map((item) => (
              <tr key={item.productId} className="border-b border-border-row">
                <td className="py-2.5 text-ink">
                  <div className="flex items-center gap-2.5">
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-8 w-8 shrink-0 rounded border border-border-divider-2 object-cover"
                      />
                    )}
                    <span>{item.productName}</span>
                  </div>
                </td>
                <td className="py-2.5 text-right font-mono text-ink-2">{item.quantity}</td>
                <td className="py-2.5 text-right font-mono text-ink-2">{formatBRL(item.unitPrice)}</td>
                <td className="py-2.5 text-right font-mono font-semibold text-ink">
                  {formatBRL(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="mt-4 flex justify-end">
          <div className="flex items-baseline gap-3 rounded-block bg-surface-subtle-2 px-4 py-3">
            <span className="text-[12.5px] font-semibold uppercase tracking-[.04em] text-ink-3">
              Total
            </span>
            <span className="font-mono text-[20px] font-bold text-ink">
              {formatBRL(budget.totalValue)}
            </span>
          </div>
        </div>

        {/* Pix */}
        {pixKey && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-block border border-border-divider-2 bg-surface-subtle-2 p-5 print:break-inside-avoid">
            <p className="text-[12.5px] font-semibold uppercase tracking-[.04em] text-ink-3">
              Pagar via Pix
            </p>

            {pixQrCode ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pixQrCode} alt="QR Code Pix" className="h-[180px] w-[180px]" />
            ) : (
              <div className="flex h-[180px] w-[180px] items-center justify-center rounded-block bg-white text-[11px] text-mute">
                Gerando QR Code...
              </div>
            )}

            <button
              type="button"
              onClick={handleCopyPix}
              className="flex items-center gap-1.5 rounded-input border border-[#dcd8d0] bg-white px-4 py-2 text-[12.5px] font-semibold text-ink transition hover:border-ink-4 print:hidden"
            >
              {pixCopied ? <Check size={14} /> : <Copy size={14} />}
              {pixCopied ? 'Copiado!' : 'Copiar Pix copia e cola'}
            </button>

            <p className="text-center text-[11px] text-ink-4">
              Escaneie o QR Code ou copie o código para pagar {formatBRL(budget.totalValue)} via
              Pix.
            </p>
          </div>
        )}

        {/* Observações */}
        <div className="mt-8 rounded-block border border-[#f0dcd9] bg-[#fbecea] p-4 text-[12.5px] leading-relaxed text-ink">
          <p className="mb-2 font-bold">⚠️Informações importantes ⚠️</p>
          <p>🟠 Para confirmar seu pedido pedimos um sinal de 50%! do valor,</p>
          <p>🟠 Após a confirmação do pedido, o prazo de produção são de 7 dias úteis,</p>
          <p>🟠 Artes só serão feitas após confirmação do pedido,</p>
          <p>🟠 Entrega tem taxa fixa de $12,00</p>
          <p className="mt-3 font-semibold">Obrigada por nos escolher! ✨</p>
        </div>
      </div>
    </div>
  );
}
