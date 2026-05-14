import { useState, useEffect, useRef, useMemo, useCallback } from "react";

const GW=100,GH=65,CELL=7,TOTAL=GW*GH,CW=GW*CELL,CH=GH*CELL;
const hashColor=(n)=>{let h=0;for(let i=0;i<n.length;i++)h=(Math.imul(31,h)+n.charCodeAt(i))|0;const hue=Math.abs(h)%360,sat=65+(Math.abs(h>>8)%25),lit=50+(Math.abs(h>>16)%15),s=sat/100,l=lit/100,a=s*Math.min(l,1-l),f=x=>{const k=(x+hue/30)%12,c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,"0")};return`#${f(0)}${f(8)}${f(4)}`;};
const KC={"Fortnite":"#00B4F0","Minecraft":"#62B32F","Valorant":"#FF4655","Apex Legends":"#DA292A","League of Legends":"#0BC4E3","GTA V":"#00853E","Among Us":"#C51111","Rocket League":"#0092CF","Overwatch 2":"#F99E1A","Elden Ring":"#B0884A","Cyberpunk 2077":"#FCEE09","God of War":"#AA0000","Genshin Impact":"#0095FF","Pokémon":"#FFCB05","FIFA / EA FC 24":"#2980B9","Naruto":"#FF6B35","One Piece":"#E31E24","Dragon Ball Z":"#FF8C00","Bleach":"#3355BB","My Hero Academia":"#2E86C1","Demon Slayer":"#CC3355","Jujutsu Kaisen":"#6B21A8","Chainsaw Man":"#CC1122","Attack on Titan":"#7A6640","Death Note":"#CC0000","One Punch Man":"#FFD700","Haikyuu!!":"#FF6600","Blue Lock":"#1B3FA0","Spirited Away":"#CC6699","BTS":"#9747FF","BLACKPINK":"#FF1493","Stray Kids":"#CC0033","Aespa":"#00AAFF","NewJeans":"#FF6699","IVE":"#3355AA","TWICE":"#FF9EC4","NCT 127":"#00AACC","Drake":"#BF8E3B","Travis Scott":"#C7A444","Kendrick Lamar":"#CC0000","Eminem":"#5C8AFF","Taylor Swift":"#A855F7","Billie Eilish":"#00DD88","Ariana Grande":"#CC88BB","Dua Lipa":"#9900FF","Olivia Rodrigo":"#6622BB","The Weeknd":"#CC0000","Bruno Mars":"#CC8800","Bad Bunny":"#00CC44","Daft Punk":"#FFD700","Skrillex":"#00FF88","Martin Garrix":"#0066FF","Linkin Park":"#8C1C1C","Metallica":"#777777","Arctic Monkeys":"#885522","Twenty One Pilots":"#FFCC00","Tame Impala":"#FF9900"};
const tc=(n)=>KC[n]||hashColor(n);
const cv=(hex)=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);if(0.299*r+0.587*g+0.114*b<65){const f=0.48;return[r,g,b].map(v=>Math.round(v+(255-v)*f).toString(16).padStart(2,"0")).join("");}return hex.slice(1);};
const rgba=(hex,a)=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};

const CAT_ACCENT={"🎮 Gaming":"#00F5FF","🎌 Anime":"#FF2D78","🎵 Music":"#C8FF00"};
const CAT=[
  {cat:"🎮 Gaming",sub:"Battle Royale",t:["Fortnite","Apex Legends","PUBG","Warzone","Fall Guys"]},
  {cat:"🎮 Gaming",sub:"Shooter",t:["Valorant","Overwatch 2","Call of Duty","Halo Infinite"]},
  {cat:"🎮 Gaming",sub:"RPG",t:["Elden Ring","Cyberpunk 2077","God of War","Genshin Impact","Pokémon"]},
  {cat:"🎮 Gaming",sub:"Open World",t:["Minecraft","GTA V","Roblox","Among Us","Rocket League"]},
  {cat:"🎮 Gaming",sub:"Sports",t:["FIFA / EA FC 24","NBA 2K24","Rocket League"]},
  {cat:"🎌 Anime",sub:"Shonen",t:["Naruto","One Piece","Dragon Ball Z","Bleach","My Hero Academia","Demon Slayer","Jujutsu Kaisen","Chainsaw Man","One Punch Man"]},
  {cat:"🎌 Anime",sub:"Dark",t:["Attack on Titan","Death Note","Fullmetal Alchemist: Brotherhood","Neon Genesis Evangelion"]},
  {cat:"🎌 Anime",sub:"Sports & Fun",t:["Haikyuu!!","Blue Lock","Spy x Family","Bocchi the Rock"]},
  {cat:"🎌 Anime",sub:"Ghibli",t:["Spirited Away","Princess Mononoke","My Neighbor Totoro","Howl's Moving Castle"]},
  {cat:"🎵 Music",sub:"Hip-Hop",t:["Drake","Travis Scott","Kendrick Lamar","Eminem","Tyler, the Creator","Post Malone","The Weeknd"]},
  {cat:"🎵 Music",sub:"K-Pop",t:["BTS","BLACKPINK","Stray Kids","Aespa","NewJeans","IVE","TWICE","NCT 127","ATEEZ"]},
  {cat:"🎵 Music",sub:"Pop",t:["Taylor Swift","Billie Eilish","Ariana Grande","Dua Lipa","Olivia Rodrigo","Bruno Mars","Sabrina Carpenter"]},
  {cat:"🎵 Music",sub:"Electronic",t:["Daft Punk","Skrillex","Martin Garrix","Calvin Harris","Avicii","Marshmello"]},
  {cat:"🎵 Music",sub:"Latin",t:["Bad Bunny","J Balvin","Karol G","Rosalía","Peso Pluma"]},
  {cat:"🎵 Music",sub:"Rock",t:["Linkin Park","My Chemical Romance","Arctic Monkeys","Twenty One Pilots","Tame Impala","Metallica"]},
];

