"use client";

import {
  BlendMode,
  LineCapStyle,
  PDFArray,
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFName,
  PDFNumber,
  PDFOptionList,
  PDFRadioGroup,
  PDFRawStream,
  PDFTextField,
  StandardFonts,
  decodePDFRawStream,
  degrees,
  rgb,
  type PDFFont,
  type PDFPage,
} from "@cantoo/pdf-lib";
import {
  addBookmarks,
  baseName,
  bytesOf,
  fitInto,
  hexColor,
  loadPdf,
  mm,
  pageSizeFor,
  pdfBlob,
  rasterizePages,
  zipFiles,
  type RasterDraw,
} from "@/lib/pdf/core";
import { canvasToBlob, documentText, openPdf, pageLines, renderPage, type TextLine } from "@/lib/pdf/pdfjs";
import { layoutBlocks, type Block } from "@/lib/pdf/layout";
import { epubToBlocks, htmlToBlocks, markdownToBlocks, parseCsv, readXlsx, textToBlocks, writeXlsx } from "@/lib/pdf/convert";
import { baselineRatio, checkPoints, polyPath, strokePath } from "@/lib/pdf/ink";
import { TextPainter } from "@/lib/pdf/text";
import { imageProcessors } from "@/lib/image/processors";
import type { EditorItem, FontFamily, FormFieldValue, InputFile, OptionValues, OutputFile, PageItem, ToolOutput } from "@/components/tool/types";
import type { Tool } from "@/lib/tools";

export type ProcessCtx = {
  tool: Tool;
  files: InputFile[];
  values: OptionValues;
  pages: PageItem[];
  selected: Set<string>;
  edits: EditorItem[];
  form: Record<string, FormFieldValue>;
  progress: (fraction: number, label?: string) => void;
  signal: AbortSignal;
};

type Processor = (ctx: ProcessCtx) => Promise<ToolOutput>;

const pdf = (name: string, blob: Blob): OutputFile => ({ name, blob });
const step = (ctx: ProcessCtx, done: number, total: number, label?: string) => {
  if (ctx.signal.aborted) throw new DOMException("Cancelled", "AbortError");
  ctx.progress(total ? done / total : 1, label);
};
const many = async (files: OutputFile[], zipName: string): Promise<OutputFile[]> => (files.length > 1 ? [await zipFiles(files, zipName)] : files);
const first = (ctx: ProcessCtx) => ctx.files[0];
const str = (v: unknown) => String(v ?? "").trim();

async function copyAll(target: PDFDocument, src: PDFDocument, indices = src.getPageIndices()) {
  const pages = await target.copyPages(src, indices);
  pages.forEach((p) => target.addPage(p));
  return pages;
}

function parseRanges(text: string, total: number) {
  const groups: number[][] = [];
  for (const part of text.split(",").map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)\s*(?:-\s*(\d+|end))?$/i);
    if (!m) throw new Error(`"${part}" isn't a valid page range. Use something like 1-3, 5, 8-12.`);
    const a = Number(m[1]);
    const b = m[2] ? (m[2].toLowerCase() === "end" ? total : Number(m[2])) : a;
    if (a < 1 || b > total || a > b) throw new Error(`Range "${part}" is outside this ${total}-page document.`);
    groups.push(Array.from({ length: b - a + 1 }, (_, i) => a - 1 + i));
  }
  if (!groups.length) throw new Error("Enter at least one page range.");
  return groups;
}

// ---------- Organize ----------

const merge: Processor = async (ctx) => {
  const out = await PDFDocument.create();
  const marks: { title: string; page: number }[] = [];
  for (const [i, f] of ctx.files.entries()) {
    const src = await loadPdf(f.blob);
    marks.push({ title: baseName(f.name), page: out.getPageCount() });
    await copyAll(out, src);
    step(ctx, i + 1, ctx.files.length, `Adding ${f.name}`);
  }
  if (ctx.values.normalize) {
    const [W, H] = [out.getPage(0).getWidth(), out.getPage(0).getHeight()];
    for (const p of out.getPages()) {
      const { width: w, height: h } = p.getSize();
      if (Math.abs(w - W) < 1 && Math.abs(h - H) < 1) continue;
      const s = Math.min(W / w, H / h);
      p.scaleContent(s, s);
      p.setSize(W, H);
      p.translateContent((W - w * s) / 2, (H - h * s) / 2);
    }
  }
  if (ctx.values.bookmarks) addBookmarks(out, marks);
  return { files: [pdf("merged.pdf", await pdfBlob(out))] };
};

const alternateMix: Processor = async (ctx) => {
  const docs = await Promise.all(ctx.files.map((f) => loadPdf(f.blob)));
  const orders = docs.map((d, i) => (i === 1 && ctx.values.reverse ? d.getPageIndices().reverse() : d.getPageIndices()));
  const out = await PDFDocument.create();
  const max = Math.max(...orders.map((o) => o.length));
  for (let i = 0; i < max; i++) {
    for (const [d, order] of orders.entries()) if (order[i] !== undefined) await copyAll(out, docs[d], [order[i]]);
    step(ctx, i + 1, max);
  }
  return { files: [pdf("mixed.pdf", await pdfBlob(out))] };
};

const split: Processor = async (ctx) => {
  const f = first(ctx);
  const src = await loadPdf(f.blob);
  const total = src.getPageCount();
  const groups = ctx.values.mode === "every" ? src.getPageIndices().map((i) => [i]) : parseRanges(str(ctx.values.ranges), total);
  const files: OutputFile[] = [];
  for (const [i, g] of groups.entries()) {
    const out = await PDFDocument.create();
    await copyAll(out, src, g);
    const label = g.length === 1 ? `page-${g[0] + 1}` : `pages-${g[0] + 1}-${g[g.length - 1] + 1}`;
    files.push(pdf(`${baseName(f.name)}-${label}.pdf`, await pdfBlob(out)));
    step(ctx, i + 1, groups.length);
  }
  return { files: await many(files, `${baseName(f.name)}-split.zip`), message: `Split into ${files.length} files.` };
};

const fromPageItems = async (ctx: ProcessCtx, keep: (p: PageItem) => boolean, extraRotation: (p: PageItem) => number, suffix: string) => {
  const f = first(ctx);
  const src = await loadPdf(f.blob);
  const kept = ctx.pages.filter(keep);
  if (!kept.length) throw new Error("Keep at least one page.");
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, kept.map((p) => p.n - 1));
  copied.forEach((page, i) => {
    const r = kept[i].rotation + extraRotation(kept[i]);
    if (r) page.setRotation(degrees((((page.getRotation().angle + r) % 360) + 360) % 360));
    out.addPage(page);
  });
  step(ctx, 1, 1);
  return { files: [pdf(`${baseName(f.name)}-${suffix}.pdf`, await pdfBlob(out))] };
};

