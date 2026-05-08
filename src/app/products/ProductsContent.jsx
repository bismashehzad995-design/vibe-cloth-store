"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductForm from "@/components/ProductForm";
import FilterSidebar from "@/components/FilterSidebar";

export default function ProductsContent() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const searchParams = useSearchParams();
  const brandParam = searchParams.get("brand");

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    priceRange: 10000,
    sortBy: "default",
    brands: [],
    categories: [],
    productTypes: [],
    newArrivals: false,
    itemsPerPage: 4,
  });
  const [currentPage, setCurrentPage] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (brandParam) {
      setFilters((prev) => ({
        ...prev,
        brands: [brandParam],
      }));
    }
  }, [brandParam]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [products, searchQuery, filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
      const existingBrands = [...new Set(data.map((p) => p.brand))];
      setFilters((prev) => ({
        ...prev,
        brands: prev.brands.filter((b) => existingBrands.includes(b)),
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...products];
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    filtered = filtered.filter((p) => p.price <= filters.priceRange);
    if (filters.brands.length > 0) {
      filtered = filtered.filter((p) => filters.brands.includes(p.brand));
    }
    if (filters.categories.length > 0) {
      filtered = filtered.filter((p) => p.category && filters.categories.includes(p.category));
    }
    if (filters.productTypes.length > 0) {
      filtered = filtered.filter((p) => p.productType && filters.productTypes.includes(p.productType));
    }
    if (filters.newArrivals) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter((p) => new Date(p.createdAt) >= thirtyDaysAgo);
    }
    if (filters.sortBy === "price_asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === "price_desc") {
      filtered.sort((a, b) => b.price - a.price);
    }
    setFilteredProducts(filtered);
    const grouped = filtered.reduce((acc, p) => {
      if (!acc[p.brand]) acc[p.brand] = [];
      acc[p.brand].push(p);
      return acc;
    }, {});
    setGroupedProducts(grouped);
    const newPages = {};
    Object.keys(grouped).forEach((b) => {
      newPages[b] = 0;
    });
    setCurrentPage(newPages);
  };

  const handleFilterChange = (newFilters) => setFilters(newFilters);
  const handleDelete = async (id) => {
    if (confirm("Delete?")) {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    }
  };
  const goToPage = (brand, dir) => {
    const total = groupedProducts[brand]?.length || 0;
    const perPage = filters.itemsPerPage;
    const totalPages = Math.ceil(total / perPage);
    setCurrentPage((prev) => {
      let newPage = prev[brand] + (dir === "next" ? 1 : -1);
      newPage = Math.max(0, Math.min(newPage, totalPages - 1));
      return { ...prev, [brand]: newPage };
    });
  };

  const clearAllFilters = () => {
    setFilters({
      priceRange: 10000,
      sortBy: "default",
      brands: [],
      categories: [],
      productTypes: [],
      newArrivals: false,
      itemsPerPage: 4,
    });
    setSearchQuery("");
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 sm:mb-8 border-b pb-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Categories</h1>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm sm:text-base"
          >
            + Add New Item
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-0 relative">
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl p-4 overflow-y-auto">
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h2 className="font-bold">Filters</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-red-500">✕</button>
              </div>
              <FilterSidebar filters={filters} onFilterChange={handleFilterChange} products={products} />
            </div>
          </div>
        )}

        <aside className="hidden md:block md:w-72 md:sticky md:top-24 h-full">
  <div className="p-4 border-r">
    <div className="flex justify-between items-center mb-4 pb-2 border-b">
      <h2 className="font-bold text-lg">Filters</h2>
      <button 
        onClick={() => setIsSidebarOpen(false)} 
        className="text-gray-500 hover:text-red-500 transition"
        title="Close filters"
      >
        ✕
      </button>
    </div>
    <FilterSidebar filters={filters} onFilterChange={handleFilterChange} products={products} />
  </div>
</aside>

        <main className="flex-1 w-full px-0 sm:px-4">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by product name or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-200 outline-none"
            />
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <p className="text-gray-400 text-lg">No products available.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <p className="text-gray-400 text-lg">No matches.</p>
              <button onClick={clearAllFilters} className="mt-3 text-indigo-600 underline">Clear filters</button>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedProducts).map(([brand, brandProducts]) => {
                const perPage = filters.itemsPerPage;
                const page = currentPage[brand] || 0;
                const start = page * perPage;
                const visible = brandProducts.slice(start, start + perPage);
                const totalPages = Math.ceil(brandProducts.length / perPage);
                return (
                  <div key={brand}>
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 border-l-4 border-indigo-600 pl-3">
                        {brand}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {start+1}–{Math.min(start+perPage, brandProducts.length)} of {brandProducts.length}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => goToPage(brand, "prev")}
                            disabled={page === 0}
                            className="p-1 rounded-full disabled:opacity-30"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                          </button>
                          <button
                            onClick={() => goToPage(brand, "next")}
                            disabled={page >= totalPages-1}
                            className="p-1 rounded-full disabled:opacity-30"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {visible.map((product) => (
                        <ProductCard
                          key={product._id}
                          product={product}
                          onEdit={(p) => { setEditingProduct(p); setShowForm(true); }}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => setShowForm(false)}
          onSuccess={fetchProducts}
        />
      )}
    </div>
  );
}