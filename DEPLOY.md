# Deployment Guide: SubPool

This application is built with Vite and React, optimized for deployment on **Vercel**.

## 🚀 Option A: Vercel CLI (Fastest)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Initialize Deployment**:
   Run this in the project root:
   ```bash
   vercel
   ```
   - *Follow prompts: Framework = Vite, Link to existing project? No, Root directory = ./*

4. **Add Environment Variables**:
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

---

## 🌐 Option B: Vercel Dashboard

1. **Push to GitHub/GitLab/Bitbucket**.
2. Go to [vercel.com](https://vercel.com) and click **New Project**.
3. **Import** your repository.
4. **Project Settings**:
   - Framework Preset: **Vite** (should be auto-detected).
   - Root Directory: `./`
5. **Environment Variables**:
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
6. Click **Deploy**.

---

## 🔐 Post-Deployment: Supabase Configuration

After your app is live (e.g., `https://subpool.vercel.app`), you **must** update your Supabase Auth settings to allow logins from the production URL.

1. Go to your **Supabase Dashboard** → **Auth** → **URL Configuration**.
2. Update **Site URL**:
   `https://your-app.vercel.app`
3. Update **Redirect URLs** (add these):
   `https://your-app.vercel.app/browse`
   `https://your-app.vercel.app/dashboard`

---

## 🧪 Smoke Test

Once deployed, follow the checklist in `scripts/smoke-test.md` to verify everything is working correctly.