const organize: Processor = (ctx) => fromPageItems(ctx, (p) => !p.deleted, () => 0, "organized");
const rotate: Processor = (ctx) =>
  fromPageItems(ctx, () => true, (p) => (!ctx.selected.size || ctx.selected.has(p.id) ? Number(ctx.values.angle) : 0), "rotated");
const deletePages: Processor = (ctx) => fromPageItems(ctx, (p) => !ctx.selected.has(p.id), () => 0, "edited");
const extract: Processor = (ctx) => fromPageItems(ctx, (p) => ctx.selected.has(p.id), () => 0, "extract");

const crop: Processor = async (ctx) => {
  const f = first(ctx);
  const src = await loadPdf(f.blob);
  const margin = mm(Number(ctx.values.margin ?? 0));
  if (ctx.values.pageSize === "fit") {
    for (const p of src.getPages()) {
      const { x, y, width, height } = p.getMediaBox();
      const box = [x + margin, y + margin, Math.max(36, width - margin * 2), Math.max(36, height - margin * 2)] as const;
      p.setMediaBox(...box);
      p.setCropBox(...box);
    }
    return { files: [pdf(`${baseName(f.name)}-cropped.pdf`, await pdfBlob(src))] };
  }
  const out = await PDFDocument.create();
  const embedded = await out.embedPages(src.getPages());
  embedded.forEach((e, i) => {
    const portrait = e.height >= e.width;
    const [a, b] = pageSizeFor(String(ctx.values.pageSize), [e.width, e.height]);
    const [W, H] = portrait ? [a, b] : [b, a];
    const page = out.addPage([W, H]);
    const size = fitInto(e.width, e.height, W - margin * 2, H - margin * 2);
    page.drawPage(e, { x: (W - size.width) / 2, y: (H - size.height) / 2, ...size });
    step(ctx, i + 1, embedded.length);
  });
  return { files: [pdf(`${baseName(f.name)}-resized.pdf`, await pdfBlob(out))] };
};

const pagesPerSheet: Processor = async (ctx) => {
  const f = first(ctx);
  const src = await loadPdf(f.blob);
  const n = Number(ctx.values.perSheet);
  const [cols, rows, landscape] = ({ 2: [2, 1, true], 4: [2, 2, false], 6: [3, 2, true], 9: [3, 3, false] } as Record<number, [number, number, boolean]>)[n];
  const [a, b] = pageSizeFor(String(ctx.values.pageSize) === "fit" ? "a4" : String(ctx.values.pageSize), [595.28, 841.89]);
  const [W, H] = landscape ? [b, a] : [a, b];
  const out = await PDFDocument.create();
  const embedded = await out.embedPages(src.getPages());
  const gap = 12;
  const cw = (W - gap * (cols + 1)) / cols;
  const ch = (H - gap * (rows + 1)) / rows;
  for (let i = 0; i < embedded.length; i += n) {
    const sheet = out.addPage([W, H]);
    embedded.slice(i, i + n).forEach((e, j) => {
      const c = j % cols;
      const r = Math.floor(j / cols);
      const size = fitInto(e.width, e.height, cw, ch);
      sheet.drawPage(e, { x: gap + c * (cw + gap) + (cw - size.width) / 2, y: H - gap - (r + 1) * ch - r * gap + (ch - size.height) / 2, ...size });
    });
    step(ctx, Math.min(i + n, embedded.length), embedded.length);
  }
  return { files: [pdf(`${baseName(f.name)}-${n}-up.pdf`, await pdfBlob(out))] };
};

const flip: Processor = async (ctx) => {
  const f = first(ctx);
  const src = await loadPdf(f.blob);
  const out = await PDFDocument.create();
  const embedded = await out.embedPages(src.getPages());
  const h = ctx.values.axis !== "v";
  const v = ctx.values.axis !== "h";
  embedded.forEach((e) => {
    const page = out.addPage([e.width, e.height]);
    page.drawPage(e, { x: h ? e.width : 0, y: v ? e.height : 0, xScale: h ? -1 : 1, yScale: v ? -1 : 1 });
  });
  step(ctx, 1, 1);
  return { files: [pdf(`${baseName(f.name)}-flipped.pdf`, await pdfBlob(out))] };
};

const splitInHalf: Processor = async (ctx) => {
  const f = first(ctx);
  const src = await loadPdf(f.blob);
  const out = await PDFDocument.create();
  for (const [i, p] of src.getPages().entries()) {
    const { width: w, height: h } = p.getSize();
    const [left, right] = await out.embedPages([p, p], [
      { left: 0, bottom: 0, right: w / 2, top: h },
      { left: w / 2, bottom: 0, right: w, top: h },
    ]);
    for (const half of [left, right]) out.addPage([w / 2, h]).drawPage(half, { x: 0, y: 0 });
    step(ctx, i + 1, src.getPageCount());
  }
  return { files: [pdf(`${baseName(f.name)}-halves.pdf`, await pdfBlob(out))] };
};

// ---------- Optimize ----------

const N = (name: string) => PDFName.of(name);
const num = (v: unknown) => (v instanceof PDFNumber ? v.asNumber() : 0);

function filterName(dict: { get: (k: PDFName) => unknown }) {
  const f = dict.get(N("Filter"));
  if (f instanceof PDFName) return f.asString();
  if (f instanceof PDFArray && f.size() === 1) return (f.get(0) as PDFName).asString();
  return f ? "multiple" : "none";
}

async function imageBitmapFrom(stream: PDFRawStream): Promise<ImageBitmap | null> {
  const d = stream.dict;
  const filter = filterName(d);
  const cs = d.get(N("ColorSpace"));
  const csName = cs instanceof PDFName ? cs.asString() : "";
  if (d.get(N("ImageMask")) || d.get(N("Decode"))) return null;
  if (filter === "/DCTDecode") {
    if (csName === "/DeviceCMYK") return null;
    return createImageBitmap(new Blob([stream.contents as BlobPart], { type: "image/jpeg" }));
  }
  if (filter === "/FlateDecode" && num(d.get(N("BitsPerComponent"))) === 8 && (csName === "/DeviceRGB" || csName === "/DeviceGray") && !d.get(N("DecodeParms"))) {
    const w = num(d.get(N("Width")));
    const h = num(d.get(N("Height")));
    const raw = decodePDFRawStream(stream).decode();
    const comps = csName === "/DeviceRGB" ? 3 : 1;
    if (raw.length < w * h * comps) return null;
    const rgba = new Uint8ClampedArray(w * h * 4);
    for (let i = 0, j = 0; i < w * h; i++, j += comps) {
      rgba[i * 4] = raw[j];
      rgba[i * 4 + 1] = raw[comps === 3 ? j + 1 : j];
      rgba[i * 4 + 2] = raw[comps === 3 ? j + 2 : j];
      rgba[i * 4 + 3] = 255;
    }
    return createImageBitmap(new ImageData(rgba, w, h));
  }
  return null;
}

