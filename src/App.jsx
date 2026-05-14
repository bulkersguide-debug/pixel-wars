import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const GW=2000,GH=2000,CELL=5,VW=180,VH=117,CW=VW*CELL,CH=VH*CELL,MM=200,MMS=GW/MM;

const hashColor=(n)=>{let h=0;for(let i=0;i<n.length;i++)h=(Math.imul(31,h)+n.charCodeAt(i))|0;const hue=Math.abs(h)%360,sat=65+(Math.abs(h>>8)%25),lit=50+(Math.abs(h>>16)%15),s=sat/100,l=lit/100,a=s*Math.min(l,1-l),f=x=>{const k=(x+hue/30)%12,c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,"0")};return`#${f(0)}${f(8)}${f(4)}`;};
const KC={"Fortnite":"#00B4F0","Minecraft":"#62B32F","Valorant":"#FF4655","Apex Legends":"#DA292A","League of Legends":"#0BC4E3","GTA V":"#00853E","Among Us":"#C51111","Rocket League":"#0092CF","Overwatch 2":"#F99E1A","Elden Ring":"#B0884A","Cyberpunk 2077":"#FCEE09","God of War":"#AA0000","Genshin Impact":"#0095FF","Pokémon":"#FFCB05","FIFA / EA FC 24":"#2980B9","Naruto":"#FF6B35","One Piece":"#E31E24","Dragon Ball Z":"#FF8C00","Bleach":"#3355BB","My Hero Academia":"#2E86C1","Demon Slayer":"#CC3355","Jujutsu Kaisen":"#6B21A8","Chainsaw Man":"#CC1122","Attack on Titan":"#7A6640","Death Note":"#CC0000","One Punch Man":"#FFD700","Haikyuu!!":"#FF6600","Blue Lock":"#1B3FA0","Spirited Away":"#CC6699","BTS":"#9747FF","BLACKPINK":"#FF1493","Stray Kids":"#CC0033","Aespa":"#00AAFF","NewJeans":"#FF6699","IVE":"#3355AA","TWICE":"#FF9EC4","NCT 127":"#00AACC","ENHYPEN":"#222255","TXT":"#5599FF","ATEEZ":"#CC4400","(G)I-DLE":"#CC0055","Drake":"#BF8E3B","Travis Scott":"#C7A444","Kendrick Lamar":"#CC0000","Eminem":"#5C8AFF","Tyler, the Creator":"#AACC00","Post Malone":"#CC8866","Taylor Swift":"#A855F7","Billie Eilish":"#00DD88","Ariana Grande":"#CC88BB","Dua Lipa":"#9900FF","Olivia Rodrigo":"#6622BB","The Weeknd":"#CC0000","Bruno Mars":"#CC8800","Bad Bunny":"#00CC44","Daft Punk":"#FFD700","Skrillex":"#00FF88","Martin Garrix":"#0066FF","Linkin Park":"#8C1C1C","My Chemical Romance":"#CC0000","Arctic Monkeys":"#885522","Twenty One Pilots":"#FFCC00","Tame Impala":"#FF9900","Metallica":"#777777"};
const tc=(n)=>KC[n]||hashColor(n);
const cv=(hex)=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);if(0.299*r+0.587*g+0.114*b<65){const f=0.48;return[r,g,b].map(v=>Math.round(v+(255-v)*f).toString(16).padStart(2,"0")).join("");}return hex.slice(1);};
const rgba=(hex,a)=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};
const todayStr=()=>new Date().toISOString().split("T")[0];
const yesterdayStr=()=>new Date(Date.now()-86400000).toISOString().split("T")[0];

const CAT_ACCENT={"🎮 Gaming":"#00F5FF","🎌 Anime":"#FF2D78","🎵 Music":"#C8FF00"};
const CAT=[
  {cat:"🎮 Gaming",sub:"Battle Royale",t:["Fortnite","Apex Legends","PUBG","Warzone","Fall Guys"]},
  {cat:"🎮 Gaming",sub:"Shooter",t:["Valorant","Overwatch 2","Call of Duty","Halo Infinite","Destiny 2"]},
  {cat:"🎮 Gaming",sub:"RPG",t:["Elden Ring","Cyberpunk 2077","God of War","Genshin Impact","Pokémon","Hades"]},
  {cat:"🎮 Gaming",sub:"Open World",t:["Minecraft","GTA V","Roblox","Among Us","Rocket League","League of Legends"]},
  {cat:"🎮 Gaming",sub:"Sports",t:["FIFA / EA FC 24","NBA 2K24","Rocket League"]},
  {cat:"🎌 Anime",sub:"Shonen",t:["Naruto","One Piece","Dragon Ball Z","Bleach","My Hero Academia","Demon Slayer","Jujutsu Kaisen","Chainsaw Man","One Punch Man"]},
  {cat:"🎌 Anime",sub:"Dark",t:["Attack on Titan","Death Note","Fullmetal Alchemist: Brotherhood","Neon Genesis Evangelion","Berserk"]},
  {cat:"🎌 Anime",sub:"Romance & Fun",t:["Haikyuu!!","Blue Lock","Spy x Family","Bocchi the Rock","Kaguya-sama"]},
  {cat:"🎌 Anime",sub:"Ghibli",t:["Spirited Away","Princess Mononoke","My Neighbor Totoro","Howl's Moving Castle"]},
  {cat:"🎵 Music",sub:"Hip-Hop",t:["Drake","Travis Scott","Kendrick Lamar","Eminem","Tyler, the Creator","Post Malone","The Weeknd","SZA"]},
  {cat:"🎵 Music",sub:"K-Pop",t:["BTS","BLACKPINK","Stray Kids","Aespa","NewJeans","IVE","TWICE","NCT 127","ATEEZ","(G)I-DLE","ENHYPEN","TXT"]},
  {cat:"🎵 Music",sub:"Pop",t:["Taylor Swift","Billie Eilish","Ariana Grande","Dua Lipa","Olivia Rodrigo","Bruno Mars","Sabrina Carpenter"]},
  {cat:"🎵 Music",sub:"Electronic",t:["Daft Punk","Skrillex","Martin Garrix","Calvin Harris","Avicii","Marshmello"]},
  {cat:"🎵 Music",sub:"Latin",t:["Bad Bunny","J Balvin","Karol G","Rosalía","Peso Pluma"]},
  {cat:"🎵 Music",sub:"Rock",t:["Linkin Park","My Chemical Romance","Arctic Monkeys","Twenty One Pilots","Tame Impala","Metallica"]},
];
const ALL=[];
CAT.forEach(e=>e.t.forEach(n=>ALL.push({id:`${e.cat}|${e.sub}|${n}`,name:n,color:tc(n),cat:e.cat,sub:e.sub})));
const TM=Object.fromEntries(ALL.map(t=>[t.id,t]));

const streakReward=(day)=>{
  if(day===1)return{px:1,bonus:null};
  if(day===2)return{px:1,bonus:null};
  if(day===3)return{px:2,bonus:null};
  if(day===4)return{px:3,bonus:null};
  if(day===5)return{px:5,bonus:"🔥 5-Day Warrior!"};
  if(day===6)return{px:5,bonus:null};
  if(day===7)return{px:10,bonus:"🏆 Week Legend!"};
  if(day%30===0)return{px:30,bonus:"👑 Month Champion!"};
  if(day%14===0)return{px:15,bonus:"💎 Fortnight Fighter!"};
  if(day%7===0)return{px:10,bonus:"⚡ Weekly Veteran!"};
  return{px:5,bonus:null};
};

