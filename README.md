# Daily 1% - Advanced Habit Transformation Platform

A comprehensive habit-tracking web app that visualizes the compound effect of 1% daily improvements with advanced social features, gamification, and personalized insights powered by Supabase.

## 🚀 Live Demo

Visit the app: [Daily 1%](https://your-username.github.io/daily-1-percent)

## ✨ Features

### Core Features
- **Single Habit Focus**: Track one habit at a time for maximum impact
- **Advanced Compound Growth Visualization**: Interactive timeline slider and 3D growth charts
- **Real-time Progress**: See exactly how much better you are than Day 1
- **Smart Milestone System**: Dynamic achievements with celebration animations
- **Reliability Scoring**: AI-powered consistency tracking with personalized insights

### Social & Community Features
- **Global Challenges**: Join community-wide habit challenges
- **Live World Map**: See real-time check-ins from users worldwide
- **Leaderboards**: Compete with friends and global community
- **Progress Sharing**: Generate beautiful progress snapshots for social media
- **Streak Competitions**: Challenge friends to streak battles

### Gamification & Motivation
- **Avatar Progression**: Visual character growth based on habit consistency
- **Achievement System**: Unlock badges, titles, and special rewards
- **Streak Recovery**: Smart setback handling with encouragement
- **Level Progression**: Advance from Novice to Master with consistent practice
- **Daily Challenges**: Bonus objectives for extra engagement

### Advanced Tracking & Analytics
- **Custom Multipliers**: Adjust growth rate based on habit intensity
- **Historical Analytics**: Deep insights into patterns and trends
- **Habit Stacking**: Connect multiple habits for compound benefits
- **Data Export**: Full data portability and backup options
- **Smart Reminders**: Personalized notification timing

### Personalization & Wellness
- **Dark/Light Modes**: Automatic theme switching based on time
- **Ambient Sounds**: Focus-enhancing background audio
- **Custom Habit Icons**: Personalize your tracking experience
- **Educational Content**: Tips, articles, and habit science insights
- **Motivational Quotes**: Daily inspiration tailored to your journey

## 🧮 The Math Behind It

The app uses the compound growth formula:
```
Improvement = (1.01^days - 1) × 100
```

### Example Growth:
- **Day 1**: 1.00% improvement
- **Day 7**: 7.21% improvement  
- **Day 30**: 34.78% improvement
- **Day 100**: 170.48% improvement
- **Day 365**: 3,678.34% improvement

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (ES6 Modules)
- **Backend**: Supabase (Authentication, Database, Real-time subscriptions)
- **Charts**: Chart.js with custom 3D visualizations
- **Storage**: Supabase PostgreSQL with real-time sync
- **Authentication**: Supabase Auth with social login support
- **Real-time**: Supabase real-time subscriptions for live features
- **PWA**: Service Worker for offline functionality
- **Deployment**: Static hosting (Vercel, Netlify, GitHub Pages)

## 📱 Setup & Installation

### Prerequisites
- Supabase account (free tier available)
- Modern web browser with ES6 module support

### Option 1: Quick Start with Supabase
1. **Clone the repository**:
```bash
git clone https://github.com/your-username/daily-1-percent.git
cd daily-1-percent
```

2. **Set up Supabase**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Follow the complete setup guide in `SUPABASE_SETUP.md`
   - Update your Supabase URL and anon key in `supabase.js`

3. **Configure the app**:
   - Update `config.js` with your settings
   - Customize feature flags as needed

4. **Deploy**:
   - Upload to your preferred static hosting platform
   - Ensure HTTPS is enabled for Supabase integration

### Option 2: Local Development
```bash
# Serve locally (required for ES6 modules)
python -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000
```

Visit `http://localhost:8000` to start tracking your 1% improvements!
```bash
git clone https://github.com/your-username/daily-1-percent.git
cd daily-1-percent
# Open index.html in your browser
```

### Option 2: Deploy to GitHub Pages
1. Fork this repository
2. Go to Settings > Pages
3. Select "Deploy from a branch" > "main"
4. Your app will be live at `https://your-username.github.io/daily-1-percent`

### Option 3: Install as PWA
1. Visit the web app in Chrome/Edge
2. Click the "Install" button in the address bar
3. Use it like a native app!

## 🎯 How to Use

### Getting Started
1. **Create Account**: Sign up with email or social login (Google, GitHub)
2. **Set Your Primary Habit**: Choose what you want to improve with custom multiplier
3. **Customize Avatar**: Select your visual progress companion
4. **Join the Community**: Explore challenges and connect with other users

### Daily Usage
1. **Check In**: Mark your daily progress with optional improvement notes
2. **Track Reliability**: Build your consistency score for better insights
3. **View Visualizations**: Explore 3D growth charts and timeline analysis
4. **Social Engagement**: Share progress, join challenges, compete on leaderboards
5. **Earn Achievements**: Unlock badges and level up your avatar

### Advanced Features
- **Habit Stacking**: Connect related habits for compound benefits
- **Smart Recovery**: Get personalized guidance after missed days
- **Data Analytics**: Deep dive into patterns and optimal timing
- **Educational Content**: Learn habit science and optimization techniques
- **Community Features**: Real-time global map and social challenges

## 🏗️ Architecture

### Modular Design
The app follows a modular ES6 architecture:

```
script.js         # Main application controller
supabase.js       # Database services and Supabase client
auth.js           # Authentication UI and flows
visualization.js  # 3D charts and timeline components
social.js         # Community features and sharing
gamification.js   # Achievements, levels, and rewards
config.js         # Environment and feature configuration
```

### Database Schema
Powered by Supabase PostgreSQL:
- **users**: Profile, reliability score, level progression
- **habits**: Custom habits with multipliers and metadata
- **checkins**: Daily progress with improvement tracking
- **achievements**: Badge system and milestone tracking
- **challenges**: Community events and competitions
- **social_shares**: Progress sharing and viral features

## 📊 Data & Privacy

### Data Storage
- All user data stored securely in Supabase
- Real-time synchronization across devices
- Complete data export available anytime
- GDPR compliant with data deletion options

### Privacy Features
- Optional anonymous mode for sensitive habits
- Granular privacy controls for social features
- Local data caching for offline functionality
- No tracking or analytics beyond core functionality
  lastCheckIn: "2023-10-16",
  history: [
    { date: "2023-10-01", status: "completed" },
    { date: "2023-10-02", status: "completed" }
  ],
  milestones: {
    7: { achieved: true, date: "2023-10-07" },
    21: { achieved: false },
    100: { achieved: false },
    365: { achieved: false }
  }
}
```

## 🌟 Growth Psychology

This app is built on proven psychological principles:

### 1. **Compound Effect**
Small, consistent actions create exponential results over time.

### 2. **Single Focus**
Tracking one habit prevents overwhelm and increases success rates.

### 3. **Visual Progress**
Seeing growth curves motivates continued action.

### 4. **Milestone Celebrations**
Regular achievements maintain motivation during the journey.

### 5. **Social Sharing**
Sharing progress creates accountability and inspires others.

## 🔧 Customization

### Modify Growth Formula
Edit the `calculateGrowth` function in `script.js`:
```javascript
function calculateGrowth(days, dailyImprovement = 1.01, consistency = 1.0) {
    const effectiveDays = days * consistency;
    return (Math.pow(dailyImprovement, effectiveDays) - 1) * 100;
}
```

### Change Milestones
Update the milestones object in `script.js`:
```javascript
milestones: {
    7: { achieved: false, date: null },    // Week
    30: { achieved: false, date: null },   // Month
    90: { achieved: false, date: null },   // Quarter
    365: { achieved: false, date: null }   // Year
}
```

### Customize Colors
Modify CSS variables in `styles.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #27ae60;
    --text-color: #2c3e50;
}
```

## 📈 Viral Growth Features

### Shareable Content
- Auto-generated progress images
- Tweet-ready achievement messages
- Embeddable progress badges

### Growth Hooks
- Daily reminders: "Your 1% awaits"
- Achievement unlocked animations
- Friend comparison via share codes

### Social Triggers
- Milestone celebration posts
- Progress comparison sliders
- "What if" scenario sharing

## ⚙️ Advanced Configuration

### Feature Flags (config.js)
```javascript
export const config = {
    features: {
        socialFeatures: true,      // Enable community features
        gamification: true,        // Badge system and levels
        advancedViz: true,         // 3D charts and timeline
        challengeSystem: true,     // Community challenges
        ambientSounds: true,       // Focus audio
        darkMode: true            // Theme switching
    },
    growth: {
        defaultMultiplier: 1.01,   // Base improvement rate
        milestones: [7, 21, 50, 100, 365], // Achievement days
        maxStreakBonus: 2.0       // Maximum streak multiplier
    }
};
```

### Custom Multipliers
Users can adjust their growth rate based on habit intensity:
- **1.005** (0.5%): Gentle habits like meditation
- **1.01** (1%): Standard improvement rate  
- **1.02** (2%): Intensive habits like fitness
- **1.03** (3%): High-challenge personal development

### Supabase Integration
Complete setup instructions available in `SUPABASE_SETUP.md`:
- Database schema and RLS policies
- Authentication configuration
- Real-time subscriptions setup
- Social features backend

## 🎮 Gamification System

### Achievement Categories
- **Consistency**: Streak-based rewards
- **Growth**: Improvement milestone badges
- **Social**: Community engagement achievements
- **Exploration**: Feature discovery rewards
- **Mastery**: Long-term dedication recognition

### Level Progression
- **Novice** (0-99 points): Getting started
- **Apprentice** (100-499 points): Building momentum
- **Practitioner** (500-1499 points): Developing mastery
- **Expert** (1500-4999 points): Advanced skills
- **Master** (5000+ points): Elite performance

## 🌍 Community Features

### Global Challenges
- Monthly habit themes
- Seasonal consistency competitions
- Community milestone events
- Collaborative goal achievement

### Social Sharing
- Progress snapshot generation
- Achievement celebration posts
- Streak milestone announcements
- Challenge completion certificates

## 📈 Advanced Analytics

### Growth Insights
- Reliability score calculation
- Optimal check-in timing analysis
- Streak pattern recognition
- Setback recovery tracking

### Predictive Features
- Success probability modeling
- Personalized milestone predictions
- Habit optimization suggestions
- Long-term trend analysis

## 🚀 Viral Growth Features

### Smart Share Generation
- **Progress Snapshots**: Beautiful, branded images showing growth curves
- **Achievement Cards**: Celebration graphics for milestone unlocks
- **Comparison Mode**: Before/after visualizations with percentage improvements
- **Timeline Exports**: Video-like progressions showing habit journey

### Social Hooks
- **Real-time World Map**: See global check-ins happening live
- **Challenge Invitations**: Invite friends to habit challenges
- **Leaderboard Climbing**: Competitive elements drive engagement
- **Streak Battles**: Head-to-head consistency competitions

### Growth Mechanisms
- **Referral Rewards**: Achievement bonuses for bringing friends
- **Social Proof**: Display community growth statistics
- **FOMO Elements**: Limited-time challenges and seasonal events
- **Success Stories**: User-generated content highlighting transformations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by James Clear's "Atomic Habits"
- Chart.js for beautiful data visualization
- Font Awesome for icons
- The compound effect philosophy

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Email: your-email@example.com
- Twitter: @yourusername

---

**Remember**: You don't have to be great to get started, but you have to get started to be great. Your 1% awaits! 🚀
