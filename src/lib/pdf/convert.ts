"use client";

import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import type { Block } from "@/lib/pdf/layout";

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

/** HTML (or XHTML) → layout blocks. Scripts, styles and markup are ignored; only text structure is kept. */
export function htmlToBlocks(html: string, mime: DOMParserSupportedType = "text/html"): Block[] {
  const doc = new DOMParser().parseFromString(html, mime);
  const blocks: Block[] = [];
  const walk = (el: Element) => {
    for (const node of Array.from(el.children)) {
      const tag = node.tagName.toLowerCase();
      if (["script", "style", "noscript", "head", "svg", "template"].includes(tag)) continue;
      if (tag === "h1") blocks.push({ type: "h1", text: clean(node.textContent ?? "") });
      else if (tag === "h2") blocks.push({ type: "h2", text: clean(node.textContent ?? "") });
      else if (/^h[3-6]$/.test(tag)) blocks.push({ type: "h3", text: clean(node.textContent ?? "") });
      else if (tag === "p" || tag === "figcaption" || tag === "dt" || tag === "dd") blocks.push({ type: "p", text: clean(node.textContent ?? "") });
      else if (tag === "blockquote") blocks.push({ type: "quote", text: clean(node.textContent ?? "") });
      else if (tag === "pre") blocks.push({ type: "code", text: node.textContent ?? "" });
      else if (tag === "hr") blocks.push({ type: "hr" });
      else if (tag === "ul" || tag === "ol") {
        Array.from(node.children)
          .filter((li) => li.tagName.toLowerCase() === "li")
          .forEach((li, i) => blocks.push({ type: "li", text: clean(li.textContent ?? ""), ordered: tag === "ol" ? i + 1 : undefined }));
      } else if (tag === "table") {
        const rows = Array.from(node.querySelectorAll("tr")).map((tr) => Array.from(tr.children).map((c) => clean(c.textContent ?? "")));
        if (rows.length) blocks.push({ type: "table", rows });
      } else if (node.children.length) walk(node);
      else if (clean(node.textContent ?? "")) blocks.push({ type: "p", text: clean(node.textContent ?? "") });
    }
  };
  walk(doc.body ?? doc.documentElement);
  return blocks;
}

export function markdownToBlocks(md: string): Block[] {
  const inline = (s: string) => s.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`~]{1,3}([^*_`~]+)[*_`~]{1,3}/g, "$1");
  const lines = md.replace(/\r/g, "").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ type: "p", text: inline(para.join(" ")) });
    para = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      flush();
      const code: string[] = [];
      while (++i < lines.length && !lines[i].startsWith("```")) code.push(lines[i]);
      blocks.push({ type: "code", text: code.join("\n") });
    } else if (/^#{1,6}\s/.test(line)) {
      flush();
      const level = line.match(/^#+/)![0].length;
      blocks.push({ type: level === 1 ? "h1" : level === 2 ? "h2" : "h3", text: inline(line.replace(/^#+\s*/, "")) });
    } else if (/^\s*[-*+]\s+/.test(line)) {
      flush();
      blocks.push({ type: "li", text: inline(line.replace(/^\s*[-*+]\s+/, "")) });
    } else if (/^\s*\d+[.)]\s+/.test(line)) {
      flush();
      blocks.push({ type: "li", text: inline(line.replace(/^\s*\d+[.)]\s+/, "")), ordered: Number(line.match(/\d+/)![0]) });
    } else if (/^\s*>/.test(line)) {
      flush();
      blocks.push({ type: "quote", text: inline(line.replace(/^\s*>\s?/, "")) });
    } else if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      flush();
      blocks.push({ type: "hr" });
    } else if (line.trim().startsWith("|")) {
      flush();
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i].trim().replace(/^\||\|$/g, "").split("|").map((c) => inline(c.trim()));
        if (!cells.every((c) => /^:?-+:?$/.test(c))) rows.push(cells);
        i++;
      }
      i--;
      blocks.push({ type: "table", rows });
    } else if (!line.trim()) flush();
    else para.push(line.trim());
  }
  flush();
  return blocks;
}

export function textToBlocks(text: string): Block[] {
  return text
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((p) => ({ type: "p" as const, text: p.replace(/\n/g, " ") }));
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const delim = (text.split("\n")[0].match(/;/g)?.length ?? 0) > (text.split("\n")[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim()));
}

const xml = (s: string) => new DOMParser().parseFromString(s, "application/xml");
const colIndex = (ref: string) => ref.replace(/\d+/g, "").split("").reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;

