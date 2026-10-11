import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/storage/store';
import { calculateDashboardStats, IMPACT_METHODOLOGY_DISCLOSURES } from '@/lib/impact';

export async function GET() {
  try {
    const listings = await dataStore.getListings();
    const stats = calculateDashboardStats(listings);

    return NextResponse.json({
      success: true,
      stats,
      methodology: IMPACT_METHODOLOGY_DISCLOSURES,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error calculating dashboard stats';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
