import express from "express";
import cors from "cors";
import { createPdfClient } from "@minor/pdf-client";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const pdf = createPdfClient(process.env.PDF_SERVICE_URL);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Checks whether the structured-pdf-data microservice is reachable.
app.get("/pdf/health", async (_req, res) => {
  try {
    res.json(await pdf.health());
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
});

// GET /pdf/process?source=<pdf url> → markdown (small doc) or chunks (large doc)
app.get("/pdf/process", async (req, res) => {
  const source = req.query.source;
  if (typeof source !== "string" || !source) {
    res.status(400).json({ error: "query param `source` (PDF URL) is required" });
    return;
  }
  try {
    res.json(await pdf.processDocument(source));
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
});

app.listen(port, () => {
  console.log(`api listening on http://localhost:${port}`);
});
