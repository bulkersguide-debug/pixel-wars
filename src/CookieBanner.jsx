// src/CookieBanner.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("pow_cookie_consent")) {
      setTimeout(() => setVisible(true), 1500);
    }
  }, []);

  const accept = () => { localStorage.setItem("pow_cookie_consent", "accepted"); setVisible(false); };
  const decline = () => { localStorage.setItem("pow_cookie_consent", "declined"); setVisible(false); };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 3000,
      background: "rgba(6,6,20,.97)", borderTop: "1px solid rgba(0,245,255,.2)",
      padding: "14px 20px", display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 12, flexWrap: "wrap",
      backdropFilter: "blur(16px)", boxShadow: "0 -4px 30px rgba(0,0,0,.5)",
      animation: "slideUp .4s ease"
    }}>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:none}}`}</style>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 900, color: "#00F5FF", letterSpacing: 1, marginBottom: 4 }}>
          🍪 COOKIES & PRIVACY
        </div>
        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 12, color: "rgba(192,200,232,.6)", lineHeight: 1.5 }}>
          We use essential browser storage to run the game (your fandom, streak, preferences).
          Payments are handled by Stripe. No advertising cookies.{" "}
          <a href="/privacy" style={{ color: "#00F5FF", textDecoration: "none" }}>Privacy Policy</a>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={decline} style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,255,255,.15)", borderRadius: 6, cursor: "pointer", fontFamily: "'Orbitron',monospace", fontSize: 9, color: "rgba(255,255,255,.4)", letterSpacing: 1 }}>
          DECLINE
        </button>
        <button onClick={accept} style={{ padding: "8px 20px", background: "linear-gradient(90deg,#00F5FF,#C8FF00)", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "'Orbitron',monospace", fontSize: 9, fontWeight: 900, color: "#040408", letterSpacing: 1 }}>
          ACCEPT ✓
        </button>
      </div>
    </div>
  );
}
