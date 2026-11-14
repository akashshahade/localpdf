"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Clock, FileText, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/tool/dropzone";
import { FileList } from "@/components/tool/file-list";
import { EffectPreview, EFFECT_PREVIEW_SLUGS, previewThumbCount } from "@/components/tool/effect-preview";
import { PageGrid, type Thumb } from "@/components/tool/page-grid";
import { EditorCanvas } from "@/components/tool/editor-canvas";
import { FormEditor, type FormField } from "@/components/tool/form-editor";
import { OptionsPanel, defaultValues } from "@/components/tool/options-panel";
import { ProcessingView } from "@/components/tool/processing-view";
import { ResultPanel } from "@/components/tool/result-panel";
import { Stepper } from "@/components/tool/stepper";
import type { EditorItem, FormFieldValue, InputFile, OptionValues, PageItem, Stage, ToolOutput } from "@/components/tool/types";
import { acceptMap, getRelated, getTool, type Tool } from "@/lib/tools";
import { formatBytes, cn } from "@/lib/utils";
import type { PDFDocumentProxy } from "pdfjs-dist";

type Incoming = Omit<InputFile, "id" | "pages">;

function isAccepted(file: File, tool: Tool) {
  const name = file.name.toLowerCase();
  if (tool.accept === "pdf") return file.type === "application/pdf" || name.endsWith(".pdf");
  if (tool.accept === "image") return file.type.startsWith("image/");
  if (tool.accept === "audio") return file.type.startsWith("audio/");
  return acceptMap[tool.accept].mime
    .split(",")
    .filter((m) => m.startsWith("."))
    .some((ext) => name.endsWith(ext));
}

const makePages = (count: number): PageItem[] => Array.from({ length: count }, (_, i) => ({ id: crypto.randomUUID(), n: i + 1, rotation: 0, deleted: false }));

