# Post-Deployment Smoke Test Checklist

Verify the following after deployment to ensures the production build is stable.

## 📍 Navigation & Loading
- [ ] **Landing Page**: Loads at `/`.
- [ ] **Browse Page**: Loads at `/browse`.
- [ ] **Data Persistence**: Pool cards show up (even if empty, ensure no white screens).
- [ ] **Detail Modal**: Click a pool card to ensure the details modal opens correctly.

## 🔐 Authentication
- [ ] **Login Page**: `/login` loads correctly.
- [ ] **OAuth Flow**: Google/Discord OAuth redirects and returns correctly (check Supabase Auth logs).
- [ ] **Protected Routes**: Navigation to `/my-pools` should redirect to `/login` if not authenticated.

## 📱 Responsiveness
- [ ] **Mobile Layout**: Test on a real device or Chrome DevTools mobile view. 
  - [ ] Bottom navigation bar visible on mobile.
  - [ ] Sidebar collapses correctly.

## 🛠️ Console & Errors
- [ ] **Console Check**: Open DevTools and verify there are no `404` or `Uncaught ReferenceError` logs.
- [ ] **Network Tab**: Verify Supabase API calls are resolving (status `200` or `204`).

## ⚡ Performance
- [ ] **Loading States**: Verify skeletons appear briefly during data transitions.
- [ ] **Indicators**: Verify the "Using offline data" indicator appears if Supabase keys are missing or incorrect.
