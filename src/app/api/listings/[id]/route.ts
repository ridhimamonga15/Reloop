import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/storage/store';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const listing = await dataStore.getListingById(id);

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, listing });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching listing';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = await dataStore.deleteListing(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error deleting listing';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
