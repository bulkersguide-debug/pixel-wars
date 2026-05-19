// api/webhook.js
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function verifyStripeSignature(payload, sigHeader, secret) {
  try {
    const parts = sigHeader.split(",");
    const timestamp = parts.find(p => p.startsWith("t="))?.slice(2);
    const signature = parts.find(p => p.startsWith("v1="))?.slice(3);
    if (!timestamp || !signature) return false;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const data = encoder.encode(`${timestamp}.${payload}`);
    const sig = await crypto.subtle.sign("HMAC", key, data);
    const expected = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, "0")).join("");
    return expected === signature;
  } catch (e) {
    console.error("Signature verification error:", e);
    return false;
  }
}

// Maps productId → human-readable powerup name for Discord notifications
const POWERUP_NAMES = {
  powerup_bomb:     "💣 Cluster Bomb",
  powerup_storm:    "🌩️ Pixel Storm",
  powerup_fortress: "🏰 Fortress",
  powerup_snipe:    "🎯 Sniper",
  powerup_airdrop:  "📦 Airdrop",
  powerup_nuke:     "☢️ Nuke",
  powerup_renew:    "🛡️ Renewal Shield",
  powerup_double:   "🎲 Double or Nothing",
  powerup_surge:    "⚡ Surge",
};

export default async function handler(req, res) {
  console.log("Webhook called:", req.method);

  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  const rawBody = await getRawBody(req);
  const payload = rawBody.toString("utf8");

  const valid = await verifyStripeSignature(payload, sig || "", webhookSecret);
  if (!valid) {
    console.error("Invalid webhook signature");
    console.log("Sig received:", sig?.slice(0, 50));
  }

  let event;
  try {
    event = JSON.parse(payload);
  } catch (e) {
    console.error("Failed to parse webhook payload:", e);
    return res.status(400).json({ error: "Invalid JSON" });
  }

  console.log("Event type:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Session metadata:", JSON.stringify(session.metadata));
    console.log("Amount:", session.amount_total);
    console.log("Customer email:", session.customer_details?.email);

    const {
      productId, userId, discordUsername, fandom,
      pixels, isPowerup, isSeasonPass, isWhale
    } = session.metadata || {};

    const totalPixels = parseInt(pixels) || 0;
    console.log(`Processing: ${discordUsername}, product: ${productId}, isPowerup: ${isPowerup}, userId: ${userId}`);

    if (!userId || userId === "guest") {
      console.log("Guest purchase or no userId — skipping");
      return res.status(200).json({ received: true });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // ─── POWERUP BRANCH ──────────────────────────────────────────────────────
    if (isPowerup === "true") {
      console.log(`⚡ Powerup purchase detected: ${productId}`);

      try {
        // Deduplicate — check if this session was already processed
        const { data: existing } = await supabase
          .from("active_powerups")
          .select("id")
          .eq("stripe_session_id", session.id)
          .single();

        if (existing) {
          console.log("⚠️ Powerup already activated for this session — skipping");
          return res.status(200).json({ received: true });
        }

        // Insert powerup as ready-to-use (is_used: false)
        const { error: powerupErr } = await supabase
          .from("active_powerups")
          .insert({
            user_id: userId,
            discord_username: discordUsername,
            powerup_type: productId,           // e.g. "powerup_nuke"
            stripe_session_id: session.id,
            purchased_at: new Date().toISOString(),
            is_used: false,
          });

        if (powerupErr) {
          console.error("Error inserting powerup:", JSON.stringify(powerupErr));
        } else {
          console.log(`✅ Powerup ${productId} activated for ${discordUsername}`);
        }

        // Record in purchases table for revenue tracking
        const { error: purchaseErr } = await supabase
          .from("purchases")
          .upsert({
            user_id: userId,
            discord_username: discordUsername,
            product_id: productId,
            pixels_granted: 0,
            amount_eur: session.amount_total / 100,
            stripe_session_id: session.id,
            fandom: fandom || "none",
            created_at: new Date().toISOString(),
          }, { onConflict: "stripe_session_id", ignoreDuplicates: true });

        if (purchaseErr) {
          console.error("Error recording powerup purchase:", JSON.stringify(purchaseErr));
        } else {
          console.log("✅ Powerup purchase recorded");
        }

        // Discord notification
        const powerupLabel = POWERUP_NAMES[productId] || productId;
        await fetch("https://discord.com/api/webhooks/1505216663786623178/zgC0xopUlfOex7rIIcRos4SxMQrTvtj8-Gjl4cvoqyEukuOP3a-xl9ekt7iIPIj_dBAb", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [{
              title: "⚡ POWER-UP PURCHASED — PIXELS OF WAR",
              description: `**${discordUsername}** just bought **${powerupLabel}**\n\n💶 **€${(session.amount_total / 100).toFixed(2)}** received\n🎮 Power-up is ready to use in-game`,
              color: 0xFF6B00,
              timestamp: new Date().toISOString(),
              footer: { text: "Pixels of War Payment System" },
            }],
          }),
        }).catch(err => console.error("Discord webhook error:", err));

      } catch (err) {
        console.error("Powerup processing error:", err.message);
      }

      return res.status(200).json({ received: true });
    }

    // ─── PIXEL / REGULAR PURCHASE BRANCH ────────────────────────────────────
    try {
      // Check for duplicate
      const { data: existing } = await supabase
        .from("purchases")
        .select("id")
        .eq("stripe_session_id", session.id)
        .single();

      if (existing) {
        console.log("⚠️ Session already processed — skipping duplicate grant");
        return res.status(200).json({ received: true });
      }

      // Get current pixels
      const { data: profile, error: fetchErr } = await supabase
        .from("profiles")
        .select("free_pixels")
        .eq("id", userId)
        .single();

      if (fetchErr) {
        console.error("Error fetching profile:", fetchErr);
      } else {
        console.log("Current pixels:", profile?.free_pixels);
        const newPixelCount = (profile?.free_pixels || 0) + totalPixels;
        const updateData = { free_pixels: newPixelCount };
        if (isWhale === "true") updateData.role = "vip";

        const { error: updateErr } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", userId);

        if (updateErr) {
          console.error("Error updating pixels:", updateErr);
        } else {
          console.log(`✅ Updated pixels to ${newPixelCount} for ${discordUsername}`);
        }
      }

      // Record purchase
      const { error: insertErr } = await supabase
        .from("purchases")
        .upsert({
          user_id: userId,
          discord_username: discordUsername,
          product_id: productId,
          pixels_granted: totalPixels,
          amount_eur: session.amount_total / 100,
          stripe_session_id: session.id,
          fandom: fandom || "none",
          created_at: new Date().toISOString(),
        }, { onConflict: "stripe_session_id", ignoreDuplicates: true });

      if (insertErr) {
        console.error("Error inserting purchase:", JSON.stringify(insertErr));
      } else {
        console.log("✅ Purchase recorded in database");
      }

    } catch (err) {
      console.error("Supabase error:", err.message);
    }

    // Discord notification for pixel purchase
    try {
      await fetch("https://discord.com/api/webhooks/1505216663786623178/zgC0xopUlfOex7rIIcRos4SxMQrTvtj8-Gjl4cvoqyEukuOP3a-xl9ekt7iIPIj_dBAb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "💰 NEW PURCHASE — PIXELS OF WAR",
            description: `**${discordUsername}** bought **${(productId || "").replace(/_/g, " ").toUpperCase()}**\n\n✅ **${totalPixels} pixels** granted\n💶 **€${(session.amount_total / 100).toFixed(2)}** received${isWhale === "true" ? "\n👑 WHALE PACK — VIP role granted!" : ""}${isSeasonPass === "true" ? "\n🏆 SEASON PASS activated!" : ""}`,
            color: 0xC8FF00,
            timestamp: new Date().toISOString(),
            footer: { text: "Pixels of War Payment System" },
          }],
        }),
      });
    } catch (discordErr) {
      console.error("Discord webhook error:", discordErr);
    }
  }

  return res.status(200).json({ received: true });
}
