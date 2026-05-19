// src/OnboardingModal.jsx
import{useState}from"react";

const STEPS=[
  {
    icon:"⚔️",
    title:"WELCOME TO\nPIXELS OF WAR",
    sub:"The ultimate fandom territory battle",
    body:"Thousands of fans fight for control of a shared pixel map. Every pixel is a battle. Every sector is a war. One fandom will rule them all.",
    cta:"SHOW ME HOW",
    visual:"map"
  },
  {
    icon:"🏴",
    title:"CLAIM YOUR\nTERRITORY",
    sub:"Place pixels. Capture sectors. Dominate the map.",
    body:"Choose your fandom. Drag to claim pixels. Fill a sector to unlock the next one. The more territory you hold, the higher your fandom ranks.",
    cta:"WHAT ELSE?",
    visual:"claim"
  },
  {
    icon:"⚔",
    title:"RAID YOUR\nENEMIES",
    sub:"Steal pixels. Start wars. Form alliances.",
    body:"Switch to RAID mode to steal enemy pixels. Earn War Chest gold by holding territory. Use gold to launch massive raids. Form alliances — or betray them.",
    cta:"AND THE PRIZE?",
    visual:"raid"
  },
  {
    icon:"🏆",
    title:"WIN THE\nSEASON",
    sub:"Season 1 is live. 90 days to dominate.",
    body:"The fandom controlling the most territory when Season 1 ends becomes the first Pixels of War Champion. Rankings reset each season — so every war matters.",
    cta:"LET'S FIGHT →",
    visual:"trophy"
  },
];

const rgba=(hex,a)=>{
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
};

function MapVisual(){
  const cells=Array.from({length:100},(_,i)=>{
    const colors=["#FF6B00","#C845F0","#00E5FF","#FF1493","#76C442","#F0A500"];
    const r=Math.random();
    if(r<0.15)return colors[Math.floor(Math.random()*colors.length)];
    return null;
  });
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:2,padding:8,background:"rgba(0,0,0,.3)",borderRadius:8,border:"1px solid rgba(0,245,255,.15)"}}>
      {cells.map((c,i)=>(
        <div key={i} style={{aspectRatio:"1",borderRadius:2,background:c||"rgba(255,255,255,.04)",boxShadow:c?`0 0 4px ${c}88`:undefined,animation:c?"pulse 2s infinite":undefined,animationDelay:`${i*0.05}s`}}/>
      ))}
    </div>
  );
}

function ClaimVisual(){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"center"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:3}}>
        {Array.from({length:25},(_,i)=>{
          const owned=[6,7,11,12,13];
          const pending=[2,3,8];
          const isOwned=owned.includes(i);
          const isPending=pending.includes(i);
          return(
            <div key={i} style={{width:28,height:28,borderRadius:3,background:isOwned?"#00E5FF":isPending?"rgba(0,229,255,.4)":"rgba(255,255,255,.05)",border:isPending?"2px solid #00E5FF":isOwned?"none":"1px solid rgba(255,255,255,.08)",boxShadow:isOwned?"0 0 8px #00E5FF88":undefined,transition:"all .3s"}}/>
          );
        })}
      </div>
      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(0,229,255,.7)",letterSpacing:1}}>DRAG TO SELECT · RELEASE TO CLAIM</div>
    </div>
  );
}

function RaidVisual(){
  return(
    <div style={{display:"flex",gap:16,alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:2,marginBottom:4}}>
          {Array.from({length:9},(_,i)=>(
            <div key={i} style={{width:24,height:24,borderRadius:2,background:"#FF1493",boxShadow:"0 0 6px #FF149388"}}/>
          ))}
        </div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:7,color:"#FF1493"}}>BLACKPINK</div>
      </div>
      <div style={{fontSize:24,animation:"pulse 1s infinite"}}>⚔️</div>
      <div style={{textAlign:"center"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:2,marginBottom:4}}>
          {Array.from({length:9},(_,i)=>(
            <div key={i} style={{width:24,height:24,borderRadius:2,background:i<4?"#FF6B00":"rgba(255,255,255,.06)",boxShadow:i<4?"0 0 6px #FF6B0088":undefined}}/>
          ))}
        </div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:7,color:"#FF6B00"}}>NARUTO</div>
      </div>
    </div>
  );
}

function TrophyVisual(){
  return(
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:8,filter:"drop-shadow(0 0 20px #FFD700)"}}>🏆</div>
      <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:"#FFD700",letterSpacing:2,marginBottom:4}}>SEASON 1 CHAMPION</div>
      <div style={{display:"flex",gap:6,justifyContent:"center"}}>
        {["#FF6B00","#C845F0","#00E5FF","#FF1493","#76C442"].map((c,i)=>(
          <div key={i} style={{width:16,height:i===0?40:i===1?30:i===2?24:i===3?20:16,background:c,borderRadius:"3px 3px 0 0",boxShadow:`0 0 8px ${c}`,alignSelf:"flex-end"}}/>
        ))}
      </div>
    </div>
  );
}

export default function OnboardingModal({onComplete,onSkip}){
  const[step,setStep]=useState(0);
  const s=STEPS[step];
  const isLast=step===STEPS.length-1;

  const handleCTA=()=>{
    if(isLast){
      localStorage.setItem("pow_onboarded","1");
      if(onComplete)onComplete(null);
    }else{
      setStep(s=>s+1);
    }
  };

  const handleSkip=()=>{
    localStorage.setItem("pow_onboarded","1");
    if(onSkip)onSkip();
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,backdropFilter:"blur(20px)",padding:16}}>
      <div style={{background:"linear-gradient(135deg,#06060f,#0a0a1a)",border:"1px solid rgba(0,245,255,.2)",borderRadius:16,padding:"28px 24px",maxWidth:380,width:"100%",boxShadow:"0 0 60px rgba(0,245,255,.1)",position:"relative"}}>

        {/* Step dots */}
        <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:20}}>
          {STEPS.map((_,i)=>(
            <div key={i} onClick={()=>i<step&&setStep(i)} style={{width:i===step?24:8,height:8,borderRadius:4,background:i===step?"#00F5FF":i<step?"rgba(0,245,255,.4)":"rgba(255,255,255,.1)",transition:"all .3s",cursor:i<step?"pointer":"default"}}/>
          ))}
        </div>

        {/* Icon */}
        <div style={{textAlign:"center",fontSize:36,marginBottom:12,filter:`drop-shadow(0 0 16px rgba(0,245,255,.5))`}}>{s.icon}</div>

        {/* Title */}
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,color:"#fff",textAlign:"center",letterSpacing:2,marginBottom:6,lineHeight:1.2,whiteSpace:"pre-line"}}>{s.title}</div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(0,245,255,.7)",textAlign:"center",letterSpacing:2,marginBottom:16}}>{s.sub}</div>

        {/* Visual */}
        <div style={{margin:"16px 0",display:"flex",justifyContent:"center"}}>
          {s.visual==="map"&&<MapVisual/>}
          {s.visual==="claim"&&<ClaimVisual/>}
          {s.visual==="raid"&&<RaidVisual/>}
          {s.visual==="trophy"&&<TrophyVisual/>}
        </div>

        {/* Body */}
        <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:13,color:"rgba(255,255,255,.65)",textAlign:"center",lineHeight:1.6,marginBottom:20}}>{s.body}</div>

        {/* CTA */}
        <button onClick={handleCTA} style={{width:"100%",padding:"14px",background:isLast?"linear-gradient(90deg,#FF4400,#FF2D78)":"linear-gradient(90deg,#00F5FF22,#00F5FF11)",border:`2px solid ${isLast?"#FF2D78":"#00F5FF"}`,borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:900,color:isLast?"#fff":"#00F5FF",letterSpacing:2,transition:"all .2s",boxShadow:isLast?"0 0 20px rgba(255,45,120,.3)":"0 0 20px rgba(0,245,255,.1)"}}>
          {s.cta}
        </button>

        {/* Skip */}
        {!isLast&&<button onClick={handleSkip} style={{display:"block",width:"100%",marginTop:10,background:"none",border:"none",color:"rgba(255,255,255,.2)",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:1}}>SKIP INTRO</button>}
      </div>
    </div>
  );
}
