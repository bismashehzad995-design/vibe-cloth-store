"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

export default function ProductCard({ product, onEdit, onDelete }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const isLoggedIn = !!session;
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [showModal, setShowModal] = useState(false);
  const [selectedQty, setSelectedQty] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, "Standard", selectedQty);
    setShowModal(false);
  };

  const renderStars = (rating) => {
    const full = Math.round(rating);
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < full ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ));
  };

  const handleWishlistToggle = () => {
    if (!isLoggedIn) return; // optional: prompt login
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const isVideo = (url) => url && /\.(mp4|webm|mov|avi)$/i.test(url);

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="relative h-64 w-full bg-gray-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Wishlist Heart Button – only for logged in users */}
          {isLoggedIn && (
            <button
              onClick={handleWishlistToggle}
              className="absolute top-2 left-2 bg-white p-1.5 rounded-full shadow-md z-10"
              title={isInWishlist(product._id) ? "Remove from favourites" : "Add to favourites"}
            >
              {isInWishlist(product._id) ? (
                <HeartSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartOutline className="w-5 h-5 text-gray-600" />
              )}
            </button>
          )}

          {/* Admin Edit/Delete Buttons */}
          {isAdmin && (
            <div className="absolute top-2 right-2 flex gap-1 z-10">
              <button
                onClick={() => onEdit(product)}
                className="bg-white p-1.5 rounded-full shadow-md text-gray-600 hover:text-blue-600"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(product._id)}
                className="bg-white p-1.5 rounded-full shadow-md text-gray-600 hover:text-red-600"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-0.5 mt-1 text-sm">
            {renderStars(product.rating || 4)}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            <span className="font-normal">Brand :</span>{" "}
            <span className="font-bold text-gray-700">{product.brand}</span>
          </div>
          <div className="mt-2 text-lg font-extrabold text-indigo-600">
            Rs {product.price.toFixed(0)}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 w-full bg-indigo-50 text-indigo-700 py-2 rounded-full text-sm font-medium hover:bg-indigo-100"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Quick View Modal – same as before */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between">
              <h2 className="text-2xl ml-2.5 font-bold">{product.name}</h2>
              <button onClick={() => setShowModal(false)}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                {isVideo(product.videoUrl) ? (
                  <video controls src={product.videoUrl} className="w-full rounded-lg" />
                ) : (
                  <img src={product.imageUrl} alt={product.name} className="w-full rounded-lg" />
                )}
              </div>
              <div className="md:w-1/2 flex flex-col gap-3">
                <div className="text-lg text-gray-700">
                  <span>Brand :</span> <span className="text-xl font-bold">{product.brand}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">Description:</h4>
                  <p className="text-gray-600 text-sm leading-relaxed max-h-40 overflow-y-auto pr-2 break-words whitespace-pre-line border-l-2 border-indigo-100 pl-3">
                    {product.description}
                  </p>
                </div>
                <div className="text-2xl font-extrabold text-indigo-600">
                  Rs {product.price}
                </div>
                {/* Quantity Selector */}
                <div>
                  <label className="block text-lg font-medium text-gray-700">Quantity</label>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                      className="w-8 h-8 border rounded"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{selectedQty}</span>
                    <button
                      onClick={() => setSelectedQty(selectedQty + 1)}
                      className="w-8 h-8 border rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-indigo-600 text-white py-2 mt-1 rounded-full hover:bg-indigo-700"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}