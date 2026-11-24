// Client for the structured-pdf-data microservice.
// API contract: context/structured-pdf-data.md

export const DEFAULT_PDF_SERVICE_URL = "https://nvdp4-structured-pdf-data.hf.space";

export interface Chunk {
  text: string;
  meta: {
    headings: string[];
    page_numbers: number[];
    types: string[];
    filename: string;
  };
}

export type ProcessDocumentResult =
  | { status: "success"; doc_type: "markdown"; data: string }
  | { status: "success"; doc_type: "chunks"; data: Chunk[] };

export interface ChunksResult {
  chunks: Chunk[];
  total_chunks: number;
  markdown: string;
}

export function createPdfClient(baseUrl: string = DEFAULT_PDF_SERVICE_URL) {
  const base = baseUrl.replace(/\/+$/, "");

  async function get<T>(path: string, source?: string): Promise<T> {
    const url = new URL(base + path);
    if (source !== undefined) url.searchParams.set("source", source);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`pdf service ${path} failed: ${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  }

  return {
    health: () => get<{ status: string; message: string }>("/"),
    /** Whole document as markdown. */
    getMarkdown: (source: string) => get<string>("/get-structured-data", source),
    /** Chunks with slim metadata + full markdown. */
    getChunks: (source: string) => get<ChunksResult>("/get-chunks", source),
    /** Recommended: markdown if small (<30k chars), otherwise chunks. */
    processDocument: (source: string) => get<ProcessDocumentResult>("/process-document", source),
  };
}

export type PdfClient = ReturnType<typeof createPdfClient>;
