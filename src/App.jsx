import { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router";

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

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycby9oZ4hlk8mqZFRtVUWBq2qNGOSYNt5waPRx3L8FyQgGbudK0mkCd1IAQJlfwB_YtK4dQ/exec";
// ↑ Reemplazá esto con la URL que te da Google Apps Script al implementar.
// Ejemplo: "https://script.google.com/macros/s/AKfycbx.../exec"

/* ─── API CONFIG ─── */
const API_BASE = "https://kpcars.online/api";

// WhatsApp en formato internacional, sin espacios ni símbolos (lo usa wa.me)
const WHATSAPP_PUBLIC = "5491164423273";  // +54 9 11 6442-3273: consultas de quienes no son conductores
const WHATSAPP_DRIVERS = "541123850982";  // +54 11 2385-0982: central para conductores
const MEDIA_BASE = "https://kpcars.online";
const toAbsoluteUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try { return MEDIA_BASE + new URL(url).pathname; } catch { return url; }
  }
  return url.startsWith("/") ? MEDIA_BASE + url : MEDIA_BASE + "/" + url;
};

/* ─────────────────────────────────────────────
   FLOTA — tipos de vehículo, no autos puntuales.
   La página muestra cómo son los autos, sin ofrecer una unidad
   en particular: por eso no hay año, versión, patente ni "alquilado".
   ───────────────────────────────────────────── */
const PRICE_WEEKLY = "400.000"; // alquiler semanal en ARS, igual para todos los tipos

const fleetTypes = [
  {
    key: "automatico",
    model: "Toyota Corolla",
    transmission: "Automático",
    features: ["Caja automática", "GNC", "Aire acondicionado", "Baúl amplio"],
    photos: [imgPle625, imgOmb591, imgAb956ys],
  },
  {
    key: "manual",
    model: "Toyota Corolla",
    transmission: "Manual",
    features: ["Caja manual", "GNC", "Aire acondicionado", "Baúl amplio"],
    photos: [imgAb773ym, imgAa865tl, imgNyo037],
  },
];

const FLEET_NOTE = "Las fotos son de referencia. La unidad se asigna según disponibilidad al momento de la entrega.";

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

const LogoutIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

/* Íconos de las áreas, dibujados con el lenguaje del logo:
   formas macizas, cortes en diagonal, una curva redonda y puntitos. */
const RentalsIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M1.5 17.5 V12.6 L5 11.6 L9 6.5 H15.2 L19.6 11.4 L22.5 12.4 V17.5 H20.5 A3.1 3.1 0 0 0 14.3 17.5 H9.7 A3.1 3.1 0 0 0 3.5 17.5 Z M9.9 8.6 L7.6 11.5 H11.6 V8.6 Z M13.4 8.6 V11.5 H17.2 L14.5 8.6 Z M4.4 17.7 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M5.75 17.7 a0.85 0.85 0 1 0 1.7 0 a0.85 0.85 0 1 0 -1.7 0 Z M15.2 17.7 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M16.55 17.7 a0.85 0.85 0 1 0 1.7 0 a0.85 0.85 0 1 0 -1.7 0 Z" />
  </svg>
);

const FletesIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M1.5 5.5 H13.8 V17.5 H8.9 A3.1 3.1 0 0 0 2.7 17.5 H1.5 Z M15.2 8.5 H19.2 L22.5 11.8 V17.5 H21.5 A3.1 3.1 0 0 0 15.3 17.5 H15.2 Z M17 10.4 V12.6 H20.6 L18.4 10.4 Z M3.6 17.7 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M4.95 17.7 a0.85 0.85 0 1 0 1.7 0 a0.85 0.85 0 1 0 -1.7 0 Z M16.2 17.7 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M17.55 17.7 a0.85 0.85 0 1 0 1.7 0 a0.85 0.85 0 1 0 -1.7 0 Z" />
  </svg>
);

/* Gancho de remolque: recuerda a la "P" del logo */
const AuxiliosIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <g transform="translate(-1.4 0.9) scale(0.92)">
      <mask id="kp-hook-mask">
        <rect x="-6" y="-6" width="40" height="40" fill="#fff" />
        <circle cx="13.2" cy="4.5" r="0.95" fill="#000" />
        <circle cx="4.94" cy="16.25" r="0.85" fill="#000" />
      </mask>
      <path mask="url(#kp-hook-mask)" stroke="currentColor" strokeWidth="3.4" strokeLinecap="butt" d="M13.2 2 V9.6 a5.6 5.6 0 1 1 -8.6 4.7" />
    </g>
  </svg>
);

const UserIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ProfileAvatar = ({ user, size = 160 }) => {
  // Guardamos qué foto falló: si llega otra distinta, se vuelve a intentar sola
  const [brokenFoto, setBrokenFoto] = useState(null);
  const foto = user?.foto || null;
  const broken = brokenFoto === foto;
  const initials = ((user?.nombre?.[0] || "") + (user?.apellido?.[0] || "")).toUpperCase() || "?";
  const fontSize = Math.round(size * 0.3);

  if (foto && !broken) {
    return (
      <img
        src={foto}
        alt="Foto de perfil"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={() => setBrokenFoto(foto)}
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
/* Dirección (URL) de cada sección */
const pagePaths = {
  home: "/",
  catalog: "/flota",
  apply: "/quiero-manejar",
  login: "/conductores",
  "change-password": "/cambiar-contrasena",
  dashboard: "/panel/inicio",
  turnos: "/turnos",
  fletes: "/fletes",
  auxilios: "/auxilios",
};
const pathPages = {
  ...Object.fromEntries(Object.entries(pagePaths).map(([p, path]) => [path, p])),
  // Las pestañas del panel son todas la sección "dashboard"
  "/panel": "dashboard",
  "/panel/perfil": "dashboard",
  "/panel/turnos": "dashboard",
  "/panel/multas": "dashboard",
};

const pageTitles = {
  home: "KPCars — Alquiler de autos para conductores en Buenos Aires",
  catalog: "Flota — KPCars",
  apply: "Quiero manejar — KPCars",
  login: "Zona Conductores — KPCars",
  "change-password": "Cambiar contraseña — KPCars",
  dashboard: "Mi Panel — KPCars",
  turnos: "Solicitar turno — KPCars",
  fletes: "KPCars Fletes — Próximamente",
  auxilios: "KPCars Auxilios — Próximamente",
};

/* Áreas de KPCars. Rentals es la principal (es el inicio); las demás están en preparación. */
const areas = [
  { key: "rentals", name: "KPCars Rentals", Icon: RentalsIcon, desc: "Alquiler de vehículos Toyota para trabajar en aplicaciones o de forma particular.", page: "catalog", cta: "Ver flota →" },
  { key: "fletes", name: "KPCars Fletes", Icon: FletesIcon, page: "fletes", soon: true },
  { key: "auxilios", name: "KPCars Auxilios", Icon: AuxiliosIcon, page: "auxilios", soon: true },
];

export default function KPCarsApp() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  // "/flota/" y "/flota" son la misma sección
  const currentPath = location.pathname.replace(/\/+$/, "") || "/";
  const page = pathPages[currentPath] || "home";

  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem("kpcars_user"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("kpcars_token") || null);

  // Cada vez que cambia la dirección (también con el botón "Atrás"): título y scroll arriba
  useEffect(() => {
    document.title = pageTitles[pathPages[currentPath]] || "KPCars";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPath]);

  // Las secciones con clase "reveal" aparecen suavemente al llegar a ellas.
  // Solo se ocultan las que están debajo de la pantalla; si algo falla, quedan visibles.
  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = [...document.querySelectorAll(".reveal")].filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.9);
    els.forEach((el) => el.classList.add("reveal-wait"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.remove("reveal-wait");
        e.target.classList.add("reveal-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -60px 0px" });
    els.forEach((el) => io.observe(el));
    return () => { io.disconnect(); els.forEach((el) => el.classList.remove("reveal-wait")); };
  }, [currentPath]);

  const navigate = (p) => {
    const path = pagePaths[p] || "/";
    setMenuOpen(false);
    if (path === currentPath) window.scrollTo({ top: 0, behavior: "smooth" });
    else routerNavigate(path);
  };

  // Después de iniciar sesión: volver a la página privada que se quiso abrir, o al panel
  const goAfterLogin = () => routerNavigate(location.state?.from || pagePaths.dashboard, { replace: true });

  // Función auxiliar para hacer requests autenticados a la API
  const apiFetch = async (endpoint, options = {}) => {
    const currentToken = token || localStorage.getItem("kpcars_token");
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Accept": "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(currentToken ? { "Authorization": `Bearer ${currentToken}` } : {}),
        ...(options.headers || {}),
      },
    });
    if (res.status === 401) {
      setUser(null);
      setToken(null);
      localStorage.removeItem("kpcars_user");
      localStorage.removeItem("kpcars_token");
      // Guarda dónde estaba, para volver ahí al iniciar sesión de nuevo.
      // Varios pedidos pueden dar 401 a la vez: solo el primero navega, así no se pisa el "from".
      if (window.location.pathname !== pagePaths.login) {
        routerNavigate(pagePaths.login, { state: { from: window.location.pathname } });
      }
      throw new Error("Sesión expirada. Inicia sesión de nuevo.");
    }
    if (res.status === 403) {
      const currentUser = JSON.parse(localStorage.getItem("kpcars_user") || "null");
      if (currentUser?.mustChangePassword) {
        navigate("change-password");
        throw new Error("Debes cambiar tu contraseña primero.");
      }
      throw new Error("No tienes permiso para realizar esta acción.");
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
      } catch { /* si la respuesta no es JSON, seguimos con lo que ya tenemos */ }

      let historialData = null;
      try { historialData = historialRes && historialRes.ok ? await historialRes.json() : null; } catch { /* sin historial: queda en null */ }

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
        variant: h.vehiculo.variante || "",
        year: String(h.vehiculo.anio || ""),
        patente: h.vehiculo.patente || "",
        desde: h.fecha_inicio ? new Date(h.fecha_inicio).toLocaleDateString("es-AR") : "",
        hasta: h.fecha_fin ? new Date(h.fecha_fin).toLocaleDateString("es-AR") : null,
        transmission: h.vehiculo.transmision || "",
      } : null;

      const userData = {
        nombre,
        apellido,
        dni: pick("dni", "documento", "document_number"),
        telefono: pick("telefono", "phone", "tel", "celular", "mobile"),
        email: pick("correo", "email", "mail"),
        licenciaVencimiento: pick("fecha_vencimiento_licencia", "licenciaVencimiento", "licencia_vencimiento", "license_expiry", "vencimiento_licencia"),
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
        goAfterLogin();
      }
    } catch {
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
        goAfterLogin();
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
      } catch { /* si la respuesta no es JSON, seguimos con lo que ya tenemos */ }

      let historialData = null;
      try { historialData = historialRes && historialRes.ok ? await historialRes.json() : null; } catch { /* sin historial: queda en null */ }

      const pick = (...keys) => { for (const k of keys) { if (meProfile[k]) return meProfile[k]; } return ""; };
      const fullName = pick("name", "nombre", "nombres");
      const spaceIdx = fullName.indexOf(" ");
      const nombre = spaceIdx > 0 ? fullName.slice(0, spaceIdx) : (user.nombre || fullName);
      const apellido = spaceIdx > 0 ? fullName.slice(spaceIdx + 1) : (user.apellido || pick("apellido", "last_name", "apellidos", "surname"));

      const historialList = historialData?.historial || [];
      const asignacionActual = historialList.find((h) => h.fecha_fin === null);
      const asignacionesAnteriores = historialList.filter((h) => h.fecha_fin !== null);
      const mapVehiculo = (h) => h.vehiculo ? {
        model: `${h.vehiculo.marca} ${h.vehiculo.modelo}`, variant: h.vehiculo.variante || "", year: String(h.vehiculo.anio || ""),
        patente: h.vehiculo.patente || "",
        desde: h.fecha_inicio ? new Date(h.fecha_inicio).toLocaleDateString("es-AR") : "",
        hasta: h.fecha_fin ? new Date(h.fecha_fin).toLocaleDateString("es-AR") : null,
        transmission: h.vehiculo.transmision || "",
      } : null;

      const updated = {
        ...user,
        nombre,
        apellido,
        dni: pick("dni", "documento", "document_number") || user.dni,
        telefono: pick("telefono", "phone", "tel", "celular", "mobile") || user.telefono,
        email: pick("correo", "email", "mail") || user.email,
        licenciaVencimiento: pick("fecha_vencimiento_licencia", "licenciaVencimiento", "licencia_vencimiento", "license_expiry") || user.licenciaVencimiento,
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
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { background: ${theme.black}; min-height: 100%; }
        #root { min-height: 100vh; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .anim-in { animation: fadeUp 0.65s ease-out forwards; }
        .reveal-wait { opacity: 0; transform: translateY(26px); }
        .reveal-in { animation: fadeUp 0.6s ease-out both; }
        .kp-btn { transition: transform 0.15s, filter 0.15s; }
        .kp-btn:hover { transform: translateY(-1px); filter: brightness(1.1); }
        .kp-btn:active { transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) { .anim-in, .reveal-in { animation: none !important; opacity: 1 !important; } }
        .d1 { animation-delay: 0.08s; opacity: 0; }
        .d2 { animation-delay: 0.16s; opacity: 0; }
        .d3 { animation-delay: 0.24s; opacity: 0; }
        @keyframes shimmer { from { background-position: -200% center; } to { background-position: 200% center; } }
        .skel { background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%); background-size: 200% auto; animation: shimmer 1.6s linear infinite; display: block; border-radius: 6px; }
        @keyframes ci { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .ci { animation: ci 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .ci-2 { animation-delay: 0.12s; }
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

      <Routes>
        <Route path="/" element={<HomePage navigate={navigate} user={user} />} />
        <Route path="/flota" element={<CatalogPage navigate={navigate} user={user} />} />
        <Route path="/quiero-manejar" element={<ApplyPage />} />
        <Route path="/conductores" element={user ? <Navigate to={location.state?.from || pagePaths.dashboard} replace /> : <LoginPage onLogin={handleLogin} />} />
        {/* Páginas privadas: sin sesión, van a Zona Conductores (ver <Private>) */}
        <Route path="/cambiar-contrasena" element={<Private user={user}><ChangePasswordPage user={user} token={token} onComplete={handlePasswordChanged} /></Private>} />
        <Route path="/panel" element={<Navigate to={pagePaths.dashboard} replace />} />
        {["inicio", "turnos", "multas", "perfil"].map((tab) => (
          <Route key={tab} path={`/panel/${tab}`} element={<Private user={user}><DashboardPage tab={tab} user={user} navigate={navigate} apiFetch={apiFetch} onUserUpdate={(updated) => { setUser(updated); localStorage.setItem("kpcars_user", JSON.stringify(updated)); }} /></Private>} />
        ))}
        <Route path="/turnos" element={<Private user={user}><TurnosPage user={user} apiFetch={apiFetch} /></Private>} />
        {areas.filter((a) => a.soon).map((a) => (
          <Route key={a.key} path={pagePaths[a.page]} element={<ComingSoonPage area={a} navigate={navigate} />} />
        ))}
        {/* Dirección desconocida: al inicio (la página 404 llega en la Etapa 3) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!["dashboard", "turnos", "change-password"].includes(page) && <Footer navigate={navigate} user={user} />}

      <WhatsAppButton user={user} />
    </div>
  );
}

/* Página privada: sin sesión manda a Zona Conductores y recuerda a dónde se quería entrar */
function Private({ user, children }) {
  const location = useLocation();
  return user ? children : <Navigate to={pagePaths.login} replace state={{ from: location.pathname }} />;
}

/* ─────────────────────────────────────────────
   NAV
   ───────────────────────────────────────────── */
function Nav({ page, navigate, menuOpen, setMenuOpen, user, onLogout }) {
  // Al bajar, el menú se achica un poco para dejar más lugar al contenido
  const [scrolled, setScrolled] = useState(() => window.scrollY > 24);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const navH = scrolled ? 54 : 64;

  const s = {
    nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,10,10,0.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
    inner: { maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: navH, transition: "height 0.2s ease", display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo: { fontFamily: "'Archivo Black', sans-serif", fontSize: "1.5rem", letterSpacing: -0.5, cursor: "pointer", display: "flex", gap: 2, textDecoration: "none", color: theme.white },
    link: (active) => ({ color: active ? theme.white : theme.gray300, textDecoration: "none", fontSize: "0.88rem", fontWeight: 500, padding: "8px 14px", borderRadius: 8, background: active ? "rgba(255,255,255,0.06)" : "transparent", cursor: "pointer", display: "block" }),
    cta: { background: theme.orange, color: theme.black, fontWeight: 700, padding: "8px 16px", borderRadius: 8, fontSize: "0.88rem", cursor: "pointer", textDecoration: "none", display: "block", textAlign: "center" },
    loginBtn: { background: "none", border: "1px solid rgba(255,255,255,0.15)", color: theme.gray300, fontWeight: 500, padding: "8px 14px", borderRadius: 8, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" },
    mobileBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6, padding: "12px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, color: theme.white, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" },
    hamburger: { background: "none", border: "none", cursor: "pointer", padding: 4, display: "none" },
    mobileLinks: { position: "absolute", top: navH, left: 0, right: 0, background: "rgba(10,10,10,0.98)", backdropFilter: "blur(20px)", padding: "12px 20px 16px", display: "flex", flexDirection: "column", gap: 4, borderBottom: "1px solid rgba(255,255,255,0.06)" },
  };

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        <img src={kpLogo} alt="KPCars" onClick={() => navigate("home")} style={{ height: scrolled ? 44 : 52, transition: "height 0.2s ease", cursor: "pointer" }} />

        {/* Desktop links */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }} className="desktop-nav">
          <a style={s.link(page === "home")} onClick={() => navigate("home")}>Inicio</a>
          {areas.map((a) => (
            <a key={a.key} style={s.link(page === a.page)} onClick={() => navigate(a.page)}>{a.name.replace("KPCars ", "")}</a>
          ))}
          {!user && <a style={s.cta} onClick={() => navigate("apply")}>Quiero manejar</a>}
          {user ? (
            <>
              <a style={s.link(page === "dashboard")} onClick={() => navigate("dashboard")}>Mi Panel</a>
              <a style={s.link(page === "turnos")} onClick={() => navigate("turnos")}>Solicitar turno</a>
              <button style={s.loginBtn} onClick={onLogout}>
                <LogoutIcon size={15} /> Cerrar sesión
              </button>
            </>
          ) : (
            <button style={s.loginBtn} onClick={() => navigate("login")}>
              <UserIcon size={15} /> Zona Conductores
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button style={s.hamburger} className="mobile-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, top: navH, zIndex: 98 }} />
          <div style={{ ...s.mobileLinks, zIndex: 99, position: "absolute" }}>
            <a style={s.link(page === "home")} onClick={() => navigate("home")}>Inicio</a>
            {areas.map((a) => (
            <a key={a.key} style={s.link(page === a.page)} onClick={() => navigate(a.page)}>{a.name.replace("KPCars ", "")}</a>
          ))}
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" }} />
            {user ? (
              <>
                <a style={s.link(page === "dashboard")} onClick={() => navigate("dashboard")}>Mi Panel</a>
                <a style={s.link(page === "turnos")} onClick={() => navigate("turnos")}>Solicitar turno</a>
                <a onClick={onLogout} style={s.mobileBtn}>
                  <LogoutIcon size={16} /> Cerrar sesión
                </a>
              </>
            ) : (
              <>
                <a style={{ ...s.cta, textAlign: "center", padding: "12px 16px" }} onClick={() => navigate("apply")}>Quiero manejar</a>
                <a onClick={() => navigate("login")} style={s.mobileBtn}>
                  <UserIcon size={16} /> Zona Conductores
                </a>
              </>
            )}
          </div>
        </>
      )}

      <style>{`
        @media (min-width: 901px) { .mobile-hamburger { display: none !important; } }
        @media (max-width: 900px) { .desktop-nav { display: none !important; } .mobile-hamburger { display: flex !important; } }
      `}</style>
    </nav>
  );
}

/* ─────────────────────────────────────────────
   HOME PAGE
   ───────────────────────────────────────────── */
function HomePage({ navigate, user }) {
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

function SoonBadge() {
  return <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: theme.orange, background: "rgba(235,136,0,0.1)", border: "1px solid rgba(235,136,0,0.25)", borderRadius: 100, padding: "4px 10px", whiteSpace: "nowrap" }}>Próximamente</span>;
}

/* ─────────────────────────────────────────────
   ÁREA EN PREPARACIÓN (Fletes, Auxilios)
   ───────────────────────────────────────────── */
function ComingSoonPage({ area, navigate }) {
  const waText = encodeURIComponent(`Hola, quiero consultar por ${area.name}.`);
  return (
    <div style={{ minHeight: "78vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "130px 20px 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(235,136,0,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div className="anim-in" style={{ textAlign: "center", maxWidth: 560, position: "relative" }}>
        <div style={{ width: 64, height: 64, margin: "0 auto 24px", background: "rgba(235,136,0,0.1)", border: "1px solid rgba(235,136,0,0.25)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: theme.orange }}><area.Icon size={38} /></div>
        <SectionLabel>{area.name}</SectionLabel>
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(2.2rem, 8vw, 4rem)", letterSpacing: -2, lineHeight: 1.05, marginBottom: 18 }}>
          Próxima<span style={{ color: theme.orange }}>mente…</span>
        </h1>
        <p style={{ fontSize: "1rem", color: theme.gray300, lineHeight: 1.65, marginBottom: 32 }}>
          Estamos preparando esta área. Mientras tanto, puedes consultarnos por WhatsApp.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a className="kp-btn" href={`https://wa.me/${WHATSAPP_PUBLIC}?text=${waText}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 12, fontSize: "0.92rem", fontWeight: 700, textDecoration: "none", background: theme.orange, color: theme.black }}>Consultar por WhatsApp</a>
          <Btn variant="secondary" onClick={() => navigate("home")}>Volver al inicio</Btn>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FLOTA — cómo son los autos (por tipo, no por unidad)
   ───────────────────────────────────────────── */
function CatalogPage({ navigate, user }) {
  const [lightbox, setLightbox] = useState(null);

  return (
    <div>
      <style>{`
        .fleet-types { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .fleet-info { display: grid; grid-template-columns: auto 1fr; gap: 0; }
        .fleet-info > div + div { border-left: 1px solid rgba(255,255,255,0.07); }
        .fleet-thumb { transition: border-color 0.15s, opacity 0.15s; }
        .fleet-thumb:hover { opacity: 1 !important; }
        @media (max-width: 820px) {
          .fleet-types { grid-template-columns: 1fr; }
          .fleet-info { grid-template-columns: 1fr; }
          .fleet-info > div + div { border-left: none; border-top: 1px solid rgba(255,255,255,0.07); }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "110px 20px 0" }}>
        <SectionLabel>Nuestra flota</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
          <SectionTitle>Flota Toyota</SectionTitle>
          <img src={toyotaLogo} alt="Toyota" style={{ height: 28, opacity: 0.7 }} />
        </div>
        <p style={{ fontSize: "1rem", color: theme.gray400, maxWidth: 560, lineHeight: 1.6, marginBottom: 28 }}>
          Así son los Toyota Corolla de nuestra flota: habilitados para trabajar en aplicaciones de transporte y particular en Buenos Aires. Todos con GNC, aire acondicionado y baúl amplio.
        </p>

        {/* Precio (una sola vez) + aviso de fotos de referencia */}
        <div className="fleet-info" style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, marginBottom: 20 }}>
          <div style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: theme.gray400, marginBottom: 6 }}>Alquiler semanal</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.6rem", color: theme.orange }}>${PRICE_WEEKLY}</span>
              <span style={{ fontSize: "0.8rem", color: theme.gray400 }}>ARS</span>
            </div>
          </div>
          <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ color: theme.orange, flexShrink: 0, display: "flex" }}><AlertIcon size={20} /></div>
            <p style={{ fontSize: "0.9rem", color: theme.gray300, lineHeight: 1.55 }}>{FLEET_NOTE}</p>
          </div>
        </div>
      </div>

      <div className="fleet-types" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 60px" }}>
        {fleetTypes.map((type) => (
          <FleetTypeCard key={type.key} type={type} onZoom={setLightbox} onApply={user ? null : () => navigate("apply")} />
        ))}
      </div>

      {/* Foto ampliada */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out", padding: 20 }}>
          <img src={lightbox} alt="Foto ampliada" style={{ maxWidth: "95%", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }} />
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: 40, height: 40, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><CloseIcon size={18} /></button>
        </div>
      )}

      {!user && <CTABanner navigate={navigate} />}
    </div>
  );
}

