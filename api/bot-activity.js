// api/bot-activity.js
// Bot activity following actual game rules

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GW = 2000, GH = 2000, SECTOR = 100;
const RECHARGE_RATE = 1; // 1 free pixel per hour
const GOLD_PER_50PX = 1; // 1 gold per 50 pixels per 5 min
const GOLD_RAID_COST = 20;
const GOLD_RAID_PIXELS = 20;
const DECAY_EXPIRE_DAYS = 60;

const BOT_FANDOMS = {
  "Naruto":         "🎌 Anime|Shonen|Naruto",
  "AoT":            "🎌 Anime|Shonen|Attack on Titan",
  "DemonSlayer":    "🎌 Anime|Shonen|Demon Slayer",
  "JJK":            "🎌 Anime|Shonen|Jujutsu Kaisen",
  "OnePiece":       "🎌 Anime|Shonen|One Piece",
  "DragonBall":     "🎌 Anime|Shonen|Dragon Ball",
  "MHA":            "🎌 Anime|Shonen|My Hero Academia",
  "OnePunch":       "🎌 Anime|Shonen|One Punch Man",
  "FullMetal":      "🎌 Anime|Shonen|Fullmetal Alchemist",
  "Evangelion":     "🎌 Anime|Seinen|Neon Genesis Evangelion",
  "Bleach":         "🎌 Anime|Shonen|Bleach",
  "FairyTail":      "🎌 Anime|Shonen|Fairy Tail",
  "SAO":            "🎌 Anime|Isekai|Sword Art Online",
  "BlackClover":    "🎌 Anime|Shonen|Black Clover",
  "HunterX":        "🎌 Anime|Shonen|Hunter x Hunter",
  "Pokemon":        "🎮 Gaming|RPG|Pokémon",
  "Minecraft":      "🎮 Gaming|Sandbox|Minecraft",
  "Fortnite":       "🎮 Gaming|Battle Royale|Fortnite",
  "Valorant":       "🎮 Gaming|FPS|Valorant",
  "Apex":           "🎮 Gaming|Battle Royale|Apex Legends",
  "LeagueOfLegends":"🎮 Gaming|MOBA|League of Legends",
  "LoL":            "🎮 Gaming|MOBA|League of Legends",
  "Overwatch":      "🎮 Gaming|FPS|Overwatch",
  "GenshinImpact":  "🎮 Gaming|RPG|Genshin Impact",
  "Zelda":          "🎮 Gaming|RPG|The Legend of Zelda",
  "Cyberpunk":      "🎮 Gaming|RPG|Cyberpunk 2077",
  "HollowKnight":   "🎮 Gaming|Indie|Hollow Knight",
  "GTA":            "🎮 Gaming|Open World|GTA",
  "CallOfDuty":     "🎮 Gaming|FPS|Call of Duty",
  "Witcher":        "🎮 Gaming|RPG|The Witcher",
  "Skyrim":         "🎮 Gaming|RPG|The Elder Scrolls",
  "Halo":           "🎮 Gaming|FPS|Halo",
  "Doom":           "🎮 Gaming|FPS|DOOM",
  "EldenRing":      "🎮 Gaming|RPG|Elden Ring",
  "GodOfWar":       "🎮 Gaming|Action|God of War",
  "RocketLeague":   "🎮 Gaming|Sports|Rocket League",
  "Warcraft":       "🎮 Gaming|MMORPG|World of Warcraft",
  "Diablo":         "🎮 Gaming|RPG|Diablo",
  "Starcraft":      "🎮 Gaming|RTS|StarCraft",
  "CSGO":           "🎮 Gaming|FPS|CS:GO",
  "Tekken":         "🎮 Gaming|Fighting|Tekken",
  "MortalKombat":   "🎮 Gaming|Fighting|Mortal Kombat",
  "StreetFighter":  "🎮 Gaming|Fighting|Street Fighter",
  "Bloodborne":     "🎮 Gaming|RPG|Bloodborne",
  "Terraria":       "🎮 Gaming|Sandbox|Terraria",
  "Stardew":        "🎮 Gaming|Indie|Stardew Valley",
  "AmongUs":        "🎮 Gaming|Indie|Among Us",
  "FallGuys":       "🎮 Gaming|Battle Royale|Fall Guys",
  "Rust":           "🎮 Gaming|Survival|Rust",
  "RainbowSix":     "🎮 Gaming|FPS|Rainbow Six Siege",
  "Battlefield":    "🎮 Gaming|FPS|Battlefield",
  "FIFA":           "🎮 Gaming|Sports|EA FC",
  "BTS":            "🎵 Music|K-Pop|BTS",
  "BLACKPINK":      "🎵 Music|K-Pop|BLACKPINK",
  "Kpop":           "🎵 Music|K-Pop|BLACKPINK",
  "Taylor":         "🎵 Music|Pop|Taylor Swift",
  "Ariana":         "🎵 Music|Pop|Ariana Grande",
  "Billie":         "🎵 Music|Pop|Billie Eilish",
  "Drake":          "🎵 Music|Hip-Hop|Drake",
  "Spotify":        "🎵 Music|Hip-Hop|Drake",
  "Eminem":         "🎵 Music|Hip-Hop|Eminem",
  "Kendrick":       "🎵 Music|Hip-Hop|Kendrick Lamar",
  "KendrickLamar":  "🎵 Music|Hip-Hop|Kendrick Lamar",
  "Travis":         "🎵 Music|Hip-Hop|Travis Scott",
  "PostMalone":     "🎵 Music|Hip-Hop|Post Malone",
  "Weeknd":         "🎵 Music|R&B|The Weeknd",
  "Coldplay":       "🎵 Music|Rock|Coldplay",
  "EdSheeran":      "🎵 Music|Pop|Ed Sheeran",
  "BrunoMars":      "🎵 Music|Pop|Bruno Mars",
  "Beyonce":        "🎵 Music|R&B|Beyoncé",
  "Rihanna":        "🎵 Music|R&B|Rihanna",
  "LadyGaga":       "🎵 Music|Pop|Lady Gaga",
  "DuaLipa":        "🎵 Music|Pop|Dua Lipa",
  "SZA":            "🎵 Music|R&B|SZA",
  "FrankOcean":     "🎵 Music|R&B|Frank Ocean",
  "TylerCreator":   "🎵 Music|Hip-Hop|Tyler, the Creator",
  "KanyeWest":      "🎵 Music|Hip-Hop|Kanye West",
  "JayZ":           "🎵 Music|Hip-Hop|Jay-Z",
  "NickiMinaj":     "🎵 Music|Hip-Hop|Nicki Minaj",
  "CardiB":         "🎵 Music|Hip-Hop|Cardi B",
  "MeganThee":      "🎵 Music|Hip-Hop|Megan Thee Stallion",
  "HarryStyles":    "🎵 Music|Pop|Harry Styles",
  "OliviaRodrigo":  "🎵 Music|Pop|Olivia Rodrigo",
  "DojaCat":        "🎵 Music|Pop|Doja Cat",
  "Lizzo":          "🎵 Music|Pop|Lizzo",
  "LanaDelRey":     "🎵 Music|Pop|Lana Del Rey",
  "StrayKids":      "🎵 Music|K-Pop|Stray Kids",
  "Aespa":          "🎵 Music|K-Pop|aespa",
  "NewJeans":       "🎵 Music|K-Pop|NewJeans",
  "TWICE":          "🎵 Music|K-Pop|TWICE",
  "Seven":          "🎵 Music|Rock|The White Stripes",
  "ManCity":        "⚽ Sports|Football|Manchester City",
  "ManUnited":      "⚽ Sports|Football|Manchester United",
  "Arsenal":        "⚽ Sports|Football|Arsenal FC",
  "Chelsea":        "⚽ Sports|Football|Chelsea FC",
  "Spurs":          "⚽ Sports|Football|Tottenham Hotspur",
  "Bayern":         "⚽ Sports|Football|Bayern Munich",
  "PSG":            "⚽ Sports|Football|Paris Saint-Germain",
  "Inter":          "⚽ Sports|Football|Inter Milan",
  "Juventus":       "⚽ Sports|Football|Juventus",
  "Atletico":       "⚽ Sports|Football|Atlético Madrid",
  "RealMadrid":     "⚽ Sports|Football|Real Madrid",
  "Barcelona":      "⚽ Sports|Football|FC Barcelona",
  "Liverpool":      "⚽ Sports|Football|Liverpool FC",
  "NBA":            "⚽ Sports|Basketball|NBA",
  "NFL":            "⚽ Sports|American Football|NFL",
  "UFC":            "⚽ Sports|MMA|UFC",
  "Tennis":         "⚽ Sports|Tennis|ATP Tour",
  "F1":             "⚽ Sports|Motorsport|Formula 1",
  "Cricket":        "⚽ Sports|Cricket|ICC",
  "GOT":            "🎬 TV & Film|Fantasy|Game of Thrones",
  "BreakingBad":    "🎬 TV & Film|Drama|Breaking Bad",
  "Mandalorian":    "🎬 TV & Film|Sci-Fi|Star Wars",
  "WandaVision":    "🎬 TV & Film|Marvel|WandaVision",
  "Loki":           "🎬 TV & Film|Marvel|Loki",
  "Daredevil":      "🎬 TV & Film|Marvel|Daredevil",
  "Punisher":       "🎬 TV & Film|Marvel|The Punisher",
  "SpiderVerse":    "🎬 TV & Film|Marvel|Spider-Man",
  "Avengers":       "🎬 TV & Film|Marvel|Avengers",
  "IronMan":        "🎬 TV & Film|Marvel|Iron Man",
  "Thor":           "🎬 TV & Film|Marvel|Thor",
  "BlackPanther":   "🎬 TV & Film|Marvel|Black Panther",
  "HarryPotter":    "🎬 TV & Film|Fantasy|Harry Potter",
  "LOTR":           "🎬 TV & Film|Fantasy|Lord of the Rings",
  "StarWars":       "🎬 TV & Film|Sci-Fi|Star Wars",
  "Matrix":         "🎬 TV & Film|Sci-Fi|The Matrix",
  "Dune":           "🎬 TV & Film|Sci-Fi|Dune",
  "StrangerThings": "🎬 TV & Film|Sci-Fi|Stranger Things",
  "WalkingDead":    "🎬 TV & Film|Horror|The Walking Dead",
  "TheOffice":      "🎬 TV & Film|Comedy|The Office",
  "Friends":        "🎬 TV & Film|Comedy|Friends",
  "Sopranos":       "🎬 TV & Film|Drama|The Sopranos",
  "Succession":     "🎬 TV & Film|Drama|Succession",
  "PeakyBlinders":  "🎬 TV & Film|Drama|Peaky Blinders",
  "Wednesday":      "🎬 TV & Film|Horror|Wednesday",
  "SquidGame":      "🎬 TV & Film|Thriller|Squid Game",
};

