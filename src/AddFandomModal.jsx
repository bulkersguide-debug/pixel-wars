// src/AddFandomModal.jsx
import { useState } from "react";
import { supabase } from "./supabase";

const rgba=(hex,a)=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};

const CATS = ["🎮 Gaming", "🎌 Anime", "🎵 Music", "⚽ Sports", "🎬 TV & Film", "Other"];
const PRESET_COLORS = [
  "#00B4F0","#9747FF","#FF4655","#62B32F","#FF6B35",
  "#FF1493","#FFD700","#FF8C00","#00F5FF","#CC3355",
  "#A855F7","#E31E24","#00FFAA","#FF2D78","#C8FF00",
];

export default function AddFandomModal({ onClose, onSubmitted }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("🎮 Gaming");
  const [color, setColor] = useState("#9747FF");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!name.trim() || name.trim().length < 2) { setError("Name must be at least 2 characters"); return; }
    if (name.trim().length > 50) { setError("Name must be under 50 characters"); return; }
    setLoading(true); setError("");
    try {
      const { error: err } = await supabase.from("fandom_requests").insert({
        name: name.trim(),
        category,
        color,
        status: "pending",
      });
      if (err) throw err;
      setDone(true);
      setTimeout(() => { onClose(); onSubmitted?.(); }, 2500);
    } catch (e) {
      setError(e.message || "Failed to submit. Try again.");
    }
    setLoading(false);
  };

  if (done) return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,backdropFilter:"blur(12px)"}}>
      <div style={{background:"rgba(6,6,20,.98)",border:"1px solid rgba(0,255,136,.4)",borderRadius:16,padding:"36px",textAlign:"center",maxWidth:360,animation:"pop .4s cubic-bezier(.34,1.56,.64,1)"}}>
        <div style={{fontSize:48,marginBottom:12}}>✅</div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:"#00FF88",letterSpacing:2,marginBottom:8}}>REQUEST SUBMITTED!</div>
        <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:13,color:"rgba(192,200,232,.6)"}}>Your fandom will appear after admin review. Usually within 24 hours.</div>
      </div>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,backdropFilter:"blur(16px)",padding:16}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"rgba(6,6,20,.98)",border:`1px solid ${rgba(color,.5)}`,borderRadius:16,padding:"24px",width:"100%",maxWidth:420,boxShadow:`0 0 60px ${rgba(color,.15)}`,animation:"pop .4s cubic-bezier(.34,1.56,.64,1)"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:"#e0e8ff",letterSpacing:2}}>➕ REQUEST FANDOM</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",marginTop:3,letterSpacing:1}}>PENDING ADMIN APPROVAL</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#3a3a5a",cursor:"pointer",fontSize:20,lineHeight:1}}>✕</button>
        </div>

        {/* Preview */}
        <div style={{marginBottom:18,padding:"12px 14px",background:rgba(color,.08),border:`1px solid ${rgba(color,.3)}`,borderRadius:10,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:14,height:14,borderRadius:2,background:color,boxShadow:`0 0 10px ${color}`,flexShrink:0}}/>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:900,color:color,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {name.trim()||"Your Fandom Name"}
          </div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.3)",marginLeft:"auto",flexShrink:0}}>{category.split(" ")[0]}</div>
        </div>

        {/* Name */}
        <div style={{marginBottom:14}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",letterSpacing:2,marginBottom:6}}>FANDOM NAME</div>
          <input
            value={name}
            onChange={e=>setName(e.target.value)}
            placeholder="e.g. Demon Slayer, Arsenal FC, Lady Gaga..."
            maxLength={50}
            style={{width:"100%",background:"#0c0c1c",border:`1px solid ${rgba(color,.25)}`,borderRadius:8,padding:"10px 14px",color:"#e0e8ff",fontSize:13,fontFamily:"'Rajdhani',sans-serif",outline:"none"}}
          />
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#2a2a4a",marginTop:4,textAlign:"right"}}>{name.length}/50</div>
        </div>

        {/* Category */}
        <div style={{marginBottom:14}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",letterSpacing:2,marginBottom:6}}>CATEGORY</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {CATS.map(c=>{const on=category===c;return(
              <button key={c} onClick={()=>setCategory(c)} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${on?color:"rgba(255,255,255,.08)"}`,background:on?rgba(color,.15):"transparent",color:on?color:"rgba(255,255,255,.3)",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9,transition:"all .15s"}}>
                {c}
              </button>
            );})}
          </div>
        </div>

        {/* Color */}
        <div style={{marginBottom:18}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",letterSpacing:2,marginBottom:6}}>FANDOM COLOR</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
            {PRESET_COLORS.map(c=>(
              <div key={c} onClick={()=>setColor(c)} style={{width:22,height:22,borderRadius:4,background:c,cursor:"pointer",border:`2px solid ${color===c?"#fff":"transparent"}`,boxShadow:color===c?`0 0 8px ${c}`:undefined,transition:"all .15s"}}/>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <input type="color" value={color} onChange={e=>setColor(e.target.value)} style={{width:36,height:36,borderRadius:6,border:"1px solid rgba(255,255,255,.1)",background:"transparent",cursor:"pointer",padding:2}}/>
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.4)"}}>{color.toUpperCase()} — or pick custom</span>
          </div>
        </div>

        {error&&<div style={{marginBottom:12,padding:"8px 12px",background:"rgba(255,68,0,.1)",border:"1px solid rgba(255,68,0,.3)",borderRadius:6,fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#FF4400"}}>{error}</div>}

        {/* Submit */}
        <button onClick={submit} disabled={loading||!name.trim()} style={{width:"100%",padding:"13px",background:name.trim()?`linear-gradient(90deg,${color},${rgba(color,.7)})`:"rgba(255,255,255,.06)",border:"none",color:name.trim()?"#040408":"rgba(255,255,255,.2)",borderRadius:9,cursor:name.trim()?"pointer":"not-allowed",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:11,letterSpacing:1,transition:"all .2s"}}>
          {loading?"⏳ SUBMITTING...":"📨 SUBMIT FOR APPROVAL"}
        </button>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#2a2a4a",textAlign:"center",marginTop:8}}>Reviewed by admin · Usually approved within 24h</div>
      </div>
    </div>
  );
}
