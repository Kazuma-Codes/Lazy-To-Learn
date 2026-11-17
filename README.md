# Mosaic Lite

A minimal MERN cross-language chat. One room, no accounts. Anyone writes in any language; the server translates each message to English with Groq, saves it in MongoDB, and the React client shows the room, polling for new messages every 3 seconds.

## Stack

- **M**ongoDB + Mongoose
- **E**xpress
- **R**eact (Vite)
- **N**ode.js (built-in `fetch`, no extra HTTP client)

## Requirements

- Node.js 18+
- MongoDB Community Server running locally on port 27017 (Compass and `mongosh` alone do not include the server), or an Atlas URI in `MONGO_URL`, or skip MongoDB entirely with `npm run dev:memory`
- A Groq API key from https://console.groq.com

## Setup

1. Add your key to `server/.env`:

   ```
   GROQ_API_KEY=gsk_your_key_here
   ```

   Optional: change `MONGO_URL` if MongoDB is not on the default local port.

2. Install dependencies (already done once, needed after a fresh clone):

   ```
   cd server && npm install
   cd ../client && npm install
   ```

## Run

Terminal 1:

```
cd server
npm run dev
```

Terminal 2:

```
cd client
npm run dev
```

Open http://localhost:5173, enter a name, and chat. Vite proxies `/api` to `http://localhost:5000`.

### Run without installing MongoDB

Use the in-memory database instead of the local server:

```
cd server
npm run dev:memory
```

The first run downloads a MongoDB binary (one time, needs internet). No separate database service is needed. Data resets every time the server restarts. The client still runs the same way, and a Groq key is still required for translation.

## API

| Method | Route | Body | Does |
| --- | --- | --- | --- |
| `GET` | `/api/messages` | — | Last 100 messages, oldest first |
| `POST` | `/api/messages` | `{ "name": "...", "text": "..." }` | Translates `text` to English, saves, returns it |

If translation fails the message is **not** saved; the client keeps the text and shows an error, so nothing is lost.

## Intentionally not included

Accounts, passwords, multiple rooms, typing indicators, edits/deletes, attachments, read receipts, AI footnotes, WebSockets, tests. The core idea only.

## Notes

- Messages are stored already translated. The original text is not kept.
- A malformed or missing `GROQ_API_KEY` makes sends fail with a clear error; reading existing messages still works.
- `server/.env` is ignored by the repository's root `.gitignore`.
