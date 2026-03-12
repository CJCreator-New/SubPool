# SubPool End-User and Administrator Guides

## 1. End-User Manual

### 1.1 Getting Started
Welcome to SubPool, the secure platform for sharing digital subscription costs.
**Signing Up:** Navigate to the top right and click "Log In". We support passwordless email magic links. After clicking the link sent to your email, you will be authenticated and asked to set up a display name and avatar color in your Profile.

### 1.2 Browsing and Joining Pools
**Find a Pool:** Go to the Browse page (`/browse`). Use the search bar to find specific services like "Netflix 4K" or "ChatGPT".
**Understanding Statistics:** We provide "Market Intelligence" on every pool card so you know if you are getting a good deal compared to the average slice price.
**Joining:** Click on a Pool Card to open the details modal. Click the "Request to Join" button. If the pool is set to "auto_approve", you're instantly in!

### 1.3 Hosting a Pool
Have an extra seat on your Spotify Family plan?
1. Click the glowing "List a Pool" button.
2. Select the platform from the drop-down.
3. Enter the total number of slots available (excluding yourself).
4. Enter the price per slot.
5. Set `auto_approve` if you don't want to manually vet members.

### 1.4 Communication
Navigate to your Dashboard -> "My Pools". Click on any active pool to open the Real-Time Chat interface. Here you can safely communicate with the Host to receive login credentials.

## 2. Administrator Guide (SubPool Staff)

### 2.1 Managing Platform Pricing
SubPool Admins need to seed new platforms for the UI dropdowns and to establish baseline official pricing.
* Access the backend Supabase Dashboard.
* Navigate to the Table Editor > `platform_pricing`.
* Add new platforms manually (e.g., `hulu`, `Hulu`, `OTT`, `No Ads`, `17.99`).

### 2.2 User Moderation & Disputes
If a user is reported for fraudulent listings:
1. Locate their UUID in the `profiles` table.
2. Change the `is_verified` flag to `false`.
3. If necessary, suspend the account by utilizing Supabase Auth admin controls (Ban User).

### 2.3 Troubleshooting Common Issues
**Symptom:** "I requested to join a pool but my dashboard is empty."
**Resolution:** Advise the user that their membership status is `pending` and the owner must approve them. Instruct them to check the "Requests" tab in their Dashboard.
