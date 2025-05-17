import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  redirectPath?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  message,
  redirectPath
}) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;
  
  const handleReturn = () => {
    onClose();
    if (redirectPath) {
      navigate(redirectPath);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 transform transition-all">
        <div className="flex items-center justify-center mb-5">
          <div className="bg-green-100 rounded-full p-3">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">Succès!</h3>
        <p className="text-center text-gray-600 mb-6">{message}</p>
        
        <div className="flex justify-center">
          <button
            onClick={handleReturn}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Retourner au tableau de bord
          </button>
        </div>
      </div>
    </div>
  );
}; 