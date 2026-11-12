import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-[13px] font-medium transition-[color,background-color,border-color,box-shadow] duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover",
        ink: "bg-ink text-ink-foreground shadow-xs hover:bg-ink-hover",
        outline: "border border-input bg-background shadow-xs hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-[#ebebed]",
        ghost: "text-foreground hover:bg-accent",
        soft: "bg-primary-soft text-primary hover:bg-[#ffe6da]",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90",
        link: "h-auto px-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3",
        default: "h-9 px-3.5",
        lg: "h-10 px-4",
        xl: "h-11 px-5 text-sm",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-xs": "size-7",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
