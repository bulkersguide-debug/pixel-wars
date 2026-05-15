// src/RivalriesPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

const rgba=(hex,a)=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};
const hashColor=(n)=>{let h=0;for(let i=0;i<n.length;i++)h=(Math.imul(31,h)+n.charCodeAt(i))|0;const hue=Math.abs(h)%360,sat=65,lit=55,s=sat/100,l=lit/100,a2=s*Math.min(l,1-l),f=x=>{const k=(x+hue/30)%12,c=l-a2*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,"0")};return`#${f(0)}${f(8)}${f(4)}`;};
const KC={"BTS":"#9747FF","BLACKPINK":"#FF1493","Naruto":"#FF6B35","Fortnite":"#00B4F0","Taylor Swift":"#A855F7","Minecraft":"#62B32F","Valorant":"#FF4655","One Piece":"#E31E24","Attack on Titan":"#7A6640","Drake":"#BF8E3B"};
const tc=(n)=>KC[n]||hashColor(n);

export default function RivalriesPage(){
  const navigate=useNavigate();
  const [pixels,setPixels]=useState({});
  const [loading,setLoading]=useState(true);
  const [selectedA,setSelectedA]=useState(null);
  const [selectedB,setSelectedB]=useState(null);

  useEffect(()=>{
    async function load(){
      if(supabase){
        const{data:season}=await supabase.from("seasons").select("num").order("num",{ascending:false}).limit(1);
        const sNum=season?.[0]?.num||1;
        const{data}=await supabase.from("pixels").select("idx,team_id,claimed_at").eq("season_num",sNum);
        if(data){const m={};data.forEach(r=>{m[r.idx]={t:r.team_id,at:r.claimed_at};});setPixels(m);}
      }
      setLoading(false);
    }
    load();
  },[]);

  const fandomStats=useMemo(()=>{
    const stats={};
    Object.values(pixels).forEach(p=>{
      if(!p?.t)return;
      const name=p.t.split("|")[2]||p.t;
      if(!stats[p.t])stats[p.t]={id:p.t,name,color:tc(name),count:0,cat:p.t.split("|")[0]};
      stats[p.t].count++;
    });
    return Object.values(stats).sort((a,b)=>b.count-a.count);
  },[pixels]);

  const totalPixels=Object.keys(pixels).length||1;

  const headToHead=useMemo(()=>{
    if(!selectedA||!selectedB)return null;
    const aCount=fandomStats.find(f=>f.id===selectedA)?.count||0;
    const bCount=fandomStats.find(f=>f.id===selectedB)?.count||0;
    const aRank=fandomStats.findIndex(f=>f.id===selectedA)+1;
    const bRank=fandomStats.findIndex(f=>f.id===selectedB)+1;
    return{aCount,bCount,aRank,bRank,total:aCount+bCount,winner:aCount>bCount?"A":bCount>aCount?"B":"TIE"};
  },[selectedA,selectedB,fandomStats]);

  const fA=fandomStats.find(f=>f.id===selectedA);
  const fB=fandomStats.find(f=>f.id===selectedB);

  return(
    <div style={{background:"#040408",minHeight:"100vh",fontFamily:"'Rajdhani',sans-serif",color:"#c0c8e8"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap');*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#222240;border-radius:2px}`}</style>

      {/* Header */}
      <div style={{background:"#06060e",borderBottom:"1px solid #1a1a30",padding:"14px 24px",display:"flex",alignItems:"center",gap:16}}>
        <button onClick={()=>navigate("/")} style={{background:"rgba(0,245,255,.08)",border:"1px solid rgba(0,245,255,.25)",borderRadius:6,padding:"6px 14px",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#00F5FF",letterSpacing:1}}>← BACK</button>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:900,letterSpacing:3,background:"linear-gradient(90deg,#00F5FF,#FF4400,#C8FF00)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>⚔ FANDOM RIVALRIES</div>
      </div>

      <div style={{maxWidth:900,margin:"0 auto",padding:"32px 20px 80px"}}>

        {/* Intro */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#3a3a5a",letterSpacing:3,marginBottom:8}}>SEASON 1 · HEAD-TO-HEAD</div>
          <p style={{fontSize:14,color:"rgba(192,200,232,.5)",maxWidth:500,margin:"0 auto"}}>Pick two fandoms to compare their territory, dominance, and rivalry stats.</p>
        </div>

        {/* Fandom picker */}
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:16,alignItems:"start",marginBottom:32}}>
          {/* Side A */}
          <div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:fA?.color||"#00F5FF",letterSpacing:2,marginBottom:10,textAlign:"center"}}>SIDE A {fA?`— ${fA.name}`:""}</div>
            <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:320,overflowY:"auto"}}>
              {fandomStats.slice(0,20).map((f,i)=>(
                <div key={f.id} onClick={()=>setSelectedA(f.id)} style={{padding:"8px 12px",background:selectedA===f.id?rgba(f.color,.15):"rgba(255,255,255,.03)",border:`1px solid ${selectedA===f.id?f.color:"rgba(255,255,255,.07)"}`,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all .15s"}}>
                  <div style={{width:8,height:8,borderRadius:1,background:f.color,flexShrink:0}}/>
                  <span style={{fontSize:12,fontWeight:700,color:selectedA===f.id?f.color:"#c0c8e8",flex:1}}>{f.name}</span>
                  <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:"#C8FF00"}}>{f.count}px</span>
                </div>
              ))}
            </div>
          </div>

          {/* VS */}
          <div style={{textAlign:"center",paddingTop:40}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:28,fontWeight:900,color:"#FF4400",textShadow:"0 0 20px rgba(255,68,0,.5)"}}>VS</div>
          </div>

          {/* Side B */}
          <div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:fB?.color||"#FF4400",letterSpacing:2,marginBottom:10,textAlign:"center"}}>SIDE B {fB?`— ${fB.name}`:""}</div>
            <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:320,overflowY:"auto"}}>
              {fandomStats.slice(0,20).map((f,i)=>(
                <div key={f.id} onClick={()=>setSelectedB(f.id)} style={{padding:"8px 12px",background:selectedB===f.id?rgba(f.color,.15):"rgba(255,255,255,.03)",border:`1px solid ${selectedB===f.id?f.color:"rgba(255,255,255,.07)"}`,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all .15s"}}>
                  <div style={{width:8,height:8,borderRadius:1,background:f.color,flexShrink:0}}/>
                  <span style={{fontSize:12,fontWeight:700,color:selectedB===f.id?f.color:"#c0c8e8",flex:1}}>{f.name}</span>
                  <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:"#C8FF00"}}>{f.count}px</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Head to head stats */}
        {headToHead&&fA&&fB&&<div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:16,padding:"28px 24px",marginBottom:24}}>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:900,color:"#e0e8ff",letterSpacing:3,textAlign:"center",marginBottom:24}}>HEAD-TO-HEAD</div>

          {/* Territory bar */}
          <div style={{marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontFamily:"'Orbitron',monospace",fontSize:11,color:fA.color}}>{fA.name} · {headToHead.aCount}px</span>
              <span style={{fontFamily:"'Orbitron',monospace",fontSize:11,color:fB.color}}>{fB.name} · {headToHead.bCount}px</span>
            </div>
            <div style={{height:20,borderRadius:10,overflow:"hidden",display:"flex",background:"rgba(255,255,255,.06)"}}>
              {headToHead.total>0&&<>
                <div style={{width:`${(headToHead.aCount/headToHead.total)*100}%`,background:`linear-gradient(90deg,${fA.color},${rgba(fA.color,.7)})`,transition:"width .6s ease"}}/>
                <div style={{width:`${(headToHead.bCount/headToHead.total)*100}%`,background:`linear-gradient(90deg,${rgba(fB.color,.7)},${fB.color})`,transition:"width .6s ease"}}/>
              </>}
            </div>
          </div>

          {/* Stats grid */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,textAlign:"center"}}>
            {[
              {label:"RANK",a:`#${headToHead.aRank}`,b:`#${headToHead.bRank}`,winner:headToHead.aRank<headToHead.bRank?"A":headToHead.aRank>headToHead.bRank?"B":"TIE"},
              {label:"PIXELS",a:`${headToHead.aCount}`,b:`${headToHead.bCount}`,winner:headToHead.winner},
              {label:"% OF GRID",a:`${((headToHead.aCount/totalPixels)*100).toFixed(1)}%`,b:`${((headToHead.bCount/totalPixels)*100).toFixed(1)}%`,winner:headToHead.winner},
            ].map(({label,a,b,winner})=>(
              <div key={label} style={{background:"rgba(255,255,255,.04)",borderRadius:10,padding:"14px 10px",border:"1px solid rgba(255,255,255,.06)"}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",letterSpacing:2,marginBottom:8}}>{label}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                  <div style={{flex:1,textAlign:"center"}}>
                    <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:winner==="A"?fA.color:"rgba(255,255,255,.4)"}}>{a}</div>
                    {winner==="A"&&<div style={{fontSize:9,color:fA.color,marginTop:2}}>▲ WINNING</div>}
                  </div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#2a2a4a"}}>vs</div>
                  <div style={{flex:1,textAlign:"center"}}>
                    <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:winner==="B"?fB.color:"rgba(255,255,255,.4)"}}>{b}</div>
                    {winner==="B"&&<div style={{fontSize:9,color:fB.color,marginTop:2}}>▲ WINNING</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Winner declaration */}
          <div style={{marginTop:20,textAlign:"center"}}>
            {headToHead.winner==="TIE"?(
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,color:"#FFD700",letterSpacing:2}}>⚖️ PERFECTLY BALANCED</div>
            ):(
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:900,color:headToHead.winner==="A"?fA.color:fB.color,textShadow:`0 0 20px ${headToHead.winner==="A"?fA.color:fB.color}`,letterSpacing:2}}>
                👑 {headToHead.winner==="A"?fA.name:fB.name} IS WINNING THIS RIVALRY
              </div>
            )}
          </div>
        </div>}

        {/* Top rivalries suggestion */}
        <div style={{marginTop:24}}>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:"#2a2a4a",letterSpacing:3,marginBottom:12}}>🔥 HOT RIVALRIES</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[["BTS","BLACKPINK"],["Naruto","One Piece"],["Fortnite","Valorant"],["Taylor Swift","Billie Eilish"],["BTS","Naruto"]].map(([a,b])=>{
              const fa=fandomStats.find(f=>f.name===a);const fb=fandomStats.find(f=>f.name===b);
              if(!fa||!fb)return null;
              return(
                <button key={`${a}-${b}`} onClick={()=>{setSelectedA(fa.id);setSelectedB(fb.id);}} style={{padding:"6px 14px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:20,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(192,200,232,.6)",display:"flex",alignItems:"center",gap:6}}>
                  <span style={{color:fa.color,fontWeight:700}}>{a}</span>
                  <span style={{color:"#FF4400"}}>⚔</span>
                  <span style={{color:fb.color,fontWeight:700}}>{b}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
