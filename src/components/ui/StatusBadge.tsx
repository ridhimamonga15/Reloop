import React from 'react';
import { ListingStatus } from '@/types';
import { CheckCircle2, Clock, Calendar, Truck, ShieldCheck, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ListingStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  switch (status) {
    case 'available':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-forest-50 text-forest-800 border border-forest-100 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-forest-600"></span>
          Available
        </span>
      );

    case 'matched':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-sky-50 text-sky-800 border border-sky-200 ${sizeClasses}`}
        >
          <Clock className="w-3 h-3 text-sky-600" />
          Matched
        </span>
      );

    case 'pickup_scheduled':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}
        >
          <Calendar className="w-3 h-3 text-amber-600" />
          Pickup Scheduled
        </span>
      );

    case 'collected':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 ${sizeClasses}`}
        >
          <Truck className="w-3 h-3 text-indigo-600" />
          In Transit / Collected
        </span>
      );

    case 'recovery_recorded':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 ${sizeClasses}`}
        >
          <ShieldCheck className="w-3 h-3 text-emerald-700" />
          Recovery Certified
        </span>
      );

    case 'cancelled':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-rose-50 text-rose-800 border border-rose-200 ${sizeClasses}`}
        >
          <XCircle className="w-3 h-3 text-rose-600" />
          Cancelled
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-charcoal-100 text-charcoal-700 border border-charcoal-200 ${sizeClasses}`}
        >
          {status}
        </span>
      );
  }
}
