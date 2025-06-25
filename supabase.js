// Supabase Configuration and Database Management
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://iifydyhlgintkvwvrjrt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZnlkeWhsZ2ludGt2d3ZyanJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjYyNjMsImV4cCI6MjA2NjQwMjI2M30.3UbbhJX6yY6-3e_wU65brc2Uf2ZlKuf7w-LUQhmdihA';
const supabase = createClient(supabaseUrl, supabaseKey);

// Database Schema Setup
/*
-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
CREATE TABLE habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  multiplier DECIMAL DEFAULT 1.01,
  icon VARCHAR,
  color VARCHAR,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Checkins table
CREATE TABLE checkins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  improvement_percent DECIMAL,
  streak_day INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, habit_id, date)
);

-- Milestones table
CREATE TABLE milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  milestone_day INTEGER NOT NULL,
  achieved_at TIMESTAMP DEFAULT NOW(),
  shared BOOLEAN DEFAULT FALSE
);

-- Challenges table
CREATE TABLE challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_global BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Challenge participants table
CREATE TABLE challenge_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Public profiles table
CREATE TABLE public_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  public_url VARCHAR UNIQUE,
  is_public BOOLEAN DEFAULT FALSE,
  show_streak BOOLEAN DEFAULT TRUE,
  show_chart BOOLEAN DEFAULT TRUE,
  custom_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Social shares table
CREATE TABLE social_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  share_type VARCHAR NOT NULL, -- 'milestone', 'progress', 'challenge'
  platform VARCHAR, -- 'twitter', 'facebook', 'linkedin'
  shared_at TIMESTAMP DEFAULT NOW()
);
*/

// Authentication functions
export const authService = {
  // Sign up with email
  async signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    });
    
    if (data.user) {
      // Create user profile
      await this.createUserProfile(data.user.id, email, username);
    }
    
    return { data, error };
  },

  // Sign in with email
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign in with Google
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser() {
    return supabase.auth.getUser();
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Create user profile
  async createUserProfile(userId, email, username) {
    try {
      // Check if profile already exists - handle potential table issues
      let existingProfile = null;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .maybeSingle();
        
        if (data) {
          console.log('User profile already exists');
          return { data, error: null };
        }
      } catch (checkError) {
        console.log('Error checking existing profile (table may not exist):', checkError);
        // Continue to attempt creation
      }

      // Create new profile - handle potential database issues gracefully
      try {
        const { data, error } = await supabase
          .from('users')
          .upsert([
            {
              id: userId,
              email: email,
              username: username || email.split('@')[0], // Use email prefix if no username
              reliability_score: 0,
              level: 'Novice',
              total_points: 0
            }
          ], {
            onConflict: 'id'
          })
          .select()
          .single();
          
        if (error) {
          console.error('Error creating user profile:', error);
          // Handle specific database errors gracefully
          if (error.code === '23505' || error.code === '409') {
            // Duplicate key - user already exists, that's fine
            return { data: { id: userId }, error: null };
          }
          if (error.code === 'PGRST106' || error.message.includes('406')) {
            // Table not accessible - log warning but continue
            console.warn('Users table not accessible. Continuing without profile creation.');
            return { data: { id: userId }, error: null };
          }
          return { data: null, error };
        }
        
        console.log('User profile created successfully:', data);
        return { data, error: null };
      } catch (createError) {
        console.error('Exception creating profile:', createError);
        // For development, continue without profile if there are database issues
        return { data: { id: userId }, error: null };
      }
    } catch (err) {
      console.error('Exception in createUserProfile:', err);
      // If it's just a duplicate error, that's okay - user exists
      if (err.code === '23505' || err.code === '409') {
        return { data: { id: userId }, error: null };
      }
      // For development purposes, return success even if profile creation fails
      return { data: { id: userId }, error: null };
    }
  }
};

// Habit Service
export const habitService = {
  async createHabit(userId, habitData) {
    const { data, error } = await supabase
      .from('habits')
      .insert([{
        user_id: userId,
        name: habitData.name,
        multiplier: habitData.multiplier || 1.01,
        icon: habitData.icon,
        color: habitData.color,
        is_active: true
      }])
      .select();
    return { data, error };
  },

  async getUserHabits(userId) {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);
    return data || [];
  },

  async updateHabit(habitId, updates) {
    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', habitId)
      .select();
    return { data, error };
  }
};

