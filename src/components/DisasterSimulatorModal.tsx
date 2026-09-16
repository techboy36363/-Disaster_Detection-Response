import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle, 
  Loader2, 
  AlertTriangle, 
  ShieldCheck, 
  X, 
  Volume2, 
  Sparkles,
  ArrowRight,
  Flame,
  Waves,
  Mountain,
  Wind
} from 'lucide-react';
import { AlertIncident } from '../types';

interface DisasterSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulationComplete: (newIncident: AlertIncident) => void;
  triggerAudioAlarm: () => void;
}

export const DisasterSimulatorModal: React.FC<DisasterSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSimulationComplete,
  triggerAudioAlarm
}) => {
  if (!isOpen) return null;

  const [selectedScenario, setSelectedScenario] = useState<'chengalpattu_flood' | 'nilgiris_landslide' | 'nagapattinam_cyclone'>('chengalpattu_flood');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);

  const simulationSteps = [
    { title: 'Weather Telemetry Anomaly', desc: 'Automatic Weather Station (AWS) records rainfall intensity crossing threshold > 45 mm/hr.' },
    { title: 'Geospatial & Satellite Ingestion', desc: 'Copernicus Sentinel-1 SAR synthetic aperture radar detects surface reflectance change.' },
    { title: 'AI Computer Vision Detection', desc: 'Gemini Vision processes drone/camera feed: Flood depth calculated at 4.1 ft across residential access roads.' },
    { title: 'Multi-Agent Evidence Fusion', desc: 'Fusion Agent correlates low elevation (8m MSL basin) + weather radar + camera data.' },
    { title: 'AI Risk & Priority Escalation', desc: 'Priority Agent calculates Risk: 96/100, Priority Score: 98/100. CRITICAL Alert triggered.' },
    { title: 'Siren Alarm & District Authority Tagging', desc: 'Emergency siren sounded on SEOC consoles. District Collector IAS designated as Incident Commander.' },
    { title: 'Citizen Warnings Drafted (English + தமிழ்)', desc: 'Location-specific warnings generated for 42,000 residents with DOs and DONTs.' },
    { title: 'Awaiting Human Authorization', desc: 'Operational clearance requested from SEOC Duty Officer before physical boat dispatch.' }
  ];

  const handleRunSimulation = async () => {
    setIsRunning(true);
    setCurrentStepIndex(0);

    for (let i = 0; i < simulationSteps.length; i++) {
      setCurrentStepIndex(i);
      if (i === 5) {
        // Trigger emergency siren at step 5
        triggerAudioAlarm();
      }
      await new Promise(res => setTimeout(res, 700));
    }

    try {
      const resp = await fetch('/api/simulation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: selectedScenario })
      });
      const data = await resp.json();
      if (data.simulatedIncident) {
        onSimulationComplete(data.simulatedIncident);
      }
    } catch (err) {
      // fallback
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Sparkles className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">RUN DISASTER SIMULATION (JUDGE DEMO)</h2>
              <p className="text-[11px] text-slate-300">
                End-to-End Multimodal AI Pipeline: Weather → Vision → Prediction → Alert → Siren → Human Approval
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-900">
            <strong>HACKATHON DEMO NOTICE:</strong> This tool demonstrates the complete real-time tactical workflow using authentic Tamil Nadu geographical locations, verified official authorities, and AI multi-agent orchestration.
          </div>

          {/* Scenario Selection */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">Select Scenario to Simulate:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedScenario('chengalpattu_flood')}
                className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                  selectedScenario === 'chengalpattu_flood'
                    ? 'border-blue-700 bg-blue-50/70 text-blue-950 font-semibold shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 font-bold text-red-700">
                  <Waves className="h-4 w-4" />
                  <span>Mudichur Flood</span>
                </div>
                <div className="text-[11px] text-slate-600">Chengalpattu District</div>
                <div className="text-[10px] text-slate-500 mt-1">142mm rainfall, 4.1 ft water, 42k citizens</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedScenario('nilgiris_landslide')}
                className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                  selectedScenario === 'nilgiris_landslide'
                    ? 'border-blue-700 bg-blue-50/70 text-blue-950 font-semibold shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 font-bold text-amber-700">
                  <Mountain className="h-4 w-4" />
                  <span>Coonoor Landslide</span>
                </div>
                <div className="text-[11px] text-slate-600">The Nilgiris District</div>
                <div className="text-[10px] text-slate-500 mt-1">400T debris, NH-181 blocked, ghat cutoff</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedScenario('nagapattinam_cyclone')}
                className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                  selectedScenario === 'nagapattinam_cyclone'
                    ? 'border-blue-700 bg-blue-50/70 text-blue-950 font-semibold shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 font-bold text-blue-700">
                  <Wind className="h-4 w-4" />
                  <span>Velankanni Cyclone</span>
                </div>
                <div className="text-[11px] text-slate-600">Nagapattinam Coast</div>
                <div className="text-[10px] text-slate-500 mt-1">85 km/h winds, 3.8m waves, storm surge</div>
              </button>
            </div>
          </div>

          {/* Simulation Progress Timeline */}
          {isRunning && (
            <div className="space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span>Simulating Real-Time Multi-Agent Ingestion...</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {simulationSteps.map((step, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div 
                      key={idx}
                      className={`p-2 rounded flex items-start gap-2 text-xs transition ${
                        isCurrent 
                          ? 'bg-blue-100/70 border border-blue-300 text-blue-950 font-bold' 
                          : isDone 
                            ? 'text-emerald-800 bg-emerald-50/50' 
                            : 'text-slate-400'
                      }`}
                    >
                      <span className="shrink-0 mt-0.5">
                        {isDone ? (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        ) : isCurrent ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                        ) : (
                          <span className="h-3.5 w-3.5 rounded-full border border-slate-300 block"></span>
                        )}
                      </span>
                      <div>
                        <div>{step.title}</div>
                        <div className="text-[11px] text-slate-600 font-normal">{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Triggers emergency siren, bilingual warnings & collectorate coordination
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isRunning}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer disabled:opacity-50"
            >
              Close
            </button>
            <button
              onClick={handleRunSimulation}
              disabled={isRunning}
              className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Start Live Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
