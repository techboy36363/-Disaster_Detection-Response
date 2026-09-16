import React, { useState } from 'react';
import { 
  AlertOctagon, 
  Search, 
  Filter, 
  CheckCircle2, 
  UserCheck, 
  Building, 
  ArrowRight,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { AlertIncident } from '../../types';

interface AlertsViewProps {
  incidents: AlertIncident[];
  onSelectIncident: (incident: AlertIncident) => void;
  onAuthorizeAction: (incident: AlertIncident) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  incidents,
  onSelectIncident,
  onAuthorizeAction
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = incidents.filter(inc => {
    if (filterSeverity !== 'ALL' && inc.severity !== filterSeverity) return false;
    if (filterStatus === 'AWAITING' && inc.status !== 'AWAITING AUTHORIZATION') return false;
    if (filterStatus === 'AUTHORIZED' && inc.status !== 'AUTHORIZED') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.district.toLowerCase().includes(q) ||
        inc.locationName.toLowerCase().includes(q) ||
        inc.disasterType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 text-xs">
      {/* Search & Filter Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search alert by incident, location, district..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
            />
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Pills */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded transition cursor-pointer font-bold ${
                  filterSeverity === sev ? 'bg-white text-blue-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status Pills */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded transition cursor-pointer font-bold ${
                filterStatus === 'ALL' ? 'bg-white text-blue-950 shadow-2xs' : 'text-slate-600'
              }`}
            >
              All Statuses
            </button>
            <button
              onClick={() => setFilterStatus('AWAITING')}
              className={`px-2.5 py-1 rounded transition cursor-pointer font-bold ${
                filterStatus === 'AWAITING' ? 'bg-amber-100 text-amber-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Awaiting Approval
            </button>
            <button
              onClick={() => setFilterStatus('AUTHORIZED')}
              className={`px-2.5 py-1 rounded transition cursor-pointer font-bold ${
                filterStatus === 'AUTHORIZED' ? 'bg-emerald-100 text-emerald-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Authorized
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(alert => {
          const isCritical = alert.severity === 'CRITICAL';
          const isHigh = alert.severity === 'HIGH';
          const isAwaitingAuth = alert.status === 'AWAITING AUTHORIZATION';

          return (
            <div
              key={alert.id}
              className={`bg-white rounded-xl border p-4 shadow-2xs transition hover:shadow-sm space-y-3 ${
                isCritical ? 'border-red-300' : isHigh ? 'border-orange-300' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${
                      isCritical ? 'bg-red-600' : isHigh ? 'bg-orange-600' : 'bg-amber-600'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded text-[11px]">
                      {alert.disasterType}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isAwaitingAuth ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {alert.status}
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-sm mt-1.5 leading-snug">
                    {alert.title}
                  </h3>
                  <div className="text-slate-500 font-medium">
                    {alert.locationName}, {alert.district} District
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Priority</div>
                  <div className="text-base font-black text-slate-900">{alert.priorityScore}/100</div>
                </div>
              </div>

              {/* Evidence preview */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-700">Corroborating Evidence ({alert.evidence.length}):</div>
                <div className="text-slate-600 text-[11px] line-clamp-2">
                  {alert.evidence.map(e => `[${e.source}] ${e.description}`).join(' • ')}
                </div>
              </div>

              {/* District Authority */}
              <div className="flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-100 pt-2">
                <div className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  <span>Authority: <strong>{alert.districtAuthority.officer}</strong></span>
                </div>
                <span>Toll-free: {alert.districtAuthority.emergencyContact.split('/')[0]}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => onSelectIncident(alert)}
                  className="px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 font-bold text-slate-800 transition cursor-pointer flex items-center gap-1"
                >
                  <span>Inspect Full Evidence</span>
                  <ArrowRight className="h-3 w-3" />
                </button>

                {isAwaitingAuth && (
                  <button
                    onClick={() => onAuthorizeAction(alert)}
                    className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Authorize</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
