import { theme } from "../theme.js";

/* Estilos compartidos del panel: letra grande y botones cómodos para el celular */
export const panel = {
  card: { background: theme.gray900, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 18 },
  h1: { fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(1.9rem, 8vw, 2.4rem)", letterSpacing: -0.5, lineHeight: 1.1, margin: 0 },
  h2: { fontSize: "0.9rem", fontWeight: 700, color: theme.gray300, margin: "12px 0 0" },
  muted: { fontSize: "0.95rem", color: theme.gray300, lineHeight: 1.45, margin: 0 },
  btn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", minHeight: 56, padding: "0 18px", borderRadius: 16, fontFamily: "'DM Sans', sans-serif", fontSize: "1.1rem", fontWeight: 700, cursor: "pointer", textDecoration: "none", boxSizing: "border-box" },
  chip: (color, bg) => ({ display: "inline-block", padding: "4px 10px", borderRadius: 999, background: bg, color, fontSize: "0.82rem", fontWeight: 700, whiteSpace: "nowrap" }),
};
panel.btnPrimary = { ...panel.btn, background: theme.orange, color: theme.black, border: "none" };
panel.btnOutline = { ...panel.btn, background: "transparent", color: theme.white, border: `2px solid ${theme.orange}` };
panel.btnQuiet = { ...panel.btn, minHeight: 48, fontSize: "1rem", borderRadius: 12, background: "transparent", color: theme.white, border: "1px solid rgba(255,255,255,0.28)" };
panel.btnText = { ...panel.btn, minHeight: 48, fontSize: "1rem", background: "transparent", color: theme.orange, border: "none" };
