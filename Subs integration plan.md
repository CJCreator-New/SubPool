Here's the complete blueprint for integrating all subscription plan categories into SubPool — covering AI Tools, Education, Entertainment, DTH, YouTube Family Plans, OTT, and more:

***

# SubPool — Subscription Categories Integration Blueprint

***

## 🗂️ MASTER CATEGORY ARCHITECTURE

### Database Schema: `platforms` Table

```sql
CREATE TABLE platforms (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  slug VARCHAR(100) UNIQUE,
  category_id UUID REFERENCES categories(id),
  subcategory_id UUID REFERENCES subcategories(id),
  logo_url TEXT,
  brand_color VARCHAR(7),
  
  -- Sharing rules
  sharing_type ENUM('family_plan', 'team_plan', 'multi_seat', 'credential_share', 'profile_share'),
  max_members INTEGER,
  requires_same_country BOOLEAN DEFAULT FALSE,
  requires_same_region BOOLEAN DEFAULT FALSE,
  
  -- Pricing reference
  official_retail_price_inr DECIMAL,
  official_retail_price_usd DECIMAL,
  billing_cycles JSONB, -- ['monthly','annual','lifetime']
  
  -- Compliance
  sharing_allowed BOOLEAN,
  sharing_notes TEXT, -- "Official Family Plan — fully allowed"
  tos_risk_level ENUM('safe', 'grey_area', 'risky'),
  
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);
```

***

## 📦 CATEGORY 1 — AI Tools

### Platforms to Support

| Platform | Plan Type | Max Members | INR Price/mo | Sharing Type |
|----------|-----------|-------------|--------------|--------------|
| ChatGPT Plus | Individual (credential share) | 1–2 | ₹1,950 | Credential share |
| ChatGPT Team | Team plan | Up to 150 | ₹2,100/user | Team seats |
| Claude Pro | Individual | 1 | ₹1,700 | Credential share |
| Claude Team | Team | 5+ | ₹2,200/user | Team seats |
| Gemini Advanced | Google One AI | Up to 5 | ₹1,950 | Family group |
| Perplexity Pro | Individual | 1 | ₹1,600 | Credential share |
| Midjourney | Individual/Teams | 1–5 | ₹830–₹4,150 | Credential share |
| GitHub Copilot | Individual/Business | 1+ | ₹830/user | Seat-based |
| Cursor Pro | Individual | 1 | ₹1,600 | Credential share |
| Adobe Firefly | Creative Cloud | Up to 5 | ₹5,800 | Named users |
| ElevenLabs | Creator+ | 2–5 | ₹1,600 | Credential share |
| Runway ML | Standard+ | 1–3 | ₹4,100 | Credential share |

### Sharing Model for AI Tools

```typescript
// AI Tool Pool Listing Schema
{
  platform: "ChatGPT Team",
  sharing_type: "team_seats",
  total_seats: 5,
  host_seats: 1,
  available_slots: 4,
  price_per_slot_inr: 420, // ₹2100 ÷ 5
  access_method: "individual_login", // each member gets own login
  pool_rules: [
    "No sharing credentials externally",
    "Usage within fair-use limits",
    "Host manages billing"
  ]
}
```

***

## 📚 CATEGORY 2 — Education

### Platforms to Support

| Platform | Plan Type | Max Members | INR Price/mo | Notes |
|----------|-----------|-------------|--------------|-------|
| Coursera Plus | Individual | 1–2 | ₹6,600 | Credential share |
| LinkedIn Learning | Individual | 1 | ₹1,300 | Credential share |
| Udemy Business | Team | 5–20 | ₹2,500/user | Seat-based |
| Skillshare | Individual | 1 | ₹830 | Credential share |
| MasterClass | Duo/Family | 2–6 | ₹2,900 | Official family plan |
| Duolingo Super | Family | Up to 6 | ₹580 | Official family plan |
| Babbel | Family | Up to 3 | ₹1,300 | Official family plan |
| Khan Academy | Free/Donor | N/A | Free | N/A |
| Brilliant.org | Annual | 1–2 | ₹2,500 | Credential share |
| Byju's | Family Pack | 3 | ₹12,000/yr | Official family |
| Unacademy | Learner/Iconic | 1 | ₹1,300 | Credential share |
| BYJU's Exam Prep | Group | 2–3 | ₹2,500 | Credential share |
| O'Reilly Learning | Team | 3+ | ₹4,100 | Seat-based |

