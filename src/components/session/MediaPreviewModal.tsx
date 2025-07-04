import React, { useEffect, useRef } from 'react';
import { X, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Media, Session } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import PhotographerConflictModal from '../cart/PhotographerConflictModal';

interface MediaPreviewModalProps {
  media: Media;
  session: Session;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  isInCart: boolean;
  onToggleCart: (media: Media) => void;
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  media,
  session,
  onClose,
  onPrevious,
  onNext,
  isInCart,
  onToggleCart,
}) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if user is NOT a photographer (includes logged-out users and surfers)
  const showCartFeatures = !user?.isPhotographer;

  useEffect(() => {
    // Auto-play videos when modal opens
    if (media.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    }
  }, [media]);

  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable print screen and other screenshot shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Print Screen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+Shift+S (screenshot on some browsers)
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        return false;
      }
      
      // Disable F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Mobile-specific touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      // Prevent long press context menu on mobile
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Prevent any touch-based save actions
      e.preventDefault();
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Cleanup event listeners
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Cart icon components
  const EmptyCartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
  );

  const FullCartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_99_10923)">
        <path d="M6.15039 12.541C6.88958 12.6164 7.46663 13.241 7.4668 14C7.46666 14.8097 6.80971 15.4665 6 15.4668C5.24088 15.4666 4.61629 14.8897 4.54102 14.1504L4.5332 14L4.54102 13.8506C4.616 13.111 5.24067 12.5334 6 12.5332L6.15039 12.541ZM13.4834 12.541C14.2227 12.6162 14.8006 13.2408 14.8008 14C14.8006 14.8096 14.1435 15.4664 13.334 15.4668C12.5747 15.4668 11.9503 14.8898 11.875 14.1504L11.8672 14L11.875 13.8506C11.95 13.1109 12.5745 12.5332 13.334 12.5332L13.4834 12.541ZM6 13.8672C5.92662 13.8674 5.86736 13.9266 5.86719 14L5.87793 14.0518C5.89816 14.0994 5.94497 14.1337 6 14.1338C6.05514 14.1336 6.10294 14.0996 6.12305 14.0518L6.13379 14L6.12305 13.9482C6.10957 13.9165 6.08347 13.8914 6.05176 13.8779L6 13.8672ZM13.334 13.8672C13.2605 13.8672 13.2004 13.9265 13.2002 14L13.2109 14.0518C13.2312 14.0996 13.2788 14.1338 13.334 14.1338C13.3889 14.1335 13.436 14.0995 13.4561 14.0518L13.4668 14L13.4561 13.9482C13.4426 13.9168 13.4172 13.8915 13.3857 13.8779L13.334 13.8672ZM3.47363 -0.121094C3.79273 -0.0643774 4.05264 0.182823 4.11816 0.509766L4.65625 3.2002H15.334C15.5721 3.20044 15.7984 3.30675 15.9502 3.49023C16.1019 3.67389 16.1638 3.91635 16.1191 4.15039L15.0527 9.74316L15.0518 9.75C14.9541 10.2408 14.6866 10.6823 14.2969 10.9961C13.911 11.3066 13.4286 11.4717 12.9336 11.4658V11.4668H6.4541V11.4658C5.9591 11.4719 5.47682 11.3065 5.09082 10.9961C4.70128 10.6825 4.43377 10.2413 4.33594 9.75098L2.67773 1.4668H0.666992C0.225246 1.4668 -0.132681 1.10871 -0.132812 0.666992C-0.132812 0.225164 0.225164 -0.132812 0.666992 -0.132812H3.33398L3.47363 -0.121094Z" fill="currentColor"/>
      </g>
      <defs>
        <clipPath id="clip0_99_10923">
          <rect width="16" height="16" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 bg-white select-none">
      {/* Desktop Layout */}
      <div className="hidden md:block h-full">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <button 
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
          <button className="text-gray-600 hover:text-gray-800 transition-colors">
            <Share2 size={24} />
          </button>
        </div>

        {/* Main Content */}
        <div className="h-full flex flex-col pt-16 pb-24">
          {/* Media Container */}
          <div className="flex-1 flex items-center justify-center relative px-16 bg-white">
            {/* Navigation Arrows */}
            <button 
              onClick={onPrevious}
              className="absolute left-4 text-gray-600 hover:text-gray-800 transition-colors z-10"
            >
              <ChevronLeft size={36} />
            </button>
            <button 
              onClick={onNext}
              className="absolute right-4 text-gray-600 hover:text-gray-800 transition-colors z-10"
            >
              <ChevronRight size={36} />
            </button>

            {/* Media with Watermark */}
            <div className="relative max-h-full max-w-full">
              {media.type === 'video' ? (
                <video
                  ref={videoRef}
                  src={media.preview_url}
                  className="max-h-[calc(100vh-200px)] max-w-full object-contain rounded-lg"
                  controls={false}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                  onTouchEnd={(e) => e.preventDefault()}
                  style={{ 
                    userSelect: 'none', 
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    WebkitUserDrag: 'none',
                    pointerEvents: 'auto'
                  }}
                  onLoadedMetadata={(e) => {
                    // Ensure video starts from beginning and plays full duration
                    e.currentTarget.currentTime = 0;
                  }}
                />
              ) : (
                <img
                  src={media.preview_url}
                  alt={media.media_name}
                  className="max-h-[calc(100vh-200px)] max-w-full object-contain rounded-lg"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                  onTouchEnd={(e) => e.preventDefault()}
                  style={{ 
                    userSelect: 'none', 
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    WebkitUserDrag: 'none',
                    pointerEvents: 'auto'
                  }}
                />
              )}
              
              {/* Watermark */}
              <div 
                className="absolute inset-0 pointer-events-none mix-blend-overlay"
                style={{
                  background: `repeating-linear-gradient(
                    -45deg,
                    rgba(255, 255, 255, 0.3),
                    rgba(255, 255, 255, 0.3) 100px,
                    transparent 100px,
                    transparent 200px
                  )`
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <p 
                      key={i} 
                      className="text-white text-opacity-90 text-xl font-bold transform -rotate-45 whitespace-nowrap pointer-events-none"
                      style={{ 
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                        userSelect: 'none',
                        WebkitUserSelect: 'none'
                      }}
                    >
                      Waawave • {session.photographer.first_name} {session.photographer.last_name}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Info Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-white p-6">
            <div className="max-w-6xl mx-auto flex justify-between items-start">
              {/* Left Group */}
              <div className="grid grid-cols-4 gap-x-12 gap-y-1 text-sm">
                <div>
                  <div className="text-gray-500">Type</div>
                  <div className="font-medium">{media.type === 'video' ? 'Video' : 'Photo'}</div>
                </div>
                
                <div>
                  <div className="text-gray-500">Format</div>
                  <div className="font-medium">{media.media_name.split('.').pop()?.toUpperCase()}</div>
                </div>
                
                <div>
                  <div className="text-gray-500">Size</div>
                  <div className="font-medium">{formatFileSize(media.media_size)}</div>
                </div>
                
                <div>
                  <div className="text-gray-500">Dimensions</div>
                  <div className="font-medium">{media.natural_width} x {media.natural_height}</div>
                </div>
              </div>

              {/* Right Group - Only show for non-photographers (includes logged-out users) */}
              {showCartFeatures && (
                <div className="flex items-center space-x-8">
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {media.type === 'video' ? session.video_price : session.photo_price}€
                    </div>
                    <div className="text-sm text-gray-500">High-resolution</div>
                  </div>
                  
                  <button
                    onClick={() => onToggleCart(media)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 bg-white transition-colors ${
                      isInCart 
                        ? 'border-gray-800 text-gray-800 hover:bg-gray-50' 
                        : 'border-gray-800 text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {isInCart ? (
                      <FullCartIcon />
                    ) : (
                      <EmptyCartIcon />
                    )}
                    <span className="font-medium">
                      {isInCart ? 'Remove from cart' : 'Add to cart'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden h-full flex flex-col overflow-hidden">
        {/* Mobile Header - Fixed */}
        <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200 flex-shrink-0">
          <button 
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center space-x-2">
            <Share2 size={20} />
            <span className="text-gray-600">Share</span>
          </div>
        </div>

        {/* Mobile Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Mobile Media Container - Full Width */}
          <div className="relative w-full bg-white">
            {/* Navigation Arrows - Above image with transparency */}
            <button 
              onClick={onPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white z-20 bg-black/30 backdrop-blur-sm rounded-full p-3 hover:bg-black/50 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={onNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white z-20 bg-black/30 backdrop-blur-sm rounded-full p-3 hover:bg-black/50 transition-colors"
            >
              <ChevronRight size={24} />
            </button>

            {/* Mobile Media with Watermark - Full Width */}
            <div className="relative w-full">
              {media.type === 'video' ? (
                <video
                  ref={videoRef}
                  src={media.preview_url}
                  className="w-full h-auto object-contain"
                  controls={false}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                  onTouchEnd={(e) => e.preventDefault()}
                  style={{ 
                    userSelect: 'none', 
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    WebkitUserDrag: 'none',
                    pointerEvents: 'auto'
                  }}
                  onLoadedMetadata={(e) => {
                    e.currentTarget.currentTime = 0;
                  }}
                />
              ) : (
                <img
                  src={media.preview_url}
                  alt={media.media_name}
                  className="w-full h-auto object-contain"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                  onTouchEnd={(e) => e.preventDefault()}
                  style={{ 
                    userSelect: 'none', 
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    WebkitUserDrag: 'none',
                    pointerEvents: 'auto'
                  }}
                />
              )}
              
              {/* Mobile Watermark */}
              <div 
                className="absolute inset-0 pointer-events-none mix-blend-overlay"
                style={{
                  background: `repeating-linear-gradient(
                    -45deg,
                    rgba(255, 255, 255, 0.2),
                    rgba(255, 255, 255, 0.2) 60px,
                    transparent 60px,
                    transparent 120px
                  )`
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <p 
                      key={i} 
                      className="text-white text-opacity-80 text-sm font-bold transform -rotate-45 whitespace-nowrap pointer-events-none"
                      style={{ 
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                        userSelect: 'none',
                        WebkitUserSelect: 'none'
                      }}
                    >
                      Waawave • {session.photographer.first_name} {session.photographer.last_name}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Bottom Sheet - Scrollable Content - Only show for non-photographers (includes logged-out users) */}
          {showCartFeatures && (
            <div className="bg-white p-6 space-y-6">
              {/* Price and Add to Cart */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {media.type === 'video' ? session.video_price : session.photo_price}€
                  </div>
                  <div className="text-sm text-gray-500">High-resolution</div>
                </div>
                
                <button
                  onClick={() => onToggleCart(media)}
                  className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg border-2 transition-colors ${
                    isInCart 
                      ? 'border-gray-800 bg-gray-800 text-white' 
                      : 'border-gray-800 text-gray-800 bg-white hover:bg-gray-50'
                  }`}
                >
                  {isInCart ? (
                    <FullCartIcon />
                  ) : (
                    <EmptyCartIcon />
                  )}
                  <span className="font-medium">
                    {isInCart ? 'Remove from cart' : 'Add to cart'}
                  </span>
                </button>
              </div>

              {/* Media Details */}
              <div className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium">{media.type === 'video' ? 'Video' : 'Photo'}</span>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Format</span>
                  <span className="font-medium">{media.media_name.split('.').pop()?.toUpperCase()}</span>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Size</span>
                  <span className="font-medium">{formatFileSize(media.media_size)}</span>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Dimensions</span>
                  <span className="font-medium">{media.natural_width} x {media.natural_height}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional protection overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'transparent',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserDrag: 'none',
          KhtmlUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      />

      {/* Photographer Conflict Modal */}
      <PhotographerConflictModal />
    </div>
  );
};

export default MediaPreviewModal;