// api/webhook.js
// Uses Stripe REST API directly — no npm package needed

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
  const parts = sigHeader.split(",");
  const timestamp = parts.find(p => p.startsWith("t="))?.slice(2);
  const signature = parts.find(p => p.startsWith("v1="))?.slice(3);
  if (!timestamp || !signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const data = encoder.encode(`${timestamp}.${payload}`);
  const sig = await crypto.subtle.sign("HMAC", key, data);
  const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  return expected === signature;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  const rawBody = await getRawBody(req);
  const payload = rawBody.toString("utf8");

  const valid = await verifyStripeSignature(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    console.error("Invalid webhook signature");
    return res.status(400).json({ error: "Invalid signature" });
  }

  const event = JSON.parse(payload);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { productId, userId, discordUsername, fandom, pixels, isSeasonPass, isWhale } = session.metadata;
    const totalPixels = parseInt(pixels) || 0;

    try {
      if (userId && userId !== "guest") {
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { data: profile } = await supabase
          .from("profiles")
          .select("free_pixels")
          .eq("id", userId)
          .single();

        const newPixelCount = (profile?.free_pixels || 0) + totalPixels;
        const updateData = { free_pixels: newPixelCount };
        if (isWhale === "true") updateData.role = "vip";

        await supabase.from("profiles").update(updateData).eq("id", userId);
        console.log(`Granted ${totalPixels}px to ${discordUsername}`);
      }

      // Discord notification
      await fetch("https://discord.com/api/webhooks/1505216663786623178/zgC0xopUlfOex7rIIcRos4SxMQrTvtj8-Gjl4cvoqyEukuOP3a-xl9ekt7iIPIj_dBAb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "💰 NEW PURCHASE — PIXELS OF WAR",
            description: `**${discordUsername}** bought **${productId.replace(/_/g, " ").toUpperCase()}**\n\n✅ **${totalPixels} pixels** granted\n💶 **€${(session.amount_total / 100).toFixed(2)}** received${isWhale === "true" ? "\n👑 WHALE PACK — VIP role granted!" : ""}${isSeasonPass === "true" ? "\n🏆 SEASON PASS activated!" : ""}`,
            color: 0xC8FF00,
            timestamp: new Date().toISOString(),
            footer: { text: "Pixels of War Payment System" },
          }],
        }),
      }).catch(() => {});

    } catch (err) {
      console.error("Error granting pixels:", err);
    }
  }

  return res.status(200).json({ received: true });
}
