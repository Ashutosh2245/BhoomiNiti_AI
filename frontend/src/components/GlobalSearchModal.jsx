import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Search, X, FileText, Database, BookOpen, Map, ArrowRight,
  Shield, Layers, Activity, Sparkles, Filter
} from 'lucide-react';

export const GlobalSearchModal = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via custom event or external state if passed
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/knowledge/search', { params: { q: searchTerm } });
      setResults(res.data);
    } catch (err) {
      console.error('Global search error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Results' },
    { id: 'research', label: 'Research Papers' },
    { id: 'policy', label: 'Policy Documents' },
    { id: 'legal', label: 'Legal Statutes' },
    { id: 'dataset', label: 'Datasets' },
    { id: 'gis', label: 'GIS Layers' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center space-x-3 border-b border-slate-800">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="Search research papers, policies, legal acts, datasets, GIS layers... (Press ESC to close)"
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults(null); }} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="bg-slate-800 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
            ESC
          </span>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-1 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeFilter === cat.id
                  ? 'bg-blue-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Results Content */}
        <div className="max-h-[450px] overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono space-y-2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p>Searching verified BhoomiNiti database...</p>
            </div>
          ) : !results ? (
            <div className="p-8 text-center text-xs text-slate-500 space-y-3">
              <Sparkles className="w-8 h-8 text-blue-500 mx-auto opacity-70" />
              <p className="font-semibold text-slate-700">Unified Government Evidence Search</p>
              <div className="flex flex-wrap justify-center gap-2 text-[11px] pt-1">
                {['SVAMITVA Scheme', 'DILRMP Progress', 'Land Acquisition Act', 'Pune LULC Matrix', 'Forest Rights'].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setQuery(sample); handleSearch(sample); }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded border border-slate-200"
                  >
                    🔍 {sample}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              
              {/* Document Results */}
              {results.documents && results.documents.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Matched Knowledge & Policy Documents ({results.documents.length})</span>
                  </div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                    {results.documents.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          onNavigate('knowledge');
                          onClose();
                        }}
                        className="p-3 hover:bg-slate-50 transition-colors cursor-pointer flex justify-between items-start gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                              {doc.doc_type ? doc.doc_type.replace('_', ' ') : 'DOCUMENT'}
                            </span>
                            <span className="text-[11px] text-slate-500">| {doc.organization_name || 'Govt of India'}</span>
                            {doc.state && <span className="text-[11px] text-slate-500">• {doc.state}</span>}
                          </div>
                          <div className="font-bold text-xs text-slate-900 hover:text-blue-700">{doc.title}</div>
                          <p className="text-[11px] text-slate-600 line-clamp-1">{doc.summary}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dataset Results */}
              {results.datasets && results.datasets.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5 text-teal-600" />
                    <span>Matched Datasets ({results.datasets.length})</span>
                  </div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                    {results.datasets.map((ds) => (
                      <div
                        key={ds.id}
                        onClick={() => {
                          onNavigate('knowledge');
                          onClose();
                        }}
                        className="p-3 hover:bg-slate-50 transition-colors cursor-pointer flex justify-between items-start gap-3"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-900">{ds.name}</div>
                          <div className="text-[11px] text-slate-500">{ds.provider} | Format: {ds.format} | Coverage: {ds.spatial_coverage}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between items-center font-mono">
          <span>Search backed by SQLite full-text indexing & metadata filters</span>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-900 font-semibold underline">
            Close Search (ESC)
          </button>
        </div>

      </div>
    </div>
  );
};
