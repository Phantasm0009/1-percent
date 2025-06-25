// Social Features and Shareability System
import { dbService, realtimeService, challengeService } from './supabase.js';

class SocialFeatures {
  constructor() {
    this.currentUser = null;
    this.globalMapSubscription = null;
    this.init();
  }

  async init() {
    // Wait for auth to be ready
    if (window.authUI && window.authUI.currentUser) {
      this.currentUser = window.authUI.currentUser;
      this.initializeSocialFeatures();
    } else {
      // Listen for auth changes
      document.addEventListener('authReady', () => {
        this.currentUser = window.authUI.currentUser;
        this.initializeSocialFeatures();
      });
    }
  }

  initializeSocialFeatures() {
    try {
      this.createProgressSnapshots();
      this.createChallengeSystem();
      this.createLiveStreakMap();
      this.createPublicProfileSystem();
      this.setupSocialEventListeners();
    } catch (error) {
      console.error('Error initializing social features:', error);
      // Continue with basic functionality even if some features fail
    }
  }

  createProgressSnapshots() {
    // Enhanced share button with snapshot generation
    const shareSection = document.querySelector('.share-section');
    if (!shareSection) return;

    const snapshotContainer = document.createElement('div');
    snapshotContainer.className = 'snapshot-container';
    snapshotContainer.innerHTML = `
      <div class="snapshot-generator">
        <h4>Share Your Progress</h4>
        <div class="snapshot-preview" id="snapshotPreview">
          <canvas id="snapshotCanvas" width="800" height="600"></canvas>
        </div>
        
        <div class="snapshot-options">
          <div class="option-group">
            <label>Style:</label>
            <select id="snapshotStyle">
              <option value="gradient">Gradient</option>
              <option value="minimalist">Minimalist</option>
              <option value="celebration">Celebration</option>
              <option value="professional">Professional</option>
            </select>
          </div>
          
          <div class="option-group">
            <label>Include:</label>
            <div class="checkbox-group">
              <label><input type="checkbox" id="includeChart" checked> Growth Chart</label>
              <label><input type="checkbox" id="includeStats" checked> Statistics</label>
              <label><input type="checkbox" id="includeAvatar" checked> Avatar</label>
              <label><input type="checkbox" id="includeQuote" checked> Motivational Quote</label>
            </div>
          </div>

          <div class="option-group">
            <label>Custom Message:</label>
            <textarea id="customMessage" placeholder="Add your personal message..." maxlength="200"></textarea>
          </div>
        </div>

        <div class="snapshot-actions">
          <button id="generateSnapshot" class="snapshot-btn primary">
            <i class="fas fa-image"></i>
            Generate Snapshot
          </button>
          <button id="downloadSnapshot" class="snapshot-btn" disabled>
            <i class="fas fa-download"></i>
            Download
          </button>
          <button id="shareSnapshot" class="snapshot-btn" disabled>
            <i class="fas fa-share-alt"></i>
            Share
          </button>
        </div>
      </div>
    `;

    shareSection.appendChild(snapshotContainer);
    this.setupSnapshotGenerator();
  }

  setupSnapshotGenerator() {
    const generateBtn = document.getElementById('generateSnapshot');
    const downloadBtn = document.getElementById('downloadSnapshot');
    const shareBtn = document.getElementById('shareSnapshot');
    const canvas = document.getElementById('snapshotCanvas');

    generateBtn.addEventListener('click', () => this.generateProgressSnapshot());
    downloadBtn.addEventListener('click', () => this.downloadSnapshot());
    shareBtn.addEventListener('click', () => this.shareSnapshot());

    // Auto-generate preview
    setTimeout(() => this.generateProgressSnapshot(), 1000);
  }

  async generateProgressSnapshot() {
    const canvas = document.getElementById('snapshotCanvas');
    const ctx = canvas.getContext('2d');
    const style = document.getElementById('snapshotStyle').value;

    // Get current user data
    const userData = this.getCurrentUserData();
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Generate based on style
    switch (style) {
      case 'gradient':
        await this.generateGradientSnapshot(ctx, userData);
        break;
      case 'minimalist':
        await this.generateMinimalistSnapshot(ctx, userData);
        break;
      case 'celebration':
        await this.generateCelebrationSnapshot(ctx, userData);
        break;
      case 'professional':
        await this.generateProfessionalSnapshot(ctx, userData);
        break;
    }

    // Enable action buttons
    document.getElementById('downloadSnapshot').disabled = false;
    document.getElementById('shareSnapshot').disabled = false;
  }

  async generateGradientSnapshot(ctx, userData) {
    const { streak, improvement, habitName, level, avatar } = userData;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Daily 1% Challenge', 400, 80);

    // Habit name
    ctx.font = '24px Arial';
    ctx.fillText(`${habitName}`, 400, 120);

    // Main stats
    ctx.font = 'bold 64px Arial';
    ctx.fillText(`Day ${streak}`, 400, 200);

    ctx.font = 'bold 72px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`+${improvement.toFixed(1)}%`, 400, 290);

    ctx.fillStyle = 'white';
    ctx.font = '28px Arial';
    ctx.fillText('better than Day 1', 400, 330);

    // Avatar
    ctx.font = '80px Arial';
    ctx.fillText(avatar, 400, 420);

    // Level
    ctx.font = 'bold 32px Arial';
    ctx.fillText(level, 400, 470);

    // Quote
    const quote = this.getMotivationalQuote(streak);
    ctx.font = 'italic 20px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    this.wrapText(ctx, quote, 400, 520, 600, 25);

    // Footer
    ctx.font = '18px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('Join me at daily1percent.app', 400, 570);

    // Custom message
    const customMessage = document.getElementById('customMessage').value;
    if (customMessage) {
      ctx.font = 'bold 22px Arial';
      ctx.fillStyle = 'white';
      this.wrapText(ctx, `"${customMessage}"`, 400, 380, 600, 25);
    }
  }

  async generateCelebrationSnapshot(ctx, userData) {
    const { streak, improvement, habitName, level, avatar } = userData;

    // Celebration background
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(0, 0, 800, 600);

    // Confetti effect
    this.drawConfetti(ctx);

    // Celebration text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 52px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 MILESTONE ACHIEVED! 🎉', 400, 80);

    // Achievement details
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`${streak} Days of ${habitName}!`, 400, 150);

    // Improvement showcase
    ctx.font = 'bold 84px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeText(`+${improvement.toFixed(0)}%`, 400, 250);
    ctx.fillText(`+${improvement.toFixed(0)}%`, 400, 250);

    // Level badge
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(300, 300, 200, 60);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(level, 400, 340);

    // Motivational message
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('You\'re building something amazing!', 400, 420);

