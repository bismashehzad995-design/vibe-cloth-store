import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import fs from "fs";
import path from "path";

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
  const formData = await req.formData();
  const name = formData.get("name");
  const brand = formData.get("brand");
  const description = formData.get("description");
  const price = parseFloat(formData.get("price"));
  const rating = parseFloat(formData.get("rating")) || 0;
  const imageFile = formData.get("image");

  if (!imageFile) return Response.json({ error: "Image required" }, { status: 400 });
  const bytes = await imageFile.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = imageFile.name.split(".").pop();
  const filename = Date.now() + "-" + Math.round(Math.random() * 1E9) + "." + ext;
  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(path.join(uploadDir, filename), buffer);

  const product = new Product({ name, brand, description, price, rating, imageUrl: `/uploads/${filename}` });
  await product.save();
  return Response.json(product, { status: 201 });
}