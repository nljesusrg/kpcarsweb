import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { theme } from "../theme.js";
import { CloseIcon } from "./Icons.jsx";

export const ProfileAvatar = ({ user, size = 160 }) => {
  // Guardamos qué foto falló: si llega otra distinta, se vuelve a intentar sola
  const [brokenFoto, setBrokenFoto] = useState(null);
  const [zoomed, setZoomed] = useState(false);
  const foto = user?.foto || null;
  const broken = brokenFoto === foto;
  const initials = ((user?.nombre?.[0] || "") + (user?.apellido?.[0] || "")).toUpperCase() || "?";
  const fontSize = Math.round(size * 0.3);

  // Con la foto ampliada, la tecla Escape la cierra
  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e) => { if (e.key === "Escape") setZoomed(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [zoomed]);

  if (foto && !broken) {
    return (
      <>
        {/* La foto es un botón: al tocarla se abre en grande */}
        <button
          onClick={() => setZoomed(true)}
          aria-label="Ampliar foto de perfil"
          style={{ display: "block", width: "100%", height: "100%", padding: 0, border: "none", background: "none", cursor: "zoom-in" }}
        >
          <img
            src={foto}
            alt="Foto de perfil"
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
            onError={() => { setBrokenFoto(foto); setZoomed(false); }}
          />
        </button>

        {/* La foto ampliada se dibuja sobre toda la página (fuera de la tarjeta, para que no quede recortada) */}
        {zoomed && createPortal(
          <div
            onClick={() => setZoomed(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Foto de perfil ampliada"
            style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out", padding: 20 }}
          >
            <img src={foto} alt="Foto de perfil ampliada" style={{ maxWidth: "95%", maxHeight: "90vh", objectFit: "contain", borderRadius: 12 }} />
            <button
              onClick={() => setZoomed(false)}
              aria-label="Cerrar foto"
              autoFocus
              style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.15)", border: "none", color: "white", width: 44, height: 44, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <CloseIcon size={18} />
            </button>
          </div>,
          document.body
        )}
      </>
    );
  }
  return (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, rgba(235,136,0,0.25), rgba(235,136,0,0.1))", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize, color: theme.orange, letterSpacing: -1 }}>{initials}</span>
    </div>
  );
};