function imageStreams(doc: PDFDocument) {
  return doc.context
    .enumerateIndirectObjects()
    .filter(([, o]) => o instanceof PDFRawStream && (o as PDFRawStream).dict.get(N("Subtype")) === N("Image")) as [import("@cantoo/pdf-lib").PDFRef, PDFRawStream][];
}

const compress: Processor = async (ctx) => {
  const files: OutputFile[] = [];
  let before = 0;
  let after = 0;
  const level = ({ light: { q: 0.8, max: 2600 }, balanced: { q: 0.62, max: 1700 }, strong: { q: 0.42, max: 1150 } } as const)[
    String(ctx.values.level) as "light" | "balanced" | "strong"
  ];
  for (const [fi, f] of ctx.files.entries()) {
    const doc = await loadPdf(f.blob);
    const images = imageStreams(doc);
    for (const [i, [ref, stream]] of images.entries()) {
      step(ctx, fi + i / Math.max(images.length, 1), ctx.files.length, `Optimising image ${i + 1} of ${images.length}`);
      if (stream.contents.length < 15_000) continue;
      const bmp = await imageBitmapFrom(stream).catch(() => null);
      if (!bmp) continue;
      const s = Math.min(1, level.max / Math.max(bmp.width, bmp.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bmp.width * s));
      canvas.height = Math.max(1, Math.round(bmp.height * s));
      const c = canvas.getContext("2d")!;
      if (ctx.values.grayscale) c.filter = "grayscale(1)";
      c.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      const jpeg = await bytesOf(await canvasToBlob(canvas, "image/jpeg", level.q));
      if (jpeg.length >= stream.contents.length * 0.92) continue;
      const dict = doc.context.obj({
        Type: "XObject",
        Subtype: "Image",
        Width: canvas.width,
        Height: canvas.height,
        ColorSpace: "DeviceRGB",
        BitsPerComponent: 8,
        Filter: "DCTDecode",
        Length: jpeg.length,
      });
      const smask = stream.dict.get(N("SMask"));
      if (smask) dict.set(N("SMask"), smask);
      doc.context.assign(ref, PDFRawStream.of(dict, jpeg));
    }
    const blob = await pdfBlob(doc);
    const best = blob.size < f.size ? blob : f.blob;
    before += f.size;
    after += best.size;
    files.push(pdf(`${baseName(f.name)}-compressed.pdf`, best));
  }
  const note = after >= before ? "This PDF is already well optimised — there was nothing worth shrinking." : undefined;
  return { files: await many(files, "compressed.zip"), report: { kind: "sizes", before, after, note } };
};

const sizeAnalyzer: Processor = async (ctx) => {
  const f = first(ctx);
  const doc = await loadPdf(f.blob);
  const buckets = { images: 0, fonts: 0, content: 0, attachments: 0, metadata: 0 };
  let imageCount = 0;
  let fontCount = 0;
  for (const [, o] of doc.context.enumerateIndirectObjects()) {
    if (!(o instanceof PDFRawStream)) continue;
    const d = o.dict;
    const len = o.contents.length;
    const type = d.get(N("Type"));
    const sub = d.get(N("Subtype"));
    if (sub === N("Image")) {
      buckets.images += len;
      imageCount++;
    } else if (d.get(N("Length1")) || d.get(N("Length2")) || [N("Type1C"), N("CIDFontType0C"), N("OpenType")].includes(sub as PDFName)) {
      buckets.fonts += len;
      fontCount++;
    } else if (type === N("EmbeddedFile")) buckets.attachments += len;
    else if (type === N("Metadata")) buckets.metadata += len;
    else buckets.content += len;
  }
  const known = Object.values(buckets).reduce((a, b) => a + b, 0);
  const other = Math.max(0, f.size - known);
  const pct = (b: number) => (b / f.size) * 100;
  const parts = [
    { label: "Images", bytes: buckets.images, tip: imageCount ? `${imageCount} image${imageCount > 1 ? "s" : ""}. ${pct(buckets.images) > 30 ? "Compress PDF would shrink these the most." : "Already a reasonable share."}` : "No images found." },
    { label: "Fonts", bytes: buckets.fonts, tip: fontCount ? `${fontCount} embedded font file${fontCount > 1 ? "s" : ""}. ${pct(buckets.fonts) > 25 ? "Large share — the fonts may be fully embedded rather than subset." : "Normal for this document."}` : "No embedded font files." },
    { label: "Page content", bytes: buckets.content, tip: `Text and drawing instructions for ${doc.getPageCount()} page${doc.getPageCount() > 1 ? "s" : ""}.` },
    { label: "Attachments", bytes: buckets.attachments, tip: buckets.attachments ? "Files embedded inside the PDF. Remove them if they aren't needed." : "None." },
    { label: "Metadata & structure", bytes: buckets.metadata + other, tip: "Document properties, bookmarks and the file's internal index." },
  ].filter((p) => p.bytes > 0 || p.label === "Images");
  step(ctx, 1, 1);
  return { files: [], report: { kind: "breakdown", total: f.size, parts } };
};

const repair: Processor = async (ctx) => {
  const f = first(ctx);
  try {
    const doc = await loadPdf(f.blob);
    step(ctx, 1, 1);
    return { files: [pdf(`${baseName(f.name)}-repaired.pdf`, await pdfBlob(doc))], message: "Rebuilt the file's internal structure." };
  } catch {
    const view = await openPdf(await bytesOf(f.blob));
    const blank = await PDFDocument.create();
    const pages = new Map<number, RasterDraw | null>();
    for (let n = 1; n <= view.numPages; n++) {
      const pg = await view.getPage(n);
      const vp = pg.getViewport({ scale: 1 });
      blank.addPage([vp.width, vp.height]);
      pages.set(n, null);
    }
    const out = await rasterizePages(blank, view, pages, { onPage: (n) => step(ctx, n, view.numPages, `Recovering page ${n}`) });
    return { files: [pdf(`${baseName(f.name)}-repaired.pdf`, await pdfBlob(out))], message: "Recovered every readable page as an image." };
  }
};

const flatten: Processor = async (ctx) => {
  const f = first(ctx);
  const doc = await loadPdf(f.blob);
  if (ctx.values.forms !== false) doc.getForm().flatten();
  let blob = await pdfBlob(doc);
  if (ctx.values.annotations) {
    const view = await openPdf(await bytesOf(blob));
    const pages = new Map<number, RasterDraw | null>();
    for (let n = 1; n <= view.numPages; n++) {
      const annots = await (await view.getPage(n)).getAnnotations();
      if (annots.some((a: { subtype?: string }) => a.subtype && a.subtype !== "Link" && a.subtype !== "Widget")) pages.set(n, null);
    }
    if (pages.size) blob = await pdfBlob(await rasterizePages(await loadPdf(blob), view, pages, { onPage: (n) => step(ctx, n, view.numPages) }));
  }
  step(ctx, 1, 1);
  return { files: [pdf(`${baseName(f.name)}-flattened.pdf`, blob)] };
};

