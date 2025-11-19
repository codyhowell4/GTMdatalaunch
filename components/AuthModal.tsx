import React, { useState } from 'react';
import { X } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (user: Omit<User, 'tier' | 'searchCount'>) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    website: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                    Create Free Account
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-6">
                    To download your lead list and save it to your dashboard, please complete your free account profile.
                  </p>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                        <input 
                            required
                            type="text" 
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2 px-3 border"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                        <input 
                            required
                            type="text" 
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2 px-3 border"
                            value={formData.companyName}
                            onChange={e => setFormData({...formData, companyName: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                            <input 
                                required
                                type="email" 
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2 px-3 border"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                            <input 
                                required
                                type="tel" 
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2 px-3 border"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
                        <input 
                            required
                            type="text" 
                            placeholder="company.com"
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2 px-3 border"
                            value={formData.website}
                            onChange={e => setFormData({...formData, website: e.target.value})}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm mt-4"
                    >
                        Create Free Account & Download
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};