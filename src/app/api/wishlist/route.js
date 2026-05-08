import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const client = await connectToDatabase();
  const db = client.connection.db;
  const wishlist = await db.collection("wishlists").aggregate([
    { $match: { userId: session.user.id } },
    { $lookup: { from: "products", localField: "productId", foreignField: "_id", as: "product" } },
    { $unwind: "$product" },
    { $replaceRoot: { newRoot: "$product" } }
  ]).toArray();
  return Response.json(wishlist);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await req.json();
  const client = await connectToDatabase();
  const db = client.connection.db;
  const existing = await db.collection("wishlists").findOne({ userId: session.user.id, productId: new ObjectId(productId) });
  if (existing) return Response.json({ message: "Already in wishlist" });

  await db.collection("wishlists").insertOne({
    userId: session.user.id,
    productId: new ObjectId(productId),
    createdAt: new Date(),
  });
  return Response.json({ success: true });
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const productId = url.searchParams.get("productId");
  const client = await connectToDatabase();
  const db = client.connection.db;
  await db.collection("wishlists").deleteOne({ userId: session.user.id, productId: new ObjectId(productId) });
  return Response.json({ success: true });
}