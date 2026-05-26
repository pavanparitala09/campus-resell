import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Settings, LogOut, Trash2, Edit3, CheckCircle, RotateCcw } from 'lucide-react';
import api from '../api';

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'listings';

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Settings Form States
  const [profileName, setProfileName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.profilePic || '');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    if (activeTab === 'listings') {
      loadMyListings();
    }
  }, [activeTab]);

  const loadMyListings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/products/my');
      setListings(res.data);
    } catch (err) {
      console.error("Failed to load own listings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'SOLD' : 'AVAILABLE';
    try {
      await api.patch(`/api/products/${id}/status`, { status: nextStatus });
      setListings(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
    } catch (err) {
      alert("Failed to toggle status");
    }
  };

  const handleDeleteListing = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this listing?")) {
      try {
        await api.delete(`/api/products/${id}`);
        setListings(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        alert("Failed to delete listing");
      }
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    setSettingsLoading(true);
    setSettingsSuccess(false);
    try {
      await updateProfile(profileName.trim(), avatarUrl.trim());
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 2000);
    } catch (err) {
      alert("Failed to update profile settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  const switchTab = (tab) => {
    setSearchParams(new URLSearchParams({ tab }));
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 text-left">
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left self-start sm:self-center">
          <div className="w-16 h-16 rounded-full bg-primary text-white font-black flex items-center justify-center text-2xl shadow-sm uppercase">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800 leading-tight">{user?.name}</h2>
            <p className="text-xs text-gray-400 font-medium">{user?.collegeEmail}</p>
            <span className="inline-block text-[9px] font-bold text-primary bg-blue-50 px-2 py-0.5 rounded-sm mt-1 uppercase tracking-wider">
              {user?.role} Account
            </span>
          </div>
        </div>

        <button
          onClick={() => { logout(); navigate('/'); }}
          className="w-full sm:w-auto px-4 py-2 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-50 transition-smooth flex items-center justify-center gap-1.5"
        >
          <LogOut size={14} />
          <span>Log Out</span>
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex gap-4 border-b border-gray-100 mb-8">
        <button
          onClick={() => switchTab('listings')}
          className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-smooth ${activeTab === 'listings' ? 'text-primary border-primary' : 'text-gray-400 border-transparent'}`}
        >
          <ShoppingBag size={14} />
          <span>My Listings ({listings.length})</span>
        </button>
        <button
          onClick={() => switchTab('settings')}
          className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-smooth ${activeTab === 'settings' ? 'text-primary border-primary' : 'text-gray-400 border-transparent'}`}
        >
          <Settings size={14} />
          <span>Settings</span>
        </button>
      </div>

      {/* 1. Tab: Listings */}
      {activeTab === 'listings' && (
        <div>
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading listings list...</div>
          ) : listings.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {listings.map((product) => (
                <div 
                  key={product.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-smooth flex gap-4"
                >
                  <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-blue-50 text-blue-300 flex items-center justify-center">
                        <ShoppingBag size={20} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between text-left">
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="text-xs font-black text-gray-800 truncate pr-2">{product.title}</h4>
                        <span className="text-xs font-bold text-primary shrink-0">₹{product.price}</span>
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold text-white mb-2 ${product.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                        {product.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                      <div className="flex gap-2">
                        <Link
                          to={`/sell?editId=${product.id}`}
                          className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={12} />
                        </Link>
                        <button
                          onClick={() => handleDeleteListing(product.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleToggleStatus(product.id, product.status)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-smooth ${
                          product.status === 'AVAILABLE' 
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100' 
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100'
                        }`}
                      >
                        {product.status === 'AVAILABLE' ? 'Mark Sold' : 'Re-list'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white border border-gray-100 rounded-3xl p-8">
              <ShoppingBag size={36} className="mx-auto text-gray-300 stroke-1 mb-3" />
              <h3 className="font-bold text-gray-800 text-sm mb-1">No Listings Posted</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">You haven't posted any items for sale yet.</p>
              <Link to="/sell" className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-xs">
                Post Your First Listing
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 2. Tab: Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-md bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
          <h3 className="font-black text-sm text-gray-800 mb-6">Account Settings</h3>

          {settingsSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl mb-4 border border-emerald-100">
              Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleUpdateSettings} className="flex flex-col gap-5 text-left">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Full Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-primary outline-hidden transition-smooth"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Avatar Image URL (Optional)</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-primary outline-hidden transition-smooth"
              />
            </div>

            <button
              type="submit"
              disabled={settingsLoading}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-xl font-bold text-xs shadow-xs transition-smooth"
            >
              {settingsLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
