import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/storage/store';
import { calculateMatches } from '@/lib/matching';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: 'listingId query parameter is required.' },
        { status: 400 }
      );
    }

    const listing = await dataStore.getListingById(listingId);
    if (!listing) {
      return NextResponse.json(
        { success: false, error: `Listing "${listingId}" not found.` },
        { status: 404 }
      );
    }

    const partners = dataStore.getPartners();
    const matches = calculateMatches(listing, partners);

    return NextResponse.json({
      success: true,
      listingId,
      listingTitle: listing.title,
      category: listing.category,
      quantityKg: listing.unit === 'tonnes' ? listing.quantity * 1000 : listing.quantity,
      matches,
      compatibleCount: matches.filter((m) => m.isCompatible).length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error calculating matches';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
