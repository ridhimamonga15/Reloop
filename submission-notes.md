# Hackathon Submission Notes & Demo Guide
**Project:** ReLoop — Circular Resource Intelligence  
**Team:** GreenStack  
**Developer:** Solo B.Tech IT Student (Delhi Technological University)  
**Hackathon:** Environmental Hacks  

---

## 1. What the project does and what problem it solves

ReLoop connects large recyclable material generators (universities like DTU and NSUT, corporate complexes like DLF CyberCity, and commercial businesses) with certified material recovery facilities and recyclers.

**The Problem:**
Currently, large institutions routinely send hundreds of kilograms of high-grade recyclables (packaging cardboard, clean plastics, scrap metals, and obsolete e-waste) to municipal landfills. The bottleneck is fragmented coordination: facility managers cannot easily find certified recyclers that operate in their zone, accept their specific volume batch, and possess the statutory environmental permits (such as CPCB authorization for e-waste). Furthermore, most platforms generate unverified "carbon offsets" before material is even picked up.

**How ReLoop Solves This:**
ReLoop implements an accountable, step-by-step custody and intelligence platform:
1. **Material Exchange:** Generators list recyclable batches with condition purity grades and dock handling requirements.
2. **Deterministic Matching Engine:** Scores compatibility across Material Stream (40 pts), Intake Capacity (25 pts), Operating Zone (20 pts), and Handling/Permit Compliance (15 pts). E-waste transfers without CPCB licenses are strictly blocked.
3. **Custody & Pickup Tracker:** Schedules carrier dispatches, assigns driver/vehicle plates, and logs physical handover.
4. **Certified Recovery Recording:** Material is only counted as recovered when the receiving facility enters a calibrated weighbridge ticket number and verified net kilograms.
5. **Honest Environmental Accounting:** Separates actual verified mass from lifecycle estimates, with full disclosures based on EPA WARM v15 and CPCB benchmarks.

---

## 2. How AWS was used (Genuinely integrated services only)

1. **AWS Amplify Hosting:**
   - Hosts and deploys the Next.js App Router application directly from GitHub.
   - Provides global edge caching through Amazon CloudFront, automatic SSL certificate provisioning, and continuous deployment on every git commit.

2. **Next.js Serverless Route Handlers on AWS:**
   - Backend APIs (`/api/listings`, `/api/matches`, `/api/collections`, `/api/stats`, `/api/aws-status`) execute as secure serverless functions.
   - Handles data validation, state-machine transitions, and deterministic matching logic without exposing any credentials to the browser.

3. **Amazon DynamoDB:**
   - Single-Table NoSQL database (`reloop-records`) configured with Partition Key (`PK`), Sort Key (`SK`), and a Global Secondary Index (`GSI1`) for filtering listings by category and status.
   - Integrated via `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb`.
   - Utilizes On-Demand capacity (`PAY_PER_REQUEST`) with point-in-time recovery and least-privilege IAM policies.
   - Features a graceful local demo fallback: if cloud credentials are not supplied, the app runs in Local Demo Mode, clearly labelled for judges.

---

## 3. Individual contributions as a solo developer

As the sole developer on Team GreenStack, I was responsible for:
- **Concept & Product Architecture:** Designing the circular custody workflow and formulating the 4-pillar deterministic matching algorithm.
- **Frontend & Design System:** Building the responsive user interface using Next.js App Router and Tailwind CSS, following a warm ivory and deep forest green climate-tech aesthetic with Lucide icons.
- **Data Engineering & State Machine:** Writing the validation layer preventing illegal status transitions (e.g., verifying that recovery cannot be recorded without physical collection, and ensuring non-negative weights).
- **Backend API & AWS Integration:** Developing the Next.js route handlers, configuring the AWS SDK v3 client for DynamoDB, creating the CloudFormation template (`aws/dynamodb-template.yaml`), and authoring the setup script (`scripts/setup-aws-dynamodb.mjs`).
- **Environmental Accounting Research:** Reviewing EPA WARM v15 and CPCB technical documents to establish honest lifecycle conversion factors and boundary disclosures.

---

## 4. What I liked about the AWS services used

