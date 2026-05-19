"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductForm from "@/components/ProductForm";
import { ChevronDownIcon, ChevronUpIcon, FunnelIcon } from "@heroicons/react/24/outline";

const categoryOptions = ["Men", "Women", "Kids"];
const productTypeOptions = ["Shirts", "Trousers", "Jeans", "Jackets", "Winter Wear", "Formal Wear", "Casual Wear"];

function AccordionSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-2 mb-3">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-2 text-left font-medium text-gray-700 hover:text-indigo-600">
        <span>{title}</span>
        {isOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
      </button>
      {isOpen && <div className="mt-2 space-y-2 pl-1">{children}</div>}
    </div>
  );
}

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
    selectedBrand: "",
    selectedCategory: "",
    selectedProductType: "",
    newArrivals: false,
    itemsPerPage: 4,
  });
  const [currentPage, setCurrentPage] = useState({});
  const [brands, setBrands] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // default open on desktop

  useEffect(() => {
    if (brandParam) setFilters((prev) => ({ ...prev, selectedBrand: brandParam }));
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
      const uniqueBrands = [...new Set(data.map((p) => p.brand))];
      setBrands(uniqueBrands);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...products];
    if (searchQuery) filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    filtered = filtered.filter(p => p.price <= filters.priceRange);
    if (filters.selectedBrand) filtered = filtered.filter(p => p.brand === filters.selectedBrand);
    if (filters.selectedCategory) filtered = filtered.filter(p => p.category && p.category === filters.selectedCategory);
    if (filters.selectedProductType) filtered = filtered.filter(p => p.productType && p.productType === filters.selectedProductType);
    if (filters.newArrivals) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(p => new Date(p.createdAt) >= thirtyDaysAgo);
    }
    if (filters.sortBy === "price_asc") filtered.sort((a, b) => a.price - b.price);
    else if (filters.sortBy === "price_desc") filtered.sort((a, b) => b.price - a.price);
    setFilteredProducts(filtered);
    const grouped = filtered.reduce((acc, p) => {
      if (!acc[p.brand]) acc[p.brand] = [];
      acc[p.brand].push(p);
      return acc;
    }, {});
    setGroupedProducts(grouped);
    const newPages = {};
    Object.keys(grouped).forEach(b => newPages[b] = 0);
    setCurrentPage(newPages);
  };

  const handleBrandChange = (brand) => setFilters(prev => ({ ...prev, selectedBrand: brand }));
  const handleCategoryChange = (cat) => setFilters(prev => ({ ...prev, selectedCategory: cat }));
  const handleProductTypeChange = (type) => setFilters(prev => ({ ...prev, selectedProductType: type }));
  const clearFilters = () => {
    setFilters({
      priceRange: 10000,
      sortBy: "default",
      selectedBrand: "",
      selectedCategory: "",
      selectedProductType: "",
      newArrivals: false,
      itemsPerPage: 4,
    });
    setSearchQuery("");
  };
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
    setCurrentPage(prev => {
      let newPage = prev[brand] + (dir === "next" ? 1 : -1);
      newPage = Math.max(0, Math.min(newPage, totalPages - 1));
      return { ...prev, [brand]: newPage };
    });
  };
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b pb-4">
        <div className="flex items-center gap-3">
          {/* Hamburger menu to toggle sidebar (visible on mobile and when sidebar is closed on desktop) */}
          <button onClick={toggleSidebar} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Categories</h1>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm sm:text-base">
            + Add New Item
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input type="text" placeholder="Search by product name or brand..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-200 outline-none" />
      </div>

      <div className="flex flex-col md:flex-row gap-6 relative">
        {/* Sidebar – conditional rendering based on isSidebarOpen */}
        {isSidebarOpen && (
          <>
            <div className={`
              fixed inset-0 z-50 md:relative md:z-auto md:inset-auto md:block md:w-72
              transition-transform duration-300 transform translate-x-0
              bg-white md:bg-transparent
            `}>
              <div className="h-full overflow-y-auto p-4 bg-white border-r md:sticky md:top-24">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg">Filters</h2>
                  {/* X button – closes sidebar on all devices */}
                  <button onClick={toggleSidebar} className="text-gray-500 hover:text-red-500">
                    ✕
                  </button>
                </div>
                {/* accordion sections – same as before */}
                <AccordionSection title="Brands" defaultOpen={false}>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <button onClick={() => handleBrandChange("")} className={`block w-full text-left text-sm px-2 py-1 rounded ${!filters.selectedBrand ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}>All Brands</button>
                    {brands.map(brand => <button key={brand} onClick={() => handleBrandChange(brand)} className={`block w-full text-left text-sm px-2 py-1 rounded ${filters.selectedBrand === brand ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}>{brand}</button>)}
                  </div>
                </AccordionSection>
                <AccordionSection title="Categories (Gender)">
                  <div className="space-y-2">
                    <button onClick={() => handleCategoryChange("")} className={`block w-full text-left text-sm px-2 py-1 rounded ${!filters.selectedCategory ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}>All</button>
                    {categoryOptions.map(cat => <button key={cat} onClick={() => handleCategoryChange(cat)} className={`block w-full text-left text-sm px-2 py-1 rounded ${filters.selectedCategory === cat ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}>{cat}</button>)}
                  </div>
                </AccordionSection>
                <AccordionSection title="Product Type">
                  <div className="space-y-2">
                    <button onClick={() => handleProductTypeChange("")} className={`block w-full text-left text-sm px-2 py-1 rounded ${!filters.selectedProductType ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}>All</button>
                    {productTypeOptions.map(type => <button key={type} onClick={() => handleProductTypeChange(type)} className={`block w-full text-left text-sm px-2 py-1 rounded ${filters.selectedProductType === type ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}>{type}</button>)}
                  </div>
                </AccordionSection>
                <AccordionSection title="Price Range">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Max Price: Rs {filters.priceRange}</label>
                    <input type="range" min="0" max="10000" step="100" value={filters.priceRange} onChange={(e) => setFilters(prev => ({ ...prev, priceRange: Number(e.target.value) }))} className="w-full" />
                  </div>
                </AccordionSection>
                <AccordionSection title="Sort By">
                  <select value={filters.sortBy} onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm">
                    <option value="default">Default</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </AccordionSection>
                <AccordionSection title="New Arrivals">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={filters.newArrivals} onChange={(e) => setFilters(prev => ({ ...prev, newArrivals: e.target.checked }))} className="w-4 h-4" />
                    <span className="text-sm">Last 30 days</span>
                  </label>
                </AccordionSection>
                <button onClick={clearFilters} className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium">Clear All Filters</button>
              </div>
            </div>
            {/* mobile overlay */}
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={toggleSidebar} />
          </>
        )}

        {/* Product Grid */}
        <main className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl"><p className="text-gray-400 text-lg">No products available.</p></div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <p className="text-gray-400 text-lg">No matches.</p>
              <button onClick={clearFilters} className="mt-3 text-indigo-600 underline">Clear filters</button>
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
                      <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 border-l-4 border-indigo-600 pl-3">{brand}</h2>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{start+1}–{Math.min(start+perPage, brandProducts.length)} of {brandProducts.length}</span>
                        <div className="flex gap-1">
                          <button onClick={() => goToPage(brand, "prev")} disabled={page === 0} className="p-1 rounded-full disabled:opacity-30">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                          </button>
                          <button onClick={() => goToPage(brand, "next")} disabled={page >= totalPages-1} className="p-1 rounded-full disabled:opacity-30">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {visible.map(product => <ProductCard key={product._id} product={product} onEdit={(p) => { setEditingProduct(p); setShowForm(true); }} onDelete={handleDelete} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {showForm && <ProductForm product={editingProduct} onClose={() => setShowForm(false)} onSuccess={fetchProducts} />}
    </div>
  );
}