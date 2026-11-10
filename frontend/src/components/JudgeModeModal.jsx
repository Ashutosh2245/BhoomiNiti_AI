import React, { useState } from 'react';
import {
  Trophy, CheckCircle2, ArrowRight, ArrowLeft, Play, ShieldCheck,
  Search, Bot, MapPin, BarChart3, Sliders, Users, FileSpreadsheet, X, Sparkles
} from 'lucide-react';

export const JudgeModeModal = ({ isOpen, onClose, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: '1. Discover Evidence',
      tag: 'Search & Knowledge Engine',
      icon: Search,
      targetTab: 'knowledge',
      desc: 'Query verified research papers, SVAMITVA guidelines, DILRMP 3.0 records, and Gazette of India statutory acts with 100% source transparency.',
      actionLabel: 'Go to Knowledge Repository',
      highlight: 'Zero fabricated records, hardcoded seed data, or fake dates.'
    },
    {
      step: 2,
      title: '2. Understand Insights',
      tag: 'Ask BhoomiNiti AI',
      icon: Bot,
      targetTab: 'ai_assistant',
      desc: 'Ground-truth RAG AI engine synthesizes indexed papers with exact section citations, methods, and limitation notices. No-hallucination policy enforced.',
      actionLabel: 'Open AI Evidence Assistant',
      highlight: 'Multi-paper synthesis with clickable source provenance.'
    },
    {
      step: 3,
      title: '3. Explore Geospatial Map',
      tag: 'GIS & Spatial Intelligence',
      icon: MapPin,
      targetTab: 'gis',
      desc: 'Interactive Leaflet vector layers with Sentinel NDVI vegetation index, state administrative boundaries, time-series slider (2018-2026), and District Intelligence drawers.',
      actionLabel: 'Explore Interactive GIS Map',
      highlight: 'Click Pune, Varanasi, or Mayurbhanj pins for regional context.'
    },
    {
      step: 4,
      title: '4. Analyse Land Data',
      tag: 'Analytics Workspace',
      icon: BarChart3,
      targetTab: 'analytics',
      desc: 'Database-persisted configurable policy indicators. Track LULC transition matrices, dispute velocity, and DILRMP land digitization progress.',
      actionLabel: 'View Analytics Indicators',
      highlight: 'Directly modify targets/formulas with DB persistence and audit logs.'
    },
    {
      step: 5,
      title: '5. Simulate Policy Impact',
      tag: 'Policy Lab & Scenario Engine',
      icon: Sliders,
      targetTab: 'simulations',
      desc: 'Cellular automata spatial-economic simulation engine modeling land conversion restrictions, credit expansion, and multi-year food security indices.',
      actionLabel: 'Run Policy Simulation Engine',
      highlight: 'Execute Monte Carlo projections and analyze spatial impact.'
    },
    {
      step: 6,
      title: '6. Collaborate on Research',
      tag: 'Inter-Institutional Workspace',
      icon: Users,
      targetTab: 'collaboration',
      desc: 'Multi-organization project coordination across MoRD, NITI Aayog, IIT Bombay, and TISS. Manage discussion threads and task assignments.',
      actionLabel: 'Open Collaboration Workspace',
      highlight: 'Audit-logged activity feeds and institutional task tracking.'
    },
    {
      step: 7,
      title: '7. Generate Bilingual Report',
      tag: 'Evidence Brief Exporter',
      icon: FileSpreadsheet,
      targetTab: 'reports',
      desc: 'Dynamic bilingual report generator (English, हिन्दी, English + हिन्दी). Export professional government briefs in PDF, DOCX, Excel (8 sheets), CSV, and JSON.',
      actionLabel: 'Open Bilingual Exporter',
      highlight: 'Pre-export evidence review screen with direct attachment download fix.'
    },
    {
      step: 8,
      title: '8. Verify Provenance',
      tag: 'SHA-256 Reproducibility Check',
      icon: ShieldCheck,
      targetTab: 'reports',
      desc: 'Instant cryptographic authenticity verification matching report SHA-256 hashes against original snapshot data in SQLite database.',
      actionLabel: 'Verify Report Authenticity',
      highlight: 'Government-grade data integrity and audit compliance.'
    }
  ];

  const active = steps[currentStep - 1];
  const Icon = active.icon;

  const handleStepAction = () => {
    onNavigate(active.targetTab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Top Header Bar */}
        <div className="bg-gov-navy text-white p-5 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-gov-navy font-bold shadow">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-lg text-white tracking-wide">Competition Judge Mode</h2>
                <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                  5-Minute Guided Tour
                </span>
              </div>
              <p className="text-xs text-blue-200">End-to-end interactive demonstration route across all 8 core platform pillars.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded hover:bg-blue-900/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 8-Step Interactive Stepper Bar */}
        <div className="bg-slate-900 text-slate-300 p-3 border-b border-slate-800">
          <div className="flex items-center justify-between max-w-3xl mx-auto overflow-x-auto gap-1 text-[11px]">
            {steps.map((s) => {
              const isDone = s.step < currentStep;
              const isCurrent = s.step === currentStep;
              return (
                <button
                  key={s.step}
                  onClick={() => setCurrentStep(s.step)}
                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded transition-all shrink-0 ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : isDone
                      ? 'bg-blue-900/80 text-blue-200 font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-mono text-[10px]">{s.step}.</span>
                  <span>{s.title.split(' ')[1]}</span>
                  {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Body Content */}
        <div className="p-6 space-y-6 flex-1 bg-slate-50">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                    {active.tag}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{active.title}</h3>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 font-semibold">
                Step {currentStep} of 8
              </span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed font-sans">
              {active.desc}
            </p>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start space-x-2 text-xs text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Judge Highlight:</strong> {active.highlight}
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <button
            onClick={handleStepAction}
            className="bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold px-5 py-2.5 rounded shadow flex items-center space-x-2"
          >
            <span>{active.actionLabel}</span>
            <Play className="w-4 h-4 fill-white" />
          </button>

          <button
            onClick={() => setCurrentStep(prev => Math.min(8, prev + 1))}
            disabled={currentStep === 8}
            className="px-4 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 flex items-center space-x-1"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
