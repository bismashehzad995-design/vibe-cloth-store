import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import fs from "fs";
import path from "path";

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const product = await Product.findById(params.id);
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const name = formData.get("name");
  const brand = formData.get("brand");
  const description = formData.get("description");
  const price = parseFloat(formData.get("price"));
  const rating = parseFloat(formData.get("rating"));
  if (name) product.name = name;
  if (brand) product.brand = brand;
  if (description) product.description = description;
  if (!isNaN(price)) product.price = price;
  if (!isNaN(rating)) product.rating = rating;

  const imageFile = formData.get("image");
  if (imageFile && imageFile.size > 0) {
    const oldPath = path.join(process.cwd(), "public", product.imageUrl);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = imageFile.name.split(".").pop();
    const filename = Date.now() + "-" + Math.round(Math.random() * 1E9) + "." + ext;
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, filename), buffer);
    product.imageUrl = `/uploads/${filename}`;
  }

  await product.save();
  return Response.json(product);
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const product = await Product.findById(params.id);
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });
  const oldPath = path.join(process.cwd(), "public", product.imageUrl);
  if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  await product.deleteOne();
  return Response.json({ message: "Deleted" });
}