### Special Rules for Education Pools

```typescript
{
  education_specific_rules: {
    concurrent_access: false, // Most edu platforms allow only 1 active session
    session_scheduling: true, // Members must schedule time slots
    download_rights: "per_member", // Downloads tied to individual accounts
    certificate_eligibility: true // Each member gets own certificate
  }
}
```

***

## 🎬 CATEGORY 3 — OTT & Entertainment

### Sub-categories

#### 3A — Video Streaming (OTT)

| Platform | Plan | Max Members | INR Price/mo | Official Sharing |
|----------|------|-------------|--------------|-----------------|
| Netflix | Standard (2 screens) | 2 | ₹649 | Extra member add-on |
| Netflix | Premium (4 screens) | 4 | ₹649 | Extra member ₹149/mo |
| Amazon Prime Video | Household | Family | ₹299 | Household sharing |
| Disney+ Hotstar | Super/Premium | 4 screens | ₹299–₹399 | Multi-screen |
| JioCinema | Premium | 4 | ₹29–₹149 | Multi-screen |
| SonyLIV | Premium | 1–5 | ₹999/yr | Multi-profile |
| ZEE5 | Annual | 1–5 | ₹499/yr | Multi-profile |
| Apple TV+ | Family Sharing | Up to 6 | ₹99 | Official Family Plan |
| HBO Max | Ultimate | 4 screens | ₹1,300 | Ad-free sharing |
| Hulu | (US-based) | 2 | ₹830 | Credential share |
| Peacock | (US-based) | 3 | ₹580 | Credential share |
| MUBI | Individual | 1–2 | ₹499 | Credential share |
| Aha | Premium | 3 | ₹149 | Multi-screen |
| Sun NXT | Annual | 2–3 | ₹499/yr | Credential share |

#### 3B — Music Streaming

| Platform | Plan | Max Members | INR Price/mo | Official Sharing |
|----------|------|-------------|--------------|-----------------|
| Spotify | Duo | 2 | ₹149 | Official Duo Plan |
| Spotify | Family | Up to 6 | ₹179 | Official Family Plan |
| Apple Music | Family | Up to 6 | ₹150 | Official Family Plan |
| YouTube Music | Family | Up to 5 | ₹189 | Official Family Plan |
| Amazon Music | Family | Up to 6 | ₹179 | Official Family Plan |
| Gaana | Plus | 1–2 | ₹99 | Credential share |
| JioSaavn | Pro | 6 (family) | ₹99 | Official Family |
| Hungama | Play | 1 | ₹99 | Credential share |

#### 3C — Gaming & Game Pass

| Platform | Plan | Max Members | INR Price/mo | Notes |
|----------|------|-------------|--------------|-------|
| Xbox Game Pass | Ultimate | 1–5 | ₹499 | Gameshare |
| PlayStation Plus | Extra/Premium | 2 | ₹999 | Primary console share |
| Nintendo Switch Online | Family | Up to 8 | ₹1,499/yr | Official Family |
| EA Play | Individual | 1–2 | ₹299 | Credential share |
| GeForce NOW | Priority | 1 | ₹499 | Credential share |
| Steam | — | 1 | N/A | Family sharing (free) |

***

## 📡 CATEGORY 4 — DTH (Direct-to-Home)

This is a **unique India-specific category** with specific integration rules:

### Platforms

| Provider | Plan Type | Family Sharing | Monthly Cost | Notes |
|----------|-----------|----------------|-------------|-------|
| Tata Play (Tata Sky) | Family Pack | Multi-TV add-ons | ₹430–₹900 | Multi-room connection sharing |
| Airtel DTH | Family Pack | Up to 4 TVs | ₹400–₹850 | Multi-room |
| Dish TV | Family Pack | Up to 3 TVs | ₹350–₹700 | Multi-room |
| Sun Direct | Family Pack | Up to 2 TVs | ₹250–₹500 | South India focus |
| Videocon D2H | Family Pack | Up to 3 TVs | ₹350–₹650 | Multi-room |
| IPTV providers | Various | Multiple streams | ₹200–₹600 | Credential share |

### DTH-Specific Pool Logic

