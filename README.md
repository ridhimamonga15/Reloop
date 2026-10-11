# ReLoop — Circular Resource Intelligence
**Enterprise Circular Custody & Deterministic Matching Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.4-153E2D?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-153E2D?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![AWS Amplify](https://img.shields.io/badge/AWS-Amplify_Hosting-FF9900?style=flat&logo=amazon-aws)](https://aws.amazon.com/amplify/)
[![Amazon DynamoDB](https://img.shields.io/badge/Amazon-DynamoDB-4053D6?style=flat&logo=amazon-dynamodb)](https://aws.amazon.com/dynamodb/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Problem Statement

Recyclable materials from institutions, offices and businesses—such as campus laboratory packaging, decommissioned computer hardware, and commercial print offcuts—are routinely diverted to municipal landfills. The primary root cause is **fragmented coordination**: waste generators cannot readily identify verified recovery partners with compatible processing licenses, batch capacities, or collection routes.

Furthermore, existing tools often generate unsubstantiated "carbon offset" claims without verifying whether materials were genuinely accepted and processed by a licensed recovery facility.

**ReLoop** addresses this by operationalizing the end-to-end circular resource recovery lifecycle:
```
Waste Listed ➔ Compatible Partner Found ➔ Match Accepted ➔ Pickup Scheduled ➔ Collection Completed ➔ Recovery Certified
```

---

## 2. Solution Overview & Intended Users

ReLoop is a circular-resource intelligence platform providing transparent, deterministic compatibility matching, multi-party custody tracking, and audit-grade environmental accounting.

### Target Users:
1. **Waste Generators:** University campuses, large institutional complexes, corporate technology parks, and commercial facilities generating recyclable batches.
2. **Recovery Partners:** Central Pollution Control Board (CPCB) and State Pollution Control Board (SPCB) registered e-waste recyclers, secondary scrap smelters, pulp paper mills, and material recovery facilities (MRFs).
3. **Operations & Compliance Users:** Logistics coordinators managing vehicle schedules, weighbridge tickets, and ESG audit compliance.

---

## 3. Product Features & Core Workflow

### A. Overview Dashboard
- **Total Material Recovered:** Live calculated sum of physically weighed and certified kilograms.
- **Active Material Listings:** Open batches available for partner matching.
- **Pending Pickups:** Collections scheduled with vehicle plates and driver assignments.
- **Completed Collections:** Material loaded and transferred into logistics custody.
- **Recovery Breakdown by Category:** Visual distribution chart across Cardboard, Paper, Plastics, Metals, and E-Waste.
- **Metric Definitions Drawer:** Every KPI includes an explanation drawer explaining how the value is calculated.

### B. Material Exchange
- Filterable and searchable listings directory across material categories, conditions, quantities, and zones.
- Support for **Cardboard**, **Paper**, **Plastics**, **Metals**, and **Electronic Waste**.
- **Statutory E-Waste Safeguard:** Automatically requires certified CPCB/SPCB handling and prevents uncertified custody transfer.
- Creation form with validation (positive quantities only, condition grading, dock handling requirements).

### C. Deterministic Matching Engine
- Purely deterministic, explainable matching matrix scoring partners out of 100 points:
  - **Material Stream Compatibility (40 pts):** Verified against statutory recycling permits. E-waste without CPCB certification receives 0 pts and is blocked.
  - **Quantity & Capacity Fit (25 pts):** Compares batch mass against minimum/maximum facility intake thresholds.
  - **Operating Zone Fit (20 pts):** Direct geographic cluster match (e.g., NCR Rohini, North Delhi).
  - **Handling & Compliance Protocols (15 pts):** Palletization, forklift dock access, hazardous declarations.
- Detailed plain-English explanation breakdown for every score component.

### D. Collection & Recovery Tracker
- Multi-stage pipeline enforcing valid status transitions:
  `Available` ➔ `Matched` ➔ `Pickup Scheduled` ➔ `Collected` ➔ `Recovery Recorded`.
- Rejects out-of-order transitions, duplicate collection completions, and negative weights.
- **Certified Recovery Recording:** Records calibrated weighbridge slip numbers, receiving facility names, and generates tamper-resistant verification hashes.

### E. Environmental Impact & Methodology
- Strictly distinguishes **actual recorded recovered mass** from **prospective lifecycle estimates**.
- Transparently discloses all EPA WARM v15 and CPCB conversion factors, system boundaries, and uncertainty limitations.

---

## 4. Technology Stack

- **Framework:** Next.js (App Router, Turbopack)
- **Language:** TypeScript (Strict mode enabled)
- **Styling:** Tailwind CSS with warm ivory (`#FBFBFA`) and deep forest green (`#153E2D`) design tokens
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **Cloud Backend:** AWS SDK v3 (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`)
- **Hosting:** AWS Amplify Hosting

---

## 5. Actual AWS Architecture & Data Flow

ReLoop integrates real AWS cloud services, supporting both live cloud persistence and a localized demo fallback:

```
[ Browser / Next.js Client ]
             │
             ▼
[ AWS Amplify Hosting ] (Edge CDN, SSL, Continuous Deployment from GitHub)
             │
             ▼
[ Next.js Serverless Route Handlers ] (/api/listings, /api/matches, /api/collections)
             │
     ┌───────┴───────────────────────┐
     │ (If AWS Credentials Set)      │ (If Unconfigured)
     ▼                               ▼
[ Amazon DynamoDB ]           [ In-Memory Demo Store ]
Table: reloop-records         Realistic pre-seeded institutional records
PK: LISTING#<id>              Reset anytime via 1-click UI
SK: METADATA
GSI1: Category & Status Index
```

### AWS Services Actually Used:
1. **AWS Amplify Hosting:** Connects directly to the GitHub repository for continuous builds, edge CDN caching, and custom domain configuration.
2. **Serverless API Routes:** Server-side handlers running securely on AWS with zero client-side credential exposure.
3. **Amazon DynamoDB:** NoSQL database table (`reloop-records`) configured with Single-Table design, On-Demand billing (`PAY_PER_REQUEST`), point-in-time recovery, and least-privilege IAM policies.

---

## 6. Setup & Local Development

### Prerequisites:
- Node.js 18+ (Node.js 20 or 25 recommended)
- npm 9+
- Git

### Installation:
```bash
# Clone the repository
git clone https://github.com/ridhimamonga15/Reloop.git
cd Reloop

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The application will immediately run in **Demo Workspace Mode** with complete pre-seeded records.

---

## 7. Connecting to Amazon DynamoDB (Optional Cloud Mode)

To enable live AWS DynamoDB persistence:

1. Deploy the CloudFormation template in the AWS Console:
   - File: `aws/dynamodb-template.yaml`
   - Stack Name: `reloop-cloud-stack`
2. Or run the automated setup script:
   ```bash
   node scripts/setup-aws-dynamodb.mjs
   ```
3. Set your environment variables in `.env.local`:
   ```bash
   AWS_REGION=ap-south-1
   DYNAMODB_TABLE_NAME=reloop-records
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   ```
4. Restart your development server (`npm run dev`). ReLoop will detect the connection and display **"Live DynamoDB"** in the sidebar.

---

## 8. Deployment to AWS Amplify Hosting

1. Push your repository to GitHub.
2. Open the **AWS Management Console** and navigate to **AWS Amplify**.
3. Click **Host web app** and connect your GitHub repository (`Reloop`).
4. Select the `main` branch. Amplify will automatically detect the build settings in `amplify.yml`:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
         - .next/cache/**/*
   ```
5. *(Optional)* In **Environment variables**, add `AWS_REGION`, `DYNAMODB_TABLE_NAME`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY` to enable live cloud persistence on the deployed site.
6. Click **Save and deploy**. Amplify will build and assign a live URL (e.g. `https://main.d123456789.amplifyapp.com`).

---

## 9. Demo Data & Judge Verification Scenario

Judges can verify the complete end-to-end workflow in under 2 minutes:

1. **Browse Listings:** Open the **Material Exchange** (`/listings`). Locate the available listing: *"Clean Corrugated Cardboard Packaging & Cartons"* (850 kg from Campus Central Stores).
2. **Find Compatible Partners:** Click **Find Matches**. Observe the deterministic score breakdown. Partner *EcoPaper Recyclers* scores 97/100 due to matching material, intake batch capacity (200-15,000 kg), and Rohini zone proximity.
3. **Accept Match:** Click **Accept Match**. The status transitions to `Matched`.
4. **Schedule Pickup:** In the modal, select tomorrow's pickup date and confirm. The status updates to `Pickup Scheduled`.
5. **Confirm Collection:** In the **Collection Tracker** (`/collections`), click **Confirm Collected**. Enter driver details. Status transitions to `Collected / In Transit`.
6. **Certify Facility Recovery:** Click **Record Recovery Qty**. Enter the verified weighbridge net mass (e.g., `845 kg`) and ticket number `WB-EP-2026-901`. The status becomes `Recovery Certified`.
7. **Inspect Verified Impact:** Return to the **Dashboard** (`/dashboard`) or **Impact Report** (`/impact`). Notice the certified material recovered and avoided emissions update dynamically!
8. **Reset Anytime:** Click **Reset Demo Scenario** in the sidebar to return to the baseline state.

---

## 10. Screenshots

*(Screenshots can be added here once deployed)*
- `docs/screenshots/dashboard.png` — Overview Dashboard with KPIs and Category Breakdown
- `docs/screenshots/listings.png` — Material Exchange with Category & Zone Filters
- `docs/screenshots/matching.png` — Algorithmic Match Breakdown with Pillar Scores
- `docs/screenshots/collections.png` — Custody Pipeline Tracker and Certified Receipts
- `docs/screenshots/impact.png` — Environmental Impact Ledger & EPA Disclosures

---

## 11. Future Roadmap

- **Multi-tenant SSO:** Institutional authentication for estate offices via Amazon Cognito.
- **Automated Weighbridge OCR:** Integration with Amazon Textract to automatically scan physical weighbridge slips.
- **Route Optimization:** Multi-depot routing using Amazon Location Service for municipal aggregation vehicles.

---

## License & Specifications

- **License:** MIT License
- **Runtime:** Next.js 16 (App Router) Serverless Functions
- **Cloud Infrastructure:** AWS Amplify Hosting & Amazon DynamoDB
