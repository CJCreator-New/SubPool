# SubPool Database Schema Documentation

## 1. Concept Overviews
SubPool uses PostgreSQL (via Supabase). The schema heavily utilizes Row Level Security (RLS) policies to enforce access controls on the database level, preventing unauthorized access directly from REST APIs. Triggers are used for robust audit tracking and asynchronous counter updates.

## 2. Entity Relationship Diagram (ERD)
```mermaid
erDiagram
    PROFILES ||--o{ POOLS : owns
    PROFILES ||--o{ MEMBERSHIPS : has
    PROFILES ||--o{ MESSAGES : sends
    PROFILES ||--o{ WISHLIST_REQUESTS : creates
    POOLS ||--o{ MEMBERSHIPS : includes
    POOLS ||--o{ MESSAGES : contains
    MEMBERSHIPS ||--o{ LEDGER : tracks
    LEDGER ||--o{ LEDGER_AUDIT : history

    PROFILES {
        uuid id PK
        text email "User's email"
        text display_name "Visible username"
        text plan "free | pro | host_plus"
        boolean is_verified
    }
    
    POOLS {
        uuid id PK
        uuid owner_id FK
        text platform "e.g., Netflix"
        text plan_name "e.g., 4K Premium"
        numeric price_per_slot
        integer total_slots
        text status "open | active | closed"
        tsvector search_vector "For full text search"
    }

    MEMBERSHIPS {
        uuid id PK
        uuid pool_id FK
        uuid user_id FK
        text status "pending | active | cancelled"
        timestamptz next_billing_at
    }

    MESSAGES {
        uuid id PK
        uuid pool_id FK
        uuid sender_id FK
        text content
        timestamptz created_at
    }

    PLATFORM_PRICING {
        uuid id PK
        text platform_id
        text plan_name
        numeric official_price
        integer max_seats
    }
```

## 3. Key Tables & Functions

### `pools`
The core entity representing a shared subscription.
* **RLS Policies:**
    * Read: Public
    * Insert/Update: Authenticated users.
* **Performance:** Uses GIN indexing on `search_vector` for fast keyword lookup combining platform, plan, and category.

### `messages`
Stores chat history for active pools.
* **RLS Policies:**
    * Read: Only owner of `pool_id` or users with an `active` membership in `pool_id`.
    * Insert: Only owner or `active` members (where `auth.uid() = sender_id`).
* **Realtime:** Realtime subscriptions are enabled via logical replication for instant chat delivery.

### `platform_pricing` & `pool_market_metrics` (Pricing Intelligence)
Stores baseline official pricing (`platform_pricing`) and aggregate statistics calculated dynamically from existing pools (`pool_market_metrics`).
* **Triggers:** A trigger on `pools` insert/update/delete calls `refresh_pool_market_metrics()` to recompute market averages (avg_slot_price) automatically.

### `ledger` & `ledger_audit` (Financial Tracking)
Tracks payment flows internally.
* **Audit Triggers:** Any UPDATE to the `ledger` table fires the `record_ledger_audit()` trigger which logs the exact changes (`old_amount`, `new_amount`, `old_status`, `new_status`) to `ledger_audit`.

### `rate_limits` Functionality
A pure PostgreSQL function `check_rate_limit(p_user_id, p_action, p_max_per_min)` tracks actions inside the `rate_limits` table to prevent abuse, enforced by a trigger on mutations for the `pools` table.
