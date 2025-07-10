import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Location {
  id: number;
  name: string;
}

interface SurfSchool {
  id: number;
  name: string;
  Location_name: string;
}

interface SessionFiltersProps {
  onLocationFilter: (locationId: number | null) => void;
  onTagFilter: (tag: string | null) => void;
  onDateFilter: (date: string | null) => void;
}

const SessionFilters: React.FC<SessionFiltersProps> = ({ onLocationFilter, onTagFilter, onDateFilter }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'location' | 'surfschool' | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'freesurf' | 'surflesson'>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [surfSchools, setSurfSchools] = useState<SurfSchool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded locations based on requirements
  const locations: Location[] = [
    { id: 10, name: 'Praia do CDS' },
    { id: 9, name: 'Praia do Traquínio' },
    { id: 11, name: 'Praia do Marcelino' }
  ];

  useEffect(() => {
    const fetchSurfSchools = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/surfschool');
        
        if (!response.ok) {
          throw new Error('Failed to fetch surf schools');
        }
        
        const data = await response.json();
        setSurfSchools(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load surf schools');
        console.error('Error fetching surf schools:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurfSchools();
  }, []);

  const handleLocationSelect = (location: Location | null) => {
    if (location) {
      setSelectedOption(location.name);
      setSelectedType('location');
      onLocationFilter(location.id);
      // Reset to ALL filter when making a selection
      setActiveFilter('all');
      onTagFilter(null);
    } else {
      setSelectedOption(null);
      setSelectedType(null);
      onLocationFilter(null);
      // Reset to ALL when clearing selection
      setActiveFilter('all');
      onTagFilter(null);
    }
    setIsDropdownOpen(false);
  };

  const handleSurfSchoolSelect = (surfSchool: SurfSchool | null) => {
    if (surfSchool) {
      setSelectedOption(`${surfSchool.name} - ${surfSchool.Location_name}`);
      setSelectedType('surfschool');
      // For surf schools, we'll pass a special identifier that the parent can handle
      // Since the current API expects location_id, we'll need to handle this differently
      // For now, let's pass the surf school ID as a negative number to distinguish it
      onLocationFilter(-surfSchool.id);
      // Reset to ALL filter when making a selection (even though filters will be hidden)
      setActiveFilter('all');
      onTagFilter(null);
    } else {
      setSelectedOption(null);
      setSelectedType(null);
      onLocationFilter(null);
      // Reset to ALL when clearing selection
      setActiveFilter('all');
      onTagFilter(null);
    }
    setIsDropdownOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedOption(null);
    setSelectedType(null);
    onLocationFilter(null);
    // Reset to ALL when clearing selection
    setActiveFilter('all');
    onTagFilter(null);
    setIsDropdownOpen(false);
  };

  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date);
    onDateFilter(date);
  };

  const handleTagFilter = (filter: 'all' | 'freesurf' | 'surflesson') => {
    setActiveFilter(filter);
    if (filter === 'all') {
      onTagFilter(null);
    } else if (filter === 'freesurf') {
      onTagFilter('freesurf');
    } else {
      onTagFilter('surflesson');
    }
  };

  // Determine if tag filters should be visible
  const showTagFilters = selectedType !== 'surfschool';

  return (
    <div className="space-y-6">
      {/* Main title */}
      <h1 className="text-4xl font-bold text-center text-gray-900">Find your waves</h1>
      
      {/* Filters container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto mt-6">
        {/* Location/Surf School selector */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <button
            className="w-full bg-gray-100 hover:bg-gray-200 transition-colors text-left px-4 py-3 rounded-md flex items-center justify-between"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={loading}
          >
            <span className="text-gray-700">
              {loading 
                ? 'Loading options...' 
                : selectedOption || 'Select a beach or surf school'
              }
            </span>
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>
          
          {isDropdownOpen && !loading && (
            <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-80 overflow-auto border border-gray-200">
              <div className="py-1">
                {/* Clear selection option */}
                {selectedOption && (
                  <>
                    <button
                      className="w-full text-left px-4 py-2 text-gray-500 hover:bg-gray-50 border-b border-gray-100"
                      onClick={handleClearSelection}
                    >
                      Clear selection
                    </button>
                  </>
                )}
                
                {/* Locations section */}
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Locations
                  </h3>
                </div>
                {locations.map((location) => (
                  <button
                    key={`location-${location.id}`}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    onClick={() => handleLocationSelect(location)}
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {location.name}, Caparica
                    </div>
                  </button>
                ))}
                
                {/* Surf Schools section */}
                {surfSchools.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 border-t border-gray-200 mt-1">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Surf Schools
                      </h3>
                    </div>
                    {surfSchools.map((surfSchool) => (
                      <button
                        key={`surfschool-${surfSchool.id}`}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        onClick={() => handleSurfSchoolSelect(surfSchool)}
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <div>
                            <div className="font-medium">{surfSchool.name}</div>
                            <div className="text-sm text-gray-500">{/*surfSchool.Location_name*/}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="mt-2 text-sm text-red-600 text-center">
              {error}
            </div>
          )}
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <div className="relative">
            <input
              type="date"
              className="w-full bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-1 rounded-md text-gray-700 border-none"
              value={selectedDate || ''}
              onChange={(e) => handleDateSelect(e.target.value || null)}
              max={new Date().toISOString().split('T')[0]}
            />
            {selectedDate && (
              <button
                onClick={() => handleDateSelect(null)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Tag filters - Only show when location is selected or no selection */}
      {showTagFilters && (
        <div className="flex justify-center space-x-3 mt-6">
          <button
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              activeFilter === 'all' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleTagFilter('all')}
          >
            All
          </button>
          <button
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              activeFilter === 'freesurf' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleTagFilter('freesurf')}
          >
            Free Surf
          </button>
          <button
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              activeFilter === 'surflesson' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleTagFilter('surflesson')}
          >
            Surf Lesson
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionFilters;