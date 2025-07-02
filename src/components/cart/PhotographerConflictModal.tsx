import React from 'react';
import { X, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const PhotographerConflictModal: React.FC = () => {
  const { 
    showPhotographerConflictModal, 
    setShowPhotographerConflictModal,
    getCurrentPhotographer,
    pendingItem,
    replaceCartWithPendingItem,
    setPendingItem
  } = useCart();

  if (!showPhotographerConflictModal || !pendingItem) return null;

  const currentPhotographer = getCurrentPhotographer();
  const newPhotographer = `${pendingItem.session.photographer.first_name} ${pendingItem.session.photographer.last_name}`;

  const handleKeepCurrent = () => {
    setPendingItem(null);
    setShowPhotographerConflictModal(false);
  };

  const handleReplace = () => {
    replaceCartWithPendingItem();
  };

  const handleClose = () => {
    setPendingItem(null);
    setShowPhotographerConflictModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">One photographer per checkout</h2>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Explanation */}
          <div className="text-center space-y-3">
            <p className="text-gray-700 leading-relaxed font-bold">
              In Waawave you are buying directly from your favorite photographers, one at a time. 
            </p>
          </div>

          {/* Current vs New Photographer */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Currently in your cart</span>
              </div>
              <p className="font-semibold text-gray-900">{currentPhotographer?.name}</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Trying to add from</span>
              </div>
              <p className="font-semibold text-gray-900">{newPhotographer}</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm">
              To add photos from <strong>{newPhotographer}</strong>, you'll need to remove 
              the current photos from <strong>{currentPhotographer?.name}</strong> in your cart.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 bg-gray-50">
          <button
            onClick={handleKeepCurrent}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Keep Current Photos
          </button>
          <button
            onClick={handleReplace}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Replace Photos
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotographerConflictModal;