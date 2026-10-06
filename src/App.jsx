import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router";
import { API_BASE, SITE_URL } from "./config.js";
import { theme } from "./theme.js";
import { pagePaths, pathPages, pageTitles, getPageDescription, noIndexPages, areas } from "./routes.js";
import { toAbsoluteUrl } from "./utils/format.js";
import { Nav } from "./components/Nav.jsx";
import { Footer } from "./components/Footer.jsx";
import { WhatsAppButton } from "./components/WhatsAppButton.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { ComingSoonPage } from "./pages/ComingSoonPage.jsx";
import { CatalogPage } from "./pages/CatalogPage.jsx";
import { ApplyPage } from "./pages/ApplyPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { ChangePasswordPage } from "./pages/ChangePasswordPage.jsx";
import { TurnosPage } from "./pages/TurnosPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { DashboardPage } from "./panel/DashboardPage.jsx";

export default function KPCarsApp() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  // "/flota/" y "/flota" son la misma sección
  const currentPath = location.pathname.replace(/\/+$/, "") || "/";
  const page = pathPages[currentPath] || "not-found";

  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem("kpcars_user"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("kpcars_token") || null);

  // Cada vez que cambia la dirección (también con el botón "Atrás"): título y scroll arriba
  useEffect(() => {
    document.title = pageTitles[page] || "KPCars";
    // Descripción propia de la sección (el texto que Google muestra debajo del título)
    document.querySelector('meta[name="description"]')?.setAttribute("content", getPageDescription(page));
    // Las secciones privadas y la de "no encontrada" piden no aparecer en buscadores
    let robots = document.querySelector('meta[name="robots"]');
    if (noIndexPages.includes(page)) {
      if (!robots) {
        robots = document.createElement("meta");
        robots.name = "robots";
        document.head.appendChild(robots);
      }
      robots.content = "noindex";
    } else {
      robots?.remove();
    }
    // Le dice a Google cuál es la dirección oficial de esta sección (siempre sin www)
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = SITE_URL + (currentPath === "/" ? "/" : currentPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPath, page]);

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
        {/* Dirección desconocida: página de "no encontrada" */}
        <Route path="*" element={<NotFoundPage navigate={navigate} />} />
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
