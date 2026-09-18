import { ImageResponse } from "next/og";

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
          background: "linear-gradient(135deg, #004ac6, #003ea8)",
        }}
      >
        <span style={{ color: "#ffffff", fontSize: 96, fontWeight: 800 }}>R$</span>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
