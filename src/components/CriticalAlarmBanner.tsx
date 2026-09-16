import React, { useState } from 'react';
import { AlertTriangle, VolumeX, Volume2, ShieldAlert, ArrowRight, CheckCircle2, Bell, Phone } from 'lucide-react';
import { AlertIncident } from '../types';
import { emergencyAudio } from '../utils/audioAlert';

interface CriticalAlarmBannerProps {
  criticalAlert: AlertIncident | null;
  onViewAlert: (alert: AlertIncident) => void;
  onAuthorizeAction: (alert: AlertIncident) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenAlarmModal?: () => void;
  onOpenSeocPhoneBridge?: () => void;
}

export const CriticalAlarmBanner: React.FC<CriticalAlarmBannerProps> = ({
  criticalAlert,
  onViewAlert,
  onAuthorizeAction,
  isMuted,
  onToggleMute,
  onOpenAlarmModal,
  onOpenSeocPhoneBridge,
}) => {
  const [volumePct, setVolumePct] = useState<number>(emergencyAudio.getVolumePercent());

  const handleBoost = () => {
    const nextVal = emergencyAudio.toggleVolumeBoost();
    setVolumePct(nextVal);
    emergencyAudio.playNotificationChime();
  };

  if (!criticalAlert) return null;

  const isAwaitingAuth = criticalAlert.status === 'AWAITING AUTHORIZATION';

  return (
    <div className="bg-red-600 text-white border-b-2 border-red-700 shadow-md relative z-30 animate-pulse-slow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-700/80 rounded-lg shrink-0 mt-0.5 border border-red-500">
            <AlertTriangle className="h-6 w-6 text-yellow-300 animate-bounce" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white text-red-700 text-xs font-black px-2 py-0.5 rounded-sm tracking-wider uppercase">
                🚨 CRITICAL DISASTER ALERT
              </span>
              <span className="text-xs font-bold text-red-100 bg-red-700/70 px-2 py-0.5 rounded-sm">
                Priority: {criticalAlert.priorityScore}/100
              </span>
              <span className="text-xs font-semibold text-yellow-200">
                Risk Score: {criticalAlert.riskScore}/100
              </span>
            </div>
            <div className="text-sm sm:text-base font-bold text-white mt-1">
              {criticalAlert.disasterType}: {criticalAlert.locationName}, {criticalAlert.district} District
            </div>
            <p className="text-xs text-red-100 line-clamp-1 mt-0.5">
              <span className="font-semibold text-white">Recommended Action:</span>{' '}
              {criticalAlert.recommendedActions?.[0] || 'Deploy emergency rescue units and issue citizen evacuation alert.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={() => onViewAlert(criticalAlert)}
            className="px-3 py-1.5 rounded-md bg-white text-red-700 hover:bg-red-50 text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <span>View Evidence & Alert</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          {isAwaitingAuth && (
            <button
              onClick={() => onAuthorizeAction(criticalAlert)}
              className="px-3 py-1.5 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-950" />
              <span>AUTHORIZE ACTION</span>
            </button>
          )}

          {onOpenAlarmModal && (
            <button
              onClick={onOpenAlarmModal}
              className="px-2.5 py-1.5 rounded-md bg-red-700 hover:bg-red-800 text-white text-xs font-semibold border border-red-500 transition flex items-center gap-1 cursor-pointer"
              title="Configure Alarm Settings & Siren Sound (அலாரம் அமைப்பு)"
            >
              <Bell className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-[11px]">Alarm Settings</span>
            </button>
          )}

          {/* Direct Auto-Dial SEOC Hotline */}
          {onOpenSeocPhoneBridge && (
            <button
              onClick={onOpenSeocPhoneBridge}
              className="px-2.5 py-1.5 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition shadow-xs flex items-center gap-1 cursor-pointer"
              title="Automated Phone Link with State Emergency Operations Centre (1070)"
            >
              <Phone className="h-3.5 w-3.5 text-slate-950 animate-bounce" />
              <span>Auto-Dial SEOC (1070)</span>
            </button>
          )}

          {/* Alert Volume Boost Button */}
          <button
            onClick={handleBoost}
            className={`px-2.5 py-1.5 rounded-md text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${
              volumePct > 100 
                ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-black animate-pulse' 
                : 'bg-red-700 hover:bg-red-800 text-white border-red-500'
            }`}
            title="Boost Alert Siren Volume (100% -> 150% -> 200% MAX OVERDRIVE)"
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>{volumePct}% {volumePct > 100 ? '🔥 BOOST' : 'Vol'}</span>
          </button>

          <button
            onClick={onToggleMute}
            className="px-2.5 py-1.5 rounded-md bg-red-700 hover:bg-red-800 text-white text-xs font-medium border border-red-500 transition flex items-center gap-1 cursor-pointer"
            title="Mute siren alarm"
          >
            <VolumeX className="h-3.5 w-3.5" />
            <span className="text-[11px]">{isMuted ? 'Unmute' : 'Mute Alarm'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
