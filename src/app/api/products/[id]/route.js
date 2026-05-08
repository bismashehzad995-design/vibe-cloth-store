import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectToDatabase();
    const { id } = params;
    const data = await req.json();
    const { name, brand, description, price, rating, imageUrl, category, productType } = data;
    if (!name || !price || !imageUrl) {
      return Response.json({ error: "Name, price and image URL are required" }, { status: 400 });
    }
    const updated = await Product.findByIdAndUpdate(
      id,
      {
        name,
        brand: brand || "",
        description: description || "",
        price: Number(price),
        rating: rating || 0,
        imageUrl,
        category: category || "",
        productType: productType || "",
      },
      { new: true }
    );
    if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(updated);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectToDatabase();
    const { id } = params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ message: "Deleted" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}