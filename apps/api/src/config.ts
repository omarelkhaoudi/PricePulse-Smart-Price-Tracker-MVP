export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? 'pricepulse.sqlite',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  simulationIntervalMs: Number(process.env.PRICE_SIMULATION_INTERVAL_MS ?? 30_000),
  enableSimulationWorker: process.env.ENABLE_PRICE_WORKER !== 'false'
};
