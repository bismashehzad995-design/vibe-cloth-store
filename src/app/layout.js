import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";
import AuthModal from "@/components/AuthModal";

export const metadata = {
  title: "Cloth Reseller",
  description: "Premium brands at your fingertips",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-white to-gray-50">
        <Providers>
          <AuthModal />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow pb-5">{children}</main>
            <Footer />
            {/* BottomNavigation is conditionally rendered inside it (only for logged‑in non‑admin) */}
            <BottomNavigation />
          </div>
        </Providers>
      </body>
    </html>
  );
}