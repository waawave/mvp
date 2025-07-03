import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDate } from '../../../utils/dateUtils';
import { ExternalLink } from 'lucide-react';
import OrderMediaModal from './OrderMediaModal';

interface OrderGroup {
  orderId: number;
  reference: string;
  customerName: string;
  dateOfPlacement: string;
  totalPrice: number;
  imageCount: number;
  videoCount: number;
  previewUrl: string;
  previewType: string; // Added to track if preview is image or video
  receiptUrl?: string;
}

const SalesHistory: React.FC = () => {
  const { authToken } = useAuth();
  const [orders, setOrders] = useState<OrderGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderGroup | null>(null);
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
    const fetchSales = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/my-sales', {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch sales');
        }

        const data = await response.json();

        // Group sales by order
        const orderMap = new Map<number, OrderGroup>();

        data.sales.forEach((sale: any) => {
          const orderId = sale.order.id;
          
          if (!orderMap.has(orderId)) {
            orderMap.set(orderId, {
              orderId,
              reference: sale.order.reference,
              customerName: `${sale.order.surfer_name}`,
              dateOfPlacement: sale.order.date_of_placement,
              totalPrice: sale.order.total_price,
              imageCount: 0,
              videoCount: 0,
              previewUrl: sale.media.preview_url,
              previewType: sale.media.type, // Store the type of the first media item
              receiptUrl: sale.order.receipt_url
            });
          }

          const order = orderMap.get(orderId)!;
          if (sale.media.type === 'video') {
            order.videoCount++;
          } else {
            order.imageCount++;
          }
        });

        // Convert to array and sort by date (most recent first)
        const ordersArray = Array.from(orderMap.values());
        
        // Sort by date of placement - most recent first
        const sortedOrders = ordersArray.sort((a, b) => {
          const dateA = new Date(a.dateOfPlacement).getTime();
          const dateB = new Date(b.dateOfPlacement).getTime();
          return dateB - dateA; // Most recent first (descending order)
        });

        setOrders(sortedOrders);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [authToken]);

  const handleViewReceipt = (receiptUrl: string) => {
    window.open(receiptUrl, '_blank', 'noopener,noreferrer');
  };

  const handleMediaCountClick = (order: OrderGroup) => {
    setSelectedOrder(order);
  };

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
          <p>Error loading sales history: {error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Sales History</h2>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sales yet</h3>
            <p className="text-gray-600">
              Keep capturing those perfect waves! Your first sale is just around the corner. 🌊
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sales History</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.orderId} className="bg-white rounded-lg shadow-sm p-4 flex items-center">
            {/* Preview Media - Handle both images and videos */}
            <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 relative">
              {order.previewType === 'video' ? (
                <div className="relative w-full h-full">
                  <video
                    src={order.previewUrl}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    autoPlay={isMobile}
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
                  src={order.previewUrl}
                  alt="Order preview"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            <div className="flex-1 ml-4">
              <div className="font-medium">Order #{order.orderId}</div>
              <div className="text-gray-600 text-sm">Customer: {order.customerName}</div>
              <div className="text-gray-600 text-sm">
                <button
                  onClick={() => handleMediaCountClick(order)}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                  title="View order media"
                >
                  {order.imageCount} Photos, {order.videoCount} Videos
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-600 text-sm">{formatDate(order.dateOfPlacement)}</div>
              <div className="font-medium">€{order.totalPrice.toFixed(2)}</div>
              <div className="mt-2">
                {order.receiptUrl ? (
                  <button 
                    onClick={() => handleViewReceipt(order.receiptUrl!)}
                    className="text-blue-600 text-sm hover:text-blue-800 transition-colors inline-flex items-center space-x-1"
                  >
                    <span>Order Receipt</span>
                    <ExternalLink size={12} />
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">Receipt not available</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Media Modal */}
      {selectedOrder && (
        <OrderMediaModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          orderId={selectedOrder.orderId}
          orderReference={selectedOrder.reference}
          customerName={selectedOrder.customerName}
        />
      )}
    </div>
  );
};

export default SalesHistory;