PROJECT: SubPool — peer-to-peer subscription slot marketplace
CODEBASE: Figma Make export (Vite + React 18 + TypeScript)
STACK: Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui, 
       React Router v6, Supabase, Sonner (toasts)

EXISTING FILES (do not recreate these):
src/app/components/ui/ contains 47 shadcn components including:
button.tsx, card.tsx, badge.tsx, input.tsx, avatar.tsx, 
select.tsx, dialog.tsx, table.tsx, sidebar.tsx (with SidebarProvider, 
SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, 
SidebarHeader, SidebarFooter, SidebarInset, SidebarGroupLabel),
skeleton.tsx, sonner.tsx, switch.tsx, tabs.tsx, separator.tsx,
sheet.tsx, label.tsx, textarea.tsx, tooltip.tsx

MISSING (what you need to build):
- src/styles/index.css (main.tsx imports this — does not exist)
- src/styles/fonts.css (App.tsx imports this — does not exist)
- tailwind.config.ts
- src/app/routes.tsx (App.tsx imports this — does not exist)
- src/lib/types.ts
- src/lib/constants.ts
- src/lib/mock-data.ts
- src/lib/supabase/client.ts
- src/lib/supabase/hooks.ts
- src/lib/supabase/mutations.ts
- src/app/components/subpool-components.tsx
- src/app/components/pool-detail-modal.tsx
- src/app/layouts/DashboardLayout.tsx
- src/app/pages/ (7 pages)

DESIGN TOKENS (non-negotiable — never use other colors):
--background: #0E0E0E (base dark)
--card: #161616 (surface)
--border: #2A2A2A
--foreground: #F0ECE4 (text)
--muted-foreground: #6B6860
--primary: #C8F135 (lime — main accent, use sparingly)
--primary-foreground: #0E0E0E
--success: #4DFF91
--warning: #F5A623
--danger: #FF4D4D
Font display: Syne (800/700/600/400)
Font mono: IBM Plex Mono (500/400) — use for ALL prices, 
           timestamps, data labels, mono text

COMPONENT RULES:
- Cards: bg-card border border-[#2A2A2A] rounded-[6px] p-5
- Status pills: BORDER ONLY, no solid fill, rounded-full
- Primary buttons: bg-primary text-primary-foreground font-display font-bold
- All prices/numbers: font-mono
- Headings: font-display font-bold tracking-tight
- Section labels: font-mono text-[10px] uppercase tracking-widest text-muted-foreground

SUPABASE:
Env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
Use createClient from @supabase/supabase-js (not SSR — this is Vite not Next.js)
All hooks fall back to mock data when Supabase is not connected

ENHANCEMENT CONTEXT — add to existing workspace brief:

NEW FEATURES BEING ADDED:
1. Pricing Intelligence — live/cached platform pricing data
2. Dynamic pricing guidance in Create Pool
3. Pricing & Savings education hub page
4. SubPool's own plan tiers (Free/Pro/Host Plus)
5. Paywall + upgrade prompts

CURRENCIES: INR (₹) primary for India, USD ($) global
  Detection: use browser navigator.language or user profile country
  Format: if country === 'IN' use ₹ else use $
  Exchange rate: store in platform_pricing, not computed on-fly

PLATFORM CATEGORIES:
  OTT: Netflix, Prime Video, Disney+ Hotstar, Hulu, Max, Apple TV+,
       YouTube Premium, Paramount+, Peacock, ESPN+, Crunchyroll,
       SonyLIV, ZEE5, MXPlayer, Lionsgate Play, MUBI, SunNXT,
       JioCinema, Voot, ALTBalaji, Discovery+
  
  AI_IDE: GitHub Copilot, Cursor, Windsurf, ChatGPT Plus/Team,
          Claude Pro/Team, Replit, Tabnine, CodeSandbox, StackBlitz,
          JetBrains AI, Pieces, Sourcegraph Cody, Amazon CodeWhisperer
  
  TEAM_SAAS: Figma, Notion, Slack, Linear, GitHub Teams, GitLab,
             Jira, Confluence, Miro, Asana, ClickUp, Monday,
             Zoom, Microsoft Teams, Sentry, Datadog, CircleCI,
             Trello, Azure DevOps, Bitbucket

LIVE PRICING: RetailScrape API for OTT platforms
  Manual/curated for AI_IDE and TEAM_SAAS
  Refresh: OTT every 24h, others weekly via admin panel

STRIPE: UI/UX only for now — no real payment processing
  Build the pricing pages and paywall UI
  Wire Stripe integration points as TODOs

PRICING BANDS (universal thresholds):
  STEAL:      slot price < 40% of official solo price
  CHEAP:      40–65% of solo price  
  FAIR:       65–85% of solo price  ← recommended band
  AGGRESSIVE: 85–105% of solo price
  OVERPRICED: > 105% of solo price

SUBPOOL PLAN TIERS:
  Free:      1 pool hosted, join up to 3, max 4 members/pool
  Pro:       $4.99/mo — 5 pools, join unlimited, 6 members, analytics
  Host Plus: $9.99/mo — unlimited pools, 10 members, priority listing,
             auto-approve, bulk reminders, market intelligence