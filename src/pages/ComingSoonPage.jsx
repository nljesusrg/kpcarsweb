import { WHATSAPP_PUBLIC } from "../config.js";
import { theme } from "../theme.js";
import { Btn } from "../components/ui.jsx";

/* Página "Próximamente" de cada servicio de KP Cargas (Fletes, Auxilios...) */
export function ComingSoonPage({ service, navigate }) {
  const waText = encodeURIComponent(`Hola, quiero consultar por ${service.name} de KP Cargas.`);
  return (
    <div style={{ minHeight: "78vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "130px 20px 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(235,136,0,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div className="anim-in" style={{ textAlign: "center", maxWidth: 560, position: "relative" }}>
        <img src={service.logo} alt={`KP ${service.name}`} style={{ height: "clamp(130px, 30vw, 180px)", width: "auto", display: "block", margin: "0 auto 28px" }} />
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(2.2rem, 8vw, 4rem)", letterSpacing: -2, lineHeight: 1.05, marginBottom: 18 }}>
          Próxima<span style={{ color: theme.orange }}>mente…</span>
        </h1>
        <p style={{ fontSize: "1rem", color: theme.gray300, lineHeight: 1.65, marginBottom: 32 }}>
          Estamos preparando este servicio de KP Cargas. Mientras tanto, puedes consultarnos por WhatsApp.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a className="kp-btn" href={`https://wa.me/${WHATSAPP_PUBLIC}?text=${waText}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 12, fontSize: "0.92rem", fontWeight: 700, textDecoration: "none", background: theme.orange, color: theme.black }}>
            Consultar por WhatsApp
          </a>
          <Btn variant="secondary" onClick={() => navigate("cargas")}>Ver KP Cargas</Btn>
        </div>
      </div>
    </div>
  );
}
