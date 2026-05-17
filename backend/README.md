# Portfolio Backend

Backend API for the portfolio contact form.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The server runs at `http://localhost:5000`.
It connects to the SQLite database in `../database/data/portfolio.sqlite`.

## Endpoints

- `GET /api/health` checks that the API is running.
- `POST /api/contact` accepts `username`, `email`, `phone`, and `message`.
- `GET /api/messages` lists submitted contact messages.

Messages are stored in SQLite.
