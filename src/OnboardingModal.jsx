// src/OnboardingModal.jsx
import { useState, useEffect } from "react";

const rgba=(hex,a)=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};
const slugify=n=>n.toLowerCase().replace(/[^a-z0-9\s]/g,"").replace(/\s+/g,"-").trim();

const FANDOMS=[
  {id:"🎮 Gaming|Battle Royale|Fortnite",     name:"Fortnite",     color:"#00B4F0",cat:"🎮 Gaming"},
  {id:"🎌 Anime|Shonen|Naruto",               name:"Naruto",       color:"#FF6B35",cat:"🎌 Anime"},
  {id:"🎵 Music|K-Pop|BTS",                   name:"BTS",          color:"#9747FF",cat:"🎵 Music"},
  {id:"🎵 Music|K-Pop|BLACKPINK",             name:"BLACKPINK",    color:"#FF1493",cat:"🎵 Music"},
  {id:"🎵 Music|Pop|Taylor Swift",            name:"Taylor Swift", color:"#A855F7",cat:"🎵 Music"},
  {id:"🎮 Gaming|RPG|Minecraft",              name:"Minecraft",    color:"#62B32F",cat:"🎮 Gaming"},
  {id:"🎌 Anime|Dark|Attack on Titan",        name:"Attack on Titan",color:"#7A6640",cat:"🎌 Anime"},
  {id:"🎌 Anime|Shonen|One Piece",            name:"One Piece",    color:"#E31E24",cat:"🎌 Anime"},
  {id:"🎮 Gaming|Shooter|Valorant",           name:"Valorant",     color:"#FF4655",cat:"🎮 Gaming"},
  {id:"🎵 Music|Hip-Hop|Drake",               name:"Drake",        color:"#BF8E3B",cat:"🎵 Music"},
  {id:"🎌 Anime|Shonen|Demon Slayer",         name:"Demon Slayer", color:"#CC3355",cat:"🎌 Anime"},
  {id:"🎵 Music|Pop|Billie Eilish",           name:"Billie Eilish",color:"#00DD88",cat:"🎵 Music"},
  {id:"🎮 Gaming|RPG|Elden Ring",             name:"Elden Ring",   color:"#B0884A",cat:"🎮 Gaming"},
  {id:"🎵 Music|K-Pop|Stray Kids",            name:"Stray Kids",   color:"#CC0033",cat:"🎵 Music"},
  {id:"🎌 Anime|Shonen|Jujutsu Kaisen",       name:"Jujutsu Kaisen",color:"#6B21A8",cat:"🎌 Anime"},
  {id:"🎮 Gaming|Battle Royale|Apex Legends", name:"Apex Legends", color:"#DA292A",cat:"🎮 Gaming"},
  {id:"🎵 Music|Hip-Hop|Kendrick Lamar",      name:"Kendrick Lamar",color:"#CC0000",cat:"🎵 Music"},
  {id:"🎌 Anime|Shonen|Dragon Ball Z",        name:"Dragon Ball Z",color:"#FF8C00",cat:"🎌 Anime"},
  {id:"🎵 Music|K-Pop|TWICE",                 name:"TWICE",        color:"#FF9EC4",cat:"🎵 Music"},
  {id:"🎮 Gaming|Open World|GTA V",           name:"GTA V",        color:"#00853E",cat:"🎮 Gaming"},
  {id:"🎵 Music|Pop|Ariana Grande",           name:"Ariana Grande",color:"#CC88BB",cat:"🎵 Music"},
  {id:"🎌 Anime|Dark|Death Note",             name:"Death Note",   color:"#CC0000",cat:"🎌 Anime"},
  {id:"🎮 Gaming|RPG|Genshin Impact",         name:"Genshin Impact",color:"#0095FF",cat:"🎮 Gaming"},
  {id:"🎵 Music|Hip-Hop|The Weeknd",          name:"The Weeknd",   color:"#CC0000",cat:"🎵 Music"},
];

const CATS=["All","🎮 Gaming","🎌 Anime","🎵 Music"];

const STEPS=[
  {id:"welcome"},
  {id:"pick"},
  {id:"howto"},
];

// Tiny animated pixel grid
function PixelGrid(){
  const cells=[
    "#00B4F0","#9747FF","#FF4655","#62B32F","#FF6B35",
    "#FF1493","#FFD700","#00B4F0","#CC3355","#FF8C00",
    "#A855F7","#E31E24","#9747FF","#62B32F","#FF4655",
    "#FFD700","#FF1493","#FF6B35","#00B4F0","#CC0033",
    "#FF4655","#62B32F","#A855F7","#FF8C00","#9747FF",
  ];
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:3,opacity:.7}}>
      {cells.map((c,i)=>(
        <div key={i} style={{width:14,height:14,background:c,borderRadius:2,animation:`pulse ${1.5+Math.random()*2}s ease-in-out infinite`,animationDelay:`${Math.random()*2}s`}}/>
      ))}
    </div>
  );
}

export default function OnboardingModal({allFandoms,onComplete,onSkip}){
  const [step,setStep]=useState(0);
  const [selected,setSelected]=useState(null);
  const [cat,setCat]=useState("All");
  const [q,setQ]=useState("");
  const [animating,setAnimating]=useState(false);

  const go=(next)=>{
    setAnimating(true);
    setTimeout(()=>{setStep(next);setAnimating(false);},280);
  };

  const filtered=(q.trim().length>1
    ? FANDOMS.filter(f=>f.name.toLowerCase().includes(q.toLowerCase()))
    : cat==="All" ? FANDOMS : FANDOMS.filter(f=>f.cat===cat)
  );

  const finish=()=>{
    localStorage.setItem("pow_onboarded","1");
    onComplete(selected);
  };

  const skip=()=>{
    localStorage.setItem("pow_onboarded","1");
    onSkip();
  };

  const accent=selected?.color||"#00F5FF";

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,backdropFilter:"blur(20px)",padding:"12px"}}>
      <div style={{
        background:"rgba(6,6,20,.98)",
        border:`1px solid ${rgba(accent,.5)}`,
        borderRadius:20,
        width:"100%",
        maxWidth:480,
        maxHeight:"92vh",
        overflow:"hidden",
        display:"flex",
        flexDirection:"column",
        boxShadow:`0 0 80px ${rgba(accent,.2)},0 30px 60px rgba(0,0,0,.7)`,
        animation:animating?"none":"pop .4s cubic-bezier(.34,1.56,.64,1)",
        opacity:animating?0:1,
        transition:"opacity .28s ease",
      }}>

        {/* Progress dots */}
        <div style={{display:"flex",justifyContent:"center",gap:6,padding:"16px 0 0"}}>
          {STEPS.map((_,i)=>(
            <div key={i} style={{width:i===step?24:6,height:6,borderRadius:3,background:i===step?accent:rgba(accent,.25),transition:"all .3s"}}/>
          ))}
        </div>

        {/* ── STEP 0: WELCOME ── */}
        {step===0&&<div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 28px 28px",textAlign:"center",overflowY:"auto"}}>
          <div style={{marginBottom:20}}><PixelGrid/></div>

          <div style={{fontFamily:"'Orbitron',monospace",fontSize:28,fontWeight:900,letterSpacing:3,background:`linear-gradient(90deg,#00F5FF,#C8FF00,#FF4400)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8,lineHeight:1.1}}>
            PIXELS OF WAR
          </div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"rgba(255,255,255,.4)",letterSpacing:3,marginBottom:24}}>
            FANDOMS · TERRITORY · WAR
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28,width:"100%",maxWidth:340}}>
            {[
              {icon:"🏴",title:"CLAIM",desc:"Buy pixels on the grid for your fandom"},
              {icon:"⚔️",title:"RAID",desc:"Steal enemy territory in RAID mode"},
              {icon:"👑",title:"DOMINATE",desc:"Top fandom at season end wins forever"},
            ].map(({icon,title,desc})=>(
              <div key={title} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:10,textAlign:"left"}}>
                <span style={{fontSize:22,flexShrink:0}}>{icon}</span>
                <div>
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:"#00F5FF",letterSpacing:1,marginBottom:2}}>{title}</div>
                  <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:12,color:"rgba(255,255,255,.5)"}}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={()=>go(1)} style={{width:"100%",maxWidth:340,padding:"14px",background:"linear-gradient(90deg,#00F5FF,#C8FF00)",border:"none",color:"#040408",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:13,letterSpacing:2}}>
            JOIN THE WAR →
          </button>
          <button onClick={skip} style={{marginTop:10,background:"none",border:"none",color:"rgba(255,255,255,.2)",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:1}}>
            skip intro
          </button>
        </div>}

        {/* ── STEP 1: PICK FANDOM ── */}
        {step===1&&<div style={{flex:1,display:"flex",flexDirection:"column",padding:"16px 16px 0",overflow:"hidden"}}>
          <div style={{textAlign:"center",marginBottom:14,flexShrink:0}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:900,color:"#00F5FF",letterSpacing:2,marginBottom:4}}>PICK YOUR SIDE</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.3)"}}>Who do you fight for?</div>
          </div>

          {/* Search */}
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search fandoms…"
            style={{width:"100%",background:"#0c0c1c",border:"1px solid rgba(0,245,255,.2)",borderRadius:8,padding:"9px 12px",color:"#b0b8e0",fontSize:13,fontFamily:"'Rajdhani',sans-serif",outline:"none",marginBottom:8,flexShrink:0}}/>

          {/* Category filter */}
          <div style={{display:"flex",gap:5,marginBottom:10,flexShrink:0,overflowX:"auto",paddingBottom:2}}>
            {CATS.map(c=>{const on=cat===c;return(
              <button key={c} onClick={()=>{setCat(c);setQ("");}} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${on?"#00F5FF":"rgba(0,245,255,.15)"}`,background:on?"rgba(0,245,255,.12)":"transparent",color:on?"#00F5FF":"rgba(0,245,255,.4)",fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>
                {c}
              </button>
            );})}
          </div>

          {/* Fandom grid */}
          <div style={{flex:1,overflowY:"auto",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6,paddingBottom:12}}>
            {filtered.map(f=>{const isSel=selected?.id===f.id;return(
              <div key={f.id} onClick={()=>setSelected(f)} style={{
                padding:"10px 12px",borderRadius:9,cursor:"pointer",
                border:`2px solid ${isSel?f.color:rgba(f.color,.25)}`,
                background:isSel?rgba(f.color,.15):"rgba(255,255,255,.03)",
                display:"flex",alignItems:"center",gap:8,
                transition:"all .15s",
                boxShadow:isSel?`0 0 16px ${rgba(f.color,.3)}`:"none",
              }}>
                <div style={{width:10,height:10,borderRadius:2,background:f.color,flexShrink:0,boxShadow:isSel?`0 0 8px ${f.color}`:undefined}}/>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:11,color:isSel?f.color:"#c0c8e8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.25)"}}>{f.cat.split(" ")[0]}</div>
                </div>
                {isSel&&<span style={{marginLeft:"auto",fontSize:14,flexShrink:0}}>✓</span>}
              </div>
            );})}
          </div>

          {/* Selected preview + next */}
          <div style={{flexShrink:0,padding:"10px 0 16px",borderTop:"1px solid rgba(255,255,255,.06)"}}>
            {selected?(
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,padding:"8px 12px",background:rgba(selected.color,.08),border:`1px solid ${rgba(selected.color,.3)}`,borderRadius:8}}>
                <div style={{width:12,height:12,borderRadius:2,background:selected.color,boxShadow:`0 0 8px ${selected.color}`}}/>
                <span style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:selected.color}}>Fighting for {selected.name}</span>
              </div>
            ):(
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.2)",textAlign:"center",marginBottom:10}}>Select a fandom above</div>
            )}
            <button onClick={()=>selected&&go(2)} style={{width:"100%",padding:"13px",background:selected?`linear-gradient(90deg,${selected.color},${rgba(selected.color,.7)})`:"rgba(255,255,255,.06)",border:"none",color:selected?"#040408":"rgba(255,255,255,.2)",borderRadius:9,cursor:selected?"pointer":"not-allowed",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:11,letterSpacing:1,transition:"all .2s"}}>
              {selected?"ENTER THE WAR →":"SELECT A FANDOM"}
            </button>
          </div>
        </div>}

        {/* ── STEP 2: HOW TO PLAY ── */}
        {step===2&&<div style={{flex:1,display:"flex",flexDirection:"column",padding:"20px 20px 24px",overflowY:"auto"}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:900,color:selected?.color||"#00F5FF",letterSpacing:2,marginBottom:4}}>HOW TO PLAY</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.3)"}}>3 things to know</div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
            {[
              {num:"01",icon:"🖱️",title:"DRAG TO SELECT",desc:"On the grid — click and drag to select pixels. The bigger the area, the more it costs.",color:"#00F5FF"},
              {num:"02",icon:"💳",title:"PAY TO CLAIM",desc:"Hit CLAIM to lock in your pixels. Price depends on location and how full the sector is.",color:"#C8FF00"},
              {num:"03",icon:"⚔️",title:"RAID ENEMIES",desc:"Switch to RAID mode to steal unshielded enemy pixels. Freshly claimed pixels are protected for 24h.",color:"#FF4400"},
              {num:"04",icon:"🔥",title:"LOG IN DAILY",desc:"Daily login gives free pixels. 7-day streak = bonus reward. Don't break the chain.",color:"#FFD700"},
              {num:"05",icon:"🤝",title:"FORM ALLIANCES",desc:"Ally with other fandoms — you can't raid each other. Or betray them for maximum drama.",color:"#00FFAA"},
            ].map(({num,icon,title,desc,color})=>(
              <div key={num} style={{display:"flex",gap:12,padding:"12px 14px",background:rgba(color,.05),border:`1px solid ${rgba(color,.2)}`,borderRadius:10}}>
                <span style={{fontSize:24,flexShrink:0,lineHeight:1}}>{icon}</span>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                    <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:rgba(color,.5)}}>{num}</span>
                    <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:color,letterSpacing:1}}>{title}</span>
                  </div>
                  <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:12,color:"rgba(255,255,255,.5)",lineHeight:1.5}}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {selected&&<div style={{padding:"10px 14px",background:rgba(selected.color,.08),border:`1px solid ${rgba(selected.color,.3)}`,borderRadius:10,display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <div style={{width:10,height:10,borderRadius:2,background:selected.color,boxShadow:`0 0 8px ${selected.color}`}}/>
            <span style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:selected.color}}>Ready to fight for {selected.name}</span>
          </div>}

          <button onClick={finish} style={{width:"100%",padding:"14px",background:`linear-gradient(90deg,${selected?.color||"#00F5FF"},${rgba(selected?.color||"#00F5FF",.7)})`,border:"none",color:"#040408",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:13,letterSpacing:2}}>
            ⚔️ START PLAYING →
          </button>
        </div>}

      </div>
    </div>
  );
}
