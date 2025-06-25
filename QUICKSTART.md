# Quick Start Guide - Daily 1%

Get your advanced habit tracker running in under 10 minutes!

## 🚀 Option 1: Instant Demo (No Setup)

1. **Download the project files**
2. **Start the test server**:
   ```bash
   cd daily-1-percent
   python test-server.py
   ```
3. **Open browser**: http://localhost:8000
4. **Create account**: Sign up with any email (use demo mode)

> **Note**: Demo mode uses local storage. For full features, follow Option 2.

## ⚡ Option 2: Full Setup with Supabase (10 minutes)

### Step 1: Supabase Backend (5 minutes)
1. **Create account**: Go to [supabase.com](https://supabase.com) → "Start your project"
2. **New project**: 
   - Name: "daily-1-percent"
   - Database password: (create a strong password)
   - Region: (choose closest to you)
3. **Setup database**: 
   - Go to SQL Editor
   - Copy-paste the schema from `SUPABASE_SETUP.md`
   - Click "Run"
4. **Get credentials**:
   - Go to Settings → API
   - Copy "Project URL" and "anon public" key

### Step 2: Configure App (2 minutes)
1. **Update supabase.js**:
   ```javascript
   // Replace lines 4-5 with your credentials:
   const supabaseUrl = 'https://your-project.supabase.co';
   const supabaseKey = 'your-anon-key-here';
   ```

2. **Start development server**:
   ```bash
   python test-server.py
   ```

### Step 3: Test Everything (3 minutes)
1. **Open app**: http://localhost:8000
2. **Sign up**: Create your account
3. **Create habit**: Set your first 1% improvement goal
4. **Check in**: Mark your first day complete
5. **Explore**: Try the social features, achievements, and visualizations

## 🌐 Option 3: Deploy to Production (5 minutes)

### Quick Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (from project directory)
vercel --prod

# Follow prompts and get instant URL
```

### Or Deploy to Netlify
1. Zip your project folder
2. Go to [netlify.com/drop](https://netlify.com/drop)
3. Drag and drop your zip file
4. Get instant URL

## 🎯 First Steps After Setup

### 1. Create Your Habit (1 minute)
- Choose something small and achievable
- Examples: "Read 1 page", "Do 5 pushups", "Meditate 2 minutes"
- Set realistic multiplier (1.01 for beginners)

### 2. Customize Your Experience
- **Avatar**: Choose your progress companion
- **Theme**: Try dark mode for evening tracking
- **Notifications**: Set up daily reminders

### 3. Join the Community
- **Challenges**: Join your first community challenge
- **Leaderboard**: See how you rank globally
- **Share**: Post your first milestone achievement

## 🔧 Troubleshooting Quick Fixes

### "Module not found" errors:
```bash
# Ensure you're using a proper HTTP server:
python test-server.py
# NOT: just opening index.html in browser
```

### Supabase connection issues:
1. Double-check your URL and key in `supabase.js`
2. Ensure HTTPS is enabled in browser
3. Check Supabase dashboard for any errors

### Page won't load:
1. Check browser console for errors (F12)
2. Verify all files are in the correct directory
3. Try a different browser or incognito mode

## 📱 Mobile Setup

### Install as PWA:
1. Open the app in Chrome/Safari on mobile
2. Look for "Add to Home Screen" option
3. Use like a native app!

## 🎮 Feature Tour

Once everything is running, explore these features:

### Basic Features (Day 1)
- ✅ Daily check-ins
- 📊 Growth visualization  
- 🎯 Milestone tracking
- 📱 Mobile-friendly interface

### Advanced Features (Week 1)
- 🏆 Achievement system
- 🌍 Global community map
- 📈 Reliability scoring
- 🎨 Theme customization

### Pro Features (Month 1)
- 📊 Advanced analytics
- 🤝 Social challenges
- 🎯 Habit stacking
- 📈 Predictive insights

## 💡 Pro Tips

### For Maximum Success:
1. **Start Small**: 1% is literally 1% - keep it tiny
2. **Be Consistent**: Better to do something small daily than big occasionally
3. **Track Everything**: The app learns your patterns to help you improve
4. **Join Challenges**: Community accountability accelerates progress
5. **Celebrate Wins**: Every milestone matters in the compound journey

### Power User Shortcuts:
- **Keyboard**: Space bar for quick check-in
- **Widgets**: Bookmark the check-in URL for instant access
- **Automation**: Set calendar reminders for consistency
- **Data Export**: Download your progress regularly for backup

## 🆘 Need Help?

### Resources:
- **Full Documentation**: See `README.md`
- **Setup Issues**: Check `SUPABASE_SETUP.md`
- **Deployment**: Follow `DEPLOY.md`
- **Testing**: Use `TESTING.md` checklist

### Community:
- **GitHub Issues**: Report bugs or request features
- **Discord**: Join our community (link in README)
- **Email**: support@daily1percent.com

---

**Remember**: The compound effect is real. Small improvements, tracked consistently, create extraordinary results. Your 1% journey starts today! 🚀
