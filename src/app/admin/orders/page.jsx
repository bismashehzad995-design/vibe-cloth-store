"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingReturns, setPendingReturns] = useState(0);
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !isAdmin) router.push("/");
    else {
      fetchOrders();
      fetchPendingReturns();
    }
  }, [session, status, isAdmin]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingReturns = async () => {
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

  const updateStatus = async (id, status) => {
    try {
      await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchOrders();
    } catch (err) {
      alert("Status update failed!");
    }
  };

  const deleteOrder = async (id) => {
    const confirmed = confirm("Are you sure you want to DELETE this order? This action cannot be undone.");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Order deleted successfully!");
        fetchOrders();
      } else {
        const errorData = await res.json();
        alert(`Failed to delete: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error while deleting order.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 font-medium">
        Loading Orders...
      </div>
    );
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order Management</h1>
            <p className="text-gray-500 mt-1">Track, manage, and delete customer orders.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/returns"
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              📋 Manage Returns
              {pendingReturns > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingReturns}
                </span>
              )}
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
               Back to Shop
            </Link>
          </div>
        </div>

        {/* Orders table (same as before) */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-indigo-600">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customer.fullName}</div>
                      <div className="text-xs text-gray-400">{order.customer.city || "No City"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Rs {order.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        order.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                        order.status === "shipped" ? "bg-purple-100 text-purple-800" :
                        order.status === "delivered" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-GB")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                      <button onClick={() => updateStatus(order._id, "confirmed")} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md">✅</button>
                      <button onClick={() => updateStatus(order._id, "shipped")} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md">🚚</button>
                      <button onClick={() => updateStatus(order._id, "delivered")} className="p-1.5 text-green-600 hover:bg-green-50 rounded-md">📦</button>
                      <button onClick={() => updateStatus(order._id, "cancelled")} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md">❌</button>
                      <button onClick={() => deleteOrder(order._id)} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && <div className="text-center py-12"><p className="text-gray-400">No orders found.</p></div>}
        </div>
      </div>
    </div>
  );
}