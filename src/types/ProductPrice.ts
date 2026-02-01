export interface ProductPrice {
  id: string;

  userId: string;

  productId: string;
  productName: string;

  baseCost: number;

  operationalExpensePercent: number;
  marginPercent: number;

  salePrice: number;

  createdAt: Date;
  updatedAt?: Date;
}
