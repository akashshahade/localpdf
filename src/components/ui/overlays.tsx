"use client";

import * as React from "react";
import { Dialog as DialogPrimitive, Accordion as AccordionPrimitive } from "radix-ui";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#121214]/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-[12vh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-popover shadow-lg outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98] data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#121214]/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-border bg-background shadow-lg outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=closed]:duration-200",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function Accordion(props: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root {...props} />;
}

export function AccordionItem({
  title,
  children,
  value,
}: {
  title: string;
  children: React.ReactNode;
  value: string;
}) {
  return (
    <AccordionPrimitive.Item value={value} className="border-b border-border last:border-b-0">
      <AccordionPrimitive.Header className="m-0 text-[14px] tracking-normal">
        <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between gap-4 py-4 text-left text-[14px] font-medium outline-none focus-visible:text-primary">
          {title}
          <Plus className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-45" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden text-[13.5px] leading-relaxed text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="pb-4 pr-8">{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}
