'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Layers,
  MapPin,
  Building,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Navbar } from '@/components/navigation/Navbar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { CreateListingModal } from '@/components/listings/CreateListingModal';
import { ListingDetailModal } from '@/components/listings/ListingDetailModal';
import { Listing } from '@/types';

export default function ListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'qty_desc' | 'qty_asc'>('newest');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedZone !== 'all') params.set('zone', selectedZone);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setListings(data.listings);
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedStatus, selectedZone, searchQuery]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const handleDeleteListing = async (id: string) => {
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchListings();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const sortedListings = useMemo(() => {
    const list = [...listings];
    if (sortBy === 'newest') {
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'qty_desc') {
      return list.sort((a, b) => {
        const aKg = a.unit === 'tonnes' ? a.quantity * 1000 : a.quantity;
        const bKg = b.unit === 'tonnes' ? b.quantity * 1000 : b.quantity;
        return bKg - aKg;
      });
    } else if (sortBy === 'qty_asc') {
      return list.sort((a, b) => {
        const aKg = a.unit === 'tonnes' ? a.quantity * 1000 : a.quantity;
        const bKg = b.unit === 'tonnes' ? b.quantity * 1000 : b.quantity;
        return aKg - bKg;
      });
    }
    return list;
  }, [listings, sortBy]);

  return (
    <div className="flex min-h-screen bg-warm-bg text-charcoal-900">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Navbar
          title="Material Exchange"
          subtitle="Directory of recyclable materials available from universities, offices and corporate facilities."
          onOpenCreateListing={() => setIsCreateModalOpen(true)}
        />

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Filter & Search Bar */}
          <div className="bg-warm-surface border border-warm-border rounded-lg p-4 space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title, location, college, or material type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden transition-colors"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-forest-800 hover:bg-forest-900 text-warm-bg text-xs sm:text-sm font-medium transition-colors"
              >
                Search Listings
              </button>
            </form>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-warm-subtle text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-charcoal-500 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-warm-border bg-warm-bg text-charcoal-800 focus:outline-hidden"
                >
                  <option value="all">All Categories</option>
                  <option value="cardboard">Cardboard</option>
                  <option value="paper">Paper</option>
                  <option value="plastics">Plastics</option>
                  <option value="metals">Metals</option>
                  <option value="electronic_waste">Electronic Waste</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-charcoal-500 mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-warm-border bg-warm-bg text-charcoal-800 focus:outline-hidden"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="matched">Matched</option>
                  <option value="pickup_scheduled">Pickup Scheduled</option>
                  <option value="collected">Collected</option>
                  <option value="recovery_recorded">Recovery Recorded</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-charcoal-500 mb-1">
                  Zone
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-warm-border bg-warm-bg text-charcoal-800 focus:outline-hidden"
                >
                  <option value="all">All Zones</option>
                  <option value="Rohini">NCR Rohini</option>
                  <option value="North Delhi">North Delhi</option>
                  <option value="Central Delhi">Central Delhi</option>
                  <option value="North West">North West Delhi</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-charcoal-500 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'qty_desc' | 'qty_asc')}
                  className="w-full px-2.5 py-1.5 rounded border border-warm-border bg-warm-bg text-charcoal-800 focus:outline-hidden"
                >
                  <option value="newest">Newest First</option>
                  <option value="qty_desc">Quantity: High to Low</option>
                  <option value="qty_asc">Quantity: Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Listings count and results header */}
          <div className="flex items-center justify-between text-xs text-charcoal-600 px-1">
            <span>
              Showing <strong className="text-charcoal-900">{sortedListings.length}</strong> material listings
            </span>
            <span className="text-charcoal-400">Click any card to inspect audit history and actions</span>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="py-16 text-center text-xs text-charcoal-500">
              Loading material exchange listings...
            </div>
          ) : sortedListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedListings.map((listing) => {
                const isEwaste = listing.category === 'electronic_waste';

                return (
                  <div
                    key={listing.id}
                    onClick={() => setSelectedListing(listing)}
                    className="bg-warm-surface border border-warm-border rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-warm-border-strong cursor-pointer transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <CategoryBadge category={listing.category} />
                        <StatusBadge status={listing.status} size="sm" />
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-charcoal-950 font-serif leading-snug group-hover:text-forest-800 transition-colors">
                        {listing.title}
                      </h3>

                      {/* Quantity Tag */}
                      <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-xl font-bold font-mono text-charcoal-900">
                          {listing.quantity.toLocaleString()}
                        </span>
                        <span className="text-xs font-medium text-charcoal-500 uppercase">
                          {listing.unit}
                        </span>
                        <span className="text-[11px] text-charcoal-400 ml-auto capitalize">
                          Grade: {listing.condition.replace('_', ' ')}
                        </span>
                      </div>

                      {/* E-Waste Notice Warning Badge */}
                      {isEwaste && (
                        <div className="mt-2.5 p-2 rounded bg-rose-50/70 border border-rose-200 text-[11px] text-rose-900 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-700 shrink-0 mt-0.5" />
                          <span>Strict Protocol: Authorized CPCB E-Waste Handler Required</span>
                        </div>
                      )}

                      {/* Location & Organization */}
                      <div className="mt-3 space-y-1.5 text-xs text-charcoal-600">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                          <span className="truncate">{listing.owner.org}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                          <span className="truncate">
                            {listing.location.name} • {listing.location.zone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-4 pt-3 border-t border-warm-border flex items-center justify-between text-xs">
                      <span className="text-[11px] text-charcoal-400 font-mono">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </span>

                      {listing.status === 'available' ? (
                        <Link
                          href={`/matches?listingId=${listing.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-forest-800 hover:text-forest-950 group-hover:translate-x-0.5 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-forest-600" />
                          <span>Find Matches</span>
                        </Link>
                      ) : (
                        <span className="text-[11px] text-charcoal-500 flex items-center gap-0.5">
                          <span>View Workflow</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center bg-warm-surface border border-warm-border rounded-lg p-8">
              <Layers className="w-8 h-8 text-charcoal-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-charcoal-800">No listings match your criteria</h3>
              <p className="text-xs text-charcoal-500 mt-1">
                Try loosening your filters or create a new recyclable material listing.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setSelectedZone('all');
                  setSearchQuery('');
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-warm-border bg-warm-muted text-xs font-medium text-charcoal-700 hover:bg-warm-border transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Create Listing Modal */}
        <CreateListingModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            fetchListings();
          }}
        />

        {/* Listing Detail Modal */}
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onFindMatches={(id) => {
            router.push(`/matches?listingId=${id}`);
          }}
          onDelete={handleDeleteListing}
        />
      </main>
    </div>
  );
}
