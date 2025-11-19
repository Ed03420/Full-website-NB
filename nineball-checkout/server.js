// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { SumUp } from "sumup-ts";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Initialize SumUp SDK
const sumup = new SumUp({
  clientId: process.env.SUMUP_CLIENT_ID,
  clientSecret: process.env.SUMUP_CLIENT_SECRET,
  redirectUri: process.env.SUMUP_REDIRECT_URI,
  sandbox: true, // change to false in production
});

// Endpoint to create checkout
app.post("/api/create-checkout", async (req, res) => {
  try {
    const { total, currency, customerName } = req.body;

    if (!total || !currency || !customerName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get access token
    const tokenData = await sumup.auth.clientCredentials.getToken();
    const accessToken = tokenData.access_token;

    const checkoutRequest = {
      amount: Number(total),
      currency,
      pay_to_email: process.env.SUMUP_BUSINESS_EMAIL,
      description: `Order from ${customerName}`,
      tracking_id: `order_${Date.now()}`,
      return_url: "http://localhost:3000/success",
    };

    const checkout = await sumup.checkout.create(checkoutRequest, accessToken);

    res.json({ checkoutUrl: checkout.checkout_url });
  } catch (err) {
    console.error("Error creating SumUp checkout:", err);
    res.status(500).json({ error: "Failed to create SumUp checkout" });
  }
});

// Optional: success page
app.get("/success", (req, res) => {
  res.send("Payment successful! Thank you for your order.");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
