export type DisasterType =
  | 'FLOOD'
  | 'FLASH FLOOD'
  | 'URBAN FLOOD'
  | 'COASTAL FLOOD'
  | 'CYCLONE'
  | 'HEAVY RAINFALL'
  | 'LANDSLIDE'
  | 'WILDFIRE'
  | 'BUILDING DAMAGE'
  | 'ROAD BLOCKAGE'
  | 'BRIDGE DAMAGE'
  | 'STORM DAMAGE'
  | 'WATERLOGGING'
  | 'EXTREME WEATHER'
  | 'RIVERBANK EROSION';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ResponseStatus =
  | 'DETECTED'
  | 'AI ANALYZED'
  | 'AWAITING AUTHORIZATION'
  | 'AUTHORIZED'
  | 'TEAM ASSIGNED'
  | 'FIELD VERIFICATION'
  | 'EN ROUTE'
  | 'ON SITE'
  | 'RESPONSE IN PROGRESS'
  | 'MONITORING'
  | 'RESOLVED';

export type DistrictZone = 'Coastal' | 'Western Ghats' | 'Delta' | 'Northern' | 'Southern' | 'Central' | 'Eastern' | 'Western' | 'North-Eastern' | 'Himalayan' | (string & {});

export type AreaClassification = 'URBAN' | 'RURAL' | 'COASTAL' | 'HILL_TRIBAL';

export interface DistrictAuthority {
  district: string;
  state?: string;
  officer: string;
  designation: string;
  officeAddress: string;
  emergencyContact: string;
  source: string;
  lastVerified: string;
  isVerified: boolean;
}

export interface District {
  id: string;
  name: string;
  tamilName: string;
  state: string; // Indian State or Union Territory
  stateTamilName?: string;
  headquarters: string;
  latitude: number;
  longitude: number;
  zone: DistrictZone;
  areaClassification?: AreaClassification;
  typicalHazards: (DisasterType | string)[];
  populationEstimate: number;
  currentRiskScore: number; // 0 - 100
  activeIncidentsCount: number;
  weatherSummary: {
    tempC: number;
    rainfallMm: number;
    windKmh: number;
    condition: string;
  };
  authority: DistrictAuthority;
}

export interface EvidenceItem {
  id: string;
  source: 'Weather' | 'Satellite' | 'AI Vision' | 'Report' | 'Terrain' | 'Sensor';
  description: string;
  confidence: number;
  timestamp: string;
  freshness: 'FRESH' | 'RECENT' | 'HISTORICAL' | 'DEMO';
  indicatorValue?: string;
  imageUrl?: string;
  conflicting?: boolean;
}

export interface PredictionData {
  riskLevel: AlertSeverity;
  confidence: number;
  horizonHours: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  reasons: string[];
}

export interface StructuredAreaMessage {
  areaType: 'URBAN' | 'RURAL';
  classification?: string;
  targetDemographic?: string;
  targetDemographicTamil?: string;
  englishHeader?: string;
  englishInstructions?: string[];
  evacuationPoint?: string;
  tamilHeader?: string;
  tamilInstructions?: string[];
  evacuationPointTamil?: string;
  english: {
    header: string;
    subHeader: string;
    locationTags: string;
    immediateThreat: string;
    criticalAdvisories: string[]; // e.g., Urban: High-rise, basement cars, transformers; Rural: Livestock evacuation, bund breach, well chlorination
    evacuationHub: string;
    medicalTeamStatus: string;
    emergencyTeamsAlert: string;
    hotlines: string;
  };
  tamil: {
    header: string;
    subHeader: string;
    locationTags: string;
    immediateThreat: string;
    criticalAdvisories: string[]; // e.g., கால்நடை வெளியேற்றம், அணை நீர் திறப்பு, மின்மாற்றி நிறுத்தம்
    evacuationHub: string;
    medicalTeamStatus: string;
    emergencyTeamsAlert: string;
    hotlines: string;
  };
}

export interface CitizenWarning {
  englishTitle: string;
  englishLocation: string;
  englishDescription: string;
  englishWhatToDo: string[];
  englishWhatNotToDo: string[];
  tamilTitle: string;
  tamilLocation: string;
  tamilDescription: string;
  tamilWhatToDo: string[];
  tamilWhatNotToDo: string[];
  affectedRadiusKm: number;
  simulatedRecipientCount: number;
  smsStatus: 'READY' | 'AUTHORIZED' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'SIMULATED';
  urbanStructure?: StructuredAreaMessage;
  ruralStructure?: StructuredAreaMessage;
}

