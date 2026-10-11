'use client';

import React, { useState } from 'react';
import { X, Truck, Check, Loader2 } from 'lucide-react';
import { Listing } from '@/types';

interface CompleteCollectionModalProps {
  listing: Listing | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CompleteCollectionModal({
  listing,
  onClose,
  onSuccess,
}: CompleteCollectionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [details, setDetails] = useState({
    collectorName: listing?.pickupSchedule?.driverName || 'Designated Transport Driver',
    recoveryFacility: listing?.matchedPartnerName ? `${listing.matchedPartnerName} Depot` : 'Authorized Receiving Yard',
    notes: 'Material successfully weighed tare, loaded into carrier, and verified against gate manifest.',
  });

  if (!listing) return null;

  const declaredKg = listing.unit === 'tonnes' ? listing.quantity * 1000 : listing.quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete_collection',
          listingId: listing.id,
          collectionDetails: {
            collectorName: details.collectorName.trim(),
            recoveryFacility: details.recoveryFacility.trim(),
            notes: details.notes.trim(),
          },
          actorName: details.collectorName.trim() || 'Logistics Driver',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete collection');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error completing collection';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-warm-surface border border-warm-border rounded-lg max-w-lg w-full shadow-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-warm-border flex items-center justify-between bg-warm-muted/40">
          <div>
            <h2 className="text-lg font-bold text-charcoal-950 font-serif flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-700" />
              Confirm Collection Execution
            </h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Declare that material has been physically collected and is in transit.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-charcoal-400 hover:text-charcoal-700 hover:bg-warm-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-md bg-warm-bg border border-warm-border text-xs text-charcoal-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-charcoal-500">Material:</span>
              <span className="font-semibold text-charcoal-900">{listing.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Declared Batch Load:</span>
              <span className="font-semibold font-mono text-charcoal-900">{declaredKg.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Origin Facility:</span>
              <span>{listing.location.name}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Field Collector / Driver Name *
            </label>
            <input
              type="text"
              required
              value={details.collectorName}
              onChange={(e) => setDetails({ ...details, collectorName: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Destination Recovery Facility / Yard *
            </label>
            <input
              type="text"
              required
              value={details.recoveryFacility}
              onChange={(e) => setDetails({ ...details, recoveryFacility: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Collection & Handover Notes
            </label>
            <textarea
              rows={2}
              value={details.notes}
              onChange={(e) => setDetails({ ...details, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="pt-4 border-t border-warm-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-charcoal-600 hover:text-charcoal-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-indigo-700 hover:bg-indigo-800 text-warm-bg text-xs sm:text-sm font-medium shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Status...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm Collected</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