/** Minimal XLSX reader: every sheet → rows of display text. */
export function readXlsx(bytes: Uint8Array): { name: string; rows: string[][] }[] {
  const files = unzipSync(bytes);
  const read = (p: string) => (files[p] ? strFromU8(files[p]) : "");
  const shared = Array.from(xml(read("xl/sharedStrings.xml")).getElementsByTagName("si")).map((si) =>
    Array.from(si.getElementsByTagName("t")).map((t) => t.textContent ?? "").join(""),
  );
  const wb = xml(read("xl/workbook.xml"));
  const rels = xml(read("xl/_rels/workbook.xml.rels"));
  const target = (rid: string) => {
    const rel = Array.from(rels.getElementsByTagName("Relationship")).find((r) => r.getAttribute("Id") === rid);
    const t = rel?.getAttribute("Target") ?? "";
    return t.startsWith("/") ? t.slice(1) : `xl/${t}`;
  };
  return Array.from(wb.getElementsByTagName("sheet")).map((s) => {
    const sheet = xml(read(target(s.getAttribute("r:id") ?? s.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id") ?? "")));
    const rows: string[][] = [];
    for (const r of Array.from(sheet.getElementsByTagName("row"))) {
      const row: string[] = [];
      for (const c of Array.from(r.getElementsByTagName("c"))) {
        const t = c.getAttribute("t");
        const v = c.getElementsByTagName("v")[0]?.textContent ?? "";
        const text = t === "s" ? (shared[Number(v)] ?? "") : t === "inlineStr" ? (c.getElementsByTagName("t")[0]?.textContent ?? "") : t === "b" ? (v === "1" ? "TRUE" : "FALSE") : v;
        row[colIndex(c.getAttribute("r") ?? "A")] = text;
      }
      rows.push(Array.from(row, (c) => c ?? ""));
    }
    return { name: s.getAttribute("name") ?? "Sheet", rows: rows.filter((r) => r.some((c) => c.trim())) };
  });
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const colName = (i: number) => {
  let s = "";
  for (i++; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
  return s;
};

/** Minimal XLSX writer with one sheet per entry (text cells, numbers kept numeric). */
export function writeXlsx(sheets: { name: string; rows: string[][] }[]) {
  const sheetXml = (rows: string[][]) =>
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows
      .map(
        (r, ri) =>
          `<row r="${ri + 1}">${r
            .map((c, ci) => {
              const ref = `${colName(ci)}${ri + 1}`;
              return /^-?\d+(\.\d+)?$/.test(c.trim()) && c.trim().length < 15
                ? `<c r="${ref}"><v>${c.trim()}</v></c>`
                : `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${esc(c)}</t></is></c>`;
            })
            .join("")}</row>`,
      )
      .join("")}</sheetData></worksheet>`;
  const files: Record<string, Uint8Array> = {
    "[Content_Types].xml": strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets
        .map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`)
        .join("")}</Types>`,
    ),
    "_rels/.rels": strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    ),
    "xl/workbook.xml": strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets
        .map((s, i) => `<sheet name="${esc(s.name.slice(0, 31))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`)
        .join("")}</sheets></workbook>`,
    ),
    "xl/_rels/workbook.xml.rels": strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets
        .map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`)
        .join("")}</Relationships>`,
    ),
  };
  sheets.forEach((s, i) => (files[`xl/worksheets/sheet${i + 1}.xml`] = strToU8(sheetXml(s.rows))));
  return new Blob([zipSync(files) as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

/** EPUB → blocks, chapter by chapter in reading order. */
export function epubToBlocks(bytes: Uint8Array): Block[] {
  const files = unzipSync(bytes);
  const read = (p: string) => (files[p] ? strFromU8(files[p]) : "");
  const container = xml(read("META-INF/container.xml"));
  const opfPath = container.getElementsByTagName("rootfile")[0]?.getAttribute("full-path") ?? "";
  const dir = opfPath.includes("/") ? opfPath.slice(0, opfPath.lastIndexOf("/") + 1) : "";
  const opf = xml(read(opfPath));
  const manifest = new Map(Array.from(opf.getElementsByTagName("item")).map((i) => [i.getAttribute("id"), i.getAttribute("href") ?? ""]));
  const blocks: Block[] = [];
  for (const ref of Array.from(opf.getElementsByTagName("itemref"))) {
    const href = manifest.get(ref.getAttribute("idref"));
    if (!href) continue;
    const chapter = htmlToBlocks(read(decodeURIComponent(dir + href)), "application/xhtml+xml");
    if (chapter.length) blocks.push({ type: "pagebreak" }, ...chapter);
  }
  return blocks;
}
