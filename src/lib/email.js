import nodemailer from "nodemailer";

// Transporter (ek baar banayein, reuse karein)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📧 Order confirmation email to customer
export async function sendOrderConfirmationEmail(order, customerEmail) {
  try {
    console.log("🔹 Starting order confirmation email for:", customerEmail);
    console.log("🔹 Order ID:", order._id?.toString().slice(-8));
    console.log("🔹 Customer name:", order.customer?.fullName);

    const orderIdShort = order._id.toString().slice(-8);
    
    // Check items array
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      console.error("❌ Order items are missing or empty:", order.items);
      throw new Error("No items in order");
    }

    const itemsList = order.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name || "N/A"}</td>
        <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${item.quantity || 0}</td>
        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Rs ${item.price || 0}</td>
      </tr>
    `).join("");

    const mailOptions = {
      from: `"Cloth Reseller" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `✅ Order Confirmation - #${orderIdShort}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px;">
          <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Thank You for Your Order!</h1>
          </div>
          <div style="padding: 20px;">
            <p>Dear ${order.customer.fullName},</p>
            <p>Your order has been placed successfully. Here are the details:</p>
            <p><strong>Order #:</strong> ${orderIdShort}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Total Amount:</strong> Rs ${order.totalAmount}</p>
            <h3>Items Ordered:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr><th style="text-align: left;">Product</th><th>Qty</th><th style="text-align: right;">Price</th></tr>
              </thead>
              <tbody>${itemsList}</tbody>
            </table>
            <p><strong>Shipping Address:</strong><br/>
            ${order.customer.fullName}<br/>
            ${order.customer.address}<br/>
            ${order.customer.city}, ${order.customer.zipCode}<br/>
            Phone: ${order.customer.phone}</p>
            <p>You can track your order status from <a href="${process.env.NEXTAUTH_URL}/my-orders">My Orders</a>.</p>
            <p>Thank you for shopping with Cloth Reseller!</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Order confirmation email sent to customer");
  } catch (err) {
    console.error("❌ Order confirmation email failed - full error:", err);
    console.error("Error message:", err.message);
    console.error("Stack:", err.stack);
  }
}

// 📧 Status update email to customer
export async function sendStatusUpdateEmail(order, customerEmail, oldStatus, newStatus) {
  try {
    console.log("🔹 Starting status update email for order:", order._id?.toString().slice(-8));
    console.log("🔹 Status changed from", oldStatus, "to", newStatus);
    
    const orderIdShort = order._id.toString().slice(-8);
    let statusMessage = "";
    if (newStatus === "shipped") statusMessage = "Your order has been shipped and is on its way!";
    else if (newStatus === "delivered") statusMessage = "Your order has been delivered. Hope you love it!";
    else if (newStatus === "confirmed") statusMessage = "Your order has been confirmed and will be processed soon.";
    else if (newStatus === "cancelled") statusMessage = "Your order has been cancelled. Contact us for any queries.";

    const mailOptions = {
  from: `"Cloth Reseller" <${process.env.EMAIL_USER}>`,
  to: customerEmail,
  bcc: process.env.EMAIL_USER,   // ✅ sends a copy to admin
  subject: `✅ Order Confirmation - #${orderIdShort}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px;">
          <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Order Status Updated</h1>
          </div>
          <div style="padding: 20px;">
            <p>Dear ${order.customer.fullName},</p>
            <p>Your order #${orderIdShort} status has been updated to <strong>${newStatus.toUpperCase()}</strong>.</p>
            <p>${statusMessage}</p>
            <p><a href="${process.env.NEXTAUTH_URL}/my-orders">View your order</a></p>
            <p>Thank you for trusting Cloth Reseller.</p>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`✅ Status update email sent to customer for order ${orderIdShort}`);
  } catch (err) {
    console.error("❌ Status update email failed:", err);
    console.error("Error message:", err.message);
    console.error("Stack:", err.stack);
  }
}