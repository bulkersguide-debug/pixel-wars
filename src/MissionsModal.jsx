// src/MissionsModal.jsx
import { useMemo } from "react";

const rgba = (hex,a) => { const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); return `rgba(${r},${g},${b},${a})`; };

export const MISSIONS = [
  { id:"claim50",   icon:"🏴", label:"Claim 50 pixels",          goal:50,  reward:10,  color:"#00F5FF", type:"claim"   },
  { id:"claim200",  icon:"🏆", label:"Claim 200 pixels",         goal:200, reward:30,  color:"#FFD700", type:"claim"   },
  { id:"raid10",    icon:"⚔️", label:"Raid 10 enemy pixels",     goal:10,  reward:15,  color:"#FF4400", type:"raid"    },
  { id:"raid50",    icon:"💀", label:"Raid 50 enemy pixels",     goal:50,  reward:40,  color:"#FF0000", type:"raid"    },
  { id:"alliance1", icon:"🤝", label:"Form 1 alliance",          goal:1,   reward:20,  color:"#00FFAA", type:"alliance"},
  { id:"powerup3",  icon:"💥", label:"Use 3 power-ups",          goal:3,   reward:15,  color:"#C8FF00", type:"powerup" },
  { id:"share1",    icon:"📢", label:"Share your territory once", goal:1,   reward:25,  color:"#FF2D78", type:"share"   },
  { id:"login7",    icon:"🔥", label:"7-day login streak",        goal:7,   reward:50,  color:"#FFD700", type:"streak"  },
];

export default function MissionsModal({ progress, onClaim, streakDays, onClose, accentColor="#00F5FF" }) {
  const weekNum = useMemo(() => {
    const d = new Date();
    const start = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
  }, []);

  const totalReward = MISSIONS.filter(m => (progress[m.id]?.claimed)).reduce((s,m)=>s+m.reward,0);
  const maxReward = MISSIONS.reduce((s,m)=>s+m.reward,0);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(16px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"rgba(7,7,22,.96)",border:`1px solid ${rgba(accentColor,.4)}`,borderRadius:18,padding:"22px 20px",width:420,maxWidth:"94vw",maxHeight:"88vh",overflowY:"auto",backdropFilter:"blur(24px)",boxShadow:`0 0 60px ${rgba(accentColor,.12)}`}}>

        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:28,marginBottom:5}}>🎯</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:900,color:accentColor,letterSpacing:2}}>WEEKLY MISSIONS</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.3)",marginTop:3}}>Week {weekNum} · Resets Monday</div>
        </div>

        {/* Progress bar */}
        <div style={{marginBottom:14,padding:"10px 12px",background:"rgba(255,255,255,.04)",borderRadius:9,border:"1px solid rgba(255,255,255,.07)"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.4)"}}>Weekly progress</span>
            <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:"#FFD700"}}>{totalReward}/{maxReward} px</span>
          </div>
          <div style={{height:5,background:"#1a1a2e",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(totalReward/maxReward)*100}%`,background:"linear-gradient(90deg,#FFD700,#FF9900)",borderRadius:3,transition:"width .5s"}}/>
          </div>
        </div>

        {/* Mission list */}
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {MISSIONS.map(m => {
            const p = progress[m.id] || { count: 0, claimed: false };
            const special = m.id === "login7" ? streakDays : p.count;
            const current = Math.min(special, m.goal);
            const pct = (current / m.goal) * 100;
            const done = current >= m.goal;
            const claimed = p.claimed;

            return (
              <div key={m.id} style={{padding:"11px 13px",background:claimed?"rgba(255,255,255,.03)":done?rgba(m.color,.08):"rgba(255,255,255,.03)",border:`1px solid ${claimed?"rgba(255,255,255,.06)":done?rgba(m.color,.45):"rgba(255,255,255,.07)"}`,borderRadius:10,opacity:claimed?.65:1,transition:"all .2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:16}}>{m.icon}</span>
                    <div>
                      <div style={{fontWeight:700,fontSize:11,color:claimed?"rgba(255,255,255,.35)":done?m.color:"#c0c8e8"}}>{m.label}</div>
                      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.25)",marginTop:1}}>{current}/{m.goal}</div>
                    </div>
                  </div>
                  {claimed
                    ? <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"rgba(255,255,255,.3)"}}>✓ CLAIMED</span>
                    : done
                    ? <button onClick={()=>onClaim(m)} style={{padding:"5px 12px",background:`linear-gradient(90deg,${m.color},${rgba(m.color,.7)})`,border:"none",color:"#040408",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:9,letterSpacing:.5}}>+{m.reward}px</button>
                    : <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:rgba(m.color,.5)}}>+{m.reward}px</span>
                  }
                </div>
                <div style={{height:3,background:"rgba(255,255,255,.07)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:claimed?"rgba(255,255,255,.2)":`linear-gradient(90deg,${m.color},${rgba(m.color,.6)})`,borderRadius:2,transition:"width .5s"}}/>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={onClose} style={{marginTop:14,width:"100%",padding:"9px",background:"transparent",border:"1px solid rgba(255,255,255,.08)",color:"rgba(255,255,255,.3)",borderRadius:7,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9}}>CLOSE</button>
      </div>
    </div>
  );
}
