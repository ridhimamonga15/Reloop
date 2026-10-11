import React from 'react';
import { MaterialCategory } from '@/types';
import { Package, FileText, Layers, Wrench, Cpu } from 'lucide-react';

interface CategoryBadgeProps {
  category: MaterialCategory;
  showIcon?: boolean;
}

export function CategoryBadge({ category, showIcon = true }: CategoryBadgeProps) {
  switch (category) {
    case 'cardboard':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
          {showIcon && <Package className="w-3 h-3 text-amber-700" />}
          Cardboard
        </span>
      );

    case 'paper':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
          {showIcon && <FileText className="w-3 h-3 text-stone-600" />}
          Paper
        </span>
      );

    case 'plastics':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
          {showIcon && <Layers className="w-3 h-3 text-teal-700" />}
          Plastics
        </span>
      );

    case 'metals':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
          {showIcon && <Wrench className="w-3 h-3 text-slate-700" />}
          Scrap Metals
        </span>
      );

    case 'electronic_waste':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded bg-rose-50 text-rose-900 border border-rose-200">
          {showIcon && <Cpu className="w-3 h-3 text-rose-700" />}
          E-Waste (Hazardous)
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-charcoal-100 text-charcoal-700">
          {category}
        </span>
      );
  }
}
