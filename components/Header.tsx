import React from 'react';
import { MapPin, User as UserIcon, LogOut, Crown } from 'lucide-react';
import { User, SubscriptionTier } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onShowDashboard: () => void;
  onShowSearch: () => void;
  onUpgrade: () => void;
  currentView: 'search' | 'dashboard';
}

export const Header: React.FC<HeaderProps> = ({ 
    user, 
    onLogout, 
    onShowDashboard, 
    onShowSearch,
    onUpgrade,
    currentView
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={onShowSearch}>
            <div className="bg-primary/10 p-2 rounded-lg">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ClientScout AI</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Powered by Gemini 2.5 & Google Maps</p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {!user ? (
               <div className="text-sm text-gray-500">
                 <span className="hidden sm:inline">1 Free Search Available</span>
               </div>
            ) : (
               <div className="flex items-center gap-4">
                  {/* Upgrade Button for Free Tier */}
                  {user.tier === SubscriptionTier.FREE && (
                      <button 
                        onClick={onUpgrade}
                        className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all transform hover:scale-105"
                      >
                          <Crown className="h-3 w-3" />
                          Upgrade to Pro
                      </button>
                  )}

                  {/* View Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                      <button 
                        onClick={onShowSearch}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${currentView === 'search' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        Search
                      </button>
                      <button 
                        onClick={onShowDashboard}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${currentView === 'dashboard' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        Dashboard
                      </button>
                  </div>

                  {/* User Menu */}
                  <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                      <div className="text-right hidden sm:block">
                          <p className="text-xs font-semibold text-gray-900">{user.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase">{user.companyName}</p>
                      </div>
                      <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
                          <LogOut className="h-4 w-4" />
                      </button>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};