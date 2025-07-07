import React, { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AuthMessageDisplay: React.FC = () => {
  const { authMessage, setAuthMessage } = useAuth();

  // Auto-dismiss the message after 5 seconds
  useEffect(() => {
    if (authMessage) {
      const timer = setTimeout(() => {
        setAuthMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [authMessage, setAuthMessage]);

  if (!authMessage) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-white border border-red-200 rounded-lg shadow-lg p-4 animate-in slide-in-from-right duration-300">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Session Expired</p>
            <p className="text-sm text-gray-600 mt-1">{authMessage}</p>
          </div>
          <button
            onClick={() => setAuthMessage(null)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthMessageDisplay;