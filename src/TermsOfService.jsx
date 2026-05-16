// src/TermsOfService.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EFFECTIVE_DATE = "16 May 2026";
const COMPANY = "Pixels of War";
const CONTACT_EMAIL = "info@pixelsofwar.com"; // ← change this
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
      `}</style>

      {/* Header */}
      <div style={{ background: "#06060e", borderBottom: "1px solid #1a1a30", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate("/")} style={{ background: "rgba(0,245,255,.08)", border: "1px solid rgba(0,245,255,.25)", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontFamily: "'Orbitron',monospace", fontSize: 9, color: "#00F5FF", letterSpacing: 1 }}>← BACK</button>
        <div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 900, letterSpacing: 3, background: "linear-gradient(90deg,#00F5FF,#C8FF00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>⚔ PIXELS OF WAR</div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#3a3a5a", letterSpacing: 2, marginTop: 2 }}>TERMS OF SERVICE</div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Title */}
        <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid #1a1a30" }}>
          <h1 style={{ fontFamily: "'Orbitron',monospace", fontSize: 24, fontWeight: 900, color: "#e0e8ff", letterSpacing: 2, margin: "0 0 8px" }}>Terms of Service</h1>
          <p style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a3a5a", margin: 0 }}>Effective date: {EFFECTIVE_DATE} · Last updated: {EFFECTIVE_DATE}</p>
        </div>

        <p>Welcome to <strong>{COMPANY}</strong> ("{WEBSITE}"). By accessing or using our platform, you agree to these Terms of Service ("Terms"). Please read them carefully before using the service.</p>

        <h2>1. ACCEPTANCE OF TERMS</h2>
        <p>By creating an account, purchasing pixels, or otherwise using {COMPANY}, you confirm that you are at least <strong>18 years of age</strong> (or the age of majority in your jurisdiction, whichever is higher), and that you agree to be bound by these Terms and our <a href="/privacy">Privacy Policy</a>.</p>
        <p>If you do not agree to these Terms, you must stop using the service immediately.</p>

        <h2>2. ACCOUNTS AND AUTHENTICATION</h2>
        <p>To interact with {COMPANY} (claim pixels, send chat messages, form alliances, use power-ups), you must sign in using <strong>Discord OAuth</strong>. By signing in you authorise us to access your Discord username, user ID, avatar, and email address. We do not access your Discord messages, friends list, or any other data.</p>
        <p>You are responsible for maintaining the security of your Discord account. We are not liable for any loss resulting from unauthorised access to your account.</p>
        <p>We may suspend or permanently ban accounts that violate these Terms, at our sole discretion.</p>

        <h2>3. FREE PIXELS AND VIRTUAL ITEMS</h2>
        <p>New players receive <strong>25 free pixels</strong> upon first login via Discord. These pixels are a promotional bonus with <strong>no monetary value</strong>. They cannot be transferred between accounts, redeemed for cash, or carried over between seasons.</p>
        <p>Additional free pixels may be awarded through daily login streaks, combo bonuses, referrals, and <strong>admin-granted allocations</strong>. Admin grants are tied to the Discord account email used at registration. Grants are issued at our sole discretion and carry no monetary value. We reserve the right to modify, revoke, or expire any free pixel grant at any time.</p>
        <p>Free pixel bonuses of any kind are subject to change at our discretion.</p>

        <h2>4. ROLES AND MODERATION</h2>
        <p>Players may be assigned roles including <strong>VIP</strong>, <strong>Moderator</strong>, or <strong>Admin</strong> at our discretion. Roles convey no financial value or legal rights.</p>
        <p>Moderators have the ability to remove chat messages that violate these Terms. Admins have full platform access. Roles may be revoked at any time without notice.</p>
        <p>Guest users (not logged in) may view the game but cannot claim pixels, send messages, or interact with other game features.</p>
        <p>{COMPANY} is an online game in which users purchase virtual pixels on a shared digital grid to represent their chosen fandom ("Territory"). Players may claim empty pixels, raid unprotected enemy pixels, and compete for territorial dominance across seasonal competitions.</p>
        <p>The service is provided on an "as is" and "as available" basis. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.</p>

        <h2>5. VIRTUAL ITEMS AND PAYMENTS</h2>
        <h3>5.1 Pixels and Virtual Currency</h3>
        <p>Pixels purchased on {COMPANY} are <strong>virtual items with no real-world monetary value</strong>. They cannot be exchanged for real money, transferred between accounts, or redeemed for any tangible goods or services outside the platform.</p>
        <p>All purchases are for virtual, in-game content only. You are purchasing a limited, non-exclusive, revocable licence to use that virtual content within the game.</p>

        <h3>5.2 Pricing</h3>
        <p>Pixel prices are displayed in Euros (€) and may vary based on grid location, sector fill level, and active in-game events. All prices are clearly shown before payment is required.</p>

        <h3>5.3 Payment Processing</h3>
        <p>All payments are processed securely by <strong>Stripe</strong>, a third-party payment processor. We do not store your card details. By making a purchase, you also agree to <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer">Stripe's Terms of Service</a>.</p>

        <h3>5.4 Refund Policy</h3>
        <p>All purchases are <strong>final and non-refundable</strong>, except as required by applicable law. If you experience a technical issue that prevents delivery of purchased content, please contact us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> within 48 hours and we will investigate.</p>
        <p>Under EU consumer law, you may have a 14-day right of withdrawal for digital content purchases. By proceeding with a purchase and accessing the digital content immediately, you acknowledge that the right of withdrawal no longer applies once delivery has begun.</p>

        <h3>5.5 Sponsored Banners</h3>
        <p>Logged-in players may submit a scrolling banner message displayed to all players for a paid duration. Banner submissions are subject to admin review and approval. We reserve the right to reject, edit, or terminate any banner at any time without refund if it violates these Terms or is deemed inappropriate. Banner fees are non-refundable once the banner has been activated.</p>

        <h2>6. SEASONAL RESETS</h2>
        <p>The game operates in <strong>seasons</strong> (approximately 90 days each). At the end of each season, all pixel territories are reset and a new season begins. This is a core feature of the game, not a defect. Purchasing pixels constitutes acceptance that your territory will be reset at season end.</p>
        <p>Season results and champion records are retained permanently and displayed in the Hall of Fame.</p>

        <h2>7. USER CONDUCT</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use bots, scripts, or automated tools to interact with the game</li>
          <li>Exploit bugs or vulnerabilities to gain unfair advantage</li>
          <li>Harass, threaten, or abuse other players through the chat system</li>
          <li>Attempt to reverse-engineer, decompile, or access our source code without permission</li>
          <li>Use the platform for any illegal purpose or in violation of any applicable law</li>
          <li>Impersonate other users or {COMPANY} staff</li>
          <li>Attempt to circumvent payment systems or obtain virtual items fraudulently</li>
        </ul>
        <p>Violation of these rules may result in immediate account suspension or permanent ban without refund.</p>

        <h2>8. INTELLECTUAL PROPERTY</h2>
        <p>All content on {COMPANY} — including the game engine, graphics, UI, game mechanics, and branding — is owned by or licensed to {COMPANY} and is protected by intellectual property laws.</p>
        <p>Fandom names, logos, and related trademarks referenced in the game belong to their respective owners. {COMPANY} is an independent fan-created platform and is not affiliated with, endorsed by, or sponsored by any of the fandoms represented.</p>

        <h2>9. DISCLAIMERS AND LIMITATION OF LIABILITY</h2>
        <p>To the maximum extent permitted by law, {COMPANY} shall not be liable for:</p>
        <ul>
          <li>Loss of virtual items due to account termination for breach of these Terms</li>
          <li>Temporary unavailability of the service due to maintenance or technical issues</li>
          <li>Actions of other players (raids, wars, betrayals) which are core game mechanics</li>
          <li>Indirect, incidental, or consequential damages of any kind</li>
        </ul>
        <p>Nothing in these Terms limits liability for death or personal injury caused by our negligence, fraud, or any other liability that cannot be excluded by law.</p>

        <h2>10. TERMINATION</h2>
        <p>We may suspend or terminate your access to {COMPANY} at any time for breach of these Terms. You may stop using the service at any time.</p>
        <p>Upon termination, your pixel territory will be removed and any unused in-game bonuses will be forfeited. Payments already made for consumed content are non-refundable.</p>

        <h2>11. CHANGES TO TERMS</h2>
        <p>We may update these Terms from time to time. We will notify you of material changes by posting a notice on the platform. Continued use of the service after changes take effect constitutes your acceptance of the revised Terms.</p>

        <h2>12. GOVERNING LAW</h2>
        <p>These Terms are governed by the laws of <strong>Greece</strong> and the European Union. Any disputes shall be subject to the exclusive jurisdiction of the courts of Greece, without prejudice to your rights as a consumer under the laws of your country of residence.</p>

        <h2>13. CONTACT</h2>
        <p>If you have questions about these Terms, please contact us at:<br/>
        📧 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><br/>
        🌐 <a href={WEBSITE}>{WEBSITE}</a></p>

        <div style={{ marginTop: 40, padding: "16px 20px", background: "rgba(0,245,255,.04)", border: "1px solid rgba(0,245,255,.12)", borderRadius: 10 }}>
          <p style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a3a5a", margin: 0, letterSpacing: 1 }}>
            BY USING PIXELS OF WAR YOU CONFIRM THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO THESE TERMS OF SERVICE.
          </p>
        </div>
      </div>
    </div>
  );
}
