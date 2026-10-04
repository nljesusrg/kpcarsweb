import { WHATSAPP_PUBLIC } from "../config.js";
import { theme } from "../theme.js";
import { areas } from "../routes.js";
import kpLogo from "../assets/kpcars-logo-blanco.png";

export function Footer({ navigate, user }) {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
      <style>{`
        .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr; gap: 36px; padding: 52px 0 36px; }
        @media (max-width: 1000px) { .footer-grid { grid-template-columns: 1fr 1fr 1fr; } }
        @media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="footer-grid">
        <div>
          <img src={kpLogo} alt="KPCars" style={{ height: 60, marginBottom: 14 }} />
          <p style={{ fontSize: "0.88rem", color: theme.gray400, lineHeight: 1.6, maxWidth: 280 }}>
            Alquiler de autos Toyota para aplicaciones de transporte y particular en Buenos Aires.
          </p>
        </div>
        <FooterCol title="Navegación">
          <FooterLink onClick={() => navigate("home")}>Inicio</FooterLink>
          <FooterLink onClick={() => navigate("catalog")}>Flota</FooterLink>
          {!user && <FooterLink onClick={() => navigate("apply")}>Quiero manejar</FooterLink>}
          {user
            ? <FooterLink onClick={() => navigate("dashboard")}>Mi Panel</FooterLink>
            : <FooterLink onClick={() => navigate("login")}>Zona Conductores</FooterLink>}
        </FooterCol>
        <FooterCol title="Servicios">
          {areas.map((a) => (
            <FooterLink key={a.key} onClick={() => navigate(a.page)}>{a.name}</FooterLink>
          ))}
        </FooterCol>
        <FooterCol title="Contacto">
          <FooterLink href={`tel:+${WHATSAPP_PUBLIC}`}>+54 9 11 6442-3273</FooterLink>
          <FooterLink href="mailto:info@kpcars.com.ar">info@kpcars.com.ar</FooterLink>
          <FooterLink href={`https://wa.me/${WHATSAPP_PUBLIC}`} external>WhatsApp</FooterLink>
        </FooterCol>
        <FooterCol title="Redes sociales">
          <FooterLink href="https://instagram.com/kpcarss" external>Instagram</FooterLink>
          <FooterLink href="https://tiktok.com/@kpcarss" external>TikTok</FooterLink>
        </FooterCol>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 0" }}>
        <p style={{ fontSize: "0.82rem", color: theme.gray400 }}>© 2026 KPCars — Buenos Aires, Argentina</p>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <h4 style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: theme.orange, marginBottom: 6 }}>{title}</h4>
      {children}
    </div>
  );
}

function FooterLink({ children, href, onClick, external }) {
  const style = { fontSize: "0.88rem", color: theme.gray400, textDecoration: "none", cursor: "pointer", background: "none", border: "none", fontFamily: "'DM Sans', sans-serif", padding: 0, textAlign: "left" };
  if (href) return <a href={href} style={style} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>{children}</a>;
  return <button style={style} onClick={onClick}>{children}</button>;
}
