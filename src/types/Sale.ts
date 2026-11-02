export interface SaleItem {
  productId: string;
  productName: string;
  imageUrl?: string;
  quantity: number;
  baseCost: number;
  basePrice: number;
  price: number;
  discountPercent: number;
  subtotal: number;
  profit: number;
}

export interface Sale {
  id: string;
  userId: string;

  clientId: string;
  clientName: string;
  clientFantasy?: string;
  clientPhone?: string;

  items: SaleItem[];

  totalItems: number;
  totalValue: number;
  totalCost: number;
  totalProfit: number;

  status?: 'paid' | 'pending';
  receiptNumber?: number;
  paymentMethod?: PaymentMethod;

  createdAt: Date;
}

export type PaymentMethod = 'dinheiro' | 'pix' | 'cartao' | 'outro';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  cartao: 'Cartão',
  outro: 'Outro',
};
