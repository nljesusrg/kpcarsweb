import { WHATSAPP_PUBLIC } from "../config.js";
import { theme } from "../theme.js";
import { cargasServices } from "../routes.js";
import logoCargas from "../assets/logos/kp-cargas.svg";
import { SoonBadge } from "../components/ui.jsx";

/* KP Cargas: la marca que agrupa los servicios de transporte. Cada servicio sale de cargasServices (src/routes.js). */
export function CargasPage({ navigate }) {
  const waText = encodeURIComponent("Hola, quiero consultar por KP Cargas.");
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "120px 20px 90px", position: "relative" }}>
      <div style={{ position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)", width: 640, height: 640, background: "radial-gradient(circle, rgba(235,136,0,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div className="anim-in" style={{ textAlign: "center", position: "relative", marginBottom: 48 }}>
        <img src={logoCargas} alt="KP Cargas" style={{ height: "clamp(150px, 34vw, 210px)", width: "auto", display: "block", margin: "0 auto 28px" }} />
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(2rem, 7vw, 3.2rem)", letterSpacing: -1.5, lineHeight: 1.08, marginBottom: 16 }}>
          Fletes, auxilios <span style={{ color: theme.orange }}>y más</span>
        </h1>
        <p style={{ fontSize: "1rem", color: theme.gray300, lineHeight: 1.65, maxWidth: 560, margin: "0 auto" }}>
          KP Cargas reúne nuestros servicios de transporte. Los estamos preparando: mientras tanto, puedes consultarnos por WhatsApp.
        </p>
      </div>

      <div className="cargas-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, position: "relative" }}>
        <style>{`@media (max-width: 640px) { .cargas-grid { grid-template-columns: 1fr !important; } }`}</style>
        {cargasServices.map((sv) => (
          <button
            key={sv.key}
            onClick={() => navigate(sv.page)}
            className="home-card"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 28, cursor: "pointer", textAlign: "center", fontFamily: "'DM Sans', sans-serif", color: theme.white, background: theme.gray900, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}
          >
            <img src={sv.logo} alt={`KP ${sv.name}`} style={{ height: 120, width: "auto", display: "block" }} />
            <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.2rem" }}>{sv.name}</span>
            <SoonBadge />
          </button>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 40, position: "relative" }}>
        <a className="kp-btn" href={`https://wa.me/${WHATSAPP_PUBLIC}?text=${waText}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 12, fontSize: "0.92rem", fontWeight: 700, textDecoration: "none", background: theme.orange, color: theme.black }}>
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  );
}
