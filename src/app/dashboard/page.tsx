'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Scale,
  Layers,
  Calendar,
  CheckCircle2,
  Leaf,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Navbar } from '@/components/navigation/Navbar';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { CreateListingModal } from '@/components/listings/CreateListingModal';
import { ListingDetailModal } from '@/components/listings/ListingDetailModal';
import { DashboardStats, Listing } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  cardboard: '#d97706', // amber
  paper: '#78716c', // stone
  plastics: '#0d9488', // teal
  metals: '#475569', // slate
  electronic_waste: '#e11d48', // rose
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const fetchDashboardData = useCallback(async () => {
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
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const chartData = stats
    ? stats.categoryMetrics.map((item) => ({
        name: item.displayName.split(' ')[0],
        fullName: item.displayName,
        recoveredKg: item.recoveredKg,
        category: item.category,
        co2eAvoided: item.co2eAvoidedKg,
      }))
    : [];

  const upcomingPickups = listings.filter(
    (l) => l.status === 'pickup_scheduled' || l.status === 'matched'
  );

  const recentRecoveries = listings.filter((l) => l.status === 'recovery_recorded');

  return (
    <div className="flex min-h-screen bg-warm-bg text-charcoal-900">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Navbar
          title="Circular Resource Intelligence"
          subtitle="Real-time resource recovery metrics, operational collection workflows and audited circularity."
          onOpenCreateListing={() => setIsCreateModalOpen(true)}
          actionButton={
            <button
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="p-2 rounded-md border border-warm-border bg-warm-surface text-charcoal-600 hover:text-charcoal-900 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          }
        />

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Top Operational Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Material Recovered"
              value={stats?.totalMaterialRecoveredKg ?? 0}
              unit="kg"
              icon={Scale}
              accentColor="forest"
              subtitle="Physically weighed & certified"
              explanation="Total mass of recyclable materials whose recovery has been certified with a facility weighbridge ticket. Seeded records are labelled DEMO."
            />

            <MetricCard
              title="Active Listings"
              value={stats?.activeListingsCount ?? 0}
              icon={Layers}
              accentColor="sage"
              subtitle="Available or pending partner match"
              explanation="Number of waste listings currently open for matching or partner review across participating universities, offices and facilities."
            />

            <MetricCard
              title="Pending Pickups"
              value={stats?.pendingPickupsCount ?? 0}
              icon={Calendar}
              accentColor="amber"
              subtitle="Logistics scheduled & in transit"
              explanation="Batches that have been accepted by a certified recovery partner and have a scheduled vehicle dispatch or active field collection."
            />

            <MetricCard
              title="Completed Collections"
              value={stats?.completedCollectionsCount ?? 0}
              icon={CheckCircle2}
              accentColor="teal"
              subtitle="Material taken into facility custody"
              explanation="Collections that have been physically completed and entered into licensed material recovery facility (MRF) or processor custody."
            />
          </div>

          {/* Environmental Accounting Overview Banner */}
          <div className="p-4 rounded-lg border border-forest-100 bg-forest-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-md bg-forest-800 text-emerald-300 mt-0.5">
                <Leaf className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-forest-950 font-serif">
                  Estimated Lifecycle Carbon Displacement:{' '}
                  <span className="font-mono text-forest-900">
                    {stats?.estimatedTotalCO2eAvoidedKg.toLocaleString() ?? 0} kg CO₂e
                  </span>
                </h3>
                <p className="text-xs text-forest-800/90 mt-0.5 leading-relaxed">
                  Calculated against certified recovery weights using EPA WARM & CPCB lifecycle factors. Estimated diversion volume:{' '}
                  <span className="font-mono font-medium">
                    {stats?.estimatedLandfillSavedM3.toLocaleString() ?? 0} m³
                  </span>
                  .
                </p>
              </div>
            </div>

            <Link
              href="/impact"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-900 hover:text-forest-700 bg-white/80 border border-forest-200 px-3 py-1.5 rounded self-start sm:self-auto transition-colors"
            >
              <span>View Methodology & Disclosures</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Recovery Breakdown Chart & Category Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2 bg-warm-surface border border-warm-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-charcoal-900 font-serif">
                    Certified Recovery by Material Category (kg)
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Strictly reflects recorded facility receipts, not prospective listings.
                  </p>
                </div>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-warm-muted text-charcoal-600">
                  Weighed Mass
                </span>
              </div>

              <div className="h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#55665d' }}
                        axisLine={{ stroke: '#e2e6e2' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#55665d' }}
                        axisLine={{ stroke: '#e2e6e2' }}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-warm-surface border border-warm-border p-2.5 rounded shadow-md text-xs space-y-1">
                                <p className="font-semibold text-charcoal-900">{data.fullName}</p>
                                <p className="text-charcoal-700">
                                  Recovered:{' '}
                                  <span className="font-mono font-semibold">
                                    {data.recoveredKg.toLocaleString()} kg
                                  </span>
                                </p>
                                <p className="text-emerald-800 text-[11px]">
                                  Est. CO₂e Avoided: {data.co2eAvoided.toLocaleString()} kg
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="recoveredKg" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry) => (
                          <Cell
                            key={`cell-${entry.category}`}
                            fill={CATEGORY_COLORS[entry.category] || '#153e2d'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-charcoal-400">
                    No recovery records yet
                  </div>
                )}
              </div>
            </div>

            {/* Category Metrics Summary */}
            <div className="bg-warm-surface border border-warm-border rounded-lg p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-charcoal-900 font-serif mb-1">
                  Category Distribution
                </h3>
                <p className="text-xs text-charcoal-500 mb-4">
                  Breakdown across the 5 managed material streams.
                </p>

                <div className="space-y-3">
                  {stats?.categoryMetrics.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between text-xs pb-2 border-b border-warm-border last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor: CATEGORY_COLORS[item.category] || '#153e2d',
                          }}
                        />
                        <span className="font-medium text-charcoal-800">
                          {item.displayName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-semibold text-charcoal-900 block">
                          {item.recoveredKg.toLocaleString()} kg
                        </span>
                        <span className="text-[10px] text-charcoal-400">
                          {item.activeListingsCount} active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-warm-border mt-4">
                <Link
                  href="/listings"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded text-xs font-medium text-forest-900 bg-forest-50 hover:bg-forest-100 border border-forest-100 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Browse Exchange Listings</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Upcoming Pickups & Recent Certified Recoveries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Pickups */}
            <div className="bg-warm-surface border border-warm-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-700" />
                  <h3 className="text-sm font-bold text-charcoal-900 font-serif">
                    Upcoming Pickups & Scheduled Dispatches
                  </h3>
                </div>
                <Link
                  href="/collections"
                  className="text-xs text-forest-800 hover:text-forest-950 font-medium flex items-center gap-1"
                >
                  <span>View Tracker</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {upcomingPickups.length > 0 ? (
                <div className="space-y-3">
                  {upcomingPickups.slice(0, 4).map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => setSelectedListing(listing)}
                      className="p-3 rounded-md border border-warm-border bg-warm-bg/50 hover:bg-warm-bg cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <CategoryBadge category={listing.category} showIcon={false} />
                            <StatusBadge status={listing.status} size="sm" />
                          </div>
                          <h4 className="text-xs font-semibold text-charcoal-900 mt-1.5">
                            {listing.title}
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-semibold text-charcoal-800 shrink-0">
                          {listing.quantity.toLocaleString()} {listing.unit}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-charcoal-500 mt-2 pt-2 border-t border-warm-subtle">
                        <span>
                          {listing.location.name} ({listing.location.zone})
                        </span>
                        {listing.pickupSchedule ? (
                          <span className="font-mono text-amber-900 font-medium">
                            {listing.pickupSchedule.scheduledDate}
                          </span>
                        ) : (
                          <span className="text-sky-800">Partner Matched</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-charcoal-400">
                  No pending pickups scheduled at this moment.
                </div>
              )}
            </div>

            {/* Recent Verified Recoveries */}
            <div className="bg-warm-surface border border-warm-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-bold text-charcoal-900 font-serif">
                    Recent Certified Recoveries
                  </h3>
                </div>
                <Link
                  href="/collections"
                  className="text-xs text-forest-800 hover:text-forest-950 font-medium flex items-center gap-1"
                >
                  <span>All Records</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {recentRecoveries.length > 0 ? (
                <div className="space-y-3">
                  {recentRecoveries.slice(0, 4).map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => setSelectedListing(listing)}
                      className="p-3 rounded-md border border-warm-border bg-warm-bg/50 hover:bg-warm-bg cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <CategoryBadge category={listing.category} showIcon={false} />
                            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Slip: {listing.collection?.weighbridgeSlipNumber}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-charcoal-900 mt-1.5">
                            {listing.title}
                          </h4>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-emerald-900 block">
                            {listing.collection?.actualRecoveredQtyKg?.toLocaleString()} kg
                          </span>
                          <span className="text-[10px] text-charcoal-400">Certified Net</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-charcoal-600 mt-1 truncate">
                        {listing.collection?.recoveryFacility}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-charcoal-400">
                  No recoveries certified yet. Complete a collection to certify.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Listing Modal */}
        <CreateListingModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            fetchDashboardData();
          }}
        />

        {/* Listing Detail Modal */}
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onFindMatches={(id) => {
            router.push(`/matches?listingId=${id}`);
          }}
        />
      </main>
    </div>
  );
}
