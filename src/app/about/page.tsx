'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Cloud,
  Database,
  Server,
  Leaf,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Code2,
  RefreshCw,
} from 'lucide-react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Navbar } from '@/components/navigation/Navbar';
import { AWSStatus } from '@/types';

export default function AboutPage() {
  const [awsStatus, setAwsStatus] = useState<AWSStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAWSStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/aws-status');
      const data = await res.json();
      if (data.aws) {
        setAwsStatus(data.aws);
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAWSStatus();
  }, [fetchAWSStatus]);

  return (
    <div className="flex min-h-screen bg-warm-bg text-charcoal-900">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Navbar
          title="Architecture, Methodology & Team"
          subtitle="System engineering, transparent deterministic algorithms, and honest AWS cloud integration."
          actionButton={
            <button
              onClick={fetchAWSStatus}
              disabled={isLoading}
              className="p-2 rounded-md border border-warm-border bg-warm-surface text-charcoal-600 hover:text-charcoal-900"
              title="Re-check AWS Status"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          }
        />

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Mission & Problem Statement */}
          <div className="bg-warm-surface border border-warm-border rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded bg-forest-50 text-forest-800 border border-forest-100">
                <Leaf className="w-5 h-5 text-forest-700" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
                  System Specifications & Overview
                </span>
                <h2 className="text-lg font-bold text-charcoal-950 font-serif">
                  ReLoop: Circular Resource Intelligence
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">
              Large waste generators such as university campuses, corporate parks, and commercial facilities regularly discard hundreds of kilograms of recyclable materials because finding verified, authorized recovery partners is fragmented.
            </p>

            <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">
              ReLoop operationalizes the complete circular recovery lifecycle:{' '}
              <span className="font-mono text-forest-900 font-semibold">
                Waste Listed → Compatible Partner Found → Match Accepted → Pickup Scheduled → Collection Executed → Facility Recovery Certified.
              </span>
            </p>
          </div>

          {/* Live AWS Integration Status */}
          <div className="bg-warm-surface border border-warm-border rounded-lg p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-warm-border">
              <div className="flex items-center gap-2.5">
                <Cloud className="w-5 h-5 text-forest-800" />
                <div>
                  <h3 className="text-sm font-bold text-charcoal-900 font-serif">
                    Live AWS Integration Diagnostic
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Real-time status of backend AWS cloud persistence.
                  </p>
                </div>
              </div>

              {awsStatus?.connected ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Amazon DynamoDB Connected ({awsStatus.latencyMs}ms)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  Demo Mode (Local Persistence)
                </span>
              )}
            </div>

            <div className="p-4 rounded-md bg-warm-bg border border-warm-border text-xs space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-charcoal-500 block text-[11px]">Configured AWS Region:</span>
                  <span className="font-mono font-semibold text-charcoal-800">
                    {awsStatus?.region || 'ap-south-1'}
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-500 block text-[11px]">Target DynamoDB Table:</span>
                  <span className="font-mono font-semibold text-charcoal-800">
                    {awsStatus?.tableName || 'reloop-records'}
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-500 block text-[11px]">Storage Engine:</span>
                  <span className="font-semibold text-charcoal-800 capitalize">
                    {awsStatus?.mode === 'aws_dynamodb' ? 'AWS DynamoDB (Cloud)' : 'In-Memory Demo Store'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-warm-subtle">
                <span className="text-charcoal-500 block text-[11px]">Status Message:</span>
                <p className="text-charcoal-700 font-mono text-[11px] mt-0.5">
                  {awsStatus?.message || 'Checking status...'}
                </p>
              </div>
            </div>

            {/* Infrastructure architecture overview */}
            <div className="p-3.5 rounded-md bg-forest-50/70 border border-forest-200 text-xs text-forest-950 space-y-1">
              <span className="font-semibold block">
                AWS Cloud Infrastructure & High-Availability Design
              </span>
              <p className="text-forest-900 leading-relaxed">
                <strong>AWS Amplify Hosting:</strong> Serves the compiled Next.js HTML/CSS/JS frontend globally over Amazon CloudFront CDN with automated SSL.<br />
                <strong>Amazon DynamoDB & Serverless Routes:</strong> Secure serverless route handlers persist transactions with On-Demand scalability. In offline or evaluation environments without live cloud credentials, ReLoop features fault-tolerant automated fallback to local demo persistence.
              </p>
            </div>
          </div>

          {/* Architecture Diagram & Flow */}
          <div className="bg-warm-surface border border-warm-border rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold text-charcoal-900 font-serif flex items-center gap-2">
              <Server className="w-4 h-4 text-forest-700" />
              AWS Cloud Architecture & Data Flow
            </h3>

            {/* Visual Box Architecture */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-md border border-warm-border bg-warm-bg space-y-2">
                <div className="flex items-center gap-2 text-forest-800 font-semibold">
                  <Cloud className="w-4 h-4" />
                  <span>1. Client / Browser</span>
                </div>
                <p className="text-charcoal-600 text-[11px]">
                  Next.js App Router client components with responsive UI, Lucide icons, and Tailwind styling.
                </p>
              </div>

              <div className="p-4 rounded-md border border-warm-border bg-warm-bg space-y-2">
                <div className="flex items-center gap-2 text-forest-800 font-semibold">
                  <Server className="w-4 h-4" />
                  <span>2. AWS Amplify Hosting</span>
                </div>
                <p className="text-charcoal-600 text-[11px]">
                  Continuous deployment from GitHub with global edge caching and SSL certificates.
                </p>
              </div>

              <div className="p-4 rounded-md border border-warm-border bg-warm-bg space-y-2">
                <div className="flex items-center gap-2 text-forest-800 font-semibold">
                  <Code2 className="w-4 h-4" />
                  <span>3. Serverless API</span>
                </div>
                <p className="text-charcoal-600 text-[11px]">
                  Server-side route handlers running with AWS SDK v3, enforcing state-machine integrity and deterministic matching.
                </p>
              </div>

              <div className="p-4 rounded-md border border-warm-border bg-warm-bg space-y-2">
                <div className="flex items-center gap-2 text-forest-800 font-semibold">
                  <Database className="w-4 h-4" />
                  <span>4. Amazon DynamoDB</span>
                </div>
                <p className="text-charcoal-600 text-[11px]">
                  Table <code className="font-mono text-[10px]">reloop-records</code> with Single-Table design (<code className="font-mono text-[10px]">PK</code>, <code className="font-mono text-[10px]">SK</code>, and <code className="font-mono text-[10px]">GSI1</code>).
                </p>
              </div>
            </div>

            {/* DynamoDB Schema Details */}
            <div className="mt-4 p-4 rounded-md bg-warm-muted border border-warm-border text-xs space-y-2">
              <span className="font-semibold text-charcoal-800 block">
                DynamoDB Table Design & Schema Specifications:
              </span>
              <div className="font-mono text-[11px] text-charcoal-700 space-y-1">
                <p>• <strong>Table Name:</strong> reloop-records</p>
                <p>• <strong>Partition Key (PK):</strong> String (e.g. <code>LISTING#listing-cardboard-01</code>)</p>
                <p>• <strong>Sort Key (SK):</strong> String (<code>METADATA</code>)</p>
                <p>• <strong>Global Secondary Index (GSI1):</strong> GSI1PK (<code>CATEGORY#cardboard</code>), GSI1SK (<code>STATUS#available</code>)</p>
                <p>• <strong>Billing Mode:</strong> PAY_PER_REQUEST (On-Demand free tier friendly)</p>
              </div>
            </div>
          </div>

          {/* Deterministic Matching Algorithm Details */}
          <div className="bg-warm-surface border border-warm-border rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold text-charcoal-900 font-serif flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-forest-700" />
              Matching Methodology & Mathematical Formula
            </h3>

            <p className="text-xs text-charcoal-600 leading-relaxed">
              Rather than using an opaque black-box model, ReLoop implements a transparent, deterministic matching function:
            </p>

            <div className="p-3.5 rounded bg-forest-900 text-warm-bg font-mono text-xs overflow-x-auto">
              <code>OverallCompatibilityScore = MaterialScore (40) + CapacityScore (25) + LocationScore (20) + HandlingScore (15)</code>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded border border-warm-border bg-warm-bg">
                <span className="font-bold text-charcoal-900 block mb-1">1. Material Compatibility (40 pts)</span>
                <p className="text-charcoal-600 leading-relaxed">
                  Evaluates whether the recovery partner possesses statutory licenses for the material stream. For e-waste, strict compliance verifies CPCB registration (unregistered partners receive 0 pts and are blocked).
                </p>
              </div>

              <div className="p-3 rounded border border-warm-border bg-warm-bg">
                <span className="font-bold text-charcoal-900 block mb-1">2. Capacity Compatibility (25 pts)</span>
                <p className="text-charcoal-600 leading-relaxed">
                  Calculates batch load fit against partner intake limits (minCapacityKg to maxCapacityKg). Sub-batch loads receive proportional fractional scores indicating aggregated collection routes are required.
                </p>
              </div>

              <div className="p-3 rounded border border-warm-border bg-warm-bg">
                <span className="font-bold text-charcoal-900 block mb-1">3. Location & Zone Fit (20 pts)</span>
                <p className="text-charcoal-600 leading-relaxed">
                  Evaluates geographic cluster match (e.g. NCR Rohini vs South Delhi) using verified operating zones. Direct zone match awards 20 pts; cross-zone metropolitan transport awards 12 pts.
                </p>
              </div>

              <div className="p-3 rounded border border-warm-border bg-warm-bg">
                <span className="font-bold text-charcoal-900 block mb-1">4. Handling & Protocols (15 pts)</span>
                <p className="text-charcoal-600 leading-relaxed">
                  Matches facility loading logistics (palletized, dock forklift accessible, hazardous declarations, and moisture protection standards).
                </p>
              </div>
            </div>
          </div>

          {/* Architecture & Engineering Standards */}
          <div className="bg-warm-surface border border-warm-border rounded-lg p-6 space-y-3">
            <h3 className="text-sm font-bold text-charcoal-900 font-serif">
              Platform Engineering & Standards
            </h3>

            <div className="p-4 rounded-md bg-warm-bg border border-warm-border text-xs space-y-2">
              <p className="text-charcoal-700 leading-relaxed">
                <strong>Runtime:</strong> Next.js App Router Serverless Functions on AWS<br />
                <strong>Database:</strong> Amazon DynamoDB with Single-Table Design & Global Secondary Index<br />
                <strong>Accounting Standards:</strong> EPA WARM v15 and CPCB statutory compliance<br />
                <strong>Design Philosophy:</strong> Zero unverified carbon claims — chain-of-custody tracking strictly requires calibrated weighbridge verification.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
