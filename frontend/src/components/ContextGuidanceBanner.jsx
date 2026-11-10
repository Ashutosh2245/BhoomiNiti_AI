import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Info, CheckCircle2, ArrowRight, X } from 'lucide-react';

export const ContextGuidanceBanner = ({
  title,
  description,
  whatYouCanDo = [],
  inputsNeeded = "Keyword, state, district or topic filters",
  expectedResult = "Grounded evidence, spatial maps or downloadable bilingual reports",
  pageKey = "general"
}) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="bg-slate-900 text-white rounded-lg p-4 shadow-sm border border-slate-800 space-y-3 relative overflow-hidden">
      
      {/* Primary Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-600/30 border border-blue-500/40 p-2 rounded-md shrink-0 text-blue-400 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-base text-white tracking-tight">{title}</h2>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-400/30 uppercase font-mono">
                Guided Guidance
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{description}</p>
          </div>
        </div>

        <button
          onClick={() => setShowGuide(!showGuide)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded border border-slate-700 flex items-center space-x-1.5 shrink-0 self-start sm:self-auto transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
          <span>{showGuide ? 'Hide Page Guide' : '? Page Guide & Help'}</span>
          {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Educational Guidance Panel */}
      {showGuide && (
        <div className="pt-3 border-t border-slate-800 space-y-4 text-xs text-slate-300 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
            
            {/* 1. What can I do here? */}
            <div className="bg-slate-800/80 p-3 rounded border border-slate-700/80 space-y-1.5">
              <div className="font-bold text-blue-400 text-[11px] uppercase tracking-wider flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>1. What You Can Do Here</span>
              </div>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {whatYouCanDo.length > 0 ? (
                  whatYouCanDo.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li>Explore verified governance data and perform evidence analysis.</li>
                )}
              </ul>
            </div>

            {/* 2. What inputs do I need? */}
            <div className="bg-slate-800/80 p-3 rounded border border-slate-700/80 space-y-1.5">
              <div className="font-bold text-amber-400 text-[11px] uppercase tracking-wider flex items-center space-x-1">
                <ArrowRight className="w-3.5 h-3.5" />
                <span>2. Information You Provide</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{inputsNeeded}</p>
            </div>

            {/* 3. What will I get? */}
            <div className="bg-slate-800/80 p-3 rounded border border-slate-700/80 space-y-1.5">
              <div className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>3. Expected Result</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{expectedResult}</p>
            </div>

          </div>

          <div className="bg-blue-950/60 p-2.5 rounded border border-blue-800/50 flex items-center justify-between text-[11px]">
            <span className="text-blue-200">
              💡 <strong>Tip:</strong> Hover over any term with a dotted underline for plain-language definitions.
            </span>
            <button
              onClick={() => setShowGuide(false)}
              className="text-slate-400 hover:text-white text-[10px] underline"
            >
              Close Guide
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
