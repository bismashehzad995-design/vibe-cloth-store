"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { data: session, status } = useSession();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (status === "loading") return;
    if (!session) { setCartItems([]); setLoading(false); return; }
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();

      let items = data.items || [];

      if (typeof items === "string") {
        try {
          items = JSON.parse(items);
        } catch (err) {
          console.error("Cart parse error:", err);
          items = [];
        }
      }

      setCartItems(items);
    }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const saveCart = async (items) => {
    if (!session) return;
    await fetch("/api/cart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
  };

  useEffect(() => { fetchCart(); }, [session, status]);

  const addToCart = (product, size, qty) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === product._id && i.size === size);
      let newItems;
      if (existing) {
        newItems = prev.map(i => i.productId === product._id && i.size === size ? { ...i, quantity: i.quantity + qty } : i);
      } else {
        newItems = [...prev, { productId: product._id, name: product.name, size, quantity: qty, price: product.price, image: product.imageUrl }];
      }
      saveCart(newItems);
      return newItems;
    });
    toast.success(`${product.name} added`);
  };

  const removeFromCart = (productId, size) => {
    setCartItems(prev => {
      const newItems = prev.filter(i => !(i.productId === productId && i.size === size));
      saveCart(newItems);
      return newItems;
    });
    toast.success("Removed");
  };

  const updateQuantity = (productId, size, newQty) => {
    if (newQty < 1) return;
    setCartItems(prev => {
      const newItems = prev.map(i => i.productId === productId && i.size === size ? { ...i, quantity: newQty } : i);
      saveCart(newItems);
      return newItems;
    });
  };

  const clearCart = () => { setCartItems([]); saveCart([]); };
  const getCartTotal = () => cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const getCartCount = () => cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);