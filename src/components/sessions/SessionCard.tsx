import React from 'react';
import { Session } from '../../types';
import { Home, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SessionCardProps {
  session: Session;
  formatDate: (date: string) => string;
  formatTime: (hour: number) => string;
  isPhotographerPage?: boolean;
  isSurfSchoolPage?: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({ 
  session, 
  formatDate, 
  formatTime, 
  isPhotographerPage = false,
  isSurfSchoolPage = false 
}) => {
  const { tag, cover_images, surfschool, location, session_date, start_hour, end_hour, photographer } = session;
  const isSurfLesson = tag === 'surflesson';
  
  const handleVideoHover = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.currentTime = 0; // Start from beginning
    video.play();
  };

  const handleVideoLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.pause();
    video.currentTime = 0; // Reset to beginning
  };
  
  return (
    <Link to={`/session/${session.id}`} className="block">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group">
        {/* Session tag badge */}
        <div className="relative">
          {isSurfLesson && (
            <div className="absolute top-3 right-3 z-10">
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Surf Lesson
              </span>
            </div>
          )}
          
          {/* Images grid */}
          <div className="aspect-[4/3] grid grid-cols-2 grid-rows-2 overflow-hidden">
            {cover_images && cover_images.length > 0 ? (
              cover_images.map((image, index) => {
                return (
                  <img 
                    key={index}
                    src={image.url}
                    alt={`Surf session ${index + 1}`}
                    className="w-full h-full object-cover block"
                    style={{ margin: 0, padding: 0, display: 'block' }}
                  />
                );
              })
            ) : (
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="bg-gray-200 w-full h-full flex items-center justify-center" style={{ margin: 0, padding: 0 }}>
                  <span className="text-gray-400">No image</span>
                </div>
              ))
            )}
            
            {/* Photographer info overlay - Always visible on mobile, hover on desktop */}
            {!isPhotographerPage && !isSurfSchoolPage && (
              <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full flex items-center space-x-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                <Link 
                  to={`/photographer/${photographer?.id}`} 
                  className="flex items-center space-x-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <img 
                      src={photographer?.profile_photo.url} 
                      alt={`${photographer?.first_name} ${photographer?.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm">{photographer?.first_name} {photographer?.last_name}</span>
                </Link>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs">{session.image_count}</span>
                </div>
                {session.video_count > 0 && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">{session.video_count}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Session info */}
        <div className="p-4">
          <div className="flex items-center mb-1 text-gray-600">
            {isSurfLesson ? (
              <>
                <Home size={16} className="mr-1.5" />
                <Link 
                  to={`/surfschool/${surfschool?.id}`} 
                  className="text-sm font-medium hover:text-blue-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {surfschool?.name}
                </Link>
              </>
            ) : (
              <>
                <MapPin size={16} className="mr-1.5" />
                <span className="text-sm font-medium">
                  {location?.name} - {location?.region}, {location?.country}
                </span>
              </>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(session_date)} - {formatTime(start_hour)} to {formatTime(end_hour)}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SessionCard;