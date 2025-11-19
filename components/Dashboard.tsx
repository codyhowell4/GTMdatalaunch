import React from 'react';
import { SavedList } from '../types';
import { Download, Calendar, Search, FileText } from 'lucide-react';
import { downloadCSV } from '../utils/helpers';

interface DashboardProps {
  savedLists: SavedList[];
}

export const Dashboard: React.FC<DashboardProps> = ({ savedLists }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">My Dashboard</h2>
        <p className="text-gray-500">Manage your saved lead lists and downloads.</p>
      </div>

      {savedLists.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="bg-gray-50 p-4 rounded-full inline-block mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No saved lists yet</h3>
            <p className="text-gray-500 mt-2">Perform a search and download results to see them here.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedLists.map((list) => (
            <div key={list.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 p-2 rounded-lg">
                    <Search className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(list.date).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1" title={list.query}>
                {list.query}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-600">
                    {list.itemCount} Leads
                </span>
              </div>

              <button
                onClick={() => downloadCSV(list.results, `leads-${list.id.slice(0,8)}.csv`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};