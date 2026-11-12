import { getPost, posts } from "@/lib/blog";
import { ogCard, ogSize } from "@/lib/og";

export const alt = "LocalPDF guide";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  return ogCard({
    eyebrow: post?.category ?? "Guide",
    title: post?.title ?? "PDF guides",
    footer: "Free PDF tools · No upload · No sign-up",
  });
}
