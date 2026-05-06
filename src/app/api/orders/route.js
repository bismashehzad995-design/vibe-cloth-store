import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    console.log("Order data received:", JSON.stringify(data, null, 2));

    if (!data.customer || !data.items || !Array.isArray(data.items)) {
      return Response.json({ error: "Invalid order data" }, { status: 400 });
    }

    const client = await connectToDatabase();
    const db = client.connection.db;

    const orderDoc = {
      customer: data.customer,
      items: data.items,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      status: "pending",
      userId: session.user.id,
      createdAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(orderDoc);
    const newOrder = { _id: result.insertedId, ...orderDoc };

    // ✅ 1. Send order confirmation to customer (background)
    sendOrderConfirmationEmail(newOrder, data.customer.email);

    // ✅ 2. Send new order alert to admin (background)
    fetch(`${process.env.NEXTAUTH_URL}/api/send-order-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: newOrder._id.toString(),
        customerName: newOrder.customer.fullName,
        totalAmount: newOrder.totalAmount,
        items: newOrder.items.map(item => ({
          name: item.name,
          type: item.type,
          quantity: item.quantity,
          price: item.price
        })),
      }),
    }).catch(err => console.error("Admin email send failed:", err));

    return Response.json({ _id: result.insertedId, ...orderDoc }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Admin GET – all orders
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const client = await connectToDatabase();
  const db = client.connection.db;
  const orders = await db.collection("orders").find().sort({ createdAt: -1 }).toArray();
  return Response.json(orders);
}