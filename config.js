// Environment Configuration
// Replace these with your actual Supabase credentials

export const config = {
  supabase: {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key-here',
  },
  app: {
    name: 'Daily 1%',
    version: '2.0.0',
    environment: 'development', // 'development' | 'production'
  },
  features: {
    authentication: true,
    socialFeatures: true,
    gamification: true,
    challenges: true,
    leaderboards: true,
    publicProfiles: true,
    ambientSounds: true,
    darkMode: true,
    dataExport: true,
  },
  ui: {
    enableAnimations: true,
    showTutorial: true,
    enableNotifications: true,
  },
  analytics: {
    enabled: false, // Set to true in production
    trackingId: '', // Add your analytics tracking ID
  },
  social: {
    shareUrl: 'https://daily1percent.app',
    hashtags: ['1PercentBetter', 'HabitTracker', 'CompoundGrowth'],
  },
};

// Validation
if (config.app.environment === 'production') {
  if (config.supabase.url.includes('your-project') || 
      config.supabase.anonKey.includes('your-anon-key')) {
    console.error('⚠️ Please update your Supabase credentials in config.js');
  }
}

export default config;
