'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  Truck,
  Leaf,
  Info,
  ExternalLink,
  RotateCcw,
  Cloud,
  CheckCircle,
  Menu,
  X,
  Database,
} from 'lucide-react';
import { AWSStatus } from '@/types';

const navItems = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Operational summary & KPIs',
  },
  {
    name: 'Material Exchange',
    href: '/listings',
    icon: Layers,
    description: 'Search & list recyclables',
  },
  {
    name: 'Matching Engine',
    href: '/matches',
    icon: Sparkles,
    description: 'Deterministic compatibility',
  },
  {
    name: 'Collection Tracker',
    href: '/collections',
    icon: Truck,
    description: 'Pickup & certified recovery',
  },
  {
    name: 'Impact & Methodology',
    href: '/impact',
    icon: Leaf,
    description: 'Audited carbon & diversion',
  },
  {
    name: 'Architecture & AWS',
    href: '/about',
    icon: Info,
    description: 'Cloud design & diagnostics',
  },
];

interface NavContentProps {
  pathname: string;
  awsStatus: AWSStatus | null;
  isResetting: boolean;
  resetMessage: string | null;
  onNavClick: () => void;
  onResetDemo: () => void;
}

function NavContent({
  pathname,
  awsStatus,
  isResetting,
  resetMessage,
  onNavClick,
  onResetDemo,
}: NavContentProps) {
  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand header */}
        <div className="p-5 border-b border-warm-border">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-md bg-forest-800 text-warm-bg flex items-center justify-center font-bold tracking-tight shadow-sm group-hover:bg-forest-900 transition-colors">
              <span className="text-base text-emerald-300 font-mono">RL</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold tracking-tight text-forest-950 font-serif">
                  ReLoop
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-forest-100 text-forest-800 font-semibold">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-charcoal-500 font-medium">
                Circular Resource Intelligence
              </p>
            </div>
          </Link>
        </div>

        {/* Demo Mode Notice */}
        <div className="mx-4 mt-3 p-2.5 rounded border border-amber-200 bg-amber-50/70 text-[11px] text-amber-900 flex items-start gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0 animate-pulse"></span>
          <div>
            <span className="font-semibold block">DEMO WORKSPACE ACTIVE</span>
            <span className="text-amber-800 leading-tight block">
              Records are labelled demo scenarios for judging evaluation.
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-forest-800 text-warm-bg shadow-sm'
                    : 'text-charcoal-700 hover:text-forest-900 hover:bg-warm-muted'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-emerald-300' : 'text-charcoal-500'
                  }`}
                />
                <div className="flex flex-col">
                  <span className="leading-tight">{item.name}</span>
                  <span
                    className={`text-[10px] ${
                      isActive ? 'text-forest-100/80' : 'text-charcoal-400'
                    }`}
                  >
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer & AWS Status Card */}
      <div className="p-3 border-t border-warm-border space-y-2">
        {/* AWS Backend status */}
        <div className="p-2.5 rounded-md bg-warm-muted border border-warm-border text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-charcoal-600 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-forest-700" />
              AWS Backend
            </span>
            {awsStatus?.connected ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                <CheckCircle className="w-2.5 h-2.5 text-emerald-700" />
                Live DynamoDB
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-charcoal-600 bg-charcoal-100 px-1.5 py-0.5 rounded">
                <Database className="w-2.5 h-2.5 text-charcoal-500" />
                Demo Store
              </span>
            )}
          </div>
          <p className="text-[10px] text-charcoal-500 truncate" title={awsStatus?.message}>
            {awsStatus?.connected
              ? `Table: ${awsStatus.tableName} (${awsStatus.region})`
              : 'Local Demo persistence active'}
          </p>
        </div>

        {/* Reset Demo Data Action */}
        <button
          type="button"
          onClick={onResetDemo}
          disabled={isResetting}
          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-charcoal-600 hover:text-forest-900 hover:bg-warm-muted border border-warm-border transition-colors disabled:opacity-50"
        >
          <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
          {resetMessage || (isResetting ? 'Resetting...' : 'Reset Demo Scenario')}
        </button>

        {/* Public Landing Link */}
        <Link
          href="/"
          className="flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-charcoal-500 hover:text-forest-900 hover:bg-warm-muted transition-colors"
        >
          <span>Public Landing Page</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [awsStatus, setAwsStatus] = useState<AWSStatus | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const fetchAWSStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/aws-status');
      const data = await res.json();
      if (data.aws) {
        setAwsStatus(data.aws);
      }
    } catch {
      // offline or local
    }
  }, []);

  useEffect(() => {
    fetchAWSStatus();
  }, [fetchAWSStatus]);

  const handleResetDemo = async () => {
    if (!confirm('Reset all demo data back to baseline demonstration records?')) return;
    setIsResetting(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setResetMessage('Demo reset!');
        setTimeout(() => {
          setResetMessage(null);
          window.location.reload();
        }, 800);
      }
    } catch {
      setResetMessage('Reset error');
      setTimeout(() => setResetMessage(null), 2000);
    } finally {
      setIsResetting(false);
    }
  };

  const navContentProps: NavContentProps = {
    pathname,
    awsStatus,
    isResetting,
    resetMessage,
    onNavClick: () => setIsOpenMobile(false),
    onResetDemo: handleResetDemo,
  };

  return (
    <>
      {/* Mobile top bar toggle button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-warm-surface border-b border-warm-border px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-forest-800 text-warm-bg flex items-center justify-center font-bold text-xs">
            RL
          </div>
          <span className="font-semibold text-charcoal-900 font-serif">ReLoop</span>
        </Link>

        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-1.5 rounded text-charcoal-600 hover:bg-warm-muted"
          aria-label="Toggle Navigation"
        >
          {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {isOpenMobile && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-xs"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed top-0 bottom-0 left-0 z-50 w-72 bg-warm-surface border-r border-warm-border transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavContent {...navContentProps} />
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-warm-surface border-r border-warm-border min-h-screen sticky top-0 h-screen overflow-y-auto">
        <NavContent {...navContentProps} />
      </aside>
    </>
  );
}
