import React from 'react';
import { Mail, Phone, AlertCircle } from 'lucide-react';

const CloseAccount: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Close Account</h2>
      
      {/* Partnership Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-2xl">
        <div className="flex items-start space-x-4">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-900">Partnership Cancellation</h3>
            
            <p className="text-blue-800 leading-relaxed">
              Dear partner photographer,
            </p>
            
            <p className="text-blue-800 leading-relaxed">
              If you wish to cancel our partnership please get in contact with us:
            </p>
            
            {/* Contact Information */}
            <div className="space-y-3 mt-6">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <a 
                  href="mailto:hello@waawave.com"
                  className="text-blue-700 hover:text-blue-800 font-medium underline transition-colors"
                >
                  hello@waawave.com
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <a 
                  href="tel:+351818220622"
                  className="text-blue-700 hover:text-blue-800 font-medium underline transition-colors"
                >
                  +351 818 220 622
                </a>
              </div>
            </div>
            
            <p className="text-blue-700 text-sm mt-4">
              We'll be happy to assist you with any questions or concerns regarding your partnership with Waawave.
            </p>
          </div>
        </div>
      </div>
      
      {/* Additional Information */}
      <div className="bg-gray-50 rounded-lg p-6 max-w-2xl">
        <h4 className="font-medium text-gray-900 mb-3">Before contacting us:</h4>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Please include your photographer account details</li>
          <li>• Let us know the reason for partnership cancellation</li>
          <li>• We'll process your request within 2-3 business days</li>
          <li>• Any pending payments will be processed according to our terms</li>
        </ul>
      </div>
    </div>
  );
};

export default CloseAccount;