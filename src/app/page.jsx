"use client";
import { useRouter } from "next/navigation";
import { useModal } from "@/context/ModalContext";

export default function LandingPage() {
  const router = useRouter();
  const { openModal } = useModal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left column - brand & text */}
          <div className="text-center lg:text-left">
            <h1 className="text-6xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
              Outfit<span className="text-indigo-600"> Vibes</span>
            </h1>
            <p className="mt-6 text-gray-600 text-lg max-w-md mx-auto lg:mx-0">
              Where style meets comfort. Discover the latest trends in fashion.
            </p>
            <div className="mt-6 text-gray-500 text-sm flex flex-wrap gap-4 justify-center lg:justify-start">
              <span>✨ New arrivals</span>
              <span>🔥 Best sellers</span>
              <span>💫 Refresh your wardrobe</span>
            </div>
            <div className="mt-8">
              <button
                onClick={() => openModal(false)}
                className="bg-black text-white px-6 py-2.5 rounded-full font-medium hover:bg-gray-800 transition shadow-md"
              >
                Browse Collection
              </button>
            </div>
            <div className="mt-12 space-y-6">
              <img
                src="https://cdn.shopify.com/s/files/1/0027/2596/9964/files/Tile_2_d_a61b9792-6aa1-420b-971b-6b9da146acec.webp?v=1776926010"
                alt="Fashion"
                className="w-full rounded-xl shadow-md object-cover h-135"
              />
              <img
                src="https://cdn.shopify.com/s/files/1/0027/2596/9964/files/Tile_4_d_b174a474-d597-4aa3-becf-74b3e3248bcb.webp?v=1776926009"
                alt="Style"
                className="w-full rounded-xl shadow-md object-cover h-135"
              />
            </div>
          </div>

          {/* Right column - images (taller ones) */}
          <div className="space-y-6">
            <img
              src="https://nishatlinen.com/cdn/shop/files/1500x1500.jpg?v=1769422642&width=500"
              alt="Trend"
              className="w-full rounded-xl shadow-md object-cover h-130"
            />
            <img
              src="https://pk.sapphireonline.pk/dw/image/v2/BKSB_PRD/on/demandware.static/-/Sites-sapphire-master-catalog/default/dw7a5c5689/images/April26/22ndApril26/PRS26SCH143S_999_2.JPG?sw=1000&sh=1200"
              alt="Outfit"
              className="w-full rounded-xl shadow-md object-cover h-218"
            />
          </div>
        </div>
      </div>
    </div>
  );
}