import { AlertIncident } from '../types';

export type HospitalAlertStatus = 
  | 'MONITORING_GRID'
  | 'ALERT_DISPATCHED'
  | 'CODE_RED_ACKNOWLEDGED'
  | 'ICU_BEDS_RESERVED'
  | 'AMBULANCE_DISPATCHED';

export interface NearbyHospital {
  id: string;
  name: string;
  tamilName: string;
  district: string;
  state: string;
  distanceKm: number;
  etaMinutes: number;
  facilityType: 'GOVT_MEDICAL_COLLEGE' | 'DISTRICT_HEADQUARTERS_HOSPITAL' | 'TRAUMA_CARE_CENTER' | 'COMMUNITY_HEALTH_CENTRE';
  phone: string;
  hotline: string;
  medicalSuperintendent: string;
  totalBeds: number;
  availableIcuBeds: number;
  traumaSurgeonsOnDuty: number;
  bloodBankStatus: 'CRITICAL_O_POS_AVAILABLE' | 'ADEQUATE_ALL_GROUPS' | 'SURPLUS';
  oxygenReservePercent: number;
  ambulancesAssigned: number;
  alertStatus: HospitalAlertStatus;
  lastResponseTime?: string;
  responseMessage?: string;
  tamilResponseMessage?: string;
}

