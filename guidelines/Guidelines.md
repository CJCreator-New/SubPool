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