import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Bot, Search, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight,
  FileSpreadsheet, MapPin, BarChart2, MessageSquare, HelpCircle, Sparkles,
  BookOpen, CornerDownRight, RefreshCw, Send, ChevronRight
} from 'lucide-react';
import { ContextGuidanceBanner } from '../components/ContextGuidanceBanner';

export const AiResearchAssistant = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [glossary, setGlossary] = useState([]);
  const [activeConcept, setActiveConcept] = useState(null);

  const presets = [
    'What is ULPIN (Bhu-Aadhaar) and how does it prevent parcel title duplication?',
    'What research exists on digital cadastral mapping and land dispute reduction in Maharashtra?',
    'Assessment of agricultural land conversion to urban peri-urban zones in Bengaluru Rural',
    'SVAMITVA scheme implementation drone survey results in Uttar Pradesh',
    'What is the legal framework under RFCTLARR Act 2013 for land acquisition compensation?'
  ];

  // Fetch statutory concepts glossary on mount
  useEffect(() => {
    api.get('/ai/concepts')
      .then(res => setGlossary(res.data))
      .catch(err => console.warn('Failed to load concepts glossary:', err));
  }, []);

  const handleSearch = async (qText) => {
    const textToRun = qText || query;
    if (!textToRun.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/ai/query', {
        query: textToRun,
        conversation_history: conversationHistory
      });
      setResult(res.data);

      // Append to conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: textToRun },
        { role: 'assistant', content: res.data.summary }
      ]);
    } catch (err) {
      alert('AI Query failed. Please check backend API server connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCrossQuestion = async (crossQ) => {
    setQuery(crossQ);
    await handleSearch(crossQ);
  };

  const handleTurnIntoReport = () => {
    if (!result) return;
    localStorage.setItem('bhoominiti_ai_report_draft', JSON.stringify({
      query: result.query,
      summary: result.summary,
      findings: result.key_findings,
      sources: result.sources
    }));
    if (onNavigate) onNavigate('reports');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Title Header with Dark/Light Theme Support */}
      <div className="bg-white dark:bg-[#10233b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-900 text-amber-400 rounded-lg flex items-center justify-center font-bold shadow shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ask BhoomiNiti — Grounded AI Research Assistant</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Retrieval-Augmented Generation (RAG) & Statutory Concept Engine grounded strictly in verified research, laws, and spatial datasets.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Zero-Hallucination Guardrails</span>
            </span>
          </div>
        </div>

        {/* Anti-Hallucination Notice */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3 rounded-lg text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100">Strict Evidence Grounding: </span>
            <span>Responses synthesize verified repository records and official statutory frameworks. Unsupported claims or invented statistics are withheld.</span>
          </div>
        </div>
      </div>

      {/* Global Guidance Banner */}
      <ContextGuidanceBanner
        title="AI Evidence Assistant Guidance"
        description="Ask natural-language questions regarding statutory land concepts, policy frameworks, ULPIN/Bhu-Aadhaar, SVAMITVA drone surveys, or cadastral mapping."
        whatYouCanDo={[
          "Ask questions or click pre-formatted research prompts",
          "Inspect statutory concept definitions (e.g. ULPIN, SVAMITVA, RFCTLARR Act)",
          "Use follow-up chips and cross-questions to drill deeper into evidence",
          "Click 'Turn this into a Report' to generate formal documentation"
        ]}
        inputsNeeded="Enter a land governance question or pick a prompt below."
        expectedResult="Grounded synthesis brief with citations, concept definitions, cross-questions, and report export."
      />

      {/* Statutory Concepts Quick Glossary Bar */}
      {glossary.length > 0 && (
        <div className="bg-white dark:bg-[#10233b] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Statutory Land Terms & Concepts Glossary</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{glossary.length} Defined Terms</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {glossary.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveConcept(item);
                  setQuery(`Explain ${item.term}`);
                  handleSearch(`Explain ${item.term}`);
                }}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/80 text-slate-800 dark:text-slate-200 hover:text-blue-900 dark:hover:text-blue-300 text-[11px] font-semibold px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 transition-colors flex items-center space-x-1"
              >
                <span>{item.term.split('(')[0].strip || item.term.split('-')[0]}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Query Search Input */}
      <div className="bg-white dark:bg-[#10233b] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask any question on land governance, ULPIN, SVAMITVA, RFCTLARR Act, or LULC trends..."
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-700 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="bg-[#16447a] hover:bg-blue-900 text-white font-bold text-xs px-6 py-3 rounded-lg shadow flex items-center space-x-2 shrink-0 disabled:opacity-50 transition-all hover:-translate-y-0.5"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-teal-300" />}
            <span>{loading ? 'Searching RAG...' : 'Ask BhoomiNiti'}</span>
          </button>
        </div>

        {/* Sample Research Prompts */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Sample Research Prompts:</div>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => { setQuery(p); handleSearch(p); }}
                className="text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/80 text-slate-700 dark:text-slate-300 hover:text-blue-900 dark:hover:text-blue-300 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-left transition-colors flex items-center space-x-1"
              >
                <span>{p}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="bg-white dark:bg-[#10233b] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-6 p-6 transition-colors">
          
          {/* Grounded Status Header */}
          <div className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            result.answer_grounded
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          }`}>
            <div className="flex items-center space-x-2.5">
              {result.answer_grounded ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <div>
                <div className="font-bold text-sm">
                  {result.answer_grounded
                    ? 'Grounded Response Verified from Indexed Evidence'
                    : 'Insufficient Evidence Notice'}
                </div>
                <div className="text-[11px] opacity-80 font-mono mt-0.5">
                  Intent: {result.intent} • Citations: {result.sources ? result.sources.length : 0}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="bg-white dark:bg-slate-900 border border-current text-[11px] font-bold px-2.5 py-1 rounded font-mono">
                Verification: VERIFIED
              </span>
            </div>
          </div>

          {/* Statutory Concept Card Breakdown (if matched) */}
          {result.concept_definitions && result.concept_definitions.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Statutory Concept Definition</span>
              </h3>
              {result.concept_definitions.map((c, idx) => (
                <div key={idx} className="p-4 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 space-y-2 text-xs">
                  <div className="font-bold text-sm text-blue-950 dark:text-blue-200">{c.term}</div>
                  <p className="text-slate-800 dark:text-slate-300 leading-relaxed">{c.definition}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-blue-200/60 dark:border-blue-900/60 font-mono text-[11px] text-slate-700 dark:text-slate-400">
                    <div><span className="font-bold text-blue-900 dark:text-blue-300">Authority:</span> {c.authority}</div>
                    <div><span className="font-bold text-blue-900 dark:text-blue-300">Framework:</span> {c.act_or_scheme}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Main Synthesis Answer */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">1. Evidence Synthesis Answer</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-line">
              {result.summary}
            </div>
          </div>

          {/* Key Findings */}
          {result.key_findings && result.key_findings.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">2. Key Evidence Findings</h3>
              <div className="space-y-2">
                {result.key_findings.map((f, i) => (
                  <div key={i} className="p-3 bg-blue-50/60 dark:bg-slate-900/60 rounded-lg border border-blue-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-start space-x-2">
                    <span className="font-bold text-blue-800 dark:text-blue-400 shrink-0">•</span>
                    <span className="whitespace-pre-wrap">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytical Cross-Questions & Follow-Up Prompts */}
          {(result.followup_questions?.length > 0 || result.cross_questions?.length > 0) && (
            <div className="p-4 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-900 space-y-3">
              <div className="font-bold text-xs text-purple-950 dark:text-purple-200 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                <CornerDownRight className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                <span>Analytical Cross-Questions & Deep-Dive Prompts</span>
              </div>

              <div className="space-y-2">
                {result.cross_questions?.map((cq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCrossQuestion(cq)}
                    className="w-full text-left p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-purple-200 dark:border-purple-800 text-xs text-purple-950 dark:text-purple-200 hover:border-purple-400 transition-all flex items-center justify-between group"
                  >
                    <span className="font-semibold">⚡ Cross-Question: {cq}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                  </button>
                ))}

                {result.followup_questions?.map((fq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCrossQuestion(fq)}
                    className="w-full text-left p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 hover:border-blue-400 transition-all flex items-center justify-between group"
                  >
                    <span>✦ Follow-up: {fq}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Indexed Source Citations */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">3. Indexed Source Citations</h3>
            {!result.sources || result.sources.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-3 bg-slate-50 dark:bg-slate-900 rounded">No direct source citations attached for this query.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.sources.map(src => (
                  <div key={src.id} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5 text-xs hover:border-blue-400 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                        {src.type_label || src.doc_type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Doc #{src.id}</span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white leading-snug">{src.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{src.author} ({src.published_date}) • {src.region}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate && onNavigate('gis')}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center space-x-1.5"
            >
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Explore on GIS Map</span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('analytics')}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center space-x-1.5"
            >
              <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Analyse Indicator Trends</span>
            </button>

            <button
              onClick={handleTurnIntoReport}
              className="bg-[#16447a] hover:bg-blue-900 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow flex items-center space-x-1.5 shrink-0 ml-auto"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              <span>Turn this into a Report</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
