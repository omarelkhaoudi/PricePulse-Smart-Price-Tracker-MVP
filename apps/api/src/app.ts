import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import type { ProductRepository } from './products/product.repository.js';
import { createProductRouter } from './products/product.routes.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp(repository: ProductRepository, corsOrigin: string) {
  const app = express();
  const openApiPath = [
    path.join(process.cwd(), 'src', 'docs', 'openapi.yaml'),
    path.join(process.cwd(), 'dist', 'docs', 'openapi.yaml')
  ].find((candidate) => fs.existsSync(candidate));

  if (!openApiPath) {
    throw new Error('OpenAPI document not found');
  }

  const openApiDocument = YAML.parse(fs.readFileSync(openApiPath, 'utf8'));

  app.use(helmet());
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());
  app.use(morgan('tiny'));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use('/api/products', createProductRouter(repository));
  app.use(errorHandler);

  return app;
}
