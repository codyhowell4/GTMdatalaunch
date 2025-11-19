import React from 'react';
import { X, CheckCircle, Star } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full relative">
          
          {/* Close Button */}
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 z-10">
            <X className="h-6 w-6" />
          </button>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-4 py-8 sm:px-10 text-white text-center relative overflow-hidden">
            <Star className="h-24 w-24 text-white opacity-10 absolute -top-4 -left-4 rotate-12" />
            <h3 className="text-2xl font-extrabold mb-2 relative z-10">Upgrade to Pro</h3>
            <p className="text-blue-100 relative z-10">Unlock unlimited scouting power.</p>
          </div>

          <div className="px-6 py-8 sm:p-10">
             <div className="text-center mb-8">
                 <span className="text-5xl font-bold text-gray-900">$5.99</span>
                 <span className="text-gray-500 font-medium">/month</span>
             </div>

             <ul className="space-y-4 mb-8">
                 <li className="flex items-start">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                     <span className="text-gray-600">Unlimited Searches</span>
                 </li>
                 <li className="flex items-start">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                     <span className="text-gray-600">Unlimited CSV Exports</span>
                 </li>
                 <li className="flex items-start">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                     <span className="text-gray-600">Dashboard Access</span>
                 </li>
                 <li className="flex items-start">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                     <span className="text-gray-600">Priority Support</span>
                 </li>
             </ul>

             <button
                onClick={onUpgrade}
                className="w-full block text-center bg-primary hover:bg-secondary text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg"
             >
                 Subscribe via Stripe
             </button>
             
             <p className="text-xs text-gray-400 text-center mt-4">
                 You will be redirected to Stripe to complete payment securely.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};