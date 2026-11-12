import Link from "next/link";
import { formatDate, readingMinutes, type Post } from "@/lib/blog";
import { cn } from "@/lib/utils";

export function PostCard({ post, featured, className }: { post: Post; featured?: boolean; className?: string }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex flex-col rounded-2xl border border-border bg-background p-5 shadow-xs transition-[border-color,box-shadow] hover:border-[#dcdce0] hover:shadow-[0_4px_16px_-6px_rgba(18,18,20,0.08)]",
        featured && "md:p-8",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-[12px]">
        <span className="font-medium text-primary">{post.category}</span>
        <span className="text-subtle">·</span>
        <span className="tabular text-muted-foreground">{readingMinutes(post)} min read</span>
      </div>
      <h3
        className={cn(
          "mt-3 font-semibold tracking-[-0.02em] text-ink transition-colors group-hover:text-primary",
          featured ? "text-[22px] leading-snug md:text-[28px]" : "text-[16px] leading-snug",
        )}
      >
        {post.title}
      </h3>
      <p className={cn("mt-2 text-muted-foreground", featured ? "line-clamp-4 text-[14.5px] leading-relaxed sm:line-clamp-none" : "line-clamp-3 text-[13px] leading-relaxed")}>
        {featured ? post.answer : post.description}
      </p>
      <p className="tabular mt-auto pt-4 text-[12px] text-subtle">{formatDate(post.updated ?? post.published)}</p>
    </Link>
  );
}
