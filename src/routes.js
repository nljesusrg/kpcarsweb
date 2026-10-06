import { RentalsIcon, FletesIcon, AuxiliosIcon } from "./components/Icons.jsx";

/* Dirección (URL) de cada sección */
export const pagePaths = {
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
  fletes: "KPCars Fletes — Próximamente",
  auxilios: "KPCars Auxilios — Próximamente",
  "not-found": "Página no encontrada — KPCars",
};

/* Descripción de cada sección: es el texto que Google muestra debajo del título */
const DEFAULT_DESCRIPTION = "Alquila un Toyota y trabaja en Uber, Didi, Cabify o particular. Flota 100% Toyota con taller propio, papeles al día y alquiler semanal en Buenos Aires.";
export const pageDescriptions = {
  home: DEFAULT_DESCRIPTION,
  catalog: "Conoce la flota de KPCars: Toyota Corolla 2015 en adelante, automáticos y manuales, con GNC y aire acondicionado. Alquiler semanal en Buenos Aires.",
  apply: "Completa el formulario para manejar con KPCars. Te contactamos para coordinar una entrevista y la entrega del auto.",
  login: "Zona Conductores de KPCars: ingresa con tu DNI para ver tus turnos, tus multas y tus datos.",
  fletes: "KPCars Fletes llega próximamente. Mientras tanto, consúltanos por WhatsApp.",
  auxilios: "KPCars Auxilios llega próximamente. Mientras tanto, consúltanos por WhatsApp.",
};
export const getPageDescription = (page) => pageDescriptions[page] || DEFAULT_DESCRIPTION;

/* Secciones que no deben aparecer en buscadores: las privadas y la de "no encontrada" */
export const noIndexPages = ["dashboard", "turnos", "change-password", "not-found"];

/* Áreas de KPCars. Rentals es la principal (es el inicio); las demás están en preparación. */
export const areas = [
  { key: "rentals", name: "KPCars Rentals", Icon: RentalsIcon, desc: "Alquiler de vehículos Toyota para trabajar en aplicaciones o de forma particular.", page: "catalog", cta: "Ver flota →" },
  { key: "fletes", name: "KPCars Fletes", Icon: FletesIcon, page: "fletes", soon: true },
  { key: "auxilios", name: "KPCars Auxilios", Icon: AuxiliosIcon, page: "auxilios", soon: true },
];
