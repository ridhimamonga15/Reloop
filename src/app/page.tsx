import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Layers,
  Scale,
  Truck,
  ShieldCheck,
  Building,
  CheckCircle2,
  Cloud,
  Database,
  ExternalLink,
  ChevronRight,
  Leaf,
  FileCheck,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-warm-bg text-charcoal-900 flex flex-col justify-between selection:bg-forest-100 selection:text-forest-900">
      {/* Top Navigation */}
      <header className="border-b border-warm-border bg-warm-surface/80 backdrop-blur-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-forest-800 text-warm-bg flex items-center justify-center font-bold text-sm">
              <span className="text-emerald-300 font-mono">RL</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-charcoal-950 font-serif">
                  ReLoop
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-forest-100 text-forest-800 font-semibold">
                  HACKATHON MVP
                </span>
              </div>
              <span className="text-[10px] text-charcoal-500 font-medium block">
                Team GreenStack • DTU
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-charcoal-600">
            <Link href="/dashboard" className="hover:text-forest-800 transition-colors">
              Dashboard
            </Link>
            <Link href="/listings" className="hover:text-forest-800 transition-colors">
              Material Exchange
            </Link>
            <Link href="/matches" className="hover:text-forest-800 transition-colors">
              Matching Engine
            </Link>
            <Link href="/collections" className="hover:text-forest-800 transition-colors">
              Collection Tracker
            </Link>
            <Link href="/impact" className="hover:text-forest-800 transition-colors">
              Impact Methodology
            </Link>
            <Link href="/about" className="hover:text-forest-800 transition-colors">
              AWS Cloud Architecture
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-forest-800 hover:bg-forest-900 text-warm-bg text-xs sm:text-sm font-medium shadow-sm transition-all"
            >
              <span>Enter Demo Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-50 border border-forest-100 text-xs text-forest-800 font-medium">
          <Leaf className="w-3.5 h-3.5 text-forest-700" />
          <span>Environmental Hacks Hackathon Submission • Developed by Team GreenStack</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal-950 font-serif leading-[1.15]">
          Close the resource loop between waste generators and verified recovery partners.
        </h1>

        <p className="text-base sm:text-lg text-charcoal-600 max-w-3xl mx-auto leading-relaxed">
          Connecting colleges, corporate offices and institutions with authorized recyclers. Deterministic compatibility matching, verifiable collection workflows, and honest environmental impact accounting.
        </p>

        {/* Action CTAs */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-forest-800 hover:bg-forest-900 text-warm-bg text-sm font-semibold shadow-sm transition-all hover:shadow"
          >
            <span>Launch Operational Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/listings"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-warm-surface border border-warm-border text-charcoal-800 hover:bg-warm-muted text-sm font-semibold transition-colors"
          >
            <Layers className="w-4 h-4 text-charcoal-500" />
            <span>Browse Material Exchange</span>
          </Link>

          <Link
            href="/about"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-warm-surface border border-warm-border text-charcoal-800 hover:bg-warm-muted text-sm font-semibold transition-colors"
          >
            <Cloud className="w-4 h-4 text-forest-700" />
            <span>AWS Cloud Specs</span>
          </Link>
        </div>

        {/* Judging Demo Notice Bar */}
        <div className="mt-8 p-3.5 rounded-lg border border-amber-200 bg-amber-50/70 text-xs text-amber-900 max-w-2xl mx-auto flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>
            <strong>Judging Evaluation Ready:</strong> Pre-seeded with complete Delhi-NCR scenarios (DTU, NSUT, DLF CyberCity) across every workflow stage.
          </span>
        </div>
      </section>

      {/* Visual Workflow Steps */}
      <section className="py-16 bg-warm-surface border-y border-warm-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
              The Circular Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-950 font-serif">
              From waste listing to verified recovery receipt
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500">
              A disciplined, multi-party custody protocol that prevents recyclable material from entering municipal landfill streams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-5 rounded-lg border border-warm-border bg-warm-bg space-y-3 relative">
              <span className="font-mono text-xs font-bold text-forest-800 bg-forest-50 border border-forest-100 px-2 py-0.5 rounded inline-block">
                01 • LISTING
              </span>
              <h3 className="text-base font-bold text-charcoal-950 font-serif">
                Material Listed
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Colleges and businesses catalog batch quantities, purity condition grade, and location. Strict regulatory warnings enforce authorized handling for hazardous e-waste.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-lg border border-warm-border bg-warm-bg space-y-3 relative">
              <span className="font-mono text-xs font-bold text-forest-800 bg-forest-50 border border-forest-100 px-2 py-0.5 rounded inline-block">
                02 • MATCHING
              </span>
              <h3 className="text-base font-bold text-charcoal-950 font-serif">
                Deterministic Match
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Our transparent matching algorithm evaluates material stream authorization, intake capacity thresholds, operating zone proximity, and handling protocols.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-lg border border-warm-border bg-warm-bg space-y-3 relative">
              <span className="font-mono text-xs font-bold text-forest-800 bg-forest-50 border border-forest-100 px-2 py-0.5 rounded inline-block">
                03 • COLLECTION
              </span>
              <h3 className="text-base font-bold text-charcoal-950 font-serif">
                Pickup Scheduled
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Pickup dates, carrier vehicle plate numbers, driver contacts, and gate access permits are locked. Custody transfer is recorded upon physical vehicle loading.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-lg border border-warm-border bg-warm-bg space-y-3 relative">
              <span className="font-mono text-xs font-bold text-forest-800 bg-forest-50 border border-forest-100 px-2 py-0.5 rounded inline-block">
                04 • CERTIFICATION
              </span>
              <h3 className="text-base font-bold text-charcoal-950 font-serif">
                Recovery Certified
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Receiving facility issues calibrated weighbridge slip and verification audit hash. Only physically confirmed net kilograms update platform impact metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Users Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
            Intended Users
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-950 font-serif">
            Designed for real operational coordination
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border border-warm-border bg-warm-surface space-y-3">
            <span className="p-2.5 rounded-md bg-warm-muted border border-warm-border inline-block text-forest-800">
              <Building className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-charcoal-950 font-serif">
              Waste Generators
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Universities, research laboratories, corporate offices, and printing facilities that produce clean paper, corrugated packaging, metals, or decommissioned electronics.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-warm-border bg-warm-surface space-y-3">
            <span className="p-2.5 rounded-md bg-warm-muted border border-warm-border inline-block text-forest-800">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-charcoal-950 font-serif">
              Recovery Partners
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              CPCB/SPCB licensed e-waste dismantlers, secondary metal smelters, paper pulp mills, and municipal material recovery facilities (MRFs) seeking high-quality feedstock.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-warm-border bg-warm-surface space-y-3">
            <span className="p-2.5 rounded-md bg-warm-muted border border-warm-border inline-block text-forest-800">
              <Truck className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-charcoal-950 font-serif">
              Operations & Logistics
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Facility managers and dispatchers tracking vehicle schedules, chain-of-custody handovers, weighbridge tickets, and ESG circularity compliance reporting.
            </p>
          </div>
        </div>
      </section>

      {/* AWS Integration Architecture Callout */}
      <section className="py-16 bg-forest-950 text-warm-bg border-t border-forest-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900 border border-forest-800 text-xs text-emerald-300">
            <Cloud className="w-3.5 h-3.5" />
            <span>Built on AWS Cloud Infrastructure</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight">
            Production-grade serverless architecture
          </h2>

          <p className="text-xs sm:text-sm text-forest-100/80 max-w-2xl mx-auto leading-relaxed">
            Hosted on <strong>AWS Amplify Hosting</strong> with serverless API route handlers and <strong>Amazon DynamoDB</strong> Single-Table architecture (<code className="font-mono text-emerald-300">reloop-records</code>) for persistent listings, matches, and audit trails.
          </p>

          <div className="pt-2">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-emerald-400 hover:bg-emerald-300 text-forest-950 text-xs sm:text-sm font-semibold transition-colors"
            >
              <span>Inspect Cloud Architecture & DynamoDB Schema</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-warm-border bg-warm-surface py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-charcoal-900 font-serif">ReLoop</span>
            <span>•</span>
            <span>Developed by Team GreenStack for Environmental Hacks</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/dashboard" className="hover:text-forest-800">
              Dashboard
            </Link>
            <Link href="/listings" className="hover:text-forest-800">
              Listings
            </Link>
            <Link href="/matches" className="hover:text-forest-800">
              Matcher
            </Link>
            <Link href="/impact" className="hover:text-forest-800">
              Impact Disclosures
            </Link>
            <Link href="/about" className="hover:text-forest-800">
              AWS Spec
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
