"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";   // ✅ added this line

const productTypeOptions = ["Shirts", "Trousers", "Jeans", "Jackets", "Winter Wear", "Formal Wear", "Casual Wear"];

export default function ProductForm({ product, onClose, onSuccess }) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    rating: 4.0,
    imageUrl: "",
    category: "",
    productType: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        brand: product.brand || "",
        description: product.description || "",
        price: product.price || "",
        rating: product.rating || 4.0,
        imageUrl: product.imageUrl || "",
        category: product.category || "",
        productType: product.productType || "",
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

    if (!formData.name || !formData.price || !formData.imageUrl || !formData.category || !formData.productType) {
      setError("Please fill all required fields.");
      setLoading(false);
      return;
    }

    const payload = {
      name: formData.name,
      brand: formData.brand,
      description: formData.description,
      price: parseFloat(formData.price),
      rating: parseFloat(formData.rating),
      imageUrl: formData.imageUrl,
      category: formData.category,
      productType: formData.productType,
    };

    try {
      const url = product ? `/api/products/${product._id}` : "/api/products";
      const method = product ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
            <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} placeholder="Price (Rs)" required className="w-full px-3 py-1.5 border rounded-lg" />
            <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleChange} placeholder="Rating (0-5)" className="w-full px-3 py-1.5 border rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category (Gender)</label>
            <select name="category" value={formData.category} onChange={handleChange} required className="w-full px-3 py-1.5 border border-gray-300 rounded-lg">
              <option value="">Select Gender</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
            <select name="productType" value={formData.productType} onChange={handleChange} required className="w-full px-3 py-1.5 border border-gray-300 rounded-lg">
              <option value="">Select Product Type</option>
              {productTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" required className="w-full px-3 py-1.5 border border-indigo-300 rounded-lg" />
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