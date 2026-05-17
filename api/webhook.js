// api/webhook.js
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  const rawBody = await getRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { productId, userId, discordUsername, fandom, pixels, isSeasonPass, isWhale } = session.metadata;
    const totalPixels = parseInt(pixels) || 0;

    console.log(`Payment success: ${discordUsername} bought ${productId} (${totalPixels}px)`);

    try {
      if (userId && userId !== "guest") {
        // Fetch current pixel count
        const { data: profile } = await supabase
          .from("profiles")
          .select("free_pixels")
          .eq("id", userId)
          .single();

        const newPixelCount = (profile?.free_pixels || 0) + totalPixels;
        const updateData = { free_pixels: newPixelCount };

        // Whale Pack: grant VIP role
        if (isWhale === "true") updateData.role = "vip";

        await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", userId);

        console.log(`Granted ${totalPixels}px to ${discordUsername}`);
      }

      // Notify Discord
      await fetch("https://discord.com/api/webhooks/1505216663786623178/zgC0xopUlfOex7rIIcRos4SxMQrTvtj8-Gjl4cvoqyEukuOP3a-xl9ekt7iIPIj_dBAb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "💰 NEW PURCHASE — PIXELS OF WAR",
            description: `**${discordUsername}** bought **${productId.replace(/_/g, " ").toUpperCase()}**\n\n✅ **${totalPixels} pixels** granted\n💶 **€${(session.amount_total / 100).toFixed(2)}** received${isWhale === "true" ? "\n👑 **WHALE PACK** — VIP role granted!" : ""}${isSeasonPass === "true" ? "\n🏆 **SEASON PASS** activated!" : ""}`,
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
