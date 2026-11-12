import { acceptMap, type Tool } from "@/lib/tools";
import { site } from "@/lib/site";

const titleOverrides: Record<string, string> = {
  "pdf-size-analyzer": "PDF Size Analyzer — See Why Your PDF Is Big",
  "file-fingerprint": "PDF Hash Generator — SHA-256, SHA-384 & SHA-1",
  "edit-metadata": "Edit PDF Metadata — Title, Author & Keywords",
  "resize-image-to-kb": "Resize Image to 20KB, 50KB, 100KB — Free, No Upload",
  "passport-size-photo": "Passport Size Photo Maker (35×45 mm) — Free, No Upload",
  "exam-photo-signature-resizer": "Photo & Signature Resizer for SSC, UPSC, IBPS, NEET, PAN",
  "signature-cleaner": "Signature Cleaner — Clear Signature on White Background",
  "resize-image": "Resize Image in Pixels, CM, MM or Inches — Free Online",
  "name-date-on-photo": "Add Name and Date on Photo — UPSC Photo Tool, Free",
  "join-photo-signature": "Join Photo and Signature in One Image — Free Online",
};

export function toolTitle(tool: Tool) {
  return titleOverrides[tool.slug] ?? `${tool.name} Online Free — No Upload, No Watermark`;
}

export function toolDescription(tool: Tool) {
  return `${tool.description} Free, no sign-up, no watermark — your files never leave your device.`;
}

function inputNoun(tool: Tool) {
  if (tool.accept === "image") return tool.multiple ? "photos" : "photo";
  return tool.accept === "pdf" ? (tool.multiple ? "PDFs" : "PDF") : acceptMap[tool.accept].label.split(",")[0] + (tool.multiple ? " files" : " file");
}

/** Answer-first copy for featured snippets and AI answers (≈40–60 words). */
export function toolAnswer(tool: Tool) {
  return `Open ${site.name} ${tool.name}, add your ${inputNoun(tool)}${tool.options?.length ? ", adjust the settings" : ""} and click ${tool.action}. Everything runs in your browser, so your file is processed on your own device and never uploaded. It's free, needs no account and adds no watermark.`;
}

export function toolSteps(tool: Tool) {
  return [
    { title: `Add your ${inputNoun(tool)}`, body: "Drag it onto the page or choose it from your device. It opens in this tab — nothing is uploaded." },
    {
      title: tool.options?.length ? "Adjust the settings" : "Check the preview",
      body: tool.options?.length ? "Tweak the options in the settings panel, or keep the recommended defaults." : "No settings needed — sensible defaults are applied for you.",
    },
    { title: tool.action, body: "Processing runs on your device in seconds. Download the result or continue with another tool." },
  ];
}

export function toolFaqs(tool: Tool) {
  return [
    {
      q: `Is ${tool.name} free?`,
      a: `Yes. ${tool.name} is completely free, with no sign-up, no watermark and no daily limits.`,
    },
    {
      q: `Are my files uploaded when I use ${tool.name}?`,
      a: `No. ${tool.name} runs entirely in your browser. Your files are processed on your device and are never sent to a server, so we can't see or keep them.`,
    },
    {
      q: `Does ${tool.name} work on my phone?`,
      a: "Yes. It works in modern browsers on Android, iPhone, iPad, Windows, Mac and Linux — no app to install.",
    },
    {
      q: "Does it work offline?",
      a: "Yes. After the page has loaded once, the tool keeps working even if you turn off your internet connection.",
    },
    {
      q: "Is there a file size limit?",
      a: "There's no fixed limit. Because processing happens on your device, the practical limit is your device's memory — most handle large files comfortably.",
    },
  ];
}
