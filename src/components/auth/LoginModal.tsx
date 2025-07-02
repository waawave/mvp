import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AuthResponse } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (data: AuthResponse) => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess, onForgotPassword, onSignUp }) => {
  const { login } = useAuth();
  const [userType, setUserType] = useState<'surfer' | 'photographer'>('surfer');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const endpoint = userType === 'photographer' 
        ? 'https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/auth/photographer-login'
        : 'https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/auth/surfer-login';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      await login(data, userType === 'photographer');
      onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Log In</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark disabled:bg-primary disabled:opacity-50 transition-colors"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Forgot Password Link */}
        <div className="mt-4 text-center">
          <button
            onClick={onForgotPassword}
            className="text-primary hover:text-primary-dark text-sm transition-colors"
          >
            Forgot your password?
          </button>
        </div>

        {/* Sign Up Link - Made entire div clickable */}
        <div 
          onClick={onSignUp}
          className="mt-4 text-center rounded-lg border border-gray-300 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <span className="text-gray-600 text-sm">You don't have an account? </span>
          <span className="text-primary hover:text-primary-dark text-sm font-medium transition-colors">
            Sign up
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;