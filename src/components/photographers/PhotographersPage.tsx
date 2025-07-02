import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Photographer } from '../../types';

const PhotographersPage: React.FC = () => {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotographers = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/explorephotographers');
        
        if (!response.ok) {
          throw new Error('Failed to fetch photographers');
        }
        
        const data = await response.json();
        setPhotographers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotographers();
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
              <p>Error loading photographers: {error}</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Photographers</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover talented surf photographers capturing the perfect waves and moments
          </p>
        </div>

        {/* Photographers Grid */}
        {photographers.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-blue-50 text-blue-600 p-8 rounded-md inline-block max-w-lg">
              <h3 className="text-xl font-semibold mb-2">No photographers found</h3>
              <p>Check back later for new photographers joining our community.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {photographers.map((photographer) => (
              <Link
                key={photographer.id}
                to={`/photographer/${photographer.id}`}
                className="group"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  {/* Profile Photo */}
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={photographer.profile_photo.url}
                      alt={`${photographer.first_name} ${photographer.last_name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Photographer Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-center group-hover:text-blue-600 transition-colors">
                      {photographer.first_name} {photographer.last_name}
                    </h3>
                    <p className="text-sm text-gray-500 text-center mt-1">
                      {photographer.location || 'Location not specified'}
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

export default PhotographersPage;