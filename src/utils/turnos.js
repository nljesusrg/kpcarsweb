import { theme } from "../theme.js";
import { localDateStr } from "./format.js";

export const turnoDay = (t) => t.scheduled_date?.split("T")[0] ?? "";

// Un turno "próximo" es de hoy en adelante y no está cancelado ni terminado
export const isTurnoProximo = (t) => turnoDay(t) >= localDateStr() && t.status !== "cancelado" && t.status !== "completado";

// Trae todos los turnos del conductor (la API los entrega de a páginas)
export const fetchAllTurnos = async (apiFetch) => {
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

export const turnoStatus = {
  agendado:   { label: "Agendado",   color: "#ffb347",     bg: "rgba(235,136,0,0.16)" },
  en_proceso: { label: "En proceso", color: "#7fd0ff",     bg: "rgba(41,182,246,0.14)" },
  completado: { label: "Completado", color: "#8fd9a8",     bg: "rgba(76,175,80,0.14)" },
  cancelado:  { label: "Cancelado",  color: theme.gray200, bg: "rgba(255,255,255,0.08)" },
  perdido:    { label: "Perdido",    color: "#ff9d94",     bg: "rgba(255,82,82,0.16)" },
};

// Estado que se le muestra al conductor. Un turno de una fecha que ya pasó y que el sistema
// sigue marcando "agendado" se muestra como "perdido" (decisión de Leonardo): así el conductor
// lo ve y, si no fue así, puede avisar para que se corrija.
export const turnoDisplayStatus = (t) => (t.status === "agendado" && turnoDay(t) && turnoDay(t) < localDateStr() ? "perdido" : t.status);
