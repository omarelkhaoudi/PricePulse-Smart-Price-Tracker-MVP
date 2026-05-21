import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, ArrowDownRight, ArrowUpRight, Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { createProduct, deleteProduct, listProducts, simulateProduct } from './api.js';
import type { Product, ProductTrend } from './types.js';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function App() {
  const queryClient = useQueryClient();
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: listProducts });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const simulateMutation = useMutation({
    mutationFn: simulateProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const products = productsQuery.data?.data ?? [];
  const stats = useMemo(() => buildStats(products), [products]);

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Smart Price Tracker</p>
          <h1>PricePulse</h1>
        </div>
        <div className="status-pill">
          <Activity size={18} />
          {products.length} tracked
        </div>
      </header>

      <section className="summary-grid" aria-label="Price tracking summary">
        <Metric label="Average change" value={`${stats.averageChange}%`} tone={stats.averageChange > 0 ? 'up' : stats.averageChange < 0 ? 'down' : 'stable'} />
        <Metric label="Price drops" value={String(stats.down)} tone="down" />
        <Metric label="Price increases" value={String(stats.up)} tone="up" />
      </section>

      <section className="workspace">
        <ProductForm isPending={createMutation.isPending} error={createMutation.error} onSubmit={(payload) => createMutation.mutate(payload)} />

        <div className="product-area">
          <div className="section-heading">
            <div>
              <h2>Tracked products</h2>
              <p>Live simulated price movement from your saved URLs.</p>
            </div>
            {productsQuery.isFetching ? <Loader2 className="spin" size={18} /> : null}
          </div>

          {productsQuery.isError ? (
            <div className="empty-state">The API is not reachable right now.</div>
          ) : products.length === 0 ? (
            <div className="empty-state">Add a product to start tracking price movement.</div>
          ) : (
            <div className="product-list">
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  isDeleting={deleteMutation.isPending}
                  isSimulating={simulateMutation.isPending}
                  onDelete={() => deleteMutation.mutate(product.id)}
                  onSimulate={() => simulateMutation.mutate(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ProductForm({
  isPending,
  error,
  onSubmit
}: {
  isPending: boolean;
  error: Error | null;
  onSubmit: (payload: { name: string; url: string; currentPrice: number }) => void;
}) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ name, url, currentPrice: Number(currentPrice) });
    setName('');
    setUrl('');
    setCurrentPrice('');
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="section-heading compact">
        <div>
          <h2>Add product</h2>
          <p>Track a product URL and its current price.</p>
        </div>
      </div>

      <label>
        Product name
        <input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={120} required placeholder="Noise-cancelling headphones" />
      </label>

      <label>
        Product URL
        <input value={url} onChange={(event) => setUrl(event.target.value)} type="url" required placeholder="https://shop.example.com/item" />
      </label>

      <label>
        Current price
        <input value={currentPrice} onChange={(event) => setCurrentPrice(event.target.value)} type="number" step="0.01" min="0.01" required placeholder="149.99" />
      </label>

      {error ? <p className="error-message">{error.message}</p> : null}

      <button className="primary-button" type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
        Track product
      </button>
    </form>
  );
}

function ProductRow({
  product,
  isDeleting,
  isSimulating,
  onDelete,
  onSimulate
}: {
  product: Product;
  isDeleting: boolean;
  isSimulating: boolean;
  onDelete: () => void;
  onSimulate: () => void;
}) {
  return (
    <article className="product-row">
      <div className="product-main">
        <TrendIcon trend={product.trend} />
        <div className="product-copy">
          <h3>{product.name}</h3>
          <a href={product.url} target="_blank" rel="noreferrer">{product.url}</a>
        </div>
      </div>

      <PriceStack label="Initial" value={money.format(product.initialPrice)} />
      <PriceStack label="Current" value={money.format(product.currentPrice)} strong />

      <div className={`trend-badge ${product.trend}`}>
        {product.variationPercent > 0 ? '+' : ''}{product.variationPercent}%
      </div>

      <MiniHistory product={product} />

      <div className="row-actions">
        <button type="button" className="icon-button" onClick={onSimulate} disabled={isSimulating} title="Simulate price update" aria-label={`Simulate price update for ${product.name}`}>
          <RefreshCw size={17} />
        </button>
        <button type="button" className="icon-button danger" onClick={onDelete} disabled={isDeleting} title="Delete product" aria-label={`Delete ${product.name}`}>
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: ProductTrend }) {
  return (
    <div className={`metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PriceStack({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="price-stack">
      <span>{label}</span>
      <strong className={strong ? 'current' : ''}>{value}</strong>
    </div>
  );
}

function TrendIcon({ trend }: { trend: ProductTrend }) {
  if (trend === 'down') return <span className="trend-icon down"><ArrowDownRight size={22} /></span>;
  if (trend === 'up') return <span className="trend-icon up"><ArrowUpRight size={22} /></span>;
  return <span className="trend-icon stable"><Activity size={20} /></span>;
}

function MiniHistory({ product }: { product: Product }) {
  const max = Math.max(...product.history.map((point) => point.price), product.currentPrice);

  return (
    <div className="history" aria-label={`Price history for ${product.name}`}>
      {product.history.slice(-8).map((point) => (
        <span key={point.id} style={{ height: `${Math.max(20, (point.price / max) * 100)}%` }} />
      ))}
    </div>
  );
}

function buildStats(products: Product[]) {
  const totalChange = products.reduce((sum, product) => sum + product.variationPercent, 0);
  return {
    averageChange: products.length ? Number((totalChange / products.length).toFixed(2)) : 0,
    up: products.filter((product) => product.trend === 'up').length,
    down: products.filter((product) => product.trend === 'down').length
  };
}
