// src/AdminPage.jsx
// Access at: /admin
// PIN protected — change ADMIN_PIN below before going live

import { useState, useEffect } from "react";
import { supabase, isOnline } from "./supabase";

const ADMIN_PIN = "POW2024"; // ← CHANGE THIS before going live

const rgba=(hex,a)=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};

export default function AdminPage(){
  const [pin,setPin]=useState("");
  const [auth,setAuth]=useState(false);
  const [stats,setStats]=useState(null);
  const [loading,setLoading]=useState(false);
  const [log,setLog]=useState([]);
  const [seasons,setSeasons]=useState([]);
  const [fandoms,setFandoms]=useState([]);
  const [selectedFandom,setSelectedFandom]=useState("");

  const addLog=(msg,color="#00F5FF")=>setLog(l=>[{id:Date.now(),msg,color,ts:new Date().toLocaleTimeString()},...l].slice(0,50));

  useEffect(()=>{if(auth)loadStats();},[auth]);

  const loadStats=async()=>{
    setLoading(true);
    try{
      if(isOnline){
        // Total pixels
        const{count:pixelCount}=await supabase.from("pixels").select("*",{count:"exact",head:true});
        // Seasons
        const{data:seasonData}=await supabase.from("seasons").select("*").order("num");
        setSeasons(seasonData||[]);
        // Sectors
        const{count:sectorCount}=await supabase.from("sectors").select("*",{count:"exact",head:true});
        // Pixels by fandom
        const{data:pixelData}=await supabase.from("pixels").select("team_id");
        const cnt={};
        (pixelData||[]).forEach(p=>{cnt[p.team_id]=(cnt[p.team_id]||0)+1;});
        const sorted=Object.entries(cnt).sort((a,b)=>b[1]-a[1]);
        setFandoms(sorted);
        setStats({pixelCount:pixelCount||0,sectorCount:sectorCount||0,seasonCount:seasonData?.length||0,topFandom:sorted[0]||null});
      }else{
        setStats({pixelCount:0,sectorCount:0,seasonCount:0,topFandom:null});
        addLog("⚠️ Supabase not connected — offline mode","#FF4400");
      }
    }catch(e){addLog("Error loading stats: "+e.message,"#FF4400");}
    setLoading(false);
  };

  const resetAllPixels=async()=>{
    if(!confirm("DELETE ALL PIXELS from current season? This cannot be undone."))return;
    setLoading(true);
    try{
      if(isOnline){
        const{data:season}=await supabase.from("seasons").select("num").order("num",{ascending:false}).limit(1);
        const sNum=season?.[0]?.num||1;
        await supabase.from("pixels").delete().eq("season_num",sNum);
        addLog(`✅ All pixels deleted for Season ${sNum}`,"#00FF88");
      }else{
        localStorage.removeItem("pw2k_v2");
        addLog("✅ localStorage pixels cleared (offline mode)","#00FF88");
      }
      await loadStats();
    }catch(e){addLog("Error: "+e.message,"#FF4400");}
    setLoading(false);
  };

  const resetFandomPixels=async()=>{
    if(!selectedFandom){addLog("Select a fandom first","#FF4400");return;}
    if(!confirm(`DELETE all pixels for "${selectedFandom}"?`))return;
    setLoading(true);
    try{
      if(isOnline){
        const{data:season}=await supabase.from("seasons").select("num").order("num",{ascending:false}).limit(1);
        const sNum=season?.[0]?.num||1;
        const{count}=await supabase.from("pixels").delete().eq("team_id",selectedFandom).eq("season_num",sNum).select("*",{count:"exact",head:true});
        addLog(`✅ Deleted pixels for ${selectedFandom.split("|")[2]||selectedFandom}`,"#00FF88");
      }
      await loadStats();
    }catch(e){addLog("Error: "+e.message,"#FF4400");}
    setLoading(false);
  };

  const unlockAllSectors=async()=>{
    if(!confirm("Unlock ALL 400 sectors?"))return;
    setLoading(true);
    try{
      if(isOnline){
        const{data:season}=await supabase.from("seasons").select("num").order("num",{ascending:false}).limit(1);
        const sNum=season?.[0]?.num||1;
        const rows=[];
        for(let sx=0;sx<20;sx++)for(let sy=0;sy<20;sy++)rows.push({season_num:sNum,sx,sy});
        for(let i=0;i<rows.length;i+=200){
          await supabase.from("sectors").upsert(rows.slice(i,i+200),{onConflict:"season_num,sx,sy"});
        }
        addLog(`✅ All 400 sectors unlocked for Season ${sNum}`,"#00FF88");
      }
    }catch(e){addLog("Error: "+e.message,"#FF4400");}
    setLoading(false);
  };

  const resetSectors=async()=>{
    if(!confirm("Reset sectors to center 4 only?"))return;
    setLoading(true);
    try{
      if(isOnline){
        const{data:season}=await supabase.from("seasons").select("num").order("num",{ascending:false}).limit(1);
        const sNum=season?.[0]?.num||1;
        await supabase.from("sectors").delete().eq("season_num",sNum);
        await supabase.from("sectors").insert([{season_num:sNum,sx:9,sy:9},{season_num:sNum,sx:9,sy:10},{season_num:sNum,sx:10,sy:9},{season_num:sNum,sx:10,sy:10}]);
        addLog(`✅ Sectors reset to center 4`,"#00FF88");
      }
    }catch(e){addLog("Error: "+e.message,"#FF4400");}
    setLoading(false);
  };

  const forceNewSeason=async()=>{
    if(!confirm("Force start a new season? This wipes all pixels."))return;
    setLoading(true);
    try{
      if(isOnline){
        const{data:season}=await supabase.from("seasons").select("*").order("num",{ascending:false}).limit(1);
        const current=season?.[0];
        if(current){
          const nextNum=current.num+1;
          const nextTheme=(current.theme_index+1)%4;
          await supabase.from("pixels").delete().eq("season_num",current.num);
          await supabase.from("sectors").delete().eq("season_num",current.num);
          await supabase.from("seasons").insert({num:nextNum,start_date:new Date().toISOString(),theme_index:nextTheme,winners:[]});
          await supabase.from("sectors").insert([{season_num:nextNum,sx:9,sy:9},{season_num:nextNum,sx:9,sy:10},{season_num:nextNum,sx:10,sy:9},{season_num:nextNum,sx:10,sy:10}]);
          addLog(`✅ Season ${nextNum} started! Theme ${nextTheme}`,"#FFD700");
        }
      }
      await loadStats();
    }catch(e){addLog("Error: "+e.message,"#FF4400");}
    setLoading(false);
  };

  const fullReset=async()=>{
    if(!confirm("FULL RESET — delete everything and start fresh? This cannot be undone."))return;
    if(!confirm("Are you ABSOLUTELY sure? All data will be lost."))return;
    setLoading(true);
    try{
      if(isOnline){
        await supabase.from("pixels").delete().neq("idx",-1);
        await supabase.from("sectors").delete().neq("sx",-1);
        await supabase.from("seasons").delete().neq("num",-1);
        await supabase.from("seasons").insert({num:1,start_date:new Date().toISOString(),theme_index:0,winners:[]});
        await supabase.from("sectors").insert([{season_num:1,sx:9,sy:9},{season_num:1,sx:9,sy:10},{season_num:1,sx:10,sy:9},{season_num:1,sx:10,sy:10}]);
        addLog("✅ FULL RESET COMPLETE — Season 1 started fresh","#00FF88");
      }
      ["pw2k","pw2k_v2","pow_shields","pow_free","pow_streak","pow_sectors","pow_season"].forEach(k=>localStorage.removeItem(k));
      await loadStats();
    }catch(e){addLog("Error: "+e.message,"#FF4400");}
    setLoading(false);
  };

  // ── LOGIN SCREEN ───────────────────────────────────────────────────────────
  if(!auth){
    return(
      <div style={{background:"#040408",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Rajdhani',sans-serif"}}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@600;700&family=Share+Tech+Mono&display=swap');@keyframes pop{0%{transform:scale(.85);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}`}</style>
        <div style={{background:"#09091c",border:"1px solid rgba(255,68,0,.4)",borderRadius:16,padding:"36px 32px",width:360,textAlign:"center",animation:"pop .4s cubic-bezier(.34,1.56,.64,1)"}}>
          <div style={{fontSize:40,marginBottom:12}}>🔐</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:900,color:"#FF4400",letterSpacing:3,marginBottom:6}}>ADMIN ACCESS</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a3a5a",marginBottom:20,letterSpacing:1}}>PIXELS OF WAR · CONTROL PANEL</div>
          <input
            type="password"
            value={pin}
            onChange={e=>setPin(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&(pin===ADMIN_PIN?setAuth(true):alert("Wrong PIN"))}
            placeholder="Enter admin PIN"
            style={{width:"100%",background:"#0c0c1c",border:"1px solid rgba(255,68,0,.3)",borderRadius:6,padding:"10px 14px",color:"#e0e8ff",fontSize:13,fontFamily:"'Share Tech Mono',monospace",outline:"none",marginBottom:12,letterSpacing:2,textAlign:"center"}}
          />
          <button onClick={()=>pin===ADMIN_PIN?setAuth(true):alert("Wrong PIN")} style={{width:"100%",padding:"12px",background:"linear-gradient(90deg,#FF4400,#FF2D78)",border:"none",color:"#fff",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:11,letterSpacing:2}}>ENTER →</button>
          <div style={{marginTop:16}}><a href="/" style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a3a5a",textDecoration:"none"}}>← back to game</a></div>
        </div>
      </div>
    );
  }

  // ── ADMIN PANEL ────────────────────────────────────────────────────────────
  return(
    <div style={{background:"#040408",minHeight:"100vh",fontFamily:"'Rajdhani',sans-serif",color:"#e0e8ff"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@600;700&family=Share+Tech+Mono&display=swap');@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}*{box-sizing:border-box}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#222240}`}</style>

      {/* HEADER */}
      <div style={{background:"#06060e",borderBottom:"1px solid #1a1a30",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,letterSpacing:3,background:"linear-gradient(90deg,#FF4400,#FF2D78)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>⚙ ADMIN PANEL</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",letterSpacing:2,marginTop:2}}>PIXELS OF WAR · TESTING MODE · {isOnline?"🟢 SUPABASE CONNECTED":"🔴 OFFLINE"}</div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={loadStats} style={{padding:"7px 14px",background:"rgba(0,245,255,.08)",border:"1px solid rgba(0,245,255,.3)",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#00F5FF",letterSpacing:1}}>↻ REFRESH</button>
          <a href="/" style={{padding:"7px 14px",background:"rgba(200,255,0,.08)",border:"1px solid rgba(200,255,0,.3)",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#C8FF00",letterSpacing:1,textDecoration:"none",display:"inline-flex",alignItems:"center"}}>← GAME</a>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:16,padding:16,maxWidth:1200,margin:"0 auto"}}>

        {/* LEFT COLUMN */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>

          {/* STATS */}
          {stats&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
            {[["TOTAL PIXELS",stats.pixelCount.toLocaleString(),"#00F5FF"],["SECTORS OPEN",stats.sectorCount,"#C8FF00"],["SEASONS",stats.seasonCount,"#FFD700"],["TOP FANDOM",stats.topFandom?stats.topFandom[0].split("|")[2]||"None":"None","#FF2D78"]].map(([l,v,c])=>(
              <div key={l} style={{background:"#09091a",border:`1px solid ${rgba(c,.2)}`,borderRadius:10,padding:"14px 16px"}}>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:20,fontWeight:900,color:c}}>{v}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",letterSpacing:1,marginTop:3}}>{l}</div>
              </div>
            ))}
          </div>}

          {/* DANGER ZONE */}
          <div style={{background:"#09091a",border:"1px solid rgba(255,68,0,.3)",borderRadius:12,padding:"18px"}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:"#FF4400",letterSpacing:3,marginBottom:14}}>⚠️ DANGER ZONE</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <button onClick={resetAllPixels} disabled={loading} style={{padding:"12px",background:"rgba(255,68,0,.1)",border:"1px solid rgba(255,68,0,.4)",borderRadius:7,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#FF4400",letterSpacing:1,fontWeight:900}}>
                🗑️ RESET ALL PIXELS<br/><span style={{fontSize:7,color:"rgba(255,255,255,.3)",fontFamily:"'Share Tech Mono',monospace"}}>current season only</span>
              </button>
              <button onClick={resetSectors} disabled={loading} style={{padding:"12px",background:"rgba(255,68,0,.1)",border:"1px solid rgba(255,68,0,.4)",borderRadius:7,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#FF4400",letterSpacing:1,fontWeight:900}}>
                🔒 RESET SECTORS<br/><span style={{fontSize:7,color:"rgba(255,255,255,.3)",fontFamily:"'Share Tech Mono',monospace"}}>back to center 4</span>
              </button>
              <button onClick={unlockAllSectors} disabled={loading} style={{padding:"12px",background:"rgba(200,255,0,.08)",border:"1px solid rgba(200,255,0,.3)",borderRadius:7,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#C8FF00",letterSpacing:1,fontWeight:900}}>
                🔓 UNLOCK ALL 400<br/><span style={{fontSize:7,color:"rgba(255,255,255,.3)",fontFamily:"'Share Tech Mono',monospace"}}>sectors for testing</span>
              </button>
              <button onClick={forceNewSeason} disabled={loading} style={{padding:"12px",background:"rgba(255,215,0,.08)",border:"1px solid rgba(255,215,0,.3)",borderRadius:7,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#FFD700",letterSpacing:1,fontWeight:900}}>
                ⏭️ FORCE NEW SEASON<br/><span style={{fontSize:7,color:"rgba(255,255,255,.3)",fontFamily:"'Share Tech Mono',monospace"}}>wipes pixels + advances</span>
              </button>
            </div>
            <button onClick={fullReset} disabled={loading} style={{marginTop:8,width:"100%",padding:"13px",background:"linear-gradient(90deg,#FF0000,#FF4400)",border:"none",color:"#fff",borderRadius:7,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:10,letterSpacing:2}}>
              ☢️ FULL RESET — DELETE EVERYTHING
            </button>
          </div>

          {/* RESET BY FANDOM */}
          <div style={{background:"#09091a",border:"1px solid rgba(255,45,120,.3)",borderRadius:12,padding:"18px"}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:"#FF2D78",letterSpacing:3,marginBottom:12}}>🎯 RESET BY FANDOM</div>
            <select value={selectedFandom} onChange={e=>setSelectedFandom(e.target.value)}
              style={{width:"100%",background:"#0c0c1c",border:"1px solid rgba(255,45,120,.3)",borderRadius:6,padding:"8px 12px",color:"#e0e8ff",fontSize:12,fontFamily:"'Rajdhani',sans-serif",outline:"none",marginBottom:10}}>
              <option value="">— Select a fandom —</option>
              {fandoms.map(([id,count])=>(
                <option key={id} value={id}>{id.split("|")[2]||id} ({count}px)</option>
              ))}
            </select>
            <button onClick={resetFandomPixels} disabled={loading||!selectedFandom} style={{width:"100%",padding:"10px",background:"rgba(255,45,120,.1)",border:"1px solid rgba(255,45,120,.4)",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#FF2D78",letterSpacing:1,fontWeight:900}}>
              🗑️ DELETE PIXELS FOR SELECTED FANDOM
            </button>
          </div>

          {/* SEASONS TABLE */}
          {seasons.length>0&&<div style={{background:"#09091a",border:"1px solid #1a1a30",borderRadius:12,padding:"18px"}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:"#FFD700",letterSpacing:3,marginBottom:12}}>🏆 SEASONS</div>
            {seasons.map(s=>(
              <div key={s.num} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.05)",fontSize:12}}>
                <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:"#FFD700"}}>Season {s.num}</span>
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.4)"}}>Theme {s.theme_index} · {new Date(s.start_date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>}

          {/* TOP FANDOMS */}
          {fandoms.length>0&&<div style={{background:"#09091a",border:"1px solid #1a1a30",borderRadius:12,padding:"18px"}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:"#00F5FF",letterSpacing:3,marginBottom:12}}>📊 TOP FANDOMS</div>
            {fandoms.slice(0,15).map(([id,count],i)=>(
              <div key={id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"rgba(255,255,255,.2)",width:20}}>{i+1}</span>
                  <span style={{fontSize:12,fontWeight:700}}>{id.split("|")[2]||id}</span>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.3)"}}>{id.split("|")[0]}</span>
                </div>
                <span style={{fontFamily:"'Orbitron',monospace",fontSize:11,color:"#C8FF00"}}>{count}px</span>
              </div>
            ))}
          </div>}
        </div>

        {/* RIGHT COLUMN — LOG */}
        <div style={{background:"#09091a",border:"1px solid #1a1a30",borderRadius:12,padding:"16px",height:"fit-content",position:"sticky",top:16}}>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:"#00F5FF",letterSpacing:3,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#00FF88"}}/>
            ACTIVITY LOG
          </div>
          {loading&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#00F5FF",marginBottom:8,animation:"pulse 1s infinite"}}>⏳ Processing...</div>}
          {log.length===0&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a3a5a"}}>No actions yet</div>}
          {log.map(l=>(
            <div key={l.id} style={{marginBottom:6,padding:"6px 8px",background:rgba(l.color,.06),borderLeft:`2px solid ${l.color}`,borderRadius:4,animation:"slideDown .2s ease"}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:l.color}}>{l.msg}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,255,255,.2)",marginTop:2}}>{l.ts}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