const ALL=[];
CAT.forEach(e=>e.t.forEach(n=>ALL.push({id:`${e.cat}|${e.sub}|${n}`,name:n,color:tc(n),cat:e.cat,sub:e.sub})));
const TM=Object.fromEntries(ALL.map(t=>[t.id,t]));

const POWERUPS=[
  {id:"bomb",icon:"💣",name:"CLUSTER BOMB",desc:"Destroy a random 6×6 enemy zone",price:10,color:"#FF4400",rarity:"RARE"},
  {id:"storm",icon:"⚡",name:"PIXEL STORM",desc:"Claim 25 random empty pixels",price:15,color:"#FFCC00",rarity:"EPIC"},
  {id:"shield",icon:"🛡️",name:"FORTRESS",desc:"Protect your pixels from raids",price:8,color:"#00AAFF",rarity:"UNCOMMON"},
  {id:"snipe",icon:"🎯",name:"SNIPER",desc:"Steal any single enemy pixel",price:3,color:"#FF2D78",rarity:"COMMON"},
  {id:"airdrop",icon:"🪂",name:"AIRDROP",desc:"Claim a 10×10 zone at 50% off",price:20,color:"#C8FF00",rarity:"LEGENDARY"},
  {id:"double",icon:"✨",name:"DOUBLE OR NOTHING",desc:"Gamble your last purchase 2× or 0×",price:5,color:"#BB88FF",rarity:"UNCOMMON"},
];
const RARITY_COLOR={COMMON:"#aaaaaa",UNCOMMON:"#00CC44",RARE:"#0088FF",EPIC:"#AA00FF",LEGENDARY:"#FFD700"};

const EVENTS=[
  {icon:"⚡",label:"CHAOS HOUR",desc:"RAIDS cost 50% OFF!",duration:600,color:"#FF4400"},
  {icon:"💎",label:"MEGA BONUS",desc:"Buy 10px → get 5 FREE!",duration:300,color:"#FFD700"},
  {icon:"🔥",label:"FRENZY MODE",desc:"Double territory for 3 minutes!",duration:180,color:"#FF6B35"},
  {icon:"👑",label:"CROWN BATTLE",desc:"Top fandom wins 50px bonus!",duration:900,color:"#FFD700"},
];

const SIM_TEAMS=["BTS","Naruto","Fortnite","BLACKPINK","Taylor Swift","Valorant","Attack on Titan","Drake","Minecraft","One Piece","Genshin Impact"];
const randInt=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;

const RANKS=[
  {name:"BRONZE",min:0,max:49,icon:"🥉",color:"#CD7F32"},
  {name:"SILVER",min:50,max:199,icon:"🥈",color:"#C0C0C0"},
  {name:"GOLD",min:200,max:499,icon:"🥇",color:"#FFD700"},
  {name:"PLATINUM",min:500,max:999,icon:"💎",color:"#00EAFF"},
  {name:"DIAMOND",min:1000,max:2499,icon:"💠",color:"#BB88FF"},
  {name:"LEGEND",min:2500,max:Infinity,icon:"👑",color:"#FF2D78"},
];
const getRank=(px)=>RANKS.find(r=>px>=r.min&&px<=r.max)||RANKS[0];

