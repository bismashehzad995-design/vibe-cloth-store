"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  HomeIcon,
  HeartIcon as HeartOutline,
  ShoppingCartIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  HeartIcon as HeartSolid,
} from "@heroicons/react/24/solid";

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { getCartCount } = useCart();
  const { wishlist, fetchWishlist } = useWishlist();
  const cartCount = getCartCount();
  const [hasOrders, setHasOrders] = useState(false);

  // Fetch wishlist when session exists
  useEffect(() => {
    if (session?.user) {
      fetchWishlist();
    }
  }, [session, fetchWishlist]);

  // Check if user has any orders (for profile badge)
  useEffect(() => {
    if (session?.user) {
      fetch("/api/orders/my-orders")
        .then((res) => res.json())
        .then((data) => {
          setHasOrders(Array.isArray(data) && data.length > 0);
        })
        .catch(() => setHasOrders(false));
    }
  }, [session]);

  if (!session || session.user.role === "admin") return null;
  if (pathname?.startsWith("/admin")) return null;

  const isWishlistNotEmpty = wishlist.length > 0;

  const navItems = [
    { name: "Home", href: "/products", icon: HomeIcon, activeIcon: HomeSolid },
    { name: "Favourite", href: "/wishlist", icon: isWishlistNotEmpty ? HeartSolid : HeartOutline, activeIcon: HeartSolid },
    { name: "Cart", href: "/cart", icon: ShoppingCartIcon, activeIcon: ShoppingCartIcon, badge: cartCount > 0 },
    { name: "Profile", href: "/profile", icon: UserIcon, activeIcon: UserIcon, badge: hasOrders },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {navItems.map((item) => {
          const isActive =
            item.href && (pathname === item.href || (item.href === "/products" && pathname === "/products"));
          const Icon = isActive ? item.activeIcon : item.icon;
          const iconColor = (item.name === "Favourite" && isWishlistNotEmpty && !isActive) 
                            ? "text-red-500" 
                            : (isActive ? "text-indigo-600" : "text-gray-500");
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className="relative flex flex-col items-center p-2 rounded-lg transition"
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${iconColor}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? "text-indigo-600" : "text-gray-500"}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}