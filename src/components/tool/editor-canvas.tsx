"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Bold,
  Check,
  Copy,
  EyeOff,
  Highlighter,
  Image as ImageIcon,
  MousePointer2,
  Pencil,
  Redo2,
  Signature,
  Square,
  Trash2,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider, Tooltip } from "@/components/ui/controls";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/overlays";
import { PageThumb, type Thumb } from "@/components/tool/page-grid";
import type { EditorItem, EditorKind, FontFamily, SignatureStyle } from "@/components/tool/types";
import { checkPoints, cssFont, polyPath, renderSignature, strokePath, trimCanvas } from "@/lib/pdf/ink";
import { cn } from "@/lib/utils";

type EditorTool = "select" | EditorKind;
export type PageInfo = { url: string; width: number; height: number };
type Style = { color: string; size: number; opacity: number; font: FontFamily; bold: boolean; fill: boolean };
type StyledKind = "text" | "draw" | "highlight" | "shape" | "check";
type Sig = { mode: "type" | "draw"; text: string; style: SignatureStyle; color: string; drawn?: { src: string; ratio: number } };
type Draft = { kind: "draw"; points: [number, number][] } | { kind: "highlight" | "shape" | "redact"; x0: number; y0: number; x1: number; y1: number };

const toolMeta: Record<EditorTool, { label: string; icon: LucideIcon; hint: string }> = {
  select: { label: "Select", icon: MousePointer2, hint: "Click an item to select it. Drag to move, drag the corner to resize, double-click text to edit." },
  text: { label: "Text", icon: Type, hint: "Click anywhere to type. Click existing text to edit it." },
  highlight: { label: "Highlight", icon: Highlighter, hint: "Drag across the text you want to highlight." },
  draw: { label: "Draw", icon: Pencil, hint: "Hold and drag to draw freehand." },
  shape: { label: "Rectangle", icon: Square, hint: "Drag to draw a box. Choose white + Filled to cover something up." },
  image: { label: "Image", icon: ImageIcon, hint: "Click where the image should go." },
  signature: { label: "Signature", icon: Signature, hint: "Type or draw your signature, then click on the page to place it." },
  redact: { label: "Redact area", icon: EyeOff, hint: "Drag over anything you want permanently removed." },
  check: { label: "Checkmark", icon: Check, hint: "Click to place a checkmark." },
};

const toolsets: Record<string, EditorTool[]> = {
  "edit-pdf": ["select", "text", "highlight", "draw", "shape", "image", "signature", "check"],
  "sign-pdf": ["select", "signature", "text", "draw", "check"],
  "redact-pdf": ["select", "redact"],
};

const INK = ["#18181b", "#dc2626", "#2563eb", "#16a34a", "#ff4500", "#ffffff"];
const MARKER = ["#fde047", "#86efac", "#f9a8d4", "#93c5fd", "#fdba74"];
const SIG_INK = ["#18181b", "#1e3a8a", "#2563eb"];

const base: Style = { color: "#18181b", size: 14, opacity: 1, font: "sans", bold: false, fill: false };
const initialStyles: Record<StyledKind, Style> = {
  text: base,
  draw: { ...base, color: "#2563eb", size: 3 },
  highlight: { ...base, color: "#fde047", opacity: 0.4 },
  shape: { ...base, color: "#dc2626", size: 2 },
  check: { ...base, color: "#16a34a" },
};
const sizeRange: Partial<Record<StyledKind, [number, number, string]>> = {
  text: [6, 72, "Size"],
  draw: [1, 24, "Thickness"],
  shape: [1, 16, "Border"],
};

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));
const isStyled = (k: EditorTool): k is StyledKind => k in initialStyles;

function drag(onMove: (e: PointerEvent) => void, onUp: () => void) {
  const up = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", up);
    onUp();
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", up);
}

