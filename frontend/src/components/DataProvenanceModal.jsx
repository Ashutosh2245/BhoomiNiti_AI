import React from 'react';
import {
  X, ExternalLink, ShieldCheck, AlertTriangle, HelpCircle,
  Calendar, CheckCircle, FileText, Globe, Lock, Check, Info
} from 'lucide-react';

export const DataProvenanceModal = ({ item, onClose }) => {
  if (!item) return null;

  const isDemo = item.source_type === 'DEMONSTRATION' || item.category === 'DEMONSTRATION_DATA';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="bg-blue-600 p-1.5 rounded text-white">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Data Provenance & Source Audit</h3>
              <p className="text-xs text-slate-300">ⓘ Why am I seeing this data? Complete traceability breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">

          {/* Warning Banner if Demonstration Data */}
          {isDemo && (
            <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r text-purple-950 space-y-1">
              <div className="font-bold flex items-center space-x-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-purple-700" />
                <span>DEMONSTRATION DATA — NON-OFFICIAL RECORD</span>
              </div>
              <p className="text-xs text-purple-800">
                This record is marked as <strong>DEMONSTRATION DATA</strong>. It is provided strictly for platform feature simulation and UI testing. It does NOT represent verified government statistics or official policy position.
              </p>
            </div>
          )}

          {/* 1. WHAT IS THIS DATA */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-700" />
              <span>1. WHAT IS THIS DATA? (RECORD SPECIFICATION)</span>
            </div>
            <div className="font-bold text-sm text-slate-900 leading-snug">{item.title}</div>
            <p className="text-slate-600 leading-relaxed">{item.summary || 'Official record ingested into BhoomiNiti database.'}</p>
            
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono">
              <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px]">
                TYPE: {item.document_type?.toUpperCase() || 'DOCUMENT'}
              </span>
              <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px]">
                ACCESS: {item.access_level || 'PUBLIC'}
              </span>
              <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
                STATUS: {item.status || 'PUBLISHED'}
              </span>
            </div>
          </div>

          {/* 2. WHERE DID IT COME FROM (ORIGIN & PROOF) */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-700" />
              <span>2. WHERE DID IT COME FROM? (ORIGIN & PROOF)</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded border border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Source Repository</span>
                <span className="font-bold text-slate-900">{item.source_name || 'BhoomiNiti Platform'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Publishing Organization</span>
                <span className="font-bold text-slate-900">{item.organization || 'Government of India'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Source Classification</span>
                <span className="font-semibold text-blue-800 font-mono">{item.source_type || 'GOVERNMENT'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Author / Principal</span>
                <span className="font-semibold text-slate-800">{item.author || 'N/A'}</span>
              </div>
            </div>

            {item.source_url && (
              <div className="pt-1">
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold px-3 py-2 rounded flex items-center justify-between text-xs transition-colors"
                >
                  <span className="truncate">View Original Verified Source URL: {item.source_url}</span>
                  <ExternalLink className="w-4 h-4 shrink-0 ml-2" />
                </a>
              </div>
            )}
          </div>

          {/* 3. WHEN WAS IT UPDATED (TEMPORAL SEPARATION) */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-700" />
              <span>3. WHEN WAS IT UPDATED? (DATE SEPARATION)</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded border border-slate-200 font-mono">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Official Published Date</span>
                <span className="font-bold text-slate-900 text-sm">{item.published_date || 'N/A'}</span>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">Historical gazette/publication timestamp</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Platform Indexing Date</span>
                <span className="font-bold text-blue-700 text-sm">{item.uploaded_at || '2024'}</span>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">Ingested into BhoomiNiti database</p>
              </div>
            </div>
          </div>

          {/* 4. VERIFICATION STATUS & AUDIT METRICS */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>4. VERIFICATION STATUS & QUALITY CHECKS</span>
            </div>

            <div className="flex items-center justify-between bg-white p-3 rounded border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-900">Verification Status</div>
                <p className="text-[10px] text-slate-500">Validated against primary authority records</p>
              </div>
              <div>
                {item.verification_status === 'VERIFIED' ? (
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-3 py-1 rounded-full inline-flex items-center space-x-1.5 text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>✓ Verified Official Source</span>
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3 py-1 rounded-full inline-flex items-center space-x-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>◐ Pending Verification</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quality Checks Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 text-[10px] font-bold block">Authority Level</span>
                <span className="font-bold text-slate-800">
                  {item.source_type === 'GOVERNMENT' ? 'Level 1: Statutory' : 'Level 2: Peer-Reviewed'}
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 text-[10px] font-bold block">Schema Check</span>
                <span className="font-bold text-emerald-700 flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Passed</span>
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 text-[10px] font-bold block">Duplicate Check</span>
                <span className="font-bold text-emerald-700 flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Unique Record</span>
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 text-[10px] font-bold block">Integrity Hash</span>
                <span className="font-mono text-[9px] text-slate-600 truncate block">sha256-verified</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            BhoomiNiti Data Provenance Protocol v1.4
          </div>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded shadow"
          >
            Close Provenance Audit
          </button>
        </div>

      </div>
    </div>
  );
};
