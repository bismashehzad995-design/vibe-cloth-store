"use client";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function WishlistPage() {
  const { wishlist, loading, removeFromWishlist } = useWishlist();

  if (loading) return <div className="text-center py-10">Loading...</div>;

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <HeartSolid className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">No favourites yet</h2>
        <p className="text-gray-500">Start adding products to your wishlist!</p>
        <Link href="/products" className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-full">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
      <h1 className="text-3xl font-bold mb-6">My Favourites</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div key={product._id} className="bg-white rounded-xl shadow border border-gray-100 p-4 flex flex-col transition hover:shadow-md">
            {/* Image */}
            <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-3">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Product Info */}
            <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{product.name}</h3>
            <p className="text-indigo-600 font-bold mt-1">Rs {product.price}</p>
            <p className="text-xs text-gray-400 mt-1">Brand: {product.brand}</p>
            {/* 🔥 Remove Button (instead of delete icon) – aligns with text, not top-right */}
            <button
              onClick={() => removeFromWishlist(product._id)}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition text-sm"
            >
              <TrashIcon className="w-4 h-4" />
              Remove from favourites
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}