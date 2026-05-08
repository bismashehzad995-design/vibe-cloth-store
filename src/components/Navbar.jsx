"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useModal } from "@/context/ModalContext";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const { openModal } = useModal();

  const isAdmin = session?.user?.role === "admin";

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-gray-800">
          Outfit<span className="text-indigo-600"> Vibes</span>
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              {isAdmin ? (
                <>
                  <Link href="/admin/orders" className="text-sm text-gray-700 hover:text-indigo-600">
                    Admin Panel
                  </Link>
                  <div className="flex items-center gap-2">
                    {session.user.image && (
                      <img src={session.user.image} alt={session.user.name} className="w-8 h-8 rounded-full" />
                    )}
                    <span className="text-sm text-gray-700">{session.user.name}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Admin</span>
                  </div>
                  <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700">
                    Sign Out
                  </button>
                </>
              ) : (
                // Normal user: show nothing on the right
                <></>
              )}
            </>
          ) : (
            // Not logged in
            <button
              onClick={() => openModal(true)}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700"
            >
              Sign Up
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}