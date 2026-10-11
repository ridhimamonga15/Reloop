import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/storage/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const zone = searchParams.get('zone') || undefined;
    const search = searchParams.get('search') || undefined;

    const listings = await dataStore.getListings({ category, status, zone, search });
    return NextResponse.json({
      success: true,
      listings,
      count: listings.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch listings';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.category || !body.quantity) {
      return NextResponse.json(
        { success: false, error: 'Missing required listing fields: title, category, quantity.' },
        { status: 400 }
      );
    }

    if (body.quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be a positive number.' },
        { status: 400 }
      );
    }

    const created = await dataStore.createListing(body);
    return NextResponse.json({ success: true, listing: created }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create listing';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
