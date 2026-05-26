import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShoppingCart, Shield, Sparkles, MessageCircle } from 'lucide-react';
import api from '../api';
import ProductCard from '../components/ProductCard';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get('/api/products/recommendations?limit=3');
        setTrending(res.data);
      } catch (err) {
        console.error("Failed to load trending products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-0 -z-10 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>

      {/* Hero Banner Panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-primary border border-blue-100 rounded-full text-xs font-bold w-fit mb-6 animate-bounce">
            <Sparkles size={14} />
            <span>Campus Resell Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-6">
            Buy and Sell <br />
            <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
              Within Your Campus
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 mb-8 max-w-md">
            A trusted marketplace exclusively for college students. Save money, recycle resources, and trade safely with fellow students using college email verification.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            {user ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-smooth flex items-center gap-2"
              >
                <span>Enter Dashboard</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <Link 
                  to="/auth"
                  className="px-6 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-smooth flex items-center gap-2"
                >
                  <span>Get Started</span>
                  <ArrowRight size={16} />
                </Link>
                <Link 
                  to="/auth?register=true"
                  className="px-6 py-3.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-full text-sm font-semibold transition-smooth"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Hero Features Cards Panel */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
              <Shield size={20} className="stroke-2" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">Verified Environment</h3>
            <p className="text-xs text-gray-500">Only verified .edu email accounts can list or buy, keeping transactions local and authentic.</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-4 text-left mt-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MessageCircle size={20} className="stroke-2" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">Real-time Messaging</h3>
            <p className="text-xs text-gray-500">Chat with sellers directly in-app to coordinate drop-offs, inspect items, and finalize deals.</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingCart size={20} className="stroke-2" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">Smart Categories</h3>
            <p className="text-xs text-gray-500">Easily find textbooks, electronics, dorm furniture, and clothing suited for student needs.</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-4 text-left mt-4">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Sparkles size={20} className="stroke-2" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">Zero Commission</h3>
            <p className="text-xs text-gray-500">Completely free to use. Cash or in-person trades mean no payment processors or service fees.</p>
          </div>
        </div>
      </section>

      {/* Trending Listings Panel */}
      <section className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div className="text-left">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Trending Campus Listings</h2>
              <p className="text-xs text-gray-500 mt-1">Check out what fellow students are looking at recently</p>
            </div>
            <Link 
              to="/dashboard" 
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All Listings</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-gray-50 aspect-video rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : trending.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trending.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 font-medium">
              No listings posted yet on campus. Be the first!
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} CampusResell Portal. Built for college campus marketplaces. Direct trades in-person only.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
