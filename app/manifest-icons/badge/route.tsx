import { ImageResponse } from "next/og";

// Android status-bar badge: only the alpha channel is used, so draw the glyph on a transparent background
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#ffffff", fontSize: 52, fontWeight: 800 }}>R$</span>
      </div>
    ),
    { width: 96, height: 96 }
  );
}
