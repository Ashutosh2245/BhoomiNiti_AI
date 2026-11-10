import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { DataProvenanceModal } from '../components/DataProvenanceModal';
import { SourceDetailsModal } from '../components/SourceDetailsModal';
import { KpiSkeleton, ResearchCardSkeleton, SourcesTableSkeleton } from '../components/SkeletonLoader';
import { useCountUp } from '../hooks/useCountUp';
import {
  BookOpen, Database, Shield, FileText, Activity, Layers, ArrowRight,
  RefreshCw, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Link2,
  ExternalLink, Bookmark, Plus, AlertCircle, HelpCircle, Info, Search, Sparkles
} from 'lucide-react';

const CountUpNumber = ({ value }) => {
  const animatedValue = useCountUp(value);
  return <span>{animatedValue}</span>;
};

export const Dashboard = ({ setActiveTab }) => {
  const { user } = useContext(AuthContext);

  const [summary, setSummary] = useState(null);
  const [sources, setSources] = useState([]);
  const [recentKnowledge, setRecentKnowledge] = useState({ items: [], total: 0, last_updated: '' });
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [knowledgeLoading, setKnowledgeLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);
  const [savedDocIds, setSavedDocIds] = useState(new Set());

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchStage, setSearchStage] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState(false);

  // Modal States
  const [provenanceItem, setProvenanceItem] = useState(null);
  const [selectedSourceId, setSelectedSourceId] = useState(null);

  const fetchDashboardSummary = async () => {
    setLoading(true);
    setErrorState(false);
    try {
      const [sumRes, srcRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/sources')
      ]);
      setSummary(sumRes.data);
      setSources(srcRes.data);
    } catch (err) {
      console.error('Failed to load real dashboard summary from API:', err);
      setErrorState(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentKnowledge = async (cat) => {
    setKnowledgeLoading(true);
    try {
      const res = await api.get(`/dashboard/recent-knowledge?category=${encodeURIComponent(cat)}`);
      setRecentKnowledge(res.data);
    } catch (err) {
      console.error('Failed to load recent knowledge:', err);
    } finally {
      setKnowledgeLoading(false);
    }
  };

  // Rotating Query Hints from Reference Design
  const [hintIndex, setHintIndex] = useState(0);
  const exampleQueries = [
    'How is land use changing across districts?',
    'Find research on land acquisition delays',
    'Compare agricultural land trends',
    'Explore land-use patterns in Uttar Pradesh',
    'Show evidence related to urban expansion'
  ];

  useEffect(() => {
    fetchDashboardSummary();
    fetchRecentKnowledge(activeCategory);

    const interval = setInterval(() => {
      fetchDashboardSummary();
      fetchRecentKnowledge(activeCategory);
    }, 30000);

    const hintTimer = setInterval(() => {
      setHintIndex(prev => (prev + 1) % exampleQueries.length);
    }, 5000);

    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.getElementById('q');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      clearInterval(hintTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Draw Reference SVG Parcel Graphics
  useEffect(() => {
    function rng(s) { return () => (s = (s * 16807) % 2147483647) / 2147483647; }
    function parcels(el, seed, pal, cols, rows, W, H) {
      if (!el) return;
      const r = rng(seed), cw = W / cols, ch = H / rows;
      let h = '';
      const pt = [];
      for (let j = 0; j <= rows; j++) {
        pt[j] = [];
        for (let i = 0; i <= cols; i++) {
          pt[j][i] = [
            i * cw + (i % cols && j % rows ? (r() - 0.5) * cw * 0.5 : 0),
            j * ch + (i % cols && j % rows ? (r() - 0.5) * ch * 0.5 : 0)
          ];
        }
      }
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const p = [pt[j][i], pt[j][i + 1], pt[j + 1][i + 1], pt[j + 1][i]];
          h += `<polygon points="${p.map(q => q.map(Math.round)).join(' ')}" fill="${pal[Math.floor(r() * pal.length)]}" stroke="#0b1f3a" stroke-opacity=".35" stroke-width="1.5"/>`;
          if (r() > 0.6) {
            const a = p[0];
            for (let k = 1; k < 4; k++) {
              h += `<line x1="${a[0] + (p[1][0] - a[0]) * k / 4}" y1="${a[1] + (p[1][1] - a[1]) * k / 4}" x2="${p[3][0] + (p[2][0] - p[3][0]) * k / 4}" y2="${p[3][1] + (p[2][1] - p[3][1]) * k / 4}" stroke="#fff" stroke-opacity=".12"/>`;
            }
          }
        }
      }
      el.innerHTML = h;
    }

    const farm = ['#2f5d50', '#3c7059', '#6b7d4a', '#a39a63', '#7a6a49', '#22504f'];
    const hill = ['#23404f', '#2c5561', '#3b6a6c', '#4c7a70', '#5c7f6a'];
    const dry = ['#8a7a58', '#a08e62', '#6d6a4b', '#546347', '#7f6e52'];

    parcels(document.getElementById('sBg'), 7, farm, 14, 9, 1200, 800);
    parcels(document.getElementById('sA'), 11, farm, 9, 7, 600, 500);
    parcels(document.getElementById('sB'), 23, dry, 8, 6, 600, 500);
    parcels(document.getElementById('sC'), 5, hill, 6, 5, 400, 300);

    const elA = document.getElementById('sA');
    if (elA) elA.insertAdjacentHTML('beforeend', `<path d="M-10 380C120 300 180 350 300 250S480 160 620 80" fill="none" stroke="#7fd0cf" stroke-opacity=".7" stroke-width="7" stroke-linecap="round"/>`);
    const elB = document.getElementById('sB');
    if (elB) elB.insertAdjacentHTML('beforeend', `<path d="M-10 120C100 200 220 130 330 240S520 330 620 400" fill="none" stroke="#7fd0cf" stroke-opacity=".7" stroke-width="7" stroke-linecap="round"/>`);

    const elCont = document.getElementById('cont');
    if (elCont) {
      let c = '';
      for (let i = 1; i <= 12; i++) {
        c += `<ellipse cx="820" cy="300" rx="${i * 46}" ry="${i * 26}" transform="rotate(-14 820 300)"/>`;
        if (i < 8) c += `<ellipse cx="250" cy="620" rx="${i * 40}" ry="${i * 22}" transform="rotate(10 250 620)"/>`;
      }
      elCont.innerHTML = c;
    }
  }, []);

  const handleTabChange = (cat) => {
    setActiveCategory(cat);
    fetchRecentKnowledge(cat);
  };

  const handleSaveDocument = async (docId) => {
    try {
      await api.post(`/documents/${docId}/save`);
      setSavedDocIds(prev => new Set(prev).add(docId));
      alert(`Document #${docId} saved to user repository in database.`);
    } catch (err) {
      alert('Failed to save document.');
    }
  };

  const handleSearchSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResult(null);
    setSearchError(false);
    setSearchStage('Normalizing query terms & scanning database index...');

    try {
      await new Promise(r => setTimeout(r, 200));
      setSearchStage('Retrieving verified research, policy & GIS records...');

      const res = await api.get('/search', { params: { q: searchQuery } });
      setSearchResult(res.data);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchError(true);
    } finally {
      setSearching(false);
      setSearchStage('');
    }
  };

  const kpiItems = summary ? [
    { label: 'Total Research Resources', value: summary.research_resources, sub: `${summary.research_papers} Papers, ${summary.policy_documents} Policies, ${summary.case_studies} Cases`, icon: BookOpen, color: 'text-blue-600', targetTab: 'knowledge' },
    { label: 'Policy Documents', value: summary.policy_documents, sub: 'Statutory policy gazettes', icon: FileText, color: 'text-amber-600', targetTab: 'knowledge' },
    { label: 'Dataset Catalog', value: summary.datasets, sub: 'Spatial, LULC & administrative', icon: Database, color: 'text-teal-600', targetTab: 'knowledge' },
    { label: 'Case Studies', value: summary.case_studies, sub: 'Field implementation evaluations', icon: Shield, color: 'text-emerald-600', targetTab: 'knowledge' },
    { label: 'Active Projects', value: summary.active_projects, sub: 'Inter-institutional research', icon: Activity, color: 'text-indigo-600', targetTab: 'collaboration' },
    { label: 'GIS Matrix Layers', value: summary.gis_layers, sub: 'Vector & remote sensing layers', icon: Layers, color: 'text-purple-600', targetTab: 'gis' },
  ] : [];

  const tabs = ['All', 'Research', 'Policies', 'Legal', 'Case Studies', 'Datasets'];

  const quickActions = [
    { title: 'Research Library', desc: 'Peer-reviewed land papers', tab: 'knowledge', color: 'border-l-blue-600' },
    { title: 'Policy Gazettes', desc: 'Statutory acts & frameworks', tab: 'knowledge', color: 'border-l-amber-600' },
    { title: 'Dataset Catalog', desc: 'GeoTIFF, CSV & LULC matrices', tab: 'knowledge', color: 'border-l-teal-600' },
    { title: 'GIS Explorer', desc: 'Interactive spatial map layers', tab: 'gis', color: 'border-l-purple-600' },
    { title: 'Analytics Matrix', desc: 'National LULC & dispute velocity', tab: 'analytics', color: 'border-l-indigo-600' },
    { title: 'Policy Simulator', desc: 'Monte Carlo land conversion engine', tab: 'simulations', color: 'border-l-rose-600' },
    { title: 'Innovation Hub', desc: 'Startup challenges & pilots', tab: 'innovation', color: 'border-l-emerald-600' },
    { title: 'Evidence Reports', desc: 'Bilingual PDF, DOCX, Excel export', tab: 'reports', color: 'border-l-blue-800' }
  ];

  return (
    <div className="space-y-6">
      
      {/* INSTITUTIONAL HERO SECTION WITH CINEMATIC PARCEL LAYERS */}
      <div className="relative rounded-xl overflow-hidden bg-[#0b1f3a] text-white p-6 md:p-8 shadow-xl min-h-[440px] flex items-center border border-slate-700">
        
        {/* Parcel SVG Layers */}
        <div className="layer layer-bg absolute inset-0 opacity-40"><svg id="sBg" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 800"></svg></div>
        <div className="layer layer-mA absolute opacity-50"><svg id="sA" preserveAspectRatio="xMidYMid slice" viewBox="0 0 600 500"></svg></div>
        <div className="layer layer-mB absolute opacity-40"><svg id="sB" preserveAspectRatio="xMidYMid slice" viewBox="0 0 600 500"></svg></div>
        <div className="layer layer-mC absolute opacity-30"><svg id="sC" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 300"></svg></div>
        <div className="layer layer-fg absolute inset-0 opacity-40">
          <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
            <g stroke="#7fd0cf" strokeOpacity="0.14" strokeWidth="1">
              <path d="M300 0V800M600 0V800M900 0V800M0 200H1200M0 400H1200M0 600H1200"/>
            </g>
            <g id="cont" fill="none" stroke="#7fd0cf" strokeOpacity="0.22"></g>
          </svg>
        </div>
        <div className="hero-veil"></div>

        <div className="relative z-10 max-w-4xl space-y-4 w-full">
          
          {/* Eyebrow */}
          <div className="animate-fade-up inline-flex items-center space-x-2 bg-teal-950/80 border border-teal-500/40 text-teal-300 text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span>NATIONAL LAND EVIDENCE PLATFORM</span>
          </div>

          {/* Heading */}
          <h1 className="animate-fade-up font-extrabold text-3xl md:text-5xl text-white leading-tight tracking-tight">
            Evidence for Better Land Governance
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-up text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Discover research, explore spatial intelligence, analyse datasets and understand policy evidence through one integrated national platform. 100% database-grounded in verified Ministry of Rural Development, SVAMITVA, DILRMP 3.0, and ISRO NRSC statutory datasets.
          </p>

          {/* Search Interface */}
          <div className="animate-fade-up pt-2">
            <form onSubmit={handleSearchSubmit} className="bg-white/95 backdrop-blur-md p-2 rounded-xl border border-white/60 shadow-2xl flex items-center space-x-2 focus-within:bg-white focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/20 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
              <input
                id="q"
                type="text"
                placeholder="What do you want to understand about India's land?"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs md:text-sm text-slate-900 focus:outline-none py-1.5 font-medium placeholder-slate-400"
              />
              <kbd className="hidden sm:inline-block font-mono text-[10px] font-semibold text-slate-500 border border-slate-300 rounded px-1.5 py-0.5 bg-slate-100 shrink-0">
                /
              </kbd>
              <button
                type="submit"
                disabled={searching}
                className="bg-[#16447a] hover:bg-blue-900 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow flex items-center space-x-1.5 shrink-0 transition-all hover:-translate-y-0.5"
              >
                {searching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-teal-300" />}
                <span>{searching ? 'Querying...' : 'Search'}</span>
              </button>
            </form>

            {/* Rotating Example Hint */}
            <div className="mt-1.5 text-[11px] text-slate-300 flex items-center space-x-1 font-mono">
              <span className="opacity-80">Example query:</span>
              <span className="text-teal-300 font-semibold font-sans">"{exampleQueries[hintIndex]}"</span>
            </div>

            {/* Staged Loading Indicator */}
            {searching && (
              <div className="mt-2 text-[11px] font-mono text-blue-800 bg-blue-50 px-3 py-2 rounded border border-blue-200 flex items-center space-x-2 animate-fade-in">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-700 shrink-0" />
                <span>{searchStage}</span>
              </div>
            )}

            {/* Error State */}
            {searchError && !searching && (
              <div className="mt-3 p-4 bg-rose-50 border border-rose-200 rounded-lg space-y-2 text-xs animate-fade-up">
                <div className="font-bold text-rose-900 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Evidence Search Unavailable</span>
                </div>
                <p className="text-rose-700">Failed to connect to backend search service. Please check API server status and retry.</p>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs px-3 py-1.5 rounded shadow inline-flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Search</span>
                </button>
              </div>
            )}

            {/* Search Result Output Container */}
            {searchResult && !searching && (
              <div className="mt-4 p-4 bg-slate-50 border border-blue-200 rounded-lg space-y-4 animate-fade-up text-xs shadow-xs">
                
                {/* Search Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{searchResult.verification_summary?.status_label || "Evidence Search Results"}</span>
                    </div>
                    {searchResult.normalized_query && searchResult.normalized_query.toLowerCase() !== searchQuery.toLowerCase() && (
                      <p className="text-[11px] text-blue-800 font-mono">
                        ✦ Query auto-corrected: <span className="font-bold">{searchResult.normalized_query}</span> (original: "{searchQuery}")
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-900 font-bold px-2.5 py-1 rounded text-[11px] font-mono border border-blue-200">
                      {searchResult.total} Matched Evidence Record(s)
                    </span>
                    <button
                      type="button"
                      onClick={() => { setSearchResult(null); setSearchQuery(''); }}
                      className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-1.5 py-0.5"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Empty State */}
                {searchResult.total === 0 ? (
                  <div className="p-6 text-center bg-white rounded border border-slate-200 space-y-3">
                    <Search className="w-8 h-8 text-slate-300 mx-auto" />
                    <div className="font-bold text-sm text-slate-800">No Matching Evidence Found</div>
                    <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                      No verified documents, policies, or datasets matched query "<span className="font-semibold text-slate-700">{searchQuery}</span>".
                      Try searching for keywords like <span className="font-mono text-blue-800 font-semibold">"Varanasi"</span>, <span className="font-mono text-blue-800 font-semibold">"Urbanization"</span>, <span className="font-mono text-blue-800 font-semibold">"SVAMITVA"</span>, or <span className="font-mono text-blue-800 font-semibold">"DILRMP"</span>.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 pt-1">
                      {["Varanasi Urbanization", "SVAMITVA Property Cards", "DILRMP Cadastral", "Land Acquisition Act"].map(term => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => { setSearchQuery(term); }}
                          className="bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 text-[11px] font-medium px-2.5 py-1 rounded border border-slate-200 transition-colors"
                        >
                          Search "{term}"
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Result Cards List */
                  <div className="space-y-3">
                    {searchResult.results.map((item, idx) => (
                      <div key={item.id || idx} className="p-3.5 bg-white border border-slate-200 rounded-md shadow-2xs space-y-2 hover:border-blue-300 transition-all">
                        
                        {/* Top Line: Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div className="flex items-center space-x-2">
                            <span className="bg-blue-900 text-white font-bold text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                              {item.type_label || item.entity_type}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              Category: <span className="text-slate-800">{item.category}</span>
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {item.verification_status === 'VERIFIED' ? (
                              <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Verified Source</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Verification Pending</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Summary */}
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 leading-snug">{item.title}</h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.summary}</p>
                        </div>

                        {/* Details row: Org, Region, Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2 rounded border border-slate-200 text-[11px] font-mono text-slate-700">
                          <div>
                            <span className="text-slate-400 uppercase text-[9px] font-bold block">Organization</span>
                            <span className="font-semibold text-slate-900 truncate block">{item.organization}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase text-[9px] font-bold block">Jurisdiction / Region</span>
                            <span className="font-semibold text-blue-900 truncate block">{item.region}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase text-[9px] font-bold block">Published Date</span>
                            <span className="font-semibold text-slate-900 truncate block">{item.publication_date}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setProvenanceItem(item)}
                              className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-2xs flex items-center space-x-1 transition-colors"
                            >
                              <HelpCircle className="w-3 h-3 text-blue-400" />
                              <span>Why am I seeing this data?</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setActiveTab('knowledge')}
                              className="bg-blue-800 hover:bg-blue-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-2xs flex items-center space-x-1 transition-colors"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>View Evidence in Repository</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSaveDocument(item.id)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded border flex items-center space-x-1 transition-colors ${
                                savedDocIds.has(item.id)
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              <Bookmark className="w-3 h-3" />
                              <span>{savedDocIds.has(item.id) ? 'Saved' : 'Save Document'}</span>
                            </button>
                          </div>

                          {item.source_url && (
                            <a
                              href={item.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-blue-700 hover:text-blue-900 font-bold flex items-center space-x-1 underline"
                            >
                              <span>View Source Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Stage 5: Hero CTAs & Data Status Bar */}
          <div className="animate-fade-up flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveTab('knowledge')}
                className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs px-4 py-2.5 rounded shadow flex items-center space-x-2 transition-all hover:translate-x-0.5"
              >
                <span>Explore Research Repository</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('gis')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2.5 rounded border border-slate-300 transition-all"
              >
                <span>Open GIS Explorer</span>
              </button>
            </div>

            <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-600">
              <div className="flex items-center space-x-1 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Platform Data: Connected</span>
              </div>
              <div className="flex items-center space-x-1 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>External Feeds: 8 Sources</span>
              </div>
              <div className="text-slate-400">
                Last updated: <span className="font-bold text-slate-700">{summary?.last_updated || '28 Sep 2026, 11:32 IST'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* QUICK ACTIONS SECTION ("EXPLORE BHOOMINITI") */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900 uppercase tracking-tight flex items-center space-x-2">
          <span>Explore BhoomiNiti Governance Modules</span>
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((qa, idx) => (
            <div
              key={idx}
              onClick={() => setActiveTab(qa.tab)}
              className={`bg-white p-3.5 rounded border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 border-l-4 ${qa.color} cursor-pointer transition-all group`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-800 transition-colors">{qa.title}</h4>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-800 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{qa.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DYNAMIC DATABASE-CALCULATED KPI GRID WITH COUNT-UP */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-tight">National Governance Indicator Metrics</h3>
          <button
            onClick={fetchDashboardSummary}
            disabled={loading}
            className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Backend Values</span>
          </button>
        </div>

        {loading ? (
          <KpiSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpiItems.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveTab(kpi.targetTab)}
                  className="bg-white p-4 rounded border border-slate-200 shadow-xs hover:shadow-sm hover:-translate-y-0.5 border-t-2 hover:border-t-blue-700 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">{kpi.label}</span>
                    <Icon className={`w-4 h-4 ${kpi.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
                    <CountUpNumber value={kpi.value} />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{kpi.sub}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DATA SOURCES & INTEGRATION REGISTRY */}
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <Link2 className="w-4 h-4 text-blue-700" />
              <span>Data Sources Integration Registry</span>
            </h3>
            <p className="text-xs text-slate-500">Distinguishes internal platform data, verified external feeds, and demonstration layers. Click any row to view integration status & sync options.</p>
          </div>
        </div>

        {loading ? (
          <SourcesTableSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Data Source Name</th>
                  <th className="py-2.5 px-3">Category Tag</th>
                  <th className="py-2.5 px-3">Connection Type</th>
                  <th className="py-2.5 px-3 font-mono">Record Count</th>
                  <th className="py-2.5 px-3">Synchronization Status</th>
                  <th className="py-2.5 px-3 text-right">Action / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sources.map(src => (
                  <tr
                    key={src.id}
                    onClick={() => setSelectedSourceId(src.id)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 hover:text-blue-700 flex items-center space-x-1.5">
                      <span>{src.name}</span>
                      <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        src.category === 'PLATFORM_DATA' ? 'bg-blue-100 text-blue-800' :
                        src.category === 'EXTERNAL_DATA' ? 'bg-amber-100 text-amber-900' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {src.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">{src.connection_type}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{src.record_count}</td>
                    <td className="py-3 px-3">
                      {src.status === 'CONNECTED' ? (
                        <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>● Connected</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>External Source Not Connected</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-[11px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSourceId(src.id);
                        }}
                        className="text-blue-700 hover:text-blue-900 font-bold hover:underline"
                      >
                        View Integration Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECENTLY ADDED KNOWLEDGE WITH TAB FILTERING & STAGGERED REVEAL */}
      <div className="bg-white rounded border border-slate-200 shadow-sm p-6 space-y-4">
        
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">Recently Added Knowledge & Policy Resources</h3>
            <p className="text-xs text-slate-500">Live query returned directly from database document & dataset repository with provenance tags.</p>
          </div>
          <div className="text-xs text-slate-500 font-mono bg-slate-50 px-2.5 py-1 rounded border border-slate-200 shrink-0">
            Records in Category ({activeCategory}): <span className="font-bold text-blue-800">{recentKnowledge.total}</span>
          </div>
        </div>

        {/* Category Tabs: All, Research, Policies, Legal, Case Studies, Datasets */}
        <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3.5 py-1.5 rounded-t text-xs font-semibold transition-all shrink-0 ${
                activeCategory === tab
                  ? 'bg-blue-800 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Loading Skeleton vs Content Cards */}
        {knowledgeLoading ? (
          <ResearchCardSkeleton />
        ) : errorState ? (
          /* Error State */
          <div className="p-8 text-center bg-rose-50 rounded border border-rose-200 space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
            <div className="font-bold text-sm text-rose-900">Knowledge Data Could Not Be Loaded</div>
            <p className="text-xs text-rose-700">Failed to connect to backend database API. Fabricated fallbacks are prohibited.</p>
            <button
              onClick={() => fetchRecentKnowledge(activeCategory)}
              className="bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs px-4 py-2 rounded shadow"
            >
              Retry Database Query
            </button>
          </div>
        ) : recentKnowledge.items.length === 0 ? (
          /* Empty Database Category State */
          <div className="p-8 text-center bg-slate-50 rounded border border-slate-200 space-y-3">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="font-bold text-sm text-slate-800">No Published Items in Category "{activeCategory}"</div>
            <p className="text-xs text-slate-500">
              {user.role === 'public_user'
                ? 'No published records are currently available in this database section.'
                : 'The database currently contains zero published records under this category.'}
            </p>
            {user.role !== 'public_user' && (
              <button
                onClick={() => setActiveTab('knowledge')}
                className="bg-blue-800 hover:bg-blue-900 text-white font-semibold text-xs px-4 py-2 rounded shadow inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Upload {activeCategory} Document</span>
              </button>
            )}
          </div>
        ) : (
          /* Staggered Card Reveal List */
          <div className="space-y-4">
            {recentKnowledge.items.map((doc, idx) => (
              <div
                key={doc.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-3 hover:border-blue-400 transition-all animate-fade-up"
                style={{ animationDelay: `${(idx + 1) * 80}ms` }}
              >
                
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-900 text-blue-100 font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                      {doc.document_type?.replace('_', ' ')}
                    </span>

                    {doc.source_type === 'DEMONSTRATION' && (
                      <span className="bg-purple-100 text-purple-900 font-bold text-[10px] px-2 py-0.5 rounded border border-purple-300">
                        DEMONSTRATION DATA — Not Official Statistics
                      </span>
                    )}

                    <span className="text-xs text-slate-500 font-medium">Record #{doc.id}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {doc.verification_status === 'VERIFIED' ? (
                      <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>● Verified Source</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>▲ Verification Pending</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Summary */}
                <div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{doc.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{doc.summary}</p>
                  <div className="text-xs text-slate-500 mt-1 font-mono">
                    Organization: <span className="font-semibold text-slate-800">{doc.organization}</span> • Author: {doc.author}
                  </div>
                </div>

                {/* Date Separation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white p-2.5 rounded border border-slate-200 text-xs text-slate-700">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Published Date</span>
                    <span className="font-semibold text-slate-900 font-mono">{doc.published_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Platform Indexed</span>
                    <span className="font-semibold text-blue-700 font-mono">{doc.uploaded_at}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Source Origin</span>
                    <span className="font-semibold text-slate-800 font-mono truncate block">{doc.source_name}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setProvenanceItem(doc)}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded shadow flex items-center space-x-1.5 transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                      <span>ⓘ Why am I seeing this data?</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('knowledge')}
                      className="bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold px-3 py-1.5 rounded shadow flex items-center space-x-1 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>View in Repository</span>
                    </button>

                    <button
                      onClick={() => handleSaveDocument(doc.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded border flex items-center space-x-1 transition-colors ${
                        savedDocIds.has(doc.id)
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{savedDocIds.has(doc.id) ? 'Saved to DB' : 'Save Document'}</span>
                    </button>
                  </div>

                  {doc.source_url && (
                    <a
                      href={doc.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center space-x-1 underline"
                    >
                      <span>Open Verified Source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Provenance Modal */}
      {provenanceItem && (
        <DataProvenanceModal
          item={provenanceItem}
          onClose={() => setProvenanceItem(null)}
        />
      )}

      {/* Source Details Modal */}
      {selectedSourceId && (
        <SourceDetailsModal
          sourceId={selectedSourceId}
          onClose={() => setSelectedSourceId(null)}
        />
      )}

    </div>
  );
};