/* Tarjeta de un tipo de vehículo, con sus fotos de ejemplo */
function FleetTypeCard({ type, onZoom, onApply }) {
  const [current, setCurrent] = useState(0);
  const name = `${type.model} ${type.transmission}`;

  return (
    <div style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div onClick={() => onZoom(type.photos[current])} style={{ width: "100%", aspectRatio: "16/10", background: `linear-gradient(135deg, ${theme.gray800}, ${theme.gray700})`, position: "relative", overflow: "hidden", cursor: "zoom-in" }}>
        <img src={type.photos[current]} alt={`${name}, foto de referencia`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: `linear-gradient(to top, ${theme.gray900}, transparent)`, pointerEvents: "none" }} />
        <span style={{ position: "absolute", top: 12, left: 12, fontSize: "0.66rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: theme.gray200, background: "rgba(10,10,10,0.72)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 100, padding: "4px 10px" }}>Foto de referencia</span>
      </div>

      <div style={{ padding: 22, display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Miniaturas */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {type.photos.map((photo, i) => (
            <button key={i} className="fleet-thumb" aria-label={`Ver foto ${i + 1} de ${name}`} onClick={() => setCurrent(i)} style={{ width: 64, height: 46, padding: 0, borderRadius: 8, overflow: "hidden", cursor: "pointer", background: theme.gray800, border: i === current ? `2px solid ${theme.orange}` : "2px solid transparent", opacity: i === current ? 1 : 0.6 }}>
              <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>

        <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: theme.orange, marginBottom: 4 }}>{type.transmission}</div>
        <h3 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.3rem", letterSpacing: -0.5, marginBottom: 14 }}>{type.model}</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: onApply ? 22 : 0, flex: 1, alignContent: "flex-start" }}>
          {type.features.map((f) => (
            <span key={f} style={{ fontSize: "0.74rem", color: theme.gray300, background: "rgba(255,255,255,0.05)", padding: "5px 12px", borderRadius: 100, fontWeight: 500 }}>{f}</span>
          ))}
        </div>
        {onApply && <div><Btn onClick={onApply}>Quiero manejar →</Btn></div>}
      </div>
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
  const passwordRef = useRef();

  const inputStyle = { width: "100%", padding: "14px 16px", background: theme.gray800, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem" };

  const handleSubmit = async () => {
    if (!dni || !password) {
      setError("Ingresa tu DNI y contraseña.");
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

    } catch {
      setError("Error de conexión. Verifica tu internet e intenta de nuevo.");
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
          <p style={{ color: theme.gray400, fontSize: "0.9rem" }}>Ingresa con tu DNI y contraseña</p>
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
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); passwordRef.current?.focus(); } }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: 7, color: theme.gray200 }}>Contraseña <span style={{ color: theme.orange }}>*</span></label>
            <div style={{ position: "relative" }}>
              <input
                ref={passwordRef}
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
            <div style={{ background: "rgba(235,136,0,0.08)", border: "1px solid rgba(235,136,0,0.2)", borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: "0.85rem", color: theme.gray200, lineHeight: 1.6, marginBottom: 12 }}>
                Para recuperar tu contraseña, comunícate con la central de KPCars:
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_DRIVERS}?text=Hola%2C%20necesito%20recuperar%20mi%20contrase%C3%B1a`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 16px", background: "#25D366", border: "none", borderRadius: 8, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", textDecoration: "none" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Escribir por WhatsApp
              </a>
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

/* ── Banner de vencimientos próximos ── */
function VencimientosBanner({ user }) {
  const alerts = [];

  if (user.licenciaVencimiento) {
    const exp = new Date(user.licenciaVencimiento + "T12:00:00");
    const days = Math.ceil((exp - new Date()) / 86400000);
    if (days <= 30) alerts.push({ label: "Licencia de conducir", days });
  }

  if (alerts.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
      {alerts.map((a, i) => {
        const urgent = a.days <= 7;
        const expired = a.days <= 0;
        const color = urgent ? "#ff5252" : theme.orange;
        const bg    = urgent ? "rgba(255,82,82,0.08)"   : "rgba(235,136,0,0.08)";
        const bdr   = urgent ? "rgba(255,82,82,0.22)"   : "rgba(235,136,0,0.22)";
        return (
          <div key={i} className="anim-in" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", background: bg, border: `1px solid ${bdr}`, borderRadius: 14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p style={{ fontSize: "0.83rem", fontWeight: 600, color, margin: 0 }}>
              {expired
                ? `Tu ${a.label} está vencida.`
                : `Tu ${a.label} vence en ${a.days} día${a.days !== 1 ? "s" : ""}.`}
              <span style={{ fontWeight: 400, color: theme.gray400, marginLeft: 6 }}>
                {expired ? "Renovarla lo antes posible." : "Recuerda renovarla a tiempo."}
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DASHBOARD PAGE (PANEL DEL CONDUCTOR)
   ───────────────────────────────────────────── */
/* ── Ayudas del panel: fechas, plata y textos ── */
const pad2 = (n) => String(n).padStart(2, "0");
// Fecha local como "AAAA-MM-DD" (por defecto, hoy)
const localDateStr = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
// "2026-10-06" → "Martes 6 de octubre" (o "Hoy" / "Mañana")
const dayLabel = (dateStr) => {
  if (!dateStr) return "—";
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === localDateStr()) return "Hoy";
  if (dateStr === localDateStr(tomorrow)) return "Mañana";
  return capitalize(new Date(dateStr + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }));
};
// "2026-10-06" → "06/10/2026"
const shortDate = (dateStr) => dateStr ? new Date(dateStr.split("T")[0] + "T12:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
// Días que faltan para una fecha (negativo si ya pasó)
const daysUntil = (dateStr) => Math.round((new Date(dateStr.split("T")[0] + "T12:00:00") - new Date(localDateStr() + "T12:00:00")) / 86400000);
// 71249.25 → "$71.249,25"
const fmtMoney = (n) => "$" + Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// "EXC DE VELOCIDAD" → "Exc de velocidad"
const sentenceCase = (s) => capitalize(String(s || "").trim().toLowerCase()) || "—";
// "AB123CD" → "AB 123 CD"
const fmtPatente = (patente) => {
  if (!patente) return "—";
  const clean = patente.toUpperCase().replace(/[\s-]/g, "");
  if (clean.length === 7) return `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5)}`;
  if (clean.length === 6) return `${clean.slice(0, 3)} ${clean.slice(3)}`;
  return patente.toUpperCase();
};

const turnoDay = (t) => t.scheduled_date?.split("T")[0] ?? "";
// Un turno "próximo" es de hoy en adelante y no está cancelado ni terminado
const isTurnoProximo = (t) => turnoDay(t) >= localDateStr() && t.status !== "cancelado" && t.status !== "completado";

// Trae todos los turnos del conductor (la API los entrega de a páginas)
const fetchAllTurnos = async (apiFetch) => {
  let page = 1;
  let all = [];
  while (true) {
    const res = await apiFetch(`/mis-turnos?page=${page}`);
    const data = await res.json();
    const items = data.data || [];
    all = [...all, ...items];
    if (page >= (data.last_page || 1) || items.length === 0) break;
    page++;
  }
  return all;
};

const driverWhatsAppHref = (message = "¡Hola! Soy conductor de KPCars y tengo una consulta.") =>
  `https://wa.me/${WHATSAPP_DRIVERS}?text=${encodeURIComponent(message)}`;

/* Estilos compartidos del panel: letra grande y botones cómodos para el celular */
const panel = {
  card: { background: theme.gray900, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 18 },
  h1: { fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(1.9rem, 8vw, 2.4rem)", letterSpacing: -0.5, lineHeight: 1.1, margin: 0 },
  h2: { fontSize: "0.9rem", fontWeight: 700, color: theme.gray300, margin: "12px 0 0" },
  muted: { fontSize: "0.95rem", color: theme.gray300, lineHeight: 1.45, margin: 0 },
  btn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", minHeight: 56, padding: "0 18px", borderRadius: 16, fontFamily: "'DM Sans', sans-serif", fontSize: "1.1rem", fontWeight: 700, cursor: "pointer", textDecoration: "none", boxSizing: "border-box" },
  chip: (color, bg) => ({ display: "inline-block", padding: "4px 10px", borderRadius: 999, background: bg, color, fontSize: "0.82rem", fontWeight: 700, whiteSpace: "nowrap" }),
};
panel.btnPrimary = { ...panel.btn, background: theme.orange, color: theme.black, border: "none" };
panel.btnOutline = { ...panel.btn, background: "transparent", color: theme.white, border: `2px solid ${theme.orange}` };
panel.btnQuiet = { ...panel.btn, minHeight: 48, fontSize: "1rem", borderRadius: 12, background: "transparent", color: theme.white, border: "1px solid rgba(255,255,255,0.28)" };
panel.btnText = { ...panel.btn, minHeight: 48, fontSize: "1rem", background: "transparent", color: theme.orange, border: "none" };

const turnoStatus = {
  agendado:   { label: "Agendado",   color: "#ffb347",     bg: "rgba(235,136,0,0.16)" },
  en_proceso: { label: "En proceso", color: "#7fd0ff",     bg: "rgba(41,182,246,0.14)" },
  completado: { label: "Completado", color: "#8fd9a8",     bg: "rgba(76,175,80,0.14)" },
  cancelado:  { label: "Cancelado",  color: theme.gray200, bg: "rgba(255,255,255,0.08)" },
};

const PlusIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const ChatIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#5fd38d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);
const ChevronIcon = ({ size = 20, dir = "right" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <polyline points={{ right: "9 18 15 12 9 6", left: "15 18 9 12 15 6", down: "6 9 12 15 18 9", up: "6 15 12 9 18 15" }[dir]} />
  </svg>
);
const panelNavIcons = {
  inicio: <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  turnos: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
  multas: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" /></>,
  perfil: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
};

/* Las secciones del panel, en el orden de la barra de abajo */
const panelTabs = [
  { key: "inicio", label: "Inicio" },
  { key: "turnos", label: "Turnos", title: "Mis turnos" },
  { key: "multas", label: "Multas", title: "Mis multas" },
  { key: "perfil", label: "Mis datos", title: "Mis datos" },
];

function DashboardPage({ tab, user, navigate, apiFetch, onUserUpdate }) {
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

/* ── Inicio: lo que el conductor necesita ver de un vistazo ── */
function InicioTab({ user, apiFetch, navigate, setTab }) {
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

/* ── Multas del conductor ── */
function MultasTab({ apiFetch }) {
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

/* ── Skeleton helper ── */
const Skel = ({ w = "100%", h = 14, r = 6, mb = 0 }) => (
  <span className="skel" style={{ width: w, height: h, borderRadius: r, marginBottom: mb || undefined, display: "block" }} />
);

/* ── Perfil del conductor ── */
function ProfileTab({ user, apiFetch, onUpdate }) {
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

/* ── Turnos del conductor ── */
function TurnosTab({ apiFetch, navigate }) {
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

/* ─────────────────────────────────────────────
   CHANGE PASSWORD PAGE (primer login)
   ───────────────────────────────────────────── */
function ChangePasswordPage({ token, onComplete }) {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputStyle = { width: "100%", padding: "14px 16px", background: theme.gray800, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: theme.white, fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem" };

  const handleChange = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      setError("Completa todos los campos.");
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
          current_password: currentPass,
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

    } catch {
      setError("Error de conexión. Intenta de nuevo.");
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
          <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.5rem", letterSpacing: -0.5, marginBottom: 6 }}>Cambia tu contraseña</h2>
          <p style={{ color: theme.gray400, fontSize: "0.9rem", lineHeight: 1.5 }}>
            Es tu primer inicio de sesión. Por seguridad,<br />elige una contraseña nueva.
          </p>
        </div>

        <div style={{ background: theme.gray900, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "clamp(24px, 5vw, 36px)" }}>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: 7, color: theme.gray200 }}>
              Contraseña actual <span style={{ color: theme.orange }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                style={{ ...inputStyle, paddingRight: 48 }}
                placeholder="Tu contraseña actual"
                onKeyDown={(e) => e.key === "Enter" && handleChange()}
              />
              <button onClick={() => setShowCurrent(!showCurrent)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: theme.gray400, cursor: "pointer", fontSize: "0.8rem", fontFamily: "'DM Sans', sans-serif" }}>
                {showCurrent ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

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
                onKeyDown={(e) => e.key === "Enter" && handleChange()}
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
                placeholder="Repite la contraseña"
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
/* Pedir turno, paso a paso: 1) qué le pasa al auto  2) qué día  3) revisar y confirmar.
   Un turno urgente no elige día: pasa directo del paso 1 al 3. */
const TURNO_DAYS_AHEAD = 60;   // hasta cuántos días para adelante se puede pedir
const TURNO_DAYS_PER_PAGE = 6; // cuántos días se muestran de entrada (y con cada "Ver más días")
const TURNO_MAX_PER_DAY = 4;   // con esta cantidad de turnos normales, el día queda sin lugar

function TurnosPage({ user, apiFetch }) {
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

/* ─────────────────────────────────────────────
   SHARED COMPONENTS
   ───────────────────────────────────────────── */
function Btn({ children, onClick, variant = "primary" }) {
  const base = { display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 12, fontSize: "0.92rem", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", textDecoration: "none", cursor: "pointer", border: "none" };
  const styles = variant === "primary"
    ? { ...base, background: theme.orange, color: theme.black }
    : { ...base, background: "rgba(255,255,255,0.06)", color: theme.white, border: "1px solid rgba(255,255,255,0.1)" };
  return <button className="kp-btn" style={styles} onClick={onClick}>{children}</button>;
}

/* Parte del título resaltada en naranja */
function Accent({ children }) {
  return <span style={{ color: theme.orange }}>{children}</span>;
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, color: theme.orange, marginBottom: 10 }}>{children}</div>;
}

function SectionTitle({ children }) {
  return <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(1.6rem, 5vw, 2.6rem)", letterSpacing: -1, marginBottom: 14, lineHeight: 1.1 }}>{children}</h2>;
}

/* Encabezado de sección: etiqueta + título a la izquierda, texto opcional a la derecha */
function SectionHeader({ label, title, children }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px 32px", marginBottom: 36 }}>
      <div>
        <SectionLabel>{label}</SectionLabel>
        <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(1.6rem, 5vw, 2.6rem)", letterSpacing: -1, lineHeight: 1.1 }}>{title}</h2>
      </div>
      {children && <p style={{ fontSize: "0.92rem", color: theme.gray400, maxWidth: 360, lineHeight: 1.65 }}>{children}</p>}
    </div>
  );
}

function CTABanner({ navigate }) {
  return (
    <div className="reveal" style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 20px 80px" }}>
      <div style={{ background: `linear-gradient(135deg, ${theme.orange}, #d47a00)`, borderRadius: 20, padding: "clamp(32px, 6vw, 56px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50%", right: "-20%", width: 400, height: 400, background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(1.4rem, 4vw, 2.2rem)", color: theme.black, marginBottom: 10, position: "relative" }}>¿Listo para empezar a generar?</h2>
        <p style={{ color: "rgba(0,0,0,0.7)", fontSize: "1rem", marginBottom: 24, position: "relative" }}>Completa el formulario y nos comunicamos contigo en menos de 24 horas.</p>
        <button className="kp-btn" onClick={() => navigate("apply")} style={{ background: theme.black, color: theme.white, padding: "13px 24px", borderRadius: 12, fontSize: "0.92rem", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", border: "none", cursor: "pointer", position: "relative" }}>Quiero ser conductor →</button>
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
        .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr; gap: 36px; padding: 52px 0 36px; }
        @media (max-width: 1000px) { .footer-grid { grid-template-columns: 1fr 1fr 1fr; } }
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
          {user
            ? <FooterLink onClick={() => navigate("dashboard")}>Mi Panel</FooterLink>
            : <FooterLink onClick={() => navigate("login")}>Zona Conductores</FooterLink>}
        </FooterCol>
        <FooterCol title="Servicios">
          {areas.map((a) => (
            <FooterLink key={a.key} onClick={() => navigate(a.page)}>{a.name}</FooterLink>
          ))}
        </FooterCol>
        <FooterCol title="Contacto">
          <FooterLink href={`tel:+${WHATSAPP_PUBLIC}`}>+54 9 11 6442-3273</FooterLink>
          <FooterLink href="mailto:info@kpcars.com.ar">info@kpcars.com.ar</FooterLink>
          <FooterLink href={`https://wa.me/${WHATSAPP_PUBLIC}`} external>WhatsApp</FooterLink>
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
function WhatsAppButton({ user }) {
  // Con sesión iniciada es un conductor: va a la central. Sin sesión: va al número de consultas.
  // wa.me es la URL oficial de WhatsApp: en mobile abre la app, en desktop abre WhatsApp Web.
  const phone = user ? WHATSAPP_DRIVERS : WHATSAPP_PUBLIC;
  const message = user ? "¡Hola! Soy conductor de KPCars y tengo una consulta." : "¡Hola! Me interesa alquilar un auto con KPCars.";
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  // En el panel del conductor, en el celular hay una barra fija abajo: el botón sube para no taparla
  const inPanel = useLocation().pathname.startsWith("/panel");

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
        @media (max-width: 767px) { .wa-in-panel { bottom: 96px !important; } }
      `}</style>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className={inPanel ? "wa-float wa-in-panel" : "wa-float"}
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
