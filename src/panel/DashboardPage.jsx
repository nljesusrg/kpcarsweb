import { useNavigate } from "react-router";
import { theme } from "../theme.js";
import { PlusIcon } from "../components/Icons.jsx";
import { panel } from "./panelStyles.js";
import { panelNavIcons, panelTabs } from "./panelNav.jsx";
import { InicioTab } from "./InicioTab.jsx";
import { MultasTab } from "./MultasTab.jsx";
import { ProfileTab } from "./ProfileTab.jsx";
import { VencimientosBanner } from "./VencimientosBanner.jsx";
import { TurnosTab } from "./TurnosTab.jsx";

export function DashboardPage({ tab, user, navigate, apiFetch, onUserUpdate }) {
  // Cada sección tiene su dirección: /panel/inicio, /panel/turnos, /panel/multas y /panel/perfil
  const routerNavigate = useNavigate();
  const setTab = (t) => routerNavigate(`/panel/${t}`);
  const current = panelTabs.find((t) => t.key === tab) || panelTabs[0];

  return (
    // En el celular: barra fija abajo (el espacio de abajo es para que no tape el final de la página).
    // En pantallas grandes: las mismas secciones van como pestañas arriba y el contenido usa dos columnas.
    <div className="panel-wrap" style={{ maxWidth: 900, margin: "0 auto", padding: "96px 20px 120px" }}>
      <style>{`
        .panel-tabs-top { display: none; }
        @media (min-width: 768px) {
          .panel-wrap { padding-bottom: 80px !important; }
          .panel-tabs-top { display: flex; }
          .panel-nav-bottom, .panel-mobile-only { display: none !important; }
          .panel-cols { display: grid !important; grid-template-columns: 1fr 1fr; align-items: start; gap: 16px !important; }
        }
      `}</style>

      {/* Encabezado: saludo o título a la izquierda, pestañas a la derecha */}
      <div className="anim-in" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          {tab === "inicio" ? (
            <>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: theme.orange, marginBottom: 6 }}>Panel del conductor</p>
              <h1 style={panel.h1}>Hola, <span style={{ color: theme.orange }}>{user.nombre || "Conductor"}</span></h1>
            </>
          ) : (
            <h1 style={panel.h1}>{current.title}</h1>
          )}
        </div>

        <div className="panel-tabs-top" style={{ gap: 6, flexWrap: "wrap", alignItems: "center", paddingTop: 14 }}>
          {panelTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-current={tab === t.key ? "page" : undefined}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 12px", borderRadius: 10, fontSize: "0.9rem", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", border: "none", background: tab === t.key ? "rgba(235,136,0,0.15)" : "rgba(255,255,255,0.05)", color: tab === t.key ? theme.orange : theme.gray200 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{panelNavIcons[t.key]}</svg>
              {t.label}
            </button>
          ))}
          <button
            onClick={() => navigate("turnos")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 12px", borderRadius: 10, fontSize: "0.9rem", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", border: "none", background: theme.orange, color: theme.black }}
          >
            <PlusIcon size={16} /> Pedir turno
          </button>
        </div>
      </div>

      {tab === "inicio" && <InicioTab user={user} apiFetch={apiFetch} navigate={navigate} setTab={setTab} />}
      {tab === "turnos" && <TurnosTab apiFetch={apiFetch} navigate={navigate} />}
      {tab === "multas" && <MultasTab apiFetch={apiFetch} />}
      {tab === "perfil" && (
        <>
          <VencimientosBanner user={user} />
          <ProfileTab user={user} apiFetch={apiFetch} onUpdate={onUserUpdate} />
        </>
      )}

      {/* Barra fija de abajo, como en una app (solo en el celular) */}
      <nav className="panel-nav-bottom" aria-label="Secciones del panel" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 98, background: theme.gray900, borderTop: "1px solid rgba(255,255,255,0.1)", paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {panelTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-current={tab === t.key ? "page" : undefined}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 0 12px", minHeight: 60, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", fontWeight: 700, color: tab === t.key ? theme.orange : theme.gray300 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{panelNavIcons[t.key]}</svg>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
