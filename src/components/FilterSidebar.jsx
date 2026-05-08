"use client";
import { useState, useEffect } from "react";

const categoryOptions = ["Men", "Women", "Kids"];
const productTypeOptions = ["Shirts", "Trousers", "Jeans", "Jackets", "Winter Wear", "Formal Wear", "Casual Wear"];

export default function FilterSidebar({ filters, onFilterChange, products }) {
  const [priceRange, setPriceRange] = useState(filters.priceRange);
  const [sortBy, setSortBy] = useState(filters.sortBy);
  const [selectedBrands, setSelectedBrands] = useState(filters.brands || []);
  const [selectedCategories, setSelectedCategories] = useState(filters.categories || []);
  const [selectedProductTypes, setSelectedProductTypes] = useState(filters.productTypes || []);
  const [newArrivals, setNewArrivals] = useState(filters.newArrivals);
  const [itemsPerPage, setItemsPerPage] = useState(filters.itemsPerPage);

  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  useEffect(() => {
    onFilterChange({
      priceRange,
      sortBy,
      brands: selectedBrands,
      categories: selectedCategories,
      productTypes: selectedProductTypes,
      newArrivals,
      itemsPerPage,
    });
  }, [priceRange, sortBy, selectedBrands, selectedCategories, selectedProductTypes, newArrivals, itemsPerPage]);

  useEffect(() => {
    setPriceRange(filters.priceRange);
    setSortBy(filters.sortBy);
    setSelectedBrands(filters.brands || []);
    setSelectedCategories(filters.categories || []);
    setSelectedProductTypes(filters.productTypes || []);
    setNewArrivals(filters.newArrivals);
    setItemsPerPage(filters.itemsPerPage);
  }, [filters]);

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const toggleProductType = (type) => {
    setSelectedProductTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Max Price: Rs {priceRange}</label>
        <input type="range" min="0" max="10000" step="100" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="w-full" />
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Sort By</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full border rounded-lg p-2">
          <option value="default">Default</option>
          <option value="price_asc">Price: Low ❯ High</option>
          <option value="price_desc">Price: High ❯ Low</option>
        </select>
      </div>

      {/* Brand */}
      <div>
        <h3 className="font-medium mb-2">Brands</h3>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {brands.map(brand => (
            <label key={brand} className="flex items-center gap-2">
              <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} />
              <span className="text-sm">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Gender Category */}
      <div>
        <h3 className="font-medium mb-2">Categories (Gender)</h3>
        <div className="space-y-1">
          {categoryOptions.map(cat => (
            <label key={cat} className="flex items-center gap-2">
              <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} />
              <span className="text-sm">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Product Type */}
      <div>
        <h3 className="font-medium mb-2">Product Type</h3>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {productTypeOptions.map(type => (
            <label key={type} className="flex items-center gap-2">
              <input type="checkbox" checked={selectedProductTypes.includes(type)} onChange={() => toggleProductType(type)} />
              <span className="text-sm">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* New Arrivals */}
      <div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={newArrivals} onChange={(e) => setNewArrivals(e.target.checked)} />
          New Arrivals (last 30 days)
        </label>
      </div>

      {/* Items Per Page */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Items Per Page</label>
        <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="w-full border rounded-lg p-2">
          <option value="4">4</option>
          <option value="8">8</option>
          <option value="12">12</option>
        </select>
      </div>
    </div>
  );
}