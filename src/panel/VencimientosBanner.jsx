import { theme } from "../theme.js";

/* ── Banner de vencimientos próximos ── */
export function VencimientosBanner({ user }) {
  const alerts = [];

  if (user.licenciaVencimiento) {
    const exp = new Date(user.licenciaVencimiento + "T12:00:00");
    const days = Math.ceil((exp - new Date()) / 86400000);
    if (days <= 30) alerts.push({ label: "Licencia de conducir", days });
  }

  if (alerts.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
      {alerts.map((a, i) => {
        const urgent = a.days <= 7;
        const expired = a.days <= 0;
        const color = urgent ? "#ff5252" : theme.orange;
        const bg    = urgent ? "rgba(255,82,82,0.08)"   : "rgba(235,136,0,0.08)";
        const bdr   = urgent ? "rgba(255,82,82,0.22)"   : "rgba(235,136,0,0.22)";
        return (
          <div key={i} className="anim-in" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", background: bg, border: `1px solid ${bdr}`, borderRadius: 14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p style={{ fontSize: "0.83rem", fontWeight: 600, color, margin: 0 }}>
              {expired
                ? `Tu ${a.label} está vencida.`
                : `Tu ${a.label} vence en ${a.days} día${a.days !== 1 ? "s" : ""}.`}
              <span style={{ fontWeight: 400, color: theme.gray400, marginLeft: 6 }}>
                {expired ? "Renovarla lo antes posible." : "Recuerda renovarla a tiempo."}
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
