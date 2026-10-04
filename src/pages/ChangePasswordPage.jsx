import { useState } from "react";
import { API_BASE } from "../config.js";
import { theme } from "../theme.js";

export function ChangePasswordPage({ token, onComplete }) {
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
