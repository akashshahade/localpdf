import { ogCard, ogSize } from "@/lib/og";

export const alt = "LocalPDF — Free PDF tools. Zero uploads.";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Free · Private · No sign-up",
    title: "Free PDF tools. Zero uploads.",
    footer: "Merge, edit, sign, compress and convert PDFs in your browser",
  });
}
