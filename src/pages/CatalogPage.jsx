import { useState } from "react";
import { PRICE_WEEKLY, fleetTypes, FLEET_NOTE } from "../config.js";
import { theme } from "../theme.js";
import { CloseIcon, AlertIcon } from "../components/Icons.jsx";
import { Btn, SectionLabel, SectionTitle, CTABanner } from "../components/ui.jsx";
import toyotaLogo from "../assets/toyota-logo.png";

/* ─────────────────────────────────────────────
   FLOTA — cómo son los autos (por tipo, no por unidad)
   ───────────────────────────────────────────── */
export function CatalogPage({ navigate, user }) {
  const [lightbox, setLightbox] = useState(null);

  return (
    <div>
      <style>{`
        .fleet-types { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .fleet-info { display: grid; grid-template-columns: auto 1fr; gap: 0; }
        .fleet-info > div + div { border-left: 1px solid rgba(255,255,255,0.07); }
        .fleet-thumb { transition: border-color 0.15s, opacity 0.15s; }
        .fleet-thumb:hover { opacity: 1 !important; }
        @media (max-width: 820px) {
          .fleet-types { grid-template-columns: 1fr; }
          .fleet-info { grid-template-columns: 1fr; }
          .fleet-info > div + div { border-left: none; border-top: 1px solid rgba(255,255,255,0.07); }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "110px 20px 0" }}>
        <SectionLabel>Nuestra flota</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
          <SectionTitle>Flota Toyota</SectionTitle>
          <img src={toyotaLogo} alt="Toyota" style={{ height: 28, opacity: 0.7 }} />
        </div>
        <p style={{ fontSize: "1rem", color: theme.gray400, maxWidth: 560, lineHeight: 1.6, marginBottom: 28 }}>
          Así son los Toyota Corolla de nuestra flota: habilitados para trabajar en aplicaciones de transporte y particular en Buenos Aires. Todos con GNC, aire acondicionado y baúl amplio.
        </p>

        {/* Precio (una sola vez) + aviso de fotos de referencia */}
        <div className="fleet-info" style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, marginBottom: 20 }}>
          <div style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: theme.gray400, marginBottom: 6 }}>Alquiler semanal</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.6rem", color: theme.orange }}>${PRICE_WEEKLY}</span>
              <span style={{ fontSize: "0.8rem", color: theme.gray400 }}>ARS</span>
            </div>
          </div>
          <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ color: theme.orange, flexShrink: 0, display: "flex" }}><AlertIcon size={20} /></div>
            <p style={{ fontSize: "0.9rem", color: theme.gray300, lineHeight: 1.55 }}>{FLEET_NOTE}</p>
          </div>
        </div>
      </div>

      <div className="fleet-types" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 60px" }}>
        {fleetTypes.map((type) => (
          <FleetTypeCard key={type.key} type={type} onZoom={setLightbox} onApply={user ? null : () => navigate("apply")} />
        ))}
      </div>

      {/* Foto ampliada */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out", padding: 20 }}>
          <img src={lightbox} alt="Foto ampliada" style={{ maxWidth: "95%", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }} />
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: 40, height: 40, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><CloseIcon size={18} /></button>
        </div>
      )}

      {!user && <CTABanner navigate={navigate} />}
    </div>
  );
}

/* Tarjeta de un tipo de vehículo, con sus fotos de ejemplo */
function FleetTypeCard({ type, onZoom, onApply }) {
  const [current, setCurrent] = useState(0);
  const name = `${type.model} ${type.transmission}`;

  return (
    <div style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div onClick={() => onZoom(type.photos[current])} style={{ width: "100%", aspectRatio: "16/10", background: `linear-gradient(135deg, ${theme.gray800}, ${theme.gray700})`, position: "relative", overflow: "hidden", cursor: "zoom-in" }}>
        <img src={type.photos[current]} alt={`${name}, foto de referencia`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: `linear-gradient(to top, ${theme.gray900}, transparent)`, pointerEvents: "none" }} />
        <span style={{ position: "absolute", top: 12, left: 12, fontSize: "0.66rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: theme.gray200, background: "rgba(10,10,10,0.72)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 100, padding: "4px 10px" }}>Foto de referencia</span>
      </div>

      <div style={{ padding: 22, display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Miniaturas */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {type.photos.map((photo, i) => (
            <button key={i} className="fleet-thumb" aria-label={`Ver foto ${i + 1} de ${name}`} onClick={() => setCurrent(i)} style={{ width: 64, height: 46, padding: 0, borderRadius: 8, overflow: "hidden", cursor: "pointer", background: theme.gray800, border: i === current ? `2px solid ${theme.orange}` : "2px solid transparent", opacity: i === current ? 1 : 0.6 }}>
              <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>

        <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: theme.orange, marginBottom: 4 }}>{type.transmission}</div>
        <h3 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.3rem", letterSpacing: -0.5, marginBottom: 14 }}>{type.model}</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: onApply ? 22 : 0, flex: 1, alignContent: "flex-start" }}>
          {type.features.map((f) => (
            <span key={f} style={{ fontSize: "0.74rem", color: theme.gray300, background: "rgba(255,255,255,0.05)", padding: "5px 12px", borderRadius: 100, fontWeight: 500 }}>{f}</span>
          ))}
        </div>
        {onApply && <div><Btn onClick={onApply}>Quiero manejar →</Btn></div>}
      </div>
    </div>
  );
}
