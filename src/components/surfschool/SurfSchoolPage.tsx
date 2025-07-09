import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Globe, Phone, Instagram, Check } from 'lucide-react';
import { SurfSchoolResponse } from '../../types';
import SessionCard from '../sessions/SessionCard';
import { formatDate, formatTime } from '../../utils/dateUtils'; 

const SurfSchoolPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<SurfSchoolResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [phoneSuccess, setPhoneSuccess] = useState(false);
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
    const fetchSurfSchool = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/surfschool/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch surf school data');
        }
        
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSurfSchool();
    }
  }, [id]);

  // Filter sessions to show only those created in the last 7 days
  const getFilteredSessions = () => {
    if (!data?.sessions) return [];
    
    const sevenDaysAgo = Date.now() - (86400000 * 7); // Current time minus 7 days in milliseconds
    
    return data.sessions.filter(session => {
      // Check if session has created_at field and if it's within the last 7 days
      if (session.created_at) {
        const sessionCreatedAt = new Date(session.created_at).getTime();
        return sessionCreatedAt > sevenDaysAgo;
      }
      // Fallback to session_date if created_at is not available
      const sessionDate = new Date(session.session_date).getTime();
      return sessionDate > sevenDaysAgo;
    });
  };

  const handleShare = async () => {
    if (!data) return;

    const { surfschool, sessions } = data;

    const shareData = {
      title: `${surfschool.name} - Surf School`,
      text: `Check out ${surfschool.name} surf school in ${surfschool.Location_name}! ${sessions.length} amazing surf sessions available on Waawave.`,
      url: window.location.href
    };

    try {
      // On desktop, directly copy to clipboard
      if (!isMobile) {
        const pureUrl = window.location.href;
        await navigator.clipboard.writeText(pureUrl);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
        return;
      }
      
      // On mobile, try Web Share API
      if (isMobile && navigator.share) {
        // Use only the pure URL for sharing
        const pureUrl = window.location.href;
        await navigator.share({
          url: pureUrl
        });
        return;
      }
      
      // Fallback to clipboard
      const pureUrl = window.location.href;
      await navigator.clipboard.writeText(pureUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (err) {
      // Final fallback - create a temporary input element
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href; // Pure URL
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const handlePhoneClick = async (phoneNumber: string) => {
    try {
      // Try to copy to clipboard
      await navigator.clipboard.writeText(phoneNumber);
      setPhoneSuccess(true);
      setTimeout(() => setPhoneSuccess(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = phoneNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setPhoneSuccess(true);
      setTimeout(() => setPhoneSuccess(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="bg-red-50 text-red-600 p-4 rounded-md inline-block max-w-lg">
            <p>Error loading surf school: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { surfschool, sessions } = data;
  const filteredSessions = getFilteredSessions();
  const totalSessions = sessions.length;
  const liveSessions = filteredSessions.length;

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
              title="Share surf school"
            >
              {shareSuccess ? (
                <>
                  <Check size={20} className="text-green-600" />
                  <span className="text-green-600 text-sm">Link copied!</span>
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

      {/* Surf School Info */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Logo */}
          <div className="w-24 h-24 rounded-full overflow-hidden">
            <img
              src={surfschool.logo.url}
              alt={surfschool.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Name */}
          <h1 className="text-2xl font-bold text-gray-900">
            {surfschool.name}
          </h1>
          
          {/* Location */}
          <p className="text-gray-500">{surfschool.Location_name}</p>
          
          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {surfschool.website && (
              <a 
                href={surfschool.website.startsWith('http') ? surfschool.website : `https://${surfschool.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary-dark transition-colors"
                title="Visit website"
              >
                <Globe size={20} />
              </a>
            )}
            {surfschool.phone_number && (
              <button
                onClick={() => handlePhoneClick(surfschool.phone_number!)}
                className="text-gray-600 hover:text-primary-dark transition-colors relative"
                title={phoneSuccess ? 'Phone number copied!' : 'Copy phone number'}
              >
                {phoneSuccess ? (
                  <Check size={20} className="text-green-600" />
                ) : (
                  <Phone size={20} />
                )}
              </button>
            )}
            {surfschool.instagram && (
              <a 
                href={`https://instagram.com/${surfschool.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary-dark transition-colors"
                title="Visit Instagram"
              >
                <Instagram size={20} />
              </a>
            )}
          </div>
          
          {/* Phone number display when copied */}
          {phoneSuccess && surfschool.phone_number && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md text-sm">
              Phone number copied: {surfschool.phone_number}
            </div>
          )}
        </div>
      </div>

      {/* Sessions Count - Updated to show live vs total sessions */}
      <div className="container mx-auto px-4 mb-6">
        <p className="text-gray-500 text-center md:text-left">
          {liveSessions} Live Sessions · {totalSessions} Total Published Sessions
        </p>
      </div>

      {/* Sessions Grid - Only show filtered sessions */}
      <div className="container mx-auto px-4">
        {filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                formatDate={formatDate}
                formatTime={formatTime}
                isSurfSchoolPage={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-blue-50 text-blue-600 p-8 rounded-md inline-block max-w-lg">
              <h3 className="text-xl font-semibold mb-2">No recent sessions</h3>
              <p>
                {totalSessions > 0 
                  ? `This surf school has published ${totalSessions} session${totalSessions !== 1 ? 's' : ''} in the past, but none from the last 7 days.`
                  : 'This surf school hasn\'t published any sessions yet.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurfSchoolPage;