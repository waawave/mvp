import React, { useState, useEffect } from 'react';
import { Cookie, X, Shield, Eye, BarChart3 } from 'lucide-react';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
    
    // Here you would typically initialize analytics, tracking, etc.
    console.log('Cookies accepted - Initialize tracking services');
  };

  const handleRefuse = () => {
    localStorage.setItem('cookieConsent', 'refused');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
    
    // Here you would disable non-essential cookies
    console.log('Cookies refused - Only essential cookies will be used');
  };

  const handleClose = () => {
    // Treat close as refuse
    handleRefuse();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-20 z-40" />
      
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-75 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 border-opacity-30 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 bg-opacity-60 px-6 py-4 border-b border-gray-100 border-opacity-30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <Cookie className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Cookie Preferences</h3>
                    <p className="text-sm text-gray-600">We value your privacy</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We use cookies to enhance your browsing experience, provide personalized content, 
                  and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                </p>

                {/* Cookie Details Toggle */}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>

                {/* Detailed Cookie Information */}
                {showDetails && (
                  <div className="bg-gray-50 bg-opacity-50 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Essential Cookies */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          <h4 className="font-semibold text-gray-900">Essential</h4>
                        </div>
                        <p className="text-xs text-gray-600">
                          Required for basic site functionality, security, and user authentication.
                        </p>
                        <div className="text-xs text-green-600 font-medium">Always Active</div>
                      </div>

                      {/* Analytics Cookies */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-blue-600" />
                          <h4 className="font-semibold text-gray-900">Analytics</h4>
                        </div>
                        <p className="text-xs text-gray-600">
                          Help us understand how visitors interact with our website.
                        </p>
                        <div className="text-xs text-gray-500">Optional</div>
                      </div>

                      {/* Marketing Cookies */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4 text-purple-600" />
                          <h4 className="font-semibold text-gray-900">Marketing</h4>
                        </div>
                        <p className="text-xs text-gray-600">
                          Used to deliver personalized advertisements and content.
                        </p>
                        <div className="text-xs text-gray-500">Optional</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200 border-opacity-30">
                      <p className="text-xs text-gray-500">
                        You can change your preferences at any time in our{' '}
                        <a href="/privacy" className="text-primary hover:text-primary-dark underline">
                          Privacy Policy
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={handleAccept}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm"
                >
                  Accept All Cookies
                </button>
                <button
                  onClick={handleRefuse}
                  className="flex-1 bg-gray-100 bg-opacity-60 hover:bg-gray-200 hover:bg-opacity-75 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Only Essential Cookies
                </button>
              </div>

              {/* Footer Links */}
              <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-gray-100 border-opacity-30">
                <a
                  href="/privacy"
                  className="text-xs text-gray-500 hover:text-primary transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms"
                  className="text-xs text-gray-500 hover:text-primary transition-colors"
                >
                  Terms of Service
                </a>
                <a
                  href="/cookies"
                  className="text-xs text-gray-500 hover:text-primary transition-colors"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieBanner;