import React from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Users, 
  CheckCircle2, 
  HelpCircle, 
  Activity, 
  MapPin, 
  Wind, 
  CloudRain, 
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Bot,
  Eye,
  Building,
  RefreshCw
} from 'lucide-react';
import { AlertIncident, District, ResponseFacility } from '../../types';
import { LeafletMap } from '../LeafletMap';

interface CommandCenterViewProps {
  incidents: AlertIncident[];
  districts: District[];
  facilities: ResponseFacility[];
  onSelectIncident: (incident: AlertIncident) => void;
  onSelectDistrict: (district: District) => void;
  onNavigateToTab: (tab: any) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  incidents,
  districts,
  facilities,
  onSelectIncident,
  onSelectDistrict,
  onNavigateToTab,
}) => {
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
  const highRiskCount = incidents.filter(i => i.severity === 'HIGH').length;
  const activeCount = incidents.filter(i => i.status !== 'RESOLVED').length;
  const totalExposedResidents = incidents.reduce((acc, i) => acc + (i.citizenWarning?.simulatedRecipientCount || 0), 0);
  const authorizedCount = incidents.filter(i => i.status === 'AUTHORIZED' || i.approval?.isApproved).length;
  const verificationCount = incidents.filter(i => i.status === 'FIELD VERIFICATION' || i.hasConflictingEvidence).length;

  const topPriorityIncident = [...incidents].sort((a, b) => b.priorityScore - a.priorityScore)[0];
  const highestRiskDistrict = [...districts].sort((a, b) => b.currentRiskScore - a.currentRiskScore)[0];

  const aiAgents = [
    { name: '1. Data Monitoring', status: 'ACTIVE', desc: 'Real-time telemetry ingestion from 38 districts' },
    { name: '2. Vision Detection', status: 'ACTIVE', desc: 'Gemini Vision aerial & CCTV water level analysis' },
    { name: '3. Report Analysis', status: 'ACTIVE', desc: 'Natural language extraction of field VAO reports' },
    { name: '4. Weather Risk', status: 'ACTIVE', desc: 'Open-Meteo & IMD radar rainfall rate tracking' },
    { name: '5. Satellite Geospatial', status: 'ACTIVE', desc: 'Copernicus Sentinel-1 & INSAT water vapor' },
    { name: '6. Multi-Agent Fusion', status: 'ACTIVE', desc: 'Cross-evidence validation & contradiction audit' },
    { name: '7. Risk Prediction', status: 'ACTIVE', desc: '6h & 12h horizon predictive water accumulation' },
    { name: '8. Priority Engine', status: 'ACTIVE', desc: '0-100 severity, vulnerability & asset ranking' },
    { name: '9. Citizen Alert', status: 'ACTIVE', desc: 'Bilingual English + Tamil emergency generation' },
    { name: '10. Response Assistant', status: 'ACTIVE', desc: 'Human-in-the-loop department coordination' },
  ];

  return (
    <div className="space-y-6">
      {/* SEOC Banner Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              STATE EMERGENCY OPERATIONS CENTRE (SEOC) • CHENNAI
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous AI Multimodal Surveillance Across All 38 Revenue Districts of Tamil Nadu
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('ai-copilot')}
            className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Bot className="h-4 w-4 text-blue-700" />
            <span>Ask AI Copilot</span>
          </button>
          <button
            onClick={() => onNavigateToTab('human-authorization')}
            className="px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Review Approvals</span>
          </button>
        </div>
      </div>

      {/* 6 Mandatory KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-red-200 shadow-2xs text-left">
          <div className="flex items-center justify-between text-red-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Critical Alerts</span>
            <AlertOctagon className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-red-700">{criticalCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Priority score ≥ 85</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-orange-200 shadow-2xs text-left">
          <div className="flex items-center justify-between text-orange-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">High Risk</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-orange-700">{highRiskCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Priority score 70 - 84</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs text-left">
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Incidents</span>
            <Activity className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-slate-900">{activeCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Across 38 districts</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs text-left">
          <div className="flex items-center justify-between text-purple-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pop. Exposed</span>
            <Users className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalExposedResidents > 1000 ? `${(totalExposedResidents / 1000).toFixed(1)}k` : totalExposedResidents}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Inside warning circles</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs text-left">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Authorized</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{authorizedCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Human clearance logged</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs text-left">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Verification Req.</span>
            <HelpCircle className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-amber-700">{verificationCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Conflicting telemetry</div>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Tactical Alert Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Tamil Nadu Map */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-900" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                LIVE TAMIL NADU MAP (38 DISTRICTS)
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('live-map')}
              className="text-xs font-semibold text-blue-800 hover:text-blue-950 flex items-center gap-1 cursor-pointer"
            >
              <span>Expand Fullscreen Map</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <LeafletMap
            incidents={incidents}
            districts={districts}
            facilities={facilities}
            onSelectIncident={onSelectIncident}
            onSelectDistrict={onSelectDistrict}
            height="500px"
          />
        </div>

        {/* Right 1 Col: Top Priority & Live Incident Feed */}
        <div className="space-y-4">
          {/* Top Priority Spotlight */}
          {topPriorityIncident && (
            <div className="bg-white rounded-xl border-2 border-red-500 p-4 shadow-sm text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded tracking-wide uppercase">
                  TOP PRIORITY INCIDENT
                </span>
                <span className="font-black text-red-700 text-sm">
                  Priority: {topPriorityIncident.priorityScore}/100
                </span>
              </div>

              <div className="font-black text-slate-900 text-sm leading-snug">
                {topPriorityIncident.title}
              </div>

              <div className="text-slate-600">
                Location: <strong>{topPriorityIncident.locationName}</strong> ({topPriorityIncident.district} District)
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-700">
                <strong>Ground Evidence:</strong> {topPriorityIncident.evidence[0]?.description || 'Multiple sensor triggers'}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">{topPriorityIncident.status}</span>
                <button
                  onClick={() => onSelectIncident(topPriorityIncident)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs transition cursor-pointer"
                >
                  Inspect & Authorize
                </button>
              </div>
            </div>
          )}

          {/* Quick Active Alerts List */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Active Tactical Alerts ({incidents.length})
              </h4>
              <button
                onClick={() => onNavigateToTab('alerts')}
                className="text-[11px] text-blue-700 hover:underline font-semibold cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {incidents.map(inc => (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition cursor-pointer text-xs flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`h-2 w-2 rounded-full ${
                        inc.severity === 'CRITICAL' ? 'bg-red-600' : inc.severity === 'HIGH' ? 'bg-orange-500' : 'bg-amber-500'
                      }`}></span>
                      <span className="font-bold text-slate-900 truncate">{inc.locationName}</span>
                      <span className="text-slate-500 text-[11px]">({inc.district})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{inc.disasterType} • {inc.status}</div>
                  </div>
                  <span className="font-black text-slate-800 text-xs shrink-0">
                    {inc.priorityScore}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 10 AI Agents Architecture Matrix */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-blue-900" />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              10-Agent Modular AI Architecture Status
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            ALL 10 AGENTS SYNCHRONIZED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs">
          {aiAgents.map((ag, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 text-[11px]">{ag.name}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">{ag.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
