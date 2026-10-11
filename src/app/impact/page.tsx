'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Leaf,
  Scale,
  AlertTriangle,
  Layers,
  ShieldCheck,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Navbar } from '@/components/navigation/Navbar';
import { MetricCard } from '@/components/ui/MetricCard';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { DashboardStats, Listing } from '@/types';
import { IMPACT_METHODOLOGY_DISCLOSURES } from '@/lib/impact';

export default function ImpactPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchImpactData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, listingsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/listings'),
      ]);

      const statsData = await statsRes.json();
      const listingsData = await listingsRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }
      if (listingsData.success) {
        setListings(listingsData.listings);
      }
    } catch (err) {
      console.error('Failed to load impact data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImpactData();
  }, [fetchImpactData]);

  const recoveredListings = listings.filter((l) => l.status === 'recovery_recorded');

  return (
    <div className="flex min-h-screen bg-warm-bg text-charcoal-900">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Navbar
          title="Environmental Impact & Intelligence"
          subtitle="Transparent resource recovery accounting, lifecycle displacement factors and verifiable audit records."
          actionButton={
            <button
              onClick={fetchImpactData}
              disabled={isLoading}
              className="p-2 rounded-md border border-warm-border bg-warm-surface text-charcoal-600 hover:text-charcoal-900"
              title="Refresh Impact Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          }
        />

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Important Disclosure Banner */}
          <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/70 text-xs text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-950 text-sm block">
                Accounting Standards & Honest Disclosure Policy
              </span>
              <p className="leading-relaxed text-amber-900">
                ReLoop distinguishes <strong>actual recorded quantities (physically weighed net kg)</strong> from <strong>prospective estimates</strong>. We do not claim material has been recycled unless receipt and processing have been certified by an authorized recovery facility. Avoided lifecycle emissions are calculated as indicative estimates using EPA WARM v15 and CPCB emission factors.
              </p>
            </div>
          </div>

          {/* Core Impact Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Certified Material Recovered"
              value={stats?.totalMaterialRecoveredKg ?? 0}
              unit="kg"
              icon={Scale}
              accentColor="forest"
              subtitle="Audited weighbridge intake"
              explanation="Cumulative net kilograms of recyclable material certified by receiving facilities across all recorded collection workflows."
            />

            <MetricCard
              title="Estimated Avoided Emissions"
              value={stats?.estimatedTotalCO2eAvoidedKg ?? 0}
              unit="kg CO₂e"
              icon={Leaf}
              accentColor="sage"
              subtitle="Lifecycle virgin substitution"
              explanation="Indicative carbon displacement calculated by multiplying certified kilograms recovered by material-specific EPA WARM conversion factors."
            />

            <MetricCard
              title="Estimated Landfill Saved"
              value={stats?.estimatedLandfillSavedM3 ?? 0}
              unit="m³"
              icon={Layers}
              accentColor="teal"
              subtitle="Avoided municipal landfill volume"
              explanation="Approximate landfill air-space conserved based on uncompacted material density factors for baled recyclables."
            />
          </div>

          {/* Breakdown by Material Stream Table */}
          <div className="bg-warm-surface border border-warm-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-charcoal-900 font-serif">
                  Material Recovery Stream Ledger
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Actual verified kilograms alongside model conversion factors.
                </p>
              </div>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-warm-muted text-charcoal-600">
                Audit Trail
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-warm-border text-charcoal-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">Material Stream</th>
                    <th className="py-2.5 px-3">Verified Mass (kg)</th>
                    <th className="py-2.5 px-3">CO₂e Factor</th>
                    <th className="py-2.5 px-3">Est. Avoided CO₂e</th>
                    <th className="py-2.5 px-3">Landfill Vol (m³/kg)</th>
                    <th className="py-2.5 px-3">Est. Vol Saved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-subtle">
                  {stats?.categoryMetrics.map((item) => (
                    <tr key={item.category} className="hover:bg-warm-bg/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <CategoryBadge category={item.category} showIcon={false} />
                          <span className="font-semibold text-charcoal-900">{item.displayName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-charcoal-900">
                        {item.recoveredKg.toLocaleString()} kg
                      </td>
                      <td className="py-3 px-3 font-mono text-charcoal-600">
                        {item.co2eFactor} kg/kg
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-emerald-800">
                        {item.co2eAvoidedKg.toLocaleString()} kg
                      </td>
                      <td className="py-3 px-3 font-mono text-charcoal-600">
                        {item.landfillVolumeFactor}
                      </td>
                      <td className="py-3 px-3 font-mono text-charcoal-800">
                        {item.landfillVolumeSavedM3.toLocaleString()} m³
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scientific Methodology & Lifecycle Disclosures */}
          <div className="bg-warm-surface border border-warm-border rounded-lg p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-charcoal-900 font-serif flex items-center gap-2">
                <FileText className="w-4 h-4 text-forest-700" />
                Scientific Methodology, Sources & Uncertainty Disclosures
              </h2>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Every calculation factor and its boundary conditions are documented transparently below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {IMPACT_METHODOLOGY_DISCLOSURES.map((disclosure) => (
                <div
                  key={disclosure.category}
                  className="p-4 rounded-md border border-warm-border bg-warm-bg space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-charcoal-900 font-serif text-sm">
                      {disclosure.name}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                      Factor: {disclosure.co2eFactor} kg CO₂e / kg
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-charcoal-500 block">Source Benchmark:</span>
                    <p className="text-charcoal-700 mt-0.5">{disclosure.source}</p>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-charcoal-500 block">System Boundary:</span>
                    <p className="text-charcoal-600 mt-0.5">{disclosure.boundary}</p>
                  </div>

                  <div className="pt-1.5 border-t border-warm-subtle">
                    <span className="text-[11px] font-semibold text-amber-800 block">Limitations & Assumptions:</span>
                    <p className="text-charcoal-600 text-[11px] mt-0.5 leading-relaxed">{disclosure.limitations}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certified Facility Receipts Log */}
          <div className="bg-warm-surface border border-warm-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-charcoal-900 font-serif flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Audited Facility Receipts Ledger ({recoveredListings.length})
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Verified batches with tamper-resistant verification hashes.
                </p>
              </div>
            </div>

            {recoveredListings.length > 0 ? (
              <div className="space-y-3">
                {recoveredListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="p-3.5 rounded-md border border-warm-border bg-warm-bg/60 text-xs space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CategoryBadge category={listing.category} showIcon={false} />
                        <span className="font-bold text-charcoal-900">{listing.title}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-900 text-sm">
                          {listing.collection?.actualRecoveredQtyKg?.toLocaleString()} kg
                        </span>
                        <span className="text-[10px] text-charcoal-500 ml-1">Certified Net</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-charcoal-600 pt-2 border-t border-warm-subtle">
                      <div>
                        <span className="text-charcoal-400 block">Recovery Facility:</span>
                        <span className="text-charcoal-800 font-medium">{listing.collection?.recoveryFacility}</span>
                      </div>
                      <div>
                        <span className="text-charcoal-400 block">Weighbridge Slip:</span>
                        <span className="font-mono text-charcoal-800">{listing.collection?.weighbridgeSlipNumber}</span>
                      </div>
                      <div>
                        <span className="text-charcoal-400 block">Verification Audit Hash:</span>
                        <span className="font-mono text-emerald-800 truncate block">
                          {listing.collection?.verificationHash}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-charcoal-400">
                No certified receipts logged yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
