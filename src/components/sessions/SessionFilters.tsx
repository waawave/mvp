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
  logo: string;
}

interface SessionFiltersProps {
  onLocationFilter: (locationId: number | null) => void;
  onTagFilter: (tag: string | null) => void;
  onDateFilter: (date: string | null) => void;
}

const SessionFilters: React.FC<SessionFiltersProps> = ({ onLocationFilter, onTagFilter }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'location' | 'surfschool' | null>(null);
  const [activeFilter, setActiveFilter] = useState<'freesurf' | 'surflesson'>('freesurf');
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

  // Update tag filter when activeFilter changes
  useEffect(() => {
    onTagFilter(activeFilter);
  }, [activeFilter, onTagFilter]);

  const handleLocationSelect = (location: Location | null) => {
    if (location) {
      setSelectedOption(location.name);
      setSelectedType('location');
      onLocationFilter(location.id);
    } else {
      setSelectedOption(null);
      setSelectedType(null);
      onLocationFilter(null);
    }
    setIsDropdownOpen(false);
  };

  const handleSurfSchoolSelect = (surfSchool: SurfSchool | null) => {
    if (surfSchool) {
      setSelectedOption(surfSchool.name);
      setSelectedType('surfschool');
      // For surf schools, we'll pass a special identifier that the parent can handle
      // Since the current API expects location_id, we'll need to handle this differently
      // For now, let's pass the surf school ID as a negative number to distinguish it
      onLocationFilter(-surfSchool.id);
    } else {
      setSelectedOption(null);
      setSelectedType(null);
      onLocationFilter(null);
    }
    setIsDropdownOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedOption(null);
    setSelectedType(null);
    onLocationFilter(null);
    setIsDropdownOpen(false);
  };

  const handleSwitchFilter = (filter: 'freesurf' | 'surflesson') => {
    setActiveFilter(filter);
    // Reset selection when switching filter type
    setSelectedOption(null);
    setSelectedType(null);
    onLocationFilter(null);
  };

  // Get placeholder text based on active filter
  const getPlaceholderText = () => {
    if (loading) return 'Loading options...';
    if (selectedOption) return selectedOption;
    
    return activeFilter === 'freesurf' 
      ? 'Select your Surf Spot' 
      : 'Select your Surf School';
  };

  return (
    <div className="space-y-6">
      {/* Main title */}
      <h1 className="text-4xl font-bold text-center text-gray-900">Find your waves</h1>
      
      {/* Filter container */}
      <div className="max-w-[50rem] mx-auto">
        <div className="bg-white rounded-[1.8rem] shadow-md p-10 border border-gray-100">
          {/* Switch button */}
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1 md:w-2/5">
              <button
                onClick={() => handleSwitchFilter('surflesson')}
                className={`flex-1 py-4 px-4 rounded-lg font-medium transition-colors ${
                  activeFilter === 'surflesson' 
                    ? 'bg-black text-white' 
                    : 'text-gray-700'
                }`}
              >
                Surf Lesson
              </button>
              <button
                onClick={() => handleSwitchFilter('freesurf')}
                className={`flex-1 py-4 px-4 rounded-lg font-medium transition-colors ${
                  activeFilter === 'freesurf' 
                    ? 'bg-black text-white' 
                    : 'text-gray-700'
                }`}
              >
                Free Surf
              </button>
            </div>

            {/* Location/Surf School selector */}
            <div className="relative mt-6 md:mt-0 md:w-3/5">
              <button
                className="w-full bg-white border border-black text-left px-4 py-4 rounded-md flex items-center justify-between"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={loading}
              >
                <span className="text-gray-700">
                  {getPlaceholderText()}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-black transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>
          
          <div className="relative">
            
            {isDropdownOpen && !loading && (
              <div className="absolute z-50 mt-1 w-full md:w-3/5 md:right-0 bg-white rounded-md shadow-lg max-h-80 overflow-auto border border-gray-200">
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
                  
                  {activeFilter === 'freesurf' ? (
                    // Show locations for Free Surf
                    <>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                          Surf Spots
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
                    </>
                  ) : (
                    // Show surf schools for Surf Lesson
                    <>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
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
                            <img 
  src={surfSchool.logo.url} 
  alt={`${surfSchool.name} logo`}
  className="w-8 h-8 mr-2 rounded-full object-cover"
/>
                            <div>
                              <div className="font-medium">{surfSchool.name}</div>
                              <div className="text-sm text-gray-500">{surfSchool.Location_name}</div>
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
              <div className="mt-2 text-sm text-red-600 text-center md:w-1/2 md:ml-auto">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionFilters;