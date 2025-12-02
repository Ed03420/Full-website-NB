import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { total, customerEmail, metadata } = req.body;

    if (!customerEmail || isNaN(Number(total))) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const amount = Math.round(Number(total) * 100);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: "The Nine Ball Order" },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: metadata || {},
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("create-checkout error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