```typescript
// DTH pools work differently — not credential sharing but physical add-on connections
{
  platform: "Tata Play",
  sharing_type: "multi_room_add_on",
  primary_account: "host", // host has main subscription
  add_on_connections: 3,
  add_on_cost_per_connection_inr: 160,
  geographic_restriction: "same_state", // DTH signals are state/region-specific
  hardware_required: true, // Set-top box needed
  installation_required: true,
  
  special_notes: "Members need physical set-top box installation. Host adds them as additional connection on their DTH account. Each member pays their proportional share of the base pack + add-on fee."
}
```

***

## 📺 CATEGORY 5 — YouTube Plans

### YouTube Family Plan Integration

```typescript
{
  platform: "YouTube Premium",
  plan_variants: [
    {
      name: "YouTube Premium Individual",
      price_inr: 139,
      max_members: 1,
      sharing_type: "credential_share"
    },
    {
      name: "YouTube Premium Family",
      price_inr: 189,
      max_members: 5, // + plan manager = 6 total
      sharing_type: "family_invite",
      requirements: {
        same_household: true, // Google's official requirement
        age_minimum: 13,
        google_family_group: true
      },
      cost_per_slot_inr: 38, // ₹189 ÷ 5 members
      includes: ["YouTube Music", "YouTube Premium", "YouTube Kids"]
    }
  ]
}
```

### YouTube-Specific Pool Rules

- Members must be invited to the host's **Google Family Group**
- Google enforces same-household policy — pools must disclose this is a grey-area
- Include compliance disclaimer on listing
- Max 5 members per family plan

***

## 🏠 CATEGORY 6 — Family Plans (Cross-Platform)

### Platforms with Official Family Plan Support

| Platform | Family Members | Price INR/mo | Cost/Member |
|----------|---------------|-------------|-------------|
| Apple One Family | Up to 6 | ₹1,195 | ₹199 |
| Google One (2TB) | Up to 5 | ₹270 | ₹54 |
| Microsoft 365 Family | Up to 6 | ₹499 | ₹83 |
| iCloud+ Family | Up to 5 | ₹75 | ₹15 |
| Nintendo Family | Up to 8 | ₹125 | ₹16 |
| Canva Teams | 5 seats | ₹3,999/yr | ₹800/yr |
| Notion Team | Per seat | ₹800/seat | — |
| 1Password Families | Up to 5 | ₹250 | ₹50 |
| LastPass Families | Up to 6 | ₹330 | ₹55 |
| NordVPN Families | 10 devices | ₹280 | ₹56 |
| ExpressVPN | 8 devices | ₹500 | ₹63 |

***

## 🛠️ CATEGORY 7 — Productivity & SaaS (Team Plans)

| Platform | Plan | Seats | INR/seat/mo | Sharing |
|----------|------|-------|-------------|---------|
| Notion | Team | 2–100 | ₹660 | Named seats |
| Figma | Professional | 2–50 | ₹1,000 | Named seats |
| Slack | Pro | 3–250 | ₹580 | Named seats |
| Zoom | Business | 10–250 | ₹1,300 | Named seats |
| Loom | Business | 3–50 | ₹830 | Named seats |
| Grammarly | Business | 3–149 | ₹1,000 | Named seats |
| Dropbox | Business | 3+ | ₹1,250 | Named seats |
| Monday.com | Basic | 3+ | ₹800 | Named seats |
| Ahrefs | Agency | 5 | ₹22,000 | Named seats |
| SEMrush | Guru | 1 + extras | ₹9,100 | Extra users |
| Webflow | Team | 3+ | ₹1,600 | Named seats |
| Framer | Team | 2+ | ₹1,300 | Named seats |

***

## 🏗️ IMPLEMENTATION ARCHITECTURE

### 1. Platform Catalog (Supabase Tables)

