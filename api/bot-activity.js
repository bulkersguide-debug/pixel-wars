// api/bot-activity.js
// Vercel cron job — runs every 30 minutes
// Makes bots claim pixels, raid enemies, appear active at different hours

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GW = 2000, GH = 2000, SECTOR = 100;

// Bot fandom assignments — maps username pattern to fandom team_id
const BOT_FANDOMS = {
  "Naruto":        "🎌 Anime|Shonen|Naruto",
  "AoT":           "🎌 Anime|Shonen|Attack on Titan",
  "DemonSlayer":   "🎌 Anime|Shonen|Demon Slayer",
  "JJK":           "🎌 Anime|Shonen|Jujutsu Kaisen",
  "OnePiece":      "🎌 Anime|Shonen|One Piece",
  "DragonBall":    "🎌 Anime|Shonen|Dragon Ball",
  "MHA":           "🎌 Anime|Shonen|My Hero Academia",
  "OnePunch":      "🎌 Anime|Shonen|One Punch Man",
  "FullMetal":     "🎌 Anime|Shonen|Fullmetal Alchemist",
  "Evangelion":    "🎌 Anime|Seinen|Neon Genesis Evangelion",
  "Bleach":        "🎌 Anime|Shonen|Bleach",
  "Pokemon":       "🎮 Gaming|RPG|Pokémon",
  "Minecraft":     "🎮 Gaming|Sandbox|Minecraft",
  "Fortnite":      "🎮 Gaming|Battle Royale|Fortnite",
  "Valorant":      "🎮 Gaming|FPS|Valorant",
  "Apex":          "🎮 Gaming|Battle Royale|Apex Legends",
  "LeagueOfLegends":"🎮 Gaming|MOBA|League of Legends",
  "Overwatch":     "🎮 Gaming|FPS|Overwatch",
  "GenshinImpact": "🎮 Gaming|RPG|Genshin Impact",
  "Zelda":         "🎮 Gaming|RPG|The Legend of Zelda",
  "Cyberpunk":     "🎮 Gaming|RPG|Cyberpunk 2077",
  "Hollow":        "🎮 Gaming|Indie|Hollow Knight",
  "GTA":           "🎮 Gaming|Open World|GTA",
  "CallOfDuty":    "🎮 Gaming|FPS|Call of Duty",
  "Witcher":       "🎮 Gaming|RPG|The Witcher",
  "BTS":           "🎵 Music|K-Pop|BTS",
  "BLACKPINK":     "🎵 Music|K-Pop|BLACKPINK",
  "Kpop":          "🎵 Music|K-Pop|BLACKPINK",
  "TaylorSwift":   "🎵 Music|Pop|Taylor Swift",
  "Eminem":        "🎵 Music|Hip-Hop|Eminem",
  "Billie":        "🎵 Music|Pop|Billie Eilish",
  "Ariana":        "🎵 Music|Pop|Ariana Grande",
  "Spotify":       "🎵 Music|Hip-Hop|Drake",
  "Stray":         "🎵 Music|K-Pop|Stray Kids",
  "TWICE":         "🎵 Music|K-Pop|TWICE",
  "KendrickLamar": "🎵 Music|Hip-Hop|Kendrick Lamar",
  "Seven":         "🎵 Music|Rock|The White Stripes",
  "Stranger":      "🎬 TV & Film|Sci-Fi|Stranger Things",
  "BreakingBad":   "🎬 TV & Film|Drama|Breaking Bad",
  "SpiderMan":     "🎬 TV & Film|Marvel|Spider-Man",
  "HarryPotter":   "🎬 TV & Film|Fantasy|Harry Potter",
  "Liverpool":     "⚽ Sports|Football|Liverpool FC",
  "RealMadrid":    "⚽ Sports|Football|Real Madrid",
  "NBA":           "⚽ Sports|Basketball|NBA",
  "FC_Barcelona":  "⚽ Sports|Football|FC Barcelona",
};

function getFandomForBot(username) {
  for (const [key, fandom] of Object.entries(BOT_FANDOMS)) {
    if (username.includes(key)) return fandom;
  }
  return "🎌 Anime|Shonen|Naruto"; // default
}

