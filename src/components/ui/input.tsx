import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-[13.5px] shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-subtle focus-visible:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-primary/12 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-[13px] font-medium text-foreground", className)} {...props} />;
}

export function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "hidden h-5 min-w-5 items-center justify-center rounded border border-border bg-background px-1 font-mono text-[10.5px] text-muted-foreground can-hover:inline-flex",
        className,
      )}
      {...props}
    />
  );
}
