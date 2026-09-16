import React from 'react';
import { History, Clock, Bot, MapPin, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AlertIncident } from '../../types';

interface TimelineViewProps {
  incidents: AlertIncident[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ incidents }) => {
  // Aggregate all events across incidents into a single sorted chronological stream
  const allEvents = incidents.flatMap(inc => 
    inc.timeline.map(ev => ({
      ...ev,
      incidentId: inc.id,
      locationName: inc.locationName,
      district: inc.district,
      severity: inc.severity,
      disasterType: inc.disasterType
    }))
  );

  return (
    <div className="space-y-5 text-xs">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <History className="h-5 w-5 text-blue-900" />
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            INCIDENT LIFECYCLE & MULTI-AGENT CHRONOLOGICAL AUDIT STREAM
          </h2>
        </div>
        <p className="text-slate-500">
          Timestamped chronological log tracking initial sensor trip, satellite corroboration, AI risk evaluation, siren trigger, and officer authorization.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-6">
          {allEvents.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Dot */}
              <div className={`absolute -left-[31px] sm:-left-[39px] top-1 h-4 w-4 rounded-full border-2 border-white shadow-xs ${
                item.severity === 'CRITICAL' ? 'bg-red-600' : 'bg-blue-600'
              }`}></div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1 hover:bg-slate-100/70 transition">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-900 text-xs">{item.time}</span>
                    <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                      {item.agentSource}
                    </span>
                    <span className="text-slate-500 text-[11px] font-medium">
                      {item.locationName} ({item.district})
                    </span>
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed text-[11px]">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
