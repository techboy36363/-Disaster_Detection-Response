import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { CriticalAlarmBanner } from './components/CriticalAlarmBanner';
import { NavigationTabs, NavTabId } from './components/NavigationTabs';
import { AlertModal } from './components/AlertModal';
import { DisasterSimulatorModal } from './components/DisasterSimulatorModal';
import { AuthModal } from './components/AuthModal';
import { AlarmModal } from './components/AlarmModal';
import { SeocPhoneBridgeModal } from './components/SeocPhoneBridgeModal';

// Views
import { CommandCenterView } from './components/views/CommandCenterView';
import { AlertsView } from './components/views/AlertsView';
import { LiveMapView } from './components/views/LiveMapView';
import { AiDetectionView } from './components/views/AiDetectionView';
import { RiskPredictionView } from './components/views/RiskPredictionView';
import { CitizenAlertsView } from './components/views/CitizenAlertsView';
import { ResponseCoordinationView } from './components/views/ResponseCoordinationView';
import { SatelliteWeatherView } from './components/views/SatelliteWeatherView';
import { TimelineView } from './components/views/TimelineView';
import { EvidenceView } from './components/views/EvidenceView';
import { AiCopilotView } from './components/views/AiCopilotView';
import { RuralMonitoringView } from './components/views/RuralMonitoringView';
import { HumanAuthorizationView } from './components/views/HumanAuthorizationView';
import { SystemHealthView } from './components/views/SystemHealthView';

