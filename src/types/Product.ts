export type Product = {
  id: string;
  name: string;
  category: string;
  cost: number;
  trackStock?: boolean;
  stockQuantity?: number;
  userId: string;
  createdAt: Date;
};
