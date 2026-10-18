# link-parsser

A read-it-later app. Paste a link to an article or a YouTube video, and it's saved to your library. The server reads the page in the background, pulls out the title, picture and clean article text, and you read it later without ads and clutter.

**Live:** [link-parser-rose.vercel.app](https://link-parser-rose.vercel.app)


![Library](docs/library.png)
![Reader](docs/reader.png)

## Features

- Sign up with email and password, or log in with GitHub or Google
- Save a link and keep using the page while it's being read; the card fills in by itself a few seconds later
- Reader view: the article text without ads, menus and footers; a YouTube player for videos
- Filter by articles or videos, remove items you're done with
- Light and dark theme, works on phones

## Stack

| | |
|---|---|
| Framework | Nuxt 4, TypeScript (strict) |
| UI | Nuxt UI, Tailwind CSS |
| Server data and cache | Pinia Colada |
| Backend | Nitro server routes |
| Database | PostgreSQL, Drizzle ORM |
| Auth | nuxt-auth-utils (encrypted cookie sessions, OAuth) |
| Parsing | Readability, linkedom, sanitize-html |
| Hosting | Vercel, Neon |

## How it works

**Saving a link.** `POST /api/items` validates the URL, saves the item with status `pending` and answers right away. Parsing runs after the response, so the form never hangs on a slow site. On Vercel the function is kept alive until parsing finishes with `waitUntil`.

**Updating the list.** While the library has fresh `pending` items, the list refetches every 3 seconds. When everything is `ready` or `failed`, polling stops. An item that has been pending for over a minute no longer keeps polling alive.

**Sessions instead of JWT.** One server, one browser client: an encrypted `httpOnly` cookie is simpler, JavaScript can't read it, and the client never has to store or refresh tokens.

**Security**
- The parser downloads any URL a user sends, which could be abused to reach internal addresses (SSRF). Only `http`/`https` on standard ports are allowed, and every connection, including redirects, is checked against private, loopback and link-local ranges at the moment of connecting, which also covers DNS rebinding. Requests time out after 10 seconds and pages are capped at 5 MB.
- Article HTML comes from other people's sites and is rendered with `v-html`, so it's sanitized on the server first: no scripts, styles, iframes, inline handlers or `javascript:` links.
- Every item query filters by the logged-in user, so nobody can read or delete someone else's items by guessing an id.
- Input is validated with Zod on the server.

## Running locally

Requires Node.js 20.18+ and Docker.

```bash
npm install
cp .env.example .env    # fill in the values below
docker compose up -d    # Postgres on port 5433
npm run db:migrate
npm run dev             # http://127.0.0.1:3000
```

### Environment variables

| Name | What it is |
|---|---|
| `DATABASE_URL` | `postgresql://USER:PASSWORD@localhost:5433/DB_NAME` |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Used by Docker to create the local database |
| `NUXT_SESSION_PASSWORD` | 32+ random characters: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NUXT_OAUTH_GITHUB_CLIENT_ID`, `NUXT_OAUTH_GITHUB_CLIENT_SECRET` | From a GitHub OAuth app, callback `http://127.0.0.1:3000/auth/github` |
| `NUXT_OAUTH_GOOGLE_CLIENT_ID`, `NUXT_OAUTH_GOOGLE_CLIENT_SECRET` | From Google Cloud, redirect URI `http://127.0.0.1:3000/auth/google` |

## Project structure

```
app/
  pages/            index (library), auth, items/[id] (reader)
  components/       ItemCard, AddItemForm
  composables/      useItems, useItem, useDeleteItem
  middleware/       redirect to /auth when logged out
server/
  api/items/        list, create, get one, delete
  api/auth/         email + password register and login
  routes/auth/      GitHub and Google OAuth
  utils/            parser, safe-fetch (SSRF guard)
  db/               Drizzle schema and migrations
shared/             types and helpers used on both sides
```

## Not done yet

- Notes and highlights
- Tags and collections
- Full-text search
- Google login works only for test users while the Google app is in testing mode
