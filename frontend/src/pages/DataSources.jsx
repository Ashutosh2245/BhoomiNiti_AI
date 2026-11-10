import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ContextGuidanceBanner } from '../components/ContextGuidanceBanner';
import { SourceDetailsModal } from '../components/SourceDetailsModal';
import {
  Database, RefreshCw, CheckCircle2, ShieldCheck,
  ExternalLink, Info, Filter, ShieldAlert
} from 'lucide-react';

export const DataSources = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState(null);
  const [selectedSourceId, setSelectedSourceId] = useState(null);
  const [filterType, setFilterType] = useState('ALL');

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sources');
      setSources(res.data);
    } catch (err) {
      console.error('Failed to load data source registry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleSyncSource = async (sourceId) => {
    setSyncingId(sourceId);
    try {
      const res = await api.post(`/sources/${sourceId}/sync`);
      alert(res.data.message || 'Data source sync executed!');
      fetchSources();
    } catch (err) {
      alert('Sync execution failed or external gateway offline.');
    } finally {
      setSyncingId(null);
    }
  };

  const filteredSources = filterType === 'ALL'
    ? sources
    : sources.filter(s => s.category === filterType || s.connection_type === filterType);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#10233b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Statutory Data Sources & Integration Registry</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent registry distinguishing internal platform data, statutory external feeds, and demonstration datasets.
          </p>
        </div>

        <button
          onClick={fetchSources}
          disabled={loading}
          className="bg-[#16447a] hover:bg-blue-900 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow flex items-center space-x-1.5 shrink-0 transition-all hover:-translate-y-0.5"
        >
          <RefreshCw className={`w-4 h-4 text-teal-300 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Source Registry</span>
        </button>
      </div>

      {/* Global Guidance Banner */}
      <ContextGuidanceBanner
        title="Data Sources Registry Guidance"
        description="Inspect official URLs, synchronization statuses, record counts, and provenance metadata for all integrated land data feeds."
        whatYouCanDo={[
          "Filter by data source category (Platform Data, External Feeds, Demonstration Data)",
          "Click 'Sync Now' to trigger a live API synchronization run against backend gateways",
          "Click 'View Integration Details' to view complete licensing and geographic coverage"
        ]}
        inputsNeeded="Select source filters or click 'Sync Now'."
        expectedResult="Live connection execution, updated sync timestamps, and transparent data trust status."
      />

      {/* Filter Tabs & Registry Table */}
      <div className="bg-white dark:bg-[#10233b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Filter Registry</span>
          </div>

          <div className="flex items-center space-x-1">
            {['ALL', 'PLATFORM_DATA', 'EXTERNAL_DATA', 'DEMONSTRATION'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterType(cat)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  filterType === cat
                    ? 'bg-[#16447a] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Sources Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 font-mono">Loading data source registry...</div>
        ) : filteredSources.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No sources found under selected category filter.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSources.map(src => (
              <div
                key={src.id}
                className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                      src.category === 'PLATFORM_DATA' ? 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300' :
                      src.category === 'EXTERNAL_DATA' ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300' :
                      'bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300'
                    }`}>
                      {src.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">ID #{src.id}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{src.name}</h3>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">Org: <strong className="text-slate-800 dark:text-slate-200">{src.organization}</strong></div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div>Records: <strong className="text-blue-700 dark:text-blue-400">{src.record_count}</strong></div>
                    <div>Status: <strong className="text-emerald-600 dark:text-emerald-400">{src.status}</strong></div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setSelectedSourceId(src.id)}
                      className="text-xs text-blue-700 dark:text-blue-400 font-bold hover:underline"
                    >
                      View Details →
                    </button>

                    <button
                      onClick={() => handleSyncSource(src.id)}
                      disabled={syncingId === src.id}
                      className="bg-[#16447a] hover:bg-blue-900 text-white font-bold text-[11px] px-2.5 py-1 rounded flex items-center space-x-1 shrink-0"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncingId === src.id ? 'animate-spin' : ''}`} />
                      <span>{syncingId === src.id ? 'Syncing...' : 'Sync Now'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Source Details Modal */}
      {selectedSourceId && (
        <SourceDetailsModal
          sourceId={selectedSourceId}
          onClose={() => setSelectedSourceId(null)}
        />
      )}

    </div>
  );
};
