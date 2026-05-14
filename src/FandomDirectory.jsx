import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

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

const RANKS=[
  {name:"BRONZE",min:0,max:49,icon:"🥉",color:"#CD7F32"},
  {name:"SILVER",min:50,max:199,icon:"🥈",color:"#C0C0C0"},
  {name:"GOLD",min:200,max:499,icon:"🥇",color:"#FFD700"},
  {name:"PLATINUM",min:500,max:999,icon:"💎",color:"#00EAFF"},
  {name:"DIAMOND",min:1000,max:2499,icon:"💠",color:"#BB88FF"},
  {name:"LEGEND",min:2500,max:Infinity,icon:"👑",color:"#FF2D78"},
];
const getRank=(px)=>RANKS.find(r=>px>=r.min&&px<=r.max)||RANKS[0];

export default function FandomDirectory(){
  const navigate=useNavigate();
  const [selCat,setSelCat]=useState("All");
  const [q,setQ]=useState("");
  const [sort,setSort]=useState("pixels"); // pixels | name | cat

  // Load pixel counts from localStorage
  const pixelCounts=useMemo(()=>{
    try{
      const s=localStorage.getItem("pw2k");
      if(!s)return{};
      const px=JSON.parse(s);
      const cnt={};
      Object.values(px).forEach(id=>{cnt[id]=(cnt[id]||0)+1;});
      return cnt;
    }catch{return{};}
  },[]);

  const fandoms=useMemo(()=>{
    let list=ALL.map(t=>({...t,pixels:pixelCounts[t.id]||0,slug:slugify(t.name)}));
    if(selCat!=="All")list=list.filter(t=>t.cat===selCat);
    if(q.trim())list=list.filter(t=>t.name.toLowerCase().includes(q.toLowerCase())||t.sub.toLowerCase().includes(q.toLowerCase()));
    if(sort==="pixels")list.sort((a,b)=>b.pixels-a.pixels);
    else if(sort==="name")list.sort((a,b)=>a.name.localeCompare(b.name));
    else list.sort((a,b)=>a.cat.localeCompare(b.cat));
    return list;
  },[selCat,q,sort,pixelCounts]);

  const totalPixels=Object.values(pixelCounts).reduce((a,b)=>a+b,0);
  const activeFandoms=ALL.filter(t=>pixelCounts[t.id]>0).length;

  return(
    <div style={{background:"#040408",minHeight:"100vh",fontFamily:"'Rajdhani',sans-serif",color:"#e0e8ff"}}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#222240;border-radius:2px}.fc:hover{border-color:rgba(255,255,255,.15)!important;transform:translateY(-2px)}.fc{transition:all .15s}`}</style>

      {/* NAV */}
      <div style={{background:"#06060e",borderBottom:"1px solid #1a1a30",padding:"10px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={()=>navigate("/")} style={{background:"transparent",border:"1px solid rgba(255,255,255,.1)",borderRadius:6,padding:"6px 12px",color:"rgba(255,255,255,.5)",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:10,letterSpacing:1}}>← BACK TO GAME</button>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,background:"linear-gradient(90deg,#00F5FF,#FF4400,#C8FF00)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>⚔ PIXELS OF WAR</div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.3)"}}>{ALL.length} FANDOMS</div>
      </div>

      {/* HERO */}
      <div style={{padding:"44px 24px 36px",textAlign:"center",background:"linear-gradient(135deg,rgba(0,245,255,.04),rgba(255,68,0,.02),rgba(200,255,0,.03))",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,letterSpacing:4,color:"rgba(0,245,255,.6)",marginBottom:12}}>FANDOM DIRECTORY</div>
        <h1 style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(28px,6vw,52px)",fontWeight:900,letterSpacing:3,background:"linear-gradient(90deg,#00F5FF,#FF4400,#C8FF00)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:10,lineHeight:1}}>ALL FANDOMS</h1>
        <p style={{fontSize:15,color:"rgba(255,255,255,.4)",maxWidth:500,margin:"0 auto 28px",lineHeight:1.6}}>Every fandom currently battling on the Pixels of War grid. Find yours, check the territory, and share the link.</p>
        <div style={{display:"flex",justifyContent:"center",gap:28,flexWrap:"wrap"}}>
          {[["TOTAL FANDOMS",ALL.length.toString(),"#00F5FF"],["ACTIVE IN BATTLE",activeFandoms.toString(),"#FF2D78"],["PIXELS CLAIMED",totalPixels.toLocaleString(),"#C8FF00"],["GRID VALUE","€"+totalPixels,"#FFD700"]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:900,color:c,lineHeight:1}}>{v}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.25)",letterSpacing:2,marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 24px 80px"}}>

        {/* FILTERS */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20,alignItems:"center"}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍  Search fandoms…"
            style={{flex:1,minWidth:180,background:"#0c0c1a",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"9px 14px",color:"#b0b8e0",fontSize:13,fontFamily:"'Rajdhani',sans-serif",outline:"none"}}/>
          {["All","🎮 Gaming","🎌 Anime","🎵 Music"].map(c=>{
            const acc=c==="All"?"#5566AA":CAT_ACCENT[c],on=selCat===c;
            return(<button key={c} onClick={()=>setSelCat(c)} style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${on?acc:rgba(acc,.25)}`,background:on?rgba(acc,.15):"transparent",color:on?acc:rgba(acc,.6),cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:700,letterSpacing:.5,transition:"all .1s"}}>
              {c}
            </button>);
          })}
          <select value={sort} onChange={e=>setSort(e.target.value)} style={{background:"#0c0c1a",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"9px 12px",color:"#b0b8e0",fontFamily:"'Share Tech Mono',monospace",fontSize:10,cursor:"pointer",outline:"none",letterSpacing:1}}>
            <option value="pixels">SORT: MOST PIXELS</option>
            <option value="name">SORT: NAME A-Z</option>
            <option value="cat">SORT: CATEGORY</option>
          </select>
        </div>

        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.2)",letterSpacing:2,marginBottom:14}}>{fandoms.length} FANDOMS SHOWN</div>

        {/* FANDOM GRID */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
          {fandoms.map((t,i)=>{
            const rank=getRank(t.pixels);
            const catAccent=CAT_ACCENT[t.cat]||"#00F5FF";
            const hasPixels=t.pixels>0;
            return(
              <div key={t.id} className="fc"
                onClick={()=>navigate(`/fandom/${t.slug}`)}
                style={{background:"#0c0c1a",border:`1px solid ${hasPixels?rgba(t.color,.3):"rgba(255,255,255,.06)"}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",position:"relative",overflow:"hidden"}}>

                {/* Rank badge top-right */}
                {hasPixels&&<div style={{position:"absolute",top:8,right:8,fontSize:14}}>{rank.icon}</div>}

                {/* Color bar top */}
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:hasPixels?t.color:"rgba(255,255,255,.05)",boxShadow:hasPixels?`0 0 8px ${t.color}`:undefined}}/>

                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <div style={{width:10,height:10,borderRadius:2,background:t.color,flexShrink:0,boxShadow:hasPixels?`0 0 6px ${t.color}`:undefined}}/>
                  <span style={{fontWeight:700,fontSize:13,color:hasPixels?t.color:"#c0c8e8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</span>
                </div>

                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:rgba(catAccent,.6),marginBottom:10,letterSpacing:.5}}>{t.cat.split(" ")[0]} · {t.sub}</div>

                {hasPixels?(
                  <>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:900,color:t.color}}>{t.pixels.toLocaleString()}px</span>
                      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#C8FF00",alignSelf:"center"}}>€{t.pixels}</span>
                    </div>
                    <div style={{height:3,background:"rgba(255,255,255,.06)",borderRadius:2,overflow:"hidden",marginBottom:8}}>
                      <div style={{height:"100%",width:`${Math.min(100,(t.pixels/Math.max(...fandoms.map(f=>f.pixels),1))*100)}%`,background:`linear-gradient(90deg,${t.color},${catAccent})`,borderRadius:2}}/>
                    </div>
                    <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:rank.color}}>{rank.name} · #{i+1} IN DIR</div>
                  </>
                ):(
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.2)",letterSpacing:.5}}>No territory yet — be first!</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
