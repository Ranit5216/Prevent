import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaFilter, FaTimes, FaRupeeSign, FaStar, FaTag } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

const AdvancedSearchFilters = ({ filters, onFiltersChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const allCategory = useSelector(state => state.product.allCategory) || [];
  const allSubCategory = useSelector(state => state.product.allSubCategory) || [];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handlePriceChange = (type, value) => {
    const numValue = value === '' ? '' : Number(value);
    onFiltersChange({
      ...filters,
      [type]: numValue
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.categoryId) count++;
    if (filters.subCategoryId) count++;
    if (filters.minRating) count++;
    if (filters.hasDiscount) count++;
    if (filters.sortBy && filters.sortBy !== 'newest') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Get subcategories for selected category
  const filteredSubCategories = filters.categoryId
    ? allSubCategory.filter(sub => {
        // Check if subcategory's category array includes the selected category
        if (Array.isArray(sub.category)) {
          return sub.category.some(cat => 
            (typeof cat === 'object' ? cat._id : cat) === filters.categoryId
          )
        }
        return false
      })
    : allSubCategory;

  return (
    <div className="mb-4 sm:mb-6">
      {/* Mobile: Collapsible Filter Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg border-2 border-gray-200 hover:border-[#DC2626] transition-all shadow-sm"
        >
          <div className="flex items-center gap-2">
            <FaFilter className="text-[#DC2626]" />
            <span className="font-semibold text-gray-800">Advanced Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-[#DC2626] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {isOpen ? (
            <FaTimes className="text-gray-600" />
          ) : (
            <span className="text-sm text-gray-600">Tap to expand</span>
          )}
        </button>

        {/* Mobile Filter Panel */}
        {isOpen && (
          <div className="mt-3 bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
            {renderFilters()}
          </div>
        )}
      </div>

      {/* Desktop: Always Visible Sidebar */}
      <div className="hidden lg:block bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaFilter className="text-[#DC2626]" />
            Advanced Filters
          </h3>
          {activeFiltersCount > 0 && (
            <button
              onClick={onReset}
              className="text-xs text-[#DC2626] hover:underline font-semibold"
            >
              Clear All
            </button>
          )}
        </div>
        {renderFilters()}
      </div>
    </div>
  );

  function renderFilters() {
    return (
      <div className="space-y-4 sm:space-y-5">
        {/* Price Range */}
        <div>
          <label className="block font-semibold text-sm sm:text-base text-gray-800 mb-2 flex items-center gap-2">
            <FaRupeeSign className="text-[#DC2626]" />
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#FEE2E2] transition-all"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#FEE2E2] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block font-semibold text-sm sm:text-base text-gray-800 mb-2">
            Category
          </label>
          <select
            value={filters.categoryId || ''}
            onChange={(e) => {
              handleFilterChange('categoryId', e.target.value || null);
              // Reset subcategory when category changes
              if (!e.target.value) {
                handleFilterChange('subCategoryId', null);
              }
            }}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#FEE2E2] transition-all"
          >
            <option value="">All Categories</option>
            {allCategory.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory */}
        <div>
          <label className="block font-semibold text-sm sm:text-base text-gray-800 mb-2">
            Subcategory
          </label>
          <select
            value={filters.subCategoryId || ''}
            onChange={(e) => handleFilterChange('subCategoryId', e.target.value || null)}
            disabled={!filters.categoryId}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#FEE2E2] transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">All Subcategories</option>
            {filteredSubCategories.map((subCategory) => (
              <option key={subCategory._id} value={subCategory._id}>
                {subCategory.name}
              </option>
            ))}
          </select>
        </div>

        {/* Minimum Rating */}
        <div>
          <label className="block font-semibold text-sm sm:text-base text-gray-800 mb-2 flex items-center gap-2">
            <FaStar className="text-[#ffbf00]" />
            Minimum Rating
          </label>
          <select
            value={filters.minRating || ''}
            onChange={(e) => handleFilterChange('minRating', e.target.value || null)}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#FEE2E2] transition-all"
          >
            <option value="">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="1">1+ Star</option>
          </select>
        </div>

        {/* Discount Filter */}
        <div>
          <label className="block font-semibold text-sm sm:text-base text-gray-800 mb-2 flex items-center gap-2">
            <FaTag className="text-[#DC2626]" />
            Discount
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasDiscount || false}
              onChange={(e) => handleFilterChange('hasDiscount', e.target.checked)}
              className="w-4 h-4 text-[#DC2626] border-gray-300 rounded focus:ring-[#DC2626] focus:ring-2"
            />
            <span className="text-sm text-gray-700">Show only discounted items</span>
          </label>
        </div>

        {/* Sort By */}
        <div>
          <label className="block font-semibold text-sm sm:text-base text-gray-800 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#FEE2E2] transition-all"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="discount">Highest Discount</option>
          </select>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {filters.minPrice && (
                <span className="inline-flex items-center gap-1 bg-[#FEE2E2] text-[#DC2626] px-2 py-1 rounded text-xs font-semibold">
                  Min: ₹{filters.minPrice}
                  <button
                    onClick={() => handlePriceChange('minPrice', '')}
                    className="hover:text-[#991B1B]"
                  >
                    <IoMdClose />
                  </button>
                </span>
              )}
              {filters.maxPrice && (
                <span className="inline-flex items-center gap-1 bg-[#FEE2E2] text-[#DC2626] px-2 py-1 rounded text-xs font-semibold">
                  Max: ₹{filters.maxPrice}
                  <button
                    onClick={() => handlePriceChange('maxPrice', '')}
                    className="hover:text-[#991B1B]"
                  >
                    <IoMdClose />
                  </button>
                </span>
              )}
              {filters.categoryId && (
                <span className="inline-flex items-center gap-1 bg-[#FEE2E2] text-[#DC2626] px-2 py-1 rounded text-xs font-semibold">
                  {allCategory.find(c => c._id === filters.categoryId)?.name}
                  <button
                    onClick={() => {
                      handleFilterChange('categoryId', null);
                      handleFilterChange('subCategoryId', null);
                    }}
                    className="hover:text-[#991B1B]"
                  >
                    <IoMdClose />
                  </button>
                </span>
              )}
              {filters.subCategoryId && (
                <span className="inline-flex items-center gap-1 bg-[#FEE2E2] text-[#DC2626] px-2 py-1 rounded text-xs font-semibold">
                  {allSubCategory.find(s => s._id === filters.subCategoryId)?.name}
                  <button
                    onClick={() => handleFilterChange('subCategoryId', null)}
                    className="hover:text-[#991B1B]"
                  >
                    <IoMdClose />
                  </button>
                </span>
              )}
              {filters.minRating && (
                <span className="inline-flex items-center gap-1 bg-[#FEE2E2] text-[#DC2626] px-2 py-1 rounded text-xs font-semibold">
                  {filters.minRating}+ Stars
                  <button
                    onClick={() => handleFilterChange('minRating', null)}
                    className="hover:text-[#991B1B]"
                  >
                    <IoMdClose />
                  </button>
                </span>
              )}
              {filters.hasDiscount && (
                <span className="inline-flex items-center gap-1 bg-[#FEE2E2] text-[#DC2626] px-2 py-1 rounded text-xs font-semibold">
                  Discounted
                  <button
                    onClick={() => handleFilterChange('hasDiscount', false)}
                    className="hover:text-[#991B1B]"
                  >
                    <IoMdClose />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default AdvancedSearchFilters;

