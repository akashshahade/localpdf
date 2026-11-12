import { ImageResponse } from "next/og";

/** The LocalPDF mark (two stacked pages on orange), drawn at any square size. */
export function brandIcon(px: number) {
  const k = px / 180;
  const page = (left: number, top: number, background: string) => (
    <div style={{ position: "absolute", left: left * k, top: top * k, width: 62 * k, height: 80 * k, borderRadius: 8 * k, background }} />
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#FF4500" }}>
        {page(70, 36, "rgba(255,255,255,0.55)")}
        {page(50, 56, "#ffffff")}
      </div>
    ),
    { width: px, height: px },
  );
}
