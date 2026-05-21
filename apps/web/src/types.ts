export type ProductTrend = 'up' | 'down' | 'stable';

export type PricePoint = {
  id: string;
  productId: string;
  price: number;
  recordedAt: string;
};

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

export type ProductListResponse = {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};
