import React from 'react';
import { Compass, MapPin, Building, ShieldAlert, Phone, Waves, Mountain, CheckCircle2 } from 'lucide-react';
import { District } from '../../types';

interface RuralMonitoringViewProps {
  districts: District[];
}

export const RuralMonitoringView: React.FC<RuralMonitoringViewProps> = ({ districts }) => {
  const ruralSectors = [
    {
      village: 'Mudichur Rural Basin',
      taluk: 'Tambaram Taluk',
      district: 'Chengalpattu',
      type: 'Low-Lying Wetland',
      risk: 'HIGH',
      waterLevel: '3.9 ft inundation',
      vaoContact: 'Mr. R. Karthik (VAO) • +91 94440 12398',
      accessRoad: 'Cutoff at Otteri Nullah culvert',
      coordinates: '12.9249° N, 80.0827° E'
    },
    {
      village: 'Marapalam & Glendale Estates',
      taluk: 'Coonoor Taluk',
      district: 'The Nilgiris',
      type: 'Ghat Section Slopes',
      risk: 'CRITICAL',
      waterLevel: 'Debris blockage 400T',
      vaoContact: 'Mrs. S. Jayanthi (VAO) • +91 94441 55210',
      accessRoad: 'NH-181 single-lane alternate bypass',
      coordinates: '11.3530° N, 76.7959° E'
    },
    {
      village: 'Seruthur Coastal Hamlet',
      taluk: 'Kilvelur Taluk',
      district: 'Nagapattinam',
      type: 'Fishing Village / Estuary',
      risk: 'HIGH',
      waterLevel: '3.2m Tidal Surge',
      vaoContact: 'Mr. P. Murugesan (VAO) • +91 94442 77890',
      accessRoad: 'Passable via coastal link road',
      coordinates: '10.7656° N, 79.8424° E'
    },
    {
      village: 'Orathanadu Delta Basin',
      taluk: 'Orathanadu Taluk',
      district: 'Thanjavur',
      type: 'Paddy Agriculture Canal',
      risk: 'MODERATE',
      waterLevel: 'Canal bank breach 12m',
      vaoContact: 'Mr. T. Selvam (VAO) • +91 94443 88123',
      accessRoad: 'Tractor access functional',
      coordinates: '10.6274° N, 79.2558° E'
    },
    {
      village: 'Vattakottai Coastal Hamlet',
      taluk: 'Agastheeswaram Taluk',
      district: 'Kanyakumari',
      type: 'Coastal Rocky Shore',
      risk: 'WATCH',
      waterLevel: 'High wave warning',
      vaoContact: 'Mr. K. Anbu (VAO) • +91 94444 99012',
      accessRoad: 'Clear and operational',
      coordinates: '8.2045° N, 77.5562° E'
    }
  ];

  return (
    <div className="space-y-5 text-xs">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="h-5 w-5 text-blue-900" />
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            RURAL TALUK, VILLAGE & REMOTE GEOGRAPHIC MONITORING
          </h2>
        </div>
        <p className="text-slate-500">
          Dedicated surveillance for non-urban sectors: Cauvery delta agricultural basins, Western Ghats plantation hamlets, and coastal fishing settlements across Tamil Nadu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ruralSectors.map((sector, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${
                  sector.risk === 'CRITICAL' ? 'bg-red-600' : sector.risk === 'HIGH' ? 'bg-orange-600' : 'bg-amber-600'
                }`}>
                  {sector.risk}
                </span>
                <span className="text-slate-500 font-mono text-[10px]">{sector.coordinates}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mt-1">{sector.village}</h3>
              <div className="text-slate-500 text-[11px]">{sector.taluk} • {sector.district} District</div>

              <div className="mt-3 p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1 text-[11px]">
                <div>
                  <span className="font-semibold text-slate-700">Sector Landscape: </span>
                  <span className="text-slate-900">{sector.type}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Observed State: </span>
                  <span className="text-red-700 font-bold">{sector.waterLevel}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Road Connectivity: </span>
                  <span className="text-slate-800">{sector.accessRoad}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800 flex items-center gap-1">
                <Phone className="h-3 w-3 text-blue-600" />
                <span>Local VAO / Officer Contact:</span>
              </div>
              <div className="text-blue-900 font-medium pl-4">{sector.vaoContact}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
