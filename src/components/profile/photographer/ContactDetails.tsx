import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

const ContactDetails: React.FC = () => {
  const { authToken } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/mydetails', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch contact details');
        }

        const data = await response.json();
        setEmail(data.email);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchContactDetails();
  }, [authToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/contactinfo', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Failed to update contact details');
      }

      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Contact Details</h2>
      <div className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              Contact details updated successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark disabled:bg-primary disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactDetails;