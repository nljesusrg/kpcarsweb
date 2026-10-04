import { useState, useEffect } from "react";
import { driverWhatsAppHref } from "../config.js";
import { theme } from "../theme.js";
import { toAbsoluteUrl, shortDate, daysUntil, fmtMoney, sentenceCase, fmtPatente } from "../utils/format.js";
import { DocumentIcon, ChatIcon, ChevronIcon } from "../components/Icons.jsx";
import { panel } from "./panelStyles.js";

/* ── Multas del conductor ── */
export function MultasTab({ apiFetch }) {
  const [data, setData] = useState(null); // null = todavía cargando
  const [error, setError] = useState("");
  const [showPagadas, setShowPagadas] = useState(false);

  useEffect(() => {
    let alive = true;
    apiFetch("/mis-multas")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "");
        if (alive) setData(json);
      })
      .catch(() => { if (alive) setError("No se pudieron cargar tus multas. Intenta de nuevo en un rato."); });
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <p style={{ ...panel.muted, color: "#ff8a80", padding: "32px 0", textAlign: "center" }}>{error}</p>;
  if (data === null) return <p style={{ ...panel.muted, padding: "32px 0", textAlign: "center" }}>Cargando multas...</p>;

  const multas = data.multas || [];
  // Para el conductor una multa "cobrada" es una multa pagada
  const pagadas = multas.filter((m) => m.cobrado);
  // Pendientes: primero las que están por vencer (la más cercana arriba), después las ya vencidas
  const pendientes = multas.filter((m) => !m.cobrado).sort((a, b) => {
    const da = daysUntil(a.fecha_vencimiento || a.fecha), db = daysUntil(b.fecha_vencimiento || b.fecha);
    if ((da < 0) !== (db < 0)) return da < 0 ? 1 : -1;
    return da < 0 ? db - da : da - db;
  });
  const total = data.total_adeudado ?? pendientes.reduce((sum, m) => sum + Number(m.monto_adeudado || 0), 0);

  if (multas.length === 0) return <div className="anim-in" style={panel.card}><p style={{ ...panel.muted, fontSize: "1.05rem" }}>No tienes multas registradas.</p></div>;

  return (
    <div className="anim-in" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      <section style={{ ...panel.card, borderRadius: 20, padding: 20 }}>
        <p style={panel.muted}>{pendientes.length > 0 ? "Debes en total" : "Estás al día"}</p>
        <p style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(1.8rem, 8vw, 2.2rem)", lineHeight: 1.15, margin: "2px 0" }}>{fmtMoney(total)}</p>
        <p style={{ ...panel.muted, fontSize: "1rem", color: theme.gray200 }}>
          {pendientes.length === 0 ? "No tienes multas pendientes" : `${pendientes.length} multa${pendientes.length !== 1 ? "s" : ""} pendiente${pendientes.length !== 1 ? "s" : ""}`}
        </p>
      </section>

      {pendientes.length > 0 && (
        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={panel.h2}>Pendientes</h2>
          <MultasList multas={pendientes} />
        </section>
      )}

      {pagadas.length > 0 && (
        <section style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
          <button onClick={() => setShowPagadas((v) => !v)} aria-expanded={showPagadas} style={{ ...panel.btn, ...panel.card, padding: "0 18px", minHeight: 60, justifyContent: "space-between", color: theme.white }}>
            <span>Pagadas ({pagadas.length})</span>
            <span style={{ color: theme.gray300, display: "flex" }}><ChevronIcon size={22} dir={showPagadas ? "up" : "down"} /></span>
          </button>
          {showPagadas && <MultasList multas={pagadas} />}
        </section>
      )}

      <a href={driverWhatsAppHref("¡Hola! Soy conductor de KPCars y tengo una consulta sobre una multa.")} target="_blank" rel="noopener noreferrer" style={{ ...panel.btn, minHeight: 52, fontSize: "1rem", color: theme.gray200 }}>
        <ChatIcon size={20} /> ¿Dudas con una multa? Escríbenos
      </a>
    </div>
  );
}

/* Lista de multas: un renglón por multa.
   En pantallas grandes es una tabla con encabezados; en el celular cada renglón se apila en tres líneas. */
function MultasList({ multas }) {
  return (
    <div style={{ ...panel.card, padding: 0, overflow: "hidden" }}>
      <style>{`
        .multa-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "motivo monto" "fecha vence" "auto pdf"; gap: 10px 14px; padding: 16px 18px; border-top: 1px solid rgba(255,255,255,0.08); }
        .multa-head + .multa-row { border-top: none; }
        .multa-head { display: none; }
        .multa-motivo { grid-area: motivo; } .multa-fecha { grid-area: fecha; } .multa-vence { grid-area: vence; }
        .multa-auto { grid-area: auto; align-self: center; } .multa-monto { grid-area: monto; text-align: right; } .multa-pdf { grid-area: pdf; justify-self: end; }
        @media (min-width: 768px) {
          .multa-row, .multa-head { display: grid; grid-template-columns: minmax(0, 1fr) 96px 120px 130px 150px 84px; grid-template-areas: "motivo fecha vence auto monto pdf"; gap: 14px; align-items: center; }
          .multa-head { padding: 12px 18px; background: rgba(255,255,255,0.03); font-size: 0.82rem; font-weight: 700; color: ${theme.gray300}; }
          .multa-head + .multa-row { border-top: 1px solid rgba(255,255,255,0.08); }
          .multa-lbl { display: none !important; }
        }
      `}</style>
      <div className="multa-head">
        <span>Motivo</span><span>Fecha</span><span>Vencimiento</span><span>Patente · Jurisd.</span><span style={{ textAlign: "right" }}>Monto</span><span />
      </div>
      {multas.map((m) => <MultaRow key={m.id} m={m} />)}
    </div>
  );
}

function MultaRow({ m }) {
  const vencimiento = m.fecha_vencimiento;
  const days = vencimiento ? daysUntil(vencimiento) : null;
  const vencida = days !== null && days < 0;
  const monto = Number(m.monto || 0);
  const adeudado = Number(m.monto_adeudado || 0);
  const sinMonto = m.sin_importe || monto === 0;
  const pdf = toAbsoluteUrl(m.pdf_url);

  // Etiqueta de estado: pagada, vencida o cuánto falta (solo si falta un mes o menos)
  let chip = null;
  if (m.cobrado) chip = <span style={panel.chip("#8fd9a8", "rgba(76,175,80,0.14)")}>Pagada</span>;
  else if (vencida) chip = <span style={panel.chip("#ff9d94", "rgba(255,82,82,0.16)")}>Vencida</span>;
  else if (days === 0) chip = <span style={panel.chip("#ffb347", "rgba(235,136,0,0.16)")}>Vence hoy</span>;
  else if (days !== null && days <= 30) chip = <span style={panel.chip("#ffb347", "rgba(235,136,0,0.16)")}>Vence en {days} día{days !== 1 ? "s" : ""}</span>;

  // Los rótulos chicos solo se ven en el celular (en pantallas grandes están en el encabezado)
  const lbl = { display: "block", fontSize: "0.85rem", color: theme.gray300 };
  const val = { fontSize: "1rem", fontWeight: 500 };

  return (
    <div className="multa-row">
      <div className="multa-motivo">
        <p style={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.25, margin: 0 }}>{sentenceCase(m.descripcion)}</p>
        {m.punto_rojo && <span style={{ ...panel.chip(theme.gray200, "rgba(255,255,255,0.1)"), marginTop: 6 }}>Punto rojo</span>}
      </div>
      <div className="multa-fecha">
        <span className="multa-lbl" style={lbl}>Fecha de la multa</span>
        <span style={val}>{shortDate(m.fecha)}</span>
      </div>
      <div className="multa-vence">
        <span className="multa-lbl" style={lbl}>{vencida ? "Venció el" : "Vence el"}</span>
        <span style={{ ...val, display: "block" }}>{shortDate(vencimiento)}</span>
        {chip && <span style={{ display: "block", marginTop: 4 }}>{chip}</span>}
      </div>
      <div className="multa-auto" style={val}>{fmtPatente(m.patente)} · {m.jurisdiccion || "—"}</div>
      <div className="multa-monto">
        <p style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, whiteSpace: "nowrap" }}>
          {sinMonto ? "A confirmar" : fmtMoney(m.cobrado ? monto : adeudado)}
        </p>
        {!sinMonto && !m.cobrado && adeudado < monto && (
          <p style={{ fontSize: "0.82rem", color: theme.gray300, margin: 0 }}>Pagaste {fmtMoney(monto - adeudado)} de {fmtMoney(monto)}</p>
        )}
      </div>
      <div className="multa-pdf">
        {pdf && (
          <a href={pdf} target="_blank" rel="noopener noreferrer" aria-label={`Ver la multa en PDF: ${sentenceCase(m.descripcion)} del ${shortDate(m.fecha)}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 44, padding: "0 4px", color: theme.orange, fontSize: "0.95rem", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
            <DocumentIcon size={18} /> Ver PDF
          </a>
        )}
      </div>
    </div>
  );
}
