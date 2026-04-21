import { useState, useEffect, useRef } from "react";

const GOOGLE_SHEET_URL = ""; // ← Pegá acá tu URL de Google Apps Script

/* ─────────────────────────────────────────────
   CATALOG DATA — editá acá para actualizar autos
   ───────────────────────────────────────────── */
const cars = [
  {
    model: "Toyota Corolla",
    variant: "Automático",
    year: "2016–2019",
    priceWeekly: "360.000",
    features: ["Automático", "Aire acondicionado", "Sedán", "Baúl amplio"],
  },
  {
    model: "Toyota Corolla",
    variant: "Manual",
    year: "2016–2019",
    priceWeekly: "360.000",
    features: ["Manual", "Aire acondicionado", "Sedán", "Baúl amplio"],
  },
  {
    model: "Toyota Etios",
    variant: "Automático",
    year: "2016–2019",
    priceWeekly: "330.000",
    features: ["Automático", "Aire acondicionado", "Compacto", "Bajo consumo"],
  },
  {
    model: "Toyota Etios",
    variant: "Manual",
    year: "2016–2019",
    priceWeekly: "330.000",
    features: ["Manual", "Aire acondicionado", "Compacto", "Bajo consumo"],
  },
];

/* ─────────────────────────────────────────────
   STYLES
   ───────────────────────────────────────────── */
const theme = {
  black: "#0a0a0a",
  white: "#ffffff",
  orange: "#eb8800",
  orangeLight: "#ff9f1c",
  gray900: "#141414",
  gray800: "#1a1a1a",
  gray700: "#2a2a2a",
  gray600: "#3a3a3a",
  gray400: "#888",
  gray300: "#aaa",
  gray200: "#ccc",
};

/* ─────────────────────────────────────────────
   ICONS (inline SVGs)
   ───────────────────────────────────────────── */
const CarIcon = ({ size = 64, opacity = 0.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity }}>
    <path d="M5 17h1m12 0h1M7 11h10M5 11l1.5-5h11L19 11M5 11H3.6a1 1 0 0 0-1 .8L2 15h1.5A1.5 1.5 0 0 0 5 13.5V11Zm14 0h1.4a1 1 0 0 1 1 .8L22 15h-1.5a1.5 1.5 0 0 1-1.5-1.5V11ZM7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─────────────────────────────────────────────
   MAIN APP
   ───────────────────────────────────────────── */