export function EditorCanvas({
  slug,
  pageCount,
  items,
  onItemsChange,
  thumbs,
  loadPage,
}: {
  slug: string;
  pageCount: number;
  items: EditorItem[];
  onItemsChange: (items: EditorItem[]) => void;
  thumbs: (Thumb | undefined)[];
  loadPage: (n: number) => Promise<PageInfo>;
}) {
  const set = toolsets[slug] ?? toolsets["edit-pdf"];
  const [active, setActive] = React.useState<EditorTool>(set[1] ?? "select");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [past, setPast] = React.useState<EditorItem[][]>([]);
  const [future, setFuture] = React.useState<EditorItem[][]>([]);
  const [page, setPage] = React.useState(1);
  const [zoom, setZoom] = React.useState(100);
  const [pages, setPages] = React.useState<Record<number, PageInfo>>({});
  const [styles, setStyles] = React.useState(initialStyles);
  const [sig, setSig] = React.useState<Sig>({ mode: "type", text: "", style: "script", color: "#1e3a8a" });
  const [padOpen, setPadOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [box, setBox] = React.useState({ w: 0, h: 0 });

  const pageRef = React.useRef<HTMLDivElement>(null);
  const itemsRef = React.useRef(items);
  const editingRef = React.useRef<string | null>(null);
  const freshText = React.useRef<string | null>(null);
  const imageInput = React.useRef<HTMLInputElement>(null);
  const pendingImage = React.useRef<{ x: number; y: number } | null>(null);

  React.useLayoutEffect(() => {
    itemsRef.current = items;
  }, [items]);

  React.useEffect(() => {
    if (pages[page]) return;
    let live = true;
    loadPage(page).then((info) => live && setPages((m) => ({ ...m, [page]: info })));
    return () => {
      live = false;
    };
  }, [page, pages, loadPage]);

  React.useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pxPerPt = box.w / (pages[page]?.width ?? 595);
  const aspect = box.h ? box.w / box.h : 0.707;

  // Every mutation goes through itemsRef so handlers that fire in the same tick (pointerdown + blur) see each other's changes.
  const live = (next: EditorItem[]) => {
    itemsRef.current = next;
    onItemsChange(next);
  };
  const remember = (before: EditorItem[]) => {
    setPast((p) => [...p.slice(-99), before]);
    setFuture([]);
  };
  const commit = (next: EditorItem[]) => {
    remember(itemsRef.current);
    live(next);
  };
  const patchItem = (id: string, patch: Partial<EditorItem>) => commit(itemsRef.current.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const undo = () => {
    if (!past.length) return;
    setFuture((f) => [itemsRef.current, ...f]);
    live(past[past.length - 1]);
    setPast((p) => p.slice(0, -1));
    setSelectedId(null);
    editingRef.current = null;
    setEditingId(null);
  };
  const redo = () => {
    if (!future.length) return;
    setPast((p) => [...p, itemsRef.current]);
    live(future[0]);
    setFuture((f) => f.slice(1));
  };
  const remove = (id = selectedId) => {
    if (!id) return;
    commit(itemsRef.current.filter((i) => i.id !== id));
    setSelectedId((s) => (s === id ? null : s));
  };
  const duplicate = () => {
    const item = itemsRef.current.find((i) => i.id === selectedId);
    if (!item) return;
    const copy = { ...item, id: crypto.randomUUID(), x: clamp(item.x + 2, 0, 100 - item.w), y: clamp(item.y + 2, 0, 100 - item.h) };
    commit([...itemsRef.current, copy]);
    setSelectedId(copy.id);
  };

  const pointAt = (e: { clientX: number; clientY: number }) => {
    const r = pageRef.current!.getBoundingClientRect();
    return { x: clamp(((e.clientX - r.left) / r.width) * 100), y: clamp(((e.clientY - r.top) / r.height) * 100) };
  };

  const currentSignature = () => (sig.mode === "draw" ? (sig.drawn ?? null) : sig.text.trim() ? renderSignature(sig.text.trim(), sig.style, sig.color) : null);

  const startEditing = (id: string) => {
    editingRef.current = id;
    setEditingId(id);
  };
  // The edit box is swapped out on the next render, and browsers don't fire blur for removed nodes, so save it first.
  const flushEditing = () => {
    const el = pageRef.current?.querySelector<HTMLElement>("[data-editing]");
    if (el?.dataset.editing) commitText(el.dataset.editing, el.innerText);
  };

  const onPagePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    flushEditing();
    const start = pointAt(e);
    if (active === "select") {
      setSelectedId(null);
      return;
    }
    const id = crypto.randomUUID();
    const add = (item: EditorItem, select = true) => {
      commit([...itemsRef.current, item]);
      if (select) setSelectedId(item.id);
    };

    if (active === "text") {
      const s = styles.text;
      const lineH = box.h ? ((s.size * pxPerPt * 1.2) / box.h) * 100 : 2;
      add({ id, kind: "text", page, x: start.x, y: clamp(start.y - lineH / 2), w: 0, h: 0, ...s, text: "" });
      freshText.current = id;
      startEditing(id);
      return;
    }
    if (active === "check") {
      const w = 3.2;
      const h = w * aspect;
      add({ id, kind: "check", page, x: clamp(start.x - w / 2, 0, 100 - w), y: clamp(start.y - h / 2, 0, 100 - h), w, h, ...styles.check });
      return;
    }
    if (active === "signature") {
      const s = currentSignature();
      if (!s) {
        toast.error(sig.mode === "draw" ? "Draw your signature first" : "Type your name first", { description: "Use the signature settings above the page." });
        return;
      }
      const w = 26;
      const h = (w * aspect) / s.ratio;
      add({
        id,
        kind: "signature",
        page,
        x: clamp(start.x - w / 2, 0, 100 - w),
        y: clamp(start.y - h / 2, 0, 100 - h),
        w,
        h,
        color: sig.color,
        size: 0,
        src: s.src,
        ratio: s.ratio,
        signature: sig.mode === "type" ? { text: sig.text.trim(), style: sig.style } : undefined,
      });
      return;
    }
    if (active === "image") {
      pendingImage.current = start;
      imageInput.current?.click();
      return;
    }
    if (active === "draw") {
      const points: [number, number][] = [[start.x, start.y]];
      setDraft({ kind: "draw", points });
      drag(
        (ev) => {
          const p = pointAt(ev);
          const last = points[points.length - 1];
          if (Math.hypot(p.x - last[0], (p.y - last[1]) / aspect) < 0.12) return;
          points.push([p.x, p.y]);
          setDraft({ kind: "draw", points: [...points] });
        },
        () => {
          setDraft(null);
          const xs = points.map((p) => p[0]);
          const ys = points.map((p) => p[1]);
          const x = Math.min(...xs);
          const y = Math.min(...ys);
          const w = Math.max(Math.max(...xs) - x, 0.2);
          const h = Math.max(Math.max(...ys) - y, 0.2);
          const s = styles.draw;
          add({ id, kind: "draw", page, x, y, w, h, color: s.color, size: s.size, opacity: s.opacity, points: points.map(([px, py]) => [(px - x) / w, (py - y) / h]) }, false);
        },
      );
      return;
    }
    // Box tools: highlight, rectangle, redact.
    const kind = active as "highlight" | "shape" | "redact";
    let current = { x0: start.x, y0: start.y, x1: start.x, y1: start.y };
    setDraft({ kind, ...current });
    drag(
      (ev) => {
        const p = pointAt(ev);
        current = { ...current, x1: p.x, y1: p.y };
        setDraft({ kind, ...current });
      },
      () => {
        setDraft(null);
        let x = Math.min(current.x0, current.x1);
        let y = Math.min(current.y0, current.y1);
        let w = Math.abs(current.x1 - current.x0);
        let h = Math.abs(current.y1 - current.y0);
        if (w < 1 && h < 1) {
          [w, h] = kind === "shape" ? [22, 9] : kind === "highlight" ? [24, 2.2] : [26, 2.6];
          x = clamp(start.x - w / 2, 0, 100 - w);
          y = clamp(start.y - h / 2, 0, 100 - h);
        }
        const s = kind === "redact" ? { ...base, color: "#000000" } : styles[kind];
        add({ id, kind, page, x, y, w, h, color: s.color, size: s.size, opacity: s.opacity, fill: s.fill });
      },
    );
  };

  const onItemPointerDown = (e: React.PointerEvent, item: EditorItem) => {
    e.stopPropagation();
    if (e.button !== 0 || editingId === item.id) return;
    flushEditing();
    const wasSelected = selectedId === item.id;
    setSelectedId(item.id);
    const start = pointAt(e);
    const before = itemsRef.current;
    let moved = false;
    drag(
      (ev) => {
        const p = pointAt(ev);
        const dx = p.x - start.x;
        const dy = p.y - start.y;
        if (!moved && Math.abs(dx) + Math.abs(dy) < 0.4) return;
        moved = true;
        const maxX = item.kind === "text" ? 98 : 100 - item.w;
        const maxY = item.kind === "text" ? 98 : 100 - item.h;
        live(before.map((i) => (i.id === item.id ? { ...i, x: clamp(item.x + dx, 0, maxX), y: clamp(item.y + dy, 0, maxY) } : i)));
      },
      () => {
        if (moved) remember(before);
        else if (item.kind === "text" && (wasSelected || active === "text")) startEditing(item.id);
      },
    );
  };

  const onResizePointerDown = (e: React.PointerEvent, item: EditorItem) => {
    e.stopPropagation();
    const start = pointAt(e);
    const before = itemsRef.current;
    const keepRatio = item.kind === "image" || item.kind === "signature" || item.kind === "check";
    let moved = false;
    drag(
      (ev) => {
        const p = pointAt(ev);
        const w = clamp(item.w + p.x - start.x, 1, 100 - item.x);
        const h = keepRatio ? (w * item.h) / item.w : clamp(item.h + p.y - start.y, 0.5, 100 - item.y);
        moved = true;
        live(before.map((i) => (i.id === item.id ? { ...i, w, h } : i)));
      },
      () => moved && remember(before),
    );
  };

  const commitText = (id: string, raw: string) => {
    if (editingRef.current !== id) return;
    editingRef.current = null;
    const text = raw.replace(/\n+$/, "");
    setEditingId((cur) => (cur === id ? null : cur));
    const isFresh = freshText.current === id;
    freshText.current = null;
    if (!text.trim()) {
      // A new box left empty disappears without leaving an undo step.
      if (isFresh) {
        live(itemsRef.current.filter((i) => i.id !== id));
        setPast((p) => p.slice(0, -1));
      } else remove(id);
      return;
    }
    const item = itemsRef.current.find((i) => i.id === id);
    if (!item || item.text === text) return;
    if (isFresh) live(itemsRef.current.map((i) => (i.id === id ? { ...i, text } : i)));
    else patchItem(id, { text });
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (mod && key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && key === "y") {
        e.preventDefault();
        redo();
      } else if (mod && key === "d" && selectedId) {
        e.preventDefault();
        duplicate();
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        remove();
      } else if (e.key === "Escape") {
        setSelectedId(null);
        setActive("select");
      } else if (e.key === "Enter" && selectedId && itemsRef.current.find((i) => i.id === selectedId)?.kind === "text") {
        e.preventDefault();
        startEditing(selectedId);
      } else if (selectedId && e.key.startsWith("Arrow")) {
        e.preventDefault();
        const step = e.shiftKey ? 1 : 0.2;
        const [dx, dy] = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key] ?? [0, 0];
        const item = itemsRef.current.find((i) => i.id === selectedId);
        if (item) patchItem(item.id, { x: clamp(item.x + dx, 0, 100 - item.w), y: clamp(item.y + dy, 0, 100 - item.h) });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const selected = items.find((i) => i.id === selectedId && i.page === page) ?? null;
  const target: EditorTool = selected?.kind ?? active;

  const changeStyle = (patch: Partial<Style>) => {
    if (isStyled(target)) setStyles((s) => ({ ...s, [target]: { ...s[target], ...patch } }));
    if (selected) patchItem(selected.id, patch);
  };

  const changeSig = (patch: Partial<Sig>) => {
    const next = { ...sig, ...patch };
    setSig(next);
    if (selected?.kind !== "signature") return;
    if (next.mode === "type" && next.text.trim()) {
      const r = renderSignature(next.text.trim(), next.style, next.color);
      const w = clamp((selected.h * r.ratio) / aspect, 1, 100 - selected.x);
      patchItem(selected.id, { src: r.src, ratio: r.ratio, w, color: next.color, signature: { text: next.text.trim(), style: next.style } });
    } else if (next.mode === "draw" && next.drawn && patch.drawn) {
      patchItem(selected.id, { src: next.drawn.src, ratio: next.drawn.ratio, w: clamp((selected.h * next.drawn.ratio) / aspect, 1, 100 - selected.x), signature: undefined });
    }
  };

  const selectItem = (id: string | null) => {
    setSelectedId(id);
    const item = itemsRef.current.find((i) => i.id === id);
    if (item?.kind === "signature" && item.signature) setSig((s) => ({ ...s, mode: "type", text: item.signature!.text, style: item.signature!.style, color: item.color }));
  };

  const pageItems = items.filter((i) => i.page === page);
  const info = pages[page];
  const src = info?.url ?? thumbs[page - 1]?.url;
  const style: Style = selected ? { ...base, ...(isStyled(selected.kind) ? styles[selected.kind] : {}), ...selected, opacity: selected.opacity ?? 1 } : isStyled(active) ? styles[active] : base;

  return (
    <div className="flex flex-col gap-3">
      <div className="sticky top-14 z-20 rounded-xl border border-border bg-background/95 shadow-xs backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-1 p-1">
          {set.map((t) => {
            const meta = toolMeta[t];
            const isActive = active === t;
            return (
              <Tooltip key={t} content={meta.label}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActive(t);
                    setSelectedId(null);
                  }}
                  aria-pressed={isActive}
                  className={cn("gap-1.5 px-2.5", isActive && "bg-primary-soft text-primary hover:bg-primary-soft hover:text-primary")}
                >
                  <meta.icon className="size-4" />
                  <span className="hidden xl:inline">{meta.label}</span>
                </Button>
              </Tooltip>
            );
          })}
          <span className="mx-1 h-5 w-px bg-border" aria-hidden />
          <Tooltip content="Undo (Ctrl+Z)">
            <Button variant="ghost" size="icon-sm" onClick={undo} disabled={!past.length} aria-label="Undo">
              <Undo2 />
            </Button>
          </Tooltip>
          <Tooltip content="Redo (Ctrl+Y)">
            <Button variant="ghost" size="icon-sm" onClick={redo} disabled={!future.length} aria-label="Redo">
              <Redo2 />
            </Button>
          </Tooltip>
          <div className="ml-auto flex items-center gap-0.5">
            <Button variant="ghost" size="icon-sm" onClick={() => setZoom((z) => Math.max(50, z - 25))} aria-label="Zoom out">
              <ZoomOut />
            </Button>
            <button onClick={() => setZoom(100)} className="tabular w-11 text-center text-[12px] text-muted-foreground hover:text-foreground">
              {zoom}%
            </button>
            <Button variant="ghost" size="icon-sm" onClick={() => setZoom((z) => Math.min(250, z + 25))} aria-label="Zoom in">
              <ZoomIn />
            </Button>
          </div>
        </div>

        <div className="flex min-h-12 flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-3 py-2">
          {target === "signature" ? (
            <SignatureControls sig={sig} onChange={changeSig} onDraw={() => setPadOpen(true)} />
          ) : isStyled(target) ? (
            <StyleControls kind={target} style={style} onChange={changeStyle} />
          ) : (
            <p className="text-[12.5px] text-muted-foreground">{toolMeta[target].hint}</p>
          )}
          {selected && (
            <div className="ml-auto flex items-center gap-1">
              <Tooltip content="Duplicate (Ctrl+D)">
                <Button variant="ghost" size="icon-sm" onClick={duplicate} aria-label="Duplicate">
                  <Copy />
                </Button>
              </Tooltip>
              <Tooltip content="Delete (Del)">
                <Button variant="ghost" size="icon-sm" onClick={() => remove()} aria-label="Delete" className="text-destructive hover:text-destructive">
                  <Trash2 />
                </Button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[96px_minmax(0,1fr)]">
        <div className="hidden max-h-[760px] flex-col gap-2 overflow-y-auto rounded-xl border border-border bg-canvas p-2 lg:flex">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => {
            const count = items.filter((i) => i.page === n).length;
            return (
              <button
                key={n}
                onClick={() => {
                  setPage(n);
                  setSelectedId(null);
                }}
                aria-label={`Go to page ${n}`}
                aria-current={page === n ? "page" : undefined}
                className={cn("relative rounded-md p-1 transition-colors", page === n ? "bg-primary-soft ring-2 ring-primary" : "hover:bg-white")}
              >
                <PageThumb thumb={thumbs[n - 1]} />
                <span className="tabular mt-1 block text-[11px] text-muted-foreground">{n}</span>
                {count > 0 && <span className="tabular absolute top-0 right-0 grid size-4 place-items-center rounded-full bg-primary text-[9.5px] font-semibold text-white">{count}</span>}
              </button>
            );
          })}
        </div>

        <div className="overflow-auto rounded-xl border border-border bg-canvas p-3 sm:p-8 lg:max-h-[78vh]">
          <div className="mx-auto" style={{ width: zoom * 7.2, maxWidth: zoom <= 100 ? "100%" : undefined, minWidth: 260 }}>
            <div
              ref={pageRef}
              onPointerDown={onPagePointerDown}
              className={cn("relative select-none", active === "select" ? "cursor-default" : active === "text" ? "cursor-text touch-none" : "cursor-crosshair touch-none")}
              role="presentation"
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element -- local object URL rendered from the user's file
                <img src={src} alt={`Page ${page}`} draggable={false} className="pointer-events-none block w-full bg-white shadow-md" />
              ) : (
                <div className="aspect-[1/1.414] w-full animate-pulse bg-white shadow-md" />
              )}
              {pageItems.map((item) => (
                <ItemView
                  key={item.id}
                  item={item}
                  pxPerPt={pxPerPt}
                  selected={selectedId === item.id}
                  editing={editingId === item.id}
                  interactive={active !== "draw"}
                  onPointerDown={(e) => {
                    onItemPointerDown(e, item);
                    selectItem(item.id);
                  }}
                  onDoubleClick={() => item.kind === "text" && startEditing(item.id)}
                  onResize={(e) => onResizePointerDown(e, item)}
                  onCommitText={(t) => commitText(item.id, t)}
                />
              ))}
              {draft && <DraftView draft={draft} style={draft.kind === "redact" ? base : styles[draft.kind]} pxPerPt={pxPerPt} />}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 lg:hidden">
        <Button variant="outline" size="xs" disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </Button>
        <span className="tabular text-[12px] text-muted-foreground">
          Page {page} of {pageCount}
        </span>
        <Button variant="outline" size="xs" disabled={page === pageCount} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>

      <SignaturePad
        open={padOpen}
        onOpenChange={setPadOpen}
        color={sig.color}
        onDone={(drawn) => {
          changeSig({ mode: "draw", drawn });
          setActive("signature");
        }}
      />
      <input
        ref={imageInput}
        type="file"
        hidden
        accept="image/png,image/jpeg,image/webp"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          const pos = pendingImage.current;
          if (!file || !pos) return;
          const bmp = await createImageBitmap(file);
          const ratio = bmp.width / bmp.height;
          const w = 30;
          const h = (w * aspect) / ratio;
          const item: EditorItem = {
            id: crypto.randomUUID(),
            kind: "image",
            page,
            x: clamp(pos.x - w / 2, 0, 100 - w),
            y: clamp(pos.y - h / 2, 0, 100 - h),
            w,
            h,
            color: "#000000",
            size: 0,
            src: URL.createObjectURL(file),
            blob: file,
            ratio,
          };
          commit([...itemsRef.current, item]);
          setSelectedId(item.id);
        }}
      />
    </div>
  );
}

