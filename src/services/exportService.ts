import JSZip from 'jszip';
import { toCSV } from '../lib/csv';
import { PAYMENT_METHOD_LABELS } from '../types/Sale';
import { getClientsByUser } from './clientService';
import { getProductsByUser } from './productService';
import { getProductPricesByUser } from './priceService';
import { getSalesByUser } from './saleService';
import { getBudgetsByUser } from './budgetService';

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-BR');
}

export async function exportAllData(userId: string) {
  const [clients, products, prices, sales, budgets] = await Promise.all([
    getClientsByUser(userId),
    getProductsByUser(userId),
    getProductPricesByUser(userId),
    getSalesByUser(userId),
    getBudgetsByUser(userId),
  ]);

  const zip = new JSZip();

  zip.file(
    'clientes.csv',
    toCSV(clients, [
      { key: 'name', label: 'Nome', value: (c) => c.name },
      { key: 'fantasy', label: 'Fantasia', value: (c) => c.fantasy },
      { key: 'address', label: 'Endereço', value: (c) => c.address },
      { key: 'phone', label: 'Telefone', value: (c) => c.phone },
      { key: 'createdAt', label: 'Cadastrado em', value: (c) => formatDate(c.createdAt) },
    ])
  );

  zip.file(
    'produtos.csv',
    toCSV(products, [
      { key: 'name', label: 'Nome', value: (p) => p.name },
      { key: 'category', label: 'Categoria', value: (p) => p.category },
      { key: 'cost', label: 'Custo', value: (p) => p.cost.toFixed(2) },
      { key: 'createdAt', label: 'Cadastrado em', value: (p) => formatDate(p.createdAt) },
    ])
  );

  zip.file(
    'tabela_de_precos.csv',
    toCSV(prices, [
      { key: 'productName', label: 'Produto', value: (p) => p.productName },
      { key: 'baseCost', label: 'Custo', value: (p) => p.baseCost.toFixed(2) },
      { key: 'operationalExpensePercent', label: 'Despesa (%)', value: (p) => p.operationalExpensePercent },
      { key: 'marginPercent', label: 'Margem (%)', value: (p) => p.marginPercent },
      { key: 'salePrice', label: 'Preço de venda', value: (p) => p.salePrice.toFixed(2) },
    ])
  );

  zip.file(
    'vendas.csv',
    toCSV(sales, [
      { key: 'receiptNumber', label: 'Nº', value: (s) => s.receiptNumber ?? '' },
      { key: 'clientName', label: 'Cliente', value: (s) => s.clientName },
      { key: 'createdAt', label: 'Data', value: (s) => formatDate(s.createdAt) },
      { key: 'totalItems', label: 'Itens', value: (s) => s.totalItems },
      { key: 'totalValue', label: 'Total', value: (s) => s.totalValue.toFixed(2) },
      { key: 'totalProfit', label: 'Lucro', value: (s) => s.totalProfit.toFixed(2) },
      { key: 'status', label: 'Status', value: (s) => (s.status === 'pending' ? 'Pendente' : 'Pago') },
      {
        key: 'paymentMethod',
        label: 'Forma de pagamento',
        value: (s) => (s.paymentMethod ? PAYMENT_METHOD_LABELS[s.paymentMethod] : ''),
      },
    ])
  );

  const saleItemsRows = sales.flatMap((sale) =>
    sale.items.map((item) => ({ sale, item }))
  );

  zip.file(
    'vendas_itens.csv',
    toCSV(saleItemsRows, [
      { key: 'sale', label: 'Venda Nº', value: ({ sale }) => sale.receiptNumber ?? sale.id },
      { key: 'clientName', label: 'Cliente', value: ({ sale }) => sale.clientName },
      { key: 'productName', label: 'Produto', value: ({ item }) => item.productName },
      { key: 'quantity', label: 'Quantidade', value: ({ item }) => item.quantity },
      { key: 'price', label: 'Preço unitário', value: ({ item }) => item.price.toFixed(2) },
      { key: 'subtotal', label: 'Subtotal', value: ({ item }) => item.subtotal.toFixed(2) },
    ])
  );

  zip.file(
    'orcamentos.csv',
    toCSV(budgets, [
      { key: 'controlNumber', label: 'Nº', value: (b) => b.controlNumber },
      { key: 'clientName', label: 'Cliente', value: (b) => b.clientName },
      { key: 'clientPhone', label: 'Telefone', value: (b) => b.clientPhone },
      { key: 'createdAt', label: 'Data', value: (b) => formatDate(b.createdAt) },
      { key: 'totalItems', label: 'Itens', value: (b) => b.totalItems },
      { key: 'totalValue', label: 'Total', value: (b) => b.totalValue.toFixed(2) },
      { key: 'convertedSaleId', label: 'Convertido em venda', value: (b) => (b.convertedSaleId ? 'Sim' : 'Não') },
    ])
  );

  const budgetItemsRows = budgets.flatMap((budget) =>
    budget.items.map((item) => ({ budget, item }))
  );

  zip.file(
    'orcamentos_itens.csv',
    toCSV(budgetItemsRows, [
      { key: 'budget', label: 'Orçamento Nº', value: ({ budget }) => budget.controlNumber },
      { key: 'clientName', label: 'Cliente', value: ({ budget }) => budget.clientName },
      { key: 'productName', label: 'Produto', value: ({ item }) => item.productName },
      { key: 'quantity', label: 'Quantidade', value: ({ item }) => item.quantity },
      { key: 'unitPrice', label: 'Preço unitário', value: ({ item }) => item.unitPrice.toFixed(2) },
      { key: 'subtotal', label: 'Subtotal', value: ({ item }) => item.subtotal.toFixed(2) },
    ])
  );

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const dateStamp = new Date().toISOString().slice(0, 10);

  const link = document.createElement('a');
  link.href = url;
  link.download = `venda-facil-dados-${dateStamp}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
