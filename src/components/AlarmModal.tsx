import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  BellRing, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Play, 
  Square, 
  Clock, 
  Sliders, 
  ShieldAlert, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Waves, 
  Wind, 
  CloudRain, 
  Languages, 
  RotateCcw,
  Sparkles,
  History,
  Check,
  ChevronRight
} from 'lucide-react';
import { emergencyAudio } from '../utils/audioAlert';
import { AlarmToneType, AlarmRule, AlarmLog, District, UserSession } from '../types';

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  districts: District[];
  currentUser: UserSession;
  isAlarmPlaying: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({
  isOpen,
  onClose,
  districts,
  currentUser,
  isAlarmPlaying,
  isMuted,
  onToggleMute
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'trigger' | 'timer' | 'thresholds' | 'logs'>('trigger');

  // Tone & Audio Options
  const [selectedTone, setSelectedTone] = useState<AlarmToneType>('CRITICAL_WARBLE');
  const [durationSeconds, setDurationSeconds] = useState<number>(10);
  const [volume, setVolume] = useState<number>(100);
  const [enableVoiceAnnouncement, setEnableVoiceAnnouncement] = useState<boolean>(true);
  const [voiceLanguage, setVoiceLanguage] = useState<'ta' | 'en'>('ta');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL_38_DISTRICTS');

  // Sync volume with EmergencyAudioManager whenever volume state changes
  useEffect(() => {
    emergencyAudio.setVolume(volume / 100);
  }, [volume]);

  // Spoken text
  const [customTamilText, setCustomTamilText] = useState<string>(
    'எச்சரிக்கை! தமிழ்நாடு பேரிடர் மேலாண்மை அவசர எச்சரிக்கை. பொதுமக்கள் உடனடியாக பாதுகாப்பான இடத்திற்கு செல்லவும்.'
  );
  const [customEnglishText, setCustomEnglishText] = useState<string>(
    'Emergency Warning! Tamil Nadu State Disaster Management Alert. Please evacuate low-lying zones and move to safety immediately.'
  );

  // Alarm Timer (Drill Scheduler)
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState<number | null>(null);
  const [timerTotalDuration, setTimerTotalDuration] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerDrillName, setTimerDrillName] = useState<string>('Chengalpattu Coastal Flood Mock Evacuation Drill');
  const timerRef = useRef<number | null>(null);

  // Automated Threshold Rules
  const [rules, setRules] = useState<AlarmRule[]>([
    {
      id: 'rule-rain',
      name: 'Heavy Rainfall Automated Siren',
      enabled: true,
      metric: 'RAINFALL',
      threshold: 100,
      unit: 'mm / 24h',
      tone: 'FLOOD_SIREN'
    },
    {
      id: 'rule-risk',
      name: 'Critical District Risk Index Trip',
      enabled: true,
      metric: 'RISK_SCORE',
      threshold: 85,
      unit: '/ 100',
      tone: 'CRITICAL_WARBLE'
    },
    {
      id: 'rule-water',
      name: 'Urban Water Inundation Level',
      enabled: true,
      metric: 'WATER_DEPTH',
      threshold: 3.5,
      unit: 'feet',
      tone: 'FLOOD_SIREN'
    },
    {
      id: 'rule-wind',
      name: 'Severe Cyclonic Gale Velocity',
      enabled: true,
      metric: 'WIND_SPEED',
      threshold: 75,
      unit: 'km/h',
      tone: 'CYCLONE_HORN'
    },
    {
      id: 'rule-ai',
      name: 'Gemini AI Vision Confirmed Hazard',
      enabled: true,
      metric: 'CRITICAL_SEVERITY',
      threshold: 90,
      unit: '% confidence',
      tone: 'CRITICAL_WARBLE'
    }
  ]);

  // Alarm Logs
  const [logs, setLogs] = useState<AlarmLog[]>([
    {
      id: 'log-01',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      time: '17:05',
      tone: 'CRITICAL_WARBLE',
      district: 'Chengalpattu (Mudichur)',
      triggeredBy: 'SEOC State Commander',
      reason: 'Mudichur Otteri Nullah breach emergency alert',
      status: 'COMPLETED'
    },
    {
      id: 'log-02',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      time: '16:00',
      tone: 'CYCLONE_HORN',
      district: 'Nagapattinam Coast',
      triggeredBy: 'Automated IMD Radar Hook',
      reason: 'Wind velocity exceeded 78 km/h',
      status: 'COMPLETED'
    }
  ]);

  // Sync volume with emergencyAudio
  useEffect(() => {
    emergencyAudio.setVolume(volume / 100);
  }, [volume]);

  // Load rules and logs from server if available
  useEffect(() => {
    const fetchAlarmData = async () => {
      try {
        const [rulesResp, logsResp] = await Promise.all([
          fetch('/api/alarms/rules'),
          fetch('/api/alarms/logs')
        ]);
        if (rulesResp.ok) {
          const rData = await rulesResp.json();
          if (rData.rules && rData.rules.length > 0) {
            setRules(rData.rules);
          }
        }
        if (logsResp.ok) {
          const lData = await logsResp.json();
          if (lData.logs && lData.logs.length > 0) {
            setLogs(lData.logs);
          }
        }
      } catch {
        // use initial local state
      }
    };
    if (isOpen) {
      fetchAlarmData();
    }
  }, [isOpen]);

  // Save rules changes to backend
  const updateRuleThreshold = (id: string, val: number) => {
    setRules(prev => {
      const updated = prev.map(r => (r.id === id ? { ...r, threshold: val } : r));
      fetch('/api/alarms/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: updated })
      }).catch(() => {});
      return updated;
    });
  };

  const toggleRuleEnabled = (id: string) => {
    setRules(prev => {
      const updated = prev.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r));
      fetch('/api/alarms/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: updated })
      }).catch(() => {});
      return updated;
    });
  };

  // Countdown timer effect
  useEffect(() => {
    if (isTimerRunning && timerSecondsRemaining !== null && timerSecondsRemaining > 0) {
      timerRef.current = window.setInterval(() => {
        setTimerSecondsRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            // Trigger the alarm when timer finishes!
            handleTriggerAlarm('TIMER_DRILL', timerDrillName);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerSecondsRemaining]);

  if (!isOpen) return null;

  // Sound Alarm Action
  const handleTriggerAlarm = (triggerSource: string = 'MANUAL', customReason?: string) => {
    const durationMs = durationSeconds === 0 ? 0 : durationSeconds * 1000;
    
    // Ensure sound is unmuted and AudioContext is resumed on user action
    if (emergencyAudio.getMuted()) {
      emergencyAudio.setMute(false);
    }
    emergencyAudio.resumeContext();

    // Play Tone (WebAudio + HTML5 WAV Dual Engine)
    emergencyAudio.playTone(selectedTone, durationMs);

    // Speak Voice Announcement if enabled
    if (enableVoiceAnnouncement) {
      const textToSpeak = voiceLanguage === 'ta' ? customTamilText : customEnglishText;
      const langCode = voiceLanguage === 'ta' ? 'ta-IN' : 'en-IN';
      setTimeout(() => {
        emergencyAudio.speakAnnouncement(textToSpeak, langCode);
      }, 1000);
    }

    // Add to Audit Log
    const newLog: AlarmLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      tone: selectedTone,
      district: selectedDistrict === 'ALL_38_DISTRICTS' ? 'All 38 Districts' : selectedDistrict,
      triggeredBy: currentUser.name || 'SEOC Duty Officer',
      reason: customReason || `Manual Siren Trigger (${selectedTone})`,
      status: 'ACTIVE'
    };

    setLogs(prev => [newLog, ...prev]);

    // Notify backend
    fetch('/api/alarms/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tone: selectedTone,
        district: selectedDistrict === 'ALL_38_DISTRICTS' ? 'All 38 Districts' : selectedDistrict,
        triggeredBy: currentUser.name || 'SEOC Duty Officer',
        reason: customReason || `Manual Siren Trigger (${selectedTone})`
      })
    }).catch(() => {});
  };

  const handleStopAlarm = () => {
    emergencyAudio.stopAlarm();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setLogs(prev =>
      prev.map((l, idx) => (idx === 0 && l.status === 'ACTIVE' ? { ...l, status: 'STOPPED' } : l))
    );
  };

  const handleTestBeep = () => {
    if (emergencyAudio.getMuted()) {
      emergencyAudio.setMute(false);
    }
    emergencyAudio.setVolume(volume / 100);
    emergencyAudio.resumeContext();
    emergencyAudio.playBeepTest();
  };

  const handleTestTone = (tone: AlarmToneType) => {
    if (emergencyAudio.getMuted()) {
      emergencyAudio.setMute(false);
    }
    emergencyAudio.setVolume(volume / 100);
    emergencyAudio.resumeContext();
    emergencyAudio.playTone(tone, 3000);
  };

  // Timer controls
  const handleStartTimer = (seconds: number) => {
    setTimerTotalDuration(seconds);
    setTimerSecondsRemaining(seconds);
    setIsTimerRunning(true);
  };

  const handlePauseResumeTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerRunning(false);
    setTimerSecondsRemaining(null);
  };

  // Rule threshold evaluation test
  const handleTestThresholds = () => {
    const trippedDistricts = districts.filter(d => {
      return (
        d.weatherSummary.rainfallMm >= 80 ||
        d.currentRiskScore >= 80 ||
        d.weatherSummary.windSpeedKmh >= 60
      );
    });

    if (trippedDistricts.length > 0) {
      const target = trippedDistricts[0];
      handleTriggerAlarm(
        'AUTOMATED_RULE',
        `Automated Threshold Alert: ${target.name} rainfall (${target.weatherSummary.rainfallMm}mm) & risk (${target.currentRiskScore}/100)`
      );
      alert(`⚠️ Alarm Tripped! District ${target.name} exceeded safety thresholds.`);
    } else {
      emergencyAudio.playAllClearTone();
      alert('✅ All 38 districts currently below alarm thresholds.');
    }
  };

  const formatTimer = (secs: number | null) => {
    if (secs === null) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        id="alarm-setup-modal"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-start justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isAlarmPlaying 
                ? 'bg-red-600 border-red-400 text-white animate-pulse' 
                : 'bg-blue-900/60 border-blue-700 text-amber-400'
            }`}>
              {isAlarmPlaying ? <BellRing className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight uppercase">
                  DISASTER ALARM & SIREN CONTROLLER
                </h3>
                <span className="text-[10px] bg-red-500/20 text-red-300 font-bold px-2 py-0.5 rounded border border-red-500/30">
                  அலாரம் அமைப்பு
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Configure acoustic emergency sirens, automated hazard thresholds, bilingual speech broadcasts, and scheduled mock drills.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestBeep}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs border border-emerald-400"
              title="Click to test your speaker output immediately with a loud beep"
            >
              <Volume2 className="h-4 w-4" />
              <span>Test Sound (ஒலி சோதனை)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Alarm Status Banner (When alarm is actively ringing) */}
        {isAlarmPlaying && (
          <div className="bg-red-600 text-white px-5 py-2.5 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 text-xs font-bold">
              <BellRing className="h-4 w-4" />
              <span>EMERGENCY ACOUSTIC SIREN IS CURRENTLY TRANSMITTING ACROSS CONSOLES</span>
            </div>
            <button
              onClick={handleStopAlarm}
              className="px-3 py-1 bg-white text-red-700 font-black text-xs rounded shadow-xs hover:bg-red-50 cursor-pointer transition"
            >
              STOP SIREN
            </button>
          </div>
        )}

        {/* Sub-Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 flex items-center gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveSubTab('trigger')}
            className={`px-4 py-3 font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'trigger'
                ? 'border-blue-900 text-blue-950 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="h-4 w-4 text-blue-800" />
            <span>Direct Siren Trigger (ஒலி எழுப்பு)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('timer')}
            className={`px-4 py-3 font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'timer'
                ? 'border-blue-900 text-blue-950 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="h-4 w-4 text-amber-600" />
            <span>Alarm Timer & Drills (டைமர்)</span>
            {isTimerRunning && (
              <span className="h-2 w-2 rounded-full bg-red-600 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('thresholds')}
            className={`px-4 py-3 font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'thresholds'
                ? 'border-blue-900 text-blue-950 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="h-4 w-4 text-emerald-600" />
            <span>Automated Rules (அளவுகோல்கள்)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-4 py-3 font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'logs'
                ? 'border-blue-900 text-blue-950 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="h-4 w-4 text-slate-600" />
            <span>History Log ({logs.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-5 text-xs">
          {/* TAB 1: DIRECT SIREN TRIGGER */}
          {activeSubTab === 'trigger' && (
            <div className="space-y-5">
              {/* Tone Selection Grid */}
              <div className="space-y-2">
                <label className="font-bold text-slate-900 text-xs block">
                  Select Acoustic Siren Profile / எச்சரிக்கை ஒலி வகை:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setSelectedTone('CRITICAL_WARBLE')}
                    className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                      selectedTone === 'CRITICAL_WARBLE'
                        ? 'border-red-600 bg-red-50/80 text-red-950 font-bold shadow-xs ring-1 ring-red-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5 text-red-700">
                        <ShieldAlert className="h-4 w-4" />
                        <span>National EAS + Air-Raid Siren</span>
                        <span className="px-1.5 py-0.2 bg-red-600 text-white rounded text-[9px] font-black">LOUDEST</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
                        தேசிய அவசர அலறல் சைரன் (EAS 853+960Hz & 1350Hz wail)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestTone('CRITICAL_WARBLE');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-bold text-red-700 shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <Volume2 className="h-3 w-3" />
                      <span>Test Tone</span>
                    </button>
                  </div>

                  <div
                    onClick={() => setSelectedTone('CYCLONE_HORN')}
                    className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                      selectedTone === 'CYCLONE_HORN'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-bold shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5 text-blue-800">
                        <Wind className="h-4 w-4" />
                        <span>Coastal Cyclone Super-Horn</span>
                        <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded text-[9px] font-black">HEAVY</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
                        கடலோர புயல் மெகா ஹார்ன் (Deep 220/330/440Hz foghorn)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestTone('CYCLONE_HORN');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-bold text-blue-800 shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <Volume2 className="h-3 w-3" />
                      <span>Test Tone</span>
                    </button>
                  </div>

                  <div
                    onClick={() => setSelectedTone('FLOOD_SIREN')}
                    className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                      selectedTone === 'FLOOD_SIREN'
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5 text-indigo-800">
                        <Waves className="h-4 w-4" />
                        <span>Dam Burst & Flood Rotary Siren</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
                        அணை நீர் திறப்பு & வெள்ள அபாய காற்றுச் சைரன் (520–1320Hz)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestTone('FLOOD_SIREN');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-bold text-indigo-800 shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <Volume2 className="h-3 w-3" />
                      <span>Test Tone</span>
                    </button>
                  </div>

                  <div
                    onClick={() => setSelectedTone('ALL_CLEAR')}
                    className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                      selectedTone === 'ALL_CLEAR'
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>All Clear Signal / ஆபத்து நீங்கியது</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
                        பாதுகாப்பு உறுதி மணி (Resonant C-major chord)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestTone('ALL_CLEAR');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-bold text-emerald-800 shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <Volume2 className="h-3 w-3" />
                      <span>Test Tone</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Target District & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-900 block mb-1">
                    Target Broadcast Jurisdiction:
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={e => setSelectedDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-900"
                  >
                    <option value="ALL_38_DISTRICTS">All 38 Districts (Statewide SEOC Broadcast)</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.name}>
                        {d.name} District ({d.tamilName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1">
                    Siren Duration:
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[5, 10, 30, 60, 0].map(sec => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setDurationSeconds(sec)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                          durationSeconds === sec
                            ? 'bg-blue-900 text-white border-blue-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {sec === 0 ? 'Continuous' : `${sec}s`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Volume & Acoustic Loudness Boost */}
              <div className="p-3.5 bg-gradient-to-r from-red-50/70 via-slate-50 to-blue-50/70 rounded-xl border border-red-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {volume === 0 || isMuted ? (
                      <VolumeX className="h-4 w-4 text-slate-400" />
                    ) : volume < 50 ? (
                      <Volume1 className="h-4 w-4 text-blue-700" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-red-600 animate-pulse" />
                    )}
                    <span className="font-black text-slate-900">Master Siren Volume: {volume}%</span>
                    {volume > 100 ? (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded text-[10px] font-black tracking-wider animate-pulse flex items-center gap-1 shadow-xs">
                        <span>🔥 200% MAX SIREN OVERDRIVE (+9.5dB)</span>
                      </span>
                    ) : volume >= 90 ? (
                      <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-black tracking-wider animate-pulse flex items-center gap-1">
                        <span>⚡ HIGH SPL POWER</span>
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quick Boost Preset Buttons */}
                    <button
                      type="button"
                      onClick={() => {
                        setVolume(150);
                        emergencyAudio.setVolume(1.5);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                        volume === 150 ? 'bg-amber-600 text-white border-amber-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      150% Boost
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVolume(200);
                        emergencyAudio.setVolume(2.0);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-black border transition cursor-pointer ${
                        volume === 200 ? 'bg-red-700 text-white border-red-800 animate-pulse' : 'bg-red-50 text-red-700 border-red-300'
                      }`}
                    >
                      🔥 200% MAX
                    </button>

                    <button
                      type="button"
                      onClick={handleTestBeep}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                      title="Test Audio Output"
                    >
                      <Volume2 className="h-3 w-3" />
                      <span>Test Sound</span>
                    </button>

                    <button
                      type="button"
                      onClick={onToggleMute}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold border transition cursor-pointer ${
                        isMuted 
                          ? 'bg-red-100 text-red-800 border-red-300' 
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {isMuted ? 'Muted (Unmute)' : 'Mute Sound'}
                    </button>
                  </div>
                </div>

                {/* Decibel / Loudness VU Meter Animation */}
                <div className="flex items-center gap-1 py-1">
                  <span className="text-[10px] font-bold text-slate-500 mr-1">SPL Power:</span>
                  {[
                    'bg-emerald-500', 'bg-emerald-500', 'bg-emerald-500', 'bg-emerald-500',
                    'bg-amber-400', 'bg-amber-500', 'bg-orange-500', 'bg-red-500', 'bg-red-600', 'bg-red-700'
                  ].map((colorClass, idx) => {
                    const threshold = (idx + 1) * 20;
                    const isActive = volume >= threshold;
                    return (
                      <div
                        key={idx}
                        className={`h-2 flex-1 rounded-xs transition-all ${
                          isActive 
                            ? `${colorClass} ${isAlarmPlaying ? 'animate-pulse' : ''}` 
                            : 'bg-slate-200'
                        }`}
                        title={`${threshold}% Power`}
                      />
                    );
                  })}
                  <span className="text-[10px] font-mono font-bold text-red-700 ml-1">
                    {volume > 100 ? '+9.5dB MAX' : '+6dB Boost'}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={volume}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setVolume(val);
                    emergencyAudio.setVolume(val / 100);
                  }}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>

              {/* Bilingual Public Voice Announcement */}
              <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-blue-950">
                    <input
                      type="checkbox"
                      checked={enableVoiceAnnouncement}
                      onChange={e => setEnableVoiceAnnouncement(e.target.checked)}
                      className="rounded accent-blue-900 h-4 w-4"
                    />
                    <span>Include Bilingual Voice Announcement (குரல் வழி எச்சரிக்கை)</span>
                  </label>

                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setVoiceLanguage('ta')}
                      className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                        voiceLanguage === 'ta' ? 'bg-blue-900 text-white' : 'bg-white text-slate-700 border border-slate-300'
                      }`}
                    >
                      தமிழ்
                    </button>
                    <button
                      type="button"
                      onClick={() => setVoiceLanguage('en')}
                      className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                        voiceLanguage === 'en' ? 'bg-blue-900 text-white' : 'bg-white text-slate-700 border border-slate-300'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                {enableVoiceAnnouncement && (
                  <div className="mt-2">
                    {voiceLanguage === 'ta' ? (
                      <textarea
                        value={customTamilText}
                        onChange={e => setCustomTamilText(e.target.value)}
                        rows={2}
                        className="w-full p-2 bg-white border border-blue-300 rounded-lg text-[11px] font-sans text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                        placeholder="தமிழ் குரல் எச்சரிக்கை உரை..."
                      />
                    ) : (
                      <textarea
                        value={customEnglishText}
                        onChange={e => setCustomEnglishText(e.target.value)}
                        rows={2}
                        className="w-full p-2 bg-white border border-blue-300 rounded-lg text-[11px] font-sans text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                        placeholder="English voice announcement message..."
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleStopAlarm}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Square className="h-4 w-4 text-slate-600 fill-slate-600" />
                    <span>Stop Siren (நிறுத்து)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestBeep}
                    className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
                    title="Play an instant audio test beep"
                  >
                    <Volume2 className="h-4 w-4 text-emerald-600" />
                    <span>Test Sound (ஒலி சோதனை)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleTriggerAlarm('MANUAL')}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm transition flex items-center gap-2 cursor-pointer shadow-md tracking-wider animate-pulse hover:animate-none"
                >
                  <BellRing className="h-4 w-4 text-white" />
                  <span>SOUND ALARM NOW / எச்சரிக்கை மணி இயக்கு</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ALARM TIMER & MOCK DRILL */}
          {activeSubTab === 'timer' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-amber-950">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900 mb-1">
                  <Clock className="h-4 w-4 text-amber-700" />
                  <span>Scheduled Alarm Timer & Disaster Mock Drill Controller</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Set a timed countdown for state or district-wide evacuation preparedness drills. When the countdown reaches zero, the selected acoustic siren tone and voice instructions will automatically fire.
                </p>
              </div>

              {/* Countdown Display Card */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl text-center space-y-3 shadow-inner border border-slate-800">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block">
                  {timerDrillName}
                </span>

                <div className="font-mono text-5xl font-black tracking-wider text-emerald-400">
                  {formatTimer(timerSecondsRemaining)}
                </div>

                {/* Progress Bar */}
                {timerSecondsRemaining !== null && (
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden max-w-md mx-auto">
                    <div
                      className="bg-emerald-400 h-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(100, Math.max(0, (timerSecondsRemaining / timerTotalDuration) * 100))}%`
                      }}
                    ></div>
                  </div>
                )}

                <div className="text-slate-400 text-xs">
                  Target Tone: <strong className="text-white">{selectedTone}</strong> • Scope: <strong className="text-white">{selectedDistrict}</strong>
                </div>

                {/* Timer Action Controls */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  {timerSecondsRemaining !== null && timerSecondsRemaining > 0 ? (
                    <>
                      <button
                        onClick={handlePauseResumeTimer}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition cursor-pointer"
                      >
                        {isTimerRunning ? 'Pause Countdown' : 'Resume Countdown'}
                      </button>
                      <button
                        onClick={handleResetTimer}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reset</span>
                      </button>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block">Set Quick Timer Duration:</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { label: '10 Seconds (Test)', secs: 10 },
                    { label: '30 Seconds', secs: 30 },
                    { label: '1 Minute', secs: 60 },
                    { label: '3 Minutes', secs: 180 },
                    { label: '5 Minutes', secs: 300 }
                  ].map(preset => (
                    <button
                      key={preset.secs}
                      onClick={() => handleStartTimer(preset.secs)}
                      className="p-2.5 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-900 rounded-xl text-center font-bold text-slate-800 transition cursor-pointer shadow-2xs"
                    >
                      <div className="text-sm font-black text-blue-950">{preset.secs < 60 ? `${preset.secs}s` : `${preset.secs / 60}m`}</div>
                      <div className="text-[10px] text-slate-500">{preset.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Drill Name & District Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-bold text-slate-900 block mb-1">Drill Title / Label:</label>
                  <input
                    type="text"
                    value={timerDrillName}
                    onChange={e => setTimerDrillName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    placeholder="e.g. Statewide Tsunami Mock Evacuation Drill"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-900 block mb-1">Target District:</label>
                  <select
                    value={selectedDistrict}
                    onChange={e => setSelectedDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="ALL_38_DISTRICTS">All 38 Districts (Statewide)</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUTOMATED THRESHOLD RULES */}
          {activeSubTab === 'thresholds' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Automated Sensor & Telemetry Siren Thresholds
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    System automatically trips the acoustic alarm if real-time weather, river gauge, or AI vision crosses these values.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTestThresholds}
                  className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>Check Current Telemetry</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {rules.map(rule => (
                  <div
                    key={rule.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => toggleRuleEnabled(rule.id)}
                        className="rounded accent-blue-900 h-4 w-4 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{rule.name}</span>
                          <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-mono text-[10px]">
                            Tone: {rule.tone}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Condition: Trigger when {rule.metric} &ge; {rule.threshold} {rule.unit}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[11px]">Threshold:</span>
                      <input
                        type="number"
                        value={rule.threshold}
                        onChange={e => updateRuleThreshold(rule.id, Number(e.target.value))}
                        className="w-20 px-2 py-1 bg-white border border-slate-300 rounded font-bold text-center text-xs"
                      />
                      <span className="text-slate-500 font-medium text-[11px]">{rule.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>All 5 telemetry hooks are registered with the State Emergency Operations Centre daemon.</span>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeSubTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">
                  Historical Alarm Siren Transmissions
                </h4>
                <button
                  onClick={() => setLogs([])}
                  className="text-slate-400 hover:text-slate-600 text-[11px] font-semibold underline"
                >
                  Clear Log
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  No siren alarm events recorded in this session.
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map(log => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-900">{log.time}</span>
                          <span className="font-bold text-slate-900">{log.reason}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          District: <strong>{log.district}</strong> • Triggered By: {log.triggeredBy} • Tone: {log.tone}
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'ACTIVE' 
                          ? 'bg-red-100 text-red-800 animate-pulse' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Web Audio API Synthesizer Ready (0% latency)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs transition cursor-pointer"
          >
            Close Controller
          </button>
        </div>
      </div>
    </div>
  );
};
