"use client";

import { canvasToBlob } from "@/lib/pdf/pdfjs";

export type Unit = "px" | "mm" | "cm" | "in";
export type Fit = "cover" | "contain" | "stretch";

export async function loadImage(blob: Blob) {
  try {
    return await createImageBitmap(blob, { imageOrientation: "from-image" });
  } catch {
    throw new Error("This image can't be opened by your browser. Try a JPG or PNG.");
  }
}

export const toPx = (value: number, unit: Unit, dpi: number) =>
  Math.max(1, Math.round(unit === "px" ? value : unit === "mm" ? (value / 25.4) * dpi : unit === "cm" ? (value / 2.54) * dpi : value * dpi));

export function makeCanvas(w: number, h: number, bg: string | null = "#ffffff") {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  const c = canvas.getContext("2d", { willReadFrequently: true })!;
  if (bg) {
    c.fillStyle = bg;
    c.fillRect(0, 0, canvas.width, canvas.height);
  }
  c.imageSmoothingQuality = "high";
  return { canvas, c };
}

/** Draws the image into a w×h box. Cover crops to fill (slightly favouring the top, where faces are). */
export function drawInto(src: CanvasImageSource & { width: number; height: number }, w: number, h: number, fit: Fit = "cover", bg: string | null = "#ffffff") {
  const { canvas, c } = makeCanvas(w, h, bg);
  if (fit === "stretch") {
    c.drawImage(src, 0, 0, canvas.width, canvas.height);
    return canvas;
  }
  const scale = fit === "cover" ? Math.max(canvas.width / src.width, canvas.height / src.height) : Math.min(canvas.width / src.width, canvas.height / src.height);
  const dw = src.width * scale;
  const dh = src.height * scale;
  const dy = fit === "cover" ? Math.min(0, (canvas.height - dh) * 0.35) : (canvas.height - dh) / 2;
  c.drawImage(src, (canvas.width - dw) / 2, dy, dw, dh);
  return canvas;
}

export function scaleCanvas(src: HTMLCanvasElement, factor: number) {
  const { canvas, c } = makeCanvas(src.width * factor, src.height * factor);
  c.drawImage(src, 0, 0, canvas.width, canvas.height);
  return canvas;
}

const bytes = async (blob: Blob) => new Uint8Array(await blob.arrayBuffer());

/** Writes the print resolution into the JPEG's JFIF header (portals and printers read it). */
export function setJpegDpi(data: Uint8Array, dpi: number) {
  const isJfif = data[2] === 0xff && data[3] === 0xe0 && String.fromCharCode(...data.subarray(6, 10)) === "JFIF";
  if (!isJfif) return data;
  data[13] = 1;
  data[14] = dpi >> 8;
  data[15] = dpi & 255;
  data[16] = dpi >> 8;
  data[17] = dpi & 255;
  return data;
}

/** Portals with a minimum size reject very small files; a JPEG comment block adds bytes without changing the picture. */
export function padJpeg(data: Uint8Array, minBytes: number) {
  const missing = minBytes - data.length;
  if (missing <= 0) return data;
  const segments: Uint8Array[] = [];
  let left = missing + 64;
  while (left > 0) {
    const payload = Math.min(left, 65_000);
    const seg = new Uint8Array(payload + 4);
    seg[0] = 0xff;
    seg[1] = 0xfe;
    seg[2] = (payload + 2) >> 8;
    seg[3] = (payload + 2) & 255;
    segments.push(seg);
    left -= payload;
  }
  const out = new Uint8Array(data.length + segments.reduce((s, x) => s + x.length, 0));
  out.set(data.subarray(0, 2), 0);
  let o = 2;
  for (const s of segments) {
    out.set(s, o);
    o += s.length;
  }
  out.set(data.subarray(2), o);
  return out;
}

export type Encoded = { blob: Blob; width: number; height: number; bytes: number; shrunk: boolean };

/** Encodes as JPEG at the best quality that fits maxBytes, shrinking the picture only if quality alone isn't enough. */
export async function encodeJpeg(src: HTMLCanvasElement, o: { maxBytes?: number; minBytes?: number; dpi?: number; keepSize?: boolean } = {}): Promise<Encoded> {
  const jpeg = async (canvas: HTMLCanvasElement, q: number): Promise<Uint8Array> => bytes(await canvasToBlob(canvas, "image/jpeg", q));
  let canvas = src;
  let out = await jpeg(canvas, 0.92);
  let shrunk = false;
  if (o.maxBytes && out.length > o.maxBytes) {
    for (let attempt = 0; attempt < 12; attempt++) {
      const floor = await jpeg(canvas, 0.12);
      if (floor.length <= o.maxBytes) {
        let lo = 0.12;
        let hi = 0.92;
        out = floor;
        for (let i = 0; i < 7; i++) {
          const mid = (lo + hi) / 2;
          const b = await jpeg(canvas, mid);
          if (b.length <= o.maxBytes) {
            out = b;
            lo = mid;
          } else hi = mid;
        }
        break;
      }
      if (o.keepSize) {
        out = floor;
        break;
      }
      canvas = scaleCanvas(canvas, 0.85);
      shrunk = true;
      out = floor;
    }
  }
  if (o.minBytes) out = padJpeg(out, o.minBytes);
  if (o.dpi) out = setJpegDpi(out, o.dpi);
  return { blob: new Blob([out as BlobPart], { type: "image/jpeg" }), width: canvas.width, height: canvas.height, bytes: out.length, shrunk };
}

export async function encodePng(canvas: HTMLCanvasElement): Promise<Encoded> {
  const blob = await canvasToBlob(canvas, "image/png");
  return { blob, width: canvas.width, height: canvas.height, bytes: blob.size, shrunk: false };
}

/** Adds a white strip under the photo with the name and date, as some exam forms require. */
export function addCaption(src: HTMLCanvasElement, name: string, date: string) {
  const strip = Math.max(28, Math.round(src.height * 0.17));
  const { canvas, c } = makeCanvas(src.width, src.height + strip);
  c.drawImage(src, 0, 0);
  c.fillStyle = "#111111";
  c.textAlign = "center";
  c.textBaseline = "middle";
  const lines = [name, date].filter(Boolean);
  const lineH = strip / (lines.length + 0.6);
  lines.forEach((text, i) => {
    let size = Math.round(lineH * 0.78);
    c.font = `${i === 0 ? 700 : 500} ${size}px Arial, "Nirmala UI", "Noto Sans", sans-serif`;
    while (size > 6 && c.measureText(text).width > canvas.width * 0.92) {
      size -= 1;
      c.font = `${i === 0 ? 700 : 500} ${size}px Arial, "Nirmala UI", "Noto Sans", sans-serif`;
    }
    c.fillText(text, canvas.width / 2, src.height + lineH * (i + 0.8));
  });
  return canvas;
}

/** Turns a phone photo of a signature into clean ink on white (or transparent), cropped to the ink. */
export function cleanSignature(img: ImageBitmap, o: { ink: string; transparent: boolean; strength: number }) {
  const scale = Math.min(1, 2000 / Math.max(img.width, img.height));
  const W = Math.round(img.width * scale);
  const H = Math.round(img.height * scale);
  const { canvas: src, c: sc } = makeCanvas(W, H);
  sc.drawImage(img, 0, 0, W, H);
  // A heavily downscaled copy approximates the paper's lighting, so shadows don't turn into ink.
  const tiny = makeCanvas(Math.max(1, Math.round(W / 40)), Math.max(1, Math.round(H / 40)));
  tiny.c.drawImage(src, 0, 0, tiny.canvas.width, tiny.canvas.height);
  const { c: bc } = makeCanvas(W, H);
  bc.imageSmoothingEnabled = true;
  bc.drawImage(tiny.canvas, 0, 0, W, H);

  const px = sc.getImageData(0, 0, W, H);
  const bg = bc.getImageData(0, 0, W, H).data;
  const ink = parseInt(o.ink.slice(1), 16);
  const [ir, ig, ib] = [(ink >> 16) & 255, (ink >> 8) & 255, ink & 255];
  const cut = 0.68 + o.strength * 0.2;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let i = 0, p = 0; i < px.data.length; i += 4, p++) {
    const d = px.data;
    const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const b = 0.299 * bg[i] + 0.587 * bg[i + 1] + 0.114 * bg[i + 2] + 1;
    const a = Math.min(1, Math.max(0, (cut - l / b) / 0.18));
    if (a > 0.35) {
      const x = p % W;
      const y = (p / W) | 0;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
    if (o.transparent) {
      d[i] = ir;
      d[i + 1] = ig;
      d[i + 2] = ib;
      d[i + 3] = Math.round(a * 255);
    } else {
      d[i] = Math.round(255 - (255 - ir) * a);
      d[i + 1] = Math.round(255 - (255 - ig) * a);
      d[i + 2] = Math.round(255 - (255 - ib) * a);
      d[i + 3] = 255;
    }
  }
  if (x1 < 0) throw new Error("No signature was found. Use dark ink on plain paper and a well-lit photo.");
  sc.putImageData(px, 0, 0);
  const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.06) + 4;
  x0 = Math.max(0, x0 - pad);
  y0 = Math.max(0, y0 - pad);
  x1 = Math.min(W - 1, x1 + pad);
  y1 = Math.min(H - 1, y1 + pad);
  const { canvas, c } = makeCanvas(x1 - x0 + 1, y1 - y0 + 1, o.transparent ? null : "#ffffff");
  c.drawImage(src, x0, y0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export const kb = (n: number) => `${Math.max(1, Math.round(n / 1024))} KB`;
export const baseName = (name: string) => name.replace(/\.[^.]+$/, "") || "image";
