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
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [noSessionsForFilter, setNoSessionsForFilter] = useState(false);
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
        
        // Sort sessions by session_date from most recent to oldest
        const sortedSessions = data.sessions.sort((a, b) => {
          const dateA = new Date(a.session_date).getTime();
          const dateB = new Date(b.session_date).getTime();
          return dateB - dateA; // Most recent first (descending order)
        });
        
        setSessions(sortedSessions);
        setFilteredSessions(sortedSessions);
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
    
    // Apply date filter if set
    if (dateFilter !== null) {
      // Convert both to YYYY-MM-DD format for comparison
      const filterDate = dateFilter.split('T')[0];
      result = result.filter(session => {
        const sessionDate = new Date(session.session_date).toISOString().split('T')[0];
        return sessionDate === filterDate;
      });
    }
    
    // Maintain the date sorting after filtering
    result.sort((a, b) => {
      const dateA = new Date(a.session_date).getTime();
      const dateB = new Date(b.session_date).getTime();
      
      // First sort by date (most recent first)
      if (dateA !== dateB) {
        return dateB - dateA;
      }
      
      // If same date, sort by start_hour (latest first)
      return b.start_hour - a.start_hour;
    });
    
    setFilteredSessions(result);
    
    // Check if we have no sessions for a specific filter
    if (locationFilter !== null && result.length === 0) {
      setNoSessionsForFilter(true);
    } else {
      setNoSessionsForFilter(false);
    }
    
  }, [sessions, locationFilter, tagFilter, dateFilter]);

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
    noSessionsForFilter,
    setLocationFilter,
    setTagFilter,
    setDateFilter,
    loadMore,
    formatDate,
    formatTime,
  };
};

export default useSessions;