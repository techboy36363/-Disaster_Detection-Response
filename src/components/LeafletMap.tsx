import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Search, 
  Layers, 
  MapPin, 
  Flame, 
  Waves, 
  Wind, 
  Mountain, 
  ShieldCheck, 
  AlertTriangle,
  LocateFixed,
  Building2,
  Ambulance,
  PhoneCall
} from 'lucide-react';
import { AlertIncident, District, ResponseFacility } from '../types';

interface LeafletMapProps {
  incidents: AlertIncident[];
  districts: District[];
  facilities: ResponseFacility[];
  selectedIncidentId?: string | null;
  onSelectIncident: (incident: AlertIncident) => void;
  onSelectDistrict?: (district: District) => void;
  height?: string;
  showFacilityFilters?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  incidents,
  districts,
  facilities,
  selectedIncidentId,
  onSelectIncident,
  onSelectDistrict,
  height = '620px',
  showFacilityFilters = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const zonesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const facilitiesLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResultMsg, setSearchResultMsg] = useState<string | null>(null);
  const [activeBaseLayer, setActiveBaseLayer] = useState<'osm' | 'satellite' | 'terrain'>('osm');

  // Facility filter toggles
  const [showFire, setShowFire] = useState(true);
  const [showSdrf, setShowSdrf] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showRiskCircles, setShowRiskCircles] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center of India
    const indiaCenter: L.LatLngExpression = [16.5, 79.5];

    const map = L.map(mapContainerRef.current, {
      center: indiaCenter,
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Default OSM tile layer
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | TNDMA'
    }).addTo(map);

    // Layer groups
    const layerGroup = L.layerGroup().addTo(map);
    const zonesGroup = L.layerGroup().addTo(map);
    const facilitiesGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;
    zonesLayerGroupRef.current = zonesGroup;
    facilitiesLayerGroupRef.current = facilitiesGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; OpenStreetMap contributors | TNDMA';

    if (activeBaseLayer === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (activeBaseLayer === 'terrain') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)';
    }

    L.tileLayer(tileUrl, { attribution, maxZoom: 18 }).addTo(map);
  }, [activeBaseLayer]);

  // Render Incidents, Alert Zones, and District Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    const zonesGroup = zonesLayerGroupRef.current;
    if (!map || !layerGroup || !zonesGroup) return;

    layerGroup.clearLayers();
    zonesGroup.clearLayers();

    // 1. Render Alert Zones (Transparent circles on map)
    if (showRiskCircles) {
      incidents.forEach(inc => {
        const radiusMeters = (inc.citizenWarning?.affectedRadiusKm || 5) * 1000;
        const color = inc.severity === 'CRITICAL' ? '#dc2626' : inc.severity === 'HIGH' ? '#ea580c' : '#d97706';

        // Outer Watch zone
        L.circle([inc.latitude, inc.longitude], {
          radius: radiusMeters * 1.5,
          color: '#eab308',
          fillColor: '#fef08a',
          fillOpacity: 0.15,
          weight: 1,
          dashArray: '4, 4'
        }).addTo(zonesGroup);

        // Inner Impact / Affected zone
        const innerCircle = L.circle([inc.latitude, inc.longitude], {
          radius: radiusMeters,
          color: color,
          fillColor: color,
          fillOpacity: 0.28,
          weight: 2
        }).addTo(zonesGroup);

        innerCircle.bindTooltip(
          `<div class="text-xs font-bold text-slate-900">${inc.disasterType} Impact Zone: ${inc.citizenWarning?.affectedRadiusKm || 5} km radius (${(inc.citizenWarning?.simulatedRecipientCount || 0).toLocaleString()} residents)</div>`,
          { sticky: true }
        );
      });
    }

    // 2. Render Incident Markers with custom pulsing pin
    incidents.forEach(inc => {
      const isCritical = inc.severity === 'CRITICAL';
      const isHigh = inc.severity === 'HIGH';
      const colorBg = isCritical ? 'bg-red-600' : isHigh ? 'bg-orange-500' : 'bg-amber-500';

      const customHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          ${isCritical ? `<div class="absolute -inset-2 rounded-full ${colorBg} opacity-75 animate-ping"></div>` : ''}
          <div class="relative h-9 w-9 rounded-full ${colorBg} text-white flex items-center justify-center shadow-lg border-2 border-white transform transition hover:scale-110">
            <span class="text-xs font-black">${isCritical ? '🚨' : '⚠️'}</span>
          </div>
          <div class="absolute -bottom-5 px-1.5 py-0.5 bg-slate-900 text-white rounded text-[10px] font-bold tracking-tight whitespace-nowrap shadow-md">
            ${inc.locationName.split(' ')[0]} (${inc.riskScore})
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: 'custom-disaster-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20]
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon }).addTo(layerGroup);

      // Detailed popup
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 font-sans max-w-xs';
      popupContent.innerHTML = `
        <div class="flex items-center gap-1.5 mb-1">
          <span class="px-2 py-0.5 rounded text-[10px] font-black text-white ${colorBg}">
            ${inc.severity}
          </span>
          <span class="text-xs font-bold text-slate-800">Priority ${inc.priorityScore}/100</span>
        </div>
        <div class="font-bold text-sm text-slate-900 leading-snug">${inc.title}</div>
        <div class="text-xs text-slate-600 mt-0.5 font-medium">${inc.locationName}, ${inc.district} District</div>
        
        <div class="mt-2 text-xs bg-slate-50 p-1.5 rounded border border-slate-200">
          <div class="font-semibold text-slate-700">Latest AI Detection:</div>
          <div class="text-slate-600 text-[11px] line-clamp-2">${inc.evidence[0]?.description || 'Multiple sensor anomalies'}</div>
        </div>

        <div class="mt-2 flex items-center justify-between pt-1 border-t border-slate-200 text-xs">
          <span class="text-[11px] font-semibold text-slate-500">${inc.status}</span>
          <button id="view-alert-btn-${inc.id}" class="px-2.5 py-1 bg-blue-900 text-white rounded font-bold text-[11px] hover:bg-blue-800 cursor-pointer">
            Open Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-alert-btn-${inc.id}`);
        if (btn) {
          btn.onclick = () => onSelectIncident(inc);
        }
      });

      // If selected incident, open popup automatically
      if (selectedIncidentId === inc.id) {
        marker.openPopup();
        map.setView([inc.latitude, inc.longitude], 12);
      }
    });

    // 3. Render 38 District Reference Markers (light dots)
    districts.forEach(dist => {
      // Don't clutter if there's an incident nearby
      const hasActiveIncident = incidents.some(i => i.district.toLowerCase() === dist.name.toLowerCase());
      if (hasActiveIncident) return;

      const riskColor = dist.currentRiskScore > 70 ? '#ea580c' : dist.currentRiskScore > 40 ? '#d97706' : '#059669';

      const distHtml = `
        <div class="flex items-center gap-1 opacity-85 hover:opacity-100 transition cursor-pointer">
          <div class="h-2.5 w-2.5 rounded-full border border-white shadow-xs" style="background-color: ${riskColor};"></div>
          <span class="text-[10px] font-semibold text-slate-700 bg-white/90 px-1 py-0.2 rounded shadow-2xs border border-slate-200 whitespace-nowrap">
            ${dist.name}
          </span>
        </div>
      `;

      const distIcon = L.divIcon({
        html: distHtml,
        className: 'district-label-marker',
        iconSize: [80, 16],
        iconAnchor: [5, 8]
      });

      const distMarker = L.marker([dist.latitude, dist.longitude], { icon: distIcon }).addTo(layerGroup);
      distMarker.bindTooltip(
        `<div class="text-xs"><strong>${dist.name} (${dist.tamilName})</strong><br/>Risk Score: ${dist.currentRiskScore}/100<br/>Rainfall: ${dist.weatherSummary.rainfallMm} mm<br/>Collector: ${dist.authority.officer}</div>`
      );

      distMarker.on('click', () => {
        if (onSelectDistrict) onSelectDistrict(dist);
      });
    });
  }, [incidents, districts, selectedIncidentId, showRiskCircles, onSelectIncident, onSelectDistrict]);

  // Render Response Facilities (Fire, SDRF, Hospitals, Shelters)
  useEffect(() => {
    const facilitiesGroup = facilitiesLayerGroupRef.current;
    if (!facilitiesGroup) return;

    facilitiesGroup.clearLayers();

    facilities.forEach(fac => {
      if (fac.type === 'FIRE_STATION' && !showFire) return;
      if (fac.type === 'SDRF_BASE' && !showSdrf) return;
      if (fac.type === 'HOSPITAL' && !showHospitals) return;
      if (fac.type === 'SHELTER' && !showShelters) return;

      let iconEmoji = '🚒';
      let bgColor = 'bg-red-500';
      if (fac.type === 'SDRF_BASE') {
        iconEmoji = '🛡️';
        bgColor = 'bg-blue-600';
      } else if (fac.type === 'HOSPITAL') {
        iconEmoji = '🏥';
        bgColor = 'bg-emerald-600';
      } else if (fac.type === 'SHELTER') {
        iconEmoji = '⛺';
        bgColor = 'bg-indigo-600';
      }

      const facHtml = `
        <div class="h-6 w-6 rounded-full ${bgColor} text-white flex items-center justify-center text-[11px] shadow-sm border border-white cursor-pointer hover:scale-125 transition" title="${fac.name}">
          <span>${iconEmoji}</span>
        </div>
      `;

      const facIcon = L.divIcon({
        html: facHtml,
        className: 'facility-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([fac.latitude, fac.longitude], { icon: facIcon }).addTo(facilitiesGroup);
      marker.bindPopup(`
        <div class="text-xs font-sans">
          <div class="font-bold text-slate-900">${fac.name}</div>
          <div class="text-slate-600 mt-0.5">Type: <strong>${fac.type.replace('_', ' ')}</strong> (${fac.district})</div>
          <div class="text-slate-600">Status: <span class="font-semibold text-emerald-700">${fac.status}</span></div>
          ${fac.capacity ? `<div class="text-slate-600">Capacity: ${fac.capacity} people</div>` : ''}
          ${fac.phone ? `<div class="text-blue-700 font-semibold mt-1">📞 ${fac.phone}</div>` : ''}
        </div>
      `);
    });
  }, [facilities, showFire, showSdrf, showHospitals, showShelters]);

  // Handle Location Search & Reverse Geocode
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResultMsg(null);

    try {
      const q = searchQuery.trim();
      const map = mapInstanceRef.current;

      // Check if coordinates entered: e.g. "11.0168, 76.9558" or "11.0168 76.9558"
      const coordRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
      if (coordRegex.test(q)) {
        const [latStr, lonStr] = q.split(',').map(s => s.trim());
        const lat = parseFloat(latStr);
        const lon = parseFloat(lonStr);

        if (map) {
          map.setView([lat, lon], 12);
          L.popup()
            .setLatLng([lat, lon])
            .setContent(`<div class="text-xs font-sans"><strong>Target Coordinates</strong><br/>Lat: ${lat}, Lon: ${lon}<br/><span class="text-slate-500">Tamil Nadu Sector</span></div>`)
            .openOn(map);
          setSearchResultMsg(`Centered on coordinates: ${lat}, ${lon}`);
        }
        setIsSearching(false);
        return;
      }

      // Check if district name matched directly
      const matchedDist = districts.find(d => 
        d.name.toLowerCase() === q.toLowerCase() || 
        d.tamilName.includes(q)
      );

      if (matchedDist && map) {
        map.setView([matchedDist.latitude, matchedDist.longitude], 10);
        setSearchResultMsg(`Located ${matchedDist.name} District (${matchedDist.zone} Zone)`);
        setIsSearching(false);
        return;
      }

      // Call OSM Nominatim geocoding via our backend proxy
      const resp = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await resp.json();

      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);

        if (map) {
          map.setView([lat, lon], 12);
          L.popup()
            .setLatLng([lat, lon])
            .setContent(`<div class="text-xs font-sans font-medium"><strong>${item.display_name.split(',')[0]}</strong><br/><span class="text-slate-500 text-[11px]">${item.display_name}</span></div>`)
            .openOn(map);
        }
        setSearchResultMsg(`Found: ${item.display_name.split(',').slice(0, 2).join(',')}`);
      } else {
        setSearchResultMsg('Location not found in Tamil Nadu registry.');
      }
    } catch (err) {
      setSearchResultMsg('Geocoding service unavailable.');
    } finally {
      setIsSearching(false);
    }
  };

  // Reset to full Tamil Nadu view
  const handleResetTNView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([11.1271, 78.6569], 7);
    }
  };

  return (
    <div className="relative w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
      {/* Top Map Control Bar */}
      <div className="p-2 sm:p-3 bg-white/95 backdrop-blur-xs border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 z-10 relative">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-1.5 flex-1 min-w-[260px] max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search District, Town, Village, or Lat, Lon (e.g. 11.0168, 76.9558)..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white text-slate-800"
            />
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-md transition cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isSearching ? 'Locating...' : 'Search'}
          </button>
        </form>

        {/* Map Layers & Reset */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Base Layer Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-[11px] font-medium text-slate-700">
            <button
              onClick={() => setActiveBaseLayer('osm')}
              className={`px-2 py-1 rounded transition cursor-pointer ${activeBaseLayer === 'osm' ? 'bg-white shadow-2xs font-bold text-blue-900' : 'hover:text-slate-900'}`}
            >
              OSM Standard
            </button>
            <button
              onClick={() => setActiveBaseLayer('terrain')}
              className={`px-2 py-1 rounded transition cursor-pointer ${activeBaseLayer === 'terrain' ? 'bg-white shadow-2xs font-bold text-blue-900' : 'hover:text-slate-900'}`}
            >
              Topography
            </button>
            <button
              onClick={() => setActiveBaseLayer('satellite')}
              className={`px-2 py-1 rounded transition cursor-pointer ${activeBaseLayer === 'satellite' ? 'bg-white shadow-2xs font-bold text-blue-900' : 'hover:text-slate-900'}`}
            >
              Satellite
            </button>
          </div>

          <button
            onClick={handleResetTNView}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-md transition cursor-pointer"
            title="Reset Map to Full Tamil Nadu View"
          >
            <LocateFixed className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset TN</span>
          </button>
        </div>
      </div>

      {/* Optional Search Feedback */}
      {searchResultMsg && (
        <div className="px-3 py-1 bg-blue-50 border-b border-blue-200 text-xs text-blue-800 font-medium flex items-center justify-between">
          <span>{searchResultMsg}</span>
          <button onClick={() => setSearchResultMsg(null)} className="text-slate-500 hover:text-slate-800 text-[10px] cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Map Canvas */}
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />

      {/* Facility Filter Pills at Bottom of Map */}
      {showFacilityFilters && (
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs p-2 rounded-md shadow-md border border-slate-200 text-xs flex flex-wrap items-center gap-2 max-w-[90%]">
          <span className="font-bold text-slate-800 text-[11px]">Map Layers:</span>
          
          <label className="flex items-center gap-1 cursor-pointer select-none text-[11px] font-medium text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={showRiskCircles}
              onChange={e => setShowRiskCircles(e.target.checked)}
              className="rounded text-red-600 focus:ring-0 cursor-pointer"
            />
            <span className="inline-block h-2 w-2 rounded-full bg-red-600"></span>
            <span>Alert Zones</span>
          </label>

          <label className="flex items-center gap-1 cursor-pointer select-none text-[11px] font-medium text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={showFire}
              onChange={e => setShowFire(e.target.checked)}
              className="rounded text-red-600 focus:ring-0 cursor-pointer"
            />
            <span>🚒 Fire Stations</span>
          </label>

          <label className="flex items-center gap-1 cursor-pointer select-none text-[11px] font-medium text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={showSdrf}
              onChange={e => setShowSdrf(e.target.checked)}
              className="rounded text-blue-600 focus:ring-0 cursor-pointer"
            />
            <span>🛡️ SDRF Units</span>
          </label>

          <label className="flex items-center gap-1 cursor-pointer select-none text-[11px] font-medium text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={showHospitals}
              onChange={e => setShowHospitals(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
            />
            <span>🏥 Hospitals</span>
          </label>

          <label className="flex items-center gap-1 cursor-pointer select-none text-[11px] font-medium text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={showShelters}
              onChange={e => setShowShelters(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
            />
            <span>⛺ Shelters</span>
          </label>
        </div>
      )}
    </div>
  );
};