```sql
-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(50), -- "AI Tools", "Entertainment", "Education"
  slug VARCHAR(50) UNIQUE,
  icon VARCHAR(10), -- emoji or icon name
  color VARCHAR(7),
  sort_order INTEGER
);

-- Subcategories  
CREATE TABLE subcategories (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES categories(id),
  name VARCHAR(50), -- "Video Streaming", "Music", "Gaming"
  slug VARCHAR(50)
);

-- Platform catalog (curated by admin)
CREATE TABLE platforms (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES categories(id),
  subcategory_id UUID REFERENCES subcategories(id),
  name VARCHAR(100),
  slug VARCHAR(100) UNIQUE,
  logo_url TEXT,
  brand_color VARCHAR(7),
  sharing_type sharing_type_enum,
  max_pool_size INTEGER,
  retail_price_inr DECIMAL,
  retail_price_usd DECIMAL,
  tos_risk_level tos_risk_enum DEFAULT 'grey_area',
  requires_same_location BOOLEAN DEFAULT FALSE,
  geographic_scope VARCHAR(20), -- 'global','india','state'
  hardware_required BOOLEAN DEFAULT FALSE,
  access_method VARCHAR(50), -- 'family_invite','credential','seat','add_on'
  compliance_note TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Pools (user-created listings)
CREATE TABLE pools (
  id UUID PRIMARY KEY,
  host_id UUID REFERENCES users(id),
  platform_id UUID REFERENCES platforms(id),
  title VARCHAR(200),
  description TEXT,
  total_slots INTEGER,
  filled_slots INTEGER DEFAULT 0,
  price_per_slot_inr DECIMAL,
  billing_cycle VARCHAR(20), -- 'monthly','annual'
  auto_renew BOOLEAN DEFAULT TRUE,
  status pool_status_enum, -- 'open','full','expired','paused'
  rules JSONB,
  next_billing_date DATE,
  created_at TIMESTAMP,
  expires_at TIMESTAMP
);
```

### 2. "List a Pool" Wizard — Step Flow

```
Step 1: Select Category
  → [AI Tools] [Education] [OTT] [Music] [DTH] [Family Plans] [Gaming] [Productivity]

Step 2: Select Platform
  → Search or browse platform catalog
  → Platform card shows: official price, max members, sharing type, compliance level

Step 3: Choose Plan Variant
  → e.g., Netflix: [Standard — 2 screens ₹649] [Premium — 4 screens ₹649+extras]

Step 4: Set Pool Size & Pricing
  → Total slots: [auto-suggested based on plan]
  → Your slots: [1] (how many you're keeping)
  → Available to share: [calculated]
  → Price per slot: [auto-calculated or manual override]
  → Billing cycle: [Monthly / Annual]

Step 5: Access Method
  → Credential share: You'll share login details securely
  → Family invite: You'll send official platform invite
  → Seat assignment: Each member gets their own login
  → Add-on: Physical/account add-on required

Step 6: Rules & Requirements
  → Location requirement: [Same city / State / Country / No restriction]
  → Age restriction: [None / 18+ / 13+]
  → Custom rules: [text input]
  → Auto-approve members: [Yes / No]

Step 7: Review & Publish
  → Cost breakdown preview
  → Compliance disclaimer shown
  → Publish → Go Live
```

### 3. Compliance Risk System

```typescript
const COMPLIANCE_LEVELS = {
  SAFE: {
    badge: "✅ Official Plan",
    color: "green",
    description: "This platform has an official sharing/family plan. Fully supported.",
    examples: ["Spotify Family", "Apple TV+", "YouTube Premium Family", "Nintendo Online Family"]
  },
  GREY_AREA: {
    badge: "⚠️ Informal Share",
    color: "yellow", 
    description: "Platform allows multiple devices but doesn't officially endorse account sharing between unrelated people.",
    examples: ["Netflix (post-crackdown)", "Hotstar", "SonyLIV"]
  },
  RISKY: {
    badge: "🔴 High Risk",
    color: "red",
    description: "Platform actively prohibits account sharing. Pool proceeds at risk of account suspension.",
    examples: ["Some SaaS tools with IP-based detection"]
  }
}
```

### 4. India-Specific Features

```typescript
// INR-first pricing
const INDIA_FEATURES = {
  payment_methods: ["UPI", "Razorpay", "PhonePe", "Paytm", "NetBanking", "Cards"],
  regional_platforms: ["Hotstar", "JioCinema", "ZEE5", "SonyLIV", "Aha", "Sun NXT", "Tata Play", "Airtel DTH"],
  regional_language_filter: ["Tamil", "Telugu", "Malayalam", "Kannada", "Hindi", "Bengali"],
  gst_on_transactions: 18, // % GST applicable
  tds_threshold: 30000, // ₹30k threshold for TDS on payouts
}
```

