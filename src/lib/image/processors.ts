"use client";

import type { OutputFile, ToolOutput } from "@/components/tool/types";
import type { ProcessCtx } from "@/lib/pdf/processors";
import { zipFiles } from "@/lib/pdf/core";
import { addCaption, baseName, cleanSignature, drawInto, encodeJpeg, encodePng, kb, loadImage, makeCanvas, toPx, type Encoded, type Fit, type Unit } from "@/lib/image/photo";

type Processor = (ctx: ProcessCtx) => Promise<ToolOutput>;
type Spec = { w: number; h: number; minKB?: number; maxKB: number; dpi?: number };

// Typical published requirements. Notices change, so the result message always asks users to double-check.
const exams: Record<string, { label: string; photo: Spec; signature: Spec; caption?: boolean }> = {
  ssc: { label: "SSC", photo: { w: 350, h: 450, minKB: 20, maxKB: 50 }, signature: { w: 400, h: 200, minKB: 10, maxKB: 20 } },
  upsc: { label: "UPSC", photo: { w: 550, h: 550, minKB: 20, maxKB: 300 }, signature: { w: 700, h: 350, minKB: 20, maxKB: 300 }, caption: true },
  ibps: { label: "IBPS / SBI", photo: { w: 200, h: 230, minKB: 20, maxKB: 50 }, signature: { w: 140, h: 60, minKB: 10, maxKB: 20 } },
  nta: { label: "NTA (NEET, JEE, CUET)", photo: { w: 413, h: 531, minKB: 10, maxKB: 200 }, signature: { w: 400, h: 150, minKB: 4, maxKB: 30 } },
  pan: { label: "PAN card", photo: { w: 197, h: 276, maxKB: 50, dpi: 200 }, signature: { w: 354, h: 157, maxKB: 50, dpi: 200 } },
};

const str = (v: unknown) => String(v ?? "").trim();
const num = (v: unknown) => {
  const n = parseFloat(str(v).replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};
const step = (ctx: ProcessCtx, done: number, total: number) => {
  if (ctx.signal.aborted) throw new DOMException("Cancelled", "AbortError");
  ctx.progress(total ? done / total : 1);
};
const describe = (e: Encoded, dpi?: number) => `${e.width}\u00d7${e.height} px${dpi ? ` \u00b7 ${dpi} DPI` : ""} \u00b7 ${kb(e.bytes)}`;
const today = () => new Date().toLocaleDateString("en-GB");
const bundle = async (files: OutputFile[], zipName: string) => (files.length > 1 ? [await zipFiles(files, zipName)] : files);

const resizeToKb: Processor = async (ctx) => {
  const target = num(ctx.values.custom) ?? Number(ctx.values.target ?? 50);
  const files: OutputFile[] = [];
  let last: Encoded | undefined;
  for (const [i, f] of ctx.files.entries()) {
    const img = await loadImage(f.blob);
    const scale = Math.min(1, 3000 / Math.max(img.width, img.height));
    const canvas = drawInto(img, img.width * scale, img.height * scale, "stretch");
    last = await encodeJpeg(canvas, { maxBytes: target * 1024 });
    files.push({ name: `${baseName(f.name)}-${Math.round(target)}kb.jpg`, blob: last.blob });
    step(ctx, i + 1, ctx.files.length);
  }
  const message =
    files.length === 1 && last
      ? `${describe(last)} \u2014 under ${Math.round(target)} KB.${last.shrunk ? " The picture was made a little smaller to fit." : ""}`
      : `${files.length} images, each under ${Math.round(target)} KB.`;
  return { files: await bundle(files, `images-under-${Math.round(target)}kb.zip`), message };
};

const passportPhoto: Processor = async (ctx) => {
  const f = ctx.files[0];
  const [wMm, hMm] = str(ctx.values.size || "35x45").split("x").map(Number);
  const dpi = 300;
  const img = await loadImage(f.blob);
  const photo = drawInto(img, toPx(wMm, "mm", dpi), toPx(hMm, "mm", dpi), "cover");
  const layout = str(ctx.values.layout || "single");
  step(ctx, 1, 2);
  if (layout === "single") {
    const out = await encodeJpeg(photo, { maxBytes: num(ctx.values.maxKb) ? num(ctx.values.maxKb)! * 1024 : undefined, dpi });
    return { files: [{ name: `${baseName(f.name)}-passport-${wMm}x${hMm}mm.jpg`, blob: out.blob }], message: `${describe(out, dpi)} \u2014 ${wMm}\u00d7${hMm} mm when printed.` };
  }
  const [sw, sh] = layout === "a4" ? [toPx(210, "mm", dpi), toPx(297, "mm", dpi)] : [toPx(6, "in", dpi), toPx(4, "in", dpi)];
  const gap = toPx(2, "mm", dpi);
  const cols = Math.floor((sw - gap) / (photo.width + gap));
  const rows = Math.floor((sh - gap) / (photo.height + gap));
  const { canvas, c } = makeCanvas(sw, sh);
  const ox = (sw - (cols * photo.width + (cols - 1) * gap)) / 2;
  const oy = (sh - (rows * photo.height + (rows - 1) * gap)) / 2;
  c.strokeStyle = "#d4d4d8";
  c.lineWidth = 1;
  for (let r = 0; r < rows; r++)
    for (let k = 0; k < cols; k++) {
      const x = ox + k * (photo.width + gap);
      const y = oy + r * (photo.height + gap);
      c.drawImage(photo, x, y);
      c.strokeRect(x - 0.5, y - 0.5, photo.width + 1, photo.height + 1);
    }
  const out = await encodeJpeg(canvas, { dpi });
  step(ctx, 2, 2);
  return {
    files: [{ name: `${baseName(f.name)}-passport-sheet-${layout}.jpg`, blob: out.blob }],
    message: `${cols * rows} photos on a ${layout === "a4" ? "A4" : "4\u00d76 inch"} sheet at ${dpi} DPI. Print at 100% (actual size), then cut along the grey lines.`,
  };
};

const examResizer: Processor = async (ctx) => {
  const f = ctx.files[0];
  const exam = exams[str(ctx.values.exam) || "ssc"];
  const kind = str(ctx.values.kind) === "signature" ? "signature" : "photo";
  const spec = exam[kind];
  const name = str(ctx.values.name);
  const img = await loadImage(f.blob);
  let canvas = drawInto(img, spec.w, spec.h, kind === "photo" ? "cover" : "contain");
  if (kind === "photo" && name) canvas = addCaption(canvas, name.toUpperCase(), today());
  step(ctx, 1, 2);
  const out = await encodeJpeg(canvas, { maxBytes: spec.maxKB * 1024, minBytes: spec.minKB ? spec.minKB * 1024 : undefined, dpi: spec.dpi, keepSize: true });
  step(ctx, 2, 2);
  const range = spec.minKB ? `${spec.minKB}\u2013${spec.maxKB} KB` : `under ${spec.maxKB} KB`;
  const captionTip = exam.caption && kind === "photo" && !name ? " UPSC asks for your name and the photo date on the photo \u2014 add your name in the settings." : "";
  return {
    files: [{ name: `${baseName(f.name)}-${str(ctx.values.exam) || "ssc"}-${kind}.jpg`, blob: out.blob }],
    message: `${exam.label} ${kind}: ${describe(out, spec.dpi)} (target ${range}). Requirements change \u2014 check the official notice before you upload.${captionTip}`,
  };
};

const signatureCleaner: Processor = async (ctx) => {
  const f = ctx.files[0];
  const transparent = str(ctx.values.background) === "transparent";
  const img = await loadImage(f.blob);
  const canvas = cleanSignature(img, { ink: str(ctx.values.ink) || "#111111", transparent, strength: Number(ctx.values.strength ?? 50) / 100 });
  step(ctx, 1, 2);
  const out = transparent ? await encodePng(canvas) : await encodeJpeg(canvas);
  step(ctx, 2, 2);
  return {
    files: [{ name: `${baseName(f.name)}-signature.${transparent ? "png" : "jpg"}`, blob: out.blob }],
    message: `${describe(out)}. Need a smaller file? Continue with Resize image to KB or the exam presets.`,
  };
};

const resizeImage: Processor = async (ctx) => {
  const unit = (str(ctx.values.unit) || "px") as Unit;
  const dpi = Number(ctx.values.dpi ?? 300);
  const fit = (str(ctx.values.fit) || "cover") as Fit;
  const wIn = num(ctx.values.width);
  const hIn = num(ctx.values.height);
  if (!wIn && !hIn) throw new Error("Enter a width, a height or both.");
  const png = str(ctx.values.format) === "png";
  const files: OutputFile[] = [];
  let last: Encoded | undefined;
  for (const [i, f] of ctx.files.entries()) {
    const img = await loadImage(f.blob);
    const w = wIn ? toPx(wIn, unit, dpi) : Math.round((toPx(hIn!, unit, dpi) * img.width) / img.height);
    const h = hIn ? toPx(hIn, unit, dpi) : Math.round((toPx(wIn!, unit, dpi) * img.height) / img.width);
    if (w > 12000 || h > 12000) throw new Error("That size is too large. Check the unit (px, cm, mm or inch).");
    const canvas = drawInto(img, w, h, fit, png && fit === "contain" ? null : "#ffffff");
    last = png ? await encodePng(canvas) : await encodeJpeg(canvas, { dpi });
    files.push({ name: `${baseName(f.name)}-${w}x${h}.${png ? "png" : "jpg"}`, blob: last.blob });
    step(ctx, i + 1, ctx.files.length);
  }
  return { files: await bundle(files, "resized-images.zip"), message: files.length === 1 && last ? describe(last, png ? undefined : dpi) : `${files.length} images resized.` };
};

const nameDate: Processor = async (ctx) => {
  const f = ctx.files[0];
  const name = str(ctx.values.name);
  if (!name) throw new Error("Enter the name to print on the photo.");
  const img = await loadImage(f.blob);
  const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
  const canvas = addCaption(drawInto(img, img.width * scale, img.height * scale, "stretch"), name.toUpperCase(), str(ctx.values.date) || today());
  step(ctx, 1, 2);
  const out = await encodeJpeg(canvas, { maxBytes: num(ctx.values.maxKb) ? num(ctx.values.maxKb)! * 1024 : undefined });
  step(ctx, 2, 2);
  return { files: [{ name: `${baseName(f.name)}-name-date.jpg`, blob: out.blob }], message: describe(out) };
};

const joinPhotoSignature: Processor = async (ctx) => {
  const [photoFile, signFile] = ctx.files;
  const width = Math.round(num(ctx.values.width) ?? 300);
  const photo = await loadImage(photoFile.blob);
  const sign = await loadImage(signFile.blob);
  const ph = Math.round((width * photo.height) / photo.width);
  const sh = Math.min(Math.round((width * sign.height) / sign.width), Math.round(width * 0.45));
  const gap = Math.max(4, Math.round(width * 0.03));
  const { canvas, c } = makeCanvas(width, ph + gap + sh);
  c.drawImage(photo, 0, 0, width, ph);
  c.drawImage(drawInto(sign, width, sh, "contain"), 0, ph + gap);
  step(ctx, 1, 2);
  const out = await encodeJpeg(canvas, { maxBytes: num(ctx.values.maxKb) ? num(ctx.values.maxKb)! * 1024 : undefined });
  step(ctx, 2, 2);
  return { files: [{ name: "photo-and-signature.jpg", blob: out.blob }], message: `${describe(out)}. The first image is placed on top \u2014 reorder the files to swap them.` };
};

export const imageProcessors: Record<string, Processor> = {
  "resize-image-to-kb": resizeToKb,
  "passport-size-photo": passportPhoto,
  "exam-photo-signature-resizer": examResizer,
  "signature-cleaner": signatureCleaner,
  "resize-image": resizeImage,
  "name-date-on-photo": nameDate,
  "join-photo-signature": joinPhotoSignature,
};
