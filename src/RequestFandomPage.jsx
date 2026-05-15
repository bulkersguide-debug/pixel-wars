// src/RequestFandomPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

const rgba=(hex,a)=>{try{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;}catch{return`rgba(0,0,0,${a})`;}};
const CATS=["🎮 Gaming","🎌 Anime","🎵 Music","⚽ Sports","🎬 TV & Film","Other"];
const COLORS=["#00B4F0","#9747FF","#FF4655","#62B32F","#FF6B35","#FF1493","#FFD700","#FF8C00","#00F5FF","#CC3355","#A855F7","#E31E24","#00FFAA","#FF2D78","#C8FF00"];

export default function RequestFandomPage(){
  const navigate=useNavigate();
  const [name,setName]=useState("");
  const [category,setCategory]=useState("🎮 Gaming");
  const [color,setColor]=useState("#9747FF");
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);
  const [error,setError]=useState("");

  const submit=async()=>{
    if(!name.trim()||name.trim().length<2){setError("Name must be at least 2 characters");return;}
    setLoading(true);setError("");
    try{
      const{error:err}=await supabase.from("fandom_requests").insert({name:name.trim(),category,color,status:"pending"});
      if(err)throw err;
      setDone(true);
    }catch(e){setError(e?.message||"Failed to submit. Try again.");}
    setLoading(false);
  };

  if(done)return(
    <div style={{background:"#040408",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Rajdhani',sans-serif"}}>
      <div style={{textAlign:"center",padding:"40px 20px"}}>
        <div style={{fontSize:64,marginBottom:20}}>✅</div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:20,fontWeight:900,color:"#00FF88",letterSpacing:2,marginBottom:12}}>REQUEST SUBMITTED!</div>
        <p style={{fontSize:14,color:"rgba(192,200,232,.6)",marginBottom:28}}>Your fandom will appear after admin review. Usually within 24 hours.</p>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={()=>navigate("/")} style={{padding:"12px 24px",background:"linear-gradient(90deg,#00F5FF,#C8FF00)",border:"none",color:"#040408",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:11,letterSpacing:1}}>PLAY NOW →</button>
          <button onClick={()=>{setDone(false);setName("");}} style={{padding:"12px 24px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.15)",color:"#c0c8e8",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:11}}>+ ANOTHER</button>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{background:"#040408",minHeight:"100vh",fontFamily:"'Rajdhani',sans-serif",color:"#c0c8e8"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap');*{box-sizing:border-box}`}</style>
      <div style={{background:"#06060e",borderBottom:"1px solid #1a1a30",padding:"14px 24px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>navigate("/")} style={{background:"rgba(0,245,255,.08)",border:"1px solid rgba(0,245,255,.25)",borderRadius:6,padding:"6px 14px",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#00F5FF",letterSpacing:1}}>← BACK</button>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:900,letterSpacing:3,background:"linear-gradient(90deg,#00F5FF,#C8FF00)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginLeft:"auto"}}>⚔ PIXELS OF WAR</div>
      </div>
      <div style={{maxWidth:520,margin:"0 auto",padding:"40px 20px 80px"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:36,marginBottom:10}}>➕</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:20,fontWeight:900,color:"#e0e8ff",letterSpacing:3,marginBottom:6}}>REQUEST A FANDOM</div>
          <p style={{fontSize:13,color:"rgba(192,200,232,.45)"}}>Can't find your fandom? Submit a request — usually approved within 24h.</p>
        </div>
        <div style={{marginBottom:20,padding:"12px 16px",background:rgba(color,.07),border:`2px solid ${rgba(color,.35)}`,borderRadius:10,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:14,height:14,borderRadius:3,background:color,boxShadow:`0 0 10px ${color}`,flexShrink:0}}/>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color}}>{name.trim()||"Your Fandom Name"}</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.25)",marginLeft:"auto"}}>{category}</div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",letterSpacing:2,marginBottom:6}}>FANDOM NAME *</div>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Demon Slayer, Arsenal FC, Lady Gaga..." maxLength={50} style={{width:"100%",background:"#0c0c1c",border:`1px solid ${rgba(color,.25)}`,borderRadius:8,padding:"11px 14px",color:"#e0e8ff",fontSize:14,fontFamily:"'Rajdhani',sans-serif",outline:"none"}}/>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",letterSpacing:2,marginBottom:6}}>CATEGORY</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {CATS.map(c=>{const on=category===c;return(<button key={c} onClick={()=>setCategory(c)} style={{padding:"6px 12px",borderRadius:6,border:`1px solid ${on?color:"rgba(255,255,255,.1)"}`,background:on?rgba(color,.15):"transparent",color:on?color:"rgba(255,255,255,.35)",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9}}>{c}</button>);})}
          </div>
        </div>
        <div style={{marginBottom:24}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",letterSpacing:2,marginBottom:6}}>FANDOM COLOR</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
            {COLORS.map(c=>(<div key={c} onClick={()=>setColor(c)} style={{width:26,height:26,borderRadius:4,background:c,cursor:"pointer",border:`2px solid ${color===c?"#fff":"transparent"}`,transition:"all .12s"}}/>))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <input type="color" value={color} onChange={e=>setColor(e.target.value)} style={{width:36,height:36,borderRadius:6,border:"1px solid rgba(255,255,255,.15)",background:"transparent",cursor:"pointer",padding:2}}/>
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.25)"}}>{color.toUpperCase()} — or pick custom</span>
          </div>
        </div>
        {error&&<div style={{marginBottom:14,padding:"9px 12px",background:"rgba(255,68,0,.1)",border:"1px solid rgba(255,68,0,.3)",borderRadius:7,fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#FF4400"}}>{error}</div>}
        <button onClick={submit} disabled={loading||name.trim().length<2} style={{width:"100%",padding:"14px",background:name.trim().length>=2?`linear-gradient(90deg,${color},${rgba(color,.6)})`:"rgba(255,255,255,.05)",border:"none",color:name.trim().length>=2?"#040408":"rgba(255,255,255,.15)",borderRadius:9,cursor:name.trim().length>=2?"pointer":"not-allowed",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:12,letterSpacing:2}}>
          {loading?"⏳ SUBMITTING...":"📨 SUBMIT FOR APPROVAL"}
        </button>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#2a2a4a",textAlign:"center",marginTop:8}}>Reviewed by admin · Goes live within 24h</div>
      </div>
    </div>
  );
}
