import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Stethoscope, 
  Bed, 
  Ambulance, 
  PhoneCall, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Send, 
  ShieldAlert, 
  HeartPulse,
  Radio
} from 'lucide-react';
import { NearbyHospital, getLiveNearbyHospitals, triggerHospitalAlertResponse, HospitalAlertStatus } from '../data/nearbyHospitals';
import { emergencyAudio } from '../utils/audioAlert';

interface NearbyHospitalsResponseCardProps {
  district: string;
  state?: string;
  incidentTitle?: string;
  onCallHospital?: (phone: string) => void;
}

export const NearbyHospitalsResponseCard: React.FC<NearbyHospitalsResponseCardProps> = ({
  district,
  state = 'Tamil Nadu',
  incidentTitle,
  onCallHospital
}) => {
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccessMsg, setBroadcastSuccessMsg] = useState<string | null>(null);

  // Sync hospitals when district changes
  useEffect(() => {
    const list = getLiveNearbyHospitals(district, state);
    setHospitals(list);
  }, [district, state]);

  const handleDispatchAllHospitals = () => {
    setIsBroadcasting(true);
    emergencyAudio.playNotificationChime();

    setTimeout(() => {
      const updated = triggerHospitalAlertResponse(
        district,
        state,
        'ALL',
        'AMBULANCE_DISPATCHED'
      );
      setHospitals([...updated]);
      setIsBroadcasting(false);
      setBroadcastSuccessMsg(`🚨 Emergency Code-Red alert acknowledged by all ${updated.length} detected hospitals in ${district}! 108 trauma fleets mobilized.`);

      setTimeout(() => {
        setBroadcastSuccessMsg(null);
      }, 5000);
    }, 600);
  };

  const handleUpdateSingleHospital = (hospitalId: string, status: HospitalAlertStatus) => {
    const updated = triggerHospitalAlertResponse(district, state, hospitalId, status);
    setHospitals([...updated]);
    emergencyAudio.playTone('STANDBY_CHIME', 0.8);
  };

  const totalIcuAvailable = hospitals.reduce((acc, h) => acc + h.availableIcuBeds, 0);
  const totalAmbulances = hospitals.reduce((acc, h) => acc + h.ambulancesAssigned, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 shrink-0">
            <HeartPulse className="h-5 w-5 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-sm tracking-tight">
                NEARBY HOSPITALS & TRAUMA ALERT RESPONSE
              </h3>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {hospitals.length} DETECTED
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Automatic hospital radius detection with live trauma ICU readiness and 108 ambulance dispatch alerts
            </p>
          </div>
        </div>

        {/* Global Dispatch Button */}
        <button
          onClick={handleDispatchAllHospitals}
          disabled={isBroadcasting}
          className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Send className="h-3.5 w-3.5" />
          <span>{isBroadcasting ? 'Broadcasting...' : '🚨 Alert All Hospitals'}</span>
        </button>
      </div>

      {/* Aggregate Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] text-slate-500 font-bold block uppercase">District Sector</span>
          <span className="text-xs font-black text-slate-900">{district}</span>
        </div>
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
          <span className="text-[10px] text-emerald-700 font-bold block uppercase">Total ICU Beds Ready</span>
          <span className="text-xs font-black text-emerald-800">{totalIcuAvailable} Beds</span>
        </div>
        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-[10px] text-blue-700 font-bold block uppercase">108 Ambulances Assigned</span>
          <span className="text-xs font-black text-blue-800">{totalAmbulances} Fleets</span>
        </div>
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <span className="text-[10px] text-amber-700 font-bold block uppercase">Emergency Hotline</span>
          <span className="text-xs font-black text-amber-900 font-mono">108 / 112</span>
        </div>
      </div>

      {/* Broadcast Success Message */}
      {broadcastSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-400 text-emerald-900 rounded-lg flex items-center gap-2 text-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{broadcastSuccessMsg}</span>
        </div>
      )}

      {/* Hospital Cards List */}
      <div className="space-y-3">
        {hospitals.map(hospital => (
          <div 
            key={hospital.id}
            className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-3"
          >
            {/* Top Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-black text-slate-900 text-xs sm:text-sm">
                    {hospital.name}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
                    {hospital.distanceKm} km ({hospital.etaMinutes} min ETA)
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">{hospital.tamilName}</div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-black border flex items-center gap-1 ${
                  hospital.alertStatus === 'AMBULANCE_DISPATCHED'
                    ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                    : hospital.alertStatus === 'ICU_BEDS_RESERVED'
                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}>
                  <span className="h-2 w-2 rounded-full bg-current animate-ping" />
                  <span>
                    {hospital.alertStatus === 'AMBULANCE_DISPATCHED' && '🚑 AMBULANCES DISPATCHED'}
                    {hospital.alertStatus === 'ICU_BEDS_RESERVED' && '🛏️ ICU BEDS RESERVED'}
                    {hospital.alertStatus === 'CODE_RED_ACKNOWLEDGED' && '🚨 CODE-RED ACKNOWLEDGED'}
                    {hospital.alertStatus === 'ALERT_DISPATCHED' && '📡 ALERT TRANSMITTED'}
                    {hospital.alertStatus === 'MONITORING_GRID' && 'STANDBY'}
                  </span>
                </span>
              </div>
            </div>

            {/* Hospital Capabilities Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px]">
              <div>
                <span className="text-slate-500 text-[10px] block">Available ICU Beds:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Bed className="h-3 w-3 text-blue-600" />
                  {hospital.availableIcuBeds} / {hospital.totalBeds}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Trauma Surgeons:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Stethoscope className="h-3 w-3 text-emerald-600" />
                  {hospital.traumaSurgeonsOnDuty} on Duty
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Active Ambulances:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Ambulance className="h-3 w-3 text-red-600" />
                  {hospital.ambulancesAssigned} Fleets
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Oxygen Reserve:</span>
                <span className="font-bold text-emerald-700">
                  {hospital.oxygenReservePercent}% Capacity
                </span>
              </div>
            </div>

            {/* Live Hospital Alert Response Note */}
            {hospital.responseMessage && (
              <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-200 text-[11px] text-blue-950 space-y-1">
                <div className="flex items-center justify-between font-bold text-blue-900">
                  <span className="flex items-center gap-1">
                    <Radio className="h-3 w-3 text-blue-700" />
                    Hospital Emergency Response Feed:
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-normal">
                    {hospital.lastResponseTime}
                  </span>
                </div>
                <div>{hospital.responseMessage}</div>
                {hospital.tamilResponseMessage && (
                  <div className="text-[10px] text-blue-800 pt-0.5">{hospital.tamilResponseMessage}</div>
                )}
              </div>
            )}

            {/* Actions & Direct Phone Link */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-500 font-bold">Quick Actions:</span>
                <button
                  onClick={() => handleUpdateSingleHospital(hospital.id, 'AMBULANCE_DISPATCHED')}
                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[10px] font-bold cursor-pointer transition"
                >
                  🚑 Dispatch Ambulances
                </button>
                <button
                  onClick={() => handleUpdateSingleHospital(hospital.id, 'ICU_BEDS_RESERVED')}
                  className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded text-[10px] font-bold cursor-pointer transition"
                >
                  🛏️ Reserve 10 More Beds
                </button>
              </div>

              {/* Direct Telephone Link */}
              <a
                href={`tel:${hospital.phone}`}
                onClick={() => onCallHospital && onCallHospital(hospital.phone)}
                className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
              >
                <PhoneCall className="h-3.5 w-3.5 text-amber-300" />
                <span>Call Casualty Desk: {hospital.phone}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
