"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Check, Copy, Download, FileArchive, FileImage, FileText, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/tool/processing-view";
import type { OutputFile, Report, ToolOutput } from "@/components/tool/types";
import { getNextSteps, type Tool } from "@/lib/tools";
import { setHandoff } from "@/lib/pdf/handoff";
import { formatBytes, cn } from "@/lib/utils";

function download(file: OutputFile) {
  const url = URL.createObjectURL(file.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

const iconFor = (name: string) => (/\.zip$/i.test(name) ? FileArchive : /\.(jpe?g|png|jp2)$/i.test(name) ? FileImage : FileText);

export function ResultPanel({
  tool,
  output,
  elapsed,
  preview,
  onReset,
  onAdjust,
}: {
  tool: Tool;
  output: ToolOutput;
  elapsed: number;
  preview?: string;
  onReset: () => void;
  onAdjust?: () => void;
}) {
  const files = output.files;
  const main = files[0];
  const isImage = Boolean(main && /\.(jpe?g|png)$/i.test(main.name));
  const next = files.length === 1 && (isImage || main.name.toLowerCase().endsWith(".pdf")) ? getNextSteps(tool) : [];
  const save = (f: OutputFile) => download(f);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 animate-in fade-in-0 slide-in-from-bottom-1">
      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-xs">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <span className="grid size-8 place-items-center rounded-full bg-success-soft text-success">
            <Check className="size-4" strokeWidth={2.75} />
          </span>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold tracking-[-0.02em]">{files.length ? (files.length > 1 ? "Your files are ready" : "Your file is ready") : "Done"}</h2>
            <p className="tabular text-[12.5px] text-muted-foreground">
              Finished on your device in {(elapsed / 1000).toFixed(1)}s · nothing was uploaded
            </p>
          </div>
        </div>

        {main && (
          <div className="flex flex-row items-start gap-4 p-4 sm:items-center sm:gap-5 sm:p-6">
            <div className={cn("shrink-0", isImage ? "w-28 sm:w-40" : "w-16 sm:w-28")}>
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element -- local object URL of the generated file
                <img src={preview} alt="" className={cn("w-full rounded-md shadow-md ring-1 ring-border", isImage ? "bg-[repeating-conic-gradient(#f4f4f5_0_25%,#fff_0_50%)] bg-[length:12px_12px]" : "bg-white")} />
              ) : (
                <div className="grid aspect-[1/1.2] w-full place-items-center rounded-xl bg-canvas ring-1 ring-border">
                  {React.createElement(iconFor(main.name), { className: "size-8 text-muted-foreground", strokeWidth: 1.5 })}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold">{main.name}</p>
              <p className="tabular mt-0.5 text-[13px] text-muted-foreground">
                {formatBytes(main.blob.size)}
                {files.length > 1 && ` · ${files.length} files`}
              </p>
              {output.message && <p className="mt-2 text-[13px] text-foreground">{output.message}</p>}
              {output.report?.kind === "sizes" && <SizeCompare report={output.report} />}
              <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
                <Button size="lg" onClick={() => save(main)}>
                  <Download />
                  Download
                </Button>
                <Button size="lg" variant="outline" onClick={onAdjust ?? onReset}>
                  <RotateCcw />
                  {onAdjust ? "Change settings" : "Start over"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {files.length > 1 && (
          <ul className="divide-y divide-border border-t border-border">
            {files.map((f) => {
              const Icon = iconFor(f.name);
              return (
                <li key={f.name} className="flex items-center gap-3 px-6 py-2.5">
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-[13px]">{f.name}</span>
                  <span className="tabular text-[12px] text-muted-foreground">{formatBytes(f.blob.size)}</span>
                  <Button variant="ghost" size="icon-xs" aria-label={`Download ${f.name}`} onClick={() => save(f)}>
                    <Download />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}

        {output.report && output.report.kind !== "sizes" && (
          <div className="border-t border-border p-6">
            <ReportView report={output.report} />
            {!main && (
              <div className="mt-5">
                <Button size="lg" variant="outline" onClick={onReset}>
                  <RotateCcw />
                  Check another file
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {next.length > 0 && (
        <div>
          <p className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">Continue with this file</p>
          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {next.map((t) => (
              <Link
                key={t.slug}
                href={`/${t.slug}`}
                onClick={() => setHandoff({ id: crypto.randomUUID(), name: main.name, size: main.blob.size, pages: 0, blob: main.blob, mime: main.blob.type || "application/pdf" })}
                className="group flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-[13px] font-medium transition-colors hover:border-[#dcdce0]"
              >
                <t.icon className="size-4 text-muted-foreground group-hover:text-primary" />
                <span className="truncate">{t.name}</span>
                <ArrowRight className="ml-auto size-3.5 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-subtle">Your result opens straight in the next tool — no need to add it again.</p>
        </div>
      )}
    </div>
  );
}

function SizeCompare({ report }: { report: Extract<Report, { kind: "sizes" }> }) {
  const saved = report.before > 0 ? Math.max(0, 1 - report.after / report.before) : 0;
  return (
    <div className="mt-4 flex items-center gap-4 rounded-xl border border-border bg-canvas p-3.5">
      <div className="relative grid shrink-0 place-items-center">
        <ProgressRing value={saved} size={56} stroke={5} />
        <span className="tabular absolute text-[12px] font-semibold">{Math.round(saved * 100)}%</span>
      </div>
      <div className="min-w-0 text-[13px]">
        <p className="tabular">
          <span className="text-muted-foreground line-through">{formatBytes(report.before)}</span>
          <ArrowRight className="mx-1.5 inline size-3.5 text-subtle" />
          <span className="font-semibold">{formatBytes(report.after)}</span>
        </p>
        <p className="mt-0.5 text-[12.5px] text-muted-foreground">{report.note ?? `${formatBytes(report.before - report.after)} smaller`}</p>
      </div>
    </div>
  );
}

const segmentColors = ["#FF4500", "#18181B", "#FF8A5C", "#71717A", "#D4D4D8"];

function ReportView({ report }: { report: Report }) {
  if (report.kind === "breakdown") {
    return (
      <div>
        <div className="flex items-baseline justify-between">
          <p className="text-[13px] font-semibold">What&apos;s inside this file</p>
          <p className="tabular text-[12.5px] text-muted-foreground">{formatBytes(report.total)} total</p>
        </div>
        <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-secondary">
          {report.parts.map((p, i) => (
            <div key={p.label} style={{ width: `${(p.bytes / report.total) * 100}%`, background: segmentColors[i % segmentColors.length] }} title={p.label} />
          ))}
        </div>
        <ul className="mt-4 divide-y divide-border">
          {report.parts.map((p, i) => (
            <li key={p.label} className="flex gap-3 py-3">
              <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ background: segmentColors[i % segmentColors.length] }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13.5px] font-medium">{p.label}</span>
                  <span className="tabular text-[12.5px] text-muted-foreground">
                    {formatBytes(p.bytes)} · {Math.round((p.bytes / report.total) * 100)}%
                  </span>
                </div>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">{p.tip}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (report.kind === "hashes") {
    return (
      <div className="space-y-3">
        {report.files.map((f) => (
          <div key={f.name} className="rounded-xl border border-border p-3.5">
            <p className="truncate text-[13px] font-medium">{f.name}</p>
            {f.hashes.map(([algo, hex]) => (
              <div key={algo} className="mt-2 flex items-center gap-2">
                <span className="w-16 shrink-0 text-[11.5px] font-medium text-subtle">{algo}</span>
                <code className="min-w-0 flex-1 truncate font-mono text-[11.5px]">{hex}</code>
                <CopyButton text={hex} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  if (report.kind === "findings") {
    return report.rows.length ? (
      <ul className="max-h-96 divide-y divide-border overflow-y-auto rounded-xl border border-border">
        {report.rows.map((r, i) => (
          <li key={i} className="flex items-start gap-3 px-3.5 py-2.5">
            <Badge variant={r.tone} className="shrink-0">
              {r.label}
            </Badge>
            <p className="min-w-0 text-[13px] break-words">{r.text}</p>
          </li>
        ))}
      </ul>
    ) : (
      <p className="flex items-center gap-2 rounded-xl bg-success-soft px-4 py-3 text-[13px] text-success">
        <Check className="size-4" /> {report.empty}
      </p>
    );
  }
  if (report.kind === "text") {
    return (
      <div className="rounded-xl border border-border bg-canvas">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="text-[12px] font-medium text-muted-foreground">{report.label}</span>
          <CopyButton text={report.text} />
        </div>
        <pre className="max-h-72 overflow-auto px-4 py-3 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-muted-foreground">{report.text.slice(0, 6000)}</pre>
      </div>
    );
  }
  return null;
}

function CopyButton({ text }: { text: string }) {
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label="Copy"
      onClick={() => {
        navigator.clipboard?.writeText(text);
        toast.success("Copied");
      }}
    >
      <Copy />
    </Button>
  );
}
