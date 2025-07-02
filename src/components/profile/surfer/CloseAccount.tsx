import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const CloseAccount: React.FC = () => {
  const { authToken, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError('Please enter your password to confirm account deletion');
      return;
    }

    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/surfer/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete account');
      }

      // Account successfully deleted - logout and redirect
      logout();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting your account');
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setPassword('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Close Account</h2>
      
      {/* Warning Section */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Warning</h3>
            <p className="text-red-700 leading-relaxed">
              Closing your account is irreversible. It deletes all of your media and stats.
            </p>
          </div>
        </div>
      </div>

      {/* Account Deletion Form */}
      <div className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-red-500 focus:ring-red-500 transition-colors"
              required
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Please enter your password to confirm account deletion
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Confirmation Step */}
          {showConfirmation && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Final Confirmation</h4>
                  <p className="text-yellow-700 text-sm">
                    Are you absolutely sure you want to delete your account? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            {showConfirmation ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium disabled:bg-red-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>Yes, Delete Account</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={loading || !password.trim()}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium disabled:bg-red-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Trash2 size={16} />
                <span>Delete Account</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Additional Information */}
      <div className="bg-gray-50 rounded-lg p-4 max-w-2xl">
        <h4 className="font-medium text-gray-900 mb-2">What happens when you delete your account:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Your profile and personal information will be permanently deleted</li>
          <li>• All your purchased photos and videos will be removed</li>
          <li>• Your purchase history will be deleted</li>
          <li>• This action cannot be reversed</li>
        </ul>
      </div>
    </div>
  );
};

export default CloseAccount;