// ---------- Edit & sign ----------

async function embedImageBlob(doc: PDFDocument, blob: Blob) {
  if (blob.type === "image/png") return doc.embedPng(await bytesOf(blob));
  if (blob.type === "image/jpeg") return doc.embedJpg(await bytesOf(blob));
  const bmp = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0);
  return doc.embedPng(await bytesOf(await canvasToBlob(canvas, "image/png")));
}

const standardFont: Record<FontFamily, [StandardFonts, StandardFonts]> = {
  sans: [StandardFonts.Helvetica, StandardFonts.HelveticaBold],
  serif: [StandardFonts.TimesRoman, StandardFonts.TimesRomanBold],
  mono: [StandardFonts.Courier, StandardFonts.CourierBold],
};

const applyEdits: Processor = async (ctx) => {
  if (!ctx.edits.length) throw new Error("Add at least one edit to the page first.");
  const f = first(ctx);
  const doc = await loadPdf(f.blob);
  const fonts = new Map<StandardFonts, PDFFont>();
  const fontFor = async (family: FontFamily, bold?: boolean) => {
    const name = standardFont[family][bold ? 1 : 0];
    if (!fonts.has(name)) fonts.set(name, await doc.embedFont(name));
    return fonts.get(name)!;
  };
  const round = { borderLineCap: LineCapStyle.Round };
  const painter = new TextPainter(doc);

  for (const [i, e] of ctx.edits.entries()) {
    if (e.page > doc.getPageCount()) continue;
    const page = doc.getPage(e.page - 1);
    const { width: W, height: H } = page.getSize();
    const x = (e.x / 100) * W;
    const top = (e.y / 100) * H;
    const w = (e.w / 100) * W;
    const h = (e.h / 100) * H;
    const y = H - top - h;
    const color = hexColor(e.color);
    if (e.kind === "text") {
      const family = e.font ?? "sans";
      const font = await fontFor(family, e.bold);
      for (const [li, line] of (e.text ?? "").split("\n").entries())
        if (line.trim()) await painter.draw(page, font, line, { x, y: H - top - e.size * (baselineRatio[family] + 1.2 * li), size: e.size, color });
    } else if (e.kind === "highlight") {
      page.drawRectangle({ x, y, width: w, height: h, color, opacity: e.opacity ?? 0.4, blendMode: BlendMode.Multiply });
    } else if (e.kind === "shape") {
      if (e.fill) page.drawRectangle({ x, y, width: w, height: h, color, opacity: e.opacity ?? 1 });
      else page.drawRectangle({ x: x + e.size / 2, y: y + e.size / 2, width: Math.max(0, w - e.size), height: Math.max(0, h - e.size), borderColor: color, borderWidth: e.size, borderOpacity: e.opacity ?? 1 });
    } else if (e.kind === "draw") {
      page.drawSvgPath(strokePath(e.points ?? [], w, h), { x, y: H - top, borderColor: color, borderWidth: e.size, borderOpacity: e.opacity ?? 1, ...round });
    } else if (e.kind === "check") {
      page.drawSvgPath(polyPath(checkPoints, w, h), { x, y: H - top, borderColor: color, borderWidth: Math.max(1, w * 0.12), ...round });
    } else if (e.kind === "signature" && e.src) {
      page.drawImage(await doc.embedPng(e.src), { x, y, width: w, height: h });
    } else if (e.kind === "image" && e.blob) {
      page.drawImage(await embedImageBlob(doc, e.blob), { x, y, width: w, height: h });
    }
    step(ctx, i + 1, ctx.edits.length);
  }
  return { files: [pdf(`${baseName(f.name)}-${ctx.tool.slug === "sign-pdf" ? "signed" : "edited"}.pdf`, await pdfBlob(doc))] };
};

const fillForm: Processor = async (ctx) => {
  const f = first(ctx);
  const doc = await loadPdf(f.blob);
  const form = doc.getForm();
  for (const field of form.getFields()) {
    const v = ctx.form[field.getName()];
    if (v === undefined) continue;
    if (field instanceof PDFTextField) field.setText(String(v));
    else if (field instanceof PDFCheckBox) {
      if (v) field.check();
      else field.uncheck();
    } else if ((field instanceof PDFDropdown || field instanceof PDFOptionList) && v) field.select(String(v));
    else if (field instanceof PDFRadioGroup && v) field.select(String(v));
  }
  if (ctx.values.flatten) form.flatten();
  step(ctx, 1, 1);
  return { files: [pdf(`${baseName(f.name)}-filled.pdf`, await pdfBlob(doc))] };
};

async function stampEachPage(
  ctx: ProcessCtx,
  f: InputFile,
  draw: (page: PDFPage, index: number, total: number, font: PDFFont, text: TextPainter) => Promise<void>,
  suffix: string,
) {
  const doc = await loadPdf(f.blob);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const painter = new TextPainter(doc);
  const pages = doc.getPages();
  for (const [i, p] of pages.entries()) await draw(p, i, pages.length, font, painter);
  return pdf(`${baseName(f.name)}-${suffix}.pdf`, await pdfBlob(doc));
}

const gray = rgb(0.35, 0.35, 0.38);

const watermark: Processor = async (ctx) => {
  const label = str(ctx.values.text) || "CONFIDENTIAL";
  const opacity = Number(ctx.values.opacity ?? 20) / 100;
  const file = await stampEachPage(
    ctx,
    first(ctx),
    async (page, _i, _t, font, text) => {
      const { width: W, height: H } = page.getSize();
      const size = Math.min(W, H) * (ctx.values.diagonal ? 0.11 : 0.07);
      const tw = text.width(font, label, size);
      const y = ctx.values.position === "top" ? H - size * 2 : ctx.values.position === "bottom" ? size * 1.5 : H / 2;
      if (ctx.values.diagonal) {
        const a = Math.PI / 4;
        await text.draw(page, font, label, { x: W / 2 - (tw / 2) * Math.cos(a), y: y - (tw / 2) * Math.sin(a), size, color: gray, opacity, rotate: 45 });
      } else await text.draw(page, font, label, { x: (W - tw) / 2, y, size, color: gray, opacity });
    },
    "watermarked",
  );
  step(ctx, 1, 1);
  return { files: [file] };
};

const pageNumbers: Processor = async (ctx) => {
  const start = Number(ctx.values.start ?? 1);
  const file = await stampEachPage(
    ctx,
    first(ctx),
    async (page, i, total, font, text) => {
      const n = start + i;
      const label = ctx.values.format === "n-of" ? `${n} of ${start + total - 1}` : ctx.values.format === "page-n" ? `Page ${n}` : `${n}`;
      const { width: W, height: H } = page.getSize();
      const size = 10;
      const tw = text.width(font, label, size);
      const pos = String(ctx.values.position);
      const x = pos.endsWith("right") ? W - 36 - tw : (W - tw) / 2;
      const y = pos.startsWith("top") ? H - 30 : 24;
      await text.draw(page, font, label, { x, y, size, color: gray });
    },
    "numbered",
  );
  step(ctx, 1, 1);
  return { files: [file] };
};

