// src/ShareModal.jsx
import { useState } from "react";

const slugify = n => n.toLowerCase().replace(/[^a-z0-9\s]/g,"").replace(/\s+/g,"-").trim();
const rgba = (hex,a) => { const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); return `rgba(${r},${g},${b},${a})`; };

const TEMPLATES = [
  (n,c,r) => `🔥 ${n} has claimed ${c} pixels on Pixels of War! We're ranked #${r} — can you stop us? ⚔️`,
  (n,c)   => `⚔️ ${n} is taking over the grid with ${c} pixels! Join the war at pixelsofwar.com`,
  (n)     => `${n} fans — our territory is under attack! We need backup NOW 🚨 pixelsofwar.com`,
  (n,c)   => `🏴 Just claimed ${c} pixels for ${n}. The fandom war is REAL. pixelsofwar.com`,
  (n)     => `👑 ${n} is building an empire on Pixels of War. Come claim your pixels ⚔️`,
];

export default function ShareModal({ fandom, pixelCount, rank, referralBonus, onClose, pushToast }) {
  const [sel, setSel] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!fandom) return null;

  const ref = slugify(fandom.name);
  const url = `https://www.pixelsofwar.com/?fandom=${ref}&ref=${ref}`;
  const text = TEMPLATES[sel](fandom.name, pixelCount, rank);
  const full = `${text}\n${url}`;

  const share = async (platform) => {
    if (platform === "native") {
      try { await navigator.share({ title:"Pixels of War", text, url }); pushToast("🚀 Shared!","#00F5FF",3000); onClose(); } catch {}
      return;
    }
    if (platform === "copy") {
      await navigator.clipboard.writeText(full);
      setCopied(true); setTimeout(()=>setCopied(false),2500);
      pushToast("📋 Copied! Paste it anywhere.","#00F5FF",4000);
      return;
    }
    const enc = encodeURIComponent;
    const urls = {
      x:      `https://twitter.com/intent/tweet?text=${enc(full)}`,
      reddit: `https://reddit.com/submit?url=${enc(url)}&title=${enc(text)}`,
      whatsapp:`https://wa.me/?text=${enc(full)}`,
    };
    window.open(urls[platform],"_blank","noopener");
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(16px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"rgba(7,7,22,.96)",border:`1px solid ${rgba(fandom.color,.55)}`,borderRadius:18,padding:"24px 22px",width:430,maxWidth:"94vw",backdropFilter:"blur(24px)",boxShadow:`0 0 80px ${rgba(fandom.color,.18)},0 24px 48px rgba(0,0,0,.6)`}}>

        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:28,marginBottom:6}}>📢</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:900,color:fandom.color,letterSpacing:2}}>RALLY YOUR ARMY</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.3)",marginTop:3}}>Pick a battle cry then share</div>
        </div>

        {/* Template picker */}
        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14}}>
          {TEMPLATES.map((tmpl,i)=>(
            <div key={i} onClick={()=>setSel(i)} style={{padding:"9px 11px",background:sel===i?rgba(fandom.color,.13):"rgba(255,255,255,.03)",border:`1px solid ${sel===i?rgba(fandom.color,.55):"rgba(255,255,255,.07)"}`,borderRadius:8,cursor:"pointer",transition:"all .15s"}}>
              <div style={{fontSize:10,color:sel===i?fandom.color:"rgba(255,255,255,.45)",fontFamily:"'Rajdhani',sans-serif",fontWeight:600,lineHeight:1.5}}>{tmpl(fandom.name,pixelCount,rank)}</div>
            </div>
          ))}
        </div>

        {/* Share buttons */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:12}}>
          {navigator.share && (
            <button onClick={()=>share("native")} style={{gridColumn:"1/-1",padding:"12px",background:`linear-gradient(90deg,${fandom.color},${rgba(fandom.color,.7)})`,border:"none",color:"#040408",borderRadius:9,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:11,letterSpacing:1}}>📤 SHARE NOW</button>
          )}
          <button onClick={()=>share("x")} style={{padding:"10px",background:"rgba(0,0,0,.4)",border:"1px solid rgba(255,255,255,.2)",color:"#fff",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:900}}>𝕏 POST</button>
          <button onClick={()=>share("whatsapp")} style={{padding:"10px",background:"rgba(37,211,102,.1)",border:"1px solid rgba(37,211,102,.35)",color:"#25D366",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:900}}>💬 WHATSAPP</button>
          <button onClick={()=>share("reddit")} style={{padding:"10px",background:"rgba(255,69,0,.1)",border:"1px solid rgba(255,69,0,.35)",color:"#FF4500",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:900}}>🟠 REDDIT</button>
          <button onClick={()=>share("copy")} style={{padding:"10px",background:copied?"rgba(0,255,136,.12)":"rgba(255,255,255,.05)",border:`1px solid ${copied?"rgba(0,255,136,.5)":"rgba(255,255,255,.12)"}`,color:copied?"#00FF88":"rgba(255,255,255,.5)",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:900}}>{copied?"✓ COPIED":"📋 COPY"}</button>
        </div>

        {/* Referral link */}
        <div style={{padding:"10px 12px",background:"rgba(255,215,0,.06)",border:"1px solid rgba(255,215,0,.2)",borderRadius:9,marginBottom:10}}>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:900,color:"#FFD700",marginBottom:4,letterSpacing:1}}>🔗 YOUR REFERRAL LINK</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.35)",wordBreak:"break-all",lineHeight:1.5}}>{url}</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,215,0,.55)",marginTop:5}}>Every player who joins through your link gives you +{referralBonus||10} free pixels</div>
        </div>

        <button onClick={onClose} style={{width:"100%",padding:"8px",background:"transparent",border:"1px solid rgba(255,255,255,.08)",color:"rgba(255,255,255,.3)",borderRadius:7,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9}}>CLOSE</button>
      </div>
    </div>
  );
}