export default function KPCarsApp() {
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (p) => {
    setPage(p);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: theme.black, color: theme.white, minHeight: "100vh", WebkitFontSmoothing: "antialiased" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Archivo+Black&display=swap" rel="stylesheet" />
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .anim-in { animation: fadeUp 0.65s ease-out forwards; }
        .d1 { animation-delay: 0.08s; opacity: 0; }
        .d2 { animation-delay: 0.16s; opacity: 0; }
        .d3 { animation-delay: 0.24s; opacity: 0; }
        input:focus, select:focus, textarea:focus { border-color: ${theme.orange} !important; box-shadow: 0 0 0 3px rgba(235,136,0,0.15); outline: none; }
        select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px !important; }
        select option { background: ${theme.gray800}; color: white; }
      `}</style>

      <Nav page={page} navigate={navigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {page === "home" && <HomePage navigate={navigate} />}
      {page === "catalog" && <CatalogPage navigate={navigate} />}
      {page === "apply" && <ApplyPage />}

      <Footer navigate={navigate} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   NAV
   ───────────────────────────────────────────── */
function Nav({ page, navigate, menuOpen, setMenuOpen }) {
  const s = {
    nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,10,10,0.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
    inner: { maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo: { fontFamily: "'Archivo Black', sans-serif", fontSize: "1.5rem", letterSpacing: -0.5, cursor: "pointer", display: "flex", gap: 2, textDecoration: "none", color: theme.white },
    link: (active) => ({ color: active ? theme.white : theme.gray300, textDecoration: "none", fontSize: "0.88rem", fontWeight: 500, padding: "8px 14px", borderRadius: 8, background: active ? "rgba(255,255,255,0.06)" : "transparent", cursor: "pointer", display: "block" }),
    cta: { background: theme.orange, color: theme.black, fontWeight: 700, padding: "8px 16px", borderRadius: 8, fontSize: "0.88rem", cursor: "pointer", textDecoration: "none", display: "block", textAlign: "center" },
    hamburger: { background: "none", border: "none", cursor: "pointer", padding: 4, display: "none" },
    mobileLinks: { position: "absolute", top: 64, left: 0, right: 0, background: "rgba(10,10,10,0.98)", backdropFilter: "blur(20px)", padding: "12px 20px 16px", display: "flex", flexDirection: "column", gap: 4, borderBottom: "1px solid rgba(255,255,255,0.06)" },
  };

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        <div style={s.logo} onClick={() => navigate("home")}>KP<span style={{ color: theme.orange }}>Cars</span></div>

        {/* Desktop links */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }} className="desktop-nav">
          <a style={s.link(page === "home")} onClick={() => navigate("home")}>Inicio</a>
          <a style={s.link(page === "catalog")} onClick={() => navigate("catalog")}>Flota</a>
          <a style={s.cta} onClick={() => navigate("apply")}>Quiero manejar</a>
        </div>

        {/* Mobile hamburger */}
        <button style={s.hamburger} className="mobile-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {menuOpen && (
        <div style={s.mobileLinks}>
          <a style={s.link(page === "home")} onClick={() => navigate("home")}>Inicio</a>
          <a style={s.link(page === "catalog")} onClick={() => navigate("catalog")}>Flota</a>
          <a style={{ ...s.cta, marginTop: 4 }} onClick={() => navigate("apply")}>Quiero manejar</a>
        </div>
      )}

      <style>{`
        @media (min-width: 769px) { .mobile-hamburger { display: none !important; } }
        @media (max-width: 768px) { .desktop-nav { display: none !important; } .mobile-hamburger { display: flex !important; } }
      `}</style>
    </nav>
  );
}

/* ─────────────────────────────────────────────
   HOME PAGE
   ───────────────────────────────────────────── */
function HomePage({ navigate }) {
  const stats = [
    { number: "70+", label: "Choferes activos" },
    { number: "90+", label: "Vehículos en flota" },
    { number: "100%", label: "Flota Toyota" },
    { number: "BA", label: "Buenos Aires" },
  ];

  const features = [
    { icon: "🚗", title: "Flota 100% Toyota", desc: "Corolla y Etios modelos 2016–2019: vehículos confiables, económicos y con respaldo de la marca más vendida de Argentina." },
    { icon: "📋", title: "Papeles al día", desc: "Seguro, VTV, y toda la documentación necesaria para que manejes tranquilo y sin preocupaciones legales." },
    { icon: "🔧", title: "Taller propio", desc: "Contamos con taller propio donde hacemos todo tipo de mantenimiento y service. No dependés de terceros." },
    { icon: "💰", title: "Alquiler semanal", desc: "Pago semanal fijo. Sabés exactamente cuánto pagás cada semana, sin sorpresas ni costos ocultos." },
    { icon: "📱", title: "Trabajá donde quieras", desc: "Uber, Didi, Cabify, particular o cualquier empresa de transporte. Sin restricciones de plataforma." },
    { icon: "🤝", title: "Acompañamiento", desc: "Te ayudamos con el proceso de alta en las aplicaciones y te damos soporte continuo mientras trabajás." },
  ];

  return (
    <div>
      {/* Hero */}
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 64, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-30%", right: "-15%", width: 600, height: 600, background: "radial-gradient(circle, rgba(235,136,0,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px", width: "100%" }}>
          <h1 className="anim-in" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(2.2rem, 8vw, 4rem)", lineHeight: 1.05, letterSpacing: -1.5, marginBottom: 18 }}>
            Tu auto para{" "}<span style={{ color: theme.orange }}>generar ingresos</span>{" "}ya está listo
          </h1>
          <p className="anim-in d1" style={{ fontSize: "1.05rem", color: theme.gray300, lineHeight: 1.6, marginBottom: 32, maxWidth: 520 }}>
            Alquilá un Toyota y trabajá en Uber, Didi, Cabify, particular o con la empresa que quieras. Vos ponés las ganas, nosotros ponemos el vehículo.
          </p>
          <div className="anim-in d2" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Btn onClick={() => navigate("catalog")}>Ver flota →</Btn>
            <Btn variant="secondary" onClick={() => navigate("apply")}>Quiero manejar</Btn>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: 1200, margin: "0 auto 60px", padding: "0 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1, background: "rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: theme.gray900, padding: "28px 20px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "2rem", color: theme.orange, marginBottom: 4 }}>{s.number}</div>
              <div style={{ fontSize: "0.8rem", color: theme.gray400, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px 80px" }}>
        <SectionLabel>Por qué KPCars</SectionLabel>
        <SectionTitle>Todo lo que necesitás<br />para empezar a manejar</SectionTitle>
        <p style={{ fontSize: "1rem", color: theme.gray400, maxWidth: 520, lineHeight: 1.6, marginBottom: 48 }}>
          Nos encargamos de que tengas un auto en condiciones, con papeles al día y listo para que empieces a generar ingresos desde el día uno.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "28px 24px" }}>
              <div style={{ width: 44, height: 44, background: "rgba(235,136,0,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: "1.3rem" }}>{f.icon}</div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: "0.88rem", color: theme.gray400, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px 80px", textAlign: "center" }}>
        <SectionLabel>Plataformas compatibles</SectionLabel>
        <SectionTitle>Manejá donde quieras</SectionTitle>
        <p style={{ fontSize: "0.95rem", color: theme.gray400, maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.6 }}>
          Nuestros autos están habilitados para todas las plataformas de transporte. También podés trabajar particular o con cualquier empresa.
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 36, flexWrap: "wrap", opacity: 0.45 }}>
          {["uber", "Didi", "cabify", "Particular", "+ más"].map((a) => (
            <span key={a} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.4rem", letterSpacing: -0.5, color: theme.gray300 }}>{a}</span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <CTABanner navigate={navigate} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   CATALOG PAGE
   ───────────────────────────────────────────── */
function CatalogPage({ navigate }) {
  return (
    <div>
      <div style={{ paddingTop: 110, maxWidth: 1200, margin: "0 auto", padding: "110px 20px 40px" }}>
        <SectionLabel>Nuestra Flota</SectionLabel>
        <SectionTitle>Flota Toyota</SectionTitle>
        <p style={{ fontSize: "1rem", color: theme.gray400, maxWidth: 540, lineHeight: 1.6, marginBottom: 48 }}>
          Más de 90 unidades Toyota — Corolla y Etios — modelos 2016 a 2019, habilitadas para trabajar en aplicaciones de transporte y particular en Buenos Aires.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, maxWidth: 1200, margin: "0 auto", padding: "0 20px 60px" }}>
        {cars.map((car, i) => (
          <div key={i} style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ width: "100%", aspectRatio: "16/10", background: `linear-gradient(135deg, ${theme.gray800}, ${theme.gray700})`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <CarIcon size={56} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 50, background: `linear-gradient(to top, ${theme.gray900}, transparent)` }} />
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.15rem", marginBottom: 4 }}>{car.model}</div>
              <div style={{ fontSize: "0.82rem", color: theme.gray400, marginBottom: 14 }}>{car.variant} · {car.year}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
                {car.features.map((f) => (
                  <span key={f} style={{ fontSize: "0.72rem", color: theme.gray300, background: "rgba(255,255,255,0.05)", padding: "4px 11px", borderRadius: 100, fontWeight: 500 }}>{f}</span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.3rem", color: theme.orange }}>${car.priceWeekly}</span>
                <span style={{ fontSize: "0.78rem", color: theme.gray400 }}>ARS / semana</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CTABanner navigate={navigate} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   APPLY PAGE (FORM)
   ───────────────────────────────────────────── */
function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmpresa, setShowEmpresa] = useState(false);

  const refs = {
    nombre: useRef(), nacimiento: useRef(), domicilio: useRef(), telefono: useRef(),
    email: useRef(), licencia: useRef(), vigencia: useRef(), alquilerPrevio: useRef(),
    empresaAnterior: useRef(), referencia: useRef(), comentario: useRef(),
  };

  const handleAlquilerChange = (e) => {
    const v = e.target.value;
    setShowEmpresa(v === "Sí, a una empresa" || v === "Sí, a un particular");
  };

  const handleSubmit = async () => {
    const v = {};
    Object.keys(refs).forEach((k) => { v[k] = refs[k].current?.value?.trim?.() ?? refs[k].current?.value ?? ""; });

    if (!v.nombre || !v.nacimiento || !v.domicilio || !v.telefono || !v.email || !v.licencia || !v.vigencia || !v.alquilerPrevio || !v.referencia) {
      setError("Por favor completá todos los campos obligatorios (*).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) {
      setError("Ingresá un email válido.");
      return;
    }

    setError("");
    setLoading(true);

    const appsChecked = [...document.querySelectorAll(".app-check:checked")].map((c) => c.value);

    const payload = {
      ...v,
      apps: appsChecked.join(", ") || "No indicó",
      empresaAnterior: v.empresaAnterior || "—",
      comentario: v.comentario || "—",
    };

    try {
      if (GOOGLE_SHEET_URL) {
        await fetch(GOOGLE_SHEET_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      setSubmitted(true);
    } catch {
      setError("Hubo un error al enviar. Por favor intentá de nuevo.");
      setLoading(false);
    }
  };

  const inputStyle = { width: "100%", padding: "12px 14px", background: theme.gray800, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem" };

  if (submitted) {
    return (
      <div style={{ paddingTop: 110, maxWidth: 560, margin: "0 auto", padding: "140px 20px 100px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, background: "rgba(235,136,0,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "2rem", color: theme.orange }}>✓</div>
        <h3 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.5rem", marginBottom: 10 }}>¡Solicitud enviada!</h3>
        <p style={{ color: theme.gray400, fontSize: "0.95rem", lineHeight: 1.6 }}>Gracias por tu interés. Nos vamos a comunicar con vos en las próximas 24 horas.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ paddingTop: 110, maxWidth: 1200, margin: "0 auto", padding: "110px 20px 40px" }}>
        <SectionLabel>Sumate al equipo</SectionLabel>
        <SectionTitle>Quiero manejar con KPCars</SectionTitle>
        <p style={{ fontSize: "1rem", color: theme.gray400, maxWidth: 520, lineHeight: 1.6, marginBottom: 10 }}>
          Completá el formulario y nos ponemos en contacto con vos para coordinar los próximos pasos.
        </p>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px 100px" }}>
        <div style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "clamp(20px, 5vw, 40px)" }}>
          <p style={{ fontSize: "0.82rem", color: theme.gray400, marginBottom: 24 }}>
            Los campos marcados con <span style={{ color: theme.orange }}>*</span> son obligatorios.
          </p>

          {/* ── Datos personales ── */}
          <FormSection label="Datos personales" />
          <FormRow>
            <FormGroup label="Nombre completo" required>
              <input ref={refs.nombre} style={inputStyle} placeholder="Tu nombre y apellido" />
            </FormGroup>
            <FormGroup label="Fecha de nacimiento" required>
              <input ref={refs.nacimiento} type="date" style={{ ...inputStyle, colorScheme: "dark" }} />
            </FormGroup>
          </FormRow>
          <FormGroup label="Domicilio" required>
            <input ref={refs.domicilio} style={inputStyle} placeholder="Calle, número, localidad, provincia" />
          </FormGroup>
          <FormRow>
            <FormGroup label="Teléfono" required>
              <input ref={refs.telefono} type="tel" style={inputStyle} placeholder="+54 11 1234-5678" />
            </FormGroup>
            <FormGroup label="Email" required>
              <input ref={refs.email} type="email" style={inputStyle} placeholder="tu@email.com" />
            </FormGroup>
          </FormRow>

          {/* ── Licencia ── */}
          <FormSection label="Licencia de conducir" />
          <FormRow>
            <FormGroup label="¿Tenés licencia vigente?" required>
              <select ref={refs.licencia} style={inputStyle} defaultValue="">
                <option value="" disabled>Seleccioná una opción</option>
                <option value="Sí - Profesional">Sí — Profesional</option>
                <option value="Sí - Particular">Sí — Particular</option>
                <option value="En trámite">En trámite</option>
                <option value="No">No tengo licencia</option>
              </select>
            </FormGroup>
            <FormGroup label="Vigencia de la licencia" required>
              <select ref={refs.vigencia} style={inputStyle} defaultValue="">
                <option value="" disabled>Seleccioná una opción</option>
                <option value="Menos de 1 año">Menos de 1 año</option>
                <option value="1 a 3 años">1 a 3 años</option>
                <option value="3 a 5 años">3 a 5 años</option>
                <option value="Más de 5 años">Más de 5 años</option>
                <option value="No aplica">No aplica</option>
              </select>
            </FormGroup>
          </FormRow>

          {/* ── Experiencia ── */}
          <FormSection label="Experiencia" />
          <FormGroup label="¿Tenés experiencia con alguna de estas plataformas?">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Uber", "Didi", "Cabify", "Particular", "Otra", "Ninguna"].map((app) => (
                <label key={app} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.88rem", color: theme.gray300, cursor: "pointer", padding: "9px 14px", background: theme.gray800, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
                  <input type="checkbox" className="app-check" value={app} style={{ accentColor: theme.orange }} /> {app}
                </label>
              ))}
            </div>
          </FormGroup>
          <FormGroup label="¿Alquilaste un auto antes para trabajar?" required>
            <select ref={refs.alquilerPrevio} style={inputStyle} defaultValue="" onChange={handleAlquilerChange}>
              <option value="" disabled>Seleccioná una opción</option>
              <option value="No, primera vez">No, sería mi primera vez</option>
              <option value="Sí, a una empresa">Sí, a una empresa de alquiler</option>
              <option value="Sí, a un particular">Sí, a un particular</option>
            </select>
          </FormGroup>
          {showEmpresa && (
            <FormGroup label="¿En qué empresa o con quién alquilaste?">
              <input ref={refs.empresaAnterior} style={inputStyle} placeholder="Nombre de la empresa o persona" />
            </FormGroup>
          )}

          {/* ── Cierre ── */}
          <FormSection label="Para terminar" />
          <FormGroup label="¿Cómo conociste KPCars?" required>
            <select ref={refs.referencia} style={inputStyle} defaultValue="">
              <option value="" disabled>Seleccioná una opción</option>
              <option value="Redes sociales">Redes sociales</option>
              <option value="Recomendación">Recomendación de un conocido</option>
              <option value="Búsqueda en Google">Búsqueda en Google</option>
              <option value="Vi un auto de KPCars">Vi un auto de KPCars en la calle</option>
              <option value="Otro">Otro</option>
            </select>
          </FormGroup>
          <FormGroup label="¿Querés agregar algo más?">
            <textarea ref={refs.comentario} style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} placeholder="Disponibilidad horaria, consultas, etc." />
          </FormGroup>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: "100%", padding: 15, background: loading ? theme.gray600 : theme.orange, color: theme.black, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.95rem", border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer", marginTop: 8 }}
          >
            {loading ? "Enviando..." : "Enviar solicitud →"}
          </button>

          {error && <p style={{ color: "#ff4444", fontSize: "0.85rem", marginTop: 12 }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SHARED COMPONENTS
   ───────────────────────────────────────────── */
function Btn({ children, onClick, variant = "primary" }) {
  const base = { display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 12, fontSize: "0.92rem", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", textDecoration: "none", cursor: "pointer", border: "none" };
  const styles = variant === "primary"
    ? { ...base, background: theme.orange, color: theme.black }
    : { ...base, background: "rgba(255,255,255,0.06)", color: theme.white, border: "1px solid rgba(255,255,255,0.1)" };
  return <button style={styles} onClick={onClick}>{children}</button>;
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, color: theme.orange, marginBottom: 10 }}>{children}</div>;
}

function SectionTitle({ children }) {
  return <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(1.6rem, 5vw, 2.6rem)", letterSpacing: -1, marginBottom: 14, lineHeight: 1.1 }}>{children}</h2>;
}

function CTABanner({ navigate }) {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 20px 80px" }}>
      <div style={{ background: `linear-gradient(135deg, ${theme.orange}, #d47a00)`, borderRadius: 20, padding: "clamp(32px, 6vw, 56px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50%", right: "-20%", width: 400, height: 400, background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(1.4rem, 4vw, 2.2rem)", color: theme.black, marginBottom: 10, position: "relative" }}>¿Listo para empezar a generar?</h2>
        <p style={{ color: "rgba(0,0,0,0.7)", fontSize: "1rem", marginBottom: 24, position: "relative" }}>Completá el formulario y nos comunicamos con vos en menos de 24 horas.</p>
        <button onClick={() => navigate("apply")} style={{ background: theme.black, color: theme.white, padding: "13px 24px", borderRadius: 12, fontSize: "0.92rem", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", border: "none", cursor: "pointer", position: "relative" }}>Quiero ser conductor →</button>
      </div>
    </div>
  );
}

function FormSection({ label }) {
  return <p style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: theme.orange, margin: "24px 0 16px" }}>{label}</p>;
}

