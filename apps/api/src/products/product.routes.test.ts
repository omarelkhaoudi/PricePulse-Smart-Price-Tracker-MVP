import { DatabaseSync } from 'node:sqlite';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { migrate, type Db } from '../db.js';
import { ProductRepository } from './product.repository.js';

describe('product API', () => {
  let db: Db;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    db = new DatabaseSync(':memory:');
    migrate(db);
    app = createApp(new ProductRepository(db), '*');
  });

  afterEach(() => {
    db.close();
  });

  it('creates and lists a product', async () => {
    const createResponse = await request(app)
      .post('/api/products')
      .send({
        name: 'USB-C Hub',
        url: 'https://shop.example.com/hub',
        currentPrice: 49.9
      })
      .expect(201);

    expect(createResponse.body.trend).toBe('stable');

    const listResponse = await request(app).get('/api/products').expect(200);
    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0].name).toBe('USB-C Hub');
  });

  it('rejects invalid payloads', async () => {
    const response = await request(app)
      .post('/api/products')
      .send({ name: 'x', url: 'notaurl', currentPrice: 0 })
      .expect(400);

    expect(response.body.message).toBe('Invalid request payload');
  });

  it('deletes a product', async () => {
    const createResponse = await request(app)
      .post('/api/products')
      .send({
        name: 'Monitor',
        url: 'https://shop.example.com/monitor',
        currentPrice: 249
      });

    await request(app).delete(`/api/products/${createResponse.body.id}`).expect(204);

    const listResponse = await request(app).get('/api/products');
    expect(listResponse.body.data).toHaveLength(0);
  });

  it('updates a product price from the worker endpoint', async () => {
    const createResponse = await request(app)
      .post('/api/products')
      .send({
        name: 'Desk Lamp',
        url: 'https://shop.example.com/lamp',
        currentPrice: 80
      });

    const updateResponse = await request(app)
      .patch(`/api/products/${createResponse.body.id}/price`)
      .send({ currentPrice: 72 })
      .expect(200);

    expect(updateResponse.body.currentPrice).toBe(72);
    expect(updateResponse.body.trend).toBe('down');
    expect(updateResponse.body.variationPercent).toBe(-10);
  });
});
