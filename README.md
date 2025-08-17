Postal Server (Express + Sequelize + MySQL)
==========================================

Setup
-----

1. Copy the example env and fill in values:

```
cp ENV.EXAMPLE .env
```

Required keys include server, CORS, DB, JWT RS256 keys, and Cloudinary creds.

2. Install dependencies:

```
npm install
```

3. Ensure the MySQL database exists (will create if missing):

```
npm run db:init
```

4. Start the server (development):

```
npm run dev
```

5. Start the server (production):

```
npm start
```

The server runs on `http://localhost:4000` by default.

Routes
------

- GET `/health` – health check and DB status
- GET `/api/` – API root
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`
- Profile: `GET /api/profile/:username`, `PUT /api/profile`, `POST /api/profile/:username/follow`, `POST /api/profile/:username/unfollow`
- Posts: `GET /api/posts`, `POST /api/posts`, `DELETE /api/posts/:id`
- Comments: `POST /api/comments`, `GET /api/comments/:postId`, `DELETE /api/comments/:id`
- Likes: `POST /api/likes/:postId/toggle`
- Cloudinary: `GET /api/cloudinary/signature`

Notes
-----

- Tables are auto-synced on startup via `sequelize.sync()`.
- Ensure your MySQL server is running and the database exists (see `DB_NAME`).

API Docs
--------

- Swagger UI is available at `http://localhost:4000/docs`.
- The OpenAPI source lives in `docs/openapi.yaml`.
- Set `CORS_ORIGIN` for stricter CORS in non-local environments.
- Provide `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` (RS256 PEM). You can use base64-encoded PEM strings.

# postal-server