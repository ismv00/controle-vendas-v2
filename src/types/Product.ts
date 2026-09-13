export type StockMode = 'none' | 'direct' | 'recipe';

export type RecipeItem = {
  insumoId: string;
  insumoName: string;
  quantity: number;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  cost: number;
  stockMode?: StockMode;
  stockQuantity?: number;
  recipeItems?: RecipeItem[];
  userId: string;
  createdAt: Date;
};
