import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) throw new Error("Invalid email or password");
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid email or password");
        return { 
          id: user._id.toString(), 
          name: user.name, 
          email: user.email, 
          role: user.role 
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        await connectToDatabase();
        let dbUser = await User.findOne({ email: user.email });
        
        // Hardcoded Admin Email check
        const isAdmin = user.email === "bismashehzad995@gmail.com";
        
        if (!dbUser) {
          dbUser = await User.create({
            googleId: user.id,
            email: user.email,
            name: user.name,
            picture: user.image,
            role: isAdmin ? "admin" : "user"
          });
        } else {
          // Sync role agar pehle 'user' tha aur ab admin email hai
          if (isAdmin && dbUser.role !== "admin") {
            dbUser.role = "admin";
            await dbUser.save();
          }
          if (!dbUser.googleId) {
            dbUser.googleId = user.id;
            await dbUser.save();
          }
        }
        
        // ✅ CRITICAL: User object mein role manually add karein takay JWT ko mil sakay
        user.id = dbUser._id.toString();
        user.role = dbUser.role; 
      }
      return true;
    },
    async jwt({ token, user }) {
      // Pehli baar login par user object se data token mein save hoga
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Token se data session mein transfer hoga jo Navbar use karta hai
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };