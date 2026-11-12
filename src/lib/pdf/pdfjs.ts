"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";

type PdfJs = typeof import("pdfjs-dist");
let lib: PdfJs | null = null;

export async function pdfjs(): Promise<PdfJs> {
  if (!lib) {
    lib = await import("pdfjs-dist");
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }
  return lib;
}

export class PasswordRequiredError extends Error {
  constructor(message = "This PDF is password-protected. Remove the password first with Remove password.") {
    super(message);
  }
}

/** pdf.js transfers the buffer to its worker, so always hand it a copy. */
export async function openPdf(bytes: Uint8Array, password?: string): Promise<PDFDocumentProxy> {
  const p = await pdfjs();
  try {
    return await p.getDocument({ data: bytes.slice(), password }).promise;
  } catch (e) {
    if ((e as { name?: string })?.name === "PasswordException") throw new PasswordRequiredError();
    throw new Error("This file couldn't be read as a PDF. It may be damaged — try Repair PDF.");
  }
}

export async function renderPage(
  doc: PDFDocumentProxy,
  pageNumber: number,
  opts: { scale?: number; width?: number; annotations?: boolean } = {},
) {
  const p = await pdfjs();
  const page = await doc.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const scale = opts.width ? opts.width / base.width : (opts.scale ?? 1);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({
    canvas,
    canvasContext: ctx,
    viewport,
    annotationMode: opts.annotations === false ? p.AnnotationMode.DISABLE : p.AnnotationMode.ENABLE_FORMS,
  }).promise;
  return { canvas, viewport, page };
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/jpeg", quality = 0.92) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't encode image"))), type, quality),
  );
}

export type TextLine = { text: string; y: number; x: number; height: number; items: TextItemBox[] };
export type TextItemBox = { str: string; x: number; y: number; w: number; h: number; start: number; end: number };

/** Text grouped into lines, in viewport (top-left origin) coordinates at the given scale. */
export async function pageLines(doc: PDFDocumentProxy, pageNumber: number, scale = 1): Promise<TextLine[]> {
  const p = await pdfjs();
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const content = await page.getTextContent();
  const boxes: Omit<TextItemBox, "start" | "end">[] = [];
  for (const item of content.items) {
    if (!("str" in item) || !item.str.trim()) continue;
    const tx = p.Util.transform(viewport.transform, item.transform);
    const h = Math.hypot(tx[2], tx[3]) || 10 * scale;
    boxes.push({ str: item.str, x: tx[4], y: tx[5] - h, w: item.width * scale, h });
  }
  boxes.sort((a, b) => a.y - b.y || a.x - b.x);
  const lines: TextLine[] = [];
  for (const b of boxes) {
    const line = lines.find((l) => Math.abs(l.y - b.y) < Math.max(3, b.h * 0.5));
    if (line) line.items.push({ ...b, start: 0, end: 0 });
    else lines.push({ text: "", y: b.y, x: b.x, height: b.h, items: [{ ...b, start: 0, end: 0 }] });
  }
  for (const l of lines) {
    l.items.sort((a, b) => a.x - b.x);
    let text = "";
    for (const it of l.items) {
      if (text && !text.endsWith(" ")) text += " ";
      it.start = text.length;
      text += it.str;
      it.end = text.length;
    }
    l.text = text;
    l.x = l.items[0].x;
    l.height = Math.max(...l.items.map((i) => i.h));
  }
  return lines.sort((a, b) => a.y - b.y);
}

export async function documentText(doc: PDFDocumentProxy, onPage?: (n: number) => void) {
  const pages: string[][] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const lines = await pageLines(doc, n);
    pages.push(lines.map((l) => l.text));
    onPage?.(n);
  }
  return pages;
}
