import type { ProductTrend } from './product.schema.js';

export type Product = {
  id: string;
  name: string;
  url: string;
  initialPrice: number;
  currentPrice: number;
  trend: ProductTrend;
  variationPercent: number;
  createdAt: string;
  updatedAt: string;
  history: PricePoint[];
};

export type PricePoint = {
  id: string;
  productId: string;
  price: number;
  recordedAt: string;
};
