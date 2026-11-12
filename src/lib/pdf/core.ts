"use client";

import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFRef,
  rgb,
  type PDFPage,
} from "@cantoo/pdf-lib";
import { zipSync } from "fflate";
import type { PDFDocumentProxy, PageViewport } from "pdfjs-dist";
import { PasswordRequiredError, canvasToBlob, renderPage } from "@/lib/pdf/pdfjs";
import type { OutputFile } from "@/components/tool/types";

export async function bytesOf(blob: Blob) {
  return new Uint8Array(await blob.arrayBuffer());
}

export async function loadPdf(blob: Blob, password?: string) {
  const bytes = await bytesOf(blob);
  try {
    return await PDFDocument.load(bytes, { password, updateMetadata: false, throwOnInvalidObject: false });
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    if (/encrypt|password/i.test(msg)) {
      throw password ? new Error("That password didn't work. Check it and try again.") : new PasswordRequiredError();
    }
    throw new Error("This file couldn't be read as a PDF. It may be damaged — try Repair PDF.");
  }
}

export async function pdfBlob(doc: PDFDocument) {
  const bytes = await doc.save({ useObjectStreams: true });
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

export function baseName(name: string) {
  return name.replace(/\.[^.]+$/, "") || "document";
}

export function hexColor(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

export function wrapText(text: string, measure: (s: string) => number, maxWidth: number) {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      if (!word) continue;
      const test = line ? `${line} ${word}` : word;
      if (measure(test) <= maxWidth) {
        line = test;
        continue;
      }
      if (line) out.push(line);
      if (measure(word) <= maxWidth) {
        line = word;
      } else {
        let chunk = "";
        for (const ch of word) {
          if (measure(chunk + ch) > maxWidth) {
            out.push(chunk);
            chunk = ch;
          } else chunk += ch;
        }
        line = chunk;
      }
    }
    out.push(line);
  }
  return out;
}

export type RasterDraw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, viewport: PageViewport) => void | Promise<void>;

/**
 * Rebuilds a PDF where the chosen pages become images (so anything drawn over them is permanent and the
 * original text underneath is gone). Other pages are copied unchanged.
 */
export async function rasterizePages(
  source: PDFDocument,
  view: PDFDocumentProxy,
  pages: Map<number, RasterDraw | null>,
  opts: { scale?: number; filter?: string; onPage?: (n: number) => void; quality?: number } = {},
) {
  const out = await PDFDocument.create();
  const total = source.getPageCount();
  for (let n = 1; n <= total; n++) {
    if (!pages.has(n)) {
      const [copied] = await out.copyPages(source, [n - 1]);
      out.addPage(copied);
    } else {
      const { canvas, viewport } = await renderPage(view, n, { scale: opts.scale ?? 2 });
      let target = canvas;
      if (opts.filter) {
        target = document.createElement("canvas");
        target.width = canvas.width;
        target.height = canvas.height;
        const t = target.getContext("2d")!;
        t.filter = opts.filter;
        t.drawImage(canvas, 0, 0);
      }
      const draw = pages.get(n);
      if (draw) await draw(target.getContext("2d")!, target, viewport);
      const jpg = await out.embedJpg(await bytesOf(await canvasToBlob(target, "image/jpeg", opts.quality ?? 0.9)));
      const w = viewport.width / viewport.scale;
      const h = viewport.height / viewport.scale;
      const page = out.addPage([w, h]);
      page.drawImage(jpg, { x: 0, y: 0, width: w, height: h });
    }
    opts.onPage?.(n);
  }
  return out;
}

/** Adds a flat list of bookmarks (title → first page index). */
export function addBookmarks(doc: PDFDocument, marks: { title: string; page: number }[]) {
  if (!marks.length) return;
  const ctx = doc.context;
  const pages = doc.getPages();
  const outlinesRef = ctx.nextRef();
  const refs = marks.map(() => ctx.nextRef());
  marks.forEach((m, i) => {
    const dict = ctx.obj({});
    dict.set(PDFName.of("Title"), PDFHexString.fromText(m.title));
    dict.set(PDFName.of("Parent"), outlinesRef);
    const dest = PDFArray.withContext(ctx);
    dest.push(pages[m.page].ref);
    dest.push(PDFName.of("Fit"));
    dict.set(PDFName.of("Dest"), dest);
    if (i > 0) dict.set(PDFName.of("Prev"), refs[i - 1]);
    if (i < refs.length - 1) dict.set(PDFName.of("Next"), refs[i + 1]);
    ctx.assign(refs[i], dict);
  });
  const outlines = ctx.obj({}) as PDFDict;
  outlines.set(PDFName.of("Type"), PDFName.of("Outlines"));
  outlines.set(PDFName.of("First"), refs[0]);
  outlines.set(PDFName.of("Last"), refs[refs.length - 1]);
  outlines.set(PDFName.of("Count"), PDFNumber.of(refs.length));
  ctx.assign(outlinesRef, outlines);
  doc.catalog.set(PDFName.of("Outlines"), outlinesRef as PDFRef);
  doc.catalog.set(PDFName.of("PageMode"), PDFName.of("UseOutlines"));
}

export function zipFiles(files: OutputFile[], zipName: string): Promise<OutputFile> {
  return Promise.all(files.map(async (f) => [f.name, await bytesOf(f.blob)] as const)).then((entries) => {
    const used = new Map<string, number>();
    const data: Record<string, Uint8Array> = {};
    for (const [name, bytes] of entries) {
      const count = used.get(name) ?? 0;
      used.set(name, count + 1);
      data[count ? name.replace(/(\.[^.]+)?$/, ` (${count + 1})$1`) : name] = bytes;
    }
    const zipped = zipSync(data, { level: 0 });
    return { name: zipName, blob: new Blob([zipped as BlobPart], { type: "application/zip" }) };
  });
}

export function pageSizeFor(choice: string, fallback: [number, number]): [number, number] {
  if (choice === "a4") return [595.28, 841.89];
  if (choice === "letter") return [612, 792];
  return fallback;
}

export function mm(n: number) {
  return (n * 72) / 25.4;
}

export function fitInto(w: number, h: number, boxW: number, boxH: number) {
  const s = Math.min(boxW / w, boxH / h);
  return { width: w * s, height: h * s };
}

export type { PDFPage };
