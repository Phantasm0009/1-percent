-- =============================================
-- FINAL DATABASE SCHEMA FIX FOR DAILY 1% APP
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CREATE TABLES
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR,
  username VARCHAR UNIQUE,
  avatar_url TEXT,
  reliability_score INTEGER DEFAULT 0,
  level VARCHAR DEFAULT 'Novice',
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habits table
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  multiplier DECIMAL DEFAULT 1.01,
  icon VARCHAR,
  color VARCHAR,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checkins table
CREATE TABLE IF NOT EXISTS public.checkins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  improvement_percent DECIMAL,
  streak_day INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, habit_id, date)
);

-- Milestones table
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  days INTEGER NOT NULL,
  improvement_percent DECIMAL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  icon VARCHAR,
  category VARCHAR,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge participants table
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- =============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. CREATE RLS POLICIES
-- =============================================

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Habits table policies
DROP POLICY IF EXISTS "Users can manage own habits" ON public.habits;
CREATE POLICY "Users can manage own habits" ON public.habits
    FOR ALL USING (auth.uid() = user_id);

-- Checkins table policies
DROP POLICY IF EXISTS "Users can manage own checkins" ON public.checkins;
CREATE POLICY "Users can manage own checkins" ON public.checkins
    FOR ALL USING (auth.uid() = user_id);

-- Milestones table policies
DROP POLICY IF EXISTS "Users can manage own milestones" ON public.milestones;
CREATE POLICY "Users can manage own milestones" ON public.milestones
    FOR ALL USING (auth.uid() = user_id);

-- Achievements table policies
DROP POLICY IF EXISTS "Users can manage own achievements" ON public.achievements;
CREATE POLICY "Users can manage own achievements" ON public.achievements
    FOR ALL USING (auth.uid() = user_id);

-- Challenges table policies (public read, authenticated users can create)
DROP POLICY IF EXISTS "Anyone can view active challenges" ON public.challenges;
CREATE POLICY "Anyone can view active challenges" ON public.challenges
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can create challenges" ON public.challenges;
CREATE POLICY "Authenticated users can create challenges" ON public.challenges
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage own challenges" ON public.challenges;
CREATE POLICY "Users can manage own challenges" ON public.challenges
    FOR ALL USING (auth.uid() = created_by);

-- Challenge participants policies
DROP POLICY IF EXISTS "Users can manage own challenge participation" ON public.challenge_participants;
CREATE POLICY "Users can manage own challenge participation" ON public.challenge_participants
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON public.checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_habit_id ON public.checkins(habit_id);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON public.checkins(date);
CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON public.milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_habit_id ON public.milestones(habit_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON public.challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON public.challenge_participants(challenge_id);

-- =============================================
-- 5. CREATE FUNCTIONS FOR AUTOMATIC UPDATES
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_habits_updated_at ON public.habits;
CREATE TRIGGER update_habits_updated_at
    BEFORE UPDATE ON public.habits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. GRANT PERMISSIONS
-- =============================================

-- Grant access to authenticated users
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.habits TO authenticated;
GRANT ALL ON public.checkins TO authenticated;
GRANT ALL ON public.milestones TO authenticated;
GRANT ALL ON public.achievements TO authenticated;
GRANT ALL ON public.challenges TO authenticated;
GRANT ALL ON public.challenge_participants TO authenticated;

-- Grant access to anonymous users (for public features)
GRANT SELECT ON public.challenges TO anon;

-- =============================================
-- 7. INSERT SAMPLE DATA (OPTIONAL)
-- =============================================

-- Insert sample challenges
INSERT INTO public.challenges (title, description, start_date, end_date, is_active) 
VALUES 
    ('January Consistency Challenge', 'Maintain your habit for all 31 days of January', '2025-01-01', '2025-01-31', true),
    ('30-Day Streak Master', 'Build a perfect 30-day streak', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true),
    ('Weekend Warrior', 'Never miss a weekend check-in', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', true)
ON CONFLICT DO NOTHING;

-- =============================================
-- SETUP COMPLETE!
-- =============================================

-- Verify tables were created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'habits', 'checkins', 'milestones', 'achievements', 'challenges', 'challenge_participants')
ORDER BY table_name;
