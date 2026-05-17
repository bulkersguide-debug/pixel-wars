// src/PrivacyPolicy.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EFFECTIVE_DATE = "16 May 2026";
const COMPANY = "Pixels of War";
const CONTACT_EMAIL = "info@pixelsofwar.com";
const WEBSITE = "https://www.pixelsofwar.com";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ background: "#040408", minHeight: "100vh", color: "#c0c8e8", fontFamily: "'Rajdhani', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap');
        * { box-sizing: border-box; }
        h2 { font-family: 'Orbitron', monospace; font-size: 13px; font-weight: 900; color: #00F5FF; letter-spacing: 2px; margin: 32px 0 10px; }
        h3 { font-family: 'Orbitron', monospace; font-size: 10px; font-weight: 700; color: #C8FF00; letter-spacing: 1px; margin: 20px 0 8px; }
        p  { font-size: 14px; line-height: 1.8; color: rgba(192,200,232,.75); margin: 0 0 12px; }
        ul { padding-left: 20px; margin: 0 0 12px; }
        li { font-size: 14px; line-height: 1.8; color: rgba(192,200,232,.75); margin-bottom: 4px; }
        a  { color: #00F5FF; }
        strong { color: #e0e8ff; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
        th { background: rgba(0,245,255,.08); color: #00F5FF; font-family: 'Orbitron', monospace; font-size: 9px; letter-spacing: 1px; padding: 8px 12px; text-align: left; border: 1px solid #1a1a30; }
        td { padding: 8px 12px; border: 1px solid #1a1a30; color: rgba(192,200,232,.7); vertical-align: top; }
      `}</style>

      <div style={{ background: "#06060e", borderBottom: "1px solid #1a1a30", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate("/")} style={{ background: "rgba(0,245,255,.08)", border: "1px solid rgba(0,245,255,.25)", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontFamily: "'Orbitron',monospace", fontSize: 9, color: "#00F5FF", letterSpacing: 1 }}>← BACK</button>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 900, letterSpacing: 3, background: "linear-gradient(90deg,#00F5FF,#C8FF00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>⚔ PIXELS OF WAR — PRIVACY POLICY</div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid #1a1a30" }}>
          <h1 style={{ fontFamily: "'Orbitron',monospace", fontSize: 24, fontWeight: 900, color: "#e0e8ff", letterSpacing: 2, margin: "0 0 8px" }}>Privacy Policy</h1>
          <p style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a3a5a", margin: 0 }}>Effective date: {EFFECTIVE_DATE} · GDPR compliant</p>
        </div>

        <p>This Privacy Policy explains how <strong>{COMPANY}</strong> collects, uses, and protects your personal data in compliance with the <strong>EU General Data Protection Regulation (GDPR)</strong>.</p>

        <h2>1. DATA CONTROLLER</h2>
        <p><strong>{COMPANY}</strong> · 📧 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> · 🌐 <a href={WEBSITE}>{WEBSITE}</a></p>

        <h2>2. DATA WE COLLECT</h2>
        <table>
          <thead><tr><th>DATA TYPE</th><th>WHAT WE COLLECT</th><th>PURPOSE</th><th>LEGAL BASIS</th></tr></thead>
          <tbody>
            <tr><td><strong>Account data</strong></td><td>Discord username, user ID, avatar URL, email (via Discord OAuth)</td><td>Player profile creation</td><td>Contract performance</td></tr>
            <tr><td><strong>Game data</strong></td><td>Pixel claims, territory, fandom & faction, season history, XP/level, War Chest balance, clan name/tag, loyalty streak, recharge status, Canvas Challenge submissions, Daily Challenge participation</td><td>Running the game</td><td>Contract performance</td></tr>
            <tr><td><strong>Payment data</strong></td><td>Transaction amounts, timestamps, purchase type. Card details handled exclusively by Stripe — we never see them.</td><td>Processing payments</td><td>Contract performance</td></tr>
            <tr><td><strong>Guest data</strong></td><td>Browser fingerprint (hashed: screen size, timezone, platform, language)</td><td>Preventing guest pixel abuse</td><td>Legitimate interest</td></tr>
            <tr><td><strong>Technical data</strong></td><td>IP address, browser type, device type</td><td>Security, fraud prevention</td><td>Legitimate interest</td></tr>
            <tr><td><strong>Usage data</strong></td><td>Pages visited, features used (via Umami Analytics — anonymous)</td><td>Improving the service</td><td>Legitimate interest</td></tr>
            <tr><td><strong>Notification data</strong></td><td>Push notification subscription endpoint and encryption keys</td><td>Sending game alerts (raids, events)</td><td>Consent</td></tr>
            <tr><td><strong>Social data</strong></td><td>Share actions (territory sharing, TikTok caption copy) — logged locally only, not transmitted</td><td>Feature functionality</td><td>Legitimate interest</td></tr>
            <tr><td><strong>Ad interaction data</strong></td><td>Whether you watched a rewarded ad and when (cooldown — local only)</td><td>Managing ad cooldowns</td><td>Legitimate interest</td></tr>
            <tr><td><strong>Referral data</strong></td><td>Referral codes used (hashed IP for attribution)</td><td>Awarding referral bonuses</td><td>Contract performance</td></tr>
          </tbody>
        </table>

        <h2>3. HOW WE USE YOUR DATA</h2>
        <ul>
          <li>To provide and operate the game and all features including World War, Clans, Live Battle, Canvas Challenge, and Daily Sector Challenge</li>
          <li>To process payments and maintain transaction records</li>
          <li>To send push notifications (raids, Live Battle results, season updates) with your consent</li>
          <li>To send Discord webhook notifications to our community server about game events (wars, faction raids, live battle winners, peace votes)</li>
          <li>To award referral, streak, mission, Canvas Challenge, and promotional bonuses</li>
          <li>To detect and prevent cheating, fraud, bot usage, and multi-accounting</li>
          <li>To track guest claiming limits via browser fingerprint (abuse prevention)</li>
          <li>To analyse usage patterns anonymously and improve the platform</li>
          <li>To comply with legal obligations</li>
        </ul>

        <h2>4. THIRD-PARTY PROCESSORS</h2>
        <table>
          <thead><tr><th>PROVIDER</th><th>PURPOSE</th><th>DATA SHARED</th><th>LOCATION</th></tr></thead>
          <tbody>
            <tr><td><strong>Supabase</strong></td><td>Game database, auth, real-time features, Edge Functions (push)</td><td>Game data, account data, push subscriptions</td><td>EU (AWS Frankfurt)</td></tr>
            <tr><td><strong>Discord</strong></td><td>OAuth authentication + email + webhook notifications</td><td>Username, user ID, avatar, email; game event data via webhooks</td><td>US (SCCs in place)</td></tr>
            <tr><td><strong>Stripe</strong></td><td>Payment processing</td><td>Transaction data only — no card details</td><td>EU/US (SCCs)</td></tr>
            <tr><td><strong>Vercel</strong></td><td>Web hosting & deployment</td><td>Technical data, request logs</td><td>EU/US</td></tr>
            <tr><td><strong>Cloudflare</strong></td><td>Security, CDN, DDoS protection</td><td>IP address, technical data</td><td>EU/US</td></tr>
            <tr><td><strong>Umami Analytics</strong></td><td>Anonymous usage analytics (no cookies, no personal data)</td><td>Anonymous page views only</td><td>EU</td></tr>
            <tr><td><strong>Ad Networks</strong></td><td>Rewarded video ads (optional, player-initiated only)</td><td>Standard ad serving data per their privacy policies</td><td>Varies</td></tr>
          </tbody>
        </table>

        <h2>5. COOKIES AND LOCAL STORAGE</h2>
        <p>We use <strong>browser localStorage</strong> (not traditional cookies) to store game preferences, login streak, XP/level, War Chest balance, recharge status, loyalty streak, guest session, push notification status, onboarding status, ad cooldown, Live Battle arena state, clan data, join timestamp, faction raid cooldown, Daily Sector Challenge state, and Canvas Challenge seen status. You can clear this by clearing your browser's localStorage. Cloudflare may set strictly necessary security cookies for DDoS protection.</p>

        <h2>6. PUSH NOTIFICATIONS</h2>
        <p>If you enable push notifications, we store your subscription endpoint and encryption keys in Supabase linked to your user ID. Used solely to send game alerts. Revoke permission anytime in browser settings.</p>

        <h2>7. SHARING FEATURES</h2>
        <p>The Share Territory and TikTok sharing features generate text messages locally in your browser. Clicking these buttons uses your device's native share API or clipboard — no data is sent to our servers. The content of shares is not logged or stored by us.</p>

        <h2>8. DATA RETENTION</h2>
        <table>
          <thead><tr><th>DATA TYPE</th><th>RETENTION</th></tr></thead>
          <tbody>
            <tr><td>Pixel / territory data</td><td>Active season, then anonymised in Hall of Fame</td></tr>
            <tr><td>Player profiles (XP, level, clan, War Chest)</td><td>Until account deletion request</td></tr>
            <tr><td>Payment records</td><td>7 years (legal requirement)</td></tr>
            <tr><td>Chat messages</td><td>90 days (one season), auto-deleted</td></tr>
            <tr><td>Push notification subscriptions</td><td>Until permission revoked or account deleted</td></tr>
            <tr><td>Guest claims (fingerprint)</td><td>24 hours (automatic expiry)</td></tr>
            <tr><td>Technical logs</td><td>30 days</td></tr>
          </tbody>
        </table>

        <h2>9. YOUR RIGHTS UNDER GDPR</h2>
        <ul>
          <li><strong>Right of access</strong> — request a copy of your data</li>
          <li><strong>Right to rectification</strong> — request correction of inaccurate data</li>
          <li><strong>Right to erasure</strong> — request deletion ("right to be forgotten")</li>
          <li><strong>Right to restriction</strong> — limit how we use your data</li>
          <li><strong>Right to data portability</strong> — receive your data in machine-readable format</li>
          <li><strong>Right to object</strong> — object to processing based on legitimate interests</li>
          <li><strong>Right to withdraw consent</strong> — withdraw push notification consent anytime</li>
        </ul>
        <p>To exercise any right, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We respond within <strong>30 days</strong>.</p>

        <h2>10. DATA SECURITY</h2>
        <ul>
          <li>HTTPS/TLS encryption for all data in transit</li>
          <li>Row-level security on Supabase database (RLS policies)</li>
          <li>Cloudflare DDoS and bot protection</li>
          <li>Stripe PCI-DSS compliant payment processing</li>
          <li>VAPID-encrypted push notifications</li>
          <li>Browser fingerprints stored as hashed values only</li>
        </ul>

        <h2>11. CHILDREN'S PRIVACY</h2>
        <p>The game involves real-money purchases and is intended for users aged <strong>18 and over</strong>. We do not knowingly collect data from minors. Contact us immediately at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> if you believe a minor has used our service.</p>

        <h2>12. INTERNATIONAL TRANSFERS</h2>
        <p>Some processors are in the United States. Transfers outside the EEA are protected via Standard Contractual Clauses (SCCs) approved by the European Commission.</p>

        <h2>13. CHANGES TO THIS POLICY</h2>
        <p>We may update this Privacy Policy with notice posted on the platform. The effective date will be updated accordingly.</p>

        <h2>14. CONTACT & COMPLAINTS</h2>
        <p>📧 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> · 🌐 <a href={WEBSITE}>{WEBSITE}</a></p>
        <p>You may also contact the <strong>Hellenic Data Protection Authority (HDPA)</strong>: 🌐 <a href="https://www.dpa.gr" target="_blank" rel="noopener noreferrer">www.dpa.gr</a></p>

        <div style={{ marginTop: 40, padding: "16px 20px", background: "rgba(0,245,255,.04)", border: "1px solid rgba(0,245,255,.12)", borderRadius: 10 }}>
          <p style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a3a5a", margin: 0, letterSpacing: 1 }}>
            GDPR COMPLIANT · EU REGULATION 2016/679 · GREEK LAW 4624/2019 · LAST UPDATED: {EFFECTIVE_DATE}
          </p>
        </div>
      </div>
    </div>
  );
}