// Comprehensive database of major Government Medical Colleges, District Hospitals & Trauma Hubs
export const MASTER_HOSPITAL_DATABASE: Record<string, NearbyHospital[]> = {
  'Chengalpattu': [
    {
      id: 'hosp-chg-01',
      name: 'Chengalpattu Government Medical College & Hospital (CGMCH)',
      tamilName: 'செங்கல்பட்டு அரசு மருத்துவக் கல்லூரி மற்றும் மருத்துவமனை',
      district: 'Chengalpattu',
      state: 'Tamil Nadu',
      distanceKm: 4.2,
      etaMinutes: 8,
      facilityType: 'GOVT_MEDICAL_COLLEGE',
      phone: '+91 44 2742 6566',
      hotline: '108 / 044-27426566',
      medicalSuperintendent: 'Dr. R. Rajendran, MS (Ortho)',
      totalBeds: 1200,
      availableIcuBeds: 28,
      traumaSurgeonsOnDuty: 6,
      bloodBankStatus: 'ADEQUATE_ALL_GROUPS',
      oxygenReservePercent: 94,
      ambulancesAssigned: 8,
      alertStatus: 'CODE_RED_ACKNOWLEDGED',
      lastResponseTime: 'Just now',
      responseMessage: 'Trauma ICU Alert Activated: 20 critical beds reserved. 4 Advanced Life Support (ALS) ambulances mobilized toward Mudichur flood zone.',
      tamilResponseMessage: 'அதிதீவிர சிகிச்சைப் பிரிவு தயார்: 20 அவசர படுக்கைகள் ஒதுக்கப்பட்டுள்ளன. 4 ஆம்புலன்ஸ்கள் முடிச்சூர் பகுதிக்கு விரைந்துள்ளன.'
    },
    {
      id: 'hosp-chg-02',
      name: 'Tambaram Taluk Government Hospital (Chromepet GH)',
      tamilName: 'தாம்பரம் வட்ட அரசு பொது மருத்துவமனை (குரோம்பேட்டை)',
      district: 'Chengalpattu',
      state: 'Tamil Nadu',
      distanceKm: 6.8,
      etaMinutes: 12,
      facilityType: 'DISTRICT_HEADQUARTERS_HOSPITAL',
      phone: '+91 44 2241 1080',
      hotline: '108 / 044-22411080',
      medicalSuperintendent: 'Dr. M. Sangeetha, MD',
      totalBeds: 450,
      availableIcuBeds: 14,
      traumaSurgeonsOnDuty: 4,
      bloodBankStatus: 'CRITICAL_O_POS_AVAILABLE',
      oxygenReservePercent: 88,
      ambulancesAssigned: 5,
      alertStatus: 'ICU_BEDS_RESERVED',
      lastResponseTime: '2 mins ago',
      responseMessage: 'Emergency casualty ward cleared. Pediatric and trauma triage standing by with emergency power generators.',
      tamilResponseMessage: 'அவசர சிகிச்சை பிரிவு தயார் நிலையில் உள்ளது. ஜெனரேட்டர் மின் இணைப்பு உறுதி செய்யப்பட்டுள்ளது.'
    }
  ],

  'The Nilgiris': [
    {
      id: 'hosp-nil-01',
      name: 'Government District Headquarters Hospital, Ooty',
      tamilName: 'அரசு மாவட்ட தலைமை மருத்துவமனை, உதகை',
      district: 'The Nilgiris',
      state: 'Tamil Nadu',
      distanceKm: 3.5,
      etaMinutes: 9,
      facilityType: 'DISTRICT_HEADQUARTERS_HOSPITAL',
      phone: '+91 423 244 2212',
      hotline: '108 / 0423-2442212',
      medicalSuperintendent: 'Dr. P. Balasubramanian, MS',
      totalBeds: 520,
      availableIcuBeds: 18,
      traumaSurgeonsOnDuty: 5,
      bloodBankStatus: 'ADEQUATE_ALL_GROUPS',
      oxygenReservePercent: 96,
      ambulancesAssigned: 6,
      alertStatus: 'CODE_RED_ACKNOWLEDGED',
      lastResponseTime: 'Just now',
      responseMessage: 'Hill Terrain 4x4 Ambulance units dispatched to Coonoor Ghat rockfall corridor. Hypothermia kits and orthopedic trauma sets ready.',
      tamilResponseMessage: '4x4 மலைப்பாதை ஆம்புலன்ஸ்கள் குன்னூர் சாலைக்கு விரைந்துள்ளன. எலும்பு முறிவு மற்றும் அவசர மருத்துவ குழு தயார்.'
    },
    {
      id: 'hosp-nil-02',
      name: 'Coonoor Government Lawley Hospital',
      tamilName: 'குன்னூர் அரசு லாவ்லி மருத்துவமனை',
      district: 'The Nilgiris',
      state: 'Tamil Nadu',
      distanceKm: 7.1,
      etaMinutes: 14,
      facilityType: 'TRAUMA_CARE_CENTER',
      phone: '+91 423 223 0088',
      hotline: '108',
      medicalSuperintendent: 'Dr. S. Kavitha, DGO',
      totalBeds: 210,
      availableIcuBeds: 8,
      traumaSurgeonsOnDuty: 3,
      bloodBankStatus: 'ADEQUATE_ALL_GROUPS',
      oxygenReservePercent: 91,
      ambulancesAssigned: 3,
      alertStatus: 'ICU_BEDS_RESERVED',
      lastResponseTime: '4 mins ago',
      responseMessage: 'Trauma station active. Emergency oxygen beds reserved for landslide evacuees.',
      tamilResponseMessage: 'நிலச்சரிவில் காயமடைந்தோருக்கு அவசர சிகிச்சை படுக்கைகள் ஒதுக்கப்பட்டுள்ளன.'
    }
  ],

  'Wayanad': [
    {
      id: 'hosp-way-01',
      name: 'Wayanad District Government Hospital, Mananthavady',
      tamilName: 'வயநாடு மாவட்ட அரசு தலைமை மருத்துவமனை, மானந்தவாடி',
      district: 'Wayanad',
      state: 'Kerala',
      distanceKm: 8.5,
      etaMinutes: 16,
      facilityType: 'DISTRICT_HEADQUARTERS_HOSPITAL',
      phone: '+91 4935 240 223',
      hotline: '108 / 112',
      medicalSuperintendent: 'Dr. K. S. Manoj, MS',
      totalBeds: 600,
      availableIcuBeds: 22,
      traumaSurgeonsOnDuty: 7,
      bloodBankStatus: 'ADEQUATE_ALL_GROUPS',
      oxygenReservePercent: 95,
      ambulancesAssigned: 10,
      alertStatus: 'CODE_RED_ACKNOWLEDGED',
      lastResponseTime: 'Just now',
      responseMessage: 'Mass Casualty Protocol Initiated: 22 Trauma beds prepared with portable ventilator units for Chooralmala river surge.',
      tamilResponseMessage: 'பேரிடர் மருத்துவ நெறிமுறை துவங்கப்பட்டது: 22 அவசர சிகிச்சை படுக்கைகள் வெண்டிலேட்டர் வசதியுடன் தயார்.'
    },
    {
      id: 'hosp-way-02',
      name: 'DM WIMS Medical College & Super Specialty Hospital, Meppadi',
      tamilName: 'விம்ஸ் மருத்துவக் கல்லூரி மருத்துவமனை, மேப்பாடி',
      district: 'Wayanad',
      state: 'Kerala',
      distanceKm: 5.2,
      etaMinutes: 11,
      facilityType: 'GOVT_MEDICAL_COLLEGE',
      phone: '+91 4936 287 000',
      hotline: '108',
      medicalSuperintendent: 'Dr. Thomas Mathew, MCh',
      totalBeds: 750,
      availableIcuBeds: 34,
      traumaSurgeonsOnDuty: 8,
      bloodBankStatus: 'ADEQUATE_ALL_GROUPS',
      oxygenReservePercent: 98,
      ambulancesAssigned: 8,
      alertStatus: 'AMBULANCE_DISPATCHED',
      lastResponseTime: '1 min ago',
      responseMessage: '4 Advanced Mobile Trauma Resuscitation Vans dispatched to Meppadi triage point.',
      tamilResponseMessage: '4 அதிநவீன நடமாடும் தீவிர சிகிச்சை ஆம்புலன்ஸ்கள் சம்பவ இடத்திற்கு விரைந்துள்ளன.'
    }
  ],

  'Mumbai': [
    {
      id: 'hosp-mum-01',
      name: 'Lokmanya Tilak Municipal General Hospital & Trauma Centre (Sion Hospital)',
      tamilName: 'சியோன் மாநகராட்சி தலைமை அவசர சிகிச்சை மருத்துவமனை, மும்பை',
      district: 'Mumbai',
      state: 'Maharashtra',
      distanceKm: 3.1,
      etaMinutes: 7,
      facilityType: 'TRAUMA_CARE_CENTER',
      phone: '+91 22 2407 6381',
      hotline: '108 / 1916',
      medicalSuperintendent: 'Dr. Mohan Joshi, MS',
      totalBeds: 1800,
      availableIcuBeds: 42,
      traumaSurgeonsOnDuty: 12,
      bloodBankStatus: 'ADEQUATE_ALL_GROUPS',
      oxygenReservePercent: 97,
      ambulancesAssigned: 14,
      alertStatus: 'CODE_RED_ACKNOWLEDGED',
      lastResponseTime: 'Just now',
      responseMessage: 'Code Red Trauma response active. 30 Monsoon emergency beds with water-resistant amphibious medical vans deployed for Kurla / Mithi overflow.',
      tamilResponseMessage: 'மும்பை சியோன் அவசர மருத்துவப் பிரிவு தயார்: 30 அதிதீவிர படுக்கைகள் குர்லா வெள்ளப் பகுதிக்கு ஒதுக்கப்பட்டுள்ளன.'
    },
    {
      id: 'hosp-mum-02',
      name: 'KEM Hospital & Seth GS Medical College, Parel',
      tamilName: 'கே.இ.எம் அரசு மருத்துவக் கல்லூரி, பரேல், மும்பை',
      district: 'Mumbai',
      state: 'Maharashtra',
      distanceKm: 5.9,
      etaMinutes: 14,
      facilityType: 'GOVT_MEDICAL_COLLEGE',
      phone: '+91 22 2410 7000',
      hotline: '108',
      medicalSuperintendent: 'Dr. Sangeeta Ravat, MD',
      totalBeds: 2200,
      availableIcuBeds: 50,
      traumaSurgeonsOnDuty: 14,
      bloodBankStatus: 'ADEQUATE_ALL_GROUPS',
      oxygenReservePercent: 99,
      ambulancesAssigned: 12,
      alertStatus: 'ICU_BEDS_RESERVED',
      lastResponseTime: '3 mins ago',
      responseMessage: 'Casualty resuscitation bays cleared; 200 units of blood plasma on active standby.',
      tamilResponseMessage: 'அவசர சிகிச்சை பிரிவு தயார்; 200 பாட்டில்கள் ரத்த பிளாஸ்மா இருப்பு உறுதி செய்யப்பட்டுள்ளது.'
    }
  ],

  'Nagapattinam': [
    {
      id: 'hosp-nag-01',
      name: 'Nagapattinam Government Medical College & Hospital',
      tamilName: 'நாகப்பட்டினம் அரசு மருத்துவக் கல்லூரி மற்றும் மருத்துவமனை',
      district: 'Nagapattinam',
      state: 'Tamil Nadu',
      distanceKm: 4.8,
      etaMinutes: 10,
      facilityType: 'GOVT_MEDICAL_COLLEGE',
      phone: '+91 4365 250 108',
      hotline: '108 / 1077',
      medicalSuperintendent: 'Dr. V. Suganthi, MD',
      totalBeds: 700,
      availableIcuBeds: 24,
      traumaSurgeonsOnDuty: 6,
      bloodBankStatus: 'ADEQUATE_ALL_GROUPS',
      oxygenReservePercent: 93,
      ambulancesAssigned: 6,
      alertStatus: 'CODE_RED_ACKNOWLEDGED',
      lastResponseTime: 'Just now',
      responseMessage: 'Coastal storm surge casualty response ready. Tetanus, trauma sutures and saline drip mobile units en route to Velankanni shore.',
      tamilResponseMessage: 'கடற்கரை புயல் அலை அவசர சிகிச்சை தயார். வேலங்கண்ணி பகுதிக்கு மருந்து மற்றும் ஆம்புலன்ஸ் விரைந்துள்ளது.'
    }
  ]
};

// Fallback generic generator for any Indian district
export function getNearbyHospitals(district: string, state: string): NearbyHospital[] {
  if (MASTER_HOSPITAL_DATABASE[district]) {
    return MASTER_HOSPITAL_DATABASE[district];
  }

  // Generate dynamic district hospital & trauma center
  return [
    {
      id: `hosp-${district.toLowerCase().replace(/\s+/g, '-')}-01`,
      name: `${district} District Government Headquarters Hospital & Trauma ICU`,
      tamilName: `${district} மாவட்ட அரசு தலைமை மருத்துவமனை மற்றும் தீவிர சிகிச்சை பிரிவு`,
      district,
      state,
      distanceKm: 4.5,
      etaMinutes: 9,
      facilityType: 'DISTRICT_HEADQUARTERS_HOSPITAL',
      phone: '+91 44 2859 1080',
      hotline: '108 / 112',
      medicalSuperintendent: 'Chief District Medical Officer (CDMO)',
      totalBeds: 500,
      availableIcuBeds: 20,
      traumaSurgeonsOnDuty: 5,
      bloodBankStatus: 'ADEQUATE_ALL_GROUPS',
      oxygenReservePercent: 92,
      ambulancesAssigned: 6,
      alertStatus: 'CODE_RED_ACKNOWLEDGED',
      lastResponseTime: 'Just now',
      responseMessage: `Emergency Trauma Casualty & 108 Ambulance Units assigned to ${district} disaster sector. 20 ICU beds reserved.`,
      tamilResponseMessage: `${district} பேரிடர் பகுதிக்கு 108 ஆம்புலன்ஸ் மற்றும் 20 அவசர சிகிச்சை படுக்கைகள் ஒதுக்கப்பட்டுள்ளன.`
    },
    {
      id: `hosp-${district.toLowerCase().replace(/\s+/g, '-')}-02`,
      name: `${district} Sub-Divisional Hospital & Emergency Medical Hub`,
      tamilName: `${district} கோட்ட அரசு மருத்துவமனை`,
      district,
      state,
      distanceKm: 7.2,
      etaMinutes: 15,
      facilityType: 'TRAUMA_CARE_CENTER',
      phone: '+91 94450 10800',
      hotline: '108',
      medicalSuperintendent: 'Sub-Divisional Medical Officer',
      totalBeds: 220,
      availableIcuBeds: 10,
      traumaSurgeonsOnDuty: 3,
      bloodBankStatus: 'ADEQUATE_ALL_GROUPS',
      oxygenReservePercent: 88,
      ambulancesAssigned: 3,
      alertStatus: 'ICU_BEDS_RESERVED',
      lastResponseTime: '2 mins ago',
      responseMessage: `Triage medical relief team mobilized. Mobile saline and oxygen response ready for ${district}.`,
      tamilResponseMessage: `நடமாடும் மருத்துவ நிவாரண குழு மற்றும் ஆக்ஸிஜன் வசதி தயார் நிலையில் உள்ளது.`
    }
  ];
}

