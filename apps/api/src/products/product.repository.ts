import { randomUUID } from 'node:crypto';
import type { Db } from '../db.js';
import type { CreateProductInput, ProductTrend } from './product.schema.js';
import { calculateTrend, calculateVariationPercent } from './price-simulator.js';
import type { PricePoint, Product } from './product.types.js';

type ProductRow = {
  id: string;
  name: string;
  url: string;
  initial_price: number;
  current_price: number;
  created_at: string;
  updated_at: string;
};

type PricePointRow = {
  id: string;
  product_id: string;
  price: number;
  recorded_at: string;
};

export class ProductRepository {
  constructor(private readonly db: Db) {}

  list(options: { page: number; limit: number; trend?: ProductTrend }) {
    const offset = (options.page - 1) * options.limit;
    const rows = this.db
      .prepare('SELECT * FROM products ORDER BY datetime(created_at) DESC LIMIT ? OFFSET ?')
      .all(options.limit, offset) as ProductRow[];

    const products = rows.map((row) => this.toProduct(row)).filter((product) => {
      return options.trend ? product.trend === options.trend : true;
    });

    const totalRow = this.db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
    const total = Number(totalRow.count);
    return { data: products, pagination: { page: options.page, limit: options.limit, total } };
  }

  create(input: CreateProductInput) {
    const now = new Date().toISOString();
    const id = randomUUID();

    this.withTransaction(() => {
      this.db
        .prepare(`
          INSERT INTO products (id, name, url, initial_price, current_price, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .run(id, input.name, input.url, input.currentPrice, input.currentPrice, now, now);

      this.insertPricePoint(id, input.currentPrice, now);
    });

    return this.findById(id);
  }

  delete(id: string) {
    const result = this.db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return result.changes > 0;
  }

  findById(id: string) {
    const row = this.db.prepare('SELECT * FROM products WHERE id = ?').get(id) as ProductRow | undefined;
    return row ? this.toProduct(row) : null;
  }

  updatePrice(id: string, price: number) {
    const now = new Date().toISOString();
    this.withTransaction(() => {
      this.db.prepare('UPDATE products SET current_price = ?, updated_at = ? WHERE id = ?').run(price, now, id);
      this.insertPricePoint(id, price, now);
    });

    return this.findById(id);
  }

  updateAllPrices(nextPrice: (currentPrice: number) => number) {
    const rows = this.db.prepare('SELECT * FROM products').all() as ProductRow[];
    return rows.map((row) => this.updatePrice(row.id, nextPrice(row.current_price))).filter(Boolean) as Product[];
  }

  private insertPricePoint(productId: string, price: number, recordedAt: string) {
    this.db
      .prepare('INSERT INTO price_points (id, product_id, price, recorded_at) VALUES (?, ?, ?, ?)')
      .run(randomUUID(), productId, price, recordedAt);
  }

  private withTransaction(work: () => void) {
    this.db.exec('BEGIN');
    try {
      work();
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  private getHistory(productId: string) {
    const rows = this.db
      .prepare('SELECT * FROM price_points WHERE product_id = ? ORDER BY datetime(recorded_at) ASC LIMIT 30')
      .all(productId) as PricePointRow[];

    return rows.map<PricePoint>((row) => ({
      id: row.id,
      productId: row.product_id,
      price: row.price,
      recordedAt: row.recorded_at
    }));
  }

  private toProduct(row: ProductRow): Product {
    return {
      id: row.id,
      name: row.name,
      url: row.url,
      initialPrice: row.initial_price,
      currentPrice: row.current_price,
      trend: calculateTrend(row.initial_price, row.current_price),
      variationPercent: calculateVariationPercent(row.initial_price, row.current_price),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      history: this.getHistory(row.id)
    };
  }
}
