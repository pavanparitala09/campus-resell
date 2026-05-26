import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Calendar, User, MessageCircle, CheckCircle, Trash2, X, PlusCircle, AlertCircle } from 'lucide-react';
import api from '../api';

const LostFound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('ALL'); // 'ALL', 'LOST', 'FOUND'
  const [showResolved, setShowResolved] = useState(false);
  
  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [activeType, showResolved]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/lost-found', {
        params: {
          query: searchQuery || null,
          type: activeType === 'ALL' ? null : activeType,
          showResolved: showResolved,
        }
      });
      setItems(res.data);
    } catch (err) {
      console.error("Failed to load lost & found reports", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleStartChat = async (itemId) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.post('/api/chats', { lostFoundItemId: itemId });
      setSelectedItem(null);
      navigate(`/inbox?chatId=${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start conversation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleResolved = async (itemId) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/api/lost-found/${itemId}/resolve`);
      setItems(prev => prev.map(item => item.id === itemId ? { ...item, resolved: res.data.resolved, resolvedAt: res.data.resolvedAt } : item));
      setSelectedItem(res.data);
    } catch (err) {
      alert("Failed to toggle status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Are you sure you want to permanently delete this report?")) {
      setActionLoading(true);
      try {
        await api.delete(`/api/lost-found/${itemId}`);
        setItems(prev => prev.filter(item => item.id !== itemId));
        setSelectedItem(null);
      } catch (err) {
        alert("Failed to delete item");
      } finally {
        setActionLoading(false);
      }
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-100 p-6 rounded-3xl shadow-xs">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Lost & Found Portal</h2>
          <p className="text-xs text-gray-400 mt-1">Help fellow students recover their belongings or report found items on campus.</p>
        </div>
        <Link 
          to="/lost-found/upload"
          className="px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-full text-xs font-bold shadow-xs hover:shadow-md transition-smooth flex items-center justify-center gap-1.5 shrink-0"
        >
          <PlusCircle size={16} />
          <span>Report Item</span>
        </Link>
      </div>

      {/* Search & Filter Options */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by description or location..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs outline-hidden shadow-xs focus:border-primary transition-smooth"
          />
          <button type="submit" className="absolute left-3 top-3.5 text-gray-400 hover:text-primary">
            <Search size={16} />
          </button>
        </form>

        {/* Filter Type */}
        <div className="flex bg-white border border-gray-100 rounded-2xl p-1 shadow-xs shrink-0 justify-around">
          <button
            onClick={() => setActiveType('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth ${activeType === 'ALL' ? 'bg-primary text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
          >
            All Reports
          </button>
          <button
            onClick={() => setActiveType('LOST')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth ${activeType === 'LOST' ? 'bg-rose-500 text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Lost
          </button>
          <button
            onClick={() => setActiveType('FOUND')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth ${activeType === 'FOUND' ? 'bg-blue-500 text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Found
          </button>
        </div>

        {/* Show Resolved Toggle */}
        <button
          onClick={() => setShowResolved(!showResolved)}
          className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-smooth shrink-0 cursor-pointer ${showResolved ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
        >
          {showResolved ? 'Showing Claimed' : 'Show Claimed'}
        </button>
      </div>

      {/* Main Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white border border-gray-100 h-64 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white border border-gray-100 rounded-3xl overflow-hidden glass-card transition-smooth cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="aspect-video bg-gray-50 relative overflow-hidden border-b border-gray-50">
                  {item.images && item.images.length > 0 ? (
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-blue-300">
                      <AlertCircle size={36} className="stroke-1 opacity-70 animate-pulse-slow" />
                      <span className="text-[10px] font-bold mt-1 text-gray-400">No Image Uploaded</span>
                    </div>
                  )}

                  {/* Floating badge */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {item.resolved ? (
                      <span className="px-2.5 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-bold">
                        Claimed
                      </span>
                    ) : (
                      <span className={`px-2.5 py-0.5 text-white rounded-full text-[10px] font-bold ${item.type === 'LOST' ? 'bg-rose-500' : 'bg-blue-500'}`}>
                        {item.type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 line-clamp-1 mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{item.description}</p>
                </div>
              </div>

              {/* Meta stats Footer */}
              <div className="px-5 pb-4 pt-3 border-t border-gray-50 flex items-center justify-between text-gray-400 text-[10px] font-semibold">
                <span className="flex items-center gap-1 max-w-[120px]">
                  <MapPin size={12} className="text-rose-400 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  <Calendar size={12} />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white border border-gray-100 rounded-3xl p-8 max-w-lg mx-auto w-full">
          <AlertCircle size={40} className="mx-auto text-gray-300 stroke-1 mb-4" />
          <h3 className="font-bold text-gray-800 text-sm mb-1">No Items Listed</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">There are currently no matching items listed under this filter.</p>
        </div>
      )}

      {/* Item Detail Modal overlay */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-fade-in" onClick={() => setSelectedItem(null)}>
          <div 
            className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-smooth">
              <X size={18} />
            </button>

            {/* Title / Header */}
            <div className="flex gap-2 items-center mb-4">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white ${selectedItem.resolved ? 'bg-emerald-500' : selectedItem.type === 'LOST' ? 'bg-rose-500' : 'bg-blue-500'}`}>
                {selectedItem.resolved ? 'Claimed' : selectedItem.type}
              </span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Lost & Found Item</span>
            </div>

            <h3 className="font-black text-xl text-gray-800 leading-tight mb-4">{selectedItem.title}</h3>

            {/* Images Slider (if any) */}
            {selectedItem.images && selectedItem.images.length > 0 && (
              <div className="aspect-video bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 mb-6">
                <img src={selectedItem.images[0]} alt="detail" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Location & Date */}
            <div className="grid grid-cols-2 gap-4 border-y border-gray-50 py-3 mb-6 text-xs text-gray-600 font-semibold">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-rose-400 shrink-0" />
                <span className="truncate" title={selectedItem.location}>Location: {selectedItem.location}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <Calendar size={14} className="text-gray-400" />
                <span>Date: {new Date(selectedItem.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Details Description */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Item Details</h4>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-100">{selectedItem.description}</p>
            </div>

            {/* Reporter Profile */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between mb-8 text-xs font-semibold text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {selectedItem.reporter?.name?.charAt(0).toUpperCase()}
                </div>
                <span>Reported by {selectedItem.reporter?.name}</span>
              </div>
              <span className="text-[10px] text-gray-400">{selectedItem.reporter?.collegeEmail}</span>
            </div>

            {/* Auto Delete Warning banner for Claimed items */}
            {selectedItem.resolved && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-[10px] leading-relaxed font-semibold rounded-xl mb-6 border border-emerald-100 flex items-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" />
                <span>This report was marked as claimed. It will be automatically deleted from the portal after 7 days.</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              {user && selectedItem.reporter?.id === user.id ? (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleToggleResolved(selectedItem.id)}
                    className={`flex-1 py-3 text-center rounded-xl text-xs font-bold shadow-xs transition-smooth ${
                      selectedItem.resolved 
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' 
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {selectedItem.resolved ? 'Unmark Claimed' : 'Mark as Claimed'}
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleDeleteItem(selectedItem.id)}
                    className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl transition-smooth"
                    title="Delete Report"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              ) : (
                <button
                  disabled={actionLoading}
                  onClick={() => handleStartChat(selectedItem.id)}
                  className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-smooth flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  <span>Contact Reporter</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostFound;
