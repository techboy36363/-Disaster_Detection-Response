import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  UserCheck, 
  Building, 
  AlertTriangle, 
  FileText, 
  Send, 
  Edit3, 
  CheckCircle2, 
  XCircle,
  Truck,
  HeartPulse,
  Radio,
  ExternalLink,
  Phone,
  Eye,
  Sliders
} from 'lucide-react';
import { AlertIncident, UserSession } from '../types';

interface AlertModalProps {
  alert: AlertIncident | null;
  onClose: () => void;
  onAuthorize: (incidentId: string, operatorNotes?: string) => Promise<void>;
  onReject: (incidentId: string, reason: string) => Promise<void>;
  onModify: (incidentId: string, newPriority: number) => Promise<void>;
  onTriggerSmsDispatch: (alert: AlertIncident) => Promise<void>;
  currentUser: UserSession;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  alert,
  onClose,
  onAuthorize,
  onReject,
  onModify,
  onTriggerSmsDispatch,
  currentUser
}) => {
  if (!alert) return null;

  const [activeTab, setActiveTab] = useState<'evidence' | 'authority' | 'response' | 'citizen' | 'timeline'>('evidence');
  const [showConfirmAuthorize, setShowConfirmAuthorize] = useState(false);
  const [operatorNotes, setOperatorNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifiedPriority, setModifiedPriority] = useState(alert.priorityScore);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [smsSending, setSmsSending] = useState(false);
  const [smsSentNotice, setSmsSentNotice] = useState(false);

  const isCritical = alert.severity === 'CRITICAL';
  const isHigh = alert.severity === 'HIGH';
  const isAwaitingAuth = alert.status === 'AWAITING AUTHORIZATION';
  const isAuthorized = alert.status === 'AUTHORIZED' || !!alert.approval?.isApproved;

  const handleConfirmAuth = async () => {
    setIsAuthorizing(true);
    try {
      await onAuthorize(alert.id, operatorNotes);
      setShowConfirmAuthorize(false);
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleConfirmReject = async () => {
    try {
      await onReject(alert.id, rejectReason);
      setShowRejectModal(false);
      onClose();
    } catch {
      // handle error
    }
  };

  const handleConfirmModify = async () => {
    try {
      await onModify(alert.id, modifiedPriority);
      setShowModifyModal(false);
    } catch {
      // handle error
    }
  };

  const handleSendCitizenSms = async () => {
    setSmsSending(true);
    try {
      await onTriggerSmsDispatch(alert);
      setSmsSentNotice(true);
      setTimeout(() => setSmsSentNotice(false), 5000);
    } finally {
      setSmsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className={`px-6 py-4 flex items-start justify-between gap-4 border-b ${
          isCritical ? 'bg-red-50 border-red-200' : isHigh ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-xs font-black text-white ${
                isCritical ? 'bg-red-600' : isHigh ? 'bg-orange-600' : 'bg-amber-600'
              }`}>
                {alert.severity} ALERT
              </span>
              <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                Incident ID: {alert.id}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                isAuthorized ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {alert.status}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              {alert.title}
            </h2>
            <div className="text-xs text-slate-600 font-medium">
              Location: <strong>{alert.locationName}</strong> | District:{' '}
              <strong>{alert.district}</strong> {alert.taluk ? `(Taluk: ${alert.taluk})` : ''} | Coordinates: {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Priority & Metrics Strip */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Priority Score</span>
            <div className="text-base font-black text-slate-900">{alert.priorityScore} / 100</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Detection Confidence</span>
            <div className="text-base font-black text-blue-700">{alert.detectionConfidence}%</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Prediction Confidence</span>
            <div className="text-base font-black text-indigo-700">{alert.predictionConfidence}%</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Human Authorization</span>
            <div className="text-base font-black text-slate-900">
              {isAuthorized ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> AUTHORIZED
                </span>
              ) : (
                <span className="text-amber-700 flex items-center gap-1">
                  <UserCheck className="h-4 w-4" /> REQUIRED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-1 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'evidence' ? 'border-blue-900 text-blue-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Evidence & Fusion
          </button>
          <button
            onClick={() => setActiveTab('authority')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'authority' ? 'border-blue-900 text-blue-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            District Authority
          </button>
          <button
            onClick={() => setActiveTab('response')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'response' ? 'border-blue-900 text-blue-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Who Will Respond?
          </button>
          <button
            onClick={() => setActiveTab('citizen')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'citizen' ? 'border-blue-900 text-blue-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Citizen Alerts (EN + தமிழ்)
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'timeline' ? 'border-blue-900 text-blue-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Incident Timeline
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
          {/* TAB 1: EVIDENCE & FUSION */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Multi-Agent Corroborating Evidence ({alert.evidence.length} Sources)
                </h3>
                {alert.hasConflictingEvidence && (
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> ⚠️ CONFLICTING EVIDENCE - Field Verification Recommended
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {alert.evidence.map(item => (
                  <div 
                    key={item.id}
                    className={`p-3.5 rounded-lg border text-xs flex flex-col justify-between ${
                      item.conflicting 
                        ? 'bg-amber-50/70 border-amber-200' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-black uppercase">
                            {item.source}
                          </span>
                          {item.indicatorValue && (
                            <span className="text-slate-700 font-semibold">{item.indicatorValue}</span>
                          )}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.freshness}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Confidence: {item.confidence}%</span>
                      <span>Recorded: {item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Prediction Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-blue-950 text-sm flex items-center gap-1.5">
                    <span>AI Risk Prediction Engine</span>
                    <span className="px-2 py-0.2 rounded bg-blue-200 text-blue-900 font-bold text-[10px]">
                      Horizon: Next {alert.prediction.horizonHours} Hours
                    </span>
                  </div>
                  <span className="text-blue-900 font-bold">Trend: {alert.prediction.trend}</span>
                </div>
                <ul className="space-y-1 text-slate-700 list-disc list-inside">
                  {alert.prediction.reasons.map((reason, idx) => (
                    <li key={idx} className="leading-normal">{reason}</li>
                  ))}
                </ul>
              </div>

              {/* Recommended Actions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Recommended Tactical Interventions
                </h4>
                <div className="space-y-1.5">
                  {alert.recommendedActions.map((action, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-start gap-2 text-xs text-slate-800">
                      <span className="h-4 w-4 rounded-full bg-blue-100 text-blue-800 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DISTRICT AUTHORITY */}
          {activeTab === 'authority' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-900" />
                    <h3 className="font-bold text-slate-900 text-base">
                      Responsible District Authority: {alert.district} District
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Official TNDMA Registry
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-white rounded border border-slate-200">
                    <span className="text-slate-500 font-medium">Designated Head</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {alert.districtAuthority.officer}
                    </div>
                    <div className="text-xs text-slate-600">{alert.districtAuthority.designation}</div>
                  </div>

                  <div className="p-3 bg-white rounded border border-slate-200">
                    <span className="text-slate-500 font-medium">Emergency Contact Line</span>
                    <div className="text-sm font-bold text-blue-900 mt-0.5 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {alert.districtAuthority.emergencyContact}
                    </div>
                    <div className="text-xs text-slate-500">Toll-free District Disaster Control Room (1077)</div>
                  </div>

                  <div className="p-3 bg-white rounded border border-slate-200 sm:col-span-2">
                    <span className="text-slate-500 font-medium">Collectorate Office Address</span>
                    <div className="text-xs font-semibold text-slate-800 mt-0.5">
                      {alert.districtAuthority.officeAddress}
                    </div>
                    <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Source: {alert.districtAuthority.source}</span>
                      <span>Verified: {alert.districtAuthority.lastVerified}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <strong>Notice:</strong> Responsible District Collector is the statutory Incident Commander under Section 30 of the Disaster Management Act, 2005. All operational dispatches require Collectorate clearance.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHO WILL RESPOND? */}
          {activeTab === 'response' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Designated Emergency Departments for {alert.disasterType}
                </h3>
                <span className="text-xs text-slate-500">Tamil Nadu Incident Command Hierarchy</span>
              </div>

              <div className="space-y-3">
                {alert.recommendedDepartments.map((dept, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          dept.role === 'PRIMARY' ? 'bg-red-600 text-white' :
                          dept.role === 'SUPPORTING' ? 'bg-blue-600 text-white' :
                          dept.role === 'TRAFFIC_CONTROL' ? 'bg-amber-600 text-white' :
                          dept.role === 'MEDICAL' ? 'bg-emerald-600 text-white' :
                          'bg-slate-700 text-white'
                        }`}>
                          {dept.role.replace('_', ' ')}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{dept.departmentName}</h4>
                      </div>
                      <span className="text-slate-500 text-[11px] font-medium">{dept.tamilName}</span>
                    </div>

                    <div className="mt-2 text-slate-700">
                      <span className="font-semibold text-slate-900">Mandated Task: </span>
                      {dept.recommendedAction}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200 text-slate-500 flex items-center justify-between text-[11px]">
                      <span>Comms Channel: <strong className="text-slate-800">{dept.contactChannel}</strong></span>
                      <span className="text-emerald-700 font-semibold">Simulated Ready</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CITIZEN ALERTS */}
          {activeTab === 'citizen' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-blue-900">Geographic Warning Zone</div>
                  <div className="text-slate-600">
                    Radius: <strong>{alert.citizenWarning?.affectedRadiusKm} km</strong> | Estimated Residents:{' '}
                    <strong>{(alert.citizenWarning?.simulatedRecipientCount || 0).toLocaleString()}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendCitizenSms}
                    disabled={smsSending}
                    className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{smsSending ? 'Dispatching...' : 'Simulate Cell Broadcast'}</span>
                  </button>
                </div>
              </div>

              {smsSentNotice && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-md font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Cellular warning broadcast queued for {(alert.citizenWarning?.simulatedRecipientCount || 0).toLocaleString()} mobile endpoints in {alert.district} sector.</span>
                </div>
              )}

              {/* Side by side English and Tamil warnings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* English Warning */}
                <div className="p-4 rounded-lg border border-slate-200 bg-white text-xs space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-slate-900 text-sm">English Citizen Warning</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">EN</span>
                  </div>

                  <div className="font-bold text-red-700 text-sm">
                    {alert.citizenWarning?.englishTitle}
                  </div>
                  <p className="text-slate-700 leading-relaxed">{alert.citizenWarning?.englishDescription}</p>

                  <div>
                    <span className="font-bold text-emerald-700 block mb-1">WHAT TO DO:</span>
                    <ul className="space-y-1 text-slate-700 list-disc list-inside">
                      {alert.citizenWarning?.englishWhatToDo.map((todo, i) => (
                        <li key={i}>{todo}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-red-700 block mb-1">DO NOT:</span>
                    <ul className="space-y-1 text-slate-700 list-disc list-inside">
                      {alert.citizenWarning?.englishWhatNotToDo.map((nottodo, i) => (
                        <li key={i}>{nottodo}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tamil Warning */}
                <div className="p-4 rounded-lg border border-slate-200 bg-white text-xs space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-slate-900 text-sm">தமிழ் குடிமக்கள் எச்சரிக்கை (Tamil)</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px]">தமிழ்</span>
                  </div>

                  <div className="font-bold text-red-700 text-sm">
                    {alert.citizenWarning?.tamilTitle}
                  </div>
                  <p className="text-slate-700 leading-relaxed">{alert.citizenWarning?.tamilDescription}</p>

                  <div>
                    <span className="font-bold text-emerald-700 block mb-1">செய்ய வேண்டியவை:</span>
                    <ul className="space-y-1 text-slate-700 list-disc list-inside">
                      {alert.citizenWarning?.tamilWhatToDo.map((todo, i) => (
                        <li key={i}>{todo}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-red-700 block mb-1">செய்யக் கூடாதவை:</span>
                    <ul className="space-y-1 text-slate-700 list-disc list-inside">
                      {alert.citizenWarning?.tamilWhatNotToDo.map((nottodo, i) => (
                        <li key={i}>{nottodo}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Incident Lifecycle Timeline
              </h3>
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
                {alert.timeline.map((event, idx) => (
                  <div key={event.id || idx} className="relative">
                    <div className="absolute -left-[31px] top-0.5 h-3.5 w-3.5 rounded-full bg-blue-600 border-2 border-white"></div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-blue-900 font-mono">{event.time}</span>
                      <span>{event.title}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-normal">
                        {event.agentSource}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Authorization Controls */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          {/* Authorization Status / Info */}
          <div>
            {isAuthorized ? (
              <div className="text-xs text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>
                  <strong>Authorized by:</strong> {alert.approval?.authorizedBy} (
                  {new Date(alert.approval?.authorizedAt || '').toLocaleTimeString()})
                </span>
              </div>
            ) : (
              <div className="text-xs text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>
                  <strong>Human Authorization Required:</strong> AI recommendations require formal clearance before deployment.
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isAuthorized && (
              <>
                <button
                  onClick={() => setShowModifyModal(true)}
                  className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition flex items-center gap-1"
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Modify</span>
                </button>

                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-3 py-1.5 rounded-md border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold cursor-pointer transition flex items-center gap-1"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => setShowConfirmAuthorize(true)}
                  className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>AUTHORIZE ACTION</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer transition"
            >
              Close
            </button>
          </div>
        </div>

        {/* Confirmation Modal for Authorization (Prompt Section 13) */}
        {showConfirmAuthorize && (
          <div className="fixed inset-0 z-60 bg-slate-900/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 text-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b pb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>AUTHORIZE RESPONSE ACTION</span>
              </div>

              <div className="space-y-1.5 text-slate-700">
                <div>Incident: <strong>{alert.disasterType}</strong></div>
                <div>Location: <strong>{alert.locationName}</strong></div>
                <div>District: <strong>{alert.district}</strong></div>
                <div>Priority Score: <strong className="text-red-700">{alert.priorityScore} / 100</strong></div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-slate-800">
                <span className="font-bold text-blue-900 block mb-1">AI Recommendation:</span>
                Initiate district-level verification and coordinate emergency response resources ({alert.recommendedDepartments.map(d => d.departmentName.split(' ')[0]).join(', ')}).
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Operator Orders / Notes (Optional):</label>
                <textarea
                  value={operatorNotes}
                  onChange={e => setOperatorNotes(e.target.value)}
                  placeholder="e.g. Cleared for SDRF 1st Bn rubber boat deployment. Tahsildar to monitor low-lying evacuation."
                  rows={2}
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowConfirmAuthorize(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAuth}
                  disabled={isAuthorizing}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold cursor-pointer disabled:opacity-50"
                >
                  {isAuthorizing ? 'Authorizing...' : 'AUTHORIZE'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject / Downgrade Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-60 bg-slate-900/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 text-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b pb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span>REJECT / SCALE DOWN ALERT</span>
              </div>
              <p className="text-slate-600">
                Downgrading this alert will transition it to MONITORING and reduce priority score.
              </p>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason for Downgrade:</label>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="e.g. Ground inspection confirms water has receded."
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div className="pt-2 border-t flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold cursor-pointer"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modify Priority Modal */}
        {showModifyModal && (
          <div className="fixed inset-0 z-60 bg-slate-900/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 text-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b pb-2">
                <Sliders className="h-5 w-5 text-blue-600" />
                <span>MODIFY ALERT PRIORITY</span>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Adjust Priority Score: <span className="font-bold text-blue-900">{modifiedPriority} / 100</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={modifiedPriority}
                  onChange={e => setModifiedPriority(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>
              <div className="pt-2 border-t flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowModifyModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmModify}
                  className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded font-bold cursor-pointer"
                >
                  Save Modifications
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