function getFandomForBot(username) {
  for (const [key, fandom] of Object.entries(BOT_FANDOMS)) {
    if (username.includes(key)) return fandom;
  }
  return "🎌 Anime|Shonen|Naruto";
}

function getHomeZone(botIndex) {
  // Spread bots across center sectors (10x10 area around center 1000,1000)
  const zones = [];
  for (let sy = 7; sy <= 12; sy++) {
    for (let sx = 7; sx <= 12; sx++) {
      zones.push({ x: sx * SECTOR + 50, y: sy * SECTOR + 50 });
    }
  }
  return zones[botIndex % zones.length];
}

function isBotActiveNow(botIndex) {
  const hour = new Date().getUTCHours();
  const schedules = [
    [0,8],[1,9],[2,10],[3,11],[4,12],[5,13],[6,14],[7,15],
    [8,16],[9,17],[10,18],[11,19],[12,20],[13,21],[14,22],[15,23],
    [16,0],[17,1],[18,2],[19,3],[20,4],[21,5],[22,6],[23,7],
    [0,12],[6,18],[12,0],[18,6],[2,14],[8,20],[14,2],[20,8],
    [4,16],[10,22],[16,4],[22,10],[1,13],[7,19],[13,1],[19,7],
    [3,15],[9,21],[15,3],[21,9],[5,17],[11,23],[17,5],[0,16],
    [6,22],[12,4],[18,10],[2,18],[8,0],[14,6],[20,12],[4,20],
    [10,2],[16,8],[22,14],[1,17],[7,23],[13,5],[19,11],[3,19],
    [9,1],[15,7],[21,13],[5,21],[11,3],[17,9],[23,15],[4,12],
  ];
  const [start, end] = schedules[botIndex % schedules.length];
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

function getBotPersonality(botIndex) {
  const types = ["aggressive", "builder", "defender", "raider", "explorer"];
  return types[botIndex % types.length];
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const startTime = Date.now();
  const logs = [];

  try {
    // Get current season
    const { data: season } = await supabase
      .from("seasons").select("num").order("num", { ascending: false }).limit(1).single();
    const seasonNum = season?.num || 1;

    // Get unlocked sectors
    const { data: unlockedSectors } = await supabase
      .from("sectors").select("sx,sy").eq("season_num", seasonNum);
    const unlockedSet = new Set((unlockedSectors || []).map(s => `${s.sx},${s.sy}`));
    // Always include center sectors
    ["9,9","10,9","9,10","10,10"].forEach(k => unlockedSet.add(k));

    // Get all bots with their current stats
    const { data: bots } = await supabase
      .from("profiles")
      .select("id, username, free_pixels, total_claimed")
      .eq("is_bot", true);

    if (!bots || bots.length === 0) {
      return res.status(200).json({ message: "No bots found" });
    }

    let claimedTotal = 0, raidedTotal = 0, activeBots = 0;
    const activeBotList = [];

    for (let i = 0; i < bots.length; i++) {
      const bot = bots[i];
      if (!isBotActiveNow(i)) continue;
      if (Math.random() > 0.6) continue;

      activeBots++;
      const fandom = getFandomForBot(bot.username);
      const zone = getHomeZone(i);
      const personality = getBotPersonality(i);
      activeBotList.push({ username: bot.username, fandom });

      // === STEP 1: Passive War Chest gold income ===
      // Count bot's current pixels
      const { count: myPixelCount } = await supabase
        .from("pixels")
        .select("*", { count: "exact", head: true })
        .eq("season_num", seasonNum)
        .eq("team_id", fandom);

      const goldEarned = Math.floor((myPixelCount || 0) / 50) * GOLD_PER_50PX;

      // === STEP 2: Free pixel recharge ===
      // Bots recharge 1px per hour — cron runs every 30min so give 0-1px
      const rechargedPx = Math.random() > 0.5 ? 1 : 0;
      let currentFreePixels = (bot.free_pixels || 25) + rechargedPx;

      // === STEP 3: Decide action based on personality and resources ===
      const isRaider = personality === "raider" || personality === "aggressive";
      const canGoldRaid = goldEarned >= GOLD_RAID_COST;
      const shouldGoldRaid = isRaider && canGoldRaid && Math.random() > 0.4;
      const hasFreePixels = currentFreePixels > 0;

      if (shouldGoldRaid) {
        // === GOLD RAID: spend 20 gold, steal 20 enemy pixels ===
        const spread = 150;
        const minX = Math.max(0, zone.x - spread);
        const maxX = Math.min(GW - 1, zone.x + spread);
        const minY = Math.max(0, zone.y - spread);
        const maxY = Math.min(GH - 1, zone.y + spread);

        const { data: enemyPixels } = await supabase
          .from("pixels")
          .select("idx")
          .eq("season_num", seasonNum)
          .neq("team_id", fandom)
          .gte("idx", minY * GW + minX)
          .lte("idx", maxY * GW + maxX)
          .limit(30);

        if (enemyPixels && enemyPixels.length > 0) {
          const raidCount = Math.min(GOLD_RAID_PIXELS, enemyPixels.length);
          const targets = enemyPixels.sort(() => Math.random() - 0.5).slice(0, raidCount);
          const now = Date.now();

          const { error } = await supabase.from("pixels").upsert(
            targets.map(p => ({ idx: p.idx, season_num: seasonNum, team_id: fandom, claimed_at: now })),
            { onConflict: "idx,season_num" }
          );

          if (!error) {
            raidedTotal += raidCount;
            logs.push(`⚔️ ${bot.username} gold-raided ${raidCount}px for ${fandom.split("|")[2]} (-${GOLD_RAID_COST}💰)`);
          }
        }

      } else if (hasFreePixels) {
        // === CLAIM with free pixels (following game rules) ===
        // Number of pixels to claim = min(free_pixels, personality-based limit)
        const maxClaim = personality === "builder" ? 
          Math.min(currentFreePixels, 6 + Math.floor(Math.random() * 4)) :
          Math.min(currentFreePixels, 2 + Math.floor(Math.random() * 3));

        const spread = personality === "explorer" ? 80 : 50;
        const claimRows = [];
        const now = Date.now();

        // Try to claim ADJACENT to existing territory (contiguity rule)
        const { data: myPixels } = await supabase
          .from("pixels")
          .select("idx")
          .eq("season_num", seasonNum)
          .eq("team_id", fandom)
          .limit(50);

        const myIdxSet = new Set((myPixels || []).map(p => p.idx));

        // First try adjacent pixels (cheaper in real game)
        const adjacentCandidates = [];
        myIdxSet.forEach(idx => {
          const gx = idx % GW, gy = Math.floor(idx / GW);
          [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dx,dy]) => {
            const nx = gx+dx, ny = gy+dy;
            if (nx < 0 || nx >= GW || ny < 0 || ny >= GH) return;
            const nidx = ny * GW + nx;
            if (myIdxSet.has(nidx)) return;
            const sx = Math.floor(nx / SECTOR), sy2 = Math.floor(ny / SECTOR);
            if (!unlockedSet.has(`${sx},${sy2}`)) return;
            adjacentCandidates.push(nidx);
          });
        });

        // Use adjacent pixels first, then random in zone
        const shuffled = adjacentCandidates.sort(() => Math.random() - 0.5);
        for (const idx of shuffled) {
          if (claimRows.length >= maxClaim) break;
          claimRows.push({ idx, season_num: seasonNum, team_id: fandom, claimed_at: now });
        }

        // Fill remaining with random zone pixels
        if (claimRows.length < maxClaim) {
          const attempts = (maxClaim - claimRows.length) * 6;
          for (let a = 0; a < attempts && claimRows.length < maxClaim; a++) {
            const gx = Math.max(0, Math.min(GW-1, zone.x + Math.floor((Math.random()-0.5)*spread*2)));
            const gy = Math.max(0, Math.min(GH-1, zone.y + Math.floor((Math.random()-0.5)*spread*2)));
            const idx = gy * GW + gx;
            const sx = Math.floor(gx / SECTOR), sy2 = Math.floor(gy / SECTOR);
            if (!unlockedSet.has(`${sx},${sy2}`)) continue;
            if (claimRows.find(r => r.idx === idx)) continue;
            claimRows.push({ idx, season_num: seasonNum, team_id: fandom, claimed_at: now });
          }
        }

        if (claimRows.length > 0) {
          const { error } = await supabase.from("pixels")
            .upsert(claimRows, { onConflict: "idx,season_num" });

          if (!error) {
            claimedTotal += claimRows.length;
            const newFreePixels = Math.max(0, currentFreePixels - claimRows.length);

            // Update bot's free_pixels balance
            await supabase.from("profiles")
              .update({ free_pixels: newFreePixels, total_claimed: (bot.total_claimed || 0) + claimRows.length })
              .eq("id", bot.id);

            logs.push(`🏴 ${bot.username} claimed ${claimRows.length}px for ${fandom.split("|")[2]} (${newFreePixels}px left)`);
          }
        }
      }

      // === STEP 4: Decay check — remove very old pixels ===
      const decayThreshold = Date.now() - (DECAY_EXPIRE_DAYS * 86400000);
      await supabase.from("pixels")
        .delete()
        .eq("season_num", seasonNum)
        .eq("team_id", fandom)
        .lt("claimed_at", decayThreshold);

      await new Promise(r => setTimeout(r, 30));
    }

    // Update bot presence
    if (activeBotList.length > 0) {
      const now = new Date().toISOString();
      await supabase.from("bot_presence").upsert(
        activeBotList.map(b => ({ username: b.username, fandom: b.fandom, last_seen: now, is_online: true })),
        { onConflict: "username" }
      );
    }

    // Mark inactive bots as offline
    await supabase.from("bot_presence")
      .update({ is_online: false })
      .lt("last_seen", new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

    const elapsed = Date.now() - startTime;
    return res.status(200).json({
      success: true, season: seasonNum,
      totalBots: bots.length, activeBots,
      claimedTotal, raidedTotal,
      elapsed: `${elapsed}ms`, logs
    });

  } catch (err) {
    console.error("Bot activity error:", err);
    return res.status(500).json({ error: err.message });
  }
}
