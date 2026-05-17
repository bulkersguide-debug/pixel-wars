// api/webhook.js
// Stripe webhook handler — called by Stripe after successful payment
// Needs env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Disable body parsing — Stripe needs raw body for signature verification
module.exports.config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
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

  // Only handle successful payments
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { productId, userId, discordUsername, fandom, pixels, isSeasonPass, isWhale } = session.metadata;
    const totalPixels = parseInt(pixels) || 0;

    console.log(`Payment success: ${discordUsername} bought ${productId} (${totalPixels}px)`);

    try {
      if (userId && userId !== "guest") {
        // Add pixels to user's account
        const { data: profile, error: fetchError } = await supabase
          .from("profiles")
          .select("free_pixels, role")
          .eq("id", userId)
          .single();

        if (fetchError) throw fetchError;

        const newPixelCount = (profile?.free_pixels || 0) + totalPixels;

        const updateData = { free_pixels: newPixelCount };

        // Whale Pack: grant special role
        if (isWhale === "true") {
          updateData.role = "vip";
        }

        const { error: updateError } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", userId);

        if (updateError) throw updateError;

        // Log the purchase
        await supabase.from("purchases").insert({
          user_id: userId,
          discord_username: discordUsername,
          product_id: productId,
          pixels_granted: totalPixels,
          amount_eur: session.amount_total / 100,
          stripe_session_id: session.id,
          fandom,
          created_at: new Date().toISOString(),
        }).then(() => {}).catch(() => {}); // Don't fail if table doesn't exist yet

        console.log(`✅ Granted ${totalPixels}px to ${discordUsername} (userId: ${userId})`);
      } else {
        // Guest purchase — store pending grant by email
        await supabase.from("pending_grants").insert({
          email: session.customer_email || session.customer_details?.email,
          product_id: productId,
          pixels: totalPixels,
          stripe_session_id: session.id,
          created_at: new Date().toISOString(),
        }).then(() => {}).catch(() => {});
      }

      // Post to Discord webhook
      const webhookUrl = "https://discord.com/api/webhooks/1505216663786623178/zgC0xopUlfOex7rIIcRos4SxMQrTvtj8-Gjl4cvoqyEukuOP3a-xl9ekt7iIPIj_dBAb";
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "💰 NEW PURCHASE — PIXELS OF WAR",
            description: `**${discordUsername}** purchased **${productId.replace(/_/g," ").toUpperCase()}**\n\n✅ **${totalPixels} pixels** granted\n💶 **€${(session.amount_total/100).toFixed(2)}** received${isWhale==="true"?"\n👑 **WHALE PACK** — VIP role granted!":""}`,
            color: 0xC8FF00,
            timestamp: new Date().toISOString(),
            footer: { text: "Pixels of War Payment System" },
          }],
        }),
      }).catch(() => {});

    } catch (err) {
      console.error("Error granting pixels:", err);
      // Don't return error to Stripe — acknowledge receipt
    }
  }

  return res.status(200).json({ received: true });
};
