// src/SponsorModal.jsx
import { useState } from "react";
import { supabase } from "./supabase";

const rgba=(hex,a)=>{try{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;}catch{return`rgba(0,0,0,${a})`;}};

const PRICES={hours:{"1":2,"6":8,"12":14,"24":20},days:{"1":20,"3":50,"7":100,"30":350}};

export default function SponsorModal({onClose, userEmail}){
  const [msg,setMsg]=useState("");
  const [email,setEmail]=useState(userEmail||"");
  const [durType,setDurType]=useState("hours");
  const [durAmt,setDurAmt]=useState("1");
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);
  const [error,setError]=useState("");

  const price=PRICES[durType]?.[durAmt]||2;
  const emailLocked=!!userEmail;

  const validEmail=e=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

  const send=async()=>{
    if(msg.trim().length<5){setError("Message too short (min 5 chars)");return;}
    if(!validEmail(email)){setError("Enter a valid email address (e.g. you@example.com)");return;}
    setLoading(true);setError("");
    try{
      const{error:err}=await supabase.from("sponsored_banners").insert({
        message:msg.trim(),contact_email:email.trim(),
        duration_type:durType,duration_amount:parseInt(durAmt),
        price_eur:price,status:"pending"
      });
      if(err)throw err;
      setDone(true);
    }catch(e){setError(e?.message||"Failed. Try again.");}
    setLoading(false);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,backdropFilter:"blur(16px)",padding:16}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"rgba(6,6,20,.98)",border:"1px solid rgba(255,215,0,.4)",borderRadius:16,padding:"24px",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 0 60px rgba(255,215,0,.15)"}}>

        {done?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:48,marginBottom:12}}>✅</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:900,color:"#FFD700",marginBottom:8}}>REQUEST SUBMITTED!</div>
            <p style={{fontSize:13,color:"rgba(192,200,232,.6)",marginBottom:20}}>We'll contact <strong style={{color:"#e0e8ff"}}>{email}</strong> with payment details. Banner goes live within 2h of payment.</p>
            <button onClick={onClose} style={{padding:"10px 24px",background:"linear-gradient(90deg,#FFD700,#FF9900)",border:"none",color:"#040408",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:11}}>CLOSE</button>
          </div>
        ):(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:"#FFD700",letterSpacing:2}}>📣 ADVERTISE HERE</div>
              <button onClick={onClose} style={{background:"none",border:"none",color:"#3a3a5a",cursor:"pointer",fontSize:20}}>✕</button>
            </div>

            <p style={{fontSize:12,color:"rgba(192,200,232,.45)",marginBottom:16,lineHeight:1.6}}>Your message scrolls across the top of the game — seen by every player in real time.</p>

            {/* Preview */}
            <div style={{marginBottom:16,padding:"10px 14px",background:"rgba(255,215,0,.06)",border:"1px solid rgba(255,215,0,.2)",borderRadius:8}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#FFD700",marginBottom:4}}>PREVIEW</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#FFD700"}}>★ {msg.trim()||"Your message here..."} ★</div>
            </div>

            <div style={{marginBottom:14}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",letterSpacing:2,marginBottom:6}}>MESSAGE (max 120 chars)</div>
              <input value={msg} onChange={e=>setMsg(e.target.value)} maxLength={120} placeholder="Join our Discord! discord.gg/example"
                style={{width:"100%",background:"#0c0c1c",border:"1px solid rgba(255,215,0,.25)",borderRadius:7,padding:"10px 14px",color:"#e0e8ff",fontSize:13,fontFamily:"'Rajdhani',sans-serif",outline:"none"}}/>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#2a2a4a",textAlign:"right",marginTop:3}}>{msg.length}/120</div>
            </div>

            <div style={{marginBottom:14}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",letterSpacing:2,marginBottom:6}}>CONTACT EMAIL {emailLocked&&"(from your Discord)"}</div>
              <input type="email" value={email} onChange={e=>!emailLocked&&setEmail(e.target.value)}
                readOnly={emailLocked}
                placeholder="you@example.com"
                style={{width:"100%",background:emailLocked?"#08081a":"#0c0c1c",border:`1px solid ${emailLocked?"rgba(88,101,242,.4)":"rgba(255,215,0,.25)"}`,borderRadius:7,padding:"10px 14px",color:emailLocked?"#7289DA":"#e0e8ff",fontSize:13,fontFamily:"'Rajdhani',sans-serif",outline:"none",cursor:emailLocked?"not-allowed":"text"}}/>
              {emailLocked&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#3a3a5a",marginTop:3}}>🔒 Locked to your Discord email for security</div>}
            </div>

            <div style={{marginBottom:14}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",letterSpacing:2,marginBottom:6}}>DURATION TYPE</div>
              <div style={{display:"flex",gap:6}}>
                {["hours","days"].map(t=>(
                  <button key={t} onClick={()=>{setDurType(t);setDurAmt("1");}} style={{flex:1,padding:"8px",borderRadius:7,border:`1px solid ${durType===t?"#FFD700":"rgba(255,255,255,.1)"}`,background:durType===t?"rgba(255,215,0,.1)":"transparent",color:durType===t?"#FFD700":"rgba(255,255,255,.35)",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:900}}>
                    {t==="hours"?"⏰ HOURS":"📅 DAYS"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",letterSpacing:2,marginBottom:6}}>SELECT DURATION</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                {Object.entries(PRICES[durType]).map(([amt,p])=>{const on=durAmt===amt;return(
                  <div key={amt} onClick={()=>setDurAmt(amt)} style={{padding:"10px 6px",borderRadius:8,border:`2px solid ${on?"#FFD700":"rgba(255,255,255,.08)"}`,background:on?"rgba(255,215,0,.1)":"rgba(255,255,255,.02)",cursor:"pointer",textAlign:"center"}}>
                    <div style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:900,color:on?"#FFD700":"#c0c8e8"}}>{amt}</div>
                    <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.3)"}}>{durType==="hours"?"hr":"day"}{parseInt(amt)>1?"s":""}</div>
                    <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:on?"#C8FF00":"rgba(255,255,255,.3)",marginTop:3}}>€{p}</div>
                  </div>
                );})}
              </div>
            </div>

            <div style={{marginBottom:16,padding:"12px 16px",background:"rgba(200,255,0,.05)",border:"1px solid rgba(200,255,0,.15)",borderRadius:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",marginBottom:3}}>TOTAL</div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:900,color:"#C8FF00"}}>€{price}</div>
              </div>
              <div style={{textAlign:"right",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a",lineHeight:1.8}}>
                We'll email payment options<br/>Bank · PayPal · Crypto
              </div>
            </div>

            {error&&<div style={{marginBottom:12,padding:"8px 12px",background:"rgba(255,68,0,.1)",border:"1px solid rgba(255,68,0,.3)",borderRadius:6,fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#FF4400"}}>{error}</div>}

            <button onClick={send} disabled={loading||msg.trim().length<5||!validEmail(email)} style={{width:"100%",padding:"13px",background:(msg.trim().length>=5&&validEmail(email))?"linear-gradient(90deg,#FFD700,#FF9900)":"rgba(255,255,255,.05)",border:"none",color:(msg.trim().length>=5&&validEmail(email))?"#040408":"rgba(255,255,255,.15)",borderRadius:9,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:11,letterSpacing:1}}>
              {loading?"⏳ SUBMITTING...":msg.trim().length>=5&&validEmail(email)?`📣 REQUEST BANNER — €${price}`:"📣 REQUEST BANNER SLOT"}
            </button>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#2a2a4a",textAlign:"center",marginTop:8}}>Reviewed before going live · Goes live within 2h of payment</div>
          </>
        )}
      </div>
    </div>
  );
}
