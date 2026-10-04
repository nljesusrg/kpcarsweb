import { useState, useEffect, useRef } from "react";
import { theme } from "../theme.js";
import { toAbsoluteUrl } from "../utils/format.js";
import { CarIcon, PencilIcon } from "../components/Icons.jsx";
import { ProfileAvatar } from "../components/ProfileAvatar.jsx";
import { Skel } from "../components/ui.jsx";

/* ── Perfil del conductor ── */
export function ProfileTab({ user, apiFetch, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(user.email || "");
  const [telefono, setTelefono] = useState(user.telefono || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [focusTarget, setFocusTarget] = useState(null);
  const firstSyncDone = useRef(false);

  const syncMe = async () => {
    try {
      const res = await apiFetch("/me");
      const data = await res.json();
      const inner = data.user || data;
      if (!inner.id && !inner.name) return;
      const updated = {
        ...user,
        email: inner.correo || inner.email || user.email,
        telefono: inner.telefono || user.telefono,
        licenciaVencimiento: inner.fecha_vencimiento_licencia || user.licenciaVencimiento,
        foto: inner.profile_photo_url ? toAbsoluteUrl(inner.profile_photo_url) : user.foto,
      };
      onUpdate(updated);
      if (!editing) {
        setEmail(updated.email || "");
        setTelefono(updated.telefono || "");
      }
    } catch { /* si falla la sincronización, se muestran los datos que ya había */ } finally {
      if (!firstSyncDone.current) {
        firstSyncDone.current = true;
        setLoadingProfile(false);
      }
    }
  };

  useEffect(() => {
    syncMe();
    const onVisibility = () => { if (document.visibilityState === "visible") syncMe(); };
    const onFocus = () => syncMe();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSaveOk(false);
    try {
      const payload = {};
      if (email.trim()) payload.correo = email.trim();
      if (telefono.trim()) payload.telefono = telefono.trim();
      const res = await apiFetch("/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No se pudo guardar.");
      const updated = { ...user, email, telefono };
      onUpdate(updated);
      setSaveOk(true);
      setEditing(false);
      setTimeout(() => setSaveOk(false), 3000);
      syncMe();
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEmail(user.email || "");
    setTelefono(user.telefono || "");
    setSaveError("");
    setEditing(false);
    setFocusTarget(null);
  };

  const inputS = { padding: "6px 10px", background: theme.gray700, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 7, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", width: "100%", maxWidth: 190 };
  const fmtDNI = (v) => String(v).replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const cardBase = { background: theme.gray900, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 24 };

  if (loadingProfile) return (
    <div>
      <div className="profile-cards-grid" style={{ display: "grid", gap: 20 }}>
        <style>{`.profile-cards-grid { grid-template-columns: 300px 1fr; } @media (max-width: 720px) { .profile-cards-grid { grid-template-columns: 1fr; } }`}</style>

        {/* Skeleton izquierda */}
        <div style={{ ...cardBase, display: "flex", flexDirection: "column" }}>
          <Skel w={80} h={10} mb={22} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 22, gap: 10 }}>
            <Skel w={88} h={88} r={20} mb={4} />
            <Skel w={120} h={14} />
            <Skel w={60} h={9} />
          </div>
          <div style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", marginBottom: 20 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
            {[100, 85, 95, 75].map((w, i) => <Skel key={i} w={`${w}%`} h={12} />)}
          </div>
          <Skel w="100%" h={42} r={12} mb={0} style={{ marginTop: 28 }} />
        </div>

        {/* Skeleton derecha */}
        <div style={{ ...cardBase, display: "flex", flexDirection: "column", gap: 16 }}>
          <Skel w={110} h={10} />
          <Skel w={180} h={28} r={8} />
          <Skel w={120} h={12} />
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "4px 0" }} />
          <Skel w={70} h={9} />
          <Skel w="60%" h={36} r={8} />
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "4px 0" }} />
          <div style={{ display: "flex", gap: 16 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <Skel w="60%" h={9} />
                <Skel w="80%" h={12} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="anim-in">
      <div className="profile-cards-grid" style={{ display: "grid", gap: 20 }}>
        <style>{`.profile-cards-grid { grid-template-columns: 300px 1fr; } @media (max-width: 720px) { .profile-cards-grid { grid-template-columns: 1fr; } }`}</style>

        {/* ── Tarjeta izquierda: conductor ── */}
        <div className="ci" style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column" }}>

          {/* ID */}
          <div style={{ marginBottom: 22 }}>
            <span style={{ fontSize: "0.7rem", color: theme.gray400, letterSpacing: 1.5, fontWeight: 500 }}>
              ID · {user.dni || "—"}
            </span>
          </div>

          {/* Avatar + nombre + rol */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 22 }}>
            <div style={{ width: 88, height: 88, borderRadius: 20, background: "linear-gradient(145deg, rgba(235,136,0,0.28), rgba(235,136,0,0.1))", border: "2px solid rgba(235,136,0,0.2)", overflow: "hidden", marginBottom: 14 }}>
              <ProfileAvatar user={user} size={88} />
            </div>
            <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.15rem", color: theme.white, marginBottom: 4, textAlign: "center" }}>
              {`${user.nombre || ""} ${user.apellido || ""}`.trim() || "Conductor"}
            </div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: 3, color: theme.orange, textTransform: "uppercase" }}>
              {user.role === "administrador" ? "Administrador" : "Conductor"}
            </div>
          </div>

          {/* Separador punteado */}
          <div style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", marginBottom: 20 }} />

          {/* Campos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
            {[
              {
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
                label: "DNI",
                display: user.dni ? fmtDNI(user.dni) : "—",
              },
              {
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.7 10.81 19.79 19.79 0 01.67 2.18 2 2 0 012.65 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.72 6.72l.91-.91a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
                label: "TELÉFONO",
                fieldKey: "telefono",
                display: editing ? null : (user.telefono || null),
                editEl: editing ? <input autoFocus={focusTarget === "telefono"} style={inputS} type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+54 9 11 …" /> : null,
                canAdd: true,
              },
              {
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                label: "EMAIL",
                fieldKey: "email",
                display: editing ? null : (user.email || null),
                editEl: editing ? <input autoFocus={focusTarget === "email"} style={inputS} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" /> : null,
                canAdd: true,
              },
              {
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                label: "VENCIM. LICENCIA",
                display: user.licenciaVencimiento
                  ? new Date(user.licenciaVencimiento + "T12:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
                  : "—",
              },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, animation: `ci 0.45s cubic-bezier(0.22,1,0.36,1) ${0.06 * i + 0.18}s both`, opacity: 0 }}>
                <span style={{ color: theme.gray400, flexShrink: 0, display: "flex" }}>{f.icon}</span>
                <span style={{ fontSize: "0.67rem", fontWeight: 700, letterSpacing: 1.5, color: theme.gray400, textTransform: "uppercase", flexShrink: 0 }}>{f.label}</span>
                <div style={{ flex: 1, textAlign: "right" }}>
                  {f.editEl || (
                    f.display && f.display !== null
                      ? <span style={{ fontSize: "0.9rem", fontWeight: 600, color: f.display === "—" ? theme.gray600 : theme.white }}>{f.display}</span>
                      : f.canAdd
                        ? <button onClick={() => { setEditing(true); setSaveOk(false); setFocusTarget(f.fieldKey); }} style={{ background: "none", border: "none", padding: 0, fontSize: "0.85rem", color: theme.orange, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>+ Agregar</button>
                        : null
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Acciones */}
          <div style={{ marginTop: 24 }}>
            {saveOk && !editing && <p style={{ fontSize: "0.78rem", color: "#4caf50", marginBottom: 10, textAlign: "center" }}>Cambios guardados ✓</p>}
            {saveError && <p style={{ fontSize: "0.78rem", color: "#ff6b6b", marginBottom: 10 }}>{saveError}</p>}
            {editing ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleCancel} disabled={saving}
                  style={{ flex: 1, padding: "10px 0", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving}
                  style={{ flex: 1, padding: "10px 0", background: theme.orange, border: "none", borderRadius: 10, color: theme.black, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            ) : (
              <button onClick={() => { setEditing(true); setSaveOk(false); }}
                style={{ width: "100%", padding: "11px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: theme.gray300, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.87rem", cursor: "pointer" }}>
                <PencilIcon size={14} /> Editar información personal
              </button>
            )}
          </div>
        </div>

        {/* ── Tarjeta derecha: vehículo ── */}
        {user.autoAsignado ? (
          <VehicleCard auto={user.autoAsignado} />
        ) : (
          <div className="ci ci-2" style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center", minHeight: 220 }}>
            <div style={{ width: 60, height: 60, borderRadius: 14, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CarIcon size={32} opacity={0.25} />
            </div>
            <p style={{ color: theme.gray400, fontSize: "0.9rem", lineHeight: 1.6 }}>Todavía no tienes<br />un vehículo asignado.</p>
          </div>
        )}
      </div>

      {/* Historial */}
      {user.historialAutos && user.historialAutos.length > 0 && (
        <div style={{ marginTop: 20, background: theme.gray900, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "clamp(20px, 4vw, 28px)" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, color: theme.gray400, marginBottom: 14 }}>Vehículos anteriores</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {user.historialAutos.map((auto, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CarIcon size={20} opacity={0.3} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{auto.model}</div>
                  <div style={{ fontSize: "0.78rem", color: theme.gray400 }}>{auto.patente}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "0.7rem", color: theme.gray400, lineHeight: 1.5 }}>Desde {auto.desde}</div>
                  {auto.hasta && <div style={{ fontSize: "0.7rem", color: theme.gray400 }}>al {auto.hasta}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Tarjeta de vehículo ── */
function VehicleCard({ auto }) {
  const words = (auto.model || "").split(" ");
  const marca = words[0] || "";
  const modelo = words.slice(1).join(" ");

  return (
    <div className="ci ci-2" style={{ background: "linear-gradient(145deg, #1c1c1c 0%, #161616 100%)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 300, height: 300, background: "radial-gradient(circle, rgba(235,136,0,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* Estado */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 22 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: theme.orange, display: "inline-block", flexShrink: 0 }} />
        <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: 3, color: theme.orange, textTransform: "uppercase" }}>Vehículo en uso</span>
      </div>

      {/* Marca + Modelo */}
      <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: 2.5, color: theme.gray400, textTransform: "uppercase", marginBottom: 4 }}>{marca}</p>
      <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", letterSpacing: -0.5, color: theme.white, marginBottom: 6 }}>{modelo}</h2>
      <p style={{ fontSize: "0.85rem", color: theme.gray400, marginBottom: 0 }}>
        {[auto.variant, auto.year ? `Modelo ${auto.year}` : ""].filter(Boolean).join(" · ")}
      </p>

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "20px 0" }} />

      {/* Patente */}
      <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: 2.5, color: theme.gray400, textTransform: "uppercase", marginBottom: 12 }}>Patente</p>
      <PlateDisplay patente={auto.patente} />


      <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "20px 0" }} />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: auto.transmission ? "1fr 1fr 1fr" : "1fr 1fr", gap: 20 }}>
        {[
          {
            icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
            label: "En uso desde", value: auto.desde || "—",
          },
          {
            icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
            label: "Modelo", value: auto.year || "—",
          },
          ...(auto.transmission ? [{
            icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><line x1="5" y1="10" x2="5" y2="4"/><line x1="5" y1="20" x2="5" y2="14"/><line x1="7" y1="12" x2="17" y2="7"/><line x1="7" y1="12" x2="17" y2="17"/></svg>,
            label: "Transmisión",
            value: auto.transmission === "Manual" ? "Manual · 6 vel." : auto.transmission,
          }] : []),
        ].map((s, i) => (
          <div key={i}>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: 2, color: theme.gray400, textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
              {s.icon}{s.label}
            </p>
            <p style={{ fontSize: "0.95rem", fontWeight: 700, color: theme.white }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Patente ── */
function PlateDisplay({ patente }) {
  if (!patente) return <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "2rem", color: theme.gray600 }}>—</span>;
  const clean = patente.toUpperCase().replace(/[\s-]/g, "");
  let formatted = patente.toUpperCase();
  if (clean.length === 7) formatted = `${clean.slice(0,2)} ${clean.slice(2,5)} ${clean.slice(5)}`;
  else if (clean.length === 6) formatted = `${clean.slice(0,3)} ${clean.slice(3)}`;

  return (
    <span style={{
      fontFamily: "'Archivo Black', sans-serif",
      fontSize: "clamp(2rem, 4vw, 2.8rem)",
      letterSpacing: 4,
      color: theme.white,
      display: "block",
      lineHeight: 1,
    }}>
      {formatted}
    </span>
  );
}
