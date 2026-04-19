# CRUD API

Simple CRUD API for managing products, built with Fastify and TypeScript.

## Commands

| Command | Description |
|---|---|
| `npm run start:dev` | Start dev server with hot reload (tsx watch) |
| `npm run start:prod` | Build TypeScript and run compiled JS |
| `npm run start:multi` | Start in cluster mode with load balancer |
| `npm test` | Run tests (vitest) |

Server runs on `http://localhost:4000` by default. Configure via `PORT` in `.env`.

## API Endpoints

Base path: `/api/products`

### Get all products

```
GET /api/products
```

Response: `200` — array of products.

### Get product by ID

```
GET /api/products/:productId
```

Response: `200` — product object.
Errors: `400` — invalid UUID, `404` — not found.

### Create product

```
POST /api/products
```

Body:

```json
{
  "name": "string",
  "description": "string",
  "price": "number (> 0)",
  "category": "string",
  "inStock": "boolean"
}
```

Response: `201` — created product with generated `id`.
Errors: `400` — missing or invalid fields.

### Update product

```
PUT /api/products/:productId
```

Body: any subset of product fields.

Response: `200` — updated product.
Errors: `400` — invalid UUID, `404` — not found.

### Delete product

```
DELETE /api/products/:productId
```

Response: `204` — no content.
Errors: `400` — invalid UUID, `404` — not found.

## Cluster Mode

```bash
npm run start:multi
```

Starts a load balancer on port `4000` that distributes requests across multiple worker processes using round-robin. Each worker runs its own Fastify instance, and all workers share a single in-memory database through a dedicated DB process.

The console outputs trace logs showing the full request flow:

```
[Load Balancer]  GET /api/products → Worker 1 (port 4001)
[Worker 7384]    → DB Process: GET_ALL (request-id)
[Primary]        Worker 2 → DB Process: GET_ALL (request-id)
[DB Process]     ← Received: GET_ALL (request-id)
[DB Process]     → Responding: GET_ALL (request-id)
[Primary]        DB Process → Worker 2: response (request-id)
[Worker 7384]    ← DB Process: response (request-id)
```
