import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

// ── Shared data ───────────────────────────────────────────────────────────────
const hashColor=(n)=>{let h=0;for(let i=0;i<n.length;i++)h=(Math.imul(31,h)+n.charCodeAt(i))|0;const hue=Math.abs(h)%360,sat=65+(Math.abs(h>>8)%25),lit=50+(Math.abs(h>>16)%15),s=sat/100,l=lit/100,a=s*Math.min(l,1-l),f=x=>{const k=(x+hue/30)%12,c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,"0")};return`#${f(0)}${f(8)}${f(4)}`;};
const KC={"Fortnite":"#00B4F0","Minecraft":"#62B32F","Valorant":"#FF4655","Apex Legends":"#DA292A","League of Legends":"#0BC4E3","GTA V":"#00853E","Among Us":"#C51111","Rocket League":"#0092CF","Overwatch 2":"#F99E1A","Elden Ring":"#B0884A","Cyberpunk 2077":"#FCEE09","God of War":"#AA0000","Genshin Impact":"#0095FF","Pokémon":"#FFCB05","FIFA / EA FC 24":"#2980B9","Naruto":"#FF6B35","One Piece":"#E31E24","Dragon Ball Z":"#FF8C00","Bleach":"#3355BB","My Hero Academia":"#2E86C1","Demon Slayer":"#CC3355","Jujutsu Kaisen":"#6B21A8","Chainsaw Man":"#CC1122","Attack on Titan":"#7A6640","Death Note":"#CC0000","One Punch Man":"#FFD700","Haikyuu!!":"#FF6600","Blue Lock":"#1B3FA0","Spirited Away":"#CC6699","BTS":"#9747FF","BLACKPINK":"#FF1493","Stray Kids":"#CC0033","Aespa":"#00AAFF","NewJeans":"#FF6699","IVE":"#3355AA","TWICE":"#FF9EC4","NCT 127":"#00AACC","ENHYPEN":"#222255","TXT":"#5599FF","ATEEZ":"#CC4400","(G)I-DLE":"#CC0055","Drake":"#BF8E3B","Travis Scott":"#C7A444","Kendrick Lamar":"#CC0000","Eminem":"#5C8AFF","Tyler, the Creator":"#AACC00","Post Malone":"#CC8866","Taylor Swift":"#A855F7","Billie Eilish":"#00DD88","Ariana Grande":"#CC88BB","Dua Lipa":"#9900FF","Olivia Rodrigo":"#6622BB","The Weeknd":"#CC0000","Bruno Mars":"#CC8800","Bad Bunny":"#00CC44","Daft Punk":"#FFD700","Skrillex":"#00FF88","Martin Garrix":"#0066FF","Linkin Park":"#8C1C1C","My Chemical Romance":"#CC0000","Arctic Monkeys":"#885522","Twenty One Pilots":"#FFCC00","Tame Impala":"#FF9900","Metallica":"#777777"};
const tc=(n)=>KC[n]||hashColor(n);
const rgba=(hex,a)=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};

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

