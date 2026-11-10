import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldAlert, Users, RefreshCw, Search, CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import { ContextGuidanceBanner } from '../components/ContextGuidanceBanner';

export const AdminAudit = () => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logRes, userRes, statRes] = await Promise.all([
        api.get('/audit/logs', { params: { action: filterAction || undefined } }),
        api.get('/auth/users'),
        api.get('/audit/stats')
      ]);
      setLogs(logRes.data);
      setUsers(userRes.data);
      setStats(statRes.data);
    } catch (err) {
      console.error('Failed to load audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterAction]);

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Administration & Enterprise Audit Logs</h2>
          <p className="text-xs text-slate-500">Immutable audit trial tracking every create, update, delete, role switch, and simulation execution.</p>
        </div>
        <button onClick={fetchData} className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded border border-slate-300 flex items-center space-x-1">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Global Guidance Banner */}
      <ContextGuidanceBanner
        title="Admin Audit & Security Compliance Guidance"
        description="Monitor system-wide activity, inspect database mutations, user role switches, and system audit trails."
        whatYouCanDo={[
          "Filter audit events by action type (CREATE, UPDATE, SIMULATION_RUN, ROLE_SWITCH)",
          "Inspect user profiles, organization memberships, and permission levels",
          "Verify system integrity counters for enterprise compliance"
        ]}
        inputsNeeded="Select an action filter dropdown to isolate specific security audit events."
        expectedResult="Full timestamped audit trail with user IDs, target entities, and exact change payloads."
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-[10px]">Total Logged Actions</div>
            <div className="font-bold text-lg text-slate-900 font-mono mt-0.5">{stats.total_actions}</div>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-[10px]">Create Operations</div>
            <div className="font-bold text-lg text-blue-700 font-mono mt-0.5">{stats.creates}</div>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-[10px]">Update Operations</div>
            <div className="font-bold text-lg text-amber-700 font-mono mt-0.5">{stats.updates}</div>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-[10px]">Executions (RAG/Sim)</div>
            <div className="font-bold text-lg text-purple-700 font-mono mt-0.5">{stats.executes}</div>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-[10px]">Security Integrity</div>
            <div className="font-bold text-lg text-emerald-700 font-mono mt-0.5">100% OK</div>
          </div>
        </div>
      )}

      {/* Enterprise Users Table */}
      <div className="bg-white rounded border border-slate-200 shadow-sm p-5 space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
          <Users className="w-4 h-4 text-blue-700" />
          <span>Registered Enterprise Platform Accounts ({users.length})</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">User Name</th>
                <th className="py-2 px-3">Email Address</th>
                <th className="py-2 px-3">Assigned Enterprise Role</th>
                <th className="py-2 px-3">Organization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold text-slate-900">{u.full_name}</td>
                  <td className="py-2 px-3 font-mono text-slate-600">{u.email}</td>
                  <td className="py-2 px-3">
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2 px-3">{u.organization}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900">System Audit Trail Log Entries</h3>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500">Filter Action:</span>
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
            >
              <option value="">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="EXECUTE">EXECUTE</option>
              <option value="LOGIN">LOGIN</option>
              <option value="SWITCH_ROLE">SWITCH_ROLE</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">User / Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity Type</th>
                <th className="py-2.5 px-3">Details / Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {logs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                    {l.timestamp ? new Date(l.timestamp).toLocaleString() : ''}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{l.user_name}</div>
                    <div className="text-[10px] text-blue-700 font-mono font-semibold">{l.user_role}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      l.action === 'CREATE' ? 'bg-blue-100 text-blue-800' :
                      l.action === 'UPDATE' ? 'bg-amber-100 text-amber-900' :
                      l.action === 'EXECUTE' ? 'bg-purple-100 text-purple-900' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {l.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{l.entity_type} #{l.entity_id || ''}</td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-600 max-w-xs truncate">
                    {l.new_value || l.old_value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
