import { config } from './config.js';
import { createApp } from './app.js';
import { createDb } from './db.js';
import { ProductRepository } from './products/product.repository.js';
import { simulateNextPrice } from './products/price-simulator.js';

const db = createDb(config.databaseUrl);
const repository = new ProductRepository(db);
const app = createApp(repository, config.corsOrigin);

const server = app.listen(config.port, () => {
  console.log(`PricePulse API listening on http://localhost:${config.port}`);
});

let worker: NodeJS.Timeout | undefined;

if (config.enableSimulationWorker) {
  worker = setInterval(() => {
    repository.updateAllPrices(simulateNextPrice);
  }, config.simulationIntervalMs);
}

function shutdown() {
  if (worker) clearInterval(worker);
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
