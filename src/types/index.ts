export type MaterialCategory =
  | 'cardboard'
  | 'paper'
  | 'plastics'
  | 'metals'
  | 'electronic_waste';

export type ListingStatus =
  | 'available'
  | 'matched'
  | 'pickup_scheduled'
  | 'collected'
  | 'recovery_recorded'
  | 'cancelled';

export type MaterialCondition =
  | 'clean_sorted'
  | 'mixed_baled'
  | 'unprocessed'
  | 'intact_functional'
  | 'scrap_grade';

export interface LocationInfo {
  name: string;
  zone: string;
  address: string;
  campusOrFacility: string;
  city: string;
}

export interface OwnerInfo {
  name: string;
  org: string;
  type: 'college' | 'office' | 'business' | 'institution';
  contactEmail: string;
  contactPhone: string;
}

export interface PickupSchedule {
  scheduledDate: string;
  timeWindow: string;
  driverName?: string;
  vehiclePlate?: string;
  contactPerson?: string;
  notes?: string;
}

export interface CollectionRecord {
  collectedAt: string;
  declaredQtyKg: number;
  actualRecoveredQtyKg?: number;
  recoveryFacility?: string;
  facilityLicense?: string;
  verificationHash?: string;
  weighbridgeSlipNumber?: string;
  recoveryNotes?: string;
}

export interface StatusTransition {
  fromStatus: ListingStatus;
  toStatus: ListingStatus;
  timestamp: string;
  actor: string;
  note: string;
}

export interface Listing {
  id: string;
  title: string;
  category: MaterialCategory;
  quantity: number;
  unit: 'kg' | 'tonnes';
  condition: MaterialCondition;
  conditionNotes: string;
  handlingRequirements: string[];
  location: LocationInfo;
  owner: OwnerInfo;
  status: ListingStatus;
  matchedPartnerId?: string;
  matchedPartnerName?: string;
  pickupSchedule?: PickupSchedule;
  collection?: CollectionRecord;
  statusHistory: StatusTransition[];
  createdAt: string;
  updatedAt: string;
  source: 'demo_seeded' | 'user_created' | 'aws_dynamodb';
}

export interface RecoveryPartner {
  id: string;
  name: string;
  organization: string;
  type: 'authorized_recycler' | 'compost_facility' | 'refurbisher' | 'mrf_aggregator';
  authorizedCategories: MaterialCategory[];
  minCapacityKg: number;
  maxCapacityKg: number;
  operatingZones: string[];
  city: string;
  certifications: string[];
  complianceLicense: string;
  isEwasteCertified: boolean;
  rating: number;
  contactEmail: string;
  contactPhone: string;
}

export interface MatchScoreBreakdown {
  materialScore: number;
  capacityScore: number;
  locationScore: number;
  handlingScore: number;
}

export interface MatchResult {
  partner: RecoveryPartner;
  listingId: string;
  overallScore: number; // 0-100
  breakdown: MatchScoreBreakdown;
  reasons: string[];
  requirements: string[];
  isCompatible: boolean;
  warnings?: string[];
}

export interface CategoryMetric {
  category: MaterialCategory;
  displayName: string;
  recoveredKg: number;
  activeListingsCount: number;
  co2eFactor: number; // kg CO2e avoided per kg recovered
  co2eAvoidedKg: number;
  landfillVolumeFactor: number; // m3 saved per kg
  landfillVolumeSavedM3: number;
}

export interface DashboardStats {
  totalMaterialRecoveredKg: number;
  activeListingsCount: number;
  pendingPickupsCount: number;
  completedCollectionsCount: number;
  categoryMetrics: CategoryMetric[];
  estimatedTotalCO2eAvoidedKg: number;
  estimatedLandfillSavedM3: number;
  lastUpdated: string;
  isDemoData: boolean;
}

export interface AWSStatus {
  configured: boolean;
  connected: boolean;
  region: string;
  tableName: string;
  mode: 'aws_dynamodb' | 'demo_local';
  message: string;
  latencyMs?: number;
}
