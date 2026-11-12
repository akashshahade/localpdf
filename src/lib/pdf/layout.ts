"use client";

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "@cantoo/pdf-lib";
import { wrapText } from "@/lib/pdf/core";
import { TextPainter } from "@/lib/pdf/text";

export type Block =
  | { type: "h1" | "h2" | "h3" | "p" | "li" | "code" | "quote"; text: string; ordered?: number }
  | { type: "table"; rows: string[][] }
  | { type: "hr" }
  | { type: "pagebreak" };

type Opts = { size?: [number, number]; margin?: number; fontSize?: number; title?: string };

/** Lays out simple structured content onto pages with standard fonts. */
export async function layoutBlocks(blocks: Block[], opts: Opts = {}) {
  const doc = await PDFDocument.create();
  if (opts.title) doc.setTitle(opts.title);
  const [W, H] = opts.size ?? [595.28, 841.89];
  const M = opts.margin ?? 56;
  const base = opts.fontSize ?? 11;
  const fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    mono: await doc.embedFont(StandardFonts.Courier),
    italic: await doc.embedFont(StandardFonts.HelveticaOblique),
  };
  const ink = rgb(0.07, 0.07, 0.08);
  const muted = rgb(0.4, 0.4, 0.45);
  const maxW = W - M * 2;
  const text = new TextPainter(doc);

  let page: PDFPage = doc.addPage([W, H]);
  let y = H - M;
  const newPage = () => {
    page = doc.addPage([W, H]);
    y = H - M;
  };
  const ensure = (needed: number) => {
    if (y - needed < M) newPage();
  };
  const drawLines = async (lines: string[], font: PDFFont, size: number, x: number, color = ink, lead = 1.45) => {
    for (const line of lines) {
      ensure(size * lead);
      y -= size * lead;
      await text.draw(page, font, line, { x, y, size, color });
    }
  };

  for (const b of blocks) {
    if (b.type === "pagebreak") {
      if (y < H - M) newPage();
      continue;
    }
    if (b.type === "hr") {
      ensure(16);
      y -= 10;
      page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: rgb(0.85, 0.85, 0.87) });
      y -= 6;
      continue;
    }
    if (b.type === "table") {
      const cols = Math.max(...b.rows.map((r) => r.length), 1);
      const colW = maxW / cols;
      const size = Math.max(7, Math.min(base - 1, 10 - Math.max(0, cols - 6) * 0.4));
      y -= 6;
      for (const [ri, row] of b.rows.entries()) {
        const font = ri === 0 ? fonts.bold : fonts.regular;
        const cells = Array.from({ length: cols }, (_, ci) => wrapText(row[ci] ?? "", text.measure(font, size), colW - 8));
        const rowH = Math.max(...cells.map((c) => c.length)) * size * 1.35 + 8;
        ensure(rowH);
        if (ri === 0) page.drawRectangle({ x: M, y: y - rowH, width: maxW, height: rowH, color: rgb(0.96, 0.96, 0.97) });
        for (const [ci, lines] of cells.entries())
          for (const [li, line] of lines.entries())
            await text.draw(page, font, line, { x: M + ci * colW + 4, y: y - 4 - size - li * size * 1.35, size, color: ink });
        y -= rowH;
        page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.4, color: rgb(0.88, 0.88, 0.9) });
      }
      y -= 8;
      continue;
    }

    const style = {
      h1: { font: fonts.bold, size: base * 2, before: 14, after: 6, indent: 0 },
      h2: { font: fonts.bold, size: base * 1.5, before: 12, after: 4, indent: 0 },
      h3: { font: fonts.bold, size: base * 1.2, before: 10, after: 2, indent: 0 },
      p: { font: fonts.regular, size: base, before: 6, after: 0, indent: 0 },
      li: { font: fonts.regular, size: base, before: 3, after: 0, indent: 16 },
      code: { font: fonts.mono, size: base - 1.5, before: 6, after: 2, indent: 8 },
      quote: { font: fonts.italic, size: base, before: 6, after: 0, indent: 14 },
    }[b.type];
    if (!b.text.trim() && b.type !== "code") continue;
    y -= style.before;
    const width = maxW - style.indent;
    const lines =
      b.type === "code"
        ? b.text.split("\n").flatMap((l) => wrapText(l || " ", text.measure(style.font, style.size), width))
        : wrapText(b.text, text.measure(style.font, style.size), width);
    if (b.type === "li") {
      ensure(style.size * 1.45);
      const marker = b.ordered ? `${b.ordered}.` : "\u2022";
      page.drawText(marker, { x: M + 4, y: y - style.size * 1.45, size: style.size, font: fonts.regular, color: muted });
    }
    await drawLines(lines, style.font, style.size, M + style.indent, b.type === "quote" ? muted : ink);
    y -= style.after;
  }
  return doc;
}