function ItemView({
  item,
  pxPerPt,
  selected,
  editing,
  interactive,
  onPointerDown,
  onDoubleClick,
  onResize,
  onCommitText,
}: {
  item: EditorItem;
  pxPerPt: number;
  selected: boolean;
  editing: boolean;
  interactive: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onDoubleClick: () => void;
  onResize: (e: React.PointerEvent) => void;
  onCommitText: (text: string) => void;
}) {
  const isText = item.kind === "text";
  const pos: React.CSSProperties = { left: `${item.x}%`, top: `${item.y}%`, ...(isText ? {} : { width: `${item.w}%`, height: `${item.h}%` }) };
  const stroke = Math.max(0.75, item.size * pxPerPt);

  let body: React.ReactNode = null;
  switch (item.kind) {
    case "text":
      body = <TextBox item={item} pxPerPt={pxPerPt} editing={editing} onCommit={onCommitText} />;
      break;
    case "highlight":
      body = <div className="size-full mix-blend-multiply" style={{ background: item.color, opacity: item.opacity ?? 0.4 }} />;
      break;
    case "shape":
      body = <div className="size-full" style={item.fill ? { background: item.color, opacity: item.opacity } : { border: `${stroke}px solid ${item.color}`, opacity: item.opacity }} />;
      break;
    case "redact":
      body = <div className="size-full bg-black" />;
      break;
    case "draw":
    case "check":
      body = (
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="size-full overflow-visible" aria-hidden>
          <path
            d={item.kind === "draw" ? strokePath(item.points ?? [], 1000, 1000) : polyPath(checkPoints, 1000, 1000)}
            fill="none"
            stroke={item.color}
            strokeOpacity={item.opacity ?? 1}
            strokeWidth={item.kind === "draw" ? stroke : 120}
            vectorEffect={item.kind === "draw" ? "non-scaling-stroke" : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
      break;
    case "image":
    case "signature":
      // eslint-disable-next-line @next/next/no-img-element -- local image chosen or drawn by the user
      body = item.src ? <img src={item.src} alt="" draggable={false} className="pointer-events-none size-full" /> : null;
      break;
  }

  return (
    <div
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      className={cn(
        "group absolute touch-none",
        interactive ? (editing ? "cursor-text" : "cursor-move") : "pointer-events-none",
        selected ? "outline-[1.5px] outline-offset-2 outline-primary outline-dashed" : interactive && "hover:outline hover:outline-1 hover:outline-offset-2 hover:outline-primary/50",
      )}
      style={pos}
    >
      {body}
      {selected && !isText && (
        <span
          onPointerDown={onResize}
          className="absolute -right-2 -bottom-2 size-3 cursor-nwse-resize rounded-[3px] border-[1.5px] border-primary bg-white shadow-sm before:absolute before:-inset-3 before:content-['']"
          aria-hidden
        />
      )}
    </div>
  );
}

function TextBox({ item, pxPerPt, editing, onCommit }: { item: EditorItem; pxPerPt: number; editing: boolean; onCommit: (t: string) => void }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!editing || !el) return;
    el.innerText = item.text ?? "";
    // Wait a frame: the click that created the box would otherwise move focus straight back to the page.
    const raf = requestAnimationFrame(() => {
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    });
    return () => cancelAnimationFrame(raf);
  }, [editing, item.text]);

  const css: React.CSSProperties = {
    color: item.color,
    fontSize: item.size * pxPerPt,
    fontFamily: cssFont[item.font ?? "sans"],
    fontWeight: item.bold ? 700 : 400,
    lineHeight: 1.2,
  };
  if (editing)
    return (
      <div
        key="edit"
        ref={ref}
        contentEditable="plaintext-only"
        suppressContentEditableWarning
        data-placeholder="Type here"
        data-editing={item.id}
        onBlur={(e) => onCommit(e.currentTarget.innerText)}
        onKeyDown={(e) => e.key === "Escape" && e.currentTarget.blur()}
        className="min-w-[1ch] whitespace-pre caret-primary outline-none empty:before:text-subtle empty:before:content-[attr(data-placeholder)]"
        style={css}
      />
    );
  return (
    <div key="view" className="whitespace-pre" style={css}>
      {item.text}
    </div>
  );
}

