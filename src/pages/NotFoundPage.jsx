import { theme } from "../theme.js";
import { Btn, SectionLabel } from "../components/ui.jsx";

/* Página para direcciones que no existen (un link viejo o mal escrito) */
export function NotFoundPage({ navigate }) {
  return (
    <div style={{ minHeight: "78vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "130px 20px 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(235,136,0,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div className="anim-in" style={{ textAlign: "center", maxWidth: 560, position: "relative" }}>
        <SectionLabel>Error 404</SectionLabel>
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(2.2rem, 8vw, 4rem)", letterSpacing: -2, lineHeight: 1.05, marginBottom: 18 }}>
          Página <span style={{ color: theme.orange }}>no encontrada</span>
        </h1>
        <p style={{ fontSize: "1rem", color: theme.gray300, lineHeight: 1.65, marginBottom: 32 }}>
          La dirección que buscas no existe o cambió de lugar. Desde el inicio puedes llegar a todas las secciones.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Btn onClick={() => navigate("home")}>Volver al inicio</Btn>
          <Btn variant="secondary" onClick={() => navigate("catalog")}>Ver flota</Btn>
        </div>
      </div>
    </div>
  );
}
