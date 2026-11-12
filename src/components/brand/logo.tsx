import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

const sizes = {
  sm: { mark: 24, text: "text-[15px]" },
  md: { mark: 28, text: "text-[16.5px]" },
  lg: { mark: 36, text: "text-[21px]" },
};

export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className={className}>
      <rect width="32" height="32" rx="8" fill="#FF4500" />
      <rect x="12.5" y="6.5" width="11" height="14" rx="1.5" fill="#fff" opacity="0.55" />
      <path
        d="M10.5 10H16.5L20 13.5V22.5A1.5 1.5 0 0 1 18.5 24H10.5A1.5 1.5 0 0 1 9 22.5V11.5A1.5 1.5 0 0 1 10.5 10Z"
        fill="#fff"
      />
      <path d="M16.5 10V12.5A1 1 0 0 0 17.5 13.5H20Z" fill="#FF4500" opacity="0.35" />
    </svg>
  );
}

export function Logo({ size = "md", className }: { size?: keyof typeof sizes; className?: string }) {
  const s = sizes[size];
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 outline-none", className)} aria-label={`${site.name} home`}>
      <LogoMark size={s.mark} />
      <span className={cn("font-semibold tracking-[-0.03em]", s.text)}>
        <span className="text-ink">{site.wordmark[0]}</span>
        <span className="text-primary">{site.wordmark[1]}</span>
      </span>
    </Link>
  );
}
