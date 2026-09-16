import React, { useState, useMemo, useEffect } from 'react';
import { 
  MessageSquareWarning, 
  Send, 
  CheckCircle2, 
  Phone, 
  Languages, 
  Copy, 
  Check, 
  Building2, 
  Tractor, 
  Plus, 
  Trash2, 
  Smartphone, 
  ShieldAlert, 
  Stethoscope, 
  ExternalLink,
  Flame,
  Zap,
  Radio,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  TowerControl as Tower,
  Users,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';
import { AlertIncident, AreaClassification, StructuredAreaMessage } from '../../types';
import { 
  getNearbyEmergencyTeams, 
  generateUrbanStructuredMessage, 
  generateRuralStructuredMessage, 
  formatCompactSmsPayload,
  buildSmsIntentUrl,
  buildWhatsAppIntentUrl,
  autoDispatchAllAffectedZones,
  AutoDispatchSummary
} from '../../utils/smsDispatchService';
import { voiceAssistant } from '../../utils/voiceAssistant';
import { emergencyAudio } from '../../utils/audioAlert';
import { NearbyHospitalsResponseCard } from '../NearbyHospitalsResponseCard';
import { SeocPhoneBridgeModal } from '../SeocPhoneBridgeModal';
import { triggerHospitalAlertResponse } from '../../data/nearbyHospitals';

interface CitizenAlertsViewProps {
  incidents: AlertIncident[];
  onTriggerSmsDispatch: (alert: AlertIncident, phoneNumber?: string) => Promise<void>;
}

export const CitizenAlertsView: React.FC<CitizenAlertsViewProps> = ({
  incidents,
  onTriggerSmsDispatch
}) => {
  const [selectedIncident, setSelectedIncident] = useState<AlertIncident>(incidents[0] || {} as AlertIncident);
  const [activeAreaTab, setActiveAreaTab] = useState<AreaClassification>(
    selectedIncident?.areaClassification || 'URBAN'
  );

  // Autonomous Multi-Zone Auto-Dispatch State
  const [isAutoDispatchingAll, setIsAutoDispatchingAll] = useState(false);
  const [autoDispatchSummary, setAutoDispatchSummary] = useState<AutoDispatchSummary | null>(null);
  const [autoPilotActive, setAutoPilotActive] = useState(false);
  const [voiceAnnouncementEnabled, setVoiceAnnouncementEnabled] = useState(true);
  const [autoDispatchStep, setAutoDispatchStep] = useState<string>('');
  const [isSpeakingAlert, setIsSpeakingAlert] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);
  const [voiceCommandFeedback, setVoiceCommandFeedback] = useState<string | null>(null);
  const [showSeocModal, setShowSeocModal] = useState(false);

  // Phone numbers to send automated SMS to (for single alert fine-tuning)
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([
    '+91 98401 23456',
    '+91 94440 10800'
  ]);
  const [newPhoneInput, setNewPhoneInput] = useState('');

  // Automated dispatch flags for Medical and Response teams
  const [includeMedicalTeams, setIncludeMedicalTeams] = useState(true);
  const [includeResponseTeams, setIncludeResponseTeams] = useState(true);

  const [broadcastRadius, setBroadcastRadius] = useState<number>(
    selectedIncident?.citizenWarning?.affectedRadiusKm || 8
  );
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{
    success: boolean;
    totalRecipients: number;
    message: string;
  } | null>(null);

  const [copiedEn, setCopiedEn] = useState(false);
  const [copiedTa, setCopiedTa] = useState(false);

  // Computed summary of currently affected active zones
  const affectedZonesList = useMemo(() => {
    const criticalOrActive = incidents.filter(i => 
      i.severity === 'CRITICAL' || i.severity === 'HIGH' || i.riskScore >= 65
    );
    return criticalOrActive.length > 0 ? criticalOrActive : incidents.slice(0, 5);
  }, [incidents]);

  const totalAffectedEstCitizens = useMemo(() => {
    return affectedZonesList.reduce((acc, inc) => {
      const radius = inc.citizenWarning?.affectedRadiusKm || 8;
      const count = inc.citizenWarning?.simulatedRecipientCount || Math.round(radius * radius * 1850);
      return acc + count;
    }, 0);
  }, [affectedZonesList]);

  // Derive nearby teams
  const nearbyTeams = useMemo(() => {
    return getNearbyEmergencyTeams(selectedIncident?.district || '', selectedIncident?.state || 'Tamil Nadu');
  }, [selectedIncident]);

  // Stop speaking on unmount
  useEffect(() => {
    return () => {
      voiceAssistant.stopSpeaking();
      voiceAssistant.stopListening();
    };
  }, []);

  // 1-Click Fast Autonomous Multi-Zone Auto-Dispatch
  const handleAutoDispatchAllAffectedZones = async () => {
    setIsAutoDispatchingAll(true);
    setAutoDispatchSummary(null);
    setVoiceCommandFeedback(null);
    
    // 1. Play immediate emergency sound chime
    emergencyAudio.playTone('STANDBY_CHIME', 1.2);

    // 2. High-speed visual execution pipeline (< 1 second)
    setAutoDispatchStep('1. Triangulating cellular towers & GIS flood buffers across all affected zones...');
    await new Promise(r => setTimeout(r, 200));

    setAutoDispatchStep('2. Alerting 108 Emergency Medical Fleets & District Trauma ICUs...');
    // Automatically trigger code-red alert and ambulance dispatch in nearby hospitals for all affected districts
    affectedZonesList.forEach(zone => {
      triggerHospitalAlertResponse(zone.district, zone.state, 'ALL', 'AMBULANCE_DISPATCHED');
    });
    await new Promise(r => setTimeout(r, 250));

    setAutoDispatchStep('3. Mobilizing NDRF & SDRF regional rescue battalions...');
    await new Promise(r => setTimeout(r, 200));

    setAutoDispatchStep('4. Transmitting Cell Broadcast & SMS to citizen mobiles (Tamil & English)...');
    
    try {
      const summary = await autoDispatchAllAffectedZones(affectedZonesList);
      setAutoDispatchSummary(summary);
      setAutoDispatchStep('COMPLETED');

      // 3. AI Voice Assistant immediately announces aloud in Tamil / English
      if (voiceAnnouncementEnabled) {
        setIsSpeakingAlert(true);
        // Play Tamil first, then short pause
        voiceAssistant.speak(summary.voiceAnnouncementTamil, 'ta').then(() => {
          setIsSpeakingAlert(false);
        }).catch(() => setIsSpeakingAlert(false));
      }
    } catch (err: any) {
      console.error('Auto dispatch all error:', err);
      setAutoDispatchStep('FAILED');
    } finally {
      setIsAutoDispatchingAll(false);
    }
  };

  // Voice Command Trigger
  const handleVoiceCommandTrigger = () => {
    if (isMicListening) {
      voiceAssistant.stopListening();
      setIsMicListening(false);
      return;
    }

    const started = voiceAssistant.startListening({
      language: 'ta',
      onResult: (transcript, isFinal) => {
        setVoiceCommandFeedback(`"${transcript}"`);
        const lower = transcript.toLowerCase();
        // Check if voice command mentions auto-dispatch, alert, sms, etc.
        if (
          isFinal ||
          lower.includes('sms') ||
          lower.includes('alert') ||
          lower.includes('dispatch') ||
          lower.includes('அனுப்பு') ||
          lower.includes('எச்சரிக்கை') ||
          lower.includes('send')
        ) {
          setIsMicListening(false);
          setVoiceCommandFeedback(`Voice Command Recognized: "${transcript}". Executing Auto-Dispatch across all affected zones...`);
          handleAutoDispatchAllAffectedZones();
        }
      },
      onError: (e) => {
        console.warn('Voice recognition error:', e);
        setIsMicListening(false);
      },
      onEnd: () => {
        setIsMicListening(false);
      }
    });

    if (started) {
      setIsMicListening(true);
    } else {
      alert('Speech recognition not available on this browser. Use the 1-click Auto-Dispatch button.');
    }
  };

  // Derive structured message for selected area
  const currentStructure: StructuredAreaMessage = useMemo(() => {
    if (activeAreaTab === 'RURAL' || activeAreaTab === 'HILL_TRIBAL') {
      return (
        selectedIncident?.citizenWarning?.ruralStructure || 
        generateRuralStructuredMessage(selectedIncident)
      );
    }
    return (
      selectedIncident?.citizenWarning?.urbanStructure || 
      generateUrbanStructuredMessage(selectedIncident)
    );
  }, [selectedIncident, activeAreaTab]);

  const simulatedRecipients = Math.round(broadcastRadius * broadcastRadius * 1850);

  const handleAddPhone = () => {
    const trimmed = newPhoneInput.trim();
    if (trimmed && !phoneNumbers.includes(trimmed)) {
      setPhoneNumbers([...phoneNumbers, trimmed]);
      setNewPhoneInput('');
    }
  };

  const handleRemovePhone = (index: number) => {
    setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
  };

  const handleAutomatedMultiDispatch = async () => {
    if (!selectedIncident) return;
    setIsDispatching(true);
    setDispatchResult(null);

    const primaryNumber = phoneNumbers[0] || '+91 98401 23456';

    try {
      // 1. Trigger the standard app callback
      await onTriggerSmsDispatch(selectedIncident, primaryNumber);

      // 2. Also call the multi-target server endpoint
      const medicalPayload = includeMedicalTeams ? nearbyTeams.medicalTeams : [];
      const responsePayload = includeResponseTeams ? nearbyTeams.responseTeams : [];

      await fetch('/api/notifications/dispatch-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: selectedIncident.id,
          customNumbers: phoneNumbers,
          medicalTeams: medicalPayload,
          responseTeams: responsePayload,
          areaType: activeAreaTab,
          language: 'bilingual',
          messageTamil: currentStructure.tamilHeader + '\n' + currentStructure.tamilInstructions.join('; '),
          messageEnglish: currentStructure.englishHeader + '\n' + currentStructure.englishInstructions.join('; ')
        })
      }).catch(err => console.warn('Multi-dispatch log warning:', err));

      const totalCount = phoneNumbers.length + 
        (includeMedicalTeams ? nearbyTeams.medicalTeams.length : 0) + 
        (includeResponseTeams ? nearbyTeams.responseTeams.length : 0);

      setDispatchResult({
        success: true,
        totalRecipients: totalCount,
        message: `Automated emergency SMS dispatched to ${totalCount} targets: ${phoneNumbers.length} designated numbers, ${nearbyTeams.medicalTeams.length} medical teams, and ${nearbyTeams.responseTeams.length} emergency response units.`
      });

      setTimeout(() => setDispatchResult(null), 8000);
    } catch (err: any) {
      setDispatchResult({
        success: false,
        totalRecipients: 0,
        message: err.message || 'Failed to dispatch automated SMS.'
      });
    } finally {
      setIsDispatching(false);
    }
  };

  const copyText = (text: string, isTamil: boolean) => {
    navigator.clipboard.writeText(text);
    if (isTamil) {
      setCopiedTa(true);
      setTimeout(() => setCopiedTa(false), 2000);
    } else {
      setCopiedEn(true);
      setTimeout(() => setCopiedEn(false), 2000);
    }
  };

  // Compact preview string for phone SMS
  const compactPayloadTamil = formatCompactSmsPayload(selectedIncident, activeAreaTab, 'tamil');
  const compactPayloadEnglish = formatCompactSmsPayload(selectedIncident, activeAreaTab, 'english');

  const mobileSmsUrl = buildSmsIntentUrl(phoneNumbers[0] || '', compactPayloadTamil + '\n\n' + compactPayloadEnglish);
  const mobileWhatsAppUrl = buildWhatsAppIntentUrl(phoneNumbers[0] || '', compactPayloadTamil + '\n\n' + compactPayloadEnglish);

  return (
    <div className="space-y-4 text-xs">
      {/* Top Header Card */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquareWarning className="h-5 w-5 text-blue-900 shrink-0" />
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              NATIONAL SMS DISPATCH & STRUCTURED EMERGENCY WARNINGS
            </h2>
          </div>
          <p className="text-slate-500 text-[11px] sm:text-xs">
            Automated bilingual (Tamil & English) emergency dispatch for Urban & Rural sectors, targeting citizen mobiles, 108 medical fleets, and NDRF/SDRF teams across India.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 bg-blue-50 text-blue-900 font-bold border border-blue-200 rounded-lg flex items-center gap-1.5 text-[11px]">
            <Languages className="h-3.5 w-3.5" />
            <span>English + தமிழ்</span>
          </span>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 rounded-lg flex items-center gap-1.5 text-[11px]">
            <Smartphone className="h-3.5 w-3.5" />
            <span>Mobile Optimized</span>
          </span>
        </div>
      </div>

      {/* AUTONOMOUS AI MULTI-ZONE AUTO-DISPATCH HERO CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white rounded-xl border-2 border-red-500/50 p-4 sm:p-5 shadow-lg relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-red-600 rounded-lg text-white shrink-0 shadow-md animate-pulse">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black tracking-wide text-white flex items-center gap-2">
                    ⚡ AUTONOMOUS AI AUTO-DISPATCH ENGINE
                    <span className="text-[10px] bg-red-500/30 text-red-300 font-mono font-bold px-2 py-0.5 rounded-full border border-red-400/40">
                      AUTONOMOUS • ZERO-SELECTION
                    </span>
                  </h3>
                </div>
                <p className="text-slate-300 text-[11px] sm:text-xs mt-0.5">
                  AI automatically scans all active disaster zones across India, aggregates local cellular broadcast towers, alerts nearby 108 ambulance fleets, and broadcasts emergency SMS to citizens instantly.
                </p>
              </div>
            </div>

            {/* Quick Controls */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setVoiceAnnouncementEnabled(!voiceAnnouncementEnabled)}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                  voiceAnnouncementEnabled 
                    ? 'bg-blue-600/30 border-blue-400/50 text-blue-200 shadow-xs' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
                title="Toggle automated voice announcement aloud"
              >
                {voiceAnnouncementEnabled ? <Volume2 className="h-3.5 w-3.5 text-blue-400" /> : <VolumeX className="h-3.5 w-3.5 text-slate-400" />}
                <span>Voice Aloud: {voiceAnnouncementEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAutoPilotActive(!autoPilotActive)}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                  autoPilotActive
                    ? 'bg-emerald-600/30 border-emerald-400/50 text-emerald-200'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
                title="When enabled, AI automatically dispatches as soon as hazard threshold trips"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${autoPilotActive ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
                <span>Auto-Pilot: {autoPilotActive ? 'ACTIVE' : 'STANDBY'}</span>
              </button>
            </div>
          </div>

          {/* Real-time Detected Affected Zones Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Active Danger Zones
              </span>
              <div className="text-base sm:text-lg font-black text-amber-400 mt-0.5 flex items-center gap-1.5">
                <AlertOctagon className="h-4 w-4 shrink-0" />
                <span>{affectedZonesList.length} Districts</span>
              </div>
              <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                {affectedZonesList.map(a => a.district).slice(0, 3).join(', ')}...
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Citizens in Hazard Radii
              </span>
              <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5 flex items-center gap-1.5">
                <Users className="h-4 w-4 shrink-0" />
                <span>~{totalAffectedEstCitizens.toLocaleString()}</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Targeting Cellular Channels
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                108 Medical Fleets
              </span>
              <div className="text-base sm:text-lg font-black text-cyan-400 mt-0.5 flex items-center gap-1.5">
                <Stethoscope className="h-4 w-4 shrink-0" />
                <span>{affectedZonesList.length * 3} Units</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Code-Red Triage Standby
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Emergency Response
              </span>
              <div className="text-base sm:text-lg font-black text-purple-400 mt-0.5 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>NDRF + SDRF</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Armed & Fast Deployed
              </span>
            </div>
          </div>

          {/* Voice feedback banner if active */}
          {voiceCommandFeedback && (
            <div className="p-2 bg-blue-500/20 border border-blue-400/40 rounded-lg text-blue-200 text-xs flex items-center gap-2">
              <Mic className="h-4 w-4 text-blue-400 animate-pulse" />
              <span>{voiceCommandFeedback}</span>
            </div>
          )}

          {/* Action Trigger Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
            <button
              type="button"
              disabled={isAutoDispatchingAll}
              onClick={handleAutoDispatchAllAffectedZones}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg border border-red-400/50 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99] disabled:opacity-50"
            >
              {isAutoDispatchingAll ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>DISPATCHING ALERTS TO ALL ZONES...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-white animate-bounce" />
                  <span>⚡ AUTO-DISPATCH ALL AFFECTED ZONES & ANNOUNCE NOW</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleVoiceCommandTrigger}
              className={`py-3 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isMicListening
                  ? 'bg-red-600 text-white border-red-400 animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title="Speak voice command to auto-dispatch in Tamil or English"
            >
              {isMicListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-red-400" />}
              <span>{isMicListening ? 'Listening...' : 'Voice Command'}</span>
            </button>

            {/* Direct State Emergency Operations Centre Phone Link */}
            <button
              type="button"
              onClick={() => setShowSeocModal(true)}
              className="py-3 px-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md border border-red-400 cursor-pointer transition transform active:scale-95 shrink-0"
              title="Auto-link telephone bridge directly to SEOC Disaster Control Desk"
            >
              <Phone className="h-4 w-4 text-amber-300 animate-bounce" />
              <span>📞 Auto-Dial SEOC (1070)</span>
            </button>
          </div>

          {/* Step Progress Display */}
          {isAutoDispatchingAll && (
            <div className="p-3 bg-red-950/70 border border-red-500/40 rounded-lg space-y-1.5 animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold text-red-200">
                <span className="flex items-center gap-2">
                  <Tower className="h-4 w-4 text-red-400 animate-spin" />
                  <span>{autoDispatchStep}</span>
                </span>
                <span className="font-mono text-red-300">Broadcasting...</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 animate-pulse rounded-full w-4/5 transition-all" />
              </div>
            </div>
          )}

          {/* Auto-Dispatch Transmission Success & Audio Replay Card */}
          {autoDispatchSummary && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl space-y-3 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-black text-white text-xs sm:text-sm">
                      AUTONOMOUS BROADCAST SUCCESSFULLY DELIVERED ACROSS {autoDispatchSummary.totalDistricts} DISTRICTS
                    </h4>
                    <p className="text-[11px] text-emerald-200">
                      Dispatched at {autoDispatchSummary.timestamp} • {autoDispatchSummary.totalEstimatedCitizens.toLocaleString()} Citizens Notified • {autoDispatchSummary.totalCellTowers} Cell Towers Activated
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSpeakingAlert(true);
                      voiceAssistant.speak(autoDispatchSummary.voiceAnnouncementTamil, 'ta').then(() => {
                        setIsSpeakingAlert(false);
                      }).catch(() => setIsSpeakingAlert(false));
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>{isSpeakingAlert ? 'Speaking தமிழ்...' : 'Replay Tamil Voice'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSpeakingAlert(true);
                      voiceAssistant.speak(autoDispatchSummary.voiceAnnouncementEnglish, 'en').then(() => {
                        setIsSpeakingAlert(false);
                      }).catch(() => setIsSpeakingAlert(false));
                    }}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Replay English Voice</span>
                  </button>
                </div>
              </div>

              {/* Zones Pill Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px]">
                {autoDispatchSummary.zones.map(z => (
                  <div key={z.incidentId} className="p-2 bg-black/40 border border-emerald-500/30 rounded-lg space-y-1">
                    <div className="flex items-center justify-between font-bold text-white">
                      <span className="truncate">{z.district} ({z.state})</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                        DELIVERED
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-300">
                      {z.hazard} • {z.areaType} Sector • ~{z.estimatedCitizens.toLocaleString()} Residents
                    </div>
                    <div className="text-[9px] text-emerald-300/80 font-mono truncate">
                      {z.smsSnippetTamil}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Incident Selector & Target Configuration (Cols 1-5) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Incident Selector */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                1. Select Active Disaster Incident
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {incidents.length} National Alerts
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {incidents.map(inc => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <button
                    key={inc.id}
                    type="button"
                    onClick={() => {
                      setSelectedIncident(inc);
                      setActiveAreaTab(inc.areaClassification || 'URBAN');
                      setBroadcastRadius(inc.citizenWarning?.affectedRadiusKm || 8);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition cursor-pointer min-h-[44px] ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50/90 text-blue-950 font-bold shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-xs">{inc.locationName}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black shrink-0 ${
                        inc.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inc.severity}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between">
                      <span>{inc.district}, {inc.state || 'Tamil Nadu'}</span>
                      <span className="font-semibold text-blue-800">{inc.disasterType}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Automated Target Configuration */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              2. Automated SMS Target Routing
            </h3>

            {/* A. User Custom Phone Numbers */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-800 block text-[11px] flex items-center justify-between">
                <span>Citizen / Officer Mobile Numbers:</span>
                <span className="text-[10px] text-slate-500 font-normal">SMS auto-sent to all</span>
              </label>

              <div className="space-y-1.5">
                {phoneNumbers.map((phone, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded border border-slate-200">
                    <Phone className="h-3 w-3 text-blue-900 shrink-0" />
                    <span className="font-mono text-slate-900 font-semibold flex-1 text-xs">{phone}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePhone(idx)}
                      disabled={phoneNumbers.length <= 1}
                      className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                      title="Remove number"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Number Input */}
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={newPhoneInput}
                  onChange={e => setNewPhoneInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPhone(); }}}
                  className="flex-1 p-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-blue-900 focus:outline-none min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={handleAddPhone}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold transition flex items-center gap-1 cursor-pointer min-h-[44px]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* B. Nearby Medical Team Automation */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeMedicalTeams}
                  onChange={e => setIncludeMedicalTeams(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-900 focus:ring-blue-900 cursor-pointer"
                />
                <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1">
                  <Stethoscope className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Auto-Dispatch Nearby Medical Team</span>
                </span>
              </label>

              {includeMedicalTeams && (
                <div className="pl-6 space-y-1.5">
                  {nearbyTeams.medicalTeams.map((med, idx) => (
                    <div key={idx} className="p-1.5 bg-emerald-50/70 border border-emerald-200 rounded text-[11px]">
                      <div className="font-bold text-emerald-950">{med.name}</div>
                      <div className="text-[10px] text-emerald-800 flex items-center justify-between mt-0.5">
                        <span>{med.location} ({med.etaMins} mins away)</span>
                        <span className="font-mono font-bold">{med.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* C. Nearby Emergency Response Team Automation */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeResponseTeams}
                  onChange={e => setIncludeResponseTeams(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-900 focus:ring-blue-900 cursor-pointer"
                />
                <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-orange-600" />
                  <span>Auto-Dispatch Emergency Response Force</span>
                </span>
              </label>

              {includeResponseTeams && (
                <div className="pl-6 space-y-1.5">
                  {nearbyTeams.responseTeams.map((resp, idx) => (
                    <div key={idx} className="p-1.5 bg-amber-50/70 border border-amber-200 rounded text-[11px]">
                      <div className="font-bold text-amber-950">{resp.name}</div>
                      <div className="text-[10px] text-amber-800 flex items-center justify-between mt-0.5">
                        <span>{resp.unitType} • {resp.etaMins} mins ETA</span>
                        <span className="font-mono font-bold">{resp.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* D. Cell Tower Radius */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-slate-700 text-[11px]">
                <span>Broadcast Radius:</span>
                <span className="font-bold text-blue-900">{broadcastRadius} km ({simulatedRecipients.toLocaleString()} residents)</span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                value={broadcastRadius}
                onChange={e => setBroadcastRadius(Number(e.target.value))}
                className="w-full cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
              />
            </div>

            {/* Dispatch Action Button */}
            <button
              type="button"
              onClick={handleAutomatedMultiDispatch}
              disabled={isDispatching}
              className="w-full py-3 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white rounded-lg font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 min-h-[48px] text-xs sm:text-sm"
            >
              <Send className="h-4 w-4" />
              <span>{isDispatching ? 'DISPATCHING AUTOMATED SMS...' : 'TRIGGER AUTOMATED SMS DISPATCH NOW'}</span>
            </button>

            {dispatchResult && (
              <div className={`p-2.5 rounded-lg border text-[11px] font-semibold flex items-start gap-2 ${
                dispatchResult.success 
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                  : 'bg-red-50 text-red-900 border-red-200'
              }`}>
                {dispatchResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{dispatchResult.message}</span>
              </div>
            )}

            {/* Direct Mobile Quick Links for Phones */}
            <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-lg space-y-2">
              <div className="font-bold text-blue-950 text-[11px] flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-blue-900" />
                <span>Phone Quick-Send (Tap to open phone messaging):</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={mobileSmsUrl}
                  className="p-2 bg-white hover:bg-slate-50 border border-blue-300 rounded text-center font-bold text-blue-900 text-[11px] flex items-center justify-center gap-1 min-h-[40px] transition"
                >
                  <Phone className="h-3 w-3" />
                  <span>Open SMS App</span>
                </a>
                <a
                  href={mobileWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-center font-bold text-[11px] flex items-center justify-center gap-1 min-h-[40px] transition"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>WhatsApp Alert</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Structured Urban & Rural Message Engine (Cols 6-12) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Area Structure Tabs */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveAreaTab('URBAN')}
                className={`px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 transition cursor-pointer min-h-[38px] ${
                  activeAreaTab === 'URBAN'
                    ? 'bg-white text-blue-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="h-3.5 w-3.5 text-blue-700" />
                <span>Urban Area Structure</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAreaTab('RURAL')}
                className={`px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 transition cursor-pointer min-h-[38px] ${
                  activeAreaTab === 'RURAL' || activeAreaTab === 'HILL_TRIBAL'
                    ? 'bg-white text-emerald-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tractor className="h-3.5 w-3.5 text-emerald-700" />
                <span>Rural Area Structure</span>
              </button>
            </div>

            <span className="text-[10px] text-slate-500 font-mono px-2 py-1 bg-slate-50 rounded border border-slate-200">
              Protocol: {currentStructure.classification}
            </span>
          </div>

          {/* Structured Message Cards: Side-by-Side or Stacked */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* English Structured Card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-900 text-xs">ENGLISH STRUCTURED MESSAGE</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-900 font-bold rounded">EN</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(`${currentStructure.englishHeader}\n\nINSTRUCTIONS:\n${currentStructure.englishInstructions.join('\n')}\n\nSHELTER / SAFEZONE:\n${currentStructure.evacuationPoint}\n\nCONTACT: 108 / 112 / 1077`, false)}
                    className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-[11px] cursor-pointer min-h-[32px] px-1.5 rounded"
                  >
                    {copiedEn ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedEn ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Header */}
                <div className="p-2 bg-red-50 border-l-4 border-red-600 rounded-r text-red-950 font-black text-xs">
                  {currentStructure.englishHeader}
                </div>

                {/* Target Demographics */}
                <div className="text-[11px] text-slate-600">
                  <strong className="text-slate-900">Target Area:</strong> {currentStructure.targetDemographic}
                </div>

                {/* Step-by-Step Instructions */}
                <div>
                  <span className="font-bold text-slate-900 block mb-1 text-[11px]">PRIORITY ACTIONS:</span>
                  <ul className="space-y-1.5">
                    {currentStructure.englishInstructions.map((instruction, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-700 text-[11px] leading-relaxed">
                        <span className="font-bold text-blue-900 shrink-0">[{idx + 1}]</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Safe Point / Shelter */}
                <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px]">
                  <strong className="text-slate-900 block">Designated Assembly / Relief Shelter:</strong>
                  <span className="text-slate-700">{currentStructure.evacuationPoint}</span>
                </div>

                {/* Helplines */}
                <div className="text-[10px] text-slate-500 font-mono">
                  Helplines: Medical: <strong>108</strong> | National Emergency: <strong>112</strong> | District Disaster: <strong>1077</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                Authorized by National / State Disaster Operations Cell
              </div>
            </div>

            {/* Tamil Structured Card */}
            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs space-y-3 flex flex-col justify-between bg-blue-50/15">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-900 text-xs">தமிழ் கட்டமைப்பு செய்தி (TAMIL)</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-900 font-bold rounded">தமிழ்</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(`${currentStructure.tamilHeader}\n\nவழிகாட்டுதல்கள்:\n${currentStructure.tamilInstructions.join('\n')}\n\nபாதுகாப்பு மையம்:\n${currentStructure.evacuationPointTamil}\n\nஅவசர உதவி: 108 / 112 / 1077`, true)}
                    className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-[11px] cursor-pointer min-h-[32px] px-1.5 rounded"
                  >
                    {copiedTa ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedTa ? 'நகலெடுக்கப்பட்டது' : 'நகல்'}</span>
                  </button>
                </div>

                {/* Header */}
                <div className="p-2 bg-red-50 border-l-4 border-red-600 rounded-r text-red-950 font-black text-xs leading-snug">
                  {currentStructure.tamilHeader}
                </div>

                {/* Target Demographics */}
                <div className="text-[11px] text-slate-600">
                  <strong className="text-slate-900">இலக்கு பகுதி:</strong> {currentStructure.targetDemographicTamil}
                </div>

                {/* Step-by-Step Instructions */}
                <div>
                  <span className="font-bold text-slate-900 block mb-1 text-[11px]">உடனடி பாதுகாப்பு நடவடிக்கைகள்:</span>
                  <ul className="space-y-1.5">
                    {currentStructure.tamilInstructions.map((instruction, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-700 text-[11px] leading-relaxed">
                        <span className="font-bold text-emerald-800 shrink-0">[{idx + 1}]</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Safe Point / Shelter */}
                <div className="p-2 bg-blue-50/60 rounded border border-blue-200 text-[11px]">
                  <strong className="text-slate-900 block">பாதுகாப்பு முகாம் / தங்குமிடம்:</strong>
                  <span className="text-slate-800">{currentStructure.evacuationPointTamil}</span>
                </div>

                {/* Helplines */}
                <div className="text-[10px] text-slate-500 font-mono">
                  அவசர எண்கள்: மருத்துவ உதவி: <strong>108</strong> | அவசர கட்டுப்பாடு: <strong>112</strong> | மாவட்ட பேரிடர்: <strong>1077</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-blue-100 text-[10px] text-slate-400">
                தேசிய மற்றும் மாநில பேரிடர் மேலாண்மை ஆணையம்
              </div>
            </div>
          </div>

          {/* Compact SMS Payload Preview Box */}
          <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5" />
                <span>Live SMS Wire Format (GSM 7-bit / Unicode Cell Broadcast):</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Character count: ~180 chars</span>
            </div>
            <pre className="text-[11px] font-mono whitespace-pre-wrap bg-slate-950/80 p-2.5 rounded border border-slate-800 text-emerald-400">
              {compactPayloadTamil}
              {'\n---\n'}
              {compactPayloadEnglish}
            </pre>
          </div>

          {/* Integrated Nearby Hospital Response Component */}
          <NearbyHospitalsResponseCard
            district={selectedIncident?.district || 'Chengalpattu'}
            state={selectedIncident?.state || 'Tamil Nadu'}
            incidentTitle={selectedIncident?.title}
          />
        </div>
      </div>

      {/* SEOC Direct Telephone Bridge Modal */}
      <SeocPhoneBridgeModal
        isOpen={showSeocModal}
        onClose={() => setShowSeocModal(false)}
        district={selectedIncident?.district || 'Chengalpattu'}
        state={selectedIncident?.state || 'Tamil Nadu'}
        incidentTitle={selectedIncident?.title}
        autoDialOnOpen={true}
      />
    </div>
  );
};
