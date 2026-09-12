export interface BudgetItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Budget {
  id: string;
  userId: string;

  controlNumber: number;

  clientId: string | null;
  clientName: string;
  clientPhone: string;

  items: BudgetItem[];

  totalItems: number;
  totalValue: number;

  convertedSaleId: string | null;

  createdAt: Date;
}
