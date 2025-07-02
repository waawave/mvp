import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface Media {
  id: number;
  type: string;
  preview_url: string;
  media_name: string;
}

interface OrderMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderReference: string;
  customerName: string;
}

const OrderMediaModal: React.FC<OrderMediaModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderReference,
  customerName
}) => {
  const { authToken } = useAuth();
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderMedia();
    }
  }, [isOpen, orderId]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const fetchOrderMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== FETCHING ORDER MEDIA ===');
      console.log('Order ID:', orderId);
      console.log('Auth Token:', authToken ? 'Present' : 'Missing');
      
      // Try the photographer sales endpoint to get media for this specific order
      const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/my-sales', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      console.log('Response Status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch sales data: ${response.status}`);
      }

      const data = await response.json();
      console.log('Sales Data:', data);
      
      // Filter sales for this specific order and extract media
      const orderSales = data.sales.filter((sale: any) => sale.order.id === orderId);
      console.log('Order Sales:', orderSales);
      
      if (orderSales.length === 0) {
        throw new Error('No media found for this order');
      }
      
      // Extract media from sales
      const orderMedia = orderSales.map((sale: any) => ({
        id: sale.media.id,
        type: sale.media.type,
        preview_url: sale.media.preview_url,
        media_name: sale.media.media_name || `${sale.media.type}_${sale.media.id}`
      }));
      
      console.log('Extracted Media:', orderMedia);
      setMedia(orderMedia);
      setSelectedIndex(0);
    } catch (err) {
      console.error('Error fetching order media:', err);
      setError(err instanceof Error ? err.message : 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setSelectedIndex(prev => prev > 0 ? prev - 1 : media.length - 1);
  };

  const handleNext = () => {
    setSelectedIndex(prev => prev < media.length - 1 ? prev + 1 : 0);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, media.length]);

  // Video hover handlers for desktop
  const handleVideoHover = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (isMobile) return;
    const video = e.currentTarget;
    video.currentTime = 0;
    video.play().catch(console.error);
  };

  const handleVideoLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (isMobile) return;
    const video = e.currentTarget;
    video.pause();
    video.currentTime = 0;
  };

  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.currentTime = 0;
    
    if (isMobile) {
      video.play().catch(console.error);
    }
  };

  if (!isOpen) return null;

  const selectedMedia = media[selectedIndex];
  const photos = media.filter(item => item.type === 'image');
  const videos = media.filter(item => item.type === 'video');

  return (
    <div className="fixed inset-0 z-50 bg-black h-screen w-screen overflow-hidden" style={{ margin: 0, padding: 0 }}>
      {/* Header - Fixed at top */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 md:p-6 bg-black text-white z-10 border-b border-gray-800">
        <div>
          <h2 className="text-lg md:text-xl font-semibold">Order #{orderId}</h2>
          <p className="text-sm text-gray-300">Customer: {customerName}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-full"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content - Positioned below header */}
      <div className="absolute top-20 left-0 right-0 bottom-0 bg-black">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Loading media...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-white text-center max-w-md">
              <div className="bg-red-600 bg-opacity-20 border border-red-500 rounded-lg p-6">
                <p className="text-red-400 mb-2 font-semibold">Error loading media</p>
                <p className="text-sm text-gray-300 mb-4">{error}</p>
                <button 
                  onClick={fetchOrderMedia}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : media.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-white text-center">
              <div className="bg-gray-600 bg-opacity-20 border border-gray-500 rounded-lg p-6">
                <p className="text-gray-300">No media found for this order</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Main Media Display */}
            <div className="flex-1 flex items-center justify-center relative px-4 md:px-16">
              {/* Navigation Arrows */}
              {media.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevious}
                    className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button 
                    onClick={handleNext}
                    className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}

              {/* Selected Media */}
              {selectedMedia && (
                <div className="max-h-full max-w-full flex items-center justify-center">
                  {selectedMedia.type === 'video' ? (
                    <video
                      src={selectedMedia.preview_url}
                      className="max-h-[calc(100vh-250px)] max-w-full object-contain rounded-lg"
                      controls={false}
                      autoPlay={isMobile}
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      onMouseEnter={handleVideoHover}
                      onMouseLeave={handleVideoLeave}
                      onLoadedMetadata={handleVideoLoadedMetadata}
                      style={{ 
                        userSelect: 'none', 
                        WebkitUserSelect: 'none',
                        WebkitTouchCallout: 'none',
                        WebkitUserDrag: 'none'
                      }}
                    />
                  ) : (
                    <img
                      src={selectedMedia.preview_url}
                      alt={selectedMedia.media_name}
                      className="max-h-[calc(100vh-250px)] max-w-full object-contain rounded-lg"
                      style={{ 
                        userSelect: 'none', 
                        WebkitUserSelect: 'none',
                        WebkitTouchCallout: 'none',
                        WebkitUserDrag: 'none'
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Bottom Info Bar */}
            <div className="bg-black text-white p-4 border-t border-gray-800">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-6">
                  <div className="text-sm">
                    <span className="text-gray-300">Media:</span>
                    <span className="ml-2 font-medium">{selectedIndex + 1} of {media.length}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-300">Type:</span>
                    <span className="ml-2 capitalize font-medium">{selectedMedia?.type}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div>
                    <span className="text-gray-300">Photos:</span>
                    <span className="ml-2 font-medium">{photos.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Videos:</span>
                    <span className="ml-2 font-medium">{videos.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Strip (Desktop only) */}
            {!isMobile && media.length > 1 && (
              <div className="bg-black bg-opacity-90 p-4 border-t border-gray-800">
                <div className="flex space-x-2 overflow-x-auto max-w-full justify-center">
                  {media.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all duration-200 ${
                        index === selectedIndex 
                          ? 'border-white shadow-lg scale-110' 
                          : 'border-transparent hover:border-gray-400 hover:scale-105'
                      }`}
                    >
                      {item.type === 'video' ? (
                        <div className="relative w-full h-full">
                          <video
                            src={item.preview_url}
                            className="w-full h-full object-cover"
                            muted
                            preload="metadata"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                              <div className="w-0 h-0 border-l-2 border-l-black border-y-1 border-y-transparent ml-0.5"></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.preview_url}
                          alt={item.media_name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderMediaModal;