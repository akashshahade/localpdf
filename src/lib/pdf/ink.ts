import type { FontFamily, SignatureStyle } from "@/components/tool/types";

const n = (v: number) => Math.round(v * 100) / 100;

/** Smooth SVG path through ink points (0–1) scaled to a w×h box. Shared by the editor and the PDF export. */
export function strokePath(points: [number, number][], w: number, h: number) {
  if (!points.length) return "";
  const p = points.map(([x, y]) => [n(x * w), n(y * h)]);
  let d = `M${p[0][0]} ${p[0][1]}`;
  if (p.length < 3) return d + p.map(([x, y]) => ` L${x} ${y}`).join("");
  for (let i = 1; i < p.length - 1; i++) d += ` Q${p[i][0]} ${p[i][1]} ${n((p[i][0] + p[i + 1][0]) / 2)} ${n((p[i][1] + p[i + 1][1]) / 2)}`;
  const last = p[p.length - 1];
  return `${d} L${last[0]} ${last[1]}`;
}

export const checkPoints: [number, number][] = [
  [0.12, 0.55],
  [0.4, 0.82],
  [0.9, 0.18],
];

export const polyPath = (points: [number, number][], w: number, h: number) => points.map(([x, y], i) => `${i ? "L" : "M"}${n(x * w)} ${n(y * h)}`).join(" ");

export const cssFont: Record<FontFamily, string> = {
  sans: "Helvetica, Arial, sans-serif",
  serif: '"Times New Roman", Times, serif',
  mono: '"Courier New", Courier, monospace',
};

/** Distance from the top of a 1.2 line box to the baseline, as a fraction of font size. */
export const baselineRatio: Record<FontFamily, number> = { sans: 0.947, serif: 0.938, mono: 0.866 };

const signatureFont: Record<SignatureStyle, string> = {
  script: '"Segoe Script", "Brush Script MT", "Snell Roundhand", cursive',
  formal: 'italic 400 {s}px Georgia, "Times New Roman", serif',
  initials: '600 {s}px Georgia, "Times New Roman", serif',
};

export const signatureText = (text: string, style: SignatureStyle) =>
  style === "initials"
    ? text
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : text;

/** Renders a typed signature to a transparent PNG data URL. */
export function renderSignature(text: string, style: SignatureStyle, color: string) {
  const s = 120;
  const font = style === "script" ? `${s}px ${signatureFont.script}` : signatureFont[style].replace("{s}", String(s));
  const shown = signatureText(text, style) || " ";
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = font;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(probe.measureText(shown).width + s * 0.5);
  canvas.height = Math.round(s * 1.5);
  const c = canvas.getContext("2d")!;
  c.font = font;
  c.fillStyle = color;
  c.textBaseline = "middle";
  c.fillText(shown, s * 0.25, canvas.height / 2);
  return { src: canvas.toDataURL("image/png"), ratio: canvas.width / canvas.height };
}

/** Crops a drawn signature canvas to its ink, with a little padding. */
export function trimCanvas(canvas: HTMLCanvasElement) {
  const c = canvas.getContext("2d")!;
  const { data, width, height } = c.getImageData(0, 0, canvas.width, canvas.height);
  let x0 = width,
    y0 = height,
    x1 = -1,
    y1 = -1;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 < 0) return null;
  const pad = 12;
  x0 = Math.max(0, x0 - pad);
  y0 = Math.max(0, y0 - pad);
  x1 = Math.min(width - 1, x1 + pad);
  y1 = Math.min(height - 1, y1 + pad);
  const out = document.createElement("canvas");
  out.width = x1 - x0 + 1;
  out.height = y1 - y0 + 1;
  out.getContext("2d")!.drawImage(canvas, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return { src: out.toDataURL("image/png"), ratio: out.width / out.height };
}
