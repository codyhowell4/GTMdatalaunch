import React, { useState, useCallback } from 'react';
import { Search, Sparkles, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  }, [query, onSearch]);

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Describe your ideal client
            </label>
        </div>
        
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-start gap-2">
            <textarea
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Find me 50 plumbers in Mesa, Arizona"
              className="block w-full rounded-xl border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-primary sm:text-base py-3 pl-4 pr-12 resize-none h-24 transition-all border focus:bg-white"
              disabled={isLoading}
            />
            <div className="absolute right-3 bottom-3">
                <Sparkles className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Tip: Be specific about location and industry for best results.
            </p>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white shadow-sm transition-all
                ${isLoading || !query.trim() 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-primary hover:bg-secondary hover:shadow-md active:transform active:scale-95'}
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scouting...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Find Clients
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