const headersFooters: Processor = async (ctx) => {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const fill = (t: string, n: number, total: number) => t.replace(/\{n\}/g, String(n)).replace(/\{total\}/g, String(total)).replace(/\{date\}/g, date);
  if (!str(ctx.values.header) && !str(ctx.values.footer)) throw new Error("Enter a header or a footer.");
  const file = await stampEachPage(
    ctx,
    first(ctx),
    async (page, i, total, font, text) => {
      const { width: W, height: H } = page.getSize();
      for (const [raw, y] of [
        [str(ctx.values.header), H - 30],
        [str(ctx.values.footer), 22],
      ] as const) {
        if (!raw) continue;
        const t = fill(raw, i + 1, total);
        await text.draw(page, font, t, { x: (W - text.width(font, t, 9)) / 2, y, size: 9, color: gray });
      }
    },
    "header-footer",
  );
  step(ctx, 1, 1);
  return { files: [file] };
};

const bates: Processor = async (ctx) => {
  const prefix = str(ctx.values.prefix);
  let n = Number(ctx.values.start ?? 1);
  const files: OutputFile[] = [];
  for (const [i, f] of ctx.files.entries()) {
    files.push(
      await stampEachPage(
        ctx,
        f,
        async (page, _i, _t, font, text) => {
          const label = `${prefix}${String(n++).padStart(6, "0")}`;
          const { width: W } = page.getSize();
          await text.draw(page, font, label, { x: W - 36 - text.width(font, label, 9), y: 20, size: 9, color: rgb(0.1, 0.1, 0.12) });
        },
        "bates",
      ),
    );
    step(ctx, i + 1, ctx.files.length);
  }
  return { files: await many(files, "bates-numbered.zip") };
};

const invert: Processor = async (ctx) => {
  const f = first(ctx);
  const filter = ({ dark: "invert(1) hue-rotate(180deg)", sepia: "sepia(0.85) contrast(0.95) brightness(1.02)", contrast: "grayscale(1) contrast(1.8)" } as Record<string, string>)[String(ctx.values.mode)];
  const src = await loadPdf(f.blob);
  const view = await openPdf(await bytesOf(f.blob));
  const all = new Map(src.getPageIndices().map((i) => [i + 1, null]));
  const out = await rasterizePages(src, view, all, { filter, onPage: (n) => step(ctx, n, view.numPages, `Recolouring page ${n}`) });
  return { files: [pdf(`${baseName(f.name)}-${ctx.values.mode}.pdf`, await pdfBlob(out))] };
};

const metadata: Processor = async (ctx) => {
  const f = first(ctx);
  const doc = await loadPdf(f.blob);
  if (str(ctx.values.title)) doc.setTitle(str(ctx.values.title));
  if (str(ctx.values.author)) doc.setAuthor(str(ctx.values.author));
  if (str(ctx.values.keywords)) doc.setKeywords(str(ctx.values.keywords).split(",").map((k) => k.trim()).filter(Boolean));
  doc.setModificationDate(new Date());
  step(ctx, 1, 1);
  return { files: [pdf(`${baseName(f.name)}.pdf`, await pdfBlob(doc))] };
};

// ---------- Security ----------

const encrypt: Processor = async (ctx) => {
  const f = first(ctx);
  const doc = await loadPdf(f.blob);
  const owner = Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, "0")).join("");
  doc.encrypt({
    userPassword: str(ctx.values.password),
    ownerPassword: owner,
    permissions: { printing: ctx.values.print ? "highResolution" : false, copying: Boolean(ctx.values.copy), modifying: false, annotating: false, fillingForms: true, contentAccessibility: true, documentAssembly: false },
  });
  const bytes = await doc.save({ useObjectStreams: false });
  step(ctx, 1, 1);
  return { files: [pdf(`${baseName(f.name)}-protected.pdf`, new Blob([bytes as BlobPart], { type: "application/pdf" }))] };
};

const removePassword: Processor = async (ctx) => {
  const f = first(ctx);
  const doc = await loadPdf(f.blob, str(ctx.values.password));
  step(ctx, 1, 1);
  return { files: [pdf(`${baseName(f.name)}-unlocked.pdf`, await pdfBlob(doc))] };
};

const unlock: Processor = async (ctx) => {
  const f = first(ctx);
  let doc: PDFDocument;
  try {
    doc = await loadPdf(f.blob, "");
  } catch {
    throw new Error("This PDF needs a password to open. Use Remove password instead.");
  }
  step(ctx, 1, 1);
  return { files: [pdf(`${baseName(f.name)}-unrestricted.pdf`, await pdfBlob(doc))] };
};

type Box = { x: number; y: number; w: number; h: number };

const PII: { id: string; label: string; re: RegExp; check?: (m: string) => boolean }[] = [
  { id: "emails", label: "Email", re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
  { id: "ids", label: "PAN", re: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g },
  { id: "ids", label: "Aadhaar", re: /\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}\b/g },
  {
    id: "cards",
    label: "Card number",
    re: /\b(?:\d[ -]?){13,19}\b/g,
    check: (m) => {
      const d = m.replace(/\D/g, "");
      let sum = 0;
      for (let i = 0; i < d.length; i++) {
        let n = Number(d[d.length - 1 - i]);
        if (i % 2) n = n * 2 > 9 ? n * 2 - 9 : n * 2;
        sum += n;
      }
      return d.length >= 13 && sum % 10 === 0;
    },
  },
  { id: "phones", label: "Phone", re: /(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,5}[\s-]?\d{4,5}\b/g, check: (m) => m.replace(/\D/g, "").length >= 10 && m.replace(/\D/g, "").length <= 13 },
];

function matchBoxes(lines: TextLine[], re: RegExp, check?: (m: string) => boolean) {
  const boxes: (Box & { text: string })[] = [];
  for (const line of lines) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line.text))) {
      if (check && !check(m[0])) continue;
      const [s, e] = [m.index, m.index + m[0].length];
      const hit = line.items.filter((it) => it.end > s && it.start < e);
      if (!hit.length) continue;
      const first = hit[0];
      const last = hit[hit.length - 1];
      const charW = (it: typeof first) => it.w / Math.max(1, it.end - it.start);
      const x0 = first.x + Math.max(0, s - first.start) * charW(first);
      const x1 = last.x + Math.min(last.end - last.start, e - last.start) * charW(last);
      boxes.push({ x: x0 - 2, y: Math.min(...hit.map((h) => h.y)) - 2, w: x1 - x0 + 4, h: Math.max(...hit.map((h) => h.h)) + 4, text: m[0] });
    }
  }
  return boxes;
}

