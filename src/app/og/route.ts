import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "40px",
            paddingLeft: "120px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "24px",
              background: "linear-gradient(135deg, #3B82F6, #6366F1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 25px 50px -12px rgba(59,130,246,0.4)",
            }}
          >
            <span
              style={{
                fontSize: "64px",
                color: "white",
                fontFamily: "Georgia, serif",
                fontWeight: "bold",
              }}
            >
              Ψ
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{
                fontSize: "56px",
                fontWeight: 800,
                color: "white",
                fontFamily: "Inter, Arial, sans-serif",
                letterSpacing: "-1px",
              }}
            >
              PsiHumanis
            </span>
            <span
              style={{
                fontSize: "24px",
                color: "#94a3b8",
                fontFamily: "Inter, Arial, sans-serif",
              }}
            >
              Sistema de Gestão para Psicólogos
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            paddingLeft: "280px",
            marginTop: "20px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {["Agenda Online", "Prontuários", "Sala Virtual", "Financeiro"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "8px 20px",
                borderRadius: "16px",
                background: "rgba(59,130,246,0.15)",
                color: "#60a5fa",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "Inter, Arial, sans-serif",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50px",
            background: "rgba(255,255,255,0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              color: "#475569",
              fontFamily: "Inter, Arial, sans-serif",
            }}
          >
            psihumanis.com.br
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
