import { useState, useEffect } from "react";
import { theme } from "../theme.js";
import { capitalize, dayLabel, fmtPatente } from "../utils/format.js";
import { turnoDay, isTurnoProximo, fetchAllTurnos, turnoStatus } from "../utils/turnos.js";
import { PlusIcon } from "../components/Icons.jsx";
import { panel } from "./panelStyles.js";

/* ── Turnos del conductor ── */
export function TurnosTab({ apiFetch, navigate }) {
  const [turnos, setTurnos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [showAll, setShowAll] = useState(false);

  const fetchTurnos = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      setTurnos(await fetchAllTurnos(apiFetch));
      setError("");
    } catch {
      if (!silent) setError("No se pudo cargar el historial de turnos.");
    } finally {
      setLoading(false);
    }
  };

  // Se actualiza solo al entrar y cada vez que el conductor vuelve a la página
  useEffect(() => {
    fetchTurnos(false);
    const onVisibility = () => { if (document.visibilityState === "visible") fetchTurnos(true); };
    const onFocus = () => fetchTurnos(true);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError("");
    try {
      const res = await apiFetch(`/turnos-externos/${cancelTarget.id}/cancelar`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No se pudo cancelar el turno.");
      setTurnos((prev) =>
        prev.map((t) => t.id === cancelTarget.id ? { ...t, status: data.appointment?.status ?? "cancelado" } : t)
      );
      setCancelTarget(null);
    } catch (err) {
      setCancelError(err.message || "No se pudo cancelar el turno. Intenta de nuevo.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <p style={{ ...panel.muted, padding: "32px 0", textAlign: "center" }}>Cargando turnos...</p>;
  if (error) return <p style={{ ...panel.muted, color: "#ff8a80", padding: "32px 0", textAlign: "center" }}>{error}</p>;

  // Próximos: el más cercano arriba. Anteriores: el más reciente arriba.
  const byDate = (a, b) => (a.scheduled_date ?? "").localeCompare(b.scheduled_date ?? "");
  const proximos = (turnos || []).filter(isTurnoProximo).sort(byDate);
  const anteriores = (turnos || []).filter((t) => !isTurnoProximo(t)).sort((a, b) => byDate(b, a));
  const anterioresVisibles = showAll ? anteriores : anteriores.slice(0, 5);

  // "2026-09-14" → "Lunes 14 de septiembre de 2026"
  const fechaConAnio = (d) => d ? capitalize(new Date(d + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })) : "—";
  const tipoYPatente =(t) => [t.type === "emergencia" ? "Turno urgente" : "Turno normal", fmtPatente(t.license_plate)].filter((x) => x && x !== "—").join(" · ");

  return (
    <div className="anim-in" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Confirmación antes de cancelar */}
      {cancelTarget && (
        <div
          onClick={() => !cancelling && setCancelTarget(null)}
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 24px", maxWidth: 400, width: "100%" }}>
            <h3 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.3rem", marginBottom: 8 }}>¿Cancelar turno?</h3>
            <p style={{ fontSize: "1rem", color: theme.gray300, lineHeight: 1.6, marginBottom: 6 }}>
              Vas a cancelar el turno del <strong style={{ color: theme.white }}>{dayLabel(turnoDay(cancelTarget)).toLowerCase()}</strong>.
            </p>
            <p style={{ fontSize: "0.95rem", color: "#ff9d94", lineHeight: 1.5, marginBottom: 20 }}>
              Recuerda que 2 turnos perdidos o cancelados sin anticipación generan una penalidad económica.
            </p>
            {cancelError && <p style={{ fontSize: "0.95rem", color: "#ff8a80", marginBottom: 12 }}>{cancelError}</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={handleCancelConfirm} disabled={cancelling}
                style={{ ...panel.btn, minHeight: 52, fontSize: "1rem", borderRadius: 12, background: cancelling ? theme.gray600 : "#c62828", color: theme.white, border: "none", cursor: cancelling ? "not-allowed" : "pointer" }}>
                {cancelling ? "Cancelando..." : "Sí, cancelar el turno"}
              </button>
              <button onClick={() => setCancelTarget(null)} disabled={cancelling} style={panel.btnQuiet}>
                No, lo mantengo
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="panel-mobile-only" onClick={() => navigate("turnos")} style={panel.btnPrimary}><PlusIcon /> Pedir un turno</button>

      <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h2 style={panel.h2}>{proximos.length > 1 ? "Próximos" : "Próximo"}</h2>
        {proximos.length === 0 ? (
          <div style={panel.card}><p style={{ ...panel.muted, fontSize: "1.05rem" }}>No tienes turnos agendados.</p></div>
        ) : proximos.map((t) => {
          const s = turnoStatus[t.status] || turnoStatus.agendado;
          return (
            <article key={t.id} style={{ ...panel.card, border: `1px solid ${theme.orange}`, display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ ...panel.chip(s.color, s.bg), alignSelf: "flex-start" }}>{s.label}</span>
              <p style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.5rem", lineHeight: 1.15, margin: 0 }}>{dayLabel(turnoDay(t))}</p>
              <p style={{ fontSize: "1rem", color: theme.gray200, margin: 0 }}>{t.service}</p>
              <p style={panel.muted}>{tipoYPatente(t)}</p>
              {t.status === "agendado" && (
                <>
                  <button onClick={() => { setCancelTarget(t); setCancelError(""); }} style={{ ...panel.btnQuiet, marginTop: 8 }}>Cancelar este turno</button>
                  <p style={{ ...panel.muted, fontSize: "0.9rem" }}>Si no puedes ir, cancela con al menos 24 hs de anticipación para que no cuente como turno perdido.</p>
                </>
              )}
            </article>
          );
        })}
      </section>

      {anteriores.length > 0 && (
        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={panel.h2}>Anteriores</h2>
          {anterioresVisibles.map((t) => {
            const s = turnoStatus[t.status] || turnoStatus.agendado;
            return (
              <div key={t.id} style={{ ...panel.card, padding: "14px 16px", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0, flex: "1 1 180px" }}>
                  <p style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>{fechaConAnio(turnoDay(t))}</p>
                  <p style={panel.muted}>{t.service}</p>
                </div>
                <span style={panel.chip(s.color, s.bg)}>{s.label}</span>
              </div>
            );
          })}
          {anteriores.length > 5 && (
            <button onClick={() => setShowAll((v) => !v)} style={panel.btnText}>
              {showAll ? "Ver menos" : `Ver todos los anteriores (${anteriores.length})`}
            </button>
          )}
        </section>
      )}
    </div>
  );
}
