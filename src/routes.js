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
};

/* Áreas de KPCars. Rentals es la principal (es el inicio); las demás están en preparación. */
export const areas = [
  { key: "rentals", name: "KPCars Rentals", Icon: RentalsIcon, desc: "Alquiler de vehículos Toyota para trabajar en aplicaciones o de forma particular.", page: "catalog", cta: "Ver flota →" },
  { key: "fletes", name: "KPCars Fletes", Icon: FletesIcon, page: "fletes", soon: true },
  { key: "auxilios", name: "KPCars Auxilios", Icon: AuxiliosIcon, page: "auxilios", soon: true },
];
