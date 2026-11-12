import { postsA } from "./posts-a";
import { postsB } from "./posts-b";
import { postsC } from "./posts-c";
import { postsD } from "./posts-d";
import type { Post } from "./types";

export { author } from "./types";
export type { Post, Faq } from "./types";

export const posts: Post[] = [...postsA, ...postsB, ...postsC, ...postsD].sort((a, b) => b.published.localeCompare(a.published));

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}

export function getRelatedPosts(post: Post, count = 3) {
  const score = (p: Post) => p.tools.filter((t) => post.tools.includes(t)).length + (p.category === post.category ? 0.5 : 0);
  return posts
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => score(b) - score(a))
    .slice(0, count);
}

export function postsForTool(toolSlug: string, count = 3) {
  return posts
    .filter((p) => p.tools.includes(toolSlug))
    .sort((a, b) => a.tools.indexOf(toolSlug) - b.tools.indexOf(toolSlug))
    .slice(0, count);
}

export function readingMinutes(post: Post) {
  const words = `${post.answer} ${post.body}`.split(/\s+/).length;
  return Math.max(2, Math.round(words / 220));
}

export function headings(body: string) {
  return body
    .split("\n")
    .filter((l) => l.startsWith("## "))
    .map((l) => {
      const text = l.slice(3).trim();
      return { text, id: slugify(text) };
    });
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
