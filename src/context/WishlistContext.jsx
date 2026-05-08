"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) fetchWishlist();
    else setWishlist([]);
  }, [session]);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product) => {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product._id }),
    });
    if (res.ok) {
      setWishlist((prev) => [...prev, product]);
    }
  };

  const removeFromWishlist = async (productId) => {
    const res = await fetch(`/api/wishlist?productId=${productId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((p) => p._id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, loading, addToWishlist, removeFromWishlist, isInWishlist, fetchWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}