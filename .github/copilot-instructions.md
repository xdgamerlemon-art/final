# ArtisanCraft workspace instructions

- Keep the Express API organized with MVC modules under `server/` and the React/Vite app under `client/`.
- Enforce authentication, role authorization, input validation, and approval workflows on the server; never trust client-provided roles, prices, or totals.
- Products are public only when approved. Seller submissions and edits require admin review.
- Run `npm install` from the repository root, then `npm run dev` to start both applications.