***

## 🗃️ CATEGORY SEEDING DATA (Ready to Import)

### Categories with Icon & Color

```json
[
  { "name": "AI Tools", "slug": "ai-tools", "icon": "🤖", "color": "#7C3AED" },
  { "name": "Education", "slug": "education", "icon": "📚", "color": "#2563EB" },
  { "name": "Video Streaming", "slug": "video-streaming", "icon": "🎬", "color": "#DC2626" },
  { "name": "Music", "slug": "music", "icon": "🎵", "color": "#059669" },
  { "name": "Gaming", "slug": "gaming", "icon": "🎮", "color": "#D97706" },
  { "name": "DTH & TV", "slug": "dth-tv", "icon": "📡", "color": "#0891B2" },
  { "name": "Family Plans", "slug": "family-plans", "icon": "👨‍👩‍👧‍👦", "color": "#DB2777" },
  { "name": "Productivity", "slug": "productivity", "icon": "💼", "color": "#64748B" },
  { "name": "Cloud Storage", "slug": "cloud-storage", "icon": "☁️", "color": "#0EA5E9" },
  { "name": "VPN & Security", "slug": "vpn-security", "icon": "🔒", "color": "#16A34A" },
  { "name": "Design & Creative", "slug": "design-creative", "icon": "🎨", "color": "#F59E0B" },
  { "name": "Developer Tools", "slug": "dev-tools", "icon": "⚙️", "color": "#8B5CF6" }
]
```

***

## 🔑 KEY DESIGN DECISIONS

### 1. Platform Catalog is Admin-Curated
- Users **cannot create custom platforms** — they only create pools from verified platforms
- Prevents spam, fake listings, and ToS confusion
- Admin approves new platform requests via the Admin dashboard

### 2. Slot Pricing is Transparent
- Show breakdown: *"Host pays ₹649/mo for Netflix Premium. Split 4 ways = ₹163/member"*
- Display savings vs. retail: *"You save ₹486/mo vs. buying alone"*

### 3. Compliance Badges on Every Listing
- Every pool card shows a green/yellow/red compliance badge
- First-time users see a "how sharing works" explainer modal
- Users accept a disclaimer before joining a grey-area pool

### 4. Geographic Matching Engine
- DTH pools: only match users in same city/state
- YouTube Family: same-household required (user acknowledges)
- Regional OTT (Aha, Sun NXT): filter by preferred language region
- Global tools (Claude, Midjourney): no restriction

### 5. Scheduled Access for Single-Login Platforms
- For credential-share pools where concurrent login isn't possible
- Members book time slots (e.g., "I'll use Midjourney from 9–11pm")
- Built-in calendar/scheduler per pool

***

## 📱 Browse Page Category UI

```
┌─────────────────────────────────────────────────────────┐
│  Browse Pools                                           │
│                                                         │
│  [🤖 AI Tools] [📚 Education] [🎬 OTT] [🎵 Music]     │
│  [🎮 Gaming]   [📡 DTH & TV] [👨‍👩‍👧 Family] [💼 SaaS]  │
│                                                         │
│  ┌──────────────┐  INR₹  USD$  Sort: Newest ▼  Search  │
│  │ Open Only    │                                       │
│  Continuing from where we left off — here is the complete continuation of the SubPool subscription integration blueprint:

***

## 📱 Browse Page Category UI (Continued)

```
┌─────────────────────────────────────────────────────────┐
│  Browse Pools                                           │
│                                                         │
│  [🤖 AI Tools] [📚 Education] [🎬 OTT] [🎵 Music]     │
│  [🎮 Gaming]   [📡 DTH & TV] [👨‍👩‍👧 Family] [💼 SaaS]  │
│                                                         │
│  ┌─────────────┐  INR₹  USD$   Sort: Newest▼  🔍Search  │
│  │ Open Only   │                                        │
│  │ ✅ Safe Only│  ← compliance filter                   │
│  │ < ₹200/mo  │  ← price filter                        │
│  └─────────────┘                                        │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │🎬Netflix │  │🤖ChatGPT │  │📡TataPlay│             │
│  │Premium   │  │Team      │  │Family    │             │
│  │₹163/mo   │  │₹420/mo   │  │₹160/mo  │             │
│  │3 slots   │  │4 slots   │  │2 slots  │             │
│  │✅ Safe   │  │⚠️ Grey  │  │✅ Safe  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

***

## 🔄 COMPLETE POOL LIFECYCLE FLOWS

### Flow 1 — Family Plan Pool (e.g., Spotify Family)

```
HOST                              MEMBER
  │                                  │
  │ 1. Create Pool                   │
  │    Platform: Spotify Family      │
  │    Slots: 5 (host keeps 1)       │
  │    Price: ₹30/slot/mo            │
  │    Type: Family Invite           │
  │                                  │
  │ 2. Pool goes LIVE                │
  │                            3. Member finds pool
  │                            4. Sends join request
  │ 5. Host approves ←──────────────│
  │                                  │
  │ 6. Payment collected from member │
  │    (Razorpay / UPI)             │
  │                                  │
  │ 7. Host sends Spotify family     │
  │    invite to member's email ────→│
  │                            8. Member accepts invite
  │                            9. Member gets access ✅
  │                                  │
  │ [MONTHLY AUTO-BILLING CYCLE]     │
  │ 10. Payment auto-collected ──────│
  │ 11. Host payout released         │
```

***

### Flow 2 — DTH Add-on Pool (e.g., Tata Play)

```
HOST                              MEMBER
  │                                  │
  │ 1. Create DTH Pool               │
  │    Provider: Tata Play           │
  │    Base Pack: Hindi Sports ₹700  │
  │    Add-on slots: 2               │
  │    Price: ₹200/slot/mo           │
  │    Location: Tamil Nadu          │
  │                                  │
  │                            2. Member (same state) finds pool
  │                            3. Provides STB details
  │ 4. Host calls Tata Play ─────────│
  │    adds member as multi-room     │
  │    connection                    │
  │                            5. Member's STB activated ✅
  │                                  │
  │ 6. Monthly payment collected     │
  │    from member                   │
```

***

### Flow 3 — AI Tool Credential Share (e.g., Midjourney)

```
HOST                              MEMBER
  │                                  │
  │ 1. Create Pool                   │
  │    Platform: Midjourney Standard │
  │    Type: Credential Share        │
  │    Slots: 2                      │
  │    Price: ₹415/slot/mo           │
  │    Concurrent use: NO            │
  │    Session scheduler: ON         │
  │                                  │
  │                            2. Member joins + pays
  │                            3. Books usage slot:
  │                               "Mon, Wed, Fri 6–10pm"
  │ 4. SubPool encrypts & stores     │
  │    credentials in vault ─────────│ (member sees masked)
  │                                  │
  │ [Usage session starts]           │
  │ 5. Credentials auto-revealed ───→│
  │    for booked time window        │
  │ 6. Session ends — credentials    │
  │    re-hidden                     │
```

***

## 🔐 CREDENTIAL VAULT SYSTEM

For platforms requiring credential sharing, a secure vault is essential:

```typescript
// Encrypted credential storage
interface CredentialVault {
  pool_id: string;
  encrypted_email: string;      // AES-256 encrypted
  encrypted_password: string;   // AES-256 encrypted
  reveal_conditions: {
    payment_status: 'paid';
    session_active: boolean;
    member_verified: boolean;
  };
  auto_rotate_on: 'member_leave' | 'monthly' | 'manual';
  last_rotated: Date;
}

// How members access credentials
const accessFlow = {
  1: "Member clicks 'View Access'",
  2: "SubPool verifies: payment current + session booked",
  3: "Credentials shown for 60 seconds (masked after)",
  4: "Access log recorded for host visibility",
  5: "On member leaving: host prompted to change password"
}
```

***

## 💳 PAYMENT FLOW — INDIA-FIRST

### Razorpay Integration Architecture

