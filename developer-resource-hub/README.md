# Developer Resource Hub

A full-stack MVP: **React (Vite)**, **Express**, **MongoDB (Mongoose)**, and **JWT** auth. **Admins** manage categories and posts; **users** can sign in for a session (demo user is created by the seed script). The home page includes quick links to **User login**, **Admin login**, and **Log in as demo user**. The public catalog supports search, category filters, pagination, a “New” badge (last 7 days), and a dark/light theme in `localStorage`.

## Project layout

```
developer-resource-hub/
├── server/          # Express API
│   src/
│   │   app.js
│   │   index.js
│   │   config/
│   │   models/
│   │   routes/
│   │   controllers/
│   │   middleware/
│   │   utils/
│   │   seed.js
│   └── .env         # create from .env.example
└── client/          # Vite + React
    src/
    └── ...
```

## Prerequisites

- **Node.js** 18+
- **MongoDB** running locally, or a **MongoDB Atlas** connection string

## Backend setup

```bash
cd server
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, ADMIN_SEED_*, and USER_SEED_*
npm install
npm run seed
npm run dev
```

- API: `http://localhost:5000` (or your `PORT`)
- Health: `GET http://localhost:5000/api/health`

**Environment variables (server)**

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs (use a long random string in production) |
| `JWT_EXPIRES_IN` | Optional, e.g. `7d` |
| `ADMIN_SEED_EMAIL` | Used only by `npm run seed` |
| `ADMIN_SEED_PASSWORD` | Used only by `npm run seed` |
| `USER_SEED_EMAIL` | Demo end-user email (used by `npm run seed`) |
| `USER_SEED_PASSWORD` | Demo end-user password (used by `npm run seed`) |

**API overview**

- `POST /api/auth/login` — **admin** — body: `{ "email", "password" }` → `{ token, admin }` (JWT has `role: "admin"`)
- `POST /api/auth/user/login` — **user** — same body → `{ token, user }` (JWT has `role: "user"`)
- `GET /api/categories` — public list
- `GET /api/categories/:id` — public
- `POST|PUT|DELETE /api/categories` (and `/:id`) — **admin JWT only** (`Authorization: Bearer <admin token>`)
- `GET /api/posts` — public; query: `page`, `limit`, `category` (id), `search` (title)
- `GET /api/posts/:id` — public
- `POST|PUT|DELETE /api/posts` (and `/:id` for mutating) — **admin JWT only**

## Frontend setup

```bash
cd client
cp .env.example .env
# Optional: VITE_API_URL for production (defaults to /api; Vite dev proxies /api to the backend)
npm install
npm run dev
```

- App: `http://localhost:5173` (Vite)
- In development, `vite.config.js` proxies `/api` to `http://localhost:5000`, so the client uses the same origin for API calls and avoids CORS issues.

**Production build**

```bash
cd client
npm run build
# static files in client/dist — serve with any static host and set VITE_API_URL to your API base URL, e.g. https://api.example.com/api
```

## Usage

1. Start MongoDB.
2. Copy server `.env`, run `npm run seed` once to create the admin user.
3. Run the API (`server`: `npm run dev`).
4. Run the app (`client`: `npm run dev`).
5. Open `/admin/login` (or use **Admin login** on the home page), sign in with the seeded admin, then use **Admin** in the header to manage content.
6. Open `/user/login` or use **User login** / **Log in as demo user** on the home page to try the demo user (must match `USER_SEED_*` in `.env` after `npm run seed`).
7. Open `/` to browse, search, and filter on the public site.

## License

MIT (or as you prefer for your project).
