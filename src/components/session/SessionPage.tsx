import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Check, Home, MapPin } from 'lucide-react';
import { Session, Media } from '../../types';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import MediaPreviewModal from './MediaPreviewModal';
import PhotographerConflictModal from '../cart/PhotographerConflictModal';

const SessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addItem, removeItem, isInCart } = useCart();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'videos' | 'photos'>('all');
  const [isMobile, setIsMobile] = useState(false);

  // Check if user is NOT a photographer (includes logged-out users and surfers)
  const showCartFeatures = !user?.isPhotographer;

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
    const fetchSession = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/exploresessions/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch session data');
        }
        
        const data = await response.json();
        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSession();
    }
  }, [id]);

  const handleShare = async () => {
    if (!session) return;

    const locationName = session.tag === 'surflesson' 
      ? session.surfschool?.name 
      : session.location.name;

    const shareData = {
      title: `${locationName} - Surf Session`,
      text: `Check out this amazing surf session at ${locationName} on ${formatDate(session.session_date)}! ${session.image_count} photos and ${session.video_count} videos captured by ${session.photographer.first_name} ${session.photographer.last_name}.`,
      url: window.location.href
    };

    try {
      // Try Web Share API first (mobile devices)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
      
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (err) {
      // Final fallback - create a temporary input element
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const toggleCart = (media: Media) => {
    if (!session || !showCartFeatures) return;
    
    if (isInCart(media.id)) {
      removeItem(media.id);
    } else {
      addItem(media, session);
    }
  };

  const handleMediaClick = (media: Media) => {
    setSelectedMedia(media);
  };

  const handlePreviousMedia = () => {
    if (!session?.media || !selectedMedia) return;
    const filteredMedia = getFilteredMedia();
    const currentIndex = filteredMedia.findIndex(m => m.id === selectedMedia.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : filteredMedia.length - 1;
    setSelectedMedia(filteredMedia[previousIndex]);
  };

  const handleNextMedia = () => {
    if (!session?.media || !selectedMedia) return;
    const filteredMedia = getFilteredMedia();
    const currentIndex = filteredMedia.findIndex(m => m.id === selectedMedia.id);
    const nextIndex = currentIndex < filteredMedia.length - 1 ? currentIndex + 1 : 0;
    setSelectedMedia(filteredMedia[nextIndex]);
  };

  // Desktop hover handlers
  const handleVideoHover = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (isMobile) return; // Skip on mobile
    e.stopPropagation(); // Prevent triggering the media click
    const video = e.currentTarget;
    video.currentTime = 0; // Start from beginning
    video.play().catch(console.error); // Add error handling
  };

  const handleVideoLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (isMobile) return; // Skip on mobile
    e.stopPropagation(); // Prevent triggering the media click
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

  // Prevent right-click on media items (but allow video events)
  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isMobile) {
      e.preventDefault();
      return false;
    }
  };

  // Prevent drag start on media items (but allow video events)
  const handleDragStart = (e: React.DragEvent) => {
    if (!isMobile) {
      e.preventDefault();
      return false;
    }
  };

  // Mobile-specific touch event handlers (but allow video events)
  const handleTouchStart = (e: React.TouchEvent) => {
    // On mobile, don't prevent touch events to allow normal interaction
    if (!isMobile) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // On mobile, don't prevent touch events to allow normal interaction
    if (!isMobile) {
      e.preventDefault();
    }
  };

  const getFilteredMedia = (): Media[] => {
    if (!session?.media) return [];
    
    switch (mediaFilter) {
      case 'videos':
        return session.media.filter(item => item.type === 'video');
      case 'photos':
        return session.media.filter(item => item.type === 'image');
      default:
        return session.media;
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="bg-red-50 text-red-600 p-4 rounded-md inline-block max-w-lg">
            <p>Error loading session: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  const isSurfLesson = session.tag === 'surflesson';
  const filteredMedia = getFilteredMedia();

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header - Moved further down from navbar */}
      <div className="pt-24">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/sessions" className="text-gray-600 hover:text-primary-dark transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <button 
              onClick={handleShare}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-gray-600 hover:text-primary-dark hover:border-gray-400 transition-colors"
              title="Share session"
            >
              {shareSuccess ? (
                <>
                  <Check size={20} className="text-green-600" />
                  <span className="text-green-600 text-sm">Shared</span>
                </>
              ) : (
                <>
                  <Share2 size={20} />
                  <span className="text-sm">Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Session Title with Icon */}
          <div className="flex items-center">
            {isSurfLesson ? (
              <Home size={24} className="mr-2 text-gray-600" />
            ) : (
              <MapPin size={24} className="mr-2 text-gray-600" />
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {isSurfLesson ? session.surfschool?.name : session.location.name}
            </h1>
          </div>
          
          {/* Date and Time */}
          <p className="text-gray-600">
            {formatDate(session.session_date)} - {formatTime(session.start_hour)} to {formatTime(session.end_hour)}
          </p>
          
          {/* Photographer name and media counts */}
          <div className="flex items-center space-x-4">
            <Link 
              to={`/photographer/${session.photographer.id}`}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-dark transition-colors"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <img 
                  src={session.photographer.profile_photo.url}
                  alt={`${session.photographer.first_name} ${session.photographer.last_name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm">{session.photographer.first_name} {session.photographer.last_name}</span>
            </Link>
            
            {/* Media counts */}
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{session.image_count}</span>
              </div>
              {session.video_count > 0 && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>{session.video_count}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Media Filter Buttons */}
        <div className="flex justify-center space-x-3 mt-8 mb-8">
          <button
            onClick={() => setMediaFilter('all')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              mediaFilter === 'all' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setMediaFilter('videos')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              mediaFilter === 'videos' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => setMediaFilter('photos')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              mediaFilter === 'photos' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Photos
          </button>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item: Media) => (
            <div 
              key={item.id} 
              className={`relative group ${isMobile ? 'cursor-pointer' : 'cursor-pointer select-none'}`}
              onClick={() => handleMediaClick(item)}
              onContextMenu={handleContextMenu}
              onDragStart={handleDragStart}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{
                ...(isMobile ? {} : {
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  KhtmlUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  userSelect: 'none',
                  WebkitUserDrag: 'none',
                  WebkitTapHighlightColor: 'transparent'
                })
              }}
            >
              {item.type === 'video' ? (
                <video
                  src={item.preview_url}
                  className="w-full aspect-[4/3] object-cover rounded-lg"
                  muted
                  loop={isMobile} // Enable loop on mobile
                  playsInline
                  preload="metadata"
                  onMouseEnter={handleVideoHover}
                  onMouseLeave={handleVideoLeave}
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  style={{ 
                    ...(isMobile ? {} : {
                      userSelect: 'none', 
                      WebkitUserSelect: 'none',
                      WebkitTouchCallout: 'none',
                      WebkitUserDrag: 'none',
                      WebkitTapHighlightColor: 'transparent'
                    }),
                    pointerEvents: 'auto' // Allow video events
                  }}
                />
              ) : (
                <img
                  src={item.preview_url}
                  alt={item.media_name}
                  className="w-full aspect-[4/3] object-cover rounded-lg"
                  style={{ 
                    ...(isMobile ? {} : {
                      userSelect: 'none', 
                      WebkitUserSelect: 'none',
                      WebkitTouchCallout: 'none',
                      WebkitUserDrag: 'none',
                      WebkitTapHighlightColor: 'transparent'
                    })
                  }}
                />
              )}
              
              {item.type === 'video' && (
                <div 
                  className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm pointer-events-none"
                  style={{
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none'
                  }}
                >
                  Video
                </div>
              )}
              
              {/* Add to Cart Button - Only show for non-photographers (includes logged-out users) */}
              {showCartFeatures && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCart(item);
                  }}
                  className={`absolute bottom-2 right-2 p-2 rounded-full transition-all duration-300 ${
                    isInCart(item.id) 
                      ? 'bg-primary text-white opacity-100' 
                      : 'bg-black/50 text-white md:opacity-0 md:group-hover:opacity-100 opacity-100'
                  }`}
                  style={{
                    WebkitTouchCallout: 'none',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  {isInCart(item.id) ? (
                    <FullCartIcon />
                  ) : (
                    <EmptyCartIcon />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* No results message */}
        {filteredMedia.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-50 p-8 rounded-lg inline-block">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {mediaFilter === 'videos' ? 'videos' : mediaFilter === 'photos' ? 'photos' : 'media'} found
              </h3>
              <p className="text-gray-600">
                {mediaFilter === 'videos' && 'This session doesn\'t contain any videos.'}
                {mediaFilter === 'photos' && 'This session doesn\'t contain any photos.'}
                {mediaFilter === 'all' && 'This session doesn\'t contain any media.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Media Preview Modal */}
      {selectedMedia && session && (
        <MediaPreviewModal
          media={selectedMedia}
          session={session}
          onClose={() => setSelectedMedia(null)}
          onPrevious={handlePreviousMedia}
          onNext={handleNextMedia}
          isInCart={isInCart(selectedMedia.id)}
          onToggleCart={toggleCart}
        />
      )}

      {/* Photographer Conflict Modal */}
      <PhotographerConflictModal />
    </div>
  );
};

export default SessionPage;