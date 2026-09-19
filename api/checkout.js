// Vercel Serverless Function — Stripe Checkout dynamique
// Env requis sur Vercel : STRIPE_SECRET_KEY (+ SITE_URL optionnel)
// Si la clé est absente, renvoie 501 → le front bascule sur les Payment Links.

const PLANS = {
  starter: {
    mode: "payment",
    name: "ClipFlow Starter — 10 clips",
    amount: 29000, // centimes EUR
    description: "10 clips / 1 vidéo source, sous-titres + hooks, livraison 72h",
  },
  growth: {
    mode: "subscription",
    name: "ClipFlow Growth — 20 clips/mois",
    amount: 59000,
    description: "20 clips/mois, analyse niche, 2 révisions",
    interval: "month",
  },
  scale: {
    mode: "subscription",
    name: "ClipFlow Scale — 50 clips/mois",
    amount: 149000,
    description: "50 clips/mois, multi-comptes, prioritaire 24h",
    interval: "month",
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "POST only" });
  }
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(501).json({ error: "stripe-not-configured" });

  const { plan } = req.body || {};
  const p = PLANS[plan];
  if (!p) return res.status(400).json({ error: "unknown-plan" });

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(key);

  const site = (process.env.SITE_URL || `https://${req.headers.host}`).replace(/\/$/, "");
  const success = `${site}/?paid=${plan}&session_id={CHECKOUT_SESSION_ID}`;
  const cancel = `${site}/#pricing`;

  let session;
  if (p.mode === "subscription") {
    const price = await stripe.prices.create({
      currency: "eur",
      unit_amount: p.amount,
      recurring: { interval: p.interval || "month" },
      product_data: { name: p.name, description: p.description },
    });
    session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: success,
      cancel_url: cancel,
      metadata: { plan },
      locale: "fr",
    });
  } else {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "eur",
          unit_amount: p.amount,
          product_data: { name: p.name, description: p.description },
        },
        quantity: 1,
      }],
      success_url: success,
      cancel_url: cancel,
      metadata: { plan },
      locale: "fr",
    });
  }
  return res.status(200).json({ url: session.url });
}