function DraftView({ draft, style, pxPerPt }: { draft: Draft; style: Style; pxPerPt: number }) {
  if (draft.kind === "draw")
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
        <polyline
          points={draft.points.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke={style.color}
          strokeOpacity={style.opacity}
          strokeWidth={Math.max(0.75, style.size * pxPerPt)}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  const x = Math.min(draft.x0, draft.x1);
  const y = Math.min(draft.y0, draft.y1);
  const pos = { left: `${x}%`, top: `${y}%`, width: `${Math.abs(draft.x1 - draft.x0)}%`, height: `${Math.abs(draft.y1 - draft.y0)}%` };
  const look: React.CSSProperties =
    draft.kind === "redact"
      ? { background: "rgba(0,0,0,0.75)" }
      : draft.kind === "highlight"
        ? { background: style.color, opacity: style.opacity, mixBlendMode: "multiply" }
        : style.fill
          ? { background: style.color }
          : { border: `${Math.max(0.75, style.size * pxPerPt)}px solid ${style.color}` };
  return <div className="pointer-events-none absolute" style={{ ...pos, ...look }} />;
}

function Seg<T extends string>({ value, onChange, choices, label }: { value: T; onChange: (v: T) => void; choices: { value: T; label: React.ReactNode }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg bg-secondary p-[3px]">
      {choices.map((c) => (
        <button
          key={c.value}
          role="radio"
          aria-checked={c.value === value}
          onClick={() => onChange(c.value)}
          className={cn(
            "h-7 rounded-md px-2.5 text-[12.5px] font-medium transition-colors",
            c.value === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

function Swatches({ colors, value, onChange }: { colors: string[]; value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Colour">
      {colors.map((c) => (
        <button
          key={c}
          role="radio"
          aria-checked={value.toLowerCase() === c}
          aria-label={c}
          onClick={() => onChange(c)}
          className={cn(
            "size-6 rounded-full border border-black/10 transition-transform hover:scale-110",
            value.toLowerCase() === c && "ring-2 ring-primary ring-offset-2",
          )}
          style={{ background: c }}
        />
      ))}
      <label
        className="relative size-6 cursor-pointer overflow-hidden rounded-full border border-black/10 transition-transform hover:scale-110"
        style={{ background: "conic-gradient(#f43f5e, #f59e0b, #84cc16, #06b6d4, #6366f1, #d946ef, #f43f5e)" }}
        title="Custom colour"
      >
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Custom colour" />
      </label>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function StyleControls({ kind, style, onChange }: { kind: StyledKind; style: Style; onChange: (p: Partial<Style>) => void }) {
  const range = sizeRange[kind];
  return (
    <>
      <Field label="Colour">
        <Swatches colors={kind === "highlight" ? MARKER : INK} value={style.color} onChange={(color) => onChange({ color })} />
      </Field>
      {range && (
        <Field label={range[2]}>
          <Slider className="w-28" min={range[0]} max={range[1]} step={1} value={[style.size]} onValueChange={([size]) => onChange({ size })} />
          <span className="tabular w-9 text-[12px] text-muted-foreground">{style.size}pt</span>
        </Field>
      )}
      {kind === "text" && (
        <>
          <Seg
            label="Font"
            value={style.font}
            onChange={(font) => onChange({ font })}
            choices={[
              { value: "sans", label: <span style={{ fontFamily: cssFont.sans }}>Sans</span> },
              { value: "serif", label: <span style={{ fontFamily: cssFont.serif }}>Serif</span> },
              { value: "mono", label: <span style={{ fontFamily: cssFont.mono }}>Mono</span> },
            ]}
          />
          <Tooltip content="Bold">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-pressed={style.bold}
              onClick={() => onChange({ bold: !style.bold })}
              className={cn(style.bold && "bg-primary-soft text-primary hover:bg-primary-soft hover:text-primary")}
              aria-label="Bold"
            >
              <Bold />
            </Button>
          </Tooltip>
        </>
      )}
      {kind === "shape" && (
        <Seg
          label="Style"
          value={style.fill ? "fill" : "outline"}
          onChange={(v) => onChange({ fill: v === "fill" })}
          choices={[
            { value: "outline", label: "Outline" },
            { value: "fill", label: "Filled" },
          ]}
        />
      )}
      {kind === "draw" && (
        <Field label="Opacity">
          <Slider className="w-24" min={10} max={100} step={5} value={[Math.round(style.opacity * 100)]} onValueChange={([o]) => onChange({ opacity: o / 100 })} />
        </Field>
      )}
    </>
  );
}

function SignatureControls({ sig, onChange, onDraw }: { sig: Sig; onChange: (p: Partial<Sig>) => void; onDraw: () => void }) {
  return (
    <>
      <Seg
        label="Signature type"
        value={sig.mode}
        onChange={(mode) => (mode === "draw" && !sig.drawn ? onDraw() : onChange({ mode }))}
        choices={[
          { value: "type", label: "Type" },
          { value: "draw", label: "Draw" },
        ]}
      />
      {sig.mode === "type" ? (
        <>
          <Input value={sig.text} onChange={(e) => onChange({ text: e.target.value })} placeholder="Type your name" className="h-8 w-44 text-[13px]" aria-label="Your name" />
          <Seg
            label="Style"
            value={sig.style}
            onChange={(style) => onChange({ style })}
            choices={[
              { value: "script", label: <span style={{ fontFamily: '"Segoe Script","Brush Script MT",cursive' }}>Script</span> },
              { value: "formal", label: <span className="font-serif italic">Formal</span> },
              { value: "initials", label: "Initials" },
            ]}
          />
        </>
      ) : (
        <div className="flex items-center gap-2">
          {sig.drawn && (
            // eslint-disable-next-line @next/next/no-img-element -- data URL drawn by the user
            <img src={sig.drawn.src} alt="Your drawn signature" className="h-8 max-w-40 rounded border border-border bg-white object-contain px-1" />
          )}
          <Button variant="outline" size="xs" onClick={onDraw}>
            <Pencil />
            {sig.drawn ? "Redraw" : "Draw signature"}
          </Button>
        </div>
      )}
      <Field label="Ink">
        <Swatches colors={SIG_INK} value={sig.color} onChange={(color) => onChange({ color })} />
      </Field>
    </>
  );
}

function SignaturePad({ open, onOpenChange, color, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; color: string; onDone: (s: { src: string; ratio: number }) => void }) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [empty, setEmpty] = React.useState(true);

  const setup = React.useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
  }, []);

  const clear = () => {
    const c = canvasRef.current;
    c?.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setEmpty(true);
  };
  const close = () => {
    setEmpty(true);
    onOpenChange(false);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const r = canvas.getBoundingClientRect();
    const k = canvas.width / r.width;
    const c = canvas.getContext("2d")!;
    c.strokeStyle = color;
    c.lineWidth = 2.6 * k;
    c.lineCap = "round";
    c.lineJoin = "round";
    let last = { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k };
    c.beginPath();
    c.moveTo(last.x, last.y);
    c.lineTo(last.x + 0.1, last.y);
    c.stroke();
    setEmpty(false);
    drag(
      (ev) => {
        const p = { x: (ev.clientX - r.left) * k, y: (ev.clientY - r.top) * k };
        c.beginPath();
        c.moveTo(last.x, last.y);
        c.quadraticCurveTo(last.x, last.y, (last.x + p.x) / 2, (last.y + p.y) / 2);
        c.lineTo(p.x, p.y);
        c.stroke();
        last = p;
      },
      () => {},
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-lg p-5">
        <DialogTitle className="text-[15px] font-semibold">Draw your signature</DialogTitle>
        <DialogDescription className="mt-1 text-[13px] text-muted-foreground">Use your mouse, trackpad or finger. It stays on your device.</DialogDescription>
        <div className="relative mt-4 rounded-xl border border-border bg-white">
          <canvas ref={setup} onPointerDown={onPointerDown} className="block h-48 w-full cursor-crosshair touch-none" />
          <span className="pointer-events-none absolute inset-x-8 bottom-10 border-b border-dashed border-[#d4d4d8]" aria-hidden />
          {empty && <span className="pointer-events-none absolute inset-0 grid place-items-center text-[13px] text-subtle">Sign here</span>}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={clear} disabled={empty}>
            Clear
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={empty}
              onClick={() => {
                const out = canvasRef.current && trimCanvas(canvasRef.current);
                if (!out) return;
                onDone(out);
                close();
              }}
            >
              Use signature
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
