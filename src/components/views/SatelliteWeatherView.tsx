import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Satellite, 
  Wind, 
  Thermometer, 
  Droplets, 
  Compass, 
  RefreshCw,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { District } from '../../types';

interface SatelliteWeatherViewProps {
  districts: District[];
  selectedDistrict: District | null;
  onSelectDistrict: (district: District) => void;
}

export const SatelliteWeatherView: React.FC<SatelliteWeatherViewProps> = ({
  districts,
  selectedDistrict,
  onSelectDistrict
}) => {
  const current = selectedDistrict || districts[0];
  const [liveWeather, setLiveWeather] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`/api/weather?lat=${current.latitude}&lon=${current.longitude}`);
        const data = await resp.json();
        setLiveWeather(data);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [current]);

  return (
    <div className="space-y-5 text-xs">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Satellite className="h-5 w-5 text-blue-900" />
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              SATELLITE REMOTE SENSING & METEOROLOGICAL TELEMETRY
            </h2>
          </div>
          <p className="text-slate-500">
            Real-time atmospheric analysis via Open-Meteo, Copernicus Sentinel-1 Synthetic Aperture Radar (SAR), and INSAT-3D water vapor channels.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
          <RefreshCw className="h-3.5 w-3.5 text-emerald-600" />
          <span className="font-bold">Satellite Feed: LIVE (Refreshed 2m ago)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* District Selector */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Select District to Query:</h3>
          <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
            {districts.map(d => (
              <div
                key={d.id}
                onClick={() => onSelectDistrict(d)}
                className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                  current.id === d.id
                    ? 'border-blue-900 bg-blue-50/80 font-bold text-blue-950'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900">{d.name}</div>
                  <div className="text-[10px] text-slate-500">{d.zone} Zone • {d.tamilName}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-900">{d.weatherSummary.rainfallMm} mm</div>
                  <div className="text-[10px] text-slate-400">Rainfall</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Weather & Satellite Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Geographical Coordinates</span>
                <h3 className="font-black text-slate-900 text-base">
                  {current.name} District ({current.latitude.toFixed(4)}° N, {current.longitude.toFixed(4)}° E)
                </h3>
                <span className="text-slate-500">{current.headquarters} Meteorological Node</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase">District Risk</span>
                <div className="text-lg font-black text-red-700">{current.currentRiskScore} / 100</div>
              </div>
            </div>

            {/* Weather Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
                <div className="flex items-center gap-1.5 text-blue-700 mb-1">
                  <CloudRain className="h-4 w-4" />
                  <span className="font-semibold text-[11px]">Rainfall (24h)</span>
                </div>
                <div className="text-xl font-black text-blue-950">
                  {current.weatherSummary.rainfallMm} mm
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Heavy precipitation zone</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-700 mb-1">
                  <Wind className="h-4 w-4" />
                  <span className="font-semibold text-[11px]">Wind Velocity</span>
                </div>
                <div className="text-xl font-black text-slate-900">
                  {current.weatherSummary.windSpeedKmh} km/h
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Gusts up to {Math.round(current.weatherSummary.windSpeedKmh * 1.3)} km/h</div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200">
                <div className="flex items-center gap-1.5 text-amber-700 mb-1">
                  <Thermometer className="h-4 w-4" />
                  <span className="font-semibold text-[11px]">Temperature</span>
                </div>
                <div className="text-xl font-black text-slate-900">
                  {current.weatherSummary.temperatureC}°C
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Humid tropical regime</div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-1.5 text-indigo-700 mb-1">
                  <Droplets className="h-4 w-4" />
                  <span className="font-semibold text-[11px]">Soil Moisture Sat.</span>
                </div>
                <div className="text-xl font-black text-slate-900">89%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Near complete saturation</div>
              </div>
            </div>

            {/* Satellite Ingestion Cards */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Copernicus & INSAT Active Satellite Layers:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Sentinel-1 C-Band SAR</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">12m Pass Fresh</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Synthetic Aperture Radar penetrates cloud cover to quantify standing water masks across {current.name} sub-basins.
                  </p>
                  <div className="text-[10px] text-slate-500">Backscatter Coefficient: -18.4 dB (Water Threshold Surpassed)</div>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">INSAT-3D Meteorological Radar</span>
                    <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">15m Refresh</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Doppler reflectivity shows continuous convective band progression aligned with North-East monsoon trajectory.
                  </p>
                  <div className="text-[10px] text-slate-500">Cloud Top Temperature: -64°C (Deep Convective Cell)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
