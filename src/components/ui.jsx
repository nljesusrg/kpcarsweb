import { theme } from "../theme.js";

export function SoonBadge() {
  return <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: theme.orange, background: "rgba(235,136,0,0.1)", border: "1px solid rgba(235,136,0,0.25)", borderRadius: 100, padding: "4px 10px", whiteSpace: "nowrap" }}>Próximamente</span>;
}

/* ── Skeleton helper ── */
export const Skel = ({ w = "100%", h = 14, r = 6, mb = 0 }) => (
  <span className="skel" style={{ width: w, height: h, borderRadius: r, marginBottom: mb || undefined, display: "block" }} />
);

export function Btn({ children, onClick, variant = "primary" }) {
  const base = { display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 12, fontSize: "0.92rem", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", textDecoration: "none", cursor: "pointer", border: "none" };
  const styles = variant === "primary"
    ? { ...base, background: theme.orange, color: theme.black }
    : { ...base, background: "rgba(255,255,255,0.06)", color: theme.white, border: "1px solid rgba(255,255,255,0.1)" };
  return <button className="kp-btn" style={styles} onClick={onClick}>{children}</button>;
}

/* Parte del título resaltada en naranja */
export function Accent({ children }) {
  return <span style={{ color: theme.orange }}>{children}</span>;
}

export function SectionLabel({ children }) {
  return <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, color: theme.orange, marginBottom: 10 }}>{children}</div>;
}

export function SectionTitle({ children }) {
  return <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(1.6rem, 5vw, 2.6rem)", letterSpacing: -1, marginBottom: 14, lineHeight: 1.1 }}>{children}</h2>;
}

/* Encabezado de sección: etiqueta + título a la izquierda, texto opcional a la derecha */
export function SectionHeader({ label, title, children }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px 32px", marginBottom: 36 }}>
      <div>
        <SectionLabel>{label}</SectionLabel>
        <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(1.6rem, 5vw, 2.6rem)", letterSpacing: -1, lineHeight: 1.1 }}>{title}</h2>
      </div>
      {children && <p style={{ fontSize: "0.92rem", color: theme.gray400, maxWidth: 360, lineHeight: 1.65 }}>{children}</p>}
    </div>
  );
}

export function CTABanner({ navigate }) {
  return (
    <div className="reveal" style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 20px 80px" }}>
      <div style={{ background: `linear-gradient(135deg, ${theme.orange}, #d47a00)`, borderRadius: 20, padding: "clamp(32px, 6vw, 56px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50%", right: "-20%", width: 400, height: 400, background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(1.4rem, 4vw, 2.2rem)", color: theme.black, marginBottom: 10, position: "relative" }}>¿Listo para empezar a generar?</h2>
        <p style={{ color: "rgba(0,0,0,0.7)", fontSize: "1rem", marginBottom: 24, position: "relative" }}>Completa el formulario y nos comunicamos contigo en menos de 24 horas.</p>
        <button className="kp-btn" onClick={() => navigate("apply")} style={{ background: theme.black, color: theme.white, padding: "13px 24px", borderRadius: 12, fontSize: "0.92rem", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", border: "none", cursor: "pointer", position: "relative" }}>Quiero ser conductor →</button>
      </div>
    </div>
  );
}

export function FormSection({ label }) {
  return <p style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: theme.orange, margin: "24px 0 16px" }}>{label}</p>;
}

export function FormGroup({ label, required, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: 7, color: theme.gray200 }}>
        {label} {required && <span style={{ color: theme.orange }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export function FormRow({ children }) {
  return (
    <>
      <div className="form-row-grid">{children}</div>
      <style>{`
        .form-row-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 500px) { .form-row-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}
