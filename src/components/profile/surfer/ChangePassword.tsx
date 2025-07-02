import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

const ChangePassword: React.FC = () => {
  const { authToken } = useAuth();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if (formData.new_password !== formData.confirm_new_password) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/surfer/password', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update password');
      }

      setSuccess(true);
      setFormData({
        current_password: '',
        new_password: '',
        confirm_new_password: ''
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Change Password</h2>
      <div className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              value={formData.current_password}
              onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              value={formData.new_password}
              onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Repeat New Password
            </label>
            <input
              type="password"
              value={formData.confirm_new_password}
              onChange={(e) => setFormData({ ...formData, confirm_new_password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              Password updated successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark disabled:bg-primary disabled:opacity-50 transition-colors"
          >
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;