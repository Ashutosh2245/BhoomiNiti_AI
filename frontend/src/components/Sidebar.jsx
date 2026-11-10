import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, BookOpen, Bot, MapPin, BarChart3,
  Sliders, Users, Lightbulb, FileSpreadsheet, ShieldAlert, Database,
  ChevronLeft, ChevronRight
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('bhoominiti_sidebar_collapsed') === 'true';
  });

  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    localStorage.setItem('bhoominiti_sidebar_collapsed', collapsed ? 'true' : 'false');
  }, [collapsed]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'knowledge', label: 'Research & Knowledge', icon: BookOpen },
    { id: 'sources', label: 'Data Source Registry', icon: Database },
    { id: 'ai_assistant', label: 'AI Research Assistant', icon: Bot },
    { id: 'gis', label: 'GIS & Spatial Intelligence', icon: MapPin },
    { id: 'analytics', label: 'Analytics Workspace', icon: BarChart3 },
    { id: 'simulations', label: 'Policy Simulation Lab', icon: Sliders },
    { id: 'collaboration', label: 'Collaboration & Projects', icon: Users },
    { id: 'innovation', label: 'Innovation Hub', icon: Lightbulb },
    { id: 'reports', label: 'Evidence Reports', icon: FileSpreadsheet },
    { id: 'audit', label: 'Administration & Audit', icon: ShieldAlert },
  ];

  return (
    <aside
      className={`bg-slate-900 dark:bg-[#070e17] text-slate-300 min-h-[calc(100vh-4rem)] border-r border-slate-800 dark:border-slate-800/80 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out relative ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="py-4">
        
        {/* Sidebar Header & Toggle Control */}
        <div className="px-3 mb-3 flex items-center justify-between">
          {!collapsed && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 animate-fade-in">
              Main Navigation
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ${
              collapsed ? 'mx-auto' : 'ml-auto'
            }`}
            title={collapsed ? 'Expand Menu' : 'Collapse Menu'}
            aria-label={collapsed ? 'Expand Sidebar Menu' : 'Collapse Sidebar Menu'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu Items List */}
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center ${
                    collapsed ? 'justify-center px-0 py-2.5' : 'space-x-3 px-3 py-2'
                  } rounded text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-900/70 text-blue-200 border-l-4 border-blue-500 font-semibold dark:bg-blue-950/80'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>

                {/* Accessible Floating Tooltip when Collapsed */}
                {collapsed && hoveredItem === item.id && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-950 text-white text-xs font-semibold rounded shadow-lg border border-slate-700 z-50 whitespace-nowrap pointer-events-none animate-fade-in">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* System Sync Info */}
      <div className="p-3 border-t border-slate-800 dark:border-slate-800/80 text-[11px] text-slate-500 bg-slate-950/50">
        {!collapsed ? (
          <div className="space-y-1 animate-fade-in">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">System Status:</span>
              <span className="text-emerald-400 font-mono font-semibold">● ONLINE</span>
            </div>
            <div>Last Refresh: <span className="font-mono text-slate-400">29/09/2026 19:30</span></div>
            <div className="text-[10px] text-slate-600">SQLite Persistent Data Store</div>
          </div>
        ) : (
          <div className="flex justify-center" title="System Online">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        )}
      </div>
    </aside>
  );
};
