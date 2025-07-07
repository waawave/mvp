import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Check, Globe, Instagram } from 'lucide-react';
import { Photographer } from '../../types';
import SessionCard from '../sessions/SessionCard';
import { formatDate, formatTime } from '../../utils/dateUtils';

const PhotographerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    const fetchPhotographer = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/explorephotographers/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch photographer data');
        }
        
        const data = await response.json();
        setPhotographer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPhotographer();
    }
  }, [id]);

  const handleShare = async () => {
    if (!photographer) return;

    const shareData = {
      title: `${photographer.first_name} ${photographer.last_name} - Surf Photographer`,
      text: `Check out ${photographer.first_name} ${photographer.last_name}'s surf photography on Waawave! ${photographer.sessions?.length || 0} amazing sessions captured.`,
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

  // Filter sessions to show only those created in the last 7 days
  const getFilteredSessions = () => {
    if (!photographer?.sessions) return [];
    
    const sevenDaysAgo = Date.now() - (86400000 * 7); // Current time minus 7 days in milliseconds
    
    return photographer.sessions.filter(session => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !photographer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="bg-red-50 text-red-600 p-4 rounded-md inline-block max-w-lg">
            <p>Error loading photographer: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredSessions = getFilteredSessions();
  const totalSessions = photographer.sessions?.length || 0;
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
              title="Share photographer"
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

      {/* Photographer Info */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Profile Photo */}
          <div className="w-24 h-24 rounded-full overflow-hidden">
            <img
              src={photographer.profile_photo.url}
              alt={`${photographer.first_name} ${photographer.last_name}`}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Name */}
          <h1 className="text-2xl font-bold text-gray-900">
            {photographer.first_name} {photographer.last_name}
          </h1>
          
          {/* Location */}
          {photographer.location && (
            <p className="text-gray-600">{photographer.location}, Portugal</p>
          )}
          
          {/* Website and Instagram Links */}
          <div className="flex items-center space-x-6">
            {photographer.website && (
              <a 
                href={photographer.website.startsWith('http') ? photographer.website : `https://${photographer.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-dark transition-colors"
              >
                <Globe size={20} />
                <span className="text-sm">Website</span>
              </a>
            )}
            {photographer.instagram && (
              <a 
                href={`https://instagram.com/${photographer.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-dark transition-colors"
              >
                <Instagram size={20} />
                <span className="text-sm">Instagram</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Sessions Count - Updated to show live vs total sessions */}
      <div className="container mx-auto px-4 mb-6">
        <p className="text-gray-500 text-center md:text-left">
          {liveSessions} Live Sessions · {totalSessions} Published Sessions
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
                isPhotographerPage={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-blue-50 text-blue-600 p-8 rounded-md inline-block max-w-lg">
              <h3 className="text-xl font-semibold mb-2">No recent sessions</h3>
              <p>
                {totalSessions > 0 
                  ? `This photographer has published ${totalSessions} session${totalSessions !== 1 ? 's' : ''} in the past, but none from the last 7 days.`
                  : 'This photographer hasn\'t published any sessions yet.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotographerPage;