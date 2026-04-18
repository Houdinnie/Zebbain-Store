import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Email Configuration
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.zebbaingroup.store",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || "sales@zebbaingroup.store",
      pass: process.env.SMTP_PASS || "",
    },
  });

  // API Route: Send Confirmation Email
  app.post("/api/confirm-order", async (req, res) => {
    const { orderId, customerEmail, customerName, totalAmount, items } = req.body;

    if (!orderId || !customerEmail) {
      return res.status(400).json({ error: "Missing order information" });
    }

    // In a production app, you would verify the admin token here
    // using firebase-admin's auth().verifyIdToken(token)

    const itemsList = items.map((item: any) => `- ${item.name} (x${item.quantity}) - R${item.price}`).join("\n");

    const emailHtml = `
      <div style="font-family: 'Montserrat', sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; border: 1px solid #f5f2ed; padding: 40px; background-color: #fff;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="text-transform: uppercase; letter-spacing: 0.2em; font-weight: 300; border-bottom: 1px solid #000; display: inline-block; padding-bottom: 10px;">Zebbain Group</h1>
          <p style="text-transform: uppercase; letter-spacing: 0.4em; font-size: 10px; opacity: 0.5;">Order Confirmation</p>
        </div>
        
        <p>Dear ${customerName},</p>
        
        <p>We are delighted to inform you that your payment for <strong>Order #${orderId}</strong> has been successfully confirmed.</p>
        
        <div style="background-color: #f5f2ed; padding: 30px; border-radius: 20px; margin: 30px 0;">
          <h3 style="margin-top: 0; font-family: serif; italic;">Your Selection:</h3>
          <pre style="font-family: inherit; font-size: 14px; white-space: pre-wrap;">${itemsList}</pre>
          <hr style="border: 0; border-top: 1px solid rgba(0,0,0,0.05); margin: 20px 0;" />
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>Total Amount Paid:</span>
            <span>R ${totalAmount.toLocaleString()}</span>
          </div>
        </div>
        
        <p><strong>Estimated Delivery:</strong><br />
        Your artisan pieces are now being prepared for shipment. Please allow <strong>10-15 business days</strong> for final finishing and local courier delivery in the Kempton Park area.</p>
        
        <p>Thank you for choosing Zebbain Group for your custom lifestyle needs.</p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f5f2ed; font-size: 11px; opacity: 0.5; text-align: center;">
          <p>This is an automated confirmation from Zebbain Group E-commerce Suite.</p>
          <p>Kempton Park, Johannesburg, SA | sales@zebbaingroup.store</p>
        </div>
      </div>
    `;

    try {
      if (!process.env.SMTP_PASS) {
        console.warn("SMTP_PASS is not set. Email not sent, but API responded success for demo.");
        return res.json({ success: true, message: "Email triggered (Demo Mode: No SMTP Credentials)" });
      }

      await transporter.sendMail({
        from: '"Zebbain Group" <sales@zebbaingroup.store>',
        to: customerEmail,
        subject: `Payment Confirmed: Order #${orderId}`,
        text: `Your payment for Order #${orderId} has been confirmed. Estimated delivery: 10-15 business days.`,
        html: emailHtml,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Email Error:", error);
      res.status(500).json({ error: "Failed to send email confirmation" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