function FormGroup({ label, required, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: 7, color: theme.gray200 }}>
        {label} {required && <span style={{ color: theme.orange }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function FormRow({ children }) {
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

/* ─────────────────────────────────────────────
   FOOTER
   ───────────────────────────────────────────── */
function Footer({ navigate }) {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
      <style>{`
        .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 36px; padding: 52px 0 36px; }
        @media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="footer-grid">
        <div>
          <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.4rem", marginBottom: 10, display: "flex", gap: 2 }}>
            KP<span style={{ color: theme.orange }}>Cars</span>
          </div>
          <p style={{ fontSize: "0.88rem", color: theme.gray400, lineHeight: 1.6, maxWidth: 280 }}>
            Alquiler de autos Toyota para aplicaciones de transporte y particular en Buenos Aires.
          </p>
        </div>
        <FooterCol title="Navegación">
          <FooterLink onClick={() => navigate("home")}>Inicio</FooterLink>
          <FooterLink onClick={() => navigate("catalog")}>Flota</FooterLink>
          <FooterLink onClick={() => navigate("apply")}>Quiero manejar</FooterLink>
        </FooterCol>
        <FooterCol title="Contacto">
          <FooterLink href="tel:+5411XXXXXXXX">+54 11 XXXX-XXXX</FooterLink>
          <FooterLink href="mailto:info@kpcars.com">info@kpcars.com</FooterLink>
          <FooterLink href="https://wa.me/5411XXXXXXXX" external>WhatsApp</FooterLink>
        </FooterCol>
        <FooterCol title="Redes sociales">
          <FooterLink href="https://instagram.com/KPCARSS" external>Instagram (@KPCARSS)</FooterLink>
          <FooterLink href="https://facebook.com/kpcars" external>Facebook</FooterLink>
          <FooterLink href="https://tiktok.com/@kpcars" external>TikTok</FooterLink>
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

/*
 * ═══════════════════════════════════════════════════════════
 *  INSTRUCCIONES PARA GOOGLE SHEETS
 * ═══════════════════════════════════════════════════════════
 *
 *  1. Creá una Google Sheet nueva
 *  2. En la fila 1, poné estos encabezados (una columna cada uno):
 *     Fecha | Nombre | Fecha Nac. | Domicilio | Teléfono |
 *     Email | Licencia | Vigencia Licencia | Experiencia Apps |
 *     Alquiló antes | Empresa anterior | Cómo conoció KPCars |
 *     Comentario
 *
 *  3. Andá a Extensiones → Apps Script
 *  4. Pegá este código:
 *
 *  function doPost(e) {
 *    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *    var data = JSON.parse(e.postData.contents);
 *    sheet.appendRow([
 *      new Date(),
 *      data.nombre,
 *      data.nacimiento,
 *      data.domicilio,
 *      data.telefono,
 *      data.email,
 *      data.licencia,
 *      data.vigencia,
 *      data.apps,
 *      data.alquilerPrevio,
 *      data.empresaAnterior,
 *      data.referencia,
 *      data.comentario
 *    ]);
 *    return ContentService
 *      .createTextOutput(JSON.stringify({result: "ok"}))
 *      .setMimeType(ContentService.MimeType.JSON);
 *  }
 *
 *  5. Deploy → New deployment → Web app
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  6. Copiá la URL del deployment y reemplazá GOOGLE_SHEET_URL arriba
 * ═══════════════════════════════════════════════════════════
 */