// api/create-checkout.js
// Uses Stripe REST API directly via fetch — no npm package needed

const PRODUCTS = {
  trial:       { name: "Trial Pack",    pixels: 15,    bonus: 0,    price: 99   },
  small:       { name: "Small Bundle",  pixels: 100,   bonus: 0,    price: 199  },
  medium:      { name: "Medium Bundle", pixels: 250,   bonus: 25,   price: 499  },
  large:       { name: "Large Bundle",  pixels: 600,   bonus: 60,   price: 999  },
  mega:        { name: "Mega Bundle",   pixels: 2000,  bonus: 400,  price: 2499 },
  whale:       { name: "Whale Pack",    pixels: 5000,  bonus: 1000, price: 4999 },
  season_pass: { name: "Season Pass",   pixels: 50,    bonus: 0,    price: 499  },
  starter:     { name: "Starter Pack",  pixels: 100,   bonus: 0,    price: 299  },
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
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    return res.status(500).json({ error: "Stripe key not configured" });
  }

  try {
    // Build form-encoded body for Stripe API
    const params = new URLSearchParams();
    params.append("payment_method_types[]", "card");
    params.append("mode", "payment");
    params.append("line_items[0][quantity]", "1");
    params.append("line_items[0][price_data][currency]", "eur");
    params.append("line_items[0][price_data][unit_amount]", String(product.price));
    params.append("line_items[0][price_data][product_data][name]", `${product.name} — Pixels of War`);
    params.append("line_items[0][price_data][product_data][description]", `${totalPixels} pixels added to your account`);
    params.append("metadata[productId]", productId);
    params.append("metadata[userId]", userId || "guest");
    params.append("metadata[discordUsername]", discordUsername || "unknown");
    params.append("metadata[fandom]", fandom || "none");
    params.append("metadata[pixels]", String(totalPixels));
    params.append("metadata[isSeasonPass]", productId === "season_pass" ? "true" : "false");
    params.append("metadata[isWhale]", productId === "whale" ? "true" : "false");
    params.append("success_url", `${origin}?payment=success&session_id={CHECKOUT_SESSION_ID}&product=${productId}`);
    params.append("cancel_url", `${origin}?payment=cancelled`);
    params.append("payment_intent_data[statement_descriptor]", "PIXELSOFWAR");
    params.append("locale", "auto");

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      console.error("Stripe API error:", session.error);
      return res.status(500).json({ error: session.error?.message || "Stripe error" });
    }

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("Server error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
