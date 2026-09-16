import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Loader2, 
  Languages, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Radio,
  RotateCcw,
  Zap,
  CheckCircle2,
  Users,
  ShieldAlert,
  Stethoscope
} from 'lucide-react';
import { AlertIncident } from '../../types';
import { voiceAssistant } from '../../utils/voiceAssistant';
import { autoDispatchAllAffectedZones, AutoDispatchSummary } from '../../utils/smsDispatchService';
import { emergencyAudio } from '../../utils/audioAlert';

interface AiCopilotViewProps {
  incidents: AlertIncident[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language?: 'ta' | 'en';
  isAutoDispatchCard?: boolean;
  dispatchSummary?: AutoDispatchSummary;
}

export const AiCopilotView: React.FC<AiCopilotViewProps> = ({ incidents }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'வணக்கம் / Welcome to the India National AI Disaster Management System & Voice Copilot. I monitor disaster alerts across all 28 Indian States and 8 UTs. You can ask me questions in தமிழ் or English, or simply tap "⚡ Auto-Dispatch All Affected Zones" to automatically broadcast emergency SMS and mobilize 108 medical ambulances and rescue forces without selecting contacts manually.',
      timestamp: new Date().toLocaleTimeString(),
      language: 'en'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'ta' | 'en'>('ta');
  const [isListening, setIsListening] = useState(false);
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechMessageId, setActiveSpeechMessageId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const quickQuestions = [
    '⚡ Auto-Dispatch All Affected Zones & Citizen Alerts Now (பாதிக்கப்பட்ட பகுதிகளுக்கு தானியங்கி SMS)',
    'What is the highest risk disaster right now in India?',
    'செங்கல்பட்டு மற்றும் முடிச்சூர் வெள்ளத்திற்கு அவசர உதவி எண்கள் என்ன?',
    'Send automated SMS to nearby medical team and emergency response team.',
    'Wayanad landslide evacuation route and NDRF deployment status.',
    'நகர்ப்புற மற்றும் கிராமப்புற பகுதிகளுக்கு என்ன மாதிரி SMS எச்சரிக்கை அனுப்ப வேண்டும்?'
  ];


  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      voiceAssistant.stopSpeaking();
      voiceAssistant.stopListening();
    };
  }, []);

  const handleSpeakText = (text: string, msgId: string, lang?: 'ta' | 'en') => {
    if (isSpeaking && activeSpeechMessageId === msgId) {
      voiceAssistant.stopSpeaking();
      setIsSpeaking(false);
      setActiveSpeechMessageId(null);
      return;
    }

    voiceAssistant.stopSpeaking();
    setIsSpeaking(true);
    setActiveSpeechMessageId(msgId);

    const targetLang = lang || (voiceAssistant.isTamilText(text) ? 'ta' : 'en');
    voiceAssistant.speak(text, targetLang);

    // Watch for speech end
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const checkEnd = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsSpeaking(false);
          setActiveSpeechMessageId(null);
          clearInterval(checkEnd);
        }
      }, 300);
    }
  };

  const toggleMicListening = () => {
    if (isListening) {
      voiceAssistant.stopListening();
      setIsListening(false);
      return;
    }

    const success = voiceAssistant.startListening({
      language: selectedLanguage,
      onResult: (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          setIsListening(false);
          handleSendMessage(transcript);
        }
      },
      onError: (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (success) {
      setIsListening(true);
    } else {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or an Android Webview.');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    // Detect language of query
    const isTamil = voiceAssistant.isTamilText(query) || selectedLanguage === 'ta';
    const detectedLang: 'ta' | 'en' = isTamil ? 'ta' : 'en';

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString(),
      language: detectedLang
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    // Fast Check: If query indicates auto-dispatching alerts/SMS to all affected zones
    const qLower = query.toLowerCase();
    const isAutoDispatchIntent = 
      (qLower.includes('sms') || qLower.includes('alert') || qLower.includes('dispatch') || qLower.includes('citizen') || qLower.includes('send') || qLower.includes('broadcast')) &&
      (qLower.includes('zone') || qLower.includes('district') || qLower.includes('affected') || qLower.includes('all') || qLower.includes('auto') || qLower.includes('people') || qLower.includes('fast') || qLower.includes('itself')) ||
      qLower.includes('தானியங்கி') || qLower.includes('அனுப்பு') || qLower.includes('பாதிக்கப்பட்ட') || qLower.includes('செய்தி');

    if (isAutoDispatchIntent) {
      try {
        // 1. Play immediate audio alert chime
        emergencyAudio.playTone('STANDBY_CHIME', 1.2);

        // 2. Autonomous multi-zone dispatch
        const summary = await autoDispatchAllAffectedZones(incidents);
        const botMsgId = (Date.now() + 1).toString();

        const summaryText = detectedLang === 'ta'
          ? `🚨 **பாதிக்கப்பட்ட அனைத்து பகுதிகளுக்கும் தானியங்கி SMS மற்றும் எச்சரிக்கை அனுப்பப்பட்டது!**\n\nமொத்தம் **${summary.totalDistricts} மாவட்டங்கள்** (${summary.zones.map(z => z.district).join(', ')}) கண்டறியப்பட்டு, சுமார் **${summary.totalEstimatedCitizens.toLocaleString()} மக்களுக்கு** அவசர SMS மற்றும் செல் பிராட்காஸ்ட் அனுப்பப்பட்டுள்ளது.\n\n- 🚑 **108 ஆம்புலன்ஸ் குழுக்கள்:** ${summary.totalMedicalUnits} பிரிவுகள் தயார்\n- 🚒 **தேசிய மற்றும் மாநில மீட்புப் படைகள்:** ${summary.totalResponseUnits} பிரிவுகள் விரைந்துள்ளன\n- 📡 **செயல்படுத்தப்பட்ட செல் டவர்கள்:** ${summary.totalCellTowers} டவர்கள்\n\nஅவசர உதவிக்கு 112 அல்லது 108 ஐ அழைக்கவும்.`
          : `🚨 **EMERGENCY CITIZEN ALERTS & SMS AUTONOMOUSLY BROADCAST TO ALL AFFECTED ZONES!**\n\nDetected **${summary.totalDistricts} active disaster districts** (${summary.zones.map(z => z.district).join(', ')}). High-priority emergency broadcast successfully delivered to approximately **${summary.totalEstimatedCitizens.toLocaleString()} residents** in hazard zones.\n\n- 🚑 **108 Medical Ambulance Fleets:** ${summary.totalMedicalUnits} units mobilized\n- 🚒 **NDRF & SDRF Rescue Forces:** ${summary.totalResponseUnits} battalions deployed\n- 📡 **Active Cellular Towers Triangulated:** ${summary.totalCellTowers} towers\n\nCitizens are directed to follow designated high-ground routes. Emergency line: 112 / 108.`;

        const botMsg: ChatMessage = {
          id: botMsgId,
          sender: 'assistant',
          text: summaryText,
          timestamp: new Date().toLocaleTimeString(),
          language: detectedLang,
          isAutoDispatchCard: true,
          dispatchSummary: summary
        };

        setMessages(prev => [...prev, botMsg]);

        // 3. AI Voice Assistant immediately speaks aloud the emergency broadcast
        if (isVoiceOutputEnabled) {
          const speechText = detectedLang === 'ta' ? summary.voiceAnnouncementTamil : summary.voiceAnnouncementEnglish;
          setTimeout(() => {
            handleSpeakText(speechText, botMsgId, detectedLang);
          }, 200);
        }
        return;
      } catch (e) {
        console.error('Auto dispatch in copilot failed:', e);
      } finally {
        setIsLoading(false);
      }
    }

    try {
      const resp = await fetch('/api/ai/copilot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          message: query,
          language: detectedLang === 'ta' ? 'Tamil' : 'English',
          conversationHistory: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text
          }))
        })
      });

      let reply = '';
      if (resp.ok) {
        const data = await resp.json();
        reply = data.answer || data.reply || '';
      }

      // If backend failed or empty, fallback to rich offline voice knowledge engine
      if (!reply) {
        reply = voiceAssistant.getEmergencyAnswer(query, detectedLang);
      }

      const botMsgId = (Date.now() + 1).toString();
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString(),
        language: detectedLang
      };

      setMessages(prev => [...prev, botMsg]);

      // Speak aloud if voice output enabled
      if (isVoiceOutputEnabled) {
        setTimeout(() => {
          handleSpeakText(reply, botMsgId, detectedLang);
        }, 150);
      }
    } catch (err) {
      // Fallback to local rule engine
      const fallbackReply = voiceAssistant.getEmergencyAnswer(query, detectedLang);
      const botMsgId = (Date.now() + 1).toString();
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'assistant',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString(),
        language: detectedLang
      };

      setMessages(prev => [...prev, botMsg]);
      if (isVoiceOutputEnabled) {
        setTimeout(() => {
          handleSpeakText(fallbackReply, botMsgId, detectedLang);
        }, 150);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Top Banner Card */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bot className="h-5 w-5 text-blue-900 shrink-0" />
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              INDIA NATIONAL AI DISASTER COPILOT & BILINGUAL VOICE ASSISTANT
            </h2>
          </div>
          <p className="text-slate-500 text-[11px] sm:text-xs">
            Interactive voice & text commander supporting English and தமிழ் across all Indian states, with automated SMS dispatch guidance.
          </p>
        </div>

        {/* Voice Assistant Controls & Language Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedLanguage('ta')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer min-h-[34px] ${
                selectedLanguage === 'ta'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              தமிழ் (Tamil)
            </button>
            <button
              type="button"
              onClick={() => setSelectedLanguage('en')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer min-h-[34px] ${
                selectedLanguage === 'en'
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>

          {/* Loud Voice Output Mute/Unmute */}
          <button
            type="button"
            onClick={() => {
              const next = !isVoiceOutputEnabled;
              setIsVoiceOutputEnabled(next);
              if (!next) {
                voiceAssistant.stopSpeaking();
                setIsSpeaking(false);
              }
            }}
            className={`p-2 rounded-lg border flex items-center gap-1 font-bold text-[11px] cursor-pointer min-h-[38px] transition ${
              isVoiceOutputEnabled
                ? 'bg-blue-50 text-blue-900 border-blue-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
            title={isVoiceOutputEnabled ? 'Loud voice output active' : 'Voice output muted'}
          >
            {isVoiceOutputEnabled ? (
              <>
                <Volume2 className="h-4 w-4 text-blue-900" />
                <span className="hidden sm:inline">Voice ON</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                <span className="hidden sm:inline">Muted</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1-Tap Autonomous Dispatch Quick Trigger */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-3 sm:p-4 rounded-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-red-400/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/20 rounded-lg shrink-0">
            <Zap className="h-5 w-5 fill-white text-white animate-bounce" />
          </div>
          <div>
            <div className="font-black text-xs sm:text-sm tracking-wide flex items-center gap-2">
              <span>⚡ AUTONOMOUS CITIZEN ALERT & SMS DISPATCH</span>
              <span className="text-[10px] bg-black/30 text-amber-300 font-mono px-2 py-0.5 rounded-full">
                ZERO SELECTION NEEDED
              </span>
            </div>
            <div className="text-[11px] text-red-100">
              AI automatically detects all affected disaster zones across India, triangulates cell towers, alerts 108 medical ambulances, and broadcasts emergency SMS to citizens.
            </div>
          </div>
        </div>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleSendMessage('⚡ Auto-Dispatch All Affected Zones & Citizen Alerts Now (பாதிக்கப்பட்ட பகுதிகளுக்கு தானியங்கி SMS)')}
          className="px-4 py-2.5 bg-white hover:bg-red-50 text-red-700 font-black text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition transform active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
        >
          <Zap className="h-4 w-4 fill-red-600 text-red-600" />
          <span>⚡ AUTO-DISPATCH ALL NOW</span>
        </button>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-slate-400 font-bold text-[11px] shrink-0">Quick Queries:</span>
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-slate-700 whitespace-nowrap cursor-pointer transition text-[11px] font-medium shadow-2xs min-h-[34px]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat & Voice Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[520px]">
        {/* Messages Stream */}
        <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5">
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            const isCurrentlySpeakingThis = isSpeaking && activeSpeechMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 max-w-[90%] sm:max-w-[82%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-white shrink-0 text-xs shadow-xs ${
                  isUser ? 'bg-slate-900' : 'bg-blue-900'
                }`}>
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-amber-300" />}
                </div>

                <div className="space-y-1">
                  <div className={`p-3 sm:p-3.5 rounded-xl leading-relaxed text-xs shadow-2xs ${
                    isUser 
                      ? 'bg-blue-900 text-white rounded-tr-none' 
                      : msg.isAutoDispatchCard
                        ? 'bg-slate-900 text-white border-2 border-red-500/80 rounded-tl-none space-y-3'
                        : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none whitespace-pre-wrap'
                  }`}>
                    {msg.isAutoDispatchCard && (
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center gap-1.5 font-black text-amber-400 text-xs">
                          <Zap className="h-4 w-4 fill-amber-400" />
                          <span>AUTONOMOUS DISPATCH CONFIRMATION</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] rounded border border-emerald-500/40 font-bold">
                          CELL TOWERS DELIVERED
                        </span>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {msg.isAutoDispatchCard && msg.dispatchSummary && (
                      <div className="pt-2 border-t border-white/10 space-y-2">
                        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                          Districts Triangulated ({msg.dispatchSummary.zones.length} Zones):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px]">
                          {msg.dispatchSummary.zones.map(z => (
                            <div key={z.incidentId} className="p-1.5 bg-white/5 border border-white/10 rounded flex items-center justify-between">
                              <span className="font-bold text-slate-200">{z.district}</span>
                              <span className="text-emerald-400 font-mono">~{z.estimatedCitizens.toLocaleString()} alerted</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center gap-2 text-[10px] text-slate-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>

                    {/* Speaker Button on Assistant Messages */}
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleSpeakText(msg.text, msg.id, msg.language)}
                        className={`p-1 rounded hover:bg-slate-200 transition cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center ${
                          isCurrentlySpeakingThis ? 'text-blue-900 font-bold bg-blue-100' : 'text-slate-500'
                        }`}
                        title={isCurrentlySpeakingThis ? 'Stop speaking' : 'Read aloud in loud voice'}
                      >
                        {isCurrentlySpeakingThis ? (
                          <Radio className="h-3.5 w-3.5 animate-pulse text-red-600" />
                        ) : (
                          <Volume2 className="h-3.5 w-3.5" />
                        )}
                        <span className="ml-1 text-[10px]">{isCurrentlySpeakingThis ? 'Speaking...' : 'Listen'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs p-2 bg-slate-50 rounded border border-slate-100">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span>Analyzing National Disaster Management database, weather radars, and medical rosters...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Voice Listening Active Indicator Bar */}
        {isListening && (
          <div className="px-4 py-2 bg-red-500 text-white flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 font-bold text-xs">
              <Mic className="h-4 w-4 text-white" />
              <span>Listening for voice in {selectedLanguage === 'ta' ? 'தமிழ்' : 'English'}... Speak now!</span>
            </div>
            <button
              type="button"
              onClick={toggleMicListening}
              className="px-2 py-0.5 bg-white text-red-700 rounded font-black text-[11px] cursor-pointer"
            >
              Stop
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-2.5 sm:p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
          {/* Voice Microphone Button */}
          <button
            type="button"
            onClick={toggleMicListening}
            className={`p-2.5 rounded-lg border flex items-center justify-center transition cursor-pointer min-h-[44px] min-w-[44px] ${
              isListening
                ? 'bg-red-600 text-white border-red-700 shadow-md ring-4 ring-red-200 animate-pulse'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
            title={isListening ? 'Stop recording voice' : 'Speak to Copilot (Tamil or English)'}
          >
            {isListening ? <MicOff className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5 text-blue-900" />}
          </button>

          {/* Text Input Field */}
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder={
              selectedLanguage === 'ta'
                ? "குரலில் பேசவும் அல்லது தமிழில் கேட்கவும் (எ.கா. அவசர SMS, 108 ஆம்புலன்ஸ், நிவாரண முகாம்கள்)..."
                : "Ask query in English or தமிழ் (e.g. Mudichur flood, Wayanad landslide, send automated SMS)..."
            }
            className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none text-slate-800 min-h-[44px]"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs min-h-[44px]"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
