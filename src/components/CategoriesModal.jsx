"use client";
import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function CategoriesModal({ onClose }) {
  const [brands, setBrands] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const uniqueBrands = [...new Set(data.map((p) => p.brand))];
        setBrands(uniqueBrands);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleBrandClick = (brand) => {
    // navigate to products page with brand filter
    router.push(`/products?brand=${encodeURIComponent(brand)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4">Categories</h2>
        <div className="flex flex-col gap-2">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => handleBrandClick(brand)}
              className="text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}