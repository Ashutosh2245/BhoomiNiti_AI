import React from 'react';
import { Search, Filter, Plus, FileText, ArrowRight, RefreshCw } from 'lucide-react';

export const EmptyState = ({
  title = "No research found",
  description = "We couldn't find resources matching your current search or filter criteria.",
  suggestions = [
    "Remove a filter or select 'All States'",
    "Search using broader keywords (e.g., 'land', 'cadastral', 'policy')",
    "Select another time period or year",
    "Switch knowledge categories above"
  ],
  actionLabel = "Clear Filters",
  onAction
}) => {
  return (
    <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200 space-y-4 max-w-lg mx-auto my-4">
      <div className="w-12 h-12 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto border border-slate-300">
        <FileText className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h4 className="font-bold text-base text-slate-900">{title}</h4>
        <p className="text-xs text-slate-600">{description}</p>
      </div>

      {suggestions.length > 0 && (
        <div className="bg-white p-3.5 rounded border border-slate-200 text-left text-xs space-y-1.5 font-sans">
          <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Try the following:</div>
          <ul className="space-y-1 text-slate-600 text-[11px]">
            {suggestions.map((s, idx) => (
              <li key={idx} className="flex items-start space-x-1.5">
                <span className="text-blue-700 font-bold">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {onAction && (
        <button
          onClick={onAction}
          className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs px-4 py-2 rounded shadow inline-flex items-center space-x-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
