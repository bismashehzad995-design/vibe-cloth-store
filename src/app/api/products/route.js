import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  await connectToDatabase();
  const products = await Product.find().sort({ createdAt: -1 });
  return Response.json(products);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectToDatabase();
    const data = await req.json();
    const { name, brand, description, price, rating, imageUrl, category, productType } = data;
    if (!name || !price || !imageUrl) {
      return Response.json({ error: "Name, price and image URL are required" }, { status: 400 });
    }
    const product = new Product({
      name,
      brand: brand || "",
      description: description || "",
      price: Number(price),
      rating: rating || 0,
      imageUrl,
      category: category || "",
       productType: productType || "",
    });
    await product.save();
    return Response.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}