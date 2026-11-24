# @minor/pdf-client

Typed `fetch` client for the structured-pdf-data microservice (no build step; exports TS source).

```ts
import { createPdfClient } from "@minor/pdf-client";
const pdf = createPdfClient(process.env.PDF_SERVICE_URL);
await pdf.processDocument("https://example.com/file.pdf");
```

API contract: `context/structured-pdf-data.md`.
