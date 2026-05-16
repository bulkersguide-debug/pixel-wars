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
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #222240; border-radius: 2px; }
        h2 { font-family: 'Orbitron', monospace; font-size: 13px; font-weight: 900; color: #00F5FF; letter-spacing: 2px; margin: 32px 0 10px; }
        h3 { font-family: 'Orbitron', monospace; font-size: 10px; font-weight: 700; color: #C8FF00; letter-spacing: 1px; margin: 20px 0 8px; }
        p  { font-size: 14px; line-height: 1.8; color: rgba(192,200,232,.75); margin: 0 0 12px; }
        ul { padding-left: 20px; margin: 0 0 12px; }
        li { font-size: 14px; line-height: 1.8; color: rgba(192,200,232,.75); margin-bottom: 4px; }
        a  { color: #00F5FF; text-decoration: none; }
        a:hover { text-decoration: underline; }
        strong { color: #e0e8ff; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
        th { background: rgba(0,245,255,.08); color: #00F5FF; font-family: 'Orbitron', monospace; font-size: 9px; letter-spacing: 1px; padding: 8px 12px; text-align: left; border: 1px solid #1a1a30; }
        td { padding: 8px 12px; border: 1px solid #1a1a30; color: rgba(192,200,232,.7); vertical-align: top; }
      `}</style>

      <div style={{ background: "#06060e", borderBottom: "1px solid #1a1a30", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate("/")} style={{ background: "rgba(0,245,255,.08)", border: "1px solid rgba(0,245,255,.25)", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontFamily: "'Orbitron',monospace", fontSize: 9, color: "#00F5FF", letterSpacing: 1 }}>← BACK</button>
        <div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 900, letterSpacing: 3, background: "linear-gradient(90deg,#00F5FF,#C8FF00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>⚔ PIXELS OF WAR</div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#3a3a5a", letterSpacing: 2, marginTop: 2 }}>PRIVACY POLICY</div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid #1a1a30" }}>
          <h1 style={{ fontFamily: "'Orbitron',monospace", fontSize: 24, fontWeight: 900, color: "#e0e8ff", letterSpacing: 2, margin: "0 0 8px" }}>Privacy Policy</h1>
          <p style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a3a5a", margin: 0 }}>Effective date: {EFFECTIVE_DATE} · Last updated: {EFFECTIVE_DATE}</p>
        </div>

        <p>This Privacy Policy explains how <strong>{COMPANY}</strong> ("{WEBSITE}") collects, uses, stores, and protects your personal data. We comply with the <strong>General Data Protection Regulation (GDPR)</strong>.</p>

        <h2>1. DATA CONTROLLER</h2>
        <p><strong>{COMPANY}</strong><br/>
        📧 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> · 🌐 <a href={WEBSITE}>{WEBSITE}</a></p>

        <h2>2. DATA WE COLLECT</h2>
        <table>
          <thead>
            <tr><th>DATA TYPE</th><th>WHAT WE COLLECT</th><th>PURPOSE</th><th>LEGAL BASIS</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Account data</strong></td><td>Discord username, user ID, avatar URL, email (via Discord OAuth)</td><td>Creating your player profile</td><td>Contract performance</td></tr>
            <tr><td><strong>Game data</strong></td><td>Pixel claims, territory, fandom choice, season history, power-up usage, chat messages, role/rank, XP/level, War Chest balance, loyalty streak, recharge status</td><td>Running the game</td><td>Contract performance</td></tr>
            <tr><td><strong>Payment data</strong></td><td>Transaction amounts, timestamps, purchase type (bundle/pass/starter pack). Card details handled exclusively by Stripe — we never see them.</td><td>Processing payments</td><td>Contract performance</td></tr>
            <tr><td><strong>Guest data</strong></td><td>Browser fingerprint (hashed: screen size, timezone, platform, language) for abuse prevention</td><td>Preventing guest pixel limit abuse</td><td>Legitimate interest</td></tr>
            <tr><td><strong>Technical data</strong></td><td>IP address, browser type, device type</td><td>Security, fraud prevention</td><td>Legitimate interest</td></tr>
            <tr><td><strong>Usage data</strong></td><td>Pages visited, features used, session duration (via Umami Analytics — anonymous)</td><td>Improving the service</td><td>Legitimate interest</td></tr>
            <tr><td><strong>Notification data</strong></td><td>Push notification subscription endpoint, encryption keys (if you opt in)</td><td>Sending game alerts (raids, events)</td><td>Consent</td></tr>
            <tr><td><strong>Ad interaction data</strong></td><td>Whether you watched a rewarded ad and when (cooldown tracking — stored locally only)</td><td>Managing ad cooldowns</td><td>Legitimate interest</td></tr>
            <tr><td><strong>Referral data</strong></td><td>Referral codes used (hashed IP for attribution)</td><td>Awarding referral bonuses</td><td>Contract performance</td></tr>
          </tbody>
        </table>

        <h2>3. HOW WE USE YOUR DATA</h2>
        <ul>
          <li>To provide and operate the game and all its features</li>
          <li>To process payments and maintain transaction records</li>
          <li>To send push notifications about game events — raids, Live Battle results, season updates (with your consent)</li>
          <li>To send Discord webhook notifications to our community server about major game events</li>
          <li>To award referral bonuses, seasonal rewards, and promotional free pixels</li>
          <li>To detect and prevent cheating, fraud, bot usage, and multi-accounting</li>
          <li>To track guest claiming limits via browser fingerprint (abuse prevention)</li>
          <li>To analyse usage patterns anonymously and improve the platform</li>
          <li>To comply with legal obligations</li>
        </ul>

        <h2>4. THIRD-PARTY PROCESSORS</h2>
        <table>
          <thead>
            <tr><th>PROVIDER</th><th>PURPOSE</th><th>DATA SHARED</th><th>LOCATION</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Supabase</strong></td><td>Game database, auth & real-time features</td><td>Game data, account data, push subscriptions</td><td>EU (AWS Frankfurt)</td></tr>
            <tr><td><strong>Discord</strong></td><td>OAuth authentication (login) + email collection</td><td>Username, user ID, avatar URL, email</td><td>US (SCCs in place)</td></tr>
            <tr><td><strong>Discord</strong></td><td>Webhook notifications (game events posted to community server)</td><td>Game event data (fandom names, pixel counts)</td><td>US (SCCs in place)</td></tr>
            <tr><td><strong>Stripe</strong></td><td>Payment processing</td><td>Transaction data only — no card details</td><td>EU/US (Standard Contractual Clauses)</td></tr>
            <tr><td><strong>Vercel</strong></td><td>Web hosting & deployment</td><td>Technical data, request logs</td><td>EU/US</td></tr>
            <tr><td><strong>Cloudflare</strong></td><td>Security, CDN, DDoS protection</td><td>IP address, technical data</td><td>EU/US</td></tr>
            <tr><td><strong>Umami Analytics</strong></td><td>Anonymous usage analytics (no cookies, no personal data)</td><td>Anonymous page views and feature usage</td><td>EU</td></tr>
            <tr><td><strong>Ad Networks</strong></td><td>Rewarded video ads (optional, player-initiated only)</td><td>Standard ad serving data per their privacy policies</td><td>Varies</td></tr>
          </tbody>
        </table>

        <h2>5. COOKIES AND LOCAL STORAGE</h2>
        <p>We use <strong>browser localStorage</strong> (not traditional cookies) to store:</p>
        <ul>
          <li>Your fandom selection and game preferences</li>
          <li>Login streak and daily reward status</li>
          <li>XP, level, War Chest balance, and recharge status</li>
          <li>Loyalty streak (fandom and consecutive days)</li>
          <li>Guest session ID and pixels used</li>
          <li>Push notification subscription status</li>
          <li>Onboarding and starter pack status</li>
          <li>Ad watch cooldown (local only — not transmitted to our servers)</li>
          <li>Live Battle arena state</li>
          <li>Join timestamp (for starter pack eligibility)</li>
        </ul>
        <p>This data is stored locally on your device. You can clear it at any time by clearing your browser's local storage. Cloudflare may set strictly necessary security cookies for DDoS protection — these do not require consent.</p>

        <h2>6. PUSH NOTIFICATIONS</h2>
        <p>If you enable push notifications, we store your push subscription endpoint and encryption keys in our database (Supabase) associated with your user ID. These are used solely to send you game alerts (raid warnings, Live Battle results, season announcements). You can revoke notification permission at any time in your browser settings, which will prevent future notifications and eventually result in removal of your subscription from our database.</p>

        <h2>7. DATA RETENTION</h2>
        <table>
          <thead>
            <tr><th>DATA TYPE</th><th>RETENTION PERIOD</th></tr>
          </thead>
          <tbody>
            <tr><td>Pixel / game data</td><td>Active season, then anonymised in Hall of Fame records</td></tr>
            <tr><td>Player profiles (XP, level, War Chest)</td><td>Until account deletion request</td></tr>
            <tr><td>Payment records</td><td>7 years (legal requirement for financial records)</td></tr>
            <tr><td>Chat messages</td><td>90 days (one season), then automatically deleted</td></tr>
            <tr><td>Push notification subscriptions</td><td>Until permission revoked or account deleted</td></tr>
            <tr><td>Guest claims (fingerprint)</td><td>24 hours (automatic expiry)</td></tr>
            <tr><td>Technical logs</td><td>30 days</td></tr>
          </tbody>
        </table>

        <h2>8. YOUR RIGHTS UNDER GDPR</h2>
        <ul>
          <li><strong>Right of access</strong> — request a copy of the data we hold about you</li>
          <li><strong>Right to rectification</strong> — request correction of inaccurate data</li>
          <li><strong>Right to erasure</strong> — request deletion of your data ("right to be forgotten")</li>
          <li><strong>Right to restriction</strong> — request we limit how we use your data</li>
          <li><strong>Right to data portability</strong> — receive your data in a machine-readable format</li>
          <li><strong>Right to object</strong> — object to processing based on legitimate interests</li>
          <li><strong>Right to withdraw consent</strong> — withdraw push notification consent at any time</li>
        </ul>
        <p>To exercise any right, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We will respond within <strong>30 days</strong>. You may also lodge a complaint with your national data protection authority.</p>

        <h2>9. DATA SECURITY</h2>
        <ul>
          <li>HTTPS/TLS encryption for all data in transit</li>
          <li>Row-level security on our database (Supabase RLS policies)</li>
          <li>Cloudflare DDoS and bot protection</li>
          <li>Stripe PCI-DSS compliant payment processing (we never handle raw card data)</li>
          <li>VAPID-encrypted push notifications</li>
          <li>Browser fingerprints stored as hashed values only</li>
        </ul>

        <h2>10. CHILDREN'S PRIVACY</h2>
        <p>The game involves real-money purchases and is intended for users aged <strong>18 and over</strong>. We do not knowingly collect data from children under 18. If you believe a minor has used our service, contact us immediately at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>

        <h2>11. INTERNATIONAL TRANSFERS</h2>
        <p>Some processors are located in the United States. Where data is transferred outside the EEA, we ensure appropriate safeguards via Standard Contractual Clauses (SCCs) approved by the European Commission.</p>

        <h2>12. CHANGES TO THIS POLICY</h2>
        <p>We may update this Privacy Policy from time to time with notice posted on the platform. The effective date at the top will be updated accordingly.</p>

        <h2>13. CONTACT & COMPLAINTS</h2>
        <p>📧 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> · 🌐 <a href={WEBSITE}>{WEBSITE}</a></p>
        <p>If unhappy with our response, you may contact the <strong>Hellenic Data Protection Authority (HDPA)</strong>:<br/>
        🌐 <a href="https://www.dpa.gr" target="_blank" rel="noopener noreferrer">www.dpa.gr</a> · 📞 +30 210 6475 600</p>

        <div style={{ marginTop: 40, padding: "16px 20px", background: "rgba(0,245,255,.04)", border: "1px solid rgba(0,245,255,.12)", borderRadius: 10 }}>
          <p style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a3a5a", margin: 0, letterSpacing: 1 }}>
            THIS POLICY IS COMPLIANT WITH THE EU GENERAL DATA PROTECTION REGULATION (GDPR) 2016/679 AND GREEK LAW 4624/2019. LAST UPDATED: {EFFECTIVE_DATE}.
          </p>
        </div>
      </div>
    </div>
  );
}