const POWERUPS=[
  {id:"bomb",icon:"💣",name:"CLUSTER BOMB",desc:"Destroy a random 8×8 enemy zone",price:10,color:"#FF4400",rarity:"RARE"},
  {id:"storm",icon:"⚡",name:"PIXEL STORM",desc:"Claim 50 random empty pixels instantly",price:15,color:"#FFCC00",rarity:"EPIC"},
  {id:"fortress",icon:"🛡️",name:"FORTRESS",desc:"Shield your last 30 pixels for 1 hour — raid-proof",price:8,color:"#00AAFF",rarity:"UNCOMMON"},
  {id:"snipe",icon:"🎯",name:"SNIPER",desc:"Steal any single unshielded enemy pixel",price:3,color:"#FF2D78",rarity:"COMMON"},
  {id:"airdrop",icon:"🪂",name:"AIRDROP",desc:"Claim a 15×15 zone in your viewport",price:25,color:"#C8FF00",rarity:"LEGENDARY"},
  {id:"nuke",icon:"☢️",name:"NUKE",desc:"Wipe a 20×20 unshielded enemy zone",price:50,color:"#FF0000",rarity:"LEGENDARY"},
  {id:"double",icon:"✨",name:"DOUBLE OR NOTHING",desc:"Gamble your last buy — 2× or 0×",price:5,color:"#BB88FF",rarity:"UNCOMMON"},
];
const RARITY_COLOR={COMMON:"#aaaaaa",UNCOMMON:"#00CC44",RARE:"#0088FF",EPIC:"#AA00FF",LEGENDARY:"#FFD700"};
const EVENTS=[
  {icon:"⚡",label:"CHAOS HOUR",desc:"RAIDS cost 50% OFF!",duration:600,color:"#FF4400"},
  {icon:"💎",label:"MEGA BONUS",desc:"Buy 10px → get 5 FREE!",duration:300,color:"#FFD700"},
  {icon:"🔥",label:"FRENZY",desc:"Double territory for 3 min!",duration:180,color:"#FF6B35"},
  {icon:"👑",label:"CROWN BATTLE",desc:"Top fandom wins 50px bonus!",duration:900,color:"#FFD700"},
];
const SIM_TEAMS=["BTS","Naruto","Fortnite","BLACKPINK","Taylor Swift","Valorant","Attack on Titan","Drake","Minecraft","One Piece","Genshin Impact","Eminem"];
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
  const mmCvs=useRef(null);

  const [pixels,setPixels]=useState(()=>{try{const s=localStorage.getItem("pw2k");return s?JSON.parse(s):{};}catch{return{};}});
  const [shields,setShields]=useState(()=>{
    try{const s=JSON.parse(localStorage.getItem("pow_shields")||"{}");const now=Date.now();return Object.fromEntries(Object.entries(s).filter(([,exp])=>exp>now));}
    catch{return{};}
  });
  const [freePixels,setFreePixels]=useState(()=>{try{return parseInt(localStorage.getItem("pow_free")||"0");}catch{return 0;}});
  const [streakData,setStreakData]=useState(()=>{
    try{return JSON.parse(localStorage.getItem("pow_streak")||'{"days":0,"last":"","total":0}');}
    catch{return{days:0,last:"",total:0};}
  });

  const [vx,setVx]=useState(0);
  const [vy,setVy]=useState(0);
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
  const [showDaily,setShowDaily]=useState(false);
  const [showReset,setShowReset]=useState(false);
  const [dailyInfo,setDailyInfo]=useState(null);
  // ── FIX: track whether already claimed today ──────────────────────────────
  const alreadyClaimedToday = streakData.last === todayStr();
  const navigate = useNavigate();

  // ── Init + daily check ──────────────────────────────────────────────────────
  useEffect(()=>{
    const lk=document.createElement("link");
    lk.href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap";
    lk.rel="stylesheet";document.head.appendChild(lk);

    // Auto-select fandom from URL param e.g. /?fandom=bts
    const urlParams = new URLSearchParams(window.location.search);
    const fandomSlug = urlParams.get("fandom");
    if(fandomSlug){
      const slugify=(n)=>n.toLowerCase().replace(/[^a-z0-9\s]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim();
      const found = ALL.find(t=>slugify(t.name)===fandomSlug);
      if(found) setTimeout(()=>setActive(found.id), 500);
    }

    // Only show daily modal if NOT already claimed today
    const today=todayStr();
    const saved=JSON.parse(localStorage.getItem("pow_streak")||'{"days":0,"last":"","total":0}');
    if(saved.last!==today){
      const yesterday=yesterdayStr();
      const newDays=saved.last===yesterday?saved.days+1:1;
      const reward=streakReward(newDays);
      setDailyInfo({days:newDays,reward});
      setTimeout(()=>setShowDaily(true),1200);
    }
  },[]);

  // ── FIX: claim daily — one time only ───────────────────────────────────────
  const claimDaily=()=>{
    if(!dailyInfo)return;
    const today=todayStr();
    // Double-guard: abort if already claimed today
    if(streakData.last===today){
      setShowDaily(false);
      setDailyInfo(null);
      return;
    }
    const newStreak={days:dailyInfo.days,last:today,total:(streakData.total||0)+1};
    setStreakData(newStreak);
    localStorage.setItem("pow_streak",JSON.stringify(newStreak));
    const newFree=freePixels+dailyInfo.reward.px;
    setFreePixels(newFree);
    localStorage.setItem("pow_free",String(newFree));
    pushToast(`🎁 +${dailyInfo.reward.px} FREE PIXELS! Day ${dailyInfo.days} streak!`,"#FFD700",5000);
    if(dailyInfo.reward.bonus)setTimeout(()=>pushToast(`${dailyInfo.reward.bonus}`,"#FF2D78",4000),800);
    // FIX: clear dailyInfo so the modal can never re-award
    setDailyInfo(null);
    setShowDaily(false);
  };

  // ── FIX: open daily modal safely ───────────────────────────────────────────
  const openDailyModal=()=>{
    if(alreadyClaimedToday){
      pushToast("✅ Already claimed today! Come back tomorrow 🔥","#FFD700",3000);
    } else {
      setShowDaily(true);
    }
  };

  // ── Simulated live feed ─────────────────────────────────────────────────────
  useEffect(()=>{
    const add=()=>{
      const t1=SIM_TEAMS[randInt(0,SIM_TEAMS.length-1)];
      let t2=SIM_TEAMS[randInt(0,SIM_TEAMS.length-1)];while(t2===t1)t2=SIM_TEAMS[randInt(0,SIM_TEAMS.length-1)];
      const acts=["claimed","raided","bombed","shielded"];
      const action=acts[randInt(0,acts.length-1)];
      const px=randInt(1,60);
      const icon={"claimed":"🏴","raided":"⚔️","bombed":"💣","shielded":"🛡️"}[action];
      const msg=action==="claimed"?`claimed ${px}px`:action==="raided"?`RAIDED ${t2}`:action==="bombed"?`BOMBED ${t2}!`:`shielded ${px}px`;
      setFeed(f=>[{id:Date.now()+Math.random(),icon,team:t1,msg,color:tc(t1),ts:new Date().toLocaleTimeString("en",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})},...f].slice(0,40));
    };
    add();const iv=setInterval(add,randInt(2500,6000));return()=>clearInterval(iv);
  },[]);

  // ── Events ──────────────────────────────────────────────────────────────────
  useEffect(()=>{
    const start=()=>{const ev=EVENTS[randInt(0,EVENTS.length-1)];setEvent(ev);setEventTimer(ev.duration);pushToast(`${ev.icon} ${ev.label}! ${ev.desc}`,"#FFD700",4000);};
    const iv=setInterval(()=>setEventTimer(t=>{if(t<=1){setEvent(null);setTimeout(start,randInt(15000,30000));return 0;}return t-1;}),1000);
    setTimeout(start,6000);return()=>clearInterval(iv);
  },[]);



  // ── Reset grid ──────────────────────────────────────────────────────────────
  const resetGrid=()=>{
    setPixels({});
    setShields({});
    setMyPixels(0);
    setFreePixels(0);
    setStreakData({days:0,last:"",total:0});
    setDailyInfo(null);
    setPending(new Set());
    setActive(null);
    try{
      localStorage.removeItem("pw2k");
      localStorage.removeItem("pow_shields");
      localStorage.removeItem("pow_free");
      localStorage.removeItem("pow_streak");
    }catch{}
    pushToast("🔄 Grid reset! Fresh start.","#00F5FF",4000);
    setShowReset(false);
  };

  // ── Escape key to deselect ──────────────────────────────────────────────────
  useEffect(()=>{
    const onKey=(e)=>{
      if(e.key==="Escape"){
        setActive(null);
        setPending(new Set());
      }
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[]);

  // ── Canvas draw ─────────────────────────────────────────────────────────────
  useEffect(()=>{
    const c=cvs.current;if(!c)return;
    const ctx=c.getContext("2d");
    const now=Date.now();
    ctx.fillStyle="#050510";ctx.fillRect(0,0,CW,CH);
    for(let dy=0;dy<VH;dy++){
      for(let dx=0;dx<VW;dx++){
        const gx=vx+dx,gy=vy+dy;
        if(gx>=GW||gy>=GH)continue;
        const idx=gy*GW+gx;
        const teamId=pixels[idx];
        const isShielded=shields[idx]&&shields[idx]>now;
        if(teamId)ctx.fillStyle=`#${cv(TM[teamId]?.color||"#888")}`;
        else if(pending.has(idx))ctx.fillStyle=rgba(active?TM[active]?.color||"#888":"#888",mode==="RAID"?.4:.6);
        else ctx.fillStyle=(dx+dy)%2===0?"#0c0c1e":"#0a0a18";
        ctx.fillRect(dx*CELL,dy*CELL,CELL-1,CELL-1);
        if(isShielded&&teamId){
          ctx.fillStyle="rgba(0,245,255,0.22)";
          ctx.fillRect(dx*CELL,dy*CELL,CELL-1,CELL-1);
          if(dx%2===0&&dy%2===0){ctx.fillStyle="rgba(0,245,255,0.5)";ctx.fillRect(dx*CELL,dy*CELL,1,1);}
        }
      }
    }
    ctx.strokeStyle="rgba(255,255,255,.025)";ctx.lineWidth=1;
    for(let x=0;x<=CW;x+=CELL*10){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CH);ctx.stroke();}
    for(let y=0;y<=CH;y+=CELL*10){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CW,y);ctx.stroke();}
    ctx.fillStyle="rgba(255,255,255,.04)";ctx.font="bold 11px monospace";ctx.textAlign="center";
    for(let sy=0;sy<20;sy++)for(let sx=0;sx<20;sx++){
      const screenX=(sx*100-vx)*CELL+50*CELL,screenY=(sy*100-vy)*CELL+50*CELL;
      if(screenX>0&&screenX<CW&&screenY>0&&screenY<CH)ctx.fillText(`${sx+1}-${sy+1}`,screenX,screenY);
    }
  },[pixels,shields,pending,active,mode,vx,vy]);

  // ── Minimap ─────────────────────────────────────────────────────────────────
  useEffect(()=>{
    const mm=mmCvs.current;if(!mm)return;
    const ctx=mm.getContext("2d");
    ctx.fillStyle="#080818";ctx.fillRect(0,0,MM,MM);
    ctx.strokeStyle="rgba(255,255,255,.06)";ctx.lineWidth=1;
    for(let i=0;i<=20;i++){const p=i*10;ctx.beginPath();ctx.moveTo(p,0);ctx.lineTo(p,MM);ctx.stroke();ctx.beginPath();ctx.moveTo(0,p);ctx.lineTo(MM,p);ctx.stroke();}
    Object.entries(pixels).forEach(([idxStr,teamId])=>{const idx=parseInt(idxStr),gx=idx%GW,gy=Math.floor(idx/GW);ctx.fillStyle=TM[teamId]?.color||"#888";ctx.fillRect(Math.floor(gx/MMS),Math.floor(gy/MMS),1,1);});
    const now=Date.now();
    Object.entries(shields).forEach(([idxStr,exp])=>{if(exp<=now)return;const idx=parseInt(idxStr),gx=idx%GW,gy=Math.floor(idx/GW);ctx.fillStyle="rgba(0,245,255,0.5)";ctx.fillRect(Math.floor(gx/MMS),Math.floor(gy/MMS),1,1);});
    ctx.strokeStyle="#00F5FF";ctx.lineWidth=1.5;
    ctx.strokeRect(Math.floor(vx/MMS),Math.floor(vy/MMS),Math.ceil(VW/MMS),Math.ceil(VH/MMS));
  },[pixels,shields,vx,vy]);

  // ── Nav ─────────────────────────────────────────────────────────────────────
  const pan=(dx,dy)=>{setVx(x=>Math.max(0,Math.min(GW-VW,x+dx)));setVy(y=>Math.max(0,Math.min(GH-VH,y+dy)));};
  const onMmClick=(e)=>{const rc=mmCvs.current.getBoundingClientRect(),mx=Math.floor((e.clientX-rc.left)*MM/rc.width),my=Math.floor((e.clientY-rc.top)*MM/rc.height);setVx(Math.max(0,Math.min(GW-VW,mx*MMS-Math.floor(VW/2))));setVy(Math.max(0,Math.min(GH-VH,my*MMS-Math.floor(VH/2))));};

  // ── Mouse ───────────────────────────────────────────────────────────────────
  const mouseToGrid=(e)=>{const rc=cvs.current.getBoundingClientRect(),cx=(e.clientX-rc.left)*CW/rc.width,cy=(e.clientY-rc.top)*CH/rc.height,gx=vx+Math.floor(cx/CELL),gy=vy+Math.floor(cy/CELL);if(gx<0||gx>=GW||gy<0||gy>=GH)return null;return{gx,gy,idx:gy*GW+gx};};
  const rs=(x1,y1,x2,y2)=>{const s=new Set(),now=Date.now();for(let gy=Math.min(y1,y2);gy<=Math.max(y1,y2);gy++)for(let gx=Math.min(x1,x2);gx<=Math.max(x1,x2);gx++){const idx=gy*GW+gx;const isShielded=shields[idx]&&shields[idx]>now;if(mode==="BUILD"?!pixels[idx]:(pixels[idx]&&pixels[idx]!==active&&!isShielded))s.add(idx);}return s;};
  const onMD=(e)=>{if(!active||mode==="SHOP")return;const g=mouseToGrid(e);if(!g)return;const now=Date.now(),isShielded=shields[g.idx]&&shields[g.idx]>now;setDrag(true);setOrig({x:g.gx,y:g.gy});const ok=mode==="BUILD"?!pixels[g.idx]:(pixels[g.idx]&&pixels[g.idx]!==active&&!isShielded);setPending(ok?new Set([g.idx]):new Set());};
  const onMM_h=(e)=>{const g=mouseToGrid(e);if(g)setHov(pixels[g.idx]?TM[pixels[g.idx]]:null);if(drag&&orig){const go=mouseToGrid(e);if(go)setPending(rs(orig.x,orig.y,go.gx,go.gy));}};
  const onMU=()=>{setDrag(false);if(pending.size>0)handleClaim();};
  const onML=()=>{setHov(null);if(drag){setDrag(false);if(pending.size>0)handleClaim();}};

  const triggerFlash=(color,shake=false)=>{setFlashColor(color);setTimeout(()=>setFlashColor(null),300);if(shake){setShakeCanvas(true);setTimeout(()=>setShakeCanvas(false),500);}};
  const pushToast=useCallback((msg,color,dur=3000)=>{const id=Date.now()+Math.random();setToasts(t=>[...t,{id,msg,color}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),dur);},[]);

  // ── Claim ───────────────────────────────────────────────────────────────────
  const handleClaim=()=>{
    if(!active||pending.size===0)return;
    const t=TM[active];const isRaid=mode==="RAID";
    const bonus=pending.size>=15?Math.floor(pending.size*.3):pending.size>=10?Math.floor(pending.size*.15):0;
    const freeUsed=(!isRaid)?Math.min(freePixels,pending.size):0;
    const next={...pixels};
    pending.forEach(idx=>{next[idx]=active;});
    if(bonus>0){let added=0;for(let dy=0;dy<VH&&added<bonus;dy++)for(let dx=0;dx<VW&&added<bonus;dx++){const idx=(vy+dy)*GW+(vx+dx);if(!next[idx]){next[idx]=active;added++;}}}
    setPixels(next);setMyPixels(p=>p+pending.size+bonus);
    const now=Date.now();
    const newShields={...shields};
    pending.forEach(idx=>{newShields[idx]=now+24*60*60*1000;});
    setShields(newShields);
    localStorage.setItem("pow_shields",JSON.stringify(newShields));
    if(freeUsed>0){const nf=freePixels-freeUsed;setFreePixels(nf);localStorage.setItem("pow_free",String(nf));}
    try{localStorage.setItem("pw2k",JSON.stringify(next));}catch{}
    if(isRaid){triggerFlash("#FF0000",true);pushToast(`⚔️ RAID! ${pending.size}px conquered!`,"#FF4400",4000);}else{triggerFlash(t.color);}
    if(freeUsed>0)pushToast(`🎁 Used ${freeUsed} FREE pixels! Saved €${freeUsed}!`,"#FFD700",3000);
    if(bonus>0){setLastCombo({count:bonus,color:t.color});setTimeout(()=>setLastCombo(null),3000);pushToast(`🔥 COMBO! +${bonus} FREE!`,"#FFD700",4000);}
    else pushToast(`${isRaid?"⚔️":"🏴"} ${pending.size}px for ${t.name}! 🛡️ 24h protected`,"#00F5FF",3000);
    setFeed(f=>[{id:Date.now(),icon:isRaid?"⚔️":"🏴",team:t.name,msg:`${isRaid?"RAIDED":"claimed"} ${pending.size}px${bonus>0?` (+${bonus})`:""}${freeUsed>0?` (${freeUsed} free)`:""}`,color:t.color,ts:new Date().toLocaleTimeString("en",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"}),isMe:true},...f].slice(0,40));
    setPending(new Set());
  };

  // ── Power-ups ────────────────────────────────────────────────────────────────
  const usePowerup=(pu)=>{
    const next={...pixels};const newShields={...shields};const now=Date.now();
    if(pu.id==="bomb"){const ex=randInt(vx,vx+100),ey=randInt(vy,vy+60);let d=0;for(let dy=0;dy<8;dy++)for(let dx=0;dx<8;dx++){const idx=(ey+dy)*GW+(ex+dx);if(next[idx]&&next[idx]!==active&&!(shields[idx]&&shields[idx]>now)){delete next[idx];delete newShields[idx];d++;}}triggerFlash("#FF4400",true);pushToast(`💣 BOMB! Destroyed ${d} unshielded pixels!`,"#FF4400",5000);}
    else if(pu.id==="storm"){let cl=0;for(let dy=0;dy<VH&&cl<50;dy++)for(let dx=0;dx<VW&&cl<50;dx++){const idx=(vy+dy)*GW+(vx+dx);if(!next[idx]){next[idx]=active;newShields[idx]=now+24*60*60*1000;cl++;}}triggerFlash("#FFCC00");pushToast(`⚡ STORM! ${cl}px claimed — all 24h shielded!`,"#FFCC00",5000);}
    else if(pu.id==="fortress"){const fortressExpiry=now+60*60*1000;const myPx=Object.entries(pixels).filter(([,v])=>v===active).map(([k])=>parseInt(k)).slice(-30);myPx.forEach(idx=>{newShields[idx]=Math.max(newShields[idx]||0,fortressExpiry);});triggerFlash("#00AAFF");pushToast(`🛡️ FORTRESS! ${myPx.length}px shielded for 1 HOUR!`,"#00AAFF",6000);}
    else if(pu.id==="snipe"){const enemy=Object.entries(next).find(([k,v])=>v!==active&&!(shields[k]&&shields[k]>now));if(enemy){const victim=TM[next[enemy[0]]];next[enemy[0]]=active;newShields[parseInt(enemy[0])]=now+24*60*60*1000;pushToast(`🎯 SNIPED from ${victim?.name||"enemy"}!`,"#FF2D78",5000);triggerFlash("#FF2D78");}else pushToast(`🎯 All enemy pixels are shielded!`,"#FF2D78",3000);}
    else if(pu.id==="airdrop"){const sx=vx+randInt(0,VW-16),sy=vy+randInt(0,VH-16);let cl=0;for(let dy=0;dy<15;dy++)for(let dx=0;dx<15;dx++){const idx=(sy+dy)*GW+(sx+dx);if(!next[idx]){next[idx]=active;newShields[idx]=now+24*60*60*1000;cl++;}}triggerFlash("#C8FF00");pushToast(`🪂 AIRDROP! ${cl}px — 24h shielded!`,"#C8FF00",5000);}
    else if(pu.id==="nuke"){const ex=randInt(0,GW-21),ey=randInt(0,GH-21);let d=0;for(let dy=0;dy<20;dy++)for(let dx=0;dx<20;dx++){const idx=(ey+dy)*GW+(ex+dx);if(next[idx]&&next[idx]!==active&&!(shields[idx]&&shields[idx]>now)){delete next[idx];delete newShields[idx];d++;}}triggerFlash("#FF0000",true);pushToast(`☢️ NUKE! Obliterated ${d} pixels!`,"#FF0000",6000);}
    else if(pu.id==="double"){const win=Math.random()>.5;if(win)pushToast(`✨ YOU WIN! Bonus territory!`,"#BB88FF",6000);else pushToast(`✨ YOU LOST 💀`,"#BB88FF",5000);triggerFlash("#BB88FF",win);}
    setPixels(next);setShields(newShields);
    try{localStorage.setItem("pw2k",JSON.stringify(next));localStorage.setItem("pow_shields",JSON.stringify(newShields));}catch{}
  };

  const subArrFull=useMemo(()=>{const subs=selCat==="All"?[...new Set(CAT.map(e=>e.sub))]:CAT.filter(e=>e.cat===selCat).map(e=>e.sub);return["All",...subs];},[selCat]);
  useEffect(()=>setSelSub("All"),[selCat]);
  const vis=useMemo(()=>{if(q.trim().length>1){const lq=q.toLowerCase();return ALL.filter(t=>t.name.toLowerCase().includes(lq)||t.sub.toLowerCase().includes(lq));}return ALL.filter(t=>{if(selCat!=="All"&&t.cat!==selCat)return false;if(selSub!=="All"&&t.sub!==selSub)return false;return true;});},[selCat,selSub,q]);
  const board=useMemo(()=>{const cnt={};Object.values(pixels).forEach(id=>{cnt[id]=(cnt[id]||0)+1;});return Object.entries(cnt).map(([id,count])=>({...(TM[id]||{}),count})).filter(t=>t.name).sort((a,b)=>b.count-a.count).slice(0,20);},[pixels]);

  const totalSold=Object.keys(pixels).length;
  const at=active?TM[active]:null;
  const accent=at?(CAT_ACCENT[at.cat]||"#00F5FF"):"#00F5FF";
  const modeColor=mode==="BUILD"?"#00F5FF":mode==="RAID"?"#FF4400":"#C8FF00";
  const selAccent=selCat!=="All"?CAT_ACCENT[selCat]:"#00F5FF";
  const myRank=getRank(myPixels);
  const freeUsedPreview=mode==="BUILD"?Math.min(freePixels,pending.size):0;
  const paidPreview=mode==="RAID"?pending.size*2:pending.size-freeUsedPreview;

  return(
    <div style={{background:"#040408",minHeight:"100vh",fontFamily:"'Rajdhani',sans-serif",color:"#e0e8ff",userSelect:"none",position:"relative",overflow:"hidden"}}>
      <style>{`
        @keyframes slideDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:none}}
        @keyframes pop{0%{transform:scale(.85);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes raid{0%{background:rgba(255,50,0,.25)}100%{background:transparent}}
        .chip:hover{filter:brightness(1.4)!important}
        .tbtn:hover{filter:brightness(1.15);transform:translateY(-1px)}
        .pubtn:hover{filter:brightness(1.2);transform:scale(1.02)}
        .nav-btn:hover{background:rgba(255,255,255,.12)!important}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:#222240;border-radius:2px}
        *{box-sizing:border-box}
        input::placeholder{color:#2a2a4a}
      `}</style>

      {flashColor&&<div style={{position:"fixed",inset:0,background:rgba(flashColor,.22),zIndex:50,pointerEvents:"none",animation:"raid .3s ease forwards"}}/>}

      {/* TOASTS */}
      <div style={{position:"fixed",top:68,right:12,zIndex:200,display:"flex",flexDirection:"column",gap:6,pointerEvents:"none",maxWidth:290}}>
        {toasts.map(t=><div key={t.id} style={{background:rgba(t.color,.12),border:`1px solid ${rgba(t.color,.5)}`,borderRadius:8,padding:"7px 12px",fontSize:11,fontWeight:700,color:t.color,fontFamily:"'Orbitron',monospace",animation:"slideDown .25s ease",lineHeight:1.4}}>{t.msg}</div>)}
      </div>

      {/* COMBO */}
      {lastCombo&&<div style={{position:"fixed",top:"36%",left:"50%",transform:"translateX(-50%)",zIndex:300,textAlign:"center",animation:"pop .4s cubic-bezier(.34,1.56,.64,1)",pointerEvents:"none"}}>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:34,fontWeight:900,color:lastCombo.color,textShadow:`0 0 30px ${lastCombo.color}`,letterSpacing:3}}>🔥 COMBO!</div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,color:"#FFD700",marginTop:4}}>FREE PIXELS!</div>
      </div>}


      {/* RESET CONFIRMATION MODAL */}
      {showReset&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(10px)"}}
          onClick={e=>e.target===e.currentTarget&&setShowReset(false)}>
          <div style={{background:"#09091c",border:"1px solid rgba(255,60,60,.4)",borderRadius:16,padding:"28px 26px",width:360,maxWidth:"94vw",boxShadow:"0 0 60px rgba(255,60,60,.1),0 24px 60px rgba(0,0,0,.7)",textAlign:"center",animation:"pop .3s cubic-bezier(.34,1.56,.64,1)"}}>
            <div style={{fontSize:40,marginBottom:12}}>⚠️</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:900,color:"#ff6b6b",letterSpacing:2,marginBottom:8}}>RESET GRID?</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#5a5a7a",marginBottom:6,lineHeight:1.6}}>
              This will erase ALL pixels, shields, free pixel balance and daily streak from this browser.
            </div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,215,0,.6)",marginBottom:20,padding:"8px 12px",background:"rgba(255,215,0,.05)",border:"1px solid rgba(255,215,0,.15)",borderRadius:6,lineHeight:1.5}}>
              ℹ️ In demo mode this is fine — no real payments were made. Once Stripe is live, only reset with caution.
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowReset(false)} style={{flex:1,padding:"10px",background:"transparent",border:"1px solid #1a1a2e",color:"#5a5a7a",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:700,fontSize:11}}>CANCEL</button>
              <button onClick={resetGrid} style={{flex:2,padding:"10px",background:"linear-gradient(90deg,#ff4444,#ff6b6b)",border:"none",color:"#fff",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:11,letterSpacing:1}}>🔄 RESET EVERYTHING</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DAILY REWARD MODAL ── */}
      {showDaily&&dailyInfo&&!alreadyClaimedToday&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(10px)"}}>
          <div style={{background:"#09091c",border:"1px solid rgba(255,215,0,.4)",borderRadius:16,padding:"32px 28px",width:380,maxWidth:"94vw",boxShadow:"0 0 80px rgba(255,215,0,.12),0 24px 60px rgba(0,0,0,.7)",animation:"pop .4s cubic-bezier(.34,1.56,.64,1)",textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:10}}>🎁</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,color:"#FFD700",letterSpacing:2,marginBottom:4}}>DAILY REWARD</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#5a5a7a",marginBottom:20,letterSpacing:1}}>DAY {dailyInfo.days} STREAK</div>
            {/* 7-day calendar */}
            <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:20}}>
              {[1,2,3,4,5,6,7].map(d=>{
                const isDone=d<dailyInfo.days,isToday=d===dailyInfo.days,r=streakReward(d);
                return(
                  <div key={d} style={{textAlign:"center"}}>
                    <div style={{width:36,height:36,borderRadius:8,border:`1px solid ${isDone?"#FFD70066":isToday?"#FFD700":"rgba(255,255,255,.1)"}`,background:isDone?"rgba(255,215,0,.15)":isToday?"rgba(255,215,0,.25)":"rgba(255,255,255,.03)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,marginBottom:3,boxShadow:isToday?"0 0 12px rgba(255,215,0,.4)":"none"}}>
                      {isDone?"✓":isToday?"⭐":"🔒"}
                    </div>
                    <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:isDone||isToday?"#FFD700":"#3a3a5a"}}>+{r.px}px</div>
                  </div>
                );
              })}
            </div>
            <div style={{background:"rgba(255,215,0,.07)",border:"1px solid rgba(255,215,0,.2)",borderRadius:10,padding:"14px 18px",marginBottom:16}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:24,fontWeight:900,color:"#FFD700",marginBottom:4}}>+{dailyInfo.reward.px} FREE PIXELS</div>
              {dailyInfo.reward.bonus&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#FF2D78",letterSpacing:1,animation:"shimmer 1.2s infinite"}}>{dailyInfo.reward.bonus}</div>}
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#5a5a7a",marginTop:6}}>Balance after: {freePixels+dailyInfo.reward.px}px free</div>
            </div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#3a3a5a",marginBottom:16,lineHeight:1.5}}>Free pixels auto-apply in BUILD mode — no payment needed.</div>
            <button onClick={claimDaily} style={{width:"100%",padding:"13px",background:"linear-gradient(90deg,#FFD700,#FF9900)",border:"none",color:"#040408",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:13,letterSpacing:2}}>
              CLAIM +{dailyInfo.reward.px} FREE PIXELS →
            </button>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#1a1a2a",marginTop:10}}>Come back tomorrow to keep your streak!</div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{background:"#06060e",borderBottom:"1px solid #1a1a30",padding:"7px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,rgba(0,245,255,.05),transparent 30%,rgba(255,68,0,.03) 70%,transparent)",pointerEvents:"none"}}/>
        <div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:20,fontWeight:900,letterSpacing:4,background:"linear-gradient(90deg,#00F5FF,#FF4400,#C8FF00)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>⚔ PIXELS OF WAR</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#2a2a4a",letterSpacing:2}}>2000×2000 · {(4000000-totalSold).toLocaleString()} FREE · €4,000,000 GRID</div>
          <button onClick={()=>navigate("/fandoms")} style={{marginTop:4,background:"rgba(0,245,255,.06)",border:"1px solid rgba(0,245,255,.2)",borderRadius:5,padding:"3px 9px",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#00F5FF",letterSpacing:1}}>🔍 ALL FANDOMS</button>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {freePixels>0&&<div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,215,0,.08)",border:"1px solid rgba(255,215,0,.3)",borderRadius:8,padding:"4px 10px",cursor:"pointer"}} onClick={openDailyModal}>
            <span style={{fontSize:14}}>🎁</span>
            <div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:"#FFD700"}}>{freePixels} FREE</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#5a5a5a"}}>{alreadyClaimedToday?"CLAIMED TODAY":"CLAIM REWARD"}</div>
            </div>
          </div>}
          <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,45,120,.07)",border:"1px solid rgba(255,45,120,.25)",borderRadius:8,padding:"4px 10px",cursor:"pointer"}} onClick={openDailyModal}>
            <span style={{fontSize:14}}>🔥</span>
            <div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:"#FF2D78"}}>{streakData.days} DAY{streakData.days!==1?"S":""}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#5a5a5a"}}>{alreadyClaimedToday?"✅ CLAIMED":"TAP TO CLAIM"}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,background:rgba(myRank.color,.07),border:`1px solid ${rgba(myRank.color,.25)}`,borderRadius:8,padding:"4px 10px"}}>
            <span style={{fontSize:14}}>{myRank.icon}</span>
            <div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:myRank.color}}>{myRank.name}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#5a5a5a"}}>{myPixels}px</div>
            </div>
          </div>

        </div>
        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
          {[["SOLD",totalSold.toLocaleString(),"#00F5FF"],["REVENUE",`€${totalSold}`,"#C8FF00"],["FANDOMS",board.length,"#FF2D78"]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:c}}>{v}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#2a2a4a",letterSpacing:1.5}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* EVENT BANNER */}
      {event&&<div style={{background:`linear-gradient(90deg,${rgba(event.color,.14)},transparent)`,borderBottom:`1px solid ${rgba(event.color,.35)}`,padding:"5px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",animation:"slideDown .3s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <span style={{fontSize:16,animation:"pulse 1s infinite"}}>{event.icon}</span>
          <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:event.color,letterSpacing:2}}>{event.label} </span>
          <span style={{fontSize:11,color:"#c0c8e8"}}>— {event.desc}</span>
        </div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:12,color:event.color,fontWeight:700,animation:"pulse 1s infinite"}}>{Math.floor(eventTimer/60)}:{String(eventTimer%60).padStart(2,"0")}</div>
      </div>}

      {/* FREE PIXELS BANNER */}
      {freePixels>0&&!active&&<div style={{background:"rgba(255,215,0,.05)",borderBottom:"1px solid rgba(255,215,0,.15)",padding:"5px 14px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:13}}>🎁</span>
        <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#FFD700"}}>You have <strong>{freePixels} free pixels</strong> — select a fandom below to use them!</span>
      </div>}

      <div style={{display:"flex",height:`calc(100vh - ${event?100:freePixels>0&&!active?86:60}px)`,overflow:"hidden"}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>

          {/* CANVAS */}
          <div style={{padding:"6px 6px 0",flexShrink:0,position:"relative"}}>
            <div style={{border:`2px solid ${rgba(modeColor,.35)}`,borderRadius:6,overflow:"hidden",lineHeight:0,cursor:active&&mode!=="SHOP"?"crosshair":"default",position:"relative",animation:shakeCanvas?"shake .4s ease":undefined,boxShadow:`0 0 24px ${rgba(modeColor,.08)}`}}>
              <canvas ref={cvs} width={CW} height={CH} style={{width:"100%",display:"block",imageRendering:"pixelated",maxHeight:"40vh"}}
                onMouseDown={onMD} onMouseMove={onMM_h} onMouseUp={onMU} onMouseLeave={onML} onDragStart={e=>e.preventDefault()}/>
              <div style={{position:"absolute",top:6,left:6,background:rgba(modeColor,.12),border:`1px solid ${rgba(modeColor,.4)}`,borderRadius:4,padding:"2px 8px",fontFamily:"'Orbitron',monospace",fontSize:8,color:modeColor,pointerEvents:"none",letterSpacing:2}}>
                {mode==="BUILD"?"🏗 BUILD":mode==="RAID"?"⚔️ RAID":"💥 SHOP"}
              </div>
              <div style={{position:"absolute",top:6,left:90,background:"rgba(0,245,255,.08)",border:"1px solid rgba(0,245,255,.2)",borderRadius:4,padding:"2px 7px",fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#00F5FF",pointerEvents:"none"}}>🛡 CYAN = SHIELDED</div>
              <div style={{position:"absolute",bottom:6,left:6,fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.2)",pointerEvents:"none"}}>SECTOR {Math.floor(vx/100)+1}-{Math.floor(vy/100)+1} · ({vx},{vy})</div>
              <div style={{position:"absolute",top:6,right:6,background:"rgba(4,4,12,.85)",borderRadius:5,border:"1px solid rgba(0,245,255,.25)",overflow:"hidden",cursor:"crosshair"}} onClick={onMmClick}>
                <canvas ref={mmCvs} width={MM} height={MM} style={{display:"block",width:100,height:100}}/>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#3a3a5a",textAlign:"center",padding:"2px 0",letterSpacing:1}}>MINIMAP · CLICK</div>
              </div>
              {hov&&<div style={{position:"absolute",bottom:6,right:112,background:rgba(hov.color,.15),border:`1px solid ${hov.color}`,borderRadius:4,padding:"2px 8px",fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:hov.color,pointerEvents:"none"}}>{hov.name}</div>}
              {!active&&<div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(4,4,8,.85))",padding:"16px 12px 8px",pointerEvents:"none",borderRadius:"0 0 4px 4px",textAlign:"center"}}>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,letterSpacing:3,color:"rgba(0,245,255,.5)"}}>⚔ SELECT A FANDOM BELOW TO CLAIM PIXELS</div>
              </div>}
            </div>
          </div>

          {/* NAV + MODES */}
          <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 6px 0",flexShrink:0,flexWrap:"wrap"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,24px)",gridTemplateRows:"repeat(3,24px)",gap:2}}>
              {[["↖","-100,-100"],["↑","0,-50"],["↗","100,-100"],["←","-50,0"],["","0,0"],["→","50,0"],["↙","-100,100"],["↓","0,50"],["↘","100,100"]].map(([lbl,delta],i)=>{
                if(i===4)return<div key={i}/>;
                const[dx,dy]=delta.split(",").map(Number);
                return(<button key={i} className="nav-btn" onClick={()=>pan(dx,dy)} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:3,color:"#6070a0",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .1s"}}>{lbl}</button>);
              })}
            </div>
            <div style={{display:"flex",gap:3,marginLeft:"auto"}}>
              {[{m:"BUILD",icon:"🏗",c:"#00F5FF"},{m:"RAID",icon:"⚔️",c:"#FF4400"},{m:"SHOP",icon:"💥",c:"#C8FF00"}].map(({m,icon,c})=>{
                const on=mode===m;
                return(<button key={m} className="chip" onClick={()=>setMode(m)} style={{padding:"5px 10px",background:on?rgba(c,.15):"transparent",border:`1px solid ${on?c:rgba(c,.22)}`,borderRadius:5,color:on?c:rgba(c,.45),cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,letterSpacing:.5,transition:"all .12s",boxShadow:on?`0 0 14px ${rgba(c,.2)}`:"none"}}>{icon} {m}</button>);
              })}
            </div>
          </div>

          {/* ACTIVE TEAM BAR — always visible when fandom selected */}
          {at&&(
            <div style={{margin:"4px 6px 0",padding:"6px 11px",background:rgba(modeColor,.06),border:`1px solid ${rgba(modeColor,.3)}`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexShrink:0,animation:"slideDown .2s ease"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:8,height:8,borderRadius:1,background:at.color,boxShadow:`0 0 7px ${at.color}`}}/>
                <span style={{fontWeight:700,fontSize:11,color:at.color,fontFamily:"'Orbitron',monospace"}}>{at.name}</span>
                {pending.size===0&&<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a3a5a"}}>drag pixels on the grid to select</span>}
                {pending.size>=10&&<span style={{fontFamily:"'Orbitron',monospace",fontSize:8,color:"#FFD700",animation:"pulse 1s infinite"}}>🔥 COMBO!</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                {pending.size>0&&freeUsedPreview>0&&<span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#FFD700"}}>🎁{freeUsedPreview}FREE+</span>}
                {pending.size>0&&<span style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:900,color:"#C8FF00"}}>€{paidPreview}</span>}
                {pending.size>0&&<button onClick={handleClaim} style={{padding:"4px 12px",background:`linear-gradient(90deg,${modeColor},${at.color})`,color:"#040408",border:"none",borderRadius:4,fontWeight:900,cursor:"pointer",fontSize:10,fontFamily:"'Orbitron',monospace",letterSpacing:1}}>{mode==="RAID"?"⚔ RAID!":"🏴 CLAIM!"}</button>}
                {pending.size>0&&<button onClick={()=>setPending(new Set())} style={{background:"none",border:"none",color:"#3a3a5a",cursor:"pointer",fontSize:13}}>✕</button>}
                <button onClick={()=>{setActive(null);setPending(new Set());}} style={{padding:"4px 10px",background:"rgba(255,60,60,.08)",border:"1px solid rgba(255,60,60,.3)",borderRadius:4,color:"#ff6b6b",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,letterSpacing:1,fontWeight:700}}>✕ DESELECT</button>
              </div>
            </div>
          )}

          {/* BROWSER / SHOP */}
          <div style={{flex:1,overflowY:"auto",padding:"4px 6px 8px"}}>
            {mode==="SHOP"?(
              <>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,letterSpacing:3,color:"#C8FF00",marginBottom:8}}>💥 POWER-UP SHOP</div>
                <div style={{background:"rgba(0,170,255,.05)",border:"1px solid rgba(0,170,255,.15)",borderRadius:7,padding:"7px 11px",marginBottom:8,fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#00AAFF",lineHeight:1.6}}>
                  🛡️ Shielded pixels (cyan) cannot be raided, bombed or nuked by anyone. All purchases auto-shielded 24h. Fortress extends to 1 hour.
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:5}}>
                  {POWERUPS.map(pu=>(
                    <div key={pu.id} className="pubtn" onClick={()=>usePowerup(pu)} style={{background:rgba(pu.color,.07),border:`1px solid ${rgba(pu.color,.3)}`,borderRadius:8,padding:"10px",cursor:"pointer",transition:"all .15s",position:"relative"}}>
                      <div style={{position:"absolute",top:4,right:5,fontFamily:"'Share Tech Mono',monospace",fontSize:6,color:RARITY_COLOR[pu.rarity]}}>{pu.rarity}</div>
                      <div style={{fontSize:22,marginBottom:4}}>{pu.icon}</div>
                      <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:900,color:pu.color,marginBottom:3}}>{pu.name}</div>
                      <div style={{fontSize:10,color:"#7a7aaa",lineHeight:1.4,marginBottom:6}}>{pu.desc}</div>
                      <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:900,color:"#C8FF00"}}>€{pu.price}</div>
                    </div>
                  ))}
                </div>
              </>
            ):(
              <>
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder={`🔍 Search ${ALL.length} fandoms…`}
                  style={{width:"100%",background:"#0c0c1c",border:`1px solid ${rgba(selAccent,.2)}`,borderRadius:5,padding:"5px 10px",color:"#b0b8e0",fontSize:11,fontFamily:"'Rajdhani',sans-serif",outline:"none",marginBottom:5}}/>
                <div style={{display:"flex",gap:3,marginBottom:4,flexWrap:"wrap"}}>
                  {["All","🎮 Gaming","🎌 Anime","🎵 Music"].map(c=>{const acc=c==="All"?"#5566AA":CAT_ACCENT[c],on=selCat===c;return(<button key={c} className="chip" onClick={()=>setSelCat(c)} style={{padding:"3px 9px",borderRadius:4,border:`1px solid ${on?acc:acc+"33"}`,background:on?rgba(acc,.15):"transparent",color:on?acc:acc+"77",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Orbitron',monospace",letterSpacing:.5,transition:"all .1s"}}>{c}</button>);})}
                </div>
                <div style={{display:"flex",gap:3,marginBottom:5,overflowX:"auto",paddingBottom:2}}>
                  {subArrFull.map(s=>{const on=selSub===s,acc=selCat!=="All"?CAT_ACCENT[selCat]:"#5566AA";return(<button key={s} className="chip" onClick={()=>setSelSub(s)} style={{padding:"2px 7px",borderRadius:20,border:`1px solid ${on?acc:acc+"22"}`,background:on?rgba(acc,.12):"transparent",color:on?acc:acc+"55",fontSize:8,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",whiteSpace:"nowrap",transition:"all .1s"}}>{s}</button>);})}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(125px,1fr))",gap:3}}>
                  {vis.map(t=>{const isA=active===t.id,acc=CAT_ACCENT[t.cat]||"#00F5FF",px=Object.values(pixels).filter(v=>v===t.id).length,rank=getRank(px);return(
                    <div key={t.id} className="tbtn" onClick={()=>setActive(isA?null:t.id)} style={{padding:"5px 7px",borderRadius:5,cursor:"pointer",border:`1px solid ${isA?t.color:acc+"18"}`,background:isA?rgba(t.color,.1):"#0c0c1a",transition:"all .1s",position:"relative",overflow:"hidden"}}>
                      {isA&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:2,background:t.color}}/>}
                      <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:1}}>
                        <div style={{width:6,height:6,borderRadius:1,background:t.color,flexShrink:0}}/>
                        <span style={{fontWeight:700,fontSize:10,color:isA?t.color:"#c0c8e8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</span>
                      </div>
                      <div style={{fontSize:8,color:acc+"55",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Share Tech Mono',monospace"}}>{t.sub}</div>
                      {px>0&&<div style={{display:"flex",alignItems:"center",gap:3,marginTop:1}}><span style={{fontSize:8}}>{rank.icon}</span><span style={{fontSize:8,color:rank.color,fontFamily:"'Orbitron',monospace",fontWeight:700}}>{px}px</span></div>}
                    </div>
                  );})}
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{width:190,borderLeft:"1px solid #1a1a30",background:"#05050d",flexShrink:0,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{display:"flex",borderBottom:"1px solid #1a1a30",flexShrink:0}}>
            {[["WAR","⚔ WAR"],["FEED","📡 FEED"]].map(([t,label])=>{const on=tab===t;return(<button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"7px 0",background:on?"#08081a":"transparent",border:"none",color:on?"#00F5FF":"#3a3a5a",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:900,letterSpacing:1,borderBottom:on?"2px solid #00F5FF":"2px solid transparent",transition:"all .1s"}}>{label}</button>);})}</div>

          {/* Streak mini card — uses openDailyModal safely */}
          <div onClick={openDailyModal} style={{margin:"6px 6px 0",padding:"7px 8px",background:"rgba(255,215,0,.05)",border:"1px solid rgba(255,215,0,.15)",borderRadius:7,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>🔥</span>
            <div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:900,color:"#FFD700"}}>{streakData.days} DAY STREAK</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#5a5a5a"}}>{alreadyClaimedToday?"✅ Claimed today":"🎁 "+freePixels+"px free · tap"}</div>
            </div>
          </div>

          {tab==="WAR"?(
            <div style={{flex:1,overflowY:"auto",padding:"6px 6px"}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:8,letterSpacing:2,color:"#2a2a4a",marginBottom:5}}>TERRITORY RANKINGS</div>
              {board.length===0?<div style={{fontSize:9,color:"#1a1a2a",fontFamily:"'Share Tech Mono',monospace",paddingTop:8}}>No territory yet</div>
              :board.map((t,i)=>{const acc=CAT_ACCENT[t.cat]||"#00F5FF",rank=getRank(t.count);return(
                <div key={t.id} onClick={()=>setActive(t.id)} style={{marginBottom:3,padding:"5px 6px",background:"#09091a",borderRadius:5,border:`1px solid ${acc}18`,cursor:"pointer",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",left:0,top:0,bottom:0,width:2,background:`linear-gradient(180deg,${t.color},${acc})`}}/>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2,paddingLeft:5}}>
                    <span style={{fontSize:8,fontWeight:700,color:t.color,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:105}}>{rank.icon} {t.name}</span>
                    <span style={{fontSize:7,color:"#C8FF00",fontFamily:"'Orbitron',monospace"}}>€{t.count}</span>
                  </div>
                  <div style={{height:2,background:"#1a1a2e",borderRadius:2,overflow:"hidden",marginBottom:1,marginLeft:5}}>
                    <div style={{height:"100%",width:`${(t.count/board[0].count)*100}%`,background:`linear-gradient(90deg,${t.color},${acc})`,borderRadius:2,transition:"width .5s"}}/>
                  </div>
                  <div style={{fontSize:7,color:"#2a2a3a",marginLeft:5,fontFamily:"'Share Tech Mono',monospace"}}>{rank.name} · {t.count}px</div>
                </div>
              );})}
            </div>
          ):(
            <div style={{flex:1,overflowY:"auto",padding:"6px 6px"}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:8,letterSpacing:2,color:"#2a2a4a",marginBottom:5,display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:"#FF2D78",animation:"pulse .8s infinite"}}/>LIVE FEED
              </div>
              {feed.map(f=>(
                <div key={f.id} style={{marginBottom:3,padding:"4px 5px",background:f.isMe?rgba(f.color,.08):"#08081a",borderRadius:4,border:`1px solid ${f.isMe?rgba(f.color,.3):"#1a1a2a"}`,animation:"slideDown .2s ease"}}>
                  <div style={{display:"flex",gap:4,alignItems:"flex-start"}}>
                    <span style={{fontSize:10,flexShrink:0}}>{f.icon}</span>
                    <div style={{minWidth:0}}>
                      <span style={{fontSize:8,fontWeight:700,color:f.color}}>{f.team} </span>
                      <span style={{fontSize:8,color:"#5a5a7a"}}>{f.msg}</span>
                      {f.isMe&&<span style={{fontSize:7,color:"#FFD700",marginLeft:3}}>YOU</span>}
                    </div>
                  </div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:6,color:"#2a2a3a",marginTop:1,textAlign:"right"}}>{f.ts}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RESET — fixed bottom-left, always visible */}
      <button onClick={()=>setShowReset(true)} style={{position:"fixed",bottom:14,left:14,zIndex:500,background:"rgba(10,5,5,.9)",border:"1px solid rgba(255,60,60,.35)",borderRadius:8,padding:"7px 13px",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#ff6b6b",letterSpacing:1,backdropFilter:"blur(6px)",boxShadow:"0 2px 12px rgba(0,0,0,.5)"}}>🔄 RESET GRID</button>

    </div>
  );
}
