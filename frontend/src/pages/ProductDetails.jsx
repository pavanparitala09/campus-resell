import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Eye, Tag, AlertTriangle, Edit3, Trash2, Calendar, ChevronLeft, ChevronRight, User } from 'lucide-react';
import api from '../api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/products/${id}`);
        setProduct(res.data);
        setActiveImageIdx(0);
        
        // Fetch similar products in the same category
        const similarRes = await api.get('/api/products/recommendations', {
          params: { currentProductId: id, category: res.data.category }
        });
        setSimilar(similarRes.data);
      } catch (err) {
        console.error("Failed to load product details", err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-gray-500">Loading listing details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800">Listing Not Found</h2>
        <p className="text-xs text-gray-500 mt-2">The listing you are looking for may have been sold or removed.</p>
        <Link to="/dashboard" className="inline-block mt-6 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold shadow-xs">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isSeller = user && product.seller && product.seller.id === user.id;

  const handleStartChat = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    try {
      const res = await api.post('/api/chats', { productId: product.id });
      navigate(`/inbox?chatId=${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to initialize conversation thread");
    }
  };

  const handleDeleteListing = async () => {
    if (window.confirm("Are you sure you want to permanently delete this resale listing?")) {
      try {
        await api.delete(`/api/products/${product.id}`);
        navigate('/dashboard');
      } catch (err) {
        alert("Failed to delete listing");
      }
    }
  };

  const handleMarkAsSold = async () => {
    try {
      await api.patch(`/api/products/${product.id}/status`, { status: 'SOLD' });
      setProduct({ ...product, status: 'SOLD' });
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleMarkAsAvailable = async () => {
    try {
      await api.patch(`/api/products/${product.id}/status`, { status: 'AVAILABLE' });
      setProduct({ ...product, status: 'AVAILABLE' });
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    setReportLoading(true);
    try {
      await api.post('/api/reports', {
        reportedProductId: product.id,
        reason: reportReason.trim()
      });
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
        setReportReason('');
      }, 2000);
    } catch (err) {
      alert("Failed to submit report");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Back to dashboard breadcrumb */}
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-primary mb-6">
        <ChevronLeft size={16} />
        <span>Back to Explore</span>
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-video sm:aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[activeImageIdx]} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-blue-300">
                <Tag size={64} className="stroke-1" />
                <span className="text-xs font-semibold mt-2">No Images Provided</span>
              </div>
            )}

            {/* Slider Navigation arrows */}
            {product.images && product.images.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImageIdx(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-xs text-gray-700 transition-smooth"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => setActiveImageIdx(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-xs text-gray-700 transition-smooth"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails Row */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 ${activeImageIdx === idx ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Listing Details & Actions */}
        <div className="flex flex-col text-left justify-between py-2">
          <div>
            {/* Category & Status */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold tracking-widest text-primary uppercase bg-blue-50 px-2.5 py-1 rounded-md">
                {product.category}
              </span>
              <div className="flex gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  product.condition === 'New' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  product.condition === 'Like New' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                  product.condition === 'Good' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                  'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {product.condition}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  product.status === 'AVAILABLE' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-gray-800 leading-tight mb-4">
              {product.title}
            </h1>

            {/* Price */}
            <p className="text-3xl font-black text-primary mb-6">
              ₹{product.price}
            </p>

            {/* Meta stats row */}
            <div className="flex items-center gap-4 text-xs text-gray-400 font-semibold border-y border-gray-50 py-3 mb-6">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                <span>Posted {new Date(product.createdAt).toLocaleDateString()}</span>
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} />
                <span>{product.viewCount} Views</span>
              </span>
            </div>

            {/* Seller profile panel */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {product.seller?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-gray-800">{product.seller?.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{product.seller?.collegeEmail}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-200/50 px-2 py-0.5 rounded-md">
                Seller
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {isSeller ? (
              <>
                <div className="flex gap-3">
                  <Link
                    to={`/sell?editId=${product.id}`}
                    className="flex-1 py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-bold shadow-xs transition-smooth flex items-center justify-center gap-2"
                  >
                    <Edit3 size={16} />
                    <span>Edit Listing</span>
                  </Link>
                  <button
                    onClick={handleDeleteListing}
                    className="p-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-smooth"
                    title="Delete Listing"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {product.status === 'AVAILABLE' ? (
                  <button
                    onClick={handleMarkAsSold}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-xs transition-smooth"
                  >
                    Mark as Sold
                  </button>
                ) : (
                  <button
                    onClick={handleMarkAsAvailable}
                    className="w-full py-3.5 bg-gray-500 hover:bg-gray-600 text-white rounded-xl text-sm font-bold shadow-xs transition-smooth"
                  >
                    Re-list as Available
                  </button>
                )}
              </>
            ) : (
              <>
                {product.status === 'AVAILABLE' ? (
                  <button
                    onClick={handleStartChat}
                    className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-smooth flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle size={18} />
                    <span>Chat with Seller</span>
                  </button>
                ) : (
                  <div className="w-full py-3 text-center bg-gray-100 text-gray-400 font-bold text-sm rounded-xl">
                    This item has been sold
                  </div>
                )}

                {/* Report Action link */}
                <button
                  onClick={() => setShowReportModal(true)}
                  className="inline-flex items-center justify-center gap-1 text-xs font-bold text-rose-500 hover:underline mx-auto mt-2"
                >
                  <AlertTriangle size={14} />
                  <span>Report Inappropriate Content</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description Shelf */}
      <section className="mt-8 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h3 className="font-bold text-gray-800 text-base mb-4">Description</h3>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      </section>

      {/* Similar Items Shelf */}
      <section className="mt-12">
        <h3 className="font-black text-xl text-gray-800 mb-6">Similar Listings</h3>
        {similar.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar.map(item => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400 text-xs font-medium bg-white rounded-3xl border border-gray-100 p-6">
            No other listings available in this category
          </div>
        )}
      </section>

      {/* Report Modal overlay */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl relative">
            <h3 className="font-black text-lg text-gray-800 mb-2">Report Listing</h3>
            <p className="text-xs text-gray-400 mb-6">Please specify why you are flagging this listing. Admins will review the item shortly.</p>

            {reportSuccess ? (
              <div className="py-6 text-center text-emerald-600 font-bold text-sm">
                Thank you. Report submitted successfully!
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="flex flex-col gap-4 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">Reason for Report</label>
                  <textarea
                    rows="4"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Inappropriate images, scam/spam, counterfeit, duplicate..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary outline-hidden transition-smooth"
                    required
                  ></textarea>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reportLoading}
                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-400 text-white rounded-xl font-bold text-xs shadow-xs"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
