import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        <span style={{ color: "#ffffff", fontSize: 90, fontWeight: 800 }}>R$</span>
      </div>
    ),
    size
  );
}
