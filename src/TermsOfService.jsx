// src/TermsOfService.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EFFECTIVE_DATE = "16 May 2026";
const COMPANY = "Pixels of War";
const CONTACT_EMAIL = "info@pixelsofwar.com";
const WEBSITE = "https://www.pixelsofwar.com";

export default function TermsOfService() {
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
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#3a3a5a", letterSpacing: 2, marginTop: 2 }}>TERMS OF SERVICE</div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid #1a1a30" }}>
          <h1 style={{ fontFamily: "'Orbitron',monospace", fontSize: 24, fontWeight: 900, color: "#e0e8ff", letterSpacing: 2, margin: "0 0 8px" }}>Terms of Service</h1>
          <p style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a3a5a", margin: 0 }}>Effective date: {EFFECTIVE_DATE} · Last updated: {EFFECTIVE_DATE}</p>
        </div>

        <p>Welcome to <strong>{COMPANY}</strong> ("{WEBSITE}"). By accessing or using our platform, you agree to these Terms of Service ("Terms"). Please read them carefully.</p>

        <h2>1. ACCEPTANCE OF TERMS</h2>
        <p>By creating an account, purchasing pixels, or using {COMPANY}, you confirm you are at least <strong>18 years of age</strong> and agree to these Terms and our <a href="/privacy">Privacy Policy</a>.</p>

        <h2>2. ACCOUNTS AND AUTHENTICATION</h2>
        <p>Interaction requires sign-in via <strong>Discord OAuth</strong>. We access only your Discord username, user ID, and avatar. Guest users may place up to 3 pixels without logging in — tracked by browser fingerprint, expiring after 24 hours. Logging in permanently saves your territory and grants 25 free pixels. We may suspend accounts violating these Terms at our sole discretion.</p>

        <h2>3. FREE PIXELS, RECHARGE, AND VIRTUAL BONUSES</h2>
        <p>New players receive <strong>25 free pixels</strong> on first login. Logged-in players earn <strong>1 free pixel per hour</strong> (auto-recharge, up to 10 stockpiled). Additional free pixels may be awarded through daily login streaks, weekly missions, Live Battle participation and wins, referrals, watching rewarded video ads, XP level-up bonuses, and admin grants. All free pixel bonuses have no monetary value, cannot be transferred, redeemed for cash, or carried between seasons.</p>

        <h2>4. ROLES AND MODERATION</h2>
        <p>Roles (VIP, Moderator, Admin) are assigned at our discretion, convey no financial value or legal rights, and may be revoked without notice. The Whale Pack (€49.99) grants a permanent gold crown badge and priority Discord role for the current season.</p>

        <h2>5. VIRTUAL ITEMS AND PAYMENTS</h2>
        <h3>5.1 All Virtual Items</h3>
        <p>Pixels, War Chest gold, XP, and all in-game items are <strong>virtual items with no real-world monetary value</strong>. They cannot be exchanged for real money, transferred between accounts, or redeemed outside the platform.</p>

        <h3>5.2 Pixel Bundles</h3>
        <p>Pixel bundles are available at the following price points. All prices are in Euros (€) and displayed clearly before payment:</p>
        <table>
          <thead><tr><th>Bundle</th><th>Price</th><th>Pixels</th><th>Bonus Pixels</th></tr></thead>
          <tbody>
            <tr><td>Trial Pack</td><td>€0.99</td><td>15px</td><td>—</td></tr>
            <tr><td>Small</td><td>€1.99</td><td>100px</td><td>—</td></tr>
            <tr><td>Medium</td><td>€4.99</td><td>250px</td><td>+25px</td></tr>
            <tr><td>Large</td><td>€9.99</td><td>600px</td><td>+60px</td></tr>
            <tr><td>Mega</td><td>€24.99</td><td>2,000px</td><td>+400px</td></tr>
            <tr><td>Whale Pack</td><td>€49.99</td><td>5,000px</td><td>+1,000px + crown badge + Discord role</td></tr>
          </tbody>
        </table>
        <p>Pixel prices within the game vary by sector location, fill level, and active in-game events.</p>

        <h3>5.3 Season Pass (€4.99)</h3>
        <p>Unlocks for the current season: 2× XP, 50% War Chest gold bonus, +50 free pixels, exclusive badge, and SEASON WARRIOR power-up. Not a subscription — one purchase per season, never expires within that season.</p>

        <h3>5.4 Starter Pack (€2.99)</h3>
        <p>A one-time discounted bundle shown to new players during their first 3 days. Includes 100px, a power-up, and Season Pass. Cannot be reclaimed after dismissal or expiry.</p>

        <h3>5.5 Sponsored Banners</h3>
        <p>Third parties may purchase scrolling sponsored banners. Content is subject to review. We reserve the right to reject or remove banners without refund if they violate our standards.</p>

        <h3>5.6 Payment Processing</h3>
        <p>All payments processed by <strong>Stripe</strong>. We never store card details. Purchases also subject to <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer">Stripe's Terms of Service</a>.</p>

        <h3>5.7 Refund Policy</h3>
        <p>All purchases are <strong>final and non-refundable</strong> except as required by law. Technical delivery issues must be reported to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> within 48 hours. Under EU consumer law, by accessing digital content immediately you acknowledge the 14-day withdrawal right no longer applies once delivery has begun.</p>

        <h2>6. REWARDED ADVERTISEMENTS</h2>
        <p>Players may optionally watch short video ads for in-game rewards (5 free pixels, once every 30 minutes). Ad watching is entirely voluntary. Ad content is provided by third-party networks subject to their own terms. We are not responsible for third-party ad content.</p>

        <h2>7. WAR CHEST AND PASSIVE ECONOMY</h2>
        <p>Players with active territory earn War Chest gold passively based on pixel count (1 gold per 50 pixels every 5 minutes). Gold can fund Gold Raids (20 gold → steal 20 enemy pixels) or convert to free pixels (10 gold → 5 pixels). Gold has no monetary value, cannot be withdrawn, and resets at season end. Season Pass holders earn 50% bonus gold income.</p>

        <h2>8. XP, LEVELS, AND PROGRESSION</h2>
        <p>Players earn 1 XP per pixel claimed or raided. XP determines player level (1–50), unlocking build cost discounts, higher pixel recharge caps, and War Chest bonuses. Season Pass doubles XP earnings. XP and levels persist across seasons.</p>

        <h2>9. SEASONAL RESETS</h2>
        <p>Seasons last approximately 90 days. At season end, all pixel territories and War Chest gold reset. This is a core game mechanic. Purchasing pixels constitutes acceptance of seasonal resets. Season results and Hall of Fame records are retained permanently.</p>

        <h2>10. LIVE BATTLE MODE</h2>
        <p>Live Battle is a free 200×200 arena resetting every 24 hours. No pixel purchases required. The winning fandom at reset receives +5 free pixels per player. Daily streak bonuses are subject to the same terms as other free pixel bonuses.</p>

        <h2>11. USER CONDUCT</h2>
        <p>You agree not to use bots or automated tools; exploit bugs; harass other players; reverse-engineer the platform; use the service for illegal purposes; impersonate staff; circumvent payment systems; or create multiple accounts to exploit guest pixel limits or referral bonuses. Violations may result in immediate permanent ban without refund.</p>

        <h2>12. INTELLECTUAL PROPERTY</h2>
        <p>All {COMPANY} content is owned by or licensed to {COMPANY}. Fandom names and trademarks belong to their respective owners. {COMPANY} is an independent fan-created platform not affiliated with, endorsed by, or sponsored by any represented fandom.</p>

        <h2>13. DISCLAIMERS AND LIMITATION OF LIABILITY</h2>
        <p>To the maximum extent permitted by law, {COMPANY} is not liable for loss of virtual items due to account termination, temporary service unavailability, actions of other players (raids, wars — core game mechanics), or indirect or consequential damages.</p>

        <h2>14. TERMINATION</h2>
        <p>We may terminate access for breach of these Terms. Upon termination, your territory is removed and unused bonuses forfeited. Payments for consumed content are non-refundable.</p>

        <h2>15. CHANGES TO TERMS</h2>
        <p>We may update these Terms with notice posted on the platform. Continued use constitutes acceptance.</p>

        <h2>16. GOVERNING LAW</h2>
        <p>Governed by the laws of <strong>Greece</strong> and the European Union. Disputes subject to Greek courts, without prejudice to your consumer rights.</p>

        <h2>17. CONTACT</h2>
        <p>📧 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> · 🌐 <a href={WEBSITE}>{WEBSITE}</a></p>

        <div style={{ marginTop: 40, padding: "16px 20px", background: "rgba(0,245,255,.04)", border: "1px solid rgba(0,245,255,.12)", borderRadius: 10 }}>
          <p style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a3a5a", margin: 0, letterSpacing: 1 }}>
            BY USING PIXELS OF WAR YOU CONFIRM YOU HAVE READ, UNDERSTOOD, AND AGREE TO THESE TERMS. LAST UPDATED: {EFFECTIVE_DATE}.
          </p>
        </div>
      </div>
    </div>
  );
}
