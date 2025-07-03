import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface PayoutDetails {
  account_id: string;
  bank_account?: {
    last4: string;
    bank_name: string;
    currency: string;
    routing_number?: string;
  };
  payout_schedule: {
    interval: string;
    delay_days: number;
  };
  balance: {
    available: number;
    pending: number;
  };
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
}

const PayoutDetails: React.FC = () => {
  const { authToken } = useAuth();
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  useEffect(() => {
    fetchPayoutDetails();
  }, [authToken]);

  const fetchPayoutDetails = async () => {
    try {
      const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/stripe-status', {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPayoutDetails(data);
      } else if (response.status === 404) {
        // No Stripe account exists yet
        setPayoutDetails(null);
      } else {
        throw new Error('Failed to fetch payout details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    setError(null);
    await fetchPayoutDetails();
    setRefreshing(false);
  };

  const openStripeDashboard = () => {
    // Redirect directly to Stripe dashboard
    window.location.href = 'https://dashboard.stripe.com/dashboard';
  };

  const startOnboarding = async () => {
    try {
      setOnboardingLoading(true);
      setError(null);

      const requestBody = {
        refresh_url: `${window.location.origin}/stripe-onboarding`,
        return_url: `${window.location.origin}/stripe-return`
      };

      const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/stripe-onboarding', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to start onboarding');
      }

      const data = await response.json();
      
      // Redirect to Stripe onboarding
      window.location.href = data.onboarding_url;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start onboarding');
    } finally {
      setOnboardingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if onboarding is incomplete
  const isOnboardingIncomplete = !payoutDetails || 
    !payoutDetails.charges_enabled || 
    !payoutDetails.details_submitted || 
    !payoutDetails.payouts_enabled;

  if (isOnboardingIncomplete) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Payout Details</h2>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Onboarding Required Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-yellow-800 mb-4">
                Please finish your Stripe onboarding process to have access to Payout Details
              </h3>
              <p className="text-yellow-700 mb-6 leading-relaxed">
                To start receiving payments from your surf photography sales, you need to complete your Stripe account setup. 
                This secure process ensures you can receive your earnings (80% of each sale) directly to your bank account.
              </p>
              
              <button
                onClick={startOnboarding}
                disabled={onboardingLoading}
                className="bg-yellow-600 text-white px-6 py-3 rounded-md hover:bg-yellow-700 disabled:bg-yellow-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {onboardingLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    {/* <ExternalLink size={20} /> */} 
                    <span>Complete Stripe Onboarding</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* What happens after onboarding */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-800 mb-3">After completing onboarding, you'll have access to:</h4>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• Real-time payout status and balance information</li>
            <li>• Bank account details and payout schedule</li>
            <li>• Direct access to your Stripe dashboard</li>
            <li>• Automatic payouts from your sales (80% of each sale)</li>
          </ul>
        </div>
      </div>
    );
  }

  // If onboarding is complete, show the full payout details
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payout Details</h2>
        <div className="flex space-x-3">
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openStripeDashboard}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
          >
            {/*<ExternalLink size={16} />*/}
            <span>Stripe Dashboard</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Account Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Account Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${payoutDetails.charges_enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <p className="text-sm text-gray-600">Charges</p>
              <p className="font-medium">{payoutDetails.charges_enabled ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${payoutDetails.payouts_enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <p className="text-sm text-gray-600">Payouts</p>
              <p className="font-medium">{payoutDetails.payouts_enabled ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${payoutDetails.details_submitted ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <div>
              <p className="text-sm text-gray-600">Details</p>
              <p className="font-medium">{payoutDetails.details_submitted ? 'Complete' : 'Pending'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account Info */}
      {payoutDetails.bank_account && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Bank Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Bank</p>
              <p className="font-medium">{payoutDetails.bank_account.bank_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account</p>
              <p className="font-medium">****{payoutDetails.bank_account.last4}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Currency</p>
              <p className="font-medium">{payoutDetails.bank_account.currency.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payout Schedule</p>
              <p className="font-medium">
                {payoutDetails.payout_schedule.interval} 
                {payoutDetails.payout_schedule.delay_days > 0 && 
                  ` (${payoutDetails.payout_schedule.delay_days} day delay)`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Balance */}
      {payoutDetails.balance && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Current Balance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Available for Payout</p>
              <p className="text-xl font-bold text-green-600">€{payoutDetails.balance.available.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold text-yellow-600">€{payoutDetails.balance.pending.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutDetails;