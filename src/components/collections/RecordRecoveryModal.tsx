'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Check, Loader2, AlertCircle } from 'lucide-react';
import { Listing } from '@/types';

interface RecordRecoveryModalProps {
  listing: Listing | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function RecordRecoveryModal({
  listing,
  onClose,
  onSuccess,
}: RecordRecoveryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const declaredKg = listing
    ? listing.unit === 'tonnes'
      ? listing.quantity * 1000
      : listing.quantity
    : 0;

  const [actualQty, setActualQty] = useState(declaredKg ? String(declaredKg) : '');
  const [weighbridgeSlip, setWeighbridgeSlip] = useState(
    () => `WB-${Date.now().toString().slice(-6)}`
  );
  const [recoveryFacility, setRecoveryFacility] = useState(
    listing?.matchedPartnerName ? `${listing.matchedPartnerName} Recycling Facility` : 'Licensed Recovery Plant'
  );
  const [notes, setNotes] = useState(
    'Net calibrated scale reading verified. Material accepted for circular mechanical reprocessing/smelting.'
  );

  if (!listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qtyNumber = parseFloat(actualQty);
    if (isNaN(qtyNumber) || qtyNumber <= 0) {
      setError('Actual recovered quantity must be a positive number greater than 0.');
      return;
    }

    if (!weighbridgeSlip.trim()) {
      setError('Please provide a weighbridge ticket or verification slip number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_recovery',
          listingId: listing.id,
          actualRecoveredQtyKg: qtyNumber,
          recoveryData: {
            weighbridgeSlipNumber: weighbridgeSlip.trim(),
            recoveryFacility: recoveryFacility.trim(),
            notes: notes.trim(),
          },
          actorName: 'Certified Weighbridge Auditor',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record recovery');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error recording recovery';
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
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              Record Confirmed Recovery Quantity
            </h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Enter verified weight accepted by the facility for certified circular recovery.
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
          <div className="p-3.5 rounded-md bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold block text-emerald-900">
                Audited Recovery Certification
              </span>
              This step finalizes the circular recovery record and commits actual weighed kilograms into the platform&apos;s verified environmental intelligence metrics.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Declared Generator Load
              </label>
              <div className="px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-muted font-mono text-charcoal-700">
                {declaredKg.toLocaleString()} kg
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Actual Recovered Quantity (kg) *
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={actualQty}
                onChange={(e) => setActualQty(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-emerald-300 bg-warm-bg focus:border-emerald-700 focus:bg-white focus:outline-hidden font-mono font-semibold text-emerald-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Weighbridge Slip / Manifest # *
              </label>
              <input
                type="text"
                required
                value={weighbridgeSlip}
                onChange={(e) => setWeighbridgeSlip(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Recovery Facility Name *
              </label>
              <input
                type="text"
                required
                value={recoveryFacility}
                onChange={(e) => setRecoveryFacility(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Verification Notes & Batch Certificate
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-800 hover:bg-emerald-900 text-warm-bg text-xs sm:text-sm font-medium shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Certifying Recovery...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Certify & Record Recovery</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
