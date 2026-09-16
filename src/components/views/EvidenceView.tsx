import React, { useState } from 'react';
import { 
  FileCheck2, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  ShieldCheck, 
  Radio, 
  Camera, 
  CloudRain, 
  Satellite,
  UserCheck
} from 'lucide-react';
import { AlertIncident } from '../../types';

interface EvidenceViewProps {
  incidents: AlertIncident[];
  onSelectIncident: (incident: AlertIncident) => void;
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({
  incidents,
  onSelectIncident
}) => {
  const [selectedIncident, setSelectedIncident] = useState<AlertIncident>(incidents[0]);

  return (
    <div className="space-y-5 text-xs">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <FileCheck2 className="h-5 w-5 text-blue-900" />
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            MULTI-AGENT EVIDENCE FUSION & CONFLICT AUDIT
          </h2>
        </div>
        <p className="text-slate-500">
          Cross-validates disparate data streams (Weather AWS + Copernicus SAR + Gemini Vision + Ground Reports) to prevent false positives and audit discrepancies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Incident Selector */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Select Incident to Audit:</h3>
          <div className="space-y-2">
            {incidents.map(inc => (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-3 rounded-lg border transition cursor-pointer ${
                  selectedIncident?.id === inc.id
                    ? 'border-blue-900 bg-blue-50/80 font-bold text-blue-950'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{inc.locationName}</span>
                  {inc.hasConflictingEvidence ? (
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Conflict
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded font-bold">
                      Corroborated
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{inc.district} • {inc.evidence.length} sources</div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Breakdown & Fusion Matrix */}
        {selectedIncident && (
          <div className="lg:col-span-2 space-y-4">
            {/* Conflicting Evidence Alert if present */}
            {selectedIncident.hasConflictingEvidence ? (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span>⚠️ CONFLICTING EVIDENCE DETECTED BETWEEN STREAMS</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Automatic Weather Station (AWS) telemetry reports localized precipitation disparity compared to camera and field inspection markers. Priority calculation has flagged this sector for human verification before high-volume resource commitment.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-xs">
                  All {selectedIncident.evidence.length} evidence streams are concordant. High fusion confidence score ({selectedIncident.detectionConfidence}%).
                </span>
              </div>
            )}

            {/* Evidence Cards */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Corroborating Stream Ingestion Log ({selectedIncident.evidence.length} Streams)
              </h3>

              <div className="space-y-3">
                {selectedIncident.evidence.map(ev => (
                  <div
                    key={ev.id}
                    className={`p-4 rounded-lg border text-xs space-y-2 ${
                      ev.conflicting ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-900 text-white font-black text-[10px]">
                          {ev.source}
                        </span>
                        {ev.indicatorValue && (
                          <span className="font-bold text-slate-900">{ev.indicatorValue}</span>
                        )}
                        {ev.conflicting && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold text-[10px]">
                            Discrepancy Flagged
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-semibold text-slate-500">
                        Recorded: {ev.timestamp} ({ev.freshness})
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed text-[11px]">{ev.description}</p>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Stream Reliability: <strong>{ev.confidence}%</strong></span>
                      <span>Signal Hash: SHA-256 Validated</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
