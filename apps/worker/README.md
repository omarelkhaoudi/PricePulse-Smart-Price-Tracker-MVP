# PricePulse Python Worker

Background worker Python responsable de simuler les variations de prix et de les envoyer a l'API PricePulse.

## Local

```bash
python -m unittest discover apps/worker/tests
```

## Docker

Le service est lance automatiquement par `docker compose up --build`.
