import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/storage/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, listingId } = body;

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: 'listingId is required.' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'accept_match': {
        const { partnerId, actorName } = body;
        if (!partnerId) {
          return NextResponse.json(
            { success: false, error: 'partnerId is required to accept a match.' },
            { status: 400 }
          );
        }
        const updated = await dataStore.acceptMatch(listingId, partnerId, actorName);
        return NextResponse.json({
          success: true,
          action: 'accept_match',
          message: `Match accepted with ${updated.matchedPartnerName}. Status updated to Matched.`,
          listing: updated,
        });
      }

      case 'schedule_pickup': {
        const { schedule, actorName } = body;
        if (!schedule || !schedule.scheduledDate) {
          return NextResponse.json(
            { success: false, error: 'Scheduled date and time are required.' },
            { status: 400 }
          );
        }
        const updated = await dataStore.schedulePickup(listingId, schedule, actorName);
        return NextResponse.json({
          success: true,
          action: 'schedule_pickup',
          message: `Pickup scheduled for ${schedule.scheduledDate}. Status updated to Pickup Scheduled.`,
          listing: updated,
        });
      }

      case 'complete_collection': {
        const { collectionDetails, actorName } = body;
        const updated = await dataStore.completeCollection(
          listingId,
          collectionDetails || {},
          actorName
        );
        return NextResponse.json({
          success: true,
          action: 'complete_collection',
          message: 'Physical collection completed. Status updated to Collected.',
          listing: updated,
        });
      }

      case 'record_recovery': {
        const { actualRecoveredQtyKg, recoveryData, actorName } = body;
        if (typeof actualRecoveredQtyKg !== 'number' || actualRecoveredQtyKg <= 0) {
          return NextResponse.json(
            { success: false, error: 'Actual recovered quantity must be a positive number greater than 0.' },
            { status: 400 }
          );
        }
        const updated = await dataStore.recordRecovery(
          listingId,
          actualRecoveredQtyKg,
          recoveryData || {},
          actorName
        );
        return NextResponse.json({
          success: true,
          action: 'record_recovery',
          message: `Certified recovery recorded (${actualRecoveredQtyKg} kg). Verification hash issued. Status updated to Recovery Recorded.`,
          listing: updated,
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Invalid action "${action}". Valid actions: accept_match, schedule_pickup, complete_collection, record_recovery.`,
          },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error processing collection workflow';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
