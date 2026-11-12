"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, RotateCw, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/controls";
import type { PageItem } from "@/components/tool/types";
import { cn } from "@/lib/utils";

export type Thumb = { url: string; blank: boolean; ratio: number };

export function PageThumb({ thumb, className }: { thumb?: Thumb; className?: string }) {
  if (thumb) {
    // eslint-disable-next-line @next/next/no-img-element -- local object URL rendered from the user's file
    return <img src={thumb.url} alt="" draggable={false} className={cn("block w-full rounded-md bg-white shadow-xs ring-1 ring-border", className)} />;
  }
  return <div className={cn("aspect-[1/1.414] w-full animate-pulse rounded-md bg-white shadow-xs ring-1 ring-border", className)} />;
}

export type PageGridMode = "arrange" | "select" | "view";

export function PageGrid({
  pages,
  thumbs,
  mode,
  selected,
  tone = "primary",
  previewRotation = 0,
  flagBlank,
  onToggle,
  onSelectAll,
  onClear,
  onRotate,
  onDelete,
  onReorder,
}: {
  pages: PageItem[];
  thumbs: (Thumb | undefined)[];
  mode: PageGridMode;
  selected: Set<string>;
  tone?: "primary" | "destructive";
  previewRotation?: number;
  flagBlank?: boolean;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
  onRotate: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
  onReorder: (from: number, to: number) => void;
}) {
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);
  const kept = pages.filter((p) => !p.deleted).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="tabular text-[13px] font-medium">
          {mode === "arrange" ? (
            <>
              Pages: {kept} <span className="text-muted-foreground">/ {pages.length}</span>
            </>
          ) : mode === "view" ? (
            <>
              {pages.length} <span className="text-muted-foreground">pages</span>
            </>
          ) : (
            <>
              {selected.size} <span className="text-muted-foreground">of {pages.length} selected</span>
            </>
          )}
        </p>
        <div className="flex items-center gap-1">
          {mode === "select" ? (
            <>
              <Button variant="ghost" size="xs" onClick={onSelectAll}>
                Select all
              </Button>
              <Button variant="ghost" size="xs" onClick={onClear} disabled={!selected.size}>
                Clear
              </Button>
            </>
          ) : mode === "arrange" ? (
            <p className="text-[12px] text-subtle">
              <span className="can-hover:hidden">Use the buttons under each page</span>
              <span className="hidden can-hover:inline">Drag to reorder · hover for actions</span>
            </p>
          ) : null}
        </div>
      </div>
      <div className={cn("grid gap-3 rounded-xl border border-border bg-canvas p-3 sm:grid-cols-4 sm:gap-4 sm:p-4 lg:grid-cols-5", mode === "arrange" ? "grid-cols-2" : "grid-cols-3")}>
        {pages.map((p, i) => {
          const isSelected = selected.has(p.id);
          const rotation = p.rotation + (isSelected ? previewRotation : 0);
          const blank = flagBlank && thumbs[p.n - 1]?.blank;
          return (
            <div
              key={p.id}
              draggable={mode === "arrange"}
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => {
                if (mode !== "arrange") return;
                e.preventDefault();
                setOverIndex(i);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null && dragIndex !== i) onReorder(dragIndex, i);
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={cn("group relative flex flex-col items-center gap-1.5", dragIndex === i && "opacity-40")}
            >
              <button
                type="button"
                onClick={() => (mode === "select" ? onToggle(p.id) : undefined)}
                aria-pressed={mode === "select" ? isSelected : undefined}
                aria-label={`Page ${p.n}${isSelected ? ", selected" : ""}`}
                className={cn(
                  "relative w-full rounded-lg p-1.5 transition-[background-color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25",
                  mode === "select" && "cursor-pointer hover:bg-white",
                  mode === "arrange" && "cursor-grab",
                  mode === "view" && "cursor-default",
                  isSelected && tone === "primary" && "bg-primary-soft ring-2 ring-primary",
                  isSelected && tone === "destructive" && "bg-destructive-soft ring-2 ring-destructive",
                  overIndex === i && dragIndex !== i && "ring-2 ring-primary",
                )}
              >
                <div className="transition-transform duration-300" style={{ transform: `rotate(${rotation}deg)` }}>
                  <PageThumb thumb={thumbs[p.n - 1]} className={cn(p.deleted && "opacity-30")} />
                </div>
                {p.deleted && (
                  <span className="absolute inset-0 grid place-items-center">
                    <Badge variant="destructive">Removed</Badge>
                  </span>
                )}
                {isSelected && (
                  <span
                    className={cn(
                      "absolute top-0.5 right-0.5 grid size-5 place-items-center rounded-full text-white shadow-sm",
                      tone === "destructive" ? "bg-destructive" : "bg-primary",
                    )}
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                )}
                {blank && !isSelected && (
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <Badge variant="warning">Blank</Badge>
                  </span>
                )}
              </button>
              {mode === "arrange" && (
                <div className="flex gap-0.5 rounded-lg border border-border bg-background p-0.5 shadow-sm can-hover:absolute can-hover:top-2 can-hover:left-1/2 can-hover:-translate-x-1/2 can-hover:opacity-0 can-hover:shadow-md can-hover:transition-opacity can-hover:group-focus-within:opacity-100 can-hover:group-hover:opacity-100">
                  <Tooltip content="Move earlier">
                    <Button variant="ghost" size="icon-xs" className="size-7 can-hover:size-6" disabled={i === 0} onClick={() => onReorder(i, i - 1)} aria-label={`Move page ${p.n} earlier`}>
                      <ArrowLeft />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Rotate left">
                    <Button variant="ghost" size="icon-xs" className="size-7 can-hover:size-6" onClick={() => onRotate(p.id, -90)} aria-label={`Rotate page ${p.n} left`}>
                      <RotateCcw />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Rotate right">
                    <Button variant="ghost" size="icon-xs" className="size-7 can-hover:size-6" onClick={() => onRotate(p.id, 90)} aria-label={`Rotate page ${p.n} right`}>
                      <RotateCw />
                    </Button>
                  </Tooltip>
                  <Tooltip content={p.deleted ? "Restore" : "Remove"}>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onDelete(p.id)}
                      aria-label={`${p.deleted ? "Restore" : "Remove"} page ${p.n}`}
                      className={cn("size-7 can-hover:size-6", !p.deleted && "hover:bg-destructive-soft hover:text-destructive")}
                    >
                      {p.deleted ? <Undo2 /> : <Trash2 />}
                    </Button>
                  </Tooltip>
                  <Tooltip content="Move later">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-7 can-hover:size-6"
                      disabled={i === pages.length - 1}
                      onClick={() => onReorder(i, i + 1)}
                      aria-label={`Move page ${p.n} later`}
                    >
                      <ArrowRight />
                    </Button>
                  </Tooltip>
                </div>
              )}
              <span className="tabular text-[11.5px] text-muted-foreground">{p.n}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
