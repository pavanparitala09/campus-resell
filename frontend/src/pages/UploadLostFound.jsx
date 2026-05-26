import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, RefreshCw, ChevronLeft, MapPin } from 'lucide-react';
import api from '../api';

const UploadLostFound = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    location: '',
  });

  // Image Upload States
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.title.trim()) return setError('Title is required');
    if (!formData.description.trim()) return setError('Description is required');
    if (!formData.type) return setError('Type (Lost or Found) is required');
    if (!formData.location.trim()) return setError('Location description is required');

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('type', formData.type);
      data.append('location', formData.location.trim());

      if (imageFiles.length > 0) {
        imageFiles.forEach(file => {
          data.append('images', file);
        });
      }

      await api.post('/api/lost-found', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/lost-found');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit report. Verify image formats.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 text-left">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-primary mb-6">
        <ChevronLeft size={16} />
        <span>Back</span>
      </button>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-2">Report Lost & Found Item</h2>
        <p className="text-xs text-gray-400 mb-8">List items you lost or found on campus so other students can get in touch.</p>

        {error && (
          <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl mb-6 border border-rose-100 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">Item Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Blue Nike Bottle / Brown Leather Wallet"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary outline-hidden transition-smooth"
              required
            />
          </div>

          {/* Type & Location */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Report Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden cursor-pointer focus:bg-white focus:border-primary"
                required
              >
                <option value="">Select Type</option>
                <option value="LOST">I Lost This Item</option>
                <option value="FOUND">I Found This Item</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Location Tag (Free Text)</label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Science Library, 2nd Floor study room"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary outline-hidden transition-smooth"
                  required
                />
                <MapPin className="absolute left-3 top-3.5 text-gray-400" size={16} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">Details Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="6"
              placeholder="Give specific details: brand, color, keyrings, stickers, custom marks. Do NOT post high-security details (like wallet card numbers) publicly so you can verify the owner privately."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary outline-hidden transition-smooth"
              required
            ></textarea>
          </div>

          {/* Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500">Helper Photos</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-smooth"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

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
            <span className="text-[10px] text-gray-400 font-semibold mt-1">Images help students identify lost items faster. Max 10MB per file.</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-smooth flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {loading && <RefreshCw className="animate-spin" size={16} />}
            <span>Submit Report</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadLostFound;
