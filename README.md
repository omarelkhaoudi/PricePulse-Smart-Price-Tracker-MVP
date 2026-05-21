# PricePulse - Smart Price Tracker MVP

PricePulse est un MVP full-stack permettant de suivre l'evolution simulee du prix de produits e-commerce depuis un dashboard React.

## Stack

- Backend: Node.js, TypeScript, Express, SQLite, Zod
- Worker: Python, bibliotheque standard
- Frontend: React, TypeScript, Vite, TanStack Query
- Tests: Vitest, Supertest, Playwright
- Infra: Docker, Docker Compose
- Documentation API: OpenAPI YAML + Swagger UI

## Lancer avec Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- API: http://localhost:4000
- Documentation API: http://localhost:4000/docs

## Lancer en local sans Docker

Pre-requis local: Node.js 24 ou plus recent, car le backend utilise le module SQLite embarque de Node.

```bash
npm install
npm run dev
```

Le backend demarre sur `http://localhost:4000` et le frontend sur `http://localhost:5173`.

## Tests

```bash
npm test
```

Commandes utiles:

```bash
npm run test:api
npm run test:worker
npm run test:e2e
```

## Architecture

Le backend expose une API REST volontairement compacte:

- `GET /api/products` avec pagination et filtre de tendance.
- `POST /api/products` avec validation stricte de l'URL, du nom et du prix initial.
- `DELETE /api/products/:id` pour retirer un produit du suivi.
- `PATCH /api/products/:id/price` pour les mises a jour envoyees par le worker Python.
- `POST /api/products/:id/simulate` pour declencher une variation de prix manuelle utile en demo/test.

Les donnees sont stockees dans SQLite pour garder le MVP simple a lancer, y compris via Docker. La logique metier est separee entre validation, repository et simulation de prix afin de garder les tests unitaires rapides et deterministes.

Le processus de fond est un worker Python separe (`apps/worker`). En Docker, l'API desactive son simulateur interne et laisse ce worker calculer les variations de prix puis pousser les nouvelles valeurs via l'API. Ce choix montre une architecture plus proche d'un systeme reel: API transactionnelle d'un cote, traitement asynchrone de l'autre.

Le frontend utilise TanStack Query pour les appels asynchrones, l'invalidation du cache apres ajout/suppression, et des etats clairs de chargement/erreur. Le dashboard affiche le prix initial, le prix courant, la tendance et un historique recent sous forme de barres.

## Si j'avais eu 2 semaines de plus

- Ajouter une authentification avec comptes utilisateurs et isolation des produits par utilisateur.
- Remplacer la simulation par un worker planifie plus robuste, avec file de jobs et anti-retry storm.
- Brancher un vrai connecteur de scraping conforme aux CGU des sites ou une API partenaire.
- Ajouter alertes email/webhook quand un prix passe sous un seuil cible.
- Passer sur PostgreSQL avec migrations versionnees pour un deploiement production.
- Ajouter observabilite: logs structures, metriques, traces et dashboard de sante.
- Completer les tests E2E avec suppression, erreurs API, responsive mobile et scenario de variation.
