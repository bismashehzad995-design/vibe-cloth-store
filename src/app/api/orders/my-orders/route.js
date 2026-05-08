import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await connectToDatabase();
    const db = client.connection.db;

    const userEmail = session.user.email.trim().toLowerCase();
    const userId = session.user.id;

    // Try by userId first
    let orders = await db.collection("orders")
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    // If none, try by email (case-insensitive)
    if (orders.length === 0) {
      orders = await db.collection("orders")
        .find({ "customer.email": { $regex: new RegExp(`^${userEmail}$`, "i") } })
        .sort({ createdAt: -1 })
        .toArray();

      // Update these orders with userId for future
      if (orders.length > 0) {
        for (const order of orders) {
          await db.collection("orders").updateOne(
            { _id: order._id },
            { $set: { userId: userId } }
          );
        }
        console.log(`✅ Updated ${orders.length} orders with userId for ${userEmail}`);
      }
    }

    console.log(`📦 Orders found for ${userEmail}: ${orders.length}`);
    return Response.json(orders);
  } catch (error) {
    console.error("❌ My orders error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}