async function redactBoxes(ctx: ProcessCtx, f: InputFile, boxesFor: (n: number, lines: TextLine[], W: number, H: number) => Box[], suffix: string, stripMeta: boolean) {
  const src = await loadPdf(f.blob);
  const view = await openPdf(await bytesOf(f.blob));
  const scale = 2;
  const pages = new Map<number, RasterDraw>();
  let count = 0;
  for (let n = 1; n <= view.numPages; n++) {
    const pg = await view.getPage(n);
    const vp = pg.getViewport({ scale });
    const boxes = boxesFor(n, await pageLines(view, n, scale), vp.width, vp.height);
    if (boxes.length) {
      count += boxes.length;
      pages.set(n, (c) => {
        c.fillStyle = "#000";
        boxes.forEach((b) => c.fillRect(b.x, b.y, b.w, b.h));
      });
    }
    step(ctx, n * 0.5, view.numPages, `Scanning page ${n}`);
  }
  const out = await rasterizePages(src, view, pages, { scale, onPage: (n) => step(ctx, view.numPages * 0.5 + n * 0.5, view.numPages) });
  if (stripMeta) {
    out.setTitle("");
    out.setAuthor("");
    out.setSubject("");
    out.setKeywords([]);
    out.setCreator("");
    out.setProducer("");
  }
  return { file: pdf(`${baseName(f.name)}-${suffix}.pdf`, await pdfBlob(out)), count };
}

const redact: Processor = async (ctx) => {
  const f = first(ctx);
  const find = str(ctx.values.find);
  const re = find ? new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi") : null;
  const { file, count } = await redactBoxes(
    ctx,
    f,
    (n, lines, W, H) => [
      ...ctx.edits.filter((e) => e.kind === "redact" && e.page === n).map((e) => ({ x: (e.x / 100) * W, y: (e.y / 100) * H, w: (e.w / 100) * W, h: (e.h / 100) * H })),
      ...(re ? matchBoxes(lines, re) : []),
    ],
    "redacted",
    ctx.values.metadata !== false,
  );
  if (!count) throw new Error(find ? `"${find}" wasn't found, and no areas were marked.` : "Mark at least one area to redact.");
  return { files: [file], message: `${count} area${count > 1 ? "s" : ""} permanently removed.` };
};

const autoRedact: Processor = async (ctx) => {
  const f = first(ctx);
  const counts = new Map<string, number>();
  const active = PII.filter((p) => ctx.values[p.id] !== false);
  const { file, count } = await redactBoxes(
    ctx,
    f,
    (_n, lines) =>
      active.flatMap((p) => {
        const found = matchBoxes(lines, p.re, p.check);
        counts.set(p.label, (counts.get(p.label) ?? 0) + found.length);
        return found;
      }),
    "redacted",
    true,
  );
  const rows = [...counts.entries()].filter(([, c]) => c).map(([label, c]) => ({ tone: "success" as const, label, text: `${c} found and removed` }));
  return {
    files: count ? [file] : [],
    report: { kind: "findings", rows, empty: "No personal data was found. Scanned pages may need OCR first." },
  };
};

const redactionCheck: Processor = async (ctx) => {
  const f = first(ctx);
  const view = await openPdf(await bytesOf(f.blob));
  const rows: { tone: "success" | "warning" | "destructive"; label: string; text: string }[] = [];
  for (let n = 1; n <= view.numPages; n++) {
    const { canvas } = await renderPage(view, n, { scale: 1.5, annotations: false });
    const c = canvas.getContext("2d", { willReadFrequently: true })!;
    for (const line of await pageLines(view, n, 1.5)) {
      for (const it of line.items) {
        const w = Math.max(1, Math.floor(it.w));
        const h = Math.max(1, Math.floor(it.h));
        const data = c.getImageData(Math.max(0, Math.floor(it.x)), Math.max(0, Math.floor(it.y)), w, h).data;
        let dark = 0;
        for (let i = 0; i < data.length; i += 4) if (data[i] + data[i + 1] + data[i + 2] < 120) dark++;
        if (dark / (data.length / 4) > 0.9) rows.push({ tone: "destructive", label: `Page ${n}`, text: `Hidden text under a black box: “${it.str.slice(0, 60)}”` });
      }
    }
    step(ctx, n, view.numPages, `Checking page ${n}`);
  }
  const doc = await loadPdf(f.blob);
  const meta = [doc.getTitle(), doc.getAuthor(), doc.getSubject(), doc.getKeywords()].filter(Boolean);
  if (meta.length) rows.push({ tone: "warning", label: "Metadata", text: `Document properties still contain: ${meta.join(" · ").slice(0, 120)}` });
  return { files: [], report: { kind: "findings", rows, empty: "No text was found hiding under black boxes, and the metadata is clean." } };
};

const fingerprint: Processor = async (ctx) => {
  const files = [];
  for (const [i, f] of ctx.files.entries()) {
    const bytes = await bytesOf(f.blob);
    const hashes: [string, string][] = [];
    for (const algo of ["SHA-256", "SHA-384", "SHA-1"]) {
      const d = await crypto.subtle.digest(algo, bytes);
      hashes.push([algo, Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("")]);
    }
    files.push({ name: f.name, hashes });
    step(ctx, i + 1, ctx.files.length);
  }
  const txt = files.map((f) => [f.name, ...f.hashes.map(([a, h]) => `${a}  ${h}`)].join("\n")).join("\n\n");
  return { files: [{ name: "hashes.txt", blob: new Blob([txt], { type: "text/plain" }) }], report: { kind: "hashes", files } };
};

// ---------- Convert to PDF ----------

async function imagesToPdf(ctx: ProcessCtx, filter?: string) {
  const out = await PDFDocument.create();
  const margin = ({ none: 0, small: 18, large: 48 } as Record<string, number>)[String(ctx.values.margin ?? "none")] ?? 0;
  for (const [i, f] of ctx.files.entries()) {
    let bmp: ImageBitmap;
    try {
      bmp = await createImageBitmap(f.blob);
    } catch {
      throw new Error(`${f.name} can't be read by this browser. HEIC photos may need converting to JPG first.`);
    }
    const canvas = document.createElement("canvas");
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const c = canvas.getContext("2d")!;
    if (filter) c.filter = filter;
    c.drawImage(bmp, 0, 0);
    const img = await out.embedJpg(await bytesOf(await canvasToBlob(canvas, "image/jpeg", 0.9)));
    const choice = String(ctx.values.pageSize ?? "fit");
    let [W, H] = choice === "fit" ? [img.width * 0.75 + margin * 2, img.height * 0.75 + margin * 2] : pageSizeFor(choice, [595.28, 841.89]);
    if (choice !== "fit" && img.width > img.height) [W, H] = [H, W];
    const size = fitInto(img.width, img.height, W - margin * 2, H - margin * 2);
    out.addPage([W, H]).drawImage(img, { x: (W - size.width) / 2, y: (H - size.height) / 2, ...size });
    step(ctx, i + 1, ctx.files.length, `Adding ${f.name}`);
  }
  return { files: [pdf(ctx.files.length > 1 ? "images.pdf" : `${baseName(first(ctx).name)}.pdf`, await pdfBlob(out))] };
}

