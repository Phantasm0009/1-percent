# Supabase Authentication & Google Login Fix

## Issues to Fix

### 1. 401 Unauthorized Error on Users Table
The 401 error occurs because Row Level Security (RLS) is enabled on the users table but no policies are defined to allow access.

### 2. Google Login Integration
Google OAuth provider needs to be enabled in Supabase dashboard.

## Solution Steps

### Step 1: Fix Database RLS Policies

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Enable RLS on habits table
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own habits
CREATE POLICY "Users can manage own habits" ON habits
    FOR ALL USING (auth.uid() = user_id);

-- Enable RLS on checkins table  
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own checkins
CREATE POLICY "Users can manage own checkins" ON checkins
    FOR ALL USING (auth.uid() = user_id);

-- Enable RLS on milestones table
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own milestones
CREATE POLICY "Users can manage own milestones" ON milestones
    FOR ALL USING (auth.uid() = user_id);

-- Enable RLS on public_profiles table
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own public profile
CREATE POLICY "Users can manage own public profile" ON public_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Allow anyone to read public profiles that are marked as public
CREATE POLICY "Anyone can view public profiles" ON public_profiles
    FOR SELECT USING (is_public = true);

-- Enable RLS on social_shares table
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own social shares
CREATE POLICY "Users can manage own social shares" ON social_shares
    FOR ALL USING (auth.uid() = user_id);

-- Enable RLS on challenge_participants table
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own challenge participation
CREATE POLICY "Users can manage own challenge participation" ON challenge_participants
    FOR ALL USING (auth.uid() = user_id);

-- Allow anyone to read challenge participants for public challenges
CREATE POLICY "Anyone can view challenge participants" ON challenge_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM challenges 
            WHERE challenges.id = challenge_participants.challenge_id 
            AND challenges.is_global = true
        )
    );

-- Enable RLS on challenges table
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read global challenges
CREATE POLICY "Anyone can view global challenges" ON challenges
    FOR SELECT USING (is_global = true);

-- Allow users to create challenges
CREATE POLICY "Users can create challenges" ON challenges
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Allow users to manage challenges they created
CREATE POLICY "Users can manage own challenges" ON challenges
    FOR ALL USING (auth.uid() = created_by);
```

### Step 2: Enable Google OAuth in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `iifydyhlgintkvwvrjrt`
3. Go to **Authentication** → **Providers**
4. Find **Google** and click **Enable**
5. You'll need to set up Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth client ID**
   - Set Application type to **Web application**
   - Add authorized redirect URIs:
     - `https://iifydyhlgintkvwvrjrt.supabase.co/auth/v1/callback`
     - `http://localhost:8000` (for development)
   - Copy the Client ID and Client Secret
6. Back in Supabase, paste the Google Client ID and Client Secret
7. Save the configuration

### Step 3: Update Environment Variables (Optional)

If you want to use environment variables instead of hardcoded values:

```env
VITE_SUPABASE_URL=https://iifydyhlgintkvwvrjrt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZnlkeWhsZ2ludGt2d3ZyanJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjYyNjMsImV4cCI6MjA2NjQwMjI2M30.3UbbhJX6yY6-3e_wU65brc2Uf2ZlKuf7w-LUQhmdihA
```

### Step 4: Test the Fix

1. Try signing up with email/password - should work without 401 errors
2. Try Google login - should redirect to Google OAuth and back
3. Check browser console for any remaining errors

## Expected Results

After implementing these fixes:
- ✅ No more 401 Unauthorized errors when accessing users table
- ✅ Google login button works and redirects properly
- ✅ User profiles are created and accessible
- ✅ All authenticated features work correctly

## Troubleshooting

### If Google Login Still Doesn't Work:
1. Check browser console for OAuth errors
2. Verify redirect URI matches exactly in Google Console
3. Ensure Google+ API is enabled in Google Cloud Console
4. Check Supabase logs in the Dashboard

### If 401 Errors Persist:
1. Verify RLS policies were applied correctly
2. Check if auth.uid() is returning the correct user ID
3. Ensure user is properly authenticated before making requests

## Security Notes

- RLS policies ensure users can only access their own data
- Public challenges and profiles are accessible to all users
- Google OAuth provides secure third-party authentication
- All sensitive operations require proper authentication
