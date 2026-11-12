export type Faq = { q: string; a: string };

export type Post = {
  slug: string;
  title: string;
  description: string;
  published: string;
  updated?: string;
  category: "How-to" | "Privacy" | "Guides";
  tools: string[];
  /** 40–60 word direct answer shown first; used for snippets and AI answers. */
  answer: string;
  /** Lightweight Markdown: ## / ###, paragraphs, - lists, 1. lists, > tips, | tables, **bold**, [links](/path). */
  body: string;
  faqs: Faq[];
};

export const author = {
  name: "LocalPDF Team",
  url: "/about",
  bio: "We build free PDF tools that run entirely in your browser, so your documents never leave your device.",
};
