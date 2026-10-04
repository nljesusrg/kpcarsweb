import imgPle625 from "./assets/cars/ple625.jpg";
import imgAb956ys from "./assets/cars/ab956ys.jpg";
import imgAb773ym from "./assets/cars/ab773ym.jpg";
import imgNyo037 from "./assets/cars/nyo037.jpg";
import imgOmb591 from "./assets/cars/omb591.jpg";
import imgAa865tl from "./assets/cars/aa865tl.jpg";

export const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycby9oZ4hlk8mqZFRtVUWBq2qNGOSYNt5waPRx3L8FyQgGbudK0mkCd1IAQJlfwB_YtK4dQ/exec";

// ↑ Reemplazá esto con la URL que te da Google Apps Script al implementar.
// Ejemplo: "https://script.google.com/macros/s/AKfycbx.../exec"

/* ─── API CONFIG ─── */
export const API_BASE = "https://kpcars.online/api";

// WhatsApp en formato internacional, sin espacios ni símbolos (lo usa wa.me)
export const WHATSAPP_PUBLIC = "5491164423273";  // +54 9 11 6442-3273: consultas de quienes no son conductores

export const WHATSAPP_DRIVERS = "541123850982";  // +54 11 2385-0982: central para conductores

export const MEDIA_BASE = "https://kpcars.online";

/* ─────────────────────────────────────────────
   FLOTA — tipos de vehículo, no autos puntuales.
   La página muestra cómo son los autos, sin ofrecer una unidad
   en particular: por eso no hay año, versión, patente ni "alquilado".
   ───────────────────────────────────────────── */
export const PRICE_WEEKLY = "400.000"; // alquiler semanal en ARS, igual para todos los tipos

export const fleetTypes = [
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

export const FLEET_NOTE = "Las fotos son de referencia. La unidad se asigna según disponibilidad al momento de la entrega.";

export const driverWhatsAppHref = (message = "¡Hola! Soy conductor de KPCars y tengo una consulta.") =>
  `https://wa.me/${WHATSAPP_DRIVERS}?text=${encodeURIComponent(message)}`;
