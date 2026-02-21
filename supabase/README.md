# Supabase Setup Guide for SubPool

Follow these steps to connect your SubPool instance to a live Supabase database.

## 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Wait for the database to be provisioned.

## 2. Configure Environment Variables
1. In the Supabase dashboard, go to **Project Settings** -> **API**.
2. Copy the **Project URL** and the **anon public API key**.
3. Create a `.env.local` file in the root of your project (or update the existing one):
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## 3. Apply Schema
1. In the Supabase dashboard, go to the **SQL Editor**.
2. Click **New Query**.
3. Copy the contents of `supabase/schema.sql` and paste them into the editor.
4. Click **Run**.
5. Verify that all tables were created in the **Table Editor**.

## 4. Enable Google OAuth
1. Go to **Authentication** -> **Providers**.
2. Enable **Google**.
3. Follow the Supabase documentation to set up the Google Client ID and Secret (from Google Cloud Console).
4. Add the redirect URL: `http://localhost:5173`.

## 5. Start Development
1. Restart your development server:
   ```bash
   npm run dev
   ```
2. Your application will now detect the Supabase environment variables and start using live data (with mock fallback if connection fails).
3. Click **"Continue with Google"** on the login page to test the authentication flow.