const slugify=(n)=>n.toLowerCase().replace(/[^a-z0-9\s]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim();
const SLUG_MAP=Object.fromEntries(ALL.map(t=>[slugify(t.name),t]));

const RANKS=[
  {name:"BRONZE",min:0,max:49,icon:"🥉",color:"#CD7F32"},
  {name:"SILVER",min:50,max:199,icon:"🥈",color:"#C0C0C0"},
  {name:"GOLD",min:200,max:499,icon:"🥇",color:"#FFD700"},
  {name:"PLATINUM",min:500,max:999,icon:"💎",color:"#00EAFF"},
  {name:"DIAMOND",min:1000,max:2499,icon:"💠",color:"#BB88FF"},
  {name:"LEGEND",min:2500,max:Infinity,icon:"👑",color:"#FF2D78"},
];
const getRank=(px)=>RANKS.find(r=>px>=r.min&&px<=r.max)||RANKS[0];

const GW=2000,GH=2000,TOTAL=GW*GH;
const SIM_ACTIONS=["claimed","defended","raided an enemy","bought pixels for","celebrated with","joined the battle for"];
const randInt=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;

export default function FandomPage(){
  const {slug}=useParams();
  const navigate=useNavigate();
  const mmRef=useRef(null);
  const [copied,setCopied]=useState(false);
  const [pixelCount,setPixelCount]=useState(0);
  const [totalPixels,setTotalPixels]=useState(0);
  const [loading,setLoading]=useState(true);
  const [activity,setActivity]=useState([]);

  const fandom=SLUG_MAP[slug];

  // Load real pixel counts from Supabase
  useEffect(()=>{
    if(!fandom)return;
    setLoading(true);
    supabase.from("pixels").select("*",{count:"exact",head:true}).eq("team_id",fandom.id)
      .then(({count})=>{setPixelCount(count||0);setLoading(false);});
    supabase.from("pixels").select("*",{count:"exact",head:true})
      .then(({count})=>setTotalPixels(count||0));
  },[fandom?.id]);

  // Generate simulated activity feed for this fandom
  useEffect(()=>{
    if(!fandom)return;
    const items=Array.from({length:12},(_,i)=>({
      id:i,
      action:SIM_ACTIONS[randInt(0,SIM_ACTIONS.length-1)],
      px:randInt(1,50),
      time:`${randInt(1,59)}m ago`,
      user:`Fan_${Math.random().toString(36).slice(2,7).toUpperCase()}`,
    }));
    setActivity(items);
  },[fandom]);

  // Draw territory minimap using real pixel positions
  useEffect(()=>{
    const mm=mmRef.current;if(!mm||!fandom)return;
    const ctx=mm.getContext("2d");
    const W=400,H=400,MMS=GW/W;
    ctx.fillStyle="#07071a";ctx.fillRect(0,0,W,H);
    // Grid lines
    ctx.strokeStyle="rgba(255,255,255,.04)";ctx.lineWidth=1;
    for(let i=0;i<=20;i++){const p=i*20;ctx.beginPath();ctx.moveTo(p,0);ctx.lineTo(p,H);ctx.stroke();ctx.beginPath();ctx.moveTo(0,p);ctx.lineTo(W,p);ctx.stroke();}
    if(pixelCount===0)return;
    // Fetch pixel positions for this fandom
    supabase.from("pixels").select("idx").eq("team_id",fandom.id).limit(5000)
      .then(({data})=>{
        if(!data)return;
        ctx.shadowColor=fandom.color;ctx.shadowBlur=3;
        ctx.fillStyle=fandom.color;
        data.forEach(({idx})=>{
          const gx=idx%GW,gy=Math.floor(idx/GW);
          ctx.fillRect(Math.floor(gx/MMS),Math.floor(gy/MMS),2,2);
        });
        ctx.shadowBlur=0;
      });
  },[pixelCount,fandom]);

  if(!fandom){
    return(
      <div style={{background:"#040408",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Rajdhani',sans-serif"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>🔍</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:20,color:"#ff6b6b",marginBottom:8}}>FANDOM NOT FOUND</div>
          <div style={{color:"rgba(255,255,255,.4)",marginBottom:24}}>"{slug}" doesn't exist in our database.</div>
          <button onClick={()=>navigate("/fandoms")} style={{background:"rgba(0,245,255,.1)",border:"1px solid rgba(0,245,255,.3)",color:"#00F5FF",borderRadius:8,padding:"10px 24px",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:12,letterSpacing:1}}>VIEW ALL FANDOMS</button>
        </div>
      </div>
    );
  }

  const rank=getRank(pixelCount);
  const pct=totalPixels>0?((pixelCount/totalPixels)*100).toFixed(4):"0.0000";
  const catAccent=CAT_ACCENT[fandom.cat]||"#00F5FF";

  // Leaderboard position
  const [lbPos,setLbPos]=useState("—");
  useEffect(()=>{
    if(!fandom)return;
    supabase.rpc("get_fandom_rankings").then(({data})=>{
      if(!data)return;
      const pos=data.findIndex(r=>r.team_id===fandom.id)+1;
      setLbPos(pos||"—");
    }).catch(()=>setLbPos("—"));
  },[fandom?.id]);

  const shareUrl=window.location.href;
  const shareCardRef=useRef(null);
  const [generatingCard,setGeneratingCard]=useState(false);

  const generateShareCard=async()=>{
    setGeneratingCard(true);
    const canvas=document.createElement("canvas");
    canvas.width=1200;canvas.height=630;
    const ctx=canvas.getContext("2d");
    const c=fandom.color;
    const hexToRgb=h=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return{r,g,b};};
    const rgb=hexToRgb(c);

    // Background
    const bg=ctx.createLinearGradient(0,0,1200,630);
    bg.addColorStop(0,"#04040c");
    bg.addColorStop(0.5,`rgba(${rgb.r},${rgb.g},${rgb.b},0.08)`);
    bg.addColorStop(1,"#04040c");
    ctx.fillStyle=bg;ctx.fillRect(0,0,1200,630);

    // Grid pattern
    ctx.strokeStyle="rgba(255,255,255,0.03)";ctx.lineWidth=1;
    for(let x=0;x<1200;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,630);ctx.stroke();}
    for(let y=0;y<630;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1200,y);ctx.stroke();}

    // Glow circle behind fandom name
    const grd=ctx.createRadialGradient(600,280,0,600,280,300);
    grd.addColorStop(0,`rgba(${rgb.r},${rgb.g},${rgb.b},0.15)`);
    grd.addColorStop(1,"transparent");
    ctx.fillStyle=grd;ctx.fillRect(0,0,1200,630);

    // Top label
    ctx.fillStyle="rgba(255,255,255,0.3)";
    ctx.font="bold 22px monospace";
    ctx.textAlign="center";
    ctx.fillText("⚔ PIXELS OF WAR",600,60);

    // Fandom name
    ctx.shadowColor=c;ctx.shadowBlur=40;
    ctx.fillStyle=c;
    const nameSize=pixelCount>0?Math.min(120,Math.max(60,1800/fandom.name.length)):80;
    ctx.font=`900 ${nameSize}px 'Arial Black', sans-serif`;
    ctx.fillText(fandom.name,600,220);
    ctx.shadowBlur=0;

    // Divider line
    ctx.strokeStyle=c;ctx.lineWidth=2;ctx.globalAlpha=0.4;
    ctx.beginPath();ctx.moveTo(300,250);ctx.lineTo(900,250);ctx.stroke();
    ctx.globalAlpha=1;

    // Stats row
    const stats=[
      {label:"PIXELS OWNED",value:pixelCount.toLocaleString(),color:"#C8FF00"},
      {label:"TERRITORY",value:pct+"%",color:"#00F5FF"},
      {label:"RANK",value:rank.icon+" "+rank.name,color:rank.color},
      {label:"LEADERBOARD",value:"#"+lbPos,color:"#FFD700"},
    ];
    stats.forEach((s,i)=>{
      const x=150+i*225;
      ctx.fillStyle=s.color;
      ctx.shadowColor=s.color;ctx.shadowBlur=10;
      ctx.font="bold 36px monospace";
      ctx.textAlign="center";
      ctx.fillText(s.value,x,330);
      ctx.shadowBlur=0;
      ctx.fillStyle="rgba(255,255,255,0.35)";
      ctx.font="12px monospace";
      ctx.fillText(s.label,x,355);
    });

    // Call to action
    ctx.fillStyle="rgba(255,255,255,0.15)";
    ctx.beginPath();
    ctx.roundRect(350,400,500,70,12);
    ctx.fill();
    ctx.strokeStyle=c;ctx.lineWidth=1.5;ctx.globalAlpha=0.5;
    ctx.stroke();ctx.globalAlpha=1;
    ctx.fillStyle="#ffffff";
    ctx.font="bold 22px monospace";
    ctx.textAlign="center";
    ctx.fillText("JOIN THE WAR → pixelsofwar.com",600,441);

    // Bottom tag
    ctx.fillStyle="rgba(255,255,255,0.2)";
    ctx.font="13px monospace";
    ctx.fillText(`#PixelsOfWar  #${fandom.name.replace(/\s/g,"")}  ${fandom.cat}`,600,560);

    // Category pill
    ctx.fillStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},0.2)`;
    ctx.beginPath();ctx.roundRect(480,580,240,30,15);ctx.fill();
    ctx.fillStyle=c;ctx.font="bold 13px monospace";
    ctx.fillText(fandom.sub+" · "+fandom.cat.replace(/[^\w\s]/g,"").trim(),600,600);

    // Download
    const link=document.createElement("a");
    link.download=`pixels-of-war-${slug}.png`;
    link.href=canvas.toDataURL("image/png");
    link.click();
    setGeneratingCard(false);
  };

  const handleShare=()=>{
    navigator.clipboard.writeText(shareUrl).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2500);});
  };

  const handleJoin=()=>{
    navigate(`/?fandom=${encodeURIComponent(slug)}`);
  };

  // SEO — update document head with fandom-specific meta tags
  useEffect(()=>{
    if(!fandom)return;
    const title=`${fandom.name} Territory · Pixels of War`;
    const desc=`${fandom.name} owns ${pixelCount.toLocaleString()} pixels (${pct}% of the grid) on Pixels of War. Join the battle and claim territory for ${fandom.name}! ⚔️`;
    const url=`https://www.pixelsofwar.com/fandom/${slug}`;
    document.title=title;
    const setMeta=(name,content,prop=false)=>{
      const sel=prop?`meta[property="${name}"]`:`meta[name="${name}"]`;
      let el=document.querySelector(sel);
      if(!el){el=document.createElement("meta");prop?el.setAttribute("property",name):el.setAttribute("name",name);document.head.appendChild(el);}
      el.setAttribute("content",content);
    };
    setMeta("description",desc);
    setMeta("keywords",`${fandom.name}, pixels of war, ${fandom.cat}, fandom battle, pixel territory`);
    setMeta("og:title",title,true);
    setMeta("og:description",desc,true);
    setMeta("og:url",url,true);
    setMeta("og:type","website",true);
    setMeta("og:image","https://www.pixelsofwar.com/og-image.png",true);
    setMeta("twitter:card","summary_large_image");
    setMeta("twitter:title",title);
    setMeta("twitter:description",desc);
    setMeta("twitter:image","https://www.pixelsofwar.com/og-image.png");
    return()=>{document.title="Pixels of War ⚔️";};
  },[fandom,pixelCount,pct,slug]);

  return(
    <div style={{background:"#040408",minHeight:"100vh",fontFamily:"'Rajdhani',sans-serif",color:"#e0e8ff"}}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#222240;border-radius:2px}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>

      {/* NAV */}
      <div style={{background:"#06060e",borderBottom:"1px solid #1a1a30",padding:"10px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <button onClick={()=>navigate("/")} style={{background:"transparent",border:"1px solid rgba(255,255,255,.1)",borderRadius:6,padding:"6px 12px",color:"rgba(255,255,255,.5)",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:10,letterSpacing:1}}>← BACK TO GAME</button>
          <button onClick={()=>navigate("/fandoms")} style={{background:"transparent",border:"1px solid rgba(255,255,255,.1)",borderRadius:6,padding:"6px 12px",color:"rgba(255,255,255,.5)",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:10,letterSpacing:1}}>🔍 ALL FANDOMS</button>
        </div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,background:"linear-gradient(90deg,#00F5FF,#FF4400,#C8FF00)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>⚔ PIXELS OF WAR</div>
      </div>

      {/* HERO */}
      <div style={{position:"relative",padding:"52px 24px 44px",textAlign:"center",overflow:"hidden",background:`linear-gradient(135deg,${rgba(fandom.color,.08)},${rgba(fandom.color,.02)},${rgba(catAccent,.05)})`,borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        {/* Background glow */}
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:500,height:500,borderRadius:"50%",background:rgba(fandom.color,.06),filter:"blur(80px)",pointerEvents:"none"}}/>

        <div style={{position:"relative",maxWidth:700,margin:"0 auto",animation:"fadeUp .4s ease"}}>
          {/* Category badge */}
          <div style={{display:"inline-block",fontFamily:"'Share Tech Mono',monospace",fontSize:10,letterSpacing:3,color:catAccent,border:`1px solid ${rgba(catAccent,.35)}`,padding:"4px 14px",borderRadius:20,marginBottom:18}}>
            {fandom.cat} · {fandom.sub}
          </div>

          {/* Name */}
          <h1 style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(36px,8vw,72px)",fontWeight:900,letterSpacing:3,color:fandom.color,textShadow:`0 0 40px ${rgba(fandom.color,.4)}`,margin:"0 0 8px",lineHeight:1}}>
            {fandom.name}
          </h1>

          {/* Color bar */}
          <div style={{width:120,height:4,background:fandom.color,borderRadius:2,margin:"0 auto 28px",boxShadow:`0 0 16px ${fandom.color}`}}/>

          {/* Stats row */}
          <div style={{display:"flex",justifyContent:"center",gap:32,flexWrap:"wrap",marginBottom:32}}>
            {[
              [rank.icon+" "+rank.name,"RANK",rank.color],
              ["#"+lbPos,"LEADERBOARD",catAccent],
              [loading?"…":pixelCount.toLocaleString(),"PIXELS OWNED","#C8FF00"],
              ["€"+pixelCount,"TERRITORY VALUE","#00F5FF"],
              [pct+"%","OF TOTAL GRID","rgba(255,255,255,.6)"],
            ].map(([v,l,c])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:900,color:c,lineHeight:1,textShadow:c!=="rgba(255,255,255,.6)"?`0 0 12px ${c}66`:"none"}}>{v}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.3)",letterSpacing:2,marginTop:4}}>{l}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={handleJoin} style={{padding:"13px 32px",background:`linear-gradient(90deg,${fandom.color},${catAccent})`,color:"#040408",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:14,letterSpacing:2,boxShadow:`0 0 24px ${rgba(fandom.color,.3)}`}}>
              ⚔ JOIN THE BATTLE
            </button>
            <button onClick={generateShareCard} disabled={generatingCard} style={{padding:"13px 24px",background:rgba(fandom.color,.12),border:`1px solid ${rgba(fandom.color,.4)}`,color:fandom.color,borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:12,letterSpacing:1,fontWeight:900}}>
              {generatingCard?"⏳ GENERATING...":"🖼️ SHARE CARD"}
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"40px 24px 80px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>

        {/* TERRITORY MAP */}
        <div style={{gridColumn:"1/-1"}}>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:12,letterSpacing:3,color:"rgba(255,255,255,.3)",marginBottom:14}}>TERRITORY MAP</div>
          <div style={{background:"#08081a",border:`1px solid ${rgba(fandom.color,.2)}`,borderRadius:14,padding:20,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 20% 50%,${rgba(fandom.color,.04)},transparent 60%)`,pointerEvents:"none"}}/>
            <div style={{display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}>
              <div style={{position:"relative",flexShrink:0}}>
                <canvas ref={mmRef} width={400} height={400} style={{display:"block",width:"100%",maxWidth:400,borderRadius:8,border:`1px solid ${rgba(fandom.color,.15)}`}}/>
                <div style={{position:"absolute",top:8,left:8,background:rgba(fandom.color,.15),border:`1px solid ${rgba(fandom.color,.4)}`,borderRadius:4,padding:"3px 8px",fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:fandom.color}}>
                  2000×2000 GRID
                </div>
              </div>
              <div style={{flex:1,minWidth:220}}>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:fandom.color,marginBottom:16}}>TERRITORY INTEL</div>
                {pixelCount===0?(
                  <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:10,padding:"20px",textAlign:"center"}}>
                    <div style={{fontSize:32,marginBottom:8}}>🏔️</div>
                    <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"rgba(255,255,255,.3)",lineHeight:1.6}}>
                      No territory claimed yet.<br/>Be the first to plant the flag<br/>for {fandom.name}!
                    </div>
                  </div>
                ):(
                  <>
                    {[
                      ["Total pixels owned",pixelCount.toLocaleString()],
                      ["Territory value","€"+pixelCount],
                      ["% of total grid",pct+"%"],
                      ["Leaderboard rank","#"+lbPos],
                      ["Status",rank.icon+" "+rank.name],
                    ].map(([l,v])=>(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                        <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"rgba(255,255,255,.4)"}}>{l}</span>
                        <span style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:700,color:fandom.color}}>{v}</span>
                      </div>
                    ))}
                  </>
                )}

                <div style={{marginTop:20,padding:"14px",background:rgba(fandom.color,.06),border:`1px solid ${rgba(fandom.color,.2)}`,borderRadius:10}}>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.35)",letterSpacing:1,marginBottom:8}}>LEGEND</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <div style={{width:12,height:12,borderRadius:2,background:fandom.color,boxShadow:`0 0 6px ${fandom.color}`}}/>
                    <span style={{fontSize:11,color:"rgba(255,255,255,.6)"}}>Your fandom's territory</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:12,height:12,borderRadius:2,background:"rgba(255,255,255,.15)"}}/>
                    <span style={{fontSize:11,color:"rgba(255,255,255,.6)"}}>Other fandoms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVITY FEED */}
        <div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:12,letterSpacing:3,color:"rgba(255,255,255,.3)",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#FF2D78",animation:"pulse .8s infinite"}}/>
            RECENT ACTIVITY
          </div>
          <div style={{background:"#08081a",border:"1px solid rgba(255,255,255,.06)",borderRadius:14,overflow:"hidden"}}>
            {activity.map((a,i)=>(
              <div key={a.id} style={{padding:"12px 16px",borderBottom:i<activity.length-1?"1px solid rgba(255,255,255,.04)":"none",display:"flex",gap:10,alignItems:"center"}}>
                <div style={{width:32,height:32,borderRadius:8,background:rgba(fandom.color,.15),border:`1px solid ${rgba(fandom.color,.3)}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>
                  {["🏴","⚔️","🛡️","⚡","🔥","💥"][i%6]}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.8)"}}>
                    <span style={{color:fandom.color,fontWeight:700}}>@{a.user}</span> {a.action} <strong>{fandom.name}</strong> (+{a.px}px)
                  </div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.25)",marginTop:2}}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HOW TO SUPPORT */}
        <div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:12,letterSpacing:3,color:"rgba(255,255,255,.3)",marginBottom:14}}>HOW TO SUPPORT {fandom.name.toUpperCase()}</div>
          <div style={{background:"#08081a",border:`1px solid ${rgba(fandom.color,.15)}`,borderRadius:14,padding:20,display:"flex",flexDirection:"column",gap:12}}>
            {[
              {icon:"🏗",title:"Claim pixels",desc:"Go to the game, select "+fandom.name+" and drag to claim territory on the 2000×2000 grid. €1 per pixel.",color:"#00F5FF"},
              {icon:"🛡️",title:"Defend territory",desc:"Buy the Fortress power-up (€8) to shield your last 30 pixels for 1 hour — making them unraidable.",color:"#00AAFF"},
              {icon:"⚔️",title:"Raid enemies",desc:"Switch to RAID mode and steal pixels from rival fandoms for €2 each. Build a dominant territory.",color:"#FF4400"},
              {icon:"🎁",title:"Daily free pixels",desc:"Log in every day to earn free pixels from your streak — no payment needed. Grows your territory for free.",color:"#FFD700"},
              {icon:"📤",title:"Share this page",desc:"Copy this URL and share it in fan communities, Discord servers and social media to recruit allies.",color:"#C8FF00"},
            ].map(s=>(
              <div key={s.title} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <div style={{width:36,height:36,borderRadius:8,background:rgba(s.color,.1),border:`1px solid ${rgba(s.color,.3)}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{s.icon}</div>
                <div>
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:700,color:s.color,marginBottom:3}}>{s.title}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.5)",lineHeight:1.5}}>{s.desc}</div>
                </div>
              </div>
            ))}

            <button onClick={handleJoin} style={{width:"100%",marginTop:4,padding:"12px",background:`linear-gradient(90deg,${fandom.color},${catAccent})`,color:"#040408",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:12,letterSpacing:2}}>
              ⚔ CLAIM PIXELS FOR {fandom.name.toUpperCase()} →
            </button>
          </div>
        </div>

        {/* SHARE */}
        <div style={{gridColumn:"1/-1",background:"#08081a",border:`1px solid ${rgba(fandom.color,.2)}`,borderRadius:14,padding:24,textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 0%,${rgba(fandom.color,.06)},transparent 60%)`,pointerEvents:"none"}}/>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,color:fandom.color,marginBottom:8}}>RECRUIT YOUR FANDOM</div>
          <div style={{fontSize:14,color:"rgba(255,255,255,.5)",marginBottom:20,maxWidth:500,margin:"0 auto 20px",lineHeight:1.7}}>
            Share this page with {fandom.name} fans. The more people who claim pixels, the harder your territory is to raid. Community always wins.
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"10px 16px",fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"rgba(255,255,255,.4)",flex:1,maxWidth:400,textAlign:"left",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {shareUrl}
            </div>
            <button onClick={handleShare} style={{padding:"10px 20px",background:rgba(fandom.color,.15),border:`1px solid ${rgba(fandom.color,.4)}`,color:fandom.color,borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:700,fontSize:11,letterSpacing:1,flexShrink:0}}>
              {copied?"✅ COPIED!":"📋 COPY LINK"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
