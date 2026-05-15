// src/BuyBannerPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

const PRICES = {
  hours: { 1: 2, 6: 8, 12: 14, 24: 20 },
  days:  { 1: 20, 3: 50, 7: 100, 30: 350 },
};

export default function BuyBannerPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [durationType, setDurationType] = useState("hours");
  const [durationAmount, setDurationAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const price = PRICES[durationType]?.[durationAmount] || 0;

  const submit = async () => {
    if (!message.trim() || message.trim().length < 5) { setError("Message must be at least 5 characters"); return; }
    if (!email.includes("@")) { setError("Enter a valid email address"); return; }
    setLoading(true); setError("");
    try {
      const { error: err } = await supabase.from("sponsored_banners").insert({
        message: message.trim(),
        contact_email: email.trim(),
        duration_type: durationType,
        duration_amount: durationAmount,
        price_eur: price,
        status: "pending",
      });
      if (err) throw err;
      setDone(true);
    } catch (e) {
      setError(e?.message || "Failed to submit. Try again.");
    }
    setLoading(false);
  };

  if (done) return (
    <div style={{ background: "#040408", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Rajdhani',sans-serif" }}>
      <div style={{ textAlign: "center", padding: "40px 20px", maxWidth: 480 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 900, color: "#FFD700", letterSpacing: 2, marginBottom: 12 }}>REQUEST RECEIVED!</div>
        <p style={{ fontSize: 14, color: "rgba(192,200,232,.6)", marginBottom: 8 }}>We'll contact you at <strong style={{ color: "#e0e8ff" }}>{email}</strong> with payment details.</p>
        <p style={{ fontSize: 13, color: "rgba(192,200,232,.4)", marginBottom: 28 }}>Your banner goes live within 2 hours of payment confirmation.</p>
        <button onClick={() => navigate("/")} style={{ padding: "12px 28px", background: "linear-gradient(90deg,#FFD700,#FF9900)", border: "none", color: "#040408", borderRadius: 8, cursor: "pointer", fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: 11 }}>← BACK TO GAME</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#040408", minHeight: "100vh", fontFamily: "'Rajdhani',sans-serif", color: "#c0c8e8" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap');*{box-sizing:border-box}`}</style>

      <div style={{ background: "#06060e", borderBottom: "1px solid #1a1a30", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate("/")} style={{ background: "rgba(0,245,255,.08)", border: "1px solid rgba(0,245,255,.25)", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontFamily: "'Orbitron',monospace", fontSize: 9, color: "#00F5FF", letterSpacing: 1 }}>← BACK</button>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 900, letterSpacing: 3, background: "linear-gradient(90deg,#00F5FF,#C8FF00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginLeft: "auto" }}>⚔ PIXELS OF WAR</div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📣</div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 900, color: "#FFD700", letterSpacing: 3, marginBottom: 8 }}>ADVERTISE HERE</div>
          <p style={{ fontSize: 13, color: "rgba(192,200,232,.5)", maxWidth: 440, margin: "0 auto" }}>Your message scrolls across the top of the game — seen by every player in real time. Perfect for promoting a Discord server, event, or fandom.</p>
        </div>

        {/* Live preview */}
        <div style={{ marginBottom: 24, background: "rgba(255,215,0,.06)", border: "1px solid rgba(255,215,0,.25)", borderRadius: 10, padding: "10px 16px", overflow: "hidden", position: "relative" }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#FFD700", letterSpacing: 1, marginBottom: 6 }}>PREVIEW — your banner will look like this:</div>
          <div style={{ background: "rgba(255,215,0,.04)", border: "1px solid rgba(255,215,0,.15)", borderRadius: 6, padding: "6px 12px", fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#FFD700" }}>
            ★ {message.trim() || "Your message scrolls here across the game..."} ★
          </div>
        </div>

        {/* Message */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a3a5a", letterSpacing: 2, marginBottom: 8 }}>YOUR MESSAGE *</div>
          <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Join our BTS Discord! · discord.gg/yourserver" maxLength={120}
            style={{ width: "100%", background: "#0c0c1c", border: "1px solid rgba(255,215,0,.25)", borderRadius: 8, padding: "12px 16px", color: "#e0e8ff", fontSize: 13, fontFamily: "'Rajdhani',sans-serif", outline: "none" }} />
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#2a2a4a", marginTop: 4, textAlign: "right" }}>{message.length}/120 characters</div>
        </div>

        {/* Email */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a3a5a", letterSpacing: 2, marginBottom: 8 }}>YOUR EMAIL * (for payment & confirmation)</div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
            style={{ width: "100%", background: "#0c0c1c", border: "1px solid rgba(255,215,0,.25)", borderRadius: 8, padding: "12px 16px", color: "#e0e8ff", fontSize: 13, fontFamily: "'Rajdhani',sans-serif", outline: "none" }} />
        </div>

        {/* Duration type */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a3a5a", letterSpacing: 2, marginBottom: 8 }}>DURATION TYPE</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["hours", "days"].map(t => (
              <button key={t} onClick={() => { setDurationType(t); setDurationAmount(t === "hours" ? 1 : 1); }} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${durationType === t ? "#FFD700" : "rgba(255,255,255,.1)"}`, background: durationType === t ? "rgba(255,215,0,.1)" : "transparent", color: durationType === t ? "#FFD700" : "rgba(255,255,255,.4)", cursor: "pointer", fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 900 }}>
                {t === "hours" ? "⏰ HOURS" : "📅 DAYS"}
              </button>
            ))}
          </div>
        </div>

        {/* Duration amount + pricing */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a3a5a", letterSpacing: 2, marginBottom: 8 }}>SELECT DURATION</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {Object.entries(PRICES[durationType]).map(([amt, p]) => {
              const on = durationAmount === parseInt(amt);
              return (
                <div key={amt} onClick={() => setDurationAmount(parseInt(amt))} style={{ padding: "12px 8px", borderRadius: 9, border: `2px solid ${on ? "#FFD700" : "rgba(255,255,255,.08)"}`, background: on ? "rgba(255,215,0,.1)" : "rgba(255,255,255,.03)", cursor: "pointer", textAlign: "center", transition: "all .15s" }}>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 900, color: on ? "#FFD700" : "#c0c8e8", marginBottom: 4 }}>{amt}</div>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "rgba(255,255,255,.3)" }}>{durationType === "hours" ? "hr" : "day"}{parseInt(amt) > 1 ? "s" : ""}</div>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: on ? "#C8FF00" : "rgba(255,255,255,.4)", marginTop: 4, fontWeight: 900 }}>€{p}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Price summary */}
        <div style={{ marginBottom: 20, padding: "16px 20px", background: "rgba(200,255,0,.06)", border: "1px solid rgba(200,255,0,.2)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a3a5a", marginBottom: 4 }}>TOTAL COST</div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 24, fontWeight: 900, color: "#C8FF00" }}>€{price}</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#3a3a5a" }}>for {durationAmount} {durationType}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a3a5a", marginBottom: 4 }}>PAYMENT</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#c0c8e8" }}>We'll email you payment details</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a3a5a" }}>Bank transfer · PayPal · Crypto</div>
          </div>
        </div>

        {error && <div style={{ marginBottom: 14, padding: "9px 12px", background: "rgba(255,68,0,.1)", border: "1px solid rgba(255,68,0,.3)", borderRadius: 7, fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#FF4400" }}>{error}</div>}

        <button onClick={submit} disabled={loading || !message.trim() || !email.includes("@")} style={{ width: "100%", padding: "15px", background: (message.trim() && email.includes("@")) ? "linear-gradient(90deg,#FFD700,#FF9900)" : "rgba(255,255,255,.06)", border: "none", color: (message.trim() && email.includes("@")) ? "#040408" : "rgba(255,255,255,.2)", borderRadius: 10, cursor: (message.trim() && email.includes("@")) ? "pointer" : "not-allowed", fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: 13, letterSpacing: 2 }}>
          {loading ? "⏳ SUBMITTING..." : `📣 REQUEST BANNER SLOT — €${price}`}
        </button>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#2a2a4a", textAlign: "center", marginTop: 10 }}>We review all banners before they go live · No offensive content · Goes live within 2h of payment</div>

        {/* FAQ */}
        <div style={{ marginTop: 36, borderTop: "1px solid #1a1a30", paddingTop: 24 }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 900, color: "#3a3a5a", letterSpacing: 2, marginBottom: 16 }}>FAQ</div>
          {[
            ["Who sees my banner?", "Every player on pixelsofwar.com — desktop and mobile. The banner scrolls continuously while active."],
            ["How do I pay?", "After submitting, we'll email you payment options (bank transfer, PayPal, or crypto). Banner goes live within 2 hours of payment."],
            ["Can I cancel?", "Banners are non-refundable once live. If you need changes before activation, email us at info@pixelsofwar.com"],
            ["What's not allowed?", "No adult content, hate speech, scams, or illegal services. We review all banners before approval."],
          ].map(([q, a]) => (
            <div key={q} style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(255,255,255,.03)", borderRadius: 8 }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 9, color: "#c0c8e8", fontWeight: 900, marginBottom: 4 }}>{q}</div>
              <div style={{ fontSize: 12, color: "rgba(192,200,232,.5)", lineHeight: 1.6 }}>{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
