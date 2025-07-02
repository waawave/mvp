import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDate } from '../../../utils/dateUtils';
import { ExternalLink } from 'lucide-react';

interface Order {
  id: number;
  total_price: number;
  date_of_placement: string;
  reference: string;
  receipt_url?: string; // Added receipt_url field
  media: Array<{
    id: number;
    type: string;
    preview_url: string;
  }>;
}

interface PurchaseHistoryResponse {
  surfer: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  orders: Order[];
}

const PurchaseHistory: React.FC = () => {
  const { authToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const ordersPerPage = 4;

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
    const fetchPurchaseHistory = async () => {
      try {
        const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/surfer/history', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch purchase history');
        }

        const data: PurchaseHistoryResponse = await response.json();
        
        // Sort orders by ID from biggest to smallest (most recent first)
        const sortedOrders = (data.orders || []).sort((a, b) => b.id - a.id);
        setOrders(sortedOrders);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, [authToken]);

  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const getMediaCounts = (media: Order['media']) => {
    const photos = media.filter(item => item.type === 'image').length;
    const videos = media.filter(item => item.type === 'video').length;
    return { photos, videos };
  };

  const handleViewReceipt = (receiptUrl: string) => {
    // Open receipt in a new window/tab
    window.open(receiptUrl, '_blank', 'noopener,noreferrer');
  };

  // Video hover handlers for desktop
  const handleVideoHover = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (isMobile) return; // Skip on mobile
    const video = e.currentTarget;
    video.currentTime = 0; // Start from beginning
    video.play().catch(console.error);
  };

  const handleVideoLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (isMobile) return; // Skip on mobile
    const video = e.currentTarget;
    video.pause();
    video.currentTime = 0; // Reset to beginning
  };

  // Mobile video setup
  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.currentTime = 0;
    
    // On mobile, start playing automatically in loop
    if (isMobile) {
      video.play().catch(console.error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-600 p-4 rounded-md inline-block">
          <p>Error loading purchase history: {error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 p-8 rounded-lg inline-block">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No purchases yet</h3>
          <p className="text-gray-600">You haven't made any purchases yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Purchase History</h2>
      
      <div className="space-y-4">
        {currentOrders.map((order) => {
          const { photos, videos } = getMediaCounts(order.media);
          const previewMedia = order.media[0];
          
          return (
            <div key={order.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                  {previewMedia ? (
                    previewMedia.type === 'video' ? (
                      <div className="relative w-full h-full">
                        <video
                          src={previewMedia.preview_url}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          autoPlay={isMobile} // Auto-play on mobile
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
                        {/* Video indicator */}
                        <div className="absolute top-1 left-1 bg-black/50 text-white px-1 py-0.5 rounded text-xs">
                          VIDEO
                        </div>
                      </div>
                    ) : (
                      <img
                        src={previewMedia.preview_url}
                        alt="Order preview"
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-xs">No preview</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow">
                  <div className="font-medium">Order #{order.id}</div>
                  <div className="text-gray-600 text-sm">
                    {photos} Photos, {videos} Video{videos !== 1 ? 's' : ''}
                  </div>
                  <div className="text-gray-500 text-sm">Ref: {order.reference}</div>
                </div>
                
                <div className="text-right">
                  <div className="text-gray-600 text-sm">{formatDate(order.date_of_placement)}</div>
                  <div className="font-medium">€{order.total_price.toFixed(2)}</div>
                  <div className="mt-2 space-x-4">
                    {order.receipt_url ? (
                      <button 
                        onClick={() => handleViewReceipt(order.receipt_url!)}
                        className="text-blue-600 text-sm hover:text-blue-800 transition-colors inline-flex items-center space-x-1"
                      >
                        <span>More Details</span>
                        <ExternalLink size={12} />
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">Receipt not available</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="text-gray-500 hover:text-blue-600 disabled:text-gray-300"
          >
            ←
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-full ${
                currentPage === page
                  ? 'bg-black text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="text-gray-500 hover:text-blue-600 disabled:text-gray-300"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;