"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  ShoppingBagIcon, 
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  CurrencyRupeeIcon
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
    else fetchOrders();
  }, [session, status]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders/my-orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  if (status === "loading") return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div></div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pb-28"> {/* pb-28 for bottom nav space */}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your account and orders</p>
        </div>

        {/* 1️⃣ User Info Card (top) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              {session.user.image ? (
                <img src={session.user.image} alt={session.user.name} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <UserCircleIcon className="w-16 h-16 text-indigo-500" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{session.user.name}</h2>
            <div className="flex items-center gap-1 text-gray-500 mt-1">
              <EnvelopeIcon className="w-4 h-4" />
              <span className="text-sm">{session.user.email}</span>
            </div>
          </div>
        </div>

        {/* 2️⃣ Recent Orders (middle) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ShoppingBagIcon className="w-5 h-5 text-indigo-500" />
              Recent Orders
            </h3>
            <Link href="/my-orders" className="text-sm text-indigo-600 hover:underline">
              View all →
            </Link>
          </div>

          {loadingOrders ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No orders yet</p>
              <Link href="/products" className="mt-2 inline-block text-indigo-600 text-sm">
                Start Shopping →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link href={`/my-orders#order-${order._id}`} key={order._id}>
                  <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono text-sm text-indigo-600">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <CalendarDaysIcon className="w-3.5 h-3.5" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <CurrencyRupeeIcon className="w-3.5 h-3.5" />
                            {order.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          order.status === "delivered" ? "bg-green-100 text-green-700" :
                          order.status === "cancelled" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 line-clamp-1">
                      {order.items?.map(i => i.name).join(", ")}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 3️⃣ Sign Out Button (bottom) */}
        <div className="mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-800 transition"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}