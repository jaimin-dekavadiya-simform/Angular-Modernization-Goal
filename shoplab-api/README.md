# ShopLab API

NestJS backend for the Angular practice app in `../angular-practice` (see its `docs/ROADMAP.md`).
It covers every milestone: catalog, cart, checkout, admin, JWT auth, websockets, slow and failing endpoints.

## Quick start

```bash
npm install
cp .env.example .env     # defaults work as-is
npm run seed             # builds, resets the DB, generates 48 products + images
npm run start:dev        # http://localhost:3000/api
```

- Swagger UI: <http://localhost:3000/api/docs> (use **Authorize** with an access token)
- Angular dev server origin `http://localhost:4200` is allowed by CORS (`CORS_ORIGINS`)

| Account | Email | Password | Role |
|---|---|---|---|
| Admin | `admin@shoplab.dev` | `Admin123!` | admin |
| Customer | `user@shoplab.dev` | `User123!` | customer |

`npm run seed` is destructive: it drops and recreates every table. Run it any time to reset.

## Scripts

| Script | What it does |
|---|---|
| `npm run start:dev` | Watch mode |
| `npm run seed` | Reset DB and load sample data |
| `npm test` | Unit tests (auth, cart) |
| `npm run test:e2e` | End-to-end flow against an in-memory DB |
| `npm run lint` / `npm run build` | Lint (with autofix) / compile |

## Endpoints (all under `/api`)

🔓 = public, 🔑 = needs `Authorization: Bearer <accessToken>`, 👑 = admin only.

| Method & path | Auth | Notes |
|---|---|---|
| `POST /auth/register` | 🔓 | `{email, password (8+), name}` → `{accessToken, refreshToken, expiresIn, user}` |
| `POST /auth/login` | 🔓 | same response |
| `POST /auth/refresh` | 🔓 | `{refreshToken}`; tokens **rotate**, the old refresh token stops working |
| `POST /auth/logout` | 🔑 | revokes the refresh token (204) |
| `GET /auth/me` | 🔑 | |
| `GET /products` | 🔓 | `search, category (slug), minPrice, maxPrice, sort, page, limit` → `{data, meta}` |
| `GET /products/:id` | 🔓 | includes `category`, `images[]` (400/800 px), `rating`, `stock` |
| `POST /products`, `PATCH /products/:id`, `DELETE /products/:id` | 👑 | |
| `GET /categories` | 🔓 | admin: `POST`, `PATCH /:id`, `DELETE /:id` |
| `GET /products/:id/reviews` | 🔓 | **slow on purpose** (`REVIEWS_DELAY_MS`, default 1.5 s) |
| `POST /products/:id/reviews` | 🔑 | `{rating 1-5, comment}` |
| `GET /cart` | 🔑 | `{items[], itemCount, total}` |
| `POST /cart/items` | 🔑 | `{productId, quantity}`; 409 if over stock |
| `PATCH /cart/items/:productId` | 🔑 | `{quantity}` |
| `DELETE /cart/items/:productId`, `DELETE /cart` | 🔑 | |
| `POST /orders` | 🔑 | checkout from the cart, see below |
| `GET /orders`, `GET /orders/:id` | 🔑 | your own orders |
| `GET /admin/orders` | 👑 | `status, page, limit` |
| `PATCH /admin/orders/:id/status` | 👑 | `{status}`; cancelling restocks |
| `GET /health` | 🔓 | |

`sort` values: `newest` (default), `price`, `-price`, `name`, `-name`, `rating`, `-rating`.

### Checkout (`POST /orders`)

```json
{
  "shippingAddress": { "fullName": "Demo User", "line1": "1 Main St", "city": "Pune", "postalCode": "411001", "country": "India" },
  "payment": { "cardNumber": "4242424242424242", "expiry": "12/30", "cvc": "123" }
}
```

Payment is fake. A card number **ending in `0002` is declined with HTTP 402**, which is handy for error handling practice. Only the last four digits are stored. Order statuses: `pending`, `paid`, `shipped`, `delivered`, `cancelled`.

### Error shape

Every error looks like `{ "statusCode": 409, "message": "...", "error": "Conflict" }`. Validation errors (400) have `message` as an array of strings. Auth failures are 401, role failures 403.

## Practice toggles (when `CHAOS_ENABLED=true`)

Add to any request:

| Query | Effect |
|---|---|
| `?delay=2000` | wait 2 s before responding (max 10 s) |
| `?fail=500` | always fail with that status |
| `?failRate=0.3` | fail about 30% of requests with 503 (retry practice) |

## Realtime (Socket.IO)

Namespace `/live` at `http://localhost:3000/live`.

| Event | Who receives it | Payload |
|---|---|---|
| `stock.updated` | everyone | `{productId, stock}` |
| `order.status` | the order's owner and admins | `{orderId, status, total}` |

Connect with `io('http://localhost:3000/live', { auth: { token: accessToken } })` to get your own `order.status` events. Without a token you still get `stock.updated`. Set `STOCK_TICKER=true` to make stock change randomly every 3 s, for the RxJS websocket exercise.

## How this maps to the roadmap

| Roadmap milestone | Use these parts of the API |
|---|---|
| 0 Basics | `GET /products` |
| 1 Routing, data, forms | `GET /products/:id`, `POST /orders` validation errors, search box |
| 2 Foundations (guards, interceptors, resolvers) | `/auth/*` for `authGuard` and the token interceptor, `GET /products/:id` for the resolver |
| 3 Signals & state | `/cart/*`, `httpResource` on `/products`, debounced `search`, websocket `stock.updated` with RxJS interop |
| 4 Performance | `images[]` with two widths for `NgOptimizedImage`, slow `/reviews` for `@defer`, `?delay` for loading states |
| 5 Architecture, testing | `/admin/*` and product CRUD, `API_BASE_URL` token, Playwright against a seeded DB |

## Configuration

See `.env.example`. Notable keys: `DB_TYPE` (`sqlite` or `postgres`), `DATABASE_URL`, `JWT_*_SECRET`, `ACCESS_TTL_SECONDS` (set it to `30` to practise refresh-token handling), `CHAOS_ENABLED`, `REVIEWS_DELAY_MS`, `STOCK_TICKER`.

## Notes and limits

- **Practice project, not production.** Dev JWT secrets are defaults, and the schema is created with TypeORM `synchronize` (no migrations).
- **Postgres mode** (`docker compose up -d`, host port **5433**, then set `DB_TYPE=postgres` and `DATABASE_URL`) is wired up but has **not been tested**. SQLite is the verified path.
- Pinned to NestJS 11 on purpose: the NestJS 12 line is ESM-only, so `@nestjs/config`, `jwt`, `passport` and `typeorm` are held at their last CommonJS releases.
- Product images are generated SVG placeholders (`public/images`, git-ignored, recreated by `npm run seed`).
