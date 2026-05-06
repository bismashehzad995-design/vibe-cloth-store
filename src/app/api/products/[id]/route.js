import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// PUT – edit product (JSON based, no file upload)
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { id } = params;
    const data = await req.json();  // JSON data from frontend
    const { name, brand, description, price, rating, imageUrl } = data;

    if (!name || !price || !imageUrl) {
      return Response.json({ error: "Name, price and image URL are required" }, { status: 400 });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        brand: brand || "",
        description: description || "",
        price: Number(price),
        rating: rating || 0,
        imageUrl,  // direct URL – no file handling
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json(updatedProduct);
  } catch (error) {
    console.error("PUT error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE – remove product (no local file deletion needed)
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { id } = params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }
    return Response.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}