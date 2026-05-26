import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, SlidersHorizontal, Tag, RotateCcw, TrendingUp } from 'lucide-react';
import api from '../api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['Textbooks', 'Electronics', 'Dorm Gear', 'Clothing', 'Sports', 'Tickets', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter and Search States mapped directly from searchParams
  const query = searchParams.get('query') || '';
  const category = searchParams.get('category') || '';
  const condition = searchParams.get('condition') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sortBy') || 'recent';
  const page = parseInt(searchParams.get('page') || '0', 10);

  const searchInputRef = useRef(null);

  // Autofocus search on mobile if flagged
  useEffect(() => {
    if (searchParams.get('focusSearch') === 'true' && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchParams]);

  // Load Main Listings Page
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/products', {
          params: {
            query,
            category,
            condition,
            minPrice: minPrice || null,
            maxPrice: maxPrice || null,
            sortBy,
            page,
            size: 6,
          }
        });
        setProducts(res.data.content);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error("Failed to load listings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [query, category, condition, minPrice, maxPrice, sortBy, page]);

  // Load Trending Sidebar Recommendations
  useEffect(() => {
    const fetchTrending = async () => {
      setTrendingLoading(true);
      try {
        const res = await api.get('/api/products/recommendations?limit=3');
        setTrending(res.data);
      } catch (err) {
        console.error("Failed to load trending items", err);
      } finally {
        setTrendingLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '0'); // Reset page to 0 on filter change
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Remove focusSearch flag if updating details
    params.delete('focusSearch');
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams({ page: '0', sortBy: 'recent' }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Handled automatically via keyup/input or updateFilters
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
      {/* 1. Sidebar Filters (Desktop only) */}
      <aside className="w-64 shrink-0 hidden lg:flex flex-col gap-6 text-left">
        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-1.5">
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </h3>
            <button 
              onClick={handleResetFilters}
              className="text-[10px] font-bold text-gray-400 hover:text-primary flex items-center gap-0.5 transition-colors"
            >
              <RotateCcw size={10} />
              <span>Reset</span>
            </button>
          </div>

          {/* Categories Filter */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Category</h4>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => updateFilters('category', '')}
                className={`text-left text-xs font-semibold px-2 py-1.5 rounded-lg transition-smooth ${!category ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateFilters('category', cat)}
                  className={`text-left text-xs font-semibold px-3 py-1.5 rounded-lg transition-smooth ${category === cat ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Condition Filter */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Condition</h4>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => updateFilters('condition', '')}
                className={`text-left text-xs font-semibold px-3 py-1.5 rounded-lg transition-smooth ${!condition ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Any Condition
              </button>
              {CONDITIONS.map((cond) => (
                <button
                  key={cond}
                  onClick={() => updateFilters('condition', cond)}
                  className={`text-left text-xs font-semibold px-3 py-1.5 rounded-lg transition-smooth ${condition === cond ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Price Range</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => updateFilters('minPrice', e.target.value)}
                placeholder="Min"
                className="w-full text-center px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-hidden focus:bg-white focus:border-primary"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => updateFilters('maxPrice', e.target.value)}
                placeholder="Max"
                className="w-full text-center px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-hidden focus:bg-white focus:border-primary"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Listings Section */}
      <main className="flex-1 flex flex-col gap-6 text-left">
        {/* Search bar and mobile filter trigger */}
        <div className="flex gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => updateFilters('query', e.target.value)}
              placeholder="Search textbooks, laptops, electronics..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-hidden shadow-xs focus:border-primary focus:ring-2 focus:ring-primary/10 transition-smooth"
            />
            <Search className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
          </form>

          {/* Mobile Filter Button */}
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden p-3 bg-white border border-gray-200 rounded-2xl text-gray-600 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-smooth"
          >
            <SlidersHorizontal size={20} />
          </button>

          {/* Sort Menu */}
          <select
            value={sortBy}
            onChange={(e) => updateFilters('sortBy', e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-semibold outline-hidden shadow-xs cursor-pointer focus:border-primary"
          >
            <option value="recent">Recently Added</option>
            <option value="popular">Popular (Most Viewed)</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </div>

        {/* Mobile Filters Drawer Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/40 lg:hidden" onClick={() => setShowMobileFilters(false)}>
            <div 
              className="w-80 h-full bg-white p-6 flex flex-col gap-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h3 className="font-black text-sm text-gray-800">Filters</h3>
                <button 
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-gray-400 hover:text-primary"
                >
                  Reset All
                </button>
              </div>

              {/* Mobile Categories */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</h4>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto no-scrollbar">
                  <button
                    onClick={() => updateFilters('category', '')}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${!category ? 'bg-blue-50 border-primary/20 text-primary' : 'bg-gray-50 border-gray-100 text-gray-600'}`}
                  >
                    All
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => updateFilters('category', cat)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${category === cat ? 'bg-blue-50 border-primary/20 text-primary' : 'bg-gray-50 border-gray-100 text-gray-600'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Condition */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Condition</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateFilters('condition', '')}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${!condition ? 'bg-blue-50 border-primary/20 text-primary' : 'bg-gray-50 border-gray-100 text-gray-600'}`}
                  >
                    Any
                  </button>
                  {CONDITIONS.map((cond) => (
                    <button
                      key={cond}
                      onClick={() => updateFilters('condition', cond)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${condition === cond ? 'bg-blue-50 border-primary/20 text-primary' : 'bg-gray-50 border-gray-100 text-gray-600'}`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Price */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price Range</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => updateFilters('minPrice', e.target.value)}
                    placeholder="Min"
                    className="w-full text-center px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-hidden focus:bg-white focus:border-primary"
                  />
                  <span className="text-gray-400 text-xs">-</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => updateFilters('maxPrice', e.target.value)}
                    placeholder="Max"
                    className="w-full text-center px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-hidden focus:bg-white focus:border-primary"
                  />
                </div>
              </div>

              <button 
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3.5 bg-primary text-white font-bold text-sm rounded-xl mt-auto shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white border border-gray-100 h-64 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  disabled={page === 0}
                  onClick={() => updateFilters('page', String(page - 1))}
                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-xs font-bold text-gray-600 rounded-lg shadow-2xs transition-smooth"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-gray-500">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => updateFilters('page', String(page + 1))}
                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-xs font-bold text-gray-600 rounded-lg shadow-2xs transition-smooth"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center bg-white border border-gray-100 rounded-2xl p-8 shadow-xs">
            <Tag size={40} className="mx-auto text-gray-300 stroke-1 mb-4" />
            <h3 className="font-bold text-gray-800 mb-1">No Listings Found</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">No listings match your search criteria. Try removing some filters or updating your query.</p>
          </div>
        )}
      </main>

      {/* 3. Trending Shelf (Right side - Desktop only) */}
      <aside className="w-80 shrink-0 hidden xl:flex flex-col gap-6 text-left">
        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs">
          <h3 className="font-black text-sm text-gray-800 flex items-center gap-2 mb-6 border-b border-gray-50 pb-3">
            <TrendingUp size={16} className="text-indigo-500" />
            <span>Trending Listings</span>
          </h3>

          <div className="flex flex-col gap-4">
            {trendingLoading ? (
              [1, 2].map(n => (
                <div key={n} className="flex gap-3 animate-pulse">
                  <div className="w-16 h-12 bg-gray-100 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : trending.length > 0 ? (
              trending.map((item) => (
                <Link 
                  key={item.id}
                  to={`/products/${item.id}`}
                  className="flex gap-3 group border-b border-gray-50 pb-3 last:border-0 last:pb-0 cursor-pointer"
                >
                  <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    {item.images && item.images.length > 0 ? (
                      <img 
                        src={item.images[0]} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-50 text-blue-300 flex items-center justify-center">
                        <Tag size={14} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <h4 className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-primary">₹{item.price}</span>
                      <span className="text-gray-400 font-semibold">{item.category}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-xs text-gray-400 text-center py-4 font-medium">
                No items trending yet
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Dashboard;
