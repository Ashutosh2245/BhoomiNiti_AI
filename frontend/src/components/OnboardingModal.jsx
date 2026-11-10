import React, { useState } from 'react';
import api from '../services/api';
import {
  X, Check, ArrowRight, ArrowLeft, Shield, BookOpen, User,
  Globe, Sparkles, Building2, Map, Award, Users
} from 'lucide-react';

export const OnboardingModal = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('researcher');
  const [selectedInterests, setSelectedInterests] = useState(['Land Use & Planning', 'Land Records']);
  const [selectedLanguage, setSelectedLanguage] = useState('en-hi');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const roles = [
    { id: 'govt_official', label: 'Government Official', icon: Shield, desc: 'Policy evidence, regional insights, analytics & executive reports' },
    { id: 'researcher', label: 'Researcher', icon: BookOpen, desc: 'Research repository, datasets, AI assistant & workspace collaboration' },
    { id: 'academic', label: 'Academic / Student', icon: User, desc: 'Case studies, peer-reviewed papers, learning resources & innovation' },
    { id: 'gis_expert', label: 'GIS / Geospatial Expert', icon: Map, desc: 'Remote sensing layers, GeoTIFF, LULC matrices & spatial queries' },
    { id: 'think_tank', label: 'Research Organization', icon: Building2, desc: 'Inter-ministerial policy studies & evidence synthesis' },
    { id: 'innovation_partner', label: 'Innovation Partner', icon: Award, desc: 'Startup hackathons, AI OCR challenges & grant pilots' },
    { id: 'public_user', label: 'Public User', icon: Users, desc: 'Public land governance data, maps, reports & open datasets' }
  ];

  const topics = [
    'Land Use & Planning', 'Agriculture', 'Urbanisation', 'Land Acquisition',
    'Climate & Environment', 'Forest & Natural Resources', 'Land Records',
    'Rural Development', 'Infrastructure', 'Geospatial Technology', 'Policy Research'
  ];

  const toggleInterest = (topic) => {
    setSelectedInterests(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleFinish = async (targetTab = 'dashboard') => {
    setSaving(true);
    try {
      await api.post('/auth/preferences', {
        role: selectedRole,
        interests: selectedInterests,
        preferred_language: selectedLanguage
      });
      localStorage.setItem('bhoominiti_onboarded', 'true');
      if (onComplete) onComplete(targetTab);
    } catch (err) {
      console.error('Failed to save onboarding preferences:', err);
      localStorage.setItem('bhoominiti_onboarded', 'true');
      if (onComplete) onComplete(targetTab);
    } finally {
      setSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Stepper Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base">Welcome to BhoomiNiti AI</h3>
              <p className="text-xs text-slate-300">Step {step} of 4 — User-Guided Personalization</p>
            </div>
          </div>
          <button
            onClick={() => handleFinish('dashboard')}
            className="text-xs text-slate-400 hover:text-white underline font-medium"
          >
            Skip for now
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-1">
          <div className="bg-blue-700 h-1 transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">

          {/* STEP 1: Tell us about your work */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-base text-slate-900">Step 1 — Tell us about your work</h4>
                <p className="text-xs text-slate-500 mt-0.5">What best describes your primary role in land governance and research?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roles.map(r => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRole(r.id)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-600 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2 rounded-md ${isSelected ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                          <span>{r.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-700 font-bold ml-1" />}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">{r.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Choose your interests */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-base text-slate-900">Step 2 — Choose your interests</h4>
                <p className="text-xs text-slate-500 mt-0.5">What land governance topics would you like to explore? (Select multiple)</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {topics.map(t => {
                  const isSelected = selectedInterests.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleInterest(t)}
                      className={`px-3 py-2 rounded-full text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                        isSelected
                          ? 'bg-blue-800 text-white border-blue-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-200" />}
                      <span>{t}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Preferred Language */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-base text-slate-900">Step 3 — Choose preferred language</h4>
                <p className="text-xs text-slate-500 mt-0.5">How would you like to use the platform interface and reports?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'en', label: 'English', sub: 'English Interface' },
                  { id: 'hi', label: 'हिन्दी', sub: 'Hindi Interface' },
                  { id: 'en-hi', label: 'English + हिन्दी', sub: 'Bilingual (Recommended for Govt & Research)' }
                ].map(l => (
                  <div
                    key={l.id}
                    onClick={() => setSelectedLanguage(l.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all text-center space-y-1 ${
                      selectedLanguage === l.id
                        ? 'bg-blue-800 text-white border-blue-900 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Globe className="w-6 h-6 mx-auto opacity-80" />
                    <div className="font-bold text-sm">{l.label}</div>
                    <div className={`text-[10px] ${selectedLanguage === l.id ? 'text-blue-200' : 'text-slate-400'}`}>{l.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: You're ready */}
          {step === 4 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                <Check className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-lg text-slate-900">Your workspace is ready.</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  You can now explore research, analyse land-governance data, view spatial maps, run policy scenarios, and generate bilingual reports.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-left text-xs max-w-md mx-auto space-y-1 font-mono">
                <div>Selected Role: <span className="font-bold text-blue-900">{selectedRole.toUpperCase()}</span></div>
                <div>Language: <span className="font-bold text-blue-900">{selectedLanguage.toUpperCase()}</span></div>
                <div>Interested Topics: <span className="font-semibold text-slate-800">{selectedInterests.join(', ')}</span></div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Controls */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="bg-white hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded border border-slate-300 flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs px-5 py-2 rounded shadow flex items-center space-x-1.5"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleFinish('knowledge')}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded shadow"
              >
                Explore Research
              </button>
              <button
                onClick={() => handleFinish('dashboard')}
                className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs px-5 py-2 rounded shadow flex items-center space-x-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