// Global active in-memory hospital state tracker so user actions and auto-dispatches update live
const activeHospitalStateMap: Record<string, NearbyHospital[]> = {};

export function getLiveNearbyHospitals(district: string, state: string): NearbyHospital[] {
  const key = `${district}_${state}`;
  if (!activeHospitalStateMap[key]) {
    activeHospitalStateMap[key] = getNearbyHospitals(district, state);
  }
  return activeHospitalStateMap[key];
}

export function triggerHospitalAlertResponse(
  district: string,
  state: string,
  hospitalId: string,
  newStatus: HospitalAlertStatus,
  customResponse?: string
): NearbyHospital[] {
  const key = `${district}_${state}`;
  const list = getLiveNearbyHospitals(district, state);
  
  const updated = list.map(h => {
    if (h.id === hospitalId || hospitalId === 'ALL') {
      return {
        ...h,
        alertStatus: newStatus,
        lastResponseTime: 'Just now',
        responseMessage: customResponse || (
          newStatus === 'AMBULANCE_DISPATCHED'
            ? `🚑 All ${h.ambulancesAssigned} Critical Care 108 Ambulances dispatched to disaster epicenter. Trauma surgical team standing by.`
            : newStatus === 'ICU_BEDS_RESERVED'
              ? `🛏️ ${h.availableIcuBeds} Trauma ICU beds held for casualty arrivals. Power generators verified.`
              : `🚨 Code-Red Emergency Alert Acknowledged by Medical Superintendent.`
        ),
        tamilResponseMessage: newStatus === 'AMBULANCE_DISPATCHED'
          ? `🚑 ${h.ambulancesAssigned} அவசர ஆம்புலன்ஸ்கள் களத்திற்கு விரைந்துள்ளன. அறுவை சிகிச்சை குழுவினர் தயார்.`
          : `🛏️ ${h.availableIcuBeds} தீவிர சிகிச்சை படுக்கைகள் தயார் நிலையில் உள்ளன.`
      };
    }
    return h;
  });

  activeHospitalStateMap[key] = updated;
  return updated;
}
