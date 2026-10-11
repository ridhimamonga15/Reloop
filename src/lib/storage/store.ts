import { Listing, RecoveryPartner, ListingStatus, PickupSchedule, CollectionRecord } from '@/types';
import { SEEDED_LISTINGS, SEEDED_PARTNERS } from '@/lib/data/seed';
import {
  isAWSConfigured,
  getListingsFromDynamoDB,
  saveListingToDynamoDB,
  deleteListingFromDynamoDB,
} from '@/lib/aws/dynamodb';

// In-memory demo store initialized from SEEDED_LISTINGS
class ReloopDataStore {
  private listings: Map<string, Listing> = new Map();
  private partners: Map<string, RecoveryPartner> = new Map();
  private isInitialized = false;

  constructor() {
    this.initStore();
  }

  private initStore() {
    this.listings.clear();
    this.partners.clear();

    SEEDED_PARTNERS.forEach((partner) => {
      this.partners.set(partner.id, { ...partner });
    });

    SEEDED_LISTINGS.forEach((listing) => {
      this.listings.set(listing.id, JSON.parse(JSON.stringify(listing)));
    });

    this.isInitialized = true;
  }

  public resetDemoData() {
    this.initStore();
    return { success: true, count: this.listings.size };
  }

  public async getListings(filters?: {
    category?: string;
    status?: string;
    zone?: string;
    search?: string;
  }): Promise<Listing[]> {
    let allListings: Listing[] = [];

    // Attempt AWS DynamoDB read if configured
    if (isAWSConfigured) {
      const awsItems = await getListingsFromDynamoDB();
      if (awsItems && awsItems.length > 0) {
        allListings = awsItems;
      } else {
        allListings = Array.from(this.listings.values());
      }
    } else {
      allListings = Array.from(this.listings.values());
    }

    // Apply filtering
    return allListings.filter((item) => {
      if (filters?.category && filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }
      if (filters?.status && filters.status !== 'all' && item.status !== filters.status) {
        return false;
      }
      if (filters?.zone && filters.zone !== 'all') {
        if (!item.location.zone.toLowerCase().includes(filters.zone.toLowerCase())) {
          return false;
        }
      }
      if (filters?.search && filters.search.trim() !== '') {
        const q = filters.search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesLoc = item.location.name.toLowerCase().includes(q) || item.location.campusOrFacility.toLowerCase().includes(q);
        const matchesOwner = item.owner.org.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLoc && !matchesOwner && !matchesCat) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getListingById(id: string): Promise<Listing | null> {
    const local = this.listings.get(id);
    if (local) return local;

    if (isAWSConfigured) {
      const items = await getListingsFromDynamoDB();
      const found = items?.find((item) => item.id === id);
      if (found) return found;
    }
    return null;
  }

  public async createListing(listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'status'>): Promise<Listing> {
    if (!listingData.title || listingData.title.trim().length === 0) {
      throw new Error('Listing title is required.');
    }
    if (listingData.quantity <= 0) {
      throw new Error('Quantity must be a positive number greater than 0.');
    }

    const now = new Date().toISOString();
    const id = `listing-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newListing: Listing = {
      ...listingData,
      id,
      status: 'available',
      createdAt: now,
      updatedAt: now,
      source: isAWSConfigured ? 'aws_dynamodb' : 'user_created',
      statusHistory: [
        {
          fromStatus: 'available',
          toStatus: 'available',
          timestamp: now,
          actor: listingData.owner.name,
          note: 'Listing created by waste generator.',
        },
      ],
    };

    this.listings.set(id, newListing);

    if (isAWSConfigured) {
      await saveListingToDynamoDB(newListing);
    }

    return newListing;
  }

  public getPartners(): RecoveryPartner[] {
    return Array.from(this.partners.values());
  }

  public getPartnerById(id: string): RecoveryPartner | null {
    return this.partners.get(id) || null;
  }

  /**
   * Workflow Step 1: Accept compatible match
   */
  public async acceptMatch(
    listingId: string,
    partnerId: string,
    actorName = 'Operations Coordinator'
  ): Promise<Listing> {
    const listing = await this.getListingById(listingId);
    if (!listing) throw new Error('Listing not found');

    if (listing.status !== 'available') {
      throw new Error(`Cannot match listing in status "${listing.status}". Must be "available".`);
    }

    const partner = this.getPartnerById(partnerId);
    if (!partner) throw new Error('Recovery partner not found');

    // E-waste strict check
    if (listing.category === 'electronic_waste' && !partner.isEwasteCertified) {
      throw new Error('Compliance Violation: Electronic waste can only be matched with CPCB certified e-waste recyclers.');
    }

    const now = new Date().toISOString();
    listing.status = 'matched';
    listing.matchedPartnerId = partner.id;
    listing.matchedPartnerName = partner.name;
    listing.updatedAt = now;

    listing.statusHistory.push({
      fromStatus: 'available',
      toStatus: 'matched',
      timestamp: now,
      actor: actorName,
      note: `Match accepted with ${partner.name} (License: ${partner.complianceLicense}).`,
    });

    this.listings.set(listingId, listing);
    if (isAWSConfigured) {
      await saveListingToDynamoDB(listing);
    }

    return listing;
  }

  /**
   * Workflow Step 2: Schedule Pickup
   */
  public async schedulePickup(
    listingId: string,
    schedule: PickupSchedule,
    actorName = 'Logistics Dispatch'
  ): Promise<Listing> {
    const listing = await this.getListingById(listingId);
    if (!listing) throw new Error('Listing not found');

    if (listing.status !== 'matched' && listing.status !== 'available') {
      throw new Error(`Cannot schedule pickup for listing with status "${listing.status}".`);
    }

    if (!schedule.scheduledDate) {
      throw new Error('Scheduled date is required.');
    }

    const now = new Date().toISOString();
    const fromStatus = listing.status;
    listing.status = 'pickup_scheduled';
    listing.pickupSchedule = schedule;
    listing.updatedAt = now;

    listing.statusHistory.push({
      fromStatus,
      toStatus: 'pickup_scheduled',
      timestamp: now,
      actor: actorName,
      note: `Pickup scheduled for ${schedule.scheduledDate} (${schedule.timeWindow}). Vehicle: ${schedule.vehiclePlate || 'Assigned'}, Driver: ${schedule.driverName || 'Designated'}.`,
    });

    this.listings.set(listingId, listing);
    if (isAWSConfigured) {
      await saveListingToDynamoDB(listing);
    }

    return listing;
  }

  /**
   * Workflow Step 3: Record Collection as Completed
   */
  public async completeCollection(
    listingId: string,
    collectionDetails: {
      collectorName?: string;
      notes?: string;
      recoveryFacility?: string;
    },
    actorName = 'Field Collection Driver'
  ): Promise<Listing> {
    const listing = await this.getListingById(listingId);
    if (!listing) throw new Error('Listing not found');

    if (listing.status !== 'pickup_scheduled') {
      throw new Error(`Cannot mark collection completed for status "${listing.status}". Must be "pickup_scheduled".`);
    }

    const now = new Date().toISOString();
    const declaredQtyKg = listing.unit === 'tonnes' ? listing.quantity * 1000 : listing.quantity;

    listing.status = 'collected';
    listing.collection = {
      collectedAt: now,
      declaredQtyKg,
      recoveryFacility: collectionDetails.recoveryFacility || `${listing.matchedPartnerName || 'Authorized Facility'} Receiving Yard`,
      recoveryNotes: collectionDetails.notes || 'Material collected and loaded onto carrier.',
    };
    listing.updatedAt = now;

    listing.statusHistory.push({
      fromStatus: 'pickup_scheduled',
      toStatus: 'collected',
      timestamp: now,
      actor: actorName,
      note: `Physical collection executed. Declared load: ${declaredQtyKg} kg. In-transit to recovery facility.`,
    });

    this.listings.set(listingId, listing);
    if (isAWSConfigured) {
      await saveListingToDynamoDB(listing);
    }

    return listing;
  }

  /**
   * Workflow Step 4: Record Confirmed Recovery Quantity
   */
  public async recordRecovery(
    listingId: string,
    actualRecoveredQtyKg: number,
    recoveryData: {
      weighbridgeSlipNumber?: string;
      recoveryFacility?: string;
      notes?: string;
    },
    actorName = 'Facility Weighbridge Auditor'
  ): Promise<Listing> {
    const listing = await this.getListingById(listingId);
    if (!listing) throw new Error('Listing not found');

    if (listing.status !== 'collected') {
      throw new Error(`Cannot record recovery for listing in status "${listing.status}". Must be "collected".`);
    }

    if (typeof actualRecoveredQtyKg !== 'number' || actualRecoveredQtyKg <= 0) {
      throw new Error('Actual recovered quantity must be a positive number greater than 0.');
    }

    const now = new Date().toISOString();
    const declaredQty = listing.collection?.declaredQtyKg ?? (listing.unit === 'tonnes' ? listing.quantity * 1000 : listing.quantity);

    // Cryptographic audit verification string
    const verificationHash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const existingCollection = listing.collection || {
      collectedAt: now,
      declaredQtyKg: declaredQty,
    };

    listing.status = 'recovery_recorded';
    listing.collection = {
      ...existingCollection,
      actualRecoveredQtyKg,
      recoveryFacility: recoveryData.recoveryFacility || existingCollection.recoveryFacility || 'Licensed Recovery Facility',
      weighbridgeSlipNumber: recoveryData.weighbridgeSlipNumber || `WB-${Date.now().toString().slice(-6)}`,
      verificationHash,
      recoveryNotes: recoveryData.notes || `Verified net weight ${actualRecoveredQtyKg} kg accepted for circular recovery.`,
    };
    listing.updatedAt = now;

    listing.statusHistory.push({
      fromStatus: 'collected',
      toStatus: 'recovery_recorded',
      timestamp: now,
      actor: actorName,
      note: `Certified recovery recorded: ${actualRecoveredQtyKg} kg (Declared: ${declaredQty} kg). Slip: ${listing.collection.weighbridgeSlipNumber}. Verification: ${verificationHash}`,
    });

    this.listings.set(listingId, listing);
    if (isAWSConfigured) {
      await saveListingToDynamoDB(listing);
    }

    return listing;
  }

  public async deleteListing(id: string): Promise<boolean> {
    const exists = this.listings.has(id);
    this.listings.delete(id);

    if (isAWSConfigured) {
      await deleteListingFromDynamoDB(id);
    }
    return exists;
  }
}

// Global singleton instance
declare global {
  // eslint-disable-next-line no-var
  var __reloopDataStore: ReloopDataStore | undefined;
}

export const dataStore = global.__reloopDataStore || new ReloopDataStore();
if (process.env.NODE_ENV !== 'production') {
  global.__reloopDataStore = dataStore;
}
