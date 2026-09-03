export interface SaleItem {
  productId: string;
  productName: string;
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

  items: SaleItem[];

  totalItems: number;
  totalValue: number;
  totalCost: number;
  totalProfit: number;

  status?: 'paid' | 'pending';

  createdAt: Date;
}
