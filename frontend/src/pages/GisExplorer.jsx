import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { Layers, MapPin, BookOpen, FileText, Database, Activity, X, Map as MapIcon, Clock, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import { ContextGuidanceBanner } from '../components/ContextGuidanceBanner';

// Custom Map Marker Icon
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export const GisExplorer = () => {
  const [layers, setLayers] = useState([]);
  const [activeLayerType, setActiveLayerType] = useState('Administrative');
  const [selectedRegionContext, setSelectedRegionContext] = useState(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const [timelineYear, setTimelineYear] = useState(2025);

  const regionPoints = [
    { state: 'Maharashtra', district: 'Pune', lat: 18.5204, lng: 73.8567, digi: '94.2%', research: 27, policies: 8 },
    { state: 'Karnataka', district: 'Bengaluru Rural', lat: 12.9716, lng: 77.5946, digi: '91.8%', research: 19, policies: 5 },
    { state: 'Odisha', district: 'Mayurbhanj', lat: 20.2961, lng: 85.8246, digi: '88.5%', research: 14, policies: 11 },
    { state: 'Uttar Pradesh', district: 'Varanasi', lat: 25.3176, lng: 82.9739, digi: '97.1%', research: 22, policies: 9 }
  ];

  const fetchLayers = async () => {
    try {
      const res = await api.get('/gis/layers');
      setLayers(res.data);
    } catch (err) {
      console.error('Failed to load GIS layers:', err);
    }
  };

  useEffect(() => {
    fetchLayers();
  }, []);

  const handleMarkerClick = async (state, district) => {
    setLoadingContext(true);
    try {
      const res = await api.get(`/gis/query-region?state=${state}&district=${district}`);
      setSelectedRegionContext(res.data);
    } catch (err) {
      alert('Failed to load regional spatial context.');
    } finally {
      setLoadingContext(false);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* Top Header with Dark/Light Theme Support */}
      <div className="bg-white dark:bg-[#10233b] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <MapIcon className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">National GIS & Spatial Intelligence Explorer</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive multi-layer spatial matrix displaying cadastral digitization, LULC remote sensing vectors, SVAMITVA village boundaries, and district intelligence.
          </p>
        </div>

        {/* Spatial Time Machine Control */}
        <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center space-x-3 shrink-0 text-xs">
          <Clock className="w-4 h-4 text-blue-700 dark:text-blue-400" />
          <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">Time-Machine: {timelineYear}</span>
          <input
            type="range"
            min="2018"
            max="2026"
            value={timelineYear}
            onChange={e => setTimelineYear(parseInt(e.target.value))}
            className="w-28 cursor-pointer accent-blue-700"
          />
        </div>
      </div>

      {/* Global Guidance Banner */}
      <ContextGuidanceBanner
        title="GIS Explorer Guidance"
        description="Interact with spatial maps, toggle cadastral layers, or click district markers to retrieve regional land governance profiles."
        whatYouCanDo={[
          "Toggle layer types (Administrative, LULC, SVAMITVA, High-Conflict)",
          "Use the Time-Machine slider to view historical remote sensing changes (2018–2026)",
          "Click any district marker on the interactive map to open its contextual intelligence drawer"
        ]}
        inputsNeeded="Select spatial layers or click district pins on the map."
        expectedResult="Interactive vector rendering and detailed regional land governance profile drawers."
      />

      {/* Main Map + Side Controls Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Layer Controls Panel */}
        <div className="bg-white dark:bg-[#10233b] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 lg:col-span-1 transition-colors">
          <div className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <span>Spatial Layer Catalog</span>
          </div>

          <div className="space-y-1">
            {['Administrative', 'LULC Remote Sensing', 'SVAMITVA Abadi', 'High-Conflict Zones'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveLayerType(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeLayerType === cat
                    ? 'bg-[#16447a] text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Active Layers Checklist */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase font-mono">Active Database Layers</div>
            {layers.length === 0 ? (
              <div className="text-xs text-slate-500 italic">Loading database spatial layers...</div>
            ) : (
              layers.map(layer => (
                <div key={layer.id} className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white leading-tight">{layer.name}</span>
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                      ● Active
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{layer.coverage} • {layer.source_provider}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Leaflet Interactive Map View */}
        <div className="bg-white dark:bg-[#10233b] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden lg:col-span-3 min-h-[460px] relative transition-colors">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            scrollWheelZoom={false}
            className="w-full h-[460px] z-10"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {regionPoints.map((pt, idx) => (
              <Marker
                key={idx}
                position={[pt.lat, pt.lng]}
                icon={defaultIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(pt.state, pt.district)
                }}
              >
                <Popup className="text-xs">
                  <div className="space-y-1 p-1">
                    <div className="font-bold text-slate-900">{pt.district}, {pt.state}</div>
                    <div>Cadastral Digitization: <strong className="text-blue-700">{pt.digi}</strong></div>
                    <div>Research Papers: <strong>{pt.research}</strong></div>
                    <button
                      onClick={() => handleMarkerClick(pt.state, pt.district)}
                      className="mt-1 text-[11px] bg-blue-800 text-white font-bold px-2 py-1 rounded w-full"
                    >
                      Inspect District Profile →
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

      </div>

      {/* District Intelligence Context Side Drawer */}
      {selectedRegionContext && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-[#10233b] text-slate-900 dark:text-white border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto space-y-4 animate-fade-up">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 font-mono">
                Regional Intelligence Profile
              </span>
              <h3 className="font-bold text-lg leading-tight">{selectedRegionContext.region}</h3>
            </div>
            <button onClick={() => setSelectedRegionContext(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Research Papers</div>
              <div className="text-lg font-bold text-blue-700 dark:text-blue-400">{selectedRegionContext.research_count}</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Policy Gazettes</div>
              <div className="text-lg font-bold text-amber-700 dark:text-amber-400">{selectedRegionContext.policy_count}</div>
            </div>
          </div>

          {/* District Highlights */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">District Documents & Evidence</h4>
            {selectedRegionContext.documents && selectedRegionContext.documents.map((d, i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">{d.title}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{d.doc_type} • {d.author}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
