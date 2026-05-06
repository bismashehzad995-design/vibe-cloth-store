"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useModal } from "@/context/ModalContext";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const { getCartCount } = useCart();
  const { openModal } = useModal();
  const [pendingReturns, setPendingReturns] = useState(0);

  const isAdmin = session?.user?.role === "admin";

  // Fetch pending returns count every 30 seconds (or on focus)
  useEffect(() => {
    if (!isAdmin) return;
    const fetchPendingCount = async () => {
      try {
        const res = await fetch("/api/returns/pending-count");
        if (res.ok) {
          const data = await res.json();
          setPendingReturns(data.count);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-gray-800">
          Clothes<span className="text-indigo-600"> Reseller</span>
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              {!isAdmin && (
                <>
                  <button onClick={() => router.push("/cart")} className="relative">
                    <ShoppingCartIcon className="w-6 h-6 text-gray-600" />
                    {getCartCount() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getCartCount()}
                      </span>
                    )}
                  </button>
                  <Link href="/my-orders" className="text-sm text-gray-700 hover:text-indigo-600">
                    My Orders
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link href="/admin/orders" className="relative text-sm text-gray-700 hover:text-indigo-600">
                  Admin Panel
                  {pendingReturns > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {pendingReturns}
                    </span>
                  )}
                </Link>
              )}
              <div className="flex items-center gap-2">
                {session.user.image && (
                  <img src={session.user.image} alt={session.user.name} className="w-8 h-8 rounded-full" />
                )}
                <span className="text-sm text-gray-700">{session.user.name}</span>
                {isAdmin && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Admin</span>}
              </div>
              <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700">
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => openModal(false)} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50">
                Sign In
              </button>
              <button onClick={() => openModal(true)} className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700">
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}