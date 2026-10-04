import { MEDIA_BASE } from "../config.js";

export const toAbsoluteUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try { return MEDIA_BASE + new URL(url).pathname; } catch { return url; }
  }
  return url.startsWith("/") ? MEDIA_BASE + url : MEDIA_BASE + "/" + url;
};

/* ── Ayudas del panel: fechas, plata y textos ── */
export const pad2 = (n) => String(n).padStart(2, "0");

// Fecha local como "AAAA-MM-DD" (por defecto, hoy)
export const localDateStr = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

// "2026-10-06" → "Martes 6 de octubre" (o "Hoy" / "Mañana")
export const dayLabel = (dateStr) => {
  if (!dateStr) return "—";
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === localDateStr()) return "Hoy";
  if (dateStr === localDateStr(tomorrow)) return "Mañana";
  return capitalize(new Date(dateStr + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }));
};

// "2026-10-06" → "06/10/2026"
export const shortDate = (dateStr) => dateStr ? new Date(dateStr.split("T")[0] + "T12:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

// Días que faltan para una fecha (negativo si ya pasó)
export const daysUntil = (dateStr) => Math.round((new Date(dateStr.split("T")[0] + "T12:00:00") - new Date(localDateStr() + "T12:00:00")) / 86400000);

// 71249.25 → "$71.249,25"
export const fmtMoney = (n) => "$" + Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// "EXC DE VELOCIDAD" → "Exc de velocidad"
export const sentenceCase = (s) => capitalize(String(s || "").trim().toLowerCase()) || "—";

// "AB123CD" → "AB 123 CD"
export const fmtPatente = (patente) => {
  if (!patente) return "—";
  const clean = patente.toUpperCase().replace(/[\s-]/g, "");
  if (clean.length === 7) return `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5)}`;
  if (clean.length === 6) return `${clean.slice(0, 3)} ${clean.slice(3)}`;
  return patente.toUpperCase();
};
