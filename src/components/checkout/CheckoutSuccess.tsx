import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const isSuccess = searchParams.get('success') === 'true';

  // Redirect to home if not a success page
  useEffect(() => {
    if (!isSuccess) {
      navigate('/');
    }
  }, [isSuccess, navigate]);

  // Clear cart on successful checkout
  useEffect(() => {
    if (isSuccess) {
      clearCart();
    }
  }, [isSuccess, clearCart]);

  const handleGoToMyMedia = () => {
    navigate('/surfer/media');
  };

  if (!isSuccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-12 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Order Completed Successfully!
              </h1>
              <p className="text-green-100 text-lg">
                Your surf photos and videos are ready for download
              </p>
            </div>

            {/* Content */}
            <div className="px-8 py-12">
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-3 text-gray-700">
                    <span className="text-lg font-medium">High-resolution files are ready</span>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
                    Your purchased photos and videos are now available in your profile. 
                    You can download the high-resolution files anytime from your My Media section.
                  </p>
                </div>

                {/* Features list 
                <div className="bg-blue-50 rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold text-blue-900 mb-4">What's included:</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Full resolution photos and videos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>No watermarks or compression</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Lifetime access to your purchases</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Download as many times as you want</span>
                    </div>
                  </div>
                </div> */}

                {/* Call to action */}
                <div className="pt-6">
                  <button
                    onClick={handleGoToMyMedia}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3 group"
                  >
                    <span>Go to My Media</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                  {/*
                  <p className="text-sm text-gray-500 mt-3">
                    You can also access your media anytime from your profile menu
                  </p> */}
                </div>
              </div>
            </div>
          </div>

          {/* Additional info */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Need help? Contact us at{' '}
              <a href="mailto:support@waawave.com" className="text-blue-600 hover:text-blue-700 underline">
                support@waawave.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;