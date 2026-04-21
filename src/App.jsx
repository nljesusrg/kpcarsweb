import { useState, useEffect, useRef } from "react";

/* ─── LOGOS ─── */
import kpLogo from "./assets/kpcars-logo-blanco.png";
import toyotaLogo from "./assets/toyota-logo.png";

/* ─── FOTOS DE AUTOS ─── */
import imgPle625 from "./assets/cars/ple625.jpg";
import imgAb956ys from "./assets/cars/ab956ys.jpg";
import imgAb773ym from "./assets/cars/ab773ym.jpg";
import imgNyo037 from "./assets/cars/nyo037.jpg";
import imgOmb591 from "./assets/cars/omb591.jpg";
import imgAa865tl from "./assets/cars/aa865tl.jpg";

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbw5R_It5JeU7M1IDK40guHDi4bZM5MXlUk1RR_0j4h9lzdTZIj7hLI5JJm63Ltixc1gLA/exec";
// ↑ Reemplazá esto con la URL que te da Google Apps Script al implementar.
// Ejemplo: "https://script.google.com/macros/s/AKfycbx.../exec"

/* ─── API CONFIG ─── */
const API_BASE = "https://kpcars.online/api";
const MEDIA_BASE = "https://kpcars.online";
const toAbsoluteUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try { return MEDIA_BASE + new URL(url).pathname; } catch { return url; }
  }
  return url.startsWith("/") ? MEDIA_BASE + url : MEDIA_BASE + "/" + url;
};

/* ─────────────────────────────────────────────
   CATALOG DATA — edita aquí para actualizar autos
   ───────────────────────────────────────────── */
const cars = [
  {
    model: "Toyota Corolla",
    variant: "XEI Pack 1.8 CVT",
    transmission: "Automático",
    year: "2016",
    priceWeekly: "360.000",
    features: ["Automático", "GNC", "Aire acondicionado", "Baúl amplio"],
    image: imgPle625,
  },
  {
    model: "Toyota Corolla",
    variant: "XEI 1.8 CVT",
    transmission: "Automático",
    year: "2017",
    priceWeekly: "360.000",
    features: ["Automático", "GNC", "Aire acondicionado", "Baúl amplio"],
    image: imgAb956ys,
    rented: true,
  },
  {
    model: "Toyota Corolla",
    variant: "XEI 1.8 6M/T",
    transmission: "Manual",
    year: "2017",
    priceWeekly: "360.000",
    features: ["Manual", "GNC", "Aire acondicionado", "Baúl amplio"],
    image: imgAb773ym,
  },
  {
    model: "Toyota Corolla",
    variant: "XEI Pack 1.8 6M/T",
    transmission: "Manual",
    year: "2015",
    priceWeekly: "360.000",
    features: ["Manual", "GNC", "Aire acondicionado", "Baúl amplio"],
    image: imgNyo037,
    rented: true,
  },
  {
    model: "Toyota Corolla",
    variant: "XLI 1.8 CVT",
    transmission: "Automático",
    year: "2015",
    priceWeekly: "360.000",
    features: ["Automático", "GNC", "Aire acondicionado", "Baúl amplio"],
    image: imgOmb591,
  },
  {
    model: "Toyota Corolla",
    variant: "XLI 1.8 6M/T",
    transmission: "Manual",
    year: "2017",
    priceWeekly: "360.000",
    features: ["Manual", "GNC", "Aire acondicionado", "Baúl amplio"],
    image: imgAa865tl,
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

const CloseIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UserIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ProfileAvatar = ({ user, size = 160 }) => {
  const [broken, setBroken] = useState(false);
  const initials = ((user?.nombre?.[0] || "") + (user?.apellido?.[0] || "")).toUpperCase() || "?";
  const fontSize = Math.round(size * 0.3);

  if (user?.foto && !broken) {
    return (
      <img
        src={user.foto}
        alt="Foto de perfil"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, rgba(235,136,0,0.25), rgba(235,136,0,0.1))", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize, color: theme.orange, letterSpacing: -1 }}>{initials}</span>
    </div>
  );
};

const DocumentIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const WrenchIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const CoinIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const SmartphoneIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const UsersIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PencilIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const PlusIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const AlertIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/* ─────────────────────────────────────────────
   MAIN APP
   ───────────────────────────────────────────── */
export default function KPCarsApp() {
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem("kpcars_user"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("kpcars_token") || null);

  const navigate = (p) => {
    setPage(p);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Función auxiliar para hacer requests autenticados a la API
  const apiFetch = async (endpoint, options = {}) => {
    const currentToken = token || localStorage.getItem("kpcars_token");
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...(currentToken ? { "Authorization": `Bearer ${currentToken}` } : {}),
        ...(options.headers || {}),
      },
    });
    if (res.status === 401) {
      setUser(null);
      setToken(null);
      localStorage.removeItem("kpcars_user");
      localStorage.removeItem("kpcars_token");
      navigate("login");
      throw new Error("Sesión expirada. Ingresá de nuevo.");
    }
    if (res.status === 403) {
      // Debe cambiar contraseña primero
      navigate("change-password");
      throw new Error("Debés cambiar tu contraseña primero.");
    }
    return res;
  };

  const handleLogin = async (loginData) => {
    // loginData viene del LoginPage: { token, must_change_password, user }
    setToken(loginData.token);
    localStorage.setItem("kpcars_token", loginData.token);

    // Cargar perfil y vehículo desde la API
    try {
      const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${loginData.token}`,
      };

      const [meRes, historialRes] = await Promise.all([
        fetch(`${API_BASE}/me`, { headers }),
        fetch(`${API_BASE}/mi-historial-vehiculos`, { headers }).catch(() => null),
      ]);

      let meProfile = loginData.user || {};
      try {
        const meData = await meRes.json();
        const inner = meData.user || meData;
        if (meRes.ok && (inner.id || inner.name || inner.dni)) {
          meProfile = { ...meProfile, ...inner };
        }
      } catch {}

      let historialData = null;
      try { historialData = historialRes && historialRes.ok ? await historialRes.json() : null; } catch {}

      const pick = (...keys) => { for (const k of keys) { if (meProfile[k]) return meProfile[k]; } return ""; };

      const fullName = pick("name", "nombre", "nombres");
      const spaceIdx = fullName.indexOf(" ");
      const nombre = spaceIdx > 0 ? fullName.slice(0, spaceIdx) : fullName;
      const apellido = spaceIdx > 0 ? fullName.slice(spaceIdx + 1) : pick("apellido", "last_name", "apellidos", "surname");

      // Extraer vehículo activo e historial del nuevo endpoint
      const historialList = historialData?.historial || [];
      const asignacionActual = historialList.find((h) => h.fecha_fin === null);
      const asignacionesAnteriores = historialList.filter((h) => h.fecha_fin !== null);

      const mapVehiculo = (h) => h.vehiculo ? {
        model: `${h.vehiculo.marca} ${h.vehiculo.modelo}`,
        variant: "",
        year: String(h.vehiculo.anio || ""),
        patente: h.vehiculo.patente || "",
        desde: h.fecha_inicio ? new Date(h.fecha_inicio).toLocaleDateString("es-AR") : "",
        hasta: h.fecha_fin ? new Date(h.fecha_fin).toLocaleDateString("es-AR") : null,
      } : null;

      const userData = {
        nombre,
        apellido,
        dni: pick("dni", "documento", "document_number"),
        telefono: pick("telefono", "phone", "tel", "celular", "mobile"),
        email: pick("correo", "email", "mail"),
        licenciaVencimiento: pick("licenciaVencimiento", "licencia_vencimiento", "license_expiry", "vencimiento_licencia"),
        foto: toAbsoluteUrl(pick("profile_photo_url", "foto", "photo", "avatar")) || null,
        mustChangePassword: loginData.must_change_password,
        autoAsignado: asignacionActual ? mapVehiculo(asignacionActual) : null,
        historialAutos: asignacionesAnteriores.map(mapVehiculo).filter(Boolean),
        role: pick("role", "rol") || "chofer",
      };

      setUser(userData);
      localStorage.setItem("kpcars_user", JSON.stringify(userData));

      if (loginData.must_change_password) {
        navigate("change-password");
      } else {
        navigate("dashboard");
      }
    } catch (err) {
      // Si falla todo, usamos los datos que ya vienen en la respuesta del login
      const fb = loginData.user || {};
      const fbName = fb.name || fb.nombre || "Conductor";
      const fbSpace = fbName.indexOf(" ");
      const fbUser = {
        mustChangePassword: loginData.must_change_password,
        nombre: fbSpace > 0 ? fbName.slice(0, fbSpace) : fbName,
        apellido: fbSpace > 0 ? fbName.slice(fbSpace + 1) : (fb.apellido || ""),
        dni: fb.dni || fb.documento || "",
        telefono: fb.telefono || fb.phone || "",
        email: fb.email || "",
        licenciaVencimiento: "",
        foto: null,
        autoAsignado: null,
        historialAutos: [],
        role: fb.role || fb.rol || "chofer",
      };
      setUser(fbUser);
      localStorage.setItem("kpcars_user", JSON.stringify(fbUser));
      if (loginData.must_change_password) {
        navigate("change-password");
      } else {
        navigate("dashboard");
      }
    }
  };

  const handlePasswordChanged = async (newToken) => {
    const activeToken = newToken || token;
    if (newToken) {
      setToken(newToken);
      localStorage.setItem("kpcars_token", newToken);
    }

    const headers = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${activeToken}`,
    };

    try {
      const [meRes, historialRes] = await Promise.all([
        fetch(`${API_BASE}/me`, { headers }),
        fetch(`${API_BASE}/mi-historial-vehiculos`, { headers }).catch(() => null),
      ]);

      let meProfile = user || {};
      try {
        const meData = await meRes.json();
        const inner = meData.user || meData;
        if (meRes.ok && (inner.id || inner.name || inner.dni)) meProfile = { ...meProfile, ...inner };
      } catch {}

      let historialData = null;
      try { historialData = historialRes && historialRes.ok ? await historialRes.json() : null; } catch {}

      const pick = (...keys) => { for (const k of keys) { if (meProfile[k]) return meProfile[k]; } return ""; };
      const fullName = pick("name", "nombre", "nombres");
      const spaceIdx = fullName.indexOf(" ");
      const nombre = spaceIdx > 0 ? fullName.slice(0, spaceIdx) : (user.nombre || fullName);
      const apellido = spaceIdx > 0 ? fullName.slice(spaceIdx + 1) : (user.apellido || pick("apellido", "last_name", "apellidos", "surname"));

      const historialList = historialData?.historial || [];
      const asignacionActual = historialList.find((h) => h.fecha_fin === null);
      const asignacionesAnteriores = historialList.filter((h) => h.fecha_fin !== null);
      const mapVehiculo = (h) => h.vehiculo ? {
        model: `${h.vehiculo.marca} ${h.vehiculo.modelo}`, variant: "", year: String(h.vehiculo.anio || ""),
        patente: h.vehiculo.patente || "",
        desde: h.fecha_inicio ? new Date(h.fecha_inicio).toLocaleDateString("es-AR") : "",
        hasta: h.fecha_fin ? new Date(h.fecha_fin).toLocaleDateString("es-AR") : null,
      } : null;

      const updated = {
        ...user,
        nombre,
        apellido,
        dni: pick("dni", "documento", "document_number") || user.dni,
        telefono: pick("telefono", "phone", "tel", "celular", "mobile") || user.telefono,
        email: pick("correo", "email", "mail") || user.email,
        licenciaVencimiento: pick("licenciaVencimiento", "licencia_vencimiento", "license_expiry") || user.licenciaVencimiento,
        foto: toAbsoluteUrl(pick("profile_photo_url", "foto", "photo", "avatar")) || user.foto || null,
        autoAsignado: asignacionActual ? mapVehiculo(asignacionActual) : user.autoAsignado,
        historialAutos: asignacionesAnteriores.length > 0 ? asignacionesAnteriores.map(mapVehiculo).filter(Boolean) : user.historialAutos,
        mustChangePassword: false,
        role: pick("role", "rol") || user.role,
      };

      setUser(updated);
      localStorage.setItem("kpcars_user", JSON.stringify(updated));
    } catch {
      setUser({ ...user, mustChangePassword: false });
      localStorage.setItem("kpcars_user", JSON.stringify({ ...user, mustChangePassword: false }));
    }

    navigate("dashboard");
  };

  const handleLogout = async () => {
    try {
      await apiFetch("/logout", { method: "POST" });
    } catch {
      // Si falla el logout en el server, cerramos la sesión igual del lado del cliente
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("kpcars_user");
    localStorage.removeItem("kpcars_token");
    navigate("home");
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: theme.black, color: theme.white, minHeight: "100vh", WebkitFontSmoothing: "antialiased" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Archivo+Black&display=swap" rel="stylesheet" />
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { background: ${theme.black}; min-height: 100%; }
        #root { min-height: 100vh; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .anim-in { animation: fadeUp 0.65s ease-out forwards; }
        .d1 { animation-delay: 0.08s; opacity: 0; }
        .d2 { animation-delay: 0.16s; opacity: 0; }
        .d3 { animation-delay: 0.24s; opacity: 0; }
        input:focus, select:focus, textarea:focus { border-color: ${theme.orange} !important; box-shadow: 0 0 0 3px rgba(235,136,0,0.15); outline: none; }
        select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px !important; }
        select option { background: ${theme.gray800}; color: white; }
        .dash-tabs { display: flex; gap: 8px; margin-bottom: 32px; flex-wrap: wrap; }
        @media (max-width: 480px) {
          .dash-tabs button { flex: 1 1 calc(50% - 4px); }
          .cal-day { min-height: 44px !important; }
          .turno-card { flex-wrap: wrap; }
          .turno-badge { margin-top: 6px; }
        }
      `}</style>

      <Nav page={page} navigate={navigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} user={user} onLogout={handleLogout} />

      {page === "home" && <HomePage navigate={navigate} user={user} />}
      {page === "catalog" && <CatalogPage navigate={navigate} user={user} />}
      {page === "apply" && <ApplyPage />}
      {page === "login" && <LoginPage onLogin={handleLogin} />}
      {page === "change-password" && user && <ChangePasswordPage user={user} token={token} onComplete={handlePasswordChanged} />}
      {page === "dashboard" && user && <DashboardPage user={user} navigate={navigate} apiFetch={apiFetch} onUserUpdate={(updated) => { setUser(updated); localStorage.setItem("kpcars_user", JSON.stringify(updated)); }} />}
      {page === "turnos" && user && <TurnosPage user={user} apiFetch={apiFetch} />}

      {!["dashboard", "turnos", "change-password"].includes(page) && <Footer navigate={navigate} user={user} />}

      <WhatsAppButton />
    </div>
  );
}

/* ─────────────────────────────────────────────
   NAV
   ───────────────────────────────────────────── */
function Nav({ page, navigate, menuOpen, setMenuOpen, user, onLogout }) {
  const s = {
    nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,10,10,0.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
    inner: { maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo: { fontFamily: "'Archivo Black', sans-serif", fontSize: "1.5rem", letterSpacing: -0.5, cursor: "pointer", display: "flex", gap: 2, textDecoration: "none", color: theme.white },
    link: (active) => ({ color: active ? theme.white : theme.gray300, textDecoration: "none", fontSize: "0.88rem", fontWeight: 500, padding: "8px 14px", borderRadius: 8, background: active ? "rgba(255,255,255,0.06)" : "transparent", cursor: "pointer", display: "block" }),
    cta: { background: theme.orange, color: theme.black, fontWeight: 700, padding: "8px 16px", borderRadius: 8, fontSize: "0.88rem", cursor: "pointer", textDecoration: "none", display: "block", textAlign: "center" },
    loginBtn: { background: "none", border: "1px solid rgba(255,255,255,0.15)", color: theme.gray300, fontWeight: 500, padding: "8px 14px", borderRadius: 8, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" },
    hamburger: { background: "none", border: "none", cursor: "pointer", padding: 4, display: "none" },
    mobileLinks: { position: "absolute", top: 64, left: 0, right: 0, background: "rgba(10,10,10,0.98)", backdropFilter: "blur(20px)", padding: "12px 20px 16px", display: "flex", flexDirection: "column", gap: 4, borderBottom: "1px solid rgba(255,255,255,0.06)" },
  };

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        <img src={kpLogo} alt="KPCars" onClick={() => navigate("home")} style={{ height: 52, cursor: "pointer" }} />

        {/* Desktop links */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }} className="desktop-nav">
          <a style={s.link(page === "home")} onClick={() => navigate("home")}>Inicio</a>
          <a style={s.link(page === "catalog")} onClick={() => navigate("catalog")}>Flota</a>
          {!user && <a style={s.cta} onClick={() => navigate("apply")}>Quiero manejar</a>}
          {user ? (
            <>
              <a style={s.link(page === "dashboard")} onClick={() => navigate("dashboard")}>Mi Panel</a>
              <a style={s.link(page === "turnos")} onClick={() => navigate("turnos")}>Turnos</a>
              <button style={s.loginBtn} onClick={onLogout}>
                <UserIcon size={15} /> Salir
              </button>
            </>
          ) : (
            <button style={s.loginBtn} onClick={() => navigate("login")}>
              <UserIcon size={15} /> Conductores
            </button>
          )}
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
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" }} />
          {user ? (
            <>
              <a style={s.link(page === "dashboard")} onClick={() => navigate("dashboard")}>Mi Panel</a>
              <a style={s.link(page === "turnos")} onClick={() => navigate("turnos")}>Turnos</a>
              <a style={{ ...s.link(false), marginTop: 2 }} onClick={onLogout}>Cerrar sesión</a>
            </>
          ) : (
            <>
              <a style={{ ...s.cta, textAlign: "center", padding: "12px 16px" }} onClick={() => navigate("apply")}>Quiero manejar</a>
              <a
                onClick={() => navigate("login")}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6, padding: "12px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, color: theme.white, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}
              >
                <UserIcon size={16} /> Zona Conductores
              </a>
            </>
          )}
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
function HomePage({ navigate, user }) {
  const stats = [
    { number: "70+", label: "Choferes activos" },
    { number: "90+", label: "Vehículos en flota" },
    { number: "100%", label: "Flota Toyota" },
    { number: "BA", label: "Buenos Aires" },
  ];

  const features = [
    { icon: <CarIcon size={24} opacity={1} />, title: "Flota 100% Toyota", desc: "Corolla y Etios modelos 2016–2019: vehículos confiables, económicos y con respaldo de la marca más vendida de Argentina." },
    { icon: <DocumentIcon size={24} />, title: "Papeles al día", desc: "Seguro, VTV, y toda la documentación necesaria para que manejes tranquilo y sin preocupaciones legales." },
    { icon: <WrenchIcon size={24} />, title: "Taller propio", desc: "Contamos con taller propio donde hacemos todo tipo de mantenimiento y service. No dependes de terceros." },
    { icon: <CoinIcon size={24} />, title: "Alquiler semanal", desc: "Pago semanal fijo. Sabes exactamente cuánto pagas cada semana, sin sorpresas ni costos ocultos." },
    { icon: <SmartphoneIcon size={24} />, title: "Trabaja donde quieras", desc: "Uber, Didi, Cabify, particular o cualquier empresa de transporte. Sin restricciones de plataforma." },
    { icon: <UsersIcon size={24} />, title: "Acompañamiento", desc: "Te ayudamos con el proceso de alta en las aplicaciones y te damos soporte continuo mientras trabajas." },
  ];

  return (
    <div>
      {/* Hero */}
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 64, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-30%", right: "-15%", width: 600, height: 600, background: "radial-gradient(circle, rgba(235,136,0,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        {/* Logo grande decorativo de fondo */}
        <img src={kpLogo} alt="" style={{ position: "absolute", right: "-5%", top: "50%", transform: "translateY(-50%)", height: "70vh", opacity: 0.04, pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px", width: "100%" }}>
          <img className="anim-in" src={kpLogo} alt="KPCars" style={{ height: 90, marginBottom: 24 }} />
          <h1 className="anim-in d1" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(2.2rem, 8vw, 4rem)", lineHeight: 1.05, letterSpacing: -1.5, marginBottom: 18 }}>
            Tu auto para{" "}<span style={{ color: theme.orange }}>generar ingresos</span>{" "}ya está listo
          </h1>
          <p className="anim-in d2" style={{ fontSize: "1.05rem", color: theme.gray300, lineHeight: 1.6, marginBottom: 32, maxWidth: 520 }}>
            Alquila un Toyota y trabaja en Uber, Didi, Cabify o con la empresa que quieras. Tú pones las ganas, nosotros ponemos el vehículo.
          </p>
          <div className="anim-in d3" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Btn onClick={() => navigate("catalog")}>Ver flota →</Btn>
            {!user && <Btn variant="secondary" onClick={() => navigate("apply")}>Quiero manejar</Btn>}
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

      {/* Toyota badge */}
      <div style={{ maxWidth: 1200, margin: "0 auto 40px", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", background: theme.gray900, borderRadius: 100, border: "1px solid rgba(255,255,255,0.06)" }}>
          <img src={toyotaLogo} alt="Toyota" style={{ height: 22 }} />
          <span style={{ fontSize: "0.8rem", color: theme.gray400, fontWeight: 500 }}>Flota 100% Toyota</span>
        </div>
        <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />
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
              <div style={{ width: 44, height: 44, background: "rgba(235,136,0,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: theme.orange }}>{f.icon}</div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: "0.88rem", color: theme.gray400, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px 80px", textAlign: "center" }}>
        <SectionLabel>Plataformas compatibles</SectionLabel>
        <SectionTitle>Maneja donde quieras</SectionTitle>
        <p style={{ fontSize: "0.95rem", color: theme.gray400, maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.6 }}>
          Nuestros autos están habilitados para todas las plataformas de transporte. También puedes trabajar particular o con cualquier empresa.
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 36, flexWrap: "wrap", opacity: 0.45 }}>
          {["Uber", "Didi", "Cabify", "+ más"].map((a) => (
            <span key={a} style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.4rem", letterSpacing: -0.5, color: theme.gray300 }}>{a}</span>
          ))}
        </div>
      </div>

      {/* CTA */}
      {!user && <CTABanner navigate={navigate} />}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CATALOG PAGE
   ───────────────────────────────────────────── */
function CatalogPage({ navigate, user }) {
  const isAdmin = user?.role === "administrador";
  const [carList, setCarList] = useState(cars);
  const [lightbox, setLightbox] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({});

  const fld = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const openEdit = (car, idx) => {
    setForm({ model: car.model, variant: car.variant, transmission: car.transmission || "Automático", year: car.year, priceWeekly: car.priceWeekly, features: car.features.join("\n"), rented: car.rented || false });
    setEditTarget({ _idx: idx, _image: car.image ?? null });
  };

  const openNew = () => {
    setForm({ model: "Toyota Corolla", variant: "", transmission: "Automático", year: "", priceWeekly: "", features: "GNC\nAire acondicionado\nBaúl amplio", rented: false });
    setEditTarget({ _idx: -1, _image: null });
  };

  const saveEdit = () => {
    const updated = {
      model: form.model, variant: form.variant, transmission: form.transmission,
      year: form.year, priceWeekly: form.priceWeekly,
      features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
      rented: form.rented,
      image: form.imagePreview || editTarget._image,
    };
    if (editTarget._idx === -1) {
      setCarList((p) => [...p, updated]);
    } else {
      setCarList((p) => p.map((c, i) => i === editTarget._idx ? updated : c));
    }
    setEditTarget(null);
  };

  const inputS = { width: "100%", padding: "10px 12px", background: theme.gray800, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem" };
  const labelS = { display: "block", fontSize: "0.78rem", fontWeight: 700, color: theme.gray300, marginBottom: 5 };

  return (
    <div>
      <div style={{ paddingTop: 110, maxWidth: 1200, margin: "0 auto", padding: "110px 20px 40px" }}>
        <SectionLabel>Nuestra Flota</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
          <SectionTitle>Flota Toyota</SectionTitle>
          <img src={toyotaLogo} alt="Toyota" style={{ height: 28, opacity: 0.7 }} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <p style={{ fontSize: "1rem", color: theme.gray400, maxWidth: 540, lineHeight: 1.6, marginBottom: 28 }}>
            Más de 90 unidades Toyota Corolla, habilitadas para trabajar en aplicaciones de transporte y particular en Buenos Aires. Todos con GNC, aire acondicionado y baúl amplio.
          </p>
          {isAdmin && (
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {editMode && (
                <button onClick={openNew} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "rgba(235,136,0,0.12)", border: "1px solid rgba(235,136,0,0.3)", borderRadius: 10, color: theme.orange, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
                  <PlusIcon size={16} /> Agregar vehículo
                </button>
              )}
              <button onClick={() => setEditMode((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: editMode ? theme.orange : "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, color: editMode ? theme.black : theme.white, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                <PencilIcon size={15} /> {editMode ? "Salir de edición" : "Editar catálogo"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, maxWidth: 1200, margin: "0 auto", padding: "0 20px 60px" }}>
        {carList.map((car, i) => (
          <div key={i} style={{ background: theme.gray900, border: editMode ? "1px solid rgba(235,136,0,0.25)" : "1px solid rgba(255,255,255,0.05)", borderRadius: 12, overflow: "hidden", position: "relative", opacity: car.rented ? 0.72 : 1 }}>
            <div
              onClick={() => !editMode && !car.rented && car.image && setLightbox(car.image)}
              style={{ width: "100%", aspectRatio: "16/10", background: `linear-gradient(135deg, ${theme.gray800}, ${theme.gray700})`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", cursor: !editMode && !car.rented && car.image ? "zoom-in" : "default" }}
            >
              {car.image ? (
                <img src={car.image} alt={car.model} style={{ width: "100%", height: "100%", objectFit: "cover", filter: car.rented ? "grayscale(0.4)" : "none" }} />
              ) : (
                <CarIcon size={56} />
              )}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 50, background: `linear-gradient(to top, ${theme.gray900}, transparent)` }} />
              {car.rented && (
                <div style={{ position: "absolute", top: 18, right: -42, transform: "rotate(45deg)", background: "linear-gradient(135deg, #d32f2f, #b71c1c)", color: theme.white, fontFamily: "'Archivo Black', sans-serif", fontSize: "0.78rem", letterSpacing: 1.5, textTransform: "uppercase", padding: "6px 50px", boxShadow: "0 2px 8px rgba(0,0,0,0.4)", pointerEvents: "none" }}>
                  Alquilado
                </div>
              )}
              {editMode && (
                <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 6 }}>
                  <button onClick={() => openEdit(car, i)} style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(10,10,10,0.85)", border: "1px solid rgba(255,255,255,0.15)", color: theme.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><PencilIcon size={15} /></button>
                  <button onClick={() => setDeleteTarget(i)} style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(10,10,10,0.85)", border: "1px solid rgba(255,68,68,0.3)", color: "#ff6b6b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><TrashIcon size={15} /></button>
                </div>
              )}
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
                <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.3rem", color: car.rented ? theme.gray400 : theme.orange, textDecoration: car.rented ? "line-through" : "none" }}>${car.priceWeekly}</span>
                <span style={{ fontSize: "0.78rem", color: theme.gray400 }}>ARS / semana</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out", padding: 20 }}>
          <img src={lightbox} alt="Foto ampliada" style={{ maxWidth: "95%", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }} />
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: 40, height: 40, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><CloseIcon size={18} /></button>
        </div>
      )}

      {/* Modal edición / nuevo vehículo */}
      {editTarget && (
        <div onClick={() => setEditTarget(null)} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 24px", maxWidth: 480, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.1rem" }}>{editTarget._idx === -1 ? "Agregar vehículo" : "Editar vehículo"}</h3>
              <button onClick={() => setEditTarget(null)} style={{ background: "none", border: "none", color: theme.gray400, cursor: "pointer" }}><CloseIcon size={20} /></button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div><label style={labelS}>Modelo</label><input style={inputS} value={form.model} onChange={fld("model")} /></div>
              <div><label style={labelS}>Variante</label><input style={inputS} value={form.variant} onChange={fld("variant")} placeholder="XEI Pack 1.8 CVT" /></div>
              <div>
                <label style={labelS}>Transmisión</label>
                <select style={inputS} value={form.transmission} onChange={fld("transmission")}>
                  <option>Automático</option>
                  <option>Manual</option>
                </select>
              </div>
              <div><label style={labelS}>Año</label><input style={inputS} value={form.year} onChange={fld("year")} placeholder="2017" /></div>
              <div style={{ gridColumn: "1 / -1" }}><label style={labelS}>Precio semanal (ARS, sin $)</label><input style={inputS} value={form.priceWeekly} onChange={fld("priceWeekly")} placeholder="360.000" /></div>
            </div>

            {/* Foto */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelS}>Foto del vehículo</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 90, height: 60, borderRadius: 8, background: theme.gray800, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {form.imagePreview || editTarget._image
                    ? <img src={form.imagePreview || editTarget._image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <CarIcon size={28} opacity={0.3} />
                  }
                </div>
                <label style={{ flex: 1, padding: "9px 14px", background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem", color: theme.gray300, textAlign: "center" }}>
                  {form.imagePreview ? "Cambiar imagen" : "Seleccionar imagen"}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = URL.createObjectURL(file);
                      setForm((p) => ({ ...p, imagePreview: url }));
                    }}
                  />
                </label>
                {form.imagePreview && (
                  <button onClick={() => setForm((p) => ({ ...p, imagePreview: null }))} style={{ background: "none", border: "none", color: theme.gray400, cursor: "pointer", padding: 4 }}><CloseIcon size={16} /></button>
                )}
              </div>
              <p style={{ fontSize: "0.72rem", color: theme.gray400, marginTop: 6 }}>La imagen se guarda temporalmente. Cuando haya API se subirá al servidor.</p>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelS}>Características (una por línea)</label>
              <textarea style={{ ...inputS, minHeight: 90, resize: "vertical" }} value={form.features} onChange={fld("features")} />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 22 }}>
              <input type="checkbox" checked={form.rented} onChange={fld("rented")} style={{ width: 16, height: 16, accentColor: theme.orange }} />
              <span style={{ fontSize: "0.88rem", color: theme.gray300 }}>Marcar como alquilado</span>
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditTarget(null)} style={{ flex: 1, padding: "11px 0", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer" }}>Cancelar</button>
              <button onClick={saveEdit} style={{ flex: 1, padding: "11px 0", background: theme.orange, border: "none", borderRadius: 10, color: theme.black, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>{editTarget._idx === -1 ? "Agregar" : "Guardar cambios"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmación eliminar */}
      {deleteTarget !== null && (
        <div onClick={() => setDeleteTarget(null)} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 24px", maxWidth: 380, width: "100%" }}>
            <h3 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.05rem", marginBottom: 8 }}>¿Eliminar vehículo?</h3>
            <p style={{ fontSize: "0.88rem", color: theme.gray400, lineHeight: 1.6, marginBottom: 20 }}>
              Vas a eliminar <strong style={{ color: theme.white }}>{carList[deleteTarget]?.model} {carList[deleteTarget]?.variant}</strong> del catálogo.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: "11px 0", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer" }}>Volver</button>
              <button onClick={() => { setCarList((p) => p.filter((_, i) => i !== deleteTarget)); setDeleteTarget(null); }} style={{ flex: 1, padding: "11px 0", background: "#c62828", border: "none", borderRadius: 10, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {!user && <CTABanner navigate={navigate} />}
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
    nombre: useRef(), nacimiento: useRef(), direccion: useRef(), localidad: useRef(),
    telefono: useRef(), email: useRef(), licencia: useRef(), vigencia: useRef(),
    urgencia: useRef(), alquilerPrevio: useRef(), empresaAnterior: useRef(),
    referencia: useRef(), comentario: useRef(),
  };

  const handleAlquilerChange = (e) => {
    const v = e.target.value;
    setShowEmpresa(v === "Sí, a una empresa" || v === "Sí, a un particular");
  };

  const handleSubmit = async () => {
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
        await fetch(GOOGLE_SHEET_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(payload),
        });
      }
      setSubmitted(true);
    } catch {
      setError("Hubo un error al enviar. Por favor intenta de nuevo.");
      setLoading(false);
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
        <SectionLabel>Sumate al equipo</SectionLabel>
        <SectionTitle>Quiero manejar con KPCars</SectionTitle>
        <p style={{ fontSize: "1rem", color: theme.gray400, maxWidth: 520, lineHeight: 1.6, marginBottom: 10 }}>
          Completa el formulario y nos ponemos en contacto contigo para coordinar los próximos pasos.
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
          <FormGroup label="Dirección" required>
            <input ref={refs.direccion} style={inputStyle} placeholder="Calle y número" />
          </FormGroup>
          <FormGroup label="Localidad" required>
            <select ref={refs.localidad} style={inputStyle} defaultValue="">
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
              <input ref={refs.telefono} type="tel" style={inputStyle} placeholder="+54 11 1234-5678" />
            </FormGroup>
            <FormGroup label="Email" required>
              <input ref={refs.email} type="email" style={inputStyle} placeholder="tu@email.com" />
            </FormGroup>
          </FormRow>

          {/* ── Licencia ── */}
          <FormSection label="Licencia de conducir" />
          <FormRow>
            <FormGroup label="¿Tienes licencia vigente?" required>
              <select ref={refs.licencia} style={inputStyle} defaultValue="">
                <option value="" disabled>Selecciona una opción</option>
                <option value="Sí - Profesional">Sí — Profesional</option>
                <option value="Sí - Particular">Sí — Particular</option>
                <option value="En trámite">En trámite</option>
                <option value="No">No tengo licencia</option>
              </select>
            </FormGroup>
            <FormGroup label="Vigencia de la licencia" required>
              <select ref={refs.vigencia} style={inputStyle} defaultValue="">
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
            <select ref={refs.urgencia} style={inputStyle} defaultValue="">
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
                <label key={app} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.88rem", color: theme.gray300, cursor: "pointer", padding: "9px 14px", background: theme.gray800, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
                  <input type="checkbox" className="app-check" value={app} style={{ accentColor: theme.orange }} /> {app}
                </label>
              ))}
            </div>
          </FormGroup>
          <FormGroup label="¿Alquilaste un auto antes para trabajar?" required>
            <select ref={refs.alquilerPrevio} style={inputStyle} defaultValue="" onChange={handleAlquilerChange}>
              <option value="" disabled>Selecciona una opción</option>
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
              <option value="" disabled>Selecciona una opción</option>
              <option value="Redes sociales">Redes sociales</option>
              <option value="Recomendación">Recomendación de un conocido</option>
              <option value="Búsqueda en Google">Búsqueda en Google</option>
              <option value="Vi un auto de KPCars">Vi un auto de KPCars en la calle</option>
              <option value="Otro">Otro</option>
            </select>
          </FormGroup>
          <FormGroup label="¿Quieres agregar algo más?">
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
   LOGIN PAGE
   ───────────────────────────────────────────── */
function LoginPage({ onLogin }) {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const inputStyle = { width: "100%", padding: "14px 16px", background: theme.gray800, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem" };

  const handleSubmit = async () => {
    if (!dni || !password) {
      setError("Ingresá tu DNI y contraseña.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dni, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 422 = datos inválidos, 401 = credenciales incorrectas
        const msg = data.message || data.error || "DNI o contraseña incorrectos.";
        setError(msg);
        setLoading(false);
        return;
      }

      // Login exitoso — pasar token y datos al componente padre
      onLogin({
        token: data.token,
        must_change_password: data.must_change_password,
        user: data.user || {},
      });

    } catch (err) {
      setError("Error de conexión. Verificá tu internet e intentá de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "84px 20px 60px" }}>
      <div className="anim-in" style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: `rgba(235,136,0,0.12)`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <UserIcon size={28} />
          </div>
          <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.6rem", letterSpacing: -0.5, marginBottom: 6 }}>Zona Conductores</h2>
          <p style={{ color: theme.gray400, fontSize: "0.9rem" }}>Ingresá con tu DNI y contraseña</p>
        </div>

        <div style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "clamp(24px, 5vw, 36px)" }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: 7, color: theme.gray200 }}>DNI <span style={{ color: theme.orange }}>*</span></label>
            <input
              type="text"
              inputMode="numeric"
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/[^0-9]/g, ""))}
              style={inputStyle}
              placeholder="Ej: 12345678"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: 7, color: theme.gray200 }}>Contraseña <span style={{ color: theme.orange }}>*</span></label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: 48 }}
                placeholder="Tu contraseña"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: theme.gray400, cursor: "pointer", fontSize: "0.8rem", fontFamily: "'DM Sans', sans-serif" }}
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowForgot(!showForgot)}
            style={{ background: "none", border: "none", color: theme.orange, fontSize: "0.82rem", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", padding: "4px 0", marginBottom: 20, display: "block" }}
          >
            Olvidé mi contraseña
          </button>

          {showForgot && (
            <div style={{ background: "rgba(235,136,0,0.08)", border: "1px solid rgba(235,136,0,0.2)", borderRadius: 10, padding: 16, marginBottom: 20, fontSize: "0.85rem", color: theme.gray200, lineHeight: 1.6 }}>
              Para recuperar tu contraseña, comunicate con la central de KPCars:
              <br /><br />
              <strong style={{ color: theme.white }}>WhatsApp:</strong>{" "}
              <a href="https://wa.me/541123850982" target="_blank" rel="noopener noreferrer" style={{ color: theme.orange, textDecoration: "none" }}>+54 11 2385-0982</a>
              <br />
              <strong style={{ color: theme.white }}>Email:</strong>{" "}
              <a href="mailto:info@kpcars.com.ar" style={{ color: theme.orange, textDecoration: "none" }}>info@kpcars.com.ar</a>
            </div>
          )}

          {error && <p style={{ color: "#ff4444", fontSize: "0.85rem", marginBottom: 14 }}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: "100%", padding: 15, background: loading ? theme.gray600 : theme.orange, color: theme.black, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.95rem", border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Ingresando..." : "Ingresar →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DASHBOARD PAGE (PANEL DEL CONDUCTOR)
   ───────────────────────────────────────────── */
function DashboardPage({ user, navigate, apiFetch, onUserUpdate }) {
  const [tab, setTab] = useState("perfil");

  const tabStyle = (active) => ({
    padding: "10px 20px",
    borderRadius: 8,
    fontSize: "0.88rem",
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    border: "none",
    background: active ? theme.orange : "rgba(255,255,255,0.06)",
    color: active ? theme.black : theme.gray300,
  });

  return (
    <div style={{ paddingTop: 84, maxWidth: 900, margin: "0 auto", padding: "84px 20px 80px" }}>
      <div className="anim-in" style={{ marginBottom: 32 }}>
        <SectionLabel>Panel del conductor</SectionLabel>
        <SectionTitle>Hola, {user.nombre}</SectionTitle>
      </div>

      <div className="dash-tabs">
        <button style={tabStyle(tab === "perfil")} onClick={() => setTab("perfil")}>Mi Perfil</button>
        <button style={tabStyle(tab === "turnos")} onClick={() => setTab("turnos")}>Mis Turnos</button>
        <button style={tabStyle(false)} onClick={() => navigate("turnos")}>+ Solicitar turno</button>
      </div>

      {tab === "perfil" && <ProfileTab user={user} apiFetch={apiFetch} onUpdate={onUserUpdate} />}
      {tab === "turnos" && <TurnosTab user={user} apiFetch={apiFetch} navigate={navigate} />}
    </div>
  );
}

/* ── Perfil del conductor ── */
function ProfileTab({ user, apiFetch, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(user.email || "");
  const [telefono, setTelefono] = useState(user.telefono || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSaveOk(false);
    try {
      const res = await apiFetch("/me", {
        method: "PATCH",
        body: JSON.stringify({ correo: email, telefono }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No se pudo guardar.");
      onUpdate({ ...user, email, telefono });
      setSaveOk(true);
      setEditing(false);
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
  };

  const fieldStyle = { marginBottom: 20 };
  const labelStyle = { fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: theme.gray400, marginBottom: 5, display: "block" };
  const valueStyle = { fontSize: "1rem", color: theme.white, fontWeight: 500 };
  const inputStyle = { width: "100%", padding: "9px 12px", background: theme.gray800, border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 8, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem" };

  return (
    <div className="anim-in">
      <div style={{ display: "grid", gap: 24 }} className="profile-grid">
        <style>{`
          .profile-grid { grid-template-columns: 200px 1fr; }
          @media (max-width: 600px) { .profile-grid { grid-template-columns: 1fr; } }
        `}</style>

        {/* Foto */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: 160, height: 160, borderRadius: 16, background: theme.gray800, border: "2px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <ProfileAvatar user={user} size={160} />
          </div>
        </div>

        {/* Datos */}
        <div style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "clamp(20px, 4vw, 32px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }} className="profile-fields">
            <style>{`@media (max-width: 500px) { .profile-fields { grid-template-columns: 1fr !important; } }`}</style>
            <div style={fieldStyle}>
              <span style={labelStyle}>Nombre</span>
              <span style={valueStyle}>{user.nombre}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Apellido</span>
              <span style={valueStyle}>{user.apellido}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>DNI</span>
              <span style={valueStyle}>{user.dni}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Vencimiento licencia</span>
              <span style={valueStyle}>{user.licenciaVencimiento || "—"}</span>
            </div>

            {/* Email editable */}
            <div style={fieldStyle}>
              <span style={labelStyle}>Email</span>
              {editing ? (
                <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
              ) : (
                <span style={valueStyle}>{user.email || <span style={{ color: theme.gray400 }}>Sin especificar</span>}</span>
              )}
            </div>

            {/* Teléfono editable */}
            <div style={fieldStyle}>
              <span style={labelStyle}>Teléfono</span>
              {editing ? (
                <input style={inputStyle} type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+54 9 11 1234-5678" />
              ) : (
                <span style={valueStyle}>{user.telefono || <span style={{ color: theme.gray400 }}>Sin especificar</span>}</span>
              )}
            </div>
          </div>

          {/* Acciones */}
          {saveOk && !editing && (
            <div style={{ fontSize: "0.82rem", color: "#4caf50", marginBottom: 12 }}>Datos actualizados correctamente.</div>
          )}
          {saveError && (
            <div style={{ fontSize: "0.82rem", color: "#ff6b6b", marginBottom: 12 }}>{saveError}</div>
          )}
          {editing ? (
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={handleCancel} disabled={saving} style={{ flex: 1, padding: "10px 0", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "10px 0", background: theme.orange, border: "none", borderRadius: 10, color: theme.black, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.88rem", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          ) : (
            <button onClick={() => { setEditing(true); setSaveOk(false); }} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: theme.gray300, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
              <PencilIcon size={15} /> Editar contacto
            </button>
          )}
        </div>
      </div>

      {/* Auto asignado actual */}
      {user.autoAsignado && (
        <div style={{ marginTop: 28, background: theme.gray900, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "clamp(20px, 4vw, 32px)" }}>
          <p style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: theme.orange, marginBottom: 16 }}>Vehículo actual</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: "rgba(235,136,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CarIcon size={32} opacity={0.8} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.1rem" }}>{user.autoAsignado.model}</div>
              <div style={{ fontSize: "0.85rem", color: theme.gray400 }}>{user.autoAsignado.variant} · {user.autoAsignado.year}</div>
              <div style={{ fontSize: "0.88rem", color: theme.orange, fontWeight: 700, marginTop: 4 }}>Patente: {user.autoAsignado.patente}</div>
            </div>
            {user.autoAsignado.desde && (
              <div style={{ background: "rgba(235,136,0,0.08)", padding: "6px 14px", borderRadius: 8, fontSize: "0.78rem", color: theme.orange, fontWeight: 600 }}>
                Desde {user.autoAsignado.desde}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historial de autos anteriores */}
      {user.historialAutos && user.historialAutos.length > 0 && (
        <div style={{ marginTop: 16, background: theme.gray900, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "clamp(20px, 4vw, 32px)" }}>
          <p style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: theme.gray400, marginBottom: 16 }}>Vehículos anteriores</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {user.historialAutos.map((auto, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CarIcon size={22} opacity={0.3} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.92rem", fontWeight: 600 }}>{auto.model}</div>
                  <div style={{ fontSize: "0.8rem", color: theme.gray400 }}>{auto.variant} · {auto.year} · <span style={{ color: theme.gray300 }}>{auto.patente}</span></div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "0.72rem", color: theme.gray400, lineHeight: 1.5 }}>Desde {auto.desde}</div>
                  {auto.hasta && <div style={{ fontSize: "0.72rem", color: theme.gray400, lineHeight: 1.5 }}>al {auto.hasta}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Icono refresh ── */
const RefreshIcon = ({ size = 18, spinning = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "transform 0.4s", transform: spinning ? "rotate(360deg)" : "none" }}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

/* ── Turnos del conductor ── */
function TurnosTab({ user, apiFetch, navigate }) {
  const [turnos, setTurnos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const fetchTurnos = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    const today = new Date();
    const from = new Date(today); from.setMonth(from.getMonth() - 3);
    const to = new Date(today);   to.setMonth(to.getMonth() + 3);
    const fromStr = from.toISOString().split("T")[0];
    const toStr   = to.toISOString().split("T")[0];
    try {
      const res = await apiFetch(`/appointments?from=${fromStr}&to=${toStr}`);
      const data = await res.json();
      const all = [...(data.appointments || [])];
      all.sort((a, b) => (a.scheduled_date > b.scheduled_date ? -1 : 1));
      setTurnos(all);
      setLastUpdated(new Date());
      setError("");
    } catch {
      if (!silent) setError("No se pudo cargar el historial de turnos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTurnos(false);
    const interval = setInterval(() => fetchTurnos(true), 60000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const dateOf = (t) => t.scheduled_date?.split("T")[0] ?? "";
  const proximos = (turnos || []).filter((t) => dateOf(t) >= todayStr);
  const pasados = (turnos || []).filter((t) => dateOf(t) < todayStr);

  const statusConfig = {
    agendado:   { label: "Agendado",    color: theme.orange,  bg: "rgba(235,136,0,0.1)"    },
    completado: { label: "Completado",  color: "#4caf50",     bg: "rgba(76,175,80,0.1)"    },
    en_proceso: { label: "En proceso",  color: "#29b6f6",     bg: "rgba(41,182,246,0.1)"   },
    cancelado:  { label: "Cancelado",   color: theme.gray400, bg: "rgba(255,255,255,0.05)" },
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError("");
    try {
      const res = await apiFetch(`/appointments/${cancelTarget.id}/cancelar`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No se pudo cancelar el turno.");
      setTurnos((prev) =>
        prev.map((t) => t.id === cancelTarget.id ? { ...t, status: data.appointment?.status ?? "cancelado" } : t)
      );
      setCancelTarget(null);
    } catch (err) {
      setCancelError(err.message || "No se pudo cancelar el turno. Intentá de nuevo.");
    } finally {
      setCancelling(false);
    }
  };

  const TurnoCard = ({ t }) => {
    const s = statusConfig[t.status] || statusConfig.agendado;
    const datePart = dateOf(t);
    const fechaLabel = datePart
      ? new Date(datePart + "T12:00:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
      : "—";
    const canCancel = t.status === "agendado" && datePart >= todayStr;
    return (
      <div className="turno-card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: s.color }}>
          {t.type === "emergencia" ? <AlertIcon size={20} /> : <WrenchIcon size={20} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.service}</div>
          <div style={{ fontSize: "0.78rem", color: theme.gray400 }}>{fechaLabel} · {t.license_plate}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div className="turno-badge" style={{ background: s.bg, color: s.color, fontSize: "0.72rem", fontWeight: 700, padding: "4px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {s.label}
          </div>
          {canCancel && (
            <button
              onClick={() => { setCancelTarget(t); setCancelError(""); }}
              title="Cancelar turno"
              style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", color: "#ff6b6b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "48px 0", color: theme.gray400 }}>Cargando turnos...</div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: "48px 0", color: "#ff6b6b", fontSize: "0.9rem" }}>{error}</div>
  );

  const cancelDateLabel = cancelTarget
    ? new Date((dateOf(cancelTarget)) + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
    : "";

  return (
    <div className="anim-in">
      {/* Modal confirmación cancelación */}
      {cancelTarget && (
        <div
          onClick={() => !cancelling && setCancelTarget(null)}
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 24px", maxWidth: 400, width: "100%" }}>
            <h3 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.1rem", marginBottom: 8 }}>¿Cancelar turno?</h3>
            <p style={{ fontSize: "0.88rem", color: theme.gray400, lineHeight: 1.6, marginBottom: 6 }}>
              Vas a cancelar el turno del <strong style={{ color: theme.white }}>{cancelDateLabel}</strong>.
            </p>
            <p style={{ fontSize: "0.82rem", color: "#ff8080", lineHeight: 1.5, marginBottom: 20 }}>
              Recordá que 2 turnos perdidos o cancelados sin anticipación generan una penalidad económica.
            </p>
            {cancelError && <p style={{ fontSize: "0.82rem", color: "#ff4444", marginBottom: 12 }}>{cancelError}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                style={{ flex: 1, padding: "11px 0", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer" }}
              >
                Volver
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelling}
                style={{ flex: 1, padding: "11px 0", background: cancelling ? theme.gray600 : "#c62828", border: "none", borderRadius: 10, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.88rem", cursor: cancelling ? "not-allowed" : "pointer" }}
              >
                {cancelling ? "Cancelando..." : "Confirmar cancelación"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header con refresh */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: theme.gray400 }}>Mis Turnos</p>
          {lastUpdated && (
            <p style={{ fontSize: "0.72rem", color: theme.gray400, marginTop: 2 }}>
              Actualizado {lastUpdated.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
        <button
          onClick={() => fetchTurnos(true)}
          disabled={refreshing}
          title="Actualizar turnos"
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: theme.gray300, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.8rem", cursor: refreshing ? "not-allowed" : "pointer", opacity: refreshing ? 0.6 : 1 }}
        >
          <RefreshIcon size={14} spinning={refreshing} />
          {refreshing ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      {/* Próximos */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: theme.orange, marginBottom: 14 }}>Próximos turnos</p>
        {proximos.length === 0 ? (
          <div style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 24, textAlign: "center" }}>
            <p style={{ color: theme.gray400, fontSize: "0.9rem", marginBottom: 14 }}>No tenés turnos agendados.</p>
            <button
              onClick={() => navigate("turnos")}
              style={{ padding: "10px 20px", background: theme.orange, border: "none", borderRadius: 8, color: theme.black, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}
            >
              Solicitar turno →
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {proximos.map((t) => <TurnoCard key={t.id} t={t} />)}
          </div>
        )}
      </div>

      {/* Historial */}
      {pasados.length > 0 && (
        <div>
          <p style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: theme.gray400, marginBottom: 14 }}>Historial</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pasados.map((t) => <TurnoCard key={t.id} t={t} />)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CHANGE PASSWORD PAGE (primer login)
   ───────────────────────────────────────────── */
function ChangePasswordPage({ user, token, onComplete }) {
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputStyle = { width: "100%", padding: "14px 16px", background: theme.gray800, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem" };

  const handleChange = async () => {
    if (!newPass || !confirmPass) {
      setError("Completá ambos campos.");
      return;
    }
    if (newPass.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPass !== confirmPass) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/change-password`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: newPass,
          password_confirmation: confirmPass,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.message || data.error || "Error al cambiar la contraseña.";
        if (data.errors) {
          const firstError = Object.values(data.errors).flat()[0];
          setError(firstError || msg);
        } else {
          setError(msg);
        }
        setLoading(false);
        return;
      }

      onComplete(data.token || null);

    } catch (err) {
      setError("Error de conexión. Intentá de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "84px 20px 60px" }}>
      <div className="anim-in" style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: "rgba(235,136,0,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={theme.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.5rem", letterSpacing: -0.5, marginBottom: 6 }}>Cambiá tu contraseña</h2>
          <p style={{ color: theme.gray400, fontSize: "0.9rem", lineHeight: 1.5 }}>
            Es tu primer inicio de sesión. Por seguridad,<br />elegí una contraseña nueva.
          </p>
        </div>

        <div style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "clamp(24px, 5vw, 36px)" }}>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: 7, color: theme.gray200 }}>
              Nueva contraseña <span style={{ color: theme.orange }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showNew ? "text" : "password"}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                style={{ ...inputStyle, paddingRight: 48 }}
                placeholder="Mínimo 8 caracteres"
              />
              <button onClick={() => setShowNew(!showNew)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: theme.gray400, cursor: "pointer", fontSize: "0.8rem", fontFamily: "'DM Sans', sans-serif" }}>
                {showNew ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: 7, color: theme.gray200 }}>
              Repetir contraseña <span style={{ color: theme.orange }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                style={{ ...inputStyle, paddingRight: 48 }}
                placeholder="Repetí la contraseña"
                onKeyDown={(e) => e.key === "Enter" && handleChange()}
              />
              <button onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: theme.gray400, cursor: "pointer", fontSize: "0.8rem", fontFamily: "'DM Sans', sans-serif" }}>
                {showConfirm ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          {error && <p style={{ color: "#ff4444", fontSize: "0.85rem", marginBottom: 14 }}>{error}</p>}

          <button
            onClick={handleChange}
            disabled={loading}
            style={{ width: "100%", padding: 15, background: loading ? theme.gray600 : theme.orange, color: theme.black, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.95rem", border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Guardando..." : "Guardar y continuar →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TURNOS PAGE (formulario completo)
   ───────────────────────────────────────────── */
function TurnosPage({ user, apiFetch }) {
  const [urgencia, setUrgencia] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [fullDates, setFullDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);

  const inputStyle = { width: "100%", padding: "14px 16px", background: theme.gray800, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem" };

  const isUrgente = urgencia === "urgente";

  useEffect(() => {
    if (isUrgente || !urgencia) return;
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const from = `${y}-${String(m + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m + 1, 0).getDate();
    const to = `${y}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    setLoadingDates(true);
    apiFetch(`/sync-turnos?from=${from}&to=${to}`)
      .then((res) => res.json())
      .then((data) => {
        const counts = {};
        (data.appointments || []).forEach((apt) => {
          if (apt.type === "normal") {
            const key = apt.scheduled_date?.split("T")[0] ?? "";
            if (key) counts[key] = (counts[key] || 0) + 1;
          }
        });
        setFullDates(Object.keys(counts).filter((d) => counts[d] >= 4));
      })
      .catch(() => {})
      .finally(() => setLoadingDates(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, urgencia]);

  const getAvailableDates = () => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const available = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let d = 1; d <= 31; d++) {
      const date = new Date(y, m, d);
      if (date.getMonth() !== m) break;
      const dateStr = date.toISOString().split("T")[0];
      if (date >= today && date.getDay() !== 0 && date.getDay() !== 6 && !fullDates.includes(dateStr)) {
        available.push(dateStr);
      }
    }
    return available;
  };

  const availableDates = getAvailableDates();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const changeMonth = (dir) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + dir, 1));
    setSelectedDate(null);
  };

  const handleSubmit = async () => {
    if (!descripcion.trim()) {
      setError("Describí el problema o motivo de la revisión.");
      return;
    }
    if (!urgencia) {
      setError("Seleccioná el nivel de urgencia.");
      return;
    }
    if (!isUrgente && !selectedDate) {
      setError("Seleccioná un día para el turno.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/appointments", {
        method: "POST",
        body: JSON.stringify({
          service: descripcion,
          preferred_date: isUrgente ? new Date().toISOString().split("T")[0] : selectedDate,
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
      setError(err.message || "Error de conexión. Intentá de nuevo.");
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div style={{ paddingTop: 84, maxWidth: 600, margin: "0 auto", padding: "84px 20px 80px" }}>
        <div className="anim-in" style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ width: 72, height: 72, background: isUrgente ? "rgba(255,68,68,0.12)" : "rgba(235,136,0,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "2rem", color: isUrgente ? "#ff4444" : theme.orange }}>✓</div>
          <h3 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.4rem", marginBottom: 10 }}>
            {isUrgente ? "Turno urgente confirmado" : "Turno confirmado"}
          </h3>
          {isUrgente ? (
            <>
              <p style={{ color: theme.gray400, fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 6 }}>
                Tu turno de emergencia quedó registrado. El taller fue notificado y te atenderán
              </p>
              <p style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.2rem", color: "#ff4444" }}>
                a la brevedad posible.
              </p>
              <p style={{ color: theme.gray400, fontSize: "0.84rem", marginTop: 16, lineHeight: 1.5 }}>
                Presentate en el taller con el vehículo. Si no podés asistir, cancelá con anticipación para evitar penalidades.
              </p>
            </>
          ) : (
            <>
              <p style={{ color: theme.gray400, fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 6 }}>
                Tu turno quedó confirmado para el
              </p>
              <p style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.2rem", color: theme.orange }}>
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p style={{ color: theme.gray400, fontSize: "0.84rem", marginTop: 16, lineHeight: 1.5 }}>
                Presentate puntual. Si no podés asistir, cancelá con al menos <strong style={{ color: theme.white }}>24 hs de anticipación</strong> para evitar que cuente como turno perdido.
              </p>
            </>
          )}
          <button
            onClick={() => { setConfirmed(false); setSelectedDate(null); setDescripcion(""); setUrgencia(""); }}
            style={{ marginTop: 24, padding: "10px 24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer" }}
          >
            Solicitar otro turno
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 84, maxWidth: 700, margin: "0 auto", padding: "84px 20px 80px" }}>
      <div className="anim-in" style={{ marginBottom: 28 }}>
        <SectionLabel>Revisión mecánica</SectionLabel>
        <SectionTitle>Solicitar turno</SectionTitle>
        <p style={{ fontSize: "0.95rem", color: theme.gray400, lineHeight: 1.6 }}>
          Completá el formulario para pedir un turno de revisión para tu vehículo.
        </p>
      </div>

      {/* Info del auto */}
      {user.autoAsignado && (
        <div className="anim-in d1" style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 18, marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(235,136,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CarIcon size={24} opacity={0.8} />
          </div>
          <div>
            <div style={{ fontSize: "0.82rem", color: theme.gray400 }}>Vehículo</div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{user.autoAsignado.model} · {user.autoAsignado.patente}</div>
          </div>
        </div>
      )}

      <div className="anim-in d2" style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "clamp(20px, 4vw, 32px)" }}>

        {/* Descripción del problema */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: 7, color: theme.gray200 }}>
            Descripción del problema o motivo <span style={{ color: theme.orange }}>*</span>
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
            placeholder="Ej: Hace ruido al frenar, service de rutina, problema con el aire acondicionado..."
          />
        </div>

        {/* Urgencia */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: 10, color: theme.gray200 }}>
            Nivel de urgencia <span style={{ color: theme.orange }}>*</span>
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { value: "normal", label: "Normal", desc: "Revisión de rutina, service o problema menor. Elegís el día en el calendario.", color: theme.orange, bgColor: "rgba(235,136,0,0.08)", borderColor: "rgba(235,136,0,0.2)" },
              { value: "urgente", label: "Urgente", desc: "El vehículo tiene una falla grave que te impide trabajar hoy. Solo usá esta opción si realmente no podés circular.", color: "#ff4444", bgColor: "rgba(255,68,68,0.08)", borderColor: "rgba(255,68,68,0.3)" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setUrgencia(opt.value); if (opt.value === "urgente") setSelectedDate(null); }}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12, padding: 16,
                  background: urgencia === opt.value ? opt.bgColor : "transparent",
                  border: urgencia === opt.value ? `2px solid ${opt.borderColor}` : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, cursor: "pointer", textAlign: "left",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                  border: urgencia === opt.value ? `6px solid ${opt.color}` : "2px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem", color: urgencia === opt.value ? opt.color : theme.white, marginBottom: 2 }}>{opt.label}</div>
                  <div style={{ fontSize: "0.8rem", color: theme.gray400, lineHeight: 1.4 }}>{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Aviso de urgente */}
        {isUrgente && (
          <div className="anim-in" style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.35)", borderRadius: 12, padding: 18, marginBottom: 24 }}>
            <p style={{ fontSize: "0.9rem", color: "#ff4444", fontWeight: 700, marginBottom: 6 }}>⚠ Atención: turno de emergencia</p>
            <p style={{ fontSize: "0.84rem", color: theme.gray300, lineHeight: 1.55 }}>
              Esta opción es exclusivamente para fallas graves que <strong style={{ color: theme.white }}>te impiden circular hoy</strong>. No es para adelantar revisiones ni evitar espera.
            </p>
            <p style={{ fontSize: "0.82rem", color: "#ff6b6b", marginTop: 8, lineHeight: 1.5 }}>
              El uso indebido de turnos urgentes puede derivar en <strong>penalidades económicas</strong> y restricción del sistema.
            </p>
          </div>
        )}

        {/* Calendario — solo si NO es urgente */}
        {!isUrgente && urgencia && (
          <div className="anim-in">
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: 12, color: theme.gray200 }}>
              Elegí un día disponible <span style={{ color: theme.orange }}>*</span>
            </label>

            {/* Navegación del mes */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <button onClick={() => changeMonth(-1)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: theme.white, width: 36, height: 36, borderRadius: 8, cursor: "pointer", fontSize: "1.1rem" }}>‹</button>
              <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.05rem" }}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <button onClick={() => changeMonth(1)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: theme.white, width: 36, height: 36, borderRadius: 8, cursor: "pointer", fontSize: "1.1rem" }}>›</button>
            </div>

            {/* Nombres de días */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
              {dayNames.map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: "0.72rem", fontWeight: 700, color: theme.gray400, padding: "6px 0", textTransform: "uppercase", letterSpacing: 1 }}>{d}</div>
              ))}
            </div>

            {/* Grilla */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 16, opacity: loadingDates ? 0.4 : 1, transition: "opacity 0.2s", pointerEvents: loadingDates ? "none" : "auto" }}>
              {Array.from({ length: startOffset }, (_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isAvailable = availableDates.includes(dateStr);
                const isFull = fullDates.includes(dateStr);
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={day}
                    onClick={() => isAvailable && setSelectedDate(dateStr)}
                    disabled={!isAvailable}
                    title={isFull ? "Sin cupo" : undefined}
                    className="cal-day"
                    style={{
                      aspectRatio: "1", border: isSelected ? `2px solid ${theme.orange}` : "1px solid transparent",
                      borderRadius: 10,
                      background: isSelected ? "rgba(235,136,0,0.15)" : isAvailable ? "rgba(255,255,255,0.04)" : "transparent",
                      color: isSelected ? theme.orange : isAvailable ? theme.white : "rgba(255,255,255,0.15)",
                      fontFamily: "'DM Sans', sans-serif", fontWeight: isSelected ? 700 : 500, fontSize: "0.88rem",
                      cursor: isAvailable ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >{day}</button>
                );
              })}
            </div>

            {/* Leyenda */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: theme.gray400 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }} /> Disponible
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: theme.gray400 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(235,136,0,0.15)", border: "2px solid rgba(235,136,0,0.6)" }} /> Seleccionado
              </div>
            </div>

            {selectedDate && (
              <div style={{ padding: 14, background: "rgba(235,136,0,0.06)", borderRadius: 10, border: "1px solid rgba(235,136,0,0.15)", marginTop: 8 }}>
                <p style={{ fontSize: "0.88rem", color: theme.gray200 }}>
                  Fecha seleccionada: <strong style={{ color: theme.orange }}>
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
                  </strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Disclaimer general */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px", marginTop: 24 }}>
          <p style={{ fontSize: "0.78rem", color: theme.gray400, lineHeight: 1.6, marginBottom: 6 }}>
            <strong style={{ color: theme.gray300 }}>Política de turnos:</strong> Ausentarse sin cancelar con al menos 24 hs de anticipación cuenta como turno perdido.
          </p>
          <p style={{ fontSize: "0.78rem", color: "#ff8080", lineHeight: 1.6 }}>
            Acumular <strong>2 turnos perdidos</strong> genera una <strong>penalidad económica</strong> según el reglamento vigente.
          </p>
        </div>

        {error && <p style={{ color: "#ff4444", fontSize: "0.85rem", marginTop: 16 }}>{error}</p>}

        {/* Botón enviar */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", padding: 15, background: loading ? theme.gray600 : (isUrgente ? "#d32f2f" : theme.orange), color: theme.white, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.95rem", border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer", marginTop: 16 }}
        >
          {loading ? "Enviando..." : isUrgente ? "Confirmar turno urgente" : "Confirmar turno →"}
        </button>
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
        <p style={{ color: "rgba(0,0,0,0.7)", fontSize: "1rem", marginBottom: 24, position: "relative" }}>Completa el formulario y nos comunicamos contigo en menos de 24 horas.</p>
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
function Footer({ navigate, user }) {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
      <style>{`
        .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 36px; padding: 52px 0 36px; }
        @media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="footer-grid">
        <div>
          <img src={kpLogo} alt="KPCars" style={{ height: 60, marginBottom: 14 }} />
          <p style={{ fontSize: "0.88rem", color: theme.gray400, lineHeight: 1.6, maxWidth: 280 }}>
            Alquiler de autos Toyota para aplicaciones de transporte y particular en Buenos Aires.
          </p>
        </div>
        <FooterCol title="Navegación">
          <FooterLink onClick={() => navigate("home")}>Inicio</FooterLink>
          <FooterLink onClick={() => navigate("catalog")}>Flota</FooterLink>
          {!user && <FooterLink onClick={() => navigate("apply")}>Quiero manejar</FooterLink>}
        </FooterCol>
        <FooterCol title="Contacto">
          <FooterLink href="tel:+541123850982">+54 11 2385-0982</FooterLink>
          <FooterLink href="mailto:info@kpcars.com.ar">info@kpcars.com.ar</FooterLink>
          <FooterLink href="https://wa.me/541123850982" external>WhatsApp</FooterLink>
        </FooterCol>
        <FooterCol title="Redes sociales">
          <FooterLink href="https://instagram.com/kpcarss" external>Instagram</FooterLink>
          <FooterLink href="https://tiktok.com/@kpcarss" external>TikTok</FooterLink>
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

/* ─────────────────────────────────────────────
   WHATSAPP FLOATING BUTTON
   ───────────────────────────────────────────── */
function WhatsAppButton() {
  // Número en formato internacional sin espacios ni símbolos.
  // wa.me es la URL oficial de WhatsApp: en mobile abre la app, en desktop abre WhatsApp Web.
  const phone = "541123850982";
  const message = "¡Hola! Me interesa alquilar un auto con KPCars.";
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <>
      {/* La animación de "pulso": un aro que crece y se desvanece.
          La definimos acá dentro para que el componente sea autocontenido. */}
      <style>{`
        @keyframes wa-pulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0;   }
        }
        .wa-float:hover { transform: scale(1.08); }
        .wa-float { transition: transform 0.2s ease; }
      `}</style>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribinos por WhatsApp"
        className="wa-float"
        style={{
          position: "fixed",     // fijo respecto a la ventana, no a la página
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: "50%",   // círculo perfecto
          background: "#25D366", // verde oficial de WhatsApp
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(37, 211, 102, 0.4)",
          zIndex: 99,            // arriba de casi todo (el Nav usa 100)
          textDecoration: "none",
        }}
      >
        {/* El aro que late. Está por detrás del botón (posición absoluta + z-index -1). */}
        <span
          style={{
            position: "absolute",
            inset: 0,              // ocupa exactamente el mismo espacio que el padre
            borderRadius: "50%",
            background: "#25D366",
            animation: "wa-pulse 2s ease-out infinite",
            zIndex: -1,
          }}
        />
        {/* Ícono de WhatsApp en SVG inline, igual que los demás íconos del sitio */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </>
  );
}
