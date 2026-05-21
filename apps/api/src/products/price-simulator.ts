export function calculateTrend(initialPrice: number, currentPrice: number) {
  if (currentPrice > initialPrice) return 'up';
  if (currentPrice < initialPrice) return 'down';
  return 'stable';
}

export function calculateVariationPercent(initialPrice: number, currentPrice: number) {
  return Number((((currentPrice - initialPrice) / initialPrice) * 100).toFixed(2));
}

export function simulateNextPrice(currentPrice: number, random = Math.random) {
  const variationRate = (random() * 0.12) - 0.06;
  const nextPrice = currentPrice * (1 + variationRate);
  return Math.max(0.01, Number(nextPrice.toFixed(2)));
}
