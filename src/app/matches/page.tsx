'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Navbar } from '@/components/navigation/Navbar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SchedulePickupModal } from '@/components/collections/SchedulePickupModal';
import { Listing, MatchResult } from '@/types';

function MatchesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlListingId = searchParams.get('listingId');

  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string>(urlListingId || '');
  const [matchData, setMatchData] = useState<{
    listingTitle: string;
    category: string;
    quantityKg: number;
    matches: MatchResult[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [scheduledListing, setScheduledListing] = useState<Listing | null>(null);

  const fetchAvailableListings = useCallback(async () => {
    try {
      const res = await fetch('/api/listings');
      const data = await res.json();
      if (data.success && data.listings.length > 0) {
        setListings(data.listings);
        if (!selectedListingId) {
          // Default to first available listing or first listing
          const firstAvailable =
            data.listings.find((l: Listing) => l.status === 'available') || data.listings[0];
          setSelectedListingId(firstAvailable.id);
        }
      }
    } catch (err) {
      console.error('Error fetching listings for matcher:', err);
    }
  }, [selectedListingId]);

  const fetchMatches = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/matches?listingId=${id}`);
      const data = await res.json();
      if (data.success) {
        setMatchData({
          listingTitle: data.listingTitle,
          category: data.category,
          quantityKg: data.quantityKg,
          matches: data.matches,
        });
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableListings();
  }, [fetchAvailableListings]);

  useEffect(() => {
    if (selectedListingId) {
      fetchMatches(selectedListingId);
    }
  }, [selectedListingId, fetchMatches]);

  const handleAcceptMatch = async (partnerId: string) => {
    setIsAccepting(partnerId);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept_match',
          listingId: selectedListingId,
          partnerId,
          actorName: 'Operations Coordinator',
        }),
      });

      const data = await res.json();
      if (data.success && data.listing) {
        // Open the schedule pickup modal right away!
        setScheduledListing(data.listing);
        // Refresh match list
        fetchMatches(selectedListingId);
      }
    } catch (err) {
      console.error('Failed to accept match:', err);
    } finally {
      setIsAccepting(null);
    }
  };

  const activeListing = listings.find((l) => l.id === selectedListingId);

  return (
    <div className="flex min-h-screen bg-warm-bg text-charcoal-900">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Navbar
          title="Deterministic Matching Engine"
          subtitle="Transparent algorithmic scoring evaluating material streams, batch capacity, geographic zones and statutory compliance."
        />

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Target Listing Selector Card */}
          <div className="bg-warm-surface border border-warm-border rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500">
                  Select Recyclable Listing to Match:
                </label>
                <div className="relative">
                  <select
                    value={selectedListingId}
                    onChange={(e) => setSelectedListingId(e.target.value)}
                    className="w-full sm:w-96 pl-3 pr-8 py-2 text-sm font-medium rounded-md border border-warm-border bg-warm-bg text-charcoal-900 focus:border-forest-700 focus:bg-white focus:outline-hidden"
                  >
                    {listings.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title} ({l.quantity} {l.unit} • {l.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeListing && (
                <div className="flex items-center gap-3 bg-warm-muted/60 p-3 rounded-md border border-warm-border text-xs">
                  <div>
                    <span className="text-charcoal-500 block text-[11px]">Material Stream:</span>
                    <span className="font-semibold text-charcoal-900 capitalize">
                      {activeListing.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="border-l border-warm-border pl-3">
                    <span className="text-charcoal-500 block text-[11px]">Generator:</span>
                    <span className="font-semibold text-charcoal-900 truncate max-w-[120px] block">
                      {activeListing.owner.org}
                    </span>
                  </div>
                  <div className="border-l border-warm-border pl-3">
                    <span className="text-charcoal-500 block text-[11px]">Status:</span>
                    <StatusBadge status={activeListing.status} size="sm" />
                  </div>
                </div>
              )}
            </div>

            {/* Methodology Note */}
            <div className="mt-4 pt-3 border-t border-warm-subtle flex items-start gap-2 text-xs text-charcoal-500">
              <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
              <p>
                <strong>Transparent Deterministic Scoring:</strong> Scores are computed strictly by mathematical compatibility rules across Material (40 pts), Capacity Range (25 pts), Operational Zone (20 pts), and Handling/Permit Compliance (15 pts). No black-box AI is utilized.
              </p>
            </div>
          </div>

          {/* Ranked Compatibility Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-charcoal-950 font-serif flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-forest-700" />
                Ranked Recovery Partners ({matchData?.matches.length || 0})
              </h2>
              <span className="text-xs text-charcoal-500">
                Sorted by highest overall compatibility
              </span>
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-xs text-charcoal-500 bg-warm-surface border border-warm-border rounded-lg">
                Computing deterministic compatibility matrix...
              </div>
            ) : matchData && matchData.matches.length > 0 ? (
              <div className="space-y-4">
                {matchData.matches.map((result) => {
                  const { partner, overallScore, breakdown, reasons, requirements, warnings, isCompatible } = result;

                  const isCurrentlyMatched =
                    activeListing?.matchedPartnerId === partner.id;

                  return (
                    <div
                      key={partner.id}
                      className={`bg-warm-surface border rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all ${
                        isCurrentlyMatched
                          ? 'border-emerald-500 ring-1 ring-emerald-500/20 bg-emerald-50/10'
                          : isCompatible
                          ? 'border-warm-border hover:border-warm-border-strong'
                          : 'border-warm-border opacity-70 bg-warm-muted/30'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-warm-border">
                        {/* Partner Profile */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-bold text-charcoal-950 font-serif">
                              {partner.name}
                            </span>
                            {partner.isEwasteCertified && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
                                CPCB E-Waste Reg
                              </span>
                            )}
                            <span className="text-xs text-charcoal-500">
                              ★ {partner.rating.toFixed(1)}
                            </span>
                          </div>

                          <p className="text-xs text-charcoal-600 flex items-center gap-2 flex-wrap">
                            <span>{partner.organization}</span>
                            <span>•</span>
                            <span>License: <code className="font-mono text-charcoal-800">{partner.complianceLicense}</code></span>
                            <span>•</span>
                            <span>Zones: {partner.operatingZones.join(', ')}</span>
                          </p>
                        </div>

                        {/* Overall Score Badge & Action */}
                        <div className="flex items-center gap-4 self-start lg:self-center shrink-0">
                          <div className="text-right">
                            <div className="flex items-baseline gap-1 justify-end">
                              <span
                                className={`text-2xl font-bold font-mono ${
                                  overallScore >= 80
                                    ? 'text-emerald-800'
                                    : overallScore >= 50
                                    ? 'text-amber-700'
                                    : 'text-rose-700'
                                }`}
                              >
                                {overallScore}
                              </span>
                              <span className="text-xs text-charcoal-400 font-mono">/100</span>
                            </div>
                            <span className="text-[11px] font-medium text-charcoal-500 block">
                              {isCompatible ? 'Compatible Match' : 'Incompatible'}
                            </span>
                          </div>

                          {isCurrentlyMatched ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-emerald-100 text-emerald-900 text-xs font-semibold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                              Match Accepted
                            </span>
                          ) : (
                            activeListing?.status === 'available' && isCompatible && (
                              <button
                                type="button"
                                onClick={() => handleAcceptMatch(partner.id)}
                                disabled={isAccepting === partner.id}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-forest-800 hover:bg-forest-900 text-warm-bg text-xs font-medium shadow-sm transition-all disabled:opacity-50"
                              >
                                <span>Accept Match</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {/* 4 Score Pillars */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-warm-subtle text-xs">
                        <div>
                          <div className="flex justify-between text-[11px] text-charcoal-500 mb-1">
                            <span>Material Stream</span>
                            <span className="font-mono font-semibold text-charcoal-800">
                              {breakdown.materialScore}/40
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-warm-subtle rounded-full overflow-hidden">
                            <div
                              className="h-full bg-forest-700 rounded-full"
                              style={{ width: `${(breakdown.materialScore / 40) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-charcoal-500 mb-1">
                            <span>Capacity Range</span>
                            <span className="font-mono font-semibold text-charcoal-800">
                              {breakdown.capacityScore}/25
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-warm-subtle rounded-full overflow-hidden">
                            <div
                              className="h-full bg-forest-600 rounded-full"
                              style={{ width: `${(breakdown.capacityScore / 25) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-charcoal-500 mb-1">
                            <span>Zone Coverage</span>
                            <span className="font-mono font-semibold text-charcoal-800">
                              {breakdown.locationScore}/20
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-warm-subtle rounded-full overflow-hidden">
                            <div
                              className="h-full bg-sage-600 rounded-full"
                              style={{ width: `${(breakdown.locationScore / 20) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-charcoal-500 mb-1">
                            <span>Handling Protocols</span>
                            <span className="font-mono font-semibold text-charcoal-800">
                              {breakdown.handlingScore}/15
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-warm-subtle rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-600 rounded-full"
                              style={{ width: `${(breakdown.handlingScore / 15) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Explanation Rationale & Warnings */}
                      <div className="pt-3 space-y-2 text-xs">
                        <div>
                          <span className="font-semibold text-charcoal-800 block mb-1">
                            Algorithmic Assessment Breakdown:
                          </span>
                          <ul className="space-y-1 text-charcoal-600 list-disc list-inside">
                            {reasons.map((r, idx) => (
                              <li key={idx} className="leading-relaxed">
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {warnings && warnings.length > 0 && (
                          <div className="p-2.5 rounded bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                              {warnings.map((w, idx) => (
                                <p key={idx}>{w}</p>
                              ))}
                            </div>
                          </div>
                        )}

                        {requirements.length > 0 && (
                          <div className="text-[11px] text-charcoal-500 flex items-center gap-1.5 pt-1">
                            <span className="font-semibold text-charcoal-700">Operational Notice:</span>
                            <span>{requirements.join(' • ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-charcoal-400">
                No matching results generated.
              </div>
            )}
          </div>
        </div>

        {/* Schedule Pickup Modal when match is accepted */}
        <SchedulePickupModal
          listing={scheduledListing}
          onClose={() => setScheduledListing(null)}
          onSuccess={() => {
            router.push('/collections');
          }}
        />
      </main>
    </div>
  );
}

export default function MatchesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-charcoal-500">Loading matching engine...</div>}>
      <MatchesContent />
    </Suspense>
  );
}
