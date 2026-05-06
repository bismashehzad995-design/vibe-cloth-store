import { connectToDatabase } from "@/lib/mongodb";
import Cart from "@/models/Cart";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  let cart = await Cart.findOne({ userId: session.user.id });
  if (!cart) cart = { items: [] };
  return Response.json(cart);
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { items } = await req.json();
  await connectToDatabase();
  let cart = await Cart.findOne({ userId: session.user.id });
  if (cart) {
    cart.items = items;
    cart.updatedAt = new Date();
    await cart.save();
  } else {
    cart = new Cart({ userId: session.user.id, items });
    await cart.save();
  }
  return Response.json(cart);
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  await Cart.findOneAndDelete({ userId: session.user.id });
  return Response.json({ message: "Cart cleared" });
}