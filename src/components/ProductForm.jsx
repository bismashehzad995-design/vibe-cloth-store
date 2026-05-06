"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ProductForm({ product, onClose, onSuccess }) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    rating: 4.0,
    imageUrl: "", // Ab hum URL use karenge
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        brand: product.brand,
        description: product.description,
        price: product.price,
        rating: product.rating || 4.0,
        imageUrl: product.imageUrl || "",
      });
    }
  }, [product]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = product ? `/api/products/${product._id}` : "/api/products";
      const method = product ? "PUT" : "POST";
      
      // Ab hum FormData ki bajaye simple JSON bhej rahe hain
      const res = await fetch(url, { 
        method, 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData) 
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save product");
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-auto shadow-2xl">
        <div className="flex justify-between items-center px-5 py-3 border-b">
          <h2 className="text-lg font-semibold">{product ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-2 rounded-lg text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" required className="w-full px-3 py-1.5 border rounded-lg" />
            <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand" required className="w-full px-3 py-1.5 border rounded-lg" />
          </div>

          <textarea name="description" value={formData.description} onChange={handleChange} rows="2" placeholder="Description" required className="w-full px-3 py-1.5 border rounded-lg" />

          <div className="grid grid-cols-2 gap-4">
            <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price (Rs)" required className="w-full px-3 py-1.5 border rounded-lg" />
            <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleChange} placeholder="Rating" className="w-full px-3 py-1.5 border rounded-lg" />
          </div>

          {/* NAYA IMAGE URL INPUT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image URL</label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="Paste image link here (e.g. https://...)"
              required
              className="w-full px-3 py-1.5 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[10px] text-gray-500 mt-1">Tip: Right-click on any product image online and select 'Copy Image Address'</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-3 py-1.5 border rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg">
              {loading ? "Saving..." : product ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}