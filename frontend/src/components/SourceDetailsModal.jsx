import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  X, RefreshCw, CheckCircle2, XCircle, ExternalLink, Link2,
  FileText, ShieldCheck, Clock, Server, AlertCircle
} from 'lucide-react';

export const SourceDetailsModal = ({ sourceId, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchSourceDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/sources/${sourceId}`);
      setDetail(res.data);
    } catch (err) {
      console.error('Failed to load source detail:', err);
      setError('Failed to fetch source details from API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sourceId) {
      fetchSourceDetail();
    }
  }, [sourceId]);

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await api.post(`/sources/${sourceId}/sync`);
      setSyncResult(res.data);
      fetchSourceDetail(); // Refresh details
    } catch (err) {
      console.error('Sync failed:', err);
      setSyncResult({
        status: 'FAILED',
        message: err.response?.data?.detail || 'Sync request failed. Source not connected.'
      });
    } finally {
      setSyncing(false);
    }
  };

  if (!sourceId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between border-b border-blue-950">
          <div className="flex items-center space-x-2.5">
            <Link2 className="w-5 h-5 text-blue-300" />
            <div>
              <h3 className="font-bold text-base">Data Source Registry Details</h3>
              <p className="text-xs text-blue-200 font-mono">Source ID #{sourceId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-300 hover:text-white p-1 rounded-md hover:bg-blue-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-2 font-mono text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-700" />
            <p>Loading source integration profile from database...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-700 bg-rose-50 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-600" />
            <div className="font-bold text-sm">{error}</div>
            <button onClick={fetchSourceDetail} className="bg-rose-700 text-white text-xs px-3 py-1.5 rounded">Retry</button>
          </div>
        ) : detail && (
          <div className="p-6 space-y-6 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">

            {/* Sync Feedback Alert */}
            {syncResult && (
              <div className={`p-4 rounded border text-xs font-mono space-y-1 ${
                syncResult.status === 'SUCCESS' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                <div className="font-bold flex items-center space-x-1.5 text-sm">
                  {syncResult.status === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                  <span>{syncResult.status === 'SUCCESS' ? 'Sync Completed' : 'Sync Execution Failed'}</span>
                </div>
                <p>{syncResult.message}</p>
                {syncResult.error_details && <p className="text-rose-700 italic">Error: {syncResult.error_details}</p>}
              </div>
            )}

            {/* Title & Organization Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded border border-slate-200">
              <div>
                <h4 className="text-base font-bold text-slate-900">{detail.name}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{detail.organization}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded font-mono border ${
                  detail.category === 'PLATFORM_DATA' ? 'bg-blue-100 text-blue-900 border-blue-200' :
                  detail.category === 'EXTERNAL_DATA' ? 'bg-amber-100 text-amber-900 border-amber-200' :
                  'bg-purple-100 text-purple-900 border-purple-200'
                }`}>
                  {detail.category?.replace('_', ' ')}
                </span>
                
                {detail.status === 'CONNECTED' ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded border border-emerald-200 inline-flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Connected</span>
                  </span>
                ) : (
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded border border-rose-200 inline-flex items-center space-x-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Not Connected</span>
                  </span>
                )}
              </div>
            </div>

            {/* Description & Metadata Specs */}
            <div className="space-y-3">
              <div className="text-slate-600 leading-relaxed bg-white p-3 rounded border border-slate-200">
                {detail.description || 'No detailed documentation description available.'}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Access Method</span>
                  <span className="font-bold text-slate-900">{detail.access_method || 'AUTOMATED_INGESTION'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Update Frequency</span>
                  <span className="font-bold text-slate-900">{detail.update_frequency || 'Quarterly'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Imported Records</span>
                  <span className="font-bold text-blue-700 text-sm">{detail.record_count}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">License Type</span>
                  <span className="font-semibold text-slate-700 truncate block">{detail.license}</span>
                </div>
              </div>
            </div>

            {/* Source Base & API URLs */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800">Source URLs & Endpoint Integration</div>
              <div className="space-y-1.5 font-mono text-[11px]">
                {detail.base_url && (
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 font-bold">Portal URL:</span>
                    <a href={detail.base_url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline flex items-center space-x-1">
                      <span className="truncate max-w-md">{detail.base_url}</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
                {detail.api_url && (
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 font-bold">API Endpoint:</span>
                    <span className="text-slate-800 truncate max-w-md">{detail.api_url}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Imported Documents List */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Imported Database Documents ({detail.imported_documents?.length || 0})</span>
              </div>

              {detail.imported_documents?.length === 0 ? (
                <p className="text-slate-500 italic p-3 bg-slate-50 rounded border border-slate-200 text-center">
                  No records currently linked from this source.
                </p>
              ) : (
                <div className="divide-y divide-slate-200 bg-white border border-slate-200 rounded max-h-36 overflow-y-auto">
                  {detail.imported_documents.map(doc => (
                    <div key={doc.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div className="font-semibold text-slate-900 truncate max-w-md">{doc.title}</div>
                      <div className="text-slate-500 font-mono text-[10px] shrink-0 ml-2">{doc.published_date}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sync History Logs */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800">Recent Sync Job History</div>
              {detail.sync_history?.length === 0 ? (
                <p className="text-slate-500 italic text-center p-3 bg-slate-50 rounded border border-slate-200">
                  No recent synchronization jobs recorded.
                </p>
              ) : (
                <div className="space-y-1.5 font-mono text-[11px]">
                  {detail.sync_history.map(job => (
                    <div key={job.id} className="p-2 rounded border bg-slate-50 border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {job.status === 'SUCCESS' ? (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[9px]">SUCCESS</span>
                        ) : (
                          <span className="bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded text-[9px]">FAILED</span>
                        )}
                        <span className="text-slate-700">{job.started_at?.replace('T', ' ').substring(0, 19)}</span>
                      </div>
                      <div className="text-slate-500">
                        {job.records_added !== undefined ? `Found: ${job.records_found} | Added: ${job.records_added}` : job.error_message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Footer with Sync Now Action Button */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="bg-white hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2 rounded border border-slate-300"
          >
            Close Window
          </button>

          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="bg-blue-800 hover:bg-blue-900 text-white font-semibold text-xs px-4 py-2 rounded shadow flex items-center space-x-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Executing Sync...' : 'Sync Source Now'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
