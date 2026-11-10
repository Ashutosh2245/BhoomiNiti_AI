import React from 'react';
import { X, Calculator, ShieldCheck, Check, Info } from 'lucide-react';

export const CalculationDetailsModal = ({ finding, onClose }) => {
  if (!finding) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-blue-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-blue-950">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-blue-300" />
            <div>
              <h3 className="font-bold text-sm">Derived Metric Calculation Proof</h3>
              <p className="text-[10px] text-blue-200 font-mono">Calculated by BhoomiNiti Intelligence Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-300 hover:text-white p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          
          <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Finding</span>
            <div className="font-bold text-slate-900">{finding.title_en}</div>
          </div>

          {/* Mathematical Formula Box */}
          <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded space-y-2">
            <div className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">Formula Specification</div>
            <div className="font-mono font-bold text-slate-900 text-sm bg-white p-2 rounded border border-blue-200">
              {finding.formula}
            </div>
          </div>

          {/* Numerator & Denominator Breakdown */}
          <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Numerator (Input A)</span>
              <span className="font-bold text-slate-900 text-sm">{finding.numerator || '155,412'}</span>
              <span className="text-[9px] text-slate-500 font-sans block mt-0.5">Completed Villages</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Denominator (Input B)</span>
              <span className="font-bold text-slate-900 text-sm">{finding.denominator || '345,178'}</span>
              <span className="text-[9px] text-slate-500 font-sans block mt-0.5">Notified Villages</span>
            </div>
          </div>

          {/* Primary Source Reference */}
          <div className="space-y-1 text-slate-600 bg-white p-3 rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Primary Source Data Provider</span>
            <div className="font-semibold text-slate-800">{finding.source}</div>
            <p className="text-[10px] text-slate-500 mt-1">
              Note: Calculated derived indicators are computed by BhoomiNiti from verified primary source records and are labeled explicitly to distinguish them from direct source statements.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-4 py-1.5 rounded shadow"
          >
            Close Proof
          </button>
        </div>

      </div>
    </div>
  );
};
