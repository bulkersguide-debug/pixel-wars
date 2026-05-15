// src/Contact.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Contact() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ background: "#040408", minHeight: "100vh", color: "#c0c8e8", fontFamily: "'Rajdhani',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap');*{box-sizing:border-box}a{color:#00F5FF;text-decoration:none}a:hover{text-decoration:underline}`}</style>

      {/* Header */}
      <div style={{ background: "#06060e", borderBottom: "1px solid #1a1a30", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate("/")} style={{ background: "rgba(0,245,255,.08)", border: "1px solid rgba(0,245,255,.25)", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontFamily: "'Orbitron',monospace", fontSize: 9, color: "#00F5FF", letterSpacing: 1 }}>← BACK</button>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 900, letterSpacing: 3, background: "linear-gradient(90deg,#00F5FF,#C8FF00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>⚔ PIXELS OF WAR</div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "60px 24px 80px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>📬</div>
        <h1 style={{ fontFamily: "'Orbitron',monospace", fontSize: 28, fontWeight: 900, color: "#e0e8ff", letterSpacing: 3, marginBottom: 8 }}>CONTACT</h1>
        <p style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a3a5a", letterSpacing: 2, marginBottom: 40 }}>WE READ EVERY MESSAGE</p>

        {/* Contact cards */}
        <div style={{ display: "grid", gap: 12, marginBottom: 40 }}>
          <a href="mailto:info@pixelsofwar.com" style={{ display: "block", padding: "20px 24px", background: "rgba(0,245,255,.05)", border: "1px solid rgba(0,245,255,.2)", borderRadius: 12, textDecoration: "none", transition: "border-color .2s" }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 900, color: "#00F5FF", letterSpacing: 2, marginBottom: 6 }}>📧 EMAIL</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 14, color: "#c0c8e8" }}>info@pixelsofwar.com</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a3a5a", marginTop: 4 }}>We reply within 24–48 hours</div>
          </a>

          <a href="https://www.pixelsofwar.com" style={{ display: "block", padding: "20px 24px", background: "rgba(200,255,0,.04)", border: "1px solid rgba(200,255,0,.15)", borderRadius: 12, textDecoration: "none" }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 900, color: "#C8FF00", letterSpacing: 2, marginBottom: 6 }}>🌐 WEBSITE</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 14, color: "#c0c8e8" }}>www.pixelsofwar.com</div>
          </a>
        </div>

        {/* What to contact for */}
        <div style={{ padding: "20px 24px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, textAlign: "left", marginBottom: 32 }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 900, color: "#e0e8ff", letterSpacing: 2, marginBottom: 14 }}>WHAT WE CAN HELP WITH</div>
          {[
            ["💳", "Payment issues or refund requests"],
            ["🐛", "Bug reports or technical problems"],
            ["⚔️", "Reporting abusive chat or behaviour"],
            ["🤝", "Partnership or collaboration enquiries"],
            ["🔒", "Privacy or data deletion requests"],
            ["❓", "General questions about the game"],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
              <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 13, color: "rgba(192,200,232,.65)" }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Legal links */}
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          <a href="/terms" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#2a2a4a", letterSpacing: 1 }}>TERMS OF SERVICE</a>
          <a href="/privacy" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#2a2a4a", letterSpacing: 1 }}>PRIVACY POLICY</a>
          <a href="/" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#2a2a4a", letterSpacing: 1 }}>PLAY NOW</a>
        </div>
      </div>
    </div>
  );
}
