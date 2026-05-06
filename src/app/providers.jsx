"use client";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import { ModalProvider } from "@/context/ModalContext";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <CartProvider>
        <ModalProvider>
          {children}
          <Toaster position="bottom-center" />
        </ModalProvider>
      </CartProvider>
    </SessionProvider>
  );
}