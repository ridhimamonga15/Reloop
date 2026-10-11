'use client';

import React from 'react';
import { Plus, AlertCircle } from 'lucide-react';

interface NavbarProps {
  title: string;
  subtitle?: string;
  onOpenCreateListing?: () => void;
  actionButton?: React.ReactNode;
}

export function Navbar({
  title,
  subtitle,
  onOpenCreateListing,
  actionButton,
}: NavbarProps) {
  return (
    <header className="border-b border-warm-border bg-warm-surface/80 backdrop-blur-xs sticky top-0 z-20 px-4 sm:px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal-950 font-serif">
              {title}
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              DEMO
            </span>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {actionButton}

          {onOpenCreateListing && (
            <button
              type="button"
              onClick={onOpenCreateListing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-forest-800 hover:bg-forest-900 text-warm-bg text-xs sm:text-sm font-medium shadow-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-forest-700/50"
            >
              <Plus className="w-4 h-4" />
              <span>List Recyclable Waste</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
