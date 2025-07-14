import React, { useState } from 'react';
import { Instagram } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PhotographerWaitlistModal from '../auth/PhotographerWaitlistModal';

// Waawave Logo Component
const WaawaveLogo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg width="155" height="17" viewBox="0 0 155 17" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M15.543 0.957031C16.8576 0.957043 18.0387 1.25213 19.0859 1.84245C20.1109 2.45468 20.9244 3.28578 21.526 4.33529C22.1054 5.3848 22.3951 6.56573 22.3952 7.8776V9.90755C22.3952 10.3885 22.5514 10.7818 22.8633 11.0879C23.1753 11.4159 23.5762 11.5801 24.0664 11.5801C24.5566 11.5801 24.9576 11.4159 25.2695 11.0879C25.5814 10.7818 25.7376 10.3885 25.7376 9.90755V1.28516H31.0859V9.41537C31.0859 10.8148 30.7846 12.0503 30.1829 13.1217C29.5813 14.1931 28.746 15.0242 27.6764 15.6146C26.6068 16.205 25.4034 16.5 24.0664 16.5C22.7294 16.5 21.526 16.205 20.4564 15.6146C19.3868 15.0242 18.5509 14.1932 17.9492 13.1217C17.3476 12.0503 17.0469 10.8148 17.0469 9.41537V7.38607C17.0469 6.94874 16.9023 6.58765 16.6126 6.30339C16.323 6.01914 15.9663 5.87697 15.543 5.87695C15.1196 5.87695 14.763 6.01917 14.4733 6.30339C14.1836 6.58765 14.0391 6.94874 14.0391 7.38607V9.41537C14.039 10.8148 13.7377 12.0503 13.1361 13.1217C12.5344 14.1931 11.6991 15.0242 10.6296 15.6146C9.55998 16.205 8.35649 16.5 7.01953 16.5C5.68256 16.5 4.47909 16.2049 3.40951 15.6146C2.33989 15.0242 1.504 14.1932 0.902344 13.1217C0.300698 12.0503 1.39038e-05 10.8148 0 9.41537V1.28516H5.34831V9.90755C5.34837 10.3884 5.50401 10.7819 5.81576 11.0879C6.12773 11.4159 6.52929 11.5801 7.01953 11.5801C7.50971 11.58 7.91072 11.4159 8.22266 11.0879C8.53453 10.7818 8.69069 10.3885 8.69076 9.90755V7.8776C8.6908 6.56574 8.9915 5.37411 9.5931 4.30273C10.1948 3.25314 11.0082 2.43284 12.0332 1.84245C13.0582 1.2521 14.2283 0.957031 15.543 0.957031Z" fill="currentColor"/>
    <path d="M86.3997 0.957031C87.6758 0.957031 88.8227 1.25205 89.8392 1.84245C90.834 2.45466 91.6231 3.28584 92.207 4.33529C92.7693 5.3848 93.0507 6.56573 93.0508 7.8776V9.90755C93.0508 10.3885 93.2025 10.7818 93.5052 11.0879C93.8079 11.4158 94.1969 11.58 94.6725 11.5801C95.1483 11.5801 95.5377 11.4159 95.8405 11.0879C96.1432 10.7818 96.2949 10.3885 96.2949 9.90755V1.28516H101.486V9.41537C101.486 10.8148 101.194 12.0503 100.61 13.1217C100.026 14.1932 99.2146 15.0242 98.1764 15.6146C97.1383 16.2049 95.9701 16.5 94.6725 16.5C93.3751 16.5 92.2073 16.2048 91.1693 15.6146C90.1311 15.0242 89.3196 14.1932 88.7357 13.1217C88.1517 12.0503 87.86 10.8148 87.86 9.41537V7.38607C87.86 6.94874 87.7193 6.58765 87.4382 6.30339C87.157 6.01917 86.8106 5.87695 86.3997 5.87695C85.989 5.87702 85.6431 6.01926 85.362 6.30339C85.0808 6.58765 84.9401 6.94874 84.9401 7.38607V9.41537C84.9401 10.8148 84.6484 12.0503 84.0645 13.1217C83.4805 14.1932 82.669 15.0242 81.6309 15.6146C80.5928 16.2049 79.4246 16.5 78.127 16.5C76.8295 16.5 75.6617 16.2048 74.6237 15.6146C73.5855 15.0242 72.7741 14.1932 72.1901 13.1217C71.6062 12.0503 71.3145 10.8148 71.3145 9.41537V1.28516H76.5052V9.90755C76.5053 10.3884 76.6564 10.7819 76.959 11.0879C77.2617 11.4158 77.6513 11.58 78.127 11.5801C78.6028 11.5801 78.9921 11.4159 79.2949 11.0879C79.5977 10.7818 79.7493 10.3885 79.7494 9.90755V7.8776C79.7494 6.56578 80.0411 5.37408 80.625 4.30273C81.209 3.25314 81.9986 2.43284 82.9935 1.84245C83.9883 1.25212 85.1238 0.957075 86.3997 0.957031Z" fill="currentColor"/>
    <path d="M130.121 9.39128L133.317 0.957031H138.514L133.834 13.2591C133.425 14.3173 132.909 15.122 132.285 15.6732C131.682 16.2243 130.94 16.5 130.057 16.5C129.175 16.5 128.422 16.2243 127.798 15.6732C127.195 15.122 126.689 14.3173 126.281 13.2591L121.6 0.957031H126.926L130.121 9.39128Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M48.9141 16.043H41.3119C39.8477 16.043 38.5074 15.7038 37.291 15.026C36.0746 14.3483 35.1169 13.4409 34.4186 12.304C33.7204 11.1454 33.3717 9.87729 33.3717 8.5C33.3717 7.12264 33.7204 5.86539 34.4186 4.72852C35.1169 3.56977 36.0746 2.65172 37.291 1.97396C38.5074 1.29619 39.8477 0.957031 41.3119 0.957031H48.9141V16.043ZM41.3119 5.81055C40.8163 5.81055 40.3658 5.93138 39.9603 6.17188C39.5549 6.41236 39.2282 6.74024 38.9805 7.1556C38.7327 7.57097 38.6087 8.01905 38.6087 8.5C38.6087 8.98095 38.7327 9.42903 38.9805 9.8444C39.2282 10.2598 39.5549 10.5876 39.9603 10.8281C40.3658 11.0686 40.8163 11.1895 41.3119 11.1895C41.8074 11.1894 42.258 11.0686 42.6634 10.8281C43.0688 10.5876 43.3955 10.2597 43.6432 9.8444C43.891 9.42904 44.015 8.98094 44.015 8.5C44.015 8.01906 43.891 7.57097 43.6432 7.1556C43.3955 6.74025 43.0688 6.41236 42.6634 6.17188C42.258 5.93138 41.8074 5.81055 41.3119 5.81055Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M66.7428 16.043H59.3639C57.9429 16.043 56.6422 15.7038 55.4616 15.026C54.281 14.3483 53.3516 13.4409 52.6738 12.304C51.9961 11.1453 51.6569 9.87734 51.6569 8.5C51.6569 7.12261 51.9961 5.86541 52.6738 4.72852C53.3516 3.56978 54.281 2.65171 55.4616 1.97396C56.6422 1.29623 57.9429 0.957041 59.3639 0.957031H66.7428V16.043ZM59.3639 5.81055C58.883 5.81056 58.4456 5.93139 58.0521 6.17188C57.6586 6.41236 57.3414 6.74027 57.1009 7.1556C56.8605 7.57093 56.7402 8.0191 56.7402 8.5C56.7402 8.9809 56.8605 9.42907 57.1009 9.8444C57.3414 10.2597 57.6586 10.5876 58.0521 10.8281C58.4456 11.0686 58.883 11.1894 59.3639 11.1895C59.8449 11.1895 60.2822 11.0686 60.6758 10.8281C61.0693 10.5876 61.3865 10.2598 61.627 9.8444C61.8674 9.42905 61.9876 8.98092 61.9876 8.5C61.9876 8.01908 61.8674 7.57095 61.627 7.1556C61.3865 6.74024 61.0693 6.41236 60.6758 6.17188C60.2822 5.93138 59.8449 5.81055 59.3639 5.81055Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M119.314 16.043H111.712C110.247 16.0429 108.907 15.7038 107.691 15.026C106.474 14.3483 105.517 13.4409 104.819 12.304C104.121 11.1453 103.771 9.87736 103.771 8.5C103.771 7.12261 104.121 5.86541 104.819 4.72852C105.517 3.56987 106.474 2.65169 107.691 1.97396C108.907 1.29623 110.247 0.957066 111.712 0.957031H119.314V16.043ZM111.712 5.81055C111.216 5.81058 110.765 5.93142 110.36 6.17188C109.955 6.41235 109.628 6.7403 109.38 7.1556C109.133 7.57094 109.008 8.01909 109.008 8.5C109.008 8.98091 109.133 9.42906 109.38 9.8444C109.628 10.2597 109.955 10.5876 110.36 10.8281C110.765 11.0686 111.216 11.1894 111.712 11.1895C112.207 11.1895 112.658 11.0686 113.063 10.8281C113.469 10.5876 113.795 10.2598 114.043 9.8444C114.291 9.429 114.415 8.98098 114.415 8.5C114.415 8.01902 114.291 7.571 114.043 7.1556C113.795 6.7402 113.469 6.41237 113.063 6.17188C112.658 5.93139 112.207 5.81055 111.712 5.81055Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M147.234 0.5C148.589 0.5 149.824 0.84196 150.939 1.52539C152.054 2.18674 152.929 3.11235 153.563 4.30273C154.197 5.4712 154.514 6.79436 154.514 8.27148V10.0905H144.272C144.407 10.3663 144.574 10.62 144.774 10.8509C145.408 11.5564 146.468 11.9088 147.955 11.9089H153.202V16.043H148.283C146.469 16.043 144.894 15.7122 143.561 15.0508C142.227 14.3673 141.199 13.4301 140.478 12.2396C139.778 11.0271 139.428 9.64926 139.428 8.10612C139.428 6.67317 139.756 5.38335 140.412 4.23698C141.068 3.0686 141.975 2.15357 143.134 1.49219C144.315 0.830825 145.66 0.500035 147.168 0.5H147.234ZM146.971 4.30273C146.337 4.30275 145.78 4.45764 145.299 4.76628C144.84 5.07487 144.479 5.51553 144.217 6.08854C144.168 6.20548 144.125 6.32728 144.086 6.45247H149.947C149.919 6.37331 149.889 6.2963 149.857 6.22135C149.595 5.582 149.223 5.10748 148.742 4.79883C148.261 4.46826 147.693 4.30275 147.037 4.30273H146.971Z" fill="currentColor"/>
  </svg>
);

