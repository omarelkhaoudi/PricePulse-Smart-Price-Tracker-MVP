import { describe, expect, it } from 'vitest';
import { calculateTrend, calculateVariationPercent, simulateNextPrice } from './price-simulator.js';
import { createProductSchema } from './product.schema.js';

describe('price simulator', () => {
  it('calculates trends', () => {
    expect(calculateTrend(100, 90)).toBe('down');
    expect(calculateTrend(100, 110)).toBe('up');
    expect(calculateTrend(100, 100)).toBe('stable');
  });

  it('calculates variation percentage', () => {
    expect(calculateVariationPercent(100, 85)).toBe(-15);
    expect(calculateVariationPercent(100, 112.5)).toBe(12.5);
  });

  it('simulates deterministic price updates when random is injected', () => {
    expect(simulateNextPrice(100, () => 0)).toBe(94);
    expect(simulateNextPrice(100, () => 1)).toBe(106);
  });
});

describe('product validation', () => {
  it('accepts valid products', () => {
    expect(createProductSchema.parse({
      name: 'Laptop',
      url: 'https://shop.example.com/laptop',
      currentPrice: 999
    })).toEqual({
      name: 'Laptop',
      url: 'https://shop.example.com/laptop',
      currentPrice: 999
    });
  });

  it('rejects invalid URLs and prices', () => {
    expect(() => createProductSchema.parse({
      name: 'Bad',
      url: 'ftp://example.com/item',
      currentPrice: -5
    })).toThrow();
  });
});
