import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

const LoginRegister = () => {
  const { login, sendOtp, verifyOtp, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Registration / Login Inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Sync state with URL queries (e.g. ?register=true)
  useEffect(() => {
    if (searchParams.get('register') === 'true') {
      setIsRegister(true);
    } else {
      setIsRegister(false);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Quick validation checks
    if (isRegister) {
      if (!formData.name.trim()) return setError('Name is required');
      if (!formData.email.trim().toLowerCase().endsWith('.edu.in')) {
        return setError('Registration requires a valid college email address ending in .edu.in');
      }
    }
    if (!formData.email.trim()) return setError('Email is required');
    if (!formData.password) return setError('Password is required');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      if (isRegister) {
        // Register directly
        await register(formData.name.trim(), formData.email.trim(), formData.password);
        // Auto-login after registration
        await login(formData.email.trim(), formData.password);
        navigate('/dashboard');
      } else {
        // Login directly
        await login(formData.email.trim(), formData.password);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative">
      {/* Dynamic BG blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-60"></div>

      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-xl p-8 relative overflow-hidden glass">
        {/* Toggle selectors */}
        <div className="flex border-b border-gray-100 mb-8">
          <button
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 pb-4 text-sm font-bold transition-smooth ${!isRegister ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 pb-4 text-sm font-bold transition-smooth ${isRegister ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Display Error Panel */}
        {error && (
          <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl mb-6 border border-rose-100 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="flex flex-col gap-5 text-left">
          {/* Name Field (Register Only) */}
          {isRegister && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary outline-hidden transition-smooth"
                  required
                />
                <User className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">College Email Address</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="yourname@college.edu"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary outline-hidden transition-smooth"
                required
              />
              <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
            </div>
            {isRegister && (
              <span className="text-[10px] text-gray-400 font-medium">Must end in a valid .edu.in domain</span>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">Password</label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary outline-hidden transition-smooth"
                required
              />
              <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-xl font-bold text-sm shadow-md transition-smooth flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={16} />
            ) : (
              <>
                <span>{isRegister ? 'Verify Email' : 'Sign In'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>


    </div>
  );
};

export default LoginRegister;
