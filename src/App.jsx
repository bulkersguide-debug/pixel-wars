import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isOnline } from "./supabase";
import ShareModal from "./ShareModal";
import MissionsModal, { MISSIONS } from "./MissionsModal";
import OnboardingModal from "./OnboardingModal";
import PixelHistoryModal from "./PixelHistoryModal";
import CookieBanner from "./CookieBanner";

import AuthModal from "./AuthModal";
import SponsorModal from "./SponsorModal";


// ── SOUND SYSTEM ──────────────────────────────────────────────────────────────

// ── GRID ──────────────────────────────────────────────────────────────────────
const GW=2000,GH=2000,CELL=5,VW=180,VH=117,CW=VW*CELL,CH=VH*CELL,MM=200,MMS=GW/MM;
const SECTOR=100,NS=GW/SECTOR,SEASON_DAYS=90,DECAY_WARN=30,DECAY_EXPIRE=60;
const THEMES=[
  {num:1,name:"GAMING vs ANIME vs MUSIC",icon:"⚔️",desc:"The original culture war"},
  {num:2,name:"WORLD CUP",icon:"🌍",desc:"Nation vs nation"},
  {num:3,name:"POP CULTURE",icon:"🎬",desc:"Movies, TV and streaming"},
  {num:4,name:"SPORTS EMPIRES",icon:"🏆",desc:"Clubs, teams and esports"},
];
const hashColor=(n)=>{let h=0;for(let i=0;i<n.length;i++)h=(Math.imul(31,h)+n.charCodeAt(i))|0;const hue=Math.abs(h)%360,sat=65+(Math.abs(h>>8)%25),lit=50+(Math.abs(h>>16)%15),s=sat/100,l=lit/100,a=s*Math.min(l,1-l),f=x=>{const k=(x+hue/30)%12,c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,"0")};return`#${f(0)}${f(8)}${f(4)}`;};
const KC={"Fortnite":"#00B4F0","Minecraft":"#62B32F","Valorant":"#FF4655","Apex Legends":"#DA292A","League of Legends":"#0BC4E3","GTA V":"#00853E","Among Us":"#C51111","Rocket League":"#0092CF","Overwatch 2":"#F99E1A","Elden Ring":"#B0884A","Cyberpunk 2077":"#FCEE09","God of War":"#AA0000","Genshin Impact":"#0095FF","Pokémon":"#FFCB05","FIFA / EA FC 24":"#2980B9","Naruto":"#FF6B35","One Piece":"#E31E24","Dragon Ball Z":"#FF8C00","Bleach":"#3355BB","My Hero Academia":"#2E86C1","Demon Slayer":"#CC3355","Jujutsu Kaisen":"#6B21A8","Chainsaw Man":"#CC1122","Attack on Titan":"#7A6640","Death Note":"#CC0000","One Punch Man":"#FFD700","Haikyuu!!":"#FF6600","Blue Lock":"#1B3FA0","Spirited Away":"#CC6699","BTS":"#9747FF","BLACKPINK":"#FF1493","Stray Kids":"#CC0033","Aespa":"#00AAFF","NewJeans":"#FF6699","IVE":"#3355AA","TWICE":"#FF9EC4","NCT 127":"#00AACC","ENHYPEN":"#222255","TXT":"#5599FF","ATEEZ":"#CC4400","(G)I-DLE":"#CC0055","Drake":"#BF8E3B","Travis Scott":"#C7A444","Kendrick Lamar":"#CC0000","Eminem":"#5C8AFF","Tyler, the Creator":"#AACC00","Post Malone":"#CC8866","Taylor Swift":"#A855F7","Billie Eilish":"#00DD88","Ariana Grande":"#CC88BB","Dua Lipa":"#9900FF","Olivia Rodrigo":"#6622BB","The Weeknd":"#CC0000","Bruno Mars":"#CC8800","Bad Bunny":"#00CC44","Daft Punk":"#FFD700","Skrillex":"#00FF88","Martin Garrix":"#0066FF","Linkin Park":"#8C1C1C","My Chemical Romance":"#CC0000","Arctic Monkeys":"#885522","Twenty One Pilots":"#FFCC00","Tame Impala":"#FF9900","Metallica":"#777777"};
const tc=(n)=>KC[n]||hashColor(n);
const cv=(hex)=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);if(0.299*r+0.587*g+0.114*b<65){const f=0.48;return[r,g,b].map(v=>Math.round(v+(255-v)*f).toString(16).padStart(2,"0")).join("");}return hex.slice(1);};
const rgba=(hex,a)=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};
const todayStr=()=>new Date().toISOString().split("T")[0];
const yesterdayStr=()=>new Date(Date.now()-86400000).toISOString().split("T")[0];
const getWeekNum=()=>{const d=new Date(),s=new Date(d.getFullYear(),0,1);return Math.ceil(((d-s)/86400000+s.getDay()+1)/7);};
const sectorOf=(idx)=>[Math.floor((idx%GW)/SECTOR),Math.floor(Math.floor(idx/GW)/SECTOR)];
const sectorKey=(sx,sy)=>`${sx},${sy}`;
const centerDist=(sx,sy)=>Math.max(Math.abs(sx-9.5),Math.abs(sy-9.5));
const sectorBasePrice=(sx,sy)=>{const d=centerDist(sx,sy);if(d<2)return 3;if(d<4)return 2;if(d<7)return 1.5;return 1;};
const fillMultiplier=(pct)=>{if(pct<0.25)return 1;if(pct<0.5)return 1.3;if(pct<0.75)return 1.7;if(pct<0.9)return 2.5;return 4;};
const INIT_SECTORS=[[9,9],[9,10],[10,9],[10,10]];
const adjacentSectors=(unlocked)=>{const set=new Set(unlocked.map(([x,y])=>sectorKey(x,y)));const adj=new Set();unlocked.forEach(([x,y])=>{[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dx,dy])=>{const nx=x+dx,ny=y+dy;if(nx>=0&&nx<NS&&ny>=0&&ny<NS&&!set.has(sectorKey(nx,ny)))adj.add(sectorKey(nx,ny));});});return[...adj].map(k=>k.split(",").map(Number));};
const CAT_ACCENT={"🎮 Gaming":"#00F5FF","🎌 Anime":"#FF2D78","🎵 Music":"#C8FF00"};
const CAT=[
  {cat:"🎮 Gaming",sub:"Battle Royale",t:["Fortnite","Apex Legends","PUBG","Warzone","Fall Guys"]},
  {cat:"🎮 Gaming",sub:"Shooter",t:["Valorant","Overwatch 2","Call of Duty","Halo Infinite","Destiny 2"]},
  {cat:"🎮 Gaming",sub:"RPG",t:["Elden Ring","Cyberpunk 2077","God of War","Genshin Impact","Pokémon","Hades"]},
  {cat:"🎮 Gaming",sub:"Open World",t:["Minecraft","GTA V","Roblox","Among Us","Rocket League","League of Legends"]},
  {cat:"🎮 Gaming",sub:"Sports",t:["FIFA / EA FC 24","NBA 2K24"]},
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
const ALL=[];CAT.forEach(e=>e.t.forEach(n=>ALL.push({id:`${e.cat}|${e.sub}|${n}`,name:n,color:tc(n),cat:e.cat,sub:e.sub})));
const TM=Object.fromEntries(ALL.map(t=>[t.id,t]));
const slugify=(n)=>n.toLowerCase().replace(/[^a-z0-9\s]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim();
const streakReward=(d)=>{if(d===1)return{px:1,bonus:null};if(d===2)return{px:1,bonus:null};if(d===3)return{px:2,bonus:null};if(d===4)return{px:3,bonus:null};if(d===5)return{px:5,bonus:"🔥 5-Day Warrior!"};if(d===6)return{px:5,bonus:null};if(d===7)return{px:10,bonus:"🏆 Week Legend!"};if(d%30===0)return{px:30,bonus:"👑 Month Champion!"};if(d%14===0)return{px:15,bonus:"💎 Fortnight Fighter!"};if(d%7===0)return{px:10,bonus:"⚡ Weekly Veteran!"};return{px:5,bonus:null};};
const POWERUPS=[
  {id:"bomb",icon:"💣",name:"CLUSTER BOMB",desc:"Destroy 8×8 unshielded enemy zone",price:10,color:"#FF4400",rarity:"RARE"},
  {id:"storm",icon:"⚡",name:"PIXEL STORM",desc:"Claim 50 random empty pixels",price:15,color:"#FFCC00",rarity:"EPIC"},
  {id:"fortress",icon:"🛡️",name:"FORTRESS",desc:"Shield last 30 pixels for 1 hour",price:8,color:"#00AAFF",rarity:"UNCOMMON"},
  {id:"snipe",icon:"🎯",name:"SNIPER",desc:"Steal 1 unshielded enemy pixel",price:3,color:"#FF2D78",rarity:"COMMON"},
  {id:"airdrop",icon:"🪂",name:"AIRDROP",desc:"Claim 15×15 zone in viewport",price:25,color:"#C8FF00",rarity:"LEGENDARY"},
  {id:"nuke",icon:"☢️",name:"NUKE",desc:"Wipe 20×20 unshielded zone",price:50,color:"#FF0000",rarity:"LEGENDARY"},
  {id:"renew",icon:"♻️",name:"RENEWAL SHIELD",desc:"Renew 50 decaying pixels",price:5,color:"#00FFAA",rarity:"UNCOMMON"},
  {id:"double",icon:"✨",name:"DOUBLE OR NOTHING",desc:"Gamble — 2× or 0×",price:5,color:"#BB88FF",rarity:"UNCOMMON"},
  {id:"surge",icon:"⚡",name:"SURGE",desc:"Drag connected pixels — lose them if disconnected!",price:6,color:"#FF2D78",rarity:"RARE"},
];
const RARITY_COLOR={COMMON:"#aaa",UNCOMMON:"#00CC44",RARE:"#0088FF",EPIC:"#AA00FF",LEGENDARY:"#FFD700"};
const DISCORD_ID="1504550947295072328";
const DISCORD_CHANNEL="1504550948541042819";
const DISCORD_WIDGET=`https://discord.com/widget?id=${DISCORD_ID}&theme=dark`;
const DISCORD_INVITE="https://discord.gg/4Da2avYyPF";
const DISCORD_WEBHOOK="https://discord.com/api/webhooks/1505216663786623178/zgC0xopUlfOex7rIIcRos4SxMQrTvtj8-Gjl4cvoqyEukuOP3a-xl9ekt7iIPIj_dBAb";

// Browser fingerprint for guest abuse prevention
const getFingerprint=()=>{
  const s=[navigator.language,screen.width,screen.height,screen.colorDepth,new Date().getTimezoneOffset(),navigator.hardwareConcurrency||0,navigator.platform||""].join("|");
  let h=0;for(let i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;}
  return Math.abs(h).toString(36);
};
const _webhookLastSent={};
const postToDiscord=async(embed)=>{
  const key=embed.title||"default";
  const now=Date.now();
  if(_webhookLastSent[key]&&now-_webhookLastSent[key]<30000)return; // 30s debounce per event type
  _webhookLastSent[key]=now;
  try{
    await fetch(DISCORD_WEBHOOK,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({embeds:[embed]})
    });
  }catch(e){console.warn("Discord webhook failed:",e);}
};
const EVENTS=[
  {icon:"⚡",label:"CHAOS HOUR",desc:"RAIDS 50% OFF!",duration:600,color:"#FF4400"},
  {icon:"💎",label:"MEGA BONUS",desc:"Buy 10px → get 5 FREE!",duration:300,color:"#FFD700"},
  {icon:"🔥",label:"FRENZY",desc:"Double territory 3 min!",duration:180,color:"#FF6B35"},
  {icon:"👑",label:"CROWN BATTLE",desc:"Top fandom wins 50px!",duration:900,color:"#FFD700"},
  {icon:"🔓",label:"SECTOR SALE",desc:"ALL sector prices halved!",duration:600,color:"#00AAFF"},
];

// Weekly themed events — rotate by week number
const WEEKLY_THEMES=[
  {cat:"🎮 Gaming",label:"GAMING WEEK",desc:"Gaming fandoms: -15% raid cost + +10% claim speed",icon:"🎮",color:"#00F5FF",raidDiscount:0.85,claimBonus:0.9},
  {cat:"🎌 Anime",label:"ANIME INVASION",desc:"Anime fandoms: -20% build cost + border glow boost",icon:"🎌",color:"#FF2D78",raidDiscount:1,claimBonus:0.8},
  {cat:"🎵 Music",label:"MUSIC TAKEOVER",desc:"Music fandoms: -15% build + double War Chest income",icon:"🎵",color:"#FFD700",raidDiscount:1,claimBonus:0.85},
  {cat:"🎬 TV & Film",label:"SCREEN WARS",desc:"TV & Film fandoms: +25% attack power this week",icon:"🎬",color:"#9747FF",raidDiscount:0.75,claimBonus:1},
  {cat:"⚽ Sports",label:"SPORTS BLITZ",desc:"Sports fandoms: free pixels doubled this week",icon:"⚽",color:"#00FF88",raidDiscount:1,claimBonus:0.85},
  {cat:"ALL",label:"FREE FOR ALL",desc:"All fandoms: -10% on everything. Let chaos reign!",icon:"💥",color:"#FF4400",raidDiscount:0.9,claimBonus:0.9},
];

const CANVAS_CHALLENGES=[
  {prompt:"🌅 Draw a SUNRISE — warm gradient from dark to bright",theme:"sunrise"},
  {prompt:"⚔️ Draw your FANDOM'S SYMBOL or logo",theme:"symbol"},
  {prompt:"🌊 Create an OCEAN WAVE — blues and whites",theme:"ocean"},
  {prompt:"🔥 Make a FLAME — reds, oranges, yellows from bottom up",theme:"flame"},
  {prompt:"🌙 Draw a NIGHT SKY — dark blues, stars, a moon",theme:"night"},
  {prompt:"💎 Create a GEMSTONE — geometric, shiny, vivid",theme:"gem"},
  {prompt:"🏰 Draw a CASTLE or FORTRESS",theme:"castle"},
  {prompt:"🌺 Make a FLOWER — any style, any color",theme:"flower"},
  {prompt:"🌈 Create a RAINBOW gradient across your sector",theme:"rainbow"},
  {prompt:"🐉 Draw a DRAGON — your fandom's spirit animal",theme:"dragon"},
  {prompt:"⚡ Make a LIGHTNING BOLT — electric, sharp, bright",theme:"lightning"},
  {prompt:"🗺️ Draw a MAP of your fandom's territory",theme:"map"},
];
const SIM_TEAMS=["BTS","Naruto","Fortnite","BLACKPINK","Taylor Swift","Valorant","Attack on Titan","Drake","Minecraft","One Piece"];

// ── WORLD WAR FACTIONS ────────────────────────────────────────────────────────
const FACTIONS={
  GAMING:{id:"GAMING",name:"GAMING EMPIRE",icon:"⚔️",color:"#00F5FF",cats:["🎮 Gaming"],desc:"All gaming fandoms united"},
  ANIME: {id:"ANIME", name:"ANIME ALLIANCE",icon:"🎌",color:"#FF2D78",cats:["🎌 Anime"],desc:"All anime fandoms united"},
  CULTURE:{id:"CULTURE",name:"CULTURE WAVE",icon:"🌟",color:"#FFD700",cats:["🎵 Music","🎬 TV & Film","⚽ Sports"],desc:"Music, TV & Sports united"},
};
const getFaction=(teamId)=>{
  if(!teamId)return null;
  const cat=teamId.split("|")[0];
  return Object.values(FACTIONS).find(f=>f.cats.includes(cat))||FACTIONS.CULTURE;
};
const randInt=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const RANKS=[{name:"BRONZE",min:0,max:49,icon:"🥉",color:"#CD7F32"},{name:"SILVER",min:50,max:199,icon:"🥈",color:"#C0C0C0"},{name:"GOLD",min:200,max:499,icon:"🥇",color:"#FFD700"},{name:"PLATINUM",min:500,max:999,icon:"💎",color:"#00EAFF"},{name:"DIAMOND",min:1000,max:2499,icon:"💠",color:"#BB88FF"},{name:"LEGEND",min:2500,max:Infinity,icon:"👑",color:"#FF2D78"}];
const getRank=(px)=>RANKS.find(r=>px>=r.min&&px<=r.max)||RANKS[0];
// XP Level system — level = floor(sqrt(xp/50)) + 1, capped at 50
const getLevel=(xp)=>Math.min(50,Math.floor(Math.sqrt(xp/50))+1);
const xpForLevel=(lv)=>Math.pow(lv-1,2)*50;
const LEVEL_BADGES=["","🌱","🌿","🌳","⚔️","🛡️","💥","🔥","⚡","💎","👑","🌟","🌙","☀️","🏆","💫","🎯","🎮","🎌","🎵","🚀","🌊","🌈","🦁","🦊","🐉","🌺","🎭","🎪","🎨","🏰","⚜️","🔮","🌠","🎇","🎆","🏅","🎖️","🥇","💠","🔱","⚡","🌋","🌌","🎯","💎","👑","🌟","✨","🏆"];
const MAX_RECHARGE=10; // max stockpiled recharge pixels
const RECHARGE_MAX_LEVEL=20; // at level 20, recharge cap increases
const getMaxRecharge=(lv)=>Math.min(MAX_RECHARGE+Math.floor(lv/5),25);

// ── SUPABASE HELPERS ──────────────────────────────────────────────────────────
const dbRowToPixel=(row)=>({t:row.team_id,at:row.claimed_at});
async function dbLoadPixels(sn){if(!supabase)return null;const{data}=await supabase.from("pixels").select("idx,team_id,claimed_at").eq("season_num",sn);if(!data)return null;const m={};data.forEach(r=>{m[r.idx]=dbRowToPixel(r);});return m;}
async function dbUpsertPixels(pending,teamId,sn){if(!supabase)return;const now=Date.now();const rows=Array.from(pending).map(idx=>({idx,season_num:sn,team_id:teamId,claimed_at:now}));for(let i=0;i<rows.length;i+=500)await supabase.from("pixels").upsert(rows.slice(i,i+500),{onConflict:"idx,season_num"});}
async function dbDeletePixels(idxArr,sn){if(!supabase||!idxArr.length)return;for(let i=0;i<idxArr.length;i+=500)await supabase.from("pixels").delete().in("idx",idxArr.slice(i,i+500)).eq("season_num",sn);}
async function dbLoadSeason(){if(!supabase)return null;const{data}=await supabase.from("seasons").select("*").order("num",{ascending:false}).limit(1);return data?.[0]||null;}
async function dbSaveSeason(s){if(!supabase)return;await supabase.from("seasons").upsert({num:s.num,start_date:s.startDate,theme_index:s.theme,winners:s.winners});}
async function dbLoadSectors(sn){if(!supabase)return null;const{data}=await supabase.from("sectors").select("sx,sy").eq("season_num",sn);return data?data.map(r=>[r.sx,r.sy]):null;}
async function dbSaveSectors(sectors,sn){if(!supabase)return;const rows=sectors.map(([sx,sy])=>({season_num:sn,sx,sy}));await supabase.from("sectors").upsert(rows,{onConflict:"season_num,sx,sy"});}
async function dbClearSeason(sn){if(!supabase)return;await supabase.from("pixels").delete().eq("season_num",sn);await supabase.from("sectors").delete().eq("season_num",sn);}
async function dbLoadMessages(fandomId,sn){if(!supabase)return[];const{data}=await supabase.from("messages").select("*").eq("fandom_id",fandomId).eq("season_num",sn).order("created_at",{ascending:false}).limit(50);return(data||[]).reverse();}
async function dbSendMessage(fandomId,text,sn,username,role,rankIcon){if(!supabase)return;await supabase.from("messages").insert({fandom_id:fandomId,text,season_num:sn,username:username||"Warrior",role:role||"player",rank_icon:rankIcon||"🥉"});}
async function dbLoadAlliances(sn){if(!supabase)return[];const{data}=await supabase.from("alliances").select("*").eq("season_num",sn).neq("status","rejected");return data||[];}
async function dbProposeAlliance(proposer,target,sn){if(!supabase)return;await supabase.from("alliances").upsert({proposer,target,status:"pending",season_num:sn},{onConflict:"proposer,target,season_num"});}
async function dbUpdateAlliance(id,status){if(!supabase)return;await supabase.from("alliances").update({status}).eq("id",id);}
async function dbLoadWars(sn){if(!supabase)return[];const{data}=await supabase.from("wars").select("*").eq("season_num",sn).eq("status","active").order("declared_at",{ascending:false}).limit(20);return data||[];}
async function dbDeclareWar(attacker,defender,sn){if(!supabase)return;await supabase.from("wars").insert({attacker,defender,season_num:sn,status:"active"});}
async function dbLoadMiniSeason(sn){if(!supabase)return null;const now=new Date().toISOString();const{data}=await supabase.from("mini_seasons").select("*").eq("season_num",sn).gt("end_date",now).order("start_date",{ascending:false}).limit(1);return data?.[0]||null;}

export default function App(){
  const cvs=useRef(null),mmCvs=useRef(null);
  const remoteAnimRef=useRef([]); // [{idx, color, type, ts}]
  const mmFlashRef=useRef([]);    // [{mx, my, color, ts}]
  const navigate=useNavigate();
  const channelRef=useRef(null),presenceRef=useRef(null);
  const crateRef=useRef(null);
  const heatmapRef=useRef({});
  const prevPixelCounts=useRef({});
  const vxRef=useRef(900),vyRef=useRef(900);

  // Core state
  const [pixels,setPixels]=useState({});
  const [shields,setShields]=useState(()=>{try{const s=JSON.parse(localStorage.getItem("pow_shields")||"{}");const now=Date.now();return Object.fromEntries(Object.entries(s).filter(([,e])=>e>now));}catch{return{};}});
  const [freePixels,setFreePixels]=useState(()=>{try{return parseInt(localStorage.getItem("pow_free")||"0");}catch{return 0;}});
  const [streakData,setStreakData]=useState(()=>{try{return JSON.parse(localStorage.getItem("pow_streak")||'{"days":0,"last":"","total":0}');}catch{return{days:0,last:"",total:0};}});
  const [season,setSeason]=useState({num:1,startDate:new Date().toISOString(),theme:0,winners:[]});
  const [unlockedSectors,setUnlockedSectors]=useState(INIT_SECTORS);
  const [loading,setLoading]=useState(true);

  // New feature state
  const [onlineCount,setOnlineCount]=useState(1);
  const [showHeatmap,setShowHeatmap]=useState(false);
  const [heatmapTick,setHeatmapTick]=useState(0);
  const [animTick,setAnimTick]=useState(0);
  const [zoomLevel,setZoomLevel]=useState(1);
  const [gridFullscreen,setGridFullscreen]=useState(false);
  const zoomRef=useRef(1);
  useEffect(()=>{zoomRef.current=zoomLevel;},[zoomLevel]);
  // Derived viewport dimensions based on zoom
  const effCell=useMemo(()=>Math.max(2,Math.round(CELL*zoomLevel)),[zoomLevel]);
  const effVW=useMemo(()=>Math.floor(CW/effCell),[effCell]);
  const effVH=useMemo(()=>Math.floor(CH/effCell),[effCell]);
  const [chatMessages,setChatMessages]=useState([]);
  const [chatInput,setChatInput]=useState("");
  const [alliances,setAlliances]=useState([]);
  const [wars,setWars]=useState([]);
  const [surgeMode,setSurgeMode]=useState(false);
  const [surgePixels,setSurgePixels]=useState(new Set());
  const [peaceVote,setPeaceVote]=useState(null); // {proposer, endsAt, votes}
  const [showPeaceVote,setShowPeaceVote]=useState(false);
  const [raidAlert,setRaidAlert]=useState(null);
  const [miniSeason,setMiniSeason]=useState(null);
  const [showWarModal,setShowWarModal]=useState(false);
  const [showAllianceModal,setShowAllianceModal]=useState(false);
  const [territoryTrend,setTerritoryTrend]=useState({});

  // UI state
  const [vx,setVx]=useState(900);const [vy,setVy]=useState(900);
  const [active,setActive]=useState(null);
  const [pending,setPending]=useState(new Set());
  const [drag,setDrag]=useState(false);
  const [orig,setOrig]=useState(null);
  const [hov,setHov]=useState(null);
  const [hovSector,setHovSector]=useState(null);
  const [mode,setMode]=useState("BUILD");
  const [selCat,setSelCat]=useState("All");
  const [selSub,setSelSub]=useState("All");
  const [q,setQ]=useState("");
  const [tab,setTab]=useState("WAR");
  const [toasts,setToasts]=useState([]);
  const [feed,setFeed]=useState([]);
  const [event,setEvent]=useState(null);
  const [eventTimer,setEventTimer]=useState(0);
  const [warChest,setWarChest]=useState(()=>{try{return parseInt(localStorage.getItem("pow_war_chest")||"0");}catch{return 0;}});
  const [fortifiedSectors,setFortifiedSectors]=useState(()=>{try{return JSON.parse(localStorage.getItem("pow_fort_sectors")||"[]");}catch{return [];}});
  const [showWarChest,setShowWarChest]=useState(false);
  const weeklyTheme=useMemo(()=>WEEKLY_THEMES[getWeekNum()%WEEKLY_THEMES.length],[]);
  const [xp,setXp]=useState(()=>{try{return parseInt(localStorage.getItem("pow_xp")||"0");}catch{return 0;}});
  const [playerLevel,setPlayerLevel]=useState(()=>{try{return parseInt(localStorage.getItem("pow_level")||"1");}catch{return 1;}});
  const [rechargePixels,setRechargePixels]=useState(()=>{try{return parseInt(localStorage.getItem("pow_recharge")||"0");}catch{return 0;}});
  const [loyaltyDays,setLoyaltyDays]=useState(()=>{try{return JSON.parse(localStorage.getItem("pow_loyalty")||'{"fandom":"","days":0,"last":""}');}catch{return{fandom:"",days:0,last:""};}});
  const [showLevelUp,setShowLevelUp]=useState(null); // level number when leveled up
  // ── MONETIZATION STATE ───────────────────────────────────────────────────────
  const [hasSeasonPass,setHasSeasonPass]=useState(()=>{try{const d=JSON.parse(localStorage.getItem("pow_season_pass")||"null");return d&&d.season===1?d:null;}catch{return null;}});
  const [showPaywall,setShowPaywall]=useState(false);
  const [paywallTab,setPaywallTab]=useState("bundles");
  const [purchases,setPurchases]=useState([]);
  const [purchasesLoading,setPurchasesLoading]=useState(false);
  // ── NEW FEATURES ─────────────────────────────────────────────────────────────
  const [dailyChallenge,setDailyChallenge]=useState(null); // {sx,sy,endsAt}
  const [showCanvasChallenge,setShowCanvasChallenge]=useState(false);
  const [canvasChallenge,setCanvasChallenge]=useState(null); // weekly prompt
  const [clan,setClan]=useState(()=>{try{return JSON.parse(localStorage.getItem("pow_clan")||"null");}catch{return null;}});
  const [showClanModal,setShowClanModal]=useState(false);
  const [clanInput,setClanInput]=useState("");
  const [showWorldWar,setShowWorldWar]=useState(false);
  const [wwLastRaid,setWwLastRaid]=useState(()=>{try{return parseInt(localStorage.getItem("pow_ww_raid")||"0");}catch{return 0;}});
  const [purchases,setPurchases]=useState([]);
  const [purchasesLoading,setPurchasesLoading]=useState(false);
  const [watchingAd,setWatchingAd]=useState(false);
  const [adCooldown,setAdCooldown]=useState(()=>{try{return parseInt(localStorage.getItem("pow_ad_cooldown")||"0");}catch{return 0;}});
  const [showStarterPack,setShowStarterPack]=useState(false);
  const starterPackAvailable=useMemo(()=>{try{const j=localStorage.getItem("pow_joined_at");return j&&Date.now()-parseInt(j)<3*86400000&&!localStorage.getItem("pow_starter_used");}catch{return false;}},[]);
  const [flashColor,setFlashColor]=useState(null);
  const [shakeCanvas,setShakeCanvas]=useState(false);
  const [myPixels,setMyPixels]=useState(0);
  const [lastCombo,setLastCombo]=useState(null);
  const [showDaily,setShowDaily]=useState(false);
  const [dailyInfo,setDailyInfo]=useState(null);
  const [showReset,setShowReset]=useState(false);
  const [showSeasonEnd,setShowSeasonEnd]=useState(false);
  const [showStandings,setShowStandings]=useState(false);
  const [newSectorAlert,setNewSectorAlert]=useState(null);
  const [showPriceMap,setShowPriceMap]=useState(false);
  const [showConfirm,setShowConfirm]=useState(false);
  const [confirmPayload,setConfirmPayload]=useState(null);
  const [showDiscord,setShowDiscord]=useState(false);
  const [showShare,setShowShare]=useState(false);
  const [showMissions,setShowMissions]=useState(false);
  const [showHallOfFame,setShowHallOfFame]=useState(false);
  const [notifPermission,setNotifPermission]=useState(Notification?.permission||"default");
  const [showNotifBanner,setShowNotifBanner]=useState(false);
  const [showDecayAlert,setShowDecayAlert]=useState(false);
  const [rivalId,setRivalId]=useState(null);
  const [showWeeklyReport,setShowWeeklyReport]=useState(false);
  const [weeklyStats,setWeeklyStats]=useState(null);
  const [showLiveBattle,setShowLiveBattle]=useState(false);
  const [showLiveBattleBanner,setShowLiveBattleBanner]=useState(()=>!localStorage.getItem("pow_seen_live_battle"));
  const [enemyNearby,setEnemyNearby]=useState(null);
  const [liveBattleStreak,setLiveBattleStreak]=useState(()=>{try{return JSON.parse(localStorage.getItem("pow_lb_streak")||'{"days":0,"last":""}');}catch{return{days:0,last:""};} });
  const [liveBattlePixels,setLiveBattlePixels]=useState({});
  const [liveBattleEndsAt,setLiveBattleEndsAt]=useState(null);
  const [floatingTexts,setFloatingTexts]=useState([]);
  const [sectorZoom,setSectorZoom]=useState(null);
  const [claimsLastMin,setClaimsLastMin]=useState(0);
  const claimsLogRef=useRef([]);
  const [missionProgress,setMissionProgress]=useState(()=>{
    try{const wk=getWeekNum();const saved=JSON.parse(localStorage.getItem("pow_missions")||"{}");return saved.week===wk?saved.data:{};}catch{return{};}
  });
  const [referralCode,setReferralCode]=useState(null);
  const [referralCount,setReferralCount]=useState(0);
  const [isMobile,setIsMobile]=useState(()=>typeof window!=="undefined"&&window.innerWidth<768);
  const [mobileTab,setMobileTab]=useState("GAME");
  const [showOnboarding,setShowOnboarding]=useState(()=>!localStorage.getItem("pow_onboarded"));
  const [countdownStr,setCountdownStr]=useState("");

  const [pixelHistory,setPixelHistory]=useState(null);
  const lastClaimRef=useRef(0);
  const prevBoardRef=useRef([]);
  const [user,setUser]=useState(null);
  const [profile,setProfile]=useState(null);
  const [showAuthModal,setShowAuthModal]=useState(false);
  const [authReason,setAuthReason]=useState("claim");
  const [guestPixelsUsed,setGuestPixelsUsed]=useState(0);
  const [guestSessionId]=useState(()=>{let id=localStorage.getItem("pow_guest_id");if(!id){id=Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem("pow_guest_id",id);}return id;});
  const [guestChecked,setGuestChecked]=useState(false);
  const [showGuestSavePrompt,setShowGuestSavePrompt]=useState(false);
  const GUEST_MAX=3;

  // On load — check fingerprint against Supabase to restore used count
  useEffect(()=>{
    if(user){setGuestChecked(true);return;} // logged in users skip
    if(!supabase){setGuestChecked(true);return;}
    const fp=getFingerprint();
    supabase.from("guest_claims").select("pixels_used").eq("fingerprint",fp).gt("expires_at",new Date().toISOString()).order("created_at",{ascending:false}).limit(1)
      .then(({data})=>{
        if(data&&data.length>0){setGuestPixelsUsed(data[0].pixels_used||0);}
        setGuestChecked(true);
      }).catch(()=>setGuestChecked(true));
  },[user]);
  const [totalPlayers,setTotalPlayers]=useState(0);
  const [sponsoredBanners,setSponsoredBanners]=useState([]);
  const [showSponsor,setShowSponsor]=useState(false);

  const currentSeasonNum=season.num;
  const alreadyClaimedToday=streakData.last===todayStr();

  const pushToast=useCallback((msg,color,dur=3000)=>{const id=Date.now()+Math.random();setToasts(t=>[...t,{id,msg,color}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),dur);},[]);

  // Fetch purchase history
  const fetchPurchases=useCallback(async()=>{
    if(!user?.id)return;
    setPurchasesLoading(true);
    try{
      const{data}=await supabase.from("purchases").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(20);
      if(data)setPurchases(data);
    }catch(e){console.error("purchases fetch:",e);}
    finally{setPurchasesLoading(false);}
  },[user]);

  // ── STRIPE CHECKOUT ──────────────────────────────────────────────────────────
  const STRIPE_PK="pk_live_51TXp5DJ6WZdD3UBmyp9194J1r8WvXbcUCmU6Nlhw5vRWL8M5d4y46LrH98qZoLyhdCLzHrl6Bx0tcU9VPTObcjYJ0058NAhaZF";
  const [paymentLoading,setPaymentLoading]=useState(null);

  const startCheckout=useCallback(async(productId)=>{
    if(paymentLoading)return;
    setPaymentLoading(productId);
    try{
      const res=await fetch("/api/create-checkout",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          productId,
          userId:user?.id||null,
          discordUsername:user?.user_metadata?.full_name||user?.user_metadata?.name||"player",
          fandom:active?TM[active]?.name||"none":"none",
        }),
      });
      const data=await res.json();
      if(data.url){
        window.location.href=data.url; // Redirect to Stripe Checkout
      }else{
        pushToast("❌ Payment error: "+( data.error||"Unknown error"),"#FF4400",4000);
      }
    }catch(err){
      pushToast("❌ Connection error. Please try again.","#FF4400",4000);
    }finally{
      setPaymentLoading(null);
    }
  },[paymentLoading,user,active]);

  // Check for payment success/cancel on page load
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const payment=params.get("payment");
    const product=params.get("product");
    if(payment==="success"){
      const names={trial:"Trial Pack",small:"Small Bundle",medium:"Medium Bundle",large:"Large Bundle",mega:"Mega Bundle",whale:"Whale Pack 👑",season_pass:"Season Pass 🏆",starter:"Starter Pack 🎁"};
      pushToast(`✅ Payment successful! ${names[product]||"Purchase"} activated. Pixels added to your account!`,"#00FF88",8000);
      // Clean URL
      window.history.replaceState({},"","/");
      // Re-sync pixels from Supabase after a short delay
      setTimeout(()=>{
        if(user?.id){
          supabase.from("profiles").select("free_pixels").eq("id",user.id).single()
            .then(({data})=>{if(data?.free_pixels!=null){syncFreePixels(data.free_pixels);}});
        }
      },2000);
    }else if(payment==="cancelled"){
      pushToast("Payment cancelled — no charge made.","#FFD700",4000);
      window.history.replaceState({},"","/");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // ── SHARE URL generator ──────────────────────────────────────────────────
  const generateShareURL=(teamId)=>{
    const t=TM[teamId];if(!t)return "https://www.pixelsofwar.com";
    const slug=slugify(t.name);
    return `https://www.pixelsofwar.com?fandom=${slug}`;
  };

  const shareTerritory=(teamId)=>{
    const t=TM[teamId];if(!t)return;
    const myPx=Object.values(pixels).filter(p=>p?.t===teamId).length;
    const rank=getRank(myPx);
    const url=generateShareURL(teamId);
    const msg=`⚔️ ${t.name} is fighting for territory on Pixels of War!\n\n${rank.icon} ${myPx} pixels claimed · ${rank.name} rank\n\nJoin us and claim your pixels — FREE to start!\n👉 ${url}`;
    if(navigator.share){navigator.share({title:`${t.name} — Pixels of War`,text:msg,url}).catch(()=>{});}
    else if(navigator.clipboard?.writeText){navigator.clipboard.writeText(msg).then(()=>pushToast("📋 Territory link copied! Share anywhere.","#00FF88",3000)).catch(()=>{prompt("Copy this link:",msg);});}
    else{prompt("Copy this link:",msg);}
  };

  const shareTikTok=(teamId)=>{
    const t=TM[teamId];if(!t)return;
    const myPx=Object.values(pixels).filter(p=>p?.t===teamId).length;
    const url=generateShareURL(teamId);
    const msg=`🎮 I'm claiming territory for ${t.name} on Pixels of War! ${myPx} pixels and counting 🔥\n\n#PixelsOfWar #${t.name.replace(/\s/g,"")} #Gaming #PixelArt\n\n${url}`;
    navigator.clipboard?.writeText(msg).then(()=>pushToast("📋 TikTok caption copied! Open TikTok and paste.","#FF2D78",4000)).catch(()=>{prompt("Copy TikTok caption:",msg);});
  };
  useEffect(()=>{vxRef.current=vx;},[vx]);
  useEffect(()=>{vyRef.current=vy;},[vy]);

  const spawnParticles=useCallback((color,gx,gy,count=12,big=false)=>{
    const c=cvs.current;if(!c)return;
    const rc=c.getBoundingClientRect();
    const scaleX=rc.width/CW,scaleY=rc.height/CH;
    const sx=(gx-vxRef.current)*CELL*scaleX,sy=(gy-vyRef.current)*CELL*scaleY;
    const container=c.parentElement;if(!container)return;
    for(let i=0;i<count;i++){
      const p=document.createElement("div");
      const angle=(Math.PI*2*i/count)+Math.random()*.6;
      const dist=(big?50:22)+Math.random()*28;
      p.style.cssText=`position:absolute;width:${2+Math.random()*3}px;height:${2+Math.random()*3}px;background:${color};border-radius:2px;left:${sx}px;top:${sy}px;pointer-events:none;z-index:30;animation:particleBurst ${.35+Math.random()*.3}s ease-out forwards;--pdx:${Math.cos(angle)*dist}px;--pdy:${Math.sin(angle)*dist}px`;
      container.appendChild(p);setTimeout(()=>p.remove(),700);
    }
  },[]);

  const spawnShockwave=useCallback((color,gx,gy)=>{
    const c=cvs.current;if(!c)return;
    const rc=c.getBoundingClientRect();
    const scaleX=rc.width/CW,scaleY=rc.height/CH;
    const sx=(gx-vxRef.current)*CELL*scaleX,sy=(gy-vyRef.current)*CELL*scaleY;
    const container=c.parentElement;if(!container)return;
    const el=document.createElement("div");
    el.style.cssText=`position:absolute;width:12px;height:12px;border:2px solid ${color};border-radius:50%;left:${sx-6}px;top:${sy-6}px;pointer-events:none;z-index:30;animation:shockwaveExp .7s ease-out forwards`;
    container.appendChild(el);setTimeout(()=>el.remove(),800);
  },[]);

  const trackHeatmap=useCallback((idx)=>{const[sx,sy]=sectorOf(idx);const k=sectorKey(sx,sy);heatmapRef.current[k]=(heatmapRef.current[k]||0)+1;setHeatmapTick(t=>t+1);},[]);

  // Territory trend
  useEffect(()=>{
    const cnt={};Object.values(pixels).forEach(p=>{if(p?.t)cnt[p.t]=(cnt[p.t]||0)+1;});
    const prev=prevPixelCounts.current;const trend={};
    Object.entries(cnt).forEach(([id,c])=>{trend[id]=c-(prev[id]||0);});
    setTerritoryTrend(trend);
    const iv=setInterval(()=>{prevPixelCounts.current={...cnt};},[60000]);
    return()=>clearInterval(iv);
  },[pixels]);

  // Heatmap decay
  useEffect(()=>{const iv=setInterval(()=>{const h=heatmapRef.current;Object.keys(h).forEach(k=>{h[k]=Math.floor(h[k]*0.85);if(h[k]<=0)delete h[k];});setHeatmapTick(t=>t+1);},[30000]);return()=>clearInterval(iv);},[]);

  // War Chest — passive gold income every 5 minutes based on pixel count
  useEffect(()=>{
    const iv=setInterval(()=>{
      if(!active)return;
      setPixels(px=>{
        const myPx=Object.values(px).filter(p=>p?.t===active).length;
        if(myPx===0)return px;
        const base=Math.max(1,Math.floor(myPx/50));
        const themeBonus=(weeklyTheme.cat===active?.split("|")[0]||weeklyTheme.cat==="ALL")?2:1;
        const passBonus=hasSeasonPass?1.5:1; // 50% War Chest bonus with Season Pass
        const income=Math.floor(base*themeBonus*passBonus);
        setWarChest(g=>{
          const next=g+income;
          localStorage.setItem("pow_war_chest",String(next));
          if(income>0)pushToast(`💰 +${income} War Chest gold (${next} total)`,"#FFD700",2500);
          return next;
        });
        return px;
      });
    },300000);
    return()=>clearInterval(iv);
  },[active,weeklyTheme]);

  // Free pixel recharge — 1 pixel per hour, up to max based on level
  useEffect(()=>{
    const iv=setInterval(()=>{
      if(!user)return; // only for logged-in players
      setRechargePixels(r=>{
        const maxR=getMaxRecharge(playerLevel);
        if(r>=maxR)return r;
        const next=Math.min(maxR,r+1);
        localStorage.setItem("pow_recharge",String(next));
        pushToast(`⏰ +1 free pixel recharged! (${next}/${maxR} ready)`,"#00FF88",3000);
        return next;
      });
    },3600000); // every hour
    return()=>clearInterval(iv);
  },[user,playerLevel]);

  // Loyalty tracking — consecutive days with same fandom
  useEffect(()=>{
    if(!active||!user)return;
    const today=todayStr();
    if(loyaltyDays.last===today)return;
    const yesterday=yesterdayStr();
    const isSameFandom=loyaltyDays.fandom===active;
    const newDays=isSameFandom&&loyaltyDays.last===yesterday?loyaltyDays.days+1:1;
    const newLoyalty={fandom:active,days:newDays,last:today};
    setLoyaltyDays(newLoyalty);
    localStorage.setItem("pow_loyalty",JSON.stringify(newLoyalty));
    if(newDays>=7&&isSameFandom)pushToast(`🎖️ ${newDays}-day loyalty to ${TM[active]?.name}! You get a build cost discount.`,"#FFD700",5000);
  },[active,user]);

  // Init fortified sectors — 4 random unlocked sectors per season
  useEffect(()=>{
    if(loading||unlockedSectors.length===0)return;
    const saved=localStorage.getItem("pow_fort_sectors_season");
    if(saved===String(currentSeasonNum)&&fortifiedSectors.length>0)return;
    const shuffled=[...unlockedSectors].sort(()=>Math.random()-.5).slice(0,4);
    setFortifiedSectors(shuffled);
    localStorage.setItem("pow_fort_sectors",JSON.stringify(shuffled));
    localStorage.setItem("pow_fort_sectors_season",String(currentSeasonNum));
  },[loading,unlockedSectors.length,currentSeasonNum]);

  // Fast tick for remote claim/raid ripple animations
  useEffect(()=>{
    let raf;const tick=()=>{
      if(remoteAnimRef.current.length>0||mmFlashRef.current.length>0){
        setAnimTick(t=>t+1);
      }
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf);
  },[]);

  // Data load
  useEffect(()=>{
    async function load(){
      setLoading(true);
      if(isOnline){
        const dbSeason=await dbLoadSeason();
        let sNum=1;
        if(dbSeason){const sObj={num:dbSeason.num,startDate:dbSeason.start_date,theme:dbSeason.theme_index,winners:dbSeason.winners||[]};setSeason(sObj);sNum=dbSeason.num;}
        const dbSectors=await dbLoadSectors(sNum);if(dbSectors&&dbSectors.length)setUnlockedSectors(dbSectors);
        const px=await dbLoadPixels(sNum);if(px){setPixels(px);
          // Pan viewport to the most active area so grid doesn't look empty
          if(!localStorage.getItem("pow_viewport_set")&&Object.keys(px).length>0){
            const idxs=Object.keys(px).map(Number);
            const midIdx=idxs[Math.floor(idxs.length/2)];
            const mx=midIdx%GW,my=Math.floor(midIdx/GW);
            setVx(Math.max(0,Math.min(GW-VW,mx-Math.floor(VW/2))));
            setVy(Math.max(0,Math.min(GH-VH,my-Math.floor(VH/2))));
            localStorage.setItem("pow_viewport_set","1");
          }
        }
        const[als,ws,ms]=await Promise.all([dbLoadAlliances(sNum),dbLoadWars(sNum),dbLoadMiniSeason(sNum)]);
        setAlliances(als);setWars(ws);setMiniSeason(ms);
        setupRealtime(sNum);setupPresence();
        pushToast("🌐 MULTIPLAYER ACTIVE","#00F5FF",4000);
      }else{
        try{const px=JSON.parse(localStorage.getItem("pw2k_v2")||"{}");setPixels(px);const se=JSON.parse(localStorage.getItem("pow_season")||`{"num":1,"startDate":"${new Date().toISOString()}","theme":0,"winners":[]}`);setSeason(se);const sec=JSON.parse(localStorage.getItem("pow_sectors")||JSON.stringify(INIT_SECTORS));setUnlockedSectors(sec);}catch{}
        pushToast("⚠️ OFFLINE MODE","#FF4400",5000);
      }
      setLoading(false);
    }
    load();
    return()=>{if(channelRef.current)supabase?.removeChannel(channelRef.current);if(presenceRef.current)supabase?.removeChannel(presenceRef.current);};
  },[]);

  const [onlineByFandom,setOnlineByFandom]=useState({});

  function setupPresence(){
    if(!supabase)return;
    const ch=supabase.channel("online-users",{config:{presence:{key:Math.random().toString(36).slice(2)}}});
    ch.on("presence",{event:"sync"},()=>{
      const st=ch.presenceState();
      setOnlineCount(Object.keys(st).length||1);
      // Count per fandom
      const byFandom={};
      Object.values(st).forEach(arr=>arr.forEach(p=>{if(p.fandom)byFandom[p.fandom]=(byFandom[p.fandom]||0)+1;}));
      setOnlineByFandom(byFandom);
    }).subscribe(async(status)=>{if(status==="SUBSCRIBED")await ch.track({t:Date.now(),fandom:null});});
    presenceRef.current=ch;
  }

  function setupRealtime(sNum){
    if(!supabase)return;
    if(channelRef.current)supabase.removeChannel(channelRef.current);
    const ch=supabase.channel(`game-s${sNum}`)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"pixels",filter:`season_num=eq.${sNum}`},(payload)=>{
        setPixels(prev=>({...prev,[payload.new.idx]:dbRowToPixel(payload.new)}));
        trackHeatmap(payload.new.idx);
        const teamColor=TM[payload.new.team_id]?.color||"#00F5FF";
        remoteAnimRef.current.push({idx:payload.new.idx,color:teamColor,type:"claim",ts:Date.now()});
        const mx=Math.floor((payload.new.idx%GW)/MMS),my=Math.floor(Math.floor(payload.new.idx/GW)/MMS);
        mmFlashRef.current.push({mx,my,color:teamColor,ts:Date.now()});
        // Track claims per minute
        claimsLogRef.current.push(Date.now());
        claimsLogRef.current=claimsLogRef.current.filter(t=>Date.now()-t<60000);
        setClaimsLastMin(claimsLogRef.current.length);
        // Floating war text on grid
        const teamName=TM[payload.new.team_id]?.name||"?";
        const gx2=payload.new.idx%GW,gy2=Math.floor(payload.new.idx/GW);
        const screenX=((gx2-vxRef.current)/VW)*100;
        const screenY=((gy2-vyRef.current)/VH)*100;
        if(screenX>0&&screenX<100&&screenY>0&&screenY<100){
          const ftId=Date.now()+Math.random();
          setFloatingTexts(f=>[...f,{id:ftId,text:`🏴 ${teamName}`,color:teamColor,x:screenX,y:screenY}].slice(-8));
          setTimeout(()=>setFloatingTexts(f=>f.filter(x=>x.id!==ftId)),2000);
        }
        // Enemy nearby detection — alert if enemy claims within 60px of your territory
        setActive(myActive=>{
          if(myActive&&payload.new.team_id!==myActive){
            setPixels(myPixelsNow=>{
              const myIdxs=Object.entries(myPixelsNow).filter(([,v])=>v?.t===myActive).map(([k])=>parseInt(k));
              const claimGx=payload.new.idx%GW,claimGy=Math.floor(payload.new.idx/GW);
              const isNear=myIdxs.some(idx=>{const gx=idx%GW,gy=Math.floor(idx/GW);return Math.abs(gx-claimGx)<60&&Math.abs(gy-claimGy)<60;});
              if(isNear){
                const attacker=TM[payload.new.team_id];
                setEnemyNearby({name:attacker?.name||"Enemy",color:attacker?.color||"#FF4400",mx,my});
                setTimeout(()=>setEnemyNearby(null),5000);
              }
              return myPixelsNow;
            });
          }
          return myActive;
        });
      })
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"pixels",filter:`season_num=eq.${sNum}`},(payload)=>{
        setActive(myActive=>{
          if(myActive&&payload.old?.team_id===myActive&&payload.new?.team_id!==myActive){
            const[sx,sy]=sectorOf(payload.new.idx);const attacker=TM[payload.new.team_id];
            setRaidAlert({attacker:attacker?.name||"Unknown",attackerColor:attacker?.color||"#FF4400",sectorX:sx,sectorY:sy,idx:payload.new.idx});
            setTimeout(()=>setRaidAlert(null),10000);
            sendLocalNotif(`⚔️ ${attacker?.name||"Someone"} is raiding your territory!`,"Tap to defend your pixels now!","raid","/");
            // Send background push if tab is closed
            setUser(u=>{if(u)sendPushNotification(u.id,`⚔️ ${attacker?.name||"Someone"} raided your pixels!`,"Tap to defend your territory now!","/","raid");return u;});
          }
          return myActive;
        });
        setPixels(prev=>({...prev,[payload.new.idx]:dbRowToPixel(payload.new)}));trackHeatmap(payload.new.idx);
        // Queue remote raid animation (red flash)
        if(payload.old?.team_id!==payload.new?.team_id){
          remoteAnimRef.current.push({idx:payload.new.idx,color:"#FF4400",type:"raid",ts:Date.now()});
          const mx2=Math.floor((payload.new.idx%GW)/MMS),my2=Math.floor(Math.floor(payload.new.idx/GW)/MMS);
          mmFlashRef.current.push({mx:mx2,my:my2,color:"#FF4400",ts:Date.now()});
          // Floating raid text
          const raider=TM[payload.new.team_id]?.name||"?";
          const victim=TM[payload.old?.team_id]?.name||"?";
          const gxR=payload.new.idx%GW,gyR=Math.floor(payload.new.idx/GW);
          const sxR=((gxR-vxRef.current)/VW)*100,syR=((gyR-vyRef.current)/VH)*100;
          if(sxR>0&&sxR<100&&syR>0&&syR<100){
            const ftId=Date.now()+Math.random();
            setFloatingTexts(f=>[...f,{id:ftId,text:`⚔️ ${raider} RAIDED ${victim}`,color:"#FF4400",x:sxR,y:syR}].slice(-8));
            setTimeout(()=>setFloatingTexts(f=>f.filter(x=>x.id!==ftId)),2500);
          }
        }
      })
      .on("postgres_changes",{event:"DELETE",schema:"public",table:"pixels",filter:`season_num=eq.${sNum}`},(payload)=>{setPixels(prev=>{const next={...prev};delete next[payload.old.idx];return next;});})
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"sectors",filter:`season_num=eq.${sNum}`},(payload)=>{setUnlockedSectors(prev=>{const exists=prev.some(([x,y])=>x===payload.new.sx&&y===payload.new.sy);return exists?prev:[...prev,[payload.new.sx,payload.new.sy]];});})
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:`season_num=eq.${sNum}`},(payload)=>{setActive(myActive=>{if(myActive&&payload.new.fandom_id===myActive)setChatMessages(prev=>[...prev,payload.new].slice(-50));return myActive;});})
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"alliances"},(payload)=>{setAlliances(prev=>[...prev,payload.new]);setActive(myActive=>{if(myActive&&payload.new.target===myActive){const proposer=TM[payload.new.proposer];pushToast(`🤝 ${proposer?.name||"?"} proposed an ALLIANCE!`,"#00FFAA",8000);}return myActive;});})
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"alliances"},(payload)=>{setAlliances(prev=>prev.map(a=>a.id===payload.new.id?payload.new:a));})
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"wars"},(payload)=>{setWars(prev=>[payload.new,...prev]);const att=TM[payload.new.attacker];const def=TM[payload.new.defender];setFeed(f=>[{id:Date.now(),icon:"⚔️",team:att?.name||"?",msg:`declared WAR on ${def?.name||"?"}!`,color:"#FF4400",ts:new Date().toLocaleTimeString("en",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"}),isWar:true},...f].slice(0,40));pushToast(`⚔️ WAR! ${att?.name||"?"} vs ${def?.name||"?"}`,"#FF4400",8000);})
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"mini_seasons"},(payload)=>{setMiniSeason(payload.new);pushToast(`⚡ MINI SEASON: ${payload.new.label}!`,"#FFD700",8000);})
      .subscribe();
    channelRef.current=ch;
  }

  useEffect(()=>{if(!isOnline&&!loading){try{localStorage.setItem("pw2k_v2",JSON.stringify(pixels));}catch{}}},[pixels,loading]);

  useEffect(()=>{
    const lk=document.createElement("link");lk.href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap";lk.rel="stylesheet";document.head.appendChild(lk);
    // Track join date for starter pack
    if(!localStorage.getItem("pow_joined_at"))localStorage.setItem("pow_joined_at",String(Date.now()));
    const p=new URLSearchParams(window.location.search).get("fandom");
    if(p){const f=ALL.find(t=>slugify(t.name)===p);if(f)setTimeout(()=>setActive(f.id),600);}
    const today=todayStr();const saved=JSON.parse(localStorage.getItem("pow_streak")||'{"days":0,"last":"","total":0}');
    if(saved.last!==today){const nd=saved.last===yesterdayStr()?saved.days+1:1;setDailyInfo({days:nd,reward:streakReward(nd)});setTimeout(()=>setShowDaily(true),1400);}
    // Show starter pack to new players after 30s
    const joined=localStorage.getItem("pow_joined_at");
    if(joined&&Date.now()-parseInt(joined)<3*86400000&&!localStorage.getItem("pow_starter_used")){
      setTimeout(()=>setShowStarterPack(true),30000);
    }
    // ── Daily Sector Challenge ───────────────────────────────────────────────
    // A random sector gets 50% off for 2 hours every day
    const savedDC=JSON.parse(localStorage.getItem("pow_daily_challenge")||"null");
    if(savedDC&&savedDC.endsAt>Date.now()){
      setDailyChallenge(savedDC);
    }else{
      // Pick a new random unlocked sector — seed by today's date for consistency
      const seed2=today.split("-").reduce((a,b)=>a*31+parseInt(b),0);
      const sx2=Math.abs(seed2*17)%NS,sy2=Math.abs(seed2*31)%NS;
      const endsAt2=Date.now()+(2*3600000); // 2 hours
      const dc={sx:sx2,sy:sy2,endsAt:endsAt2};
      setDailyChallenge(dc);
      localStorage.setItem("pow_daily_challenge",JSON.stringify(dc));
    }
    // ── Canvas Challenge (weekly) ────────────────────────────────────────────
    const wn=getWeekNum();
    const cc=CANVAS_CHALLENGES[wn%CANVAS_CHALLENGES.length];
    setCanvasChallenge(cc);
    // Init live battle
    try{
      const lb=JSON.parse(localStorage.getItem("pow_live_battle")||"null");
      if(lb&&lb.endsAt>Date.now()){setLiveBattlePixels(lb.pixels||{});setLiveBattleEndsAt(lb.endsAt);}
      else{
        // New 24h battle
        const endsAt=Date.now()+86400000;
        setLiveBattleEndsAt(endsAt);
        // Seed with some starter pixels from popular fandoms
        const seedFandoms=["🎮 Gaming|Battle Royale|Fortnite","🎌 Anime|Shonen|Naruto","🎵 Music|K-Pop|BTS","🎮 Gaming|RPG|Pokémon","🎌 Anime|Shonen|One Piece","🎵 Music|Pop|Taylor Swift","🎮 Gaming|Shooter|Valorant","🎌 Anime|Shonen|Dragon Ball Z"];
        const seed={};
        seedFandoms.forEach((fid,fi)=>{
          for(let i=0;i<50;i++){
            const x=Math.floor(fi*25+Math.random()*20);
            const y=Math.floor(Math.random()*200);
            seed[y*200+x]=fid;
          }
        });
        setLiveBattlePixels(seed);
        localStorage.setItem("pow_live_battle",JSON.stringify({pixels:seed,endsAt}));
      }
    }catch{}
  },[]);

  // Load chat when fandom changes
  useEffect(()=>{if(active&&isOnline){dbLoadMessages(active,currentSeasonNum).then(msgs=>setChatMessages(msgs));}else setChatMessages([]);},[active,currentSeasonNum]);

  // Update presence when fandom changes
  useEffect(()=>{
    if(presenceRef.current&&active){
      presenceRef.current.track({t:Date.now(),fandom:active}).catch(()=>{});
    }
  },[active]);

  const seasonDaysLeft=useMemo(()=>{const end=new Date(new Date(season.startDate).getTime()+SEASON_DAYS*86400000);return Math.max(0,Math.ceil((end-Date.now())/86400000));},[season]);
  useEffect(()=>{if(seasonDaysLeft===0&&!showSeasonEnd&&!loading)setShowSeasonEnd(true);},[seasonDaysLeft,loading]);

  // Live countdown timer
  useEffect(()=>{
    const tick=()=>{
      const end=new Date(new Date(season.startDate).getTime()+SEASON_DAYS*86400000);
      const diff=Math.max(0,end-Date.now());
      const d=Math.floor(diff/86400000);
      const h=Math.floor((diff%86400000)/3600000);
      const m=Math.floor((diff%3600000)/60000);
      const s=Math.floor((diff%60000)/1000);
      if(d>2)setCountdownStr(`${d}d ${h}h left`);
      else if(d>0)setCountdownStr(`${d}d ${h}h ${m}m`);
      else setCountdownStr(`⚡ ${h}h ${m}m ${s}s`);
    };
    tick();
    const iv=setInterval(tick,1000);
    return()=>clearInterval(iv);
  },[season]);

  const unlockedSet=useMemo(()=>new Set(unlockedSectors.map(([x,y])=>sectorKey(x,y))),[unlockedSectors]);
  const sectorFills=useMemo(()=>{const fills={};unlockedSectors.forEach(([sx,sy])=>{let cnt=0;for(let py=sy*SECTOR;py<(sy+1)*SECTOR;py++)for(let px=sx*SECTOR;px<(sx+1)*SECTOR;px++){if(pixels[py*GW+px])cnt++;}fills[sectorKey(sx,sy)]=cnt/(SECTOR*SECTOR);});return fills;},[pixels,unlockedSectors]);
  useEffect(()=>{if(loading)return;const avg=Object.values(sectorFills).reduce((a,b)=>a+b,0)/Math.max(1,unlockedSectors.length);if(avg>=0.7){const next=adjacentSectors(unlockedSectors).slice(0,8);if(next.length>0){const all=[...unlockedSectors,...next];setUnlockedSectors(all);if(isOnline)dbSaveSectors(next,currentSeasonNum);else{try{localStorage.setItem("pow_sectors",JSON.stringify(all));}catch{}}setNewSectorAlert({count:next.length});setTimeout(()=>setNewSectorAlert(null),8000);pushToast(`🔓 ${next.length} NEW SECTORS UNLOCKED!`,"#C8FF00",6000);}}},[sectorFills,loading]);

  // Alliance helpers
  const isAllied=(teamId)=>{if(!active)return false;return alliances.some(a=>a.status==="active"&&((a.proposer===active&&a.target===teamId)||(a.target===active&&a.proposer===teamId)));};
  const myActiveAlliances=alliances.filter(a=>a.status==="active"&&(a.proposer===active||a.target===active));
  const pendingAlliances=alliances.filter(a=>a.status==="pending"&&a.target===active);

  const proposeAlliance=async(targetId)=>{if(!active||!isOnline)return;if(isAllied(targetId)){pushToast("Already allied!","#00FFAA",3000);return;}await dbProposeAlliance(active,targetId,currentSeasonNum);pushToast(`🤝 Alliance proposed to ${TM[targetId]?.name}!`,"#00FFAA",4000);setShowAllianceModal(false);};
  const acceptAlliance=async(allianceId)=>{await dbUpdateAlliance(allianceId,"active");setAlliances(prev=>prev.map(a=>a.id===allianceId?{...a,status:"active"}:a));pushToast("🤝 Alliance ACCEPTED!","#00FFAA",4000);};
  const betrayAlliance=async(allianceId,partnerName)=>{if(!confirm(`BETRAY ${partnerName}?`))return;await dbUpdateAlliance(allianceId,"betrayed");setAlliances(prev=>prev.map(a=>a.id===allianceId?{...a,status:"betrayed"}:a));pushToast(`💀 BETRAYAL! Alliance with ${partnerName} broken!`,"#FF4400",6000);setFeed(f=>[{id:Date.now(),icon:"💀",team:TM[active]?.name||"?",msg:`BETRAYED ${partnerName}!`,color:"#FF4400",ts:new Date().toLocaleTimeString("en",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"}),isBetrayal:true},...f].slice(0,40));
    postToDiscord({title:`💀 ALLIANCE BETRAYED`,description:`**${TM[active]?.name||active}** has **betrayed** their alliance with **${partnerName}**!\n\nThe backstab heard across the grid. Trust no one.`,color:0xFF0000,fields:[{name:"Traitor",value:TM[active]?.name||active,inline:true},{name:"Betrayed",value:partnerName,inline:true}],footer:{text:"Pixels of War • pixelsofwar.com"},timestamp:new Date().toISOString()});
  };
  const declareWar=async(targetId)=>{if(!active||!isOnline)return;if(isAllied(targetId)){pushToast("Break the alliance first!","#FF4400",3000);return;}const already=wars.some(w=>w.attacker===active&&w.defender===targetId);if(already){pushToast("Already at war!","#FF4400",3000);return;}await dbDeclareWar(active,targetId,currentSeasonNum);pushToast(`⚔️ WAR DECLARED on ${TM[targetId]?.name}!`,"#FF4400",6000);setShowWarModal(false);
    const att=TM[active],def=TM[targetId];
    postToDiscord({title:`⚔️ WAR DECLARED`,description:`**${att?.name||active}** has declared war on **${def?.name||targetId}**!\n\nThe battle for territory begins now. Rally your fandom!`,color:0xFF4400,fields:[{name:"Attacker",value:att?.name||active,inline:true},{name:"Defender",value:def?.name||targetId,inline:true}],footer:{text:"Pixels of War • pixelsofwar.com"},timestamp:new Date().toISOString()});
  };
  const sanitizeChat=(text)=>{
    return text.replace(/<[^>]*>/g,"").replace(/https?:\/\/[^\s]{0,200}/g,"[link]").trim().slice(0,200);
  };
  const sendMessage=async()=>{
    if(!requireAuth("chat"))return;
    if(!active||!chatInput.trim()||!isOnline)return;
    const clean=sanitizeChat(chatInput);
    if(!clean){setChatInput("");return;}
    const rankIcon=getRank(myPixels).icon;
    await dbSendMessage(active,clean,currentSeasonNum,profile?.username,profile?.role,rankIcon);
    setChatInput("");
  };
  const gatedSetMode=(m)=>{
    if(m!=="BUILD"&&!requireAuth("interact"))return;
    setMode(m);
  };
  const gatedOpenDaily=()=>{
    if(!requireAuth("daily"))return;
    openDailyModal();
  };

  const claimDaily=()=>{if(!dailyInfo||alreadyClaimedToday)return;const today=todayStr();const ns={days:dailyInfo.days,last:today,total:(streakData.total||0)+1};setStreakData(ns);localStorage.setItem("pow_streak",JSON.stringify(ns));syncFreePixels(freePixels+dailyInfo.reward.px);pushToast(`🎁 +${dailyInfo.reward.px} FREE PIXELS!`,"#FFD700",5000);if(dailyInfo.reward.bonus)setTimeout(()=>pushToast(dailyInfo.reward.bonus,"#FF2D78",4000),800);setDailyInfo(null);setShowDaily(false);};
  const openDailyModal=()=>{if(alreadyClaimedToday)pushToast("✅ Already claimed!","#FFD700",3000);else setShowDaily(true);};

  const startNewSeason=async()=>{
    const cnt={};Object.values(pixels).forEach(p=>{if(p?.t)cnt[p.t]=(cnt[p.t]||0)+1;});
    const winner=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];const winnerTeam=winner?TM[winner[0]]:null;
    const nextTheme=(season.theme+1)%THEMES.length;
    const ns={num:season.num+1,startDate:new Date().toISOString(),theme:nextTheme,winners:[...season.winners,{season:season.num,team:winnerTeam?.name||"?",pixels:winner?winner[1]:0,theme:THEMES[season.theme].name}]};
    if(isOnline){await dbClearSeason(season.num);await dbSaveSeason(ns);await dbSaveSectors(INIT_SECTORS,ns.num);}else{try{["pw2k_v2","pow_sectors"].forEach(k=>localStorage.removeItem(k));localStorage.setItem("pow_season",JSON.stringify(ns));localStorage.setItem("pow_sectors",JSON.stringify(INIT_SECTORS));}catch{}}
    setSeason(ns);setPixels({});setShields({});setMyPixels(0);setUnlockedSectors(INIT_SECTORS);setAlliances([]);setWars([]);
    if(isOnline)setupRealtime(ns.num);
    pushToast(`🎉 SEASON ${ns.num} STARTED!`,"#FFD700",6000);setShowSeasonEnd(false);
    postToDiscord({title:`🏆 SEASON ${ns.num} HAS BEGUN!`,description:`A new season of **Pixels of War** has started!\n\nThe grid is reset. Territory is up for grabs. Which fandom will dominate this season?`,color:0xFFD700,fields:[{name:"Season",value:`#${ns.num}`,inline:true},{name:"Duration",value:"~90 days",inline:true}],url:"https://www.pixelsofwar.com",footer:{text:"Pixels of War • pixelsofwar.com"},timestamp:new Date().toISOString()});
  };

  useEffect(()=>{const add=()=>{const t1=SIM_TEAMS[randInt(0,SIM_TEAMS.length-1)];let t2=SIM_TEAMS[randInt(0,SIM_TEAMS.length-1)];while(t2===t1)t2=SIM_TEAMS[randInt(0,SIM_TEAMS.length-1)];const acts=["claimed","raided","shielded","renewed"];const action=acts[randInt(0,acts.length-1)];const px=randInt(1,60);const icon={"claimed":"🏴","raided":"⚔️","shielded":"🛡️","renewed":"♻️"}[action];setFeed(f=>[{id:Date.now()+Math.random(),icon,team:t1,msg:action==="claimed"?`claimed ${px}px`:action==="raided"?`RAIDED ${t2}`:action==="renewed"?`renewed ${px}px`:`shielded territory`,color:tc(t1),ts:new Date().toLocaleTimeString("en",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})},...f].slice(0,40));};add();const iv=setInterval(add,randInt(2500,5500));return()=>clearInterval(iv);},[]);
  useEffect(()=>{
    let active=true;
    const start=()=>{
      if(!active)return;
      const ev=EVENTS[randInt(0,EVENTS.length-1)];
      setEvent(ev);setEventTimer(ev.duration);
    };
    const iv=setInterval(()=>setEventTimer(t=>{
      if(t<=1){setEvent(null);if(active)setTimeout(start,randInt(20000,40000));return 0;}
      return t-1;
    }),1000);
    setTimeout(start,8000);
    return()=>{active=false;clearInterval(iv);};
  },[]);
  useEffect(()=>{
    const f=(e)=>{
      // Don't fire shortcuts when typing in inputs
      if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")return;
      if(e.key==="Escape"){setActive(null);setPending(new Set());setSectorZoom(null);setShowStandings(false);setGridFullscreen(false);}
      else if(e.key==="b"||e.key==="B"){gatedSetMode("BUILD");}
      else if(e.key==="r"||e.key==="R"){gatedSetMode("RAID");}
      else if(e.key==="s"||e.key==="S"){setMode("SHOP");}
      else if(e.key==="t"||e.key==="T"){setShowStandings(s=>!s);}
      else if(e.key==="ArrowLeft"){pan(-10,0);}
      else if(e.key==="ArrowRight"){pan(10,0);}
      else if(e.key==="ArrowUp"){pan(0,-10);}
      else if(e.key==="ArrowDown"){pan(0,10);}
      else if(e.key==="="||e.key==="+"){setZoomLevel(z=>{const L=[0.5,0.75,1,1.5,2,3];const i=L.indexOf(z);return L[Math.min(L.length-1,(i===-1?2:i)+1)];});}
      else if(e.key==="-"){setZoomLevel(z=>{const L=[0.5,0.75,1,1.5,2,3];const i=L.indexOf(z);return L[Math.max(0,(i===-1?2:i)-1)];});}
      else if(e.key==="0"){setZoomLevel(1);}
    };
    window.addEventListener("keydown",f);return()=>window.removeEventListener("keydown",f);
  },[]);


  useEffect(()=>{
    const el=cvs.current;if(!el)return;
    const ZOOM_LEVELS=[0.5,0.75,1,1.5,2,3];
    const onWheel=(e)=>{
      e.preventDefault();
      const delta=e.deltaY<0?1:-1;
      setZoomLevel(z=>{
        const idx=ZOOM_LEVELS.findIndex(l=>l===z);
        const newIdx=Math.max(0,Math.min(ZOOM_LEVELS.length-1,(idx===-1?2:idx)+delta));
        return ZOOM_LEVELS[newIdx];
      });
    };
    el.addEventListener("wheel",onWheel,{passive:false});
    return()=>el.removeEventListener("wheel",onWheel);
  },[]);

  // ── RESIZE DETECTION ──────────────────────────────────────────────────────
  useEffect(()=>{
    const onResize=()=>setIsMobile(window.innerWidth<768);
    window.addEventListener("resize",onResize);
    return()=>window.removeEventListener("resize",onResize);
  },[]);

  // ── AUTH ──────────────────────────────────────────────────────────────────
  useEffect(()=>{
    if(!supabase)return;
    // Get initial session
    supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user||null);
      if(session?.user)loadProfile(session.user.id);
    });
    // Listen for auth changes
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      setUser(session?.user||null);
      if(session?.user)loadProfile(session.user.id);
      else setProfile(null);
    });
    return()=>subscription.unsubscribe();
  },[]);

  const loadProfile=async(userId)=>{
    if(!supabase)return;
    const{data}=await supabase.from("profiles").select("*").eq("id",userId).single();
    if(data){
      setProfile(data);
      if(data.free_pixels!=null){
        setFreePixels(data.free_pixels);
        localStorage.setItem("pow_free",String(data.free_pixels));
      }
    }
    // Re-save push subscription on login if already granted
    if(Notification?.permission==="granted"&&"serviceWorker" in navigator){
      navigator.serviceWorker.ready.then(async reg=>{
        const sub=await reg.pushManager.getSubscription();
        if(sub)await saveSubscription(sub);
      }).catch(()=>{});
    }
  };

  // Sync free pixels to Supabase
  const syncFreePixels=async(newAmount)=>{
    setFreePixels(newAmount);
    localStorage.setItem("pow_free",String(newAmount));
    if(supabase&&user){
      await supabase.from("profiles").update({free_pixels:newAmount}).eq("id",user.id);
    }
  };

  // Load total player count
  useEffect(()=>{
    if(!supabase||!isOnline)return;
    supabase.rpc("get_player_count").then(({data})=>data&&setTotalPlayers(data));
  },[]);

  // Load active sponsored banners
  useEffect(()=>{
    if(!supabase||!isOnline)return;
    const load=()=>supabase.from("sponsored_banners")
      .select("*").eq("status","active").gt("end_at",new Date().toISOString())
      .order("created_at",{ascending:true})
      .then(({data})=>setSponsoredBanners(data||[]));
    load();
    const ch=supabase.channel("sponsored").on("postgres_changes",{event:"*",schema:"public",table:"sponsored_banners"},load).subscribe();
    return()=>supabase.removeChannel(ch);
  },[]);

  // ── SERVICE WORKER ────────────────────────────────────────────────────────
  useEffect(()=>{
    if("serviceWorker" in navigator){
      navigator.serviceWorker.register("/sw.js").then(reg=>{
        console.log("SW registered:",reg.scope);
      }).catch(e=>console.log("SW failed:",e));
    }
    // Show notif banner after 30s (not immediately — less annoying)
    if(Notification?.permission==="default"){setTimeout(()=>setShowNotifBanner(true),30000);}
    // Referral check
    const params=new URLSearchParams(window.location.search);
    const ref=params.get("ref");
    if(ref&&!localStorage.getItem("pow_referrer")){
      localStorage.setItem("pow_referrer",ref);
      setReferralCode(ref);
      pushToast(`🎁 Referred by ${ref.replace(/-/g," ")}! Claim pixels to get your welcome bonus!`,"#FFD700",7000);
      // Credit referral in DB
      if(isOnline&&supabase){supabase.from("referrals").insert({referrer:ref,season_num:1}).catch(()=>{});}
    }
  },[]);

  // ── NOTIFICATION HELPERS ──────────────────────────────────────────────────
  const VAPID_PUBLIC_KEY="BOCyIKzt2Zc4jFbmrGKwykcG6bNzGBLas_GsPlJC5Zwf7z5xBjGFa_ntQxFEYsEsUH45WhJZQqOsNNM6X4zGazU";

  const requestNotifPermission=async()=>{
    if(!("Notification" in window)||!("serviceWorker" in navigator))return;
    const result=await Notification.requestPermission();
    setNotifPermission(result);setShowNotifBanner(false);
    if(result!=="granted")return;
    pushToast("🔔 Notifications ON! We'll alert you when you're raided.","#00FF88",5000);
    try{
      // Register service worker and get push subscription
      const reg=await navigator.serviceWorker.ready;
      const existing=await reg.pushManager.getSubscription();
      if(existing){await saveSubscription(existing);return;}
      // Subscribe with VAPID key
      const sub=await reg.pushManager.subscribe({
        userVisibleOnly:true,
        applicationServerKey:urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      await saveSubscription(sub);
    }catch(e){console.warn("Push subscription failed:",e);}
  };

  const urlBase64ToUint8Array=(base64String)=>{
    const padding="=".repeat((4-base64String.length%4)%4);
    const base64=(base64String+padding).replace(/-/g,"+").replace(/_/g,"/");
    const raw=window.atob(base64);
    return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)));
  };

  const saveSubscription=async(sub)=>{
    if(!supabase)return;
    const subJson=sub.toJSON();
    await supabase.from("push_subscriptions").upsert({
      endpoint:subJson.endpoint,
      p256dh:subJson.keys?.p256dh,
      auth:subJson.keys?.auth,
      user_id:user?.id||null,
      fandom_id:null,
      updated_at:new Date().toISOString()
    },{onConflict:"endpoint"});
  };

  const sendPushNotification=async(userId,title,body,url="/",tag="pow")=>{
    if(!supabase)return;
    try{
      await supabase.functions.invoke("send-push",{body:{user_id:userId,title,body,url,tag}});
    }catch(e){console.warn("Push notification failed:",e);}
  };

  const sendLocalNotif=(title,body,tag="pow",url="/")=>{
    if(Notification?.permission!=="granted")return;
    if(document.visibilityState==="visible")return;
    try{
      const n=new Notification(title,{body,icon:"/icons/icon-192.png",badge:"/icons/icon-72.png",tag,data:{url}});
      n.onclick=()=>{window.focus();n.close();};
    }catch{}
  };

  // ── MISSION HELPERS ───────────────────────────────────────────────────────
  const saveMissions=(data)=>{localStorage.setItem("pow_missions",JSON.stringify({week:getWeekNum(),data}));};
  const trackMission=useCallback((type,increment=1)=>{
    setMissionProgress(prev=>{
      const next={...prev};
      MISSIONS.filter(m=>m.type===type&&!prev[m.id]?.claimed).forEach(m=>{
        const cur=(prev[m.id]?.count||0)+increment;
        next[m.id]={count:cur,claimed:prev[m.id]?.claimed||false};
      });
      saveMissions(next);return next;
    });
  },[]);
  const claimMission=(mission)=>{
    setMissionProgress(prev=>{
      const next={...prev,[mission.id]:{...prev[mission.id],claimed:true}};
      saveMissions(next);return next;
    });
    const nf=freePixels+mission.reward;syncFreePixels(nf);
    pushToast(`🎯 MISSION COMPLETE! +${mission.reward} free pixels!`,"#FFD700",5000);
  };
  const pendingMissionCount=MISSIONS.filter(m=>{const p=missionProgress[m.id];const cur=m.id==="login7"?streakData.days:(p?.count||0);return cur>=m.goal&&!p?.claimed;}).length;

  // Load WidgetBot Crate (floating Discord chat)
  useEffect(()=>{
    // Using Discord's official widget — no bot needed
    // Just enable Widget in Discord Server Settings → Widget
  },[]);


  // ── CANVAS DRAW ────────────────────────────────────────────────────────────
  useEffect(()=>{
    const c=cvs.current;if(!c)return;
    const ctx=c.getContext("2d");const now=Date.now();
    const eC=effCell,eVW=effVW,eVH=effVH; // local aliases for zoom-aware values
    ctx.fillStyle="#050510";ctx.fillRect(0,0,CW,CH);
    const frame=Math.floor(Date.now()/60);
    for(let dy=0;dy<eVH;dy++){for(let dx=0;dx<eVW;dx++){
      const gx=vx+dx,gy=vy+dy;if(gx>=GW||gy>=GH)continue;
      const idx=gy*GW+gx;const sx=Math.floor(gx/SECTOR),sy=Math.floor(gy/SECTOR);
      const isUnlocked=unlockedSet.has(sectorKey(sx,sy));
      const px=pixels[idx];const isShielded=shields[idx]&&shields[idx]>now;
      const age=px?now-px.at:0;const isMyPixel=px&&px.t===active;
      if(!isUnlocked){ctx.fillStyle=(dx+dy)%3===0?"#0a0a16":"#080810";ctx.fillRect(dx*eC,dy*eC,eC-1,eC-1);}
      else if(px){
        if(isMyPixel&&at){ctx.fillStyle=rgba(at.color,.2);ctx.fillRect(dx*eC-1,dy*eC-1,eC+1,eC+1);}
        ctx.fillStyle=`#${cv(TM[px.t]?.color||"#888")}`;ctx.fillRect(dx*eC,dy*eC,eC-1,eC-1);
        // Border glow on territory edges
        if(isMyPixel&&at){
          const gxA=vx+dx,gyA=vy+dy;
          const hasN=pixels[(gyA-1)*GW+gxA]?.t===active;
          const hasS=pixels[(gyA+1)*GW+gxA]?.t===active;
          const hasW=pixels[gyA*GW+(gxA-1)]?.t===active;
          const hasE=pixels[gyA*GW+(gxA+1)]?.t===active;
          if(!hasN||!hasS||!hasW||!hasE){
            const pulse=0.5+0.3*Math.sin(frame*0.12);
            ctx.shadowColor=at.color;ctx.shadowBlur=5;
            ctx.strokeStyle=at.color+(Math.round(pulse*200).toString(16).padStart(2,"0"));
            ctx.lineWidth=1.5;
            if(!hasN){ctx.beginPath();ctx.moveTo(dx*eC,dy*eC);ctx.lineTo(dx*eC+eC,dy*eC);ctx.stroke();}
            if(!hasS){ctx.beginPath();ctx.moveTo(dx*eC,dy*eC+eC-1);ctx.lineTo(dx*eC+eC,dy*eC+eC-1);ctx.stroke();}
            if(!hasW){ctx.beginPath();ctx.moveTo(dx*eC,dy*eC);ctx.lineTo(dx*eC,dy*eC+eC);ctx.stroke();}
            if(!hasE){ctx.beginPath();ctx.moveTo(dx*eC+eC-1,dy*eC);ctx.lineTo(dx*eC+eC-1,dy*eC+eC);ctx.stroke();}
            ctx.shadowBlur=0;
          }
        }
        if(age>DECAY_EXPIRE*86400000){ctx.fillStyle="rgba(255,0,0,.15)";ctx.fillRect(dx*eC,dy*eC,eC-1,eC-1);}
        if(isShielded){
          const phase=Math.sin((frame+dx*3+dy*3)*0.25)*0.5+0.5;
          ctx.fillStyle=`rgba(0,245,255,${0.1+phase*0.15})`;ctx.fillRect(dx*eC,dy*eC,eC-1,eC-1);
          if((dx+dy+frame)%5===0){ctx.fillStyle=`rgba(0,245,255,${0.4+phase*0.3})`;ctx.fillRect(dx*eC,dy*eC,1,1);}
        }
        if(age>DECAY_WARN*86400000&&age<=DECAY_EXPIRE*86400000&&(dx+dy)%4===0){ctx.fillStyle="rgba(255,200,0,.3)";ctx.fillRect(dx*eC,dy*eC,1,1);}
      }else if(pending.has(idx)){ctx.fillStyle=rgba(active?TM[active]?.color||"#888":"#888",mode==="RAID"?.4:.6);ctx.fillRect(dx*eC,dy*eC,eC-1,eC-1);}
      else{ctx.fillStyle=(dx+dy)%2===0?"#0c0c1e":"#0a0a18";ctx.fillRect(dx*eC,dy*eC,eC-1,eC-1);}
    }}
    // Grid lines
    ctx.strokeStyle="rgba(255,255,255,.025)";ctx.lineWidth=1;
    for(let x=0;x<=CW;x+=eC*10){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CH);ctx.stroke();}
    for(let y=0;y<=CH;y+=eC*10){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CW,y);ctx.stroke();}
    ctx.strokeStyle="rgba(0,245,255,.12)";ctx.lineWidth=1.5;
    for(let x=0;x<=CW;x+=eC*SECTOR){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CH);ctx.stroke();}
    for(let y=0;y<=CH;y+=eC*SECTOR){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CW,y);ctx.stroke();}
    // Gradient heatmap
    if(showHeatmap){
      for(let sy2=Math.floor(vy/SECTOR);sy2<=Math.floor((vy+VH)/SECTOR)+1;sy2++){
        for(let sx2=Math.floor(vx/SECTOR);sx2<=Math.floor((vx+VW)/SECTOR)+1;sx2++){
          const k=sectorKey(sx2,sy2);const heat=heatmapRef.current[k]||0;
          if(heat>0){
            const intensity=Math.min(1,heat/25);
            const cx2=(sx2*SECTOR+SECTOR/2-vx)*CELL,cy2=(sy2*SECTOR+SECTOR/2-vy)*CELL;
            const grad=ctx.createRadialGradient(cx2,cy2,0,cx2,cy2,SECTOR*eC*.9);
            grad.addColorStop(0,`rgba(255,${Math.floor(50*(1-intensity))},0,${0.2+intensity*0.4})`);
            grad.addColorStop(0.5,`rgba(255,80,0,${intensity*0.12})`);
            grad.addColorStop(1,"rgba(255,40,0,0)");
            ctx.fillStyle=grad;ctx.fillRect((sx2*SECTOR-vx)*eC-eC,(sy2*SECTOR-vy)*eC-eC,SECTOR*eC+eC*2,SECTOR*eC+eC*2);
          }
        }
      }
    }
    // Price map overlay — clean pill badges
    if(showPriceMap){
      for(let sy2=Math.floor(vy/SECTOR);sy2<=Math.floor((vy+VH)/SECTOR)+1;sy2++){
        for(let sx2=Math.floor(vx/SECTOR);sx2<=Math.floor((vx+VW)/SECTOR)+1;sx2++){
          const key=sectorKey(sx2,sy2);
          const unlocked=unlockedSet.has(key);
          const fill=sectorFills[key]||0;
          const price=unlocked?sectorBasePrice(sx2,sy2)*fillMultiplier(fill):0;
          const cx2=(sx2*SECTOR+SECTOR/2-vx)*CELL;
          const cy2=(sy2*SECTOR+SECTOR/2-vy)*CELL;
          if(!unlocked){
            ctx.fillStyle="rgba(255,255,255,.1)";
            ctx.font="bold 13px monospace";ctx.textAlign="center";
            ctx.fillText("🔒",cx2,cy2+5);
            continue;
          }
          // Color by price tier
          const tColor=price>=4?"#FF4400":price>=2?"#FFB400":price>=1.5?"#C8FF00":"#00F5FF";
          // Pill background
          ctx.fillStyle="rgba(4,4,14,.88)";
          ctx.beginPath();
          if(ctx.roundRect)ctx.roundRect(cx2-34,cy2-18,68,36,8);
          else ctx.rect(cx2-34,cy2-18,68,36);
          ctx.fill();
          // Pill border
          ctx.strokeStyle=tColor+"99";ctx.lineWidth=1.5;
          ctx.beginPath();
          if(ctx.roundRect)ctx.roundRect(cx2-34,cy2-18,68,36,8);
          else ctx.rect(cx2-34,cy2-18,68,36);
          ctx.stroke();
          // Price
          ctx.fillStyle=tColor;ctx.font="bold 14px monospace";ctx.textAlign="center";
          ctx.fillText(`€${price.toFixed(1)}`,cx2,cy2-1);
          // Fill %
          ctx.fillStyle="rgba(255,255,255,.4)";ctx.font="10px monospace";
          ctx.fillText(`${Math.round(fill*100)}% full`,cx2,cy2+13);
        }
      }
    }
    // Mini-season sector highlight
    if(miniSeason){
      const msx=miniSeason.sector_x,msy=miniSeason.sector_y;
      const dx2=(msx*SECTOR-vx)*eC,dy2=(msy*SECTOR-vy)*eC;
      if(dx2>-SECTOR*eC&&dx2<CW&&dy2>-SECTOR*eC&&dy2<CH){
        ctx.strokeStyle="#FFD700";ctx.lineWidth=3;ctx.setLineDash([8,4]);
        ctx.strokeRect(dx2,dy2,SECTOR*eC,SECTOR*eC);ctx.setLineDash([]);
        ctx.fillStyle="rgba(255,215,0,.06)";ctx.fillRect(dx2,dy2,SECTOR*eC,SECTOR*eC);
      }
    }
    // Daily challenge sector — green pulsing border + 50% OFF label
    if(dailyChallenge&&dailyChallenge.endsAt>Date.now()){
      const dcx=(dailyChallenge.sx*SECTOR-vx)*eC,dcy=(dailyChallenge.sy*SECTOR-vy)*eC;
      if(dcx>-SECTOR*eC&&dcx<CW&&dcy>-SECTOR*eC&&dcy<CH){
        const pulse2=0.5+0.3*Math.sin(frame*0.15);
        ctx.strokeStyle=`rgba(200,255,0,${pulse2})`;ctx.lineWidth=3;ctx.setLineDash([10,4]);
        ctx.strokeRect(dcx,dcy,SECTOR*eC,SECTOR*eC);ctx.setLineDash([]);
        ctx.fillStyle=`rgba(200,255,0,${pulse2*0.07})`;ctx.fillRect(dcx,dcy,SECTOR*eC,SECTOR*eC);
        const ccx=dcx+SECTOR*eC/2,ccy=dcy+SECTOR*eC/2;
        ctx.fillStyle=`rgba(200,255,0,${pulse2})`;ctx.font="bold 11px monospace";ctx.textAlign="center";
        ctx.fillText("⚡ DAILY CHALLENGE",ccx,ccy-7);
        ctx.fillStyle=`rgba(255,255,255,${pulse2*0.7})`;ctx.font="9px monospace";
        ctx.fillText("50% OFF",ccx,ccy+9);
      }
    }
    // Fortified sectors — red dashed border + shield icon
    fortifiedSectors.forEach(([fsx,fsy])=>{
      const dx2=(fsx*SECTOR-vx)*eC,dy2=(fsy*SECTOR-vy)*eC;
      if(dx2<-SECTOR*eC||dx2>CW||dy2<-SECTOR*eC||dy2>CH)return;
      const pulse=0.4+0.3*Math.sin(frame*0.08);
      ctx.strokeStyle=`rgba(255,68,0,${pulse})`;ctx.lineWidth=2;ctx.setLineDash([6,3]);
      ctx.strokeRect(dx2,dy2,SECTOR*eC,SECTOR*eC);ctx.setLineDash([]);
      ctx.fillStyle=`rgba(255,68,0,${pulse*0.08})`;ctx.fillRect(dx2,dy2,SECTOR*eC,SECTOR*eC);
      // FORTRESS label
      const cx2=dx2+SECTOR*eC/2,cy2=dy2+SECTOR*eC/2;
      ctx.fillStyle=`rgba(255,68,0,${pulse*0.9})`;ctx.font="bold 10px monospace";ctx.textAlign="center";
      ctx.fillText("🏰 FORTRESS",cx2,cy2-6);
      ctx.fillStyle=`rgba(255,255,255,${pulse*0.4})`;ctx.font="8px monospace";
      ctx.fillText("3× RAID COST",cx2,cy2+8);
    });
    // Canvas vignette
    const vig=ctx.createRadialGradient(CW/2,CH/2,CW*0.28,CW/2,CH/2,CW*0.72);
    vig.addColorStop(0,"rgba(0,0,0,0)");vig.addColorStop(1,"rgba(0,0,10,0.55)");
    ctx.fillStyle=vig;ctx.fillRect(0,0,CW,CH);

    // Fandom flags on dominant sectors
    if(!showPriceMap&&!showHeatmap){
      sectorLeaderboard.slice(0,30).forEach(s=>{
        if(!s.leader||s.leaderPx<20)return;
        const domPct=s.leaderPx/s.total;
        if(domPct<0.4)return;
        const cx2=(s.sx*SECTOR+SECTOR/2-vx)*CELL;
        const cy2=(s.sy*SECTOR+SECTOR/2-vy)*CELL;
        if(cx2<-SECTOR*eC||cx2>CW+SECTOR*eC||cy2<-SECTOR*eC||cy2>CH+SECTOR*eC)return;
        const label=s.leader.name.slice(0,4).toUpperCase();
        const alpha=Math.min(0.75,domPct*0.9);
        // Badge bg
        ctx.fillStyle=`rgba(4,4,14,${alpha*0.7})`;
        ctx.beginPath();
        if(ctx.roundRect)ctx.roundRect(cx2-22,cy2-9,44,18,4);else ctx.rect(cx2-22,cy2-9,44,18);
        ctx.fill();
        // Label
        ctx.fillStyle=s.leader.color+(Math.round(alpha*255).toString(16).padStart(2,"0"));
        ctx.font=`bold 9px monospace`;ctx.textAlign="center";
        ctx.fillText(label,cx2,cy2+4);
      });
    }
    // ── SURGE MODE OVERLAY ────────────────────────────────────────────────────
    if(surgeMode&&pending.size>0&&active){
      // Show which pending pixels are connected vs disconnected
      const myExisting=new Set(Object.entries(pixels).filter(([,v])=>v?.t===active).map(([k])=>parseInt(k)));
      const allCandidates=new Set([...myExisting,...pending]);
      const visited=new Set();const queue=[...myExisting];
      while(queue.length){const idx=queue.pop();if(visited.has(idx))continue;visited.add(idx);const gx2=idx%GW,gy2=Math.floor(idx/GW);[[0,-1],[0,1],[-1,0],[1,0]].forEach(([ddx,ddy])=>{const nidx=(gy2+ddy)*GW+(gx2+ddx);if(allCandidates.has(nidx)&&!visited.has(nidx))queue.push(nidx);});}
      pending.forEach(idx=>{
        const gx2=idx%GW,gy2=Math.floor(idx/GW);
        const sx2=(gx2-vx)*CELL,sy2=(gy2-vy)*CELL;
        if(sx2<0||sx2>CW||sy2<0||sy2>CH)return;
        if(visited.has(idx)){
          // Connected — green glow
          ctx.fillStyle="rgba(0,255,136,.5)";ctx.fillRect(sx2,sy2,eC-1,eC-1);
          ctx.shadowColor="#00FF88";ctx.shadowBlur=4;
        }else{
          // Disconnected — red flash warning
          ctx.fillStyle="rgba(255,68,0,.6)";ctx.fillRect(sx2,sy2,eC-1,eC-1);
          ctx.shadowColor="#FF4400";ctx.shadowBlur=4;
        }
        ctx.shadowBlur=0;
      });
      // Surge mode border flash on canvas
      const surgePulse=0.5+0.5*Math.sin(Date.now()*0.01);
      ctx.strokeStyle=`rgba(255,45,120,${surgePulse})`;ctx.lineWidth=4;
      ctx.strokeRect(2,2,CW-4,CH-4);
    }
    // ── REMOTE ANIMATIONS (other players claiming/raiding) ────────────────────
    const now2=Date.now();
    remoteAnimRef.current=remoteAnimRef.current.filter(a=>now2-a.ts<1200);
    remoteAnimRef.current.forEach(a=>{
      const gx2=a.idx%GW,gy2=Math.floor(a.idx/GW);
      const sx2=(gx2-vx)*CELL,sy2=(gy2-vy)*CELL;
      if(sx2<-eC*4||sx2>CW+eC*4||sy2<-eC*4||sy2>CH+eC*4)return;
      const age=(now2-a.ts)/1200;
      const r=eC*2+age*eC*8;
      const alpha=Math.max(0,(1-age)*0.8);
      ctx.beginPath();
      ctx.arc(sx2+eC/2,sy2+eC/2,r,0,Math.PI*2);
      ctx.strokeStyle=a.color+(Math.round(alpha*255).toString(16).padStart(2,"0"));
      ctx.lineWidth=2*(1-age)+0.5;
      ctx.stroke();
      if(age<0.3){
        ctx.fillStyle=a.color+(Math.round((0.3-age)*255).toString(16).padStart(2,"0"));
        ctx.fillRect(sx2,sy2,CELL,CELL);
      }
    });
  },[pixels,shields,pending,active,mode,vx,vy,unlockedSet,sectorFills,showPriceMap,showHeatmap,heatmapTick,miniSeason,animTick,surgeMode,fortifiedSectors,effCell,effVW,effVH,dailyChallenge]);

  // ── MINIMAP ────────────────────────────────────────────────────────────────
  useEffect(()=>{
    const mm=mmCvs.current;if(!mm)return;const ctx=mm.getContext("2d");
    ctx.fillStyle="#080818";ctx.fillRect(0,0,MM,MM);
    for(let sy2=0;sy2<NS;sy2++)for(let sx2=0;sx2<NS;sx2++){if(!unlockedSet.has(sectorKey(sx2,sy2))){ctx.fillStyle="rgba(0,0,0,.5)";ctx.fillRect(sx2*(MM/NS),sy2*(MM/NS),MM/NS,MM/NS);}}
    ctx.strokeStyle="rgba(0,245,255,.08)";ctx.lineWidth=1;
    for(let i=0;i<=NS;i++){const p=i*(MM/NS);ctx.beginPath();ctx.moveTo(p,0);ctx.lineTo(p,MM);ctx.stroke();ctx.beginPath();ctx.moveTo(0,p);ctx.lineTo(MM,p);ctx.stroke();}
    Object.entries(pixels).forEach(([idxStr,px])=>{if(!px?.t)return;const idx=parseInt(idxStr),gx=idx%GW,gy=Math.floor(idx/GW);ctx.fillStyle=TM[px.t]?.color||"#888";ctx.fillRect(Math.floor(gx/MMS),Math.floor(gy/MMS),1,1);});
    const now=Date.now();Object.entries(shields).forEach(([idxStr,exp])=>{if(exp<=now)return;const idx=parseInt(idxStr),gx=idx%GW,gy=Math.floor(idx/GW);ctx.fillStyle="rgba(0,245,255,0.4)";ctx.fillRect(Math.floor(gx/MMS),Math.floor(gy/MMS),1,1);});
    ctx.strokeStyle="#00F5FF";ctx.lineWidth=1.5;ctx.strokeRect(Math.floor(vx/MMS),Math.floor(vy/MMS),Math.ceil(VW/MMS),Math.ceil(VH/MMS));
    // Faction dominance on minimap — safe check
    try{
      const fs=Object.values(FACTIONS).map(f=>{
        const cnt=Object.values(pixels).filter(p=>p?.t&&getFaction(p.t)?.id===f.id).length;
        return{...f,pixels:cnt};
      }).sort((a,b)=>b.pixels-a.pixels);
      const tot=fs.reduce((a,b)=>a+b.pixels,0)||1;
      fs.forEach((f,i)=>{
        ctx.fillStyle=f.color;ctx.font="bold 7px monospace";ctx.textAlign="left";
        ctx.fillText(`${f.icon}${Math.round(f.pixels/tot*100)}%`,2,MM-2-i*9);
      });
    }catch{}
    // Remote activity flashes on minimap
    const now2=Date.now();
    mmFlashRef.current=mmFlashRef.current.filter(f=>now2-f.ts<2000);
    mmFlashRef.current.forEach(f=>{
      const age=(now2-f.ts)/2000;
      const alpha=Math.max(0,(1-age)*0.9);
      const r=2+age*6;
      ctx.beginPath();ctx.arc(f.mx,f.my,r,0,Math.PI*2);
      ctx.fillStyle=f.color+(Math.round(alpha*180).toString(16).padStart(2,"0"));
      ctx.fill();
      ctx.strokeStyle=f.color+(Math.round(alpha*255).toString(16).padStart(2,"0"));
      ctx.lineWidth=1;ctx.stroke();
    });
  },[pixels,shields,unlockedSet,vx,vy,animTick]);

  // ── MOUSE ──────────────────────────────────────────────────────────────────
  const mouseToGrid=(e)=>{const rc=cvs.current.getBoundingClientRect(),cx=(e.clientX-rc.left)*CW/rc.width,cy=(e.clientY-rc.top)*CH/rc.height,gx=vx+Math.floor(cx/effCell),gy=vy+Math.floor(cy/effCell);if(gx<0||gx>=GW||gy<0||gy>=GH)return null;return{gx,gy,idx:gy*GW+gx};};
  const pan=(dx,dy)=>{setVx(x=>Math.max(0,Math.min(GW-effVW,x+dx)));setVy(y=>Math.max(0,Math.min(GH-effVH,y+dy)));};
  const onMmClick=(e)=>{
    const rc=mmCvs.current.getBoundingClientRect();
    const mx=Math.floor((e.clientX-rc.left)*MM/rc.width);
    const my=Math.floor((e.clientY-rc.top)*MM/rc.height);
    setVx(Math.max(0,Math.min(GW-VW,mx*MMS-Math.floor(VW/2))));
    setVy(Math.max(0,Math.min(GH-VH,my*MMS-Math.floor(VH/2))));
    // Show sector zoom modal
    const sx=Math.floor(mx/MMS/SECTOR*NS);
    const sy=Math.floor(my/MMS/SECTOR*NS);
    setSectorZoom({sx:Math.max(0,Math.min(NS-1,sx)),sy:Math.max(0,Math.min(NS-1,sy))});
    setTimeout(()=>setSectorZoom(null),8000);
  };
  const rs=(x1,y1,x2,y2)=>{const s=new Set(),now=Date.now();for(let gy=Math.min(y1,y2);gy<=Math.max(y1,y2);gy++)for(let gx=Math.min(x1,x2);gx<=Math.max(x1,x2);gx++){const idx=gy*GW+gx;const sx=Math.floor(gx/SECTOR),sy=Math.floor(gy/SECTOR);if(!unlockedSet.has(sectorKey(sx,sy)))continue;const isShielded=shields[idx]&&shields[idx]>now;if(mode==="RAID"&&pixels[idx]&&isAllied(pixels[idx].t))continue;if(mode==="BUILD"?!pixels[idx]:(pixels[idx]&&pixels[idx].t!==active&&!isShielded))s.add(idx);}return s;};
  const onMD=(e)=>{
    if(!active||mode==="SHOP")return;
    const g=mouseToGrid(e);if(!g)return;
    const sx=Math.floor(g.gx/SECTOR),sy=Math.floor(g.gy/SECTOR);
    if(!unlockedSet.has(sectorKey(sx,sy))){pushToast("🔒 Locked! Fill the center sectors first.","#FF4400",3000);return;}
    const now=Date.now(),isShielded=shields[g.idx]&&shields[g.idx]>now;
    const allyBlock=mode==="RAID"&&pixels[g.idx]&&isAllied(pixels[g.idx].t);
    setDrag(true);setOrig({x:g.gx,y:g.gy,time:now});
    const ok=mode==="BUILD"?!pixels[g.idx]:(pixels[g.idx]&&pixels[g.idx].t!==active&&!isShielded&&!allyBlock);
    setPending(ok?new Set([g.idx]):new Set());
  };
  const onMM_h=(e)=>{const g=mouseToGrid(e);if(g){setHov(pixels[g.idx]?TM[pixels[g.idx].t]:null);const sx=Math.floor(g.gx/SECTOR),sy=Math.floor(g.gy/SECTOR);setHovSector({sx,sy,unlocked:unlockedSet.has(sectorKey(sx,sy)),fill:sectorFills[sectorKey(sx,sy)]||0});}if(drag&&orig){const go=mouseToGrid(e);if(go)setPending(rs(orig.x,orig.y,go.gx,go.gy));}};
  const triggerFlash=(color,shake=false)=>{setFlashColor(color);setTimeout(()=>setFlashColor(null),300);if(shake){setShakeCanvas(true);setTimeout(()=>setShakeCanvas(false),500);}};
  const isFortified=(sx,sy)=>fortifiedSectors.some(([fx,fy])=>fx===sx&&fy===sy);
  const isThemeFandom=(teamId)=>weeklyTheme.cat==="ALL"||teamId?.startsWith(weeklyTheme.cat)||TM[teamId]?.cat===weeklyTheme.cat;

  const calcCost=(pendingSet)=>{
    if(!pendingSet.size)return 0;
    let total=0;
    const groups={};
    pendingSet.forEach(idx=>{const[sx,sy]=sectorOf(idx);const k=sectorKey(sx,sy);if(!groups[k])groups[k]=[];groups[k].push(idx);});
    Object.entries(groups).forEach(([k,idxs])=>{
      const[sx,sy]=k.split(",").map(Number);
      const fill=sectorFills[k]||0;
      let price=sectorBasePrice(sx,sy)*fillMultiplier(fill);
      if(mode==="RAID")price*=2;
      if(event?.label==="CHAOS HOUR"&&mode==="RAID")price*=0.5;
      if(event?.label==="SECTOR SALE")price*=0.5;
      // Fortified sector — 3x raid cost
      if(mode==="RAID"&&isFortified(sx,sy))price*=3;
      // Weekly theme discount for matching fandoms
      if(active&&isThemeFandom(active)){
        if(mode==="RAID")price*=weeklyTheme.raidDiscount;
        else price*=weeklyTheme.claimBonus;
      }
      // Loyalty discount — 7+ days same fandom = 5% off build
      if(mode==="BUILD"&&loyaltyDays.fandom===active&&loyaltyDays.days>=7)price*=0.95;
      // Level discount — higher level = small discount
      if(playerLevel>=10)price*=0.97;
      if(playerLevel>=20)price*=0.95;
      // Daily sector challenge — 50% off for 2 hours in the challenge sector
      if(mode==="BUILD"&&dailyChallenge&&dailyChallenge.endsAt>Date.now()&&sx===dailyChallenge.sx&&sy===dailyChallenge.sy)price*=0.5;
      idxs.forEach(idx=>{
        if(mode==="BUILD"&&active){
          const gx=idx%GW,gy=Math.floor(idx/GW);
          const isAdj=pixels[(gy-1)*GW+gx]?.t===active||pixels[(gy+1)*GW+gx]?.t===active||pixels[gy*GW+(gx-1)]?.t===active||pixels[gy*GW+(gx+1)]?.t===active;
          total+=isAdj?price*0.9:price;
        }else{total+=price;}
      });
    });
    return Math.round(total*100)/100;
  };
  const requestClaim=()=>{
    if(!active||pending.size===0)return;
    if(!user){
      // Guest claiming — allow up to GUEST_MAX pixels
      if(mode==="RAID"){setAuthReason("raid");setShowAuthModal(true);return;}
      if(!guestChecked)return; // wait for fingerprint check
      const remaining=GUEST_MAX-guestPixelsUsed;
      if(remaining<=0){setAuthReason("claim");setShowAuthModal(true);return;}
      const allowed=Math.min(pending.size,remaining);
      const allowedSet=new Set(Array.from(pending).slice(0,allowed));
      const t=TM[active];
      // Store guest pixels in Supabase with fingerprint
      const fp=getFingerprint();
      supabase.from("guest_claims").upsert({fingerprint:fp,session_id:guestSessionId,pixels_used:(guestPixelsUsed+allowed),fandom_id:active,expires_at:new Date(Date.now()+86400000).toISOString()},{onConflict:"session_id"}).then(()=>{});
      // Place pixels visually
      const next={...pixels};allowedSet.forEach(idx=>{next[idx]={t:active,at:Date.now()};});
      setPixels(next);setGuestPixelsUsed(g=>g+allowed);setPending(new Set());
      if(isOnline)dbUpsertPixels(allowedSet,active,currentSeasonNum);
      // Show save prompt after placing
      setTimeout(()=>setShowGuestSavePrompt(true),1500);
      return;
    }
    const t=TM[active];const isRaid=mode==="RAID";const cost=calcCost(pending);
    const freeUsed=(!isRaid)?Math.min(freePixels,Math.floor(cost)):0;
    const bonus=pending.size>=15?Math.floor(pending.size*.3):pending.size>=10?Math.floor(pending.size*.15):0;
    // If player has no free pixels, show paywall instead of confirm
    if(!isRaid&&freePixels<=0&&rechargePixels<=0){
      setShowPaywall(true);setPaywallTab("bundles");
      setPending(new Set());
      return;
    }
    const adjCount=!isRaid?Array.from(pending).filter(idx=>{const gx=idx%GW,gy=Math.floor(idx/GW);return pixels[(gy-1)*GW+gx]?.t===active||pixels[(gy+1)*GW+gx]?.t===active||pixels[gy*GW+(gx-1)]?.t===active||pixels[gy*GW+(gx+1)]?.t===active;}).length:0;
    setConfirmPayload({count:pending.size,cost,freeUsed,isRaid,bonus,teamName:t.name,teamColor:t.color,modeLabel:isRaid?"⚔️ RAID":"🏴 CLAIM",adjCount});
    setShowConfirm(true);
  };
  const onMU=()=>{
    setDrag(false);
    if(surgeMode&&pending.size>0){
      // Surge: only keep pixels connected to existing territory (BFS flood fill)
      const myExisting=new Set(Object.entries(pixels).filter(([,v])=>v?.t===active).map(([k])=>parseInt(k)));
      const allCandidates=new Set([...myExisting,...pending]);
      // BFS from existing pixels through pending to find connected set
      const visited=new Set();
      const queue=[...myExisting];
      while(queue.length){
        const idx=queue.pop();if(visited.has(idx))continue;visited.add(idx);
        const gx=idx%GW,gy=Math.floor(idx/GW);
        [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy])=>{
          const nidx=(gy+dy)*GW+(gx+dx);
          if(allCandidates.has(nidx)&&!visited.has(nidx))queue.push(nidx);
        });
      }
      // Only keep pending pixels that are connected
      const connected=new Set([...pending].filter(idx=>visited.has(idx)));
      const disconnected=pending.size-connected.size;
      if(connected.size>0){
        setPending(connected);
        if(disconnected>0)pushToast(`⚡ SURGE! ${connected.size}px connected kept, ${disconnected}px disconnected lost!`,"#FF2D78",4000);
        else pushToast(`⚡ SURGE! All ${connected.size}px connected — PERFECT!`,"#FF2D78",3000);
        requestClaim();
      }else{
        pushToast("⚡ SURGE FAILED — no pixels connected to your territory!","#FF4400",3000);
        setPending(new Set());
      }
      setSurgeMode(false);setSurgePixels(new Set());
      return;
    }
    if(pending.size>0){requestClaim();return;}
    // Single click with no drag — show pixel history
    if(orig&&Date.now()-orig.time<200){
      const g=mouseToGrid({clientX:orig.x*CELL,clientY:orig.y*CELL});
      const idx=orig.y*GW+orig.x;
      const px=pixels[idx];
      if(px){
        if(isOnline&&supabase){
          supabase.from("pixel_history").select("*").eq("idx",idx).eq("season_num",currentSeasonNum).order("created_at",{ascending:false}).limit(8)
            .then(({data})=>setPixelHistory({pixel:px,history:data||[],gx:orig.x,gy:orig.y}));
        }else{
          setPixelHistory({pixel:px,history:[],gx:orig.x,gy:orig.y});
        }
      }
    }
    setOrig(null);
  };
  const onML=()=>{setHov(null);setHovSector(null);if(drag){setDrag(false);if(pending.size>0)requestClaim();}};

  // ── AUTH GATE ─────────────────────────────────────────────────────────────
  const requireAuth=(reason="join")=>{
    if(!user){setAuthReason(reason);setShowAuthModal(true);return false;}
    return true;
  };
  // ── IMPROVED MOBILE TOUCH ─────────────────────────────────────────────────
  const touchStateRef=useRef({lastDist:null,lastMidX:null,lastMidY:null,isPinch:false,panStartX:null,panStartY:null,panVx:null,panVy:null});
  const onTouchStart=(e)=>{
    e.preventDefault();
    if(e.touches.length===2){
      // Pinch start
      const t0=e.touches[0],t1=e.touches[1];
      touchStateRef.current.lastDist=Math.hypot(t1.clientX-t0.clientX,t1.clientY-t0.clientY);
      touchStateRef.current.lastMidX=(t0.clientX+t1.clientX)/2;
      touchStateRef.current.lastMidY=(t0.clientY+t1.clientY)/2;
      touchStateRef.current.isPinch=true;
      setPending(new Set());
      return;
    }
    touchStateRef.current.isPinch=false;
    const t=e.touches[0];
    // Long press detection for pan mode
    touchStateRef.current.panStartX=t.clientX;
    touchStateRef.current.panStartY=t.clientY;
    touchStateRef.current.panVx=vxRef.current;
    touchStateRef.current.panVy=vyRef.current;
    onMD({clientX:t.clientX,clientY:t.clientY,preventDefault:()=>{}});
  };
  const onTouchMove=(e)=>{
    e.preventDefault();
    if(e.touches.length===2){
      // Pinch-zoom = pan (zoom out/in by moving viewport)
      const t0=e.touches[0],t1=e.touches[1];
      const dist=Math.hypot(t1.clientX-t0.clientX,t1.clientY-t0.clientY);
      const midX=(t0.clientX+t1.clientX)/2;
      const midY=(t0.clientY+t1.clientY)/2;
      const ts=touchStateRef.current;
      if(ts.lastDist){
        const dx=(midX-ts.lastMidX)/CELL;
        const dy=(midY-ts.lastMidY)/CELL;
        pan(-Math.round(dx),-Math.round(dy));
      }
      ts.lastDist=dist;ts.lastMidX=midX;ts.lastMidY=midY;
      return;
    }
    if(touchStateRef.current.isPinch)return;
    const t=e.touches[0];
    const ts=touchStateRef.current;
    // If moved far without selecting pixels = pan
    const dx=t.clientX-ts.panStartX,dy=t.clientY-ts.panStartY;
    if(!drag&&Math.hypot(dx,dy)>30){
      // Switch to pan mode
      setVx(Math.max(0,Math.min(GW-VW,ts.panVx-Math.round(dx/CELL))));
      setVy(Math.max(0,Math.min(GH-VH,ts.panVy-Math.round(dy/CELL))));
    }else{
      onMM_h({clientX:t.clientX,clientY:t.clientY});
    }
  };
  const onTouchEnd=(e)=>{
    e.preventDefault();
    if(touchStateRef.current.isPinch){touchStateRef.current.isPinch=false;return;}
    onMU();
  };

  // ── CLAIM ──────────────────────────────────────────────────────────────────
  const handleClaim=async()=>{
    if(!active||pending.size===0)return;
    // Rate limiting — min 2s between claims
    const now2=Date.now();if(now2-lastClaimRef.current<2000){pushToast("⏳ Slow down!","#FF4400",2000);return;}
    lastClaimRef.current=now2;
    const t=TM[active];const isRaid=mode==="RAID";
    const bonus=pending.size>=15?Math.floor(pending.size*.3):pending.size>=10?Math.floor(pending.size*.15):0;
    const cost=calcCost(pending);const freeUsed=(!isRaid)?Math.min(freePixels,Math.floor(cost)):0;
    const now=Date.now();const next={...pixels};const newShields={...shields};
    pending.forEach(idx=>{next[idx]={t:active,at:now};newShields[idx]=now+24*60*60*1000;});
    if(bonus>0){let added=0;for(let dy=0;dy<VH&&added<bonus;dy++)for(let dx=0;dx<VW&&added<bonus;dx++){const idx=(vy+dy)*GW+(vx+dx);const sx=Math.floor((vx+dx)/SECTOR),sy=Math.floor((vy+dy)/SECTOR);if(unlockedSet.has(sectorKey(sx,sy))&&!next[idx]){next[idx]={t:active,at:now};added++;}}}
    setPixels(next);setMyPixels(p=>p+pending.size+bonus);setShields(newShields);
    try{localStorage.setItem("pow_shields",JSON.stringify(newShields));}catch{}
    if(freeUsed>0)syncFreePixels(freePixels-freeUsed);
    // Use recharge pixels if available
    if(!isRaid&&rechargePixels>0){
      const useRecharge=Math.min(rechargePixels,Math.ceil(cost-freeUsed));
      if(useRecharge>0){
        setRechargePixels(r=>{const next2=Math.max(0,r-useRecharge);localStorage.setItem("pow_recharge",String(next2));return next2;});
        pushToast(`⏰ Used ${useRecharge} recharged pixel${useRecharge>1?"s":""}!`,"#00FF88",2000);
      }
    }
    // Earn XP — 1 per pixel claimed/raided
    const xpEarned=(toClaim.size+bonus)*(hasSeasonPass?2:1); // Double XP with Season Pass
    setXp(prevXp=>{
      const newXp=prevXp+xpEarned;
      localStorage.setItem("pow_xp",String(newXp));
      const prevLevel=getLevel(prevXp);
      const newLevel=getLevel(newXp);
      if(newLevel>prevLevel){
        setPlayerLevel(newLevel);
        localStorage.setItem("pow_level",String(newLevel));
        setShowLevelUp(newLevel);
        setTimeout(()=>setShowLevelUp(null),4000);
        // Level up rewards
        const rechargeBonus=500;
        setWarChest(g=>{const next2=g+rechargeBonus;localStorage.setItem("pow_war_chest",String(next2));return next2;});
        pushToast(`🎉 LEVEL UP! You're now Level ${newLevel} ${LEVEL_BADGES[newLevel]||"⭐"} +500💰 gold!`,"#FFD700",6000);
      }
      return newXp;
    });
    // 1 gold per pixel earned in War Chest
    setWarChest(g=>{const next2=g+xpEarned;localStorage.setItem("pow_war_chest",String(next2));return next2;});
    const toClaim=new Set(pending);setPending(new Set());
    if(isOnline)await dbUpsertPixels(toClaim,active,currentSeasonNum);else{try{localStorage.setItem("pw2k_v2",JSON.stringify(next));}catch{}}
    toClaim.forEach(idx=>trackHeatmap(idx));
    trackMission(isRaid?"raid":"claim", toClaim.size+bonus);
    if(referralCode&&!localStorage.getItem("pow_ref_used")){
      localStorage.setItem("pow_ref_used","1");
      syncFreePixels(freePixels+10);
      pushToast("🎁 Welcome bonus! +10 free pixels for joining via referral!","#FFD700",6000);
    }
    // Particle effects
    const claimArr=Array.from(toClaim);
    const sample=claimArr.filter((_,i)=>i%Math.max(1,Math.floor(claimArr.length/6))===0).slice(0,6);
    sample.forEach(idx=>spawnParticles(t.color,idx%GW,Math.floor(idx/GW),isRaid?14:9,isRaid));
    if(claimArr.length>0){const mid=claimArr[Math.floor(claimArr.length/2)];spawnShockwave(t.color,mid%GW,Math.floor(mid/GW));}
    if(isRaid){triggerFlash("#FF0000",true);pushToast(`⚔️ RAID! ${toClaim.size}px conquered!`,"#FF4400",4000);
      if(toClaim.size>=20){const raider=TM[active];postToDiscord({title:`⚔️ MASSIVE RAID!`,description:`**${raider?.name||active}** just raided **${toClaim.size} pixels** in one strike!\n\nThis is war. Join the battle now.`,color:0xFF4400,fields:[{name:"Raider",value:raider?.name||active,inline:true},{name:"Pixels Stolen",value:`${toClaim.size}px`,inline:true}],url:"https://www.pixelsofwar.com",footer:{text:"Pixels of War • pixelsofwar.com"},timestamp:new Date().toISOString()});}
    }else{triggerFlash(t.color);spawnConfetti(t.color,Math.min(30,toClaim.size+10));}
    if(freeUsed>0)pushToast(`🎁 ${freeUsed} free pixels used!`,"#FFD700",3000);
    if(bonus>0){setLastCombo({count:bonus,color:t.color});setTimeout(()=>setLastCombo(null),3000);spawnConfetti(t.color,40);pushToast(`🔥 COMBO! +${bonus} FREE!`,"#FFD700",4000);}
    else pushToast(`🏴 ${toClaim.size}px for ${t.name}! €${(cost-freeUsed).toFixed(2)}`,"#00F5FF",3000);
    setFeed(f=>[{id:Date.now(),icon:isRaid?"⚔️":"🏴",team:t.name,msg:`${isRaid?"RAIDED":"claimed"} ${toClaim.size}px (€${cost.toFixed(2)})`,color:t.color,ts:new Date().toLocaleTimeString("en",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"}),isMe:true},...f].slice(0,40));
  };

  // ── POWER-UPS ──────────────────────────────────────────────────────────────
  const usePowerup=async(pu)=>{
    const next={...pixels};const newShields={...shields};const now=Date.now();const toDelete=[];const toUpsert=[];
    if(pu.id==="bomb"){const ex=randInt(vx,vx+100),ey=randInt(vy,vy+60);let d=0;for(let dy=0;dy<8;dy++)for(let dx=0;dx<8;dx++){const idx=(ey+dy)*GW+(ex+dx);if(next[idx]&&next[idx].t!==active&&!(shields[idx]&&shields[idx]>now)&&!isAllied(next[idx].t)){toDelete.push(idx);delete next[idx];delete newShields[idx];d++;}}spawnShockwave("#FF4400",ex+4,ey+4);spawnParticles("#FF4400",ex+4,ey+4,20,true);triggerFlash("#FF4400",true);pushToast(`💣 BOMB! Destroyed ${d} pixels!`,"#FF4400",5000);}
    else if(pu.id==="storm"){let cl=0;for(let dy=0;dy<VH&&cl<50;dy++)for(let dx=0;dx<VW&&cl<50;dx++){const idx=(vy+dy)*GW+(vx+dx);const sx=Math.floor((vx+dx)/SECTOR),sy=Math.floor((vy+dy)/SECTOR);if(unlockedSet.has(sectorKey(sx,sy))&&!next[idx]){next[idx]={t:active,at:now};newShields[idx]=now+24*60*60*1000;toUpsert.push(idx);cl++;}}spawnParticles(TM[active]?.color||"#FFCC00",vx+VW/2,vy+VH/2,30,true);triggerFlash("#FFCC00");pushToast(`⚡ STORM! ${cl}px claimed!`,"#FFCC00",5000);}
    else if(pu.id==="fortress"){const fp=now+60*60*1000;const myPx=Object.entries(pixels).filter(([,v])=>v?.t===active).map(([k])=>parseInt(k)).slice(-30);myPx.forEach(idx=>{newShields[idx]=Math.max(newShields[idx]||0,fp);});spawnParticles("#00AAFF",vx+VW/2,vy+VH/2,16);triggerFlash("#00AAFF");pushToast(`🛡️ FORTRESS! ${myPx.length}px shielded!`,"#00AAFF",6000);}
    else if(pu.id==="snipe"){const e=Object.entries(next).find(([k,v])=>v?.t&&v.t!==active&&!(shields[k]&&shields[k]>now)&&!isAllied(v.t));if(e){const victim=TM[next[e[0]].t];toDelete.push(parseInt(e[0]));next[parseInt(e[0])]={t:active,at:now};toUpsert.push(parseInt(e[0]));newShields[parseInt(e[0])]=now+24*60*60*1000;spawnParticles("#FF2D78",parseInt(e[0])%GW,Math.floor(parseInt(e[0])/GW),12);pushToast(`🎯 SNIPED from ${victim?.name}!`,"#FF2D78",5000);triggerFlash("#FF2D78");}else pushToast("🎯 No unshielded targets!","#FF2D78",3000);}
    else if(pu.id==="airdrop"){const sx=vx+randInt(0,VW-16),sy=vy+randInt(0,VH-16);let cl=0;for(let dy=0;dy<15;dy++)for(let dx=0;dx<15;dx++){const idx=(sy+dy)*GW+(sx+dx);const ssX=Math.floor((sx+dx)/SECTOR),ssY=Math.floor((sy+dy)/SECTOR);if(unlockedSet.has(sectorKey(ssX,ssY))&&!next[idx]){next[idx]={t:active,at:now};newShields[idx]=now+24*60*60*1000;toUpsert.push(idx);cl++;}}spawnShockwave("#C8FF00",sx+7,sy+7);spawnParticles("#C8FF00",sx+7,sy+7,18,true);triggerFlash("#C8FF00");pushToast(`🪂 AIRDROP! ${cl}px claimed!`,"#C8FF00",5000);}
    else if(pu.id==="nuke"){const ex=randInt(0,GW-21),ey=randInt(0,GH-21);let d=0;for(let dy=0;dy<20;dy++)for(let dx=0;dx<20;dx++){const idx=(ey+dy)*GW+(ex+dx);if(next[idx]&&next[idx].t!==active&&!(shields[idx]&&shields[idx]>now)&&!isAllied(next[idx].t)){toDelete.push(idx);delete next[idx];delete newShields[idx];d++;}}spawnShockwave("#FF0000",vx+VW/2,vy+VH/2);spawnShockwave("#FF4400",vx+VW/2,vy+VH/2);spawnParticles("#FF0000",vx+VW/2,vy+VH/2,30,true);triggerFlash("#FF0000",true);pushToast(`☢️ NUKE! Obliterated ${d} pixels!`,"#FF0000",6000);}
    else if(pu.id==="renew"){let r=0;const myPx=Object.entries(next).filter(([,v])=>v?.t===active).sort((a,b)=>a[1].at-b[1].at).slice(0,50);myPx.forEach(([k])=>{if(next[k]){next[k]={...next[k],at:now};toUpsert.push(parseInt(k));r++;}});pushToast(`♻️ RENEWED ${r} pixels!`,"#00FFAA",5000);triggerFlash("#00FFAA");}
    else if(pu.id==="double"){const win=Math.random()>.5;pushToast(win?"✨ WIN! Bonus territory!":"✨ LOST 💀","#BB88FF",5000);triggerFlash("#BB88FF",win);}
    else if(pu.id==="surge"){
      // Surge mode — player drags pixels, they only stick if connected to own territory
      setSurgeMode(true);setSurgePixels(new Set());
      pushToast("⚡ SURGE ACTIVE! Drag pixels connected to your territory — release to claim. Disconnected pixels vanish!","#FF2D78",5000);
      triggerFlash("#FF2D78");
      // Auto-cancel after 15 seconds
      setTimeout(()=>{setSurgeMode(false);setSurgePixels(new Set());},15000);
      return; // don't execute normal powerup flow
    }
    else if(pu.id==="goldraid"){
      // War Chest gold raid — spend 20 gold to steal 20 random enemy pixels
      if(warChest<20){pushToast("Need 20💰 gold! Earn more by holding territory.","#FFD700",3000);return;}
      const enemies=Object.entries(next).filter(([,v])=>v?.t&&v.t!==active&&!isAllied(v.t));
      if(enemies.length===0){pushToast("No enemy pixels to raid!","#FF4400",3000);return;}
      const targets=enemies.sort(()=>Math.random()-.5).slice(0,20);
      targets.forEach(([idx])=>{next[parseInt(idx)]={t:active,at:now};toUpsert.push(parseInt(idx));});
      const newGold=warChest-20;setWarChest(newGold);localStorage.setItem("pow_war_chest",String(newGold));
      spawnParticles("#FFD700",vx+VW/2,vy+VH/2,20,true);triggerFlash("#FFD700",true);
      pushToast(`💰 WAR CHEST RAID! Stole ${targets.length}px! (${newGold}💰 left)`,"#FFD700",5000);
    }
    setPixels(next);setShields(newShields);try{localStorage.setItem("pow_shields",JSON.stringify(newShields));}catch{}
    trackMission("powerup",1);
    if(isOnline){if(toDelete.length)await dbDeletePixels(toDelete,currentSeasonNum);if(toUpsert.length)await dbUpsertPixels(new Set(toUpsert),active,currentSeasonNum);}else{try{localStorage.setItem("pw2k_v2",JSON.stringify(next));}catch{}}
  };

  const resetGrid=async()=>{if(isOnline)await dbClearSeason(currentSeasonNum);setPixels({});setShields({});setMyPixels(0);setFreePixels(0);setStreakData({days:0,last:"",total:0});setDailyInfo(null);setPending(new Set());setActive(null);setUnlockedSectors(INIT_SECTORS);setAlliances([]);setWars([]);try{["pw2k","pw2k_v2","pow_shields","pow_free","pow_streak","pow_sectors"].forEach(k=>localStorage.removeItem(k));}catch{}pushToast("🔄 Grid reset!","#00F5FF",3000);setShowReset(false);};

  // ── DERIVED ────────────────────────────────────────────────────────────────
  const subArrFull=useMemo(()=>{const subs=selCat==="All"?[...new Set(CAT.map(e=>e.sub))]:CAT.filter(e=>e.cat===selCat).map(e=>e.sub);return["All",...subs];},[selCat]);
  useEffect(()=>setSelSub("All"),[selCat]);
  const vis=useMemo(()=>{
    let list;
    if(q.trim().length>1){const lq=q.toLowerCase();list=ALL.filter(t=>t.name.toLowerCase().includes(lq));}
    else{list=ALL.filter(t=>{if(selCat!=="All"&&t.cat!==selCat)return false;if(selSub!=="All"&&t.sub!==selSub)return false;return true;});}
    // Sort by pixel count descending so popular fandoms appear first
    return list.sort((a,b)=>{const pa=Object.values(pixels).filter(p=>p?.t===a.id).length;const pb=Object.values(pixels).filter(p=>p?.t===b.id).length;return pb-pa;});
  },[selCat,selSub,q,pixels]);
  const board=useMemo(()=>{const cnt={};Object.values(pixels).forEach(p=>{if(p?.t)cnt[p.t]=(cnt[p.t]||0)+1;});return Object.entries(cnt).map(([id,count])=>({...(TM[id]||{}),id,count,trend:territoryTrend[id]||0})).filter(t=>t.name).sort((a,b)=>b.count-a.count).slice(0,20);},[pixels,territoryTrend]);

  // Faction standings — aggregate pixel counts by faction
  const factionStandings=useMemo(()=>{
    const counts={GAMING:0,ANIME:0,CULTURE:0};
    Object.values(pixels).forEach(p=>{
      if(!p?.t)return;
      const f=getFaction(p.t);
      if(f)counts[f.id]=(counts[f.id]||0)+1;
    });
    return Object.values(FACTIONS).map(f=>({...f,pixels:counts[f.id]||0})).sort((a,b)=>b.pixels-a.pixels);
  },[pixels]);
  const totalSold=Object.keys(pixels).length;
  const at=active?TM[active]:null;
  const modeColor=mode==="BUILD"?"#00F5FF":mode==="RAID"?"#FF4400":"#C8FF00";
  const selAccent=selCat!=="All"?CAT_ACCENT[selCat]:"#00F5FF";
  const myRank=getRank(myPixels);
  const pendingCost=calcCost(pending);
  const freeUsedPreview=mode==="BUILD"?Math.min(freePixels,Math.floor(pendingCost)):0;
  const currentTheme=THEMES[season.theme]||THEMES[0];
  const decayStats=useMemo(()=>{const now=Date.now();let warn=0,expired=0;Object.values(pixels).forEach(p=>{if(!p?.at)return;const age=now-p.at;if(age>DECAY_EXPIRE*86400000)expired++;else if(age>DECAY_WARN*86400000)warn++;});return{warn,expired};},[pixels]);

  // Decay alert — show once per day when pixels are fading
  useEffect(()=>{
    if(!active||decayStats.warn===0)return;
    const key=`pow_decay_alert_${active}_${new Date().toDateString()}`;
    if(localStorage.getItem(key))return;
    setTimeout(()=>{setShowDecayAlert(true);localStorage.setItem(key,"1");},3000);
  },[active,decayStats.warn]);

  // Rival system — find most frequent war opponent
  useEffect(()=>{
    if(!active||wars.length===0){setRivalId(null);return;}
    const freq={};
    wars.forEach(w=>{
      if(w.attacker===active&&w.defender!==active)freq[w.defender]=(freq[w.defender]||0)+1;
      if(w.defender===active&&w.attacker!==active)freq[w.attacker]=(freq[w.attacker]||0)+1;
    });
    feed.forEach(f=>{
      if(f.isRaid&&f.team&&f.team!==TM[active]?.name){
        const t=Object.values(TM).find(x=>x.name===f.team);
        if(t)freq[t.id]=(freq[t.id]||0)+0.5;
      }
    });
    const top=Object.entries(freq).sort((a,b)=>b[1]-a[1])[0];
    setRivalId(top?top[0]:null);
  },[active,wars,feed]);

  // Weekly season report — show on Monday once per week
  useEffect(()=>{
    if(!active||loading)return;
    const wk=getWeekNum();
    const key=`pow_weekly_report_${wk}`;
    if(localStorage.getItem(key))return;
    const now=new Date();
    const isMonday=now.getDay()===1;
    const devOverride=new URLSearchParams(window.location.search).has("weekly");
    if(!isMonday&&!devOverride)return; // Monday only (or ?weekly=1 for testing)
    const prevKey=`pow_weekly_snapshot_${wk-1}`;
    const prev=JSON.parse(localStorage.getItem(prevKey)||"null");
    const warCount=wars.filter(w=>w.attacker===active||w.defender===active).length;
    const allianceCount=alliances.filter(a=>(a.proposer===active||a.target===active)&&a.status==="active").length;
    const completedMissions=Object.values(missionProgress).filter(m=>m?.claimed).length;
    const stats={
      fandom:TM[active]?.name||active,
      color:TM[active]?.color||"#00F5FF",
      pixels:myPixels,
      prevPixels:prev?.pixels||0,
      rank:myRank.name,
      rankIcon:myRank.icon,
      streak:streakData.days,
      wars:warCount,
      alliances:allianceCount,
      missions:completedMissions,
      week:wk,
    };
    // Save current as snapshot for next week
    localStorage.setItem(`pow_weekly_snapshot_${wk}`,JSON.stringify(stats));
    localStorage.setItem(key,"1");
    setWeeklyStats(stats);
    setTimeout(()=>setShowWeeklyReport(true),2000);
  },[active,loading]);
  const miniSeasonLeader=useMemo(()=>{if(!miniSeason)return null;const{sector_x:msx,sector_y:msy}=miniSeason;const cnt={};for(let py=msy*SECTOR;py<(msy+1)*SECTOR;py++)for(let px2=msx*SECTOR;px2<(msx+1)*SECTOR;px2++){const p=pixels[py*GW+px2];if(p?.t)cnt[p.t]=(cnt[p.t]||0)+1;}const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];return top?{id:top[0],name:TM[top[0]]?.name||"?",color:TM[top[0]]?.color||"#888",count:top[1]}:null;},[pixels,miniSeason]);
  const miniSeasonDaysLeft=miniSeason?Math.max(0,Math.ceil((new Date(miniSeason.end_date)-Date.now())/86400000)):0;
  const bannerOffset=145+(miniSeason?30:0)+(pendingAlliances.length>0?30:0)+(showNotifBanner&&notifPermission==="default"?36:0);

  // Sector leaderboard
  const sectorLeaderboard=useMemo(()=>{
    const data={};
    Object.entries(pixels).forEach(([idxStr,px])=>{
      if(!px?.t)return;
      const idx=parseInt(idxStr);const gx=idx%GW;const gy=Math.floor(idx/GW);
      const sx=Math.floor(gx/SECTOR),sy=Math.floor(gy/SECTOR);
      const k=sectorKey(sx,sy);
      if(!data[k])data[k]={sx,sy,counts:{}};
      data[k].counts[px.t]=(data[k].counts[px.t]||0)+1;
    });
    return Object.entries(data).map(([k,{sx,sy,counts}])=>{
      const top=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
      const total=Object.values(counts).reduce((a,b)=>a+b,0);
      return{k,sx,sy,leader:top?TM[top[0]]:null,leaderPx:top?top[1]:0,total,contested:Object.keys(counts).length>1};
    }).sort((a,b)=>b.total-a.total);
  },[pixels]);


  // Confetti on claim
  const spawnConfetti=useCallback((color,count=22)=>{
    for(let i=0;i<count;i++){
      const el=document.createElement("div");
      const angle=(Math.PI*2*i/count)+Math.random()*.5;
      const dist=40+Math.random()*60;
      const size=3+Math.random()*5;
      const isCircle=Math.random()>.5;
      el.style.cssText=`position:fixed;width:${size}px;height:${size}px;background:${color};border-radius:${isCircle?"50%":"2px"};left:50%;top:45%;pointer-events:none;z-index:400;animation:confettiFall ${.6+Math.random()*.6}s ease-out forwards;--cx:${Math.cos(angle)*dist}px;--cy:${Math.sin(angle)*dist}px`;
      document.body.appendChild(el);setTimeout(()=>el.remove(),1400);
    }
  },[]);

  // Rank-up notification
  const prevRankRef=useRef(null);
  useEffect(()=>{
    const rank=getRank(myPixels);
    if(prevRankRef.current&&prevRankRef.current!==rank.name&&myPixels>0){
      pushToast(`${rank.icon} RANK UP! You are now ${rank.name}!`,rank.color,6000);
      spawnConfetti(rank.color,40);
    }
    prevRankRef.current=rank.name;
  },[myPixels]);
  useEffect(()=>{
    if(board.length===0)return;
    const prev=prevBoardRef.current;
    if(prev.length>0){
      board.forEach((team,newRank)=>{
        const prevRank=prev.findIndex(t=>t.id===team.id);
        if(prevRank>newRank&&newRank===0)pushToast(`👑 ${team.name} TAKES #1!`,team.color,6000);
        else if(prevRank>0&&newRank===0)pushToast(`📈 ${team.name} moved to #1!`,team.color,5000);
        else if(prevRank>newRank&&prevRank-newRank>=2)pushToast(`📈 ${team.name} up to #${newRank+1}!`,team.color,4000);
      });
    }
    prevBoardRef.current=[...board];
  },[board]);


  // ── RENDER ─────────────────────────────────────────────────────────────────
  return(
    <div style={{background:"#040408",minHeight:"100vh",fontFamily:"'Rajdhani',sans-serif",color:"#e0e8ff",userSelect:"none",position:"relative",overflow:"hidden"}}>
      {/* Animated background orbs */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        {[{c:"#00F5FF",x:"10%",y:"20%",s:300,d:"8s"},{c:"#FF4400",x:"85%",y:"60%",s:250,d:"12s"},{c:"#C8FF00",x:"50%",y:"80%",s:200,d:"10s"},{c:at?.color||"#9747FF",x:"70%",y:"15%",s:280,d:"9s"}].map((o,i)=>(
          <div key={i} style={{position:"absolute",left:o.x,top:o.y,width:o.s,height:o.s,borderRadius:"50%",background:`radial-gradient(circle,${rgba(o.c,.06)} 0%,transparent 70%)`,animation:`bgDrift ${o.d} ease-in-out infinite`,animationDelay:`${i*2}s`,transform:"translate(-50%,-50%)"}}/>
        ))}
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,245,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,.015) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
      </div>
      <style>{`
        @keyframes slideDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:none}}
        @keyframes pop{0%{transform:scale(.85);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes raidSlide{0%{transform:translateY(-30px) scale(.95);opacity:0}50%{transform:translateY(4px) scale(1.02)}100%{transform:translateY(0) scale(1);opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes sectorPop{0%{transform:scale(0);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        @keyframes raid{0%{background:rgba(255,50,0,.35)}100%{background:transparent}}
        @keyframes particleBurst{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--pdx),var(--pdy)) scale(0);opacity:0}}
        @keyframes shockwaveExp{0%{transform:scale(1);opacity:.9;box-shadow:0 0 8px currentColor}100%{transform:scale(22);opacity:0}}
        @keyframes bgDrift{0%,100%{transform:translateY(0) translateX(0) rotate(0deg);opacity:.4}33%{transform:translateY(-18px) translateX(8px) rotate(120deg);opacity:.7}66%{transform:translateY(10px) translateX(-6px) rotate(240deg);opacity:.3}}
        @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        @keyframes confettiFall{0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(var(--cx),calc(var(--cy) + 80px)) rotate(540deg);opacity:0}}
        .chip:hover{filter:brightness(1.4)!important}.tbtn:hover{filter:brightness(1.15);transform:translateY(-1px)}.pubtn:hover{filter:brightness(1.2);transform:scale(1.02)}.nav-btn:hover{background:rgba(255,255,255,.12)!important}
        ::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-thumb{background:#222240;border-radius:2px}*{box-sizing:border-box}input::placeholder{color:#2a2a4a}
      `}</style>

      {flashColor&&<div style={{position:"fixed",inset:0,background:rgba(flashColor,.22),zIndex:50,pointerEvents:"none",animation:"raid .3s ease forwards"}}/>}

      {/* TOASTS — centered at top, above canvas */}
      <div style={{position:"fixed",top:100,left:"50%",transform:"translateX(-50%)",zIndex:200,display:"flex",flexDirection:"column",gap:5,pointerEvents:"none",alignItems:"center",width:"auto",maxWidth:"60vw"}}>
        {toasts.map(t=><div key={t.id} style={{background:`linear-gradient(135deg,${rgba(t.color,.18)},${rgba(t.color,.07)})`,border:`1px solid ${rgba(t.color,.6)}`,borderRadius:10,padding:"7px 18px",fontSize:11,fontWeight:700,color:t.color,fontFamily:"'Orbitron',monospace",animation:"slideDown .3s cubic-bezier(.34,1.56,.64,1)",lineHeight:1.4,backdropFilter:"blur(14px)",boxShadow:`0 4px 24px ${rgba(t.color,.25)}`,whiteSpace:"nowrap"}}>{t.msg}</div>)}
      </div>

      {/* RAID ALERT */}
      {raidAlert&&<div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",zIndex:500,animation:"raidSlide .4s cubic-bezier(.34,1.56,.64,1)",pointerEvents:"all",minWidth:320,maxWidth:"92vw"}}>
        <div style={{background:"rgba(4,4,12,.97)",border:"2px solid #FF4400",borderRadius:14,padding:"16px 20px",boxShadow:"0 0 50px rgba(255,68,0,.5),0 0 20px rgba(255,68,0,.2)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{fontSize:28,animation:"pulse .5s infinite"}}>⚔️</span>
            <div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:"#FF4400",letterSpacing:2}}>TERRITORY UNDER ATTACK!</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.5)",marginTop:3}}>
                <span style={{color:raidAlert.attackerColor,fontWeight:700}}>{raidAlert.attacker}</span> is raiding your pixels!
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setVx(Math.max(0,raidAlert.sectorX*SECTOR-40));setVy(Math.max(0,raidAlert.sectorY*SECTOR-30));setMode("RAID");setRaidAlert(null);}} style={{flex:2,padding:"9px",background:"linear-gradient(90deg,#FF4400,#FF0000)",border:"none",color:"#fff",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:10,letterSpacing:1}}>⚔️ DEFEND NOW →</button>
            <button onClick={()=>setRaidAlert(null)} style={{flex:1,padding:"9px",background:"transparent",border:"1px solid #3a3a5a",color:"#5a5a7a",borderRadius:6,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9}}>IGNORE</button>
          </div>
        </div>
      </div>}

      {/* COMBO SPLASH */}
      {lastCombo&&<div style={{position:"fixed",top:"36%",left:"50%",transform:"translateX(-50%)",zIndex:300,textAlign:"center",animation:"pop .4s cubic-bezier(.34,1.56,.64,1)",pointerEvents:"none"}}>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:34,fontWeight:900,color:lastCombo.color,textShadow:`0 0 30px ${lastCombo.color}`,letterSpacing:3}}>🔥 COMBO!</div>
      </div>}

      {/* NEW SECTOR */}
      {newSectorAlert&&<div style={{position:"fixed",top:"30%",left:"50%",transform:"translateX(-50%)",zIndex:301,textAlign:"center",animation:"sectorPop .5s cubic-bezier(.34,1.56,.64,1)",pointerEvents:"none",background:"rgba(4,4,12,.92)",border:"2px solid #C8FF00",borderRadius:16,padding:"24px 36px",boxShadow:"0 0 60px rgba(200,255,0,.3)"}}>
        <div style={{fontSize:48,marginBottom:8}}>🔓</div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:20,fontWeight:900,color:"#C8FF00",letterSpacing:3}}>{newSectorAlert.count} SECTORS UNLOCKED!</div>
      </div>}

      {/* CONFIRM CLAIM MODAL */}
      {showConfirm&&confirmPayload&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(16px)"}} onClick={e=>e.target===e.currentTarget&&(setShowConfirm(false),setPending(new Set()))}>
        <div style={{background:"rgba(9,9,30,.9)",border:`1px solid ${rgba(confirmPayload.teamColor,.5)}`,borderRadius:16,padding:"28px 26px",width:380,maxWidth:"94vw",textAlign:"center",animation:"pop .3s cubic-bezier(.34,1.56,.64,1)",backdropFilter:"blur(20px)",boxShadow:`0 0 60px ${rgba(confirmPayload.teamColor,.15)},0 20px 40px rgba(0,0,0,.5)`}}>
          <div style={{fontSize:36,marginBottom:10}}>{confirmPayload.isRaid?"⚔️":"🏴"}</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:15,fontWeight:900,color:confirmPayload.teamColor,letterSpacing:2,marginBottom:4}}>{confirmPayload.modeLabel}</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.35)",marginBottom:18}}>for {confirmPayload.teamName}</div>
          <div style={{background:rgba(confirmPayload.teamColor,.08),border:`1px solid ${rgba(confirmPayload.teamColor,.2)}`,borderRadius:10,padding:"16px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"rgba(255,255,255,.4)"}}>Pixels</span><span style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:confirmPayload.teamColor}}>{confirmPayload.count}px</span></div>
            {confirmPayload.adjCount>0&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"rgba(255,255,255,.4)"}}>Territory bonus (-10%)</span><span style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:900,color:"#00FF88"}}>🗺️ {confirmPayload.adjCount}px adj.</span></div>}
            {loyaltyDays.fandom===active&&loyaltyDays.days>=7&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"rgba(255,255,255,.4)"}}>Loyalty discount (-5%)</span><span style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:900,color:"#FFD700"}}>🎖️ {loyaltyDays.days}d fan</span></div>}
            {playerLevel>=10&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"rgba(255,255,255,.4)"}}>Level {playerLevel} bonus</span><span style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:900,color:"#FFD700"}}>{LEVEL_BADGES[playerLevel]||"⭐"} -{playerLevel>=20?"5":"3"}%</span></div>}
            {confirmPayload.freeUsed>0&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"rgba(255,255,255,.4)"}}>Free pixels</span><span style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:900,color:"#FFD700"}}>-{confirmPayload.freeUsed} 🎁</span></div>}
            {confirmPayload.bonus>0&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"rgba(255,255,255,.4)"}}>Combo bonus</span><span style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:900,color:"#FFD700"}}>+{confirmPayload.bonus} 🔥</span></div>}
            <div style={{borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:8,display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"rgba(255,255,255,.4)"}}>Total cost</span><span style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,color:"#C8FF00"}}>€{(confirmPayload.cost-confirmPayload.freeUsed).toFixed(2)}</span></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setShowConfirm(false);setPending(new Set());}} style={{flex:1,padding:"11px",background:"transparent",border:"1px solid #1a1a2e",color:"#5a5a7a",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:700,fontSize:10}}>CANCEL</button>
            <button onClick={()=>{setShowConfirm(false);handleClaim();}} style={{flex:2,padding:"11px",background:`linear-gradient(90deg,${confirmPayload.isRaid?"#FF4400,#FF0000":"#00F5FF,"+confirmPayload.teamColor})`,border:"none",color:"#040408",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:11,letterSpacing:1}}>CONFIRM {confirmPayload.modeLabel} →</button>
          </div>
        </div>
      </div>}

      {/* WAR DECLARATION MODAL */}
      {showWarModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(16px)"}} onClick={e=>e.target===e.currentTarget&&setShowWarModal(false)}>
        <div style={{background:"rgba(9,9,30,.92)",border:"1px solid rgba(255,68,0,.6)",borderRadius:16,padding:"28px 26px",width:400,maxWidth:"94vw",animation:"pop .3s cubic-bezier(.34,1.56,.64,1)",backdropFilter:"blur(20px)",boxShadow:"0 0 60px rgba(255,68,0,.15),0 20px 40px rgba(0,0,0,.5)"}}>
          <div style={{fontSize:36,textAlign:"center",marginBottom:8}}>⚔️</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:15,fontWeight:900,color:"#FF4400",letterSpacing:2,textAlign:"center",marginBottom:6}}>DECLARE WAR</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.3)",textAlign:"center",marginBottom:16}}>Declarations appear in the live feed. Allied fandoms are protected.</div>
          <div style={{maxHeight:220,overflowY:"auto",marginBottom:14,display:"grid",gap:5}}>
            {board.filter(t=>t.id!==active).map(t=>{const allied=isAllied(t.id);const atWar=wars.some(w=>(w.attacker===active&&w.defender===t.id));return(
              <div key={t.id} onClick={()=>!allied&&!atWar&&declareWar(t.id)} style={{padding:"8px 12px",background:rgba(t.color,.07),border:`1px solid ${rgba(t.color,.3)}`,borderRadius:7,cursor:allied||atWar?"not-allowed":"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",opacity:allied||atWar?.5:1}}>
                <span style={{fontWeight:700,fontSize:12,color:t.color}}>{t.name} <span style={{fontSize:9,opacity:.6}}>{t.count}px</span></span>
                <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:allied?"#00FFAA":atWar?"#FF4400":"#FF8800"}}>{allied?"🤝 ALLY":atWar?"⚔️ AT WAR":"DECLARE"}</span>
              </div>
            );})}
          </div>
          <button onClick={()=>setShowWarModal(false)} style={{width:"100%",padding:"10px",background:"transparent",border:"1px solid #1a1a2e",color:"#5a5a7a",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:700,fontSize:10}}>CANCEL</button>
        </div>
      </div>}

      {/* ALLIANCE MODAL */}
      {showAllianceModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(16px)"}} onClick={e=>e.target===e.currentTarget&&setShowAllianceModal(false)}>
        <div style={{background:"rgba(9,9,30,.92)",border:"1px solid rgba(0,255,170,.5)",borderRadius:16,padding:"28px 26px",width:400,maxWidth:"94vw",animation:"pop .3s cubic-bezier(.34,1.56,.64,1)",backdropFilter:"blur(20px)",boxShadow:"0 0 60px rgba(0,255,170,.12),0 20px 40px rgba(0,0,0,.5)"}}>
          <div style={{fontSize:36,textAlign:"center",marginBottom:8}}>🤝</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:15,fontWeight:900,color:"#00FFAA",letterSpacing:2,textAlign:"center",marginBottom:6}}>PROPOSE ALLIANCE</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.3)",textAlign:"center",marginBottom:16}}>Allied fandoms cannot raid each other. Alliances can be betrayed at any time.</div>
          <div style={{maxHeight:220,overflowY:"auto",marginBottom:14,display:"grid",gap:5}}>
            {board.filter(t=>t.id!==active&&!isAllied(t.id)).map(t=>(
              <div key={t.id} onClick={()=>proposeAlliance(t.id)} style={{padding:"8px 12px",background:rgba(t.color,.07),border:`1px solid ${rgba(t.color,.3)}`,borderRadius:7,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:700,fontSize:12,color:t.color}}>{t.name} <span style={{fontSize:9,opacity:.6}}>{t.count}px</span></span>
                <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#00FFAA"}}>🤝 PROPOSE</span>
              </div>
            ))}
          </div>
          <button onClick={()=>setShowAllianceModal(false)} style={{width:"100%",padding:"10px",background:"transparent",border:"1px solid #1a1a2e",color:"#5a5a7a",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:700,fontSize:10}}>CANCEL</button>
        </div>
      </div>}

      {/* DAILY MODAL */}
      {showDaily&&dailyInfo&&!alreadyClaimedToday&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:998,backdropFilter:"blur(10px)"}}>
        <div style={{background:"#09091c",border:"1px solid rgba(255,215,0,.4)",borderRadius:16,padding:"30px 26px",width:380,maxWidth:"94vw",animation:"pop .4s cubic-bezier(.34,1.56,.64,1)",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:10}}>🎁</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:17,fontWeight:900,color:"#FFD700",letterSpacing:2,marginBottom:4}}>DAILY REWARD</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#5a5a7a",marginBottom:18}}>DAY {dailyInfo.days} STREAK</div>
          <div style={{display:"flex",justifyContent:"center",gap:5,marginBottom:18}}>
            {[1,2,3,4,5,6,7].map(d=>{const isDone=d<dailyInfo.days,isToday=d===dailyInfo.days,r=streakReward(d);return(
              <div key={d} style={{textAlign:"center"}}>
                <div style={{width:34,height:34,borderRadius:7,border:`1px solid ${isDone?"#FFD70066":isToday?"#FFD700":"rgba(255,255,255,.1)"}`,background:isDone?"rgba(255,215,0,.15)":isToday?"rgba(255,215,0,.25)":"rgba(255,255,255,.03)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginBottom:3,boxShadow:isToday?"0 0 12px rgba(255,215,0,.4)":"none"}}>{isDone?"✓":isToday?"⭐":"🔒"}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:isDone||isToday?"#FFD700":"#3a3a5a"}}>+{r.px}px</div>
              </div>
            );})}
          </div>
          <div style={{background:"rgba(255,215,0,.07)",border:"1px solid rgba(255,215,0,.2)",borderRadius:10,padding:"14px",marginBottom:14}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:900,color:"#FFD700",marginBottom:3}}>+{dailyInfo.reward.px} FREE PIXELS</div>
            {dailyInfo.reward.bonus&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#FF2D78",animation:"shimmer 1.2s infinite"}}>{dailyInfo.reward.bonus}</div>}
          </div>
          <button onClick={claimDaily} style={{width:"100%",padding:"13px",background:"linear-gradient(90deg,#FFD700,#FF9900)",border:"none",color:"#040408",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:13,letterSpacing:2}}>CLAIM +{dailyInfo.reward.px} FREE PIXELS →</button>
          <button onClick={()=>setShowDaily(false)} style={{marginTop:8,background:"none",border:"none",color:"#3a3a5a",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9,width:"100%"}}>remind me later</button>
        </div>
      </div>}

      {/* RESET MODAL */}
      {showReset&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(10px)"}} onClick={e=>e.target===e.currentTarget&&setShowReset(false)}>
        <div style={{background:"#09091c",border:"1px solid rgba(255,60,60,.4)",borderRadius:16,padding:"28px 26px",width:360,maxWidth:"94vw",textAlign:"center",animation:"pop .3s cubic-bezier(.34,1.56,.64,1)"}}>
          <div style={{fontSize:40,marginBottom:12}}>⚠️</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:900,color:"#ff6b6b",letterSpacing:2,marginBottom:8}}>RESET GRID?</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#5a5a7a",marginBottom:16,lineHeight:1.6}}>{isOnline?"Deletes ALL pixels in Supabase for this season.":"Erases all local demo data."}</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setShowReset(false)} style={{flex:1,padding:"10px",background:"transparent",border:"1px solid #1a1a2e",color:"#5a5a7a",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:700,fontSize:10}}>CANCEL</button>
            <button onClick={resetGrid} style={{flex:2,padding:"10px",background:"linear-gradient(90deg,#ff4444,#ff6b6b)",border:"none",color:"#fff",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:10}}>🔄 RESET</button>
          </div>
        </div>
      </div>}

      {/* SEASON END */}
      {showSeasonEnd&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:998,backdropFilter:"blur(12px)"}}>
        {/* Fireworks */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>
          {Array.from({length:12}).map((_,i)=>(
            <div key={i} style={{position:"absolute",left:`${10+i*7}%`,top:`${10+((i*37)%50)}%`,width:4,height:4,borderRadius:"50%",background:["#FFD700","#FF4400","#00F5FF","#C8FF00","#FF2D78","#9747FF"][i%6],animation:`firework ${1+Math.random()}s ease-out infinite`,animationDelay:`${i*.2}s`,boxShadow:`0 0 6px currentColor`}}/>
          ))}
        </div>
        <style>{`@keyframes firework{0%{transform:scale(0) translateY(0);opacity:1}50%{transform:scale(1) translateY(-60px);opacity:1}100%{transform:scale(0) translateY(-120px);opacity:0}}`}</style>
        <div style={{background:"rgba(9,9,30,.97)",border:"1px solid rgba(255,215,0,.5)",borderRadius:20,padding:"36px 32px",width:440,maxWidth:"94vw",animation:"pop .5s cubic-bezier(.34,1.56,.64,1)",textAlign:"center",position:"relative",zIndex:1,boxShadow:"0 0 80px rgba(255,215,0,.2)"}}>
          <div style={{fontSize:56,marginBottom:12,animation:"bounce 1s ease-in-out infinite"}}>🏆</div>
          <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,color:"#FFD700",letterSpacing:3,marginBottom:20}}>SEASON {season.num} OVER!</div>
          {board[0]&&<div style={{background:rgba(board[0].color,.1),border:`1px solid ${rgba(board[0].color,.4)}`,borderRadius:12,padding:"16px",marginBottom:20}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.4)",marginBottom:6}}>SEASON CHAMPION 👑</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:900,color:board[0].color,textShadow:`0 0 20px ${board[0].color}`}}>{board[0].name}</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"rgba(255,255,255,.4)",marginTop:4}}>{board[0].count.toLocaleString()} pixels dominated</div>
          </div>}
          <div style={{background:"rgba(200,255,0,.06)",border:"1px solid rgba(200,255,0,.2)",borderRadius:10,padding:"12px 16px",marginBottom:20,display:"flex",gap:12,alignItems:"center"}}>
            <span style={{fontSize:24}}>{THEMES[(season.theme+1)%THEMES.length].icon}</span>
            <div style={{textAlign:"left"}}><div style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:900,color:"#C8FF00"}}>NEXT: {THEMES[(season.theme+1)%THEMES.length].name}</div><div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.3)",marginTop:2}}>{THEMES[(season.theme+1)%THEMES.length].desc}</div></div>
          </div>
          <button onClick={startNewSeason} style={{width:"100%",padding:"14px",background:"linear-gradient(90deg,#FFD700,#C8FF00)",border:"none",color:"#040408",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:13,letterSpacing:2}}>🚀 START SEASON {season.num+1} →</button>
        </div>
      </div>}

      {/* LIVE BATTLE MODE */}
      {showLiveBattle&&(()=>{
        const counts={};Object.values(liveBattlePixels).forEach(t=>{counts[t]=(counts[t]||0)+1;});
        const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
        const leader=top[0]?top[0][0]:null;
        const myCount=active?Object.values(liveBattlePixels).filter(t=>t===active).length:0;
        const isWinning=leader===active&&active;
        const timeLeft=liveBattleEndsAt?liveBattleEndsAt-Date.now():0;
        const isExpired=timeLeft<=0;

        const claimSpots=()=>{
          if(!active){pushToast("Select a fandom first!","#FF4400",3000);return;}
          if(myCount>=10){pushToast(`${TM[active]?.name} already has 10 spots! Raid enemies instead.`,"#FF4400",3000);return;}
          if(Object.keys(liveBattlePixels).length>=40000){pushToast("Arena is full! Raid to take spots.","#FF4400",3000);return;}
          const next={...liveBattlePixels};
          let added=0;const toAdd=10-myCount;
          for(let i=0;i<toAdd;i++){
            let idx;let tries=0;
            do{idx=Math.floor(Math.random()*40000);tries++;}while(next[idx]&&tries<300);
            if(tries<300){next[idx]=active;added++;}
          }
          setLiveBattlePixels(next);
          localStorage.setItem("pow_live_battle",JSON.stringify({pixels:next,endsAt:liveBattleEndsAt}));
          pushToast(`⚡ +${added} spots for ${TM[active]?.name}! (${myCount+added}/10 used)`,"#FF4400",2500);
          // Track daily streak
          const today=todayStr();
          if(liveBattleStreak.last!==today){
            const yesterday=yesterdayStr();
            const newDays=liveBattleStreak.last===yesterday?liveBattleStreak.days+1:1;
            const newStreak={days:newDays,last:today};
            setLiveBattleStreak(newStreak);
            localStorage.setItem("pow_lb_streak",JSON.stringify(newStreak));
            if(newDays>1)pushToast(`🔥 Live Battle streak: ${newDays} days! Keep it up!`,"#FF4400",3000);
            // Bonus pixels at streak milestones
            if([3,7,14,30].includes(newDays)){
              const bonus=newDays>=30?20:newDays>=14?10:newDays>=7?5:3;
              syncFreePixels(freePixels+bonus);
              pushToast(`🏆 ${newDays}-day Live Battle streak! +${bonus} free pixels!`,"#FFD700",5000);
            }
          }
        };

        const shareInvite=()=>{
          const fandomName=TM[active]?.name||"my fandom";
          const msg=`⚡ I'm fighting for ${fandomName} in the Live Battle on Pixels of War!\n\nJoin for free — no payment needed. Claim spots, raid enemies, win bonus pixels.\n\n👉 https://www.pixelsofwar.com`;
          // Try native share first (mobile), then clipboard, then fallback
          if(navigator.share){
            navigator.share({title:"Pixels of War — Live Battle",text:msg,url:"https://www.pixelsofwar.com"}).catch(()=>{});
          }else if(navigator.clipboard?.writeText){
            navigator.clipboard.writeText(msg).then(()=>pushToast("📋 Invite copied! Share it anywhere.","#00FF88",3000)).catch(()=>{
              // Clipboard failed — show text to copy manually
              prompt("Copy this invite message:",msg);
            });
          }else{
            // Last resort — prompt dialog
            prompt("Copy this invite message:",msg);
          }
        };

        const raidSpot=()=>{
          if(!requireAuth("livebattle"))return;
          if(!active){pushToast("Select a fandom first!","#FF4400",3000);return;}
          // Find an enemy pixel to steal
          const enemies=Object.entries(liveBattlePixels).filter(([,t])=>t!==active);
          if(enemies.length===0){pushToast("No enemy pixels to raid!","#FF4400",3000);return;}
          const next={...liveBattlePixels};
          // Raid up to 5 random enemy spots
          const shuffled=enemies.sort(()=>Math.random()-.5).slice(0,5);
          shuffled.forEach(([idx])=>{next[idx]=active;});
          setLiveBattlePixels(next);
          localStorage.setItem("pow_live_battle",JSON.stringify({pixels:next,endsAt:liveBattleEndsAt}));
          pushToast(`⚔️ Raided ${shuffled.length} enemy spots for ${TM[active]?.name}!`,"#FF4400",2500);
        };

        // Check for winner when battle ends
        if(isExpired&&leader&&!localStorage.getItem(`pow_lb_winner_${liveBattleEndsAt}`)){
          localStorage.setItem(`pow_lb_winner_${liveBattleEndsAt}`,"1");
          const winnerName=TM[leader]?.name||leader;
          const winnerColor=TM[leader]?.color||"#FFD700";
          // Grant bonus pixels if player's fandom won
          if(leader===active&&user){
            syncFreePixels(freePixels+5);
            pushToast(`🏆 ${winnerName} WON the Live Battle! +5 free pixels!`,"#FFD700",8000);
          }
          // Discord announcement
          postToDiscord({
            title:`🏆 LIVE BATTLE WINNER!`,
            description:`**${winnerName}** has won today's Live Battle with **${top[0][1]} pixels**!\n\nAll ${winnerName} players received **+5 free pixels** on the main grid.\n\nA new 24h battle starts now — join the fight!`,
            color:parseInt((winnerColor||"#FFD700").slice(1),16),
            fields:top.slice(0,3).map(([tid,cnt],i)=>({name:`${["🥇","🥈","🥉"][i]} ${TM[tid]?.name||tid}`,value:`${cnt} pixels`,inline:true})),
            url:"https://www.pixelsofwar.com",
            footer:{text:"Pixels of War Live Battle"},
            timestamp:new Date().toISOString()
          });
          // Reset arena
          setTimeout(()=>{
            const endsAt=Date.now()+86400000;
            const seed={};
            ["🎮 Gaming|Battle Royale|Fortnite","🎌 Anime|Shonen|Naruto","🎵 Music|K-Pop|BTS","🎮 Gaming|RPG|Pokémon","🎌 Anime|Shonen|One Piece","🎵 Music|Pop|Taylor Swift","🎮 Gaming|Shooter|Valorant","🎌 Anime|Shonen|Dragon Ball Z"].forEach((fid,fi)=>{
              for(let i=0;i<30;i++){seed[(Math.floor(fi*25+Math.random()*20))+Math.floor(Math.random()*200)*200]=fid;}
            });
            setLiveBattlePixels(seed);setLiveBattleEndsAt(endsAt);
            localStorage.setItem("pow_live_battle",JSON.stringify({pixels:seed,endsAt}));
          },5000);
        }

        return(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(12px)"}} onClick={()=>setShowLiveBattle(false)}>
          <div style={{background:"rgba(9,9,26,.98)",border:`1px solid ${isExpired?"rgba(255,215,0,.5)":"rgba(255,68,0,.5)"}`,borderRadius:20,padding:"28px",width:500,maxWidth:"96vw",animation:"pop .4s cubic-bezier(.34,1.56,.64,1)",boxShadow:`0 0 80px ${isExpired?"rgba(255,215,0,.2)":"rgba(255,68,0,.2)"}`}} onClick={e=>e.stopPropagation()}>

            {/* Header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:isExpired?"#FFD700":"#FF4400",letterSpacing:2}}>
                  {isExpired?"🏆 BATTLE OVER":"⚡ LIVE BATTLE"}
                </div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.3)",marginTop:2}}>200×200 ARENA · FREE TO PLAY · RESETS EVERY 24H</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:timeLeft<3600000?"#FF4400":"#FF4400"}}>{isExpired?"ENDED":"ENDS IN"}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:13,color:"#FFD700",fontWeight:900}}>
                  {isExpired?"🏆 WINNER BELOW":`${Math.max(0,Math.floor(timeLeft/3600000))}h ${Math.floor((timeLeft%3600000)/60000)}m`}
                </div>
              </div>
            </div>

            {/* Your status */}
            {active&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"6px 10px",background:isWinning?"rgba(255,215,0,.1)":"rgba(255,255,255,.04)",border:`1px solid ${isWinning?"rgba(255,215,0,.3)":"rgba(255,255,255,.08)"}`,borderRadius:7}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:TM[active]?.color||"#888",boxShadow:`0 0 6px ${TM[active]?.color||"#888"}`}}/>
              <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:TM[active]?.color||"#888",fontWeight:900}}>{TM[active]?.name}</span>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.3)"}}>{myCount}/10 spots</span>
              {isWinning&&<span style={{fontFamily:"'Orbitron',monospace",fontSize:8,color:"#FFD700",marginLeft:"auto",animation:"pulse 1s infinite"}}>🥇 LEADING!</span>}
            </div>}

            {/* Grid */}
            <div style={{background:"#06060e",border:"1px solid rgba(255,68,0,.15)",borderRadius:8,marginBottom:12,overflow:"hidden"}}>
              <canvas ref={el=>{
                if(!el)return;
                const ctx=el.getContext("2d");const W=el.width=460,H=el.height=230;
                ctx.fillStyle="#06060e";ctx.fillRect(0,0,W,H);
                const cW=W/200,cH=H/200;
                Object.entries(liveBattlePixels).forEach(([idx,teamId])=>{
                  const x=parseInt(idx)%200,y=Math.floor(parseInt(idx)/200);
                  ctx.fillStyle=TM[teamId]?.color||"#888";
                  ctx.fillRect(x*cW,y*cH,Math.max(1,cW),Math.max(1,cH));
                });
                // Highlight active fandom pixels
                if(active){
                  ctx.strokeStyle=TM[active]?.color||"#fff";ctx.lineWidth=0.5;
                  Object.entries(liveBattlePixels).filter(([,t])=>t===active).forEach(([idx])=>{
                    const x=parseInt(idx)%200,y=Math.floor(parseInt(idx)/200);
                    ctx.strokeRect(x*cW,y*cH,cW,cH);
                  });
                }
              }} style={{width:"100%",display:"block"}}/>
            </div>

            {/* Leaderboard */}
            {top.length>0&&<div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
              {top.slice(0,5).map(([tid,cnt],i)=>(
                <div key={tid} style={{flex:1,minWidth:70,background:i===0?"rgba(255,215,0,.08)":tid===active?"rgba(0,245,255,.05)":"rgba(255,255,255,.03)",border:`1px solid ${i===0?"rgba(255,215,0,.3)":tid===active?"rgba(0,245,255,.2)":"rgba(255,255,255,.06)"}`,borderRadius:6,padding:"5px 6px",textAlign:"center"}}>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:i===0?"#FFD700":tid===active?"#00F5FF":"rgba(255,255,255,.3)",marginBottom:2}}>{["🥇","🥈","🥉","4th","5th"][i]}</div>
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:7,color:TM[tid]?.color||"#888",fontWeight:900,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{TM[tid]?.name||tid}</div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#C8FF00",fontWeight:900}}>{cnt}px</div>
                </div>
              ))}
            </div>}

            {/* Action buttons */}
            {!isExpired&&<div style={{display:"flex",gap:8,flexDirection:"column"}}>
              {!active&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#FFD700",textAlign:"center",padding:"7px",background:"rgba(255,215,0,.06)",border:"1px solid rgba(255,215,0,.15)",borderRadius:6}}>⚠️ Select a fandom from the panel first</div>}
              {/* Streak display */}
              {liveBattleStreak.days>0&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 10px",background:"rgba(255,68,0,.06)",border:"1px solid rgba(255,68,0,.2)",borderRadius:6}}>
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#FF6644"}}>🔥 Live Battle streak: <strong style={{color:"#FF4400"}}>{liveBattleStreak.days} day{liveBattleStreak.days!==1?"s":""}</strong></span>
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,255,255,.3)"}}>Next milestone: {liveBattleStreak.days<3?3:liveBattleStreak.days<7?7:liveBattleStreak.days<14?14:30}d</span>
              </div>}
              <div style={{display:"flex",gap:8}}>
                <button onClick={claimSpots} disabled={!active||myCount>=10} style={{flex:2,padding:"11px",background:!active||myCount>=10?"rgba(255,255,255,.05)":`linear-gradient(90deg,${TM[active]?.color||"#FF4400"},#FF2D00)`,border:`1px solid ${!active||myCount>=10?"rgba(255,255,255,.1)":`${TM[active]?.color||"#FF4400"}88`}`,borderRadius:8,cursor:!active||myCount>=10?"default":"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:!active||myCount>=10?"rgba(255,255,255,.3)":"#fff",letterSpacing:1,fontWeight:900}}>
                  {!active?"SELECT FANDOM FIRST":myCount>=10?`✅ FULL — RAID INSTEAD`:`⚡ CLAIM ${10-myCount} SPOTS (FREE)`}
                </button>
                <button onClick={raidSpot} disabled={!active} style={{flex:1,padding:"11px",background:!active?"rgba(255,255,255,.03)":"rgba(255,68,0,.12)",border:`1px solid ${!active?"rgba(255,255,255,.06)":"rgba(255,68,0,.4)"}`,borderRadius:8,cursor:!active?"default":"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:!active?"rgba(255,255,255,.2)":"#FF4400",letterSpacing:1,fontWeight:900}}>
                  ⚔️ RAID 5
                </button>
                <button onClick={()=>setShowLiveBattle(false)} style={{padding:"11px 14px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.25)"}}>✕</button>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,255,255,.2)"}}>
                  🏆 Top fandom wins +5px · ⚔️ Raid needs Discord login · 🔥 Daily streak = bonus pixels
                </div>
                <button onClick={shareInvite} style={{padding:"4px 10px",background:"rgba(0,255,136,.08)",border:"1px solid rgba(0,255,136,.25)",borderRadius:5,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#00FF88",whiteSpace:"nowrap",flexShrink:0}}>📤 INVITE</button>
              </div>
            </div>}

            {/* Winner screen */}
            {isExpired&&leader&&<div style={{textAlign:"center",padding:"16px",background:"rgba(255,215,0,.06)",border:"1px solid rgba(255,215,0,.2)",borderRadius:10}}>
              <div style={{fontSize:32,marginBottom:8}}>🏆</div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:900,color:TM[leader]?.color||"#FFD700",marginBottom:4}}>{TM[leader]?.name} WINS!</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.4)",marginBottom:12}}>{top[0][1]} pixels · {leader===active?"+5 free pixels awarded!":"Select your fandom to win next time"}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.2)"}}>New battle starting in 5 seconds...</div>
            </div>}

          </div>
        </div>
        );
      })()}

      {/* WEEKLY SEASON REPORT */}
      {showWeeklyReport&&weeklyStats&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:997,backdropFilter:"blur(10px)"}} onClick={()=>setShowWeeklyReport(false)}>
        <div style={{background:"rgba(9,9,26,.98)",border:`1px solid ${weeklyStats.color}44`,borderRadius:20,padding:"32px 28px",width:400,maxWidth:"94vw",animation:"pop .4s cubic-bezier(.34,1.56,.64,1)",textAlign:"center",boxShadow:`0 0 60px ${weeklyStats.color}22`}} onClick={e=>e.stopPropagation()}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.3)",letterSpacing:2,marginBottom:4}}>WEEKLY REPORT · WEEK {weeklyStats.week}</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:900,color:weeklyStats.color,letterSpacing:2,marginBottom:4,textShadow:`0 0 20px ${weeklyStats.color}`}}>{weeklyStats.fandom}</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.4)",marginBottom:24}}>HERE'S HOW YOUR WEEK WENT</div>

          {/* Pixel change */}
          <div style={{background:`rgba(255,255,255,.04)`,border:"1px solid rgba(255,255,255,.08)",borderRadius:12,padding:"16px",marginBottom:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[
              {label:"PIXELS OWNED",value:weeklyStats.pixels.toLocaleString(),color:"#C8FF00",icon:"🏴"},
              {label:"CHANGE",value:(weeklyStats.pixels-weeklyStats.prevPixels>=0?"+":"")+((weeklyStats.pixels-weeklyStats.prevPixels)||"—"),color:weeklyStats.pixels>=weeklyStats.prevPixels?"#00FF88":"#FF4400",icon:weeklyStats.pixels>=weeklyStats.prevPixels?"📈":"📉"},
              {label:"RANK",value:`${weeklyStats.rankIcon} ${weeklyStats.rank}`,color:"#FFD700",icon:""},
              {label:"LOGIN STREAK",value:`${weeklyStats.streak}d 🔥`,color:"#FF2D78",icon:""},
              {label:"ACTIVE WARS",value:weeklyStats.wars,color:"#FF4400",icon:"⚔️"},
              {label:"MISSIONS DONE",value:weeklyStats.missions,color:"#00F5FF",icon:"🎯"},
            ].map((s,i)=>(
              <div key={i} style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:900,color:s.color,marginBottom:2}}>{s.icon} {s.value}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,255,255,.3)",letterSpacing:1}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Motivational message */}
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.4)",marginBottom:20,lineHeight:1.7}}>
            {weeklyStats.pixels===0?"🪖 No territory yet — claim your first pixels this week!":
             weeklyStats.pixels-weeklyStats.prevPixels>50?"🔥 Massive week! Your fandom is dominating.":
             weeklyStats.pixels-weeklyStats.prevPixels>0?"⚔️ Growing strong. Keep raiding and claiming.":
             weeklyStats.pixels-weeklyStats.prevPixels<0?"🛡️ You lost ground. Time to fight back!":
             "📊 Holding steady. Push for more this week."}
          </div>

          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setShowWeeklyReport(false)} style={{flex:1,padding:"12px",background:`linear-gradient(90deg,${weeklyStats.color}22,${weeklyStats.color}11)`,border:`1px solid ${weeklyStats.color}66`,borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:10,color:weeklyStats.color,letterSpacing:1,fontWeight:900}}>⚔️ BACK TO WAR</button>
          </div>
        </div>
      </div>}

      {/* ── PAYWALL / SHOP MODAL ────────────────────────────────────────────── */}
      {showPaywall&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(16px)"}} onClick={()=>setShowPaywall(false)}>
        <div style={{background:"rgba(9,9,26,.99)",border:"1px solid rgba(200,255,0,.3)",borderRadius:20,padding:"24px",width:520,maxWidth:"96vw",maxHeight:"90vh",overflow:"auto",animation:"pop .4s cubic-bezier(.34,1.56,.64,1)",boxShadow:"0 0 80px rgba(200,255,0,.1)"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:"#C8FF00",letterSpacing:2}}>💰 GET MORE PIXELS</div>
            <button onClick={()=>setShowPaywall(false)} style={{background:"none",border:"none",color:"rgba(255,255,255,.3)",cursor:"pointer",fontSize:18}}>✕</button>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:4,marginBottom:16,background:"rgba(255,255,255,.04)",borderRadius:8,padding:4}}>
            {[["bundles","📦 Bundles"],["pass","🏆 Pass"],["free","🎬 Ad"],["history","🧾 History"]].map(([id,label])=>(
              <button key={id} onClick={()=>{setPaywallTab(id);if(id==="history")fetchPurchases();}} style={{flex:1,padding:"7px",background:paywallTab===id?"rgba(200,255,0,.15)":"transparent",border:`1px solid ${paywallTab===id?"rgba(200,255,0,.4)":"transparent"}`,borderRadius:6,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:paywallTab===id?"#C8FF00":"rgba(255,255,255,.4)",fontWeight:900}}>{label}</button>
            ))}
          </div>

          {/* PIXEL BUNDLES TAB */}
          {paywallTab==="bundles"&&<div>
            {starterPackAvailable&&<div style={{background:"linear-gradient(90deg,rgba(255,68,0,.15),rgba(255,215,0,.08))",border:"2px solid rgba(255,68,0,.5)",borderRadius:12,padding:"14px 16px",marginBottom:12,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:6,right:10,fontFamily:"'Orbitron',monospace",fontSize:7,color:"#FF4400",fontWeight:900,background:"rgba(255,68,0,.2)",borderRadius:3,padding:"2px 6px"}}>⏰ 3-DAY OFFER</div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:900,color:"#FFD700",marginBottom:4}}>🎁 STARTER PACK</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.6)",marginBottom:10}}>100 pixels + 1 Power-Up + Season Pass · Best value for new players</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div><span style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,color:"#C8FF00"}}>€2.99</span><span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.3)",marginLeft:6,textDecoration:"line-through"}}>€19.97</span></div>
                <button onClick={()=>startCheckout("starter")} disabled={paymentLoading==="starter"} style={{padding:"10px 20px",background:"linear-gradient(90deg,#FFD700,#C8FF00)",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:10,color:"#040408",fontWeight:900}}>{paymentLoading==="starter"?"⏳...":"BUY NOW →"}</button>
              </div>
            </div>}
            {/* Impulse tier — full width */}
            <div style={{background:"rgba(0,245,255,.06)",border:"1px solid rgba(0,245,255,.25)",borderRadius:8,padding:"10px 14px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:18}}>💧</span>
                <div>
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:900,color:"#00F5FF"}}>TRIAL PACK — Try before you commit</div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.35)"}}>15 pixels · Perfect for your first purchase</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <span style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:"#00F5FF"}}>€0.99</span>
                <button onClick={()=>startCheckout("trial")} disabled={paymentLoading==="trial"} style={{padding:"6px 12px",background:"rgba(0,245,255,.15)",border:"1px solid rgba(0,245,255,.4)",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#00F5FF",fontWeight:900}}>{paymentLoading==="trial"?"⏳...":"BUY →"}</button>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              {[
                {id:"small",pixels:100,price:"€1.99",bonus:0,color:"#00F5FF",label:"SMALL",icon:"⚡"},
                {id:"medium",pixels:250,price:"€4.99",bonus:25,color:"#C8FF00",label:"MEDIUM",icon:"🔥",popular:true},
                {id:"large",pixels:600,price:"€9.99",bonus:60,color:"#FFD700",label:"LARGE",icon:"💎"},
                {id:"mega",pixels:2000,price:"€24.99",bonus:400,color:"#FF2D78",label:"MEGA",icon:"👑",whale:true},
              ].map(b=>(
                <div key={b.pixels} style={{background:b.popular?"rgba(200,255,0,.08)":b.whale?"rgba(255,45,120,.08)":"rgba(255,255,255,.03)",border:`1px solid ${b.popular?"rgba(200,255,0,.4)":b.whale?"rgba(255,45,120,.4)":"rgba(255,255,255,.08)"}`,borderRadius:10,padding:"14px 12px",position:"relative",textAlign:"center"}}>
                  {b.popular&&<div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",background:"#C8FF00",color:"#040408",fontFamily:"'Orbitron',monospace",fontSize:7,fontWeight:900,padding:"2px 8px",borderRadius:4}}>BEST VALUE</div>}
                  {b.whale&&<div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",background:"#FF2D78",color:"#fff",fontFamily:"'Orbitron',monospace",fontSize:7,fontWeight:900,padding:"2px 8px",borderRadius:4}}>MOST POPULAR</div>}
                  <div style={{fontSize:22,marginBottom:4}}>{b.icon}</div>
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:b.color,fontWeight:900,marginBottom:4}}>{b.label}</div>
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,color:"#fff"}}>{b.pixels}<span style={{fontSize:10,color:"rgba(255,255,255,.4)"}}> px</span></div>
                  {b.bonus>0&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#FFD700",marginBottom:2}}>+{b.bonus} bonus px</div>}
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:b.color,margin:"6px 0"}}>{b.price}</div>
                  <button onClick={()=>startCheckout(b.id)} disabled={paymentLoading===b.id} style={{width:"100%",padding:"7px",background:`rgba(${b.color==="#C8FF00"?"200,255,0":"0,245,255"},.12)`,border:`1px solid ${b.color}55`,borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:b.color,fontWeight:900}}>{paymentLoading===b.id?"⏳...":"BUY →"}</button>
                </div>
              ))}
            </div>
            {/* Whale tier — full width */}
            <div style={{background:"linear-gradient(90deg,rgba(255,215,0,.1),rgba(200,255,0,.05))",border:"2px solid rgba(255,215,0,.4)",borderRadius:10,padding:"14px 16px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,right:0,background:"#FFD700",color:"#040408",fontFamily:"'Orbitron',monospace",fontSize:7,fontWeight:900,padding:"3px 10px",borderRadius:"0 10px 0 6px"}}>👑 WHALE PACK</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                <div>
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:"#FFD700",marginBottom:3}}>🐋 TERRITORIAL DOMINATION</div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.5)"}}>5,000 pixels + 1,000 bonus · Enough to own entire sectors</div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.3)",marginTop:2}}>+ Permanent gold crown badge · Priority Discord role</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                  <div><span style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:900,color:"#FFD700"}}>€49.99</span></div>
                  <button onClick={()=>startCheckout("whale")} disabled={paymentLoading==="whale"} style={{padding:"10px 16px",background:"linear-gradient(90deg,#FFD700,#C8FF00)",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#040408",fontWeight:900}}>{paymentLoading==="whale"?"⏳ PROCESSING...":"GET IT →"}</button>
                </div>
              </div>
            </div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.2)",textAlign:"center",marginTop:10}}>Pixels added to your account instantly. Secure payment via Stripe. All prices in EUR.</div>
          </div>}

          {/* SEASON PASS TAB */}
          {paywallTab==="pass"&&<div>
            <div style={{background:"linear-gradient(135deg,rgba(255,215,0,.1),rgba(200,255,0,.05))",border:"2px solid rgba(255,215,0,.4)",borderRadius:14,padding:"20px",marginBottom:12,textAlign:"center"}}>
              <div style={{fontSize:40,marginBottom:8}}>🏆</div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:900,color:"#FFD700",letterSpacing:2,marginBottom:4}}>SEASON {currentSeasonNum} PASS</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.4)",marginBottom:16}}>Never expires · One-time purchase · No subscription</div>
              {hasSeasonPass
                ?<div style={{background:"rgba(0,255,136,.1)",border:"1px solid rgba(0,255,136,.3)",borderRadius:8,padding:"12px",fontFamily:"'Orbitron',monospace",fontSize:12,color:"#00FF88"}}>✅ YOU HAVE THE SEASON PASS!</div>
                :<>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16,textAlign:"left"}}>
                    {[["⚡","2× XP on all pixels"],["💰","50% more War Chest gold"],["🎁","+50 free pixels now"],["🌟","Exclusive Season badge"],["🔥","SEASON WARRIOR power-up"],["🎨","Gold fandom border glow"]].map(([icon,desc])=>(
                      <div key={desc} style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:14}}>{icon}</span>
                        <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.6)"}}>{desc}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div><span style={{fontFamily:"'Orbitron',monospace",fontSize:24,fontWeight:900,color:"#FFD700"}}>€4.99</span><span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.3)",marginLeft:8}}>one season</span></div>
                    <button onClick={()=>startCheckout("season_pass")} disabled={paymentLoading==="season_pass"} style={{padding:"12px 24px",background:"linear-gradient(90deg,#FFD700,#C8FF00)",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:11,color:"#040408",fontWeight:900}}>{paymentLoading==="season_pass"?"⏳ PROCESSING...":"GET PASS →"}</button>
                  </div>
                </>
              }
            </div>
          </div>}

          {/* REWARDED AD TAB */}
          {paywallTab==="free"&&<div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:48,marginBottom:12}}>🎬</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:"#00F5FF",marginBottom:8}}>WATCH & EARN</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.5)",marginBottom:20}}>Watch a short ad → get 5 free pixels instantly.<br/>No payment needed. Available every 30 minutes.</div>
            {adCooldown>Date.now()
              ?<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.3)",padding:"14px",border:"1px solid rgba(255,255,255,.1)",borderRadius:8}}>⏰ Next ad available in {Math.ceil((adCooldown-Date.now())/60000)} minutes</div>
              :<button onClick={()=>{
                if(watchingAd)return;
                setWatchingAd(true);
                // Simulate ad watching (replace with real ad SDK)
                pushToast("🎬 Ad starting... (demo mode)","#00F5FF",2000);
                setTimeout(()=>{
                  setWatchingAd(false);
                  const cooldown=Date.now()+30*60000;
                  setAdCooldown(cooldown);
                  localStorage.setItem("pow_ad_cooldown",String(cooldown));
                  syncFreePixels(freePixels+5);
                  pushToast("✅ +5 free pixels earned! Thanks for watching.","#00FF88",4000);
                  setShowPaywall(false);
                },3000);
              }} style={{padding:"16px 32px",background:"linear-gradient(90deg,#00F5FF,#0088FF)",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:12,color:"#fff",fontWeight:900,animation:"pulse 2s infinite"}}>
                {watchingAd?"⏳ WATCHING...":"▶ WATCH AD → GET 5 PIXELS"}
              </button>
            }
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.15)",marginTop:16}}>30-minute cooldown between ads. Max 10 free pixels/day via ads.</div>
          </div>}

          {/* PURCHASE HISTORY TAB */}
          {paywallTab==="history"&&<div>
            {!user?<div style={{textAlign:"center",padding:"30px 0"}}>
              <div style={{fontSize:32,marginBottom:12}}>🔐</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.4)"}}>Log in with Discord to see your purchase history.</div>
            </div>
            :purchasesLoading?<div style={{textAlign:"center",padding:"30px 0"}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.3)",animation:"pulse 1s infinite"}}>⏳ Loading purchases...</div>
            </div>
            :purchases.length===0?<div style={{textAlign:"center",padding:"30px 0"}}>
              <div style={{fontSize:32,marginBottom:12}}>🛒</div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:"rgba(255,255,255,.3)",marginBottom:8}}>NO PURCHASES YET</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.2)"}}>Your purchase history will appear here after your first payment.</div>
              <button onClick={()=>setPaywallTab("bundles")} style={{marginTop:16,padding:"10px 20px",background:"rgba(200,255,0,.1)",border:"1px solid rgba(200,255,0,.3)",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#C8FF00",fontWeight:900}}>💰 BUY PIXELS →</button>
            </div>
            :<div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.3)",marginBottom:12,textAlign:"right"}}>{purchases.length} purchase{purchases.length!==1?"s":""} · click any to view Stripe receipt</div>
              {purchases.map((p,i)=>{
                const productNames={trial:"Trial Pack",small:"Small Bundle",medium:"Medium Bundle",large:"Large Bundle",mega:"Mega Bundle",whale:"Whale Pack 👑",season_pass:"Season Pass 🏆",starter:"Starter Pack 🎁"};
                const productColors={trial:"#00F5FF",small:"#00F5FF",medium:"#C8FF00",large:"#FFD700",mega:"#FF2D78",whale:"#FFD700",season_pass:"#FFD700",starter:"#FF4400"};
                const date=new Date(p.created_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
                const time=new Date(p.created_at).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
                return(
                  <div key={p.id||i} style={{background:i%2===0?"rgba(255,255,255,.03)":"rgba(255,255,255,.01)",border:"1px solid rgba(255,255,255,.06)",borderRadius:8,padding:"12px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:36,height:36,borderRadius:8,background:`${productColors[p.product_id]||"#888"}18`,border:`1px solid ${productColors[p.product_id]||"#888"}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16}}>
                      {p.product_id==="whale"?"👑":p.product_id==="season_pass"?"🏆":p.product_id==="starter"?"🎁":"💰"}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:productColors[p.product_id]||"#e0e8ff"}}>{productNames[p.product_id]||p.product_id}</div>
                      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.4)",marginTop:2}}>+{p.pixels_granted}px granted · {date} {time}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:900,color:"#C8FF00"}}>€{Number(p.amount_eur).toFixed(2)}</div>
                      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(0,255,136,.5)",marginTop:2}}>✅ PAID</div>
                    </div>
                  </div>
                );
              })}
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.15)",textAlign:"center",marginTop:12}}>Payment receipts sent to your email by Stripe · Secure payments via Stripe</div>
            </div>}
          </div>}
        </div>
      </div>}

      {/* ── STARTER PACK MODAL ──────────────────────────────────────────────── */}
      {showStarterPack&&!localStorage.getItem("pow_starter_used")&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(12px)"}} onClick={()=>setShowStarterPack(false)}>
        <div style={{background:"rgba(9,9,26,.99)",border:"2px solid rgba(255,68,0,.5)",borderRadius:20,padding:"28px",width:420,maxWidth:"96vw",animation:"pop .5s cubic-bezier(.34,1.56,.64,1)",boxShadow:"0 0 80px rgba(255,68,0,.2)",textAlign:"center"}} onClick={e=>e.stopPropagation()}>
          <div style={{background:"rgba(255,68,0,.15)",border:"1px solid rgba(255,68,0,.4)",borderRadius:8,padding:"4px 12px",display:"inline-block",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#FF4400",marginBottom:12}}>⏰ NEW PLAYER OFFER · 3 DAYS ONLY</div>
          <div style={{fontSize:40,marginBottom:8}}>🎁</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,color:"#FFD700",letterSpacing:2,marginBottom:8}}>STARTER PACK</div>
          <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20,textAlign:"left"}}>
            {[["🗺️","100 free pixels","Start claiming territory immediately"],["⚡","1 Power-Up","CLUSTER BOMB ready to use"],["🏆","Season Pass","All season benefits unlocked"]].map(([icon,title,desc])=>(
              <div key={title} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 10px",background:"rgba(255,255,255,.04)",borderRadius:8}}>
                <span style={{fontSize:20}}>{icon}</span>
                <div><div style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:"#FFD700",fontWeight:900}}>{title}</div><div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.4)"}}>{desc}</div></div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div><span style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:900,color:"#C8FF00"}}>€2.99</span><span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.3)",marginLeft:8,textDecoration:"line-through"}}>€14.97</span></div>
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#FF4400"}}>80% OFF · Today only</span>
          </div>
          <button onClick={()=>startCheckout("starter")} disabled={paymentLoading==="starter"} style={{width:"100%",padding:"14px",background:"linear-gradient(90deg,#FFD700,#C8FF00)",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:12,color:"#040408",fontWeight:900,marginBottom:8}}>{paymentLoading==="starter"?"⏳ PROCESSING...":"🎁 CLAIM STARTER PACK →"}</button>
          <button onClick={()=>setShowStarterPack(false)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.2)"}}>No thanks, I'll miss out</button>
        </div>
      </div>}

      {/* ── WORLD WAR MODAL ──────────────────────────────────────────────────── */}
      {showWorldWar&&(()=>{
        const myFaction=active?getFaction(active):null;
        const totalPx=factionStandings.reduce((a,f)=>a+f.pixels,0)||1;
        const leader=factionStandings[0];
        const wwCooldown=5*60*1000; // 5 min between faction raids
        const canRaid=Date.now()-wwLastRaid>wwCooldown;

        const doFactionRaid=()=>{
          if(!requireAuth("worldwar"))return;
          if(!active){pushToast("Select a fandom first!","#FF4400",2000);return;}
          if(!canRaid){pushToast(`⏳ Faction raid cooling down — ${Math.ceil((wwCooldown-(Date.now()-wwLastRaid))/60000)}min left`,"#FF4400",3000);return;}
          if(warChest<30){pushToast("Need 30💰 gold for a Faction Raid!","#FFD700",3000);return;}
          // Steal from enemy factions — find enemy pixels
          const enemies=Object.entries(pixels).filter(([,v])=>{
            if(!v?.t||v.t===active)return false;
            const ef=getFaction(v.t);
            return ef&&myFaction&&ef.id!==myFaction.id;
          });
          if(enemies.length===0){pushToast("No enemy faction pixels nearby!","#FF4400",2000);return;}
          const targets=enemies.sort(()=>Math.random()-.5).slice(0,30);
          const now2=Date.now();const next={...pixels};const toUpsert=[];
          targets.forEach(([idx])=>{next[parseInt(idx)]={t:active,at:now2};toUpsert.push(parseInt(idx));});
          setPixels(next);
          if(isOnline)dbUpsertPixels(new Set(toUpsert),active,currentSeasonNum);
          const newGold=warChest-30;setWarChest(newGold);localStorage.setItem("pow_war_chest",String(newGold));
          setWwLastRaid(Date.now());localStorage.setItem("pow_ww_raid",String(Date.now()));
          spawnParticles(myFaction.color,vx+Math.floor(effVW/2),vy+Math.floor(effVH/2),25,true);
          triggerFlash(myFaction.color,true);
          pushToast(`⚔️ FACTION RAID! ${myFaction.name} stole ${targets.length}px from enemy factions! (${newGold}💰 left)`,"#FF4400",5000);
          postToDiscord({title:`⚔️ FACTION RAID — ${myFaction.name}!`,description:`**${TM[active]?.name}** launched a Faction Raid for the **${myFaction.name}** (${myFaction.icon})!\n\nStole **${targets.length} pixels** from enemy factions.\n\n**Current Standings:**\n${factionStandings.map((f,i)=>`${["🥇","🥈","🥉"][i]} ${f.icon} ${f.name}: ${f.pixels.toLocaleString()}px (${Math.round(f.pixels/totalPx*100)}%)`).join("\n")}`,color:parseInt(myFaction.color.slice(1),16),url:"https://www.pixelsofwar.com",footer:{text:"Pixels of War World War"},timestamp:new Date().toISOString()});
        };

        return(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(16px)"}} onClick={()=>setShowWorldWar(false)}>
          <div style={{background:"rgba(9,9,26,.99)",border:`2px solid ${myFaction?.color||"#FF4400"}55`,borderRadius:20,padding:"24px",width:520,maxWidth:"96vw",maxHeight:"90vh",overflow:"auto",animation:"pop .4s cubic-bezier(.34,1.56,.64,1)",boxShadow:`0 0 80px ${myFaction?.color||"#FF4400"}22`}} onClick={e=>e.stopPropagation()}>

            {/* Header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:900,color:"#FF4400",letterSpacing:3}}>🌍 WORLD WAR</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.3)",marginTop:2}}>3 FACTIONS · PERMANENT · EVERY PIXEL COUNTS</div>
              </div>
              <button onClick={()=>setShowWorldWar(false)} style={{background:"none",border:"none",color:"rgba(255,255,255,.3)",cursor:"pointer",fontSize:18}}>✕</button>
            </div>

            {/* Your faction badge */}
            {myFaction&&<div style={{background:`${myFaction.color}12`,border:`1px solid ${myFaction.color}44`,borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:24}}>{myFaction.icon}</span>
              <div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:900,color:myFaction.color}}>{myFaction.name}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.4)"}}>YOUR FACTION · {myFaction.desc}</div>
              </div>
              {myFaction.id===leader?.id&&<div style={{marginLeft:"auto",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#FFD700",animation:"pulse 1s infinite"}}>🥇 LEADING!</div>}
            </div>}

            {/* Faction standings */}
            <div style={{marginBottom:16}}>
              {factionStandings.map((f,i)=>{
                const pct=Math.round(f.pixels/totalPx*100);
                const isMe=myFaction?.id===f.id;
                const gap=i>0?factionStandings[0].pixels-f.pixels:0;
                return(
                  <div key={f.id} style={{marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <span style={{fontSize:16}}>{f.icon}</span>
                      <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:isMe?f.color:"#e0e8ff",flex:1}}>{f.name}{isMe?" (YOU)":""}</span>
                      <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:f.color}}>{f.pixels.toLocaleString()}</span>
                      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.3)",width:36,textAlign:"right"}}>{pct}%</span>
                    </div>
                    <div style={{height:6,background:"rgba(255,255,255,.06)",borderRadius:3,overflow:"hidden",position:"relative"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${f.color},${f.color}aa)`,borderRadius:3,transition:"width .8s",boxShadow:`0 0 8px ${f.color}88`}}/>
                    </div>
                    {i>0&&gap>0&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,255,255,.25)",textAlign:"right",marginTop:2}}>-{gap.toLocaleString()}px from #1</div>}
                    {/* Fandom breakdown */}
                    <div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>
                      {board.filter(t=>getFaction(t.id)?.id===f.id).slice(0,5).map(t=>(
                        <span key={t.id} style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:t.color||"#888",background:`${t.color||"#888"}18`,border:`1px solid ${t.color||"#888"}33`,borderRadius:3,padding:"1px 5px"}}>{t.name} {t.count}px</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Faction Raid button */}
            {myFaction&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
              <button onClick={doFactionRaid} disabled={!canRaid||warChest<30||!active} style={{width:"100%",padding:"14px",background:(!canRaid||warChest<30||!active)?"rgba(255,255,255,.05)":`linear-gradient(90deg,${myFaction.color}44,${myFaction.color}22)`,border:`1px solid ${(!canRaid||warChest<30||!active)?"rgba(255,255,255,.1)":myFaction.color+"66"}`,borderRadius:10,cursor:(!canRaid||warChest<30||!active)?"default":"pointer",fontFamily:"'Orbitron',monospace",fontSize:11,color:(!canRaid||warChest<30||!active)?"rgba(255,255,255,.3)":myFaction.color,fontWeight:900,letterSpacing:1}}>
                {!active?"SELECT A FANDOM FIRST":warChest<30?`NEED 30💰 GOLD (have ${warChest})`:`⚔️ FACTION RAID — STEAL 30px FOR ${myFaction.name} (30💰)`}
              </button>
              {!canRaid&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.3)",textAlign:"center"}}>
                ⏳ Next raid in {Math.ceil((wwCooldown-(Date.now()-wwLastRaid))/60000)} minutes
              </div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                {Object.values(FACTIONS).map(f=>(
                  <div key={f.id} style={{background:`${f.color}08`,border:`1px solid ${f.color}22`,borderRadius:7,padding:"8px",textAlign:"center"}}>
                    <div style={{fontSize:18,marginBottom:3}}>{f.icon}</div>
                    <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:f.color,lineHeight:1.3}}>{f.cats.join(", ")}</div>
                  </div>
                ))}
              </div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.2)",textAlign:"center"}}>
                Faction is auto-assigned by fandom category · Costs 30💰 War Chest gold · 5min cooldown · Posted to Discord
              </div>
            </div>}
            {!myFaction&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.4)",textAlign:"center",padding:"20px"}}>Select a fandom to join a faction and participate in the World War!</div>}
          </div>
        </div>
        );
      })()}

      {/* ── CANVAS CHALLENGE MODAL ──────────────────────────────────────────── */}
      {showCanvasChallenge&&canvasChallenge&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(12px)"}} onClick={()=>setShowCanvasChallenge(false)}>
        <div style={{background:"rgba(9,9,26,.98)",border:"2px solid rgba(255,45,120,.4)",borderRadius:20,padding:"28px",width:460,maxWidth:"96vw",animation:"pop .4s cubic-bezier(.34,1.56,.64,1)",boxShadow:"0 0 60px rgba(255,45,120,.15)"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:"#FF2D78",letterSpacing:2}}>🎨 CANVAS CHALLENGE</div>
            <button onClick={()=>setShowCanvasChallenge(false)} style={{background:"none",border:"none",color:"rgba(255,255,255,.3)",cursor:"pointer",fontSize:18}}>✕</button>
          </div>
          <div style={{background:"rgba(255,45,120,.06)",border:"1px solid rgba(255,45,120,.2)",borderRadius:12,padding:"16px 18px",marginBottom:16,textAlign:"center"}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.3)",marginBottom:8,letterSpacing:2}}>THIS WEEK'S PROMPT</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:"#fff",lineHeight:1.5}}>{canvasChallenge.prompt}</div>
          </div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.55)",lineHeight:1.7,marginBottom:16}}>
            Use your fandom's pixels to recreate this theme in your sector. Screenshot your art and share it in our Discord server for community voting. The most upvoted creation wins <strong style={{color:"#FFD700"}}>+50 bonus pixels</strong>!
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{window.open("https://discord.gg/4Da2avYyPF","_blank");setShowCanvasChallenge(false);}} style={{flex:1,padding:"11px",background:"rgba(88,101,242,.2)",border:"1px solid rgba(88,101,242,.4)",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#5865F2",fontWeight:900}}>📢 JOIN DISCORD TO VOTE</button>
              <button onClick={()=>{
                if(!active){pushToast("Select a fandom first!","#FF4400",2000);return;}
                if(dailyChallenge){setVx(Math.max(0,Math.min(GW-effVW,dailyChallenge.sx*SECTOR-10)));setVy(Math.max(0,Math.min(GH-effVH,dailyChallenge.sy*SECTOR-10)));}
                setShowCanvasChallenge(false);
                pushToast("🎨 Start painting! Screenshot your art and share on Discord!","#FF2D78",5000);
              }} style={{flex:1,padding:"11px",background:"linear-gradient(90deg,#FF2D78,#FF0066)",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#fff",fontWeight:900}}>🎨 START PAINTING →</button>
            </div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.2)",textAlign:"center"}}>New challenge every Monday · Community votes on Discord · Winners announced Sunday</div>
          </div>
        </div>
      </div>}

      {/* ── CLAN MODAL ─────────────────────────────────────────────────────── */}
      {showClanModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(12px)"}} onClick={()=>setShowClanModal(false)}>
        <div style={{background:"rgba(9,9,26,.98)",border:"1px solid rgba(0,245,255,.3)",borderRadius:20,padding:"28px",width:440,maxWidth:"96vw",animation:"pop .4s cubic-bezier(.34,1.56,.64,1)"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:"#00F5FF",letterSpacing:2}}>⚔️ CLAN SYSTEM</div>
            <button onClick={()=>setShowClanModal(false)} style={{background:"none",border:"none",color:"rgba(255,255,255,.3)",cursor:"pointer",fontSize:18}}>✕</button>
          </div>
          {clan?<>
            {/* Show current clan */}
            <div style={{background:"rgba(0,245,255,.06)",border:"1px solid rgba(0,245,255,.2)",borderRadius:12,padding:"16px",marginBottom:14,textAlign:"center"}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,color:"#00F5FF",marginBottom:4}}>[{clan.tag}] {clan.name}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.4)"}}>Joined {new Date(clan.joinedAt).toLocaleDateString()} · {clan.role}</div>
            </div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.5)",marginBottom:16,lineHeight:1.6}}>
              Your clan tag <strong style={{color:"#00F5FF"}}>[{clan.tag}]</strong> appears in chat next to your name. Rally your clan members to claim territory together — coordinate raids and defenses in Discord!
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{
                const shareMsg=`⚔️ Join my clan [${clan.tag}] ${clan.name} on Pixels of War!\n\nWe're conquering territory together — come fight with us!\n👉 https://www.pixelsofwar.com`;
                navigator.clipboard?.writeText(shareMsg).then(()=>pushToast("📋 Clan invite copied!","#00F5FF",3000));
              }} style={{flex:1,padding:"10px",background:"rgba(0,245,255,.1)",border:"1px solid rgba(0,245,255,.3)",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#00F5FF",fontWeight:900}}>📤 INVITE TO CLAN</button>
              <button onClick={()=>{setClan(null);localStorage.removeItem("pow_clan");pushToast("Left clan.","#FF4400",2000);setShowClanModal(false);}} style={{padding:"10px 14px",background:"rgba(255,68,0,.08)",border:"1px solid rgba(255,68,0,.25)",borderRadius:8,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#FF4400"}}>LEAVE</button>
            </div>
          </>:<>
            {/* Create or join clan */}
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.5)",marginBottom:16,lineHeight:1.6}}>
              Create a clan to unite players across fandoms. Your clan tag appears in chat, giving your group a persistent identity across seasons. Coordinate on Discord for maximum domination.
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.3)",marginBottom:4}}>CLAN NAME</div>
              <input value={clanInput} onChange={e=>setClanInput(e.target.value)} placeholder="e.g. Anime Alliance" maxLength={24} style={{width:"100%",padding:"10px 12px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.12)",borderRadius:8,color:"#e0e8ff",fontFamily:"'Rajdhani',sans-serif",fontSize:13,outline:"none"}}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{
                if(!requireAuth("clan"))return;
                if(!clanInput.trim()||clanInput.trim().length<3){pushToast("Clan name must be at least 3 characters.","#FF4400",2000);return;}
                const tag=clanInput.trim().slice(0,4).toUpperCase().replace(/[^A-Z0-9]/g,"");
                const newClan={name:clanInput.trim(),tag,role:"Leader",joinedAt:Date.now(),members:[user?.user_metadata?.full_name||"You"]};
                setClan(newClan);localStorage.setItem("pow_clan",JSON.stringify(newClan));
                pushToast(`⚔️ Clan [${tag}] ${clanInput.trim()} created! Invite your allies.`,"#00F5FF",4000);
                setShowClanModal(false);
              }} style={{flex:1,padding:"11px",background:"linear-gradient(90deg,#00F5FF44,#00F5FF22)",border:"1px solid #00F5FF66",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:10,color:"#00F5FF",fontWeight:900}}>⚔️ CREATE CLAN</button>
              <button onClick={()=>setShowClanModal(false)} style={{padding:"11px 16px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.25)"}}>CANCEL</button>
            </div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.2)",textAlign:"center",marginTop:10}}>Clan tag (first 4 letters) appears in chat · Free to create · No season reset</div>
          </>}
        </div>
      </div>}

      {/* LEVEL UP CELEBRATION */}
      {showLevelUp&&<div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:1001,pointerEvents:"none",textAlign:"center",animation:"pop .5s cubic-bezier(.34,1.56,.64,1)"}}>
        <div style={{background:"rgba(9,9,26,.97)",border:"2px solid rgba(255,215,0,.6)",borderRadius:20,padding:"28px 40px",boxShadow:"0 0 80px rgba(255,215,0,.3)"}}>
          <div style={{fontSize:48,marginBottom:8}}>{LEVEL_BADGES[showLevelUp]||"⭐"}</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,color:"rgba(255,255,255,.5)",letterSpacing:3,marginBottom:4}}>LEVEL UP!</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:32,fontWeight:900,color:"#FFD700",letterSpacing:4}}>LVL {showLevelUp}</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.4)",marginTop:8}}>+500💰 gold · Pixel cap increased · Keep conquering!</div>
        </div>
      </div>}

      {/* SECTOR ZOOM MODAL */}
      {sectorZoom&&(()=>{
        const{sx,sy}=sectorZoom;
        const k=sectorKey(sx,sy);
        const isUnlocked=unlockedSet.has(k);
        const sData=sectorLeaderboard.find(s=>s.sx===sx&&s.sy===sy);
        const fill=sectorFills[k]||0;
        const fillPct=Math.round(fill*100);
        const price=sectorBasePrice(sx,sy)*fillMultiplier(fill);
        // Count by fandom in this sector
        const counts={};
        for(let py=sy*SECTOR;py<(sy+1)*SECTOR;py++)
          for(let px2=sx*SECTOR;px2<(sx+1)*SECTOR;px2++){
            const p=pixels[py*GW+px2];
            if(p?.t)counts[p.t]=(counts[p.t]||0)+1;
          }
        const topFandoms=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);
        const leader=topFandoms[0];
        const leaderTeam=leader?TM[leader[0]]:null;
        return(
        <div style={{position:"fixed",bottom:80,right:16,zIndex:990,animation:"slideDown .3s ease"}} onClick={()=>setSectorZoom(null)}>
          <div style={{background:"rgba(6,6,18,.97)",border:`1px solid ${leaderTeam?rgba(leaderTeam.color,.4):"rgba(0,245,255,.3)"}`,borderRadius:14,padding:"14px 16px",width:220,boxShadow:`0 8px 32px rgba(0,0,0,.5),0 0 20px ${leaderTeam?rgba(leaderTeam.color,.1):"rgba(0,245,255,.05)"}`}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:"#00F5FF"}}>SECTOR {sx+1}-{sy+1}</div>
              <button onClick={()=>setSectorZoom(null)} style={{background:"none",border:"none",color:"rgba(255,255,255,.3)",cursor:"pointer",fontSize:14}}>✕</button>
            </div>
            {/* Fill bar */}
            <div style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.4)"}}>FILL</span>
                <span style={{fontFamily:"'Orbitron',monospace",fontSize:8,color:fillPct>70?"#FF4400":fillPct>40?"#FFD700":"#00FF88",fontWeight:900}}>{fillPct}%</span>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,.08)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${fillPct}%`,background:fillPct>70?"linear-gradient(90deg,#FF4400,#FF0000)":fillPct>40?"linear-gradient(90deg,#FFD700,#FF8800)":"linear-gradient(90deg,#00FF88,#00F5FF)",borderRadius:2,transition:"width .5s"}}/>
              </div>
            </div>
            {/* Leader */}
            {leaderTeam&&<div style={{background:rgba(leaderTeam.color,.08),border:`1px solid ${rgba(leaderTeam.color,.25)}`,borderRadius:7,padding:"6px 8px",marginBottom:8}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,255,255,.3)",marginBottom:2}}>DOMINATING</div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:leaderTeam.color}}>{leaderTeam.name}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.4)"}}>{leader[1]}px · {Math.round(leader[1]/(SECTOR*SECTOR)*100)}% of sector</div>
            </div>}
            {/* Top fandoms */}
            {topFandoms.length>1&&<div style={{marginBottom:10}}>
              {topFandoms.slice(1,4).map(([tid,cnt])=>(
                <div key={tid} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                  <div style={{width:6,height:6,borderRadius:1,background:TM[tid]?.color||"#888",flexShrink:0}}/>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.4)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{TM[tid]?.name||tid}</span>
                  <span style={{fontFamily:"'Orbitron',monospace",fontSize:7,color:"rgba(255,255,255,.3)"}}>{cnt}px</span>
                </div>
              ))}
            </div>}
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>{setVx(Math.max(0,Math.min(GW-VW,sx*SECTOR-20)));setVy(Math.max(0,Math.min(GH-VH,sy*SECTOR-20)));setSectorZoom(null);}} style={{flex:1,padding:"7px",background:"rgba(0,245,255,.1)",border:"1px solid rgba(0,245,255,.3)",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#00F5FF",fontWeight:900}}>→ ENTER</button>
              {!isUnlocked&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#FF4400",padding:"7px",border:"1px solid rgba(255,68,0,.3)",borderRadius:6}}>🔒 LOCKED</div>}
              {isUnlocked&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#C8FF00",padding:"7px",border:"1px solid rgba(200,255,0,.2)",borderRadius:6}}>€{price.toFixed(1)}/px</div>}
            </div>
          </div>
        </div>
        );
      })()}

      {/* SEASON STANDINGS MODAL */}
      {showStandings&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:998,backdropFilter:"blur(10px)"}} onClick={()=>setShowStandings(false)}>
        <div style={{background:"rgba(9,9,26,.98)",border:"1px solid rgba(255,215,0,.3)",borderRadius:20,padding:"28px",width:480,maxWidth:"96vw",maxHeight:"85vh",overflow:"auto",animation:"pop .4s cubic-bezier(.34,1.56,.64,1)",boxShadow:"0 0 60px rgba(255,215,0,.1)"}} onClick={e=>e.stopPropagation()}>
          {/* Header */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
            <div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:"#FFD700",letterSpacing:2}}>🏆 SEASON {season.num} STANDINGS</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.3)",marginTop:2}}>{currentTheme.icon} {currentTheme.name} · {seasonDaysLeft}d remaining · {countdownStr}</div>
            </div>
            <button onClick={()=>setShowStandings(false)} style={{background:"none",border:"none",color:"rgba(255,255,255,.3)",cursor:"pointer",fontSize:18}}>✕</button>
          </div>

          {/* Season progress */}
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.3)"}}>SEASON PROGRESS</span>
              <span style={{fontFamily:"'Orbitron',monospace",fontSize:8,color:seasonDaysLeft<=7?"#FF4400":"#FFD700"}}>{Math.round((1-seasonDaysLeft/SEASON_DAYS)*100)}% COMPLETE</span>
            </div>
            <div style={{height:6,background:"rgba(255,255,255,.06)",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${(1-seasonDaysLeft/SEASON_DAYS)*100}%`,background:seasonDaysLeft<=7?"linear-gradient(90deg,#FF4400,#FF0000)":"linear-gradient(90deg,#FFD700,#C8FF00)",borderRadius:3,transition:"width 1s"}}/>
            </div>
          </div>

          {/* Top 20 leaderboard */}
          <div style={{marginBottom:16}}>
            {board.slice(0,20).map((t,i)=>{
              const isMe=t.id===active;
              const myPx=active?Object.values(pixels).filter(p=>p?.t===active).length:0;
              const pct=board[0].count?((t.count/board[0].count)*100):0;
              const gridPct=((t.count/(GW*GH))*100).toFixed(3);
              return(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",marginBottom:4,background:isMe?`rgba(${rgba(t.color,.1).slice(5,-1)},.15)`:"rgba(255,255,255,.02)",border:`1px solid ${isMe?t.color+"44":"rgba(255,255,255,.05)"}`,borderRadius:8,transition:"all .2s"}}>
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:i<3?"#FFD700":"rgba(255,255,255,.25)",fontWeight:900,width:24,flexShrink:0}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}</div>
                  <div style={{width:8,height:8,borderRadius:2,background:t.color,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:isMe?t.color:"#e0e8ff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}{isMe?" (YOU)":""}</div>
                    <div style={{height:3,background:"rgba(255,255,255,.06)",borderRadius:2,marginTop:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:t.color,borderRadius:2}}/>
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:t.color}}>{t.count.toLocaleString()}</div>
                    <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,255,255,.3)"}}>{gridPct}%</div>
                  </div>
                  {isMe&&i>0&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#FF4400",flexShrink:0}}>-{(board[i-1].count-t.count).toLocaleString()}</div>}
                </div>
              );
            })}
            {board.length===0&&<div style={{textAlign:"center",padding:"32px",fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.2)"}}>No pixels claimed yet. Be the first!</div>}
          </div>

          {/* Hall of Fame */}
          {season.winners?.length>0&&<div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:"rgba(255,215,0,.5)",letterSpacing:2,marginBottom:10}}>📜 PAST CHAMPIONS</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[...season.winners].reverse().map((w,i)=>(
                <div key={i} style={{background:"rgba(255,215,0,.05)",border:"1px solid rgba(255,215,0,.15)",borderRadius:6,padding:"6px 10px",textAlign:"center",flex:1,minWidth:80}}>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,215,0,.4)",marginBottom:2}}>S{w.season}</div>
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:900,color:"#FFD700",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.team}</div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:6,color:"rgba(255,255,255,.25)"}}>{w.pixels?.toLocaleString()}px</div>
                </div>
              ))}
            </div>
          </div>}

          <div style={{marginTop:16,textAlign:"center",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.2)"}}>
            Press <strong style={{color:"rgba(255,255,255,.4)"}}>T</strong> to toggle · ESC to close
          </div>
        </div>
      </div>}

      {/* DECAY ALERT MODAL */}
      {showDecayAlert&&active&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:997,backdropFilter:"blur(8px)"}} onClick={()=>setShowDecayAlert(false)}>
        <div style={{background:"rgba(9,9,26,.98)",border:"1px solid rgba(255,200,0,.5)",borderRadius:18,padding:"32px 28px",width:380,maxWidth:"94vw",animation:"pop .4s cubic-bezier(.34,1.56,.64,1)",textAlign:"center",boxShadow:"0 0 60px rgba(255,200,0,.15)"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:48,marginBottom:12,animation:"pulse 1.5s ease-in-out infinite"}}>⚠️</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:15,fontWeight:900,color:"#FFD700",letterSpacing:2,marginBottom:8}}>PIXELS FADING!</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"rgba(255,255,255,.5)",marginBottom:20,lineHeight:1.6}}>
            <span style={{color:"#FFD700",fontSize:20,fontWeight:900}}>{decayStats.warn}</span> of your pixels are decaying.<br/>
            {decayStats.expired>0&&<><span style={{color:"#FF4400",fontSize:16,fontWeight:900}}>{decayStats.expired}</span> have already expired.<br/></>}
            Use a <strong style={{color:"#00FFAA"}}>♻️ Renewal Shield</strong> to save them before they're gone!
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{setShowDecayAlert(false);setMode("SHOP");}} style={{flex:1,padding:"13px",background:"linear-gradient(90deg,rgba(0,255,170,.2),rgba(0,255,170,.05))",border:"1px solid rgba(0,255,170,.5)",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:10,color:"#00FFAA",letterSpacing:1,fontWeight:900}}>♻️ GET RENEWAL SHIELD</button>
            <button onClick={()=>setShowDecayAlert(false)} style={{padding:"13px 16px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.3)"}}>LATER</button>
          </div>
        </div>
      </div>}

      {/* LOADING */}
      {loading&&<div style={{position:"fixed",inset:0,background:"#040408",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:1000,gap:0}}>
        {/* Animated pixel grid background */}
        <div style={{position:"absolute",inset:0,overflow:"hidden",opacity:.4}}>
          {Array.from({length:40}).map((_,i)=>(
            <div key={i} style={{position:"absolute",width:14,height:14,borderRadius:2,background:["#00B4F0","#9747FF","#FF4655","#62B32F","#FF6B35","#FF1493","#FFD700"][i%7],left:`${(i*37)%97}%`,top:`${(i*53)%97}%`,animation:`pulse ${1.5+i*.15}s ease-in-out infinite`,animationDelay:`${(i*.2)%2}s`,opacity:.6}}/>
          ))}
        </div>
        {/* Logo */}
        <div style={{position:"relative",textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:52,marginBottom:12,filter:"drop-shadow(0 0 20px rgba(0,245,255,.5))"}}>⚔️</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:32,fontWeight:900,letterSpacing:6,background:"linear-gradient(90deg,#00F5FF,#C8FF00,#FF4400)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1,marginBottom:6}}>PIXELS OF WAR</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,255,255,.25)",letterSpacing:4}}>FANDOMS · TERRITORY · WAR</div>
        </div>
        {/* Loading bar */}
        <div style={{width:200,height:3,background:"rgba(255,255,255,.08)",borderRadius:2,overflow:"hidden",marginBottom:14}}>
          <div style={{height:"100%",background:"linear-gradient(90deg,#00F5FF,#C8FF00,#FF4400)",borderRadius:2,animation:"loadingBar 1.8s ease-in-out infinite"}}/>
        </div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(0,245,255,.5)",letterSpacing:3,animation:"pulse 1.2s infinite"}}>{isOnline?"CONNECTING TO WAR SERVERS…":"LOADING…"}</div>
        <style>{`@keyframes loadingBar{0%{width:0%;margin-left:0}50%{width:100%;margin-left:0}100%{width:0%;margin-left:100%}}`}</style>
        {/* Hall of Fame on loading screen */}
        {season.winners&&season.winners.length>0&&<div style={{position:"relative",marginTop:28,textAlign:"center",maxWidth:340,padding:"0 16px"}}>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:8,color:"rgba(255,215,0,.4)",letterSpacing:3,marginBottom:10}}>🏆 HALL OF FAME</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
            {[...season.winners].reverse().slice(0,5).map((w,i)=>(
              <div key={i} style={{background:"rgba(255,215,0,.06)",border:"1px solid rgba(255,215,0,.15)",borderRadius:6,padding:"4px 10px",textAlign:"center"}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,215,0,.4)",marginBottom:2}}>S{w.season}</div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:900,color:"#FFD700"}}>{w.team}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:6,color:"rgba(255,255,255,.25)"}}>{w.pixels?.toLocaleString()}px</div>
              </div>
            ))}
          </div>
        </div>}
      </div>}

      {/* ── HEADER ── */}
      <div style={{background:"#06060e",borderBottom:"1px solid #1a1a30",padding:"7px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,rgba(0,245,255,.05),transparent 30%,rgba(255,68,0,.03) 70%,transparent)",pointerEvents:"none"}}/>
        <div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:20,fontWeight:900,letterSpacing:4,background:"linear-gradient(90deg,#00F5FF,#FF4400,#C8FF00)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>⚔ PIXELS OF WAR</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#2a2a4a",letterSpacing:1.5,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            S{season.num} · {currentTheme.icon} {currentTheme.name}
            <span style={{width:5,height:5,borderRadius:"50%",background:isOnline?"#00FF88":"#FF4400",display:"inline-block",animation:isOnline?"pulse 2s infinite":undefined}}/>
            <span style={{color:isOnline?"#00FF88":"#FF4400"}}>{isOnline?"LIVE":"OFFLINE"}</span>
            <span style={{color:onlineCount>1?"#00FF88":"rgba(0,255,136,.4)",fontWeight:onlineCount>1?900:400,animation:onlineCount>1?"pulse 1.5s infinite":undefined}}>· {onlineCount>1?`⚔️ ${onlineCount} WARRIORS ONLINE`:`🟢 ${onlineCount} online`}</span>
            {totalPlayers>0&&<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#2a2a4a"}}>· {totalPlayers} joined</span>}
          </div>
          <button onClick={()=>navigate("/fandoms")} style={{marginTop:3,background:"rgba(0,245,255,.06)",border:"1px solid rgba(0,245,255,.2)",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#00F5FF",letterSpacing:1}}>🔍 FANDOMS</button>
          <a href="/how-to-play.html" style={{marginTop:3,display:"inline-block",background:"rgba(200,255,0,.06)",border:"1px solid rgba(200,255,0,.2)",borderRadius:4,padding:"2px 8px",fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#C8FF00",letterSpacing:1,textDecoration:"none"}}>❓ HOW TO PLAY</a>
          <a href="/rivalries" style={{marginTop:3,display:"inline-block",background:"rgba(255,68,0,.06)",border:"1px solid rgba(255,68,0,.2)",borderRadius:4,padding:"2px 8px",fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#FF4400",letterSpacing:1,textDecoration:"none"}}>⚔️ RIVALRIES</a>
          <button onClick={()=>setShowStandings(true)} style={{marginTop:3,background:"rgba(255,215,0,.08)",border:"1px solid rgba(255,215,0,.3)",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#FFD700",letterSpacing:1,fontWeight:900}}>🏆 STANDINGS</button>
          <button onClick={()=>{setShowPaywall(true);setPaywallTab("bundles");}} style={{marginTop:3,background:"linear-gradient(90deg,rgba(200,255,0,.15),rgba(200,255,0,.05))",border:"1px solid rgba(200,255,0,.4)",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:7,color:"#C8FF00",letterSpacing:1,fontWeight:900,animation:"pulse 3s infinite"}}>💰 GET PIXELS</button>
          <button onClick={()=>setShowClanModal(true)} style={{marginTop:3,background:"rgba(0,245,255,.06)",border:`1px solid ${clan?"rgba(0,245,255,.4)":"rgba(0,245,255,.2)"}`,borderRadius:4,padding:"2px 8px",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:7,color:"#00F5FF",letterSpacing:1,fontWeight:900}}>{clan?`⚔️ [${clan.tag}]`:"⚔️ CLAN"}</button>
          {hasSeasonPass&&<div style={{marginTop:3,background:"rgba(255,215,0,.1)",border:"1px solid rgba(255,215,0,.4)",borderRadius:4,padding:"2px 8px",fontFamily:"'Orbitron',monospace",fontSize:7,color:"#FFD700",letterSpacing:1,fontWeight:900}}>🏆 PASS</div>}
          <button onClick={()=>{if(!requireAuth("fandom"))return;navigate("/request-fandom");}} style={{marginTop:3,background:"rgba(200,255,0,.1)",border:"1px solid rgba(200,255,0,.5)",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#C8FF00",letterSpacing:1,fontWeight:900}}>➕ REQUEST FANDOM</button>

          {/* RIVAL WIDGET */}
          {rivalId&&TM[rivalId]&&active&&<div style={{marginTop:8,background:`rgba(255,68,0,.06)`,border:`1px solid rgba(255,68,0,.25)`,borderRadius:8,padding:"8px 10px",animation:"slideDown .3s ease"}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:7,color:"#FF4400",letterSpacing:2,marginBottom:6,display:"flex",alignItems:"center",gap:4}}>⚔️ YOUR RIVAL</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:TM[rivalId].color,boxShadow:`0 0 6px ${TM[rivalId].color}`,flexShrink:0}}/>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:900,color:TM[rivalId].color,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{TM[rivalId].name}</div>
              </div>
              <div style={{display:"flex",gap:4}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,255,255,.3)"}}>
                  {Object.values(pixels).filter(p=>p?.t===active).length}px
                  <span style={{color:"#FF4400",margin:"0 3px"}}>vs</span>
                  {Object.values(pixels).filter(p=>p?.t===rivalId).length}px
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:4,marginTop:6}}>
              <button onClick={()=>{if(!requireAuth("war"))return;declareWar(rivalId);}} style={{flex:1,padding:"4px",background:"rgba(255,68,0,.1)",border:"1px solid rgba(255,68,0,.3)",borderRadius:4,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:7,color:"#FF4400",fontWeight:900}}>⚔️ WAR</button>
              <button onClick={()=>{setMode("RAID");pushToast(`🎯 Target: ${TM[rivalId].name}!`,"#FF4400",3000);}} style={{flex:1,padding:"4px",background:"rgba(255,68,0,.08)",border:"1px solid rgba(255,68,0,.2)",borderRadius:4,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#FF6644"}}>🗡️ RAID</button>
            </div>
          </div>}

          {/* DECAY WARNING */}
          {decayStats.warn>0&&active&&<div onClick={()=>setShowDecayAlert(true)} style={{marginTop:6,background:"rgba(255,200,0,.06)",border:"1px solid rgba(255,200,0,.3)",borderRadius:6,padding:"5px 8px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,animation:"pulse 2s ease-in-out infinite"}}>
            <span style={{fontSize:14}}>⚠️</span>
            <div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:7,color:"#FFD700",fontWeight:900}}>{decayStats.warn}px FADING</div>
              {decayStats.expired>0&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:6,color:"#FF4400"}}>{decayStats.expired}px expired</div>}
            </div>
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,255,255,.2)",marginLeft:"auto"}}>TAP →</span>
          </div>}
          <button onClick={()=>{if(!requireAuth("advertise"))return;setShowSponsor(true);}} style={{marginTop:3,background:"rgba(255,215,0,.1)",border:"1px solid rgba(255,215,0,.4)",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#FFD700",letterSpacing:1,fontWeight:900}}>📣 ADVERTISE</button>
          <div style={{display:"flex",gap:6,marginTop:3,flexWrap:"wrap"}}>
            <a href="/contact" style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#4a4a6a",textDecoration:"none",letterSpacing:1,border:"1px solid #1a1a30",borderRadius:3,padding:"1px 5px"}}>CONTACT</a>
            <a href="/terms" style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#4a4a6a",textDecoration:"none",letterSpacing:1,border:"1px solid #1a1a30",borderRadius:3,padding:"1px 5px"}}>TERMS</a>
            <a href="/privacy" style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#4a4a6a",textDecoration:"none",letterSpacing:1,border:"1px solid #1a1a30",borderRadius:3,padding:"1px 5px"}}>PRIVACY</a>
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          {freePixels>0&&<div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,215,0,.08)",border:"1px solid rgba(255,215,0,.3)",borderRadius:7,padding:"4px 9px",cursor:"pointer"}} onClick={gatedOpenDaily}>
            <span style={{fontSize:13}}>🎁</span><div><div style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:"#FFD700"}}>{freePixels+(rechargePixels||0)}px FREE</div><div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:6,color:"#5a5a5a"}}>{rechargePixels>0?`+${rechargePixels}⏰`:alreadyClaimedToday?"CLAIMED":"TAP"}</div></div>
          </div>}
          <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,45,120,.07)",border:"1px solid rgba(255,45,120,.25)",borderRadius:7,padding:"4px 9px",cursor:"pointer"}} onClick={gatedOpenDaily}>
            <span style={{fontSize:13}}>🔥</span><div><div style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:"#FF2D78"}}>{streakData.days}d</div><div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:6,color:"#5a5a5a"}}>{alreadyClaimedToday?"✅":"STREAK"}</div></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,background:rgba(myRank.color,.07),border:`1px solid ${rgba(myRank.color,.25)}`,borderRadius:7,padding:"4px 9px"}}>
            <span style={{fontSize:13}}>{myRank.icon}</span><div><div style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:myRank.color}}>{myRank.name}</div><div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:6,color:"#5a5a5a"}}>{myPixels}px</div></div>
          </div>
          {/* Faction badge */}
          {active&&(()=>{const f=getFaction(active);if(!f)return null;return(
            <div onClick={()=>setShowWorldWar(true)} style={{display:"flex",alignItems:"center",gap:4,background:`${f.color}10`,border:`1px solid ${f.color}44`,borderRadius:7,padding:"4px 9px",cursor:"pointer"}} title={f.name}>
              <span style={{fontSize:12}}>{f.icon}</span>
              <div><div style={{fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:900,color:f.color}}>{f.id}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:6,color:"#5a5a5a"}}>{(factionStandings.find(fs=>fs.id===f.id)?.pixels||0).toLocaleString()}px</div></div>
            </div>
          );})()}
          {/* XP Level badge */}
          {user&&<div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,215,0,.07)",border:"1px solid rgba(255,215,0,.25)",borderRadius:7,padding:"4px 9px",cursor:"pointer",position:"relative"}} title={`XP: ${xp} | Next level: ${xpForLevel(playerLevel+1)} XP`}>
            <span style={{fontSize:12}}>{LEVEL_BADGES[playerLevel]||"⭐"}</span>
            <div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:900,color:"#FFD700"}}>LVL {playerLevel}</div>
              <div style={{width:40,height:3,background:"rgba(255,255,255,.1)",borderRadius:2,marginTop:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min(100,((xp-xpForLevel(playerLevel))/(xpForLevel(playerLevel+1)-xpForLevel(playerLevel)))*100)}%`,background:"linear-gradient(90deg,#FFD700,#FF8800)",borderRadius:2}}/>
              </div>
            </div>
            {rechargePixels>0&&<div style={{position:"absolute",top:-4,right:-4,background:"#00FF88",color:"#040408",borderRadius:"50%",width:14,height:14,fontSize:7,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontFamily:"'Orbitron',monospace"}}>+{rechargePixels}</div>}
          </div>}
          {/* User auth — only show when logged in */}
          {user&&(
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"3px 8px",background:"rgba(88,101,242,.1)",border:"1px solid rgba(88,101,242,.3)",borderRadius:6,cursor:"pointer"}} onClick={()=>supabase?.auth.signOut()}>
              {profile?.avatar_url&&<img src={profile.avatar_url} style={{width:18,height:18,borderRadius:"50%"}} alt="avatar"/>}
              <span style={{fontFamily:"'Orbitron',monospace",fontSize:8,color:"#7289DA",maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profile?.username||"Player"}</span>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#C8FF00"}}>{profile?.free_pixels||0}px free</span>
            </div>
          )}
          {event&&<div style={{display:"flex",alignItems:"center",gap:5,background:rgba(event.color,.1),border:`1px solid ${rgba(event.color,.4)}`,borderRadius:7,padding:"4px 10px",animation:"pulse 2s infinite"}}>
            <span style={{fontSize:14}}>{event.icon}</span>
            <div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:900,color:event.color,letterSpacing:1,whiteSpace:"nowrap"}}>{event.label}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:event.color,opacity:.7}}>{Math.floor(eventTimer/60)}:{String(eventTimer%60).padStart(2,"0")} · {event.desc}</div>
            </div>
          </div>}
        </div>
        <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"center"}}>
          {[["SOLD",totalSold.toLocaleString(),"#00F5FF"],["€ REV",`€${totalSold}`,"#C8FF00"],["SECTORS",`${unlockedSectors.length}/400`,"#FF2D78"]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"right"}}><div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:c}}>{v}</div><div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#2a2a4a",letterSpacing:1}}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* GUEST BANNER */}
      {!user&&!loading&&<div style={{background:"rgba(88,101,242,.1)",borderBottom:"1px solid rgba(88,101,242,.3)",padding:"5px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:14}}>{guestPixelsUsed>=GUEST_MAX?"🔒":"👀"}</span>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#7289DA"}}>
            {guestPixelsUsed>=GUEST_MAX
              ? <>Guest limit reached — <strong style={{color:"#FFD700"}}>Login to claim unlimited pixels + 25 FREE</strong></>
              : <><strong style={{color:"#C8FF00"}}>{GUEST_MAX-guestPixelsUsed} free pixel{GUEST_MAX-guestPixelsUsed!==1?"s":""} left</strong> — Login with Discord for 25 more + save your territory</>}
          </span>
        </div>
        <button onClick={()=>setShowAuthModal(true)} style={{padding:"4px 14px",background:"linear-gradient(90deg,#5865F2,#7289DA)",border:"none",borderRadius:5,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:900,color:"#fff",letterSpacing:1}}>LOGIN WITH DISCORD →</button>
      </div>}

      {/* SUPABASE ERROR STATE */}
      {!loading&&!isOnline&&<div style={{background:"rgba(255,68,0,.08)",borderBottom:"1px solid rgba(255,68,0,.3)",padding:"5px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{animation:"pulse .8s infinite",fontSize:14}}>⚠️</span>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#FF4400"}}>War servers offline — playing in local mode. Progress may not sync.</span>
        </div>
        <button onClick={()=>window.location.reload()} style={{padding:"3px 10px",background:"rgba(255,68,0,.1)",border:"1px solid rgba(255,68,0,.4)",borderRadius:4,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#FF4400",letterSpacing:1}}>RETRY</button>
      </div>}

      {/* SPONSORED BANNER STRIP */}
      {sponsoredBanners.length>0&&<div style={{background:"rgba(255,215,0,.06)",borderBottom:"1px solid rgba(255,215,0,.2)",height:26,overflow:"hidden",display:"flex",alignItems:"center",position:"relative"}}>
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:90,background:"rgba(4,4,12,.98)",zIndex:2,display:"flex",alignItems:"center",paddingLeft:8,borderRight:"1px solid rgba(255,215,0,.2)",flexShrink:0}}>
          <span style={{fontFamily:"'Orbitron',monospace",fontSize:7,color:"#FFD700",letterSpacing:1,whiteSpace:"nowrap",fontWeight:900}}>📣 SPONSORED</span>
        </div>
        <div style={{position:"absolute",right:0,top:0,bottom:0,width:90,background:"rgba(4,4,12,.98)",zIndex:2,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:8,borderLeft:"1px solid rgba(255,215,0,.2)",flexShrink:0}}>
          <span style={{fontFamily:"'Orbitron',monospace",fontSize:7,color:"#FFD700",letterSpacing:1,whiteSpace:"nowrap",fontWeight:900}}>SPONSORED 📣</span>
        </div>
        <div style={{marginLeft:90,marginRight:90,overflow:"hidden",flex:1,display:"flex",alignItems:"center"}}>
          <div style={{display:"flex",gap:"80px",whiteSpace:"nowrap",animation:`sponsorTicker ${Math.max(20,sponsoredBanners.length*15)}s linear infinite`}}>
            {[...sponsoredBanners,...sponsoredBanners].map((b,i)=>(
              <span key={i} style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#FFD700",letterSpacing:.5}}>
                ★ {b.message} ★
              </span>
            ))}
          </div>
        </div>
        <style>{`@keyframes sponsorTicker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      </div>}

      {/* LIVE BATTLE FIRST-VISIT BANNER */}
      {showLiveBattleBanner&&!loading&&<div style={{background:"linear-gradient(90deg,rgba(255,68,0,.15),rgba(255,68,0,.05),transparent)",borderBottom:"1px solid rgba(255,68,0,.3)",padding:"5px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,animation:"slideDown .3s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{animation:"pulse .8s infinite",fontSize:14}}>⚡</span>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.7)"}}>
            <strong style={{color:"#FF4400"}}>FREE LIVE BATTLE</strong> is happening now — 200×200 arena, no payment needed. Claim spots for your fandom!
          </span>
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0}}>
          <button onClick={()=>{setShowLiveBattle(true);setShowLiveBattleBanner(false);localStorage.setItem("pow_seen_live_battle","1");}} style={{padding:"4px 12px",background:"linear-gradient(90deg,#FF4400,#FF2D00)",border:"none",borderRadius:5,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#fff",fontWeight:900,letterSpacing:1}}>JOIN NOW →</button>
          <button onClick={()=>{setShowLiveBattleBanner(false);localStorage.setItem("pow_seen_live_battle","1");}} style={{padding:"4px 8px",background:"transparent",border:"none",cursor:"pointer",color:"rgba(255,255,255,.3)",fontSize:14}}>✕</button>
        </div>
      </div>}

      {/* ENEMY NEARBY ALERT */}
      {enemyNearby&&<div style={{background:"linear-gradient(90deg,rgba(255,68,0,.2),rgba(255,68,0,.05),transparent)",borderBottom:"1px solid rgba(255,68,0,.4)",padding:"4px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,animation:"slideDown .2s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{animation:"pulse .5s infinite",fontSize:13}}>⚠️</span>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#FF4400"}}>
            <strong style={{color:enemyNearby.color}}>{enemyNearby.name}</strong> is claiming territory near you!
          </span>
        </div>
        <button onClick={()=>{setEnemyNearby(null);setMode("RAID");}} style={{padding:"3px 10px",background:"rgba(255,68,0,.2)",border:"1px solid rgba(255,68,0,.5)",borderRadius:4,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#FF4400",fontWeight:900}}>⚔️ RAID BACK</button>
      </div>}

      {/* SEASON BANNER */}
      <div style={{background:seasonDaysLeft<=7?"linear-gradient(90deg,rgba(255,68,0,.12),rgba(255,215,0,.06),transparent)":"linear-gradient(90deg,rgba(255,215,0,.06),rgba(200,255,0,.03),transparent)",borderBottom:`1px solid ${seasonDaysLeft<=7?"rgba(255,68,0,.25)":"rgba(255,215,0,.12)"}`,padding:"4px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span>{currentTheme.icon}</span>
          <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:"#FFD700"}}>SEASON {season.num}</span>
          {/* Prominent countdown */}
          <div style={{display:"flex",alignItems:"center",gap:4,background:seasonDaysLeft<=2?"rgba(255,68,0,.15)":seasonDaysLeft<=7?"rgba(255,150,0,.1)":"rgba(255,255,255,.04)",border:`1px solid ${seasonDaysLeft<=2?"rgba(255,68,0,.5)":seasonDaysLeft<=7?"rgba(255,150,0,.3)":"rgba(255,255,255,.08)"}`,borderRadius:5,padding:"2px 8px",animation:seasonDaysLeft<=2?"pulse .8s infinite":undefined}}>
            <span style={{fontFamily:"'Orbitron',monospace",fontSize:seasonDaysLeft<=7?10:9,fontWeight:900,color:seasonDaysLeft<=2?"#FF4400":seasonDaysLeft<=7?"#FFD700":"rgba(255,255,255,.4)"}}>
              {seasonDaysLeft<=2?"🔥 ":seasonDaysLeft<=7?"⏰ ":""}{countdownStr}
            </span>
          </div>
          {decayStats.warn>0&&<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#FFD700",background:"rgba(255,200,0,.1)",border:"1px solid rgba(255,200,0,.25)",borderRadius:4,padding:"1px 6px"}}>⚠️ {decayStats.warn}px fading</span>}
          {decayStats.expired>0&&<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#FF4400",background:"rgba(255,68,0,.1)",border:"1px solid rgba(255,68,0,.25)",borderRadius:4,padding:"1px 6px"}}>❌ {decayStats.expired}px expired</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={()=>setShowHeatmap(s=>!s)} style={{background:showHeatmap?"rgba(255,100,0,.2)":"rgba(255,100,0,.05)",border:`1px solid ${showHeatmap?"rgba(255,100,0,.6)":"rgba(255,100,0,.2)"}`,borderRadius:5,padding:"2px 9px",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#FF6422",letterSpacing:1,transition:"all .15s"}}>{showHeatmap?"HIDE":"🔥 HEATMAP"}</button>
          <button onClick={()=>setShowLiveBattle(true)} style={{background:"rgba(255,68,0,.15)",border:"1px solid rgba(255,68,0,.5)",borderRadius:5,padding:"2px 9px",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#FF4400",letterSpacing:1,animation:"pulse 2s infinite"}}>⚡ LIVE BATTLE</button>
          <button onClick={()=>setShowWorldWar(true)} style={{background:"rgba(255,68,0,.12)",border:"1px solid rgba(255,100,0,.45)",borderRadius:5,padding:"2px 9px",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#FF6600",letterSpacing:1,fontWeight:900}}>🌍 WORLD WAR</button>
          <button onClick={()=>{
            // Random Sector — pan to a random active sector
            const activeSectors=sectorLeaderboard.filter(s=>s.total>10);
            if(activeSectors.length===0){pushToast("No active sectors yet!","#FF4400",2000);return;}
            const pick=activeSectors[Math.floor(Math.random()*Math.min(activeSectors.length,20))];
            setVx(Math.max(0,Math.min(GW-VW,pick.sx*SECTOR-20)));
            setVy(Math.max(0,Math.min(GH-VH,pick.sy*SECTOR-20)));
            setSectorZoom({sx:pick.sx,sy:pick.sy});
            setTimeout(()=>setSectorZoom(null),6000);
            pushToast(`🎲 Jumped to ${pick.leader?.name||"active"} sector!`,"#C8FF00",2500);
          }} style={{background:"rgba(200,255,0,.08)",border:"1px solid rgba(200,255,0,.25)",borderRadius:5,padding:"2px 9px",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#C8FF00",letterSpacing:1}}>🎲 RANDOM</button>
          <button onClick={()=>setShowPriceMap(s=>!s)} style={{background:showPriceMap?"rgba(0,245,255,.15)":"rgba(0,245,255,.05)",border:`1px solid ${showPriceMap?"rgba(0,245,255,.5)":"rgba(0,245,255,.15)"}`,borderRadius:5,padding:"2px 9px",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#00F5FF",transition:"all .15s"}}>{showPriceMap?"HIDE":"💰 PRICES"}</button>
        </div>
      </div>

      {/* MINI SEASON BANNER */}
      {miniSeason&&<div style={{background:"linear-gradient(90deg,rgba(255,215,0,.1),rgba(255,215,0,.04),transparent)",borderBottom:"1px solid rgba(255,215,0,.3)",padding:"5px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",animation:"slideDown .3s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{animation:"pulse .8s infinite",fontSize:13}}>⚡</span>
          <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:"#FFD700",letterSpacing:2}}>MINI SEASON</span>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.4)"}}>{miniSeason.label}</span>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.25)"}}>· Sector {miniSeason.sector_x+1}-{miniSeason.sector_y+1}</span>
          {miniSeasonLeader&&<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:miniSeasonLeader.color}}>🥇 {miniSeasonLeader.name} {miniSeasonLeader.count}px</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#FFD700"}}>{miniSeasonDaysLeft}d · {miniSeason.prize}</span>
          <button onClick={()=>{setVx(Math.max(0,miniSeason.sector_x*SECTOR-40));setVy(Math.max(0,miniSeason.sector_y*SECTOR-30));}} style={{padding:"2px 7px",background:"rgba(255,215,0,.12)",border:"1px solid rgba(255,215,0,.35)",borderRadius:4,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#FFD700"}}>GO →</button>
        </div>
      </div>}

      {/* WEEKLY THEME BANNER */}
      <div style={{background:`linear-gradient(90deg,${weeklyTheme.color}18,${weeklyTheme.color}06,transparent)`,borderBottom:`1px solid ${weeklyTheme.color}33`,padding:"4px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:13}}>{weeklyTheme.icon}</span>
          <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:900,color:weeklyTheme.color,letterSpacing:1}}>{weeklyTheme.label}</span>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.35)"}}>{weeklyTheme.desc}</span>
          {active&&isThemeFandom(active)&&<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:weeklyTheme.color,background:`${weeklyTheme.color}22`,border:`1px solid ${weeklyTheme.color}44`,borderRadius:4,padding:"1px 6px",animation:"pulse 1.5s infinite"}}>✅ YOUR FANDOM BENEFITS!</span>}
          {canvasChallenge&&<button onClick={()=>setShowCanvasChallenge(true)} style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#FF2D78",background:"rgba(255,45,120,.1)",border:"1px solid rgba(255,45,120,.3)",borderRadius:4,padding:"1px 8px",cursor:"pointer"}}>🎨 CANVAS CHALLENGE</button>}
        </div>
        {/* War Chest display */}
        {active&&<button onClick={()=>setShowWarChest(s=>!s)} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px",background:"rgba(255,215,0,.1)",border:"1px solid rgba(255,215,0,.3)",borderRadius:5,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#FFD700",fontWeight:900}}>
          💰 {warChest} GOLD
        </button>}
      </div>

      {/* DAILY SECTOR CHALLENGE BANNER */}
      {dailyChallenge&&dailyChallenge.endsAt>Date.now()&&<div style={{background:"linear-gradient(90deg,rgba(200,255,0,.12),rgba(200,255,0,.04),transparent)",borderBottom:"1px solid rgba(200,255,0,.3)",padding:"4px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,animation:"pulse 3s infinite"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:13,animation:"pulse .8s infinite"}}>⚡</span>
          <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:900,color:"#C8FF00",letterSpacing:1}}>DAILY CHALLENGE</span>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.5)"}}>Sector {dailyChallenge.sx+1}-{dailyChallenge.sy+1} is <strong style={{color:"#C8FF00"}}>50% OFF</strong> for {Math.max(0,Math.floor((dailyChallenge.endsAt-Date.now())/60000))}min!</span>
        </div>
        <button onClick={()=>{setVx(Math.max(0,Math.min(GW-effVW,dailyChallenge.sx*SECTOR-10)));setVy(Math.max(0,Math.min(GH-effVH,dailyChallenge.sy*SECTOR-10)));pushToast(`⚡ Jumped to the Daily Challenge sector! 50% OFF!`,"#C8FF00",3000);}} style={{padding:"3px 10px",background:"rgba(200,255,0,.15)",border:"1px solid rgba(200,255,0,.4)",borderRadius:5,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#C8FF00",fontWeight:900,flexShrink:0}}>GO NOW →</button>
      </div>}

      {/* WAR CHEST PANEL */}
      {showWarChest&&active&&<div style={{background:"rgba(6,6,18,.97)",borderBottom:"1px solid rgba(255,215,0,.25)",padding:"10px 14px",animation:"slideDown .2s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:"#FFD700"}}>💰 WAR CHEST — {warChest} GOLD</div>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,255,255,.3)"}}>Earns 1 gold per 50px every 5 min</span>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={()=>{
            if(warChest<20){pushToast("Need 20💰 gold!","#FFD700",2000);return;}
            if(!active){pushToast("Select a fandom first","#FF4400",2000);return;}
            // Execute gold raid
            const now2=Date.now();
            const enemies=Object.entries(pixels).filter(([,v])=>v?.t&&v.t!==active&&!isAllied(v.t));
            if(enemies.length===0){pushToast("No enemies to raid!","#FF4400",2000);return;}
            const targets=enemies.sort(()=>Math.random()-.5).slice(0,20);
            const next={...pixels};
            const toUpsert2=[];
            targets.forEach(([idx])=>{next[parseInt(idx)]={t:active,at:now2};toUpsert2.push(parseInt(idx));});
            setPixels(next);
            if(isOnline)dbUpsertPixels(new Set(toUpsert2),active,currentSeasonNum);
            const newGold=warChest-20;setWarChest(newGold);localStorage.setItem("pow_war_chest",String(newGold));
            spawnParticles("#FFD700",vx+VW/2,vy+VH/2,20,true);triggerFlash("#FFD700",true);
            pushToast(`💰 GOLD RAID! Stole ${targets.length}px! (${newGold}💰 left)`,"#FFD700",5000);
          }} style={{padding:"6px 14px",background:"rgba(255,215,0,.12)",border:"1px solid rgba(255,215,0,.4)",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#FFD700",fontWeight:900}}>
            ⚔️ GOLD RAID (20💰) — Steal 20 enemy pixels
          </button>
          <button onClick={()=>{
            if(warChest<10){pushToast("Need 10💰 gold!","#FFD700",2000);return;}
            const newGold=warChest-10;setWarChest(newGold);localStorage.setItem("pow_war_chest",String(newGold));
            syncFreePixels(freePixels+5);
            pushToast("💰 Converted 10 gold → 5 free pixels!","#FFD700",4000);
          }} style={{padding:"6px 14px",background:"rgba(200,255,0,.08)",border:"1px solid rgba(200,255,0,.25)",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#C8FF00",fontWeight:900}}>
            🔄 CONVERT (10💰) → 5 free pixels
          </button>
          <button onClick={()=>setShowWarChest(false)} style={{padding:"6px 10px",background:"transparent",border:"1px solid rgba(255,255,255,.1)",borderRadius:6,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.3)"}}>✕</button>
        </div>
      </div>}

      {/* PEACE VOTE BANNER */}
      {peaceVote&&<div style={{background:"rgba(0,245,255,.06)",borderBottom:"1px solid rgba(0,245,255,.3)",padding:"5px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap",animation:"slideDown .3s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:14,animation:"pulse .8s infinite"}}>🕊️</span>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#00F5FF"}}>
            <strong style={{color:TM[peaceVote.proposer]?.color||"#00F5FF"}}>{TM[peaceVote.proposer]?.name||"?"}</strong> proposes a 1-hour ceasefire!
          </span>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.3)"}}>
            Expires in {Math.max(0,Math.floor((peaceVote.endsAt-Date.now())/60000))}m
          </span>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>{
            setPeaceVote(v=>({...v,votes:(v.votes||0)+1}));
            pushToast("🕊️ You voted FOR peace!","#00F5FF",3000);
            postToDiscord({title:"🕊️ PEACE VOTE — Community Decides!",description:`**${TM[peaceVote.proposer]?.name}** has proposed a 1-hour ceasefire!\n\nVote in the game or react to this message to show your support.\n\n✅ = FOR PEACE\n⚔️ = CONTINUE WAR`,color:0x00F5FF,url:"https://www.pixelsofwar.com",footer:{text:"Pixels of War Peace System"},timestamp:new Date().toISOString()});
          }} style={{padding:"3px 10px",background:"rgba(0,245,255,.15)",border:"1px solid rgba(0,245,255,.4)",borderRadius:4,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#00F5FF",fontWeight:900}}>✅ VOTE PEACE ({peaceVote.votes||0})</button>
          <button onClick={()=>setPeaceVote(null)} style={{padding:"3px 10px",background:"rgba(255,68,0,.1)",border:"1px solid rgba(255,68,0,.3)",borderRadius:4,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#FF4400",fontWeight:900}}>⚔️ REJECT</button>
        </div>
      </div>}

      {/* PENDING ALLIANCE ALERT */}
      {pendingAlliances.length>0&&<div style={{background:"rgba(0,255,170,.06)",borderBottom:"1px solid rgba(0,255,170,.25)",padding:"5px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <span style={{fontSize:14}}>🤝</span>
        <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#00FFAA"}}>
          <strong>{TM[pendingAlliances[0].proposer]?.name||"?"}</strong> proposes an alliance!
        </span>
        <button onClick={()=>acceptAlliance(pendingAlliances[0].id)} style={{padding:"2px 9px",background:"rgba(0,255,170,.15)",border:"1px solid rgba(0,255,170,.4)",borderRadius:4,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#00FFAA",letterSpacing:1}}>ACCEPT</button>
        <button onClick={()=>dbUpdateAlliance(pendingAlliances[0].id,"rejected").then(()=>setAlliances(a=>a.filter(x=>x.id!==pendingAlliances[0].id)))} style={{padding:"2px 9px",background:"transparent",border:"1px solid rgba(255,255,255,.1)",borderRadius:4,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#5a5a7a"}}>DECLINE</button>
      </div>}

      {showShare&&at&&<ShareModal fandom={at} pixelCount={Object.values(pixels).filter(p=>p?.t===active).length} rank={(board.findIndex(b=>b.id===active)+1)||"?"} referralBonus={10} onClose={()=>setShowShare(false)} pushToast={pushToast}/>}
      {showMissions&&<MissionsModal progress={missionProgress} onClaim={claimMission} streakDays={streakData.days} onClose={()=>setShowMissions(false)} accentColor={at?.color||"#00F5FF"}/>}
      {showOnboarding&&<OnboardingModal
        allFandoms={ALL}
        onComplete={(fandom)=>{setShowOnboarding(false);if(fandom)setTimeout(()=>setActive(fandom.id),300);pushToast(`⚔️ Welcome to the war, ${fandom?.name||"warrior"}!`,"#00F5FF",5000);}}
        onSkip={()=>setShowOnboarding(false)}
      />}

      {/* WAR TICKER — scrolling feed at bottom */}
      {!isMobile&&feed.length>0&&<div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:"rgba(4,4,12,.92)",borderTop:"1px solid rgba(0,245,255,.1)",height:26,overflow:"hidden",display:"flex",alignItems:"center"}}>
        <div style={{display:"flex",gap:"48px",whiteSpace:"nowrap",animation:`warTicker ${Math.max(15,feed.length*3)}s linear infinite`,flexShrink:0}}>
          {[...feed,...feed,...feed].map((f,i)=>(
            <span key={i} style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:f.color,letterSpacing:.5,flexShrink:0}}>
              {f.icon} <span style={{fontWeight:700}}>{f.team}</span> {f.msg} <span style={{color:"rgba(255,255,255,.15)"}}>·</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes warTicker{0%{transform:translateX(0)}100%{transform:translateX(-33.33%)}}`}</style>
      </div>}

      {pixelHistory&&<PixelHistoryModal pixel={pixelHistory.pixel} history={pixelHistory.history} TM={TM} onClose={()=>setPixelHistory(null)} onJumpTo={()=>{setVx(Math.max(0,pixelHistory.gx-VW/2));setVy(Math.max(0,pixelHistory.gy-VH/2));setPixelHistory(null);}}/>}
      {showAuthModal&&<AuthModal onClose={()=>setShowAuthModal(false)} reason={authReason}/>}

      {/* GUEST SAVE PROMPT */}
      {showGuestSavePrompt&&!user&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(8px)"}} onClick={()=>setShowGuestSavePrompt(false)}>
        <div style={{background:"rgba(9,9,26,.98)",border:"1px solid rgba(88,101,242,.5)",borderRadius:18,padding:"32px 28px",width:380,maxWidth:"94vw",animation:"pop .4s cubic-bezier(.34,1.56,.64,1)",textAlign:"center",boxShadow:"0 0 60px rgba(88,101,242,.2)"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:48,marginBottom:12}}>⚠️</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:15,fontWeight:900,color:"#FFD700",letterSpacing:2,marginBottom:8}}>YOUR PIXELS WILL DISAPPEAR!</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"rgba(255,255,255,.5)",marginBottom:20,lineHeight:1.7}}>
            You placed <strong style={{color:"#C8FF00"}}>{guestPixelsUsed} pixel{guestPixelsUsed!==1?"s":""}</strong> as a guest.<br/>
            They expire in <strong style={{color:"#FF4400"}}>24 hours</strong> unless you save them.<br/><br/>
            Login with Discord to <strong style={{color:"#00FF88"}}>keep them forever</strong> + get 25 more free pixels.
          </div>
          <button onClick={()=>{setShowGuestSavePrompt(false);setShowAuthModal(true);}} style={{width:"100%",padding:"14px",background:"linear-gradient(90deg,#5865F2,#7289DA)",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:12,color:"#fff",letterSpacing:2,marginBottom:8}}>
            💾 SAVE MY PIXELS — LOGIN WITH DISCORD
          </button>
          <button onClick={()=>setShowGuestSavePrompt(false)} style={{width:"100%",padding:"10px",background:"transparent",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.3)"}}>
            I'll lose them (dismiss)
          </button>
        </div>
      </div>}
      {showSponsor&&<SponsorModal onClose={()=>setShowSponsor(false)} userEmail={user?.email}/>}
      <CookieBanner/>

      {/* NOTIFICATION PERMISSION BANNER */}
      {showNotifBanner&&notifPermission==="default"&&<div style={{background:"linear-gradient(90deg,rgba(0,255,136,.1),rgba(0,245,255,.06),transparent)",borderBottom:"1px solid rgba(0,255,136,.25)",padding:"6px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap",animation:"slideDown .3s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>🔔</span>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.6)"}}>Get raided? We'll alert you instantly.</span>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={requestNotifPermission} style={{padding:"4px 12px",background:"rgba(0,255,136,.15)",border:"1px solid rgba(0,255,136,.4)",borderRadius:5,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#00FF88",letterSpacing:1,fontWeight:900}}>ENABLE</button>
          <button onClick={()=>setShowNotifBanner(false)} style={{padding:"4px 8px",background:"transparent",border:"1px solid rgba(255,255,255,.1)",borderRadius:5,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a"}}>later</button>
        </div>
      </div>}

      {/* ── MAIN LAYOUT ── */}
      {isMobile?(
        /* ── MOBILE LAYOUT ── */
        <div style={{display:"flex",flexDirection:"column",height:`calc(100vh - ${bannerOffset}px)`,overflow:"hidden"}}>

          {/* CANVAS */}
          <style>{`
            .pow-canvas-fs { position:fixed!important; top:0!important; left:0!important; width:100vw!important; height:100vh!important; max-height:100vh!important; z-index:9990!important; background:#040408; image-rendering:pixelated; }
            .pow-canvas-wrap-fs { position:fixed!important; inset:0!important; z-index:9989!important; background:#040408!important; }
            .pow-canvas-fs-hint { position:fixed; top:10px; left:50%; transform:translateX(-50%); z-index:9999; background:rgba(0,0,0,.75); border:1px solid rgba(255,255,255,.15); border-radius:6px; padding:5px 14px; font-family:'Share Tech Mono',monospace; font-size:9px; color:rgba(255,255,255,.5); pointer-events:none; }
          `}</style>
          {gridFullscreen&&<div className="pow-canvas-fs-hint">Double-click or ESC to exit fullscreen</div>}
          <div style={{padding:"3px 3px 0",flexShrink:0}}>
            <div className={gridFullscreen?"pow-canvas-wrap-fs":""} style={gridFullscreen?{}:{border:`2px solid ${at?rgba(at.color,.5):rgba(modeColor,.35)}`,borderRadius:6,overflow:"hidden",lineHeight:0,position:"relative",animation:shakeCanvas?"shake .4s ease":undefined,boxShadow:`0 0 20px ${rgba(at?.color||modeColor,.1)}`}}>
              <canvas ref={cvs} width={CW} height={CH}
                className={gridFullscreen?"pow-canvas-fs":""}
                style={gridFullscreen?{}:{width:"100%",display:"block",imageRendering:"pixelated",maxHeight:"40vw",touchAction:"none",cursor:active&&mode!=="SHOP"?"crosshair":"default"}}
                onMouseDown={onMD} onMouseMove={onMM_h} onMouseUp={onMU} onMouseLeave={onML}
                onDragStart={e=>e.preventDefault()}
                onDoubleClick={()=>setGridFullscreen(f=>!f)}
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}/>
              {!gridFullscreen&&<div style={{position:"absolute",top:4,left:4,background:rgba(modeColor,.15),border:`1px solid ${rgba(modeColor,.5)}`,borderRadius:4,padding:"2px 6px",fontFamily:"'Orbitron',monospace",fontSize:7,color:modeColor,pointerEvents:"none",letterSpacing:1}}>{mode==="BUILD"?"🏗":"mode"==="RAID"?"⚔️":"💥"} {mode}</div>}
              {/* Zoom controls */}
              <div style={{position:gridFullscreen?"fixed":"absolute",bottom:gridFullscreen?20:36,right:gridFullscreen?20:4,display:"flex",flexDirection:"column",gap:2,zIndex:9995}}>
                <button onClick={()=>setGridFullscreen(f=>!f)} style={{width:22,height:22,background:"rgba(4,4,12,.9)",border:`1px solid ${gridFullscreen?"rgba(255,215,0,.5)":"rgba(0,245,255,.3)"}`,borderRadius:4,color:gridFullscreen?"#FFD700":"#00F5FF",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} title="Double-click grid for fullscreen">{gridFullscreen?"⊡":"⛶"}</button>
                <button onClick={()=>setZoomLevel(z=>{const L=[0.5,0.75,1,1.5,2,3];const i=L.indexOf(z);return L[Math.min(L.length-1,(i===-1?2:i)+1)];})} style={{width:22,height:22,background:"rgba(4,4,12,.9)",border:"1px solid rgba(0,245,255,.3)",borderRadius:4,color:"#00F5FF",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,lineHeight:1}}>+</button>
                <button onClick={()=>setZoomLevel(1)} style={{width:22,height:22,background:"rgba(4,4,12,.9)",border:`1px solid ${zoomLevel===1?"rgba(255,215,0,.5)":"rgba(0,245,255,.2)"}`,borderRadius:4,color:zoomLevel===1?"#FFD700":"#00F5FF",fontSize:7,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',monospace",fontWeight:900}}>{zoomLevel===1?"1×":`${zoomLevel}×`}</button>
                <button onClick={()=>setZoomLevel(z=>{const L=[0.5,0.75,1,1.5,2,3];const i=L.indexOf(z);return L[Math.max(0,(i===-1?2:i)-1)];})} style={{width:22,height:22,background:"rgba(4,4,12,.9)",border:"1px solid rgba(0,245,255,.3)",borderRadius:4,color:"#00F5FF",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,lineHeight:1}}>−</button>
              </div>
              {/* Live claims counter */}
              {claimsLastMin>0&&!surgeMode&&<div style={{position:"absolute",top:4,left:"50%",transform:"translateX(-50%)",background:"rgba(255,68,0,.15)",border:"1px solid rgba(255,68,0,.4)",borderRadius:4,padding:"2px 8px",fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#FF4400",pointerEvents:"none",animation:"pulse 1s infinite"}}>🔥 {claimsLastMin} px/min</div>}
              {/* Surge mode HUD */}
              {surgeMode&&<div style={{position:"absolute",top:4,left:"50%",transform:"translateX(-50%)",background:"rgba(255,45,120,.2)",border:"2px solid rgba(255,45,120,.8)",borderRadius:6,padding:"4px 12px",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#FF2D78",pointerEvents:"none",animation:"pulse .5s infinite",fontWeight:900,whiteSpace:"nowrap"}}>
                ⚡ SURGE ACTIVE — Drag connected pixels! 🟢=keep 🔴=lose
              </div>}
              {/* Floating war texts */}
              {floatingTexts.map(ft=>(
                <div key={ft.id} style={{position:"absolute",left:`${ft.x}%`,top:`${ft.y}%`,transform:"translate(-50%,-50%)",fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:900,color:ft.color,textShadow:`0 0 8px ${ft.color}`,pointerEvents:"none",animation:"floatUp .5s ease forwards",whiteSpace:"nowrap",zIndex:10}}>
                  {ft.text}
                </div>
              ))}
              <style>{`@keyframes floatUp{0%{opacity:1;transform:translate(-50%,-50%)}100%{opacity:0;transform:translate(-50%,-200%)}}`}</style>
              <div style={{position:"absolute",top:4,right:4,background:"rgba(4,4,12,.85)",borderRadius:4,border:"1px solid rgba(0,245,255,.2)",overflow:"hidden",cursor:"crosshair"}} onClick={onMmClick}>
                <canvas ref={mmCvs} width={MM} height={MM} style={{display:"block",width:60,height:60}}/>
              </div>
              {/* Top 3 race bar */}
              {board.length>0&&<div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(4,4,8,.9))",padding:"8px 8px 4px",pointerEvents:"none"}}>
                <div style={{display:"flex",gap:3,alignItems:"flex-end"}}>
                  {board.slice(0,3).map((t,i)=>{
                    const maxPx=board[0].count||1;
                    const pct=Math.max(8,(t.count/maxPx)*100);
                    const isMe=t.id===active;
                    const myPx=active?Object.values(pixels).filter(p=>p?.t===active).length:0;
                    const diff=t.count-myPx;
                    return(
                      <div key={t.id} style={{flex:1,display:"flex",flexDirection:"column",gap:2}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:6,color:t.color,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"70%"}}>{["🥇","🥈","🥉"][i]} {t.name}</span>
                          <span style={{fontFamily:"'Orbitron',monospace",fontSize:6,color:isMe?"#C8FF00":t.color,fontWeight:900}}>{t.count}</span>
                        </div>
                        <div style={{height:3,background:"rgba(255,255,255,.1)",borderRadius:2,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${pct}%`,background:t.color,borderRadius:2,transition:"width .5s",boxShadow:`0 0 4px ${t.color}`}}/>
                        </div>
                        {isMe&&diff>0&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:5,color:"rgba(255,255,255,.3)",textAlign:"right"}}>-{diff} from #{i+1}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>}
              {!active&&board.length===0&&<div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(4,4,8,.85))",padding:"10px 8px 4px",pointerEvents:"none",textAlign:"center"}}>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:8,letterSpacing:2,color:"rgba(0,245,255,.5)"}}>⚔ SELECT A FANDOM BELOW</div>
              </div>}
            </div>
          </div>

          {/* MOBILE MODE BUTTONS + ACTIVE BAR */}
          <div style={{flexShrink:0,padding:"3px 3px 0"}}>
            <div style={{display:"flex",gap:3,marginBottom:3}}>
              {[{m:"BUILD",icon:"🏗",c:"#00F5FF"},{m:"RAID",icon:"⚔️",c:"#FF4400"},{m:"SHOP",icon:"💥",c:"#C8FF00"}].map(({m,icon,c})=>{const on=mode===m;return(
                <button key={m} onClick={()=>gatedSetMode(m)} style={{flex:1,padding:"7px 4px",background:on?rgba(c,.15):"transparent",border:`1px solid ${on?c:rgba(c,.22)}`,borderRadius:5,color:on?c:rgba(c,.45),cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:900,transition:"all .12s"}}>
                  {icon} {m}
                </button>
              );})}
              {active&&<button onClick={()=>{if(!requireAuth("missions"))return;setShowMissions(true);}} style={{padding:"7px 8px",background:pendingMissionCount>0?"rgba(255,215,0,.12)":"rgba(255,255,255,.04)",border:`1px solid ${pendingMissionCount>0?"rgba(255,215,0,.4)":"rgba(255,255,255,.08)"}`,borderRadius:5,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:pendingMissionCount>0?"#FFD700":"#3a3a5a",position:"relative"}}>
                🎯{pendingMissionCount>0&&<span style={{position:"absolute",top:-4,right:-4,background:"#FFD700",color:"#040408",borderRadius:"50%",width:13,height:13,fontSize:7,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>{pendingMissionCount}</span>}
              </button>}
            </div>
            {at&&<div style={{padding:"5px 8px",background:rgba(modeColor,.06),border:`1px solid ${rgba(modeColor,.3)}`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:8,height:8,borderRadius:1,background:at.color,boxShadow:`0 0 6px ${at.color}`}}/>
                <span style={{fontWeight:700,fontSize:11,color:at.color,fontFamily:"'Orbitron',monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:100}}>{at.name}</span>
                {pending.size>=10&&<span style={{fontFamily:"'Orbitron',monospace",fontSize:7,color:"#FFD700",animation:"pulse 1s infinite"}}>🔥</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                {pending.size>0&&<>
                  <span style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:"#C8FF00"}}>€{(pendingCost-freeUsedPreview).toFixed(2)}</span>
                  <button onClick={requestClaim} style={{padding:"5px 10px",background:`linear-gradient(90deg,${modeColor},${at.color})`,color:"#040408",border:"none",borderRadius:5,fontWeight:900,cursor:"pointer",fontSize:10,fontFamily:"'Orbitron',monospace"}}>
                    {mode==="RAID"?"⚔ RAID!":"🏴 CLAIM!"}
                  </button>
                  <button onClick={()=>setPending(new Set())} style={{background:"none",border:"none",color:"#3a3a5a",cursor:"pointer",fontSize:14,padding:"0 4px"}}>✕</button>
                </>}
                {pending.size===0&&<>
                  <button onClick={()=>{if(!requireAuth("share"))return;setShowShare(true);trackMission("share",1);}} style={{padding:"4px 7px",background:"rgba(255,45,120,.08)",border:"1px solid rgba(255,45,120,.25)",borderRadius:4,color:"#FF2D78",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8}}>📢</button>
                  <button onClick={()=>{setActive(null);setPending(new Set());}} style={{padding:"4px 7px",background:"rgba(255,60,60,.06)",border:"1px solid rgba(255,60,60,.25)",borderRadius:4,color:"#ff6b6b",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8}}>✕</button>
                </>}
              </div>
            </div>}
          </div>

          {/* MOBILE BOTTOM TABS */}
          <div style={{display:"flex",borderBottom:"1px solid #1a1a30",borderTop:"1px solid #1a1a30",flexShrink:0,background:"#05050d"}}>
            {[["GAME","🏴"],["FEED","📡"],["CHAT","💬"],["WARS","⚔️"],["DISC","🎮"]].map(([t,icon])=>{
              const on=mobileTab===t;
              return(<button key={t} onClick={()=>setMobileTab(t)} style={{flex:1,padding:"7px 0",background:on?"#0a0a1a":"transparent",border:"none",color:on?"#00F5FF":"#3a3a5a",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:7,fontWeight:900,borderBottom:on?"2px solid #00F5FF":"2px solid transparent",letterSpacing:.5}}>
                <div style={{fontSize:13}}>{icon}</div>
                <div>{t}</div>
              </button>);
            })}
          </div>

          {/* MOBILE TAB CONTENT */}
          <div style={{flex:1,overflowY:"auto",background:"#05050d"}}>

            {/* GAME — fandom selector */}
            {mobileTab==="GAME"&&<div style={{padding:"6px"}}>
              {mode==="SHOP"?(
                <div>
                  {/* Monetization quick actions */}
                  <div style={{display:"flex",gap:6,marginBottom:8}}>
                    <button onClick={()=>{setShowPaywall(true);setPaywallTab("bundles");}} style={{flex:1,padding:"8px",background:"linear-gradient(90deg,rgba(200,255,0,.15),rgba(200,255,0,.05))",border:"1px solid rgba(200,255,0,.4)",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#C8FF00",fontWeight:900}}>💰 BUY PIXELS</button>
                    <button onClick={()=>{setShowPaywall(true);setPaywallTab("free");}} style={{flex:1,padding:"8px",background:"rgba(0,245,255,.08)",border:"1px solid rgba(0,245,255,.25)",borderRadius:6,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#00F5FF"}}>🎬 WATCH AD +5px</button>
                    {!hasSeasonPass&&<button onClick={()=>{setShowPaywall(true);setPaywallTab("pass");}} style={{flex:1,padding:"8px",background:"rgba(255,215,0,.08)",border:"1px solid rgba(255,215,0,.3)",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#FFD700",fontWeight:900}}>🏆 PASS</button>}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
                  {POWERUPS.map(pu=>(
                    <div key={pu.id} onClick={()=>{if(!requireAuth("powerup"))return;usePowerup(pu);}} style={{background:rgba(pu.color,.07),border:`1px solid ${rgba(pu.color,.3)}`,borderRadius:8,padding:"10px",cursor:"pointer"}}>
                      <div style={{fontSize:22,marginBottom:3}}>{pu.icon}</div>
                      <div style={{fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:900,color:pu.color,marginBottom:2}}>{pu.name}</div>
                      <div style={{fontSize:9,color:"#7a7aaa",marginBottom:4}}>{pu.desc}</div>
                      <div style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:900,color:"#C8FF00"}}>€{pu.price}</div>
                    </div>
                  ))}
                  </div>
                </div>
              ):(
                <>
                  <input value={q} onChange={e=>setQ(e.target.value)} placeholder={`🔍 Search ${ALL.length} fandoms…`} style={{width:"100%",background:"#0c0c1c",border:"1px solid rgba(0,245,255,.15)",borderRadius:6,padding:"8px 12px",color:"#b0b8e0",fontSize:13,fontFamily:"'Rajdhani',sans-serif",outline:"none",marginBottom:6}}/>
                  <button onClick={()=>{if(!requireAuth("fandom"))return;navigate("/request-fandom");}} style={{width:"100%",marginBottom:6,padding:"8px",background:"rgba(200,255,0,.08)",border:"2px solid rgba(200,255,0,.4)",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#C8FF00",letterSpacing:1,fontWeight:900}}>➕ REQUEST A FANDOM</button>
                  <div style={{display:"flex",gap:3,marginBottom:6,overflowX:"auto",paddingBottom:2}}>
                    {["All","🎮 Gaming","🎌 Anime","🎵 Music"].map(c=>{const acc=c==="All"?"#5566AA":CAT_ACCENT[c],on=selCat===c;return(
                      <button key={c} onClick={()=>setSelCat(c)} style={{padding:"5px 10px",borderRadius:5,border:`1px solid ${on?acc:acc+"33"}`,background:on?rgba(acc,.15):"transparent",color:on?acc:acc+"77",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Orbitron',monospace",whiteSpace:"nowrap",flexShrink:0}}>{c}</button>
                    );})}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:5}}>
                    {vis.map(t=>{const isA=active===t.id;const px=Object.values(pixels).filter(p=>p?.t===t.id).length;const rank=getRank(px);const allied=active&&isAllied(t.id);const online=onlineByFandom[t.id]||0;return(
                      <div key={t.id} onClick={()=>setActive(isA?null:t.id)} style={{padding:"8px 10px",borderRadius:6,cursor:"pointer",border:`1px solid ${isA?t.color:allied?"rgba(0,255,170,.25)":rgba(t.color,.2)}`,background:isA?rgba(t.color,.1):"#0c0c1a",display:"flex",alignItems:"center",gap:7}}>
                        <div style={{width:10,height:10,borderRadius:2,background:t.color,flexShrink:0,boxShadow:isA?`0 0 6px ${t.color}`:undefined}}/>
                        <div style={{minWidth:0,flex:1}}>
                          <div style={{fontWeight:700,fontSize:11,color:isA?t.color:"#c0c8e8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}{allied?" 🤝":""}</div>
                          {px>0&&<div style={{fontFamily:"'Orbitron',monospace",fontSize:8,color:rank.color}}>{rank.icon} {px}px</div>}
                        </div>
                        {online>0&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#00FF88",whiteSpace:"nowrap",flexShrink:0}}>🟢{online}</div>}
                      </div>
                    );})}
                  </div>
                </>
              )}
            </div>}

            {/* FEED */}
            {mobileTab==="FEED"&&<div style={{padding:"6px"}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:7,letterSpacing:2,color:"#2a2a4a",marginBottom:6,display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:"#FF2D78",animation:"pulse .8s infinite"}}/>LIVE FEED
              </div>
              {feed.map(f=>(
                <div key={f.id} style={{marginBottom:5,padding:"7px 9px",background:f.isMe?rgba(f.color,.08):f.isWar?"rgba(255,68,0,.06)":"#08081a",borderRadius:6,border:`1px solid ${f.isMe?rgba(f.color,.3):"#1a1a2a"}`,animation:"slideDown .2s ease"}}>
                  <div style={{display:"flex",gap:5,alignItems:"flex-start"}}>
                    <span style={{fontSize:13,flexShrink:0}}>{f.icon}</span>
                    <div>
                      <span style={{fontSize:10,fontWeight:700,color:f.color}}>{f.team} </span>
                      <span style={{fontSize:10,color:"#5a5a7a"}}>{f.msg}</span>
                    </div>
                  </div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#2a2a3a",marginTop:2}}>{f.ts}</div>
                </div>
              ))}
            </div>}

            {/* CHAT */}
            {mobileTab==="CHAT"&&<div style={{display:"flex",flexDirection:"column",height:"100%"}}>
              {!active?<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:20,textAlign:"center"}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#2a2a4a",lineHeight:2}}>💬<br/>Select a fandom<br/>to join their War Room</div>
              </div>:<>
                <div style={{padding:"8px 10px",borderBottom:"1px solid #1a1a30",display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:8,height:8,borderRadius:1,background:at?.color||"#888",boxShadow:`0 0 5px ${at?.color}`}}/>
                  <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:at?.color,fontWeight:900}}>{at?.name} WAR ROOM</span>
                </div>
                <div style={{flex:1,overflowY:"auto",padding:"8px 10px",display:"flex",flexDirection:"column",gap:5}}>
                  {chatMessages.length===0&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#2a2a3a",textAlign:"center",paddingTop:20}}>No messages yet. Be first! 🔥</div>}
                  {chatMessages.map((m,i)=>{
                    const roleBadge=m.role==="admin"?"⚡":m.role==="moderator"?"🛡️":m.role==="vip"?"⭐":"";
                    const roleColor=m.role==="admin"?"#FFD700":m.role==="moderator"?"#00AAFF":m.role==="vip"?"#FF2D78":"#7a7aaa";
                    return(
                    <div key={m.id||i} style={{padding:"7px 10px",background:"#09091a",borderRadius:7,border:`1px solid ${m.role==="admin"?"rgba(255,215,0,.2)":m.role==="moderator"?"rgba(0,170,255,.15)":"#1a1a2a"}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                        {roleBadge&&<span style={{fontSize:9}}>{roleBadge}</span>}
                        <span style={{fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:900,color:roleColor}}>{m.username||"Warrior"}</span>
                        <span style={{fontSize:9}}>{m.rank_icon||"🥉"}</span>
                        <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,255,255,.2)",marginLeft:"auto"}}>{new Date(m.created_at).toLocaleTimeString("en",{hour12:false,hour:"2-digit",minute:"2-digit"})}</span>
                      </div>
                      <div style={{fontSize:12,color:"#c0c8e8",lineHeight:1.4,wordBreak:"break-word"}}>{m.text}</div>
                    </div>
                  );})}

                </div>
                <div style={{padding:"8px",borderTop:"1px solid #1a1a30",display:"flex",gap:6}}>
                  <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Rally the fans…" style={{flex:1,background:"#0c0c1c",border:`1px solid ${rgba(at?.color||"#1a1a2e",.3)}`,borderRadius:6,padding:"8px 12px",color:"#b0b8e0",fontSize:13,fontFamily:"'Rajdhani',sans-serif",outline:"none"}}/>
                  <button onClick={sendMessage} style={{padding:"8px 14px",background:rgba(at?.color||"#00F5FF",.15),border:`1px solid ${rgba(at?.color||"#00F5FF",.3)}`,borderRadius:6,cursor:"pointer",color:at?.color||"#00F5FF",fontSize:16,fontWeight:900}}>→</button>
                </div>
              </>}
            </div>}

            {/* WARS — leaderboard + wars + alliances */}
            {mobileTab==="WARS"&&<div style={{padding:"6px"}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:8,letterSpacing:2,color:"#2a2a4a",marginBottom:6}}>TERRITORY RANKINGS</div>
              {board.slice(0,10).map((t,i)=>{const acc=CAT_ACCENT[t.cat]||"#00F5FF";const rank=getRank(t.count);return(
                <div key={t.id} onClick={()=>setActive(t.id)} style={{marginBottom:4,padding:"7px 10px",background:"#09091a",borderRadius:6,border:`1px solid ${acc}18`,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#3a3a5a",width:16}}>{i+1}</span>
                    <div style={{width:8,height:8,borderRadius:1,background:t.color}}/>
                    <div>
                      <div style={{fontSize:11,fontWeight:700,color:t.color}}>{rank.icon} {t.name}{isAllied(t.id)?" 🤝":""}</div>
                      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a"}}>{rank.name}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    {t.trend>0&&<span style={{fontSize:9,color:"#00FF88"}}>▲{t.trend}</span>}
                    {t.trend<0&&<span style={{fontSize:9,color:"#FF4400"}}>▼{Math.abs(t.trend)}</span>}
                    <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:"#C8FF00"}}>{t.count}px</span>
                  </div>
                </div>
              );})}
              {active&&<div style={{display:"flex",gap:6,marginTop:8}}>
                <button onClick={()=>{if(!requireAuth("war"))return;setShowWarModal(true);}} style={{flex:1,padding:"10px",background:"rgba(255,68,0,.08)",border:"1px solid rgba(255,68,0,.3)",borderRadius:7,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#FF4400"}}>⚔️ DECLARE WAR</button>
                <button onClick={()=>{if(!requireAuth("alliance"))return;setShowAllianceModal(true);}} style={{flex:1,padding:"10px",background:"rgba(0,255,170,.06)",border:"1px solid rgba(0,255,170,.25)",borderRadius:7,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:"#00FFAA"}}>🤝 ALLY</button>
                {/* Peace vote — only top 3 fandoms can propose */}
                {board.slice(0,3).some(t=>t.id===active)&&!peaceVote&&<button onClick={()=>{
                  if(!requireAuth("peace"))return;
                  const vote={proposer:active,endsAt:Date.now()+3600000,votes:0};
                  setPeaceVote(vote);
                  pushToast("🕊️ Peace vote proposed! Other fandoms can accept or reject.","#00F5FF",5000);
                  postToDiscord({title:"🕊️ PEACE VOTE PROPOSED",description:`**${TM[active]?.name}** has proposed a 1-hour ceasefire!\n\nAll fandoms can vote in the game. React with ✅ to support peace or ⚔️ to continue war.`,color:0x00F5FF,url:"https://www.pixelsofwar.com",footer:{text:"Pixels of War Peace System"},timestamp:new Date().toISOString()});
                }} style={{flex:1,padding:"10px",background:"rgba(0,245,255,.06)",border:"1px solid rgba(0,245,255,.25)",borderRadius:7,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#00F5FF"}}>🕊️ PEACE</button>}
              </div>}
              {/* Share buttons — always visible when fandom selected */}
              {active&&<div style={{display:"flex",gap:6,marginTop:6}}>
                <button onClick={()=>shareTerritory(active)} style={{flex:1,padding:"8px",background:"rgba(255,45,120,.08)",border:"1px solid rgba(255,45,120,.3)",borderRadius:7,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#FF2D78",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>📤 SHARE TERRITORY</button>
                <button onClick={()=>shareTikTok(active)} style={{flex:1,padding:"8px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.15)",borderRadius:7,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,255,255,.6)",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>🎵 TIKTOK</button>
              </div>}
              {myActiveAlliances.length>0&&<>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:8,letterSpacing:2,color:"#00FFAA",marginTop:10,marginBottom:5}}>🤝 ACTIVE ALLIANCES</div>
                {myActiveAlliances.map(a=>{const partnerId=a.proposer===active?a.target:a.proposer;const partner=TM[partnerId];return(
                  <div key={a.id} style={{marginBottom:5,padding:"8px 10px",background:"rgba(0,255,170,.05)",border:"1px solid rgba(0,255,170,.2)",borderRadius:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:11,fontWeight:700,color:partner?.color||"#888"}}>{partner?.name||"?"}</span>
                    <button onClick={()=>betrayAlliance(a.id,partner?.name||"?")} style={{padding:"4px 8px",background:"rgba(255,68,0,.1)",border:"1px solid rgba(255,68,0,.3)",borderRadius:4,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#FF4400"}}>BETRAY</button>
                  </div>
                );})}
              </>}
              {wars.slice(0,5).length>0&&<>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:8,letterSpacing:2,color:"#FF4400",marginTop:10,marginBottom:5}}>⚔️ ACTIVE WARS</div>
                {wars.slice(0,5).map(w=>{const att=TM[w.attacker];const def=TM[w.defender];return(
                  <div key={w.id} style={{marginBottom:4,padding:"7px 10px",background:"rgba(255,68,0,.04)",border:"1px solid rgba(255,68,0,.2)",borderRadius:6,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:10,fontWeight:700,color:att?.color}}>{att?.name||"?"}</span>
                    <span style={{color:"#FF4400"}}>⚔️</span>
                    <span style={{fontSize:10,fontWeight:700,color:def?.color}}>{def?.name||"?"}</span>
                  </div>
                );})}
              </>}
            </div>}

            {/* DISC */}
            {mobileTab==="DISC"&&<div style={{display:"flex",flexDirection:"column",height:"100%"}}>
              <div style={{padding:"10px",borderBottom:"1px solid #1a1a30",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <svg width="18" height="14" viewBox="0 0 71 55" fill="none"><path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.9a40.7 40.7 0 0 0-1.8 3.7 54.1 54.1 0 0 0-16.4 0A38.9 38.9 0 0 0 25.5.9 58.4 58.4 0 0 0 10.9 4.9C1.6 19 -1 32.7.3 46.3a58.9 58.9 0 0 0 18 9.1 44.6 44.6 0 0 0 3.9-6.3 38.3 38.3 0 0 1-6.1-2.9l1.5-1.1a42.1 42.1 0 0 0 36 0l1.5 1.1a38.3 38.3 0 0 1-6.1 2.9 44.6 44.6 0 0 0 3.9 6.3 58.7 58.7 0 0 0 18-9.1C72 30.6 68.3 17 60.1 4.9ZM23.7 38c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.2 6.4 7.2c0 4-2.9 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.2 6.4 7.2c0 4-2.9 7.2-6.4 7.2Z" fill="#5865F2"/></svg>
                  <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:"#5865F2"}}>WAR COUNCIL</span>
                </div>
                <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" style={{padding:"6px 12px",background:"linear-gradient(90deg,#5865F2,#7289DA)",borderRadius:6,textDecoration:"none",fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:900,color:"#fff",letterSpacing:1}}>JOIN →</a>
              </div>
              <iframe src={`https://discord.com/widget?id=${DISCORD_ID}&theme=dark`} style={{flex:1,border:"none",width:"100%"}} sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts" title="Discord"/>
            </div>}

          </div>
        </div>
      ):(
        /* ── DESKTOP LAYOUT ── */
        <div style={{display:"flex",height:`calc(100vh - ${bannerOffset}px)`,overflow:"hidden"}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>

          {/* CANVAS */}
          <div style={{padding:"5px 5px 0",flexShrink:0}}>
            <div style={{border:`2px solid ${at?rgba(at.color,.5):rgba(modeColor,.35)}`,borderRadius:6,overflow:"hidden",lineHeight:0,cursor:active&&mode!=="SHOP"?"crosshair":"default",position:"relative",animation:shakeCanvas?"shake .4s ease":undefined,boxShadow:`0 0 30px ${rgba(at?.color||modeColor,.12)},0 0 60px ${rgba(at?.color||modeColor,.06)},inset 0 0 30px rgba(0,0,0,.3)`}}>
              <canvas ref={cvs} width={CW} height={CH} style={{width:"100%",display:"block",imageRendering:"pixelated",maxHeight:isMobile?"45vw":"38vh",touchAction:"none"}}
                onMouseDown={onMD} onMouseMove={onMM_h} onMouseUp={onMU} onMouseLeave={onML} onDragStart={e=>e.preventDefault()}
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}/>
              <div style={{position:"absolute",top:5,left:5,background:rgba(modeColor,.12),border:`1px solid ${rgba(modeColor,.4)}`,borderRadius:4,padding:"2px 7px",fontFamily:"'Orbitron',monospace",fontSize:7,color:modeColor,pointerEvents:"none",letterSpacing:2}}>
                {mode==="BUILD"?"🏗 BUILD":mode==="RAID"?"⚔️ RAID":"💥 SHOP"}
              </div>
              {showHeatmap&&<div style={{position:"absolute",top:5,left:68,background:"rgba(255,68,0,.15)",border:"1px solid rgba(255,68,0,.4)",borderRadius:4,padding:"2px 7px",fontFamily:"'Orbitron',monospace",fontSize:7,color:"#FF6422",pointerEvents:"none",letterSpacing:1,animation:"pulse 1.5s infinite"}}>🔥 HEATMAP ON</div>}
              {hovSector&&<div style={{position:"absolute",top:5,left:hovSector&&showHeatmap?150:80,background:"rgba(0,0,0,.8)",border:"1px solid rgba(255,255,255,.15)",borderRadius:4,padding:"2px 8px",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.6)",pointerEvents:"none"}}>
                {hovSector.unlocked?`S${hovSector.sx+1}-${hovSector.sy+1} · €${(sectorBasePrice(hovSector.sx,hovSector.sy)*fillMultiplier(hovSector.fill)).toFixed(1)}/px · ${(hovSector.fill*100).toFixed(0)}% full`:`🔒 S${hovSector.sx+1}-${hovSector.sy+1} LOCKED`}
              </div>}
              <div style={{position:"absolute",bottom:5,left:5,fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,255,255,.2)",pointerEvents:"none"}}>SECTOR {Math.floor(vx/100)+1}-{Math.floor(vy/100)+1}</div>
              <div style={{position:"absolute",top:5,right:5,background:"rgba(4,4,12,.85)",borderRadius:5,border:"1px solid rgba(0,245,255,.2)",overflow:"hidden",cursor:"crosshair"}} onClick={onMmClick}>
                <canvas ref={mmCvs} width={MM} height={MM} style={{display:"block",width:90,height:90}}/>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:6,color:"#3a3a5a",textAlign:"center",padding:"2px 0"}}>MINIMAP</div>
              </div>
              {hov&&<div style={{position:"absolute",bottom:5,right:102,background:rgba(hov.color,.15),border:`1px solid ${hov.color}`,borderRadius:4,padding:"2px 7px",fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:hov.color,pointerEvents:"none"}}>{hov.name}{hov.id&&isAllied(hov.id)?" 🤝":""}</div>}
              {!active&&<div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(4,4,8,.85))",padding:"16px 12px 6px",pointerEvents:"none",textAlign:"center"}}>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,letterSpacing:3,color:"rgba(0,245,255,.4)"}}>⚔ SELECT A FANDOM BELOW</div>
              </div>}
            </div>
          </div>

          {/* MODES + NAV */}
          <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 5px 0",flexShrink:0,flexWrap:"wrap"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,22px)",gridTemplateRows:"repeat(3,22px)",gap:2}}>
              {[["↖","-100,-100"],["↑","0,-50"],["↗","100,-100"],["←","-50,0"],["",""],["→","50,0"],["↙","-100,100"],["↓","0,50"],["↘","100,100"]].map(([lbl,delta],i)=>{
                if(i===4)return<div key={i}/>;const[dx,dy]=delta.split(",").map(Number);
                return(<button key={i} className="nav-btn" onClick={()=>pan(dx,dy)} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:3,color:"#6070a0",cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .1s"}}>{lbl}</button>);
              })}
            </div>
            <div style={{display:"flex",gap:3,marginLeft:4}}>
              {[{m:"BUILD",icon:"🏗",c:"#00F5FF"},{m:"RAID",icon:"⚔️",c:"#FF4400"},{m:"SHOP",icon:"💥",c:"#C8FF00"}].map(({m,icon,c})=>{const on=mode===m;return(<button key={m} className="chip" onClick={()=>gatedSetMode(m)} style={{padding:"5px 9px",background:on?rgba(c,.15):"transparent",border:`1px solid ${on?c:rgba(c,.22)}`,borderRadius:5,color:on?c:rgba(c,.45),cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:900,letterSpacing:.5,transition:"all .12s",boxShadow:on?`0 0 14px ${rgba(c,.2)}`:"none"}}>{icon} {m}</button>);})}
            </div>
            {active&&<div style={{display:"flex",gap:3,marginLeft:"auto"}}>
              <button onClick={()=>{if(!requireAuth("war"))return;setShowWarModal(true);}} style={{padding:"4px 8px",background:"rgba(255,68,0,.08)",border:"1px solid rgba(255,68,0,.3)",borderRadius:5,color:"#FF4400",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,letterSpacing:1}}>⚔️ WAR</button>
              <button onClick={()=>{if(!requireAuth("alliance"))return;setShowAllianceModal(true);}} style={{padding:"4px 8px",background:"rgba(0,255,170,.08)",border:"1px solid rgba(0,255,170,.3)",borderRadius:5,color:"#00FFAA",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,letterSpacing:1}}>🤝 ALLY</button>
            </div>}
          </div>

          {/* ACTIVE BAR */}
          {at&&<div style={{margin:"3px 5px 0",padding:"5px 10px",background:rgba(modeColor,.06),border:`1px solid ${rgba(modeColor,.3)}`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexShrink:0,animation:"slideDown .2s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
              <div style={{width:8,height:8,borderRadius:1,background:at.color,boxShadow:`0 0 7px ${at.color}`}}/>
              <span style={{fontWeight:700,fontSize:11,color:at.color,fontFamily:"'Orbitron',monospace"}}>{at.name}</span>
              {myActiveAlliances.length>0&&<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#00FFAA"}}>🤝{myActiveAlliances.length}</span>}
              {wars.filter(w=>w.attacker===active||w.defender===active).length>0&&<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#FF4400",animation:"pulse 1s infinite"}}>⚔️</span>}
              {pending.size===0&&<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a3a5a"}}>drag on grid</span>}
              {pending.size>=10&&<span style={{fontFamily:"'Orbitron',monospace",fontSize:7,color:"#FFD700",animation:"pulse 1s infinite"}}>🔥 COMBO!</span>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              {pending.size>0&&<>
                {freeUsedPreview>0&&<span style={{fontFamily:"'Orbitron',monospace",fontSize:8,color:"#FFD700"}}>🎁{freeUsedPreview}FREE+</span>}
                <span style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,color:"#C8FF00"}}>€{(pendingCost-freeUsedPreview).toFixed(2)}</span>
                <button onClick={requestClaim} style={{padding:"4px 11px",background:`linear-gradient(90deg,${modeColor},${at.color})`,color:"#040408",border:"none",borderRadius:4,fontWeight:900,cursor:"pointer",fontSize:9,fontFamily:"'Orbitron',monospace",letterSpacing:1}}>{mode==="RAID"?"⚔ RAID!":"🏴 CLAIM!"}</button>
                <button onClick={()=>setPending(new Set())} style={{background:"none",border:"none",color:"#3a3a5a",cursor:"pointer",fontSize:12}}>✕</button>
              </>}
              <button onClick={()=>{if(!requireAuth("share"))return;setShowShare(true);trackMission("share",1);}} style={{padding:"4px 9px",background:"rgba(255,45,120,.08)",border:"1px solid rgba(255,45,120,.3)",borderRadius:5,color:"#FF2D78",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,letterSpacing:.5}}>📢 SHARE</button>
              <button onClick={()=>{setActive(null);setPending(new Set());}} style={{padding:"3px 9px",background:"rgba(255,60,60,.08)",border:"1px solid rgba(255,60,60,.3)",borderRadius:4,color:"#ff6b6b",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,letterSpacing:1,fontWeight:700}}>✕ OUT</button>
            </div>
          </div>}

          {/* FANDOM BROWSER / SHOP */}
          <div style={{flex:1,overflowY:"auto",padding:"3px 5px 8px"}}>
            {mode==="SHOP"?(
              <><div style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,letterSpacing:3,color:"#C8FF00",marginBottom:7}}>💥 POWER-UP SHOP</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(132px,1fr))",gap:5}}>
                {POWERUPS.map(pu=>(
                  <div key={pu.id} className="pubtn" onClick={()=>{if(!requireAuth("powerup"))return;usePowerup(pu);}} style={{background:rgba(pu.color,.07),border:`1px solid ${rgba(pu.color,.3)}`,borderRadius:8,padding:"10px",cursor:"pointer",transition:"all .15s",position:"relative"}}>
                    <div style={{position:"absolute",top:4,right:5,fontFamily:"'Share Tech Mono',monospace",fontSize:6,color:RARITY_COLOR[pu.rarity]}}>{pu.rarity}</div>
                    <div style={{fontSize:20,marginBottom:4}}>{pu.icon}</div>
                    <div style={{fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:900,color:pu.color,marginBottom:2}}>{pu.name}</div>
                    <div style={{fontSize:9,color:"#7a7aaa",lineHeight:1.4,marginBottom:5}}>{pu.desc}</div>
                    <div style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:900,color:"#C8FF00"}}>€{pu.price}</div>
                  </div>
                ))}
              </div></>
            ):(
              <><input value={q} onChange={e=>setQ(e.target.value)} placeholder={`🔍 Search ${ALL.length} fandoms…`} style={{width:"100%",background:"#0c0c1c",border:"1px solid rgba(0,245,255,.15)",borderRadius:5,padding:"5px 10px",color:"#b0b8e0",fontSize:11,fontFamily:"'Rajdhani',sans-serif",outline:"none",marginBottom:4}}/>
              <div style={{display:"flex",gap:3,marginBottom:3,flexWrap:"wrap"}}>
                {["All","🎮 Gaming","🎌 Anime","🎵 Music"].map(c=>{const acc=c==="All"?"#5566AA":CAT_ACCENT[c],on=selCat===c;return(<button key={c} className="chip" onClick={()=>setSelCat(c)} style={{padding:"3px 8px",borderRadius:4,border:`1px solid ${on?acc:acc+"33"}`,background:on?rgba(acc,.15):"transparent",color:on?acc:acc+"77",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"'Orbitron',monospace",letterSpacing:.5,transition:"all .1s"}}>{c}</button>);})}
              </div>
              <div style={{display:"flex",gap:2,marginBottom:4,overflowX:"auto",paddingBottom:2}}>
                {subArrFull.map(s=>{const on=selSub===s,acc=selCat!=="All"?CAT_ACCENT[selCat]:"#5566AA";return(<button key={s} className="chip" onClick={()=>setSelSub(s)} style={{padding:"2px 6px",borderRadius:20,border:`1px solid ${on?acc:acc+"22"}`,background:on?rgba(acc,.12):"transparent",color:on?acc:acc+"55",fontSize:8,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",whiteSpace:"nowrap",transition:"all .1s"}}>{s}</button>);})}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(118px,1fr))",gap:3}}>
                {vis.map(t=>{const isA=active===t.id,acc=CAT_ACCENT[t.cat]||"#00F5FF";const px=Object.values(pixels).filter(p=>p?.t===t.id).length;const rank=getRank(px);const allied=active&&isAllied(t.id);const atWar=active&&wars.some(w=>(w.attacker===active&&w.defender===t.id)||(w.defender===active&&w.attacker===t.id));const trend=territoryTrend[t.id]||0;const online=onlineByFandom[t.id]||0;return(
                  <div key={t.id} className="tbtn" onClick={()=>setActive(isA?null:t.id)} style={{padding:"5px 7px",borderRadius:5,cursor:"pointer",border:`1px solid ${isA?t.color:allied?"rgba(0,255,170,.3)":atWar?"rgba(255,68,0,.3)":acc+"18"}`,background:isA?rgba(t.color,.1):allied?rgba("#00FFAA",.04):atWar?rgba("#FF4400",.04):"#0c0c1a",transition:"all .1s",position:"relative",overflow:"hidden"}}>
                    {isA&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:2,background:t.color}}/>}
                    <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:1}}>
                      <div style={{width:6,height:6,borderRadius:1,background:t.color,flexShrink:0}}/>
                      <span style={{fontWeight:700,fontSize:9,color:isA?t.color:"#c0c8e8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</span>
                      {allied&&<span style={{fontSize:8}}>🤝</span>}
                      {atWar&&<span style={{fontSize:8,animation:"pulse .7s infinite"}}>⚔️</span>}
                      {online>0&&<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#00FF88",marginLeft:"auto"}}>🟢{online}</span>}
                    </div>
                    <div style={{fontSize:7,color:acc+"55",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Share Tech Mono',monospace"}}>{t.sub}</div>
                    {px>0&&<div style={{display:"flex",alignItems:"center",gap:3,marginTop:1}}>
                      <span style={{fontSize:7}}>{rank.icon}</span>
                      <span style={{fontSize:7,color:rank.color,fontFamily:"'Orbitron',monospace",fontWeight:700}}>{px}px</span>
                      {trend>0&&<span style={{fontSize:7,color:"#00FF88"}}>▲{trend}</span>}
                      {trend<0&&<span style={{fontSize:7,color:"#FF4400"}}>▼{Math.abs(trend)}</span>}
                    </div>}
                  </div>
                );})}
              </div>
              </>            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{width:194,borderLeft:"1px solid #1a1a30",background:"#05050d",flexShrink:0,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{display:"flex",borderBottom:"1px solid #1a1a30",flexShrink:0}}>
            {[["WAR","⚔"],["FEED","📡"],["CHAT","💬"],["WARS","🔥"],["SECT","🗺"]].map(([t,icon])=>{const on=tab===t;return(<button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"5px 0",background:on?"#08081a":"transparent",border:"none",color:on?"#00F5FF":"#3a3a5a",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:6,fontWeight:900,letterSpacing:.5,borderBottom:on?"2px solid #00F5FF":"2px solid transparent",transition:"all .1s"}}>{icon}<br/>{t}</button>);})}
          </div>
          {/* Missions + Share quick actions */}
          <div style={{display:"flex",gap:4,padding:"5px 5px 0",flexShrink:0}}>
            <button onClick={()=>{if(!requireAuth("missions"))return;setShowMissions(true);}} style={{flex:1,padding:"5px",background:pendingMissionCount>0?"rgba(255,215,0,.1)":"rgba(255,255,255,.04)",border:`1px solid ${pendingMissionCount>0?"rgba(255,215,0,.4)":"rgba(255,255,255,.08)"}`,borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:7,color:pendingMissionCount>0?"#FFD700":"#3a3a5a",letterSpacing:.5,position:"relative"}}>
              🎯 MISSIONS{pendingMissionCount>0&&<span style={{position:"absolute",top:-4,right:-4,background:"#FFD700",color:"#040408",borderRadius:"50%",width:14,height:14,fontSize:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>{pendingMissionCount}</span>}
            </button>
            {active&&<button onClick={()=>shareTerritory(active)} style={{flex:1,padding:"5px",background:"rgba(255,45,120,.06)",border:"1px solid rgba(255,45,120,.2)",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:7,color:"#FF2D78",letterSpacing:.5}}>📤 SHARE</button>}
            {active&&<button onClick={()=>shareTikTok(active)} style={{flex:1,padding:"5px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:7,color:"rgba(255,255,255,.5)",letterSpacing:.5}}>🎵 TT</button>}
            <button onClick={()=>setShowHallOfFame(s=>!s)} style={{flex:1,padding:"5px",background:"rgba(255,215,0,.05)",border:"1px solid rgba(255,215,0,.18)",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:7,color:"#FFD700",letterSpacing:.5}}>🏆 HOF</button>          </div>

          {/* Season mini stats */}
          <div style={{margin:"5px 5px 0",padding:"6px 8px",background:"rgba(255,215,0,.05)",border:"1px solid rgba(255,215,0,.12)",borderRadius:7,flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:900,color:"#FFD700"}}>S{season.num} · {seasonDaysLeft}d left</span>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,255,255,.3)"}}>{Math.round((1-seasonDaysLeft/SEASON_DAYS)*100)}%</span>
            </div>
            {(1-seasonDaysLeft/SEASON_DAYS)>=0.1&&<div style={{height:3,background:"#1a1a2e",borderRadius:2,overflow:"hidden",marginBottom:3}}>
              <div style={{height:"100%",width:`${(1-seasonDaysLeft/SEASON_DAYS)*100}%`,background:"linear-gradient(90deg,#FFD700,#FF4400)",borderRadius:2,transition:"width 1s"}}/>
            </div>}
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,255,255,.2)"}}>🟢 {onlineCount} online · {unlockedSectors.length}/400 sectors</div>
          </div>

          <div onClick={gatedOpenDaily} style={{margin:"4px 5px 0",padding:"4px 8px",background:"rgba(255,215,0,.04)",border:"1px solid rgba(255,215,0,.12)",borderRadius:6,cursor:"pointer",display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
            <span style={{fontSize:12}}>🔥</span>
            <div><div style={{fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:900,color:"#FFD700"}}>{streakData.days}d streak</div><div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:6,color:"#5a5a5a"}}>{alreadyClaimedToday?"✅ Claimed":`🎁 ${freePixels}px free`}</div></div>
          </div>
          <div onClick={()=>{if(!requireAuth("fandom"))return;navigate("/request-fandom");}} style={{margin:"4px 5px 0",padding:"6px 8px",background:"rgba(200,255,0,.08)",border:"2px solid rgba(200,255,0,.4)",borderRadius:6,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5,flexShrink:0}}>
            <span style={{fontSize:11}}>➕</span>
            <span style={{fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:900,color:"#C8FF00",letterSpacing:1}}>REQUEST A FANDOM</span>
          </div>

          {/* WAR TAB — Territory Leaderboard with Trend */}
          {tab==="WAR"&&<div style={{flex:1,overflowY:"auto",padding:"5px 5px"}}>
            {/* Hall of Fame */}
            {showHallOfFame&&season.winners?.length>0&&<div style={{marginBottom:10}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:7,letterSpacing:2,color:"#FFD700",marginBottom:5}}>🏆 HALL OF FAME</div>
              {[...season.winners].reverse().map((w,i)=>(
                <div key={i} style={{marginBottom:4,padding:"6px 8px",background:"rgba(255,215,0,.05)",border:"1px solid rgba(255,215,0,.15)",borderRadius:6}}>
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:7,color:"rgba(255,215,0,.5)",marginBottom:2}}>Season {w.season} · {w.theme?.split(" vs ")[0]||"—"}</div>
                  <div style={{fontWeight:700,fontSize:10,color:"#FFD700"}}>👑 {w.team}</div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,255,255,.25)"}}>{w.pixels?.toLocaleString()} pixels</div>
                </div>
              ))}
              <div style={{borderBottom:"1px solid rgba(255,255,255,.06)",marginBottom:8}}/>
            </div>}
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:7,letterSpacing:2,color:"#2a2a4a",marginBottom:4}}>TERRITORY RANKINGS</div>
            {board.length===0?<div style={{fontSize:8,color:"#1a1a2a",fontFamily:"'Share Tech Mono',monospace",paddingTop:6}}>No territory yet</div>
            :board.map((t,i)=>{const acc=CAT_ACCENT[t.cat]||"#00F5FF";const rank=getRank(t.count);const trendUp=t.trend>0;const trendDown=t.trend<0;return(
              <div key={t.id} onClick={()=>setActive(t.id)} style={{marginBottom:3,padding:"5px 6px",background:"#09091a",borderRadius:5,border:`1px solid ${acc}18`,cursor:"pointer",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",left:0,top:0,bottom:0,width:2,background:`linear-gradient(180deg,${t.color},${acc})`}}/>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:2,paddingLeft:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <span style={{fontSize:7,color:i<3?"#FFD700":"#3a3a5a",fontFamily:"'Orbitron',monospace"}}>{i+1}</span>
                    <span style={{fontSize:8,fontWeight:700,color:t.color,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:80}}>{rank.icon} {t.name}</span>
                    {isAllied(t.id)&&<span style={{fontSize:8}}>🤝</span>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:3}}>
                    {trendUp&&<span style={{fontSize:8,color:"#00FF88",fontFamily:"'Orbitron',monospace"}}>▲{t.trend}</span>}
                    {trendDown&&<span style={{fontSize:8,color:"#FF4400",fontFamily:"'Orbitron',monospace"}}>▼{Math.abs(t.trend)}</span>}
                    <span style={{fontSize:7,color:"#C8FF00",fontFamily:"'Orbitron',monospace"}}>€{t.count}</span>
                  </div>
                </div>
                <div style={{height:2,background:"#1a1a2e",borderRadius:2,overflow:"hidden",marginBottom:1,marginLeft:5}}>
                  <div style={{height:"100%",width:`${(t.count/board[0].count)*100}%`,background:`linear-gradient(90deg,${t.color},${acc})`,borderRadius:2,transition:"width .5s"}}/>
                </div>
                <div style={{fontSize:6,color:"#2a2a3a",marginLeft:5,fontFamily:"'Share Tech Mono',monospace"}}>{rank.name} · {t.count}px</div>
              </div>
            );})}
          </div>}

          {/* FEED TAB */}
          {tab==="FEED"&&<div style={{flex:1,overflowY:"auto",padding:"5px 5px"}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:7,letterSpacing:2,color:"#2a2a4a",marginBottom:4,display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:4,height:4,borderRadius:"50%",background:"#FF2D78",animation:"pulse .8s infinite"}}/>LIVE FEED
            </div>
            {feed.map(f=>(
              <div key={f.id} style={{marginBottom:3,padding:"4px 6px",background:f.isMe?rgba(f.color,.08):f.isWar?"rgba(255,68,0,.07)":f.isBetrayal?"rgba(255,0,0,.07)":"#08081a",borderRadius:4,border:`1px solid ${f.isMe?rgba(f.color,.3):f.isWar?"rgba(255,68,0,.25)":"#1a1a2a"}`,animation:"slideDown .2s ease"}}>
                <div style={{display:"flex",gap:4,alignItems:"flex-start"}}>
                  <span style={{fontSize:9,flexShrink:0}}>{f.icon}</span>
                  <div style={{minWidth:0}}>
                    <span style={{fontSize:7,fontWeight:700,color:f.color}}>{f.team} </span>
                    <span style={{fontSize:7,color:f.isWar?"#FF6600":"#5a5a7a"}}>{f.msg}</span>
                    {f.isMe&&<span style={{fontSize:6,color:"#FFD700",marginLeft:2}}>YOU</span>}
                  </div>
                </div>
                <div style={{fontSize:6,color:"#2a2a3a",marginTop:1,fontFamily:"'Share Tech Mono',monospace"}}>{f.ts}</div>
              </div>
            ))}
          </div>}

          {/* CHAT TAB */}
          {tab==="CHAT"&&<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            {!active?
              <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:12,textAlign:"center"}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#2a2a4a",lineHeight:1.8}}>💬<br/>Select a fandom<br/>to join their<br/>War Room</div>
              </div>:
              <>
                <div style={{padding:"5px 8px",borderBottom:"1px solid #1a1a30",flexShrink:0,display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:6,height:6,borderRadius:1,background:at?.color||"#888",boxShadow:`0 0 5px ${at?.color}`}}/>
                  <span style={{fontFamily:"'Orbitron',monospace",fontSize:8,color:at?.color||"#888",fontWeight:900,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{at?.name} WAR ROOM</span>
                </div>
                <div style={{flex:1,overflowY:"auto",padding:"5px 6px",display:"flex",flexDirection:"column",gap:4}}>
                  {chatMessages.length===0&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#2a2a3a",textAlign:"center",paddingTop:16,lineHeight:1.8}}>No messages yet.<br/>Be the first to<br/>rally the fans! 🔥</div>}
                  {chatMessages.map((m,i)=>(
                    <div key={m.id||i} style={{padding:"5px 7px",background:"#09091a",borderRadius:5,border:"1px solid #1a1a2a",animation:"slideDown .15s ease"}}>
                      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:at?.color||"#888",marginBottom:2,opacity:.5}}>{new Date(m.created_at).toLocaleTimeString("en",{hour12:false,hour:"2-digit",minute:"2-digit"})}</div>
                      <div style={{fontSize:11,color:"#c0c8e8",lineHeight:1.4,wordBreak:"break-word"}}>{m.text}</div>
                    </div>
                  ))}
                </div>
                <div style={{padding:"5px",borderTop:"1px solid #1a1a30",flexShrink:0,display:"flex",gap:4}}>
                  <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Rally the fans…" style={{flex:1,background:"#0c0c1c",border:`1px solid ${rgba(at?.color||"#1a1a2e",.3)}`,borderRadius:5,padding:"5px 8px",color:"#b0b8e0",fontSize:10,fontFamily:"'Rajdhani',sans-serif",outline:"none"}}/>
                  <button onClick={sendMessage} style={{padding:"5px 9px",background:rgba(at?.color||"#00F5FF",.12),border:`1px solid ${rgba(at?.color||"#00F5FF",.3)}`,borderRadius:5,cursor:"pointer",color:at?.color||"#00F5FF",fontSize:13,fontWeight:900}}>→</button>
                </div>
              </>
            }
          </div>}

          {/* WARS TAB — Alliances + War declarations */}
          {tab==="WARS"&&<div style={{flex:1,overflowY:"auto",padding:"5px 5px"}}>
            {active&&<div style={{display:"flex",gap:4,marginBottom:10}}>
              <button onClick={()=>{if(!requireAuth("war"))return;setShowWarModal(true);}} style={{flex:1,padding:"7px",background:"rgba(255,68,0,.08)",border:"1px solid rgba(255,68,0,.3)",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#FF4400",letterSpacing:.5}}>⚔️ DECLARE WAR</button>
              <button onClick={()=>{if(!requireAuth("alliance"))return;setShowAllianceModal(true);}} style={{flex:1,padding:"7px",background:"rgba(0,255,170,.06)",border:"1px solid rgba(0,255,170,.25)",borderRadius:6,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:8,color:"#00FFAA",letterSpacing:.5}}>🤝 ALLY</button>
            </div>}

            {/* Active alliances */}
            {myActiveAlliances.length>0&&<>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:7,letterSpacing:2,color:"#00FFAA",marginBottom:5}}>🤝 ACTIVE ALLIANCES</div>
              {myActiveAlliances.map(a=>{const partnerId=a.proposer===active?a.target:a.proposer;const partner=TM[partnerId];return(
                <div key={a.id} style={{marginBottom:5,padding:"7px 8px",background:"rgba(0,255,170,.05)",border:"1px solid rgba(0,255,170,.2)",borderRadius:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <div style={{width:5,height:5,borderRadius:1,background:partner?.color||"#888"}}/>
                      <span style={{fontSize:10,fontWeight:700,color:partner?.color||"#888",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:80}}>{partner?.name||"?"}</span>
                    </div>
                    <button onClick={()=>betrayAlliance(a.id,partner?.name||"?")} style={{padding:"2px 6px",background:"rgba(255,68,0,.1)",border:"1px solid rgba(255,68,0,.3)",borderRadius:4,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#FF4400"}}>BETRAY</button>
                  </div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(0,255,170,.4)"}}>✓ Cannot raid each other</div>
                </div>
              );})}
            </>}

            {/* Active wars */}
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:7,letterSpacing:2,color:"#FF4400",marginBottom:5,marginTop:myActiveAlliances.length>0?10:0}}>⚔️ ACTIVE WARS</div>
            {wars.length===0?<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#2a2a3a",lineHeight:1.6}}>No wars declared.<br/>Select a fandom and<br/>hit DECLARE WAR.</div>
            :wars.slice(0,10).map(w=>{const att=TM[w.attacker];const def=TM[w.defender];const isMe=w.attacker===active||w.defender===active;return(
              <div key={w.id} style={{marginBottom:4,padding:"6px 8px",background:isMe?"rgba(255,68,0,.07)":"rgba(255,68,0,.03)",border:`1px solid ${isMe?"rgba(255,68,0,.3)":"rgba(255,68,0,.15)"}`,borderRadius:6,animation:"slideDown .2s ease"}}>
                <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap",marginBottom:2}}>
                  <span style={{fontSize:9,fontWeight:700,color:att?.color||"#888",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:55}}>{att?.name||"?"}</span>
                  <span style={{fontSize:10,color:"#FF4400",animation:isMe?"pulse .7s infinite":undefined}}>⚔️</span>
                  <span style={{fontSize:9,fontWeight:700,color:def?.color||"#888",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:55}}>{def?.name||"?"}</span>
                </div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,255,255,.2)"}}>{new Date(w.declared_at).toLocaleDateString()}{isMe&&<span style={{color:"#FF4400",marginLeft:4}}>YOU</span>}</div>
              </div>
            );})}
          </div>}

          {/* DISCORD TAB */}
          {/* SECTOR LEADERBOARD TAB */}
          {tab==="SECT"&&<div style={{flex:1,overflowY:"auto",padding:"5px 5px"}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:7,letterSpacing:2,color:"#2a2a4a",marginBottom:6}}>🗺 SECTOR CONTROL</div>
            {sectorLeaderboard.length===0?<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#1a1a2a",paddingTop:6}}>No sectors claimed yet</div>
            :sectorLeaderboard.slice(0,25).map(s=>{
              const pct=s.leader?Math.round((s.leaderPx/s.total)*100):0;
              return(
                <div key={s.k} onClick={()=>{setVx(Math.max(0,s.sx*SECTOR-40));setVy(Math.max(0,s.sy*SECTOR-30));}} style={{marginBottom:4,padding:"6px 7px",background:"#09091a",borderRadius:5,border:`1px solid ${s.leader?rgba(s.leader.color,.2):"rgba(255,255,255,.06)"}`,cursor:"pointer",transition:"border-color .15s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <div style={{width:6,height:6,borderRadius:1,background:s.leader?.color||"#333"}}/>
                      <span style={{fontFamily:"'Orbitron',monospace",fontSize:8,color:"rgba(255,255,255,.5)"}}>S{s.sx+1}-{s.sy+1}</span>
                      {s.contested&&<span style={{fontSize:7,animation:"pulse .8s infinite"}}>⚔️</span>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontSize:7,fontWeight:700,color:s.leader?.color||"#555",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:65}}>{s.leader?.name||"Empty"}</span>
                      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"rgba(255,255,255,.25)"}}>{s.total}px</span>
                    </div>
                  </div>
                  <div style={{height:2,background:"rgba(255,255,255,.06)",borderRadius:1,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:s.leader?.color||"#333",borderRadius:1,transition:"width .5s"}}/>
                  </div>
                  {s.contested&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:6,color:"rgba(255,68,0,.5)",marginTop:2}}>CONTESTED — {Object.keys({}).length} fandoms</div>}
                </div>
              );
            })}
          </div>}

          {/* DISC TAB */}
          {tab==="DISC"&&<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"8px 8px 6px",borderBottom:"1px solid #1a1a30",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <svg width="16" height="12" viewBox="0 0 71 55" fill="none"><path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.9a40.7 40.7 0 0 0-1.8 3.7 54.1 54.1 0 0 0-16.4 0A38.9 38.9 0 0 0 25.5.9 58.4 58.4 0 0 0 10.9 4.9C1.6 19 -1 32.7.3 46.3a58.9 58.9 0 0 0 18 9.1 44.6 44.6 0 0 0 3.9-6.3 38.3 38.3 0 0 1-6.1-2.9l1.5-1.1a42.1 42.1 0 0 0 36 0l1.5 1.1a38.3 38.3 0 0 1-6.1 2.9 44.6 44.6 0 0 0 3.9 6.3 58.7 58.7 0 0 0 18-9.1C72 30.6 68.3 17 60.1 4.9ZM23.7 38c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.2 6.4 7.2c0 4-2.9 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.2 6.4 7.2c0 4-2.9 7.2-6.4 7.2Z" fill="#5865F2"/></svg>
                <span style={{fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:900,color:"#5865F2",letterSpacing:1}}>WAR COUNCIL</span>
              </div>
              <button onClick={()=>setShowDiscord(s=>!s)} style={{padding:"3px 8px",background:"rgba(88,101,242,.15)",border:"1px solid rgba(88,101,242,.4)",borderRadius:5,cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:7,color:"#7289DA",letterSpacing:1}}>{showDiscord?"HIDE":"FLOAT"}</button>
            </div>
            <iframe src={`https://discord.com/widget?id=${DISCORD_ID}&theme=dark`} width="100%" height="100%" style={{border:"none",flex:1}} sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts" title="Discord"/>
            <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" style={{display:"block",padding:"9px",background:"linear-gradient(90deg,#5865F2,#7289DA)",textAlign:"center",textDecoration:"none",fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:900,color:"#fff",letterSpacing:1,flexShrink:0}}>JOIN SERVER →</a>
          </div>}

        </div>
      </div>
      )} {/* end desktop layout ternary */}

      {/* DISCORD FLOATING PANEL — triggered from DISC tab */}
      {showDiscord&&<div style={{position:"fixed",bottom:70,right:200,zIndex:600,width:320,background:"#2f3136",borderRadius:12,overflow:"hidden",border:"2px solid #5865F2",boxShadow:"0 8px 40px rgba(88,101,242,.45)",animation:"pop .3s cubic-bezier(.34,1.56,.64,1)",display:"flex",flexDirection:"column"}}>
          <div style={{background:"#202225",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <svg width="18" height="14" viewBox="0 0 71 55" fill="none"><path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.9a40.7 40.7 0 0 0-1.8 3.7 54.1 54.1 0 0 0-16.4 0A38.9 38.9 0 0 0 25.5.9 58.4 58.4 0 0 0 10.9 4.9C1.6 19 -1 32.7.3 46.3a58.9 58.9 0 0 0 18 9.1 44.6 44.6 0 0 0 3.9-6.3 38.3 38.3 0 0 1-6.1-2.9l1.5-1.1a42.1 42.1 0 0 0 36 0l1.5 1.1a38.3 38.3 0 0 1-6.1 2.9 44.6 44.6 0 0 0 3.9 6.3 58.7 58.7 0 0 0 18-9.1C72 30.6 68.3 17 60.1 4.9ZM23.7 38c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.2 6.4 7.2c0 4-2.9 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.2 6.4 7.2c0 4-2.9 7.2-6.4 7.2Z" fill="#5865F2"/></svg>
              <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:"#fff",letterSpacing:1}}>WAR COUNCIL</span>
            </div>
            <button onClick={()=>setShowDiscord(false)} style={{background:"none",border:"none",color:"#72767d",cursor:"pointer",fontSize:16,lineHeight:1}}>✕</button>
          </div>
          <iframe src={`https://discord.com/widget?id=${DISCORD_ID}&theme=dark`} width="320" height="380" style={{border:"none",display:"block"}} sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts" title="Discord"/>
          <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" style={{display:"block",padding:"11px",background:"linear-gradient(90deg,#5865F2,#7289DA)",textAlign:"center",textDecoration:"none",fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:900,color:"#fff",letterSpacing:1}}>JOIN SERVER →</a>
      </div>}

    </div>
  );
}
