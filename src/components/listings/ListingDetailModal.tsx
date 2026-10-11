'use client';

import React from 'react';
import {
  X,
  MapPin,
  Building,
  User,
  Calendar,
  Layers,
  Sparkles,
  Truck,
  ShieldCheck,
  Clock,
  Trash2,
} from 'lucide-react';
import { Listing } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';

interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  onFindMatches: (listingId: string) => void;
  onSchedulePickup?: (listing: Listing) => void;
  onCompleteCollection?: (listing: Listing) => void;
  onRecordRecovery?: (listing: Listing) => void;
  onDelete?: (listingId: string) => void;
}

export function ListingDetailModal({
  listing,
  onClose,
  onFindMatches,
  onSchedulePickup,
  onCompleteCollection,
  onRecordRecovery,
  onDelete,
}: ListingDetailModalProps) {
  if (!listing) return null;

  const qtyDisplay = `${listing.quantity.toLocaleString()} ${listing.unit}`;
  const qtyKg = listing.unit === 'tonnes' ? listing.quantity * 1000 : listing.quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-warm-surface border border-warm-border rounded-lg max-w-2xl w-full shadow-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-warm-border flex items-start justify-between bg-warm-muted/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryBadge category={listing.category} />
              <StatusBadge status={listing.status} />
              <span className="text-[11px] font-mono text-charcoal-400">
                ID: {listing.id}
              </span>
            </div>
            <h2 className="text-lg font-bold text-charcoal-950 font-serif mt-1">
              {listing.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-charcoal-400 hover:text-charcoal-700 hover:bg-warm-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-warm-bg border border-warm-border p-3 rounded-md">
              <span className="text-[11px] text-charcoal-500 font-medium block">
                Declared Quantity
              </span>
              <span className="text-base font-semibold font-mono text-charcoal-900 mt-0.5 block">
                {qtyDisplay}
              </span>
              <span className="text-[10px] text-charcoal-400">({qtyKg} kg basis)</span>
            </div>

            <div className="bg-warm-bg border border-warm-border p-3 rounded-md">
              <span className="text-[11px] text-charcoal-500 font-medium block">
                Condition Grade
              </span>
              <span className="text-xs font-semibold capitalize text-charcoal-800 mt-0.5 block truncate">
                {listing.condition.replace('_', ' ')}
              </span>
              <span className="text-[10px] text-charcoal-400">Physical purity</span>
            </div>

            <div className="bg-warm-bg border border-warm-border p-3 rounded-md">
              <span className="text-[11px] text-charcoal-500 font-medium block">
                Zone / Cluster
              </span>
              <span className="text-xs font-semibold text-charcoal-800 mt-0.5 block truncate">
                {listing.location.zone}
              </span>
              <span className="text-[10px] text-charcoal-400">{listing.location.city}</span>
            </div>

            <div className="bg-warm-bg border border-warm-border p-3 rounded-md">
              <span className="text-[11px] text-charcoal-500 font-medium block">
                Listing Age
              </span>
              <span className="text-xs font-semibold text-charcoal-800 mt-0.5 block">
                {new Date(listing.createdAt).toLocaleDateString()}
              </span>
              <span className="text-[10px] text-charcoal-400">
                {listing.source === 'demo_seeded' ? 'Seeded demo' : 'Live entry'}
              </span>
            </div>
          </div>

          {/* Condition Notes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-1">
              Material Specification & Condition Notes
            </h4>
            <p className="text-xs text-charcoal-700 bg-warm-muted/60 p-3 rounded border border-warm-border leading-relaxed">
              {listing.conditionNotes || 'No additional condition notes specified.'}
            </p>
          </div>

          {/* Handling Requirements */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2">
              Handling & Logistics Protocols
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {listing.handlingRequirements.map((req) => (
                <span
                  key={req}
                  className="px-2.5 py-1 rounded bg-warm-muted border border-warm-border text-[11px] text-charcoal-700"
                >
                  {req.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* Location & Generator Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-warm-border pt-4">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-forest-700" />
                Pickup Location
              </h4>
              <div className="text-xs text-charcoal-700 space-y-0.5">
                <p className="font-semibold text-charcoal-900">{listing.location.name}</p>
                <p>{listing.location.address}</p>
                <p className="text-charcoal-500">
                  {listing.location.campusOrFacility} • {listing.location.zone}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-forest-700" />
                Generator Information
              </h4>
              <div className="text-xs text-charcoal-700 space-y-0.5">
                <p className="font-semibold text-charcoal-900">{listing.owner.org}</p>
                <p>
                  {listing.owner.name} ({listing.owner.type})
                </p>
                <p className="text-charcoal-500">
                  {listing.owner.contactEmail} • {listing.owner.contactPhone}
                </p>
              </div>
            </div>
          </div>

          {/* Matched Partner / Schedule / Collection Highlights if applicable */}
          {listing.matchedPartnerName && (
            <div className="p-3.5 rounded-md bg-forest-50/70 border border-forest-200 text-xs text-forest-900 space-y-1">
              <span className="font-semibold flex items-center gap-1.5 text-forest-950">
                <ShieldCheck className="w-4 h-4 text-forest-700" />
                Matched Partner: {listing.matchedPartnerName}
              </span>
              {listing.pickupSchedule && (
                <p className="text-forest-800 text-[11px]">
                  Scheduled for {listing.pickupSchedule.scheduledDate} (
                  {listing.pickupSchedule.timeWindow}) • Vehicle:{' '}
                  {listing.pickupSchedule.vehiclePlate || 'Assigned'}
                </p>
              )}
              {listing.collection?.actualRecoveredQtyKg && (
                <p className="text-emerald-900 font-semibold text-[11px]">
                  Confirmed Actual Recovery: {listing.collection.actualRecoveredQtyKg} kg • Slip:{' '}
                  {listing.collection.weighbridgeSlipNumber}
                </p>
              )}
            </div>
          )}

          {/* Status Transition Audit Trail */}
          <div className="border-t border-warm-border pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-charcoal-600" />
              Verified Status History & Audit Trail
            </h4>

            <div className="space-y-2.5">
              {listing.statusHistory.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs pb-2 border-b border-warm-subtle last:border-0 last:pb-0"
                >
                  <span className="w-2 h-2 rounded-full bg-forest-700 mt-1 shrink-0"></span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-charcoal-900 capitalize">
                        {step.toStatus.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-charcoal-400 font-mono">
                        {new Date(step.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-charcoal-600 text-[11px] mt-0.5">{step.note}</p>
                    <span className="text-[10px] text-charcoal-400 block mt-0.5">
                      Actor: {step.actor}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-warm-border bg-warm-muted/40 flex items-center justify-between gap-3">
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (confirm('Delete this listing?')) {
                  onDelete(listing.id);
                  onClose();
                }
              }}
              className="text-xs text-rose-700 hover:text-rose-900 flex items-center gap-1 px-2.5 py-1.5 rounded hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            {listing.status === 'available' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onFindMatches(listing.id);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-forest-800 hover:bg-forest-900 text-warm-bg text-xs sm:text-sm font-medium shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Find Compatible Partners</span>
              </button>
            )}

            {listing.status === 'matched' && onSchedulePickup && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSchedulePickup(listing);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-amber-700 hover:bg-amber-800 text-warm-bg text-xs sm:text-sm font-medium shadow-sm transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Collection Pickup</span>
              </button>
            )}

            {listing.status === 'pickup_scheduled' && onCompleteCollection && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCompleteCollection(listing);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-indigo-700 hover:bg-indigo-800 text-warm-bg text-xs sm:text-sm font-medium shadow-sm transition-all"
              >
                <Truck className="w-4 h-4" />
                <span>Confirm Collection Completed</span>
              </button>
            )}

            {listing.status === 'collected' && onRecordRecovery && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRecordRecovery(listing);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-emerald-800 hover:bg-emerald-900 text-warm-bg text-xs sm:text-sm font-medium shadow-sm transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Record Actual Recovered Quantity</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-charcoal-600 hover:text-charcoal-900"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
