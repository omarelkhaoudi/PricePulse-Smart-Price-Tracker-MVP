import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(120),
  url: z.string().trim().url().refine((value) => /^https?:\/\//i.test(value), {
    message: 'Only http and https URLs are supported'
  }),
  currentPrice: z.coerce.number().positive().max(1_000_000)
});

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  trend: z.enum(['up', 'down', 'stable']).optional()
});

export const updateProductPriceSchema = z.object({
  currentPrice: z.coerce.number().positive().max(1_000_000)
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductPriceInput = z.infer<typeof updateProductPriceSchema>;
export type ProductTrend = 'up' | 'down' | 'stable';
