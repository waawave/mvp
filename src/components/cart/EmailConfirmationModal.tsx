import React from 'react';
import { X, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!isOpen || !user) return null;

  const handleChangeEmail = () => {
    onClose();
    navigate('/surfer/contact');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Confirm your email</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Email Display */}
          <div className="text-center space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium mb-2">Your current email address</p>
              <p className="text-lg font-semibold text-gray-900">{user.email}</p>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-amber-800 font-medium">Important</p>
                <p className="text-amber-700 text-sm leading-relaxed">
                  Your purchased photos and videos will be available in your profile under 
                  <strong> My Media</strong>. Please verify that this email address is correct 
                  before proceeding with your purchase.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 p-6 bg-gray-50">
          <button
            onClick={onConfirm}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Yes, this email is correct
          </button>
          <button
            onClick={handleChangeEmail}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Change my email
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationModal;