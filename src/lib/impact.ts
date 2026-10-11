import { Listing, MaterialCategory, CategoryMetric, DashboardStats } from '@/types';

export interface ImpactDisclosure {
  category: MaterialCategory;
  name: string;
  co2eFactor: number;
  landfillFactorM3: number;
  source: string;
  boundary: string;
  limitations: string;
}

export const IMPACT_METHODOLOGY_DISCLOSURES: ImpactDisclosure[] = [
  {
    category: 'cardboard',
    name: 'Corrugated Cardboard',
    co2eFactor: 3.14,
    landfillFactorM3: 0.0022,
    source: 'EPA Waste Reduction Model (WARM) v15 & CPCB Paper Lifecycle Guidelines',
    boundary: 'Cradle-to-gate virgin kraft substitution minus reprocessing electricity and collection transport.',
    limitations: 'Assumes moisture content < 12%. Avoided methane generation assumes regional dry-tomb or capped landfill baseline.',
  },
  {
    category: 'paper',
    name: 'Office & De-inked Paper',
    co2eFactor: 2.85,
    landfillFactorM3: 0.0018,
    source: 'EPA WARM High-Grade Office Paper Recycling Benchmark',
    boundary: 'Substitution of virgin chemical wood pulp in tissue and packaging paper mills.',
    limitations: 'Does not account for fossil fuel offsets if paper was destined for waste-to-energy incineration.',
  },
  {
    category: 'plastics',
    name: 'Plastics & Polymers (PET/LDPE)',
    co2eFactor: 1.82,
    landfillFactorM3: 0.0025,
    source: 'EPA WARM & Central Pollution Control Board (CPCB) EPR Guidelines',
    boundary: 'Mechanical recycling into secondary pellets replacing virgin petroleum resin.',
    limitations: 'Contamination (>5%) significantly degrades circularity. Downcycling into non-circular road aggregates yields lower offsets.',
  },
  {
    category: 'metals',
    name: 'Secondary Scrap Metals (Al/Cu)',
    co2eFactor: 4.65,
    landfillFactorM3: 0.0008,
    source: 'International Aluminium Institute & Bureau of International Recycling (BIR)',
    boundary: 'Secondary scrap remelting vs primary bauxite electrolytic smelting and iron blast furnace baseline.',
    limitations: 'Aluminium yields up to 95% energy savings (~8.5 kg CO2e/kg), while mild steel scrap yields ~1.8 kg CO2e/kg. Weighted average of 4.65 is applied.',
  },
  {
    category: 'electronic_waste',
    name: 'Electronic Waste (E-Waste)',
    co2eFactor: 1.4,
    landfillFactorM3: 0.0012,
    source: 'Global E-Waste Monitor (UNITAR/ITU) & CPCB E-Waste Management Rules 2022',
    boundary: 'Segregated dismantling, copper/gold leaching and hazardous fraction neutralisation.',
    limitations: 'Primary environmental mandate is safe immobilisation of toxic lead, cadmium and mercury. Carbon offset is a secondary co-benefit.',
  },
];

export function calculateDashboardStats(listings: Listing[]): DashboardStats {
  const categoryMap: Record<MaterialCategory, { recoveredKg: number; activeListings: number }> = {
    cardboard: { recoveredKg: 0, activeListings: 0 },
    paper: { recoveredKg: 0, activeListings: 0 },
    plastics: { recoveredKg: 0, activeListings: 0 },
    metals: { recoveredKg: 0, activeListings: 0 },
    electronic_waste: { recoveredKg: 0, activeListings: 0 },
  };

  let totalMaterialRecoveredKg = 0;
  let activeListingsCount = 0;
  let pendingPickupsCount = 0;
  let completedCollectionsCount = 0;

  listings.forEach((listing) => {
    const qtyKg = listing.unit === 'tonnes' ? listing.quantity * 1000 : listing.quantity;

    if (listing.status === 'recovery_recorded') {
      const recoveredKg = listing.collection?.actualRecoveredQtyKg ?? qtyKg;
      totalMaterialRecoveredKg += recoveredKg;
      categoryMap[listing.category].recoveredKg += recoveredKg;
      completedCollectionsCount += 1;
    } else if (listing.status === 'collected') {
      completedCollectionsCount += 1;
    } else if (listing.status === 'pickup_scheduled') {
      pendingPickupsCount += 1;
    } else if (listing.status === 'available' || listing.status === 'matched') {
      activeListingsCount += 1;
      categoryMap[listing.category].activeListings += 1;
    }
  });

  let estimatedTotalCO2eAvoidedKg = 0;
  let estimatedLandfillSavedM3 = 0;

  const categoryMetrics: CategoryMetric[] = IMPACT_METHODOLOGY_DISCLOSURES.map((disclosure) => {
    const data = categoryMap[disclosure.category];
    const co2eAvoided = Math.round(data.recoveredKg * disclosure.co2eFactor * 10) / 10;
    const landfillSaved = Math.round(data.recoveredKg * disclosure.landfillFactorM3 * 100) / 100;

    estimatedTotalCO2eAvoidedKg += co2eAvoided;
    estimatedLandfillSavedM3 += landfillSaved;

    return {
      category: disclosure.category,
      displayName: disclosure.name,
      recoveredKg: data.recoveredKg,
      activeListingsCount: data.activeListings,
      co2eFactor: disclosure.co2eFactor,
      co2eAvoidedKg: co2eAvoided,
      landfillVolumeFactor: disclosure.landfillFactorM3,
      landfillVolumeSavedM3: landfillSaved,
    };
  });

  const hasDemo = listings.some((l) => l.source === 'demo_seeded');

  return {
    totalMaterialRecoveredKg: Math.round(totalMaterialRecoveredKg * 10) / 10,
    activeListingsCount,
    pendingPickupsCount,
    completedCollectionsCount,
    categoryMetrics,
    estimatedTotalCO2eAvoidedKg: Math.round(estimatedTotalCO2eAvoidedKg * 10) / 10,
    estimatedLandfillSavedM3: Math.round(estimatedLandfillSavedM3 * 100) / 100,
    lastUpdated: new Date().toISOString(),
    isDemoData: hasDemo,
  };
}
