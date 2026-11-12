import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11.5px] font-medium leading-4 whitespace-nowrap [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary-soft text-primary",
        solid: "bg-primary text-primary-foreground",
        ink: "bg-ink text-ink-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-border text-muted-foreground",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        destructive: "bg-destructive-soft text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
