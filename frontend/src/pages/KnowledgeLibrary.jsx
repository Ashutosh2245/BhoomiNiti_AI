import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Search, Filter, Plus, FileText, Download, Tag, X, ExternalLink,
  ShieldCheck, HelpCircle, Bookmark, Database, CheckCircle2, ChevronRight, RefreshCw
} from 'lucide-react';
import { ContextGuidanceBanner } from '../components/ContextGuidanceBanner';
import { EmptyState } from '../components/EmptyState';
import { DataProvenanceModal } from '../components/DataProvenanceModal';

export const KnowledgeLibrary = () => {
  const [activeTab, setActiveTab] = useState('research_paper');
  const [documents, setDocuments] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedVerification, setSelectedVerification] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [provenanceItem, setProvenanceItem] = useState(null);
  const [savedDocIds, setSavedDocIds] = useState(new Set());

  // Upload Form State
  const [uploadData, setUploadData] = useState({
    title: '',
    doc_type: 'research_paper',
    category: 'Land Administration',
    author: '',
    publication_year: 2025,
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    access_level: 'PUBLIC',
    abstract: '',
    key_findings: '',
    methodology: '',
    tags: 'land conversion, peri-urban, cadastral'
  });

  const fetchDocs = async () => {
    setLoading(true);
    try {
      if (activeTab === 'datasets') {
        const res = await api.get('/datasets');
        setDatasets(res.data);
      } else {
        const params = { doc_type: activeTab };
        if (searchTerm) params.search = searchTerm;
        if (selectedState) params.state = selectedState;
        if (selectedVerification) params.verification_status = selectedVerification;
        const res = await api.get('/documents', { params });
        setDocuments(res.data);
      }
    } catch (err) {
      console.error('Failed to load knowledge repository data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [activeTab, searchTerm, selectedState, selectedVerification]);

  const handleSaveDoc = async (id) => {
    try {
      await api.post(`/documents/${id}/save`);
      setSavedDocIds(prev => new Set(prev).add(id));
      alert(`Document #${id} saved to your user repository.`);
    } catch (err) {
      alert('Failed to save document.');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(uploadData).forEach(key => formData.append(key, uploadData[key]));
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Document uploaded successfully to repository!');
      setShowUploadModal(false);
      fetchDocs();
    } catch (err) {
      alert('Failed to upload document.');
    }
  };

  const tabs = [
    { id: 'research_paper', label: 'Research Papers' },
    { id: 'policy', label: 'Statutory Policies' },
    { id: 'legal', label: 'Legal Gazettes' },
    { id: 'case_study', label: 'Case Studies' },
    { id: 'datasets', label: 'Dataset Catalog' }
  ];

  const statesList = [
    'All States', 'Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Telangana', 'Madhya Pradesh', 'Rajasthan', 'Gujarat'
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Title Header with Dark/Light Theme Support */}
      <div className="bg-white dark:bg-[#10233b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">National Land Knowledge & Policy Repository</h2>
            <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-mono font-bold px-2 py-0.5 rounded border border-blue-300 dark:border-blue-800">
              Verified DB
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, and inspect peer-reviewed research papers, statutory policy gazettes, legal frameworks, case studies, and spatial LULC datasets.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-[#16447a] hover:bg-blue-900 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow flex items-center space-x-1.5 shrink-0 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 text-teal-300" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Global Guidance Banner */}
      <ContextGuidanceBanner
        title="Knowledge Repository Guidance"
        description="Filter statutory policy documents, peer-reviewed land governance research, or GIS LULC datasets by jurisdiction, document type, or topic."
        whatYouCanDo={[
          "Select category tabs to view specific document or dataset types",
          "Apply state jurisdiction and verification status filters",
          "Click any item to view full abstract, methodology, key findings, and source provenance",
          "Bookmark items directly to your personal Saved Intelligence repository"
        ]}
        inputsNeeded="Select category tabs or filter by keyword/state."
        expectedResult="Filtered repository records with verification badges, downloadable sources, and provenance modals."
      />

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-[#10233b] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        
        {/* Category Tabs */}
        <div className="flex items-center space-x-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all shrink-0 ${
                activeTab === t.id
                  ? 'bg-[#16447a] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Filter title, keywords, authors, or topics..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value === 'All States' ? '' : e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            {statesList.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <select
            value={selectedVerification}
            onChange={e => setSelectedVerification(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            <option value="">All Verification States</option>
            <option value="VERIFIED">VERIFIED Source</option>
            <option value="PENDING">PENDING Verification</option>
          </select>

        </div>
      </div>

      {/* Main Repository List */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-[#10233b] rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <RefreshCw className="w-6 h-6 text-blue-700 dark:text-blue-400 animate-spin mx-auto" />
          <div className="text-xs font-mono text-slate-500">Querying database records...</div>
        </div>
      ) : activeTab === 'datasets' ? (
        /* Datasets View */
        datasets.length === 0 ? (
          <EmptyState
            title="No Datasets Found"
            message="No spatial or tabular datasets match the current search filters."
            actionText="Refresh Catalog"
            onAction={fetchDocs}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets.map(ds => (
              <div key={ds.id} className="bg-white dark:bg-[#10233b] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-blue-400 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                      {ds.format || 'GIS Dataset'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">ID #{ds.id}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{ds.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{ds.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-[11px] font-mono text-slate-500 flex justify-between">
                    <span>Provider: <strong className="text-slate-800 dark:text-slate-200">{ds.provider}</strong></span>
                    <span>Records: <strong className="text-blue-700 dark:text-blue-400">{ds.record_count}</strong></span>
                  </div>
                  {ds.source_url && (
                    <a
                      href={ds.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-700 dark:text-blue-400 font-bold hover:underline flex items-center space-x-1"
                    >
                      <span>Access Dataset URL</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Documents View */
        documents.length === 0 ? (
          <EmptyState
            title={`No Published Items in Category "${activeTab.replace('_', ' ')}"`}
            message="No records matched the selected parameters in the SQLite database."
            actionText="Clear Filters"
            onAction={() => { setSearchTerm(''); setSelectedState(''); setSelectedVerification(''); }}
          />
        ) : (
          <div className="space-y-4">
            {documents.map((doc, idx) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-[#10233b] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-blue-400 transition-all"
              >
                {/* Header Badge Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-900 text-white font-bold text-[10px] px-2 py-0.5 rounded font-mono uppercase">
                      {doc.doc_type?.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Record #{doc.id} • {doc.category || 'Land Governance'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {doc.verification_status === 'VERIFIED' ? (
                      <span className="inline-flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified Source</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                        <Tag className="w-3.5 h-3.5 text-amber-600" />
                        <span>Verification Pending</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Details */}
                <div>
                  <h3
                    onClick={() => setSelectedDoc(doc)}
                    className="font-bold text-base text-slate-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer transition-colors leading-snug"
                  >
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{doc.summary}</p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Author / Organization</span>
                    <span className="font-semibold text-slate-900 dark:text-white truncate block">{doc.author || 'Government Network'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Jurisdiction</span>
                    <span className="font-semibold text-blue-800 dark:text-blue-300 truncate block">{doc.district ? `${doc.district}, ${doc.state}` : (doc.state || 'National')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Published Date</span>
                    <span className="font-semibold text-slate-900 dark:text-white truncate block">{doc.published_date || doc.publication_year}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setProvenanceItem(doc)}
                      className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center space-x-1.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                      <span>Why am I seeing this data?</span>
                    </button>

                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="bg-[#16447a] hover:bg-blue-900 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center space-x-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Full Details</span>
                    </button>

                    <button
                      onClick={() => handleSaveDoc(doc.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded border flex items-center space-x-1 transition-colors ${
                        savedDocIds.has(doc.id)
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{savedDocIds.has(doc.id) ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>

                  {doc.source_url && (
                    <a
                      href={doc.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-700 dark:text-blue-400 font-bold hover:underline flex items-center space-x-1"
                    >
                      <span>Open Verified Source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Provenance Modal */}
      {provenanceItem && (
        <DataProvenanceModal
          item={provenanceItem}
          onClose={() => setProvenanceItem(null)}
        />
      )}

      {/* Full Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#10233b] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 animate-fade-up">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="bg-blue-900 text-white font-bold text-[10px] px-2.5 py-1 rounded font-mono uppercase">
                {selectedDoc.doc_type?.replace('_', ' ')}
              </span>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="font-bold text-lg leading-snug">{selectedDoc.title}</h2>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs space-y-1 font-mono text-slate-700 dark:text-slate-300">
              <div>Author: <strong>{selectedDoc.author || 'Government Network'}</strong></div>
              <div>Organization: <strong>{selectedDoc.organization_name || 'BhoomiNiti Network'}</strong></div>
              <div>Published: <strong>{selectedDoc.published_date || selectedDoc.publication_year}</strong></div>
              <div>Jurisdiction: <strong>{selectedDoc.district ? `${selectedDoc.district}, ${selectedDoc.state}` : (selectedDoc.state || 'National')}</strong></div>
            </div>

            <div className="space-y-2 text-xs leading-relaxed">
              <h4 className="font-bold uppercase tracking-wider text-slate-500 font-mono">Abstract / Executive Summary</h4>
              <p className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">{selectedDoc.summary}</p>
            </div>

            {selectedDoc.source_url && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <a
                  href={selectedDoc.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#16447a] hover:bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5"
                >
                  <span>Open Official Source Document</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#10233b] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-fade-up">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base">Upload Document to National Repository</h3>
              <button onClick={() => setShowUploadModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={uploadData.title}
                  onChange={e => setUploadData({ ...uploadData, title: e.target.value })}
                  placeholder="e.g. Varanasi Urban Peri-Urban Land Diversion Analysis"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Document Type</label>
                  <select
                    value={uploadData.doc_type}
                    onChange={e => setUploadData({ ...uploadData, doc_type: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded focus:outline-none"
                  >
                    <option value="research_paper">Research Paper</option>
                    <option value="policy">Policy Gazette</option>
                    <option value="legal">Legal Gazette</option>
                    <option value="case_study">Case Study</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">State Jurisdiction</label>
                  <input
                    type="text"
                    value={uploadData.state}
                    onChange={e => setUploadData({ ...uploadData, state: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Summary / Abstract</label>
                <textarea
                  rows="3"
                  value={uploadData.abstract}
                  onChange={e => setUploadData({ ...uploadData, abstract: e.target.value })}
                  placeholder="Abstract text describing land governance findings..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#16447a] hover:bg-blue-900 text-white font-bold shadow"
                >
                  Save to Database
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