function move<T>(arr: T[], from: number, to: number) {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function isBlank(canvas: HTMLCanvasElement) {
  const c = canvas.getContext("2d", { willReadFrequently: true })!;
  const { data } = c.getImageData(0, 0, canvas.width, canvas.height);
  let ink = 0;
  for (let i = 0; i < data.length; i += 16) if (data[i] < 235 || data[i + 1] < 235 || data[i + 2] < 235) ink++;
  return ink / (data.length / 16) < 0.002;
}

export function ToolWorkspace({ slug }: { slug: string }) {
  const tool = getTool(slug)!;
  const [stage, setStage] = React.useState<Stage>("upload");
  const [files, setFiles] = React.useState<InputFile[]>([]);
  const [pages, setPages] = React.useState<PageItem[]>([]);
  const [thumbs, setThumbs] = React.useState<(Thumb | undefined)[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [values, setValues] = React.useState<OptionValues>(() => defaultValues(tool));
  const [edits, setEdits] = React.useState<EditorItem[]>([]);
  const [formFields, setFormFields] = React.useState<FormField[]>([]);
  const [formValues, setFormValues] = React.useState<Record<string, FormFieldValue>>({});
  const [formLoading, setFormLoading] = React.useState(false);
  const [progress, setProgress] = React.useState({ value: 0, label: "" });
  const [output, setOutput] = React.useState<ToolOutput | null>(null);
  const [preview, setPreview] = React.useState<string>();
  const [elapsed, setElapsed] = React.useState(0);

  const addMoreRef = React.useRef<HTMLInputElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const viewRef = React.useRef<{ id: string; doc: PDFDocumentProxy } | null>(null);
  const renderToken = React.useRef(0);
  const urls = React.useRef<string[]>([]);

  const keepUrl = (url: string) => {
    urls.current.push(url);
    return url;
  };

  React.useEffect(() => {
    const created = urls.current;
    return () => {
      abortRef.current?.abort();
      created.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const viewDoc = React.useCallback(async (file: InputFile) => {
    if (viewRef.current?.id === file.id) return viewRef.current.doc;
    const { openPdf } = await import("@/lib/pdf/pdfjs");
    const doc = await openPdf(new Uint8Array(await file.blob.arrayBuffer()));
    viewRef.current = { id: file.id, doc };
    return doc;
  }, []);

  const renderThumbs = async (file: InputFile, count: number) => {
    const token = ++renderToken.current;
    const { renderPage, canvasToBlob } = await import("@/lib/pdf/pdfjs");
    const doc = await viewDoc(file);
    for (let n = 1; n <= count; n++) {
      if (token !== renderToken.current) return;
      const { canvas } = await renderPage(doc, n, { width: 240 });
      const thumb: Thumb = { url: keepUrl(URL.createObjectURL(await canvasToBlob(canvas, "image/jpeg", 0.8))), blank: isBlank(canvas), ratio: canvas.width / canvas.height };
      if (token !== renderToken.current) return;
      setThumbs((prev) => {
        const next = [...prev];
        next[n - 1] = thumb;
        return next;
      });
    }
  };

  const loadPage = React.useCallback(
    async (n: number) => {
      const { renderPage, canvasToBlob } = await import("@/lib/pdf/pdfjs");
      const doc = await viewDoc(files[0]);
      const { canvas, page } = await renderPage(doc, n, { width: 1600 });
      const { width, height } = page.getViewport({ scale: 1 });
      return { url: keepUrl(URL.createObjectURL(await canvasToBlob(canvas, "image/jpeg", 0.9))), width, height };
    },
    [files, viewDoc],
  );

  const readFields = async (file: InputFile) => {
    setFormLoading(true);
    try {
      const { loadPdf } = await import("@/lib/pdf/core");
      const { PDFCheckBox, PDFDropdown, PDFOptionList, PDFRadioGroup, PDFTextField } = await import("@cantoo/pdf-lib");
      const form = (await loadPdf(file.blob)).getForm();
      const fields: FormField[] = [];
      const initial: Record<string, FormFieldValue> = {};
      for (const f of form.getFields()) {
        const name = f.getName();
        if (f instanceof PDFTextField) {
          fields.push({ name, type: "text" });
          initial[name] = f.getText() ?? "";
        } else if (f instanceof PDFCheckBox) {
          fields.push({ name, type: "checkbox" });
          initial[name] = f.isChecked();
        } else if (f instanceof PDFDropdown || f instanceof PDFOptionList) {
          fields.push({ name, type: "choice", options: f.getOptions() });
          initial[name] = f.getSelected()[0] ?? "";
        } else if (f instanceof PDFRadioGroup) {
          fields.push({ name, type: "choice", options: f.getOptions() });
          initial[name] = f.getSelected() ?? "";
        }
      }
      setFormFields(fields);
      setFormValues(initial);
    } finally {
      setFormLoading(false);
    }
  };

  const ingest = async (incoming: Incoming[]) => {
    const { openPdf, PasswordRequiredError } = await import("@/lib/pdf/pdfjs");
    const ready: InputFile[] = [];
    for (const f of incoming) {
      let pageCount = 1;
      let encrypted = false;
      if (tool.accept === "pdf") {
        try {
          const doc = await openPdf(new Uint8Array(await f.blob.arrayBuffer()));
          pageCount = doc.numPages;
          await doc.loadingTask.destroy();
        } catch (e) {
          if (e instanceof PasswordRequiredError && tool.slug === "remove-password") encrypted = true;
          else {
            toast.error(`Couldn't open ${f.name}`, { description: (e as Error).message });
            continue;
          }
        }
      }
      ready.push({ ...f, id: crypto.randomUUID(), pages: encrypted ? 0 : pageCount, encrypted });
    }
    if (!ready.length) return;

    const nextFiles = tool.multiple ? [...files, ...ready] : ready.slice(0, 1);
    const firstChanged = !tool.multiple || !files.length;
    setFiles(nextFiles);
    setStage("configure");

    if (firstChanged && tool.accept === "pdf" && !nextFiles[0].encrypted) {
      const needPages = tool.workspace !== "files";
      const needPreview = EFFECT_PREVIEW_SLUGS.has(tool.slug);
      if (needPages || needPreview) {
        if (needPages) {
          setPages(makePages(nextFiles[0].pages));
          setSelected(new Set());
          setEdits([]);
          if (tool.workspace === "form") void readFields(nextFiles[0]);
        }
        const n = needPages ? nextFiles[0].pages : previewThumbCount(tool.slug, nextFiles[0].pages);
        setThumbs(new Array(n));
        void renderThumbs(nextFiles[0], n);
      }
    }
  };

  React.useEffect(() => {
    let live = true;
    import("@/lib/pdf/handoff").then(({ takeHandoff }) => {
      const f = live ? takeHandoff() : null;
      const accept = getTool(slug)?.accept;
      const fits = f && (accept === "pdf" ? f.mime === "application/pdf" : accept === "image" && f.mime.startsWith("image/"));
      if (f && fits) void ingest([{ name: f.name, size: f.size, blob: f.blob, mime: f.mime }]);
    });
    return () => {
      live = false;
    };
    // Run once on mount to pick up a file handed over from the previous tool.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = async (raw: File[]) => {
    const ok = raw.filter((f) => isAccepted(f, tool));
    const rejected = raw.length - ok.length;
    if (rejected) {
      toast.error(`${rejected} file${rejected > 1 ? "s" : ""} skipped`, { description: `${tool.name} accepts ${acceptMap[tool.accept].label} only.` });
    }
    if (!ok.length) return;
    await ingest(ok.map((f) => ({ name: f.name, size: f.size, blob: f, mime: f.type })));
  };

  const reset = () => {
    abortRef.current?.abort();
    renderToken.current++;
    void viewRef.current?.doc.loadingTask.destroy();
    viewRef.current = null;
    setFiles([]);
    setPages([]);
    setThumbs([]);
    setSelected(new Set());
    setEdits([]);
    setFormFields([]);
    setOutput(null);
    setPreview(undefined);
    setStage("upload");
  };

  const removeFile = (id: string) => {
    const next = files.filter((f) => f.id !== id);
    if (!next.length) return reset();
    setFiles(next);
  };

  const run = async () => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStage("processing");
    setProgress({ value: 0, label: "" });
    const started = performance.now();
    try {
      const { processors } = await import("@/lib/pdf/processors");
      const out = await processors[tool.slug]({
        tool,
        files,
        values,
        pages,
        selected,
        edits,
        form: formValues,
        signal: ctrl.signal,
        progress: (value, label) => setProgress({ value: Math.min(0.99, value), label: label ?? "" }),
      });
      if (ctrl.signal.aborted) return;
      setProgress({ value: 1, label: "" });
      const main = out.files[0];
      if (main?.name.toLowerCase().endsWith(".pdf")) {
        try {
          const { openPdf, renderPage, canvasToBlob } = await import("@/lib/pdf/pdfjs");
          const doc = await openPdf(new Uint8Array(await main.blob.arrayBuffer()));
          const { canvas } = await renderPage(doc, 1, { width: 280 });
          setPreview(keepUrl(URL.createObjectURL(await canvasToBlob(canvas, "image/jpeg", 0.85))));
          await doc.loadingTask.destroy();
        } catch {
          setPreview(undefined);
        }
      } else if (main && /\.(jpe?g|png)$/i.test(main.name)) setPreview(keepUrl(URL.createObjectURL(main.blob)));
      else setPreview(undefined);
      setOutput(out);
      setElapsed(performance.now() - started);
      setStage("done");
    } catch (e) {
      if ((e as Error).name === "AbortError" || ctrl.signal.aborted) return;
      toast.error("That didn't work", { description: (e as Error).message || "Something went wrong while processing the file." });
      setStage("configure");
    }
  };

  const cancel = () => {
    abortRef.current?.abort();
    setStage("configure");
    toast("Cancelled", { description: "Nothing was changed." });
  };

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (tool.comingSoon) return <ComingSoon tool={tool} />;

  const pageMode = tool.slug === "organize-pages" ? "arrange" : ["split-pdf", "crop-pdf", "split-in-half"].includes(tool.slug) ? "view" : "select";
  const blocker = getBlocker(tool, files, selected, pages, values, edits, formFields, formLoading);
  const summary = getSummary(tool, files, selected, pages);

  if (stage === "upload") {
    return (
      <div className="flex flex-col gap-5">
        <Stepper stage={stage} />
        <Dropzone tool={tool} onFiles={addFiles} />
      </div>
    );
  }

  if (stage === "processing") {
    return (
      <div className="flex flex-col gap-5">
        <Stepper stage={stage} />
        <ProcessingView tool={tool} value={progress.value} label={progress.label} fileName={files.length > 1 ? `${files.length} files` : (files[0]?.name ?? "")} onCancel={cancel} />
      </div>
    );
  }

  if (stage === "done" && output) {
    return (
      <div className="flex flex-col gap-5">
        <Stepper stage={stage} />
        <ResultPanel
          tool={tool}
          output={output}
          elapsed={elapsed}
          preview={preview}
          onReset={reset}
          onAdjust={tool.output === "image" ? () => setStage("configure") : undefined}
        />
      </div>
    );
  }

  const wide = tool.workspace === "editor" && !tool.options?.length;
  const filesMain = tool.workspace === "files" || tool.accept !== "pdf" || files[0]?.encrypted;
  const main =
    filesMain ? (
      <div className="flex flex-col gap-4">
        <FileList files={files} multiple={tool.multiple} onReorder={(from, to) => setFiles((f) => move(f, from, to))} onRemove={removeFile} onAdd={() => addMoreRef.current?.click()} />
        {EFFECT_PREVIEW_SLUGS.has(tool.slug) && files[0] && !files[0].encrypted && (
          <EffectPreview slug={tool.slug} thumbs={thumbs} pageCount={files[0].pages} values={values} />
        )}
      </div>
    ) : (
      <div className="flex flex-col gap-3">
        <FileChip file={files[0]} onReplace={() => addMoreRef.current?.click()} onRemove={reset}>
          {wide && (
            <>
              <span className="hidden max-w-64 truncate text-[12.5px] text-muted-foreground xl:inline">{blocker ?? summary}</span>
              <Button className="hidden lg:inline-flex" onClick={run} disabled={Boolean(blocker)}>
                {tool.action}
                <ArrowRight />
              </Button>
            </>
          )}
        </FileChip>
        {tool.workspace === "pages" && (
          <PageGrid
            pages={pages}
            thumbs={thumbs}
            mode={pageMode}
            selected={selected}
            tone={tool.slug === "delete-pages" ? "destructive" : "primary"}
            previewRotation={tool.slug === "rotate-pdf" ? Number(values.angle) : 0}
            flagBlank={tool.slug === "delete-pages"}
            onToggle={toggle}
            onSelectAll={() => setSelected(new Set(pages.map((p) => p.id)))}
            onClear={() => setSelected(new Set())}
            onRotate={(id, d) => setPages((ps) => ps.map((p) => (p.id === id ? { ...p, rotation: p.rotation + d } : p)))}
            onDelete={(id) => setPages((ps) => ps.map((p) => (p.id === id ? { ...p, deleted: !p.deleted } : p)))}
            onReorder={(from, to) => setPages((ps) => move(ps, from, to))}
          />
        )}
        {tool.workspace === "editor" && (
          <EditorCanvas slug={tool.slug} pageCount={pages.length} items={edits} onItemsChange={setEdits} thumbs={thumbs} loadPage={loadPage} />
        )}
        {tool.workspace === "form" && (
          <FormEditor fields={formFields} values={formValues} loading={formLoading} thumb={thumbs[0]} onChange={(name, v) => setFormValues((prev) => ({ ...prev, [name]: v }))} />
        )}
      </div>
    );

  return (
    <div className="flex flex-col gap-5 pb-24 lg:pb-0">
      <Stepper stage={stage} />
      <div className={cn("grid grid-cols-1 items-start gap-5", !wide && "lg:grid-cols-[minmax(0,1fr)_320px]")}>
        <div className="min-w-0">{main}</div>
        {!wide && <OptionsPanel tool={tool} values={values} onChange={(id, v) => setValues((prev) => ({ ...prev, [id]: v }))} onRun={run} blocker={blocker} summary={summary} />}
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <p className="tabular mb-2 truncate text-center text-[12px] text-muted-foreground">{blocker ?? summary}</p>
        <Button size="lg" className="w-full" onClick={run} disabled={Boolean(blocker)}>
          {tool.action}
          <ArrowRight />
        </Button>
      </div>
      <input
        ref={addMoreRef}
        type="file"
        hidden
        accept={acceptMap[tool.accept].mime}
        multiple={tool.multiple}
        onChange={(e) => {
          const list = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (!tool.multiple) reset();
          void addFiles(list);
        }}
      />
    </div>
  );
}

function FileChip({ file, onReplace, onRemove, children }: { file: InputFile; onReplace: () => void; onRemove: () => void; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
        <FileText className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium">{file.name}</span>
        <span className="tabular block text-[12px] text-muted-foreground">
          {formatBytes(file.size)} · {file.pages} {file.pages === 1 ? "page" : "pages"}
        </span>
      </span>
      <Button variant="ghost" size="xs" onClick={onReplace}>
        <RefreshCw />
        Replace
      </Button>
      <Button variant="ghost" size="icon-xs" onClick={onRemove} aria-label="Remove file">
        <X />
      </Button>
      {children}
    </div>
  );
}

function ComingSoon({ tool }: { tool: Tool }) {
  const related = getRelated(tool, 3).filter((t) => !t.comingSoon);
  return (
    <div className="rounded-2xl border border-border bg-background p-8 text-center shadow-xs md:p-12">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
        <Clock className="size-5" />
      </span>
      <h2 className="mt-5 text-[18px] font-semibold tracking-[-0.02em]">{tool.name} is coming soon</h2>
      <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
        We&apos;re building it to run entirely on your device, like every other tool here — so your files still never leave your browser.
      </p>
      {related.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {related.map((t) => (
            <Link key={t.slug} href={`/${t.slug}`} className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-3.5 text-[13px] font-medium transition-colors hover:border-[#d4d4d8]">
              <t.icon className="size-4 text-muted-foreground" />
              {t.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function getBlocker(
  tool: Tool,
  files: InputFile[],
  selected: Set<string>,
  pages: PageItem[],
  values: OptionValues,
  edits: EditorItem[],
  formFields: FormField[],
  formLoading: boolean,
) {
  const min = tool.minFiles ?? 1;
  if (files.length < min) return `Add at least ${min - files.length} more ${tool.accept === "pdf" ? "PDF" : "file"} to continue.`;
  if ((tool.slug === "delete-pages" || tool.slug === "extract-pages") && !selected.size) return `Select the pages you want to ${tool.slug === "delete-pages" ? "remove" : "keep"}.`;
  if (tool.slug === "delete-pages" && selected.size === pages.length) return "Keep at least one page.";
  if (tool.slug === "organize-pages" && pages.every((p) => p.deleted)) return "Keep at least one page.";
  if (tool.slug === "encrypt-pdf" && String(values.password ?? "").length < 8) return "Choose a password with at least 8 characters.";
  if (tool.slug === "remove-password" && !String(values.password ?? "")) return "Enter the current password to unlock.";
  if ((tool.slug === "edit-pdf" || tool.slug === "sign-pdf") && !edits.length) return tool.slug === "sign-pdf" ? "Click on the page to place your signature." : "Add at least one edit to the page.";
  if (tool.slug === "redact-pdf" && !edits.some((e) => e.kind === "redact") && !String(values.find ?? "").trim()) return "Mark an area or enter text to find.";
  if (tool.slug === "fill-pdf-form" && !formLoading && !formFields.length) return "This PDF has no fillable fields.";
  if (tool.slug === "headers-footers" && !String(values.header ?? "").trim() && !String(values.footer ?? "").trim()) return "Enter a header or a footer.";
  return undefined;
}

function getSummary(tool: Tool, files: InputFile[], selected: Set<string>, pages: PageItem[]) {
  const totalPages = files.reduce((s, f) => s + f.pages, 0);
  if (tool.slug === "merge-pdf") return `${files.length} files · ${totalPages} pages → 1 PDF`;
  if (tool.slug === "delete-pages") return `Removing ${selected.size} of ${pages.length} pages`;
  if (tool.slug === "extract-pages") return `Extracting ${selected.size} pages into a new PDF`;
  if (tool.slug === "rotate-pdf") return selected.size ? `Rotating ${selected.size} selected pages` : "Rotating all pages";
  if (tool.slug === "pdf-to-jpg") return selected.size ? `Exporting ${selected.size} selected pages` : `Exporting all ${pages.length} pages`;
  if (tool.slug === "organize-pages") return `${pages.filter((p) => !p.deleted).length} pages in the final PDF`;
  return `${files.length} ${files.length === 1 ? "file" : "files"} · ${formatBytes(files.reduce((s, f) => s + f.size, 0))}`;
}
