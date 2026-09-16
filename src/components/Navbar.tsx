import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  UserCheck, 
  RefreshCw, 
  Languages, 
  PlayCircle,
  Activity,
  User,
  Bell,
  Phone
} from 'lucide-react';
import { UserSession } from '../types';
import { emergencyAudio } from '../utils/audioAlert';

interface NavbarProps {
  pendingAuthorizationsCount: number;
  criticalAlertCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSimulator: () => void;
  onOpenAuth: () => void;
  onOpenPendingAuthView: () => void;
  currentUser: UserSession;
  language: 'en' | 'ta';
  onToggleLanguage: () => void;
  isAlarmPlaying: boolean;
  onOpenAlarmModal: () => void;
  onOpenSeocPhoneBridge?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  pendingAuthorizationsCount,
  criticalAlertCount,
  isMuted,
  onToggleMute,
  onOpenSimulator,
  onOpenAuth,
  onOpenPendingAuthView,
  currentUser,
  language,
  onToggleLanguage,
  isAlarmPlaying,
  onOpenAlarmModal,
  onOpenSeocPhoneBridge
}) => {
  const [volPercent, setVolPercent] = useState<number>(emergencyAudio.getVolumePercent());

  const handleCycleVolumeBoost = () => {
    const nextVal = emergencyAudio.toggleVolumeBoost();
    setVolPercent(nextVal);
    emergencyAudio.playNotificationChime();
  };
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top emergency control strip */}
      <div className="bg-slate-900 text-white px-3 sm:px-4 py-1 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            NATIONAL DISASTER OPERATIONS GRID ONLINE
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden sm:inline">28 States & 8 UTs Active</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-amber-300 font-mono font-bold">Helpline: 112 / 108 / 1077</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-slate-300">
            <RefreshCw className="h-3 w-3 text-emerald-400" />
            <span>Pan-India Cloud Grid</span>
          </div>
          <span className="text-slate-500 hidden md:inline">•</span>
          <button 
            onClick={onToggleLanguage}
            className="flex items-center gap-1 text-amber-300 hover:text-amber-200 transition font-medium cursor-pointer min-h-[28px]"
            title="Toggle language: English / தமிழ்"
          >
            <Languages className="h-3.5 w-3.5" />
            <span>{language === 'en' ? 'தமிழ் (Tamil)' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Logo & App Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-blue-900 flex items-center justify-center text-white shadow-xs border border-blue-800 shrink-0">
            <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight truncate">
                INDIA NATIONAL AI DISASTER MANAGEMENT SYSTEM
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-blue-100 text-blue-900 tracking-wider">
                NDMA & SDMA GRID
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">
              {language === 'en' 
                ? 'All-India Disaster Surveillance, Bilingual Voice Copilot & Automated SMS Dispatch'
                : 'அகில இந்திய பேரிடர் கண்காணிப்பு, இருமொழி AI வாய்ஸ் மற்றும் தானியங்கி SMS எச்சரிக்கை'}
            </p>
          </div>
        </div>

        {/* Tactical Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hackathon Simulation Trigger Button */}
          <button
            onClick={onOpenSimulator}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold cursor-pointer transition shadow-2xs"
            title="Launch One-Click Disaster Simulation for Judge Demo"
          >
            <PlayCircle className="h-3.5 w-3.5 text-blue-600" />
            <span>Run Simulation</span>
          </button>

          {/* Set Alarm / Alarm Controller Button */}
          <button
            onClick={onOpenAlarmModal}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer border transition shadow-2xs ${
              isAlarmPlaying 
                ? 'bg-red-600 text-white border-red-700 animate-pulse' 
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
            title="Alarm Configuration, Timer & Siren Controls (அலாரம் அமைப்பு)"
            id="navbar-alarm-btn"
          >
            <Bell className={`h-3.5 w-3.5 ${isAlarmPlaying ? 'text-white animate-bounce' : 'text-amber-700'}`} />
            <span>
              {isAlarmPlaying ? 'ALARM RINGING' : language === 'ta' ? 'அலாரம் அமை' : 'Set Alarm'}
            </span>
          </button>

          {/* Sound Alarm Toggle */}
          <button
            onClick={onToggleMute}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer border transition shadow-2xs ${
              isAlarmPlaying 
                ? 'bg-red-600 text-white border-red-700 animate-bounce' 
                : isMuted 
                  ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
            }`}
            title={isMuted ? 'Alert siren is muted' : 'Emergency siren enabled'}
          >
            {isMuted ? (
              <>
                <VolumeX className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden md:inline">Siren Muted</span>
              </>
            ) : (
              <>
                <Volume2 className={`h-3.5 w-3.5 ${isAlarmPlaying ? 'text-white' : 'text-emerald-600'}`} />
                <span className="hidden md:inline">{isAlarmPlaying ? 'SIREN ACTIVE' : 'Siren Enabled'}</span>
              </>
            )}
          </button>

          {/* Alert Siren Volume Boost Button */}
          <button
            onClick={handleCycleVolumeBoost}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold cursor-pointer border transition shadow-2xs ${
              volPercent > 100 
                ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-700 animate-pulse' 
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
            title="Click to boost alert siren volume (100% -> 150% -> 200% MAX AMPLIFIED)"
          >
            <Volume2 className={`h-3.5 w-3.5 ${volPercent > 100 ? 'text-amber-300' : 'text-slate-600'}`} />
            <span>{volPercent}% {volPercent > 100 ? '🔥 BOOST' : 'Vol'}</span>
          </button>

          {/* Direct Auto-Dial SEOC Hotline */}
          {onOpenSeocPhoneBridge && (
            <button
              onClick={onOpenSeocPhoneBridge}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-black bg-red-600 hover:bg-red-700 text-white border border-red-500 cursor-pointer shadow-xs transition transform active:scale-95"
              title="Automated Phone Link with State Emergency Operations Centre (1070)"
            >
              <Phone className="h-3.5 w-3.5 text-amber-300 animate-bounce" />
              <span className="hidden sm:inline">SEOC 1070</span>
            </button>
          )}

          {/* Human Authorization Pending Badge */}
          <button
            onClick={onOpenPendingAuthView}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer border transition shadow-2xs ${
              pendingAuthorizationsCount > 0
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5 text-amber-600" />
            <span>
              {pendingAuthorizationsCount}{' '}
              <span className="hidden md:inline">Pending Authorization</span>
            </span>
          </button>

          {/* User Profile / Login */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium cursor-pointer transition shadow-2xs"
            title="Operator Role & Security Settings"
          >
            <User className="h-3.5 w-3.5 text-blue-300" />
            <span className="hidden lg:inline">{currentUser.name}</span>
            <span className="inline lg:hidden">Auth</span>
          </button>
        </div>
      </div>
    </header>
  );
};
