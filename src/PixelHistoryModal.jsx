// src/PixelHistoryModal.jsx
const rgba=(hex,a)=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};

export default function PixelHistoryModal({pixel,history,TM,onClose,onJumpTo}){
  if(!pixel)return null;
  const owner=TM[pixel.t];
  const age=Math.floor((Date.now()-pixel.at)/3600000);
  const ageStr=age<1?"< 1h ago":age<24?`${age}h ago`:age<168?`${Math.floor(age/24)}d ago`:`${Math.floor(age/168)}w ago`;

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:900,backdropFilter:"blur(12px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"rgba(7,7,22,.97)",border:`1px solid ${rgba(owner?.color||"#00F5FF",.5)}`,borderRadius:14,padding:"20px",width:320,maxWidth:"92vw",boxShadow:`0 0 50px ${rgba(owner?.color||"#00F5FF",.15)}`}}>

        {/* Current owner */}
        <div style={{marginBottom:14,paddingBottom:12,borderBottom:"1px solid rgba(255,255,255,.07)"}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.3)",letterSpacing:2,marginBottom:6}}>CURRENT OWNER</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:14,height:14,borderRadius:2,background:owner?.color||"#888",boxShadow:`0 0 10px ${owner?.color||"#888"}`}}/>
            <div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:900,color:owner?.color||"#888"}}>{owner?.name||"Unknown"}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.3)",marginTop:2}}>Claimed {ageStr}</div>
            </div>
          </div>
        </div>

        {/* History */}
        <div style={{marginBottom:14}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.3)",letterSpacing:2,marginBottom:8}}>OWNERSHIP HISTORY</div>
          {history.length===0?(
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#2a2a4a",textAlign:"center",padding:"12px 0"}}>No history recorded yet</div>
          ):history.map((h,i)=>{
            const t=TM[h.team_id];
            const hAge=Math.floor((Date.now()-new Date(h.created_at).getTime())/3600000);
            const hAgeStr=hAge<1?"< 1h ago":hAge<24?`${hAge}h ago`:hAge<168?`${Math.floor(hAge/24)}d ago`:`${Math.floor(hAge/168)}w ago`;
            return(
              <div key={h.id||i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <div style={{width:8,height:8,borderRadius:1,background:t?.color||"#555",flexShrink:0}}/>
                <div style={{flex:1}}>
                  <span style={{fontWeight:700,fontSize:11,color:t?.color||"#888"}}>{t?.name||"Unknown"}</span>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:h.action==="raid"?"#FF4400":"#3a3a5a",marginLeft:6}}>{h.action==="raid"?"⚔️ raided":"🏴 claimed"}</span>
                </div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,255,255,.2)"}}>{hAgeStr}</div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:6}}>
          <button onClick={onClose} style={{flex:1,padding:"8px",background:"transparent",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.3)",borderRadius:6,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9}}>CLOSE</button>
          {onJumpTo&&<button onClick={onJumpTo} style={{flex:1,padding:"8px",background:rgba(owner?.color||"#00F5FF",.1),border:`1px solid ${rgba(owner?.color||"#00F5FF",.3)}`,color:owner?.color||"#00F5FF",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:900}}>JUMP HERE</button>}
        </div>
      </div>
    </div>
  );
}
