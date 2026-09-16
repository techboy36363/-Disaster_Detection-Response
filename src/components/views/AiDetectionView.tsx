import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Eye,
  PlusCircle,
  FileImage,
  Play,
  Pause,
  RotateCcw,
  Radio,
  Scan,
  Activity,
  Layers,
  PhoneCall,
  ShieldAlert,
  Send,
  Building2
} from 'lucide-react';
import { AlertIncident, DisasterType, AlertSeverity } from '../../types';
import { emergencyAudio } from '../../utils/audioAlert';
import { NearbyHospitalsResponseCard } from '../NearbyHospitalsResponseCard';
import { SeocPhoneBridgeModal } from '../SeocPhoneBridgeModal';

interface AiDetectionViewProps {
  onPromoteToIncident: (newIncident: AlertIncident) => void;
}

interface CameraFeed {
  id: string;
  camCode: string;
  title: string;
  district: string;
  state: string;
  disasterType: DisasterType;
  severity: AlertSeverity;
  confidence: number;
  url: string;
  description: string;
  waterDepthOrDebris: string;
  visualFindings: string[];
  immediateAction: string;
  boundingBoxes: {
    label: string;
    top: string;
    left: string;
    width: string;
    height: string;
    color: string;
  }[];
}

export const AiDetectionView: React.FC<AiDetectionViewProps> = ({
  onPromoteToIncident
}) => {
  // 6 Live Multi-Sector Disaster Surveillance Feeds
  const liveCameras: CameraFeed[] = [
    {
      id: 'cam-01-mudichur',
      camCode: 'CAM-01 [AERIAL DRONE]',
      title: 'Mudichur Residential Inundation Corridor',
      district: 'Chengalpattu',
      state: 'Tamil Nadu',
      disasterType: 'URBAN FLOOD',
      severity: 'CRITICAL',
      confidence: 96,
      url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80',
      description: 'Low-lying residential street showing knee-to-waist deep urban flood waters and stalled vehicles.',
      waterDepthOrDebris: '1.85m Water Level (Exceeds 1.2m critical threshold)',
      visualFindings: [
        '4 passenger sedans submerged up to windshield level',
        'Flood current velocity estimated at 2.4 m/s',
        'Basement ingress observed in 12 apartment structures',
        'TANGEDCO 11kV distribution transformer partially submerged'
      ],
      immediateAction: 'Deploy motorized rescue skiffs and enforce power feeder shutdown on Mudichur sub-station.',
      boundingBoxes: [
        { label: 'Submerged Vehicle (98%)', top: '55%', left: '20%', width: '30%', height: '28%', color: 'border-red-500' },
        { label: 'Critical Water Ingress: 1.8m (96%)', top: '40%', left: '55%', width: '38%', height: '42%', color: 'border-amber-500' }
      ]
    },
    {
      id: 'cam-02-nilgiris',
      camCode: 'CAM-02 [GHAT CCTV]',
      title: 'Coonoor Ghat Section KM-14 Rockfall',
      district: 'The Nilgiris',
      state: 'Tamil Nadu',
      disasterType: 'LANDSLIDE',
      severity: 'HIGH',
      confidence: 94,
      url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=800&auto=format&fit=crop&q=80',
      description: 'Mountain road embankment slope failure with dislodged granite boulders blocking lanes.',
      waterDepthOrDebris: '420 cu.m Rock & Soil Debris Obstruction',
      visualFindings: [
        'High-density debris field spanning 35 meters along hairpin bend 7',
        'Upper retaining wall fractured with active soil slippage',
        'Vehicular transit completely halted in both directions',
        'High risk of secondary slope slide during ongoing rain'
      ],
      immediateAction: 'Divert vehicular traffic to Kotagiri road; dispatch heavy earthmovers and SDRF hill team.',
      boundingBoxes: [
        { label: 'Granite Boulder Debris (97%)', top: '48%', left: '35%', width: '45%', height: '36%', color: 'border-red-500' },
        { label: 'Slope Fracture Zone (91%)', top: '15%', left: '25%', width: '50%', height: '30%', color: 'border-yellow-400' }
      ]
    },
    {
      id: 'cam-03-wayanad',
      camCode: 'CAM-03 [RIVER SENTINEL]',
      title: 'Chooralmala River Bridge & Catchment Sentinel',
      district: 'Wayanad',
      state: 'Kerala',
      disasterType: 'FLASH FLOOD',
      severity: 'CRITICAL',
      confidence: 97,
      url: 'https://images.unsplash.com/photo-1516214104703-d870798883c5?w=800&auto=format&fit=crop&q=80',
      description: 'Fast-surging mud torrent carrying tree trunks and heavy sediment approaching bridge piers.',
      waterDepthOrDebris: '3.4m River Surge Level (1.1m above High Flood Level)',
      visualFindings: [
        'Massive mudflow surge with debris damming near northern abutment',
        'Bridge pier clearance reduced to under 0.6 meters',
        'Riparian bank erosion compromising adjacent tea plantation settlement',
        'High sediment turbidity indicating upstream landslide'
      ],
      immediateAction: 'Evacuate Chooralmala settlement downstream; prohibit all bridge crossings immediately.',
      boundingBoxes: [
        { label: 'High-Turbidity Flash Mudflow (99%)', top: '42%', left: '15%', width: '70%', height: '48%', color: 'border-red-500' },
        { label: 'Abutment Structural Stress (93%)', top: '25%', left: '60%', width: '25%', height: '35%', color: 'border-orange-500' }
      ]
    },
    {
      id: 'cam-04-mumbai',
      camCode: 'CAM-04 [URBAN 4K CAM]',
      title: 'Kurla Low-Lying Transit Corridor & Mithi Overflow',
      district: 'Mumbai',
      state: 'Maharashtra',
      disasterType: 'FLASH FLOOD',
      severity: 'HIGH',
      confidence: 93,
      url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
      description: 'High-density urban road inundated with stormwater runoff overflowing from drainage culverts.',
      waterDepthOrDebris: '1.2m Street Water Inundation',
      visualFindings: [
        'Urban transit bus stranded with passenger evacuation required',
        'Storm drain reverse-surge due to high-tide synchronization',
        'Underground railway subway access stairs flooded',
        'Civic ward pumps operational at maximum capacity'
      ],
      immediateAction: 'Deploy BEST emergency rescue rafts; halt suburban train lines on Kurla slow corridor.',
      boundingBoxes: [
        { label: 'Stranded Transit Vehicle (95%)', top: '38%', left: '28%', width: '42%', height: '40%', color: 'border-red-500' },
        { label: 'Culvert Backflow Zone (89%)', top: '65%', left: '10%', width: '35%', height: '25%', color: 'border-blue-400' }
      ]
    },
    {
      id: 'cam-05-nagapattinam',
      camCode: 'CAM-05 [COASTAL RADAR CAM]',
      title: 'Velankanni Coastal Shore & Surge Barrier',
      district: 'Nagapattinam',
      state: 'Tamil Nadu',
      disasterType: 'COASTAL FLOOD',
      severity: 'HIGH',
      confidence: 95,
      url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
      description: 'Severe gale winds generating crashing swell and saltwater intrusion over promenade.',
      waterDepthOrDebris: '2.8m Wave Height / Sea Surge Ingress',
      visualFindings: [
        'Breaker waves overtopping concrete seawall by 1.4 meters',
        'Fishing craft mooring lines severed along northern wharf',
        'Saltwater intrusion inundating coastal pilgrim road',
        'Wind speed estimated at 65 km/h with rain squalls'
      ],
      immediateAction: 'Enforce coastal exclusion perimeter; relocate fishing hamlets to multi-purpose cyclone shelters.',
      boundingBoxes: [
        { label: 'Wave Overtopping Surge (97%)', top: '30%', left: '18%', width: '65%', height: '52%', color: 'border-red-500' },
        { label: 'Inundated Shore Wharf (92%)', top: '68%', left: '40%', width: '50%', height: '26%', color: 'border-amber-400' }
      ]
    },
    {
      id: 'cam-06-assam',
      camCode: 'CAM-06 [HIGHWAY SURVEILLANCE]',
      title: 'Kaziranga NH-715 River Encroachment Corridor',
      district: 'Golaghat',
      state: 'Assam',
      disasterType: 'FLOOD',
      severity: 'HIGH',
      confidence: 92,
      url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80',
      description: 'Brahmaputra floodwaters overflowing highway culverts onto elevated animal highland corridor.',
      waterDepthOrDebris: '1.45m Highway Water Flow',
      visualFindings: [
        'Sheet flow of floodwater across 1.2km stretch of national highway',
        'Wildlife movement detected moving toward Karbi Anglong hills',
        'Speed restriction barricades submersed',
        'Forest patrol boats operating on roadway'
      ],
      immediateAction: 'Impose vehicle convoy pilotage at 20 km/h; mobilize SDRF water rescue teams.',
      boundingBoxes: [
        { label: 'Overtopping Highway Surface (94%)', top: '50%', left: '20%', width: '60%', height: '35%', color: 'border-red-500' }
      ]
    }
  ];

  // Active Camera State
  const [activeCamIndex, setActiveCamIndex] = useState<number>(0);
  const currentCam = liveCameras[activeCamIndex];

  // Auto-Scan / Automatic Camera Rotation State
  const [isAutoScanning, setIsAutoScanning] = useState<boolean>(true);
  const [scanIntervalSec, setScanIntervalSec] = useState<number>(6);
  const [countdown, setCountdown] = useState<number>(scanIntervalSec);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);

  // Manual Upload State
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [showPhoneBridge, setShowPhoneBridge] = useState<boolean>(false);
  const [promotedSuccessMsg, setPromotedSuccessMsg] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  // Automated Cycling Effect
  useEffect(() => {
    if (!isAutoScanning || customImage) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setCountdown(scanIntervalSec);

    timerRef.current = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Switch to next camera feed automatically!
          setActiveCamIndex(curr => (curr + 1) % liveCameras.length);
          // Play subtle radar chime
          emergencyAudio.playTone('STANDBY_CHIME', 350);
          return scanIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoScanning, scanIntervalSec, customImage, liveCameras.length]);

  // When active camera changes, briefly run vision scan animation
  useEffect(() => {
    setIsAnalyzing(true);
    const timeout = setTimeout(() => {
      setIsAnalyzing(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [activeCamIndex]);

  const handleSelectCamera = (index: number) => {
    setActiveCamIndex(index);
    setCustomImage(null);
    setCountdown(scanIntervalSec);
  };

  const handleToggleAutoScan = () => {
    setIsAutoScanning(prev => !prev);
    if (!isAutoScanning) {
      setCountdown(scanIntervalSec);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCustomImage(reader.result as string);
      setIsAutoScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const handlePromoteCurrentCam = () => {
    const newInc: AlertIncident = {
      id: `INC-VIS-${Date.now().toString().slice(-4)}`,
      title: `${currentCam.disasterType} Detected via AI Vision Feed (${currentCam.camCode})`,
      disasterType: currentCam.disasterType,
      severity: currentCam.severity,
      priorityScore: currentCam.severity === 'CRITICAL' ? 95 : 82,
      riskScore: currentCam.severity === 'CRITICAL' ? 92 : 80,
      detectionConfidence: currentCam.confidence,
      predictionConfidence: 88,
      status: 'AWAITING AUTHORIZATION',
      approval: {
        isApproved: false
      },
      district: currentCam.district,
      state: currentCam.state,
      locationName: currentCam.title,
      latitude: currentCam.district === 'Chengalpattu' ? 12.9249 : 11.4102,
      longitude: currentCam.district === 'Chengalpattu' ? 80.0827 : 76.6950,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evidence: [
        {
          id: `ev-${Date.now()}`,
          source: 'AI Vision',
          description: `AI Vision Analysis: ${currentCam.waterDepthOrDebris}. Findings: ${currentCam.visualFindings.join('; ')}`,
          confidence: currentCam.confidence,
          timestamp: new Date().toLocaleTimeString(),
          freshness: 'FRESH',
          conflicting: false
        }
      ],
      districtAuthority: {
        district: currentCam.district,
        officer: 'District Disaster Management Officer',
        designation: 'District Collector & Magistrate',
        officeAddress: `Collectorate Complex, ${currentCam.district}, ${currentCam.state}`,
        emergencyContact: '044-27427412 / 1077',
        source: 'TNDMA / SDMA Registry',
        lastVerified: 'September 2026',
        isVerified: true
      },
      recommendedDepartments: [
        {
          departmentName: 'State Fire and Rescue Services',
          tamilName: 'தீயணைப்பு மற்றும் மீட்பு பணிகள்',
          role: 'PRIMARY',
          contactChannel: 'VHF Ch-2 / 101 Hotline',
          recommendedAction: currentCam.immediateAction
        },
        {
          departmentName: '108 EMRI Emergency Ambulance & Trauma Care',
          tamilName: '108 அவசர ஆம்புலன்ஸ் மற்றும் தீவிர சிகிச்சை பிரிவு',
          role: 'MEDICAL',
          contactChannel: '108 Direct Hotline',
          recommendedAction: 'Mobilize Advance Life Support (ALS) ambulances to hazard perimeter.'
        }
      ],
      recommendedActions: [
        currentCam.immediateAction,
        'Alert nearby hospitals and trauma casualty centers for code-red preparedness.',
        'Issue cell broadcast SMS to residents within 4.5km hazard perimeter.'
      ],
      prediction: {
        riskLevel: currentCam.severity,
        confidence: currentCam.confidence,
        horizonHours: 6,
        trend: 'INCREASING',
        reasons: ['CCTV visual gauge confirms threshold breached', 'Upstream precipitation active']
      },
      citizenWarning: {
        englishTitle: `EMERGENCY ALERT: ${currentCam.disasterType} IDENTIFIED`,
        englishLocation: `${currentCam.title}, ${currentCam.district}`,
        englishDescription: `Severe hazard detected via field surveillance camera. Evacuate designated low-lying corridors immediately.`,
        tamilTitle: `பேரிடர் அவசர எச்சரிக்கை: ${currentCam.disasterType}`,
        tamilLocation: `${currentCam.title}, ${currentCam.district}`,
        tamilDescription: `கள கண்காணிப்பு கேமரா மூலம் கடுமையான பேரிடர் ஆபத்து கண்டறியப்பட்டுள்ளது. பொதுமக்கள் பாதுகாப்பான இடங்களுக்கு செல்லவும்.`,
        englishWhatToDo: ['Move to first floor or relief center', 'Keep emergency phone line 112 / 1070 accessible'],
        englishWhatNotToDo: ['Do not drive through submerged streets', 'Do not enter cordoned hazard roads'],
        tamilWhatToDo: ['உயரமான இடங்களுக்கு செல்லவும்', 'அவசர உதவி எண் 112 / 1070 ஐ அழைக்கவும்'],
        tamilWhatNotToDo: ['வெள்ள நீரில் இறங்க வேண்டாம்', 'மின் கம்பங்களை தொடாதீர்கள்'],
        affectedRadiusKm: 4.8,
        simulatedRecipientCount: 32000,
        smsStatus: 'READY'
      },
      timeline: [
        {
          id: `tl-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          timestamp: Date.now(),
          title: `AI Vision Auto-Detected ${currentCam.disasterType}`,
          description: `Automatic scanner processed ${currentCam.camCode} with ${currentCam.confidence}% confidence.`,
          agentSource: 'Vision Surveillance Grid'
        }
      ]
    };

    onPromoteToIncident(newInc);
    setPromotedSuccessMsg(`🚨 Promoted ${currentCam.camCode} (${currentCam.disasterType}) to active incident! Nearby hospitals alerted.`);
    emergencyAudio.playNotificationChime();

    setTimeout(() => {
      setPromotedSuccessMsg(null);
    }, 4500);
  };

  return (
    <div className="space-y-5 text-xs">
      {/* Top Banner with Automated Scanning Status */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-900 text-white rounded-xl shadow-xs shrink-0">
            <Camera className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                AI COMPUTER VISION DISASTER DETECTION & LIVE CCTV SCANNER
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                AUTOMATIC SCANNING ACTIVE
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Continuously rotates across CCTV cameras, aerial drones, and highway sensors. Automatically detects flood levels, debris, rockfalls, and notifies nearby trauma hospitals.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Direct Auto-Dial SEOC Hotline */}
          <button
            onClick={() => setShowPhoneBridge(true)}
            className="px-3 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-black rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition"
          >
            <PhoneCall className="h-3.5 w-3.5 text-amber-300 animate-bounce" />
            <span>📞 Auto-Dial SEOC (1070)</span>
          </button>

          {/* Auto-Scan Toggle */}
          <button
            onClick={handleToggleAutoScan}
            className={`px-3 py-2 rounded-lg font-bold border transition flex items-center gap-1.5 cursor-pointer ${
              isAutoScanning 
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' 
                : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
            }`}
          >
            {isAutoScanning ? (
              <>
                <Pause className="h-3.5 w-3.5 text-amber-700" />
                <span>Pause Auto-Scan ({countdown}s)</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-white" />
                <span>Resume Auto-Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress & Speed Strip */}
      <div className="bg-slate-900 text-white p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Scan className="h-4 w-4 text-emerald-400 animate-spin" />
          <span className="font-bold text-slate-200">
            Scanning Feed: <strong className="text-amber-300">{currentCam.camCode}</strong> — {currentCam.title}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Scan Cycle Speed:</span>
            {[3, 6, 10].map(sec => (
              <button
                key={sec}
                onClick={() => {
                  setScanIntervalSec(sec);
                  setCountdown(sec);
                }}
                className={`px-2 py-0.5 rounded font-mono font-bold transition cursor-pointer ${
                  scanIntervalSec === sec 
                    ? 'bg-emerald-500 text-slate-950' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`px-2 py-0.5 rounded font-bold transition cursor-pointer flex items-center gap-1 ${
              showBoundingBoxes ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>AI Bounding Boxes</span>
          </button>
        </div>
      </div>

      {/* Promoted Success Message */}
      {promotedSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-400 text-emerald-950 rounded-xl flex items-center justify-between gap-2 text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{promotedSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setPromotedSuccessMsg(null)}
            className="text-slate-500 hover:text-slate-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Camera Feed Display & Detection Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Col (7 cols): Visual Viewport & Live Stream */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-md relative group">
            {/* Camera Stream Overlay Bar */}
            <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-3 z-20 flex items-center justify-between text-white text-[11px]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-mono font-bold tracking-wider text-red-400">● LIVE FEED</span>
                <span className="text-slate-400">|</span>
                <span className="font-bold text-slate-200">{currentCam.camCode}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-black/50 backdrop-blur font-mono text-[10px] text-amber-300 border border-white/10">
                  {currentCam.district}, {currentCam.state}
                </span>
                <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                  currentCam.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-500 text-black'
                }`}>
                  {currentCam.severity}
                </span>
              </div>
            </div>

            {/* Radar Scanline Animation when analyzing */}
            <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
              <img
                src={customImage || currentCam.url}
                alt={currentCam.title}
                className="w-full h-full object-cover transition-opacity duration-300"
                crossOrigin="anonymous"
              />

              {/* Animated Radar Scanning Line */}
              {isAutoScanning && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,1)] animate-[pulse_2s_infinite] translate-y-12" />
                </div>
              )}

              {/* AI Bounding Boxes */}
              {showBoundingBoxes && !customImage && currentCam.boundingBoxes.map((box, idx) => (
                <div
                  key={idx}
                  style={{
                    top: box.top,
                    left: box.left,
                    width: box.width,
                    height: box.height
                  }}
                  className={`absolute border-2 ${box.color} bg-red-500/10 backdrop-blur-[1px] transition-all duration-300 pointer-events-none flex flex-col justify-start`}
                >
                  <span className="text-[9px] font-mono font-black bg-black/80 text-white px-1.5 py-0.5 self-start rounded-br border-b border-r border-white/20">
                    {box.label}
                  </span>
                </div>
              ))}

              {/* Live Scan Status Pill */}
              <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/15 text-white text-[11px]">
                <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span>Confidence: <strong className="text-emerald-400">{currentCam.confidence}%</strong></span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-300">Target: {currentCam.disasterType}</span>
              </div>

              {/* Countdown Indicator */}
              {isAutoScanning && !customImage && (
                <div className="absolute bottom-3 right-3 z-20 bg-black/80 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-amber-300 border border-amber-400/30">
                  Next Camera in {countdown}s ⟳
                </div>
              )}
            </div>

            {/* Bottom Stream Info */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 text-slate-300 flex items-center justify-between text-[11px]">
              <div>
                <span className="font-bold text-white text-xs block">{currentCam.title}</span>
                <span className="text-slate-400">{currentCam.description}</span>
              </div>
              <button
                onClick={handlePromoteCurrentCam}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition shrink-0 ml-2"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Promote to Incident</span>
              </button>
            </div>
          </div>

          {/* Camera Grid Selector Strip */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-600 text-[11px]">
              <span className="font-bold uppercase tracking-wider">Field Camera Network (Select to Inspect):</span>
              <span className="text-slate-400">{liveCameras.length} Surveillance Nodes Active</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {liveCameras.map((cam, idx) => (
                <div
                  key={cam.id}
                  onClick={() => handleSelectCamera(idx)}
                  className={`p-2 rounded-lg border transition cursor-pointer flex items-center gap-2 ${
                    activeCamIndex === idx && !customImage
                      ? 'border-blue-700 bg-blue-50/80 shadow-xs ring-2 ring-blue-600/30 font-bold'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <img 
                    src={cam.url} 
                    alt={cam.title} 
                    className="h-10 w-12 object-cover rounded shrink-0 border border-slate-200"
                    crossOrigin="anonymous"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-mono text-slate-500">{cam.camCode}</div>
                    <div className="text-[11px] text-slate-900 truncate font-semibold">{cam.district}</div>
                    <div className="text-[9px] text-slate-400 truncate">{cam.disasterType}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Photo Upload Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-800 text-xs block">Inspect Custom Field Photo</span>
              <span className="text-slate-500 text-[11px]">Upload citizen smartphone photo or drone JPG</span>
            </div>
            <label className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-700 cursor-pointer transition flex items-center gap-1.5 shrink-0">
              <Upload className="h-3.5 w-3.5 text-slate-500" />
              <span>Upload Photo</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Right Col (5 cols): AI Vision Findings & Emergency Action */}
        <div className="lg:col-span-5 space-y-4">
          {/* AI Structured Findings Card */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-700" />
                <h3 className="font-black text-slate-900 text-sm">
                  GEMINI VISION ANALYTICS ENGINE
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                {currentCam.confidence}% CERTAINTY
              </span>
            </div>

            {/* Calculated Metrics */}
            <div className="space-y-2">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-950 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-red-700 block">
                  Measured Water Depth / Debris Metric
                </span>
                <span className="text-sm font-black text-red-900 block">
                  {currentCam.waterDepthOrDebris}
                </span>
                <div className="text-[11px] text-red-800">
                  Target Sector: <strong>{currentCam.title}</strong>
                </div>
              </div>

              {/* Key Visual Findings List */}
              <div className="space-y-1.5 pt-1">
                <span className="text-slate-700 font-bold text-xs block">
                  Automated Visual Identifications:
                </span>
                <div className="space-y-1.5">
                  {currentCam.visualFindings.map((finding, idx) => (
                    <div 
                      key={idx}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px] flex items-start gap-2"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Field Command */}
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-950 space-y-1 pt-2">
                <span className="text-[10px] font-mono font-bold uppercase text-blue-700 block flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" />
                  Mandated Immediate Action:
                </span>
                <div className="text-xs font-semibold leading-relaxed">
                  {currentCam.immediateAction}
                </div>
              </div>
            </div>

            {/* Direct Action Trigger Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={handlePromoteCurrentCam}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl font-black text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <PlusCircle className="h-4 w-4 text-amber-300" />
                <span>🚨 PROMOTE TO ACTIVE INCIDENT & MOBILIZE</span>
              </button>

              <button
                onClick={() => setShowPhoneBridge(true)}
                className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 border border-red-300 text-red-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <PhoneCall className="h-3.5 w-3.5 text-red-700" />
                <span>📞 Connect State Emergency Operations Centre (1070)</span>
              </button>
            </div>
          </div>

          {/* Integrated Nearby Hospital Response Component */}
          <NearbyHospitalsResponseCard
            district={currentCam.district}
            state={currentCam.state}
            incidentTitle={currentCam.title}
          />
        </div>
      </div>

      {/* SEOC Direct Telephone Bridge Modal */}
      <SeocPhoneBridgeModal
        isOpen={showPhoneBridge}
        onClose={() => setShowPhoneBridge(false)}
        district={currentCam.district}
        state={currentCam.state}
        incidentTitle={currentCam.title}
        autoDialOnOpen={true}
      />
    </div>
  );
};