export interface RecommendedDepartment {
  role: 'PRIMARY' | 'SUPPORTING' | 'LOCAL_COORDINATION' | 'MEDICAL' | 'TRAFFIC_CONTROL';
  departmentName: string;
  tamilName: string;
  contactChannel: string;
  recommendedAction: string;
}

export interface HumanApproval {
  isApproved: boolean;
  authorizedBy?: string;
  authorizedAt?: string;
  role?: string;
  operatorNotes?: string;
  modifiedPriority?: number;
}

export interface TimelineEvent {
  id: string;
  time: string;
  timestamp: number;
  title: string;
  description: string;
  agentSource: string;
  severity?: AlertSeverity;
}

export interface AlertIncident {
  id: string;
  title: string;
  disasterType: DisasterType;
  locationName: string;
  district: string;
  state: string; // Indian State or Union Territory
  stateTamilName?: string;
  taluk?: string;
  areaClassification?: AreaClassification;
  latitude: number;
  longitude: number;
  severity: AlertSeverity;
  riskScore: number; // 0 - 100
  priorityScore: number; // 0 - 100
  detectionConfidence: number;
  predictionConfidence: number;
  status: ResponseStatus;
  createdAt: string;
  updatedAt: string;
  evidence: EvidenceItem[];
  prediction: PredictionData;
  districtAuthority: DistrictAuthority;
  citizenWarning: CitizenWarning;
  recommendedDepartments: RecommendedDepartment[];
  recommendedActions: string[];
  approval: HumanApproval;
  timeline: TimelineEvent[];
  hasConflictingEvidence?: boolean;
  imageryStatus?: 'LIVE' | 'NEAR-REAL-TIME' | 'RECENT' | 'DEMO' | 'UNAVAILABLE';
  imageUrl?: string;
}

export interface AutomatedSmsDispatchLog {
  id: string;
  timestamp: string;
  incidentId: string;
  customNumbers: string[];
  medicalTeams: {
    name: string;
    phone: string;
    category: string;
    status: 'DISPATCHED' | 'ACKNOWLEDGED';
  }[];
  responseTeams: {
    name: string;
    phone: string;
    category: string;
    status: 'DISPATCHED' | 'ACKNOWLEDGED';
  }[];
  areaType: 'URBAN' | 'RURAL';
  language: 'en' | 'ta' | 'bilingual';
  formattedMessageTamil: string;
  formattedMessageEnglish: string;
  carrierDeliveryStatus: 'DELIVERED_TO_TOWERS' | 'SIMULATED_SUCCESS';
}

export interface ResponseFacility {
  id: string;
  name: string;
  type: 'FIRE_STATION' | 'HOSPITAL' | 'POLICE_STATION' | 'SHELTER' | 'SDRF_BASE';
  latitude: number;
  longitude: number;
  district: string;
  capacity?: number;
  status: 'READY' | 'DEPLOYED' | 'STANDBY';
  phone?: string;
}

export interface UserSession {
  username: string;
  name: string;
  role: 'STATE_COMMANDER' | 'DISTRICT_COLLECTOR' | 'SDRF_OFFICER' | 'FIELD_VERIFIER' | 'OBSERVER';
  districtScope: string; // 'ALL' or specific district
  token: string;
  lastSync: string;
}

export interface SystemServiceHealth {
  name: string;
  status: 'CONNECTED' | 'DEGRADED' | 'FALLBACK' | 'OFFLINE';
  latencyMs: number;
  lastChecked: string;
  details: string;
}

export type AlarmToneType = 'CRITICAL_WARBLE' | 'CYCLONE_HORN' | 'FLOOD_SIREN' | 'STANDBY_CHIME' | 'ALL_CLEAR';

export interface AlarmRule {
  id: string;
  name: string;
  enabled: boolean;
  metric: 'RAINFALL' | 'RISK_SCORE' | 'WATER_DEPTH' | 'WIND_SPEED' | 'CRITICAL_SEVERITY';
  threshold: number;
  unit: string;
  tone: AlarmToneType;
}

export interface AlarmLog {
  id: string;
  timestamp: string;
  time: string;
  tone: AlarmToneType;
  district: string;
  triggeredBy: string;
  reason: string;
  status: 'COMPLETED' | 'ACTIVE' | 'STOPPED';
}

