"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircleIcon, XCircleIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function AdminReturnsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !isAdmin) router.push("/");
    else fetchReturns();
  }, [session, status, isAdmin]);

  const fetchReturns = async () => {
    try {
      const res = await fetch("/api/returns");
      const data = await res.json();
      setReturns(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateReturnStatus = async (id, newStatus) => {
    try {
      await fetch(`/api/returns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchReturns();
    } catch (err) {
      alert("Update failed");
    }
  };

  const deleteReturnRequest = async (id) => {
    if (!confirm("Permanently delete this return request?")) return;
    try {
      const res = await fetch(`/api/returns/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Deleted successfully.");
        fetchReturns();
      } else {
        const error = await res.json();
        alert(`Failed: ${error.error || "Unknown error"}`);
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const getOrderIdShort = (orderRef) => {
    if (!orderRef) return "N/A";
    if (typeof orderRef === "string") return orderRef.slice(-8);
    if (orderRef._id) return orderRef._id.toString().slice(-8);
    return "N/A";
  };

  const filteredReturns = returns.filter(ret =>
    ret.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getOrderIdShort(ret.orderId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Return Requests</h1>
            <p className="text-gray-500 mt-1">Manage customer refund and exchange requests</p>
          </div>
          <Link href="/products" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm">
             Back to Shop
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by Order ID or Reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400">No return requests found.</td>
                </tr>
              ) : (
                filteredReturns.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-mono text-indigo-600">#{getOrderIdShort(req.orderId)}</td>
                    <td className="px-6 py-4 text-sm capitalize">{req.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{req.reason.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        req.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        req.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => updateReturnStatus(req._id, "approved")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition"
                        title="Approve"
                      >
                        <CheckCircleIcon className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => updateReturnStatus(req._id, "rejected")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition"
                        title="Reject"
                      >
                        <XCircleIcon className="w-4 h-4" /> Reject
                      </button>
                      <button
                        onClick={() => deleteReturnRequest(req._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {filteredReturns.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">No return requests found.</div>
          ) : (
            filteredReturns.map((req) => (
              <div key={req._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-mono text-indigo-600">#{getOrderIdShort(req.orderId)}</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{req.type}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    req.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    req.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>{req.status}</span>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-700"><strong>Reason:</strong> {req.reason.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button onClick={() => updateReturnStatus(req._id, "approved")} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-green-100 text-green-700">Approve</button>
                  <button onClick={() => updateReturnStatus(req._id, "rejected")} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-red-100 text-red-700">Reject</button>
                  <button onClick={() => deleteReturnRequest(req._id)} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-gray-100 text-gray-700">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}