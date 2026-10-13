import { useState, useEffect, useRef } from "react";
import { GOOGLE_SHEET_URL, WHATSAPP_PUBLIC } from "../config.js";
import { theme } from "../theme.js";
import { SectionLabel, SectionTitle, FormSection, FormGroup, FormRow } from "../components/ui.jsx";

// Nadie completa el formulario en menos de estos segundos: si llega antes, es un envío automático
const MIN_SEGUNDOS = 5;

export function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmpresa, setShowEmpresa] = useState(false);

  const nombreRef = useRef();
  const nacimientoRef = useRef();
  const direccionRef = useRef();
  const localidadRef = useRef();
  const telefonoRef = useRef();
  const emailRef = useRef();
  const licenciaRef = useRef();
  const vigenciaRef = useRef();
  const urgenciaRef = useRef();
  const alquilerPrevioRef = useRef();
  const empresaAnteriorRef = useRef();
  const referenciaRef = useRef();
  const comentarioRef = useRef();

  const handleAlquilerChange = (e) => {
    const v = e.target.value;
    setShowEmpresa(v === "Sí, a una empresa" || v === "Sí, a un particular");
  };

  // Dos trampas para envíos automáticos, que una persona no nota:
  // un casillero invisible (los programas lo completan) y el tiempo que se tardó en llenar el formulario.
  const sitioRef = useRef();
  const startedAt = useRef(0);
  useEffect(() => { startedAt.current = Date.now(); }, []);
  // true cuando el envío falló: se ofrece escribir por WhatsApp
  const [sendFailed, setSendFailed] = useState(false);

  const handleSubmit = async () => {
    // Mismos nombres y mismo orden que antes: los usa el script de Google Sheets
    const refs = {
      nombre: nombreRef, nacimiento: nacimientoRef, direccion: direccionRef, localidad: localidadRef,
      telefono: telefonoRef, email: emailRef, licencia: licenciaRef, vigencia: vigenciaRef,
      urgencia: urgenciaRef, alquilerPrevio: alquilerPrevioRef, empresaAnterior: empresaAnteriorRef,
      referencia: referenciaRef, comentario: comentarioRef,
    };
    const v = {};
    Object.keys(refs).forEach((k) => { v[k] = refs[k].current?.value?.trim?.() ?? refs[k].current?.value ?? ""; });

    if (!v.nombre || !v.nacimiento || !v.direccion || !v.localidad || !v.telefono || !v.email || !v.licencia || !v.vigencia || !v.urgencia || !v.alquilerPrevio || !v.referencia) {
      setError("Por favor completa todos los campos obligatorios (*).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) {
      setError("Ingresa un email válido.");
      return;
    }

    setError("");
    setSendFailed(false);

    // Si cayó en una trampa, se le muestra "enviada" pero no se manda nada
    const segundos = Math.round((Date.now() - startedAt.current) / 1000);
    if (sitioRef.current?.value || segundos < MIN_SEGUNDOS) {
      setSubmitted(true);
      return;
    }

    setLoading(true);

    const appsChecked = [...document.querySelectorAll(".app-check:checked")].map((c) => c.value);

    const payload = {
      ...v,
      apps: appsChecked.join(", ") || "No indicó",
      empresaAnterior: v.empresaAnterior || "—",
      comentario: v.comentario || "—",
    };

    // Solo se muestra "¡Solicitud enviada!" si la planilla contesta que la guardó.
    // Se envía como texto plano para que el navegador pueda leer la respuesta de Google.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const res = await fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...payload, sitio: "", segundos }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "La planilla no guardó la solicitud");
      setSubmitted(true);
    } catch (err) {
      console.error("Formulario Quiero manejar:", err);
      setError("No pudimos confirmar que tu solicitud haya llegado. Intenta de nuevo en un momento o escríbenos por WhatsApp.");
      setSendFailed(true);
      setLoading(false);
    } finally {
      clearTimeout(timeout);
    }
  };

  const inputStyle = { width: "100%", padding: "12px 14px", background: theme.gray800, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem" };

  if (submitted) {
    return (
      <div style={{ paddingTop: 110, maxWidth: 560, margin: "0 auto", padding: "140px 20px 100px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, background: "rgba(235,136,0,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "2rem", color: theme.orange }}>✓</div>
        <h3 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.5rem", marginBottom: 10 }}>¡Solicitud enviada!</h3>
        <p style={{ color: theme.gray400, fontSize: "0.95rem", lineHeight: 1.6 }}>Gracias por tu interés. Nos vamos a comunicar contigo en las próximas 24 horas.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ paddingTop: 110, maxWidth: 1200, margin: "0 auto", padding: "110px 20px 40px" }}>
        <SectionLabel>Súmate al equipo</SectionLabel>
        <SectionTitle>Quiero manejar con KPCars</SectionTitle>
        <p style={{ fontSize: "1rem", color: theme.gray400, maxWidth: 520, lineHeight: 1.6, marginBottom: 10 }}>
          Completa el formulario y nos ponemos en contacto contigo para coordinar los próximos pasos.
        </p>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px 100px" }}>
        {/* Solo estilos: las preguntas, el orden y los valores no se tocan (los usa el script de Google Sheets) */}
        <style>{`
          .apply-form select:has(option[value=""]:checked) { color: ${theme.gray400} !important; }
          .apply-form input::placeholder, .apply-form textarea::placeholder { color: ${theme.gray400}; opacity: 1; }
          .app-chip { transition: border-color 0.15s, background 0.15s, color 0.15s; user-select: none; }
          .app-chip:hover { border-color: rgba(255,255,255,0.18) !important; }
          .app-chip:has(.app-check:checked) { border-color: ${theme.orange} !important; background: rgba(235,136,0,0.1) !important; color: ${theme.white} !important; }
          .app-check { appearance: none; -webkit-appearance: none; width: 18px; height: 18px; margin: 0; flex-shrink: 0; border: 1.5px solid rgba(255,255,255,0.28); border-radius: 5px; background: transparent; cursor: pointer; position: relative; }
          .app-check:checked { background: ${theme.orange}; border-color: ${theme.orange}; }
          .app-check:checked::after { content: ""; position: absolute; left: 5px; top: 1px; width: 5px; height: 10px; border: solid ${theme.black}; border-width: 0 2px 2px 0; transform: rotate(45deg); }
          .app-check:focus { box-shadow: 0 0 0 3px rgba(235,136,0,0.15); }
        `}</style>
        <div className="apply-form" style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "clamp(20px, 5vw, 40px)" }}>
          {/* Casillero trampa: las personas no lo ven; si viene completo, es un envío automático */}
          <div aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
            <label>No completar este campo <input ref={sitioRef} type="text" name="kp_extra" tabIndex={-1} autoComplete="off" /></label>
          </div>
          <p style={{ fontSize: "0.82rem", color: theme.gray400, marginBottom: 24 }}>
            Los campos marcados con <span style={{ color: theme.orange }}>*</span> son obligatorios.
          </p>

          {/* ── Datos personales ── */}
          <FormSection label="Datos personales" />
          <FormRow>
            <FormGroup label="Nombre completo" required>
              <input ref={nombreRef} style={inputStyle} placeholder="Tu nombre y apellido" />
            </FormGroup>
            <FormGroup label="Fecha de nacimiento" required>
              <input ref={nacimientoRef} type="date" style={{ ...inputStyle, colorScheme: "dark" }} />
            </FormGroup>
          </FormRow>
          <FormGroup label="Dirección" required>
            <input ref={direccionRef} style={inputStyle} placeholder="Calle y número" />
          </FormGroup>
          <FormGroup label="Localidad" required>
            <select ref={localidadRef} style={inputStyle} defaultValue="">
              <option value="" disabled>Selecciona tu localidad</option>
              <optgroup label="CABA">
                <option value="CABA">Ciudad Autónoma de Buenos Aires</option>
              </optgroup>
              <optgroup label="GBA Sur">
                <option value="Avellaneda">Avellaneda</option>
                <option value="Lanús">Lanús</option>
                <option value="Lomas de Zamora">Lomas de Zamora</option>
                <option value="Quilmes">Quilmes</option>
                <option value="Berazategui">Berazategui</option>
                <option value="Florencio Varela">Florencio Varela</option>
                <option value="Almirante Brown">Almirante Brown</option>
                <option value="Esteban Echeverría">Esteban Echeverría</option>
                <option value="Ezeiza">Ezeiza</option>
              </optgroup>
              <optgroup label="GBA Oeste">
                <option value="La Matanza">La Matanza</option>
                <option value="Morón">Morón</option>
                <option value="Ituzaingó">Ituzaingó</option>
                <option value="Hurlingham">Hurlingham</option>
                <option value="Tres de Febrero">Tres de Febrero</option>
                <option value="Merlo">Merlo</option>
                <option value="Moreno">Moreno</option>
              </optgroup>
              <optgroup label="GBA Norte">
                <option value="Vicente López">Vicente López</option>
                <option value="San Isidro">San Isidro</option>
                <option value="San Martín">San Martín</option>
                <option value="San Fernando">San Fernando</option>
                <option value="Tigre">Tigre</option>
                <option value="Malvinas Argentinas">Malvinas Argentinas</option>
                <option value="José C. Paz">José C. Paz</option>
                <option value="San Miguel">San Miguel</option>
                <option value="Pilar">Pilar</option>
                <option value="Escobar">Escobar</option>
              </optgroup>
              <option value="Otro">Otra localidad</option>
            </select>
          </FormGroup>
          <FormRow>
            <FormGroup label="Teléfono" required>
              <input ref={telefonoRef} type="tel" style={inputStyle} placeholder="+54 11 1234-5678" />
            </FormGroup>
            <FormGroup label="Email" required>
              <input ref={emailRef} type="email" style={inputStyle} placeholder="tu@email.com" />
            </FormGroup>
          </FormRow>

          {/* ── Licencia ── */}
          <FormSection label="Licencia de conducir" />
          <FormRow>
            <FormGroup label="¿Tienes licencia vigente?" required>
              <select ref={licenciaRef} style={inputStyle} defaultValue="">
                <option value="" disabled>Selecciona una opción</option>
                <option value="Sí - Profesional">Sí — Profesional</option>
                <option value="Sí - Particular">Sí — Particular</option>
                <option value="En trámite">En trámite</option>
                <option value="No">No tengo licencia</option>
              </select>
            </FormGroup>
            <FormGroup label="Vigencia de la licencia" required>
              <select ref={vigenciaRef} style={inputStyle} defaultValue="">
                <option value="" disabled>Selecciona una opción</option>
                <option value="Menos de 1 año">Menos de 1 año</option>
                <option value="1 a 3 años">1 a 3 años</option>
                <option value="3 a 5 años">3 a 5 años</option>
                <option value="Más de 5 años">Más de 5 años</option>
                <option value="No aplica">No aplica</option>
              </select>
            </FormGroup>
          </FormRow>

          {/* ── Disponibilidad ── */}
          <FormSection label="Disponibilidad" />
          <FormGroup label="¿Con qué urgencia necesitas el vehículo?" required>
            <select ref={urgenciaRef} style={inputStyle} defaultValue="">
              <option value="" disabled>Selecciona una opción</option>
              <option value="Inmediata - Esta semana">Lo necesito ya (esta semana)</option>
              <option value="15 días">En los próximos 15 días</option>
              <option value="Este mes">Este mes</option>
              <option value="Sin apuro">Estoy averiguando, sin apuro</option>
            </select>
          </FormGroup>

          {/* ── Experiencia ── */}
          <FormSection label="Experiencia" />
          <FormGroup label="¿Tienes experiencia con alguna de estas plataformas?">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Uber", "Didi", "Cabify", "Particular", "Otra", "Ninguna"].map((app) => (
                <label key={app} className="app-chip" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.88rem", color: theme.gray300, cursor: "pointer", padding: "9px 14px", background: theme.gray800, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
                  <input type="checkbox" className="app-check" value={app} /> {app}
                </label>
              ))}
            </div>
          </FormGroup>
          <FormGroup label="¿Alquilaste un auto antes para trabajar?" required>
            <select ref={alquilerPrevioRef} style={inputStyle} defaultValue="" onChange={handleAlquilerChange}>
              <option value="" disabled>Selecciona una opción</option>
              <option value="No, primera vez">No, sería mi primera vez</option>
              <option value="Sí, a una empresa">Sí, a una empresa de alquiler</option>
              <option value="Sí, a un particular">Sí, a un particular</option>
            </select>
          </FormGroup>
          {showEmpresa && (
            <FormGroup label="¿En qué empresa o con quién alquilaste?">
              <input ref={empresaAnteriorRef} style={inputStyle} placeholder="Nombre de la empresa o persona" />
            </FormGroup>
          )}

          {/* ── Cierre ── */}
          <FormSection label="Para terminar" />
          <FormGroup label="¿Cómo conociste KPCars?" required>
            <select ref={referenciaRef} style={inputStyle} defaultValue="">
              <option value="" disabled>Selecciona una opción</option>
              <option value="Redes sociales">Redes sociales</option>
              <option value="Recomendación">Recomendación de un conocido</option>
              <option value="Búsqueda en Google">Búsqueda en Google</option>
              <option value="Vi un auto de KPCars">Vi un auto de KPCars en la calle</option>
              <option value="Otro">Otro</option>
            </select>
          </FormGroup>
          <FormGroup label="¿Quieres agregar algo más?">
            <textarea ref={comentarioRef} style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} placeholder="Disponibilidad horaria, consultas, etc." />
          </FormGroup>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: "100%", padding: 15, background: loading ? theme.gray600 : theme.orange, color: theme.black, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.95rem", border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer", marginTop: 8 }}
          >
            {loading ? "Enviando..." : "Enviar solicitud →"}
          </button>

          {error && <p role="alert" style={{ color: "#ff8a80", fontSize: "0.95rem", lineHeight: 1.5, marginTop: 12 }}>{error}</p>}
          {sendFailed && (
            <a
              href={`https://wa.me/${WHATSAPP_PUBLIC}?text=${encodeURIComponent("¡Hola! Quise completar el formulario para manejar con KPCars y no se envió. Me interesa alquilar un auto.")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 48, marginTop: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.28)", color: theme.white, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}
            >
              Escribir por WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
