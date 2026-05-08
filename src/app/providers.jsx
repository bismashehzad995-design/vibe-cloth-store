"use client";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import { ModalProvider } from "@/context/ModalContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <CartProvider>
        <ModalProvider>
          <WishlistProvider>
            {children}
            <Toaster position="bottom-center" />
          </WishlistProvider>
        </ModalProvider>
      </CartProvider>
    </SessionProvider>
  );
}