import React, { useState } from 'react';
import { 
  Truck, 
  ShieldCheck, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Building, 
  Radio, 
  Ambulance, 
  Zap,
  SlidersHorizontal,
  ChevronRight,
  PhoneCall
} from 'lucide-react';
import { AlertIncident } from '../../types';
import { NearbyHospitalsResponseCard } from '../NearbyHospitalsResponseCard';
import { SeocPhoneBridgeModal } from '../SeocPhoneBridgeModal';

interface ResponseCoordinationViewProps {
  incidents: AlertIncident[];
  onUpdateStatus: (incidentId: string, newStatus: any) => void;
}

export const ResponseCoordinationView: React.FC<ResponseCoordinationViewProps> = ({
  incidents,
  onUpdateStatus
}) => {
  const [selectedIncident, setSelectedIncident] = useState<AlertIncident>(incidents[0]);
  const [showPhoneBridge, setShowPhoneBridge] = useState(false);
  const [departmentStatus, setDepartmentStatus] = useState<Record<string, string>>({
    'Tamil Nadu Fire and Rescue Services': 'ON SITE',
    'TANGEDCO': 'EN ROUTE',
    'Tambaram City Police': 'ON SITE',
    '108 EMRI Emergency Ambulance': 'STANDBY',
    'Chengalpattu Revenue Administration': 'IN PROGRESS'
  });

  const handleStatusChange = (deptName: string, newStatus: string) => {
    setDepartmentStatus(prev => ({
      ...prev,
      [deptName]: newStatus
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ON SITE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'EN ROUTE':
        return 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse';
      case 'IN PROGRESS':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'STANDBY':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-5 text-xs">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck className="h-5 w-5 text-blue-900" />
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              EMERGENCY RESPONSE COORDINATION & TACTICAL DISPATCH MATRIX
            </h2>
          </div>
          <p className="text-slate-500">
            Structured inter-agency mobilization covering Fire & Rescue, SDRF, Highways, TANGEDCO, Police, and 108 Medical Services.
          </p>
        </div>

        <button
          onClick={() => setShowPhoneBridge(true)}
          className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md border border-red-400 cursor-pointer transition transform active:scale-95 shrink-0 self-start sm:self-center"
        >
          <PhoneCall className="h-4 w-4 text-amber-300 animate-bounce" />
          <span>📞 Auto-Dial SEOC (1070)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Incident Selector */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Select Active Sector:</h3>
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
                  <span className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                    inc.status === 'AUTHORIZED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {inc.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{inc.district} • {inc.disasterType}</div>
              </div>
            ))}
          </div>

          {/* District Incident Commander Box */}
          {selectedIncident && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="font-bold text-slate-900 text-xs">Designated Incident Commander:</div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 text-sm">{selectedIncident.districtAuthority.officer}</div>
                <div className="text-slate-600">{selectedIncident.districtAuthority.designation}</div>
                <div className="text-blue-900 font-semibold flex items-center gap-1 pt-1">
                  <Phone className="h-3 w-3" />
                  <span>{selectedIncident.districtAuthority.emergencyContact}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Multi-Agency Response Teams Matrix */}
        {selectedIncident && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Coordinated Sector</span>
                <h3 className="font-black text-slate-900 text-sm">{selectedIncident.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Incident State:</span>
                <select
                  value={selectedIncident.status}
                  onChange={e => onUpdateStatus(selectedIncident.id, e.target.value)}
                  className="p-1.5 border border-slate-300 rounded font-bold text-xs bg-white text-slate-800"
                >
                  <option value="AWAITING AUTHORIZATION">AWAITING AUTHORIZATION</option>
                  <option value="AUTHORIZED">AUTHORIZED</option>
                  <option value="TEAM ASSIGNED">TEAM ASSIGNED</option>
                  <option value="IN PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>
            </div>

            {/* Department Cards */}
            <div className="space-y-3">
              {selectedIncident.recommendedDepartments.map((dept, idx) => {
                const currentDeptStatus = departmentStatus[dept.departmentName] || 'ASSIGNED';

                return (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${
                          dept.role === 'PRIMARY' ? 'bg-red-600' :
                          dept.role === 'SUPPORTING' ? 'bg-blue-600' :
                          dept.role === 'TRAFFIC_CONTROL' ? 'bg-amber-600' :
                          dept.role === 'MEDICAL' ? 'bg-emerald-600' : 'bg-slate-700'
                        }`}>
                          {dept.role.replace('_', ' ')}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{dept.departmentName}</h4>
                          <span className="text-slate-500 text-[11px]">{dept.tamilName}</span>
                        </div>
                      </div>

                      {/* Status Selector for Department */}
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded border text-[11px] font-bold ${getStatusBadge(currentDeptStatus)}`}>
                          {currentDeptStatus}
                        </span>

                        <select
                          value={currentDeptStatus}
                          onChange={e => handleStatusChange(dept.departmentName, e.target.value)}
                          className="p-1 border border-slate-300 rounded text-[11px] bg-slate-50 text-slate-700"
                        >
                          <option value="ASSIGNED">ASSIGNED</option>
                          <option value="EN ROUTE">EN ROUTE</option>
                          <option value="ON SITE">ON SITE</option>
                          <option value="IN PROGRESS">IN PROGRESS</option>
                          <option value="STANDBY">STANDBY</option>
                        </select>
                      </div>
                    </div>

                    <div className="text-slate-700">
                      <span className="font-semibold text-slate-900">Mandated Operational Objective: </span>
                      <span>{dept.recommendedAction}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 text-slate-700">
                        <Radio className="h-3.5 w-3.5 text-blue-600" />
                        <span>Comms: <strong>{dept.contactChannel}</strong></span>
                      </div>
                      <span className="text-emerald-700 font-semibold">TNDMA Protocol Active</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Live Detected Nearby Hospitals & Medical Dispatch Panel */}
      {selectedIncident && (
        <div className="mt-4">
          <NearbyHospitalsResponseCard
            district={selectedIncident.district}
            state={selectedIncident.state || 'Tamil Nadu'}
            incidentTitle={selectedIncident.title}
          />
        </div>
      )}

      {/* Automated SEOC Phone Bridge Modal */}
      <SeocPhoneBridgeModal
        isOpen={showPhoneBridge}
        onClose={() => setShowPhoneBridge(false)}
        district={selectedIncident?.district || 'Chengalpattu'}
        state={selectedIncident?.state || 'Tamil Nadu'}
        incidentTitle={selectedIncident?.title}
        autoDialOnOpen={true}
      />
    </div>
  );
};
