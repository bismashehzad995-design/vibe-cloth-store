import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const { name, email, password, confirmPassword } = await req.json();
    if (password !== confirmPassword) {
      return Response.json({ error: "Passwords do not match" }, { status: 400 });
    }
    await connectToDatabase();
    const existing = await User.findOne({ email });
    if (existing) {
      return Response.json({ error: "Email already exists" }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: email === process.env.ADMIN_EMAIL ? "admin" : "user",
    });
    return Response.json({ message: "Signup successful", user: { id: user._id, name, email } }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}