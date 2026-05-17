// api/create-checkout.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRODUCTS = {
  trial:       { name: "Trial Pack",    pixels: 15,    bonus: 0,    price: 99,   description: "15 pixels for Pixels of War" },
  small:       { name: "Small Bundle",  pixels: 100,   bonus: 0,    price: 199,  description: "100 pixels for Pixels of War" },
  medium:      { name: "Medium Bundle", pixels: 250,   bonus: 25,   price: 499,  description: "250 pixels + 25 bonus for Pixels of War" },
  large:       { name: "Large Bundle",  pixels: 600,   bonus: 60,   price: 999,  description: "600 pixels + 60 bonus for Pixels of War" },
  mega:        { name: "Mega Bundle",   pixels: 2000,  bonus: 400,  price: 2499, description: "2,000 pixels + 400 bonus for Pixels of War" },
  whale:       { name: "Whale Pack",    pixels: 5000,  bonus: 1000, price: 4999, description: "5,000 pixels + 1,000 bonus + Crown Badge" },
  season_pass: { name: "Season Pass",   pixels: 50,    bonus: 0,    price: 499,  description: "Season Pass: 2x XP, +50% gold, +50 pixels, exclusive badge" },
  starter:     { name: "Starter Pack",  pixels: 100,   bonus: 0,    price: 299,  description: "100 pixels + Cluster Bomb + Season Pass (3-day offer)" },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.pixelsofwar.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { productId, userId, discordUsername, fandom } = req.body;

  if (!productId || !PRODUCTS[productId]) {
    return res.status(400).json({ error: "Invalid product" });
  }

  const product = PRODUCTS[productId];
  const totalPixels = product.pixels + product.bonus;
  const origin = "https://www.pixelsofwar.com";

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `${product.name} — Pixels of War`,
            description: product.description,
          },
          unit_amount: product.price,
        },
        quantity: 1,
      }],
      metadata: {
        productId,
        userId: userId || "guest",
        discordUsername: discordUsername || "unknown",
        fandom: fandom || "none",
        pixels: String(totalPixels),
        isSeasonPass: productId === "season_pass" ? "true" : "false",
        isWhale: productId === "whale" ? "true" : "false",
      },
      success_url: `${origin}?payment=success&session_id={CHECKOUT_SESSION_ID}&product=${productId}`,
      cancel_url: `${origin}?payment=cancelled`,
      payment_intent_data: {
        statement_descriptor: "PIXELSOFWAR",
      },
      locale: "auto",
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
