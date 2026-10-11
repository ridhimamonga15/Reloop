'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Truck,
  Calendar,
  ShieldCheck,
  Building,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Navbar } from '@/components/navigation/Navbar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { SchedulePickupModal } from '@/components/collections/SchedulePickupModal';
import { CompleteCollectionModal } from '@/components/collections/CompleteCollectionModal';
import { RecordRecoveryModal } from '@/components/collections/RecordRecoveryModal';
import { ListingDetailModal } from '@/components/listings/ListingDetailModal';
import { Listing } from '@/types';

export default function CollectionsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'matched' | 'pickup_scheduled' | 'collected' | 'recovery_recorded'>('all');

  // Modals state
  const [scheduleModalListing, setScheduleModalListing] = useState<Listing | null>(null);
  const [completeModalListing, setCompleteModalListing] = useState<Listing | null>(null);
  const [recoveryModalListing, setRecoveryModalListing] = useState<Listing | null>(null);
  const [detailModalListing, setDetailModalListing] = useState<Listing | null>(null);

  const fetchCollections = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/listings');
      const data = await res.json();
      if (data.success) {
        setListings(data.listings);
      }
    } catch (err) {
      console.error('Error fetching collection workflows:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const workflowListings = listings.filter((l) => l.status !== 'available' && l.status !== 'cancelled');

  const filteredListings = activeTab === 'all'
    ? workflowListings
    : workflowListings.filter((l) => l.status === activeTab);

  const stageCounts = {
    all: workflowListings.length,
    matched: workflowListings.filter((l) => l.status === 'matched').length,
    pickup_scheduled: workflowListings.filter((l) => l.status === 'pickup_scheduled').length,
    collected: workflowListings.filter((l) => l.status === 'collected').length,
    recovery_recorded: workflowListings.filter((l) => l.status === 'recovery_recorded').length,
  };

  return (
    <div className="flex min-h-screen bg-warm-bg text-charcoal-900">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Navbar
          title="Collection & Recovery Pipeline"
          subtitle="End-to-end custody tracker: Matched Partner → Pickup Scheduled → Collection Completed → Verified Facility Recovery."
          actionButton={
            <button
              onClick={fetchCollections}
              disabled={isLoading}
              className="p-2 rounded-md border border-warm-border bg-warm-surface text-charcoal-600 hover:text-charcoal-900"
              title="Refresh Pipeline"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          }
        />

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Visual Step Pipeline Flow Banner */}
          <div className="bg-warm-surface border border-warm-border rounded-lg p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-3">
              Standard Resource Recovery Protocol
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded border border-sky-200 bg-sky-50/50 space-y-1">
                <span className="font-mono text-[10px] text-sky-700 font-bold uppercase">Stage 1</span>
                <span className="font-bold text-sky-950 block">Match Accepted</span>
                <p className="text-[11px] text-sky-800 leading-tight">
                  Compatibility verified against partner permits & capacity.
                </p>
              </div>

              <div className="p-3 rounded border border-amber-200 bg-amber-50/50 space-y-1">
                <span className="font-mono text-[10px] text-amber-700 font-bold uppercase">Stage 2</span>
                <span className="font-bold text-amber-950 block">Pickup Scheduled</span>
                <p className="text-[11px] text-amber-800 leading-tight">
                  Vehicle plate, driver & dispatch time window confirmed.
                </p>
              </div>

              <div className="p-3 rounded border border-indigo-200 bg-indigo-50/50 space-y-1">
                <span className="font-mono text-[10px] text-indigo-700 font-bold uppercase">Stage 3</span>
                <span className="font-bold text-indigo-950 block">Collected / In Transit</span>
                <p className="text-[11px] text-indigo-800 leading-tight">
                  Loaded from dock and transferred into logistics custody.
                </p>
              </div>

              <div className="p-3 rounded border border-emerald-200 bg-emerald-50/50 space-y-1">
                <span className="font-mono text-[10px] text-emerald-700 font-bold uppercase">Stage 4</span>
                <span className="font-bold text-emerald-950 block">Recovery Certified</span>
                <p className="text-[11px] text-emerald-800 leading-tight">
                  Weighbridge slip confirmed & actual net kg audited.
                </p>
              </div>
            </div>
          </div>

          {/* Stage Tabs */}
          <div className="flex items-center gap-2 border-b border-warm-border overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'All In-Progress', count: stageCounts.all },
              { id: 'matched', label: '1. Matched', count: stageCounts.matched },
              { id: 'pickup_scheduled', label: '2. Pickup Scheduled', count: stageCounts.pickup_scheduled },
              { id: 'collected', label: '3. Collected', count: stageCounts.collected },
              { id: 'recovery_recorded', label: '4. Recovery Certified', count: stageCounts.recovery_recorded },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'all' | 'matched' | 'pickup_scheduled' | 'collected' | 'recovery_recorded')}
                className={`px-3 py-2 rounded-t-md font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-forest-800 text-forest-900 bg-warm-surface font-semibold'
                    : 'text-charcoal-500 hover:text-charcoal-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-warm-muted text-charcoal-600">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Workflow List Table / Cards */}
          {isLoading ? (
            <div className="py-16 text-center text-xs text-charcoal-500 bg-warm-surface border border-warm-border rounded-lg">
              Loading recovery workflows...
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="space-y-3">
              {filteredListings.map((listing) => {
                const declaredKg = listing.unit === 'tonnes' ? listing.quantity * 1000 : listing.quantity;

                return (
                  <div
                    key={listing.id}
                    className="bg-warm-surface border border-warm-border rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-warm-border-strong transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Left: Material and Partners */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CategoryBadge category={listing.category} />
                        <StatusBadge status={listing.status} />
                        <span className="text-[11px] font-mono text-charcoal-400">
                          {listing.id}
                        </span>
                      </div>

                      <h3
                        onClick={() => setDetailModalListing(listing)}
                        className="text-base font-bold text-charcoal-950 font-serif hover:text-forest-800 cursor-pointer transition-colors"
                      >
                        {listing.title}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-charcoal-600">
                        <div className="flex items-center gap-1.5 truncate">
                          <Building className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                          <span>Origin: <strong className="text-charcoal-800">{listing.owner.org}</strong></span>
                        </div>

                        <div className="flex items-center gap-1.5 truncate">
                          <ShieldCheck className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                          <span>Partner: <strong className="text-charcoal-800">{listing.matchedPartnerName || 'Assigned Recycler'}</strong></span>
                        </div>
                      </div>

                      {/* Stage Specific Extra Details */}
                      {listing.pickupSchedule && (
                        <div className="text-xs text-amber-900 bg-amber-50/60 p-2 rounded border border-amber-200/80 flex items-center gap-2 flex-wrap">
                          <Calendar className="w-3.5 h-3.5 text-amber-700" />
                          <span>
                            Pickup: <strong>{listing.pickupSchedule.scheduledDate}</strong> ({listing.pickupSchedule.timeWindow})
                          </span>
                          <span>•</span>
                          <span>Vehicle: {listing.pickupSchedule.vehiclePlate || 'Assigned'}</span>
                          <span>•</span>
                          <span>Driver: {listing.pickupSchedule.driverName || 'Designated'}</span>
                        </div>
                      )}

                      {listing.collection?.actualRecoveredQtyKg && (
                        <div className="text-xs text-emerald-950 bg-emerald-50/70 p-2 rounded border border-emerald-200 flex items-center gap-2 flex-wrap">
                          <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                          <span>
                            Verified Net Weight: <strong className="font-mono text-emerald-900">{listing.collection.actualRecoveredQtyKg.toLocaleString()} kg</strong>
                          </span>
                          <span>•</span>
                          <span>Slip: <code className="font-mono">{listing.collection.weighbridgeSlipNumber}</code></span>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-emerald-800 truncate max-w-[150px]">
                            Hash: {listing.collection.verificationHash}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Quantity Metrics and Workflow Transition Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-warm-border">
                      <div className="text-left lg:text-right">
                        <span className="text-[11px] text-charcoal-500 block">Declared Load</span>
                        <span className="text-lg font-bold font-mono text-charcoal-900 block">
                          {declaredKg.toLocaleString()} kg
                        </span>
                        {listing.collection?.actualRecoveredQtyKg && (
                          <span className="text-xs font-mono text-emerald-800 font-semibold block">
                            Actual: {listing.collection.actualRecoveredQtyKg.toLocaleString()} kg
                          </span>
                        )}
                      </div>

                      {/* Transition Action Buttons */}
                      <div className="flex items-center gap-2">
                        {listing.status === 'matched' && (
                          <button
                            type="button"
                            onClick={() => setScheduleModalListing(listing)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-700 hover:bg-amber-800 text-warm-bg text-xs font-medium shadow-sm transition-all"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Schedule Pickup</span>
                          </button>
                        )}

                        {listing.status === 'pickup_scheduled' && (
                          <button
                            type="button"
                            onClick={() => setCompleteModalListing(listing)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-700 hover:bg-indigo-800 text-warm-bg text-xs font-medium shadow-sm transition-all"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Confirm Collected</span>
                          </button>
                        )}

                        {listing.status === 'collected' && (
                          <button
                            type="button"
                            onClick={() => setRecoveryModalListing(listing)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-warm-bg text-xs font-medium shadow-sm transition-all"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Record Recovery Qty</span>
                          </button>
                        )}

                        {listing.status === 'recovery_recorded' && (
                          <button
                            type="button"
                            onClick={() => setDetailModalListing(listing)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-warm-muted hover:bg-warm-border text-charcoal-700 text-xs font-medium border border-warm-border transition-all"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                            <span>View Certificate</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setDetailModalListing(listing)}
                          className="px-2.5 py-1.5 rounded text-xs text-charcoal-500 hover:text-charcoal-800 hover:bg-warm-muted"
                        >
                          Audit History
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center bg-warm-surface border border-warm-border rounded-lg p-8">
              <Truck className="w-8 h-8 text-charcoal-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-charcoal-800">
                No collection records in this stage
              </h3>
              <p className="text-xs text-charcoal-500 mt-1">
                Browse the material exchange to accept a compatible partner match.
              </p>
              <Link
                href="/listings"
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-forest-800 text-warm-bg text-xs font-medium hover:bg-forest-900 transition-colors"
              >
                Go to Material Exchange
              </Link>
            </div>
          )}
        </div>

        {/* Modals */}
        <SchedulePickupModal
          listing={scheduleModalListing}
          onClose={() => setScheduleModalListing(null)}
          onSuccess={() => {
            fetchCollections();
          }}
        />

        <CompleteCollectionModal
          listing={completeModalListing}
          onClose={() => setCompleteModalListing(null)}
          onSuccess={() => {
            fetchCollections();
          }}
        />

        <RecordRecoveryModal
          listing={recoveryModalListing}
          onClose={() => setRecoveryModalListing(null)}
          onSuccess={() => {
            fetchCollections();
          }}
        />

        <ListingDetailModal
          listing={detailModalListing}
          onClose={() => setDetailModalListing(null)}
          onFindMatches={(id) => {
            router.push(`/matches?listingId=${id}`);
          }}
          onSchedulePickup={(l) => setScheduleModalListing(l)}
          onCompleteCollection={(l) => setCompleteModalListing(l)}
          onRecordRecovery={(l) => setRecoveryModalListing(l)}
        />
      </main>
    </div>
  );
}
