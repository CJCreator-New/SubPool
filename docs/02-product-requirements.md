# SubPool Product Requirements Document (PRD)

## 1. Product Vision & Goals
**Vision:** Demystify subscription costs and enable secure, reliable sharing of digital subscriptions (OTT, Team SaaS, AI tools) to maximize savings for all users.
**Goals:**
* Provide a seamless platform to list available slots in subscriptions.
* Offer market intelligence to show average slot prices and total savings.
* Enable secure communication between pool owners and members.
* Ensure reliable payment and ledger tracking for pool participations.

## 2. Target Audience
* **Cost-conscious consumers:** Individuals looking to save money on streaming services and software.
* **Resourceful administrators (Hosts):** Users who already pay for premium plans and want to monetize their unused seats/slots safely.

## 3. Functional Requirements
### 3.1 Authentication & Profiles
* Users must be able to sign up, log in, and manage their sessions.
* Profiles must include a display name, an avatar color, a plan type (free, pro, host_plus), and a verification status.

### 3.2 Pool Management (Hosting)
* Verified users can create a "Pool" specifying the platform (e.g., Netflix), plan name, price per slot, and total available slots.
* Pools must support rich statuses (open, active, closed) and feature full text search capabilities on platform names and categories.

### 3.3 Pool Discovery & Joining (Frictionless Browsing)
* Users can browse active pools.
* Users can search for specific platforms.
* Pool cards must display pricing intelligence (e.g., market average, minimum slot price).
* Users can request to join an open pool resulting in a membership request.

### 3.4 Messaging & Communication
* Pool members and owners must have access to a real-time chat interface per pool.
* Messages must be marked with a read status.

### 3.5 Wishlist
* If a pool doesn't exist, users can create a Wishlist Request specifying the platform, budget, and urgency.

## 4. Non-Functional Requirements
* **Performance:** Platform metrics and averages must be calculated automatically and cached/stored via DB triggers to avoid expensive real-time aggregations on read.
* **Security:** All direct database access must be guarded by strict Row Level Security (RLS) policies. Rate limiting must be enforced on pool mutations (max 10 per minute per user).
* **Usability:** The UI must adhere to WCAG accessibility standards and be fully responsive across mobile, tablet, and desktop viewports.

## 5. User Stories & Acceptance Criteria
### User Story: Discover Pools
* **As a** user,
* **I want to** search for a specific platform's subscription pool,
* **So that** I can join and split the cost.
* **Acceptance Criteria:**
  1. Search bar is prominently displayed.
  2. Search returns results matching platform, plan_name, or category within 500ms.
  3. Pricing intelligence data evaluates the pool's value relative to market averages.

### User Story: In-Pool Communication
* **As a** pool member,
* **I want to** message the pool owner,
* **So that** I can get the login credentials securely.
* **Acceptance Criteria:**
  1. Real-time chat UI is available within the Pool detail view.
  2. Messages send instantly.
  3. Non-members cannot view or send messages.
