"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, FileText, GripVertical, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/controls";
import type { InputFile } from "@/components/tool/types";
import { cn, formatBytes } from "@/lib/utils";

function FileIcon({ file }: { file: InputFile }) {
  const ref = React.useRef<HTMLImageElement>(null);
  const isImage = file.mime.startsWith("image/");
  // Create and revoke the URL in the same effect so a remount never shows an already-revoked URL.
  React.useEffect(() => {
    if (!isImage || !ref.current) return;
    const url = URL.createObjectURL(file.blob);
    ref.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [isImage, file.blob]);
  if (isImage)
    // eslint-disable-next-line @next/next/no-img-element -- local object URL of the user's photo
    return <img ref={ref} alt="" className="size-11 shrink-0 rounded-lg bg-canvas object-cover ring-1 ring-border" />;
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
      <FileText className="size-4" />
    </span>
  );
}

export function FileList({
  files,
  multiple,
  onReorder,
  onRemove,
  onAdd,
}: {
  files: InputFile[];
  multiple?: boolean;
  onReorder: (from: number, to: number) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);
  const total = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium">
          {files.length} {files.length === 1 ? "file" : "files"}
          <span className="tabular ml-2 text-muted-foreground">{formatBytes(total)}</span>
        </p>
        {multiple && files.length > 1 && <p className="hidden text-[12px] text-subtle sm:block">Drag to reorder</p>}
      </div>
      <ul className="space-y-2">
        {files.map((f, i) => (
          <li
            key={f.id}
            draggable={multiple}
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => {
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
            className={cn(
              "group flex items-center gap-3 rounded-xl border bg-background px-3 py-2.5 transition-[border-color,opacity,box-shadow] animate-in fade-in-0 slide-in-from-bottom-1",
              overIndex === i && dragIndex !== i ? "border-primary shadow-[0_0_0_3px_rgba(255,69,0,0.12)]" : "border-border",
              dragIndex === i && "opacity-50",
            )}
          >
            {multiple && <GripVertical className="hidden size-4 shrink-0 cursor-grab text-subtle can-hover:block" aria-hidden />}
            <FileIcon file={f} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-medium">{f.name}</span>
              <span className="tabular block text-[12px] text-muted-foreground">
                {formatBytes(f.size)}
                {f.mime.startsWith("image/") ? "" : ` · ${f.pages} ${f.pages === 1 ? "page" : "pages"}`}
              </span>
            </span>
            {multiple && (
              <span className="flex items-center gap-0.5">
                <Tooltip content="Move up">
                  <Button variant="ghost" size="icon-sm" className="sm:size-6" disabled={i === 0} onClick={() => onReorder(i, i - 1)} aria-label={`Move ${f.name} up`}>
                    <ArrowUp />
                  </Button>
                </Tooltip>
                <Tooltip content="Move down">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="sm:size-6"
                    disabled={i === files.length - 1}
                    onClick={() => onReorder(i, i + 1)}
                    aria-label={`Move ${f.name} down`}
                  >
                    <ArrowDown />
                  </Button>
                </Tooltip>
              </span>
            )}
            <Tooltip content="Remove">
              <Button variant="ghost" size="icon-sm" className="sm:size-6" onClick={() => onRemove(f.id)} aria-label={`Remove ${f.name}`}>
                <X />
              </Button>
            </Tooltip>
          </li>
        ))}
      </ul>
      {multiple && (
        <button
          onClick={onAdd}
          className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#d4d4d8] text-[13px] font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary-soft/40 hover:text-primary"
        >
          <Plus className="size-4" />
          Add more files
        </button>
      )}
    </div>
  );
}
