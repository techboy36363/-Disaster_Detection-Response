import { AlertIncident, ResponseFacility } from '../types';
import { generateUrbanStructuredMessage, generateRuralStructuredMessage } from '../utils/smsDispatchService';

const RAW_TAMIL_NADU_INCIDENTS: AlertIncident[] = [
  {
    id: 'TN-INC-2025-001',
    title: 'Severe Urban Flash Flooding & Low-Lying Inundation',
    disasterType: 'URBAN FLOOD',
    locationName: 'Mudichur & Varadharajapuram',
    district: 'Chengalpattu',
    state: 'Tamil Nadu',
    taluk: 'Tambaram / Kundrathur Border',
    areaClassification: 'URBAN',
    latitude: 12.9249,
    longitude: 80.0768,
    severity: 'CRITICAL',
    riskScore: 92,
    priorityScore: 94,
    detectionConfidence: 91,
    predictionConfidence: 87,
    status: 'AWAITING AUTHORIZATION',
    createdAt: '2025-02-15T08:30:00Z',
    updatedAt: '2025-02-15T09:45:00Z',
    hasConflictingEvidence: false,
    imageryStatus: 'NEAR-REAL-TIME',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    evidence: [
      {
        id: 'ev-1',
        source: 'Weather',
        description: 'Automatic Weather Station (AWS) recorded 142.5 mm rainfall in last 6 hours; forecast predicts 35 mm/hr downpour continuing.',
        confidence: 96,
        timestamp: '10 mins ago',
        freshness: 'FRESH',
        indicatorValue: '142.5 mm / 6h'
      },
      {
        id: 'ev-2',
        source: 'AI Vision',
        description: 'Automated field camera & drone feed analyzed via Gemini Vision: Detected 3.5 ft standing floodwater across residential streets and ground floors.',
        confidence: 93,
        timestamp: '5 mins ago',
        freshness: 'FRESH',
        indicatorValue: 'Floodwater Depth 3.5 ft'
      },
      {
        id: 'ev-3',
        source: 'Satellite',
        description: 'Copernicus Sentinel-1 SAR water inundation proxy: High surface reflectance change indicating 4.2 sq km inundation in Adyar basin lowlands.',
        confidence: 88,
        timestamp: '1 hour ago',
        freshness: 'RECENT',
        indicatorValue: '4.2 km² water spread'
      },
      {
        id: 'ev-4',
        source: 'Report',
        description: 'Verified Field Officer Report from Revenue Inspector: Over 850 houses trapped in Mudichur Krishna Nagar with power cut initiated.',
        confidence: 95,
        timestamp: '15 mins ago',
        freshness: 'FRESH',
        indicatorValue: '850+ houses affected'
      },
      {
        id: 'ev-5',
        source: 'Terrain',
        description: 'SRTM Elevation model identifies Mudichur bowl depression (8m MSL) adjacent to overflowing Chembarambakkam surplus channel.',
        confidence: 99,
        timestamp: 'Historical',
        freshness: 'HISTORICAL',
        indicatorValue: '8m MSL Basin'
      }
    ],
    prediction: {
      riskLevel: 'CRITICAL',
      confidence: 89,
      horizonHours: 6,
      trend: 'INCREASING',
      reasons: [
        'Adyar River discharge peak expected within 3 hours from upstream Chembarambakkam outflow.',
        'High tide along Bay of Bengal (1.2m) slowing down coastal estuary drainage.',
        'Continuous radar echoes indicating persistent rainbands over Chengalpattu-Kancheepuram corridor.'
      ]
    },
    districtAuthority: {
      district: 'Chengalpattu',
      officer: 'District Collector',
      designation: 'District Collector & District Magistrate, IAS',
      officeAddress: 'District Collectorate, GST Road, Chengalpattu - 603001',
      emergencyContact: '044-27427412 / 1077',
      source: 'TNDMA Official Portal Verified Records',
      lastVerified: '2025-02-01',
      isVerified: true
    },
    citizenWarning: {
      englishTitle: 'CRITICAL FLOOD WARNING - MUDICHUR & ADJACENT AREAS',
      englishLocation: 'Mudichur, Varadharajapuram, Tambaram West, Chengalpattu District',
      englishDescription: 'Flood risk is CRITICAL due to rapid runoff and water accumulation. Inundation depth exceeding 3 feet on interior roads.',
      englishWhatToDo: [
        'Move immediately to first floor or designated cyclone/flood relief shelter.',
        'Keep drinking water, essential medicines, battery torch, and mobile power banks packed in waterproof bag.',
        'Follow instructions from Tamil Nadu Fire & Rescue and SDRF rescue boats.',
        'Call 1077 or 112 for emergency boat evacuation assistance.'
      ],
      englishWhatNotToDo: [
        'DO NOT attempt to drive or walk through moving water over 6 inches deep.',
        'DO NOT touch submerged power lines, junction boxes, or transformers.',
        'DO NOT drink unboiled tap or ground water.'
      ],
      tamilTitle: 'தீவிர வெள்ள அபாய எச்சரிக்கை - முடிச்சூர் பகுதி',
      tamilLocation: 'முடிச்சூர், வரதராஜபுரம், தாம்பரம் மேற்கு, செங்கல்பட்டு மாவட்டம்',
      tamilDescription: 'கனமழை மற்றும் அடையாறு உபரிநீர் பெருக்கெடுப்பால் முடிச்சூர் பகுதியில் தீவிர வெள்ள அபாயம் ஏற்பட்டுள்ளது.',
      tamilWhatToDo: [
        'உடனடியாக முதல் தளத்திற்கோ அல்லது அருகிலுள்ள நிவாரண மையத்திற்கோ செல்லவும்.',
        'குடிநீர், அத்தியாவசிய மருந்துகள் மற்றும் தொலைபேசியை பாதுகாப்பாக வைக்கவும்.',
        'தீயணைப்பு மற்றும் பேரிடர் மீட்பு படையினரின் வழிகாட்டுதல்களை பின்பற்றவும்.',
        'அவசர படகு மீட்பிற்கு 1077 அல்லது 112 எண்ணை தொடர்பு கொள்ளவும்.'
      ],
      tamilWhatNotToDo: [
        'வெள்ளம் சூழ்ந்த சாலைகளில் வாகனங்களை இயக்கவோ அல்லது நடக்கவோ வேண்டாம்.',
        'மின்சார கம்பங்கள் அல்லது மூழ்கிய டிரான்ஸ்பார்மர்களை தொட வேண்டாம்.',
        'கொதிக்க வைக்காத நீரை குடிக்க வேண்டாம்.'
      ],
      affectedRadiusKm: 5.5,
      simulatedRecipientCount: 38400,
      smsStatus: 'READY'
    },
    recommendedDepartments: [
      {
        role: 'PRIMARY',
        departmentName: 'Tamil Nadu Fire and Rescue Services (TNFRS) & SDRF',
        tamilName: 'தீயணைப்பு மற்றும் மீட்பு பணிகள் & மாநில பேரிடர் மீட்பு படை',
        contactChannel: 'VHF Ch-4 / Hot line 101 / 112',
        recommendedAction: 'Deploy 6 inflatable Zodiac rescue boats and 35 trained swimmers to Krishna Nagar & Varadharajapuram low-lying sectors.'
      },
      {
        role: 'SUPPORTING',
        departmentName: 'TANGEDCO (Electricity Board)',
        tamilName: 'தமிழ்நாடு மின் உற்பத்தி மற்றும் பகிர்மான கழகம்',
        contactChannel: 'Tambaram Circle SE Desk',
        recommendedAction: 'Isolate electrical feed to flooded distribution pillars in Mudichur sub-station sector to eliminate electrocution hazards.'
      },
      {
        role: 'LOCAL_COORDINATION',
        departmentName: 'Tambaram Municipal Corporation & District Revenue',
        tamilName: 'தாம்பரம் மாநகராட்சி & வருவாய்த்துறை',
        contactChannel: 'Collectorate Control Room Ext 104',
        recommendedAction: 'Open 4 relief shelters in Government High School Mudichur and community halls; arrange hot meals and drinking water tankers.'
      },
      {
        role: 'MEDICAL',
        departmentName: 'Department of Health & Family Welfare (108 EMRI)',
        tamilName: 'மருத்துவம் மற்றும் மக்கள் நல்வாழ்வுத்துறை',
        contactChannel: 'Chengalpattu 108 Operations Wing',
        recommendedAction: 'Stage 3 4x4 high-clearance ambulances at Tambaram GST junction with chlorine tablets, ORS, and anti-venom.'
      },
      {
        role: 'TRAFFIC_CONTROL',
        departmentName: 'Tambaram Police Commissionerate (Traffic Division)',
        tamilName: 'தாம்பரம் காவல் ஆணையரகம் (போக்குவரத்து)',
        contactChannel: 'Tambaram Traffic Control Room',
        recommendedAction: 'Divert vehicular traffic from Outer Ring Road Mudichur ramp; barricade submerged causeway.'
      }
    ],
    recommendedActions: [
      'Issue immediate localized alert to 38,400 residents within 5.5 km zone',
      'Authorize SDRF inflatable boat deployment for priority elderly and infant evacuations',
      'Execute controlled power shut-down on submerged 11kV feeders',
      'Inspect Chembarambakkam reservoir release channel bund integrity',
      'Dispatch mobile medical teams with waterborne disease prophylactic kits'
    ],
    approval: {
      isApproved: false
    },
    timeline: [
      {
        id: 'tl-1',
        time: '08:30',
        timestamp: Date.now() - 3600000 * 2,
        title: 'Heavy Rainfall Anomaly Detected',
        description: 'Automated Weather Station flagged >40mm/hr rainfall in Tambaram catchment.',
        agentSource: 'Data Monitoring Agent'
      },
      {
        id: 'tl-2',
        time: '08:45',
        timestamp: Date.now() - 3600000 * 1.7,
        title: 'Satellite Soil Saturation Confirmed',
        description: 'NASA/Copernicus radar data showed 98% catchment saturation in Adyar watershed.',
        agentSource: 'Satellite / Geospatial Agent'
      },
      {
        id: 'tl-3',
        time: '09:15',
        timestamp: Date.now() - 3600000 * 1.2,
        title: 'Computer Vision Detected Deep Waterlogging',
        description: 'Drone and traffic junction camera analyzed: Standing water levels reached 3.5 ft.',
        agentSource: 'Vision Disaster Detection Agent'
      },
      {
        id: 'tl-4',
        time: '09:30',
        timestamp: Date.now() - 3600000 * 0.9,
        title: 'Multi-Agent Evidence Fusion Elevated Risk',
        description: 'Weather, terrain, and visual evidence combined: Risk score escalated from 65 to 92.',
        agentSource: 'Fusion & Priority Agent'
      },
      {
        id: 'tl-5',
        time: '09:45',
        timestamp: Date.now() - 3600000 * 0.5,
        title: 'CRITICAL Alert Generated - Awaiting Human Approval',
        description: 'Tamil and English citizen warnings pre-generated. Siren alarm triggered in SEOC console.',
        agentSource: 'Alert Engine & Copilot'
      }
    ]
  },
  {
    id: 'TN-INC-2025-002',
    title: 'Major Landslide & Highway Cut-Off on Coonoor Ghat Road',
    disasterType: 'LANDSLIDE',
    locationName: 'Marappalam, Coonoor Ghat (NH-181)',
    district: 'Nilgiris',
    state: 'Tamil Nadu',
    taluk: 'Coonoor',
    areaClassification: 'HILL_TRIBAL',
    latitude: 11.3530,
    longitude: 76.7959,
    severity: 'CRITICAL',
    riskScore: 89,
    priorityScore: 91,
    detectionConfidence: 94,
    predictionConfidence: 85,
    status: 'AWAITING AUTHORIZATION',
    createdAt: '2025-02-15T07:15:00Z',
    updatedAt: '2025-02-15T09:20:00Z',
    hasConflictingEvidence: false,
    imageryStatus: 'LIVE',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    evidence: [
      {
        id: 'ev-l1',
        source: 'Weather',
        description: 'Coonoor hill station recorded 128mm continuous downpour over 12 hours. Slope soil shear threshold breached.',
        confidence: 95,
        timestamp: '25 mins ago',
        freshness: 'FRESH',
        indicatorValue: '128 mm / 12h'
      },
      {
        id: 'ev-l2',
        source: 'AI Vision',
        description: 'Highways surveillance camera feed: Massive debris flow, 400 metric tonnes of boulders and mud blocking NH-181 across both lanes.',
        confidence: 96,
        timestamp: '12 mins ago',
        freshness: 'FRESH',
        indicatorValue: 'Two-lane blocked by 400T debris'
      },
      {
        id: 'ev-l3',
        source: 'Report',
        description: 'Highways Sub-Divisional Engineer confirmed 6 vehicles safely stopped; zero reported casualties but lifeline route to Ooty cut.',
        confidence: 92,
        timestamp: '18 mins ago',
        freshness: 'FRESH',
        indicatorValue: 'Vehicular stoppage'
      }
    ],
    prediction: {
      riskLevel: 'CRITICAL',
      confidence: 85,
      horizonHours: 12,
      trend: 'INCREASING',
      reasons: [
        'Active geological fault line along Coonoor-Mettupalayam ghat sector.',
        'High water table saturation indicates risk of secondary mud slips within 4 hours if rain continues.',
        'Night fog will severely limit clearing machinery operations.'
      ]
    },
    districtAuthority: {
      district: 'Nilgiris',
      officer: 'District Collector',
      designation: 'District Collector & District Magistrate, IAS',
      officeAddress: 'Collectorate, Udhagamandalam, The Nilgiris - 643001',
      emergencyContact: '0423-2443883 / 1077',
      source: 'High-Risk Mountain Hazard Cell, TNDMA',
      lastVerified: '2025-02-04',
      isVerified: true
    },
    citizenWarning: {
      englishTitle: 'LANDSLIDE ROAD CLOSURE ALERT - COONOOR GHAT (NH-181)',
      englishLocation: 'Marappalam & Coonoor Ghat, Nilgiris District',
      englishDescription: 'Massive landslide has blocked NH-181 Coonoor Ghat road. All vehicular traffic suspended between Mettupalayam and Coonoor.',
      englishWhatToDo: [
        'Use alternate Kotagiri route only if emergency permits and verified by police.',
        'Do not travel uphill during nighttime or heavy fog conditions.',
        'Listen to All India Radio Ooty or TNDMA broadcasts for road clearance status.'
      ],
      englishWhatNotToDo: [
        'DO NOT bypass police checkposts at Kallar or Burliyar.',
        'DO NOT stand near unstable earth cuttings or hillside retaining walls.'
      ],
      tamilTitle: 'நிலச்சரிவு எச்சரிக்கை மற்றும் சாலை அடைப்பு - குன்னூர் மலைப்பாதை',
      tamilLocation: 'மரப்பாலம், குன்னூர் மலைப்பாதை (NH-181), நீலகிரி மாவட்டம்',
      tamilDescription: 'குன்னூர் மலைப்பாதையில் பெரும் நிலச்சரிவு ஏற்பட்டுள்ளதால் மேட்டுப்பாளையம் - குன்னூர் இடையே போக்குவரத்து முற்றிலும் நிறுத்தப்பட்டுள்ளது.',
      tamilWhatToDo: [
        'அவசர தேவைக்கு மட்டும் கோத்தகிரி மாற்றுப் பாதையை காவல்துறையினரின் வழிகாட்டுதலோடு பயன்படுத்தவும்.',
        'கனமழை அல்லது மூடுபனி நிலவும் போது மலைப்பயணத்தை தவிர்க்கவும்.'
      ],
      tamilWhatNotToDo: [
        'கல்லாறு அல்லது பர்லியார் சோதனைச் சாவடிகளை மீறி செல்ல வேண்டாம்.',
        'சரிவு அபாயமுள்ள மண் திட்டுகளின் அருகில் நிற்க வேண்டாம்.'
      ],
      affectedRadiusKm: 8.0,
      simulatedRecipientCount: 14200,
      smsStatus: 'READY'
    },
    recommendedDepartments: [
      {
        role: 'PRIMARY',
        departmentName: 'State Highways Department (Ghat Maintenance Wing)',
        tamilName: 'மாநில நெடுஞ்சாலைத்துறை (மலைப்பாதை பராமரிப்பு பிரிவு)',
        contactChannel: 'Highways Coonoor Sub-Division',
        recommendedAction: 'Mobilize 4 hydraulic excavators (JCB/Poclain) and dumpers to clear 400 metric tons of boulder debris.'
      },
      {
        role: 'SUPPORTING',
        departmentName: 'Tamil Nadu Fire and Rescue Services & Forest Department',
        tamilName: 'தீயணைப்புத்துறை & வனத்துறை',
        contactChannel: 'Nilgiris Emergency Control',
        recommendedAction: 'Clear fallen eucalyptus and silver oak trees tangled with electrical cables on the slope.'
      },
      {
        role: 'TRAFFIC_CONTROL',
        departmentName: 'Nilgiris District Police',
        tamilName: 'நீலகிரி மாவட்ட காவல்',
        contactChannel: '100 / District Control',
        recommendedAction: 'Close entry at Kallar Checkpost and Coonoor SIMS Park junction. Divert light motor vehicles via Kotagiri.'
      }
    ],
    recommendedActions: [
      'Authorize road closure order under Disaster Management Act Sec 34',
      'Deploy heavy machinery for debris removal with searchlights',
      'Issue warning to tourist buses at Mettupalayam foothills',
      'Deploy geotechnical team to inspect upper slope stability before opening single lane'
    ],
    approval: {
      isApproved: false
    },
    timeline: [
      {
        id: 'tl-l1',
        time: '07:15',
        timestamp: Date.now() - 3600000 * 2.5,
        title: 'Geotechnical Inundation Sensor Spike',
        description: 'Slope inclinometer at Marappalam registered sudden micro-displacement.',
        agentSource: 'Data Monitoring Agent'
      },
      {
        id: 'tl-l2',
        time: '07:40',
        timestamp: Date.now() - 3600000 * 2.1,
        title: 'AI Vision Identified Boulder Collapse',
        description: 'Highway camera frame processed: 400 metric tonnes earth movement covering roadway.',
        agentSource: 'Vision Disaster Detection Agent'
      },
      {
        id: 'tl-l3',
        time: '09:20',
        timestamp: Date.now() - 3600000 * 0.7,
        title: 'High Priority Alert Issued',
        description: 'Human approval sought for NH-181 emergency closure and heavy equipment dispatch.',
        agentSource: 'Alert Agent'
      }
    ]
  },
  {
    id: 'TN-INC-2025-003',
    title: 'Severe Cyclone Wind & Storm Surge Watch',
    disasterType: 'CYCLONE',
    locationName: 'Velankanni & Vedaranyam Coast',
    district: 'Nagapattinam',
    state: 'Tamil Nadu',
    taluk: 'Kilvelur / Vedaranyam',
    areaClassification: 'COASTAL',
    latitude: 10.6811,
    longitude: 79.8492,
    severity: 'HIGH',
    riskScore: 84,
    priorityScore: 86,
    detectionConfidence: 93,
    predictionConfidence: 89,
    status: 'AUTHORIZED',
    createdAt: '2025-02-15T06:00:00Z',
    updatedAt: '2025-02-15T09:00:00Z',
    hasConflictingEvidence: false,
    imageryStatus: 'NEAR-REAL-TIME',
    imageUrl: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=800&q=80',
    evidence: [
      {
        id: 'ev-c1',
        source: 'Weather',
        description: 'IMD Doppler Radar Karaikal tracks severe cyclonic system 140km offshore moving NW; gusting winds to 75-85 km/h.',
        confidence: 96,
        timestamp: '30 mins ago',
        freshness: 'FRESH',
        indicatorValue: 'Gales 85 km/h'
      },
      {
        id: 'ev-c2',
        source: 'Satellite',
        description: 'INSAT-3DR Rapid Scan Water Vapor & Visible: Well-defined spiraling eye wall with heavy precipitation bands grazing Nagapattinam coast.',
        confidence: 94,
        timestamp: '45 mins ago',
        freshness: 'RECENT',
        indicatorValue: 'Spiraling rainbands'
      },
      {
        id: 'ev-c3',
        source: 'Sensor',
        description: 'INCOIS Coastal Wave Rider Buoy Nagapattinam reports significant wave height of 3.8m with 1m tidal surge.',
        confidence: 97,
        timestamp: '15 mins ago',
        freshness: 'FRESH',
        indicatorValue: '3.8m Wave Height'
      }
    ],
    prediction: {
      riskLevel: 'HIGH',
      confidence: 89,
      horizonHours: 12,
      trend: 'INCREASING',
      reasons: [
        'Tide tables show high tide at 14:30 combining with 1m storm surge.',
        'Coastal thatched hut clusters vulnerable to wind gusts over 80 km/h.'
      ]
    },
    districtAuthority: {
      district: 'Nagapattinam',
      officer: 'District Collector',
      designation: 'District Collector & District Magistrate, IAS',
      officeAddress: 'Collectorate, Public Office Road, Nagapattinam - 611001',
      emergencyContact: '04365-252500 / 1077',
      source: 'TNDMA Coastal Warning Registry',
      lastVerified: '2025-02-05',
      isVerified: true
    },
    citizenWarning: {
      englishTitle: 'CYCLONIC STORM & SURGE ADVISORY - NAGAPATTINAM COAST',
      englishLocation: 'Velankanni, Nagapattinam, Vedaranyam Coastal Hamlets',
      englishDescription: 'Rough sea conditions with waves up to 3.8m and wind gusts reaching 85 km/h. Coastal inundation expected.',
      englishWhatToDo: [
        'Fishermen must strictly not venture into sea. Anchor mechanized boats safely in harbor.',
        'Coastal hamlet residents in thatched houses move to Multipurpose Cyclone Shelters.',
        'Store dry rations, drinking water, and fully charge cellphones.'
      ],
      englishWhatNotToDo: [
        'DO NOT visit beaches, tourist piers, or venture near sea walls.',
        'DO NOT park vehicles under large old banyan or neem trees.'
      ],
      tamilTitle: 'புயல் மற்றும் கடல் கொந்தளிப்பு எச்சரிக்கை - நாகப்பட்டினம் கடற்கரை',
      tamilLocation: 'வேளாங்கண்ணி, நாகப்பட்டினம், வேதாரண்யம் கடலோர கிராமங்கள்',
      tamilDescription: 'கடலில் 3.8 மீட்டர் உயரத்திற்கு அலைகள் எழும்புவதுடன், மணிக்கு 85 கி.மீ வேகத்தில் பலத்த காற்று வீசக்கூடும்.',
      tamilWhatToDo: [
        'மீனவர்கள் எக்காரணம் கொண்டும் கடலுக்குள் செல்ல வேண்டாம்.',
        'குடிசைகளில் வசிப்போர் உடனடியாக பல்நோக்கு புயல் பாதுகாப்பு மையங்களுக்கு செல்லவும்.'
      ],
      tamilWhatNotToDo: [
        'கடற்கரைக்கு செல்லவோ, அலைகளை பார்வையிடவோ வேண்டாம்.',
        'பழைய மரங்களின் கீழ் வாகனங்களை நிறுத்த வேண்டாம்.'
      ],
      affectedRadiusKm: 12.0,
      simulatedRecipientCount: 52000,
      smsStatus: 'SENT'
    },
    recommendedDepartments: [
      {
        role: 'PRIMARY',
        departmentName: 'Department of Fisheries & Coastal Security Group Police',
        tamilName: 'மீன்வளத்துறை & கடலோர பாதுகாப்பு குழுமம்',
        contactChannel: 'Nagapattinam Marine Police Station',
        recommendedAction: 'Verify 100% fishing boat return count at Nagapattinam and Vedaranyam jetties.'
      },
      {
        role: 'LOCAL_COORDINATION',
        departmentName: 'Revenue Disaster Relief Cell & Rural Development',
        tamilName: 'வருவாய்த்துறை & ஊரக வளர்ச்சித்துறை',
        contactChannel: 'District Collectorate Emergency Wing',
        recommendedAction: 'Activate 18 Multipurpose Cyclone Shelters (MPCS) along coastline with diesel gensets.'
      }
    ],
    recommendedActions: [
      'Activate 18 Multipurpose Cyclone Shelters across coastal taluks',
      'Enforce fishing ban and inspect harbor mooring lines',
      'Position rescue saws with local fire stations for fallen tree clearance',
      'Pre-position diesel generators at Government Hospital Nagapattinam'
    ],
    approval: {
      isApproved: true,
      authorizedBy: 'SEOC Director / Revenue Secretary, IAS',
      authorizedAt: '2025-02-15T07:30:00Z',
      role: 'State Disaster Management Commissioner',
      operatorNotes: 'Authorized immediate opening of all coastal cyclone shelters and 100% harbor recall.'
    },
    timeline: [
      {
        id: 'tl-c1',
        time: '06:00',
        timestamp: Date.now() - 3600000 * 3.5,
        title: 'Deep Depression Upgraded to Cyclonic System',
        description: 'IMD bulletin received by SEOC automated listener.',
        agentSource: 'Data Monitoring Agent'
      },
      {
        id: 'tl-c2',
        time: '07:10',
        timestamp: Date.now() - 3600000 * 2.3,
        title: 'Coastal Surge Wave Model Calculated',
        description: 'INCOIS wave forecast matched high tide timing at 14:30.',
        agentSource: 'Weather Risk Agent'
      },
      {
        id: 'tl-c3',
        time: '07:30',
        timestamp: Date.now() - 3600000 * 2.0,
        title: 'Response Authorized by State Commissioner',
        description: 'Human approval logged. Coastal cyclone shelters activated.',
        agentSource: 'Human Authorization'
      },
      {
        id: 'tl-c4',
        time: '08:00',
        timestamp: Date.now() - 3600000 * 1.5,
        title: 'Simulated Citizen Broadcast Queued',
        description: 'Bilingual alert sent to 52,000 residents via cellular broadcast simulation.',
        agentSource: 'Alert Agent'
      }
    ]
  },
  {
    id: 'TN-INC-2025-004',
    title: 'River Basin Swelling & Agricultural Inundation',
    disasterType: 'FLOOD',
    locationName: 'Pennaiyar River Basin, Panruti',
    district: 'Cuddalore',
    state: 'Tamil Nadu',
    taluk: 'Panruti / Cuddalore',
    areaClassification: 'RURAL',
    latitude: 11.7744,
    longitude: 79.5536,
    severity: 'MEDIUM',
    riskScore: 68,
    priorityScore: 65,
    detectionConfidence: 86,
    predictionConfidence: 80,
    status: 'FIELD VERIFICATION',
    createdAt: '2025-02-15T07:45:00Z',
    updatedAt: '2025-02-15T09:10:00Z',
    hasConflictingEvidence: true,
    imageryStatus: 'RECENT',
    evidence: [
      {
        id: 'ev-cud1',
        source: 'Weather',
        description: 'Upstream catchment receiving steady 62mm rainfall. River discharge at Sathanur Dam rising.',
        confidence: 90,
        timestamp: '40 mins ago',
        freshness: 'FRESH',
        indicatorValue: '62mm rainfall'
      },
      {
        id: 'ev-cud2',
        source: 'Satellite',
        description: 'Satellite optical pass indicated possible flood water spread over paddy fields.',
        confidence: 76,
        timestamp: '3 hours ago',
        freshness: 'RECENT',
        indicatorValue: 'Optical reflectance change',
        conflicting: true
      },
      {
        id: 'ev-cud3',
        source: 'Report',
        description: 'Village Administrative Officer (VAO) reported river within embankment limits with no residential flooding yet.',
        confidence: 92,
        timestamp: '20 mins ago',
        freshness: 'FRESH',
        indicatorValue: 'Within bank limits',
        conflicting: true
      }
    ],
    prediction: {
      riskLevel: 'MEDIUM',
      confidence: 80,
      horizonHours: 8,
      trend: 'STABLE',
      reasons: [
        'Conflicting evidence between satellite surface water detection and ground VAO report.',
        'Field verification required before issuing evacuation directives.'
      ]
    },
    districtAuthority: {
      district: 'Cuddalore',
      officer: 'District Collector',
      designation: 'District Collector & District Magistrate, IAS',
      officeAddress: 'Collectorate, Manjakuppam, Cuddalore - 607001',
      emergencyContact: '04142-221012 / 1077',
      source: 'TNDMA Coastal Vulnerability Cell',
      lastVerified: '2025-01-22',
      isVerified: true
    },
    citizenWarning: {
      englishTitle: 'RIVER DISCHARGE ADVISORY - THENPENNAIYAR BASIN',
      englishLocation: 'Panruti, Cuddalore District',
      englishDescription: 'River discharge is steadily rising. Low-lying agricultural lands adjacent to banks are under watch.',
      englishWhatToDo: [
        'Farmers should move cattle and pump sets away from river bank margins.',
        'Stay tuned to local revenue department announcements.'
      ],
      englishWhatNotToDo: [
        'DO NOT allow children to bathe or wash cattle in the river.'
      ],
      tamilTitle: 'தென்பெண்ணையாறு நீர்வரத்து எச்சரிக்கை',
      tamilLocation: 'பண்ருட்டி, கடலூர் மாவட்டம்',
      tamilDescription: 'ஆற்றில் நீர்வரத்து அதிகரித்துள்ளதால் ஆற்றுப்படுகை கிராம மக்கள் விழிப்புடன் இருக்க அறிவுறுத்தப்படுகிறார்கள்.',
      tamilWhatToDo: [
        'விவசாயிகள் ஆற்றுப்பகுதியிலிருந்து கால்நடைகளை பாதுகாப்பான மேடான இடத்திற்கு கொண்டு செல்லவும்.'
      ],
      tamilWhatNotToDo: [
        'ஆற்றில் இறங்கி குளிக்கவோ, துணி துவைக்கவோ வேண்டாம்.'
      ],
      affectedRadiusKm: 6.0,
      simulatedRecipientCount: 18500,
      smsStatus: 'READY'
    },
    recommendedDepartments: [
      {
        role: 'PRIMARY',
        departmentName: 'Water Resources Department (PWD / WRD)',
        tamilName: 'நீர்வளத்துறை',
        contactChannel: 'Lower Pennaiyar Sub-Division Desk',
        recommendedAction: 'Inspect causeway gauge markers and regulate check-dam sluices.'
      },
      {
        role: 'LOCAL_COORDINATION',
        departmentName: 'Revenue Department (Tahsildar Panruti)',
        tamilName: 'வருவாய்த்துறை (வட்டாட்சியர் பண்ருட்டி)',
        contactChannel: 'Panruti Taluk Office',
        recommendedAction: 'Send Revenue Inspector for on-site physical verification of bund levels.'
      }
    ],
    recommendedActions: [
      'Dispatch field verification team to resolve conflicting satellite water spread report',
      'Alert riverside villages via temple loudspeaker and tom-tom announcements',
      'Stock sandbags at vulnerable meander curves'
    ],
    approval: {
      isApproved: true,
      authorizedBy: 'District Collector Cuddalore, IAS',
      authorizedAt: '2025-02-15T08:15:00Z',
      role: 'District Magistrate',
      operatorNotes: 'Ordered on-site physical inspection; hold evacuation warning until VAO verifies.'
    },
    timeline: [
      {
        id: 'tl-cud1',
        time: '07:45',
        timestamp: Date.now() - 3600000 * 2.0,
        title: 'Pennaiyar Water Level Alert',
        description: 'Upstream rainfall triggered threshold monitor.',
        agentSource: 'Data Monitoring Agent'
      },
      {
        id: 'tl-cud2',
        time: '08:15',
        timestamp: Date.now() - 3600000 * 1.5,
        title: 'Conflicting Ground vs Satellite Evidence Flagged',
        description: 'Satellite showed water reflection; VAO confirmed river within banks.',
        agentSource: 'Fusion Agent'
      },
      {
        id: 'tl-cud3',
        time: '09:10',
        timestamp: Date.now() - 3600000 * 0.5,
        title: 'Status: FIELD VERIFICATION',
        description: 'Revenue Inspector dispatched to take ground geotagged photos.',
        agentSource: 'Response Assistant'
      }
    ]
  }
];

