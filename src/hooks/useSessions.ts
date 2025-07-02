import { useState, useEffect } from 'react';
import { Session, SessionsResponse } from '../types';

const API_URL = 'https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/exploresessions';

export const useSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<number | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        
        const data: SessionsResponse = await response.json();
        setSessions(data.sessions);
        setFilteredSessions(data.sessions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  useEffect(() => {
    let result = [...sessions];
    
    if (locationFilter !== null) {
      if (locationFilter > 0) {
        // Positive number = location filter
        result = result.filter(session => session.location_id === locationFilter);
      } else {
        // Negative number = surf school filter (convert back to positive)
        const surfSchoolId = Math.abs(locationFilter);
        result = result.filter(session => session.surfschool_id === surfSchoolId);
      }
    }
    
    if (tagFilter !== null) {
      if (tagFilter === 'surflesson') {
        result = result.filter(session => session.tag === 'surflesson');
      } else if (tagFilter === 'freesurf') {
        result = result.filter(session => session.tag === 'freesurf');
      }
    }
    
    setFilteredSessions(result);
  }, [sessions, locationFilter, tagFilter]);

  const formatDate = (dateString: string) => {
    const sessionDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (sessionDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (sessionDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return sessionDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}`;
  };

  const loadMore = () => {
    setVisibleCount(prevCount => prevCount + 6);
  };

  return {
    sessions: filteredSessions.slice(0, visibleCount),
    loading,
    error,
    hasMore: visibleCount < filteredSessions.length,
    setLocationFilter,
    setTagFilter,
    loadMore,
    formatDate,
    formatTime,
  };
};

export default useSessions;