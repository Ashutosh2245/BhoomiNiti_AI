import React, { useState, useEffect } from 'react';
import { Bookmark, FileText, Database, MapPin, FileSpreadsheet, X, Trash2, ArrowRight } from 'lucide-react';

export const MyIntelligenceModal = ({ isOpen, onClose, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('research');
  const [savedItems, setSavedItems] = useState({
    research: [
      { id: 1, title: 'SVAMITVA Scheme Implementation Impact on Property Rights in Rural India', author: 'NITI Aayog Land Policy Unit', year: 2024, type: 'Policy Evaluation' },
      { id: 2, title: 'Assessment of Agricultural Land Conversion Trends in Urban Belts', author: 'IIT Bombay CERA', year: 2023, type: 'Research Paper' }
    ],
    datasets: [
      { id: 101, name: 'State-wise DILRMP Land Record Digitization Index', format: 'CSV', provider: 'DoLR' },
      { id: 102, name: 'National Sentinel NDVI Land Cover Raster Matrix (2019-2024)', format: 'GeoTIFF', provider: 'ISRO NRSC' }
    ],
    reports: [
      { id: 'REP-2026-001', name: 'Bilingual Land Governance Evidence Brief', date: '2026-09-28', language: 'English + हिन्दी' }
    ]
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Bookmark className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <h3 className="font-bold text-base text-white">My Saved Intelligence</h3>
              <p className="text-xs text-slate-400">Personal repository of saved research papers, datasets, maps, and reports.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100 text-xs px-3 font-semibold">
          {[
            { id: 'research', label: `Saved Research (${savedItems.research.length})`, icon: FileText },
            { id: 'datasets', label: `Saved Datasets (${savedItems.datasets.length})`, icon: Database },
            { id: 'reports', label: `Saved Reports (${savedItems.reports.length})`, icon: FileSpreadsheet }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 flex items-center space-x-1.5 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-800 text-blue-900 font-bold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto bg-slate-50">
          {activeTab === 'research' && (
            <div className="space-y-2">
              {savedItems.research.map(item => (
                <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center text-xs hover:border-blue-300">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">{item.title}</div>
                    <div className="text-[11px] text-slate-500">{item.author} ({item.year}) • {item.type}</div>
                  </div>
                  <button
                    onClick={() => { onNavigate('knowledge'); onClose(); }}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-semibold px-3 py-1.5 rounded border border-blue-200 shrink-0 ml-3 flex items-center space-x-1"
                  >
                    <span>View Record</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'datasets' && (
            <div className="space-y-2">
              {savedItems.datasets.map(item => (
                <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center text-xs hover:border-teal-300">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-500">Provider: {item.provider} • Format: {item.format}</div>
                  </div>
                  <button
                    onClick={() => { onNavigate('knowledge'); onClose(); }}
                    className="bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-semibold px-3 py-1.5 rounded border border-teal-200 shrink-0 ml-3 flex items-center space-x-1"
                  >
                    <span>Explore Data</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-2">
              {savedItems.reports.map(item => (
                <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center text-xs hover:border-indigo-300">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-500">ID: #{item.id} • Date: {item.date} • {item.language}</div>
                  </div>
                  <button
                    onClick={() => { onNavigate('reports'); onClose(); }}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[11px] font-semibold px-3 py-1.5 rounded border border-indigo-200 shrink-0 ml-3 flex items-center space-x-1"
                  >
                    <span>Open Reports</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 text-right">
          <button onClick={onClose} className="bg-slate-800 text-white text-xs font-semibold px-4 py-1.5 rounded">
            Close Repository
          </button>
        </div>

      </div>
    </div>
  );
};