const Footer: React.FC = () => {
  const { user, setRedirectPath } = useAuth();
  const location = useLocation();
  const [showPhotographerWaitlistModal, setShowPhotographerWaitlistModal] = useState(false);

  const handlePublishSessionClick = (e: React.MouseEvent) => {
    // If user is logged in as a photographer, allow normal navigation to upload session
    if (user?.isPhotographer) {
      return; // Let the Link component handle navigation
    }
    
    // Otherwise, prevent navigation and show photographer waitlist modal
    e.preventDefault();
    
    // If user is not logged in, store current location for redirect after login
    if (!user) {
      setRedirectPath(location.pathname + location.search);
    }
    
    setShowPhotographerWaitlistModal(true);
  };

  return (
    <>
      <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
        <div className="mx-auto px-4 max-w-full md:max-w-[100rem]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Company Info */}
            <div>
              <Link to="/" className="flex items-center text-2xl font-bold text-blue-900 mb-4">
                <WaawaveLogo className="h-5 text-black" />
              </Link>
              <p className="text-gray-600 italic">Waves worth remembering.</p>
            </div>
            
            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/terms" className="text-gray-500 hover:text-blue-600 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-500 hover:text-blue-600 transition-colors">
                    Privacy and Policy
                  </Link>
                </li>
                <li>
                   <a
    href="mailto:hello@waawave.com"
    className="text-gray-500 hover:text-blue-600 transition-colors"
  >
                    hello@waawave.com
                  </a>
                </li>
                <li>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-8">Follow us</h3>
                    <Link to="https://instagram.com" className="text-gray-500 hover:text-blue-600 transition-colors">
                      <Instagram size={24} />
                    </Link>
                  </div>
                </li>
              </ul>
            </div>
            
            {/* Explore Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Explore</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/sessions" className="text-gray-500 hover:text-blue-600 transition-colors">
                    Sessions
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/upload-session" 
                    onClick={handlePublishSessionClick}
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    Publish a Session
                  </Link>
                </li>
                <li>
                  <Link to="/photographers" className="text-gray-500 hover:text-blue-600 transition-colors">
                    Photographers
                  </Link>
                </li>
                <li>
                  <Link to="/surfschools" className="text-gray-500 hover:text-blue-600 transition-colors">
                    Surf Schools
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="text-gray-500 hover:text-blue-600 transition-colors">
                    How it works
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="text-center text-gray-500 text-sm border-t border-gray-100 pt-8">
            © 2025 Waawave. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Photographer Waitlist Modal */}
      {showPhotographerWaitlistModal && (
        <PhotographerWaitlistModal
          onClose={() => setShowPhotographerWaitlistModal(false)}
          onSuccess={() => {
            setShowPhotographerWaitlistModal(false);
          }}
        />
      )}
    </>
  );
};

export default Footer;