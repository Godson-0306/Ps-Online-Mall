# P's Online Mall

Premium storefront for fashion, beauty, lifestyle, and electronics — Lagos, priced in Naira.

## Local development

```bash
npm install
npm run dev:all
```

- Storefront: http://localhost:5173
- API: http://localhost:4000/api/health

Without `DATABASE_URL`, the API uses a local JSON store (`server/data.json`) and still seeds catalog, coupons, and demo users.

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@psonlinemall.com | Admin1234! |
| Customer | demo@psonlinemall.com | Demo1234! |

Coupon: `PSGOLD` (10% off).

## Environment

Copy `.env.example` to `.env`.

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Frontend API base. Leave unset in local Vite to use `/api` proxy. |
| `DATABASE_URL` | Postgres connection. Empty = file-backed store. |
| `JWT_SECRET` | Signs auth tokens. |
| `FRONTEND_URL` | CORS and Paystack callback origin. |
| `PAYSTACK_SECRET_KEY` | Live/test secret. If missing, checkout marks orders paid (demo). |
| `CLOUDINARY_URL` | Admin image uploads. If missing, files go to `/uploads`. |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite storefront |
| `npm run dev:api` | Express API with reload |
| `npm run dev:all` | Both |
| `npm start` | Production API (`0.0.0.0:$PORT`) |
| `npm run build` | Static frontend |
| `npm run test:e2e` | Playwright shop → cart → checkout |

## Deploy on Render

`render.yaml` provisions:

1. Postgres
2. Node API (`ps-mall-api`)
3. Static SPA (`ps-mall-web`) with rewrite to `index.html`

After first deploy, set:

- API `FRONTEND_URL` to the static site URL
- Static site `VITE_API_URL` to `https://<api-service>.onrender.com/api` and redeploy the frontend
- `PAYSTACK_SECRET_KEY` and `CLOUDINARY_URL` for production payments and image hosting (Render disk is ephemeral)

Paystack webhook URL: `https://<api-service>.onrender.com/api/webhooks/paystack`