- **AWS Amplify Hosting:** The GitHub integration and automatic detection of Next.js App Router build settings through `amplify.yml` made continuous deployment straightforward for a student developer.
- **Amazon DynamoDB DocumentClient:** The `@aws-sdk/lib-dynamodb` abstraction automatically marshals and unmarshals native JavaScript objects, eliminating manual type conversion (e.g., `{ S: "..." }`).
- **On-Demand Billing (`PAY_PER_REQUEST`):** It removes the stress of estimating provisioned read/write capacity units, ensuring the database scales during evaluation while remaining well within the free tier.

---

## 5. What I found difficult or would improve about the AWS services

- **IAM Policy Scoping for Beginners:** Creating a true least-privilege IAM policy for DynamoDB required learning the difference between table-level ARNs and index ARNs (`arn:aws:dynamodb:.../index/*`). Initially, queries on GSI1 failed with `AccessDeniedException` until the index resource was explicitly added to the policy.
- **Turbopack & AWS Serverless Packaging:** Resolving Next.js serverless bundling with native AWS SDK dependencies required configuring `next.config.ts` carefully to prevent Turbopack workspace path warnings.

---

## 6. Three-Minute Demo Video Script & Outline

### **[0:00 - 0:40] Part 1: The Problem & The Solution**
- **Visual:** Open on the ReLoop Public Landing Page (`/`).
- **Narration:**
  > "Hello everyone! I'm a solo B.Tech IT student from Delhi Technological University, presenting **ReLoop** by team **GreenStack** for the Environmental Hacks hackathon.
  > Recyclable materials from campuses, offices, and businesses are regularly dumped into landfills simply because waste generators cannot efficiently coordinate with verified recyclers. Existing tools often claim arbitrary carbon savings before anything is even collected.
  > ReLoop is a circular resource intelligence platform that connects waste generators with authorized recovery partners through deterministic matching, verified chain-of-custody tracking, and honest environmental accounting."

### **[0:40 - 1:45] Part 2: Live Operational Workflow (Judging Scenario)**
- **Visual:** Click "Enter Demo Workspace" to open `/dashboard`.
- **Narration:**
  > "Here is our Overview Dashboard. You can see our total certified material recovered in kilograms, active listings, and upcoming pickups. Notice the prominent DEMO workspace indicator—we never present simulated demo numbers as live environmental impact.
  > Let's follow a complete circular workflow:
  > First, we open the **Material Exchange** (`/listings`). Here we have a real listing from the DTU Central Stores: 850 kg of clean corrugated cardboard packaging.
  > Next, we click **Find Compatible Partners** to run our deterministic matching engine (`/matches`). Notice how our transparent algorithm awards EcoPaper Recyclers 97 out of 100 points, breaking down exact scores for material license, volume capacity, and Rohini zone proximity. Uncertified recyclers for e-waste would be strictly blocked here.
  > Let's accept the match and schedule a collection pickup for tomorrow at 10 AM with vehicle plate DL-1L-AA-5521.
  > In the **Collection Tracker** (`/collections`), once the driver loads the material, we confirm collection.
  > Finally, at the pulp mill weighbridge, the auditor certifies the net weight: 845 kg, with weighbridge slip WB-EP-2026-901.
  > Notice what happens: a tamper-resistant verification hash is issued, the status transitions to Recovery Certified, and our Dashboard instantly updates the verified kilograms recovered and avoided emissions!"

### **[1:45 - 2:30] Part 3: Architecture & Real AWS Integration**
- **Visual:** Navigate to `/about`.
- **Narration:**
  > "Let's inspect how this is built on AWS:
  > The frontend is hosted on **AWS Amplify Hosting**, connected directly to our public GitHub repository with edge caching.
  > Our backend runs as secure Next.js serverless route handlers, connected via AWS SDK v3 to **Amazon DynamoDB** using table `reloop-records` with Single-Table design.
  > Notice our live AWS diagnostic panel right here on screen—it checks credentials and reports table status and round-trip latency in real time. We also provide a complete CloudFormation template and a one-click automated setup script for instant deployment."

### **[2:30 - 3:00] Part 4: Environmental Methodology & Conclusion**
- **Visual:** Open `/impact`.
- **Narration:**
  > "Finally, under **Impact & Methodology**, we disclose all EPA WARM v15 and CPCB conversion factors, system boundaries, and uncertainty limits. We report only what was actually weighed and certified at the facility.
  > ReLoop transforms fragmented waste disposal into verifiable, circular resource intelligence. Thank you!"
