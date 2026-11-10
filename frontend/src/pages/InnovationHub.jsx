import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Lightbulb, Award, Rocket, CheckCircle2, Plus, X, Info } from 'lucide-react';
import { ContextGuidanceBanner } from '../components/ContextGuidanceBanner';

export const InnovationHub = () => {
  const [challenges, setChallenges] = useState([]);
  const [grants, setGrants] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  // Proposal Submission State
  const [submission, setSubmission] = useState({
    team_name: '', title: '', proposal_text: ''
  });

  const fetchData = async () => {
    try {
      const [chalRes, grantRes] = await Promise.all([
        api.get('/innovation/challenges'),
        api.get('/innovation/grants-pilots')
      ]);
      setChallenges(chalRes.data);
      setGrants(grantRes.data);
    } catch (err) {
      console.error('Failed to load innovation hub data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!selectedChallenge) return;

    try {
      await api.post(`/innovation/challenges/${selectedChallenge.id}/submit`, submission);
      setSelectedChallenge(null);
      setSubmission({ team_name: '', title: '', proposal_text: '' });
      fetchData();
      alert('Proposal successfully submitted to Innovation Challenge!');
    } catch (err) {
      alert('Failed to submit proposal.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-slate-900">LandTech Innovation Hub & Challenge Management</h2>
        <p className="text-xs text-slate-500">National innovation challenges, hackathons, research grants, and technology pilot projects.</p>
      </div>

      {/* Global Guidance Banner */}
      <ContextGuidanceBanner
        title="LandTech Innovation Hub Guidance"
        description="Participate in national land administration hackathons, submit AI/OCR solution proposals, and apply for research pilot grants."
        whatYouCanDo={[
          "Browse open national innovation challenges, eligibility criteria, and prize pools",
          "Submit solution proposals directly with team details, architecture summaries, and pilot plans",
          "Track active government research grant pilots and funded technological deployments"
        ]}
        inputsNeeded="Select an open challenge card, click 'Submit Solution Proposal', and fill proposal details."
        expectedResult="Proposal submission logged into database audit trail, evaluation queue placement, and team confirmation."
      />

      {/* 6-Step Submission Wizard Progress Bar */}
      <div className="bg-white p-3.5 rounded border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
          <span className="font-bold text-slate-900 flex items-center space-x-1.5">
            <Rocket className="w-4 h-4 text-blue-700" />
            <span>Guided 6-Step Innovation Pipeline</span>
          </span>
          <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Step 1 to 6 Submission
          </span>
        </div>
        <div className="grid grid-cols-6 gap-2 pt-1 text-[11px]">
          <div className="bg-blue-900 text-white p-1.5 rounded text-center font-medium shadow-2xs">
            <div className="text-[9px] text-blue-200 uppercase font-mono">Step 1</div>
            <div className="truncate">Select Challenge</div>
          </div>
          <div className="bg-slate-100 text-slate-700 p-1.5 rounded text-center border border-slate-200">
            <div className="text-[9px] text-slate-500 uppercase font-mono">Step 2</div>
            <div className="truncate">Review Criteria</div>
          </div>
          <div className="bg-slate-100 text-slate-700 p-1.5 rounded text-center border border-slate-200">
            <div className="text-[9px] text-slate-500 uppercase font-mono">Step 3</div>
            <div className="truncate">Team Info</div>
          </div>
          <div className="bg-slate-100 text-slate-700 p-1.5 rounded text-center border border-slate-200">
            <div className="text-[9px] text-slate-500 uppercase font-mono">Step 4</div>
            <div className="truncate">Proposal Text</div>
          </div>
          <div className="bg-slate-100 text-slate-700 p-1.5 rounded text-center border border-slate-200">
            <div className="text-[9px] text-slate-500 uppercase font-mono">Step 5</div>
            <div className="truncate">Submit & Audit</div>
          </div>
          <div className="bg-slate-100 text-slate-700 p-1.5 rounded text-center border border-slate-200">
            <div className="text-[9px] text-slate-500 uppercase font-mono">Step 6</div>
            <div className="truncate">Grant Evaluation</div>
          </div>
        </div>
      </div>

      {/* Challenges & Hackathons Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-600" />
          <span>National Innovation Challenges & Hackathons</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {challenges.map(c => (
            <div key={c.id} className="bg-white p-5 rounded border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                  Reward Pool: {c.reward_pool}
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                  {c.status}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">{c.title}</h4>
              <p className="text-slate-600">{c.problem_statement}</p>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]">
                <span className="font-bold text-slate-800">Eligibility: </span>
                <span className="text-slate-600">{c.eligibility}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                <span className="text-[10px] text-slate-400">Submissions: {c.submission_count}</span>
                <button
                  onClick={() => setSelectedChallenge(c)}
                  className="bg-blue-800 hover:bg-blue-900 text-white font-semibold px-3 py-1.5 rounded shadow text-xs"
                >
                  Submit Proposal
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grants & Pilot Projects Tracker */}
      <div className="bg-white rounded border border-slate-200 shadow-sm p-5 space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
          <Rocket className="w-4 h-4 text-blue-700" />
          <span>Active Grants & State Pilot Projects</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Lead Organization</th>
                <th className="py-2.5 px-3 font-mono">Grant Amount</th>
                <th className="py-2.5 px-3">Timeline</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {grants.map(g => (
                <tr key={g.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      g.type === 'GRANT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {g.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{g.title}</td>
                  <td className="py-2.5 px-3">{g.organization_name}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{g.amount}</td>
                  <td className="py-2.5 px-3 text-slate-500">{g.timeline}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-blue-700">{g.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded border border-slate-300 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Challenge #{selectedChallenge.id}
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-1">Submit Proposal Solution</h3>
              </div>
              <button onClick={() => setSelectedChallenge(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Team / Startup Name *</label>
                <input
                  type="text"
                  required
                  value={submission.team_name}
                  onChange={e => setSubmission({ ...submission, team_name: e.target.value })}
                  className="w-full mt-1 border border-slate-300 rounded p-2"
                  placeholder="e.g. AgriLand OCR Vision"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Proposal Title *</label>
                <input
                  type="text"
                  required
                  value={submission.title}
                  onChange={e => setSubmission({ ...submission, title: e.target.value })}
                  className="w-full mt-1 border border-slate-300 rounded p-2"
                  placeholder="e.g. Multilingual Vernacular Land Record OCR Transformer Model"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Technical Proposal Abstract</label>
                <textarea
                  rows="4"
                  required
                  value={submission.proposal_text}
                  onChange={e => setSubmission({ ...submission, proposal_text: e.target.value })}
                  className="w-full mt-1 border border-slate-300 rounded p-2"
                  placeholder="Describe your solution architecture, dataset model, and expected impact..."
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedChallenge(null)}
                  className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-800 hover:bg-blue-900 text-white font-semibold px-4 py-2 rounded shadow"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
