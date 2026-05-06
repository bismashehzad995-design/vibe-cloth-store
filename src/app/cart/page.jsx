"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [checkoutData, setCheckoutData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    paymentMethod: "cod",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    phone: "",
    zipCode: "",
    city: "",
  });

  // Validation functions
  const validatePhone = (phone) => {
  const phoneRegex = /^03\d{9}$/;   // starts with 03, then exactly 9 digits -> total 11 digits
  if (!phone) return "Phone number is required";
  if (!phoneRegex.test(phone)) return "Phone must be 11 digits & start with 03 (e.g., 03XXXXXXXXX)";
  return "";
};

  const validateZipCode = (zip) => {
    const zipRegex = /^\d+$/;
    if (!zip) return "ZIP code is required";
    if (!zipRegex.test(zip)) return "ZIP code must contain only numbers";
    return "";
  };

  const validateCity = (city) => {
    const cityRegex = /^[A-Za-z\s]+$/;
    if (!city) return "City is required";
    if (!cityRegex.test(city)) return "City must contain only English letters and spaces";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData({ ...checkoutData, [name]: value });

    // Real-time validation
    if (name === "phone") {
      setValidationErrors(prev => ({ ...prev, phone: validatePhone(value) }));
    } else if (name === "zipCode") {
      setValidationErrors(prev => ({ ...prev, zipCode: validateZipCode(value) }));
    } else if (name === "city") {
      setValidationErrors(prev => ({ ...prev, city: validateCity(value) }));
    }
  };

  const isFormValid = () => {
    const phoneValid = validatePhone(checkoutData.phone) === "";
    const zipValid = validateZipCode(checkoutData.zipCode) === "";
    const cityValid = validateCity(checkoutData.city) === "";
    const requiredFields = checkoutData.fullName && checkoutData.email && checkoutData.address;
    return phoneValid && zipValid && cityValid && requiredFields;
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    
    // Final validation check
    const phoneErr = validatePhone(checkoutData.phone);
    const zipErr = validateZipCode(checkoutData.zipCode);
    const cityErr = validateCity(checkoutData.city);
    if (phoneErr || zipErr || cityErr) {
      setValidationErrors({
        phone: phoneErr,
        zipCode: zipErr,
        city: cityErr,
      });
      toast.error("Please fix validation errors");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const orderData = {
        customer: {
          fullName: checkoutData.fullName,
          email: checkoutData.email,
          phone: checkoutData.phone,
          address: checkoutData.address,
          city: checkoutData.city,
          zipCode: checkoutData.zipCode,
        },
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          type: item.size,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        totalAmount: getCartTotal() + 250,
        paymentMethod: checkoutData.paymentMethod,
      };
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      toast.success("Order placed successfully!");
      clearCart();
      setShowModal(false);
      router.push("/products");
    } catch (err) {
      console.error(err);
      setError(err.message);
      toast.error("Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <ShoppingCartIcon className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Your cart is waiting</h1>
        <p className="text-gray-500 mt-2">Please sign in to view and manage your cart</p>
        <Link
          href="/login"
          className="inline-block mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <ShoppingCartIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="text-gray-500 mt-2">Looks like you haven't added anything yet</p>
        <Link
          href="/products"
          className="inline-block mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const delivery = 250;
  const subtotal = getCartTotal();
  const total = subtotal + delivery;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <ShoppingCartIcon className="w-8 h-8 text-indigo-600" />
          Shopping Cart
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items - left column */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="p-4 sm:p-6 flex flex-wrap sm:flex-nowrap gap-4">
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                      <p className="text-indigo-600 font-bold text-xl mt-1">Rs {item.price.toFixed(0)}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg"
                          >
                            -
                          </button>
                          <span className="w-10 text-center text-gray-700">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId, item.size)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-800">
                        Rs {item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear Cart
                </button>
                <p className="text-sm text-gray-500">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary - right column */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs {subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>Rs {delivery}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>Rs {total.toFixed(0)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-sm"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal with Validation */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Complete Your Order</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={placeOrder}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column - Shipping Details */}
                  <div className="space-y-5">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Shipping Details</h3>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="fullName"
                        value={checkoutData.fullName}
                        onChange={handleChange}
                        placeholder="Full Name"
                        required
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="email"
                        type="email"
                        value={checkoutData.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        required
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {/* Phone with validation */}
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="phone"
                        value={checkoutData.phone}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        required
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                          validationErrors.phone ? "border-red-500" : "border-gray-300"
                        } focus:ring-2 focus:ring-indigo-500`}
                      />
                      {validationErrors.phone && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                      )}
                    </div>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="address"
                        value={checkoutData.address}
                        onChange={handleChange}
                        placeholder="Street Address"
                        required
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {/* City with validation */}
                      <div className="relative">
                        <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          name="city"
                          value={checkoutData.city}
                          onChange={handleChange}
                          placeholder="City"
                          required
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                            validationErrors.city ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {validationErrors.city && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.city}</p>
                        )}
                      </div>
                      {/* ZIP with validation */}
                      <div>
                        <input
                          name="zipCode"
                          value={checkoutData.zipCode}
                          onChange={handleChange}
                          placeholder="ZIP Code"
                          required
                          className={`w-full px-3 py-2 border rounded-lg ${
                            validationErrors.zipCode ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {validationErrors.zipCode && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.zipCode}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Order Summary & Payment (unchanged) */}
                  <div className="space-y-5">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Order Summary</h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      {cartItems.map((item) => (
                        <div key={item.productId} className="flex justify-between text-sm">
                          <span>
                            {item.name} x{item.quantity}
                          </span>
                          <span className="font-medium">Rs {item.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Subtotal</span>
                        <span>Rs {subtotal}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Delivery</span>
                        <span>Rs {delivery}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span>Rs {total}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-4">Payment Method</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={checkoutData.paymentMethod === "cod"}
                          onChange={handleChange}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <CreditCardIcon className="w-5 h-5 text-gray-400" />
                        <span className="flex-1">Cash on Delivery</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank"
                          checked={checkoutData.paymentMethod === "bank"}
                          onChange={handleChange}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <CreditCardIcon className="w-5 h-5 text-gray-400" />
                        <span className="flex-1">Bank Transfer</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !isFormValid()}
                      className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      {submitting ? "Placing Order..." : "Place Order"}
                    </button>
                    {!isFormValid() && (
                      <p className="text-xs text-red-500 text-center mt-2">
                        Please fix validation errors above
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}