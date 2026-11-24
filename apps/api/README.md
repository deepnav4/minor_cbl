# api

Express 5 + TypeScript (run with `tsx`). Runs on http://localhost:4000.

| Route | Description |
|---|---|
| `GET /health` | API health |
| `GET /pdf/health` | Health of the structured-pdf-data microservice |
| `GET /pdf/process?source=<pdf url>` | Proxies `/process-document` |

Reads `PORT` and `PDF_SERVICE_URL` from the root `.env`.
