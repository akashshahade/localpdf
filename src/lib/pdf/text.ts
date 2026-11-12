"use client";

import { degrees, type Color, type PDFDocument, type PDFFont, type PDFImage, type PDFPage } from "@cantoo/pdf-lib";

// Standard PDF fonts only cover Latin. Text in Hindi, Tamil, Bengali and other scripts is drawn by the browser
// (which shapes conjuncts and matras correctly with the device's fonts) and placed as a crisp image instead.

const ASCENT = 1.15;
const DESCENT = 0.45;
const SCALE = 4;

export const normalize = (text: string) => text.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\u2026/g, "...");

function cssFont(font: PDFFont, px: number) {
  const name = font.name;
  const family = /Times/.test(name)
    ? '"Times New Roman", Times, "Noto Serif", "Noto Serif Devanagari", serif'
    : /Courier/.test(name)
      ? '"Courier New", Courier, "Noto Sans Mono", monospace'
      : 'Helvetica, Arial, "Noto Sans", "Nirmala UI", "Noto Sans Devanagari", sans-serif';
  const weight = /Bold/.test(name) ? "700" : "400";
  const style = /Oblique|Italic/.test(name) ? "italic" : "normal";
  return `${style} ${weight} ${px}px ${family}`;
}

const cssColor = (c: Color) => {
  const { red = 0, green = 0, blue = 0 } = c as { red?: number; green?: number; blue?: number };
  return `rgb(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)})`;
};

let probe: CanvasRenderingContext2D | null = null;
const measureCtx = () => (probe ??= document.createElement("canvas").getContext("2d")!);

export class TextPainter {
  private images = new Map<string, PDFImage>();
  private charsets = new Map<PDFFont, Set<number>>();

  constructor(private doc: PDFDocument) {}

  /** True when the standard font can draw every character as real (selectable) text. */
  fits(font: PDFFont, text: string) {
    let set = this.charsets.get(font);
    if (!set) this.charsets.set(font, (set = new Set(font.getCharacterSet())));
    for (const ch of normalize(text)) if (ch !== "\n" && !set.has(ch.codePointAt(0)!)) return false;
    return true;
  }

  width(font: PDFFont, text: string, size: number) {
    if (this.fits(font, text)) return font.widthOfTextAtSize(normalize(text), size);
    const c = measureCtx();
    c.font = cssFont(font, size);
    return c.measureText(text).width;
  }

  measure(font: PDFFont, size: number) {
    return (text: string) => this.width(font, text, size);
  }

  /** Draws one line with its baseline at (x, y), like page.drawText. */
  async draw(page: PDFPage, font: PDFFont, text: string, o: { x: number; y: number; size: number; color: Color; opacity?: number; rotate?: number }) {
    if (!text) return;
    if (this.fits(font, text)) {
      page.drawText(normalize(text), { x: o.x, y: o.y, size: o.size, font, color: o.color, opacity: o.opacity, rotate: o.rotate ? degrees(o.rotate) : undefined });
      return;
    }
    const w = this.width(font, text, o.size);
    const h = o.size * (ASCENT + DESCENT);
    const key = `${font.name}|${o.size}|${cssColor(o.color)}|${text}`;
    let image = this.images.get(key);
    if (!image) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.ceil(w * SCALE));
      canvas.height = Math.ceil(h * SCALE);
      const c = canvas.getContext("2d")!;
      c.font = cssFont(font, o.size * SCALE);
      c.fillStyle = cssColor(o.color);
      c.textBaseline = "alphabetic";
      c.fillText(text, 0, o.size * ASCENT * SCALE);
      image = await this.doc.embedPng(canvas.toDataURL("image/png"));
      this.images.set(key, image);
    }
    const a = ((o.rotate ?? 0) * Math.PI) / 180;
    const drop = o.size * DESCENT;
    page.drawImage(image, {
      x: o.x + drop * Math.sin(a),
      y: o.y - drop * Math.cos(a),
      width: w,
      height: h,
      opacity: o.opacity,
      rotate: o.rotate ? degrees(o.rotate) : undefined,
    });
  }
}
