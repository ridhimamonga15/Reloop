'use client';

import React, { useState } from 'react';
import { X, Calendar, Truck, User, FileText, Loader2, Check } from 'lucide-react';
import { Listing } from '@/types';

interface SchedulePickupModalProps {
  listing: Listing | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function SchedulePickupModal({
  listing,
  onClose,
  onSuccess,
}: SchedulePickupModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default to tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [schedule, setSchedule] = useState({
    scheduledDate: defaultDateStr,
    timeWindow: '10:00 AM - 01:00 PM',
    driverName: 'Sanjay Kumar',
    vehiclePlate: 'DL-1L-AA-5521 (Eicher 14ft)',
    contactPerson: listing?.owner.name || '',
    notes: 'Gate access permit pre-coordinated with facility security.',
  });

  if (!listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!schedule.scheduledDate) {
      setError('Please select a pickup date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'schedule_pickup',
          listingId: listing.id,
          schedule: {
            scheduledDate: schedule.scheduledDate,
            timeWindow: schedule.timeWindow,
            driverName: schedule.driverName.trim(),
            vehiclePlate: schedule.vehiclePlate.trim(),
            contactPerson: schedule.contactPerson.trim(),
            notes: schedule.notes.trim(),
          },
          actorName: 'Logistics Coordinator',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to schedule pickup');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error scheduling pickup';
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
              <Calendar className="w-5 h-5 text-amber-700" />
              Schedule Collection Pickup
            </h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Listing: <span className="font-semibold text-charcoal-800">{listing.title}</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Scheduled Pickup Date *
              </label>
              <input
                type="date"
                required
                value={schedule.scheduledDate}
                onChange={(e) => setSchedule({ ...schedule, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Time Window *
              </label>
              <select
                value={schedule.timeWindow}
                onChange={(e) => setSchedule({ ...schedule, timeWindow: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden"
              >
                <option value="08:00 AM - 11:00 AM">Morning (08:00 AM - 11:00 AM)</option>
                <option value="10:00 AM - 01:00 PM">Midday (10:00 AM - 01:00 PM)</option>
                <option value="02:00 PM - 05:00 PM">Afternoon (02:00 PM - 05:00 PM)</option>
                <option value="05:00 PM - 08:00 PM">Evening (05:00 PM - 08:00 PM)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Assigned Vehicle Plate
              </label>
              <input
                type="text"
                value={schedule.vehiclePlate}
                onChange={(e) => setSchedule({ ...schedule, vehiclePlate: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Driver / Logistics Lead
              </label>
              <input
                type="text"
                value={schedule.driverName}
                onChange={(e) => setSchedule({ ...schedule, driverName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              On-Site Contact Person
            </label>
            <input
              type="text"
              value={schedule.contactPerson}
              onChange={(e) => setSchedule({ ...schedule, contactPerson: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Dispatch Instructions & Dock Access
            </label>
            <textarea
              rows={2}
              value={schedule.notes}
              onChange={(e) => setSchedule({ ...schedule, notes: e.target.value })}
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-amber-700 hover:bg-amber-800 text-warm-bg text-xs sm:text-sm font-medium shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm Pickup Schedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
