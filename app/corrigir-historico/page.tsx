'use client';

// Página temporária de uso único — corrige dados distorcidos pelo bug da Tabela de Preços
// (despesa aplicada em dobro ao editar um preço existente). Roda só com o usuário logado,
// cada um só consegue corrigir os próprios dados (regras do Firestore). Remover depois de usar.

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';
import { getProductsByUser } from '@/src/services/productService';
import { getProductPricesByUser, updateProductPrice } from '@/src/services/priceService';
import { getSalesByUser } from '@/src/services/saleService';
import { stripUndefinedDeep } from '@/src/lib/firestoreUtils';
import { formatBRL } from '@/src/lib/format';

type LogLine = { text: string; tone: 'info' | 'fix' | 'skip' };

export default function CorrigirHistoricoPage() {
  const { user } = useAuth();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);
  const [summary, setSummary] = useState<{
    pricesChecked: number;
    pricesFixed: number;
    salesChecked: number;
    salesFixed: number;
    itemsSkipped: number;
  } | null>(null);

  function addLog(text: string, tone: LogLine['tone'] = 'info') {
    setLog((prev) => [...prev, { text, tone }]);
  }

  async function handleRun() {
    if (!user) return;

    setRunning(true);
    setDone(false);
    setLog([]);
    setSummary(null);

    try {
      addLog('Carregando produtos, preços e vendas...');

      const [products, prices, sales] = await Promise.all([
        getProductsByUser(user.uid),
        getProductPricesByUser(user.uid),
        getSalesByUser(user.uid),
      ]);

      const productById = new Map(products.map((p) => [p.id, p]));

      // --- Fase 1: corrige o baseCost de cada preço (fonte de verdade = custo do produto) ---
      let pricesFixed = 0;

      for (const price of prices) {
        const product = productById.get(price.productId);
        if (!product) {
          addLog(`Preço de "${price.productName}" ignorado — produto não existe mais.`, 'skip');
          continue;
        }

        const correctBaseCost = product.cost + product.cost * (price.operationalExpensePercent / 100);
        const diff = Math.abs(correctBaseCost - price.baseCost);

        if (diff > 0.001) {
          const correctSalePrice = Number(
            (correctBaseCost + correctBaseCost * (price.marginPercent / 100)).toFixed(2)
          );

          await updateProductPrice(price.id, {
            baseCost: Number(correctBaseCost.toFixed(2)),
            salePrice: correctSalePrice,
          });

          pricesFixed++;
          addLog(
            `Preço de "${price.productName}" corrigido: custo real ${formatBRL(
              price.baseCost
            )} → ${formatBRL(correctBaseCost)}.`,
            'fix'
          );
        }
      }

      addLog(`Fase 1 concluída: ${pricesFixed} de ${prices.length} preços corrigidos.`);

      // --- Fase 2: corrige o custo/lucro gravado em cada venda já feita ---
      // Recalcula usando o custo e a despesa ATUAIS de cada produto (melhor referência
      // disponível hoje — não há histórico de quanto custo/despesa valiam no passado).
      let salesFixed = 0;
      let itemsSkipped = 0;

      for (const sale of sales) {
        let changed = false;

        const newItems = sale.items.map((item) => {
          const product = productById.get(item.productId);

          if (!product) {
            itemsSkipped++;
            return item;
          }

          const priceRecord = prices.find((p) => p.productId === item.productId);
          const expensePercent = priceRecord?.operationalExpensePercent ?? 0;
          const correctBaseCost = product.cost + product.cost * (expensePercent / 100);

          if (Math.abs(correctBaseCost - item.baseCost) > 0.001) {
            changed = true;
            const newProfit = Number((item.subtotal - correctBaseCost * item.quantity).toFixed(2));
            return { ...item, baseCost: Number(correctBaseCost.toFixed(2)), profit: newProfit };
          }

          return item;
        });

        if (changed) {
          const totalCost = Number(
            newItems.reduce((sum, i) => sum + i.baseCost * i.quantity, 0).toFixed(2)
          );
          const totalProfit = Number((sale.totalValue - totalCost).toFixed(2));

          await updateDoc(
            doc(db, 'sales', sale.id),
            stripUndefinedDeep({ items: newItems, totalCost, totalProfit })
          );

          salesFixed++;
          addLog(
            `Venda ${sale.receiptNumber ? `#${String(sale.receiptNumber).padStart(4, '0')}` : sale.id} corrigida: lucro ${formatBRL(
              sale.totalProfit
            )} → ${formatBRL(totalProfit)}.`,
            'fix'
          );
        }
      }

      addLog(`Fase 2 concluída: ${salesFixed} de ${sales.length} vendas corrigidas.`);
      if (itemsSkipped > 0) {
        addLog(`${itemsSkipped} itens ignorados por produto excluído.`, 'skip');
      }

      setSummary({
        pricesChecked: prices.length,
        pricesFixed,
        salesChecked: sales.length,
        salesFixed,
        itemsSkipped,
      });
      setDone(true);
    } catch (err) {
      console.error(err);
      addLog('Erro durante a correção — veja o console para detalhes.', 'skip');
    } finally {
      setRunning(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-[720px] space-y-5">
      <div>
        <h1 className="text-[22px] font-bold tracking-[-.02em] text-ink">
          Correção de preços e vendas retroativas
        </h1>
        <p className="mt-2 text-[13px] text-ink-3">
          Ferramenta de uso único. Recalcula o custo real (custo + despesa) de cada preço
          cadastrado e, a partir disso, corrige o lucro gravado nas vendas já feitas. Nada é
          apagado — só os campos numéricos de custo e lucro são ajustados. Pode rodar mais de
          uma vez: se já estiver tudo certo, não muda nada.
        </p>
      </div>

      <button
        onClick={handleRun}
        disabled={running}
        className="rounded-input bg-accent px-5 py-2.5 text-[13px] font-semibold text-white shadow-btn transition hover:opacity-90 disabled:opacity-60"
      >
        {running ? 'Corrigindo...' : 'Rodar correção'}
      </button>

      {summary && (
        <div className="grid grid-cols-2 gap-3 rounded-card border border-border-divider-2 bg-surface p-4 text-[13px] sm:grid-cols-4">
          <div>
            <p className="text-ink-4">Preços verificados</p>
            <p className="font-mono text-[16px] font-semibold text-ink">{summary.pricesChecked}</p>
          </div>
          <div>
            <p className="text-ink-4">Preços corrigidos</p>
            <p className="font-mono text-[16px] font-semibold text-ink">{summary.pricesFixed}</p>
          </div>
          <div>
            <p className="text-ink-4">Vendas verificadas</p>
            <p className="font-mono text-[16px] font-semibold text-ink">{summary.salesChecked}</p>
          </div>
          <div>
            <p className="text-ink-4">Vendas corrigidas</p>
            <p className="font-mono text-[16px] font-semibold text-ink">{summary.salesFixed}</p>
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div className="max-h-[420px] space-y-1 overflow-y-auto rounded-card border border-border-divider-2 bg-surface p-4 text-[12px]">
          {log.map((line, i) => (
            <p
              key={i}
              className={
                line.tone === 'fix'
                  ? 'text-positive'
                  : line.tone === 'skip'
                  ? 'text-warn-2'
                  : 'text-ink-3'
              }
            >
              {line.text}
            </p>
          ))}
        </div>
      )}

      {done && (
        <p className="text-[12.5px] font-semibold text-positive">
          Correção concluída. Pode conferir o Dashboard, Vendas e Tabela de Preços.
        </p>
      )}
    </div>
  );
}
