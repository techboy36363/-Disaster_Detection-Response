import React from 'react';
import { UserCheck, CheckCircle2, AlertTriangle, XCircle, Sliders, ArrowRight, ShieldAlert, Building, Clock } from 'lucide-react';
import { AlertIncident } from '../../types';

interface HumanAuthorizationViewProps {
  incidents: AlertIncident[];
  onSelectIncident: (incident: AlertIncident) => void;
  onAuthorizeAction: (incident: AlertIncident) => void;
}

export const HumanAuthorizationView: React.FC<HumanAuthorizationViewProps> = ({
  incidents,
  onSelectIncident,
  onAuthorizeAction
}) => {
  const pendingIncidents = incidents.filter(i => i.status === 'AWAITING AUTHORIZATION' || !i.approval?.isApproved);
  const authorizedIncidents = incidents.filter(i => i.status === 'AUTHORIZED' || !!i.approval?.isApproved);

  return (
    <div className="space-y-5 text-xs">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <UserCheck className="h-5 w-5 text-blue-900" />
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            HUMAN-IN-THE-LOOP AUTHORIZATION & OPERATIONAL CLEARANCE
          </h2>
        </div>
        <p className="text-slate-500">
          Statutory Safeguard: Under the Disaster Management Act, AI predictive recommendations remain advisories until formally authorized by the SEOC Commander or District Collector.
        </p>
      </div>

      {/* Pending Approvals Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Pending Tactical Authorizations ({pendingIncidents.length})
            </h3>
          </div>
          <span className="text-slate-500 text-[11px]">Requires Duty Officer Clearance</span>
        </div>

        {pendingIncidents.length === 0 ? (
          <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-500">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">All pending alerts have been authorized or reviewed.</p>
            <p className="text-[11px]">No operational clearances currently in queue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingIncidents.map(alert => (
              <div
                key={alert.id}
                className="bg-white p-5 rounded-xl border-2 border-amber-300 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px]">
                        {alert.severity}
                      </span>
                      <span className="font-bold text-slate-800">{alert.disasterType}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{alert.title}</h4>
                    <div className="text-slate-500 text-[11px]">{alert.locationName}, {alert.district} District</div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block font-bold">Priority</span>
                    <span className="text-base font-black text-slate-900">{alert.priorityScore}/100</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded text-slate-800 text-[11px] space-y-1">
                  <div className="font-semibold text-amber-950 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span>AI Model Recommendation:</span>
                  </div>
                  <p>{alert.recommendedActions?.[0] || 'Deploy rubber rescue boats and issue citizen advisory.'}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Designated Authority: <strong>{alert.districtAuthority.officer}</strong></span>
                  <span>Contact: {alert.districtAuthority.emergencyContact.split('/')[0]}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => onSelectIncident(alert)}
                    className="px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Inspect Evidence
                  </button>

                  <button
                    onClick={() => onAuthorizeAction(alert)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>AUTHORIZE DISPATCH</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Authorized Clearance Log */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
          Authorized Operational Clearance Log ({authorizedIncidents.length})
        </h3>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {authorizedIncidents.map(alert => (
              <div key={alert.id} className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="font-bold text-slate-900">{alert.title}</span>
                    <span className="text-slate-500">({alert.district})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Authorized by: <strong>{alert.approval?.authorizedBy || 'SEOC State Commander'}</strong> •{' '}
                    {alert.approval?.authorizedAt ? new Date(alert.approval.authorizedAt).toLocaleTimeString() : 'Recent'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                    STATUS: AUTHORIZED
                  </span>
                  <button
                    onClick={() => onSelectIncident(alert)}
                    className="px-2.5 py-1 text-blue-900 hover:underline font-semibold cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
