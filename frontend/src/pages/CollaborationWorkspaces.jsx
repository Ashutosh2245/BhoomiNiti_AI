import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, FolderPlus, MessageSquare, CheckSquare, Plus, Send, X } from 'lucide-react';
import { ContextGuidanceBanner } from '../components/ContextGuidanceBanner';

export const CollaborationWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedWs, setSelectedWs] = useState(null);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);

  // New Project State
  const [newProj, setNewProj] = useState({
    title: '', description: '', budget: 5000000, start_date: '2025-10-01', end_date: '2026-03-31'
  });

  const fetchData = async () => {
    try {
      const [wsRes, projRes] = await Promise.all([
        api.get('/collaboration/workspaces'),
        api.get('/collaboration/projects')
      ]);
      setWorkspaces(wsRes.data);
      setProjects(projRes.data);
      if (wsRes.data.length > 0 && !selectedWs) {
        fetchWsDetail(wsRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load collaboration data:', err);
    }
  };

  const fetchWsDetail = async (id) => {
    try {
      const res = await api.get(`/collaboration/workspaces/${id}`);
      setSelectedWs(res.data);
    } catch (err) {
      console.error('Failed to fetch workspace detail:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddDiscussion = async (e) => {
    e.preventDefault();
    if (!selectedWs || !newDiscussionTitle.trim()) return;

    try {
      await api.post(`/collaboration/workspaces/${selectedWs.id}/discussions`, {
        title: newDiscussionTitle,
        content: newDiscussionContent
      });

      setNewDiscussionTitle('');
      setNewDiscussionContent('');
      fetchWsDetail(selectedWs.id);
    } catch (err) {
      alert('Failed to post discussion topic.');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!selectedWs || !newTaskTitle.trim()) return;

    try {
      await api.post(`/collaboration/workspaces/${selectedWs.id}/tasks`, {
        title: newTaskTitle,
        assigned_to: 'Dr. Rajesh Sharma',
        status: 'PENDING'
      });

      setNewTaskTitle('');
      fetchWsDetail(selectedWs.id);
      alert('Task successfully created and saved to database!');
    } catch (err) {
      alert('Failed to create task.');
    }
  };

  const handleCreateProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/collaboration/projects', newProj);
      setShowProjectModal(false);
      fetchData();
      alert('Inter-institutional research project successfully created!');
    } catch (err) {
      alert('Failed to create project.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#10233b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Inter-Institutional Research & Collaboration Workspaces</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Digital research notebooks, task persistence, discussion forums, and multi-institutional project management.
          </p>
        </div>

        <button
          onClick={() => setShowProjectModal(true)}
          className="bg-[#16447a] hover:bg-blue-900 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow flex items-center space-x-1.5 shrink-0 transition-all hover:-translate-y-0.5"
        >
          <FolderPlus className="w-4 h-4 text-teal-300" />
          <span>New Research Project</span>
        </button>
      </div>

      {/* Global Guidance Banner */}
      <ContextGuidanceBanner
        title="Collaboration Workspaces Guidance"
        description="Manage shared digital research notebooks, post discussion topics, assign project tasks, and track inter-institutional milestones."
        whatYouCanDo={[
          "Select a workspace from the list to view its tasks and discussion board",
          "Add new research tasks (persisted in database across sessions)",
          "Create new inter-institutional projects with allocated research grants"
        ]}
        inputsNeeded="Select workspace or post discussion/task topics."
        expectedResult="Persisted task manager, active research forum, and project tracking."
      />

      {/* Workspace List vs Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Workspace List */}
        <div className="bg-white dark:bg-[#10233b] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <div className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
            Workspaces ({workspaces.length})
          </div>

          <div className="space-y-2">
            {workspaces.map(ws => (
              <div
                key={ws.id}
                onClick={() => fetchWsDetail(ws.id)}
                className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedWs?.id === ws.id
                    ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-600 dark:border-blue-500 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                }`}
              >
                <div className="font-bold text-slate-900 dark:text-white leading-snug">{ws.title}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{ws.description}</div>
                <div className="mt-2 text-[10px] font-mono text-blue-700 dark:text-blue-400">
                  Role: {ws.role} • Members: {ws.members ? ws.members.length : 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Workspace Content */}
        <div className="bg-white dark:bg-[#10233b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 lg:col-span-2 transition-colors">
          {selectedWs ? (
            <>
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 font-mono">
                  Workspace #{selectedWs.id}
                </span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{selectedWs.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{selectedWs.description}</p>
              </div>

              {/* Tasks Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                    <CheckSquare className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                    <span>Workspace Tasks ({selectedWs.tasks ? selectedWs.tasks.length : 0})</span>
                  </h4>
                </div>

                <form onSubmit={handleAddTask} className="flex space-x-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    placeholder="Add new research task..."
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs p-2 rounded-lg focus:outline-none"
                  />
                  <button type="submit" className="bg-[#16447a] hover:bg-blue-900 text-white font-bold text-xs px-3 py-2 rounded-lg shadow">
                    Add Task
                  </button>
                </form>

                <div className="space-y-1.5">
                  {selectedWs.tasks && selectedWs.tasks.map(t => (
                    <div key={t.id} className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{t.title}</span>
                      <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discussion Board */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                  <MessageSquare className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span>Discussion Forum</span>
                </h4>

                <form onSubmit={handleAddDiscussion} className="space-y-2">
                  <input
                    type="text"
                    value={newDiscussionTitle}
                    onChange={e => setNewDiscussionTitle(e.target.value)}
                    placeholder="Discussion topic title..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs p-2 rounded-lg focus:outline-none font-bold"
                  />
                  <textarea
                    rows="2"
                    value={newDiscussionContent}
                    onChange={e => setNewDiscussionContent(e.target.value)}
                    placeholder="Topic description or research question..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs p-2 rounded-lg focus:outline-none"
                  ></textarea>
                  <button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow inline-flex items-center space-x-1">
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Topic</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">Select a workspace to view details.</div>
          )}
        </div>

      </div>

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#10233b] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-up">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base">New Inter-Institutional Research Project</h3>
              <button onClick={() => setShowProjectModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newProj.title}
                  onChange={e => setNewProj({ ...newProj, title: e.target.value })}
                  placeholder="e.g. National ULPIN Cadastral Boundary Accuracy Study"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={newProj.description}
                  onChange={e => setNewProj({ ...newProj, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#16447a] hover:bg-blue-900 text-white font-bold shadow"
                >
                  Create Project
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
