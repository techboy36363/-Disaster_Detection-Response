import React, { useState } from 'react';
import { LeafletMap } from '../LeafletMap';
import { AlertIncident, District, ResponseFacility } from '../../types';
import { Building, CloudRain, MapPin, Search, ShieldAlert, Waves } from 'lucide-react';

interface LiveMapViewProps {
  incidents: AlertIncident[];
  districts: District[];
  facilities: ResponseFacility[];
  onSelectIncident: (incident: AlertIncident) => void;
  selectedDistrict: District | null;
  onSelectDistrict: (district: District) => void;
}

export const LiveMapView: React.FC<LiveMapViewProps> = ({
  incidents,
  districts,
  facilities,
  onSelectIncident,
  selectedDistrict,
  onSelectDistrict
}) => {
  const [districtSearch, setDistrictSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');

  // Extract unique states
  const uniqueStates = Array.from(new Set(districts.map(d => d.state || 'Tamil Nadu'))).sort();

  const filteredDistricts = districts.filter(d => {
    if (stateFilter !== 'ALL' && (d.state || 'Tamil Nadu') !== stateFilter) return false;
    if (zoneFilter !== 'ALL' && d.zone !== zoneFilter) return false;
    if (districtSearch.trim()) {
      const q = districtSearch.toLowerCase();
      return d.name.toLowerCase().includes(q) || d.tamilName.includes(q) || (d.state && d.state.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-4 text-xs">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left 3 cols: Full Interactive Map */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-900" />
              <span className="font-bold text-slate-900">India National Real-Time Vector Geo-Canvas</span>
              <span className="text-slate-500 text-[11px] hidden sm:inline">• Click markers for alert evidence</span>
            </div>

            {selectedDistrict && (
              <div className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded font-bold border border-blue-200 text-xs">
                Selected: {selectedDistrict.name} ({selectedDistrict.state || 'Tamil Nadu'})
              </div>
            )}
          </div>

          <LeafletMap
            incidents={incidents}
            districts={districts}
            facilities={facilities}
            onSelectIncident={onSelectIncident}
            onSelectDistrict={onSelectDistrict}
            height="660px"
          />
        </div>

        {/* Right 1 col: National Districts Explorer Sidebar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col h-[710px] space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">National Districts Directory</h3>
            <p className="text-[11px] text-slate-500">
              {filteredDistricts.length} Districts • All-India Real-Time Status
            </p>
          </div>

          {/* District Search & State/Zone Filter */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={districtSearch}
                onChange={e => setDistrictSearch(e.target.value)}
                placeholder="Find state or district..."
                className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-900 focus:outline-none min-h-[36px]"
              />
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 top-2.5" />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <select
                value={stateFilter}
                onChange={e => setStateFilter(e.target.value)}
                className="w-full p-1.5 text-xs border border-slate-300 rounded text-slate-700 bg-white min-h-[36px]"
              >
                <option value="ALL">All States ({uniqueStates.length})</option>
                {uniqueStates.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>

              <select
                value={zoneFilter}
                onChange={e => setZoneFilter(e.target.value)}
                className="w-full p-1.5 text-xs border border-slate-300 rounded text-slate-700 bg-white min-h-[36px]"
              >
                <option value="ALL">All Zones</option>
                <option value="Coastal">Coastal Zone</option>
                <option value="Western Ghats">Western Ghats</option>
                <option value="Delta">Delta Zone</option>
                <option value="Northern">Northern</option>
                <option value="Southern">Southern</option>
                <option value="Central">Central</option>
              </select>
            </div>
          </div>

          {/* District List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredDistricts.map(d => {
              const isSelected = selectedDistrict?.id === d.id;
              const hasAlert = d.activeIncidentsCount > 0;

              return (
                <div
                  key={d.id}
                  onClick={() => onSelectDistrict(d)}
                  className={`p-2 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-blue-900 bg-blue-50/80 font-bold text-blue-950'
                      : hasAlert
                        ? 'border-red-300 bg-red-50/40 hover:bg-red-50'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${
                        d.currentRiskScore > 75 ? 'bg-red-600' : d.currentRiskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}></span>
                      <span className="font-bold truncate">{d.name}</span>
                      <span className="text-[10px] text-slate-500 font-normal">({d.tamilName})</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{d.zone}</span>
                      <span>•</span>
                      <span>Rain: {d.weatherSummary.rainfallMm}mm</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-xs">{d.currentRiskScore}</span>
                    <span className="text-[10px] text-slate-400 block">/100</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected District Snapshot Card */}
          {selectedDistrict && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-[11px] space-y-1">
              <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                <span>{selectedDistrict.name} Authority</span>
                <span className="text-emerald-700 font-semibold">Verified</span>
              </div>
              <div>Headquarters: <strong>{selectedDistrict.headquarters}</strong></div>
              <div>Collector: <strong>{selectedDistrict.authority.officer}</strong></div>
              <div>Emergency Desk: <strong>{selectedDistrict.authority.emergencyContact}</strong></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
