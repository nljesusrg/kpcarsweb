import { useState, useEffect } from "react";
import { driverWhatsAppHref } from "../config.js";
import { theme } from "../theme.js";
import { dayLabel, shortDate, daysUntil, fmtMoney, fmtPatente } from "../utils/format.js";
import { turnoDay, isTurnoProximo, fetchAllTurnos } from "../utils/turnos.js";
import { AlertIcon, PlusIcon, ChatIcon, ChevronIcon } from "../components/Icons.jsx";
import { Skel } from "../components/ui.jsx";
import { panel } from "./panelStyles.js";

/* ── Inicio: lo que el conductor necesita ver de un vistazo ── */
export function InicioTab({ user, apiFetch, navigate, setTab }) {
  const [turnos, setTurnos] = useState(null); // null = todavía cargando
  const [turnosError, setTurnosError] = useState(false);
  const [multasData, setMultasData] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchAllTurnos(apiFetch)
      .then((all) => { if (alive) setTurnos(all); })
      .catch(() => { if (alive) { setTurnos([]); setTurnosError(true); } });
    // Si las multas no cargan, el aviso simplemente no aparece (el detalle está en su sección)
    apiFetch("/mis-multas")
      .then((res) => res.json())
      .then((data) => { if (alive) setMultasData(data); })
      .catch(() => {});
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const proximo = (turnos || []).filter(isTurnoProximo).sort((a, b) => (a.scheduled_date ?? "").localeCompare(b.scheduled_date ?? ""))[0];

  const pendientes = (multasData?.multas || []).filter((m) => !m.cobrado);
  const totalAdeudado = multasData?.total_adeudado ?? pendientes.reduce((sum, m) => sum + Number(m.monto_adeudado || 0), 0);

  const licenciaDays = user.licenciaVencimiento ? daysUntil(user.licenciaVencimiento) : null;
  const licenciaAlert = licenciaDays !== null && licenciaDays <= 30;

  const auto = user.autoAsignado;
  const rowStyle = { ...panel.card, display: "flex", alignItems: "center", gap: 14, padding: 16, width: "100%", textAlign: "left", color: theme.white, fontFamily: "'DM Sans', sans-serif" };

  return (
    <div className="anim-in panel-cols" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Próximo turno */}
      {turnos === null ? (
        <div style={{ ...panel.card, padding: 20 }}><Skel w={130} h={12} mb={12} /><Skel w="80%" h={26} mb={10} /><Skel w="60%" h={14} /></div>
      ) : proximo ? (
        <section style={{ background: theme.orange, color: theme.black, borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ fontSize: "0.9rem", fontWeight: 700, margin: 0 }}>Tu próximo turno</p>
          <p style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.7rem", lineHeight: 1.15, margin: 0 }}>{dayLabel(turnoDay(proximo))}</p>
          <p style={{ fontSize: "1rem", fontWeight: 500, margin: 0 }}>{proximo.service} · {proximo.type === "emergencia" ? "Turno urgente" : "Turno normal"}</p>
          <button onClick={() => setTab("turnos")} style={{ ...panel.btn, minHeight: 48, fontSize: "1rem", borderRadius: 12, marginTop: 10, background: theme.black, color: theme.white, border: "none" }}>Ver mis turnos</button>
        </section>
      ) : (
        <section style={{ ...panel.card, padding: 20 }}>
          <p style={{ fontSize: "0.9rem", fontWeight: 700, color: theme.gray300, margin: "0 0 4px" }}>Tu próximo turno</p>
          <p style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>{turnosError ? "No pudimos cargar tus turnos." : "No tienes turnos agendados."}</p>
        </section>
      )}

      <button onClick={() => navigate("turnos")} style={panel.btnOutline}>
        <span style={{ color: theme.orange, display: "flex" }}><PlusIcon /></span> Pedir un turno
      </button>

      {/* Avisos */}
      {(pendientes.length > 0 || licenciaAlert) && (
        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={panel.h2}>Para tener en cuenta</h2>

          {pendientes.length > 0 && (
            <button onClick={() => setTab("multas")} style={{ ...rowStyle, cursor: "pointer" }}>
              <span style={{ color: "#ff8a80", display: "flex", flexShrink: 0 }}><AlertIcon size={26} /></span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: "1.05rem", fontWeight: 700 }}>
                  Tienes {pendientes.length} multa{pendientes.length !== 1 ? "s" : ""} pendiente{pendientes.length !== 1 ? "s" : ""}
                </span>
                <span style={{ display: "block", fontSize: "0.95rem", color: theme.gray300 }}>
                  {totalAdeudado > 0 ? `Debes ${fmtMoney(totalAdeudado)} en total` : "Toca para ver el detalle"}
                </span>
              </span>
              <span style={{ color: theme.gray300, display: "flex" }}><ChevronIcon /></span>
            </button>
          )}

          {licenciaAlert && (
            <div style={rowStyle}>
              <span style={{ color: licenciaDays <= 7 ? "#ff8a80" : theme.orange, display: "flex", flexShrink: 0 }}><AlertIcon size={26} /></span>
              <span>
                <span style={{ display: "block", fontSize: "1.05rem", fontWeight: 700 }}>
                  {licenciaDays <= 0 ? "Tu licencia está vencida" : `Tu licencia vence en ${licenciaDays} día${licenciaDays !== 1 ? "s" : ""}`}
                </span>
                <span style={{ display: "block", fontSize: "0.95rem", color: theme.gray300 }}>
                  {licenciaDays <= 0 ? "Renuévala lo antes posible." : `Vence el ${shortDate(user.licenciaVencimiento)}. Recuerda renovarla.`}
                </span>
              </span>
            </div>
          )}
        </section>
      )}

      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Auto asignado */}
      <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h2 style={{ ...panel.h2, marginTop: 0 }}>Tu auto</h2>
        {auto ? (
          <div style={{ ...panel.card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.35rem", margin: 0 }}>{auto.model}</p>
              {auto.desde && <p style={panel.muted}>Lo usas desde el {auto.desde}</p>}
            </div>
            <span style={{ padding: "8px 12px", borderRadius: 8, background: theme.white, color: theme.black, fontFamily: "'Archivo Black', sans-serif", fontSize: "1.1rem", letterSpacing: 1, whiteSpace: "nowrap" }}>{fmtPatente(auto.patente)}</span>
          </div>
        ) : (
          <div style={panel.card}><p style={panel.muted}>Todavía no tienes un vehículo asignado.</p></div>
        )}
      </section>

      <a href={driverWhatsAppHref()} target="_blank" rel="noopener noreferrer" style={{ ...panel.btn, ...panel.card, padding: "0 18px", color: theme.white, marginTop: 6 }}>
        <ChatIcon /> Hablar con la central
      </a>
      </div>
    </div>
  );
}
