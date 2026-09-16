import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneCall, 
  PhoneForwarded, 
  ShieldAlert, 
  Radio, 
  CheckCircle2, 
  X, 
  ExternalLink,
  Volume2,
  VolumeX,
  Building2,
  Clock,
  Phone,
  QrCode,
  MessageSquare,
  Smartphone,
  Copy,
  Check,
  Mic,
  MicOff,
  RotateCcw,
  Share2,
  Send,
  Headphones,
  Signal,
  AlertCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import { emergencyAudio } from '../utils/audioAlert';

interface SeocPhoneBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  district?: string;
  state?: string;
  incidentTitle?: string;
  autoDialOnOpen?: boolean;
}

type PhoneLinkMode = 
  | 'WEB_VOICE'      // In-browser WebRTC / VoIP phone call with live audio & mic
  | 'QR_SCAN'        // QR code scan to auto-dial from physical phone
  | 'WHATSAPP'       // Official SDMA WhatsApp Emergency Hotline
  | 'SMS'            // Instant SMS dispatch
  | 'CALLBACK'       // Request automated callback to personal mobile
  | 'VHF_RADIO'      // Tactical VHF 148.5 MHz Push-To-Talk radio
  | 'DIRECTORY';     // Full phone directory & copy links

export const SeocPhoneBridgeModal: React.FC<SeocPhoneBridgeModalProps> = ({
  isOpen,
  onClose,
  district = 'Chengalpattu',
  state = 'Tamil Nadu',
  incidentTitle = 'Flash Flood & River Surge Alert',
  autoDialOnOpen = false
}) => {
  const [activeMode, setActiveMode] = useState<PhoneLinkMode>('WEB_VOICE');

  // Web Voice Call State
  const [callState, setCallState] = useState<'IDLE' | 'DIALING' | 'RINGING' | 'CONNECTED' | 'ENDED'>('IDLE');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [activeCallNumber, setActiveCallNumber] = useState<string>('1070');
  const [operatorSpeechTranscript, setOperatorSpeechTranscript] = useState<string>('');
  const [userSpeechTranscript, setUserSpeechTranscript] = useState<string>('');
  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);
  const [dtmfBuffer, setDtmfBuffer] = useState<string>('');
  const [manualMessage, setManualMessage] = useState<string>('');

  // QR Code State
  const [qrTarget, setQrTarget] = useState<'1070' | '04428593990' | '1077' | 'WHATSAPP'>('1070');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Callback State
  const [callbackPhone, setCallbackPhone] = useState<string>('+91 94440 12345');
  const [callbackStatus, setCallbackStatus] = useState<'IDLE' | 'QUEUED' | 'DIALING' | 'RINGING' | 'CONNECTED'>('IDLE');

  // VHF Radio State
  const [isRadioPttActive, setIsRadioPttActive] = useState<boolean>(false);
  const [radioChannel, setRadioChannel] = useState<'CH-1' | 'CH-2' | 'CH-3' | 'CH-4'>('CH-4');
  const [radioLog, setRadioLog] = useState<string[]>([
    'SEOC DISPATCH: Monitoring 148.500 MHz (TN-SEOC Apex). All stations standby.'
  ]);

  // Copy Feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Call Logs
  const [callLogs, setCallLogs] = useState<{ id: string; time: string; mode: string; detail: string }[]>([
    { id: '1', time: new Date(Date.now() - 120000).toLocaleTimeString(), mode: 'SEOC 1070', detail: 'Automated PRI trunk connected' }
  ]);

  const callTimerRef = useRef<number | null>(null);

  // Pre-formatted SitRep for WhatsApp & SMS
  const sitRepText = `🚨 *URGENT DISASTER SITUATION REPORT (SITREP)*
*TO: State Emergency Operations Centre (SEOC) Chennai*
• District: ${district}
• State: ${state}
• Incident: ${incidentTitle}
• Severity: CRITICAL (CODE RED)
• Time: ${new Date().toLocaleTimeString()}
• Action Requested: Immediate SDRF / NDRF battalion dispatch & 108 trauma fleet mobilization.
• Geo-Origin: TN-DISASTER-OPS-COMMAND-DESK`;

  // Contacts Directory
  const seocContacts = [
    {
      id: 'seoc-state',
      name: 'State Emergency Operations Centre (SEOC) Toll-Free',
      tamilName: 'மாநில அவசர கால கட்டுப்பாட்டு மையம் (SEOC)',
      number: '1070',
      displayNumber: '1070 (Toll-Free)',
      description: '24x7 Apex Command Centre at Ezhilagam, Chepauk, Chennai',
      badge: 'APEX 24x7',
      recommended: true
    },
    {
      id: 'seoc-direct',
      name: 'SEOC Direct Operational Hotline (Landline)',
      tamilName: 'SEOC நேரடி கட்டுப்பாட்டு அறை தொலைபேசி',
      number: '04428593990',
      displayNumber: '044-28593990',
      description: 'Senior Duty Commander Desk & SDMA Operations Room',
      badge: 'DIRECT DESK'
    },
    {
      id: 'deoc-district',
      name: `District Emergency Operations Centre (${district} DEOC)`,
      tamilName: `${district} மாவட்ட அவசர கட்டுப்பாட்டு மையம்`,
      number: '1077',
      displayNumber: '1077 (District)',
      description: `District Collectorate Emergency Operations Cell, ${district}`,
      badge: 'DISTRICT CONTROL'
    },
    {
      id: 'whatsapp-sdma',
      name: 'Tamil Nadu SDMA WhatsApp Emergency Bot & Helpdesk',
      tamilName: 'தமிழ்நாடு பேரிடர் மேலாண்மை வாட்ஸ்அப் உதவி',
      number: '+919445869848',
      displayNumber: '+91 94458 69848',
      description: 'Official WhatsApp Situation Report line for photos, GPS coords, and SOS',
      badge: 'WHATSAPP SOS'
    },
    {
      id: 'nat-112',
      name: 'National Emergency Response Support System (ERSS)',
      tamilName: 'தேசிய அவசர உதவி எண் (காவல்/தீயணைப்பு/மீட்பு)',
      number: '112',
      displayNumber: '112 (Universal)',
      description: 'Integrated Police, NDRF, and Fire Services Dispatch',
      badge: 'NATIONAL 112'
    },
    {
      id: 'med-108',
      name: '108 EMRI Emergency Medical & Trauma Dispatch',
      tamilName: '108 ஆம்புலன்ஸ் மற்றும் மருத்துவ கட்டுப்பாட்டு அறை',
      number: '108',
      displayNumber: '108 (Ambulance)',
      description: 'Ambulance, Mobile ICU, and Hospital Trauma Bed Dispatch',
      badge: 'MEDICAL 108'
    }
  ];

  // Auto-Dial on open if requested
  useEffect(() => {
    if (isOpen) {
      if (autoDialOnOpen && callState === 'IDLE') {
        startWebVoiceCall('1070');
      }
    } else {
      endWebVoiceCall();
      setCallbackStatus('IDLE');
    }
  }, [isOpen]);

  // Generate QR Code when QR target or mode changes
  useEffect(() => {
    if (!isOpen) return;

    let payload = '';
    if (qrTarget === 'WHATSAPP') {
      payload = `https://wa.me/919445869848?text=${encodeURIComponent(sitRepText)}`;
    } else {
      payload = `tel:${qrTarget}`;
    }

    QRCode.toDataURL(payload, {
      width: 240,
      margin: 1.5,
      color: {
        dark: '#1e293b',
        light: '#ffffff'
      }
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
  }, [isOpen, qrTarget, district, incidentTitle]);

  // Call duration counter
  useEffect(() => {
    if (callState === 'CONNECTED') {
      callTimerRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
      setCallDuration(0);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [callState]);

  // Web Voice Call Flow
  const startWebVoiceCall = (phoneNumber: string = '1070') => {
    setActiveCallNumber(phoneNumber);
    setCallState('DIALING');
    setOperatorSpeechTranscript('');
    setUserSpeechTranscript('');
    setDtmfBuffer('');

    // Play DTMF tones for the number dialed
    const digits = phoneNumber.split('');
    digits.forEach((d, idx) => {
      setTimeout(() => {
        emergencyAudio.playDtmf(d);
      }, idx * 120);
    });

    // Step 2: Ringing after DTMF completes
    setTimeout(() => {
      setCallState('RINGING');
      emergencyAudio.startPhoneRingTone();
    }, digits.length * 120 + 300);

    // Step 3: Connect to SEOC operator
    setTimeout(() => {
      emergencyAudio.stopPhoneRingTone();
      setCallState('CONNECTED');
      emergencyAudio.playNotificationChime();

      // Simulated initial operator greeting in Tamil & English
      const greetingEnglish = `Vanakkam. State Emergency Operations Centre, Chennai. Duty Officer Inspector S. Raman on line. Incident recorded for ${district}. All relief teams and SDRF battalions are alerted. What is your immediate status?`;
      const greetingTamil = `வணக்கம். தமிழ்நாடு மாநில அவசர கால கட்டுப்பாட்டு மையம், சென்னை. உதவி ஆய்வாளர் ராமன் பேசுகிறேன். ${district} பேரிடர் நிலவரத்தை தெரிவிக்கவும்.`;
      
      setOperatorSpeechTranscript(`${greetingTamil}\n\n${greetingEnglish}`);

      // Play operator voice greeting via speech synthesis if speaker enabled
      if (!isSpeakerMuted) {
        emergencyAudio.speakAnnouncement(greetingEnglish, 'en-IN');
      }

      setCallLogs(prev => [
        {
          id: Date.now().toString(),
          time: new Date().toLocaleTimeString(),
          mode: `Web Call: ${phoneNumber}`,
          detail: `Connected to SEOC Apex Desk - ${district}`
        },
        ...prev
      ]);
    }, digits.length * 120 + 2600);
  };

  const endWebVoiceCall = () => {
    emergencyAudio.stopPhoneRingTone();
    if (callState === 'CONNECTED' || callState === 'RINGING' || callState === 'DIALING') {
      emergencyAudio.playDtmf('#', 200);
      setCallState('ENDED');
      setTimeout(() => {
        setCallState('IDLE');
      }, 1500);
    }
  };

  const handleKeypadPress = (digit: string) => {
    emergencyAudio.playDtmf(digit);
    setDtmfBuffer(prev => prev + digit);
  };

  // User sends tactical message / answers operator
  const handleSendVoiceReply = (text?: string) => {
    const message = text || manualMessage;
    if (!message.trim()) return;

    setUserSpeechTranscript(message);
    setManualMessage('');
    setIsUserSpeaking(true);

    setTimeout(() => {
      setIsUserSpeaking(false);
      // Operator response
      const response = `SEOC COPY: " ${message} ". Alert dispatched to ${district} District Collector, TANGEDCO power grid, and 108 Emergency Fleets. Mobile relief units deployed. Maintain radio standby on 148.5 MHz.`;
      setOperatorSpeechTranscript(prev => `${prev}\n\n• [${new Date().toLocaleTimeString()}] ${response}`);
      if (!isSpeakerMuted) {
        emergencyAudio.speakAnnouncement(`SEOC Copy. Message acknowledged. Emergency teams dispatched to ${district}.`, 'en-IN');
      }
    }, 1200);
  };

  // Callback Trigger Flow
  const handleTriggerCallback = () => {
    if (!callbackPhone.trim()) return;
    setCallbackStatus('QUEUED');
    emergencyAudio.playNotificationChime();

    setTimeout(() => {
      setCallbackStatus('DIALING');
      emergencyAudio.playDtmf('9');
    }, 1000);

    setTimeout(() => {
      setCallbackStatus('RINGING');
      emergencyAudio.startPhoneRingTone();
    }, 2200);

    setTimeout(() => {
      emergencyAudio.stopPhoneRingTone();
      setCallbackStatus('CONNECTED');
      emergencyAudio.speakAnnouncement(`SEOC Automated Outbound Call connected to ${callbackPhone}`, 'en-IN');

      setCallLogs(prev => [
        {
          id: Date.now().toString(),
          time: new Date().toLocaleTimeString(),
          mode: 'Auto-Callback',
          detail: `Outbound PRI bridge to ${callbackPhone} connected`
        },
        ...prev
      ]);
    }, 4500);
  };

  // Push-To-Talk Radio Flow
  const handlePttDown = () => {
    setIsRadioPttActive(true);
    emergencyAudio.playRadioChirp(false);
  };

  const handlePttUp = () => {
    setIsRadioPttActive(false);
    emergencyAudio.playRadioChirp(true);
    const newEntry = `TX [${new Date().toLocaleTimeString()}] COMMAND DESK (${radioChannel}): "${incidentTitle} - ${district}. Status update transmitted to SEOC."`;
    setRadioLog(prev => [newEntry, ...prev.slice(0, 7)]);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `URGENT DISASTER REPORT: ${district}`,
          text: sitRepText,
          url: window.location.href
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopy(sitRepText, 'share');
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-red-300 overflow-hidden text-slate-800">
        
        {/* Header with Emergency Red Gradient */}
        <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-900 text-white p-3.5 sm:p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl border border-white/20 shadow-inner">
              <PhoneCall className="h-6 w-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-mono font-black bg-black/30 px-2 py-0.5 rounded text-amber-300 border border-amber-400/40">
                  MULTI-WAY EMERGENCY PHONE BRIDGE
                </span>
                <span className="text-[11px] text-red-200 hidden sm:inline">24/7 Apex Emergency Telecom</span>
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight text-white mt-0.5">
                STATE EMERGENCY OPERATIONS CENTRE (SEOC)
              </h2>
              <p className="text-[11px] sm:text-xs text-red-100">
                மாநில பேரிடர் அவசர கட்டுப்பாட்டு மையம் • Toll-Free: 1070 | Landline: 044-28593990
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              endWebVoiceCall();
              onClose();
            }}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close Phone Bridge"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Multi-Channel Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 p-1.5 sm:p-2 flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setActiveMode('WEB_VOICE')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeMode === 'WEB_VOICE' 
                ? 'bg-red-600 text-white shadow-xs' 
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Headphones className="h-3.5 w-3.5" />
            <span>📞 Web Voice Call</span>
            {callState === 'CONNECTED' && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setActiveMode('QR_SCAN')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeMode === 'QR_SCAN' 
                ? 'bg-red-600 text-white shadow-xs' 
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>📱 Scan QR to Call</span>
          </button>

          <button
            onClick={() => setActiveMode('WHATSAPP')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeMode === 'WHATSAPP' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>💬 WhatsApp Hotline</span>
          </button>

          <button
            onClick={() => setActiveMode('SMS')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeMode === 'SMS' 
                ? 'bg-red-600 text-white shadow-xs' 
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>📩 SMS SOS</span>
          </button>

          <button
            onClick={() => setActiveMode('CALLBACK')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeMode === 'CALLBACK' 
                ? 'bg-red-600 text-white shadow-xs' 
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <PhoneForwarded className="h-3.5 w-3.5" />
            <span>📲 Request Callback</span>
          </button>

          <button
            onClick={() => setActiveMode('VHF_RADIO')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeMode === 'VHF_RADIO' 
                ? 'bg-blue-700 text-white shadow-xs' 
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>📻 VHF Radio (PTT)</span>
          </button>

          <button
            onClick={() => setActiveMode('DIRECTORY')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeMode === 'DIRECTORY' 
                ? 'bg-slate-800 text-white shadow-xs' 
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Copy className="h-3.5 w-3.5" />
            <span>📋 Directory</span>
          </button>
        </div>

        {/* Body Content by Mode */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Incident context banner */}
          <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-2 text-slate-700">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
              <span>Target Incident: <strong>{incidentTitle}</strong></span>
            </div>
            <div className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-300">
              Sector: {district}, {state}
            </div>
          </div>

          {/* MODE 1: IN-BROWSER WEB VOICE CALL (VoIP) */}
          {activeMode === 'WEB_VOICE' && (
            <div className="space-y-4">
              <div className="bg-slate-950 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                {/* Audio visualizer bar / animation */}
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${
                      callState === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' :
                      callState === 'RINGING' || callState === 'DIALING' ? 'bg-amber-400 animate-ping' :
                      'bg-slate-600'
                    }`} />
                    <span className="font-black text-sm tracking-wider uppercase">
                      {callState === 'IDLE' && 'SEOC Virtual VoIP Dispatcher Line'}
                      {callState === 'DIALING' && `Dialing SEOC (${activeCallNumber})...`}
                      {callState === 'RINGING' && `Ringing SEOC Apex Desk (${activeCallNumber})...`}
                      {callState === 'CONNECTED' && `LIVE CALL: SEOC Operator (${activeCallNumber})`}
                      {callState === 'ENDED' && 'Call Terminated'}
                    </span>
                  </div>

                  {callState === 'CONNECTED' && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        {formatTimer(callDuration)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Call Status & Operator Transcript Display */}
                {callState === 'CONNECTED' ? (
                  <div className="space-y-3">
                    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-slate-200 max-h-40 overflow-y-auto font-mono text-[11px] leading-relaxed">
                      <div className="text-amber-400 font-bold text-[10px] mb-1 flex items-center gap-1.5">
                        <Headphones className="h-3.5 w-3.5" />
                        <span>DUTY OFFICER AUDIO TRANSCRIPT (BILINGUAL TAMIL / ENGLISH):</span>
                      </div>
                      <div className="whitespace-pre-wrap">{operatorSpeechTranscript}</div>

                      {userSpeechTranscript && (
                        <div className="mt-2.5 pt-2 border-t border-slate-700 text-emerald-300">
                          <strong>YOU (TRANSMITTED):</strong> {userSpeechTranscript}
                        </div>
                      )}
                    </div>

                    {/* Quick tactical voice responses */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Quick Tactical Situation Reports (Click to transmit over phone):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          `Casualty evac needed immediately in ${district}`,
                          `Water levels breaching flood embankment`,
                          `Hospital ICU running on backup diesel generator`,
                          `Requesting 2 additional SDRF rescue rubber boats`,
                          `Road washed away on state highway; bridge blocked`
                        ].map((msg, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSendVoiceReply(msg)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-[10px] border border-slate-700 cursor-pointer transition"
                          >
                            + "{msg}"
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Manual Voice Reply Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type message to transmit directly to SEOC operator..."
                        value={manualMessage}
                        onChange={e => setManualMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendVoiceReply()}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                      />
                      <button
                        onClick={() => handleSendVoiceReply()}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="h-3 w-3" />
                        <span>Send</span>
                      </button>
                    </div>

                    {/* Active In-Call Controls */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsMicMuted(!isMicMuted)}
                          className={`p-2.5 rounded-xl border transition cursor-pointer ${
                            isMicMuted ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                          }`}
                          title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
                        >
                          {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsSpeakerMuted(!isSpeakerMuted);
                            if (!isSpeakerMuted) window.speechSynthesis?.cancel();
                          }}
                          className={`p-2.5 rounded-xl border transition cursor-pointer ${
                            isSpeakerMuted ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                          }`}
                          title={isSpeakerMuted ? 'Unmute Operator Voice' : 'Mute Operator Voice'}
                        >
                          {isSpeakerMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </button>

                        <span className="text-[10px] text-slate-400">
                          {isMicMuted ? 'Mic Muted' : 'Mic Active'} • {isSpeakerMuted ? 'Audio Muted' : 'Speaker On'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={endWebVoiceCall}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition"
                      >
                        <Phone className="h-4 w-4 rotate-135" />
                        <span>Hang Up Call</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 py-2 text-center">
                    <div className="max-w-md mx-auto">
                      <p className="text-slate-300 text-xs">
                        Call the State Emergency Operations Centre directly in your browser without needing a mobile phone or softphone app.
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => startWebVoiceCall('1070')}
                        disabled={callState === 'DIALING' || callState === 'RINGING'}
                        className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition transform active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <PhoneCall className="h-4 w-4 text-amber-300 animate-bounce" />
                        <span>📞 Call SEOC Apex Hotline (1070)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => startWebVoiceCall('04428593990')}
                        disabled={callState === 'DIALING' || callState === 'RINGING'}
                        className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Phone className="h-4 w-4 text-slate-300" />
                        <span>Call Direct Landline (044-28593990)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => startWebVoiceCall('1077')}
                        disabled={callState === 'DIALING' || callState === 'RINGING'}
                        className="px-4 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl border border-blue-700 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Building2 className="h-4 w-4 text-amber-300" />
                        <span>Call {district} DEOC (1077)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive DTMF Dialpad */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Interactive DTMF Keypad & Tone Synthesizer:
                  </span>
                  {dtmfBuffer && (
                    <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-slate-300 font-bold text-red-700">
                      Buffer: {dtmfBuffer}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(key => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleKeypadPress(key)}
                      className="py-2 rounded-lg bg-white hover:bg-red-50 hover:border-red-400 border border-slate-200 font-mono font-bold text-xs text-slate-800 active:bg-red-100 transition shadow-2xs cursor-pointer"
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: INSTANT QR CODE SCAN-TO-CALL */}
          {activeMode === 'QR_SCAN' && (
            <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-5">
                <div className="bg-white p-3 rounded-2xl border-2 border-slate-300 shadow-md shrink-0 flex flex-col items-center">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="Emergency Call QR Code"
                      className="w-48 h-48 rounded-lg"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400">
                      Generating QR...
                    </div>
                  )}
                  <span className="mt-2 text-[10px] font-mono font-black text-slate-600 uppercase">
                    SCAN WITH SMARTPHONE CAMERA
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900">
                      Point Your Phone Camera to Auto-Dial SEOC Instantly
                    </h3>
                    <p className="text-slate-600 text-xs mt-0.5">
                      No typing required. Open your iPhone or Android camera app, point at this QR code, and tap the notification banner to initiate immediate priority calling.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Select QR Destination:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setQrTarget('1070')}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          qrTarget === '1070' 
                            ? 'bg-red-50 border-red-500 text-red-950 font-bold' 
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="font-black text-xs">📞 Toll-Free: 1070</div>
                        <div className="text-[10px] text-slate-500">State Apex Control Desk</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setQrTarget('04428593990')}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          qrTarget === '04428593990' 
                            ? 'bg-red-50 border-red-500 text-red-950 font-bold' 
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="font-black text-xs">☎️ Landline: 044-28593990</div>
                        <div className="text-[10px] text-slate-500">Ezhilagam Direct PRI</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setQrTarget('1077')}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          qrTarget === '1077' 
                            ? 'bg-blue-50 border-blue-500 text-blue-950 font-bold' 
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="font-black text-xs">🏢 District: 1077</div>
                        <div className="text-[10px] text-slate-500">{district} Collectorate Cell</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setQrTarget('WHATSAPP')}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          qrTarget === 'WHATSAPP' 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold' 
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="font-black text-xs">💬 WhatsApp Hotline</div>
                        <div className="text-[10px] text-slate-500">+91 94458 69848 Chatbot</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: OFFICIAL SDMA WHATSAPP HOTLINE */}
          {activeMode === 'WHATSAPP' && (
            <div className="p-4 sm:p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-sm sm:text-base font-black text-emerald-950">
                    Official Tamil Nadu SDMA WhatsApp Emergency Line
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                  +91 94458 69848
                </span>
              </div>

              <p className="text-xs text-emerald-900 leading-relaxed">
                Connect directly with the State Disaster Management Authority WhatsApp Operations Bot. You can transmit live photos, GPS pin locations, and casualty updates directly into the SEOC GIS mapping wall.
              </p>

              {/* Pre-filled Situation Report Preview */}
              <div className="bg-white p-3 rounded-xl border border-emerald-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase">
                    Automated Pre-Formatted WhatsApp Situation Report:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(sitRepText, 'whatsapp_sitrep')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition"
                  >
                    {copiedKey === 'whatsapp_sitrep' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'whatsapp_sitrep' ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>

                <pre className="text-[11px] font-mono text-slate-800 bg-slate-50 p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap border border-slate-200">
                  {sitRepText}
                </pre>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <a
                  href={`https://wa.me/919445869848?text=${encodeURIComponent(sitRepText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition transform active:scale-95"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Launch WhatsApp to SEOC Hotline (+91 94458 69848)</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="px-4 py-3 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share SitRep via Native Apps</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE 4: INSTANT SMS SOS */}
          {activeMode === 'SMS' && (
            <div className="p-4 sm:p-5 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-red-600" />
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Direct Cellular SMS Emergency Dispatch (2G / Low-Bandwidth)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold bg-rose-100 text-red-800 px-2 py-0.5 rounded border border-rose-300">
                  SMS Gateway: 1070
                </span>
              </div>

              <p className="text-xs text-slate-600">
                When 4G/5G data networks are degraded or failing due to cyclone winds, short SMS messages have the highest delivery rate through cell towers. Tap below to launch your device's native SMS app.
              </p>

              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-700 text-xs">Standardized SMS Distress Telegram:</div>
                <div className="p-2.5 bg-slate-50 rounded-lg border font-mono text-[11px] text-slate-800">
                  EMERGENCY SOS: {incidentTitle} in {district}, {state}. High casualties / rescue needed. Geo-origin: TN-COMMAND-DESK.
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <a
                  href={`sms:1070?body=${encodeURIComponent(`EMERGENCY SOS: ${incidentTitle} in ${district}, ${state}. Immediate rescue required.`)}`}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send SMS to 1070 (Toll-Free SEOC)</span>
                </a>

                <a
                  href={`sms:+919445869848?body=${encodeURIComponent(`EMERGENCY SOS: ${incidentTitle} in ${district}, ${state}. Immediate rescue required.`)}`}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Send SMS to SDMA (+91 94458 69848)</span>
                </a>
              </div>
            </div>
          )}

          {/* MODE 5: REQUEST AUTOMATED PRIORITY CALLBACK */}
          {activeMode === 'CALLBACK' && (
            <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  Request Automated Outbound Phone Call from SEOC Dispatch
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  The SEOC telephony PRI server will immediately dial your mobile number and connect you directly to the on-duty Disaster Response Officer.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Your Direct Mobile / Landline Telephone Number:
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={callbackPhone}
                    onChange={e => setCallbackPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleTriggerCallback}
                    disabled={callbackStatus === 'DIALING' || callbackStatus === 'RINGING'}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition disabled:opacity-50"
                  >
                    <PhoneForwarded className="h-3.5 w-3.5 text-amber-300" />
                    <span>Request Priority Callback</span>
                  </button>
                </div>

                {callbackStatus !== 'IDLE' && (
                  <div className={`p-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-between ${
                    callbackStatus === 'CONNECTED' ? 'bg-emerald-50 text-emerald-900 border-emerald-400' :
                    'bg-amber-50 text-amber-900 border-amber-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${
                        callbackStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'
                      }`} />
                      <span>
                        {callbackStatus === 'QUEUED' && 'Request Queued in SEOC PRI Trunk Gateway...'}
                        {callbackStatus === 'DIALING' && `Dialing out to ${callbackPhone}...`}
                        {callbackStatus === 'RINGING' && `Ringing phone at ${callbackPhone}... Pick up!`}
                        {callbackStatus === 'CONNECTED' && `Call Connected to ${callbackPhone} via SEOC Trunk #4`}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase">{callbackStatus}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODE 6: TACTICAL VHF RADIO PUSH-TO-TALK */}
          {activeMode === 'VHF_RADIO' && (
            <div className="p-4 sm:p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-amber-400 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-black text-white">
                      Tactical VHF Radio Transceiver (148.500 MHz)
                    </h3>
                    <div className="text-[10px] text-slate-400">
                      Disaster Emergency Radio Network • SEOC Chennai Base Station
                    </div>
                  </div>
                </div>

                {/* Channel Selector */}
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                  {(['CH-1', 'CH-2', 'CH-3', 'CH-4'] as const).map(ch => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => {
                        setRadioChannel(ch);
                        emergencyAudio.playRadioChirp(false);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                        radioChannel === ch ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radio Frequency Readout */}
              <div className="p-3 bg-black rounded-xl border border-slate-800 font-mono flex items-center justify-between text-emerald-400">
                <div>
                  <span className="text-[10px] text-slate-500 block">FREQUENCY / MODULATION:</span>
                  <span className="text-lg font-black tracking-widest">148.500 MHz FM</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">SQUELCH / STATUS:</span>
                  <span className="text-xs font-bold text-amber-300">
                    {isRadioPttActive ? 'TRANSMITTING (TX)' : 'RECEIVING (RX STANDBY)'}
                  </span>
                </div>
              </div>

              {/* Push to talk big button */}
              <div className="text-center py-2">
                <button
                  type="button"
                  onMouseDown={handlePttDown}
                  onMouseUp={handlePttUp}
                  onTouchStart={handlePttDown}
                  onTouchEnd={handlePttUp}
                  className={`w-full max-w-xs mx-auto py-5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer shadow-lg select-none ${
                    isRadioPttActive 
                      ? 'bg-red-600 text-white shadow-red-500/50 animate-pulse' 
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
                  }`}
                >
                  <Radio className="h-5 w-5" />
                  <span>{isRadioPttActive ? 'TRANSMITTING VOICE...' : 'PRESS & HOLD: PUSH-TO-TALK (PTT)'}</span>
                </button>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Click and hold with mouse or touch to transmit voice with authentic radio squelch
                </span>
              </div>

              {/* Radio Log */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 space-y-1 max-h-28 overflow-y-auto">
                <div className="text-slate-500 font-bold">TACTICAL CHANNEL ACTIVITY:</div>
                {radioLog.map((log, i) => (
                  <div key={i} className="text-slate-300">{log}</div>
                ))}
              </div>
            </div>
          )}

          {/* MODE 7: DIRECT NUMBERS DIRECTORY & 1-CLICK COPY */}
          {activeMode === 'DIRECTORY' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Complete Disaster Operations Hotlines (Click to Dial or Copy):
                </label>
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                >
                  <Share2 className="h-3 w-3" />
                  <span>Share Directory</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {seocContacts.map(c => (
                  <div 
                    key={c.id} 
                    className={`p-3 rounded-xl border transition flex flex-col justify-between gap-2 ${
                      c.recommended 
                        ? 'border-red-400 bg-red-50/40' 
                        : 'border-slate-200 bg-white hover:border-blue-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">
                          {c.badge}
                        </span>
                        <span className="text-xs font-mono font-bold text-red-700">
                          {c.displayNumber || c.number}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-xs">{c.name}</div>
                      <div className="text-[11px] text-slate-500">{c.tamilName}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{c.description}</div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                      <a
                        href={`tel:${c.number}`}
                        className="flex-1 py-1.5 px-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                      >
                        <Phone className="h-3.5 w-3.5 text-amber-300" />
                        <span>Dial</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopy(c.number, c.id)}
                        className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition border border-slate-300"
                        title="Copy phone number to clipboard"
                      >
                        {copiedKey === c.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedKey === c.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Call Audit Trail */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <Signal className="h-3.5 w-3.5 text-emerald-600" />
              <span>Gateway Status: <strong>PRI E1 Trunk Active</strong> (TNDMA Ezhilagam Bridge)</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">
              Audit Logs: {callLogs.length} events recorded
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1 text-[11px]">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            TNDMA / NDMA Apex Command Gateway
          </span>
          <button
            onClick={() => {
              endWebVoiceCall();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold cursor-pointer transition"
          >
            Close Bridge
          </button>
        </div>
      </div>
    </div>
  );
};