const images: Processor = (ctx) => imagesToPdf(ctx);
const scan: Processor = (ctx) =>
  imagesToPdf(ctx, ({ bw: "grayscale(1) contrast(1.9) brightness(1.08)", auto: "contrast(1.25) brightness(1.06) saturate(0.9)", color: undefined } as Record<string, string | undefined>)[String(ctx.values.filter)]);

async function blocksToPdf(ctx: ProcessCtx, blocks: Block[], landscape = false) {
  if (!blocks.length) throw new Error("No readable content was found in this file.");
  step(ctx, 0.5, 1, "Laying out pages");
  const [a, b] = [595.28, 841.89];
  const doc = await layoutBlocks(blocks, { size: landscape ? [b, a] : [a, b], title: baseName(first(ctx).name) });
  step(ctx, 1, 1);
  return { files: [pdf(`${baseName(first(ctx).name)}.pdf`, await pdfBlob(doc))] };
}

const wordToPdf: Processor = async (ctx) => {
  const files: OutputFile[] = [];
  const m = await import("mammoth");
  const mammoth = (m as unknown as { default?: typeof m }).default ?? m;
  for (const f of ctx.files) {
    if (f.name.toLowerCase().endsWith(".doc")) throw new Error("Old .doc files aren't supported yet — save it as .docx and try again.");
    const { value } = await mammoth.convertToHtml({ arrayBuffer: await f.blob.arrayBuffer() });
    const out = await blocksToPdf({ ...ctx, files: [f] }, htmlToBlocks(value));
    files.push(...out.files);
  }
  return { files: await many(files, "converted.zip") };
};

const excelToPdf: Processor = async (ctx) => {
  const f = first(ctx);
  const sheets = /\.csv$/i.test(f.name) ? [{ name: baseName(f.name), rows: parseCsv(await f.blob.text()) }] : readXlsx(await bytesOf(f.blob));
  const blocks: Block[] = sheets.flatMap((s, i) => [...(i ? [{ type: "pagebreak" } as Block] : []), { type: "h2", text: s.name } as Block, { type: "table", rows: s.rows } as Block]);
  return blocksToPdf(ctx, blocks, ctx.values.orientation !== "portrait");
};

const htmlToPdf: Processor = async (ctx) => blocksToPdf(ctx, htmlToBlocks(await first(ctx).blob.text()));
const markdownToPdf: Processor = async (ctx) => blocksToPdf(ctx, markdownToBlocks(await first(ctx).blob.text()));
const txtToPdf: Processor = async (ctx) => blocksToPdf(ctx, textToBlocks(await first(ctx).blob.text()));
const ebookToPdf: Processor = async (ctx) => {
  const f = first(ctx);
  if (/\.epub$/i.test(f.name)) return blocksToPdf(ctx, epubToBlocks(await bytesOf(f.blob)));
  if (/\.html?$/i.test(f.name)) return htmlToPdf(ctx);
  return txtToPdf(ctx);
};

// ---------- Convert from PDF ----------

const pdfToImages: Processor = async (ctx) => {
  const f = first(ctx);
  const view = await openPdf(await bytesOf(f.blob));
  const scale = Number(ctx.values.dpi ?? 150) / 72;
  const png = ctx.values.format === "png";
  const wanted = ctx.selected.size ? ctx.pages.filter((p) => ctx.selected.has(p.id)).map((p) => p.n) : Array.from({ length: view.numPages }, (_, i) => i + 1);
  const files: OutputFile[] = [];
  for (const [i, n] of wanted.entries()) {
    const { canvas } = await renderPage(view, n, { scale });
    files.push({ name: `${baseName(f.name)}-page-${n}.${png ? "png" : "jpg"}`, blob: await canvasToBlob(canvas, png ? "image/png" : "image/jpeg", 0.92) });
    step(ctx, i + 1, wanted.length, `Rendering page ${n}`);
  }
  return { files: await many(files, `${baseName(f.name)}-images.zip`) };
};

const extractText: Processor = async (ctx) => {
  const f = first(ctx);
  const view = await openPdf(await bytesOf(f.blob));
  const pages = await documentText(view, (n) => step(ctx, n, view.numPages, `Reading page ${n}`));
  const text = pages.map((lines, i) => `--- Page ${i + 1} ---\n${lines.join("\n")}`).join("\n\n");
  if (!pages.some((p) => p.length)) throw new Error("No text was found. This may be a scanned PDF — it needs OCR first.");
  return { files: [{ name: `${baseName(f.name)}.txt`, blob: new Blob([text], { type: "text/plain" }) }], report: { kind: "text", text, label: "Extracted text" } };
};

const pdfToWord: Processor = async (ctx) => {
  const f = first(ctx);
  const view = await openPdf(await bytesOf(f.blob));
  const { Document, Packer, Paragraph, HeadingLevel, PageBreak } = await import("docx");
  const children: InstanceType<typeof Paragraph>[] = [];
  let anyText = false;
  for (let n = 1; n <= view.numPages; n++) {
    const lines = await pageLines(view, n);
    const heights = lines.map((l) => l.height).sort((a, b) => a - b);
    const median = heights[Math.floor(heights.length / 2)] ?? 10;
    let buf: string[] = [];
    let prev: TextLine | null = null;
    const flush = () => {
      if (buf.length) children.push(new Paragraph({ text: buf.join(" ") }));
      buf = [];
    };
    for (const l of lines) {
      anyText = true;
      if (l.height > median * 1.3) {
        flush();
        children.push(new Paragraph({ text: l.text, heading: l.height > median * 1.7 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2 }));
      } else {
        if (prev && l.y - prev.y > prev.height * 1.9) flush();
        buf.push(l.text);
      }
      prev = l;
    }
    flush();
    if (n < view.numPages) children.push(new Paragraph({ children: [new PageBreak()] }));
    step(ctx, n, view.numPages, `Converting page ${n}`);
  }
  if (!anyText) throw new Error("No text was found. This may be a scanned PDF — it needs OCR first.");
  const blob = await Packer.toBlob(new Document({ sections: [{ children }] }));
  return { files: [{ name: `${baseName(f.name)}.docx`, blob }] };
};

