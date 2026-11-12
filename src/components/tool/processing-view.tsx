"use client";

import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tool } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function ProgressRing({ value, size = 88, stroke = 6 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F1F3" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - Math.min(1, Math.max(0, value)))}
        className="transition-[stroke-dashoffset] duration-300 ease-out"
      />
    </svg>
  );
}

export function ProcessingView({ tool, value, label, fileName, onCancel }: { tool: Tool; value: number; label?: string; fileName: string; onCancel: () => void }) {
  const steps = [
    { label: "Reading your file", done: value > 0.02 },
    { label: label && value < 0.98 ? label : tool.action, done: value >= 0.98 },
    { label: "Saving the result", done: false },
  ];
  const activeIndex = steps.findIndex((s) => !s.done);
  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-border bg-background p-8 shadow-xs animate-in fade-in-0" role="status" aria-live="polite">
      <div className="flex items-center gap-5">
        <div className="relative grid shrink-0 place-items-center">
          <ProgressRing value={value} />
          <span className="tabular absolute text-[17px] font-semibold tracking-[-0.03em]">{Math.round(value * 100)}%</span>
        </div>
        <div className="min-w-0">
          <p className="text-[16px] font-semibold tracking-[-0.02em]">{tool.action.replace(/\bPDFs?\b/, "").trim() || tool.name}…</p>
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{fileName}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2 py-0.5 text-[11.5px] font-medium text-success">
            <span className="size-1.5 rounded-full bg-success" /> Running on this device
          </p>
        </div>
      </div>
      <ol className="mt-7 space-y-3 border-t border-border pt-5">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center gap-3 text-[13.5px]">
            <span
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-full",
                s.done ? "bg-primary text-white" : i === activeIndex ? "text-primary" : "border border-dashed border-[#d4d4d8]",
              )}
            >
              {s.done ? <Check className="size-3" strokeWidth={3} /> : i === activeIndex ? <Loader2 className="size-4 animate-spin" /> : null}
            </span>
            <span className={cn("truncate", s.done || i === activeIndex ? "text-foreground" : "text-subtle")}>{s.label}</span>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
