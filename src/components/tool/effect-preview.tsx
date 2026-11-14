"use client";

import * as React from "react";
import type { OptionValues } from "@/components/tool/types";
import { PageThumb, type Thumb } from "@/components/tool/page-grid";
import { cn } from "@/lib/utils";

const INVERT_FILTER: Record<string, string> = {
  dark: "invert(1) hue-rotate(180deg)",
  sepia: "sepia(0.85) contrast(0.95) brightness(1.02)",
  contrast: "grayscale(1) contrast(1.8)",
};

const NUP: Record<number, { cols: number; rows: number; landscape: boolean }> = {
  2: { cols: 2, rows: 1, landscape: true },
  4: { cols: 2, rows: 2, landscape: false },
  6: { cols: 3, rows: 2, landscape: true },
  9: { cols: 3, rows: 3, landscape: false },
};

function Frame({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <figure className={cn("min-w-0", className)}>
      <figcaption className="mb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</figcaption>
      <div className="overflow-hidden rounded-xl border border-border bg-canvas p-2.5">{children}</div>
    </figure>
  );
}

function PageFace({
  thumb,
  className,
  style,
}: {
  thumb?: Thumb;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!thumb) return <PageThumb />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- local object URL rendered from the user's file
    <img src={thumb.url} alt="" draggable={false} className={cn("block w-full rounded-md bg-white shadow-xs ring-1 ring-border", className)} style={style} />
  );
}

function FlipAfter({ thumb, axis }: { thumb?: Thumb; axis: string }) {
  const sx = axis === "v" ? 1 : -1;
  const sy = axis === "h" ? 1 : -1;
  return (
    <div className="overflow-hidden rounded-md">
      <PageFace thumb={thumb} style={{ transform: `scale(${sx}, ${sy})` }} />
    </div>
  );
}

function InvertAfter({ thumb, mode }: { thumb?: Thumb; mode: string }) {
  return <PageFace thumb={thumb} style={{ filter: INVERT_FILTER[mode] ?? INVERT_FILTER.dark }} />;
}

function WatermarkAfter({ thumb, values }: { thumb?: Thumb; values: OptionValues }) {
  const host = React.useRef<HTMLDivElement>(null);
  const [minEdge, setMinEdge] = React.useState(180);
  const label = String(values.text || "CONFIDENTIAL");
  const opacity = Number(values.opacity ?? 20) / 100;
  const position = String(values.position ?? "center");
  const diagonal = Boolean(values.diagonal);
  const top = position === "top" ? "18%" : position === "bottom" ? "82%" : "50%";

  React.useEffect(() => {
    const el = host.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width && height) setMinEdge(Math.min(width, height));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [thumb?.url]);

  return (
    <div ref={host} className="relative overflow-hidden rounded-md">
      <PageFace thumb={thumb} />
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 whitespace-nowrap font-semibold tracking-[0.06em] text-[#595961] uppercase select-none"
        style={{
          top,
          opacity,
          fontSize: minEdge * (diagonal ? 0.11 : 0.07),
          transform: `translate(-50%, -50%)${diagonal ? " rotate(-45deg)" : ""}`,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function NupAfter({ thumbs, perSheet }: { thumbs: (Thumb | undefined)[]; perSheet: number }) {
  const layout = NUP[perSheet] ?? NUP[4];
  const cells = Array.from({ length: perSheet }, (_, i) => thumbs[i]);
  return (
    <div className={cn("overflow-hidden rounded-md bg-white p-1.5 shadow-xs ring-1 ring-border", layout.landscape ? "aspect-[1.414/1]" : "aspect-[1/1.414]")}>
      <div className="grid h-full w-full gap-1" style={{ gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))` }}>
        {cells.map((thumb, i) => (
          <div key={i} className="min-h-0 min-w-0 overflow-hidden rounded-[3px] bg-canvas ring-1 ring-border/70">
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL rendered from the user's file
              <img src={thumb.url} alt="" draggable={false} className="h-full w-full object-contain" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function EffectPreview({
  slug,
  thumbs,
  pageCount,
  values,
}: {
  slug: string;
  thumbs: (Thumb | undefined)[];
  pageCount: number;
  values: OptionValues;
}) {
  const first = thumbs[0];
  const after =
    slug === "flip-pdf" ? (
      <FlipAfter thumb={first} axis={String(values.axis ?? "h")} />
    ) : slug === "invert-pdf" ? (
      <InvertAfter thumb={first} mode={String(values.mode ?? "dark")} />
    ) : slug === "add-watermark" ? (
      <WatermarkAfter thumb={first} values={values} />
    ) : slug === "pages-per-sheet" ? (
      <NupAfter thumbs={thumbs} perSheet={Number(values.perSheet ?? 4)} />
    ) : null;

  if (!after) return null;

  const caption =
    slug === "pages-per-sheet"
      ? `First sheet · ${pageCount} ${pageCount === 1 ? "page" : "pages"} in the file`
      : `Page 1 of ${pageCount} · every page is processed`;

  return (
    <section aria-label="Live preview" className="rounded-2xl border border-border bg-background p-3 sm:p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-[13.5px] font-semibold tracking-[-0.01em]">Preview</h2>
        <p className="tabular text-[12px] text-muted-foreground">{caption}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Frame label="Original">
          <PageFace thumb={first} />
        </Frame>
        <Frame label="Result">{after}</Frame>
      </div>
    </section>
  );
}

export const EFFECT_PREVIEW_SLUGS = new Set(["flip-pdf", "invert-pdf", "pages-per-sheet", "add-watermark"]);

export function previewThumbCount(slug: string, pages: number) {
  if (slug === "pages-per-sheet") return Math.min(9, pages);
  if (EFFECT_PREVIEW_SLUGS.has(slug)) return Math.min(1, pages);
  return pages;
}
