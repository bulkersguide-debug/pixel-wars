// src/AuthModal.jsx
import { useState } from "react";
import { supabase } from "./supabase";

const rgba=(hex,a)=>{try{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;}catch{return`rgba(0,0,0,${a})`;}};

export default function AuthModal({ onClose, reason = "claim" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signInWithDiscord = async () => {
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: window.location.origin + "/",
          scopes: "identify email",
        },
      });
      if (err) throw err;
    } catch (e) {
      setError(e.message || "Failed to connect. Try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(16px)", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "rgba(6,6,20,.98)", border: "1px solid rgba(88,101,242,.5)", borderRadius: 20, padding: "36px 32px", width: "100%", maxWidth: 400, textAlign: "center", boxShadow: "0 0 80px rgba(88,101,242,.2)", animation: "pop .4s cubic-bezier(.34,1.56,.64,1)" }}>

        {/* Icon */}
        <div style={{ fontSize: 52, marginBottom: 16 }}>⚔️</div>

        {/* Title */}
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color: "#e0e8ff", letterSpacing: 2, marginBottom: 8 }}>
          JOIN THE WAR
        </div>
        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 14, color: "rgba(192,200,232,.55)", marginBottom: 28, lineHeight: 1.6 }}>
          {reason === "claim" ? "Sign in to claim pixels for your fandom." :
           reason === "raid" ? "Sign in to raid enemy territory." :
           reason === "chat" ? "Sign in to join the War Room chat." :
           reason === "war" ? "Sign in to declare war." :
           reason === "alliance" ? "Sign in to form alliances." :
           reason === "missions" ? "Sign in to track and claim missions." :
           reason === "powerup" ? "Sign in to use power-ups." :
           reason === "share" ? "Sign in to share your territory." :
           reason === "fandom" ? "Sign in to request a new fandom." :
           reason === "daily" ? "Sign in to claim your daily pixels." :
           "Sign in to interact with the game."}
          <br/><strong style={{ color: "#FFD700" }}>New players get 25 FREE pixels</strong> on first login.
        </div>

        {/* Discord button */}
        <button onClick={signInWithDiscord} disabled={loading} style={{
          width: "100%", padding: "14px 24px",
          background: loading ? "rgba(88,101,242,.4)" : "linear-gradient(135deg,#5865F2,#7289DA)",
          border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 900, color: "#fff",
          letterSpacing: 1, transition: "all .2s", boxShadow: "0 4px 24px rgba(88,101,242,.4)"
        }}>
          {loading ? (
            <span style={{ animation: "pulse 1s infinite" }}>⏳ CONNECTING...</span>
          ) : (
            <>
              <svg width="22" height="16" viewBox="0 0 71 55" fill="none">
                <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.9a40.7 40.7 0 0 0-1.8 3.7 54.1 54.1 0 0 0-16.4 0A38.9 38.9 0 0 0 25.5.9 58.4 58.4 0 0 0 10.9 4.9C1.6 19 -1 32.7.3 46.3a58.9 58.9 0 0 0 18 9.1 44.6 44.6 0 0 0 3.9-6.3 38.3 38.3 0 0 1-6.1-2.9l1.5-1.1a42.1 42.1 0 0 0 36 0l1.5 1.1a38.3 38.3 0 0 1-6.1 2.9 44.6 44.6 0 0 0 3.9 6.3 58.7 58.7 0 0 0 18-9.1C72 30.6 68.3 17 60.1 4.9ZM23.7 38c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.2 6.4 7.2c0 4-2.9 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.2 6.4 7.2c0 4-2.9 7.2-6.4 7.2Z" fill="white"/>
              </svg>
              SIGN IN WITH DISCORD
            </>
          )}
        </button>

        {error && <div style={{ marginTop: 14, padding: "8px 12px", background: "rgba(255,68,0,.1)", border: "1px solid rgba(255,68,0,.3)", borderRadius: 7, fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#FF4400" }}>{error}</div>}

        {/* Benefits */}
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            ["🎁", "25 free pixels on signup"],
            ["🔒", "Territory saved to your account"],
            ["📧", "Raid alerts & streak reminders"],
            ["🔑", "Secure — we only access your username"],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(192,200,232,.45)", fontFamily: "'Rajdhani',sans-serif" }}>
              <span style={{ fontSize: 14 }}>{icon}</span>{text}
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{ marginTop: 20, background: "none", border: "none", color: "rgba(255,255,255,.2)", cursor: "pointer", fontFamily: "'Share Tech Mono',monospace", fontSize: 9, letterSpacing: 1 }}>
          CONTINUE AS GUEST (limited features)
        </button>
      </div>
    </div>
  );
}
