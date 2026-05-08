import { connectToDatabase } from "@/lib/mongodb";
import Return from "@/models/Return";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";
export const dynamic = 'force-dynamic';
// Email send helper
async function sendReturnEmail(returnRequest, order, customerName) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const orderIdShort = order._id.toString().slice(-8);
    const adminLink = `${process.env.NEXTAUTH_URL}/admin/returns`;

    const mailOptions = {
      from: `"Cloth Reseller" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `🔁 New Return Request - Order #${orderIdShort}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #f97316; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🔄 Return Request</h1>
            <p style="margin: 5px 0 0;">Action Required</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="margin-top: 0;">Request Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0;"><strong>Order ID:</strong></td><td>#${orderIdShort}</td></tr>
              <tr><td><strong>Customer Name:</strong></td><td>${customerName}</td></tr>
              <tr><td><strong>Request Type:</strong></td><td style="text-transform: capitalize;">${returnRequest.type}${returnRequest.type === "return" ? " (Refund)" : ""}</td></tr>
              <tr><td><strong>Reason:</strong></td><td>${returnRequest.reason}</td></tr>
              <tr><td><strong>Comment:</strong></td><td>${returnRequest.comment || "None"}</td></tr>
            </table>
            <hr />
            <p><strong>🔗 Manage Request:</strong> <a href="${adminLink}">Click here</a></p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Return email sent");
  } catch (err) {
    console.error("❌ Return email failed:", err);
  }
}

// POST – user submits return request
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { orderId, type, reason, comment, items } = body;
    if (!orderId || !type || !reason) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await connectToDatabase();
    const db = client.connection.db;
    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const customerName = order.customer?.fullName || "Unknown";

    const returnRequest = await Return.create({
      userId: session.user.id,
      orderId,
      type,
      reason,
      comment: comment || "",
      items,
      status: "pending",
    });

    sendReturnEmail(returnRequest, order, customerName);
    return NextResponse.json(returnRequest, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET – admin only
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await connectToDatabase();
    const returns = await Return.find({}).sort({ createdAt: -1 }).lean();
    console.log(`✅ Returns found: ${returns.length}`);
    return NextResponse.json(returns);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}