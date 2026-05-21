import { Router } from 'express';
import { z } from 'zod';
import type { ProductRepository } from './product.repository.js';
import { simulateNextPrice } from './price-simulator.js';
import { createProductSchema, productQuerySchema, updateProductPriceSchema } from './product.schema.js';

export function createProductRouter(repository: ProductRepository) {
  const router = Router();

  router.get('/', (req, res, next) => {
    try {
      const query = productQuerySchema.parse(req.query);
      res.json(repository.list(query));
    } catch (error) {
      next(error);
    }
  });

  router.post('/', (req, res, next) => {
    try {
      const payload = createProductSchema.parse(req.body);
      const product = repository.create(payload);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/simulate', (req, res, next) => {
    try {
      const params = z.object({ id: z.string().uuid() }).parse(req.params);
      const product = repository.findById(params.id);

      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      const updatedProduct = repository.updatePrice(params.id, simulateNextPrice(product.currentPrice));
      res.json(updatedProduct);
    } catch (error) {
      next(error);
    }
  });

  router.patch('/:id/price', (req, res, next) => {
    try {
      const params = z.object({ id: z.string().uuid() }).parse(req.params);
      const payload = updateProductPriceSchema.parse(req.body);
      const product = repository.findById(params.id);

      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      res.json(repository.updatePrice(params.id, payload.currentPrice));
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', (req, res, next) => {
    try {
      const params = z.object({ id: z.string().uuid() }).parse(req.params);
      const deleted = repository.delete(params.id);

      if (!deleted) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
