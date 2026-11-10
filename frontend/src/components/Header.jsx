import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { ShieldCheck, Search, Sparkles, Trophy, Bookmark, Sun, Moon, Laptop } from 'lucide-react';
import { OnboardingModal } from './OnboardingModal';
import { GlobalSearchModal } from './GlobalSearchModal';
import { JudgeModeModal } from './JudgeModeModal';
import { MyIntelligenceModal } from './MyIntelligenceModal';

const rolesList = [
  { code: 'super_admin', label: '1. Super Administrator' },
  { code: 'govt_official', label: '2. Government Official' },
  { code: 'researcher', label: '3. Researcher' },
  { code: 'academic', label: '4. Academic Institution' },
  { code: 'think_tank', label: '5. Think Tank / Research Org' },
  { code: 'gis_expert', label: '6. GIS Expert' },
  { code: 'innovation_partner', label: '7. Innovation Partner' },
  { code: 'public_user', label: '8. Public User' }
];

export const Header = ({ onNavigate }) => {
  const { user, switchRole, loading } = useContext(AuthContext);
  const { theme, resolvedTheme, setTheme } = useContext(ThemeContext);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showJudgeMode, setShowJudgeMode] = useState(false);
  const [showMyIntel, setShowMyIntel] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem('bhoominiti_onboarded');
    if (!onboarded) {
      setShowOnboarding(true);
    }

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="bg-[#0b1f3a] dark:bg-[#070e17] text-white border-b border-blue-900/60 dark:border-slate-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate && onNavigate('dashboard')}>
          <div className="w-10 h-10 bg-amber-500 rounded flex items-center justify-center font-bold text-slate-950 text-xl shadow">
            भूम
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg tracking-wide text-white">BHOOMINITI AI</h1>
              <span className="bg-blue-900/80 text-blue-200 border border-blue-700 text-xs px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                National Platform
              </span>
            </div>
            <p className="text-xs text-blue-200/80">National Digital Platform for Land Governance & Policy Innovation</p>
          </div>
        </div>

        {/* Global Search Trigger (Ctrl + K) */}
        <div
          onClick={() => setShowSearch(true)}
          className="hidden md:flex items-center relative w-72 bg-blue-950/80 dark:bg-slate-900/80 border border-blue-800 dark:border-slate-700 text-sm text-slate-300 px-3 py-1.5 rounded cursor-pointer hover:border-blue-500 transition-all"
        >
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <span className="text-xs text-slate-300 truncate">Search evidence, policies...</span>
          <span className="ml-auto text-[10px] font-mono bg-blue-900 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-blue-700 dark:border-slate-600 text-blue-200">
            Ctrl+K
          </span>
        </div>

        {/* Right Section: Theme Switcher, Judge Mode, Saved Intel, Role Switcher */}
        <div className="flex items-center space-x-2">
          
          {/* Theme Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex items-center space-x-1 bg-blue-900/80 dark:bg-slate-800 border border-blue-700 dark:border-slate-700 text-blue-200 text-xs px-2.5 py-1.5 rounded transition-all hover:border-teal-400"
              title="Switch Visual Theme (Light / Dark / System)"
            >
              {resolvedTheme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="font-semibold capitalize text-[11px] hidden sm:inline">{theme}</span>
            </button>

            {/* Theme Selector Dropdown */}
            {showThemeMenu && (
              <div
                className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs text-slate-200 animate-fade-in"
                onMouseLeave={() => setShowThemeMenu(false)}
              >
                <button
                  onClick={() => { setTheme('light'); setShowThemeMenu(false); }}
                  className={`w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-slate-800 transition-colors ${
                    theme === 'light' ? 'font-bold text-amber-400' : ''
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => { setTheme('dark'); setShowThemeMenu(false); }}
                  className={`w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-slate-800 transition-colors ${
                    theme === 'dark' ? 'font-bold text-teal-400' : ''
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => { setTheme('system'); setShowThemeMenu(false); }}
                  className={`w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-slate-800 transition-colors ${
                    theme === 'system' ? 'font-bold text-blue-400' : ''
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>System</span>
                </button>
              </div>
            )}
          </div>

          {/* Competition Judge Mode Button */}
          <button
            onClick={() => setShowJudgeMode(true)}
            className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-1.5 rounded shadow transition-transform active:scale-95"
            title="Open 5-Minute Competition Judge Mode"
          >
            <Trophy className="w-3.5 h-3.5 fill-slate-950" />
            <span className="hidden sm:inline">Judge Mode</span>
          </button>

          {/* Saved Intelligence */}
          <button
            onClick={() => setShowMyIntel(true)}
            className="flex items-center space-x-1.5 bg-blue-900/80 dark:bg-slate-800 border border-blue-700 dark:border-slate-700 text-blue-200 text-xs px-2.5 py-1.5 rounded transition-colors"
            title="View My Saved Intelligence"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium hidden lg:inline">Saved Intel</span>
          </button>

          {/* Active Role Switcher */}
          <div className="flex items-center space-x-1.5 bg-blue-950 dark:bg-slate-900 border border-blue-800 dark:border-slate-700 rounded px-2 py-1">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <select
              value={user.role}
              onChange={(e) => switchRole(e.target.value)}
              disabled={loading}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              {rolesList.map(r => (
                <option key={r.code} value={r.code} className="bg-slate-900 text-slate-100">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* User Profile Badge */}
          <div className="hidden sm:flex items-center space-x-2 text-xs border-l border-blue-800 dark:border-slate-700 pl-2.5">
            <div className="w-7 h-7 bg-blue-800 rounded-full flex items-center justify-center font-bold text-blue-200">
              {user.full_name ? user.full_name[0] : 'U'}
            </div>
            <div className="text-left hidden lg:block">
              <div className="font-semibold text-white leading-tight">{user.full_name.split(' ')[0]}</div>
              <div className="text-[10px] text-blue-300 truncate max-w-[100px]">{user.organization || 'National Network'}</div>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={(targetTab) => {
          if (onNavigate && targetTab) onNavigate(targetTab);
        }}
      />

      <GlobalSearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onNavigate={(tab) => {
          if (onNavigate) onNavigate(tab);
        }}
      />

      <JudgeModeModal
        isOpen={showJudgeMode}
        onClose={() => setShowJudgeMode(false)}
        onNavigate={(tab) => {
          if (onNavigate) onNavigate(tab);
        }}
      />

      <MyIntelligenceModal
        isOpen={showMyIntel}
        onClose={() => setShowMyIntel(false)}
        onNavigate={(tab) => {
          if (onNavigate) onNavigate(tab);
        }}
      />
    </header>
  );
};
