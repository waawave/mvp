import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { SignUpFormData } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface SignUpModalProps {
  onClose: () => void;
  onSuccess: (data: any) => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ onClose, onSuccess }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!acceptTerms) {
      setError('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const signUpData: SignUpFormData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password
    };

    try {
      setLoading(true);
      const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/auth/surfer-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signUpData)
      });

      if (!response.ok) {
        throw new Error('Sign up failed');
      }

      const data = await response.json();
      await login(data, false); // false = not a photographer
      onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 h-screen w-screen bg-white z-50 overflow-hidden">
      {/* Desktop Layout - Side by Side */}
      <div className="hidden md:flex h-full">
        {/* Left Half - Surf Image */}
        <div className="w-1/2 relative overflow-hidden">
          <img
            src="https://images.pexels.com/photos/390051/surfer-wave-sunset-the-indian-ocean-390051.jpeg"
            alt="Surfer riding a wave"
            className="w-full h-full object-cover"
          />
          {/* Back Button */}
          <button
            onClick={onClose}
            className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        {/* Right Half - Signup Form */}
        <div className="w-1/2 flex items-center justify-center p-8 max-h-full overflow-y-auto">
          <div className="w-full max-w-sm">
            {/* Logo as Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">waawave</h1>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                    style={{ touchAction: 'manipulation' }}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                    style={{ touchAction: 'manipulation' }}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                  style={{ touchAction: 'manipulation' }}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                  style={{ touchAction: 'manipulation' }}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                  style={{ touchAction: 'manipulation' }}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
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

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={loading || !acceptTerms}
                className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>

              {/* I'm not a Surfer Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-primary hover:text-primary-dark underline text-sm"
                >
                  I'm not a Surfer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Vertical Scroll */}
      <div className="md:hidden h-full max-h-full overflow-y-auto">
        {/* First Section - Image (Full Screen) */}
        <div className="h-screen relative flex items-center justify-center">
          <img
            src="https://images.pexels.com/photos/390051/surfer-wave-sunset-the-indian-ocean-390051.jpeg"
            alt="Surfer riding a wave"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          
          {/* Back Button */}
          <button
            onClick={onClose}
            className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors z-10"
          >
            <ArrowLeft size={24} />
          </button>

          {/* Content */}
          <div className="relative z-10 text-center text-white px-6">
            <h1 className="text-4xl font-bold mb-4">waawave</h1>
            <p className="text-lg mb-8">Join the surf photography community</p>
            
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                    style={{ touchAction: 'manipulation' }}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                    style={{ touchAction: 'manipulation' }}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                  style={{ touchAction: 'manipulation' }}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                  style={{ touchAction: 'manipulation' }}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                  style={{ touchAction: 'manipulation' }}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
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

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={loading || !acceptTerms}
                className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>

              {/* I'm not a Surfer Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-primary hover:text-primary-dark underline text-sm"
                >
                  I'm not a Surfer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;