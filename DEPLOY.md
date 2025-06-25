# Daily 1% - Production Deployment Guide

## Prerequisites

### 1. Supabase Setup (Required)
Before deploying, you must set up your Supabase backend:

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Note your project URL and anon key

2. **Setup Database**:
   - Follow the complete guide in `SUPABASE_SETUP.md`
   - Run all SQL commands in the Supabase SQL editor
   - Enable Row Level Security (RLS)
   - Configure authentication providers

3. **Update Configuration**:
   - Replace placeholders in `supabase.js` with your actual credentials
   - Update `config.js` with your environment settings
   - Ensure all feature flags are set correctly

### 2. Environment Configuration
```javascript
// In supabase.js - Replace with your values:
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key-here';
```

## Deployment Options

### Option 1: Vercel (Recommended)
Vercel provides excellent support for static sites with edge functions.

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
cd daily-1-percent
vercel --prod
```

3. **Configure Environment**:
   - Add your Supabase credentials in Vercel dashboard
   - Set up custom domain if needed
   - Enable automatic deployments from GitHub

### Option 2: Netlify
Great for static sites with serverless functions.

1. **Drag and Drop**: Upload folder to [netlify.com/drop](https://netlify.com/drop)
2. **Or use Git**: Connect your GitHub repository
3. **Configure**: Add environment variables in Netlify dashboard
4. **Deploy**: Automatic builds on git push

### Option 3: GitHub Pages
Free hosting for public repositories.

1. **Create Repository**:
```bash
git init
git add .
git commit -m "feat: Daily 1% habit tracker with Supabase"
git branch -M main
git remote add origin https://github.com/yourusername/daily-1-percent.git
git push -u origin main
```

2. **Enable Pages**:
   - Repository Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: "main"
   - Folder: "/ (root)"

3. **Configure HTTPS**: Ensure "Enforce HTTPS" is enabled (required for Supabase)

⚠️ **Important**: GitHub Pages requires HTTPS for Supabase integration to work properly.

### Option 4: Cloudflare Pages
Fast global CDN with excellent performance.

1. **Connect Repository**: Link your GitHub repo in Cloudflare Pages
2. **Build Settings**: Use default static site settings
3. **Environment Variables**: Add Supabase credentials
4. **Deploy**: Automatic builds and deployments

## Custom Domain (Optional)

### GitHub Pages
1. Add `CNAME` file with your domain
2. Configure DNS to point to GitHub Pages

### Example CNAME file:
```
daily1percent.com
```

## Environment Setup

No environment variables needed - everything runs client-side!

## Performance Tips

- All assets are cached by Service Worker
- Chart.js loaded from CDN for better caching
- Minimal dependencies for fast loading
- Mobile-first responsive design

## Troubleshooting

### Service Worker Issues
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear cache in DevTools

### GitHub Pages Not Loading
- Check repository name matches URL
- Ensure `index.html` is in root directory
- Wait 5-10 minutes for first deployment

### PWA Installation Issues
- Ensure HTTPS (GitHub Pages provides this)
- Check manifest.json is accessible
- Use Chrome/Edge for best PWA support

## Local Development Setup

### Development Server
Use the included test server for local development:

```bash
# Navigate to project directory
cd daily-1-percent

# Start development server
python test-server.py

# Or specify custom port
python test-server.py 3000
```

**Alternative servers**:
```bash
# Node.js
npx serve . -p 8000

# Python (if test-server.py doesn't work)
python -m http.server 8000

# PHP
php -S localhost:8000

# Live Server (VS Code extension)
# Right-click index.html → "Open with Live Server"
```

### Environment Variables

For production deployments, set these environment variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Feature Flags (optional)
ENABLE_SOCIAL_FEATURES=true
ENABLE_GAMIFICATION=true
ENABLE_ANALYTICS=false
```

## Performance Optimization

### 1. Image Optimization
```bash
# Optimize SVG icons (if you add more)
npx svgo --folder=assets/icons

# Generate different sized favicons
# Use https://realfavicongenerator.net/
```

### 2. JavaScript Minification
For production, consider minifying your JavaScript:

```bash
# Install terser
npm install -g terser

# Minify each module
terser script.js -o script.min.js -c -m
terser supabase.js -o supabase.min.js -c -m
# ... repeat for other modules
```

### 3. CSS Optimization
```bash
# Install cssnano
npm install -g cssnano-cli

# Minify CSS
cssnano styles.css styles.min.css
```

### 4. Bundle Analysis
Monitor your bundle size:

```bash
# Check gzipped size
gzip -c script.js | wc -c
gzip -c styles.css | wc -c
```

## Security Configuration

### 1. Supabase Security
- ✅ Enable RLS (Row Level Security) on all tables
- ✅ Configure proper authentication policies
- ✅ Use environment variables for sensitive keys
- ✅ Enable HTTPS/TLS for all API calls

### 2. Content Security Policy (CSP)
Add to your HTML `<head>`:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.skypack.dev https://*.supabase.co;
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  img-src 'self' data: https:;
  font-src 'self' data:;
">
```

### 3. HTTPS Configuration
Ensure your deployment platform enforces HTTPS:

- **Vercel**: HTTPS by default
- **Netlify**: Enable "Force HTTPS" in site settings
- **GitHub Pages**: Check "Enforce HTTPS" in repository settings
- **Cloudflare**: Enable "Always Use HTTPS"

## Custom Domain Setup

### 1. DNS Configuration
Point your domain to your hosting platform:

**Vercel**:
```
CNAME: www.yourdomain.com → cname.vercel-dns.com
A: yourdomain.com → 76.76.19.61
```

**Netlify**:
```
CNAME: www.yourdomain.com → your-site.netlify.app
A: yourdomain.com → 75.2.60.5
```

**GitHub Pages**:
```
CNAME: www.yourdomain.com → yourusername.github.io
A: yourdomain.com → 185.199.108.153
```

### 2. SSL Certificate
Most platforms provide automatic SSL certificates. Verify HTTPS works before launch.

## Monitoring & Analytics

### 1. Error Monitoring
Add error tracking (optional):

```javascript
// Add to your main script.js
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Optional: Send to monitoring service
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Optional: Send to monitoring service
});
```

### 2. Performance Monitoring
Monitor Core Web Vitals:

```javascript
// Add to script.js for performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Backup & Maintenance

### 1. Data Backup
Supabase provides automatic backups, but you can also:
- Export user data regularly
- Backup database schema
- Store configuration backups

### 2. Update Schedule
- Monitor Supabase for updates
- Update dependencies monthly
- Test new features in staging first
- Monitor browser compatibility

## Troubleshooting

### Common Issues

**CORS Errors**:
- Ensure proper Supabase configuration
- Check domain whitelist in Supabase dashboard
- Verify HTTPS is enabled

**Module Loading Errors**:
- Serve files from HTTP server (not file://)
- Check JavaScript console for 404s
- Verify all import paths are correct

**Supabase Connection Issues**:
- Verify API keys are correct
- Check network connectivity
- Review RLS policies
- Monitor Supabase status page

**Performance Issues**:
- Enable gzip compression on server
- Optimize images and assets
- Monitor bundle size
- Use browser dev tools profiler

## Launch Checklist

- [ ] Supabase backend fully configured
- [ ] All environment variables set
- [ ] HTTPS enabled and working
- [ ] Custom domain configured (if applicable)
- [ ] Error monitoring setup
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Testing completed (see TESTING.md)

---

**Need Help?**
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review [Deployment Platform Docs](https://vercel.com/docs)
- Open an issue on GitHub
- Consult the troubleshooting section above

🚀 **Ready to launch your Daily 1% journey!**
