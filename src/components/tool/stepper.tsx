import { Check } from "lucide-react";
import type { Stage } from "@/components/tool/types";
import { cn } from "@/lib/utils";

const steps = [
  { id: "upload", label: "Add files" },
  { id: "configure", label: "Adjust" },
  { id: "done", label: "Download" },
] as const;

const order: Record<Stage, number> = { upload: 0, configure: 1, processing: 2, done: 3 };

export function Stepper({ stage }: { stage: Stage }) {
  const current = order[stage];
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {steps.map((s, i) => {
        const done = current > i;
        const active = current === i || (stage === "processing" && i === 2);
        return (
          <li key={s.id} className="flex items-center gap-2" aria-current={active ? "step" : undefined}>
            <span
              className={cn(
                "tabular grid size-5 place-items-center rounded-full text-[11px] font-semibold transition-colors",
                done && "bg-primary text-white",
                active && !done && "bg-ink text-white ring-2 ring-primary/30 ring-offset-1",
                !done && !active && "border border-dashed border-[#d4d4d8] text-subtle",
              )}
            >
              {done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("text-[12.5px] font-medium", done || active ? "text-foreground" : "text-subtle")}>{s.label}</span>
            {i < steps.length - 1 && (
              <span className="mx-1 hidden h-px w-8 bg-border sm:block" aria-hidden>
                <span className={cn("block h-px bg-primary transition-[width] duration-500", done ? "w-full" : "w-0")} />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
