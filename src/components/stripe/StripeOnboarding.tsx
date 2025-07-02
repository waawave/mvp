import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface StripeOnboardingProps {
  onComplete?: () => void;
  redirectPath?: string;
}

interface OnboardingResponse {
  account_id: string;
  onboarding_url: string;
}

interface AccountStatusResponse {
  account_id: string;
  charges_enabled: boolean;
  details_submitted: boolean;
  payouts_enabled: boolean;
  requirements: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
    pending_verification: string[];
  };
}

const StripeOnboarding: React.FC<StripeOnboardingProps> = ({ 
  onComplete, 
  redirectPath = '/upload-session' 
}) => {
  const { authToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<AccountStatusResponse | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Check existing Stripe account status on component mount
  useEffect(() => {
    checkStripeAccountStatus();
  }, []);

  const checkStripeAccountStatus = async () => {
    try {
      setCheckingStatus(true);
      setError(null);

      console.log('=== CHECKING STRIPE STATUS ===');
      console.log('Auth Token:', authToken ? 'Present' : 'Missing');
      console.log('API URL:', 'https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/stripe-status');

      const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/stripe-status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response Status:', response.status);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('Response Data:', data);
        setAccountStatus(data);
        
        // If account is fully set up, call onComplete
        if (data.charges_enabled && data.details_submitted && data.payouts_enabled) {
          onComplete?.();
        }
      } else if (response.status === 404) {
        console.log('No Stripe account exists yet');
        setAccountStatus(null);
      } else {
        const errorText = await response.text();
        console.log('Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (err) {
      console.error('Error checking Stripe account status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check account status');
    } finally {
      setCheckingStatus(false);
    }
  };

  const startOnboarding = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== STARTING STRIPE ONBOARDING ===');
      console.log('Auth Token:', authToken ? 'Present' : 'Missing');
      console.log('API URL:', 'https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/stripe-onboarding');

      const requestBody = {
        refresh_url: `https://www.waawave.com/stripe-onboarding`,
        return_url: `https://www.waawave.com/stripe-return`
      };

      console.log('Request Body:', requestBody);

      // Create Stripe Connect account and get onboarding URL
      const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/stripe-onboarding', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response Status:', response.status);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error Response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        setDebugInfo({
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: 'https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/stripe-onboarding',
          method: 'POST',
          headers: {
            'Authorization': authToken ? 'Bearer [PRESENT]' : 'Missing',
            'Content-Type': 'application/json'
          },
          body: requestBody
        });
        
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: OnboardingResponse = await response.json();
      console.log('Success Response:', data);
      
      // Store the account_id in the database
      await updateStripeId(data.account_id);
      
      // Redirect to Stripe onboarding
      window.location.href = data.onboarding_url;
      
    } catch (err) {
      console.error('Onboarding Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start onboarding');
    } finally {
      setLoading(false);
    }
  };

  const updateStripeId = async (stripeId: string) => {
    try {
      console.log('=== UPDATING STRIPE ID ===');
      console.log('Stripe ID:', stripeId);
      
      const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/stripe_id', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stripe_id: stripeId
        })
      });

      console.log('Update Stripe ID Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Update Stripe ID Error:', errorText);
        throw new Error('Failed to update Stripe ID');
      }
      
      console.log('Stripe ID updated successfully');
    } catch (err) {
      console.error('Error updating Stripe ID:', err);
      // Don't throw here as the main onboarding should continue
    }
  };

  const getStatusMessage = () => {
    if (!accountStatus) return null;

    const { charges_enabled, details_submitted, payouts_enabled, requirements } = accountStatus;
    
    if (charges_enabled && details_submitted && payouts_enabled) {
      return {
        type: 'success' as const,
        title: 'Account Verified',
        message: 'Your Stripe account is fully set up and ready to receive payments!'
      };
    }

    if (requirements.pending_verification.length > 0) {
      return {
        type: 'info' as const,
        title: 'Verification Pending',
        message: 'Your account information is being verified. This usually takes 1-2 business days.'
      };
    }

    return {
      type: 'warning' as const,
      title: 'Setup Incomplete',
      message: 'Please complete your Stripe account setup to start receiving payments.'
    };
  };

  // Check for success parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  const isSuccess = urlParams.get('success') === 'true';

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusMessage = getStatusMessage();
  const isAccountReady = accountStatus?.charges_enabled && accountStatus?.details_submitted && accountStatus?.payouts_enabled;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/sessions" className="inline-flex items-center text-gray-600 hover:text-primary-dark mb-6">
              <ArrowLeft size={20} className="mr-2" />
              Back to Sessions
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Payment Setup</h1>
            <p className="text-gray-600 mt-2">
              Set up your Stripe account to receive payments from photo and video sales
            </p>
          </div>

          {/* Debug Information */}
          {debugInfo && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h3 className="text-red-800 font-medium mb-4">Debug Information</h3>
              <div className="text-sm text-red-700 space-y-2">
                <div><strong>Status:</strong> {debugInfo.status} {debugInfo.statusText}</div>
                <div><strong>URL:</strong> {debugInfo.url}</div>
                <div><strong>Method:</strong> {debugInfo.method}</div>
                <div><strong>Headers:</strong> {JSON.stringify(debugInfo.headers, null, 2)}</div>
                <div><strong>Body:</strong> {JSON.stringify(debugInfo.body, null, 2)}</div>
                <div><strong>Error:</strong> {debugInfo.error}</div>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 text-sm">
                  <strong>Possible Solutions:</strong>
                </p>
                <ul className="text-yellow-700 text-sm mt-2 space-y-1">
                  <li>• Check if the API endpoint exists on your backend</li>
                  <li>• Verify your authentication token is valid</li>
                  <li>• Ensure the Stripe Connect integration is implemented on the backend</li>
                  <li>• Check if the photographer has the correct permissions</li>
                </ul>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Welcome back!
                  </h3>
                  <p className="text-green-700">
                    Let's check your account status to see if you're ready to start earning.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Account Status */}
          {statusMessage && (
            <div className={`border rounded-lg p-6 mb-6 ${
              statusMessage.type === 'success' ? 'bg-green-50 border-green-200' :
              statusMessage.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start space-x-3">
                {statusMessage.type === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                    statusMessage.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                )}
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    statusMessage.type === 'success' ? 'text-green-800' :
                    statusMessage.type === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {statusMessage.title}
                  </h3>
                  <p className={`${
                    statusMessage.type === 'success' ? 'text-green-700' :
                    statusMessage.type === 'warning' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {statusMessage.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            {!accountStatus ? (
              // No account exists - show initial setup
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm4.64-1.96l3.54 3.54c.78.78 2.05.78 2.83 0l7.07-7.07c.78-.78.78-2.05 0-2.83-.78-.78-2.05-.78-2.83 0L12 9.34 8.75 6.09c-.78-.78-2.05-.78-2.83 0-.78.78-.78 2.05 0 2.83l.72.72z"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Start Earning from Your Photography
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    To receive payments for your surf photos and videos, you'll need to set up a Stripe account. 
                    This secure process takes just a few minutes and ensures you get paid quickly and safely.
                  </p>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Secure Setup</h3>
                      <p className="text-gray-600 text-sm">
                        Connect your bank account securely through Stripe's encrypted platform
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Earn 80%</h3>
                      <p className="text-gray-600 text-sm">
                        Keep 80% of every sale while Waawave handles payments and platform costs
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Fast Payouts</h3>
                      <p className="text-gray-600 text-sm">
                        Receive payments directly to your bank account within 2-7 business days
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={startOnboarding}
                  disabled={loading}
                  className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark disabled:bg-primary disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Setting up...</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink size={20} />
                      <span>Set Up Payments with Stripe</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  You'll be redirected to Stripe's secure platform to complete the setup process.
                  This is required to comply with financial regulations and ensure secure payments.
                </p>
              </>
            ) : isAccountReady ? (
              // Account is ready
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    You're All Set!
                  </h2>
                  <p className="text-gray-600">
                    Your payment account is verified and ready to receive earnings from your surf photography.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Account Status</span>
                    <span className="text-green-600 font-medium">Verified</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Charges Enabled</span>
                    <span className="text-green-600 font-medium">Yes</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Payouts Enabled</span>
                    <span className="text-green-600 font-medium">Yes</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Your Share</span>
                    <span className="text-primary font-medium">80% of each sale</span>
                  </div>
                </div>

                <Link
                  to={redirectPath}
                  className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Continue to Upload Session</span>
                </Link>
              </>
            ) : (
              // Account exists but needs completion
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Complete Your Setup
                  </h2>
                  <p className="text-gray-600">
                    Your Stripe account needs additional information before you can start receiving payments.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Details Submitted</span>
                    <span className={`font-medium ${accountStatus.details_submitted ? 'text-green-600' : 'text-yellow-600'}`}>
                      {accountStatus.details_submitted ? 'Complete' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Charges Enabled</span>
                    <span className={`font-medium ${accountStatus.charges_enabled ? 'text-green-600' : 'text-yellow-600'}`}>
                      {accountStatus.charges_enabled ? 'Yes' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Payouts Enabled</span>
                    <span className={`font-medium ${accountStatus.payouts_enabled ? 'text-green-600' : 'text-yellow-600'}`}>
                      {accountStatus.payouts_enabled ? 'Yes' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={checkStripeAccountStatus}
                    disabled={checkingStatus}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {checkingStatus ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                        <span>Checking...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={20} />
                        <span>Refresh Status</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={startOnboarding}
                    disabled={loading}
                    className="flex-1 bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark disabled:bg-primary disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink size={20} />
                        <span>Continue Setup</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeOnboarding;