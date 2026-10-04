import { useState } from "react";
import { useNavigate } from "react-router";
import { theme } from "../theme.js";
import { pad2, localDateStr, capitalize, fmtPatente } from "../utils/format.js";
import { AlertIcon, ChevronIcon } from "../components/Icons.jsx";
import { panel } from "../panel/panelStyles.js";

/* Pedir turno, paso a paso: 1) qué le pasa al auto  2) qué día  3) revisar y confirmar.
   Un turno urgente no elige día: pasa directo del paso 1 al 3. */
const TURNO_DAYS_AHEAD = 60;   // hasta cuántos días para adelante se puede pedir

const TURNO_DAYS_PER_PAGE = 6; // cuántos días se muestran de entrada (y con cada "Ver más días")

const TURNO_MAX_PER_DAY = 4;   // con esta cantidad de turnos normales, el día queda sin lugar

export function TurnosPage({ user, apiFetch }) {
  const routerNavigate = useNavigate();
  const [step, setStep] = useState(1);
  const [urgencia, setUrgencia] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fullDates, setFullDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [daysShown, setDaysShown] = useState(TURNO_DAYS_PER_PAGE);

  const isUrgente = urgencia === "urgente";
  const goToPanelTurnos = () => routerNavigate("/panel/turnos");

  // Averigua qué días ya están completos. Se pide mes por mes, igual que antes.
  const loadFullDates = async () => {
    setLoadingDates(true);
    try {
      const start = new Date();
      const end = new Date(); end.setDate(end.getDate() + TURNO_DAYS_AHEAD);
      const months = [];
      for (let m = new Date(start.getFullYear(), start.getMonth(), 1); m <= end; m = new Date(m.getFullYear(), m.getMonth() + 1, 1)) months.push(m);
      const results = await Promise.all(months.map(async (m) => {
        const y = m.getFullYear(), mo = m.getMonth();
        const from = `${y}-${pad2(mo + 1)}-01`;
        const to = `${y}-${pad2(mo + 1)}-${pad2(new Date(y, mo + 1, 0).getDate())}`;
        const res = await apiFetch(`/sync-turnos?from=${from}&to=${to}`);
        return res.json();
      }));
      const counts = {};
      results.forEach((data) => (data.appointments || []).forEach((apt) => {
        if (apt.type?.toLowerCase() === "normal") {
          const key = apt.scheduled_date?.split("T")[0] ?? "";
          if (key) counts[key] = (counts[key] || 0) + 1;
        }
      }));
      setFullDates(Object.keys(counts).filter((d) => counts[d] >= TURNO_MAX_PER_DAY));
    } catch (err) {
      console.error("sync-turnos error:", err);
    } finally {
      setLoadingDates(false);
    }
  };

  // Días que se pueden ofrecer: de hoy en adelante, sin miércoles, sábados ni domingos
  const dayOptions = [];
  for (let i = 0; i <= TURNO_DAYS_AHEAD; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    if ([0, 3, 6].includes(d.getDay())) continue;
    const dateStr = localDateStr(d);
    dayOptions.push({ dateStr, full: fullDates.includes(dateStr) });
  }

  const handleStep1 = () => {
    if (!descripcion.trim()) { setError("Cuéntanos qué le pasa al auto o el motivo de la revisión."); return; }
    if (!urgencia) { setError("Elige si es un turno normal o urgente."); return; }
    setError("");
    if (isUrgente) { setSelectedDate(null); setStep(3); }
    else { setStep(2); loadFullDates(); }
    window.scrollTo({ top: 0 });
  };

  const handleStep2 = () => {
    if (!selectedDate) { setError("Elige un día para el turno."); return; }
    setError("");
    setStep(3);
    window.scrollTo({ top: 0 });
  };

  const handleBack = () => {
    setError("");
    if (step === 1) goToPanelTurnos();
    else if (step === 3 && isUrgente) setStep(1);
    else setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!descripcion.trim()) {
      setError("Describe el problema o motivo de la revisión.");
      return;
    }
    if (!urgencia) {
      setError("Selecciona el nivel de urgencia.");
      return;
    }
    if (!isUrgente && !selectedDate) {
      setError("Selecciona un día para el turno.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/mis-turnos", {
        method: "POST",
        body: JSON.stringify({
          service: descripcion,
          preferred_date: isUrgente ? localDateStr() : selectedDate,
          type: isUrgente ? "emergencia" : "normal",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.message || "Error al solicitar el turno.";
        setError(msg);
        setLoading(false);
        return;
      }

      setLoading(false);
      setConfirmed(true);
    } catch (err) {
      setError(err.message || "Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  };

  const wrap = { maxWidth: 560, margin: "0 auto", padding: "96px 20px 60px" };
  const inputStyle = { width: "100%", padding: "14px 16px", background: theme.gray800, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontSize: "1.05rem", outline: "none", boxSizing: "border-box" };
  // "martes 6 de octubre"
  const selectedDayText = selectedDate ? new Date(selectedDate + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }) : "";

  if (confirmed) {
    return (
      <div style={wrap}>
        <div className="anim-in" style={{ textAlign: "center", padding: "32px 0" }}>
          <div style={{ width: 72, height: 72, background: isUrgente ? "rgba(255,82,82,0.14)" : "rgba(235,136,0,0.14)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "2rem", color: isUrgente ? "#ff8a80" : theme.orange }}>✓</div>
          <h1 style={{ ...panel.h1, fontSize: "1.8rem", marginBottom: 12 }}>{isUrgente ? "Turno urgente confirmado" : "Turno confirmado"}</h1>
          {isUrgente ? (
            <>
              <p style={{ ...panel.muted, fontSize: "1.05rem" }}>Tu turno de emergencia quedó registrado. El taller fue notificado y te atenderán</p>
              <p style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.4rem", color: "#ff8a80", margin: "6px 0 0" }}>a la brevedad posible.</p>
              <p style={{ ...panel.muted, marginTop: 16 }}>Preséntate en el taller con el vehículo. Si no puedes asistir, cancela con anticipación para evitar penalidades.</p>
            </>
          ) : (
            <>
              <p style={{ ...panel.muted, fontSize: "1.05rem" }}>Tu turno quedó confirmado para el</p>
              <p style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.4rem", color: theme.orange, margin: "6px 0 0" }}>
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p style={{ ...panel.muted, marginTop: 16 }}>
                Preséntate puntual. Si no puedes asistir, cancela con al menos <strong style={{ color: theme.white }}>24 hs de anticipación</strong> para evitar que cuente como turno perdido.
              </p>
            </>
          )}
          <button onClick={goToPanelTurnos} style={{ ...panel.btnPrimary, marginTop: 28 }}>Ver mis turnos</button>
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div className="anim-in" style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        <button onClick={handleBack} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, minHeight: 44, background: "none", border: "none", color: theme.gray200, fontFamily: "'DM Sans', sans-serif", fontSize: "1rem", fontWeight: 700, cursor: "pointer", padding: 0 }}>
          <ChevronIcon dir="left" /> Volver
        </button>

        {/* En qué paso está */}
        <div>
          <p style={{ fontSize: "0.9rem", fontWeight: 700, color: theme.orange, margin: "0 0 10px" }}>Paso {step} de 3</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {[1, 2, 3].map((n) => <div key={n} style={{ height: 6, borderRadius: 3, background: n <= step ? theme.orange : theme.gray700 }} />)}
          </div>
        </div>

        {/* ── Paso 1: qué le pasa al auto ── */}
        {step === 1 && (
          <>
            <h1 style={{ ...panel.h1, fontSize: "clamp(1.6rem, 7vw, 1.9rem)" }}>¿Qué le pasa al auto?</h1>

            {!user.autoAsignado && (
              <div style={{ ...panel.card, display: "flex", gap: 12, borderColor: "rgba(235,136,0,0.3)" }}>
                <span style={{ color: theme.orange, display: "flex", flexShrink: 0 }}><AlertIcon size={20} /></span>
                <p style={panel.muted}>Todavía no tienes un vehículo asignado. Puedes igualmente solicitar un turno y el sistema lo vinculará una vez que se te asigne uno.</p>
              </div>
            )}

            <div>
              <label htmlFor="turno-descripcion" style={{ display: "block", fontSize: "1rem", fontWeight: 700, marginBottom: 8 }}>Cuéntanos el problema o el motivo</label>
              <textarea
                id="turno-descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
                placeholder="Ej: Hace ruido al frenar, service de rutina, problema con el aire acondicionado..."
              />
            </div>

            <div>
              <p style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 10px" }}>¿Es urgente?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { value: "normal", label: "No, es un turno normal", desc: "Revisión de rutina, service o problema menor. Eliges el día en el paso siguiente.", color: theme.orange, bgColor: "rgba(235,136,0,0.1)" },
                  { value: "urgente", label: "Sí, es urgente", desc: "El vehículo tiene una falla grave que te impide trabajar hoy. Solo usa esta opción si realmente no puedes circular.", color: "#ff8a80", bgColor: "rgba(255,82,82,0.1)" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setUrgencia(opt.value); if (opt.value === "urgente") setSelectedDate(null); }}
                    aria-pressed={urgencia === opt.value}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12, padding: 16,
                      background: urgencia === opt.value ? opt.bgColor : "transparent",
                      border: `2px solid ${urgencia === opt.value ? opt.color : "rgba(255,255,255,0.14)"}`,
                      borderRadius: 14, cursor: "pointer", textAlign: "left",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 2, boxSizing: "border-box",
                      border: urgencia === opt.value ? `7px solid ${opt.color}` : "2px solid rgba(255,255,255,0.35)",
                    }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1.05rem", color: urgencia === opt.value ? opt.color : theme.white, marginBottom: 2 }}>{opt.label}</div>
                      <div style={{ fontSize: "0.95rem", color: theme.gray300, lineHeight: 1.4 }}>{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {isUrgente && (
              <div className="anim-in" style={{ background: "rgba(255,82,82,0.08)", border: "1px solid rgba(255,82,82,0.35)", borderRadius: 14, padding: 18 }}>
                <p style={{ fontSize: "1rem", color: "#ff8a80", fontWeight: 700, margin: "0 0 6px", display: "flex", alignItems: "center", gap: 7 }}><AlertIcon size={18} /> Atención: turno de emergencia</p>
                <p style={{ ...panel.muted, color: theme.gray200 }}>
                  Esta opción es exclusivamente para fallas graves que <strong style={{ color: theme.white }}>te impiden circular hoy</strong>. No es para adelantar revisiones ni evitar espera.
                </p>
                <p style={{ ...panel.muted, color: "#ff9d94", marginTop: 8 }}>
                  El uso indebido de turnos urgentes puede derivar en <strong>penalidades económicas</strong> y restricción del sistema.
                </p>
              </div>
            )}

            {error && <p style={{ color: "#ff8a80", fontSize: "1rem", margin: 0 }}>{error}</p>}
            <button onClick={handleStep1} style={panel.btnPrimary}>Seguir</button>
          </>
        )}

        {/* ── Paso 2: qué día ── */}
        {step === 2 && (
          <>
            <h1 style={{ ...panel.h1, fontSize: "clamp(1.6rem, 7vw, 1.9rem)" }}>¿Qué día te queda bien?</h1>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, opacity: loadingDates ? 0.4 : 1, pointerEvents: loadingDates ? "none" : "auto", transition: "opacity 0.2s" }}>
              {dayOptions.slice(0, daysShown).map(({ dateStr, full }) => {
                const selected = selectedDate === dateStr;
                const date = new Date(dateStr + "T12:00:00");
                const weekday = dateStr === localDateStr() ? "Hoy" : capitalize(date.toLocaleDateString("es-AR", { weekday: "long" }));
                const dayMonth = date.toLocaleDateString("es-AR", { day: "numeric", month: "long" });
                return (
                  <button
                    key={dateStr}
                    onClick={() => { setSelectedDate(dateStr); setError(""); }}
                    disabled={full}
                    aria-pressed={selected}
                    style={{
                      minHeight: 76, borderRadius: 14, fontFamily: "'DM Sans', sans-serif",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                      cursor: full ? "default" : "pointer",
                      background: selected ? theme.orange : full ? "transparent" : theme.gray900,
                      border: selected ? `1px solid ${theme.orange}` : full ? "1px dashed rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.2)",
                      color: selected ? theme.black : full ? theme.gray300 : theme.white,
                    }}
                  >
                    <span style={{ fontSize: "0.9rem", fontWeight: selected ? 700 : 500, color: selected ? theme.black : theme.gray300 }}>{full ? `${weekday} ${dayMonth}` : weekday}</span>
                    <span style={{ fontSize: full ? "1rem" : "1.2rem", fontWeight: 700 }}>{full ? "Sin lugar" : dayMonth}</span>
                  </button>
                );
              })}
            </div>

            {loadingDates && <p style={{ ...panel.muted, textAlign: "center" }}>Buscando días disponibles...</p>}
            {daysShown < dayOptions.length && (
              <button onClick={() => setDaysShown((n) => n + TURNO_DAYS_PER_PAGE)} style={panel.btnText}>Ver más días</button>
            )}
            <p style={panel.muted}>El taller no atiende turnos normales miércoles, sábados ni domingos.</p>

            {error && <p style={{ color: "#ff8a80", fontSize: "1rem", margin: 0 }}>{error}</p>}
            <button onClick={handleStep2} style={panel.btnPrimary}>{selectedDate ? `Seguir con el ${selectedDayText}` : "Seguir"}</button>
          </>
        )}

        {/* ── Paso 3: revisar y confirmar ── */}
        {step === 3 && (
          <>
            <h1 style={{ ...panel.h1, fontSize: "clamp(1.6rem, 7vw, 1.9rem)" }}>Revisa y confirma</h1>

            <div style={{ ...panel.card, display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Día", value: isUrgente ? "Hoy, a la brevedad posible" : capitalize(selectedDayText) },
                { label: "Tipo de turno", value: isUrgente ? "Urgente" : "Normal" },
                { label: "Motivo", value: descripcion.trim() },
                ...(user.autoAsignado ? [{ label: "Vehículo", value: `${user.autoAsignado.model} · ${fmtPatente(user.autoAsignado.patente)}` }] : []),
              ].map((row) => (
                <div key={row.label}>
                  <p style={{ fontSize: "0.88rem", color: theme.gray300, margin: 0 }}>{row.label}</p>
                  <p style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, overflowWrap: "anywhere" }}>{row.value}</p>
                </div>
              ))}
            </div>

            <div style={{ ...panel.card, background: "rgba(255,255,255,0.03)" }}>
              <p style={{ ...panel.muted, marginBottom: 6 }}>
                <strong style={{ color: theme.gray200 }}>Política de turnos:</strong> Ausentarse sin cancelar con al menos 24 hs de anticipación cuenta como turno perdido.
              </p>
              <p style={{ ...panel.muted, color: "#ff9d94" }}>
                Acumular <strong>2 turnos perdidos</strong> genera una <strong>penalidad económica</strong> según el reglamento vigente.
              </p>
            </div>

            {error && <p style={{ color: "#ff8a80", fontSize: "1rem", margin: 0 }}>{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ ...panel.btnPrimary, background: loading ? theme.gray600 : (isUrgente ? "#d32f2f" : theme.orange), color: loading || isUrgente ? theme.white : theme.black, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Enviando..." : isUrgente ? "Confirmar turno urgente" : "Confirmar turno"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
