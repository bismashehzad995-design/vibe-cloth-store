"use client";
export default function FilterSidebar({ filters, onFilterChange, products }) {
  const uniqueBrands = products ? [...new Set(products.map(p => p.brand))] : [];

  const handlePriceChange = (e) => onFilterChange({ ...filters, priceRange: parseInt(e.target.value) });
  const handleSortChange = (e) => onFilterChange({ ...filters, sortBy: e.target.value });
  const handleBrandChange = (brand) => {
    const updated = filters.brands.includes(brand) ? filters.brands.filter(b => b !== brand) : [...filters.brands, brand];
    onFilterChange({ ...filters, brands: updated });
  };
  const handleNewArrivalsChange = () => onFilterChange({ ...filters, newArrivals: !filters.newArrivals });
  const handleItemsPerPageChange = (e) => onFilterChange({ ...filters, itemsPerPage: parseInt(e.target.value) });

  return (
    <div className="space-y-6 overflow-x-hidden w-full scrollbar-hide">
      <div>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3">Price (Rs)</h3>
        <input type="range" min="0" max="10000" step="100" value={filters.priceRange} onChange={handlePriceChange} className="w-full" />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Rs 0</span>
          <span className="font-medium text-indigo-600">Up to Rs {filters.priceRange}</span>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-2">Sort By</h3>
        <select value={filters.sortBy} onChange={handleSortChange} className="w-full border rounded-md px-3 py-2 text-sm">
          <option value="default">Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
      {uniqueBrands.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-2">Brand</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto overflow-x-hidden pr-1 scrollbar-hide">
            {uniqueBrands.map(brand => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer text-sm w-full">
                <input type="checkbox" checked={filters.brands.includes(brand)} onChange={() => handleBrandChange(brand)} className="w-4 h-4 shrink-0" />
                <span className="text-gray-700">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-2">Time</h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={filters.newArrivals} onChange={handleNewArrivalsChange} className="w-4 h-4 shrink-0" />
          <span>New Arrivals (last 30 days)</span>
        </label>
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-2">Items Per Page</h3>
        <select value={filters.itemsPerPage} onChange={handleItemsPerPageChange} className="w-full border rounded-md px-3 py-2 text-sm">
          <option value="4">4</option>
          <option value="8">8</option>
          <option value="12">12</option>
        </select>
      </div>
    </div>
  );
}