// Checkin Service
export const checkinService = {
  async createCheckin(userId, habitId, checkinData) {
    const { data, error } = await supabase
      .from('checkins')
      .insert([{
        user_id: userId,
        habit_id: habitId,
        date: checkinData.date || new Date().toISOString().split('T')[0],
        improvement_percent: checkinData.improvement_percent,
        streak_day: checkinData.streak_day
      }])
      .select();
    return { data, error };
  },

  async getHabitCheckins(habitId) {
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('habit_id', habitId)
      .order('date', { ascending: false });
    return data || [];
  },

  async getUserCheckins(userId) {
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    return data || [];
  }
};

// Milestone Service
export const milestoneService = {
  async createMilestone(userId, habitId, milestoneData) {
    const { data, error } = await supabase
      .from('milestones')
      .insert([{
        user_id: userId,
        habit_id: habitId,
        days: milestoneData.days,
        achieved_at: new Date().toISOString(),
        improvement_percent: milestoneData.improvement_percent
      }])
      .select();
    return { data, error };
  },

  async getUserMilestones(userId) {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false });
    return data || [];
  },

  async getHabitMilestones(habitId) {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('habit_id', habitId)
        .order('days', { ascending: true });
      
      if (error) {
        console.error('Error fetching habit milestones:', error);
        return []; // Return empty array on error
      }
      
      return data || [];
    } catch (error) {
      console.error('Exception in getHabitMilestones:', error);
      return []; // Return empty array on exception
    }
  }
};

// Challenge Service
export const challengeService = {
  async getChallenges() {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        // Removed .eq('is_active', true) to support existing schema
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching challenges:', error);
        return []; // Return empty array on error
      }
      
      return data || [];
    } catch (error) {
      console.error('Exception in getChallenges:', error);
      return []; // Return empty array on exception
    }
  },

  async joinChallenge(userId, challengeId) {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .insert([{
          user_id: userId,
          challenge_id: challengeId,
          joined_at: new Date().toISOString()
        }])
        .select();
      return { data, error };
    } catch (error) {
      console.error('Exception in joinChallenge:', error);
      return { data: null, error };
    }
  }
};

// Profile Service
export const profileService = {
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select();
    return { data, error };
  }
};

// Real-time subscriptions
export const realtimeService = {
  // Subscribe to global check-ins for live map
  subscribeToGlobalCheckins(callback) {
    return supabase
      .channel('global-checkins')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'checkins'
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to user's milestones
  subscribeToUserMilestones(userId, callback) {
    return supabase
      .channel(`user-milestones-${userId}`)
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'milestones',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to challenge updates
  subscribeToChallengeUpdates(challengeId, callback) {
    return supabase
      .channel(`challenge-${challengeId}`)
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'challenge_participants',
          filter: `challenge_id=eq.${challengeId}`
        },
        callback
      )
      .subscribe();
  }
};

// Combined database service for easier importing
export const dbService = {
  auth: authService,
  habit: habitService,
  checkin: checkinService,
  milestone: milestoneService,
  challenge: challengeService,
  profile: profileService,
  realtime: realtimeService,
  
  // Additional helper methods for social features
  async getChallenges() {
    try {
      return await challengeService.getChallenges();
    } catch (error) {
      console.error('Error in dbService.getChallenges:', error);
      return []; // Return empty array as fallback
    }
  },
  
  async getGlobalCheckins(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('checkins')
        .select(`
          *,
          habits(name),
          users(username, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      return data || [];
    } catch (error) {
      console.error('Error in dbService.getGlobalCheckins:', error);
      return []; // Return empty array as fallback
    }
  },
  
  async getHabitMilestones(habitId) {
    try {
      return await milestoneService.getHabitMilestones(habitId);
    } catch (error) {
      console.error('Error in dbService.getHabitMilestones:', error);
      return []; // Return empty array as fallback
    }
  },
  
  // Analytics for gamification
  async getUserAnalytics(userId) {
    try {
      // Stub: return empty analytics by default
      return {};
    } catch (error) {
      console.error('Error in dbService.getUserAnalytics:', error);
      return {};
    }
  },

  // Direct access to supabase client
  client: supabase
};

// Export the supabase client directly
export { supabase };

export default supabase;
