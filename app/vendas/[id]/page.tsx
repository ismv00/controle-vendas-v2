'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer } from 'lucide-react';

import { useAuth } from '@/src/contexts/AuthContext';
import { getSaleById } from '@/src/services/saleService';
import { Sale, PAYMENT_METHOD_LABELS } from '@/src/types/Sale';
import { formatBRL } from '@/src/lib/format';

function formatReceiptNumber(n?: number) {
  return n ? `#${String(n).padStart(4, '0')}` : null;
}

export default function SaleReceiptPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, companyName, logoUrl } = useAuth();

  const [sale, setSale] = useState<Sale | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      const data = await getSaleById(params.id);

      if (cancelled) return;

      if (!data || data.userId !== user!.uid) {
        setNotFound(true);
        return;
      }

      setSale(data);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [params.id, user]);

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-appbg text-center">
        <p className="text-[13px] text-mute">Venda não encontrada.</p>
        <button
          onClick={() => router.push('/vendas')}
          className="text-[13px] font-semibold text-accent hover:underline"
        >
          Voltar para vendas
        </button>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-appbg">
        <p className="text-[13px] text-mute">Carregando venda...</p>
      </div>
    );
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const headerName = companyName || displayName;
  const receiptNumber = formatReceiptNumber(sale.receiptNumber);
  const isPaid = (sale.status ?? 'paid') === 'paid';

  return (
    <div className="min-h-screen bg-appbg py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-5 flex w-full max-w-[720px] items-center justify-between px-4 print:hidden">
        <button
          onClick={() => router.push('/vendas')}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-3 transition hover:text-ink"
        >
          <ArrowLeft size={15} />
          Voltar
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-input bg-accent px-4 py-[9px] text-[13px] font-semibold text-white shadow-btn transition hover:opacity-90"
        >
          <Printer size={15} />
          Imprimir / Salvar PDF
        </button>
      </div>

      <div className="mx-auto w-full max-w-[720px] rounded-card border border-border-divider-2 bg-white p-8 text-ink print:max-w-none print:rounded-none print:border-0 print:p-0">
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
              <p className="mt-1 text-[12px] text-ink-3">Recibo de venda</p>
            </div>
          </div>

          <div className="text-right">
            {receiptNumber && (
              <p className="font-mono text-[16px] font-semibold text-ink">{receiptNumber}</p>
            )}
            <p className="mt-1 font-mono text-[12px] text-ink-3">
              {sale.createdAt.toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Cliente + pagamento + status */}
        <div className="mt-5 grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[.06em] text-ink-4">Cliente</p>
            <p className="mt-1 text-[13.5px] font-semibold text-ink">{sale.clientName}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[.06em] text-ink-4">
              Pagamento
            </p>
            <p className="mt-1 text-[13.5px] text-ink">
              {sale.paymentMethod ? PAYMENT_METHOD_LABELS[sale.paymentMethod] : '-'}
            </p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[.06em] text-ink-4">Status</p>
            <p
              className={`mt-1 inline-flex rounded-pill px-2.5 py-[3px] text-[11.5px] font-semibold ${
                isPaid ? 'bg-positive-bg text-positive' : 'bg-warn-bg text-warn'
              }`}
            >
              {isPaid ? 'Pago' : 'Pendente'}
            </p>
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
            {sale.items.map((item) => (
              <tr key={item.productId} className="border-b border-border-row">
                <td className="py-2.5 text-ink">{item.productName}</td>
                <td className="py-2.5 text-right font-mono text-ink-2">{item.quantity}</td>
                <td className="py-2.5 text-right font-mono text-ink-2">{formatBRL(item.price)}</td>
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
              {formatBRL(sale.totalValue)}
            </span>
          </div>
        </div>

        <p className="mt-8 text-center text-[12.5px] font-semibold text-ink-3">
          Obrigada pela preferência! ✨
        </p>
      </div>
    </div>
  );
}