// Data & Types
import { AlertIncident, District, ResponseFacility, UserSession } from './types';
import { INITIAL_INCIDENTS, RESPONSE_FACILITIES } from './data/initialIncidents';
import { ALL_INDIA_DISTRICTS } from './data/districts';
import { emergencyAudio } from './utils/audioAlert';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('command-center');
  const [incidents, setIncidents] = useState<AlertIncident[]>(INITIAL_INCIDENTS);
  const [districts, setDistricts] = useState<District[]>(ALL_INDIA_DISTRICTS);
  const [facilities, setFacilities] = useState<ResponseFacility[]>(RESPONSE_FACILITIES);

  const [selectedAlert, setSelectedAlert] = useState<AlertIncident | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(ALL_INDIA_DISTRICTS[0]);

  // Emergency Sound State
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState<boolean>(false);

  // Modals
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showAlarmModal, setShowAlarmModal] = useState<boolean>(false);
  const [showSeocPhoneModal, setShowSeocPhoneModal] = useState<boolean>(false);

  // Subscribe to audio manager state changes
  useEffect(() => {
    const unsubscribe = emergencyAudio.subscribe((muted, playing) => {
      setIsMuted(muted);
      setIsAlarmPlaying(playing);
    });
    return unsubscribe;
  }, []);

  // Language & User
  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  const [currentUser, setCurrentUser] = useState<UserSession>({
    id: 'USR-SEOC-01',
    name: 'Dr. K. Senthil Kumar, IAS',
    role: 'STATE_COMMANDER',
    districtScope: 'ALL_38_DISTRICTS',
    token: 'TNDMA-SEOC-AUTH-SECURE',
    lastSync: new Date().toISOString()
  });

  // Fetch initial incidents & districts from Express backend
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const [incResp, distResp] = await Promise.all([
          fetch('/api/incidents'),
          fetch('/api/districts')
        ]);

        if (incResp.ok) {
          const incData = await incResp.json();
          if (incData.incidents && incData.incidents.length > 0) {
            setIncidents(incData.incidents);
          }
        }

        if (distResp.ok) {
          const distData = await distResp.json();
          if (distData.districts && distData.districts.length > 0) {
            setDistricts(distData.districts);
          }
        }
      } catch (err) {
        console.warn('Backend loading defaulted to local cache:', err);
      }
    };

    loadBackendData();
  }, []);

  // Top critical alert that is not resolved
  const criticalAlert = incidents.find(
    i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED'
  ) || null;

  const pendingAuthIncidents = incidents.filter(
    i => i.status === 'AWAITING AUTHORIZATION' || !i.approval?.isApproved
  );

  // Play alarm sound if there is a critical alert and sound is unmuted
  const triggerAudioAlarm = useCallback(() => {
    if (isMuted) return;
    setIsAlarmPlaying(true);
    emergencyAudio.playSiren(4000);
    setTimeout(() => {
      setIsAlarmPlaying(false);
    }, 4200);
  }, [isMuted]);

  const handleToggleMute = () => {
    if (!isMuted) {
      emergencyAudio.stop();
      emergencyAudio.setMute(true);
      setIsAlarmPlaying(false);
      setIsMuted(true);
    } else {
      setIsMuted(false);
      emergencyAudio.setMute(false);
      emergencyAudio.resumeContext();
      emergencyAudio.playBeepTest();
    }
  };

  // Authorize Action (Prompt sections 12, 13, 31)
  const handleAuthorize = async (incidentId: string, operatorNotes?: string) => {
    try {
      const resp = await fetch(`/api/incidents/${incidentId}/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorizedBy: currentUser.name,
          role: currentUser.role,
          notes: operatorNotes || 'Approved for immediate emergency field deployment.'
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        const updated = data.incident;

        setIncidents(prev =>
          prev.map(i => (i.id === incidentId ? updated : i))
        );

        if (selectedAlert?.id === incidentId) {
          setSelectedAlert(updated);
        }

        // Play positive confirmation chime
        emergencyAudio.playNotificationChime();
      }
    } catch (err) {
      console.error('Authorization failed:', err);
    }
  };

  // Reject / Scale Down Alert
  const handleReject = async (incidentId: string, reason: string) => {
    try {
      const resp = await fetch(`/api/incidents/${incidentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED', notes: reason })
      });

      if (resp.ok) {
        setIncidents(prev =>
          prev.map(i =>
            i.id === incidentId
              ? { ...i, status: 'RESOLVED', priorityScore: 20 }
              : i
          )
        );
      }
    } catch (err) {
      console.error('Failed to reject alert:', err);
    }
  };

  // Modify Alert Priority
  const handleModify = async (incidentId: string, newPriority: number) => {
    try {
      const resp = await fetch(`/api/incidents/${incidentId}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priorityScore: newPriority })
      });

      if (resp.ok) {
        setIncidents(prev =>
          prev.map(i =>
            i.id === incidentId ? { ...i, priorityScore: newPriority } : i
          )
        );
        if (selectedAlert?.id === incidentId) {
          setSelectedAlert(prev => (prev ? { ...prev, priorityScore: newPriority } : null));
        }
      }
    } catch (err) {
      console.error('Failed to modify priority:', err);
    }
  };

  // Update Status
  const handleUpdateStatus = async (incidentId: string, newStatus: any) => {
    try {
      await fetch(`/api/incidents/${incidentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      setIncidents(prev =>
        prev.map(i => (i.id === incidentId ? { ...i, status: newStatus } : i))
      );
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // SMS / Cell Broadcast
  const handleTriggerSmsDispatch = async (alert: AlertIncident, phoneNumber?: string) => {
    await fetch('/api/citizen-alert/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidentId: alert.id,
        phoneNumber: phoneNumber || '+91 98401 23456',
        district: alert.district,
        englishText: alert.citizenWarning?.englishDescription,
        tamilText: alert.citizenWarning?.tamilDescription
      })
    });
    emergencyAudio.playNotificationChime();
  };

  // Cloud Sync
  const handleSyncCloud = async () => {
    await fetch('/api/cloud-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidents,
        syncedBy: currentUser.name,
        timestamp: new Date().toISOString()
      })
    });
    setCurrentUser(prev => ({ ...prev, lastSync: new Date().toISOString() }));
  };

  // Simulation Complete
  const handleSimulationComplete = (newIncident: AlertIncident) => {
    setIncidents(prev => [newIncident, ...prev]);
    setSelectedAlert(newIncident);
    setActiveTab('command-center');
    setShowSimulator(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      {/* Top Government Navigation Header */}
      <Navbar
        pendingAuthorizationsCount={pendingAuthIncidents.length}
        criticalAlertCount={incidents.filter(i => i.severity === 'CRITICAL').length}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenSimulator={() => setShowSimulator(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenPendingAuthView={() => setActiveTab('human-authorization')}
        currentUser={currentUser}
        language={language}
        onToggleLanguage={() => setLanguage(l => (l === 'en' ? 'ta' : 'en'))}
        isAlarmPlaying={isAlarmPlaying}
        onOpenAlarmModal={() => setShowAlarmModal(true)}
        onOpenSeocPhoneBridge={() => setShowSeocPhoneModal(true)}
      />

      {/* Critical Alarm Banner (Visible whenever critical threat exists) */}
      <CriticalAlarmBanner
        criticalAlert={criticalAlert}
        onViewAlert={alert => setSelectedAlert(alert)}
        onAuthorizeAction={alert => handleAuthorize(alert.id)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenAlarmModal={() => setShowAlarmModal(true)}
        onOpenSeocPhoneBridge={() => setShowSeocPhoneModal(true)}
      />

      {/* 15-Tab Navigation Strip */}
      <NavigationTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingAuthCount={pendingAuthIncidents.length}
        criticalAlertCount={incidents.filter(i => i.severity === 'CRITICAL').length}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'command-center' && (
          <CommandCenterView
            incidents={incidents}
            districts={districts}
            facilities={facilities}
            onSelectIncident={setSelectedAlert}
            onSelectDistrict={setSelectedDistrict}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            incidents={incidents}
            onSelectIncident={setSelectedAlert}
            onAuthorizeAction={alert => handleAuthorize(alert.id)}
          />
        )}

        {activeTab === 'live-map' && (
          <LiveMapView
            incidents={incidents}
            districts={districts}
            facilities={facilities}
            onSelectIncident={setSelectedAlert}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={setSelectedDistrict}
          />
        )}

        {activeTab === 'ai-detection' && (
          <AiDetectionView
            onPromoteToIncident={newInc => {
              setIncidents(prev => [newInc, ...prev]);
              setSelectedAlert(newInc);
              setActiveTab('alerts');
              triggerAudioAlarm();
            }}
          />
        )}

        {activeTab === 'risk-prediction' && (
          <RiskPredictionView
            incidents={incidents}
            districts={districts}
            onSelectIncident={setSelectedAlert}
          />
        )}

        {activeTab === 'citizen-alerts' && (
          <CitizenAlertsView
            incidents={incidents}
            onTriggerSmsDispatch={handleTriggerSmsDispatch}
          />
        )}

        {activeTab === 'response' && (
          <ResponseCoordinationView
            incidents={incidents}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {(activeTab === 'satellite' || activeTab === 'weather') && (
          <SatelliteWeatherView
            districts={districts}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={setSelectedDistrict}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView incidents={incidents} />
        )}

        {activeTab === 'evidence' && (
          <EvidenceView
            incidents={incidents}
            onSelectIncident={setSelectedAlert}
          />
        )}

        {activeTab === 'ai-copilot' && (
          <AiCopilotView incidents={incidents} />
        )}

        {activeTab === 'rural-monitoring' && (
          <RuralMonitoringView districts={districts} />
        )}

        {activeTab === 'human-authorization' && (
          <HumanAuthorizationView
            incidents={incidents}
            onSelectIncident={setSelectedAlert}
            onAuthorizeAction={alert => handleAuthorize(alert.id)}
          />
        )}

        {activeTab === 'system-health' && (
          <SystemHealthView />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-4 px-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Tamil Nadu State Disaster Management Authority (TNDMA) • Ezhilagam, Chepauk, Chennai - 600005
          </span>
          <span className="text-slate-400">
            Emergency Toll-free: <strong>1070 (State)</strong> / <strong>1077 (District)</strong>
          </span>
        </div>
      </footer>

      {/* Alert Inspection & Human-in-the-loop Clearance Modal */}
      <AlertModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAuthorize={handleAuthorize}
        onReject={handleReject}
        onModify={handleModify}
        onTriggerSmsDispatch={handleTriggerSmsDispatch}
        currentUser={currentUser}
      />

      {/* Hackathon Judge One-Click Disaster Simulator */}
      <DisasterSimulatorModal
        isOpen={showSimulator}
        onClose={() => setShowSimulator(false)}
        onSimulationComplete={handleSimulationComplete}
        triggerAudioAlarm={triggerAudioAlarm}
      />

      {/* Role-Based Authentication & Cloud Sync Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        onUpdateUser={setCurrentUser}
        onSyncCloud={handleSyncCloud}
      />

      {/* Disaster Alarm & Siren Controller Modal */}
      <AlarmModal
        isOpen={showAlarmModal}
        onClose={() => setShowAlarmModal(false)}
        districts={districts}
        currentUser={currentUser}
        isAlarmPlaying={isAlarmPlaying}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* State Emergency Operations Centre (SEOC) Direct Telephone Bridge */}
      <SeocPhoneBridgeModal
        isOpen={showSeocPhoneModal}
        onClose={() => setShowSeocPhoneModal(false)}
        district={selectedAlert?.district || selectedDistrict?.name || 'Chengalpattu'}
        state={selectedAlert?.state || selectedDistrict?.state || 'Tamil Nadu'}
        incidentTitle={selectedAlert?.title}
        autoDialOnOpen={true}
      />
    </div>
  );
}
export default App;
