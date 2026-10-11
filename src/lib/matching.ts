import { Listing, RecoveryPartner, MatchResult } from '@/types';

/**
 * Deterministic Transparent Matching Engine
 * Evaluates compatibility between a recyclable waste listing and registered recovery partners.
 * Pure deterministic calculations with explainable rationale for each factor.
 */
export function calculateMatches(
  listing: Listing,
  partners: RecoveryPartner[]
): MatchResult[] {
  const results: MatchResult[] = partners.map((partner) => {
    const reasons: string[] = [];
    const requirements: string[] = [];
    const warnings: string[] = [];

    // 1. Material Compatibility (40 points maximum)
    let materialScore = 0;
    const handlesCategory = partner.authorizedCategories.includes(listing.category);

    if (!handlesCategory) {
      materialScore = 0;
      reasons.push(
        `Partner does not process ${formatCategoryName(listing.category)} (authorized only for: ${partner.authorizedCategories.map(formatCategoryName).join(', ')}).`
      );
    } else {
      // E-Waste Special Strict Compliance Check
      if (listing.category === 'electronic_waste') {
        if (partner.isEwasteCertified) {
          materialScore = 40;
          reasons.push(
            `Fully authorized for electronic waste under license ${partner.complianceLicense} with specialized toxics segregation.`
          );
        } else {
          materialScore = 0;
          reasons.push(
            'Incompatible: This material requires an authorized CPCB/SPCB e-waste recycler, which this partner lacks.'
          );
          warnings.push('Regulatory restriction: Uncertified recovery of e-waste is prohibited by environmental law.');
        }
      } else {
        materialScore = 40;
        reasons.push(
          `Directly processes ${formatCategoryName(listing.category)} at licensed facility (${partner.type.replace('_', ' ')}).`
        );
      }
    }

    // 2. Quantity & Capacity Compatibility (25 points maximum)
    let capacityScore = 0;
    const qtyKg = listing.unit === 'tonnes' ? listing.quantity * 1000 : listing.quantity;

    if (qtyKg >= partner.minCapacityKg && qtyKg <= partner.maxCapacityKg) {
      capacityScore = 25;
      reasons.push(
        `Quantity (${qtyKg.toLocaleString()} kg) is optimal for intake capacity (Range: ${partner.minCapacityKg.toLocaleString()} - ${partner.maxCapacityKg.toLocaleString()} kg).`
      );
    } else if (qtyKg < partner.minCapacityKg) {
      const ratio = Math.max(0.2, qtyKg / partner.minCapacityKg);
      capacityScore = Math.round(25 * ratio);
      reasons.push(
        `Quantity (${qtyKg} kg) is below standard intake batch (${partner.minCapacityKg} kg). Aggregated collection route required.`
      );
      warnings.push(`Intake threshold: Partner prefers minimum batch size of ${partner.minCapacityKg} kg.`);
    } else {
      // Exceeds max capacity
      const ratio = Math.max(0.3, partner.maxCapacityKg / qtyKg);
      capacityScore = Math.round(25 * ratio);
      reasons.push(
        `Quantity (${qtyKg.toLocaleString()} kg) exceeds single-vehicle payload (${partner.maxCapacityKg.toLocaleString()} kg). Requires multi-trip dispatch.`
      );
      requirements.push('Multi-vehicle logistics schedule required for collection.');
    }

    // 3. Location & Zone Compatibility (20 points maximum)
    let locationScore = 0;
    const isDirectZoneMatch = partner.operatingZones.some(
      (zone) => zone.toLowerCase() === listing.location.zone.toLowerCase()
    );

    if (isDirectZoneMatch) {
      locationScore = 20;
      reasons.push(
        `Operating within direct zone: ${listing.location.zone}. Standard route dispatch applies.`
      );
    } else if (partner.city.toLowerCase() === listing.location.city.toLowerCase()) {
      locationScore = 12;
      reasons.push(
        `Located in same metropolitan area (${partner.city}), but outside direct zone (${listing.location.zone}). Cross-zone transport applies.`
      );
      requirements.push('Special cross-zone transport scheduling may add lead time.');
    } else {
      locationScore = 0;
      reasons.push(`Outside operational coverage (Partner operates in ${partner.operatingZones.join(', ')}).`);
      warnings.push('Inter-city logistics coordination required.');
    }

    // 4. Handling & Condition Requirements (15 points maximum)
    let handlingScore = 15;
    const handlingReqs = listing.handlingRequirements || [];

    if (handlingReqs.includes('hazardous_materials_declaration')) {
      if (partner.isEwasteCertified || partner.certifications.some((c) => c.includes('ISO 14001'))) {
        reasons.push('Partner possesses environmental management protocols for hazardous declaration intake.');
      } else {
        handlingScore -= 6;
        warnings.push('Special hazardous materials handling agreement must be executed prior to pickup.');
      }
    }

    if (handlingReqs.includes('palletized') || handlingReqs.includes('forklift_accessible')) {
      requirements.push('Forklift or tail-lift vehicle required during dock pickup.');
    }

    if (listing.condition === 'clean_sorted') {
      reasons.push('Clean & sorted grade material qualifies for immediate premium processing intake.');
    } else if (listing.condition === 'scrap_grade') {
      reasons.push('Scrap-grade material will require sorting and secondary segregation at receiving depot.');
    }

    handlingScore = Math.max(0, handlingScore);

    const overallScore = materialScore > 0 ? materialScore + capacityScore + locationScore + handlingScore : 0;
    const isCompatible = materialScore > 0 && overallScore >= 45;

    return {
      partner,
      listingId: listing.id,
      overallScore,
      breakdown: {
        materialScore,
        capacityScore,
        locationScore,
        handlingScore,
      },
      reasons,
      requirements,
      isCompatible,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  });

  // Sort ranked by highest overallScore first, compatible above incompatible
  return results.sort((a, b) => {
    if (a.isCompatible && !b.isCompatible) return -1;
    if (!a.isCompatible && b.isCompatible) return 1;
    return b.overallScore - a.overallScore;
  });
}

function formatCategoryName(category: string): string {
  switch (category) {
    case 'cardboard':
      return 'Corrugated Cardboard';
    case 'paper':
      return 'Office & High-Grade Paper';
    case 'plastics':
      return 'Plastics & Polymers';
    case 'metals':
      return 'Scrap Metals';
    case 'electronic_waste':
      return 'Electronic Waste (E-Waste)';
    default:
      return category;
  }
}
