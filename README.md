# QuickBite Restaurant System

Modern pickup ordering flow with PayPal checkout, admin order management, and a PostgreSQL backend.

## Overview

- Customer menu lets guests browse curated items, build a cart, and submit pickup orders.
- Admin dashboard tracks each order through pending -> preparing -> ready -> completed.
- Payments use PayPal Orders API; data persists in PostgreSQL via Prisma.
- Built with Next.js 16, TypeScript, Tailwind CSS, and animated UI flourishes (Framer Motion).

## Prerequisites

- Node.js 18.18+ and npm
- PostgreSQL instance (local or managed such as Railway)
- PayPal developer sandbox app (Client ID + Secret) for end-to-end payment verification

## Quick Start (local)

1) Install deps

```bash
npm install
```

2) Configure environment

Create `.env` in the project root:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
NEXT_PUBLIC_PAYPAL_CLIENT_ID="your-sandbox-client-id"
PAYPAL_CLIENT_SECRET="your-sandbox-secret"
```

3) Set up the database

```bash
npx prisma db push
```

4) Run the app

```bash
npm run dev
```

- Customer menu: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin

## App Surfaces

- **Customer menu** (`/`): Browse `MENU_ITEMS` from `src/lib/data.ts`, add to cart, and submit orders.
- **Admin dashboard** (`/admin`): Fetches recent orders (capped at 100) and advances status.
- **API** (`/api/orders`): Validates payloads with Zod, rate limits by IP, verifies PayPal orders when an `orderID` is provided, then persists to PostgreSQL.

## Environment Variables

| Name | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string. SSL is auto-enabled for Railway hosts. |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Yes (when PayPal is enabled) | PayPal sandbox/client ID exposed to the client for the PayPal SDK. |
| `PAYPAL_CLIENT_SECRET` | Yes (when PayPal is enabled) | Server-side secret for PayPal order verification. |

## Database

- Schema lives in `prisma/schema.prisma` (`Order` + `OrderItem` models).
- `npx prisma db push` to sync schema; `npx prisma studio` to inspect data locally.

## API Reference

`POST /api/orders`

```json
{
  "customerName": "Ada Lovelace",
  "customerPhone": "555-1234",
  "items": [
    { "id": "m1", "name": "Classic Cheese Burger", "price": 18.5, "quantity": 1 }
  ],
  "total": 18.5,
  "orderID": "PAYPAL_ORDER_ID_OPTIONAL"
}
```

- When `orderID` is present, the API validates it with PayPal and enforces amount matching.
- Rate limits: 5 create attempts/minute per IP; 30 fetches/minute per IP.

`GET /api/orders`

- Returns the 100 most recent orders (includes items) sorted by `createdAt` desc.

## Scripts

- `npm run dev` — Next.js dev server
- `npm run build` — production build
- `npm start` — run compiled app
- `npm run lint` — lint with Next.js ESLint config

## Deployment on Railway

1) Create a Railway project and add a PostgreSQL plugin (capture its `DATABASE_URL`).
2) Add the environment variables from the table above to Railway.
3) Deploy the repo; run `npx prisma db push` as a post-deploy command or via a Railway shell.
4) Ensure your PayPal sandbox app allows the deployed domain as an allowed return URL.

## Notes and Limitations

- Rate limiting is in-memory (`src/lib/rateLimit.ts`); use Redis or a gateway for production scale.
- SSL for the database is auto-enabled for Railway hosts; adjust `src/lib/prisma.ts` if your host differs.
- The menu content is static (`src/lib/data.ts`); plug in a CMS or database-backed menu for dynamic updates.
# RestaurantOrderSystem
