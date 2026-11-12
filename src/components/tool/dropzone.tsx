"use client";

import * as React from "react";
import { Camera, FileUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptMap, type Tool } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function Dropzone({ tool, onFiles }: { tool: Tool; onFiles: (files: File[]) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cameraRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const accept = acceptMap[tool.accept];
  const noun = tool.accept === "pdf" ? "PDF" : "file";
  const plural = tool.multiple ? `${noun}s` : noun;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onFiles(Array.from(e.dataTransfer.files));
      }}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors sm:py-20",
        dragging ? "border-primary bg-primary-soft/60" : "border-[#e4e4e7] bg-background hover:border-[#d4d4d8]",
      )}
    >
      <span
        className={cn(
          "grid size-14 place-items-center rounded-2xl border bg-background shadow-sm transition-transform",
          dragging ? "scale-105 border-primary/40 text-primary" : "border-border text-ink",
        )}
      >
        <tool.icon className="size-6" strokeWidth={1.75} />
      </span>
      <h2 className="mt-5 text-[17px] font-semibold tracking-[-0.02em]">
        {dragging ? `Drop to open` : `Drop your ${plural} here`}
      </h2>
      <p className="mt-1 text-[13px] text-muted-foreground">
        or choose {tool.multiple ? "files" : "a file"} from your device · {accept.label}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button size="lg" onClick={() => inputRef.current?.click()}>
          <FileUp />
          Choose {tool.multiple ? "files" : "file"}
        </Button>
        {tool.slug === "scan-to-pdf" && (
          <Button size="lg" variant="ink" onClick={() => cameraRef.current?.click()}>
            <Camera />
            Use camera
          </Button>
        )}
      </div>
      <p className="mt-6 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <Lock className="size-3 text-success" />
        Files open in this tab and are never uploaded.
      </p>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept.mime}
        multiple={tool.multiple}
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      {tool.slug === "scan-to-pdf" && (
        <input
          ref={cameraRef}
          type="file"
          hidden
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            onFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      )}
    </div>
  );
}
