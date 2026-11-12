export type InputFile = {
  id: string;
  name: string;
  size: number;
  pages: number;
  blob: Blob;
  mime: string;
  encrypted?: boolean;
};

export type PageItem = {
  id: string;
  n: number;
  rotation: number;
  deleted: boolean;
};

export type OptionValues = Record<string, string | number | boolean>;

export type Stage = "upload" | "configure" | "processing" | "done";

export type EditorKind = "text" | "highlight" | "shape" | "draw" | "image" | "signature" | "redact" | "check";

export type FontFamily = "sans" | "serif" | "mono";
export type SignatureStyle = "script" | "formal" | "initials";

/** Box in % of the page, top-left origin. Text uses only x/y; its size comes from the font. */
export type EditorItem = {
  id: string;
  kind: EditorKind;
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  /** Points: font size for text, stroke width for ink and shapes. */
  size: number;
  opacity?: number;
  text?: string;
  font?: FontFamily;
  bold?: boolean;
  fill?: boolean;
  /** Ink points, 0–1 within the box. */
  points?: [number, number][];
  /** Image or signature: object URL or PNG data URL. */
  src?: string;
  blob?: Blob;
  ratio?: number;
  signature?: { text: string; style: SignatureStyle };
};

export type FormFieldValue = string | boolean;

export type OutputFile = { name: string; blob: Blob };

export type Report =
  | { kind: "sizes"; before: number; after: number; note?: string }
  | { kind: "breakdown"; total: number; parts: { label: string; bytes: number; tip: string }[] }
  | { kind: "hashes"; files: { name: string; hashes: [string, string][] }[] }
  | { kind: "findings"; rows: { tone: "success" | "warning" | "destructive"; label: string; text: string }[]; empty: string }
  | { kind: "text"; text: string; label: string };

export type ToolOutput = {
  files: OutputFile[];
  report?: Report;
  message?: string;
};
