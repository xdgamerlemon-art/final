# ArtisanCraft

ArtisanCraft is a full-stack local artisans marketplace built with Express, MongoDB/Mongoose, JWT, and React/Vite. It includes customer, seller, and admin roles; admin-reviewed product changes and testimonials; search/filter; a stock-validated cart and checkout; profile management; and role-protected dashboards.

## Requirements
- Node.js 20+
- No external database is required for local development. When `MONGO_URI` is omitted outside production, the API uses a local JSON data store and seeds demo products/accounts.
- Production deployments must provide a MongoDB connection string and a strong JWT secret.

## Setup
1. From the repository root run `npm install`.
2. Run `npm run dev`; the API is on port 5000 and the web app on port 5173. No MongoDB server is needed for local development.
3. Local demo admin: username `admin` or email `admin@artisancraft.local`, password `ArtisanCraftAdmin!26`. Local demo seller: username `maker` or email `maker@artisancraft.local`, password `ArtisanCraftMaker!26`. Use these only on localhost. Local data is persisted in `server/.local-data.json`.
4. To use MongoDB instead of the local JSON store, copy `server/.env.example` to `server/.env` and set `MONGO_URI` and a long random `JWT_SECRET`. Public registration never accepts a role; use the admin dashboard to promote users.

The API base URL defaults to `http://localhost:5000/api`. The API binds to localhost in development. The JSON development store and demo credentials are disabled in production; configure `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, HTTPS, secure secret management, rate limiting at the edge, and managed MongoDB. Checkout computes prices and validates stock on the server.
