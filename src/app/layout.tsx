import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/controls";
import { CommandPalette } from "@/components/shell/command-palette";
import { ServiceWorkerRegistration } from "@/components/pwa";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Free PDF Tools, No Upload, No Sign-up`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${GeistSans.variable} ${GeistMono.variable} h-full`}>
      <body className="min-h-full">
        <TooltipProvider delayDuration={200}>
          {children}
          <CommandPalette />
        </TooltipProvider>
        <ServiceWorkerRegistration />
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "!rounded-xl !border !border-border !shadow-lg !text-[13px] !font-sans",
          }}
        />
      </body>
    </html>
  );
}