// Each bot has a home territory zone (where they mainly build)
function getHomeZone(botIndex) {
  const zones = [
    { x: 200, y: 200 }, { x: 600, y: 200 }, { x: 1000, y: 200 }, { x: 1400, y: 200 }, { x: 1800, y: 200 },
    { x: 200, y: 600 }, { x: 600, y: 600 }, { x: 1000, y: 600 }, { x: 1400, y: 600 }, { x: 1800, y: 600 },
    { x: 200, y: 1000 }, { x: 600, y: 1000 }, { x: 1000, y: 1000 }, { x: 1400, y: 1000 }, { x: 1800, y: 1000 },
    { x: 200, y: 1400 }, { x: 600, y: 1400 }, { x: 1000, y: 1400 }, { x: 1400, y: 1400 }, { x: 1800, y: 1400 },
    { x: 400, y: 400 }, { x: 800, y: 400 }, { x: 1200, y: 400 }, { x: 1600, y: 400 },
    { x: 400, y: 800 }, { x: 800, y: 800 }, { x: 1200, y: 800 }, { x: 1600, y: 800 },
    { x: 400, y: 1200 }, { x: 800, y: 1200 }, { x: 1200, y: 1200 }, { x: 1600, y: 1200 },
    { x: 400, y: 1600 }, { x: 800, y: 1600 }, { x: 1200, y: 1600 }, { x: 1600, y: 1600 },
    { x: 500, y: 500 }, { x: 900, y: 500 }, { x: 1300, y: 500 }, { x: 1700, y: 500 },
    { x: 500, y: 900 }, { x: 900, y: 900 }, { x: 1300, y: 900 }, { x: 1700, y: 900 },
    { x: 500, y: 1300 }, { x: 900, y: 1300 }, { x: 1300, y: 1300 },
  ];
  return zones[botIndex % zones.length];
}

