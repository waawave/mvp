import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface PhotographerWaitlistModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const PhotographerWaitlistModal: React.FC<PhotographerWaitlistModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    location: '',
    url: '' // Changed from portfolio_url to url to match API
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const normalizeUrl = (url: string): string => {
    if (!url.trim()) return '';
    
    const trimmedUrl = url.trim();
    
    // If it already has a protocol, return as is
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    
    // If it starts with www. or looks like a domain, add https://
    if (trimmedUrl.startsWith('www.') || trimmedUrl.includes('.')) {
      return `https://${trimmedUrl}`;
    }
    
    // Otherwise return as is (let the user decide)
    return trimmedUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!acceptTerms) {
      setError('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare the data for the API - only include url if it's not empty
      const submitData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        location: formData.location
      };

      // Only include url if it's provided (optional field)
      // Normalize the URL before sending
      if (formData.url.trim()) {
        submitData.url = normalizeUrl(formData.url);
      }

      const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to join waitlist');
      }

      const responseData = await response.json();
      console.log('Waitlist submission successful:', responseData);
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('Waitlist submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to join waitlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSurferRedirect = () => {
    onClose();
    // This would trigger the surfer signup modal
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're on the list!</h2>
          <p className="text-gray-600">We'll be in touch soon with next steps.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden">
      {/* Desktop Layout - Side by Side */}
      <div className="hidden md:flex h-full">
        {/* Left Half - Abstract Sea Water Image with Text */}
        <div className="w-1/2 relative overflow-hidden">
          <img
            src="https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg"
            alt="Abstract ocean water"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Back Button */}
          <button
            onClick={onClose}
            className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors z-10"
          >
            <ArrowLeft size={24} />
          </button>

          {/* Text Content */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 text-center">
            <div className="max-w-md space-y-6">
              <p className="text-lg leading-relaxed">
                To ensure the best experience for our early community and keep the platform running smoothly, we're inviting photographers gradually.
              </p>
              <p className="text-lg leading-relaxed">
                Leave your details — we'll personally get in touch as soon as we're ready to bring you on board.
              </p>
            </div>
            
            {/* Waawave logo at bottom */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
              <h1 className="text-3xl font-bold text-white">waawave</h1>
            </div>
          </div>
        </div>

        {/* Right Half - Waitlist Form */}
        <div className="w-1/2 flex items-center justify-center p-8 overflow-hidden">
          <div className="w-full max-w-sm">
            {/* Form Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Join our Waitlist</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name and Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Where you live.
                </p>
              </div>

              {/* Portfolio URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portfolio URL <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="www.your-portfolio.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can enter URLs like: www.example.com, example.com, or https://example.com
                </p>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="acceptTerms" className="text-xs text-gray-600">
                  I accept the{' '}
                  <a href="/terms" target="_blank" className="text-primary hover:text-primary-dark underline">
                    Terms of Service
                  </a>{' '}
                  and the{' '}
                  <a href="/privacy" target="_blank" className="text-primary hover:text-primary-dark underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">
                  {error}
                </div>
              )}

              {/* Join Waitlist Button */}
              <button
                type="submit"
                disabled={loading || !acceptTerms}
                className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Joining...' : 'Join the Waitlist'}
              </button>

              {/* I'm not a photographer Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSurferRedirect}
                  className="text-primary hover:text-primary-dark underline text-sm"
                >
                  I'm not a photographer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Vertical Scroll */}
      <div className="md:hidden h-full overflow-y-auto">
        {/* First Section - Image with Text (Full Screen) */}
        <div className="h-screen relative flex items-center justify-center">
          <img
            src="https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg"
            alt="Abstract ocean water"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Back Button */}
          <button
            onClick={onClose}
            className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors z-10"
          >
            <ArrowLeft size={24} />
          </button>

          {/* Content */}
          <div className="relative z-10 text-center text-white px-6">
            <h1 className="text-3xl font-bold mb-8">waawave</h1>
            <div className="space-y-6 mb-12">
              <p className="text-lg leading-relaxed">
                To ensure the best experience for our early community and keep the platform running smoothly, we're inviting photographers gradually.
              </p>
              <p className="text-lg leading-relaxed">
                Leave your details — we'll personally get in touch as soon as we're ready to bring you on board.
              </p>
            </div>
            
            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="animate-bounce">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Second Section - Form (Full Screen) */}
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Join our Waitlist</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name and Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Lisboa, Portugal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your city or region where you primarily shoot
                </p>
              </div>

              {/* Portfolio URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portfolio URL <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="www.your-portfolio.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can enter URLs like: www.example.com, example.com, or https://example.com
                </p>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="acceptTermsMobile"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="acceptTermsMobile" className="text-xs text-gray-600">
                  I accept the{' '}
                  <a href="/terms" target="_blank" className="text-primary hover:text-primary-dark underline">
                    Terms of Service
                  </a>{' '}
                  and the{' '}
                  <a href="/privacy" target="_blank" className="text-primary hover:text-primary-dark underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">
                  {error}
                </div>
              )}

              {/* Join Waitlist Button */}
              <button
                type="submit"
                disabled={loading || !acceptTerms}
                className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Joining...' : 'Join the Waitlist'}
              </button>

              {/* I'm not a photographer Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSurferRedirect}
                  className="text-primary hover:text-primary-dark underline text-sm"
                >
                  I'm not a photographer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotographerWaitlistModal;