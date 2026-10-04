import { useState } from "react";
import { theme } from "../theme.js";

export const ProfileAvatar = ({ user, size = 160 }) => {
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
