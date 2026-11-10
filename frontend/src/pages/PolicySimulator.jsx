import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Play, Plus, Sliders, CheckCircle2, Clock, Activity, X, RefreshCw } from 'lucide-react';
import { ContextGuidanceBanner } from '../components/ContextGuidanceBanner';

export const PolicySimulator = () => {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);
  const [activeRunResult, setActiveRunResult] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Scenario Form
  const [newScenario, setNewScenario] = useState({
    title: '30% Prime Agricultural Land Conversion Restriction in Urban Belts',
    description: 'Simulates spatial-economic food security yield protection versus land price inflation over 6 years.',
    region: 'Maharashtra & Karnataka Corridor',
    baseline_year: 2025,
    target_year: 2030,
    policy_variable: 'Agricultural Diversion Cap (%)',
    diversion_cap_percent: 30.0,
    industrial_demand_growth: 5.5
  });

  const fetchScenarios = async () => {
    try {
      const res = await api.get('/simulations/scenarios');
      setScenarios(res.data);
      if (res.data.length > 0 && !selectedScenarioId) {
        setSelectedScenarioId(res.data[0].id);
        if (res.data[0].runs && res.data[0].runs.length > 0) {
          fetchRunDetails(res.data[0].runs[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load simulation scenarios:', err);
    }
  };

  const fetchRunDetails = async (runId) => {
    try {
      const res = await api.get(`/simulations/runs/${runId}`);
      setActiveRunResult(res.data);
    } catch (err) {
      console.error('Failed to fetch run detail:', err);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const handleRunSimulation = async () => {
    if (!selectedScenarioId) return;
    setExecuting(true);
    try {
      const res = await api.post(`/simulations/scenarios/${selectedScenarioId}/run`);
      setActiveRunResult(res.data);
      fetchScenarios();
      alert('Monte Carlo Policy Simulation successfully executed and persisted in database!');
    } catch (err) {
      alert('Simulation execution failed.');
    } finally {
      setExecuting(false);
    }
  };

  const handleCreateScenarioSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/simulations/scenarios', newScenario);
      setShowCreateModal(false);
      fetchScenarios();
      setSelectedScenarioId(res.data.id);
      alert('New Policy Simulation Scenario created!');
    } catch (err) {
      alert('Failed to create scenario.');
    }
  };

  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#10233b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Monte Carlo Policy Simulation Laboratory</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Model-based scenario analysis for land conversion caps, dispute velocity, and food security protection.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#16447a] hover:bg-blue-900 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow flex items-center space-x-1.5 shrink-0 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 text-teal-300" />
          <span>Create Scenario</span>
        </button>
      </div>

      {/* Global Guidance Banner */}
      <ContextGuidanceBanner
        title="Policy Simulation Guidance"
        description="Select policy scenarios to run Monte Carlo stochastic projections across agricultural land preservation and food security."
        whatYouCanDo={[
          "Select existing statutory scenarios from the database catalog",
          "Click 'Run Simulation' to execute a stochastic Monte Carlo calculation run",
          "Inspect projected agricultural preservation hectares and land value indices"
        ]}
        inputsNeeded="Select scenario and adjust policy parameters."
        expectedResult="Executed simulation run with milestone breakdown and disclaimer notices."
      />

      {/* Main Grid: Scenario Selector vs Run Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scenario List */}
        <div className="bg-white dark:bg-[#10233b] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <div className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
            Scenarios Catalog ({scenarios.length})
          </div>

          <div className="space-y-2">
            {scenarios.map(sc => (
              <div
                key={sc.id}
                onClick={() => {
                  setSelectedScenarioId(sc.id);
                  if (sc.runs && sc.runs.length > 0) fetchRunDetails(sc.runs[0].id);
                }}
                className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedScenarioId === sc.id
                    ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-600 dark:border-blue-500 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 dark:text-white leading-snug">{sc.title}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{sc.description}</div>
                <div className="mt-2 font-mono text-[10px] text-blue-700 dark:text-blue-400 flex justify-between">
                  <span>Region: {sc.region}</span>
                  <span>Runs: {sc.runs ? sc.runs.length : 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Scenario Execution Box */}
        <div className="bg-white dark:bg-[#10233b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 lg:col-span-2 transition-colors">
          {selectedScenario ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 font-mono">
                    Active Scenario #{selectedScenario.id}
                  </span>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug">{selectedScenario.title}</h3>
                </div>

                <button
                  onClick={handleRunSimulation}
                  disabled={executing}
                  className="bg-[#16447a] hover:bg-blue-900 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow flex items-center space-x-2 shrink-0 transition-all hover:-translate-y-0.5"
                >
                  {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{executing ? 'Executing Monte Carlo...' : 'Run Simulation'}</span>
                </button>
              </div>

              {/* Scenario Description & Variables */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedScenario.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <div>Region: <strong className="text-slate-900 dark:text-white">{selectedScenario.region}</strong></div>
                  <div>Policy Var: <strong className="text-blue-700 dark:text-blue-400">{selectedScenario.policy_variable}</strong></div>
                  <div>Horizon: <strong className="text-slate-900 dark:text-white">{selectedScenario.baseline_year}–{selectedScenario.target_year}</strong></div>
                </div>
              </div>

              {/* Execution Results View */}
              {activeRunResult && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                      Simulation Run Output #{activeRunResult.id || 'Latest'} ({activeRunResult.status})
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      ● Model Projections Persisted
                    </span>
                  </div>

                  {activeRunResult.results?.projection_series && (
                    <div className="h-56 w-full pt-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={activeRunResult.results.projection_series}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} />
                          <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="agricultural_hectares_saved" name="Ag Hectares Saved" stroke="#16447a" strokeWidth={3} />
                          <Line type="monotone" dataKey="projected_land_value_index" name="Land Value Index" stroke="#0d9488" strokeWidth={2} strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Disclaimer Label */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-lg text-[11px] text-amber-900 dark:text-amber-200 font-mono">
                    ⚠️ <strong>Notice</strong>: Model-based scenario analysis — not a prediction or government decision.
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">Select a scenario to run simulation.</div>
          )}
        </div>

      </div>

      {/* Create Scenario Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#10233b] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-fade-up">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base">Create Policy Simulation Scenario</h3>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateScenarioSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Scenario Title *</label>
                <input
                  type="text"
                  required
                  value={newScenario.title}
                  onChange={e => setNewScenario({ ...newScenario, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={newScenario.description}
                  onChange={e => setNewScenario({ ...newScenario, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Target Region</label>
                  <input
                    type="text"
                    value={newScenario.region}
                    onChange={e => setNewScenario({ ...newScenario, region: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Policy Variable</label>
                  <input
                    type="text"
                    value={newScenario.policy_variable}
                    onChange={e => setNewScenario({ ...newScenario, policy_variable: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#16447a] hover:bg-blue-900 text-white font-bold shadow"
                >
                  Save Scenario to Database
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
