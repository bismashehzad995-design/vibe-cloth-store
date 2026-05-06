import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";
import { sendStatusUpdateEmail } from "@/lib/email";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();
    const { id } = params;

    const client = await connectToDatabase();
    const db = client.connection.db;

    // Get old order before update
    const oldOrder = await db.collection("orders").findOne({ _id: new ObjectId(id) });
    if (!oldOrder) return Response.json({ error: "Order not found" }, { status: 404 });

    const oldStatus = oldOrder.status;

    // Update status
    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (result.modifiedCount === 1) {
      // ✅ Send email to customer about status change (if status actually changed)
      if (oldStatus !== status) {
        await sendStatusUpdateEmail(oldOrder, oldOrder.customer.email, oldStatus, status);
      }
      return Response.json({ message: "Status updated" });
    } else {
      return Response.json({ error: "No change" }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE – to delete order (optional)
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const client = await connectToDatabase();
    const db = client.connection.db;
    const result = await db.collection("orders").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ message: "Order deleted" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}