import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

/** Shared 1200×630 social card in the brand style. */
export function ogCard({ eyebrow, title, footer }: { eyebrow: string; title: string; footer: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#ffffff",
          backgroundImage: "radial-gradient(circle at 85% 0%, rgba(255,69,0,0.18), transparent 45%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#FF4500", display: "flex", position: "relative" }}>
            <div style={{ position: "absolute", left: 22, top: 11, width: 20, height: 26, borderRadius: 3, background: "rgba(255,255,255,0.55)" }} />
            <div style={{ position: "absolute", left: 15, top: 18, width: 20, height: 26, borderRadius: 3, background: "#fff" }} />
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>
            <span style={{ color: "#18181B" }}>Local</span>
            <span style={{ color: "#FF4500" }}>PDF</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 26, color: "#FF4500", fontWeight: 600, textTransform: "uppercase", letterSpacing: 2 }}>
            {eyebrow}
          </div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, color: "#18181B", lineHeight: 1.08, letterSpacing: -2, maxWidth: 1000 }}>
            {title}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#6E6E76" }}>{footer}</div>
      </div>
    ),
    ogSize,
  );
}
