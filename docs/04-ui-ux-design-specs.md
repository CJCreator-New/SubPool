# SubPool UX/UI Design Specifications

## 1. Design Philosophy & Aesthetics
SubPool aims to deliver a **premium, dynamic, and extremely trustworthy** user experience. Because the platform handles financial transactions and credential sharing, building trust through design is paramount.
* **Themes:** Modern glassmorphism, subtle micro-animations, vibrant but cohesive color palettes.
* **Responsiveness:** Mobile-first approach scaling up to ultra-wide desktop displays gracefully.

## 2. Global Style Guide

### 2.1 Colors
* **Primary:** Action-oriented, vibrant color (e.g., `#C8F135` / Lime Green) for primary buttons and highlights to denote savings and financial positivity.
* **Backgrounds:** Complex dark modes utilizing deep navy or true black with subtle radial gradients to create depth.
* **Surface/Cards:** Semi-transparent varying levels of white/gray (`rgba(255, 255, 255, 0.05)`) with robust border and backdrop-blur effects (Glassmorphism).
* **Text:** High contrast white/off-white for active elements, muted grays for secondary information.

### 2.2 Typography
* **Font Family:** 'Inter', 'Outfit', or standard system sans-serif stack to maintain clean, legible reading at small sizes.
* **Hierarchy:**
    * **H1:** Bold, large (e.g., `text-4xl` or `text-5xl`), tight tracking.
    * **H2/H3:** Medium weights, used for section titles and card headers.
    * **Body:** Clean, `text-sm` or `text-base` for descriptions.

### 2.3 Animation & Motion
All interactive elements must feature micro-interactions.
* **Hover States:** Buttons and Pool Cards lift (`scale-105` or `translate-y-1`) and increase drop-shadow opacity.
* **Transitions:** 200ms-300ms ease-all standard for UI state changes.
* **Page Load:** Content should stagger in utilizing Framer Motion (`initial={{ opacity: 0, y: 20 }}`) to prevent abrupt rendering.

## 3. Component Library Specifications

### 3.1 Buttons
* **Primary Button:** Solid primary background, dark text, high rounding (`rounded-full` or `rounded-xl`). Used for main CTAs like "List a Pool".
* **Secondary Button:** Transparent background, solid border, text matches border.
* **Ghost Button:** No background or border, background appears on hover.

### 3.2 Forms & Inputs
* Inputs feature smooth borders, dark backgrounds, and clear focus rings (using the primary color).
* Validation states must use semantic colors (Red for error, Green/Primary for success) with clear helper text.

### 3.3 Cards (PoolCard)
* The core unit of the UI.
* Must display: Platform logo/Initial, Plan Name, Price per slot, Available Slots fraction, and Market comparison (e.g., "15% below market avg").
* Layout: Flexbox, usually column-oriented on mobile, grid on desktop.

## 4. UX Workflows & Wireframes
*(Conceptual Flow)*
1. **Landing/Browse View:** Infinite scroll or paginated grid of Pool Cards. A sticky top/side navigation allows filtering by Category or Platform.
2. **Pool Detail Modal:** Clicking a card opens a modal overlay (using Radix Dialog) rather than navigating away, preserving context. Contains full pool descriptions, owner trust score, and a "Request to Join" CTA.
3. **Dashboard (My Pools):** Tabs organizing "Pools I'm Hosting" vs "Pools I've Joined". Status indicators (Active, Pending) must be distinct.
