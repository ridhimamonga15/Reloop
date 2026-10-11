'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { MaterialCategory, MaterialCondition } from '@/types';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateListingModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateListingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'cardboard' as MaterialCategory,
    quantity: '',
    unit: 'kg' as 'kg' | 'tonnes',
    condition: 'clean_sorted' as MaterialCondition,
    conditionNotes: '',
    handlingRequirements: ['indoor_storage_recommended'] as string[],
    locationName: '',
    zone: 'NCR Rohini',
    address: '',
    campusOrFacility: '',
    city: 'Delhi',
    ownerName: '',
    ownerOrg: '',
    ownerType: 'college' as 'college' | 'office' | 'business' | 'institution',
    contactEmail: '',
    contactPhone: '',
  });

  if (!isOpen) return null;

  const handleRequirementToggle = (req: string) => {
    setFormData((prev) => {
      const exists = prev.handlingRequirements.includes(req);
      const updated = exists
        ? prev.handlingRequirements.filter((r) => r !== req)
        : [...prev.handlingRequirements, req];
      return { ...prev, handlingRequirements: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qty = parseFloat(formData.quantity);
    if (isNaN(qty) || qty <= 0) {
      setError('Quantity must be a positive number greater than 0.');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please provide a descriptive listing title.');
      return;
    }

    if (!formData.locationName.trim() || !formData.address.trim()) {
      setError('Please provide pickup location and street address.');
      return;
    }

    if (!formData.ownerName.trim() || !formData.ownerOrg.trim()) {
      setError('Please provide generator name and organization.');
      return;
    }

    // Auto add e-waste requirement if category is electronic_waste
    const finalRequirements = [...formData.handlingRequirements];
    if (
      formData.category === 'electronic_waste' &&
      !finalRequirements.includes('authorized_ewaste_handler_required')
    ) {
      finalRequirements.push('authorized_ewaste_handler_required');
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        quantity: qty,
        unit: formData.unit,
        condition: formData.condition,
        conditionNotes: formData.conditionNotes.trim() || 'No special condition notes provided.',
        handlingRequirements: finalRequirements,
        location: {
          name: formData.locationName.trim(),
          zone: formData.zone,
          address: formData.address.trim(),
          campusOrFacility: formData.campusOrFacility.trim() || formData.ownerOrg.trim(),
          city: formData.city,
        },
        owner: {
          name: formData.ownerName.trim(),
          org: formData.ownerOrg.trim(),
          type: formData.ownerType,
          contactEmail: formData.contactEmail.trim() || 'contact@generator.org',
          contactPhone: formData.contactPhone.trim() || '+91 11 0000 0000',
        },
      };

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create listing');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating listing';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-warm-surface border border-warm-border rounded-lg max-w-2xl w-full shadow-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal header */}
        <div className="p-5 border-b border-warm-border flex items-center justify-between bg-warm-muted/40">
          <div>
            <h2 className="text-lg font-bold text-charcoal-950 font-serif">
              List Recyclable Material
            </h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Connect this material with verified recovery partners across Delhi-NCR.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-charcoal-400 hover:text-charcoal-700 hover:bg-warm-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Material Title */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Material Title / Batch Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Flattened Corrugated Lab Cartons, Discarded Aluminium Extrusions"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden transition-colors"
            />
          </div>

          {/* Category & Quantity Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Material Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as MaterialCategory })
                }
                className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden"
              >
                <option value="cardboard">Cardboard</option>
                <option value="paper">Paper</option>
                <option value="plastics">Plastics</option>
                <option value="metals">Metals</option>
                <option value="electronic_waste">Electronic Waste</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                placeholder="e.g. 500"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Unit *
              </label>
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value as 'kg' | 'tonnes' })
                }
                className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden font-mono"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="tonnes">Metric Tonnes</option>
              </select>
            </div>
          </div>

          {/* E-Waste Notice */}
          {formData.category === 'electronic_waste' && (
            <div className="p-3.5 rounded-md bg-amber-50/80 border border-amber-300 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-amber-950">
                  Mandatory E-Waste Compliance Notice
                </span>
                <p className="mt-0.5 leading-relaxed text-amber-900">
                  Electronic waste requires authorized, licensed handling under CPCB E-Waste Rules. ReLoop will restrict partner matching exclusively to registered recyclers with compliant dismantling licenses.
                </p>
              </div>
            </div>
          )}

          {/* Condition and Condition Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Material Condition Grade *
              </label>
              <select
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value as MaterialCondition })
                }
                className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden"
              >
                <option value="clean_sorted">Clean & Sorted (High Recovery Grade)</option>
                <option value="mixed_baled">Mixed & Baled</option>
                <option value="unprocessed">Unprocessed / Loose</option>
                <option value="intact_functional">Intact Functional Components</option>
                <option value="scrap_grade">Scrap Grade (Requires Secondary Smelting/Refining)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Condition & Handling Details
              </label>
              <input
                type="text"
                placeholder="e.g. Dry, stored indoors, contamination < 2%"
                value={formData.conditionNotes}
                onChange={(e) => setFormData({ ...formData, conditionNotes: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Handling Requirements Checklist */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-2">
              Handling & Facility Logistics Requirements
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { id: 'palletized', label: 'Palletized / Baled on pallets' },
                { id: 'forklift_accessible', label: 'Forklift or loading dock accessible' },
                { id: 'indoor_storage_recommended', label: 'Protected dry indoor storage' },
                { id: 'hazardous_materials_declaration', label: 'Hazardous materials transit declaration' },
                { id: 'authorized_ewaste_handler_required', label: 'Certified CPCB E-Waste Handler required' },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded border border-warm-border bg-warm-muted/50 cursor-pointer hover:bg-warm-muted"
                >
                  <input
                    type="checkbox"
                    checked={formData.handlingRequirements.includes(item.id)}
                    onChange={() => handleRequirementToggle(item.id)}
                    className="rounded text-forest-800 focus:ring-forest-700"
                  />
                  <span className="text-charcoal-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pickup Location Details */}
          <div className="border-t border-warm-border pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-3">
              Pickup Location Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Facility / Building Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Central Workshop & Loading Bay"
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Geographic Zone *
                </label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden"
                >
                  <option value="NCR Rohini">NCR Rohini</option>
                  <option value="North Delhi">North Delhi</option>
                  <option value="North West Delhi">North West Delhi</option>
                  <option value="Central Delhi">Central Delhi</option>
                  <option value="South Delhi">South Delhi</option>
                  <option value="West Delhi">West Delhi</option>
                  <option value="East Delhi">East Delhi</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Street Address & Dock Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shahbad Daulatpur, Main Bawana Road, Gate 2 Loading Bay"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Generator Information */}
          <div className="border-t border-warm-border pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-3">
              Generator Contact & Entity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Organization / Institution *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. University / Tech Campus Estate Dept"
                  value={formData.ownerOrg}
                  onChange={(e) => setFormData({ ...formData, ownerOrg: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Generator Entity Type
                </label>
                <select
                  value={formData.ownerType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ownerType: e.target.value as 'college' | 'office' | 'business' | 'institution',
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden"
                >
                  <option value="college">College / University</option>
                  <option value="office">Corporate Office</option>
                  <option value="business">Commercial Business / Shop</option>
                  <option value="institution">Research Institution</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Coordinator Contact Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Workshop Supervisor R. Gupta"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Contact Phone / Mobile
                </label>
                <input
                  type="text"
                  placeholder="+91 98111 22334"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-md border border-warm-border bg-warm-bg focus:border-forest-700 focus:bg-white focus:outline-hidden font-mono"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-warm-border pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-charcoal-600 hover:text-charcoal-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-forest-800 hover:bg-forest-900 text-warm-bg text-xs sm:text-sm font-medium shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Listing...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Publish Recyclable Listing</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