    // Social call to action
    ctx.font = '20px Arial';
    ctx.fillText('#1PercentBetter #CompoundGrowth', 400, 500);
    ctx.fillText('daily1percent.app', 400, 530);
  }

  drawConfetti(ctx) {
    const colors = ['#FFD700', '#FF6B6B', '#4CAF50', '#2196F3', '#9C27B0'];
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      const x = Math.random() * 800;
      const y = Math.random() * 600;
      const size = Math.random() * 10 + 5;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI * 2);
      ctx.fillRect(-size/2, -size/2, size, size);
      ctx.restore();
    }
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  getMotivationalQuote(streak) {
    const quotes = [
      "Success is the sum of small efforts repeated day in and day out.",
      "We are what we repeatedly do. Excellence is not an act, but a habit.",
      "The compound effect is the principle of reaping huge rewards from small actions.",
      "Small daily improvements over time lead to stunning results.",
      "Don't underestimate the power of consistency.",
      "Every master was once a disaster.",
      "Progress, not perfection.",
      "Your only limit is you."
    ];
    return quotes[streak % quotes.length];
  }

  downloadSnapshot() {
    const canvas = document.getElementById('snapshotCanvas');
    const link = document.createElement('a');
    link.download = `daily-1-percent-day-${this.getCurrentUserData().streak}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }

  async shareSnapshot() {
    const canvas = document.getElementById('snapshotCanvas');
    const userData = this.getCurrentUserData();
    
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      const shareText = this.generateShareText(userData);
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'progress.png', { type: 'image/png' })] })) {
        try {
          await navigator.share({
            title: 'My Daily 1% Progress',
            text: shareText,
            files: [new File([blob], 'progress.png', { type: 'image/png' })]
          });
          
          // Record share
          if (this.currentUser) {
            await dbService.recordShare(this.currentUser.id, userData.habitId, 'progress', 'native');
          }
        } catch (error) {
          console.log('Native share failed:', error);
          this.showSocialShareOptions(shareText, blob);
        }
      } else {
        this.showSocialShareOptions(shareText, blob);
      }
    }, 'image/png');
  }

  generateShareText(userData) {
    const { streak, improvement, habitName } = userData;
    const customMessage = document.getElementById('customMessage').value;
    
    let text = `After ${streak} days of ${habitName.toLowerCase()}, I'm ${improvement.toFixed(1)}% better than Day 1! 🚀\n\n`;
    
    if (customMessage) {
      text += `"${customMessage}"\n\n`;
    }
    
    text += `Join me in the 1% daily improvement challenge!\n#Daily1Percent #CompoundGrowth #HabitTracker`;
    
    return text;
  }

  createChallengeSystem() {
    // Add challenge section to dashboard
    const milestonesSection = document.querySelector('.milestones');
    if (!milestonesSection) return;

    const challengesSection = document.createElement('section');
    challengesSection.className = 'challenges-section';
    challengesSection.innerHTML = `
      <div class="challenges-header">
        <h3>Challenges</h3>
        <button id="createChallengeBtn" class="create-challenge-btn">
          <i class="fas fa-plus"></i>
          Create Challenge
        </button>
      </div>

      <div class="challenges-grid" id="challengesGrid">
        <!-- Challenges will be loaded here -->
      </div>

      <div class="challenge-friends">
        <div class="friends-header">
          <h4>Challenge Friends</h4>
          <button id="inviteFriendsBtn" class="invite-btn">
            <i class="fas fa-user-plus"></i>
            Invite Friends
          </button>
        </div>
        
        <div class="share-code-section">
          <div class="share-code-display">
            <span>Your Challenge Code:</span>
            <code id="userChallengeCode">${this.generateChallengeCode()}</code>
            <button id="copyCodeBtn" class="copy-btn">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          
          <div class="join-challenge">
            <input type="text" id="friendCodeInput" placeholder="Enter friend's code...">
            <button id="joinFriendChallengeBtn" class="join-btn">Join</button>
          </div>
        </div>
      </div>
    `;

    milestonesSection.insertAdjacentElement('afterend', challengesSection);
    this.setupChallengeEventListeners();
    this.loadChallenges();
  }

  generateChallengeCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async setupChallengeEventListeners() {
    document.getElementById('createChallengeBtn')?.addEventListener('click', () => {
      this.showCreateChallengeModal();
    });

    document.getElementById('inviteFriendsBtn')?.addEventListener('click', () => {
      this.showInviteFriendsModal();
    });

    document.getElementById('copyCodeBtn')?.addEventListener('click', () => {
      const code = document.getElementById('userChallengeCode').textContent;
      navigator.clipboard.writeText(code);
      this.showToast('Challenge code copied!', 'success');
    });

    document.getElementById('joinFriendChallengeBtn')?.addEventListener('click', () => {
      const friendCode = document.getElementById('friendCodeInput').value;
      this.joinFriendChallenge(friendCode);
    });
  }

  async loadChallenges() {
    try {
      console.log('🔄 Loading challenges...');
      const challenges = await dbService.getChallenges();
      
      if (!challenges || challenges.length === 0) {
        console.log('No challenges available');
        this.displayEmptyChallenges();
        return;
      }

      const challengesGrid = document.getElementById('challengesGrid');
      if (!challengesGrid) {
        console.warn('challengesGrid element not found');
        return;
      }

      challengesGrid.innerHTML = challenges.map(challenge => `
        <div class="challenge-card" data-challenge-id="${challenge.id}">
          <div class="challenge-info">
            <h4>${challenge.title || challenge.name || 'Unnamed Challenge'}</h4>
            <p>${challenge.description || 'No description available'}</p>
            <div class="challenge-meta">
              <span class="participants">
                <i class="fas fa-users"></i>
                ${challenge.challenge_participants?.length || 0} participants
              </span>
              <span class="duration">
                <i class="fas fa-calendar"></i>
                ${this.formatDateRange(challenge.start_date, challenge.end_date)}
              </span>
            </div>
          </div>
          <button class="join-challenge-btn" data-challenge-id="${challenge.id}">
            Join Challenge
          </button>
        </div>
      `).join('');
      
      console.log('✅ Challenges loaded successfully');
    } catch (error) {
      console.error('Error loading challenges:', error);
      this.displayErrorChallenges();
    }
  }

  displayEmptyChallenges() {
    const challengesGrid = document.getElementById('challengesGrid');
    if (challengesGrid) {
      challengesGrid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-trophy"></i>
          <h4>No Active Challenges</h4>
          <p>Check back later for exciting challenges!</p>
        </div>
      `;
    }
  }

  displayErrorChallenges() {
    const challengesGrid = document.getElementById('challengesGrid');
    if (challengesGrid) {
      challengesGrid.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h4>Unable to Load Challenges</h4>
          <p>Database connection issue. Please try again later.</p>
        </div>
      `;
    }
  }

  createLiveStreakMap() {
    // Add live map section
    const chartSection = document.querySelector('.chart-section');
    if (!chartSection) return;

    const mapSection = document.createElement('section');
    mapSection.className = 'live-map-section';
    mapSection.innerHTML = `
      <div class="map-header">
        <h3>Live Global Activity</h3>
        <div class="map-stats">
          <span class="live-indicator">🔴 LIVE</span>
          <span id="onlineCount">0</span> people improving right now
        </div>
      </div>
      
      <div class="activity-feed" id="activityFeed">
        <div class="activity-item template">
          <div class="activity-avatar">🌟</div>
          <div class="activity-text">
            <span class="activity-user">Anonymous</span>
            <span class="activity-action">completed their 1% in</span>
            <span class="activity-location">🌍</span>
          </div>
          <div class="activity-time">just now</div>
        </div>
      </div>

      <div class="global-stats">
        <div class="stat-card">
          <div class="stat-number" id="todayCheckins">0</div>
          <div class="stat-label">Check-ins Today</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" id="activeStreaks">0</div>
          <div class="stat-label">Active Streaks</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" id="totalImprovement">0%</div>
          <div class="stat-label">Global Improvement</div>
        </div>
      </div>
    `;

    chartSection.insertAdjacentElement('afterend', mapSection);
    this.setupLiveMap();
  }

  setupLiveMap() {
    // Subscribe to global check-ins
    this.globalMapSubscription = realtimeService.subscribeToGlobalCheckins((payload) => {
      this.addActivityToFeed(payload.new);
      this.updateGlobalStats();
    });

    // Load initial activity
    this.loadInitialActivity();
    
    // Update stats every 30 seconds
    setInterval(() => this.updateGlobalStats(), 30000);
  }

  async loadInitialActivity() {
    try {
      console.log('🔄 Loading global activity...');
      const checkins = await dbService.getGlobalCheckins();
      
      if (!checkins || checkins.length === 0) {
        console.log('No global activity found');
        this.displayEmptyActivity();
        return;
      }

      const activityFeed = document.getElementById('activityFeed');
      if (!activityFeed) {
        console.warn('activityFeed element not found');
        return;
      }

      // Clear existing activity
      activityFeed.innerHTML = '';
      
      // Add recent checkins
      checkins.slice(0, 10).forEach(checkin => {
        this.addActivityToFeed(checkin, false);
      });

      this.updateGlobalStats();
      console.log('✅ Global activity loaded successfully');
    } catch (error) {
      console.error('Error loading activity:', error);
      this.displayErrorActivity();
    }
  }

  displayEmptyActivity() {
    const activityFeed = document.getElementById('activityFeed');
    if (activityFeed) {
      activityFeed.innerHTML = `
        <div class="empty-activity">
          <i class="fas fa-globe"></i>
          <p>No recent activity</p>
        </div>
      `;
    }
  }

  displayErrorActivity() {
    const activityFeed = document.getElementById('activityFeed');
    if (activityFeed) {
      activityFeed.innerHTML = `
        <div class="error-activity">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Unable to load activity</p>
        </div>
      `;
    }
  }

  addActivityToFeed(checkin, animate = true) {
    const activityFeed = document.getElementById('activityFeed');
    if (!activityFeed) return;

    const locations = ['🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇯🇵', '🇮🇳', '🇧🇷', '🇲🇽'];
    const avatars = ['🌟', '🚀', '💪', '🔥', '⭐', '🌈', '🎯', '💎', '🏆', '⚡'];

    const activityItem = document.createElement('div');
    activityItem.className = `activity-item ${animate ? 'new' : ''}`;
    activityItem.innerHTML = `
      <div class="activity-avatar">${avatars[Math.floor(Math.random() * avatars.length)]}</div>
      <div class="activity-text">
        <span class="activity-user">Someone</span>
        <span class="activity-action">completed their 1%</span>
        <span class="activity-location">${locations[Math.floor(Math.random() * locations.length)]}</span>
      </div>
      <div class="activity-time">${this.getTimeAgo(checkin.created_at || new Date())}</div>
    `;

    activityFeed.insertBefore(activityItem, activityFeed.firstChild);

    // Remove old items (keep only 20)
    const items = activityFeed.querySelectorAll('.activity-item');
    if (items.length > 20) {
      items[items.length - 1].remove();
    }

    // Animate new item
    if (animate) {
      setTimeout(() => activityItem.classList.remove('new'), 100);
    }
  }

  async updateGlobalStats() {
    try {
      // Mock global stats for now
      const todayCheckins = Math.floor(Math.random() * 1000) + 500;
      const activeStreaks = Math.floor(Math.random() * 5000) + 2000;
      const totalImprovement = Math.floor(Math.random() * 100000) + 50000;

      document.getElementById('todayCheckins').textContent = todayCheckins.toLocaleString();
      document.getElementById('activeStreaks').textContent = activeStreaks.toLocaleString();
      document.getElementById('totalImprovement').textContent = totalImprovement.toLocaleString() + '%';
      document.getElementById('onlineCount').textContent = Math.floor(Math.random() * 50) + 20;

    } catch (error) {
      console.error('Error updating global stats:', error);
    }
  }

  getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  }

  getCurrentUserData() {
    // Get current user data from the app state
    const streak = parseInt(document.getElementById('streakNumber')?.textContent || '0');
    const improvement = parseFloat(document.getElementById('improvementPercent')?.textContent || '0');
    const habitName = document.getElementById('currentHabit')?.textContent || 'Daily Habit';
    
    return {
      streak,
      improvement,
      habitName,
      level: this.getCurrentLevel(streak),
      avatar: this.getCurrentAvatar(streak),
      habitId: 'current-habit' // This should come from actual habit data
    };
  }

  getCurrentLevel(streak) {
    if (streak >= 365) return 'Master';
    if (streak >= 100) return 'Expert';
    if (streak >= 30) return 'Advanced';
    if (streak >= 7) return 'Adept';
    return 'Novice';
  }

  getCurrentAvatar(streak) {
    if (streak >= 365) return '👑';
    if (streak >= 100) return '🌟';
    if (streak >= 30) return '🌳';
    if (streak >= 7) return '🌿';
    return '🌱';
  }

  showToast(message, type = 'info') {
    // Reuse existing toast function
    if (window.showToast) {
      window.showToast(message, type);
    }
  }

  formatDateRange(startDate, endDate) {
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();
    return `${start} - ${end}`;
  }

  createPublicProfileSystem() {
    // Add public profile functionality
    console.log('🌐 Initializing public profile system...');
    
    // This will be expanded later with full public profile features
    // For now, we'll create a placeholder to prevent errors
    const profileContainer = document.createElement('div');
    profileContainer.className = 'public-profile-system';
    profileContainer.style.display = 'none'; // Hidden for now
    profileContainer.innerHTML = `
      <div class="profile-settings">
        <h4>Public Profile Settings</h4>
        <div class="profile-options">
          <label>
            <input type="checkbox" id="enablePublicProfile">
            Make my profile public
          </label>
          <label>
            <input type="checkbox" id="showStreak" checked>
            Show my streak
          </label>
          <label>
            <input type="checkbox" id="showChart" checked>
            Show my progress chart
          </label>
        </div>
      </div>
    `;
    
    // Add to dashboard if it exists
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
      dashboard.appendChild(profileContainer);
    }
    
    console.log('✅ Public profile system initialized');
  }

  // Cleanup subscriptions
  destroy() {
    if (this.globalMapSubscription) {
      this.globalMapSubscription.unsubscribe();
    }
  }

  setupSocialEventListeners() {
    // Setup event listeners for social features
    console.log('🎧 Setting up social event listeners...');
    
    // Add event listeners for share buttons, challenge participation, etc.
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('share-progress-btn')) {
        this.generateProgressSnapshot();
      }
      
      if (e.target.classList.contains('join-challenge-btn')) {
        const challengeId = e.target.dataset.challengeId;
        if (challengeId) {
          this.joinChallenge(challengeId);
        }
      }
    });
    
    console.log('✅ Social event listeners setup complete');
  }

  async joinChallenge(challengeId) {
    try {
      if (!this.currentUser) {
        console.warn('User not authenticated for challenge participation');
        return;
      }
      
      const result = await challengeService.joinChallenge(this.currentUser.id, challengeId);
      if (result.error) {
        console.error('Error joining challenge:', result.error);
        this.showToast('Failed to join challenge', 'error');
      } else {
        this.showToast('Successfully joined challenge!', 'success');
      }
    } catch (error) {
      console.error('Exception joining challenge:', error);
      this.showToast('Failed to join challenge', 'error');
    }
  }
}

// Initialize social features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.socialFeatures = new SocialFeatures();
});

export { SocialFeatures };
export default SocialFeatures;
