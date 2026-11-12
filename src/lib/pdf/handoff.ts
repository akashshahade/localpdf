"use client";

import type { InputFile } from "@/components/tool/types";

// In-memory only: carries a result into the next tool during client-side navigation. Never persisted.
let pending: InputFile | null = null;

export function setHandoff(file: InputFile) {
  pending = file;
}

export function takeHandoff() {
  const f = pending;
  pending = null;
  return f;
}