```typescript
// Pool payment collection
interface PoolPayment {
  // Collected from member
  slot_price_inr: number;          // e.g., ₹163
  platform_fee_inr: number;        // SubPool fee: 5% = ₹8
  gst_on_fee_inr: number;         // 18% GST on fee = ₹1.44
  total_charged_inr: number;       // ₹172.44
  
  // Disbursed to host
  host_payout_inr: number;         // ₹163 - 5% = ₹154.85
  payout_schedule: 'instant' | 'next_day' | 'monthly_batch';
  
  // Payment methods supported
  upi: true,          // PhonePe, GPay, Paytm, BHIM
  cards: true,        // Visa, Mastercard, RuPay
  net_banking: true,
  wallets: true,
  emi: false          // Not for small amounts
}

// Auto-renewal system
interface AutoRenewal {
  mandate_type: 'UPI_AUTOPAY' | 'NACH' | 'CARD_STANDING_INSTRUCTION';
  collection_day: number;         // e.g., 1st of every month
  retry_on_failure: 3;           // Retry 3 times before marking failed
  failure_action: 'pause_access' | 'notify_host';
  grace_period_days: 3;
}
```

***

## 📊 SAVINGS ANALYTICS DASHBOARD

### Per-User Savings Tracker

```typescript
interface SavingsAnalytics {
  user_id: string;
  
  // Summary
  total_saved_this_month_inr: number;   // e.g., ₹1,847
  total_saved_this_year_inr: number;    // e.g., ₹14,230
  vs_retail_percentage: number;         // "Saving 73% vs retail"
  
  // Per pool breakdown
  pools: [
    {
      platform: "Netflix Premium",
      paying_inr: 163,
      retail_inr: 649,
      saved_inr: 486,
      savings_pct: 75
    },
    {
      platform: "ChatGPT Team",
      paying_inr: 420,
      retail_inr: 2100,
      saved_inr: 1680,
      savings_pct: 80
    },
    {
      platform: "Spotify Family",
      paying_inr: 30,
      retail_inr: 119,
      saved_inr: 89,
      savings_pct: 75
    }
  ],
  
  // Category breakdown chart data
  by_category: {
    "Entertainment": { spent: 193, saved: 575 },
    "AI Tools":      { spent: 420, saved: 1680 },
    "Music":         { spent: 30,  saved: 89 },
    "Education":     { spent: 660, saved: 5940 }
  }
}
```

***

## 🔔 NOTIFICATION TEMPLATES BY CATEGORY

```typescript
const NOTIFICATION_TEMPLATES = {
  
  // Pool lifecycle
  POOL_SLOT_OPENED:      "🎬 A Netflix Premium slot just opened — ₹163/mo",
  POOL_EXPIRING:         "⚠️ Your Spotify Family pool renews in 3 days",
  PAYMENT_COLLECTED:     "✅ ₹163 collected from @member for Netflix",
  PAYOUT_RELEASED:       "💰 ₹490 payout sent to your UPI",
  
  // Member events
  JOIN_REQUEST:          "👤 @ravi_k wants to join your ChatGPT Team pool",
  JOIN_APPROVED:         "✅ You've been approved for Netflix Premium pool",
  MEMBER_LEFT:           "🚪 @priya_m left your Spotify pool — 1 slot reopened",
  
  // Access events
  CREDENTIALS_ROTATED:   "🔄 Your Midjourney credentials have been updated",
  SESSION_STARTING:      "⏰ Your Midjourney session starts in 10 minutes",
  
  // DTH specific
  STB_ACTIVATION:        "📡 Your Tata Play add-on connection is now active",
  
  // Trust & safety
  PAYMENT_FAILED:        "❌ Payment failed for @user — access paused in 3 days",
  DISPUTE_RAISED:        "⚠️ A dispute was raised on your Netflix pool",
  
  // Savings milestones
  SAVINGS_MILESTONE:     "🎉 You've saved ₹10,000 on SubPool this year!"
}
```

***

## 🧩 PLATFORM CATALOG ADMIN PANEL

### Admin: Add New Platform Flow

```
1. Platform Details
   ├── Name, Logo upload, Brand color
   ├── Category + Subcategory
   └── Official website URL

2. Sharing Configuration
   ├── Sharing type: [Family Invite / Team Seat / Credential Share / Add-on]
   ├── Max pool size: [number]
   ├── Concurrent logins allowed: [Yes/No]
   └── Session scheduling required: [Yes/No]

3. Pricing Reference
   ├── Official INR retail price(s) — all plan variants
   ├── Official USD price(s)
   └── Billing cycles: [Monthly / Annual / Lifetime]

4. Compliance & Risk
   ├── TOS risk level: [Safe ✅ / Grey ⚠️ / Risky 🔴]
   ├── Compliance note (shown to users)
   ├── Geographic restrictions
   └── Age restrictions

5. India-Specific
   ├── Available in India: [Yes/No]
   ├── Regional language: [Tamil/Telugu/Hindi/etc.]
   ├── UPI/Razorpay compatible: [Yes/No]
   └── Hardware required: [Yes/No]

6. Review & Publish
   └── Platform goes live in catalog ✅
```

