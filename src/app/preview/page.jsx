"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Static preview products (12 items – lightweight images)
const previewProducts = [
  { id: 1, name: "Hania Aamir", price: 2499, image: "https://neel.pk/cdn/shop/files/W.SS24.221.T-4_1946x_46555fd9-9e74-4d32-a042-1700efd63e55.jpg?v=1718488499&width=360" },
  { id: 2, name: "Sajal & Saboor Ali", price: 1899, image: "https://i.pinimg.com/1200x/68/2f/fa/682ffa26859d08e7cd90c43ca2c6c77a.jpg" },
  { id: 3, name: "Urwa Hocane", price: 3999, image: "https://propakistani.pk/lens/wp-content/uploads/2021/03/urwa-hocane-1-819x1024-1.jpg" },
  { id: 4, name: "Maya Ali", price: 4599, image: "https://blogproxy.andaazfashion.com/wp-content/uploads/2022/02/white-net-lehenga-with-silk-choli-lstv03966-2-683x1024.jpg" },
  { id: 5, name: "Sehar Khan", price: 1799, image: "https://i.pinimg.com/736x/0b/7e/f5/0b7ef54781f76e3a59d75c130d2ecc63.jpg" },
  { id: 6, name: "Kinza Hashmi", price: 3499, image: "https://i.pinimg.com/736x/87/52/e5/8752e5d4b523104b0fbbcbf7e0361feb.jpg" },
  { id: 7, name: "Aiman & Minal Khan", price: 2799, image: "https://reviewit.pk/wp-content/uploads/2020/10/Aiman-Minal-5.jpeg" },
  { id: 8, name: "Laiba Khan", price: 5999, image: "https://neel.pk/cdn/shop/files/Snapinsta.app_449028389_1378622069476816_3455321142561059488_n_1080_45c78cdc-f506-4fca-a23c-55e0036fba17.jpg?v=1728159572&width=493" },
  { id: 9, name: "Mawra & Urwa Hocane", price: 4299, image: "https://reviewit.pk/wp-content/uploads/2022/03/Urwa-Mawra-UxM11-821x1024.jpg" },
  { id: 10, name: "Ayeza Khan", price: 6999, image: "https://neel.pk/cdn/shop/files/101_4d23b1f6-7ee2-4b90-9db1-b2a188b63f5f.jpg?v=1740470334&width=493" },
  { id: 11, name: "Hania Aamir", price: 8999, image: "https://neel.pk/cdn/shop/files/verona-lilac-lawn-suit_600x_dfbd58ee-ba60-49b0-8a96-98caa9e16621.jpg?v=1714607019&width=360" },
  { id: 12, name: "Dur e Fishan", price: 3499, image: "https://neel.pk/cdn/shop/files/106A_8.jpg?v=1742926880&width=493" },
];

export default function PreviewPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setProducts(data.slice(0, 12));
        } else {
          setProducts(previewProducts);
        }
      })
      .catch(() => setProducts(previewProducts))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex flex-col">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 py-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">✨ Explore Our Preview Collection ✨</h2>
        <p className="text-gray-600 mt-2">Sign in to unlock full access and shop these styles</p>
      </div>

      {/* Product grid – price removed from cards */}
      <div className="flex-grow px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition">
              <img src={product.image} alt={product.name} className="w-full h-100 object-cover rounded-lg mb-3" />
              <h3 className="font-semibold text-gray-800">{product.name}</h3>
              {/* Price line removed */}
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <button
            onClick={() => router.push("/")}
            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-medium hover:bg-indigo-700 transition shadow-md"
          >
            Sign in to shop full collection
          </button>
        </div>
      </div>
    </div>
  );
}