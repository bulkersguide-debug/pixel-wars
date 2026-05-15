// src/RequestFandomPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

const rgba=(hex,a)=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};

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
    if(name.trim().length>50){setError("Name must be under 50 characters");return;}
    setLoading(true);setError("");
    try{
      const{error:err}=await supabase.from("fandom_requests").insert({name:name.trim(),category,color,status:"pending"});
      if(err)throw err;
      setDone(true);
    }catch(e){setError(e.message||"Failed to submit. Try again.");}
    setLoading(false);
  };

  return(
    <div style={{background:"#040408",minHeight:"100vh",fontFamily:"'Rajdhani',sans-serif",color:"#c0c8e8"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap');*{box-sizing:border-box}`}</style>

      {/* Header */}
      <div style={{background:"#06060e",borderBottom:"1px solid #1a1a30",padding:"14px 24px",display:"flex",alignItems:"center",gap:16}}>
        <button onClick={()=>navigate("/")} style={{background:"rgba(0,245,255,.08)",border:"1px solid rgba(0,245,255,.25)",borderRadius:6,padding:"6px 14px",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#00F5FF",letterSpacing:1}}>← BACK TO GAME</button>
        <button onClick={()=>navigate("/fandoms")} style={{background:"transparent",border:"1px solid rgba(255,255,255,.1)",borderRadius:6,padding:"6px 14px",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#3a3a5a",letterSpacing:1}}>ALL FANDOMS</button>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,letterSpacing:3,background:"linear-gradient(90deg,#00F5FF,#C8FF00)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginLeft:"auto"}}>⚔ PIXELS OF WAR</div>
      </div>

      <div style={{maxWidth:560,margin:"0 auto",padding:"48px 20px 80px"}}>

        {done?(
          <div style={{textAlign:"center",padding:"60px 20px"}}>
            <div style={{fontSize:64,marginBottom:20}}>✅</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:20,fontWeight:900,color:"#00FF88",letterSpacing:2,marginBottom:12}}>REQUEST SUBMITTED!</div>
            <p style={{fontSize:14,color:"rgba(192,200,232,.6)",marginBottom:28}}>Your fandom will appear in the game after admin review. Usually within 24 hours.</p>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>navigate("/")} style={{padding:"12px 24px",background:"linear-gradient(90deg,#00F5FF,#C8FF00)",border:"none",color:"#040408",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:11,letterSpacing:1}}>⚔️ PLAY NOW</button>
              <button onClick={()=>{setDone(false);setName("");}} style={{padding:"12px 24px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.15)",color:"#c0c8e8",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:11,letterSpacing:1}}>+ ANOTHER</button>
            </div>
          </div>
        ):(
          <>
            {/* Title */}
            <div style={{textAlign:"center",marginBottom:36}}>
              <div style={{fontSize:40,marginBottom:12}}>➕</div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:900,color:"#e0e8ff",letterSpacing:3,marginBottom:8}}>REQUEST A FANDOM</div>
              <p style={{fontSize:13,color:"rgba(192,200,232,.5)",maxWidth:400,margin:"0 auto"}}>Can't find your fandom? Submit a request and we'll add it to the war within 24 hours.</p>
            </div>

            {/* Preview card */}
            <div style={{marginBottom:24,padding:"14px 18px",background:rgba(color,.08),border:`2px solid ${rgba(color,.4)}`,borderRadius:12,display:"flex",alignItems:"center",gap:12,boxShadow:`0 0 30px ${rgba(color,.1)}`}}>
              <div style={{width:16,height:16,borderRadius:3,background:color,boxShadow:`0 0 12px ${color}`,flexShrink:0}}/>
              <div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:900,color:color}}>{name.trim()||"Your Fandom Name"}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.3)",marginTop:2}}>{category}</div>
              </div>
              <div style={{marginLeft:"auto",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.2)"}}>PREVIEW</div>
            </div>

            {/* Name */}
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a3a5a",letterSpacing:2,marginBottom:8}}>FANDOM NAME *</div>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Demon Slayer, Arsenal FC, Lady Gaga..." maxLength={50}
                style={{width:"100%",background:"#0c0c1c",border:`1px solid ${rgba(color,.3)}`,borderRadius:8,padding:"12px 16px",color:"#e0e8ff",fontSize:14,fontFamily:"'Rajdhani',sans-serif",outline:"none"}}/>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#2a2a4a",marginTop:4,textAlign:"right"}}>{name.length}/50</div>
            </div>

            {/* Category */}
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a3a5a",letterSpacing:2,marginBottom:8}}>CATEGORY</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {CATS.map(c=>{const on=category===c;return(
                  <button key={c} onClick={()=>setCategory(c)} style={{padding:"7px 14px",borderRadius:7,border:`1px solid ${on?color:"rgba(255,255,255,.1)"}`,background:on?rgba(color,.15):"transparent",color:on?color:"rgba(255,255,255,.4)",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:10,transition:"all .15s"}}>
                    {c}
                  </button>
                );})}
              </div>
            </div>

            {/* Color */}
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a3a5a",letterSpacing:2,marginBottom:8}}>FANDOM COLOR</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                {COLORS.map(c=>(
                  <div key={c} onClick={()=>setColor(c)} style={{width:28,height:28,borderRadius:5,background:c,cursor:"pointer",border:`2px solid ${color===c?"#fff":"transparent"}`,boxShadow:color===c?`0 0 10px ${c}`:undefined,transition:"all .15s"}}/>
                ))}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <input type="color" value={color} onChange={e=>setColor(e.target.value)} style={{width:40,height:40,borderRadius:8,border:"1px solid rgba(255,255,255,.15)",background:"transparent",cursor:"pointer",padding:3}}/>
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"rgba(255,255,255,.3)"}}>{color.toUpperCase()} — or pick any custom color</span>
              </div>
            </div>

            {error&&<div style={{marginBottom:16,padding:"10px 14px",background:"rgba(255,68,0,.1)",border:"1px solid rgba(255,68,0,.3)",borderRadius:8,fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#FF4400"}}>{error}</div>}

            <button onClick={submit} disabled={loading||!name.trim()} style={{width:"100%",padding:"15px",background:name.trim()?`linear-gradient(90deg,${color},${rgba(color,.7)})`:"rgba(255,255,255,.06)",border:"none",color:name.trim()?"#040408":"rgba(255,255,255,.2)",borderRadius:10,cursor:name.trim()?"pointer":"not-allowed",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:13,letterSpacing:2,transition:"all .2s"}}>
              {loading?"⏳ SUBMITTING...":"📨 SUBMIT FOR APPROVAL"}
            </button>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#2a2a4a",textAlign:"center",marginTop:10}}>Reviewed by admin · Approved fandoms go live within 24h</div>
          </>
        )}
      </div>
    </div>
  );
}
