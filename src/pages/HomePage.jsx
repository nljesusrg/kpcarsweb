import { useState, useRef } from "react";
import { fleetTypes, FLEET_NOTE } from "../config.js";
import { theme } from "../theme.js";
import { areas } from "../routes.js";
import { CarIcon, DocumentIcon, WrenchIcon, CoinIcon, SmartphoneIcon, UsersIcon } from "../components/Icons.jsx";
import { Btn, Accent, SectionLabel, SectionHeader, CTABanner, SoonBadge } from "../components/ui.jsx";
import kpLogo from "../assets/kpcars-logo-blanco.png";

export function HomePage({ navigate, user }) {
  const stats = [
    { icon: <CarIcon size={20} opacity={1} />, title: "100% Toyota", label: "Corolla y Etios" },
    { icon: <WrenchIcon size={20} />, title: "Taller propio", label: "Service y mantenimiento" },
    { icon: <CoinIcon size={20} />, title: "Pago semanal", label: "Fijo, sin sorpresas" },
  ];

  const features = [
    { icon: <CarIcon size={22} opacity={1} />, title: "Flota 100% Toyota", desc: "Corolla y Etios modelos 2016–2019: vehículos confiables, económicos y con respaldo de la marca más vendida de Argentina." },
    { icon: <DocumentIcon size={22} />, title: "Papeles al día", desc: "Seguro, VTV, y toda la documentación necesaria para que manejes tranquilo y sin preocupaciones legales." },
    { icon: <WrenchIcon size={22} />, title: "Taller propio", desc: "Contamos con taller propio donde hacemos todo tipo de mantenimiento y service. No dependes de terceros." },
    { icon: <CoinIcon size={22} />, title: "Alquiler semanal", desc: "Pago semanal fijo. Sabes exactamente cuánto pagas cada semana, sin sorpresas ni costos ocultos." },
    { icon: <SmartphoneIcon size={22} />, title: "Trabaja donde quieras", desc: "Uber, Didi, Cabify, particular o cualquier empresa de transporte. Sin restricciones de plataforma." },
    { icon: <UsersIcon size={22} />, title: "Acompañamiento real", desc: "Te ayudamos con el proceso de alta en las aplicaciones y te damos soporte continuo mientras trabajas." },
  ];

  const steps = [
    { n: "01", title: "Completa el formulario", desc: "Cuéntanos un poco sobre ti. El proceso es rápido y sin burocracia." },
    { n: "02", title: "Agendamos una entrevista", desc: "Te contactamos para coordinar una reunión presencial con nuestro equipo." },
    { n: "03", title: "Comienza a manejar", desc: "Tras la entrevista coordinamos la entrega del vehículo y ya estás listo para generar ingresos." },
  ];

  return (
    <div style={{ overflowX: "clip" }}>
      <style>{`
        .home-card { background: ${theme.gray900}; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 28px; transition: border-color 0.18s, transform 0.18s; }
        .home-card:hover { border-color: rgba(235,136,0,0.35); transform: translateY(-3px); }
        /* Fondo alternado: una franja de lado a lado detrás de la sección */
        .home-section.alt { position: relative; isolation: isolate; }
        .home-section.alt::before { content: ""; position: absolute; top: 0; bottom: 0; left: 50%; width: 100vw; transform: translateX(-50%); background: #0f0f0f; border-top: 1px solid rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.04); z-index: -1; }
        .home-section { max-width: 1200px; margin: 0 auto; padding: 56px 20px; }
        @media (max-width: 900px) {
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .features-grid { grid-template-columns: 1fr !important; }
          .home-section { padding: 40px 20px; }
          .home-card { padding: 24px; }
        }
      `}</style>

      {/* ── Hero ── */}
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 64, position: "relative", overflow: "hidden" }}>
        {/* Gradientes de fondo */}
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 700, height: 700, background: "radial-gradient(circle, rgba(235,136,0,0.09) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(235,136,0,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />
        {/* Logo decorativo */}
        <img src={kpLogo} alt="" style={{ position: "absolute", right: "-4%", top: "50%", transform: "translateY(-50%)", height: "75vh", opacity: 0.035, pointerEvents: "none", userSelect: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 20px", width: "100%" }}>
          {/* Badge */}
          <div className="anim-in" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(235,136,0,0.1)", border: "1px solid rgba(235,136,0,0.25)", borderRadius: 100, marginBottom: 28 }}>
            <span style={{ fontSize: "clamp(0.62rem, 2.9vw, 0.72rem)", fontWeight: 700, letterSpacing: 1.5, color: theme.orange, textTransform: "uppercase", whiteSpace: "nowrap" }}>KPCars Rentals · Alquiler de vehículos</span>
          </div>

          {/* Titular */}
          <h1 className="anim-in d1" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(2rem, 7.6vw, 4.2rem)", lineHeight: 1.04, letterSpacing: -2, marginBottom: 22, maxWidth: 820 }}>
            Movemos personas,<br />
            <span style={{ color: theme.orange }}>impulsamos oportunidades.</span>
          </h1>

          <p className="anim-in d2" style={{ fontSize: "1.05rem", color: theme.gray300, lineHeight: 1.65, marginBottom: 36, maxWidth: 480 }}>
            Alquila uno de nuestros vehículos y trabaja en Uber, Didi, Cabify o donde quieras. Tú pones las ganas, nosotros ponemos el auto.
          </p>

          <div className="anim-in d3" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 72 }}>
            <Btn onClick={() => navigate("catalog")}>Ver flota →</Btn>
            {!user && <Btn variant="secondary" onClick={() => navigate("apply")}>Quiero manejar</Btn>}
          </div>

          {/* Datos destacados */}
          <div className="anim-in d3" style={{ display: "flex", gap: "20px 40px", flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 28 }}>
            {stats.map((s) => (
              <div key={s.title} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, flexShrink: 0, background: "rgba(235,136,0,0.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: theme.orange }}>{s.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: theme.white, lineHeight: 1.2 }}>{s.title}</div>
                  <div style={{ fontSize: "0.78rem", color: theme.gray400, marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Carrusel de la flota ── */}
      <FleetCarousel navigate={navigate} />

      {/* ── Cómo funciona ── */}
      <div className="home-section reveal">
        <SectionHeader label="El proceso" title={<>Tres pasos para<br /><Accent>estar en la calle</Accent></>}>
          Del formulario a la entrega del auto, te acompañamos en cada paso.
        </SectionHeader>
        <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {steps.map((s) => (
            <div key={s.n} className="home-card">
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "2.4rem", color: theme.orange, lineHeight: 1, marginBottom: 18, letterSpacing: -1 }}>{s.n}</div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 8, color: theme.white }}>{s.title}</h3>
              <p style={{ fontSize: "0.86rem", color: theme.gray400, lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Por qué KPCars ── */}
      <div className="home-section alt reveal">
        <SectionHeader label="Por qué KPCars" title={<>Todo lo que necesitas<br /><Accent>para empezar</Accent></>}>
          Nos encargamos de que tengas un auto en condiciones, con papeles al día y listo para generar ingresos desde el día uno.
        </SectionHeader>
        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {features.map((f) => (
            <div key={f.title} className="home-card">
              <div style={{ width: 42, height: 42, background: "rgba(235,136,0,0.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, color: theme.orange }}>{f.icon}</div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 8, color: theme.white }}>{f.title}</h3>
              <p style={{ fontSize: "0.86rem", color: theme.gray400, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Plataformas ── */}
      <div className="home-section reveal">
        <SectionHeader label="Plataformas compatibles" title={<>Trabaja <Accent>donde quieras</Accent></>}>
          Nuestros autos están habilitados para todas las plataformas de transporte. Sin restricciones.
        </SectionHeader>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { name: "Uber", desc: "La plataforma más usada en Argentina" },
            { name: "Didi", desc: "Con alta demanda en el AMBA" },
            { name: "Cabify", desc: "Servicio premium con pasajeros frecuentes" },
            { name: "Particular y más", desc: "Trabaja sin plataforma o con la que elijas" },
          ].map((p) => (
            <div key={p.name} className="home-card">
              <h3 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.1rem", color: theme.white, letterSpacing: -0.5, marginBottom: 8 }}>{p.name}</h3>
              <p style={{ fontSize: "0.86rem", color: theme.gray400, lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Áreas de KPCars ── */}
      <div className="home-section alt reveal">
        <SectionHeader label="KPCars" title={<>Nuestros <Accent>servicios</Accent></>}>
          KPCars Rentals es nuestra área principal. Muy pronto sumamos fletes y auxilios.
        </SectionHeader>
        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {areas.map((a) => (
            <div key={a.key} className="home-card area-card" onClick={() => navigate(a.page)} style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 42, height: 42, background: "rgba(235,136,0,0.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: theme.orange }}><a.Icon size={27} /></div>
                {a.soon && <SoonBadge />}
              </div>
              <h3 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.1rem", letterSpacing: -0.5, marginBottom: 8, color: theme.white }}>{a.name}</h3>
              <p style={{ fontSize: "0.86rem", color: theme.gray400, lineHeight: 1.65, flex: 1 }}>{a.soon ? "Próximamente…" : a.desc}</p>
              {a.cta && <div style={{ marginTop: 16, fontSize: "0.88rem", fontWeight: 700, color: theme.orange }}>{a.cta}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      {!user && <CTABanner navigate={navigate} />}
    </div>
  );
}

/* Galería del inicio: muestra cómo son los autos, sin ofrecer una unidad puntual.
   La mueve la persona: flechas en PC, dedo en celular. */
function FleetCarousel({ navigate }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  // Intercala automáticos y manuales
  const photos = fleetTypes[0].photos.flatMap((ph, i) => [ph, fleetTypes[1].photos[i]]).filter(Boolean);

  const updateArrows = () => {
    const t = trackRef.current;
    if (!t) return;
    setCanPrev(t.scrollLeft > 4);
    setCanNext(t.scrollLeft + t.clientWidth < t.scrollWidth - 4);
  };

  const move = (dir) => {
    const t = trackRef.current;
    const slide = t?.querySelector(".fleet-slide");
    if (slide) t.scrollBy({ left: dir * (slide.offsetWidth + 16), behavior: "smooth" });
  };

  const arrow = (enabled) => ({ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: theme.white, cursor: enabled ? "pointer" : "default", opacity: enabled ? 1 : 0.35, display: "flex", alignItems: "center", justifyContent: "center" });

  return (
    <div className="home-section alt reveal">
      <style>{`
        .fleet-track { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .fleet-track::-webkit-scrollbar { display: none; }
        .fleet-slide { flex: 0 0 calc((100% - 32px) / 3); scroll-snap-align: start; aspect-ratio: 4 / 3; background: ${theme.gray900}; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; cursor: pointer; transition: border-color 0.15s; }
        .fleet-slide:hover { border-color: rgba(235,136,0,0.35); }
        .fleet-slide img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s ease; }
        .fleet-slide:hover img { transform: scale(1.04); }
        @media (max-width: 900px) { .fleet-slide { flex-basis: calc((100% - 16px) / 2); } }
        @media (max-width: 640px) { .fleet-slide { flex-basis: 84%; } .fleet-arrows { display: none !important; } }
      `}</style>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px 32px", marginBottom: 36 }}>
        <div>
          <SectionLabel>Nuestra flota</SectionLabel>
          <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(1.6rem, 5vw, 2.6rem)", letterSpacing: -1, lineHeight: 1.1 }}>Así son<br /><Accent>nuestros autos</Accent></h2>
        </div>
        <div className="fleet-arrows" style={{ display: "flex", gap: 8 }}>
          <button aria-label="Fotos anteriores" disabled={!canPrev} onClick={() => move(-1)} style={arrow(canPrev)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button aria-label="Fotos siguientes" disabled={!canNext} onClick={() => move(1)} style={arrow(canNext)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </div>

      <div ref={trackRef} className="fleet-track" onScroll={updateArrows}>
        {photos.map((photo, i) => (
          <div key={i} className="fleet-slide" onClick={() => navigate("catalog")}>
            <img src={photo} alt="Toyota Corolla de la flota de KPCars" loading="lazy" />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px 24px", marginTop: 28 }}>
        <Btn variant="secondary" onClick={() => navigate("catalog")}>Conoce la flota →</Btn>
        <p style={{ fontSize: "0.82rem", color: theme.gray400, maxWidth: 460, lineHeight: 1.55 }}>{FLEET_NOTE}</p>
      </div>
    </div>
  );
}
