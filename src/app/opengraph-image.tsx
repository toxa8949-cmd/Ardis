import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Ardis — велосипеди українського виробництва";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Динамічне OG-зображення для прев'ю посилань (Telegram, Facebook тощо).
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0f1115",
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(249,115,22,0.35) 0, transparent 45%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 30 }}>
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: 18,
              background: "linear-gradient(135deg, #f97316, #f59e0b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
            }}
          >
            🚲
          </div>
          <div style={{ color: "#fff", fontSize: 40, fontWeight: 700 }}>Ardis</div>
        </div>
        <div style={{ color: "#fff", fontSize: 68, fontWeight: 800, lineHeight: 1.1, maxWidth: 900 }}>
          Велосипеди українського виробництва
        </div>
        <div style={{ color: "#fdba74", fontSize: 32, marginTop: 24 }}>
          Гірські · Міські · Гравійні · Гарантія заводу 🇺🇦
        </div>
      </div>
    ),
    { ...size }
  );
}
