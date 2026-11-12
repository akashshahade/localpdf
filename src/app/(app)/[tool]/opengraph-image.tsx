import { getCategory, getTool, tools } from "@/lib/tools";
import { ogCard, ogSize } from "@/lib/og";

export const alt = "LocalPDF tool";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return tools.map((t) => ({ tool: t.slug }));
}

export default async function Image({ params }: { params: Promise<{ tool: string }> }) {
  const tool = getTool((await params).tool);
  return ogCard({
    eyebrow: tool ? getCategory(tool.category).label : "PDF tool",
    title: tool ? `${tool.name} — free, no upload` : "Free PDF tools",
    footer: tool?.short ?? "Runs entirely in your browser",
  });
}
