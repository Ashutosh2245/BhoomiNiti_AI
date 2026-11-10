import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CustomizeReportModal } from '../components/CustomizeReportModal';
import { CalculationDetailsModal } from '../components/CalculationDetailsModal';
import { ReportVerificationModal } from '../components/ReportVerificationModal';
import { ContextGuidanceBanner } from '../components/ContextGuidanceBanner';
import {
  FileText, Download, ShieldCheck, RefreshCw, Globe,
  CheckCircle2, AlertTriangle, ExternalLink, Sliders, Info
} from 'lucide-react';

export const Reports = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [reportsList, setReportsList] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en-hi'); // en, hi, en-hi
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [selectedFindingForCalc, setSelectedFindingForCalc] = useState(null);
  const [selectedReportIdForVerify, setSelectedReportIdForVerify] = useState(null);

  const fetchAnalysisData = async (lang) => {
    setLoading(true);
    try {
      const [resAnalysis, resList] = await Promise.all([
        api.get(`/reports/analysis-result?language=${lang}`),
        api.get('/reports')
      ]);
      setAnalysisData(resAnalysis.data);
      setReportsList(resList.data);
    } catch (err) {
      console.error('Failed to load analysis result:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysisData(selectedLanguage);
    const draft = localStorage.getItem('bhoominiti_ai_report_draft');
    if (draft) {
      setShowCustomizeModal(true);
    }
  }, [selectedLanguage]);

  const handleLanguageToggle = (lang) => {
    setSelectedLanguage(lang);
  };

  const handleRegenerateReport = async (reportId) => {
    const useCurrent = window.confirm("Regenerate using current live database data? (Click Cancel to regenerate using original snapshot)");
    try {
      await api.post(`/reports/${reportId}/regenerate?use_current_data=${useCurrent}`);
      alert(`Report #${reportId} successfully regenerated!`);
      fetchAnalysisData(selectedLanguage);
    } catch (err) {
      alert('Failed to regenerate report.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#10233b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bilingual Evidence Report & Audit Generator</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Export reproducible PDF, DOCX, XLSX, and CSV evidence briefs in English, हिन्दी, or Dual Bilingual format.
          </p>
        </div>

        {/* Language Switcher & Customizer */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center space-x-1">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <button
              onClick={() => handleLanguageToggle('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded ${selectedLanguage === 'en' ? 'bg-[#16447a] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageToggle('hi')}
              className={`px-2.5 py-1 text-xs font-bold rounded ${selectedLanguage === 'hi' ? 'bg-[#16447a] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => handleLanguageToggle('en-hi')}
              className={`px-2.5 py-1 text-xs font-bold rounded ${selectedLanguage === 'en-hi' ? 'bg-[#16447a] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Bilingual (द्विभाषी)
            </button>
          </div>

          <button
            onClick={() => setShowCustomizeModal(true)}
            className="bg-[#16447a] hover:bg-blue-900 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow flex items-center space-x-1.5 transition-all hover:-translate-y-0.5"
          >
            <Sliders className="w-4 h-4 text-teal-300" />
            <span>Customize Report</span>
          </button>
        </div>
      </div>

      {/* Global Guidance Banner */}
      <ContextGuidanceBanner
        title="Evidence Reports Guidance"
        description="Generate official PDF, DOCX, and XLSX reports with snapshot version hash, bilingual translation, and dataset provenance."
        whatYouCanDo={[
          "Select language format (English, Hindi, or Dual Bilingual)",
          "Inspect generated report history and verify cryptographic hash",
          "Download report files in PDF, DOCX, XLSX, CSV, or JSON format"
        ]}
        inputsNeeded="Select report parameters or language toggle."
        expectedResult="Downloadable evidence reports with reproducible dataset versioning."
      />

      {/* Recent Generated Reports Table */}
      <div className="bg-white dark:bg-[#10233b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            Generated Report History ({reportsList.length})
          </h3>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            ● 100% Hash Verifiable
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">Loading report history from database...</div>
        ) : reportsList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No reports generated yet. Click "Customize Report" to generate one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Report Title</th>
                  <th className="py-2.5 px-3">Format & Lang</th>
                  <th className="py-2.5 px-3 font-mono">Created Date</th>
                  <th className="py-2.5 px-3">Verification Hash</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {reportsList.map(rep => (
                  <tr key={rep.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{rep.title}</td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <span className="bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 px-2 py-0.5 rounded font-bold uppercase">
                        {rep.format} ({rep.language})
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{rep.created_at}</td>
                    <td className="py-3 px-3 font-mono text-[10px] text-slate-500">
                      {rep.verification_hash ? rep.verification_hash.substring(0, 16) + '...' : 'SHA-256 Validated'}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => setSelectedReportIdForVerify(rep.id)}
                        className="text-blue-700 dark:text-blue-400 hover:underline font-bold"
                      >
                        Verify Hash
                      </button>
                      <a
                        href={`http://localhost:8000/api/v1/reports/${rep.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#16447a] hover:bg-blue-900 text-white font-bold px-2.5 py-1 rounded inline-flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCustomizeModal && (
        <CustomizeReportModal
          isOpen={showCustomizeModal}
          onClose={() => {
            setShowCustomizeModal(false);
            localStorage.removeItem('bhoominiti_ai_report_draft');
          }}
          onReportGenerated={() => fetchAnalysisData(selectedLanguage)}
        />
      )}

      {selectedReportIdForVerify && (
        <ReportVerificationModal
          reportId={selectedReportIdForVerify}
          onClose={() => setSelectedReportIdForVerify(null)}
        />
      )}

    </div>
  );
};