// National Alerts across Indian States
export const NATIONAL_INCIDENTS: AlertIncident[] = [
  {
    id: 'IND-KL-2025-005',
    title: 'Severe Landslide & Debris Torrential Flow',
    disasterType: 'LANDSLIDE',
    locationName: 'Chooralmala & Meppadi, Vythiri Taluk',
    district: 'Wayanad',
    state: 'Kerala',
    taluk: 'Vythiri',
    areaClassification: 'HILL_TRIBAL',
    latitude: 11.5392,
    longitude: 76.1550,
    severity: 'CRITICAL',
    riskScore: 96,
    priorityScore: 98,
    detectionConfidence: 94,
    predictionConfidence: 91,
    status: 'AWAITING AUTHORIZATION',
    createdAt: '2025-02-15T07:15:00Z',
    updatedAt: '2025-02-15T09:30:00Z',
    hasConflictingEvidence: false,
    imageryStatus: 'NEAR-REAL-TIME',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    evidence: [
      {
        id: 'ev-kl-1',
        source: 'Weather',
        description: 'IMD Automatic Weather Station recorded 282mm extreme cloudburst in 24 hours over Western Ghats catchment.',
        confidence: 97,
        timestamp: '15 mins ago',
        freshness: 'FRESH',
        indicatorValue: '282 mm / 24h'
      },
      {
        id: 'ev-kl-2',
        source: 'AI Vision',
        description: 'Satellite & drone imagery detected multiple slope slips, washed bridges, and river diversion into residential pockets.',
        confidence: 93,
        timestamp: '25 mins ago',
        freshness: 'FRESH',
        indicatorValue: 'Bridges washed out'
      }
    ],
    prediction: {
      riskLevel: 'CRITICAL',
      confidence: 92,
      horizonHours: 8,
      trend: 'INCREASING',
      reasons: [
        'Soil saturation at 98% field capacity on steep 38-degree slopes.',
        'Heavy runoff continuing down Iruvanipuzha river tributary.'
      ]
    },
    districtAuthority: {
      district: 'Wayanad',
      state: 'Kerala',
      officer: 'District Collector & Magistrate',
      designation: 'District Collector, IAS',
      officeAddress: 'Collectorate, Kalpetta, Wayanad - 673122',
      emergencyContact: '04936-204151 / 1077',
      source: 'KSDMA State Emergency Operations Centre',
      lastVerified: '2025-02-15',
      isVerified: true
    },
    citizenWarning: {
      englishTitle: 'EXTREME LANDSLIDE EMERGENCY - CHOORALMALA & MEPPADI',
      englishLocation: 'Chooralmala, Meppadi, Vythiri Taluk, Wayanad, Kerala',
      englishDescription: 'Catastrophic landslide risk with heavy mudflow and river surging. Immediate evacuation order active.',
      englishWhatToDo: [
        'Move immediately away from hillsides, drainage valleys, and riverbanks to Kalpetta or designated camps.',
        'Keep emergency battery torches, identity papers, and medicines in waterproof pouches.',
        'Follow instructions of Indian Army columns, NDRF 4th Battalion, and SDRF rescue squads.'
      ],
      englishWhatNotToDo: [
        'DO NOT cross damaged culverts, bridges, or water torrents.',
        'DO NOT stay inside hillside houses despite temporary rain pauses.'
      ],
      tamilTitle: 'தீவிர நிலச்சரிவு அவசர எச்சரிக்கை - வயநாடு சூரல்மலை பகுதி',
      tamilLocation: 'சூரல்மலை, மேப்பாடி, வைத்திரி தாலுகா, வயநாடு, கேரளா',
      tamilDescription: 'கனமழை காரணமாக கடுமையான நிலச்சரிவு மற்றும் ஆற்றுப்பெருக்கு ஏற்பட்டுள்ளது. உடனடி வெளியேற்ற உத்தரவு பிறப்பிக்கப்பட்டுள்ளது.',
      tamilWhatToDo: [
        'மலைச்சரிவுகள் மற்றும் ஆற்றங்கரையிலிருந்து உடனடியாக வெளியேறி பாதுகாப்பான கல்பற்றா நிவாரண முகாம்களுக்கு செல்லவும்.',
        'இந்திய ராணுவம், NDRF மற்றும் கேரளா தீயணைப்புப் படையினரின் வழிகாட்டுதல்களைப் பின்பற்றவும்.',
        'அவசர உதவிக்கு 1077 அல்லது 112 ஐ அழைக்கவும்.'
      ],
      tamilWhatNotToDo: [
        'வெள்ளம் பாயும் பாலங்கள் அல்லது சேதமடைந்த சாலைகளில் செல்ல வேண்டாம்.',
        'மலைச்சரிவு வீடுகளில் தங்க வேண்டாம்.'
      ],
      affectedRadiusKm: 12.0,
      simulatedRecipientCount: 42000,
      smsStatus: 'READY'
    },
    recommendedDepartments: [
      {
        role: 'PRIMARY',
        departmentName: 'Indian Army (122 Infantry Bn) & NDRF 4th Battalion',
        tamilName: 'இந்திய ராணுவம் மற்றும் NDRF தேசிய பேரிடர் மீட்புப் படை',
        contactChannel: 'Military / NDRF Satellite Comm VHF-1',
        recommendedAction: 'Airlift Bailey bridge components, deploy search dogs and thermal earth probes.'
      },
      {
        role: 'MEDICAL',
        departmentName: 'Kerala Health Services & 108 Emergency Ambulance',
        tamilName: 'கேரளா சுகாதார துறை மற்றும் 108 அவசர ஆம்புலன்ஸ்',
        contactChannel: 'State Medical Cell / 108 Fleet',
        recommendedAction: 'Establish trauma triage at Kalpetta General Hospital and mobilize mobile surgical vans.'
      }
    ],
    recommendedActions: [
      'NDRF and Army deployment for heavy mud clearance and bridge restoration',
      'Immediate evacuation of 12 hillside villages to Kalpetta relief centers',
      'Air Force helicopter reconnaissance and food packet drops'
    ],
    approval: { isApproved: false },
    timeline: [
      {
        id: 'tl-kl-1',
        time: '07:15',
        timestamp: Date.now() - 3600000 * 2,
        title: 'Cloudburst Detected',
        description: '282mm AWS extreme rain trigger recorded.',
        agentSource: 'Weather Telemetry'
      }
    ]
  },
  {
    id: 'IND-MH-2025-006',
    title: 'Severe Coastal Flash Inundation & Mithi River Swelling',
    disasterType: 'URBAN FLOOD',
    locationName: 'Kurla, Sion & Bandra-Kurla Complex (BKC)',
    district: 'Mumbai',
    state: 'Maharashtra',
    taluk: 'Mumbai Suburban',
    areaClassification: 'URBAN',
    latitude: 19.0728,
    longitude: 72.8722,
    severity: 'CRITICAL',
    riskScore: 91,
    priorityScore: 93,
    detectionConfidence: 93,
    predictionConfidence: 89,
    status: 'AWAITING AUTHORIZATION',
    createdAt: '2025-02-15T08:00:00Z',
    updatedAt: '2025-02-15T09:40:00Z',
    hasConflictingEvidence: false,
    imageryStatus: 'LIVE',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    evidence: [
      {
        id: 'ev-mh-1',
        source: 'Weather',
        description: 'Santacruz Doppler radar tracking high-density squall; 154mm rainfall coinciding with 4.4m Arabian Sea high tide.',
        confidence: 96,
        timestamp: '10 mins ago',
        freshness: 'FRESH',
        indicatorValue: '154mm + 4.4m High Tide'
      }
    ],
    prediction: {
      riskLevel: 'CRITICAL',
      confidence: 90,
      horizonHours: 6,
      trend: 'INCREASING',
      reasons: [
        'Mithi river discharge blocked by Arabian Sea high tide floodgates.',
        'Major road arterial subways flooded above 4 feet.'
      ]
    },
    districtAuthority: {
      district: 'Mumbai',
      state: 'Maharashtra',
      officer: 'BMC Disaster Management Commissioner',
      designation: 'Municipal Commissioner, IAS',
      officeAddress: 'BMC HQ, Fort, Mumbai - 400001',
      emergencyContact: '1916 / 022-22694725 / 1077',
      source: 'BMC Disaster Cell & MSDMA',
      lastVerified: '2025-02-15',
      isVerified: true
    },
    citizenWarning: {
      englishTitle: 'CRITICAL URBAN FLOOD ADVISORY - GREATER MUMBAI',
      englishLocation: 'Kurla, BKC, Sion, Chunabhatti, Mumbai Suburban',
      englishDescription: 'High tide combined with intense downpour causing rapid urban flooding. Avoid non-essential road and rail travel.',
      englishWhatToDo: [
        'Stay indoors on higher floors; evacuate basement car parks immediately.',
        'Track BMC Disaster updates via 1916 and local rail announcements.',
        'Call 112 / 1916 for emergency boat rescue.'
      ],
      englishWhatNotToDo: [
        'DO NOT enter flooded road subways (Milan, Andheri, Khar subways).',
        'DO NOT touch open meter boxes or roadside distribution pillars.'
      ],
      tamilTitle: 'மும்பை தீவிர நகர்ப்புற வெள்ள எச்சரிக்கை',
      tamilLocation: 'குர்லா, சியோன், பிகேசி, மும்பை புறநகர் பகுதி',
      tamilDescription: 'அரபிக்கடல் உயர் அலை மற்றும் கனமழையால் நகர்ப்புற சாலைகளில் தீவிர வெள்ளப்பெருக்கு ஏற்பட்டுள்ளது.',
      tamilWhatToDo: [
        'அடுக்குமாடி குடியிருப்புகளில் மேல் தளங்களில் இருக்கவும். பாதாள வாகன நிறுத்துமிடத்திற்கு செல்ல வேண்டாம்.',
        'அவசர உதவிக்கு 1916 அல்லது 112 ஐ அழைக்கவும்.'
      ],
      tamilWhatNotToDo: [
        'வெள்ளம் சூழ்ந்த சுரங்கப்பாதைகளில் வாகனங்களை இயக்க வேண்டாம்.',
        'மின்சார பெட்டிகளை தொட வேண்டாம்.'
      ],
      affectedRadiusKm: 18.0,
      simulatedRecipientCount: 180000,
      smsStatus: 'READY'
    },
    recommendedDepartments: [
      {
        role: 'PRIMARY',
        departmentName: 'NDRF 5th Battalion & Mumbai Fire Brigade (MFB)',
        tamilName: 'NDRF 5வது பிரிவு & மும்பை தீயணைப்பு படை',
        contactChannel: 'MCGM Disaster Hotline 1916',
        recommendedAction: 'Deploy heavy dewatering flood pumps and motorized rubber boats in Kranti Nagar and Kurla West.'
      }
    ],
    recommendedActions: [
      'Activate high-capacity 3000 GPM dewatering pumps at Mithi flood gates',
      'Issue automated bilingual SMS advisory to cell towers in Kurla-Sion grid',
      'Coordinate with Central Railway and Western Railway for waterlogging bypass'
    ],
    approval: { isApproved: false },
    timeline: [
      {
        id: 'tl-mh-1',
        time: '08:00',
        timestamp: Date.now() - 3600000 * 1.5,
        title: 'High Tide Storm Alert',
        description: 'Doppler Radar flagged flash flood convergence.',
        agentSource: 'Sensor Network'
      }
    ]
  },
  {
    id: 'IND-OD-2025-007',
    title: 'Severe Cyclonic Storm & Coastal Surge Alert',
    disasterType: 'CYCLONE',
    locationName: 'Puri Coast, Astranga & Konark',
    district: 'Puri',
    state: 'Odisha',
    stateTamilName: 'ஒடிசா',
    taluk: 'Puri Sadar',
    areaClassification: 'COASTAL',
    latitude: 19.8135,
    longitude: 85.8312,
    severity: 'HIGH',
    riskScore: 88,
    priorityScore: 90,
    detectionConfidence: 92,
    predictionConfidence: 88,
    status: 'AUTHORIZED',
    createdAt: '2025-02-15T06:00:00Z',
    updatedAt: '2025-02-15T09:15:00Z',
    hasConflictingEvidence: false,
    imageryStatus: 'LIVE',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    evidence: [
      {
        id: 'ev-od-1',
        source: 'Satellite',
        description: 'INSAT-3DR thermal infrared imagery shows deep cyclonic vortex over Bay of Bengal heading northwest.',
        confidence: 95,
        timestamp: '20 mins ago',
        freshness: 'FRESH',
        indicatorValue: 'Gale 95-105 km/h'
      }
    ],
    prediction: {
      riskLevel: 'HIGH',
      confidence: 89,
      horizonHours: 12,
      trend: 'INCREASING',
      reasons: [
        'Landfall predicted near Puri coastal belt with 1.5m storm surge.',
        'High waves reaching 4.8m along Bay of Bengal coastline.'
      ]
    },
    districtAuthority: {
      district: 'Puri',
      state: 'Odisha',
      officer: 'Collector & District Magistrate',
      designation: 'Collector, IAS',
      officeAddress: 'Collectorate, Puri - 752001',
      emergencyContact: '06752-223230 / 1077',
      source: 'OSDMA State Disaster Emergency Cell',
      lastVerified: '2025-02-15',
      isVerified: true
    },
    citizenWarning: {
      englishTitle: 'SEVERE CYCLONE & STORM SURGE WARNING - ODISHA COAST',
      englishLocation: 'Puri Coastal Belt, Astranga, Brahmagiri, Odisha',
      englishDescription: 'Gale wind speeds exceeding 100 km/h with high tidal surge. Total prohibition on fishing and beach access.',
      englishWhatToDo: [
        'Move immediately to designated OSDMA Multipurpose Cyclone Shelters.',
        'Secure roof tiles, window panels, and disconnect outdoor antennae.'
      ],
      englishWhatNotToDo: [
        'DO NOT venture into the sea or stay in thatched/kutcha coastal houses.',
        'DO NOT stand under high-voltage electric transmission poles.'
      ],
      tamilTitle: 'தீவிர புயல் மற்றும் கடல் அலை சீற்ற எச்சரிக்கை - ஒடிசா கடற்கரை',
      tamilLocation: 'பூரி கடற்கரை பகுதி, கொனார்க், ஒடிசா',
      tamilDescription: '100 கி.மீ வேகத்தில் பலத்த சூறாவளி காற்று வீசும். உடனடியாக பல்நோக்கு புயல் பாதுகாப்பு மையங்களுக்கு செல்லவும்.',
      tamilWhatToDo: [
        'மீனவர்கள் கடலுக்கு செல்ல வேண்டாம். படகுகளை பாதுகாப்பான நிலப்பரப்பில் கட்டவும்.',
        'அரசு புயல் நிவாரண முகாம்களுக்கு செல்லவும்.'
      ],
      tamilWhatNotToDo: [
        'கடற்கரைக்கு செல்ல வேண்டாம்.',
        'பழைய மரங்கள் அல்லது மின்கம்பங்கள் கீழ் நிற்க வேண்டாம்.'
      ],
      affectedRadiusKm: 25.0,
      simulatedRecipientCount: 95000,
      smsStatus: 'SENT'
    },
    recommendedDepartments: [
      {
        role: 'PRIMARY',
        departmentName: 'ODRAF (Odisha Disaster Rapid Action Force) & NDRF',
        tamilName: 'ஒடிசா பேரிடர் அதிரடிப்படை மற்றும் NDRF',
        contactChannel: 'OSDMA Control Room / 1077',
        recommendedAction: 'Evacuate 35 low-lying coastal hamlets to multi-purpose cyclone shelters.'
      }
    ],
    recommendedActions: [
      'Enforce Section 144 along beaches and sea-facing promenades',
      'Stock 5 days dry rations and baby food in 65 shelter buildings',
      'Pre-position tree clearance chainsaw squads on NH-316'
    ],
    approval: { isApproved: true, authorizedBy: 'State Relief Commissioner', authorizedAt: '2025-02-15T08:15:00Z', role: 'STATE_COMMANDER' },
    timeline: [
      {
        id: 'tl-od-1',
        time: '06:00',
        timestamp: Date.now() - 3600000 * 3,
        title: 'Cyclone Genesis Identified',
        description: 'Deep depression upgraded to cyclonic storm by IMD.',
        agentSource: 'Satellite Imagery'
      }
    ]
  }
];

