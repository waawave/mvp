import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDate } from '../../../utils/dateUtils';
import { ArrowDown, Download } from 'lucide-react';
import VideoPlayerModal from './VideoPlayerModal';

interface Media {
  id: number;
  media: {
    preview_url: string;
    type: string;
  };
  session: {
    location_id: number;
    session_date: string;
    surfschool_id: number | null;
    surfschool?: {
      name: string;
    };
    location?: {
      name: string;
    };
  };
  photographer: {
    first_name: string;
    last_name: string;
    profile_photo: {
      url: string;
    };
  };
}

interface DownloadResponse {
  url: string;
  expires_at: number;
}

const MyMedia: React.FC = () => {
  const { authToken } = useAuth();
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingItems, setDownloadingItems] = useState<Set<number>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [videoPlayerModal, setVideoPlayerModal] = useState<{
    isOpen: boolean;
    videoUrl: string;
    videoTitle: string;
    itemId: number;
  }>({
    isOpen: false,
    videoUrl: '',
    videoTitle: '',
    itemId: 0
  });

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
    const fetchMedia = async () => {
      try {
        const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/surfer/mymedia', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch media');
        }

        const data = await response.json();
        
        // Sort media by media.id from highest to lowest (most recent purchases first)
        const sortedMedia = (data.media || []).sort((a, b) => {
          return b.id - a.id; // Highest ID first
        });
        
        setMedia(sortedMedia);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [authToken]);

  const fetchMedia = async () => {
    try {
      const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/surfer/mymedia', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }

      const data = await response.json();
      
      // Sort media by media.id from highest to lowest (most recent purchases first)
      const sortedMedia = (data.media || []).sort((a, b) => {
        return b.id - a.id; // Highest ID first
      });
      
      setMedia(sortedMedia);
    } catch (err) {
      console.error('Error refreshing media:', err);
    }
  };

  const getDownloadUrl = async (item: Media): Promise<string> => {
    // Create URL with query parameter for GET request
    const downloadUrl = new URL('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/media/download');
    downloadUrl.searchParams.append('media', item.media.preview_url);

    // Make GET request to get download URL
    const response = await fetch(downloadUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get download URL');
    }

    const downloadData: DownloadResponse = await response.json();

    // Check if URL has expired
    if (Date.now() > downloadData.expires_at) {
      throw new Error('Download link has expired');
    }

    return downloadData.url;
  };

  const handleDownload = async (item: Media) => {
    try {
      // Add item to downloading state
      setDownloadingItems(prev => new Set(prev).add(item.id));

      const downloadUrl = await getDownloadUrl(item);

      // Check if it's a video on mobile
      if (isMobile && item.media.type === 'video') {
        // Open video player modal
        const videoTitle = `${item.photographer.first_name} ${item.photographer.last_name} - ${
          item.session.surfschool_id
            ? item.session.surfschool?.name
            : item.session.location?.name
        }`;
        
        setVideoPlayerModal({
          isOpen: true,
          videoUrl: downloadUrl,
          videoTitle,
          itemId: item.id
        });
      } else if (isMobile) {
        // Mobile images: Open media URL in the same window
        window.location.href = downloadUrl;
      } else {
        // Desktop: Trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // Extract filename from the original preview URL or create a default name
        const urlParts = item.media.preview_url.split('/');
        const originalFilename = urlParts[urlParts.length - 1];
        const fileExtension = item.media.type === 'video' ? '.mp4' : '.jpg';
        const filename = originalFilename.includes('.') 
          ? originalFilename 
          : `waawave_media_${item.id}${fileExtension}`;
        
        link.download = filename;
        link.target = '_blank';
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    } catch (err) {
      console.error('Download error:', err);
      alert(err instanceof Error ? err.message : 'Failed to download media');
    } finally {
      // Remove item from downloading state (unless it's a video modal)
      if (!(isMobile && item.media.type === 'video')) {
        setDownloadingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(item.id);
          return newSet;
        });
      }
    }
  };

  const handleVideoDownload = async () => {
    try {
      const currentItem = media.find(item => item.id === videoPlayerModal.itemId);
      if (!currentItem) return;

      const downloadUrl = await getDownloadUrl(currentItem);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Extract filename from the original preview URL or create a default name
      const urlParts = currentItem.media.preview_url.split('/');
      const originalFilename = urlParts[urlParts.length - 1];
      const filename = originalFilename.includes('.') 
        ? originalFilename 
        : `waawave_video_${currentItem.id}.mp4`;
      
      link.download = filename;
      link.target = '_blank';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Video download error:', err);
      alert(err instanceof Error ? err.message : 'Failed to download video');
    }
  };

  const handleVideoModalClose = () => {
    setVideoPlayerModal({
      isOpen: false,
      videoUrl: '',
      videoTitle: '',
      itemId: 0
    });
    
    // Remove from downloading state
    setDownloadingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(videoPlayerModal.itemId);
      return newSet;
    });
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
          <p>Error loading media: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Media</h2>
      
      {media.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 p-8 rounded-lg inline-block">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No media found</h3>
            <p className="text-gray-600">You haven't purchased any photos or videos yet.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {media.map((item) => {
            const isDownloading = downloadingItems.has(item.id);
            
            return (
              <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="aspect-[4/3] relative group">
                  {item.media.type === 'video' ? (
                    <video
                      src={item.media.preview_url}
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
                  ) : (
                    <img
                      src={item.media.preview_url}
                      alt="Surf media"
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Video indicator */}
                  {item.media.type === 'video' && (
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      VIDEO
                    </div>
                  )}
                  
                  {/* Download button - Always visible on mobile, hover on desktop */}
                  <button 
                    onClick={() => handleDownload(item)}
                    disabled={isDownloading}
                    className={`absolute bottom-3 right-3 p-2 rounded-full shadow-lg transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 ${
                      isDownloading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-white/90 hover:bg-white'
                    }`}
                    title={isDownloading ? 'Loading...' : isMobile && item.media.type === 'video' ? 'Play video' : isMobile ? 'Open media' : 'Download high-resolution file'}
                  >
                    {isDownloading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                    ) : (
                      <ArrowDown size={20} className="text-gray-700" />
                    )}
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <img
                        src={item.photographer.profile_photo.url}
                        alt={`${item.photographer.first_name} ${item.photographer.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm text-gray-700">
                      {item.photographer.first_name} {item.photographer.last_name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.session.surfschool_id
                      ? item.session.surfschool?.name
                      : item.session.location?.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(item.session.session_date)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={videoPlayerModal.isOpen}
        onClose={handleVideoModalClose}
        videoUrl={videoPlayerModal.videoUrl}
        videoTitle={videoPlayerModal.videoTitle}
        onDownload={handleVideoDownload}
        isDownloading={downloadingItems.has(videoPlayerModal.itemId)}
      />
    </div>
  );
};

export default MyMedia;