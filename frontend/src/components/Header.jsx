import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Plus, LogOut, User as UserIcon, ShieldAlert, Check } from 'lucide-react';
import api from '../api';

const Header = () => {
  const { user, logout, unreadNotifications, setUnreadNotifications, fetchUnreadCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Sync search input with URL search params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('query');
    if (q) setSearchQuery(q);
  }, [location.search]);

  // Handle outside clicks to close dropdown menus
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/dashboard');
    }
  };

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Error loading notifications list", err);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      loadNotifications();
    }
  };

  const handleNotificationRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotifications(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo Panel */}
        <Link to="/" className="flex items-center gap-2 font-black text-xl text-primary tracking-tight shrink-0">
          <span className="bg-primary text-white p-1.5 rounded-lg flex items-center justify-center font-bold text-base shadow-sm">CR</span>
          <span className="hidden sm:inline bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">CampusResell</span>
        </Link>

        {/* Search Bar Panel (Disabled on non-dashboard paths for simplicity, or redirects) */}
        {user && (
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg relative hidden md:block">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items by title, description or category..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm outline-hidden focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-smooth"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </form>
        )}

        {/* Action Controls Panel */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {user ? (
            <>
              {/* Sell Link */}
              <Link 
                to="/sell"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-full text-sm font-semibold shadow-xs hover:shadow-md transition-smooth"
              >
                <Plus size={16} />
                <span>Sell Item</span>
              </Link>

              {/* Notification Indicator Bell */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={toggleNotifications}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-smooth relative"
                >
                  <Bell size={20} />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold ring-2 ring-white">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50">
                    <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <span className="font-bold text-sm text-gray-800">Notifications</span>
                      {unreadNotifications > 0 && (
                        <button 
                          onClick={handleMarkAllRead}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 no-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            className={`p-3 flex items-start justify-between gap-2 text-xs transition-smooth ${notif.read ? 'bg-white' : 'bg-blue-50/40'}`}
                          >
                            <div className="flex-1">
                              <p className={`text-gray-800 ${notif.read ? 'font-normal' : 'font-semibold'}`}>
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-gray-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {!notif.read && (
                              <button 
                                onClick={(e) => handleNotificationRead(notif.id, e)}
                                className="p-1 hover:bg-blue-100 text-primary rounded-full transition-smooth"
                                title="Mark read"
                              >
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-gray-400 text-xs font-medium">
                          No notifications yet
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Controls */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 focus:outline-hidden"
                >
                  {user.profilePic ? (
                    <img 
                      src={user.profilePic} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50 py-1 divide-y divide-gray-50">
                    <div className="px-4 py-3">
                      <p className="font-bold text-sm text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.collegeEmail}</p>
                    </div>
                    
                    <div className="py-1">
                      <Link 
                        to="/profile" 
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-smooth"
                      >
                        <UserIcon size={16} className="text-gray-400" />
                        <span>My Profile</span>
                      </Link>

                      {user.role === 'ADMIN' && (
                        <Link 
                          to="/admin" 
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50/50 font-bold transition-smooth"
                        >
                          <ShieldAlert size={16} className="text-amber-500" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                    </div>

                    <div className="py-1">
                      <button 
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                          navigate('/');
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50/50 font-medium transition-smooth"
                      >
                        <LogOut size={16} className="text-rose-400" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/auth"
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full transition-smooth"
              >
                Sign In
              </Link>
              <Link 
                to="/auth?register=true"
                className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-full shadow-xs transition-smooth"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
