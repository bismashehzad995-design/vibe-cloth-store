"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon, ShoppingBagIcon, MapPinIcon, CreditCardIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnComment, setReturnComment] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);

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
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (s) => {
    const colors = {
      pending: "bg-amber-100 text-amber-700 ring-amber-600/20",
      confirmed: "bg-blue-100 text-blue-700 ring-blue-600/20",
      shipped: "bg-indigo-100 text-indigo-700 ring-indigo-600/20",
      delivered: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
      cancelled: "bg-rose-100 text-rose-700 ring-rose-600/20",
    };
    return colors[s] || "bg-gray-100 text-gray-600 ring-gray-500/10";
  };

  const openReturnModal = (order) => {
    setSelectedOrder(order);
    setReturnReason("");
    setReturnComment("");
    setReturnModalOpen(true);
  };

  const submitReturnRequest = async () => {
    if (!selectedOrder) return;
    if (!returnReason) {
      alert("Please select a reason");
      return;
    }
    setSubmittingReturn(true);
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder._id,
          type: "return",
          reason: returnReason,
          comment: returnComment,
          items: selectedOrder.items.map(item => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            type: item.type
          }))
        }),
      });
      if (res.ok) {
        alert("Return request submitted successfully!");
        setReturnModalOpen(false);
        fetchOrders();
      } else {
        const error = await res.json();
        alert(`Failed: ${error.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );
  if (!session) return null;

  return (
    <>
      <div className="min-h-screen bg-gray-50/50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Order History</h1>
              <p className="text-gray-500 mt-3">Manage and track your recent purchases</p>
            </div>
            <Link href="/products" className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
              Continue Shopping
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center bg-white rounded-3xl p-16 shadow-sm border border-gray-100">
              <ShoppingBagIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900">No orders found</h3>
              <p className="text-gray-500 mt-2">Looks like you haven't made any orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const items = order.items || [];
                const isExpanded = expanded === order._id;
                return (
                  <div key={order._id} className={`bg-white border transition-all duration-200 shadow-sm ${isExpanded ? 'rounded-3xl ring-2 ring-indigo-500/10' : 'rounded-2xl hover:border-gray-300'}`}>
                    {/* Header - Click to expand */}
                    <div className="p-5 md:p-6 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : order._id)}>
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Order #{order._id?.slice(-8)}</span>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${getStatusBadge(order.status)}`}>
                              {order.status?.toUpperCase() || "PENDING"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <p className="text-xs text-gray-500 font-medium italic">
                              Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            {order.status === "delivered" && (
                              <button
                                onClick={(e) => { e.stopPropagation(); openReturnModal(order); }}
                                className="inline-flex items-center gap-1.5 ml-3 mt-1 px-3 py-1 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-full transition"
                                title="Request Return"
                              >
                                <ArrowPathIcon className="h-3.5 w-3.5" />
                                <span>Return</span>
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Total Amount</p>
                            <p className="text-lg font-black text-indigo-600">Rs {order.totalAmount?.toLocaleString()}</p>
                          </div>
                          {isExpanded ? <ChevronUpIcon className="h-5 w-5 text-gray-400" /> : <ChevronDownIcon className="h-5 w-5 text-gray-400" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-gray-50">
                        <div className="grid md:grid-cols-2 gap-8">
                          {/* Ordered Items */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <ShoppingBagIcon className="h-4 w-4" /> Ordered Items ({items.length})
                            </h4>
                            <div className="space-y-3">
                              {items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                  <div className="flex gap-3 items-center">
                                    {item.image && <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover bg-white" />}
                                    <div>
                                      <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                      <p className="text-xs text-gray-500">Qty: {item.quantity} • Size: {item.type}</p>
                                    </div>
                                  </div>
                                  <p className="text-sm font-bold text-gray-900">Rs {(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Order Info */}
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPinIcon className="h-4 w-4" /> Shipping Address
                              </h4>
                              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm leading-relaxed text-gray-600">
                                <p className="font-bold text-gray-800 mb-1">{order.customer?.fullName}</p>
                                <p>{order.customer?.address}</p>
                                <p>{order.customer?.city}, {order.customer?.zipCode}</p>
                                <p className="mt-2 font-medium">📞 {order.customer?.phone}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <CreditCardIcon className="h-4 w-4" /> Payment Details
                              </h4>
                              <div className="flex justify-between items-center text-sm px-1">
                                <span className="text-gray-500 uppercase tracking-tighter font-bold italic">Method</span>
                                <span className="font-bold text-gray-800 capitalize">
                                  {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Return Modal */}
      {returnModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setReturnModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center gap-3 mb-4">
              <ArrowPathIcon className="h-8 w-8 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-800">Request Return</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">Order #{selectedOrder._id.slice(-8)}</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason <span className="text-red-500">*</span></label>
                <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select a reason</option>
                  <option value="wrong_item">Wrong item received</option>
                  <option value="defective">Defective / Damaged</option>
                  <option value="not_as_described">Not as described</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments (Optional)</label>
                <textarea value={returnComment} onChange={(e) => setReturnComment(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500" placeholder="Please describe the issue in detail..." />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                <strong>ℹ️ Note:</strong> Our support team will review your request and contact you within 2 business days.
              </div>
              <button onClick={submitReturnRequest} disabled={submittingReturn || !returnReason} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
                {submittingReturn ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}