***

## 🗺️ FULL CATEGORY × FEATURE MATRIX

| Feature | AI Tools | Education | OTT/Video | Music | DTH | YouTube | Gaming | SaaS |
|---------|----------|-----------|-----------|-------|-----|---------|--------|------|
| Credential Share | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Family Invite | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Team Seats | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Physical Add-on | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Session Scheduler | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Geo Restriction | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| UPI AutoPay | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Auto Credential Rotate | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Compliance Badge | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Language Filter | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

***

## 📅 RECOMMENDED SPRINT INTEGRATION ORDER

| Sprint | Category to Add | Why First |
|--------|----------------|-----------|
| **1** | OTT (Netflix, Hotstar, Prime) | Highest demand, simple credential/profile share |
| **2** | Music (Spotify, JioSaavn) | Official family plans = low compliance risk |
| **3** | AI Tools (ChatGPT, Claude, Gemini) | High-value, tech-savvy early adopters |
| **4** | Education (Coursera, Duolingo, MasterClass) | Family plans available, medium risk |
| **5** | YouTube Family Plan | Official plan, but same-household requirement adds UX complexity |
| **6** | Family Plans (Apple One, Microsoft 365, Google One) | Official plans = fully safe |
| **7** | Gaming (Xbox, PlayStation, Nintendo) | Official family/share plans exist |
| **8** | DTH (Tata Play, Airtel) | Most complex — physical add-on, location-restricted |
| **9** | SaaS/Productivity (Notion, Figma, Slack) | B2B-leaning, seat-based model |
| **10** | Developer Tools (GitHub Copilot, Cursor) | Niche but high willingness to pay |

***

## 🏁 PRODUCTION LAUNCH CHECKLIST

### Before Going Live with Any Category:

```
Legal & Compliance
  □ ToS disclaimer page for each risk level
  □ User accepts disclaimer before joining grey-area pool
  □ Privacy policy covers credential vault encryption
  □ GST registration for payment processing

Payments
  □ Razorpay account approved (KYC complete)
  □ UPI AutoPay mandate flow tested
  □ Payout to host bank/UPI tested end-to-end
  □ Failed payment retry flow tested
  □ Refund flow for mid-cycle exits tested

Trust & Safety
  □ Phone number verification on signup
  □ Trust score initialized for all users
  □ Dispute raising flow complete
  □ Admin moderation queue built

Platform Catalog
  □ Minimum 20 platforms seeded across 5 categories
  □ All platforms have verified pricing data
  □ Compliance badges reviewed by legal
  □ Logo/brand assets sourced with rights

Notifications
  □ Email (Resend/SendGrid) configured
  □ In-app notifications real-time (Supabase)
  □ UPI payment SMS passthrough

Testing
  □ End-to-end payment flow tested (₹1 test transaction)
  □ Credential vault encrypt/decrypt tested
  □ Auto-renewal tested with mock dates
  □ All 12 nav routes working without blank screens
```

***

## 💡 INDIA-SPECIFIC COMPETITIVE ADVANTAGES

These differentiate SubPool from any global competitor:

1. **UPI AutoPay** — Frictionless monthly collection, no credit card required
2. **Regional OTT focus** — Aha (Telugu), Sun NXT (Tamil), Zee5 regional, Jio Cinema
3. **DTH pool** — Unique to India, no global platform does this
4. **INR-first pricing** — Never show USD as primary, always INR with real-time conversion
5. **Language filter** — Browse pools by content language (Tamil, Hindi, etc.)
6. **WhatsApp notifications** — Indians prefer WhatsApp over email; integrate WhatsApp Business API for payment receipts and pool alerts
7. **₹ savings milestone badges** — Gamify savings in INR (₹5K, ₹10K, ₹25K saved badges)
8. **Tier-2/3 city affordability** — SubPool makes premium tools accessible to users who can't afford full retail prices

This blueprint gives you a complete, India-ready, production-grade subscription sharing platform covering all major categories with appropriate compliance, payment, and access models for each.