// Enrich ALL incidents with structured Urban & Rural messages
const ALL_RAW_INCIDENTS = [...RAW_TAMIL_NADU_INCIDENTS, ...NATIONAL_INCIDENTS];

export const INITIAL_INCIDENTS: AlertIncident[] = ALL_RAW_INCIDENTS.map(inc => {
  const urbanStruct = generateUrbanStructuredMessage(inc);
  const ruralStruct = generateRuralStructuredMessage(inc);

  return {
    ...inc,
    citizenWarning: {
      ...inc.citizenWarning,
      urbanStructure: urbanStruct,
      ruralStructure: ruralStruct
    }
  };
});

export const RESPONSE_FACILITIES: ResponseFacility[] = [
  // Fire Stations
  { id: 'fs-1', name: 'Tambaram Fire & Rescue Station', type: 'FIRE_STATION', latitude: 12.9229, longitude: 80.1275, district: 'Chengalpattu', status: 'DEPLOYED', phone: '044-22262222' },
  { id: 'fs-2', name: 'Maraimalai Nagar Fire Station', type: 'FIRE_STATION', latitude: 12.7938, longitude: 80.0245, district: 'Chengalpattu', status: 'READY', phone: '044-27452101' },
  { id: 'fs-3', name: 'Coonoor Fire & Rescue Station', type: 'FIRE_STATION', latitude: 11.3530, longitude: 76.7959, district: 'Nilgiris', status: 'DEPLOYED', phone: '0423-2230101' },
  { id: 'fs-4', name: 'Ooty Central Fire Station', type: 'FIRE_STATION', latitude: 11.4102, longitude: 76.6950, district: 'Nilgiris', status: 'READY', phone: '0423-2442222' },
  { id: 'fs-5', name: 'Nagapattinam Fire & Rescue Station', type: 'FIRE_STATION', latitude: 10.7672, longitude: 79.8449, district: 'Nagapattinam', status: 'STANDBY', phone: '04365-222101' },
  { id: 'fs-6', name: 'Cuddalore Fire Station', type: 'FIRE_STATION', latitude: 11.7480, longitude: 79.7714, district: 'Cuddalore', status: 'READY', phone: '04142-230101' },
  { id: 'fs-7', name: 'Madurai Central Fire Station', type: 'FIRE_STATION', latitude: 9.9252, longitude: 78.1198, district: 'Madurai', status: 'READY', phone: '0452-2342101' },
  { id: 'fs-8', name: 'Coimbatore South Fire Station', type: 'FIRE_STATION', latitude: 11.0168, longitude: 76.9558, district: 'Coimbatore', status: 'READY', phone: '0422-2300101' },
  { id: 'fs-9', name: 'Kalpetta Fire & Rescue Station', type: 'FIRE_STATION', latitude: 11.6080, longitude: 76.0820, district: 'Wayanad', status: 'DEPLOYED', phone: '04936-202201' },
  { id: 'fs-10', name: 'Kurla Central Fire Brigade Station', type: 'FIRE_STATION', latitude: 19.0680, longitude: 72.8790, district: 'Mumbai', status: 'DEPLOYED', phone: '022-26501101' },
  { id: 'fs-11', name: 'Puri Beach Road Fire Station', type: 'FIRE_STATION', latitude: 19.7990, longitude: 85.8230, district: 'Puri', status: 'DEPLOYED', phone: '06752-222101' },

  // SDRF / NDRF Bases
  { id: 'sdrf-1', name: 'TN SDRF 1st Battalion Rapid Unit (Avadi)', type: 'SDRF_BASE', latitude: 13.1147, longitude: 80.1009, district: 'Tiruvallur', capacity: 250, status: 'DEPLOYED', phone: '044-26382100' },
  { id: 'sdrf-2', name: 'NDRF 4th Battalion Regional Staging (Arakkonam)', type: 'SDRF_BASE', latitude: 13.0784, longitude: 79.6677, district: 'Ranipet', capacity: 500, status: 'READY', phone: '04177-222201' },
  { id: 'sdrf-3', name: 'NDRF 5th Battalion Sudumbare Camp (Pune-Mumbai)', type: 'SDRF_BASE', latitude: 18.7200, longitude: 73.6800, district: 'Pune', capacity: 600, status: 'DEPLOYED', phone: '02114-247000' },
  { id: 'sdrf-4', name: 'ODRAF 3rd Battalion Emergency Unit (Bhubaneswar)', type: 'SDRF_BASE', latitude: 20.2961, longitude: 85.8245, district: 'Khurda', capacity: 350, status: 'DEPLOYED', phone: '0674-2534100' },
  { id: 'sdrf-5', name: 'SDRF Coastal Quick Reaction Unit (Nagapattinam)', type: 'SDRF_BASE', latitude: 10.7650, longitude: 79.8400, district: 'Nagapattinam', capacity: 80, status: 'DEPLOYED', phone: '04365-250100' },

  // Hospitals
  { id: 'h-1', name: 'Tambaram Taluk Govt Hospital (Chromepet)', type: 'HOSPITAL', latitude: 12.9516, longitude: 80.1416, district: 'Chengalpattu', capacity: 350, status: 'READY', phone: '044-22411080' },
  { id: 'h-2', name: 'Coonoor Lawley Govt Hospital', type: 'HOSPITAL', latitude: 11.3500, longitude: 76.7900, district: 'Nilgiris', capacity: 120, status: 'READY', phone: '0423-2231200' },
  { id: 'h-3', name: 'Nagapattinam Govt Medical College Hospital', type: 'HOSPITAL', latitude: 10.7690, longitude: 79.8420, district: 'Nagapattinam', capacity: 500, status: 'READY', phone: '04365-242200' },
  { id: 'h-4', name: 'Rajiv Gandhi Govt General Hospital (RGGGH)', type: 'HOSPITAL', latitude: 13.0805, longitude: 80.2770, district: 'Chennai', capacity: 1800, status: 'READY', phone: '044-25305000' },
  { id: 'h-5', name: 'Wayanad District General Hospital (Mananthavady)', type: 'HOSPITAL', latitude: 11.8020, longitude: 76.0040, district: 'Wayanad', capacity: 450, status: 'READY', phone: '04935-240223' },
  { id: 'h-6', name: 'KEM Hospital & Seth GS Medical College (Mumbai)', type: 'HOSPITAL', latitude: 19.0020, longitude: 72.8420, district: 'Mumbai', capacity: 1800, status: 'READY', phone: '022-24107000' },
  { id: 'h-7', name: 'Puri District Headquarters Hospital (DHH)', type: 'HOSPITAL', latitude: 19.8100, longitude: 85.8200, district: 'Puri', capacity: 420, status: 'READY', phone: '06752-222033' },

  // Shelters
  { id: 'sh-1', name: 'Govt Higher Secondary School Mudichur Relief Shelter', type: 'SHELTER', latitude: 12.9260, longitude: 80.0780, district: 'Chengalpattu', capacity: 600, status: 'DEPLOYED', phone: '044-27427412' },
  { id: 'sh-2', name: 'Velankanni Multipurpose Cyclone Shelter (MPCS-3)', type: 'SHELTER', latitude: 10.6830, longitude: 79.8470, district: 'Nagapattinam', capacity: 1200, status: 'READY', phone: '04365-252500' },
  { id: 'sh-3', name: 'Kalpetta St. Joseph High School Relief Camp', type: 'SHELTER', latitude: 11.6110, longitude: 76.0840, district: 'Wayanad', capacity: 900, status: 'DEPLOYED', phone: '04936-204151' },
  { id: 'sh-4', name: 'BKC Urban Relief Staging Ground (Mumbai)', type: 'SHELTER', latitude: 19.0650, longitude: 72.8680, district: 'Mumbai', capacity: 2500, status: 'DEPLOYED', phone: '1916' },
  { id: 'sh-5', name: 'Puri Cyclone Multi-Purpose Shelter No. 8', type: 'SHELTER', latitude: 19.8050, longitude: 85.8350, district: 'Puri', capacity: 1500, status: 'READY', phone: '06752-223230' }
];

