# structured-pdf-data microservice

Extracts structured data from PDFs (via **Docling**) for use as LLM context.
This project consumes it as an external service — do not duplicate its logic here.

- **Live URL:** https://nvdp4-structured-pdf-data.hf.space (Hugging Face Space, Docker SDK)
- **Source:** `~/Desktop/structured-pdf-data`
- **Repos:** GitHub `deepnav4/structured_pdf_data` (origin), HF Space `nvdp4/structured-pdf-data` (remote `hf`)
- **Stack:** Python 3.11, FastAPI, uvicorn (port 7860 in Docker), Docling 2.81, HybridChunker
- **Tokenizer:** `nvidia/llama-nemotron-embed-vl-1b-v2`, `max_tokens=2048`, `merge_peers=True`
- **PDF backend:** PyPdfium, CPU, 1 thread (OOM fix on free tier). Models lazy-load on first request,
  so the first call after a cold start is slow; the HF Space can also sleep when idle.
- **CORS:** open (`*`), no auth.

## Endpoints (all GET, query param `source` = PDF URL or path)
| Route | Returns |
|---|---|
| `/` | `{"status":"healthy","message":"API is running!"}` |
| `/hello` | `"Hello World"` |
| `/get-structured-data?source=` | Markdown string of the whole document |
| `/get-chunks-all-meta?source=` | `{chunks: [<full docling chunk json>], total_chunks}` (heavy) |
| `/get-chunks?source=` | `{chunks: [Chunk], total_chunks, markdown}` |
| `/process-document?source=` | **Recommended.** Small doc → markdown, large doc → chunks (see below) |

### `Chunk` shape (slim metadata)
```json
{
  "text": "…",
  "meta": {
    "headings": ["Section", "Subsection"],
    "page_numbers": [3, 4],
    "types": ["text", "table"],
    "filename": "file.pdf"
  }
}
```

### `/process-document` response
Threshold: markdown length `< 30000` chars.
```json
{ "status": "success", "doc_type": "markdown", "data": "<markdown string>" }
{ "status": "success", "doc_type": "chunks",   "data": [Chunk, …] }
```
Why: small docs go straight into the LLM as markdown (faster, fits context);
large docs are chunked so they can be processed in batches and results stitched.

## Example
```bash
curl "https://nvdp4-structured-pdf-data.hf.space/process-document?source=https://arxiv.org/pdf/2408.09869"
```
Verified healthy on 2026-11-24.
