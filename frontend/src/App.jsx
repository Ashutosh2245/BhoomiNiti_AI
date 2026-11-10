import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { KnowledgeLibrary } from './pages/KnowledgeLibrary';
import { DataSources } from './pages/DataSources';
import { AiResearchAssistant } from './pages/AiResearchAssistant';
import { GisExplorer } from './pages/GisExplorer';
import { AnalyticsWorkspace } from './pages/AnalyticsWorkspace';
import { PolicySimulator } from './pages/PolicySimulator';
import { CollaborationWorkspaces } from './pages/CollaborationWorkspaces';
import { InnovationHub } from './pages/InnovationHub';
import { Reports } from './pages/Reports';
import { AdminAudit } from './pages/AdminAudit';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'knowledge':
        return <KnowledgeLibrary />;
      case 'sources':
        return <DataSources />;
      case 'ai_assistant':
        return <AiResearchAssistant onNavigate={setActiveTab} />;
      case 'gis':
        return <GisExplorer />;
      case 'analytics':
        return <AnalyticsWorkspace />;
      case 'simulations':
        return <PolicySimulator />;
      case 'collaboration':
        return <CollaborationWorkspaces />;
      case 'innovation':
        return <InnovationHub />;
      case 'reports':
        return <Reports />;
      case 'audit':
        return <AdminAudit />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-[#f7f5ef] dark:bg-[#0a1626] text-[#0d1b2e] dark:text-[#e8edf4] flex flex-col font-sans antialiased transition-colors duration-300">
          <Header onNavigate={setActiveTab} />

          <div className="flex flex-1">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full animate-fade-up key={activeTab}">
              {renderContent()}
            </main>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
