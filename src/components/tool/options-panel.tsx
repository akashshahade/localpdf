"use client";

import * as React from "react";
import { ArrowRight, Info, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Slider, Switch } from "@/components/ui/controls";
import type { OptionValues } from "@/components/tool/types";
import type { Tool, ToolOption } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function defaultValues(tool: Tool): OptionValues {
  const v: OptionValues = {};
  for (const o of tool.options ?? []) v[o.id] = o.default ?? "";
  return v;
}

export function Segmented({
  value,
  onChange,
  choices,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  choices: { value: string; label: string; hint?: string }[];
  label: string;
}) {
  const hasHints = choices.some((c) => c.hint);
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-[3px] rounded-lg bg-secondary p-[3px]" style={{ gridTemplateColumns: `repeat(${choices.length}, minmax(0, 1fr))` }}>
      {choices.map((c) => {
        const active = c.value === value;
        return (
          <button
            key={c.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(c.value)}
            className={cn(
              "flex min-w-0 flex-col items-center justify-center rounded-md px-2 text-[12.5px] font-medium transition-[background-color,color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25",
              hasHints ? "py-1.5" : "h-[30px]",
              active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="flex items-center gap-1.5 truncate">
              {c.value.startsWith("#") && <span className="size-2.5 rounded-full" style={{ background: c.value }} aria-hidden />}
              {c.label}
            </span>
            {c.hint && <span className={cn("truncate text-[11px] font-normal", active ? "text-primary" : "text-subtle")}>{c.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}

function OptionField({ option, value, onChange }: { option: ToolOption; value: OptionValues[string]; onChange: (v: OptionValues[string]) => void }) {
  const id = `opt-${option.id}`;
  switch (option.type) {
    case "segmented":
      return (
        <div className="space-y-2">
          <Label>{option.label}</Label>
          <Segmented label={option.label} value={String(value)} onChange={onChange} choices={option.choices} />
        </div>
      );
    case "switch":
      return (
        <div className="flex items-start justify-between gap-4">
          <div>
            <Label htmlFor={id}>{option.label}</Label>
            {option.description && <p className="mt-0.5 text-[12px] text-muted-foreground">{option.description}</p>}
          </div>
          <Switch id={id} checked={Boolean(value)} onCheckedChange={onChange} />
        </div>
      );
    case "text":
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>{option.label}</Label>
          <Input
            id={id}
            type={option.secret ? "password" : "text"}
            value={String(value ?? "")}
            placeholder={option.placeholder}
            onChange={(e) => onChange(e.target.value)}
            autoComplete={option.secret ? "new-password" : "off"}
          />
        </div>
      );
    case "range":
      return (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label htmlFor={id}>{option.label}</Label>
            <span className="tabular text-[12.5px] font-medium text-muted-foreground">
              {String(value)}
              {option.unit}
            </span>
          </div>
          <Slider
            id={id}
            min={option.min}
            max={option.max}
            step={option.step}
            value={[Number(value)]}
            onValueChange={([v]) => onChange(v)}
            aria-label={option.label}
          />
        </div>
      );
  }
}

export function OptionsPanel({
  tool,
  values,
  onChange,
  onRun,
  blocker,
  summary,
}: {
  tool: Tool;
  values: OptionValues;
  onChange: (id: string, v: OptionValues[string]) => void;
  onRun: () => void;
  blocker?: string;
  summary?: string;
}) {
  const options = tool.options ?? [];
  return (
    <aside className={cn("flex-col rounded-2xl border border-border bg-background shadow-xs lg:sticky lg:top-20 lg:flex", options.length ? "flex" : "hidden")}>
      <div className="border-b border-border px-5 py-4">
        <p className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">Settings</p>
        <h2 className="mt-0.5 text-[15px] font-semibold">{tool.name}</h2>
      </div>
      <div className="flex flex-col gap-5 px-5 py-5">
        {options.length ? (
          options.map((o) => <OptionField key={o.id} option={o} value={values[o.id]} onChange={(v) => onChange(o.id, v)} />)
        ) : (
          <p className="text-[13px] text-muted-foreground">No settings needed — we&apos;ll pick the best defaults.</p>
        )}
      </div>
      <div className="mt-auto hidden space-y-3 border-t border-border px-5 py-4 lg:block">
        {blocker ? (
          <p className="flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-[12.5px] text-warning">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            {blocker}
          </p>
        ) : (
          summary && <p className="tabular text-[12.5px] text-muted-foreground">{summary}</p>
        )}
        <Button size="lg" className="hidden w-full lg:inline-flex" onClick={onRun} disabled={Boolean(blocker)}>
          {tool.action}
          <ArrowRight />
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-subtle">
          <Lock className="size-3" /> Processed on this device
        </p>
      </div>
    </aside>
  );
}
