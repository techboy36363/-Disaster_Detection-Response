import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  KeyRound, 
  RefreshCw, 
  X, 
  Building, 
  CheckCircle2, 
  ShieldAlert,
  Fingerprint
} from 'lucide-react';
import { UserSession } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  onUpdateUser: (newUser: UserSession) => void;
  onSyncCloud: () => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onSyncCloud
}) => {
  if (!isOpen) return null;

  const [selectedRole, setSelectedRole] = useState(currentUser.role);
  const [officerName, setOfficerName] = useState(currentUser.name);
  const [districtScope, setDistrictScope] = useState(currentUser.districtScope);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const roles = [
    { id: 'STATE_COMMANDER', name: 'SEOC State Disaster Commander', scope: 'ALL' },
    { id: 'DISTRICT_COLLECTOR', name: 'District Collector / Magistrate', scope: 'Chengalpattu' },
    { id: 'SDRF_OFFICER', name: 'TN SDRF Battalion Commander', scope: 'ALL' },
    { id: 'FIELD_VERIFIER', name: 'Revenue Inspector / Field Verifier', scope: 'Tambaram' },
    { id: 'OBSERVER', name: 'Judicial / Audit Observer', scope: 'ALL' }
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserSession = {
      ...currentUser,
      name: officerName,
      role: selectedRole as any,
      districtScope,
      lastSync: new Date().toISOString()
    };
    onUpdateUser(updated);
    onClose();
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    try {
      await onSyncCloud();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
        {/* Header */}
        <div className="bg-blue-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold">CONTROL ROOM ACCESS & CLOUD SYNC</h2>
              <p className="text-[11px] text-blue-200">Role-Based Authorization & Encrypted State</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Cloud Sync Status Strip */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
            <div>
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Cloud State: SYNCED</span>
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5">
                Encrypted with AES-GCM • Last synced: {new Date(currentUser.lastSync).toLocaleTimeString()}
              </div>
            </div>

            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-[11px] transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>

          {syncSuccess && (
            <div className="p-2 bg-blue-50 border border-blue-200 text-blue-800 text-center font-semibold rounded">
              State successfully backed up to cloud control store.
            </div>
          )}

          {/* User Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Operator Officer Name:</label>
              <div className="relative">
                <input
                  type="text"
                  value={officerName}
                  onChange={e => setOfficerName(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-900 focus:outline-none text-xs"
                />
                <User className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Role / Designation:</label>
              <div className="space-y-1.5">
                {roles.map(r => (
                  <label
                    key={r.id}
                    className={`flex items-center justify-between p-2.5 rounded border cursor-pointer transition ${
                      selectedRole === r.id
                        ? 'border-blue-900 bg-blue-50 text-blue-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="userRole"
                        value={r.id}
                        checked={selectedRole === r.id}
                        onChange={() => {
                          setSelectedRole(r.id as any);
                          setDistrictScope(r.scope);
                        }}
                        className="text-blue-900 focus:ring-0 cursor-pointer"
                      />
                      <span>{r.name}</span>
                    </div>
                    <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">
                      Scope: {r.scope}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Token ID: TNDMA-SEOC-AUTH</span>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded font-bold cursor-pointer transition shadow-xs"
              >
                Apply Role Credentials
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
