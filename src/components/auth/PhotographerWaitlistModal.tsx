import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface PhotographerWaitlistModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const PhotographerWaitlistModal: React.FC<PhotographerWaitlistModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    location: '',
    url: '' // Changed from portfolio_url to url to match API
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const normalizeUrl = (url: string): string => {
    if (!url.trim()) return '';
    
    const trimmedUrl = url.trim();
    
    // If it already has a protocol, return as is
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    
    // If it starts with www. or looks like a domain, add https://
    if (trimmedUrl.startsWith('www.') || trimmedUrl.includes('.')) {
      return `https://${trimmedUrl}`;
    }
    
    // Otherwise return as is (let the user decide)
    return trimmedUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!acceptTerms) {
      setError('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare the data for the API - only include url if it's not empty
      const submitData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        location: formData.location
      };

      // Only include url if it's provided (optional field)
      // Normalize the URL before sending
      if (formData.url.trim()) {
        submitData.url = normalizeUrl(formData.url);
      }

      const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to join waitlist');
      }

      const responseData = await response.json();
      console.log('Waitlist submission successful:', responseData);
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('Waitlist submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to join waitlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSurferRedirect = () => {
    onClose();
    // This would trigger the surfer signup modal
  };

  if (success) {
    return (
      <div className="fixed inset-0 h-screen w-screen bg-white z-50 flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're on the list!</h2>
          <p className="text-gray-600">We'll be in touch soon with next steps.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 h-screen w-screen bg-white z-50 overflow-hidden">
      {/* Desktop Layout - Side by Side */}
      <div className="hidden md:flex h-full">
        {/* Left Half - Abstract Sea Water Image with Text */}
        <div className="w-1/2 relative overflow-hidden">
          <img
            src="https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg"
            alt="Abstract ocean water"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Logo and Title Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 text-center z-10">
            <div className="max-w-md space-y-6">
              <svg width="280" height="31" viewBox="0 0 348 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
                <path d="M34.9717 1.02832C37.9296 1.02835 40.587 1.69228 42.9434 3.02051C45.2496 4.39802 47.0799 6.268 48.4336 8.62939C49.7371 10.9908 50.3891 13.6479 50.3892 16.5996V21.167C50.3893 22.2491 50.7406 23.1341 51.4424 23.8228C52.1443 24.5607 53.0464 24.9302 54.1494 24.9302C55.2524 24.9302 56.1545 24.5607 56.8564 23.8228C57.5582 23.1341 57.9095 22.2491 57.9097 21.167V1.7666H69.9434V20.0596C69.9433 23.2083 69.2653 25.9882 67.9116 28.3989C66.5579 30.8095 64.6784 32.6795 62.272 34.0078C59.8653 35.3362 57.1577 36 54.1494 36C51.1411 36 48.4335 35.3362 46.0269 34.0078C43.6202 32.6794 41.7395 30.8097 40.3857 28.3989C39.0321 25.9882 38.3555 23.2082 38.3555 20.0596V15.4937C38.3555 14.5097 38.0302 13.6972 37.3784 13.0576C36.7267 12.4181 35.9242 12.0982 34.9717 12.0981C34.0191 12.0981 33.2167 12.4181 32.5649 13.0576C31.9131 13.6972 31.5879 14.5097 31.5879 15.4937V20.0596C31.5879 23.2083 30.9099 25.9882 29.5562 28.3989C28.2025 30.8095 26.3229 32.6795 23.9165 34.0078C21.51 35.3362 18.8021 36 15.7939 36C12.7858 36 10.0779 35.3361 7.67139 34.0078C5.26476 32.6794 3.38401 30.8097 2.03027 28.3989C0.676571 25.9882 3.12835e-05 23.2083 0 20.0596V1.7666H12.0337V21.167C12.0338 22.2488 12.384 23.1342 13.0854 23.8228C13.7874 24.5607 14.6909 24.9302 15.7939 24.9302C16.8968 24.9301 17.7991 24.5607 18.501 23.8228C19.2027 23.1341 19.5541 22.249 19.5542 21.167V16.5996C19.5543 13.6479 20.2309 10.9667 21.5845 8.55615C22.9382 6.19457 24.7683 4.3489 27.0747 3.02051C29.381 1.69222 32.0136 1.02832 34.9717 1.02832Z" fill="currentColor"/>
                <path d="M194.399 1.02832C197.271 1.02832 199.851 1.69212 202.138 3.02051C204.376 4.39798 206.152 6.26814 207.466 8.62939C208.731 10.9908 209.364 13.6479 209.364 16.5996V21.167C209.364 22.2491 209.706 23.1341 210.387 23.8228C211.068 24.5605 211.943 24.93 213.013 24.9302C214.084 24.9302 214.96 24.5607 215.641 23.8228C216.322 23.1341 216.663 22.2491 216.664 21.167V1.7666H228.343V20.0596C228.343 23.2082 227.686 25.9882 226.373 28.3989C225.059 30.8097 223.233 32.6794 220.897 34.0078C218.561 35.336 215.933 36 213.013 36C210.094 35.9999 207.466 35.3359 205.131 34.0078C202.795 32.6794 200.969 30.8097 199.655 28.3989C198.341 25.9882 197.685 23.2083 197.685 20.0596V15.4937C197.685 14.5097 197.368 13.6972 196.736 13.0576C196.103 12.4181 195.324 12.0981 194.399 12.0981C193.475 12.0983 192.697 12.4183 192.064 13.0576C191.432 13.6972 191.115 14.5097 191.115 15.4937V20.0596C191.115 23.2082 190.459 25.9882 189.145 28.3989C187.831 30.8097 186.005 32.6794 183.669 34.0078C181.334 35.336 178.705 36 175.786 36C172.866 35.9999 170.239 35.3359 167.903 34.0078C165.567 32.6794 163.742 30.8097 162.428 28.3989C161.114 25.9882 160.458 23.2083 160.458 20.0596V1.7666H172.137V21.167C172.137 22.2488 172.477 23.1342 173.158 23.8228C173.839 24.5606 174.715 24.93 175.786 24.9302C176.856 24.9302 177.732 24.5607 178.414 23.8228C179.095 23.1341 179.436 22.2491 179.436 21.167V16.5996C179.436 13.648 180.093 10.9667 181.406 8.55615C182.72 6.19457 184.497 4.3489 186.735 3.02051C188.974 1.69227 191.529 1.02842 194.399 1.02832Z" fill="currentColor"/>
                <path d="M292.772 20.0054L299.963 1.02832H311.657L301.126 28.708C300.207 31.0889 299.044 32.8995 297.64 34.1396C296.284 35.3797 294.614 35.9999 292.629 36C290.644 36 288.949 35.3798 287.544 34.1396C286.189 32.8995 285.051 31.0889 284.131 28.708L273.601 1.02832H285.583L292.772 20.0054Z" fill="currentColor"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M110.057 34.9717H92.9517C89.6572 34.9717 86.6417 34.2086 83.9048 32.6836C81.1679 31.1586 79.0131 29.1171 77.4419 26.5591C75.871 23.952 75.0864 21.0989 75.0864 18C75.0864 14.9009 75.8708 12.0721 77.4419 9.51416C79.0131 6.90697 81.1679 4.84137 83.9048 3.31641C86.6417 1.79144 89.6572 1.02832 92.9517 1.02832H110.057V34.9717ZM92.9517 11.9487C91.8366 11.9487 90.8229 12.2206 89.9106 12.7617C88.9985 13.3028 88.2635 14.0405 87.7061 14.9751C87.1486 15.9097 86.8696 16.9179 86.8696 18C86.8696 19.0821 87.1486 20.0903 87.7061 21.0249C88.2635 21.9595 88.9985 22.6972 89.9106 23.2383C90.8229 23.7794 91.8366 24.0513 92.9517 24.0513C94.0667 24.0513 95.0804 23.7794 95.9927 23.2383C96.9048 22.6972 97.6398 21.9594 98.1973 21.0249C98.7547 20.0903 99.0337 19.0821 99.0337 18C99.0337 16.9179 98.7547 15.9097 98.1973 14.9751C97.6398 14.0406 96.9048 13.3028 95.9927 12.7617C95.0804 12.2206 94.0667 11.9487 92.9517 11.9487Z" fill="currentColor"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M150.171 34.9717H133.569C130.371 34.9717 127.445 34.2085 124.789 32.6836C122.132 31.1586 120.041 29.1171 118.516 26.5591C116.991 23.952 116.228 21.099 116.228 18C116.228 14.9009 116.991 12.0722 118.516 9.51416C120.041 6.90701 122.132 4.84135 124.789 3.31641C127.445 1.79153 130.371 1.02834 133.569 1.02832H150.171V34.9717ZM133.569 11.9487C132.487 11.9488 131.503 12.2206 130.617 12.7617C129.732 13.3028 129.018 14.0406 128.477 14.9751C127.936 15.9096 127.666 16.918 127.666 18C127.666 19.082 127.936 20.0904 128.477 21.0249C129.018 21.9594 129.732 22.6972 130.617 23.2383C131.503 23.7794 132.487 24.0512 133.569 24.0513C134.651 24.0513 135.635 23.7794 136.521 23.2383C137.406 22.6972 138.12 21.9595 138.661 21.0249C139.202 20.0904 139.472 19.0821 139.472 18C139.472 16.9179 139.202 15.9096 138.661 14.9751C138.12 14.0405 137.406 13.3028 136.521 12.7617C135.635 12.2206 134.651 11.9487 133.569 11.9487Z" fill="currentColor"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M268.458 34.9717H251.351C248.057 34.9716 245.041 34.2085 242.304 32.6836C239.568 31.1587 237.414 29.1169 235.843 26.5591C234.272 23.9519 233.486 21.0991 233.486 18C233.486 14.9009 234.272 12.0722 235.843 9.51416C237.414 6.90721 239.568 4.84131 242.304 3.31641C245.041 1.79152 248.057 1.0284 251.351 1.02832H268.458V34.9717ZM251.351 11.9487C250.236 11.9488 249.222 12.2207 248.31 12.7617C247.398 13.3028 246.663 14.0407 246.105 14.9751C245.548 15.9096 245.269 16.918 245.269 18C245.269 19.082 245.548 20.0904 246.105 21.0249C246.663 21.9593 247.398 22.6972 248.31 23.2383C249.222 23.7793 250.236 24.0512 251.351 24.0513C252.466 24.0513 253.48 23.7794 254.392 23.2383C255.304 22.6972 256.039 21.9596 256.597 21.0249C257.154 20.0903 257.433 19.0822 257.433 18C257.433 16.9178 257.154 15.9097 256.597 14.9751C256.039 14.0404 255.304 13.3028 254.392 12.7617C253.48 12.2206 252.466 11.9487 251.351 11.9487Z" fill="currentColor"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M331.276 0C334.326 0 337.105 0.76941 339.614 2.30713C342.122 3.79516 344.091 5.87779 345.517 8.55615C346.944 11.1852 347.657 14.1623 347.657 17.4858V21.5786H324.612C324.916 22.1991 325.291 22.77 325.742 23.2896C327.168 24.8768 329.554 25.6698 332.899 25.6699H344.706V34.9717H333.637C329.554 34.9717 326.012 34.2274 323.011 32.7393C320.011 31.2015 317.698 29.0926 316.075 26.4141C314.501 23.686 313.714 20.5858 313.714 17.1138C313.714 13.8896 314.452 10.9875 315.927 8.4082C317.403 5.77935 319.445 3.72054 322.052 2.23242C324.708 0.744355 327.734 7.90537e-05 331.128 0H331.276ZM330.686 8.55615C329.259 8.55619 328.005 8.90469 326.922 9.59912C325.89 10.2935 325.078 11.285 324.488 12.5742C324.377 12.8373 324.281 13.1114 324.193 13.3931H337.381C337.318 13.2149 337.251 13.0417 337.179 12.873C336.589 11.4345 335.752 10.3668 334.67 9.67236C333.588 8.92858 332.309 8.55618 330.833 8.55615H330.686Z" fill="currentColor"/>
              </svg>
              <h2 className="text-2xl font-semibold mb-4">We'd Love to Have You On Board</h2>
              <p className="text-lg leading-relaxed">
                To ensure the smoothest experience for our early community, we're inviting photographers gradually.
              </p>
              <p className="text-lg leading-relaxed">
                Leave your details — we'll personally get in touch as soon as we're ready to bring you on board.
              </p>
            </div>
          </div>
          
          {/* Back Button */}
          <button
            onClick={onClose}
            className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors z-10"
          >
            <ArrowLeft size={24} />
          </button>

        </div>

        {/* Right Half - Waitlist Form */}
        <div className="w-1/2 flex items-center justify-center p-8 max-h-full overflow-y-auto">
          <div className="w-full max-w-sm">
            {/* Form Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Join our Waitlist</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name and Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                    style={{ touchAction: 'manipulation' }}
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                    style={{ touchAction: 'manipulation' }}
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                  style={{ touchAction: 'manipulation' }}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                  style={{ touchAction: 'manipulation' }}
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                  style={{ touchAction: 'manipulation' }}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Where you live.
                </p>
              </div>

              {/* Portfolio URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portfolio URL <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="www.your-portfolio.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                  style={{ touchAction: 'manipulation' }}
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can enter URLs like: www.example.com, example.com, or https://example.com
                </p>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="acceptTerms" className="text-xs text-gray-600">
                  I accept the{' '}
                  <a href="/terms" target="_blank" className="text-primary hover:text-primary-dark underline">
                    Terms of Service
                  </a>{' '}
                  and the{' '}
                  <a href="/privacy" target="_blank" className="text-primary hover:text-primary-dark underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">
                  {error}
                </div>
              )}

              {/* Join Waitlist Button */}
              <button
                type="submit"
                disabled={loading || !acceptTerms}
                className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Joining...' : 'Join the Waitlist'}
              </button>

              {/* I'm not a photographer Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSurferRedirect}
                  className="text-primary hover:text-primary-dark underline text-sm"
                >
                  I'm not a photographer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Vertical Scroll */}
      <div className="md:hidden h-full max-h-full overflow-y-auto">
        {/* First Section - Image with Text (Slightly More Than Half Screen) */}
        <div className="h-[60vh] relative flex items-center justify-center">
          <img
            src="https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg"
            alt="Abstract ocean water"
            className="absolute inset-0 w-full h-full object-cover"  
          />
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Logo and Title Overlay */}
          <div className="relative z-10 text-center text-white px-6 flex flex-col items-center justify-center h-full">
            <svg width="220" height="24" viewBox="0 0 348 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
              <path d="M34.9717 1.02832C37.9296 1.02835 40.587 1.69228 42.9434 3.02051C45.2496 4.39802 47.0799 6.268 48.4336 8.62939C49.7371 10.9908 50.3891 13.6479 50.3892 16.5996V21.167C50.3893 22.2491 50.7406 23.1341 51.4424 23.8228C52.1443 24.5607 53.0464 24.9302 54.1494 24.9302C55.2524 24.9302 56.1545 24.5607 56.8564 23.8228C57.5582 23.1341 57.9095 22.2491 57.9097 21.167V1.7666H69.9434V20.0596C69.9433 23.2083 69.2653 25.9882 67.9116 28.3989C66.5579 30.8095 64.6784 32.6795 62.272 34.0078C59.8653 35.3362 57.1577 36 54.1494 36C51.1411 36 48.4335 35.3362 46.0269 34.0078C43.6202 32.6794 41.7395 30.8097 40.3857 28.3989C39.0321 25.9882 38.3555 23.2082 38.3555 20.0596V15.4937C38.3555 14.5097 38.0302 13.6972 37.3784 13.0576C36.7267 12.4181 35.9242 12.0982 34.9717 12.0981C34.0191 12.0981 33.2167 12.4181 32.5649 13.0576C31.9131 13.6972 31.5879 14.5097 31.5879 15.4937V20.0596C31.5879 23.2083 30.9099 25.9882 29.5562 28.3989C28.2025 30.8095 26.3229 32.6795 23.9165 34.0078C21.51 35.3362 18.8021 36 15.7939 36C12.7858 36 10.0779 35.3361 7.67139 34.0078C5.26476 32.6794 3.38401 30.8097 2.03027 28.3989C0.676571 25.9882 3.12835e-05 23.2083 0 20.0596V1.7666H12.0337V21.167C12.0338 22.2488 12.384 23.1342 13.0854 23.8228C13.7874 24.5607 14.6909 24.9302 15.7939 24.9302C16.8968 24.9301 17.7991 24.5607 18.501 23.8228C19.2027 23.1341 19.5541 22.249 19.5542 21.167V16.5996C19.5543 13.6479 20.2309 10.9667 21.5845 8.55615C22.9382 6.19457 24.7683 4.3489 27.0747 3.02051C29.381 1.69222 32.0136 1.02832 34.9717 1.02832Z" fill="currentColor"/>
              <path d="M194.399 1.02832C197.271 1.02832 199.851 1.69212 202.138 3.02051C204.376 4.39798 206.152 6.26814 207.466 8.62939C208.731 10.9908 209.364 13.6479 209.364 16.5996V21.167C209.364 22.2491 209.706 23.1341 210.387 23.8228C211.068 24.5605 211.943 24.93 213.013 24.9302C214.084 24.9302 214.96 24.5607 215.641 23.8228C216.322 23.1341 216.663 22.2491 216.664 21.167V1.7666H228.343V20.0596C228.343 23.2082 227.686 25.9882 226.373 28.3989C225.059 30.8097 223.233 32.6794 220.897 34.0078C218.561 35.336 215.933 36 213.013 36C210.094 35.9999 207.466 35.3359 205.131 34.0078C202.795 32.6794 200.969 30.8097 199.655 28.3989C198.341 25.9882 197.685 23.2083 197.685 20.0596V15.4937C197.685 14.5097 197.368 13.6972 196.736 13.0576C196.103 12.4181 195.324 12.0981 194.399 12.0981C193.475 12.0983 192.697 12.4183 192.064 13.0576C191.432 13.6972 191.115 14.5097 191.115 15.4937V20.0596C191.115 23.2082 190.459 25.9882 189.145 28.3989C187.831 30.8097 186.005 32.6794 183.669 34.0078C181.334 35.336 178.705 36 175.786 36C172.866 35.9999 170.239 35.3359 167.903 34.0078C165.567 32.6794 163.742 30.8097 162.428 28.3989C161.114 25.9882 160.458 23.2083 160.458 20.0596V1.7666H172.137V21.167C172.137 22.2488 172.477 23.1342 173.158 23.8228C173.839 24.5606 174.715 24.93 175.786 24.9302C176.856 24.9302 177.732 24.5607 178.414 23.8228C179.095 23.1341 179.436 22.2491 179.436 21.167V16.5996C179.436 13.648 180.093 10.9667 181.406 8.55615C182.72 6.19457 184.497 4.3489 186.735 3.02051C188.974 1.69227 191.529 1.02842 194.399 1.02832Z" fill="currentColor"/>
              <path d="M292.772 20.0054L299.963 1.02832H311.657L301.126 28.708C300.207 31.0889 299.044 32.8995 297.64 34.1396C296.284 35.3797 294.614 35.9999 292.629 36C290.644 36 288.949 35.3798 287.544 34.1396C286.189 32.8995 285.051 31.0889 284.131 28.708L273.601 1.02832H285.583L292.772 20.0054Z" fill="currentColor"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M110.057 34.9717H92.9517C89.6572 34.9717 86.6417 34.2086 83.9048 32.6836C81.1679 31.1586 79.0131 29.1171 77.4419 26.5591C75.871 23.952 75.0864 21.0989 75.0864 18C75.0864 14.9009 75.8708 12.0721 77.4419 9.51416C79.0131 6.90697 81.1679 4.84137 83.9048 3.31641C86.6417 1.79144 89.6572 1.02832 92.9517 1.02832H110.057V34.9717ZM92.9517 11.9487C91.8366 11.9487 90.8229 12.2206 89.9106 12.7617C88.9985 13.3028 88.2635 14.0405 87.7061 14.9751C87.1486 15.9097 86.8696 16.9179 86.8696 18C86.8696 19.0821 87.1486 20.0903 87.7061 21.0249C88.2635 21.9595 88.9985 22.6972 89.9106 23.2383C90.8229 23.7794 91.8366 24.0513 92.9517 24.0513C94.0667 24.0513 95.0804 23.7794 95.9927 23.2383C96.9048 22.6972 97.6398 21.9594 98.1973 21.0249C98.7547 20.0903 99.0337 19.0821 99.0337 18C99.0337 16.9179 98.7547 15.9097 98.1973 14.9751C97.6398 14.0406 96.9048 13.3028 95.9927 12.7617C95.0804 12.2206 94.0667 11.9487 92.9517 11.9487Z" fill="currentColor"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M150.171 34.9717H133.569C130.371 34.9717 127.445 34.2085 124.789 32.6836C122.132 31.1586 120.041 29.1171 118.516 26.5591C116.991 23.952 116.228 21.099 116.228 18C116.228 14.9009 116.991 12.0722 118.516 9.51416C120.041 6.90701 122.132 4.84135 124.789 3.31641C127.445 1.79153 130.371 1.02834 133.569 1.02832H150.171V34.9717ZM133.569 11.9487C132.487 11.9488 131.503 12.2206 130.617 12.7617C129.732 13.3028 129.018 14.0406 128.477 14.9751C127.936 15.9096 127.666 16.918 127.666 18C127.666 19.082 127.936 20.0904 128.477 21.0249C129.018 21.9594 129.732 22.6972 130.617 23.2383C131.503 23.7794 132.487 24.0512 133.569 24.0513C134.651 24.0513 135.635 23.7794 136.521 23.2383C137.406 22.6972 138.12 21.9595 138.661 21.0249C139.202 20.0904 139.472 19.0821 139.472 18C139.472 16.9179 139.202 15.9096 138.661 14.9751C138.12 14.0405 137.406 13.3028 136.521 12.7617C135.635 12.2206 134.651 11.9487 133.569 11.9487Z" fill="currentColor"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M268.458 34.9717H251.351C248.057 34.9716 245.041 34.2085 242.304 32.6836C239.568 31.1587 237.414 29.1169 235.843 26.5591C234.272 23.9519 233.486 21.0991 233.486 18C233.486 14.9009 234.272 12.0722 235.843 9.51416C237.414 6.90721 239.568 4.84131 242.304 3.31641C245.041 1.79152 248.057 1.0284 251.351 1.02832H268.458V34.9717ZM251.351 11.9487C250.236 11.9488 249.222 12.2207 248.31 12.7617C247.398 13.3028 246.663 14.0407 246.105 14.9751C245.548 15.9096 245.269 16.918 245.269 18C245.269 19.082 245.548 20.0904 246.105 21.0249C246.663 21.9593 247.398 22.6972 248.31 23.2383C249.222 23.7793 250.236 24.0512 251.351 24.0513C252.466 24.0513 253.48 23.7794 254.392 23.2383C255.304 22.6972 256.039 21.9596 256.597 21.0249C257.154 20.0903 257.433 19.0822 257.433 18C257.433 16.9178 257.154 15.9097 256.597 14.9751C256.039 14.0404 255.304 13.3028 254.392 12.7617C253.48 12.2206 252.466 11.9487 251.351 11.9487Z" fill="currentColor"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M331.276 0C334.326 0 337.105 0.76941 339.614 2.30713C342.122 3.79516 344.091 5.87779 345.517 8.55615C346.944 11.1852 347.657 14.1623 347.657 17.4858V21.5786H324.612C324.916 22.1991 325.291 22.77 325.742 23.2896C327.168 24.8768 329.554 25.6698 332.899 25.6699H344.706V34.9717H333.637C329.554 34.9717 326.012 34.2274 323.011 32.7393C320.011 31.2015 317.698 29.0926 316.075 26.4141C314.501 23.686 313.714 20.5858 313.714 17.1138C313.714 13.8896 314.452 10.9875 315.927 8.4082C317.403 5.77935 319.445 3.72054 322.052 2.23242C324.708 0.744355 327.734 7.90537e-05 331.128 0H331.276ZM330.686 8.55615C329.259 8.55619 328.005 8.90469 326.922 9.59912C325.89 10.2935 325.078 11.285 324.488 12.5742C324.377 12.8373 324.281 13.1114 324.193 13.3931H337.381C337.318 13.2149 337.251 13.0417 337.179 12.873C336.589 11.4345 335.752 10.3668 334.67 9.67236C333.588 8.92858 332.309 8.55618 330.833 8.55615H330.686Z" fill="currentColor"/>
            </svg>
            <h2 className="text-xl font-semibold mb-4">We'd Love to Have You On Board</h2>
            <div className="space-y-4">
              <p className="text-base leading-relaxed">
                To ensure the smoothest experience for our early community, we're inviting photographers gradually.
              </p>
              <p className="text-base leading-relaxed">
                Leave your details — we'll personally get in touch as soon as we're ready to bring you on board.
              </p>
            </div>
          </div>
          
          {/* Back Button */}
          <button
            onClick={onClose}
            className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors z-10"
          >
            <ArrowLeft size={24} />
          </button>

        </div>

        {/* Second Section - Form */}
        <div className="bg-white flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Join our Waitlist</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name and Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                    style={{ touchAction: 'manipulation' }}
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                    style={{ touchAction: 'manipulation' }}
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                  style={{ touchAction: 'manipulation' }}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                  style={{ touchAction: 'manipulation' }}
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Lisboa, Portugal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                  style={{ touchAction: 'manipulation' }}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your city or region where you primarily shoot
                </p>
              </div>

              {/* Portfolio URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portfolio URL <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="www.your-portfolio.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm text-base"
                  style={{ touchAction: 'manipulation' }}
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can enter URLs like: www.example.com, example.com, or https://example.com
                </p>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="acceptTermsMobile"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="acceptTermsMobile" className="text-xs text-gray-600">
                  I accept the{' '}
                  <a href="/terms" target="_blank" className="text-primary hover:text-primary-dark underline">
                    Terms of Service
                  </a>{' '}
                  and the{' '}
                  <a href="/privacy" target="_blank" className="text-primary hover:text-primary-dark underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">
                  {error}
                </div>
              )}

              {/* Join Waitlist Button */}
              <button
                type="submit"
                disabled={loading || !acceptTerms}
                className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Joining...' : 'Join the Waitlist'}
              </button>

              {/* I'm not a photographer Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSurferRedirect}
                  className="text-primary hover:text-primary-dark underline text-sm"
                >
                  I'm not a photographer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotographerWaitlistModal;