import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SurfSchool } from '../../types';

const SurfSchoolsPage: React.FC = () => {
  const [surfSchools, setSurfSchools] = useState<SurfSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSurfSchools();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <div className="bg-red-50 text-red-600 p-4 rounded-md inline-block max-w-lg">
              <p>Error loading surf schools: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Surf Schools</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover surf schools offering professional lessons and unforgettable experiences
          </p>
        </div>

        {/* Surf Schools Grid */}
        {surfSchools.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-blue-50 text-blue-600 p-8 rounded-md inline-block max-w-lg">
              <h3 className="text-xl font-semibold mb-2">No surf schools found</h3>
              <p>Check back later for new surf schools joining our community.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {surfSchools.map((surfSchool) => (
              <Link
                key={surfSchool.id}
                to={`/surfschool/${surfSchool.id}`}
                className="group"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  {/* Logo with subtle white background */}
                  <div className="aspect-square overflow-hidden bg-gray-25 flex items-center justify-center p-6 border-b border-gray-50">
                    <img
                      src={surfSchool.logo.url}
                      alt={`${surfSchool.name} logo`}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Surf School Info */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 text-center group-hover:text-blue-600 transition-colors mb-2">
                      {surfSchool.name}
                    </h3>
                    <p className="text-sm text-gray-500 text-center">
                      {surfSchool.Location_name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurfSchoolsPage;