import { useState, useEffect } from "react";
import { theme } from "../theme.js";
import { areas } from "../routes.js";
import { MenuIcon, CloseIcon, LogoutIcon, UserIcon } from "./Icons.jsx";
import kpLogo from "../assets/kpcars-logo-blanco.png";

export function Nav({ page, navigate, menuOpen, setMenuOpen, user, onLogout }) {
  // Al bajar, el menú se achica un poco para dejar más lugar al contenido
  const [scrolled, setScrolled] = useState(() => window.scrollY > 24);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const navH = scrolled ? 54 : 64;

  const s = {
    nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,10,10,0.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
    inner: { maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: navH, transition: "height 0.2s ease", display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo: { fontFamily: "'Archivo Black', sans-serif", fontSize: "1.5rem", letterSpacing: -0.5, cursor: "pointer", display: "flex", gap: 2, textDecoration: "none", color: theme.white },
    link: (active) => ({ color: active ? theme.white : theme.gray300, textDecoration: "none", fontSize: "0.88rem", fontWeight: 500, padding: "8px 14px", borderRadius: 8, background: active ? "rgba(255,255,255,0.06)" : "transparent", cursor: "pointer", display: "block" }),
    cta: { background: theme.orange, color: theme.black, fontWeight: 700, padding: "8px 16px", borderRadius: 8, fontSize: "0.88rem", cursor: "pointer", textDecoration: "none", display: "block", textAlign: "center" },
    loginBtn: { background: "none", border: "1px solid rgba(255,255,255,0.15)", color: theme.gray300, fontWeight: 500, padding: "8px 14px", borderRadius: 8, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" },
    mobileBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6, padding: "12px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, color: theme.white, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" },
    hamburger: { background: "none", border: "none", cursor: "pointer", padding: 4, display: "none" },
    mobileLinks: { position: "absolute", top: navH, left: 0, right: 0, background: "rgba(10,10,10,0.98)", backdropFilter: "blur(20px)", padding: "12px 20px 16px", display: "flex", flexDirection: "column", gap: 4, borderBottom: "1px solid rgba(255,255,255,0.06)" },
  };

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        <img src={kpLogo} alt="KPCars" onClick={() => navigate("home")} style={{ height: scrolled ? 44 : 52, transition: "height 0.2s ease", cursor: "pointer" }} />

        {/* Desktop links */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }} className="desktop-nav">
          <a style={s.link(page === "home")} onClick={() => navigate("home")}>Inicio</a>
          {areas.map((a) => (
            <a key={a.key} style={s.link(page === a.page)} onClick={() => navigate(a.page)}>{a.name.replace("KPCars ", "")}</a>
          ))}
          {!user && <a style={s.cta} onClick={() => navigate("apply")}>Quiero manejar</a>}
          {user ? (
            <>
              <a style={s.link(page === "dashboard")} onClick={() => navigate("dashboard")}>Mi Panel</a>
              <a style={s.link(page === "turnos")} onClick={() => navigate("turnos")}>Solicitar turno</a>
              <button style={s.loginBtn} onClick={onLogout}>
                <LogoutIcon size={15} /> Cerrar sesión
              </button>
            </>
          ) : (
            <button style={s.loginBtn} onClick={() => navigate("login")}>
              <UserIcon size={15} /> Zona Conductores
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button style={s.hamburger} className="mobile-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, top: navH, zIndex: 98 }} />
          <div style={{ ...s.mobileLinks, zIndex: 99, position: "absolute" }}>
            <a style={s.link(page === "home")} onClick={() => navigate("home")}>Inicio</a>
            {areas.map((a) => (
            <a key={a.key} style={s.link(page === a.page)} onClick={() => navigate(a.page)}>{a.name.replace("KPCars ", "")}</a>
          ))}
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" }} />
            {user ? (
              <>
                <a style={s.link(page === "dashboard")} onClick={() => navigate("dashboard")}>Mi Panel</a>
                <a style={s.link(page === "turnos")} onClick={() => navigate("turnos")}>Solicitar turno</a>
                <a onClick={onLogout} style={s.mobileBtn}>
                  <LogoutIcon size={16} /> Cerrar sesión
                </a>
              </>
            ) : (
              <>
                <a style={{ ...s.cta, textAlign: "center", padding: "12px 16px" }} onClick={() => navigate("apply")}>Quiero manejar</a>
                <a onClick={() => navigate("login")} style={s.mobileBtn}>
                  <UserIcon size={16} /> Zona Conductores
                </a>
              </>
            )}
          </div>
        </>
      )}

      <style>{`
        @media (min-width: 901px) { .mobile-hamburger { display: none !important; } }
        @media (max-width: 900px) { .desktop-nav { display: none !important; } .mobile-hamburger { display: flex !important; } }
      `}</style>
    </nav>
  );
}
