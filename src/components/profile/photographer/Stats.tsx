import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

interface StatsData {
  sessions: number;
  totalSales: number;
  monthSales: number;
}

const Stats: React.FC = () => {
  const { authToken } = useAuth();
  const [stats, setStats] = useState<StatsData>({ sessions: 0, totalSales: 0, monthSales: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch sessions
        const sessionsResponse = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/my-sessions', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        // Fetch sales
        const salesResponse = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/my-sales', {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        if (!sessionsResponse.ok || !salesResponse.ok) {
          throw new Error('Failed to fetch stats');
        }

        const sessionsData = await sessionsResponse.json();
        const salesData = await salesResponse.json();

        // Calculate total sales
        const totalSales = salesData.sales.reduce((sum: number, sale: any) => sum + sale.media_price, 0);

        // Calculate this month's sales
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthSales = salesData.sales.reduce((sum: number, sale: any) => {
          const saleDate = new Date(sale.created_at);
          if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
            return sum + sale.media_price;
          }
          return sum;
        }, 0);

        setStats({
          sessions: sessionsData.sessions.length,
          totalSales,
          monthSales
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [authToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-600 p-4 rounded-md inline-block">
          <p>Error loading stats: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-gray-600 mb-2">Total Sessions</div>
          <div className="text-3xl font-bold">{stats.sessions}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-gray-600 mb-2">Total Sales</div>
          <div className="text-3xl font-bold">€{stats.totalSales.toFixed(2)}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-gray-600 mb-2">This month</div>
          <div className="text-3xl font-bold">€{stats.monthSales.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default Stats;