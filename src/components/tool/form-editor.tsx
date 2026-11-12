"use client";

import * as React from "react";
import Link from "next/link";
import { FileWarning } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/controls";
import { PageThumb, type Thumb } from "@/components/tool/page-grid";
import type { FormFieldValue } from "@/components/tool/types";

export type FormField = { name: string; type: "text" | "checkbox" | "choice"; options?: string[]; multiline?: boolean };

const pretty = (name: string) => name.replace(/[_.-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function FormEditor({
  fields,
  values,
  onChange,
  thumb,
  loading,
}: {
  fields: FormField[];
  values: Record<string, FormFieldValue>;
  onChange: (name: string, value: FormFieldValue) => void;
  thumb?: Thumb;
  loading: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
      <div className="hidden md:block">
        <PageThumb thumb={thumb} />
      </div>
      <div className="rounded-2xl border border-border bg-background p-5">
        {loading ? (
          <p className="text-[13px] text-muted-foreground">Reading form fields…</p>
        ) : fields.length === 0 ? (
          <div className="flex gap-3">
            <FileWarning className="mt-0.5 size-4 shrink-0 text-warning" />
            <div>
              <p className="text-[14px] font-medium">This PDF has no fillable fields</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Use <Link href="/edit-pdf" className="font-medium text-primary hover:underline">Edit PDF</Link> to type anywhere on the page instead.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[12.5px] text-muted-foreground">
              {fields.length} field{fields.length > 1 ? "s" : ""} found
            </p>
            {fields.map((f) => {
              const id = `field-${f.name}`;
              if (f.type === "checkbox") {
                return (
                  <div key={f.name} className="flex items-center justify-between gap-4">
                    <Label htmlFor={id}>{pretty(f.name)}</Label>
                    <Switch id={id} checked={Boolean(values[f.name])} onCheckedChange={(v) => onChange(f.name, v)} />
                  </div>
                );
              }
              if (f.type === "choice") {
                return (
                  <div key={f.name} className="space-y-1.5">
                    <Label htmlFor={id}>{pretty(f.name)}</Label>
                    <select
                      id={id}
                      value={String(values[f.name] ?? "")}
                      onChange={(e) => onChange(f.name, e.target.value)}
                      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-[13.5px] shadow-xs outline-none focus-visible:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-primary/12"
                    >
                      <option value="">Choose…</option>
                      {f.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              return (
                <div key={f.name} className="space-y-1.5">
                  <Label htmlFor={id}>{pretty(f.name)}</Label>
                  <Input id={id} value={String(values[f.name] ?? "")} onChange={(e) => onChange(f.name, e.target.value)} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
