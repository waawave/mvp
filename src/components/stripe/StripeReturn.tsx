import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Upload } from 'lucide-react';

const StripeReturn: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Main Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Finished your Stripe onboarding?
          </h1>
          
          <p className="text-lg text-gray-600 mb-12 leading-relaxed">
            Once you are finished with your Stripe Onboarding, you can start uploading your sessions and selling your photos.
          </p>

          {/* Upload Session Button */}
          <Link
            to="/upload-session"
            className="inline-flex items-center space-x-3 bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            {/*<Upload size={24} /> */}
            <span>Upload Your Session Now</span> 
          </Link>

          {/* Additional Info */}
         {/* <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-blue-800">
              <p className="font-medium mb-2">What's next?</p>
              <ul className="text-sm space-y-1 text-left max-w-md mx-auto">
                <li>• Upload your surf photos and videos</li>
                <li>• Set your pricing (you keep 80% of each sale)</li>
                <li>• Share your sessions with the surf community</li>
                <li>• Start earning from your photography</li>
              </ul>
            </div>
          </div>*/}
        </div>
      </div>
    </div>
  );
};

export default StripeReturn;