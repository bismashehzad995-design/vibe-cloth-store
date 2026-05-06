import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { orderId, customerName, totalAmount, items } = await request.json();

    // SMTP Transporter Configure Karein (Gmail ke liye)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email Content Prepare Karein (HTML Format mein)
    const itemsList = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.type}</td>
          <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${item.quantity}</td>
          <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Rs ${item.price}</td>
        </tr>
      `
      )
      .join("");

    const mailOptions = {
      from: `"Your Store" <${process.env.EMAIL_USER}>`,
      to: "clothreseller@gmail.com",
      subject: `✨ New Order Received! Order #${orderId.slice(-8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🎉 New Order Alert! 🎉</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Order Summary</h2>
            <p><strong>Order ID:</strong> #${orderId.slice(-8)}</p>
            <p><strong>Customer Name:</strong> ${customerName}</p>
            <p><strong>Total Amount:</strong> Rs ${totalAmount}</p>
            <p><strong>Order Status:</strong> Pending</p>
            <hr />
            <h3>Items Ordered:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Product</th>
                  <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Size</th>
                  <th style="text-align: center; padding: 8px; border-bottom: 2px solid #ddd;">Quantity</th>
                  <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
            <hr />
            <p><strong>🔗 View Details:</strong> <a href="https://your-website.com/admin/orders">Click here to manage this order</a></p>
            <p>Thank you for using our platform!</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 12px; color: #6b7280;">
            © 2026 Cloth Reseller | Auto-generated notification
          </div>
        </div>
      `,
    };

    // Email Send Karein
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}