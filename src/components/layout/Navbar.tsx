import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import LoginModal from '../auth/LoginModal';
import SignUpModal from '../auth/SignUpModal';
import PhotographerWaitlistModal from '../auth/PhotographerWaitlistModal';
import ForgotPasswordModal from '../auth/ForgotPasswordModal';
import UserSelectionPage from '../auth/UserSelectionPage';

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

const Navbar: React.FC = () => {
  const { user, logout, setRedirectPath } = useAuth();
  const { getItemCount } = useCart();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showPhotographerWaitlistModal, setShowPhotographerWaitlistModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showUserSelectionPage, setShowUserSelectionPage] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrollState, setScrollState] = useState<'top' | 'partial' | 'full'>('top');
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/' || location.pathname === '/sessions';

  const cartItemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const navbarHeight = 80; // Approximate navbar height (pt-16 = 64px + padding)
      
      if (isHomePage) {
        const heroSection = document.getElementById('hero-section');
        const heroHeight = heroSection?.offsetHeight || window.innerHeight;
        
        // Calculate when the bottom of the navbar hits the bottom of the hero
        const transitionPoint = heroHeight - navbarHeight + 30;
        
        if (scrollPosition === 0) {
          setScrollState('top');
        } else if (scrollPosition < transitionPoint) {
          setScrollState('partial');
        } else {
          setScrollState('full');
        }
      } else {
        // For non-homepage, always show white background
        setScrollState('full');
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Set initial state
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // Close mobile menu when route changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  const getUserInitials = () => {
    if (!user) return '';
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  };

  const getNavBackground = () => {
    if (!isHomePage) return 'bg-white';
    switch (scrollState) {
      case 'top':
        return 'bg-transparent';
      case 'partial':
        return 'bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm';
      case 'full':
        return 'bg-white';
      default:
        return 'bg-transparent';
    }
  };

  const textClasses = isHomePage && scrollState !== 'full' ? 'text-white' : 'text-gray-600';
  const logoTextClasses = isHomePage && scrollState !== 'full' ? 'text-white' : 'text-primary-dark';
  const logoIconClasses = isHomePage && scrollState !== 'full' ? 'text-white' : 'text-primary';

  const handleCartClick = () => {
    if (!user) {
      // Store current path for redirect after login
      setRedirectPath('/cart');
      setShowLoginModal(true);
    } else {
      navigate('/cart');
    }
  };

  const handleSessionsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isHomePage) {
      // If already on homepage, scroll to filters section
      const filtersSection = document.getElementById('filters-section');
      if (filtersSection) {
        filtersSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on different page, navigate to homepage and then scroll
      navigate('/sessions');
    }
  };

  const handleUploadSessionClick = (e: React.MouseEvent) => {
    // If user is logged in as a photographer, allow normal navigation to upload session
    if (user?.isPhotographer) {
      return; // Let the Link component handle navigation
    }
    
    // Otherwise, prevent navigation and show photographer waitlist modal
    e.preventDefault();
    setShowPhotographerWaitlistModal(true);
  };

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

  // Enhanced login handler that captures current location
  const handleLoginClick = () => {
    // Store current location for redirect after login
    setRedirectPath(location.pathname + location.search);
    setShowLoginModal(true);
  };

  // Enhanced sign up handler that captures current location
  const handleSignUpClick = () => {
    // Store current location for redirect after login
    setRedirectPath(location.pathname + location.search);
    setShowUserSelectionPage(true);
  };

  // Cart icon components
  const EmptyCartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
  );

  const FullCartIcon = () => (
    <div className="relative">
      <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_99_10923)">
          <path d="M6.15039 12.541C6.88958 12.6164 7.46663 13.241 7.4668 14C7.46666 14.8097 6.80971 15.4665 6 15.4668C5.24088 15.4666 4.61629 14.8897 4.54102 14.1504L4.5332 14L4.54102 13.8506C4.616 13.111 5.24067 12.5334 6 12.5332L6.15039 12.541ZM13.4834 12.541C14.2227 12.6162 14.8006 13.2408 14.8008 14C14.8006 14.8096 14.1435 15.4664 13.334 15.4668C12.5747 15.4668 11.9503 14.8898 11.875 14.1504L11.8672 14L11.875 13.8506C11.95 13.1109 12.5745 12.5332 13.334 12.5332L13.4834 12.541ZM6 13.8672C5.92662 13.8674 5.86736 13.9266 5.86719 14L5.87793 14.0518C5.89816 14.0994 5.94497 14.1337 6 14.1338C6.05514 14.1336 6.10294 14.0996 6.12305 14.0518L6.13379 14L6.12305 13.9482C6.10957 13.9165 6.08347 13.8914 6.05176 13.8779L6 13.8672ZM13.334 13.8672C13.2605 13.8672 13.2004 13.9265 13.2002 14L13.2109 14.0518C13.2312 14.0996 13.2788 14.1338 13.334 14.1338C13.3889 14.1335 13.436 14.0995 13.4561 14.0518L13.4668 14L13.4561 13.9482C13.4426 13.9168 13.4172 13.8915 13.3857 13.8779L13.334 13.8672ZM3.47363 -0.121094C3.79273 -0.0643774 4.05264 0.182823 4.11816 0.509766L4.65625 3.2002H15.334C15.5721 3.20044 15.7984 3.30675 15.9502 3.49023C16.1019 3.67389 16.1638 3.91635 16.1191 4.15039L15.0527 9.74316L15.0518 9.75C14.9541 10.2408 14.6866 10.6823 14.2969 10.9961C13.911 11.3066 13.4286 11.4717 12.9336 11.4658V11.4668H6.4541V11.4658C5.9591 11.4719 5.47682 11.3065 5.09082 10.9961C4.70128 10.6825 4.43377 10.2413 4.33594 9.75098L2.67773 1.4668H0.666992C0.225246 1.4668 -0.132681 1.10871 -0.132812 0.666992C-0.132812 0.225164 0.225164 -0.132812 0.666992 -0.132812H3.33398L3.47363 -0.121094Z" fill="currentColor"/>
        </g>
        <defs>
          <clipPath id="clip0_99_10923">
            <rect width="16" height="16" fill="white"/>
          </clipPath>
        </defs>
      </svg>
      {cartItemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {cartItemCount}
        </span>
      )}
    </div>
  );

  return (
    <header className={`fixed top-0 w-full z-50 transition-colors duration-300 ${getNavBackground()}`}>
      {/* Make navbar container wider - use max-w-7xl instead of container */}
      <div className="max-w-[100rem] mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          {/* Mobile left side: hamburger + logo */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`${textClasses}`}
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className={`flex items-center ${logoTextClasses}`}>
              <WaawaveLogo className={`h-6 ${logoIconClasses}`} />
            </Link>
          </div>

          {/* Desktop left side */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Logo */}
            <Link to="/" className={`flex items-center ${logoTextClasses}`}>
              <WaawaveLogo className={`h-7 ${logoIconClasses}`} />
            </Link>
            
            {/* Desktop navigation */}
            <div className="flex space-x-6">
              <button 
                onClick={handleSessionsClick}
                className={`font-medium hover:text-primary-dark transition-colors ${textClasses}`}
              >
                Sessions
              </button>
              <Link to="/how-it-works" className={`font-medium hover:text-primary-dark transition-colors ${textClasses}`}>
                How it works
              </Link>
            </div>
          </div>

          {/* Mobile center: empty space */}
          <div className="md:hidden flex-1"></div>
          
          {/* Mobile right side: logged-in user buttons */}
          <div className="md:hidden flex items-center space-x-3">
            {user ? (
              <>
                {user.isPhotographer ? (
                  <>
                    {/* Upload Session Button for Photographers */}
                    <Link 
                      to="/upload-session"
                      onClick={handleUploadSessionClick}
                      className={`border px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        isHomePage && scrollState !== 'full'
                          ? 'border-white text-white hover:bg-white hover:text-gray-900 border-opacity-60 hover:border-transparent hover:bg-opacity-60'
                          : 'border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white'
                      }`}
                    >
                      Upload
                    </Link>
                    {/* Profile Photo for Photographers */}
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="relative"
                    >
                      {user.profile_photo?.url ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20">
                          <img 
                            src={user.profile_photo.url} 
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
                          isHomePage && scrollState !== 'full'
                            ? 'bg-white/20 text-white border-white/20'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}>
                          {getUserInitials()}
                        </div>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Shopping Cart for Surfers */}
                    <button 
                      onClick={handleCartClick}
                      className={`hover:text-primary-dark transition-colors ${textClasses}`}
                    >
                      {cartItemCount > 0 ? <FullCartIcon /> : <EmptyCartIcon />}
                    </button>
                    {/* Profile Initials for Surfers */}
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
                        isHomePage && scrollState !== 'full'
                          ? 'bg-white/20 text-white border-white/20'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      {getUserInitials()}
                    </button>
                  </>
                )}
                
                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-6 top-16 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
                    <Link
                      to={user.isPhotographer ? "/photographerprofile/stats" : "/surfer/media"}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Shopping cart for logged-out users */
              <button 
                onClick={handleCartClick}
                className={`hover:text-primary-dark transition-colors ${textClasses}`}
              >
                {cartItemCount > 0 ? <FullCartIcon /> : <EmptyCartIcon />}
              </button>
            )}
          </div>

          {/* Desktop right side navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {user.isPhotographer ? (
                  <Link 
                    to="/upload-session"
                    onClick={handleUploadSessionClick}
                    className={`border px-4 py-2 rounded-md font-medium transition-colors ${
                      isHomePage && scrollState !== 'full'
                        ? 'border-white text-white hover:bg-white hover:text-gray-900 border-opacity-60 hover:border-transparent hover:bg-opacity-60'
                        : 'border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    Upload Session
                  </Link>
                ) : (
                  <button 
                    onClick={handleCartClick}
                    className={`hover:text-primary-dark transition-colors ${textClasses}`}
                  >
                    {cartItemCount > 0 ? <FullCartIcon /> : <EmptyCartIcon />}
                  </button>
                )}
                <div className="relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 bg-gray-100 rounded-full px-1 py-1 hover:bg-gray-200 transition-colors bg-opacity-50"
                  >
                    {user.profile_photo?.url ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img 
                          src={user.profile_photo.url} 
                          alt={`${user.first_name} ${user.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <span className="font-medium">{getUserInitials()}</span>
                    )}
                    <ChevronDown size={16} />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                      <Link
                        to={user.isPhotographer ? "/photographerprofile/stats" : "/surfer/media"}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={handleLoginClick}
                  className={`font-medium hover:text-primary-dark transition-colors ${textClasses}`}
                >
                  Log in
                </button>
                <button 
                  onClick={handleSignUpClick}
                  className={`font-medium hover:text-primary-dark transition-colors ${textClasses}`}
                >
                  Sign up
                </button>
                <button 
                  onClick={() => setShowPhotographerWaitlistModal(true)}
                  className={`border px-4 py-2 rounded-md font-medium transition-colors ${
                    isHomePage && scrollState !== 'full'
                      ? 'border-white text-white hover:bg-white hover:text-gray-900'
                      : 'border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  I'm a Photographer
                </button>
                <button 
                  onClick={handleCartClick}
                  className={`hover:text-primary-dark transition-colors ${textClasses}`}
                >
                  {cartItemCount > 0 ? <FullCartIcon /> : <EmptyCartIcon />}
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="py-2">
              {/* Navigation Links Section */}
              <button
                onClick={(e) => {
                  handleSessionsClick(e);
                  setShowMobileMenu(false);
                }}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                Find Your Waves
              </button>
              <Link
                to="/how-it-works"
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100"
                onClick={() => setShowMobileMenu(false)}
              >
                How it works
              </Link>
              
              {/* Separator Line */}
              <div className="border-t border-gray-200 my-2"></div>
              
              {user ? (
                <>
                  {/* Only show Upload Session in menu for photographers if not already shown outside */}
                  {/* Profile link */}
                  <Link
                    to={user.isPhotographer ? "/photographerprofile/stats" : "/surfer/media"}
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowMobileMenu(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  {/* Authentication Links Section */}
                  <button
                    onClick={() => {
                      handleLoginClick();
                      setShowMobileMenu(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 font-medium"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      handleSignUpClick();
                      setShowMobileMenu(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 font-medium"
                  >
                    Sign up
                  </button>
                  <button
                    onClick={() => {
                      setShowPhotographerWaitlistModal(true);
                      setShowMobileMenu(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 font-medium"
                  >
                    I'm a Photographer
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Selection Page */}
      {showUserSelectionPage && (
        <UserSelectionPage
          onClose={() => setShowUserSelectionPage(false)}
        />
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={(data) => {
            setShowLoginModal(false);
          }}
          onForgotPassword={handleForgotPassword}
          onSignUp={handleSignUpFromLogin}
        />
      )}

      {showSignUpModal && (
        <SignUpModal
          onClose={() => setShowSignUpModal(false)}
          onSuccess={(data) => {
            setShowSignUpModal(false);
          }}
        />
      )}

      {showPhotographerWaitlistModal && (
        <PhotographerWaitlistModal
          onClose={() => setShowPhotographerWaitlistModal(false)}
          onSuccess={() => {
            setShowPhotographerWaitlistModal(false);
          }}
        />
      )}

      {showForgotPasswordModal && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPasswordModal(false)}
          onBackToLogin={handleBackToLogin}
        />
      )}
    </header>
  );
};

export default Navbar;