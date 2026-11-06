import logoKpCars from "./assets/kpcars-logo-blanco.png";
import logoCargas from "./assets/logos/kp-cargas.svg";
import logoFlete from "./assets/logos/kp-flete.svg";
import logoAuxilio from "./assets/logos/kp-auxilio.svg";

/* Dirección (URL) de cada sección */
export const pagePaths = {
  home: "/",
  catalog: "/flota",
  apply: "/quiero-manejar",
  login: "/conductores",
  "change-password": "/cambiar-contrasena",
  dashboard: "/panel/inicio",
  turnos: "/turnos",
  cargas: "/cargas",
  fletes: "/fletes",
  auxilios: "/auxilios",
};

export const pathPages = {
  ...Object.fromEntries(Object.entries(pagePaths).map(([p, path]) => [path, p])),
  // Las pestañas del panel son todas la sección "dashboard"
  "/panel": "dashboard",
  "/panel/perfil": "dashboard",
  "/panel/turnos": "dashboard",
  "/panel/multas": "dashboard",
};

export const pageTitles = {
  home: "KPCars — Alquiler de autos para conductores en Buenos Aires",
  catalog: "Flota — KPCars",
  apply: "Quiero manejar — KPCars",
  login: "Zona Conductores — KPCars",
  "change-password": "Cambiar contraseña — KPCars",
  dashboard: "Mi Panel — KPCars",
  turnos: "Solicitar turno — KPCars",
  cargas: "KP Cargas — Fletes, auxilios y más",
  fletes: "Fletes — KP Cargas · Próximamente",
  auxilios: "Auxilios — KP Cargas · Próximamente",
  "not-found": "Página no encontrada — KPCars",
};

/* Descripción de cada sección: es el texto que Google muestra debajo del título */
const DEFAULT_DESCRIPTION = "Alquila un Toyota y trabaja en Uber, Didi, Cabify o particular. Flota 100% Toyota con taller propio, papeles al día y alquiler semanal en Buenos Aires.";
export const pageDescriptions = {
  home: DEFAULT_DESCRIPTION,
  catalog: "Conoce la flota de KPCars: Toyota Corolla 2015 en adelante, automáticos y manuales, con GNC y aire acondicionado. Alquiler semanal en Buenos Aires.",
  apply: "Completa el formulario para manejar con KPCars. Te contactamos para coordinar una entrevista y la entrega del auto.",
  login: "Zona Conductores de KPCars: ingresa con tu DNI para ver tus turnos, tus multas y tus datos.",
  cargas: "KP Cargas reúne los servicios de transporte de KPCars: fletes, auxilios y más. Próximamente.",
  fletes: "Fletes de KP Cargas, próximamente. Mientras tanto, consúltanos por WhatsApp.",
  auxilios: "Auxilios de KP Cargas, próximamente. Mientras tanto, consúltanos por WhatsApp.",
};
export const getPageDescription = (page) => pageDescriptions[page] || DEFAULT_DESCRIPTION;

/* Secciones que no deben aparecer en buscadores: las privadas y la de "no encontrada" */
export const noIndexPages = ["dashboard", "turnos", "change-password", "not-found"];

/* Las dos áreas de KPCars, en el menú y en el inicio.
   Rentals es la principal. KP Cargas agrupa los servicios de transporte (fletes, auxilios y los que vengan).
   activeOn: secciones en las que esta área se marca como la actual en el menú. */
export const areas = [
  { key: "rentals", name: "KPCars Rentals", short: "Rentals", logo: logoKpCars, desc: "Alquiler de vehículos Toyota para trabajar en aplicaciones o de forma particular.", page: "catalog", cta: "Ver flota →", activeOn: ["catalog"] },
  { key: "cargas", name: "KP Cargas", short: "Cargas", logo: logoCargas, desc: "Fletes, auxilios y más servicios de transporte.", page: "cargas", cta: "Ver servicios →", soon: true, activeOn: ["cargas", "fletes", "auxilios"] },
];

/* Servicios de KP Cargas. Para sumar uno: agregarlo acá, con su dirección en pagePaths y su título y descripción arriba. */
export const cargasServices = [
  { key: "fletes", name: "Fletes", logo: logoFlete, page: "fletes" },
  { key: "auxilios", name: "Auxilios", logo: logoAuxilio, page: "auxilios" },
];