const pdfToExcel: Processor = async (ctx) => {
  const f = first(ctx);
  const view = await openPdf(await bytesOf(f.blob));
  const sheets: { name: string; rows: string[][] }[] = [];
  for (let n = 1; n <= view.numPages; n++) {
    const rows = (await pageLines(view, n)).map((l) => {
      const cells: string[] = [];
      let last: (typeof l.items)[number] | null = null;
      for (const it of l.items) {
        const gap = last ? it.x - (last.x + last.w) : 0;
        if (!last || gap > Math.max(8, (last.w / Math.max(1, last.str.length)) * 2)) cells.push(it.str.trim());
        else cells[cells.length - 1] += ` ${it.str.trim()}`;
        last = it;
      }
      return cells;
    });
    if (rows.length) sheets.push({ name: `Page ${n}`, rows });
    step(ctx, n, view.numPages);
  }
  if (!sheets.length) throw new Error("No text or tables were found in this PDF.");
  return { files: [{ name: `${baseName(f.name)}.xlsx`, blob: writeXlsx(sheets) }] };
};

const pdfToHtml: Processor = async (ctx) => {
  const f = first(ctx);
  const view = await openPdf(await bytesOf(f.blob));
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const sections: string[] = [];
  for (let n = 1; n <= view.numPages; n++) {
    const lines = await pageLines(view, n);
    sections.push(`<section><h2>Page ${n}</h2>${lines.map((l) => `<p>${esc(l.text)}</p>`).join("")}</section>`);
    step(ctx, n, view.numPages);
  }
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(baseName(f.name))}</title><style>body{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;line-height:1.6;color:#18181b}section{border-bottom:1px solid #eee;padding-bottom:24px}h2{font-size:14px;color:#888;text-transform:uppercase;letter-spacing:.08em}</style></head><body><h1>${esc(baseName(f.name))}</h1>${sections.join("")}</body></html>`;
  return { files: [{ name: `${baseName(f.name)}.html`, blob: new Blob([html], { type: "text/html" }) }] };
};

const extractImages: Processor = async (ctx) => {
  const f = first(ctx);
  const doc = await loadPdf(f.blob);
  const streams = imageStreams(doc);
  const files: OutputFile[] = [];
  for (const [i, [, s]] of streams.entries()) {
    const filter = filterName(s.dict);
    if (num(s.dict.get(N("Width"))) < 32 || num(s.dict.get(N("Height"))) < 32) continue;
    if (filter === "/DCTDecode") files.push({ name: `image-${files.length + 1}.jpg`, blob: new Blob([s.contents as BlobPart], { type: "image/jpeg" }) });
    else if (filter === "/JPXDecode") files.push({ name: `image-${files.length + 1}.jp2`, blob: new Blob([s.contents as BlobPart], { type: "image/jp2" }) });
    else {
      const bmp = await imageBitmapFrom(s).catch(() => null);
      if (!bmp) continue;
      const canvas = document.createElement("canvas");
      canvas.width = bmp.width;
      canvas.height = bmp.height;
      canvas.getContext("2d")!.drawImage(bmp, 0, 0);
      files.push({ name: `image-${files.length + 1}.png`, blob: await canvasToBlob(canvas, "image/png") });
    }
    step(ctx, i + 1, streams.length);
  }
  if (!files.length) throw new Error("No extractable images were found in this PDF.");
  return { files: await many(files, `${baseName(f.name)}-images.zip`), message: `${files.length} image${files.length > 1 ? "s" : ""} extracted.` };
};

// ---------- AI-free analysis ----------

const compare: Processor = async (ctx) => {
  const [a, b] = await Promise.all(ctx.files.slice(0, 2).map(async (f) => documentText(await openPdf(await bytesOf(f.blob)))));
  step(ctx, 0.6, 1, "Comparing");
  const flat = (pages: string[][]) => pages.flatMap((lines, p) => lines.map((text) => ({ text: text.trim(), page: p + 1 }))).filter((l) => l.text);
  const A = flat(a).slice(0, 4000);
  const B = flat(b).slice(0, 4000);
  const dp = Array.from({ length: A.length + 1 }, () => new Uint16Array(B.length + 1));
  for (let i = A.length - 1; i >= 0; i--) for (let j = B.length - 1; j >= 0; j--) dp[i][j] = A[i].text === B[j].text ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const rows: { tone: "success" | "destructive"; label: string; text: string }[] = [];
  let i = 0;
  let j = 0;
  while (i < A.length || j < B.length) {
    if (i < A.length && j < B.length && A[i].text === B[j].text) {
      i++;
      j++;
    } else if (j < B.length && (i >= A.length || dp[i][j + 1] >= dp[i + 1][j])) rows.push({ tone: "success", label: `Added · p${B[j].page}`, text: B[j++].text });
    else rows.push({ tone: "destructive", label: `Removed · p${A[i].page}`, text: A[i++].text });
  }
  step(ctx, 1, 1);
  const txt = rows.map((r) => `${r.tone === "success" ? "+" : "-"} [${r.label}] ${r.text}`).join("\n") || "No differences in text.";
  return {
    files: [{ name: "comparison.txt", blob: new Blob([txt], { type: "text/plain" }) }],
    report: { kind: "findings", rows: rows.slice(0, 200), empty: "The two documents contain the same text." },
  };
};

export const processors: Record<string, Processor> = {
  "merge-pdf": merge,
  "alternate-mix-pdf": alternateMix,
  "split-pdf": split,
  "organize-pages": organize,
  "rotate-pdf": rotate,
  "delete-pages": deletePages,
  "extract-pages": extract,
  "crop-pdf": crop,
  "pages-per-sheet": pagesPerSheet,
  "flip-pdf": flip,
  "split-in-half": splitInHalf,
  "compress-pdf": compress,
  "pdf-size-analyzer": sizeAnalyzer,
  "repair-pdf": repair,
  "flatten-pdf": flatten,
  "edit-pdf": applyEdits,
  "sign-pdf": applyEdits,
  "fill-pdf-form": fillForm,
  "add-watermark": watermark,
  "page-numbers": pageNumbers,
  "headers-footers": headersFooters,
  "bates-numbering": bates,
  "invert-pdf": invert,
  "edit-metadata": metadata,
  "encrypt-pdf": encrypt,
  "remove-password": removePassword,
  "unlock-pdf": unlock,
  "redact-pdf": redact,
  "auto-redact-pii": autoRedact,
  "redaction-checker": redactionCheck,
  "file-fingerprint": fingerprint,
  "images-to-pdf": images,
  "scan-to-pdf": scan,
  "word-to-pdf": wordToPdf,
  "excel-to-pdf": excelToPdf,
  "html-to-pdf": htmlToPdf,
  "markdown-to-pdf": markdownToPdf,
  "txt-to-pdf": txtToPdf,
  "ebook-to-pdf": ebookToPdf,
  "pdf-to-jpg": pdfToImages,
  "pdf-to-word": pdfToWord,
  "pdf-to-excel": pdfToExcel,
  "extract-text": extractText,
  "extract-images": extractImages,
  "pdf-to-html": pdfToHtml,
  "compare-pdfs": compare,
  ...imageProcessors,
};
