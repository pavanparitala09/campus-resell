import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, X, RefreshCw, Tag, ChevronLeft } from 'lucide-react';
import api from '../api';

const CATEGORIES = ['Textbooks', 'Electronics', 'Dorm Gear', 'Clothing', 'Sports', 'Tickets', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const SellItem = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
  });

  // Image Upload States
  const [imageFiles, setImageFiles] = useState([]); // File objects
  const [imagePreviews, setImagePreviews] = useState([]); // Data URLs for previews
  const [existingImages, setExistingImages] = useState([]); // URLs from backend (Edit Mode only)

  // Load listing if in Edit Mode
  useEffect(() => {
    if (!editId) {
      // Clear form when switching to create mode
      setFormData({ title: '', description: '', price: '', category: '', condition: '' });
      setImageFiles([]);
      setImagePreviews([]);
      setExistingImages([]);
      return;
    }

    const loadExistingProduct = async () => {
      setPageLoading(true);
      try {
        const res = await api.get(`/api/products/${editId}`);
        setFormData({
          title: res.data.title,
          description: res.data.description,
          price: res.data.price,
          category: res.data.category,
          condition: res.data.condition,
        });
        setExistingImages(res.data.images || []);
      } catch (err) {
        console.error("Failed to load listing for editing", err);
        setError("Could not load the specified listing");
      } finally {
        setPageLoading(false);
      }
    };

    loadExistingProduct();
  }, [editId]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Add to files state
    setImageFiles(prev => [...prev, ...files]);

    // Generate previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (idx) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (url) => {
    setExistingImages(prev => prev.filter(imgUrl => imgUrl !== url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.title.trim()) return setError('Title is required');
    if (!formData.description.trim()) return setError('Description is required');
    if (!formData.price || parseFloat(formData.price) < 0) return setError('Invalid price');
    if (!formData.category) return setError('Category is required');
    if (!formData.condition) return setError('Condition is required');

    setLoading(true);

    try {
      // Compile Multipart Form Data
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('condition', formData.condition);

      // Append new image files
      if (imageFiles.length > 0) {
        imageFiles.forEach(file => {
          data.append('images', file);
        });
      }

      let res;
      if (editId) {
        // Append remaining existing images to preserve them
        if (existingImages.length > 0) {
          existingImages.forEach(url => {
            data.append('existingImages', url);
          });
        }
        
        res = await api.put(`/api/products/${editId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/api/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate(`/products/${res.data.id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save product listing. Verify size limits.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-gray-500">Loading editor details...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 text-left">
      {editId && (
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-primary mb-6">
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
      )}

      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-2">
          {editId ? 'Edit Your Listing' : 'List an Item for Resell'}
        </h2>
        <p className="text-xs text-gray-400 mb-8">Fill in the details below. Remember, campus trade-offs are strictly in-person.</p>

        {error && (
          <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl mb-6 border border-rose-100 text-left animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">Listing Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Organic Chemistry Textbook (12th Edition)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary outline-hidden transition-smooth"
              required
            />
          </div>

          {/* Category & Condition Row */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden cursor-pointer focus:bg-white focus:border-primary"
                required
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden cursor-pointer focus:bg-white focus:border-primary"
                required
              >
                <option value="">Select Condition</option>
                {CONDITIONS.map(cond => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary outline-hidden transition-smooth"
              required
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="6"
              placeholder="Provide a detailed description of the item. Include information like usage time, wear-and-tear, size, or preferred meeting spots on campus."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary outline-hidden transition-smooth"
              required
            ></textarea>
          </div>

          {/* Image Uploader Panel */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500">Product Images</label>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {/* Existing Images (Edit mode only) */}
              {existingImages.map((url, idx) => (
                <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                  <img src={url} alt="existing" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-smooth"
                  >
                    <X size={12} />
                  </button>
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/40 text-[8px] font-bold text-white rounded-sm">Existing</span>
                </div>
              ))}

              {/* Newly added file previews */}
              {imagePreviews.map((preview, idx) => (
                <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-smooth"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Upload trigger block */}
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-blue-50/10 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-primary transition-smooth cursor-pointer">
                <Upload size={20} className="stroke-2" />
                <span className="text-[10px] font-bold">Upload</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <span className="text-[10px] text-gray-400 font-semibold mt-1">First image will be the primary cover image. Max size 10MB per file.</span>
          </div>

          {/* Submit Control */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-smooth flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {loading && <RefreshCw className="animate-spin" size={16} />}
            <span>{editId ? 'Save Changes' : 'Publish Listing'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellItem;
