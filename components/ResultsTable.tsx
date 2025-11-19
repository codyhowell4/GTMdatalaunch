import React from 'react';
import { Business } from '../types';
import { Download, MapPin, Phone, Mail, Building2, Globe, Star } from 'lucide-react';

interface ResultsTableProps {
  results: Business[];
  onExport: () => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results, onExport }) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Found {results.length} Businesses
        </h2>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Company</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Contact Info</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Address</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Rating</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Website</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Google Maps</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((business) => (
                <tr key={business.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{business.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1.5">
                        {/* Phone */}
                        {business.phone ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <a href={`tel:${business.phone}`} className="hover:text-primary hover:underline whitespace-nowrap">
                            {business.phone}
                            </a>
                        </div>
                        ) : (
                         <div className="flex items-center gap-2 text-sm text-gray-400 italic">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span>N/A</span>
                         </div>
                        )}

                        {/* Email */}
                        {business.email ? (
                           <div className="flex items-center gap-2 text-sm text-gray-600">
                             <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                             <a href={`mailto:${business.email}`} className="hover:text-primary hover:underline break-all">
                               {business.email}
                             </a>
                           </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-gray-400 italic">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span>N/A</span>
                            </div>
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{business.address}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {business.rating ? (
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        <Star className="h-3.5 w-3.5 text-accent fill-accent flex-shrink-0" />
                        <span>{business.rating}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-4 max-w-xs">
                    {business.website ? (
                      <div className="flex items-start gap-2">
                         <Globe className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                         <a
                            href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:text-secondary hover:underline break-all"
                         >
                           {business.website}
                         </a>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-4 max-w-xs">
                    {business.googleMapsUrl ? (
                       <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <a
                          href={business.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline break-all"
                        >
                          {business.googleMapsUrl}
                        </a>
                      </div>
                    ) : (
                       <span className="text-xs text-gray-400 italic">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};