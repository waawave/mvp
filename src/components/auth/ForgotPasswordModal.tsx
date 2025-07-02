import React, { useState } from 'react';
import { X, Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onBackToLogin: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'surfer' | 'photographer'>('surfer');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Special handling for photographers - show contact message instead of sending email
      if (userType === 'photographer') {
        // Simulate a brief loading state for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSuccess(true);
        setLoading(false);
        return;
      }

      // For surfers, proceed with the normal email reset flow
      const endpoint = 'https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/auth/surfer-forgot-password';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send reset email');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            
            {userType === 'photographer' ? (
              // Custom message for photographers
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Your Waawave Team</h2>
                <p className="text-gray-600 mb-6">
                  Forgot your password? Get in touch with your Waawave team agent at{' '}
                  <a 
                    href="mailto:hello@waawave.com" 
                    className="text-primary hover:text-primary-dark underline font-medium"
                  >
                    hello@waawave.com
                  </a>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Our team will help you reset your password and get back to uploading your amazing surf photography.
                </p>
              </>
            ) : (
              // Original message for surfers
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h2>
                <p className="text-gray-600 mb-6">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </>
            )}
            
            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                Close
              </button>
              <button
                onClick={onBackToLogin}
                className="w-full text-primary hover:text-primary-dark transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={onBackToLogin}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold">Reset Password</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-600 mb-6 text-center">
          {userType === 'photographer' 
            ? 'Select your account type to get help with password reset.'
            : 'Enter your email address and we\'ll send you a link to reset your password.'
          }
        </p>

        {/* User Type Selection */}
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-md ${
              userType === 'surfer'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setUserType('surfer')}
          >
            Surfer
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-md ${
              userType === 'photographer'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setUserType('photographer')}
          >
            Photographer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {userType === 'surfer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {userType === 'photographer' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-800">
                <p className="font-medium mb-2">Photographer Password Reset</p>
                <p className="text-sm">
                  For security reasons, photographer password resets are handled personally by our team. 
                  Click below to get your contact information.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (userType === 'surfer' && !email.trim())}
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark disabled:bg-primary disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : userType === 'photographer' ? 'Get Contact Info' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onBackToLogin}
            className="text-primary hover:text-primary-dark text-sm transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;