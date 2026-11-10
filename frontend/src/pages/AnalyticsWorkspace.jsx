import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Edit3, Check, RefreshCw, BarChart2, Save, X, Info, GitCompare, ShieldCheck } from 'lucide-react';
import { ContextGuidanceBanner } from '../components/ContextGuidanceBanner';
import { CalculationDetailsModal } from '../components/CalculationDetailsModal';

export const AnalyticsWorkspace = () => {
  const [indicators, setIndicators] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingInd, setEditingInd] = useState(null);
  const [selectedCalcInd, setSelectedCalcInd] = useState(null);

  // Region Comparison State
  const [regionA, setRegionA] = useState('Maharashtra - Pune');
  const [regionB, setRegionB] = useState('Uttar Pradesh - Varanasi');
  const [showCompareModal, setShowCompareModal] = useState(false);

  const regionDataMap = {
    'Maharashtra - Pune': { digi: '94.2%', dispute: 'Low (2.1%)', lulc: 'Agrarian to Urban Peri-urban', papers: 27, sources: 'DoLR / Survey of India' },
    'Uttar Pradesh - Varanasi': { digi: '97.1%', dispute: 'Low (1.4%)', lulc: 'High Density Urban / Riverine', papers: 22, sources: 'UP Revenue Board / SVAMITVA' },
    'Karnataka - Bengaluru Rural': { digi: '91.8%', dispute: 'Moderate (4.5%)', lulc: 'Industrial Tech Corridor', papers: 19, sources: 'Bhoomi Karnataka / NRSC' },
    'Odisha - Mayurbhanj': { digi: '88.5%', dispute: 'Moderate (3.8%)', lulc: 'Forest & Tribal Rights Area', papers: 14, sources: 'Odisha Revenue & FRA Unit' }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [indRes, sumRes] = await Promise.all([
        api.get('/analytics/indicators'),
        api.get('/analytics/summary')
      ]);
      setIndicators(indRes.data);
      setSummaryData(sumRes.data);
    } catch (err) {
      console.error('Failed to load analytics workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateIndicator = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/analytics/indicators/${editingInd.id}`, {
        name: editingInd.name,
        description: editingInd.description,
        formula: editingInd.formula,
        current_val: parseFloat(editingInd.current_val),
        target_val: parseFloat(editingInd.target_val),
        status: editingInd.status
      });

      setEditingInd(null);
      fetchData();
      alert('Indicator configuration saved to database!');
    } catch (err) {
      alert('Failed to update indicator.');
    }
  };

  const trendData = [
    { year: '2020', digitization: 62, disputeVelocity: 14.2, svamitvaCards: 10 },
    { year: '2021', digitization: 71, disputeVelocity: 12.8, svamitvaCards: 25 },
    { year: '2022', digitization: 81, disputeVelocity: 10.4, svamitvaCards: 55 },
    { year: '2023', digitization: 89, disputeVelocity: 8.1, svamitvaCards: 85 },
    { year: '2024', digitization: 93, disputeVelocity: 6.5, svamitvaCards: 120 },
    { year: '2025', digitization: 96, disputeVelocity: 5.2, svamitvaCards: 165 }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#10233b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">National Land Governance Analytics Matrix</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quantitative land performance metrics, dispute resolution velocity, and multi-region analytical comparisons.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCompareModal(true)}
            className="bg-[#16447a] hover:bg-blue-900 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow flex items-center space-x-1.5 transition-all hover:-translate-y-0.5"
          >
            <GitCompare className="w-4 h-4 text-teal-300" />
            <span>Compare Regions</span>
          </button>
        </div>
      </div>

      {/* Global Guidance Banner */}
      <ContextGuidanceBanner
        title="Analytics Workspace Guidance"
        description="Inspect multi-temporal land governance trend charts, formula mathematical definitions, and regional indicators."
        whatYouCanDo={[
          "Analyze nationwide cadastral digitization velocity and dispute reduction trends",
          "Click 'Calculate Details' on any metric to view its exact mathematical formula",
          "Use 'Compare Regions' to analyze indicators across multiple states side-by-side"
        ]}
        inputsNeeded="Select comparison parameters or edit indicator targets."
        expectedResult="Interactive trend charts, regional comparison matrix, and transparent formula provenance."
      />

      {/* Trend Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Digitization Velocity */}
        <div className="bg-white dark:bg-[#10233b] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Cadastral Digitization % (2020–2025)</h3>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              ● Upward Trend
            </span>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[50, 100]} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="digitization" stroke="#16447a" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Dispute Velocity */}
        <div className="bg-white dark:bg-[#10233b] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Land Dispute Velocity Index</h3>
            <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
              ● Downward Resolution
            </span>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Bar dataKey="disputeVelocity" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Database Indicator Metrics Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            Database Indicator Configurations
          </h3>
          <button
            onClick={fetchData}
            disabled={loading}
            className="text-xs text-blue-700 dark:text-blue-400 font-bold flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Indicator Values</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {indicators.map(ind => (
            <div
              key={ind.id}
              className="bg-white dark:bg-[#10233b] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-blue-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                    {ind.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">ID #{ind.id}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{ind.name}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{ind.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded">
                    <span className="text-slate-400 text-[9px] block">Current</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{ind.current_val} {ind.unit}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded">
                    <span className="text-slate-400 text-[9px] block">Target</span>
                    <strong className="text-blue-700 dark:text-blue-400 font-bold">{ind.target_val} {ind.unit}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setSelectedCalcInd(ind)}
                    className="text-[11px] text-blue-700 dark:text-blue-400 font-bold hover:underline flex items-center space-x-1"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Calculate Details</span>
                  </button>

                  <button
                    onClick={() => setEditingInd(ind)}
                    className="text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Configure</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Regional Comparison Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#10233b] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full p-6 space-y-4 animate-fade-up">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <GitCompare className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                <h3 className="font-bold text-base">Regional Land Governance Comparison Lab</h3>
              </div>
              <button onClick={() => setShowCompareModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Region A</label>
                <select
                  value={regionA}
                  onChange={e => setRegionA(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded focus:outline-none"
                >
                  {Object.keys(regionDataMap).map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Region B</label>
                <select
                  value={regionB}
                  onChange={e => setRegionB(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded focus:outline-none"
                >
                  {Object.keys(regionDataMap).map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Side-by-Side Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-left border-collapse font-mono">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Governance Metric</th>
                    <th className="py-2 px-3 text-blue-700 dark:text-blue-400">{regionA}</th>
                    <th className="py-2 px-3 text-teal-700 dark:text-teal-400">{regionB}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">Cadastral Digitization %</td>
                    <td className="py-2.5 px-3">{regionDataMap[regionA]?.digi}</td>
                    <td className="py-2.5 px-3">{regionDataMap[regionB]?.digi}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">Dispute Velocity Rate</td>
                    <td className="py-2.5 px-3">{regionDataMap[regionA]?.dispute}</td>
                    <td className="py-2.5 px-3">{regionDataMap[regionB]?.dispute}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">LULC Land Conversion Pattern</td>
                    <td className="py-2.5 px-3">{regionDataMap[regionA]?.lulc}</td>
                    <td className="py-2.5 px-3">{regionDataMap[regionB]?.lulc}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">Indexed Research Papers</td>
                    <td className="py-2.5 px-3">{regionDataMap[regionA]?.papers}</td>
                    <td className="py-2.5 px-3">{regionDataMap[regionB]?.papers}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowCompareModal(false)}
                className="bg-[#16447a] hover:bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                Close Comparison
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Calculation Formula Details Modal */}
      {selectedCalcInd && (
        <CalculationDetailsModal
          indicator={selectedCalcInd}
          onClose={() => setSelectedCalcInd(null)}
        />
      )}

      {/* Configure Indicator Modal */}
      {editingInd && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#10233b] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-up">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base">Configure Indicator #{editingInd.id}</h3>
              <button onClick={() => setEditingInd(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleUpdateIndicator} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Indicator Name</label>
                <input
                  type="text"
                  value={editingInd.name}
                  onChange={e => setEditingInd({ ...editingInd, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Mathematical Formula</label>
                <input
                  type="text"
                  value={editingInd.formula || ''}
                  onChange={e => setEditingInd({ ...editingInd, formula: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Current Value</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingInd.current_val}
                    onChange={e => setEditingInd({ ...editingInd, current_val: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Target Value</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingInd.target_val}
                    onChange={e => setEditingInd({ ...editingInd, target_val: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingInd(null)}
                  className="px-4 py-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#16447a] hover:bg-blue-900 text-white font-bold shadow"
                >
                  Save Configuration
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
