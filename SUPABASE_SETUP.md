# Supabase Configuration

This file contains the configuration instructions for setting up your Supabase backend.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or sign in
3. Create a new project
4. Note down your project URL and anon public API key

### 2. Update Supabase Configuration

In `supabase.js`, replace the placeholder values:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
```

### 3. Set up Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  username VARCHAR UNIQUE,
  avatar_url TEXT,
  reliability_score INTEGER DEFAULT 0,
  level VARCHAR DEFAULT 'Novice',
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Habits table
CREATE TABLE public.habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  multiplier DECIMAL DEFAULT 1.01,
  icon VARCHAR,
  color VARCHAR,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Checkins table
CREATE TABLE public.checkins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  improvement_percent DECIMAL,
  streak_day INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, habit_id, date)
);

-- Milestones table
CREATE TABLE public.milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
  days INTEGER NOT NULL,
  achieved BOOLEAN DEFAULT FALSE,
  achieved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Achievements table
CREATE TABLE public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  icon VARCHAR,
  unlocked_at TIMESTAMP DEFAULT NOW()
);

-- Challenges table
CREATE TABLE public.challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  participant_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Challenge participants table
CREATE TABLE public.challenge_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Public profiles table
CREATE TABLE public.public_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  username VARCHAR NOT NULL,
  bio TEXT,
  streak_count INTEGER DEFAULT 0,
  total_days INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  share_code VARCHAR UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity feed table
CREATE TABLE public.activity_feed (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type VARCHAR NOT NULL,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Set up Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Habits policies
CREATE POLICY "Users can manage own habits" ON public.habits FOR ALL USING (auth.uid() = user_id);

-- Checkins policies
CREATE POLICY "Users can manage own checkins" ON public.checkins FOR ALL USING (auth.uid() = user_id);

-- Milestones policies
CREATE POLICY "Users can manage own milestones" ON public.milestones FOR ALL USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can manage own achievements" ON public.achievements FOR ALL USING (auth.uid() = user_id);

-- Challenges policies
CREATE POLICY "Anyone can view challenges" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Users can create challenges" ON public.challenges FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Challenge participants policies
CREATE POLICY "Users can join challenges" ON public.challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view challenge participants" ON public.challenge_participants FOR SELECT USING (true);

-- Public profiles policies
CREATE POLICY "Anyone can view public profiles" ON public.public_profiles FOR SELECT USING (is_public = true);
CREATE POLICY "Users can manage own public profile" ON public.public_profiles FOR ALL USING (auth.uid() = user_id);

-- Activity feed policies
CREATE POLICY "Users can view own activity" ON public.activity_feed FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON public.activity_feed FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 5. Create Database Functions

```sql
-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update user's updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
```

### 6. Set Up Row Level Security (RLS) Policies

For security, you need to enable RLS and create policies. Run these SQL commands in the SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Habit policies
CREATE POLICY "Users can manage own habits" ON habits
    FOR ALL USING (auth.uid() = user_id);

-- Checkin policies
CREATE POLICY "Users can manage own checkins" ON checkins
    FOR ALL USING (auth.uid() = user_id);

-- Milestone policies
CREATE POLICY "Users can manage own milestones" ON milestones
    FOR ALL USING (auth.uid() = user_id);

-- Public profile policies
CREATE POLICY "Users can manage own public profile" ON public_profiles
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public profiles" ON public_profiles
    FOR SELECT USING (is_public = true);

-- Social share policies
CREATE POLICY "Users can manage own social shares" ON social_shares
    FOR ALL USING (auth.uid() = user_id);

-- Challenge policies
CREATE POLICY "Anyone can view global challenges" ON challenges
    FOR SELECT USING (is_global = true);
CREATE POLICY "Users can create challenges" ON challenges
    FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can manage own challenges" ON challenges
    FOR ALL USING (auth.uid() = created_by);

-- Challenge participant policies
CREATE POLICY "Users can manage own challenge participation" ON challenge_participants
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view challenge participants" ON challenge_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM challenges 
            WHERE challenges.id = challenge_participants.challenge_id 
            AND challenges.is_global = true
        )
    );
```

### 7. Enable Authentication

In your Supabase dashboard:

1. Go to Authentication > Settings
2. Enable Email confirmations (optional)
3. Configure OAuth providers (Google, GitHub, etc.) if desired
4. Set up custom SMTP (optional)

### 8. Environment Variables (for production)

Create a `.env` file (don't commit to git):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features Enabled

With this setup, your app will have:

- ✅ User authentication (email/password + OAuth)
- ✅ Habit tracking with persistence
- ✅ Milestone tracking
- ✅ Social challenges
- ✅ Public profiles
- ✅ Achievement system
- ✅ Real-time updates
- ✅ Data export/import
- ✅ Leaderboards
- ✅ Activity feeds

## Testing

1. Start your development server
2. Create a new account
3. Add a habit and start tracking
4. Test all features

## Production Deployment

1. Replace placeholder Supabase credentials with your real ones
2. Deploy to your hosting platform (Netlify, Vercel, etc.)
3. Add your production domain to Supabase's site URL settings
4. Test thoroughly

## Security Notes

- Never commit your Supabase credentials to version control
- Use environment variables in production
- Review RLS policies for your use case
- Enable 2FA on your Supabase account
- Regularly update your Supabase instance
