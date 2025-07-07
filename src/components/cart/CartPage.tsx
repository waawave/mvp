import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, CreditCard } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import LoginModal from '../auth/LoginModal';
import UserSelectionPage from '../auth/UserSelectionPage';
import ForgotPasswordModal from '../auth/ForgotPasswordModal';
import EmailConfirmationModal from './EmailConfirmationModal';
import { Photographer } from '../../types';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CartPage: React.FC = () => {
  const { items, removeItem, clearCart, getTotalPrice } = useCart();
  const { user, authToken, setRedirectPath } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserSelectionPage, setShowUserSelectionPage] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showEmailConfirmationModal, setShowEmailConfirmationModal] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      // Store current path for redirect after login
      setRedirectPath('/cart');
      setShowLoginModal(true);
      return;
    }

    // Show email confirmation modal first
    setShowEmailConfirmationModal(true);
  };

  const handleEmailConfirmed = async () => {
    setShowEmailConfirmationModal(false);
    
    try {
      setLoading(true);
      setError(null);

      // Get photographer ID from the first item (all items should be from the same photographer)
      const photographerId = items[0].session.photographer.id;
      
      // Fetch photographer's Stripe account ID
      console.log('=== FETCHING PHOTOGRAPHER STRIPE ACCOUNT ===');
      console.log('Photographer ID:', photographerId);
      
      const photographerResponse = await fetch(`https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/explorephotographers/${photographerId}`);
      
      if (!photographerResponse.ok) {
        throw new Error('Failed to fetch photographer details');
      }
      
      const photographerData: Photographer = await photographerResponse.json();
      console.log('Photographer Data:', photographerData);
      
      if (!photographerData.stripe_account_id) {
        throw new Error('Photographer has not set up their payment account');
      }

      // Calculate total price and application fee
      const totalPrice = getTotalPrice();
      const applicationFeeAmount = Math.round(totalPrice * 0.2 * 100); // 20% in cents
      
      console.log('=== STRIPE CONNECT CALCULATION ===');
      console.log('Total Price (EUR):', totalPrice);
      console.log('Application Fee (20% in cents):', applicationFeeAmount);
      console.log('Photographer Stripe Account ID:', photographerData.stripe_account_id);

      // Format line items according to Stripe's structure
      const lineItems = items.map(item => {
        // Create product description with session details
        const locationName = item.session.location?.name || item.session.surfschool?.name;
        const sessionDate = new Date(item.session.session_date).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long'
        });
        const photographerName = `${item.session.photographer.first_name} ${item.session.photographer.last_name}`;
        
        const description = `${sessionDate}, ${locationName}, ${photographerName}`;
        
        return {
          price_data: {
            currency: "eur",
            product_data: {
              name: item.media.type === 'video' ? 'Video' : 'Photo',
              description: description
            },
            unit_amount: Math.round(item.price * 100) // Convert euros to cents
          },
          quantity: 1
        };
      });

      // Create checkout session using Stripe Connect
      console.log('=== CREATING STRIPE CONNECT CHECKOUT SESSION ===');
      const checkoutRequestBody = {
        line_items: lineItems,
        success_url: `${window.location.origin}/checkout/success?success=true`,
        cancel_url: `${window.location.origin}/cart?canceled=true`,
        // Stripe Connect specific parameters
        payment_intent_data: {
          application_fee_amount: applicationFeeAmount,
          transfer_data: {
            destination: photographerData.stripe_account_id
          }
        }
      };
      
      console.log('Checkout Request Body:', JSON.stringify(checkoutRequestBody, null, 2));

      const checkoutResponse = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:UQuTJ3vx/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(checkoutRequestBody)
      });

      console.log('=== CHECKOUT RESPONSE ===');
      console.log('Status:', checkoutResponse.status);
      console.log('Status Text:', checkoutResponse.statusText);

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json().catch(() => ({}));
        console.error('Checkout Response Error:', errorData);
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const checkoutResponseData = await checkoutResponse.json();
      console.log('Checkout Response Data:', checkoutResponseData);
      
      const { sessionId } = checkoutResponseData;
      console.log('Checkout Session ID:', sessionId);

      // Create temporary order before redirecting to Stripe
      const surferName = `${user.first_name} ${user.last_name}`;
      const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      const tempOrderData = {
        media_id: items.map(item => item.media.id),
        total_price: totalPrice,
        currency: "EUR",
        reference: "", // Will be generated by backend or updated later
        surfer_name: surferName,
        checkout_session_id: sessionId,
        platform_fee: 0.2, // 20% for platform
        photographer_fee: 0.8, // 80% for photographer
        photographer_id: photographerId, // Add photographer ID for reference
        date_of_placement: currentDate
      };

      console.log('=== CREATING TEMPORARY ORDER ===');
      console.log('Temporary Order Data:', tempOrderData);

      const tempOrderResponse = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/surfer/temp_order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(tempOrderData)
      });

      if (!tempOrderResponse.ok) {
        const errorData = await tempOrderResponse.json().catch(() => ({}));
        console.error('Failed to create temporary order:', errorData);
        throw new Error(errorData.message || 'Failed to create temporary order');
      }

      const tempOrderResult = await tempOrderResponse.json();
      console.log('Temporary order created successfully:', tempOrderResult);

      // Now redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      console.log('=== REDIRECTING TO STRIPE CHECKOUT ===');
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

    } catch (err) {
      console.error('=== CHECKOUT ERROR ===');
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  // Check for success/cancel parameters
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
      clearCart();
      // Success redirect is now handled by the success_url in Stripe checkout
      // Users will be redirected to /checkout/success?success=true
    }
  }, [clearCart]);

  const handleForgotPassword = () => {
    setShowLoginModal(false);
    setShowForgotPasswordModal(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPasswordModal(false);
    setShowLoginModal(true);
  };

  const handleSignUpFromLogin = () => {
    setShowLoginModal(false);
    setShowUserSelectionPage(true);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Link to="/sessions" className="inline-flex items-center text-gray-600 hover:text-primary-dark mb-6">
              <ArrowLeft size={20} className="mr-2" />
              Back to Sessions
            </Link>
            
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                Browse sessions to find amazing surf photos and videos to purchase.
              </p>
              <Link
                to="/sessions"
                className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors inline-flex items-center"
              >
                Browse Sessions
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/sessions" className="inline-flex items-center text-gray-600 hover:text-primary-dark mb-6">
            <ArrowLeft size={20} className="mr-2" />
            Back to Sessions
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                    <button
                      onClick={clearCart}
                      className="text-gray-500 hover:text-red-600 transition-colors text-sm"
                    >
                      Clear all
                    </button>
                  </div>
                  <p className="text-gray-600 mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div key={item.id} className="p-6 flex items-start space-x-4">
                      {/* Media Preview */}
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {item.media.type === 'video' ? (
                          <video
                            src={item.media.preview_url}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <img
                            src={item.media.preview_url}
                            alt={item.media.media_name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {item.media.type === 'video' ? 'Video' : 'Photo'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {item.session.location?.name || item.session.surfschool?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              by {item.session.photographer.first_name} {item.session.photographer.last_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.media.natural_width} x {item.media.natural_height}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-medium text-gray-900">€{item.price}</p>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-800 transition-colors mt-2"
                              title="Remove from cart"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                    <span className="text-gray-900">€{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing fee</span>
                    <span className="text-gray-900">€0.00</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">€{getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark disabled:bg-primary disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      <span>Proceed to Checkout</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  Secure payment powered by Stripe
                </p>

                {/* Payment Info */}
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">Payment Information</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Enter payment details securely with Stripe</li>
                      <li>• Stripe may remember your details for future purchases</li>
                      <li>• All transactions are encrypted and secure</li>
                      <li>• Photographer receives 80% • Platform receives 20%</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false);
            // The redirect will be handled automatically by the AuthContext
          }}
          onForgotPassword={handleForgotPassword}
          onSignUp={handleSignUpFromLogin}
        />
      )}

      {/* User Selection Page */}
      {showUserSelectionPage && (
        <UserSelectionPage
          onClose={() => setShowUserSelectionPage(false)}
        />
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPasswordModal(false)}
          onBackToLogin={handleBackToLogin}
        />
      )}

      {/* Email Confirmation Modal */}
      <EmailConfirmationModal
        show={showEmailConfirmationModal}
        onClose={() => setShowEmailConfirmationModal(false)}
        onConfirm={handleEmailConfirmed}
      />
    </div>
  );
};

export default CartPage;