export default function App(){
  const cvs=useRef(null);
  const [pixels,setPixels]=useState(()=>{
    try{const s=localStorage.getItem("pw_v1");return s?JSON.parse(s):new Array(TOTAL).fill(null);}
    catch{return new Array(TOTAL).fill(null);}
  });
  const [active,setActive]=useState(null);
  const [pending,setPending]=useState(new Set());
  const [drag,setDrag]=useState(false);
  const [orig,setOrig]=useState(null);
  const [hov,setHov]=useState(null);
  const [mode,setMode]=useState("BUILD");
  const [selCat,setSelCat]=useState("All");
  const [selSub,setSelSub]=useState("All");
  const [q,setQ]=useState("");
  const [tab,setTab]=useState("WAR");
  const [toasts,setToasts]=useState([]);
  const [feed,setFeed]=useState([]);
  const [event,setEvent]=useState(null);
  const [eventTimer,setEventTimer]=useState(0);
  const [flashColor,setFlashColor]=useState(null);
  const [shakeCanvas,setShakeCanvas]=useState(false);
  const [myPixels,setMyPixels]=useState(0);
  const [lastCombo,setLastCombo]=useState(null);

  useEffect(()=>{
    const lk=document.createElement("link");
    lk.href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap";
    lk.rel="stylesheet";document.head.appendChild(lk);
  },[]);

  // Simulated live feed
  useEffect(()=>{
    const add=()=>{
      const t1=SIM_TEAMS[randInt(0,SIM_TEAMS.length-1)];
      let t2=SIM_TEAMS[randInt(0,SIM_TEAMS.length-1)];
      while(t2===t1)t2=SIM_TEAMS[randInt(0,SIM_TEAMS.length-1)];
      const actions=["claimed","raided","bombed","sniped"];
      const action=actions[randInt(0,actions.length-1)];
      const px=randInt(1,45);
      const icon=action==="claimed"?"🏴":action==="raided"?"⚔️":action==="bombed"?"💣":"🎯";
      const msg=action==="claimed"?`claimed ${px}px`:action==="raided"?`RAIDED ${t2}`:action==="bombed"?`BOMBED ${t2}!`:`SNIPED 1px from ${t2}`;
      setFeed(f=>[{id:Date.now()+Math.random(),icon,team:t1,msg,color:tc(t1),ts:new Date().toLocaleTimeString("en",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})},...f].slice(0,40));
    };
    add();
    const iv=setInterval(add,randInt(3000,7000));
    return()=>clearInterval(iv);
  },[]);

  // Random events
  useEffect(()=>{
    const startEvent=()=>{
      const ev=EVENTS[randInt(0,EVENTS.length-1)];
      setEvent(ev);setEventTimer(ev.duration);
      pushToast(`${ev.icon} ${ev.label} ACTIVATED! ${ev.desc}`,"#FFD700",4000);
    };
    const iv=setInterval(()=>setEventTimer(t=>{if(t<=1){setEvent(null);setTimeout(startEvent,randInt(20000,35000));return 0;}return t-1;}),1000);
    setTimeout(startEvent,8000);
    return()=>clearInterval(iv);
  },[]);

  // Canvas draw
  useEffect(()=>{
    const c=cvs.current;if(!c)return;
    const ctx=c.getContext("2d");
    ctx.fillStyle="#050510";ctx.fillRect(0,0,CW,CH);
    for(let i=0;i<TOTAL;i++){
      const x=(i%GW)*CELL,y=Math.floor(i/GW)*CELL;
      const col=pixels[i]?TM[pixels[i]]?.color:null;
      if(col){ctx.fillStyle=`#${cv(col)}`;}
      else if(pending.has(i)){ctx.fillStyle=mode==="RAID"?rgba("#FF0000",.5):rgba(active?TM[active]?.color||"#888":"#888",.6);}
      else{ctx.fillStyle=i%5===0?"#0c0c1e":"#0a0a18";}
      ctx.fillRect(x,y,CELL-1,CELL-1);
    }
    ctx.strokeStyle="rgba(255,255,255,.03)";ctx.lineWidth=1;
    for(let x=0;x<=CW;x+=CELL*10){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CH);ctx.stroke();}
    for(let y=0;y<=CH;y+=CELL*10){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CW,y);ctx.stroke();}
  },[pixels,pending,active,mode]);

  const triggerFlash=(color,shake=false)=>{
    setFlashColor(color);setTimeout(()=>setFlashColor(null),300);
    if(shake){setShakeCanvas(true);setTimeout(()=>setShakeCanvas(false),500);}
  };

  const pushToast=useCallback((msg,color,dur=3000)=>{
    const id=Date.now()+Math.random();
    setToasts(t=>[...t,{id,msg,color}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),dur);
  },[]);

  const ei=(e)=>{const rc=cvs.current.getBoundingClientRect(),gx=Math.floor(((e.clientX-rc.left)*CW/rc.width)/CELL),gy=Math.floor(((e.clientY-rc.top)*CH/rc.height)/CELL);return(gx<0||gx>=GW||gy<0||gy>=GH)?-1:gy*GW+gx;};
  const rs=(x1,y1,x2,y2)=>{const s=new Set();for(let gy=Math.min(y1,y2);gy<=Math.max(y1,y2);gy++)for(let gx=Math.min(x1,x2);gx<=Math.max(x1,x2);gx++){const i=gy*GW+gx;if(mode==="BUILD"?pixels[i]===null:pixels[i]!==null&&pixels[i]!==active)s.add(i);}return s;};
  const onMD=(e)=>{if(!active||mode==="SHOP")return;const idx=ei(e);if(idx<0)return;setDrag(true);setOrig({x:idx%GW,y:Math.floor(idx/GW)});const ok=mode==="BUILD"?pixels[idx]===null:pixels[idx]!==null&&pixels[idx]!==active;setPending(ok?new Set([idx]):new Set());};
  const onMM=(e)=>{const idx=ei(e);if(idx>=0)setHov(pixels[idx]?TM[pixels[idx]]:null);if(drag&&orig){const ex=idx%GW,ey=Math.floor(idx/GW);setPending(rs(orig.x,orig.y,ex,ey));}};
  const onMU=()=>{setDrag(false);if(pending.size>0)handleClaim();};
  const onML=()=>{setHov(null);if(drag){setDrag(false);if(pending.size>0)handleClaim();}};

  const handleClaim=()=>{
    if(!active||pending.size===0)return;
    const t=TM[active];
    const isRaid=mode==="RAID";
    const bonus=pending.size>=15?Math.floor(pending.size*.3):pending.size>=10?Math.floor(pending.size*.15):0;
    const next=[...pixels];
    pending.forEach(i=>{next[i]=active;});
    if(bonus>0){let added=0;for(let i=0;i<TOTAL&&added<bonus;i++){if(next[i]===null){next[i]=active;added++;}}}
    setPixels(next);
    setMyPixels(p=>p+pending.size+bonus);
    try{localStorage.setItem("pw_v1",JSON.stringify(next));}catch{}
    if(isRaid){triggerFlash("#FF0000",true);pushToast(`⚔️ RAID SUCCESS! ${pending.size}px conquered!`,"#FF4400",4000);}
    else{triggerFlash(t.color);}
    if(bonus>0){setLastCombo({count:bonus,color:t.color});setTimeout(()=>setLastCombo(null),3000);pushToast(`🔥 COMBO! +${bonus} BONUS PIXELS FREE!`,"#FFD700",4000);}
    else{pushToast(`${isRaid?"⚔️ RAIDED":"🏴 CLAIMED"} ${pending.size}px for ${t.name}!`,t.color,3000);}
    setFeed(f=>[{id:Date.now(),icon:isRaid?"⚔️":"🏴",team:t.name,msg:`${isRaid?"RAIDED":"claimed"} ${pending.size}px${bonus>0?` (+${bonus} bonus)`:""}`,color:t.color,ts:new Date().toLocaleTimeString("en",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"}),isMe:true},...f].slice(0,40));
    setPending(new Set());
  };

  const usePowerup=(pu)=>{
    const next=[...pixels];
    if(pu.id==="bomb"){
      const ex=randInt(0,GW-7),ey=randInt(0,GH-7);let d=0;
      for(let dy=0;dy<6;dy++)for(let dx=0;dx<6;dx++){const i=(ey+dy)*GW+(ex+dx);if(next[i]!==null&&next[i]!==active){next[i]=null;d++;}}
      triggerFlash("#FF4400",true);pushToast(`💣 CLUSTER BOMB! Destroyed ${d} enemy pixels!`,"#FF4400",5000);
    }else if(pu.id==="storm"){
      let cl=0;const idxs=Array.from({length:TOTAL},(_,i)=>i).sort(()=>Math.random()-.5);
      for(const i of idxs){if(next[i]===null&&cl<25){next[i]=active;cl++;}}
      triggerFlash("#FFCC00");pushToast(`⚡ PIXEL STORM! Claimed ${cl} pixels!`,"#FFCC00",5000);
    }else if(pu.id==="shield"){
      pushToast(`🛡️ FORTRESS ACTIVE! Your territory is protected!`,"#00AAFF",5000);
    }else if(pu.id==="snipe"){
      const enemy=next.findIndex(p=>p!==null&&p!==active);
      if(enemy>=0){const victim=TM[next[enemy]];next[enemy]=active;pushToast(`🎯 SNIPED 1px from ${victim?.name||"enemy"}!`,"#FF2D78",5000);triggerFlash("#FF2D78");}
      else pushToast(`🎯 No enemy pixels found!`,"#FF2D78",3000);
    }else if(pu.id==="airdrop"){
      const sx=randInt(5,GW-16),sy=randInt(5,GH-16);let cl=0;
      for(let dy=0;dy<10;dy++)for(let dx=0;dx<10;dx++){const i=(sy+dy)*GW+(sx+dx);if(next[i]===null){next[i]=active;cl++;}}
      triggerFlash("#C8FF00");pushToast(`🪂 AIRDROP! Claimed ${cl} pixels in a 10×10 zone!`,"#C8FF00",5000);
    }else if(pu.id==="double"){
      const win=Math.random()>.5;
      if(win){pushToast(`✨ YOU WIN! +bonus pixels!`,"#BB88FF",6000);}
      else{pushToast(`✨ YOU LOST! Better luck next time 💀`,"#BB88FF",5000);}
      triggerFlash("#BB88FF",win);
    }
    setPixels(next);
    try{localStorage.setItem("pw_v1",JSON.stringify(next));}catch{}
  };

  const subArrFull=useMemo(()=>{
    const subs=selCat==="All"?[...new Set(CAT.map(e=>e.sub))]:CAT.filter(e=>e.cat===selCat).map(e=>e.sub);
    return["All",...subs];
  },[selCat]);

  useEffect(()=>setSelSub("All"),[selCat]);

  const vis=useMemo(()=>{
    if(q.trim().length>1){const lq=q.toLowerCase();return ALL.filter(t=>t.name.toLowerCase().includes(lq)||t.sub.toLowerCase().includes(lq));}
    return ALL.filter(t=>{
      if(selCat!=="All"&&t.cat!==selCat)return false;
      if(selSub!=="All"&&t.sub!==selSub)return false;
      return true;
    });
  },[selCat,selSub,q]);

  const board=useMemo(()=>{
    const cnt={};pixels.forEach(p=>{if(p)cnt[p]=(cnt[p]||0)+1;});
    return Object.entries(cnt).map(([id,count])=>({...(TM[id]||{}),count})).filter(t=>t.name).sort((a,b)=>b.count-a.count).slice(0,20);
  },[pixels]);

  const totalSold=pixels.filter(Boolean).length;
  const at=active?TM[active]:null;
  const accent=at?(CAT_ACCENT[at.cat]||"#00F5FF"):"#00F5FF";
  const modeColor=mode==="BUILD"?"#00F5FF":mode==="RAID"?"#FF4400":"#C8FF00";
  const selAccent=selCat!=="All"?CAT_ACCENT[selCat]:"#00F5FF";
  const myRank=getRank(myPixels);

  return(
    <div style={{background:"#040408",minHeight:"100vh",fontFamily:"'Rajdhani',sans-serif",color:"#e0e8ff",userSelect:"none",position:"relative",overflow:"hidden"}}>
      <style>{`
        @keyframes slideDown{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:none}}
        @keyframes pop{0%{transform:scale(.85);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes raid{0%{background:rgba(255,68,0,.28)}100%{background:transparent}}
        .chip:hover{filter:brightness(1.4)!important}
        .tbtn:hover{filter:brightness(1.15);transform:translateY(-1px)}
        .pubtn:hover{filter:brightness(1.2);transform:scale(1.02)}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:#222240;border-radius:2px}
        *{box-sizing:border-box}
        input::placeholder{color:#2a2a4a}
      `}</style>

      {flashColor&&<div style={{position:"fixed",inset:0,background:rgba(flashColor,.22),zIndex:50,pointerEvents:"none",animation:"raid .3s ease forwards"}}/>}

      {/* TOASTS */}
      <div style={{position:"fixed",top:65,right:12,zIndex:200,display:"flex",flexDirection:"column",gap:7,pointerEvents:"none",maxWidth:280}}>
        {toasts.map(t=>(
          <div key={t.id} style={{background:rgba(t.color,.12),border:`1px solid ${rgba(t.color,.5)}`,borderRadius:8,padding:"8px 13px",fontSize:12,fontWeight:700,color:t.color,fontFamily:"'Orbitron',monospace",letterSpacing:.5,animation:"slideDown .3s ease",lineHeight:1.4}}>
            {t.msg}
          </div>
        ))}
      </div>

      {/* COMBO POPUP */}
      {lastCombo&&<div style={{position:"fixed",top:"38%",left:"50%",transform:"translateX(-50%)",zIndex:300,textAlign:"center",animation:"pop .4s cubic-bezier(.34,1.56,.64,1)",pointerEvents:"none"}}>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:36,fontWeight:900,color:lastCombo.color,textShadow:`0 0 30px ${lastCombo.color}`,letterSpacing:3}}>🔥 COMBO!</div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,color:"#FFD700",marginTop:4}}>FREE PIXELS!</div>
      </div>}

      {/* HEADER */}
      <div style={{background:"#06060e",borderBottom:"1px solid #1a1a30",padding:"8px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,rgba(0,245,255,.05),transparent 30%,rgba(255,68,0,.03) 70%,transparent)",pointerEvents:"none"}}/>
        <div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:900,letterSpacing:4,background:"linear-gradient(90deg,#00F5FF,#FF4400,#C8FF00)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>⚔ PIXEL WARS</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#2a2a4a",letterSpacing:2}}>FANDOM TERRITORY BATTLE · CLAIM · RAID · DOMINATE</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,background:rgba(myRank.color,.08),border:`1px solid ${rgba(myRank.color,.3)}`,borderRadius:8,padding:"5px 10px"}}>
          <span style={{fontSize:18}}>{myRank.icon}</span>
          <div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:myRank.color}}>{myRank.name}</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a"}}>{myPixels}px</div>
          </div>
        </div>
        <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
          {[["SOLD",totalSold.toLocaleString(),"#00F5FF"],["FANDOMS",board.length,"#FF2D78"]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:900,color:c}}>{v}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#2a2a4a",letterSpacing:1.5}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* EVENT BANNER */}
      {event&&<div style={{background:`linear-gradient(90deg,${rgba(event.color,.14)},${rgba(event.color,.04)})`,borderBottom:`1px solid ${rgba(event.color,.4)}`,padding:"5px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",animation:"slideDown .3s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <span style={{fontSize:18,animation:"pulse 1s infinite"}}>{event.icon}</span>
          <span style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:event.color,letterSpacing:2}}>{event.label} </span>
          <span style={{fontSize:12,color:"#c0c8e8"}}>— {event.desc}</span>
        </div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:12,color:event.color,fontWeight:700,animation:"pulse 1s infinite"}}>
          {Math.floor(eventTimer/60)}:{String(eventTimer%60).padStart(2,"0")}
        </div>
      </div>}

      <div style={{display:"flex",height:`calc(100vh - ${event?106:64}px)`,overflow:"hidden"}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

          {/* CANVAS */}
          <div style={{padding:"6px 6px 0",flexShrink:0,position:"relative"}}>
            <div style={{border:`2px solid ${rgba(modeColor,.35)}`,borderRadius:6,overflow:"hidden",lineHeight:0,cursor:active&&mode!=="SHOP"?"crosshair":"default",position:"relative",animation:shakeCanvas?"shake .5s ease":undefined,boxShadow:`0 0 28px ${rgba(modeColor,.1)}`}}>
              <canvas ref={cvs} width={CW} height={CH} style={{width:"100%",display:"block",imageRendering:"pixelated"}}
                onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onML} onDragStart={e=>e.preventDefault()}/>
              <div style={{position:"absolute",top:6,left:6,background:rgba(modeColor,.12),border:`1px solid ${rgba(modeColor,.4)}`,borderRadius:4,padding:"2px 8px",fontFamily:"'Orbitron',monospace",fontSize:9,color:modeColor,pointerEvents:"none",letterSpacing:2}}>
                {mode==="BUILD"?"🏗 BUILD":mode==="RAID"?"⚔️ RAID":"💥 SHOP"}
              </div>
              {hov&&<div style={{position:"absolute",bottom:8,left:8,background:rgba(hov.color,.15),border:`1px solid ${hov.color}`,borderRadius:4,padding:"2px 8px",fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:hov.color,pointerEvents:"none"}}>{hov.name}</div>}
              {!active&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(4,4,8,.72)",pointerEvents:"none",borderRadius:4}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,letterSpacing:3,color:"#1a1a3a"}}>⚔ SELECT YOUR FANDOM BELOW</div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#111130",marginTop:4}}>THEN DRAG TO CLAIM TERRITORY</div>
                </div>
              </div>}
            </div>
          </div>

          {/* MODE BAR */}
          <div style={{margin:"4px 6px 0",display:"flex",gap:4,flexShrink:0}}>
            {[{m:"BUILD",icon:"🏗",c:"#00F5FF"},{m:"RAID",icon:"⚔️",c:"#FF4400"},{m:"SHOP",icon:"💥",c:"#C8FF00"}].map(({m,icon,c})=>{
              const on=mode===m;
              return(<button key={m} className="chip" onClick={()=>setMode(m)} style={{flex:1,padding:"7px 0",background:on?rgba(c,.15):"transparent",border:`1px solid ${on?c:rgba(c,.22)}`,borderRadius:6,color:on?c:rgba(c,.45),cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,letterSpacing:1,transition:"all .12s",boxShadow:on?`0 0 18px ${rgba(c,.22)}`:"none"}}>{icon} {m}</button>);
            })}
          </div>

          {/* PENDING BAR */}
          {at&&pending.size>0&&(
            <div style={{margin:"4px 6px 0",padding:"6px 11px",background:rgba(modeColor,.06),border:`1px solid ${rgba(modeColor,.32)}`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexShrink:0,animation:"slideDown .2s ease"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:9,height:9,borderRadius:2,background:at.color,boxShadow:`0 0 8px ${at.color}`}}/>
                <span style={{fontWeight:700,fontSize:12,color:at.color,fontFamily:"'Orbitron',monospace"}}>{at.name}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {pending.size>=10&&<span style={{fontFamily:"'Orbitron',monospace",fontSize:8,color:"#FFD700",animation:"pulse 1s infinite"}}>🔥 COMBO!</span>}
                <span style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:900,color:"#C8FF00"}}>€{mode==="RAID"?pending.size*2:pending.size}</span>
                <button onClick={handleClaim} style={{padding:"5px 13px",background:`linear-gradient(90deg,${modeColor},${at.color})`,color:"#040408",border:"none",borderRadius:4,fontWeight:900,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',monospace",letterSpacing:1}}>
                  {mode==="RAID"?"⚔ RAID!":"🏴 CLAIM!"}
                </button>
                <button onClick={()=>setPending(new Set())} style={{background:"none",border:"none",color:"#3a3a5a",cursor:"pointer",fontSize:14}}>✕</button>
              </div>
            </div>
          )}

          {/* BROWSER / SHOP */}
          <div style={{flex:1,overflowY:"auto",padding:"5px 6px 8px"}}>
            {mode==="SHOP"?(
              <>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:900,letterSpacing:3,color:"#C8FF00",marginBottom:10}}>💥 POWER-UP SHOP</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:6}}>
                  {POWERUPS.map(pu=>(
                    <div key={pu.id} className="pubtn" onClick={()=>usePowerup(pu)} style={{background:rgba(pu.color,.07),border:`1px solid ${rgba(pu.color,.35)}`,borderRadius:8,padding:"12px",cursor:"pointer",transition:"all .15s",position:"relative"}}>
                      <div style={{position:"absolute",top:5,right:5,fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:RARITY_COLOR[pu.rarity]}}>{pu.rarity}</div>
                      <div style={{fontSize:26,marginBottom:5}}>{pu.icon}</div>
                      <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:pu.color,marginBottom:4}}>{pu.name}</div>
                      <div style={{fontSize:10,color:"#7a7aaa",lineHeight:1.4,marginBottom:7}}>{pu.desc}</div>
                      <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:900,color:"#C8FF00"}}>€{pu.price}</div>
                    </div>
                  ))}
                </div>
              </>
            ):(
              <>
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder={`🔍 Search ${ALL.length} fandoms…`}
                  style={{width:"100%",background:"#0c0c1c",border:`1px solid ${rgba(selAccent,.2)}`,borderRadius:5,padding:"6px 10px",color:"#b0b8e0",fontSize:11,fontFamily:"'Rajdhani',sans-serif",outline:"none",marginBottom:5}}/>
                {/* Category tabs */}
                <div style={{display:"flex",gap:4,marginBottom:5,flexWrap:"wrap"}}>
                  {["All","🎮 Gaming","🎌 Anime","🎵 Music"].map(c=>{const acc=c==="All"?"#5566AA":CAT_ACCENT[c],on=selCat===c;return(<button key={c} className="chip" onClick={()=>setSelCat(c)} style={{padding:"4px 10px",borderRadius:4,border:`1px solid ${on?acc:acc+"33"}`,background:on?rgba(acc,.15):"transparent",color:on?acc:acc+"77",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Orbitron',monospace",letterSpacing:.5,transition:"all .1s"}}>{c}</button>);})}
                </div>
                {/* Sub tabs */}
                <div style={{display:"flex",gap:3,marginBottom:5,overflowX:"auto",paddingBottom:2}}>
                  {subArrFull.map(s=>{const on=selSub===s,acc=selCat!=="All"?CAT_ACCENT[selCat]:"#5566AA";return(<button key={s} className="chip" onClick={()=>setSelSub(s)} style={{padding:"2px 8px",borderRadius:20,border:`1px solid ${on?acc:acc+"22"}`,background:on?rgba(acc,.12):"transparent",color:on?acc:acc+"55",fontSize:9,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",whiteSpace:"nowrap",transition:"all .1s"}}>{s}</button>);})}
                </div>
                {/* Team grid */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(128px,1fr))",gap:3}}>
                  {vis.map(t=>{
                    const isA=active===t.id,acc=CAT_ACCENT[t.cat]||"#00F5FF";
                    const px=pixels.filter(p=>p===t.id).length;
                    const rank=getRank(px);
                    return(<div key={t.id} className="tbtn" onClick={()=>setActive(isA?null:t.id)} style={{padding:"6px 8px",borderRadius:5,cursor:"pointer",border:`1px solid ${isA?t.color:acc+"18"}`,background:isA?rgba(t.color,.1):"#0c0c1a",transition:"all .1s",position:"relative",overflow:"hidden"}}>
                      {isA&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:2,background:t.color}}/>}
                      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:1}}>
                        <div style={{width:7,height:7,borderRadius:1,background:t.color,flexShrink:0}}/>
                        <span style={{fontWeight:700,fontSize:10,color:isA?t.color:"#c0c8e8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</span>
                      </div>
                      <div style={{fontSize:8,color:acc+"55",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Share Tech Mono',monospace"}}>{t.sub}</div>
                      {px>0&&<div style={{display:"flex",alignItems:"center",gap:3,marginTop:2}}>
                        <span style={{fontSize:8}}>{rank.icon}</span>
                        <span style={{fontSize:8,color:rank.color,fontFamily:"'Orbitron',monospace",fontWeight:700}}>{px}px</span>
                      </div>}
                    </div>);
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{width:200,borderLeft:"1px solid #1a1a30",background:"#05050d",flexShrink:0,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{display:"flex",borderBottom:"1px solid #1a1a30",flexShrink:0}}>
            {[["WAR","⚔ WAR"],["FEED","📡 FEED"]].map(([t,label])=>{
              const on=tab===t;
              return(<button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"8px 0",background:on?"#08081a":"transparent",border:"none",color:on?"#00F5FF":"#3a3a5a",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:900,letterSpacing:1,borderBottom:on?"2px solid #00F5FF":"2px solid transparent",transition:"all .1s"}}>{label}</button>);
            })}
          </div>
          {tab==="WAR"?(
            <div style={{flex:1,overflowY:"auto",padding:"8px 7px"}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:8,letterSpacing:2,color:"#2a2a4a",marginBottom:6}}>TERRITORY RANKINGS</div>
              {board.length===0?<div style={{fontSize:9,color:"#1a1a2a",fontFamily:"'Share Tech Mono',monospace",paddingTop:8}}>No territory yet</div>
              :board.map((t,i)=>{const acc=CAT_ACCENT[t.cat]||"#00F5FF",rank=getRank(t.count);return(
                <div key={t.id} onClick={()=>setActive(t.id)} style={{marginBottom:4,padding:"5px 7px",background:"#09091a",borderRadius:5,border:`1px solid ${acc}18`,cursor:"pointer",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",left:0,top:0,bottom:0,width:2,background:`linear-gradient(180deg,${t.color},${acc})`}}/>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2,paddingLeft:6}}>
                    <span style={{fontSize:9,fontWeight:700,color:t.color,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:105}}>{rank.icon} {t.name}</span>
                    <span style={{fontSize:8,color:"#C8FF00",fontFamily:"'Orbitron',monospace"}}>€{t.count}</span>
                  </div>
                  <div style={{height:2,background:"#1a1a2e",borderRadius:2,overflow:"hidden",marginBottom:2,marginLeft:6}}>
                    <div style={{height:"100%",width:`${(t.count/board[0].count)*100}%`,background:`linear-gradient(90deg,${t.color},${acc})`,borderRadius:2,transition:"width .5s"}}/>
                  </div>
                  <div style={{fontSize:7,color:"#2a2a3a",marginLeft:6,fontFamily:"'Share Tech Mono',monospace"}}>{rank.name} · {t.count}px</div>
                </div>
              );})}
            </div>
          ):(
            <div style={{flex:1,overflowY:"auto",padding:"8px 7px"}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:8,letterSpacing:2,color:"#2a2a4a",marginBottom:6,display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:"#FF2D78",animation:"pulse .8s infinite"}}/>LIVE FEED
              </div>
              {feed.map(f=>(
                <div key={f.id} style={{marginBottom:4,padding:"5px 6px",background:f.isMe?rgba(f.color,.08):"#08081a",borderRadius:5,border:`1px solid ${f.isMe?rgba(f.color,.3):"#1a1a2a"}`,animation:"slideDown .2s ease"}}>
                  <div style={{display:"flex",gap:4,alignItems:"flex-start"}}>
                    <span style={{fontSize:11,flexShrink:0}}>{f.icon}</span>
                    <div style={{minWidth:0}}>
                      <span style={{fontSize:9,fontWeight:700,color:f.color}}>{f.team} </span>
                      <span style={{fontSize:9,color:"#5a5a7a"}}>{f.msg}</span>
                      {f.isMe&&<span style={{fontSize:8,color:"#FFD700",marginLeft:3}}>YOU</span>}
                    </div>
                  </div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#2a2a3a",marginTop:1,textAlign:"right"}}>{f.ts}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
