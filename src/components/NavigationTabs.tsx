import React from 'react';
import {
  LayoutDashboard,
  AlertOctagon,
  MapPin,
  Camera,
  TrendingUp,
  MessageSquareWarning,
  Truck,
  Satellite,
  CloudRain,
  History,
  FileCheck2,
  Bot,
  Compass,
  UserCheck,
  HeartPulse
} from 'lucide-react';

export type NavTabId =
  | 'command-center'
  | 'alerts'
  | 'live-map'
  | 'ai-detection'
  | 'risk-prediction'
  | 'citizen-alerts'
  | 'response'
  | 'satellite'
  | 'weather'
  | 'timeline'
  | 'evidence'
  | 'ai-copilot'
  | 'rural-monitoring'
  | 'human-authorization'
  | 'system-health';

interface NavigationTabsProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  pendingAuthCount: number;
  criticalAlertCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  pendingAuthCount,
  criticalAlertCount
}) => {
  const tabs = [
    { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
    { id: 'alerts', label: 'Alerts', icon: AlertOctagon, badge: criticalAlertCount > 0 ? criticalAlertCount : undefined, badgeColor: 'bg-red-600' },
    { id: 'live-map', label: 'Live Map', icon: MapPin },
    { id: 'ai-detection', label: 'AI Detection', icon: Camera },
    { id: 'risk-prediction', label: 'Risk & Prediction', icon: TrendingUp },
    { id: 'citizen-alerts', label: 'SMS & Citizen Alerts', icon: MessageSquareWarning },
    { id: 'response', label: 'Response', icon: Truck },
    { id: 'satellite', label: 'Satellite', icon: Satellite },
    { id: 'weather', label: 'Weather', icon: CloudRain },
    { id: 'timeline', label: 'Timeline', icon: History },
    { id: 'evidence', label: 'Evidence', icon: FileCheck2 },
    { id: 'ai-copilot', label: 'AI Voice Copilot', icon: Bot },
    { id: 'rural-monitoring', label: 'Rural Monitoring', icon: Compass },
    { id: 'human-authorization', label: 'Human Authorization', icon: UserCheck, badge: pendingAuthCount > 0 ? pendingAuthCount : undefined, badgeColor: 'bg-amber-500' },
    { id: 'system-health', label: 'System Health', icon: HeartPulse }
  ];

  return (
    <nav className="bg-white border-b border-slate-200 overflow-x-auto no-scrollbar sticky top-[73px] z-20 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 min-w-max py-1.5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as NavTabId)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-blue-200' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] text-white font-bold ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
