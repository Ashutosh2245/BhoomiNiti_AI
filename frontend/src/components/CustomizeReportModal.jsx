import React, { useState } from 'react';
import api from '../services/api';
import { X, FileText, Download, CheckCircle2, AlertCircle, RefreshCw, Sliders, Globe } from 'lucide-react';

export const CustomizeReportModal = ({ onReportGenerated, onClose }) => {
  const [language, setLanguage] = useState('en-hi'); // en, hi, en-hi
  const [format, setFormat] = useState('pdf'); // pdf, docx, excel, csv, json
  const [reportTitle, setReportTitle] = useState('Land Governance Evidence Report: SVAMITVA & DILRMP 3.0 Implementation Analysis');
  
  const [sections, setSections] = useState({
    executive_summary: true,
    key_findings: true,
    charts: true,
    tables: true,
    geographic_analysis: true,
    sources: true,
    methodology: true,
    data_quality: true,
    limitations: true,
    appendix: true
  });

  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [error, setError] = useState(null);

  const toggleSection = (key) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerationResult(null);
    setError(null);

    try {
      const payload = {
        title: reportTitle,
        language: language,
        format: format,
        options: sections,
        filters: { state: 'All', year: '2026', indicator: 'All' },
        use_current_data: true
      };

      const res = await api.post('/reports/generate', payload);
      setGenerationResult(res.data);
      if (onReportGenerated) onReportGenerated(res.data);
    } catch (err) {
      console.error('Report generation failed:', err);
      setError(err.response?.data?.detail || 'Report generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between border-b border-blue-950">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-5 h-5 text-blue-300" />
            <div>
              <h3 className="font-bold text-base">Customize & Generate Intelligence Report</h3>
              <p className="text-xs text-blue-200">Configure report language, included sections, and export format</p>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-300 hover:text-white p-1 rounded-md hover:bg-blue-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">

          {/* Success Banner if Generated */}
          {generationResult && (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded text-emerald-950 space-y-2">
              <div className="font-bold flex items-center space-x-2 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Report Successfully Generated & Hash Verified!</span>
              </div>
              <p className="text-xs text-emerald-800 font-mono">
                Report ID: <strong>{generationResult.report_id}</strong> | Format: <strong>{generationResult.format.toUpperCase()}</strong> | Hash: {generationResult.file_hash?.substring(0, 16)}...
              </p>
              <div className="pt-2 flex items-center space-x-3">
                <a
                  href={(() => {
                    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
                    const cleanBase = baseUrl.replace(/\/+$/, '');
                    const path = generationResult.download_url.startsWith('/') ? generationResult.download_url : `/${generationResult.download_url}`;
                    const finalPath = path.startsWith('/api/v1') ? path.replace('/api/v1', '') : path;
                    return `${cleanBase}${finalPath}`;
                  })()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded shadow flex items-center space-x-1.5 text-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Generated {generationResult.format.toUpperCase()} Report</span>
                </a>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-300 p-4 rounded text-rose-900 space-y-1">
              <div className="font-bold flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Generation Error</span>
              </div>
              <p>{error}</p>
            </div>
          )}

          {/* 1. Report Title */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 text-xs">Report Title</label>
            <input
              type="text"
              value={reportTitle}
              onChange={e => setReportTitle(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 text-xs font-semibold focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* 2. Language Selector Bar */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
            <div className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
              <Globe className="w-4 h-4 text-blue-700" />
              <span>Report Language / रिपोर्ट भाषा</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'en', label: 'English', desc: 'English Only' },
                { id: 'hi', label: 'हिन्दी', desc: 'Hindi Only' },
                { id: 'en-hi', label: 'English + हिन्दी', desc: 'Bilingual (Recommended)' }
              ].map(langOption => (
                <button
                  key={langOption.id}
                  type="button"
                  onClick={() => setLanguage(langOption.id)}
                  className={`p-3 rounded border text-left transition-all ${
                    language === langOption.id
                      ? 'bg-blue-800 text-white border-blue-900 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs">{langOption.label}</div>
                  <div className={`text-[10px] ${language === langOption.id ? 'text-blue-200' : 'text-slate-400'}`}>
                    {langOption.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Export Format Selector */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
            <div className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>Target Export Format</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'pdf', label: 'PDF', desc: 'Polished Brief' },
                { id: 'docx', label: 'DOCX', desc: 'Editable Word' },
                { id: 'excel', label: 'Excel', desc: 'Multi-Tab Data' },
                { id: 'csv', label: 'CSV', desc: 'Raw Tabular' },
                { id: 'json', label: 'JSON', desc: 'Machine Spec' }
              ].map(fmtOption => (
                <button
                  key={fmtOption.id}
                  type="button"
                  onClick={() => setFormat(fmtOption.id)}
                  className={`p-2.5 rounded border text-center transition-all ${
                    format === fmtOption.id
                      ? 'bg-blue-800 text-white border-blue-900 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-bold">{fmtOption.label}</div>
                  <div className={`text-[9px] ${format === fmtOption.id ? 'text-blue-200' : 'text-slate-400'}`}>
                    {fmtOption.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Included Sections Checkboxes */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
            <div className="font-bold text-xs text-slate-900">Include Report Sections</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { key: 'executive_summary', label: 'Executive Summary' },
                { key: 'key_findings', label: 'Key Evidence & Findings' },
                { key: 'charts', label: 'Data Visualizations / Charts' },
                { key: 'tables', label: 'State & District Tables' },
                { key: 'geographic_analysis', label: 'Geographic Picture' },
                { key: 'sources', label: 'Sources & Provenance' },
                { key: 'methodology', label: 'Methodology & Formulas' },
                { key: 'data_quality', label: 'Data Quality Audit' },
                { key: 'limitations', label: 'Honest Limitations' },
                { key: 'appendix', label: 'Policy Relevance Appendix' }
              ].map(item => (
                <label key={item.key} className="flex items-center space-x-2 bg-white p-2 rounded border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={sections[item.key]}
                    onChange={() => toggleSection(item.key)}
                    className="rounded text-blue-700 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="font-semibold text-slate-800 text-[11px]">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="bg-white hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2 rounded border border-slate-300"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs px-5 py-2.5 rounded shadow flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? `Generating ${format.toUpperCase()}...` : `Generate ${format.toUpperCase()} Report`}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
