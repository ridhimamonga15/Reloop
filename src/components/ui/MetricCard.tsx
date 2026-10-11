'use client';

import React, { useState } from 'react';
import { HelpCircle, LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  subtitle?: string;
  explanation: string;
  accentColor?: 'forest' | 'sage' | 'amber' | 'teal';
}

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  subtitle,
  explanation,
  accentColor = 'forest',
}: MetricCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const getAccentBg = () => {
    switch (accentColor) {
      case 'forest':
        return 'bg-forest-50 text-forest-800 border-forest-100';
      case 'sage':
        return 'bg-sage-100 text-sage-800 border-sage-200';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'teal':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      default:
        return 'bg-forest-50 text-forest-800 border-forest-100';
    }
  };

  return (
    <div className="bg-warm-surface border border-warm-border rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-warm-border-strong relative flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`p-2 rounded-md border ${getAccentBg()}`}>
              <Icon className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-medium text-charcoal-700">{title}</h3>
          </div>

          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            title="Explanation of this metric"
            className="text-charcoal-400 hover:text-forest-800 transition-colors p-1"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-charcoal-950 font-mono">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {unit && <span className="text-sm font-medium text-charcoal-500">{unit}</span>}
        </div>

        {subtitle && (
          <p className="text-xs text-charcoal-500 mt-1.5 font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {showExplanation && (
        <div className="mt-3 pt-3 border-t border-warm-border text-xs text-charcoal-600 bg-warm-muted p-2.5 rounded border border-warm-subtle leading-relaxed animate-in fade-in duration-150">
          <span className="font-semibold text-charcoal-800 block mb-1">Metric Definition & Audit:</span>
          {explanation}
        </div>
      )}
    </div>
  );
}