// Check if bot should be active right now based on their schedule
function isBotActiveNow(botIndex) {
  const hour = new Date().getUTCHours();
  // Each bot has a different active window (8 hours out of 24)
  const schedules = [
    [0,8],[1,9],[2,10],[3,11],[4,12],[5,13],[6,14],[7,15],
    [8,16],[9,17],[10,18],[11,19],[12,20],[13,21],[14,22],[15,23],
    [16,0],[17,1],[18,2],[19,3],[20,4],[21,5],[22,6],[23,7],
    [0,12],[6,18],[12,0],[18,6],[2,14],[8,20],[14,2],[20,8],
    [4,16],[10,22],[16,4],[22,10],[1,13],[7,19],[13,1],[19,7],
    [3,15],[9,21],[15,3],[21,9],[5,17],[11,23],[17,5],
  ];
  const [start, end] = schedules[botIndex % schedules.length];
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

// Personality types affect behavior
function getBotPersonality(botIndex) {
  const types = ["aggressive", "builder", "defender", "raider", "explorer"];
  return types[botIndex % types.length];
}

export default async function handler(req, res) {
  // Allow cron trigger or manual trigger
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const startTime = Date.now();
  const logs = [];

  try {
    // Get current season
    const { data: season } = await supabase
      .from("seasons")
      .select("num")
      .order("num", { ascending: false })
      .limit(1)
      .single();
    const seasonNum = season?.num || 1;

    // Get all bots
    const { data: bots } = await supabase
      .from("profiles")
      .select("id, username, is_bot")
      .eq("is_bot", true);

    if (!bots || bots.length === 0) {
      return res.status(200).json({ message: "No bots found", logs });
    }

    // Get current pixel state (sample — just check density)
    const { count: totalPixels } = await supabase
      .from("pixels")
      .select("*", { count: "exact", head: true })
      .eq("season_num", seasonNum);

    let claimedTotal = 0, raidedTotal = 0, activeBots = 0;
    const activeBotList = [];

    for (let i = 0; i < bots.length; i++) {
      const bot = bots[i];

      // Check if this bot is active right now
      if (!isBotActiveNow(i)) continue;

      // Random chance to skip (not every bot acts every 30 min)
      if (Math.random() > 0.65) continue;

      activeBots++;
      const fandom = getFandomForBot(bot.username);
      activeBotList.push({ username: bot.username, fandom });
      const zone = getHomeZone(i);
      const personality = getBotPersonality(i);

      // Determine action based on personality
      const isRaider = personality === "raider" || personality === "aggressive";
      const shouldRaid = isRaider ? Math.random() > 0.3 : Math.random() > 0.8;

      if (shouldRaid && totalPixels > 100) {
        // RAID: find nearby enemy pixels
        const spreadX = 150 + Math.floor(Math.random() * 100);
        const spreadY = 150 + Math.floor(Math.random() * 100);
        const minX = Math.max(0, zone.x - spreadX);
        const maxX = Math.min(GW - 1, zone.x + spreadX);
        const minY = Math.max(0, zone.y - spreadY);
        const maxY = Math.min(GH - 1, zone.y + spreadY);

        // Find enemy pixels in zone
        const { data: enemyPixels } = await supabase
          .from("pixels")
          .select("idx")
          .eq("season_num", seasonNum)
          .neq("team_id", fandom)
          .gte("idx", minY * GW + minX)
          .lte("idx", maxY * GW + maxX)
          .limit(20);

        if (enemyPixels && enemyPixels.length > 0) {
          const raidCount = Math.min(
            personality === "aggressive" ? 8 : 3,
            enemyPixels.length
          );
          const targets = enemyPixels
            .sort(() => Math.random() - 0.5)
            .slice(0, raidCount);
          const now = Date.now();

          const raidRows = targets.map(p => ({
            idx: p.idx,
            season_num: seasonNum,
            team_id: fandom,
            claimed_at: now - Math.floor(Math.random() * 60000),
          }));

          const { error } = await supabase
            .from("pixels")
            .upsert(raidRows, { onConflict: "idx,season_num" });

          if (!error) {
            raidedTotal += raidCount;
            logs.push(`⚔️ ${bot.username} raided ${raidCount}px for ${fandom.split("|")[2]}`);
          }
        }
      } else {
        // CLAIM: build in home zone with some spread
        const spread = personality === "explorer" ? 200 : 80;
        const claimCount = personality === "builder" ? 
          6 + Math.floor(Math.random() * 6) : 
          2 + Math.floor(Math.random() * 5);

        const claimRows = [];
        const now = Date.now();
        const attempts = claimCount * 4;

        for (let attempt = 0; attempt < attempts && claimRows.length < claimCount; attempt++) {
          const gx = Math.max(0, Math.min(GW - 1,
            zone.x + Math.floor((Math.random() - 0.5) * spread * 2)
          ));
          const gy = Math.max(0, Math.min(GH - 1,
            zone.y + Math.floor((Math.random() - 0.5) * spread * 2)
          ));
          const idx = gy * GW + gx;

          // Check sector is valid
          const sx = Math.floor(gx / SECTOR), sy = Math.floor(gy / SECTOR);
          if (sx >= 20 || sy >= 20) continue;

          claimRows.push({
            idx,
            season_num: seasonNum,
            team_id: fandom,
            claimed_at: now - Math.floor(Math.random() * 1800000), // up to 30min ago
          });
        }

        if (claimRows.length > 0) {
          const { error } = await supabase
            .from("pixels")
            .upsert(claimRows, { onConflict: "idx,season_num" });

          if (!error) {
            claimedTotal += claimRows.length;
            logs.push(`🏴 ${bot.username} claimed ${claimRows.length}px for ${fandom.split("|")[2]}`);
          }
        }
      }

      // Small delay between bots to avoid hammering Supabase
      await new Promise(r => setTimeout(r, 50));
    }

    // Update bot presence so they appear online in the game
    await updateBotPresence(activeBotList, bots);

    const elapsed = Date.now() - startTime;
    const summary = {
      success: true,
      season: seasonNum,
      totalBots: bots.length,
      activeBots,
      claimedTotal,
      raidedTotal,
      elapsed: `${elapsed}ms`,
      logs,
    };

    console.log("Bot activity:", JSON.stringify(summary));
    return res.status(200).json(summary);

  } catch (err) {
    console.error("Bot activity error:", err);
    return res.status(500).json({ error: err.message, logs });
  }
}

// This function is called at the END of handler to update bot presence
async function updateBotPresence(activeBotNames, allBots) {
  const now = new Date().toISOString();
  
  // Upsert all active bots as online
  if (activeBotNames.length > 0) {
    const rows = activeBotNames.map(({ username, fandom }) => ({
      username,
      fandom,
      last_seen: now,
      is_online: true,
    }));
    await supabase.from("bot_presence").upsert(rows, { onConflict: "username" });
  }

  // Mark bots that haven't been seen in 2 hours as offline
  await supabase
    .from("bot_presence")
    .update({ is_online: false })
    .lt("last_seen", new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());
}
