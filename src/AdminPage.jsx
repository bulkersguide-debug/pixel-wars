// src/AdminPage.jsx
// Access at: /admin?s=YOUR_VITE_ADMIN_SECRET
// Set VITE_ADMIN_SECRET in Vercel environment variables

import { useState, useEffect } from "react";
import { supabase, isOnline } from "./supabase";

const ADMIN_PIN = "StamMike2009@@1"; // ← change this
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || "";

const rgba=(hex,a)=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};

function BannerCountdown({endAt}){
  const [left,setLeft]=useState("");
  useEffect(()=>{
    const calc=()=>{
      const diff=new Date(endAt)-new Date();
      if(diff<=0){setLeft("EXPIRED");return;}
      const h=Math.floor(diff/3600000);
      const m=Math.floor((diff%3600000)/60000);
      const s=Math.floor((diff%60000)/1000);
      setLeft(h>0?`${h}h ${m}m ${s}s`:`${m}m ${s}s`);
    };
    calc();
    const t=setInterval(calc,1000);
    return()=>clearInterval(t);
  },[endAt]);
  return<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#00FF88"}}>⏱ {left}</span>;
}

function CreateBannerForm({addLog,onCreated}){
  const [msg,setMsg]=useState("");
  const [hours,setHours]=useState("24");
  const [loading,setLoading]=useState(false);

  const create=async()=>{
    if(!msg.trim()||msg.trim().length<5){addLog("Message too short","#FF4400");return;}
    setLoading(true);
    try{
      const now=new Date();
      const end=new Date(now.getTime()+parseInt(hours)*3600000);
      const{data,error}=await supabase.from("sponsored_banners").insert({
        message:msg.trim(),contact_email:"admin@pixelsofwar.com",
        duration_type:"hours",duration_amount:parseInt(hours),
        price_eur:0,status:"active",
        start_at:now.toISOString(),end_at:end.toISOString()
      }).select().single();
      if(error)throw error;
      setMsg("");onCreated(data);
    }catch(e){addLog("Error: "+e.message,"#FF4400");}
    setLoading(false);
  };

  return(
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Your banner message..." maxLength={500}
        style={{flex:2,minWidth:160,background:"#0c0c1c",border:"1px solid rgba(255,215,0,.3)",borderRadius:5,padding:"7px 10px",color:"#e0e8ff",fontSize:11,fontFamily:"'Rajdhani',sans-serif",outline:"none"}}/>
      <select value={hours} onChange={e=>setHours(e.target.value)} style={{background:"#0c0c1c",border:"1px solid rgba(255,215,0,.3)",borderRadius:5,padding:"7px 8px",color:"#FFD700",fontSize:10,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}>
        <option value="1">1 hour</option>
        <option value="6">6 hours</option>
        <option value="12">12 hours</option>
        <option value="24">24 hours</option>
        <option value="48">2 days</option>
        <option value="168">7 days</option>
      </select>
      <button onClick={create} disabled={loading||msg.trim().length<5} style={{padding:"7px 14px",background:"linear-gradient(90deg,#FFD700,#FF9900)",border:"none",borderRadius:5,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:900,color:"#040408"}}>
        {loading?"...":"▶ GO LIVE"}
      </button>
    </div>
  );
}

export default function AdminPage(){
  // URL secret check
  const urlSecret = new URLSearchParams(window.location.search).get("s")||"";
  const secretOk = !ADMIN_SECRET || urlSecret === ADMIN_SECRET;

  const [pin,setPin]=useState("");
  const [auth,setAuth]=useState(false);
  const [stats,setStats]=useState(null);
  const [loading,setLoading]=useState(false);
  const [log,setLog]=useState([]);
  const [seasons,setSeasons]=useState([]);
  const [fandoms,setFandoms]=useState([]);
  const [selectedFandom,setSelectedFandom]=useState("");
  // Mini-season form
  const [msLabel,setMsLabel]=useState("");
  const [roleSearch,setRoleSearch]=useState("");
  const [roleUser,setRoleUser]=useState(null);
  const [roleLoading,setRoleLoading]=useState(false);
  const [msSectorX,setMsSectorX]=useState("9");
  const [msSectorY,setMsSectorY]=useState("9");
  const [msDays,setMsDays]=useState("7");
  const [msPrize,setMsPrize]=useState("🏅 Mini Champion");
  // Fandom requests
  const [fandomRequests,setFandomRequests]=useState([]);
  const [loadingRequests,setLoadingRequests]=useState(false);
  // Sponsored banners
  const [banners,setBanners]=useState([]);
  const [loadingBanners,setLoadingBanners]=useState(false);

  const addLog=(msg,color="#00F5FF")=>setLog(l=>[{id:Date.now(),msg,color,ts:new Date().toLocaleTimeString()},...l].slice(0,50));

  const searchRoleUser=async()=>{
    if(!roleSearch.trim())return;
    setRoleLoading(true);setRoleUser(null);
    const q=roleSearch.trim().toLowerCase();
    const{data,error}=await supabase.from("profiles").select("id,username,email,role,avatar_url,total_claimed")
      .or(`username.ilike.%${q}%,email.ilike.%${q}%`).limit(1).single();
    if(error||!data){addLog(`❌ No user found: ${q}`,"#FF4400");}
    else{setRoleUser(data);addLog(`✅ Found: ${data.username} (${data.role||"player"})`,"#00FF88");}
    setRoleLoading(false);
  };

  const assignRole=async(userId,role)=>{
    setRoleLoading(true);
    const{error}=await supabase.from("profiles").update({role}).eq("id",userId);
    if(error){addLog("❌ Error: "+error.message,"#FF4400");}
    else{setRoleUser(u=>({...u,role}));addLog(`✅ Role set to ${role} for ${roleUser?.username}`,"#FFD700");}
    setRoleLoading(false);
  };

  const approveBanner=async(b)=>{
    const now=new Date();
    const end=new Date(now.getTime()+(b.duration_type==="hours"?b.duration_amount*3600000:b.duration_amount*86400000));
    const{error}=await supabase.from("sponsored_banners").update({status:"active",start_at:now.toISOString(),end_at:end.toISOString()}).eq("id",b.id);
    if(!error){setBanners(r=>r.map(x=>x.id===b.id?{...x,status:"active"}:x));addLog(`✅ Banner activated: "${b.message.slice(0,30)}..."`,  "#00FF88");}
    else addLog("Error: "+error.message,"#FF4400");
  };
  const rejectBanner=async(b)=>{
    const{error}=await supabase.from("sponsored_banners").update({status:"rejected"}).eq("id",b.id);
    if(!error){setBanners(r=>r.map(x=>x.id===b.id?{...x,status:"rejected"}:x));addLog(`❌ Banner rejected`,"#FF4400");}
  };

  const terminateBanner=async(b)=>{
    if(!window.confirm(`Stop banner "${b.message.slice(0,40)}..."?`))return;
    const{error}=await supabase.from("sponsored_banners").update({status:"expired",end_at:new Date().toISOString()}).eq("id",b.id);
    if(!error){setBanners(r=>r.map(x=>x.id===b.id?{...x,status:"expired"}:x));addLog(`🛑 Banner terminated`,"#FF4400");}
  };

  const editBanner=async(b)=>{
    const newMsg=window.prompt("Edit banner message:",b.message);
    if(!newMsg||newMsg.trim().length<5){addLog("Message too short","#FF4400");return;}
    const{error}=await supabase.from("sponsored_banners").update({message:newMsg.trim()}).eq("id",b.id);
    if(!error){setBanners(r=>r.map(x=>x.id===b.id?{...x,message:newMsg.trim()}:x));addLog(`✏️ Banner updated`,"#FFD700");}
  };

  const approveFandom=async(req)=>{
    const{error}=await supabase.from("fandom_requests").update({status:"approved",reviewed_at:new Date().toISOString()}).eq("id",req.id);
    if(!error){setFandomRequests(r=>r.map(x=>x.id===req.id?{...x,status:"approved"}:x));addLog(`✅ Approved: ${req.name}`,"#00FF88");}
    else addLog("Error approving: "+error.message,"#FF4400");
  };

  const rejectFandom=async(req)=>{
    const reason=prompt(`Reason for rejecting "${req.name}"? (optional)`)||"";
    const{error}=await supabase.from("fandom_requests").update({status:"rejected",reviewed_at:new Date().toISOString(),reject_reason:reason}).eq("id",req.id);
    if(!error){setFandomRequests(r=>r.map(x=>x.id===req.id?{...x,status:"rejected"}:x));addLog(`❌ Rejected: ${req.name}`,"#FF4400");}
    else addLog("Error rejecting: "+error.message,"#FF4400");
  };

  useEffect(()=>{if(auth)loadStats();},[auth]);
  useEffect(()=>{
    if(!auth)return;
    setLoadingRequests(true);
    supabase.from("fandom_requests").select("*").order("created_at",{ascending:false})
      .then(({data})=>{setFandomRequests(data||[]);setLoadingRequests(false);});
    setLoadingBanners(true);
    supabase.from("sponsored_banners").select("*").order("created_at",{ascending:false})
      .then(({data})=>{setBanners(data||[]);setLoadingBanners(false);});
  },[auth]);

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
    // Block access if secret is wrong
    if(!secretOk){
      return(
        <div style={{background:"#040408",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Rajdhani',sans-serif"}}>
          <div style={{textAlign:"center",color:"#1a1a2a"}}>
            <div style={{fontSize:48,marginBottom:16}}>404</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:12,letterSpacing:2}}>PAGE NOT FOUND</div>
          </div>
        </div>
      );
    }
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

          {/* SPONSORED BANNERS */}
          <div style={{background:"#09091a",border:"2px solid rgba(255,215,0,.3)",borderRadius:12,padding:"18px"}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:"#FFD700",letterSpacing:3,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span>📣 SPONSORED BANNERS v2</span>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#FF4400",background:"rgba(255,68,0,.1)",border:"1px solid rgba(255,68,0,.3)",borderRadius:4,padding:"2px 7px"}}>
                {banners.filter(b=>b.status==="pending").length} pending
              </span>
            </div>

            {/* Admin create banner */}
            <div style={{marginBottom:14,padding:"12px",background:"rgba(255,215,0,.04)",border:"1px solid rgba(255,215,0,.15)",borderRadius:8}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#FFD700",letterSpacing:1,marginBottom:8}}>CREATE YOUR OWN BANNER</div>
              <CreateBannerForm onCreated={(b)=>{setBanners(r=>[b,...r]);addLog(`✅ Banner created: "${b.message.slice(0,30)}"`, "#FFD700");}} addLog={addLog}/>
            </div>

            {loadingBanners&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a3a5a"}}>Loading...</div>}
            {!loadingBanners&&banners.length===0&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a3a5a"}}>No banner requests yet</div>}
            {banners.map(b=>(
              <div key={b.id} style={{marginBottom:8,padding:"10px 12px",background:b.status==="active"?"rgba(0,255,136,.04)":b.status==="pending"?"rgba(255,215,0,.04)":"rgba(255,68,0,.04)",border:`1px solid ${b.status==="active"?"rgba(0,255,136,.2)":b.status==="pending"?"rgba(255,215,0,.15)":"rgba(255,68,0,.15)"}`,borderRadius:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                  <div style={{fontWeight:700,fontSize:12,color:"#e0e8ff",flex:1,marginRight:8}}>"{b.message}"</div>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:b.status==="active"?"#00FF88":b.status==="pending"?"#FFD700":"#FF4400",padding:"2px 6px",border:"1px solid currentColor",borderRadius:3,flexShrink:0}}>{b.status.toUpperCase()}</span>
                </div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",marginBottom:6}}>
                  {b.contact_email} · {b.duration_amount} {b.duration_type} · €{b.price_eur}
                  {b.end_at&&` · ends ${new Date(b.end_at).toLocaleDateString()}`}
                </div>
                {b.status==="pending"&&<div style={{display:"flex",gap:6}}>
                  <button onClick={()=>approveBanner(b)} style={{flex:1,padding:"6px",background:"rgba(0,255,136,.1)",border:"1px solid rgba(0,255,136,.3)",borderRadius:5,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#00FF88",fontWeight:900}}>✅ APPROVE & ACTIVATE</button>
                  <button onClick={()=>rejectBanner(b)} style={{flex:1,padding:"6px",background:"rgba(255,68,0,.08)",border:"1px solid rgba(255,68,0,.25)",borderRadius:5,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#FF4400",fontWeight:900}}>❌ REJECT</button>
                </div>}
                {b.status==="active"&&<div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:"#00FF88",animation:"pulse .8s infinite"}}/>
                      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#00FF88"}}>LIVE</span>
                      {b.end_at&&<BannerCountdown endAt={b.end_at}/>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>editBanner(b)} style={{flex:1,padding:"6px",background:"rgba(255,215,0,.08)",border:"1px solid rgba(255,215,0,.25)",borderRadius:5,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#FFD700",fontWeight:900}}>✏️ EDIT</button>
                    <button onClick={()=>terminateBanner(b)} style={{flex:1,padding:"6px",background:"rgba(255,68,0,.08)",border:"1px solid rgba(255,68,0,.25)",borderRadius:5,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#FF4400",fontWeight:900}}>🛑 TERMINATE</button>
                  </div>
                </div>}
              </div>
            ))}
          </div>

          {/* FANDOM REQUESTS */}
          <div style={{background:"#09091a",border:"2px solid rgba(200,255,0,.4)",borderRadius:12,padding:"18px"}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:"#C8FF00",letterSpacing:3,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span>📨 FANDOM REQUESTS</span>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#FF4400",background:"rgba(255,68,0,.1)",border:"1px solid rgba(255,68,0,.3)",borderRadius:4,padding:"2px 7px"}}>
                {fandomRequests.filter(r=>r.status==="pending").length} pending
              </span>
            </div>
            {loadingRequests&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a3a5a"}}>Loading...</div>}
            {!loadingRequests&&fandomRequests.length===0&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a3a5a"}}>No requests yet</div>}
            {fandomRequests.map(req=>(
              <div key={req.id} style={{marginBottom:8,padding:"10px 12px",background:req.status==="pending"?"rgba(200,255,0,.04)":req.status==="approved"?"rgba(0,255,136,.04)":"rgba(255,68,0,.04)",border:`1px solid ${req.status==="pending"?"rgba(200,255,0,.15)":req.status==="approved"?"rgba(0,255,136,.2)":"rgba(255,68,0,.15)"}`,borderRadius:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <div style={{width:10,height:10,borderRadius:2,background:req.color,flexShrink:0}}/>
                  <span style={{fontWeight:700,fontSize:12,color:"#e0e8ff",flex:1}}>{req.name}</span>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.3)"}}>{req.category.split(" ")[0]}</span>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:req.status==="pending"?"#FFD700":req.status==="approved"?"#00FF88":"#FF4400",padding:"2px 6px",border:`1px solid currentColor`,borderRadius:3}}>{req.status.toUpperCase()}</span>
                </div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#2a2a4a",marginBottom:req.status==="pending"?8:0}}>{new Date(req.created_at).toLocaleDateString()}</div>
                {req.status==="pending"&&<div style={{display:"flex",gap:6}}>
                  <button onClick={()=>approveFandom(req)} style={{flex:1,padding:"6px",background:"rgba(0,255,136,.1)",border:"1px solid rgba(0,255,136,.3)",borderRadius:5,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#00FF88",fontWeight:900}}>✅ APPROVE</button>
                  <button onClick={()=>rejectFandom(req)} style={{flex:1,padding:"6px",background:"rgba(255,68,0,.08)",border:"1px solid rgba(255,68,0,.25)",borderRadius:5,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#FF4400",fontWeight:900}}>❌ REJECT</button>
                </div>}
              </div>
            ))}
          </div>

          {/* ROLE MANAGEMENT */}
          <div style={{background:"#09091a",border:"1px solid rgba(255,215,0,.2)",borderRadius:12,padding:"18px"}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:"#FFD700",letterSpacing:3,marginBottom:14}}>⚡ ROLE MANAGEMENT</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",marginBottom:10,letterSpacing:1}}>SEARCH BY USERNAME OR EMAIL</div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input
                value={roleSearch}
                onChange={e=>setRoleSearch(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")searchRoleUser();}}
                placeholder="username or email..."
                style={{flex:1,background:"#0c0c1c",border:"1px solid rgba(255,215,0,.2)",borderRadius:6,padding:"8px 12px",color:"#e0e8ff",fontSize:12,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}
              />
              <button onClick={searchRoleUser} disabled={roleLoading||!roleSearch.trim()} style={{padding:"8px 14px",background:"rgba(255,215,0,.1)",border:"1px solid rgba(255,215,0,.3)",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#FFD700",fontWeight:900,opacity:roleLoading||!roleSearch.trim()?0.4:1}}>
                {roleLoading?"...":"FIND"}
              </button>
            </div>

            {roleUser&&(
              <div style={{background:"rgba(255,215,0,.05)",border:"1px solid rgba(255,215,0,.15)",borderRadius:8,padding:"12px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  {roleUser.avatar_url&&<img src={roleUser.avatar_url} style={{width:32,height:32,borderRadius:"50%"}} alt="avatar"/>}
                  <div>
                    <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,color:"#e0e8ff",fontWeight:900}}>{roleUser.username}</div>
                    <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a"}}>{roleUser.email||"no email"} · {roleUser.total_claimed||0}px claimed</div>
                  </div>
                  <div style={{marginLeft:"auto",fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:{admin:"#FFD700",moderator:"#00AAFF",vip:"#FF2D78",player:"#3a3a5a"}[roleUser.role]||"#3a3a5a"}}>
                    CURRENT: {roleUser.role?.toUpperCase()||"PLAYER"}
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {[["admin","⚡ ADMIN","#FFD700"],["moderator","🛡️ MOD","#00AAFF"],["vip","⭐ VIP","#FF2D78"],["player","👤 PLAYER","#555577"]].map(([r,label,color])=>(
                    <button key={r} onClick={()=>assignRole(roleUser.id,r)} disabled={roleUser.role===r||roleLoading} style={{padding:"9px",background:roleUser.role===r?`rgba(${color==="#FFD700"?"255,215,0":color==="#00AAFF"?"0,170,255":color==="#FF2D78"?"255,45,120":"85,85,119"},.2)`:"rgba(255,255,255,.03)",border:`1px solid ${roleUser.role===r?color+"66":"rgba(255,255,255,.08)"}`,borderRadius:6,cursor:roleUser.role===r?"default":"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:roleUser.role===r?color:"rgba(255,255,255,.3)",fontWeight:900,opacity:roleLoading?.5:1}}>
                      {label} {roleUser.role===r?"✓":""}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MINI-SEASON CREATOR */}
          <div style={{background:"#09091a",border:"1px solid rgba(255,215,0,.3)",borderRadius:12,padding:"18px"}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:"#FFD700",letterSpacing:3,marginBottom:14}}>⚡ CREATE MINI SEASON</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",marginBottom:4,letterSpacing:1}}>LABEL</div>
                <input value={msLabel} onChange={e=>setMsLabel(e.target.value)} placeholder="Battle for Sector 5" style={{width:"100%",background:"#0c0c1c",border:"1px solid #1a1a2e",borderRadius:5,padding:"7px 10px",color:"#e0e8ff",fontSize:11,fontFamily:"'Rajdhani',sans-serif",outline:"none"}}/>
              </div>
              <div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",marginBottom:4,letterSpacing:1}}>PRIZE TEXT</div>
                <input value={msPrize} onChange={e=>setMsPrize(e.target.value)} placeholder="🏅 Mini Champion" style={{width:"100%",background:"#0c0c1c",border:"1px solid #1a1a2e",borderRadius:5,padding:"7px 10px",color:"#e0e8ff",fontSize:11,fontFamily:"'Rajdhani',sans-serif",outline:"none"}}/>
              </div>
              <div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",marginBottom:4,letterSpacing:1}}>SECTOR X (0-19)</div>
                <input type="number" min="0" max="19" value={msSectorX} onChange={e=>setMsSectorX(e.target.value)} style={{width:"100%",background:"#0c0c1c",border:"1px solid #1a1a2e",borderRadius:5,padding:"7px 10px",color:"#e0e8ff",fontSize:11,fontFamily:"'Rajdhani',sans-serif",outline:"none"}}/>
              </div>
              <div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",marginBottom:4,letterSpacing:1}}>SECTOR Y (0-19)</div>
                <input type="number" min="0" max="19" value={msSectorY} onChange={e=>setMsSectorY(e.target.value)} style={{width:"100%",background:"#0c0c1c",border:"1px solid #1a1a2e",borderRadius:5,padding:"7px 10px",color:"#e0e8ff",fontSize:11,fontFamily:"'Rajdhani',sans-serif",outline:"none"}}/>
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",marginBottom:4,letterSpacing:1}}>DURATION (DAYS)</div>
                <input type="number" min="1" max="30" value={msDays} onChange={e=>setMsDays(e.target.value)} style={{width:"100%",background:"#0c0c1c",border:"1px solid #1a1a2e",borderRadius:5,padding:"7px 10px",color:"#e0e8ff",fontSize:11,fontFamily:"'Rajdhani',sans-serif",outline:"none"}}/>
              </div>
            </div>
            <button onClick={async()=>{
              if(!msLabel.trim()){addLog("Enter a label","#FF4400");return;}
              setLoading(true);
              try{
                const{data:season}=await supabase.from("seasons").select("num").order("num",{ascending:false}).limit(1);
                const sNum=season?.[0]?.num||1;
                const endDate=new Date(Date.now()+parseInt(msDays)*86400000).toISOString();
                await supabase.from("mini_seasons").insert({label:msLabel.trim(),sector_x:parseInt(msSectorX),sector_y:parseInt(msSectorY),end_date:endDate,season_num:sNum,prize:msPrize.trim()||"🏅 Mini Champion"});
                addLog(`✅ Mini Season "${msLabel}" started! Ends in ${msDays} days`,"#FFD700");
                setMsLabel("");
              }catch(e){addLog("Error: "+e.message,"#FF4400");}
              setLoading(false);
            }} disabled={loading||!msLabel.trim()} style={{width:"100%",padding:"11px",background:"linear-gradient(90deg,#FFD700,#FF9900)",border:"none",color:"#040408",borderRadius:7,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:10,letterSpacing:1}}>
              ⚡ LAUNCH MINI SEASON
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN — LOG + ANALYTICS */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Umami Analytics */}
          <div style={{background:"#09091a",border:"1px solid rgba(0,245,255,.2)",borderRadius:12,overflow:"hidden"}}>
            <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #1a1a30"}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:"#00F5FF",letterSpacing:3,display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:"#00FF88",animation:"pulse 2s infinite"}}/>
                LIVE ANALYTICS
              </div>
              <a href="https://cloud.umami.is/share/6RlcXYmu6QT5hn2x" target="_blank" rel="noopener noreferrer" style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",textDecoration:"none",letterSpacing:1}}>OPEN FULL ↗</a>
            </div>
            <iframe
              src="https://cloud.umami.is/share/6RlcXYmu6QT5hn2x"
              style={{width:"100%",height:480,border:"none",background:"#09091a"}}
              title="Umami Analytics"
            />
          </div>

          {/* Activity Log */}
          <div style={{background:"#09091a",border:"1px solid #1a1a30",borderRadius:12,padding:"16px"}}>
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
    </div>
  );
}
