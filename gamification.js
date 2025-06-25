// Gamification System with Rewards and Achievements
import { dbService } from './supabase.js';

class GamificationSystem {
  constructor() {
    this.currentUser = null;
    this.achievements = [];
    this.userStats = {
      level: 'Novice',
      totalPoints: 0,
      reliabilityScore: 0,
      badges: [],
      multipliers: {}
    };
    this.init();
  }

  async init() {
    this.defineAchievements();
    this.setupRewardSystem();
    this.createGamificationUI();
    
    // Wait for auth
    if (window.authUI && window.authUI.currentUser) {
      this.currentUser = window.authUI.currentUser;
      await this.loadUserStats();
    }
  }

  defineAchievements() {
    this.achievements = [
      // Streak Achievements
      {
        id: 'first_step',
        name: 'First Step',
        description: 'Complete your first day',
        icon: '👶',
        condition: (stats) => stats.streak >= 1,
        points: 10,
        rarity: 'common'
      },
      {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        condition: (stats) => stats.streak >= 7,
        points: 50,
        rarity: 'uncommon'
      },
      {
        id: 'habit_former',
        name: 'Habit Former',
        description: 'Complete 21 days - scientifically proven habit formation!',
        icon: '💪',
        condition: (stats) => stats.streak >= 21,
        points: 150,
        rarity: 'rare'
      },
      {
        id: 'centurion',
        name: 'Centurion',
        description: 'Reach the legendary 100-day milestone',
        icon: '🚀',
        condition: (stats) => stats.streak >= 100,
        points: 500,
        rarity: 'epic'
      },
      {
        id: 'year_master',
        name: 'Year Master',
        description: 'Complete a full 365-day journey',
        icon: '👑',
        condition: (stats) => stats.streak >= 365,
        points: 2000,
        rarity: 'legendary'
      },

      // Consistency Achievements
      {
        id: 'perfect_week',
        name: 'Perfect Week',
        description: 'Complete 7 days without missing any',
        icon: '⭐',
        condition: (stats) => stats.consistency >= 100 && stats.streak >= 7,
        points: 75,
        rarity: 'uncommon'
      },
      {
        id: 'reliability_expert',
        name: 'Reliability Expert',
        description: 'Maintain 95% consistency for 30 days',
        icon: '🎯',
        condition: (stats) => stats.consistency >= 95 && stats.streak >= 30,
        points: 200,
        rarity: 'rare'
      },

      // Growth Achievements
      {
        id: 'double_trouble',
        name: 'Double Trouble',
        description: 'Reach 100% improvement (2x better)',
        icon: '📈',
        condition: (stats) => stats.improvement >= 100,
        points: 100,
        rarity: 'uncommon'
      },
      {
        id: 'exponential_growth',
        name: 'Exponential Growth',
        description: 'Reach 1000% improvement (10x better)',
        icon: '🌟',
        condition: (stats) => stats.improvement >= 1000,
        points: 400,
        rarity: 'epic'
      },

      // Social Achievements
      {
        id: 'influencer',
        name: 'Influencer',
        description: 'Share your progress 5 times',
        icon: '📱',
        condition: (stats) => stats.sharesCount >= 5,
        points: 50,
        rarity: 'uncommon'
      },
      {
        id: 'challenger',
        name: 'Challenger',
        description: 'Create or join 3 challenges',
        icon: '🏆',
        condition: (stats) => stats.challengesJoined >= 3,
        points: 100,
        rarity: 'rare'
      },

      // Special Achievements
      {
        id: 'comeback_kid',
        name: 'Comeback Kid',
        description: 'Restart after breaking a 10+ day streak',
        icon: '🔄',
        condition: (stats) => stats.comebacks >= 1,
        points: 75,
        rarity: 'rare'
      },
      {
        id: 'multi_habit_master',
        name: 'Multi-Habit Master',
        description: 'Successfully track 5 different habits',
        icon: '🎭',
        condition: (stats) => stats.habitsCompleted >= 5,
        points: 300,
        rarity: 'epic'
      }
    ];
  }

  setupRewardSystem() {
    this.rewardTiers = {
      novice: { minPoints: 0, maxPoints: 99, benefits: ['Basic tracking'] },
      adept: { minPoints: 100, maxPoints: 499, benefits: ['Milestone celebrations', 'Basic analytics'] },
      advanced: { minPoints: 500, maxPoints: 1999, benefits: ['Advanced charts', 'Social features'] },
      expert: { minPoints: 2000, maxPoints: 9999, benefits: ['Custom multipliers', 'Challenge creation'] },
      master: { minPoints: 10000, maxPoints: Infinity, benefits: ['All features', 'Exclusive badges', 'Priority support'] }
    };

    this.habitMultipliers = {
      exercise: 1.2,
      meditation: 1.1,
      reading: 1.15,
      coding: 1.25,
      writing: 1.2,
      learning: 1.3,
      default: 1.0
    };
  }

  createGamificationUI() {
    this.createProgressDashboard();
    this.createAchievementGallery();
    this.createReliabilityScore();
    this.createLevelSystem();
    this.createHabitMultipliers();
  }

  createProgressDashboard() {
    const dailyCheckin = document.querySelector('.daily-checkin');
    if (!dailyCheckin) return;

    const gamificationDashboard = document.createElement('div');
    gamificationDashboard.className = 'gamification-dashboard';
    gamificationDashboard.innerHTML = `
      <div class="user-level-card">
        <div class="level-info">
          <div class="level-avatar" id="levelAvatar">🌱</div>
          <div class="level-details">
            <div class="level-name" id="userLevel">Novice</div>
            <div class="level-progress">
              <div class="progress-bar">
                <div class="progress-fill" id="levelProgressFill" style="width: 0%"></div>
              </div>
              <span class="progress-text" id="levelProgressText">0 / 100 XP</span>
            </div>
          </div>
        </div>
        
        <div class="level-benefits">
          <h5>Current Benefits:</h5>
          <ul id="levelBenefits">
            <li>Basic habit tracking</li>
          </ul>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card points">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <div class="stat-value" id="totalPoints">0</div>
            <div class="stat-label">Total Points</div>
          </div>
        </div>
        
        <div class="stat-card reliability">
          <div class="stat-icon">🎯</div>
          <div class="stat-info">
            <div class="stat-value" id="reliabilityScore">0</div>
            <div class="stat-label">Reliability Score</div>
          </div>
        </div>
        
        <div class="stat-card achievements">
          <div class="stat-icon">🏆</div>
          <div class="stat-info">
            <div class="stat-value" id="achievementCount">0</div>
            <div class="stat-label">Achievements</div>
          </div>
        </div>
        
        <div class="stat-card multiplier">
          <div class="stat-icon">⚡</div>
          <div class="stat-info">
            <div class="stat-value" id="habitMultiplier">1.0x</div>
            <div class="stat-label">Habit Multiplier</div>
          </div>
        </div>
      </div>
    `;

    dailyCheckin.insertAdjacentElement('afterend', gamificationDashboard);
  }

  createAchievementGallery() {
    const milestonesSection = document.querySelector('.milestones');
    if (!milestonesSection) return;

    const achievementSection = document.createElement('section');
    achievementSection.className = 'achievements-section';
    achievementSection.innerHTML = `
      <div class="achievements-header">
        <h3>Achievements</h3>
        <div class="achievement-filters">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="unlocked">Unlocked</button>
          <button class="filter-btn" data-filter="locked">Locked</button>
        </div>
      </div>

      <div class="achievements-grid" id="achievementsGrid">
        <!-- Achievements will be populated here -->
      </div>

      <div class="recent-achievements" id="recentAchievements">
        <h4>Recent Achievements</h4>
        <div class="recent-list" id="recentAchievementsList">
          <!-- Recent achievements will appear here -->
        </div>
      </div>
    `;

    milestonesSection.insertAdjacentElement('beforebegin', achievementSection);
    this.populateAchievements();
    this.setupAchievementFilters();
  }

  populateAchievements() {
    const achievementsGrid = document.getElementById('achievementsGrid');
    if (!achievementsGrid) return;

    achievementsGrid.innerHTML = this.achievements.map(achievement => {
      const isUnlocked = this.isAchievementUnlocked(achievement);
      const rarityClass = achievement.rarity;
      
      return `
        <div class="achievement-card ${rarityClass} ${isUnlocked ? 'unlocked' : 'locked'}" 
             data-achievement-id="${achievement.id}"
             data-filter="${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="achievement-icon">${achievement.icon}</div>
          <div class="achievement-info">
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
            <div class="achievement-points">+${achievement.points} XP</div>
          </div>
          <div class="achievement-rarity ${rarityClass}">${achievement.rarity}</div>
          ${isUnlocked ? '<div class="achievement-unlocked">✓</div>' : ''}
        </div>
      `;
    }).join('');
  }

  setupAchievementFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        
        // Update active filter
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        // Filter achievements
        document.querySelectorAll('.achievement-card').forEach(card => {
          if (filter === 'all' || card.dataset.filter === filter) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  createReliabilityScore() {
    // Add reliability score calculation and display
    this.reliabilitySystem = {
      calculateScore: (streak, consistency, comebacks) => {
        let baseScore = streak * 10;
        let consistencyBonus = consistency * 5;
        let comebackPenalty = comebacks * 25;
        
        return Math.max(0, Math.min(1000, baseScore + consistencyBonus - comebackPenalty));
      },
      
      getScoreLevel: (score) => {
        if (score >= 900) return { level: 'Legendary', color: '#FFD700', icon: '👑' };
        if (score >= 750) return { level: 'Master', color: '#8A2BE2', icon: '🌟' };
        if (score >= 500) return { level: 'Expert', color: '#FF6B6B', icon: '🚀' };
        if (score >= 250) return { level: 'Advanced', color: '#4CAF50', icon: '💪' };
        if (score >= 100) return { level: 'Adept', color: '#2196F3', icon: '🔥' };
        return { level: 'Novice', color: '#9E9E9E', icon: '🌱' };
      }
    };
  }

  createLevelSystem() {
    this.levelSystem = {
      calculateLevel: (totalPoints) => {
        for (const [level, tier] of Object.entries(this.rewardTiers)) {
          if (totalPoints >= tier.minPoints && totalPoints <= tier.maxPoints) {
            return {
              name: level,
              current: totalPoints - tier.minPoints,
              needed: tier.maxPoints - tier.minPoints,
              benefits: tier.benefits
            };
          }
        }
        return this.rewardTiers.master;
      },
      
      getNextLevelRequirement: (currentLevel) => {
        const levels = Object.keys(this.rewardTiers);
        const currentIndex = levels.indexOf(currentLevel);
        if (currentIndex < levels.length - 1) {
          const nextLevel = levels[currentIndex + 1];
          return this.rewardTiers[nextLevel].minPoints;
        }
        return null;
      }
    };
  }

  createHabitMultipliers() {
    // Add habit multiplier selection to habit creation/editing
    const habitDisplay = document.querySelector('.habit-display');
    if (!habitDisplay) return;

    // Add multiplier info button
    const multiplierBtn = document.createElement('button');
    multiplierBtn.className = 'multiplier-btn';
    multiplierBtn.innerHTML = '<i class="fas fa-bolt"></i>';
    multiplierBtn.title = 'View habit multipliers';
    multiplierBtn.addEventListener('click', () => this.showMultiplierModal());
    
    habitDisplay.appendChild(multiplierBtn);
  }

  showMultiplierModal() {
    const modal = document.createElement('div');
    modal.className = 'multiplier-modal modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Habit Multipliers</h3>
            <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
          </div>
          
          <div class="modal-body">
            <p>Different habits have different growth multipliers based on their impact:</p>
            
            <div class="multiplier-list">
              ${Object.entries(this.habitMultipliers).map(([habit, multiplier]) => `
                <div class="multiplier-item">
                  <div class="habit-name">${habit.charAt(0).toUpperCase() + habit.slice(1)}</div>
                  <div class="multiplier-value">${multiplier}x</div>
                  <div class="multiplier-effect">
                    ${this.getMultiplierDescription(multiplier)}
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="multiplier-explanation">
              <h4>How it works:</h4>
              <p>Your daily improvement rate is multiplied by your habit's multiplier. For example, with a 1.2x multiplier, instead of improving 1% daily, you improve 1.2% daily!</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  getMultiplierDescription(multiplier) {
    if (multiplier >= 1.25) return 'High impact habit - accelerated growth!';
    if (multiplier >= 1.15) return 'Significant impact - enhanced progress';
    if (multiplier >= 1.1) return 'Good impact - steady improvement';
    return 'Standard growth rate';
  }

  // Achievement checking and unlocking
  async checkAchievements(userStats) {
    const newAchievements = [];
    
    for (const achievement of this.achievements) {
      if (!this.userStats.badges.includes(achievement.id) && achievement.condition(userStats)) {
        newAchievements.push(achievement);
        this.userStats.badges.push(achievement.id);
        this.userStats.totalPoints += achievement.points;
        
        // Trigger achievement animation
        this.triggerAchievementUnlock(achievement);
        
        // Save to database
        if (this.currentUser) {
          await this.saveAchievementToDatabase(achievement);
        }
      }
    }
    
    return newAchievements;
  }

  triggerAchievementUnlock(achievement) {
    // Create achievement unlock animation
    const achievementPopup = document.createElement('div');
    achievementPopup.className = 'achievement-unlock-popup';
    achievementPopup.innerHTML = `
      <div class="achievement-unlock-content">
        <div class="achievement-unlock-header">
          <div class="unlock-sparkles">✨</div>
          <h3>Achievement Unlocked!</h3>
          <div class="unlock-sparkles">✨</div>
        </div>
        
        <div class="achievement-unlock-details">
          <div class="achievement-unlock-icon ${achievement.rarity}">${achievement.icon}</div>
          <div class="achievement-unlock-info">
            <div class="achievement-unlock-name">${achievement.name}</div>
            <div class="achievement-unlock-description">${achievement.description}</div>
            <div class="achievement-unlock-points">+${achievement.points} XP</div>
          </div>
        </div>
        
        <div class="achievement-unlock-actions">
          <button class="share-achievement-btn" onclick="this.shareAchievement('${achievement.id}')">
            <i class="fas fa-share-alt"></i>
            Share
          </button>
          <button class="close-achievement-btn" onclick="this.closest('.achievement-unlock-popup').remove()">
            Continue
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(achievementPopup);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (achievementPopup.parentNode) {
        achievementPopup.remove();
      }
    }, 10000);

    // Update achievement gallery
    this.updateAchievementDisplay(achievement.id);
  }

  updateAchievementDisplay(achievementId) {
    const achievementCard = document.querySelector(`[data-achievement-id="${achievementId}"]`);
    if (achievementCard) {
      achievementCard.classList.remove('locked');
      achievementCard.classList.add('unlocked');
      achievementCard.dataset.filter = 'unlocked';
      
      const unlockedBadge = document.createElement('div');
      unlockedBadge.className = 'achievement-unlocked';
      unlockedBadge.textContent = '✓';
      achievementCard.appendChild(unlockedBadge);
    }
  }

  isAchievementUnlocked(achievement) {
    return this.userStats.badges.includes(achievement.id);
  }

  // Update user stats and UI
  async updateUserStats(newStats) {
    // Check for new achievements
    const newAchievements = await this.checkAchievements(newStats);
    
    // Update level
    const levelInfo = this.levelSystem.calculateLevel(this.userStats.totalPoints);
    
    // Update reliability score
    const reliabilityInfo = this.reliabilitySystem.getScoreLevel(newStats.reliabilityScore);
    
    // Update UI
    this.updateGamificationUI(levelInfo, reliabilityInfo);
    
    // Save to database
    if (this.currentUser) {
      await this.saveUserStatsToDatabase();
    }
    
    return newAchievements;
  }

  updateGamificationUI(levelInfo, reliabilityInfo) {
    // Update level display
    document.getElementById('userLevel').textContent = levelInfo.name.charAt(0).toUpperCase() + levelInfo.name.slice(1);
    document.getElementById('levelProgressFill').style.width = `${(levelInfo.current / levelInfo.needed) * 100}%`;
    document.getElementById('levelProgressText').textContent = `${levelInfo.current} / ${levelInfo.needed} XP`;
    
    // Update level benefits
    const benefitsList = document.getElementById('levelBenefits');
    if (benefitsList) {
      benefitsList.innerHTML = levelInfo.benefits.map(benefit => `<li>${benefit}</li>`).join('');
    }

    // Update stats
    document.getElementById('totalPoints').textContent = this.userStats.totalPoints.toLocaleString();
    document.getElementById('reliabilityScore').textContent = this.userStats.reliabilityScore;
    document.getElementById('achievementCount').textContent = this.userStats.badges.length;
    
    // Update reliability score color
    const reliabilityCard = document.querySelector('.stat-card.reliability');
    if (reliabilityCard) {
      reliabilityCard.style.borderLeft = `4px solid ${reliabilityInfo.color}`;
    }
  }

  // Calculate habit multiplier effect
  calculateHabitMultiplier(habitName, baseImprovement = 1.01) {
    const habitKey = habitName.toLowerCase();
    const multiplier = this.habitMultipliers[habitKey] || this.habitMultipliers.default;
    return 1 + ((baseImprovement - 1) * multiplier);
  }

  // Database operations
  async saveAchievementToDatabase(achievement) {
    // This would integrate with the existing milestone system
    console.log('Saving achievement to database:', achievement);
  }

  async saveUserStatsToDatabase() {
    try {
      await dbService.updateUserStats(this.currentUser.id, this.userStats.totalPoints);
    } catch (error) {
      console.error('Error saving user stats:', error);
    }
  }

  async loadUserStats() {
    try {
      const analytics = await dbService.getUserAnalytics(this.currentUser.id);
      // Load and apply user stats
      this.userStats = {
        ...this.userStats,
        ...analytics
      };
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }

  // Public methods for integration
  onHabitComplete(habitName, streak, consistency) {
    const stats = {
      streak,
      consistency,
      improvement: this.calculateGrowth(streak),
      sharesCount: 0, // This would come from actual data
      challengesJoined: 0, // This would come from actual data
      comebacks: 0, // This would come from actual data
      habitsCompleted: 1 // This would come from actual data
    };

    this.updateUserStats(stats);
  }

  calculateGrowth(days, dailyImprovement = 1.01) {
    return (Math.pow(dailyImprovement, days) - 1) * 100;
  }
}

// Initialize gamification when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.gamificationSystem = new GamificationSystem();
});

export { GamificationSystem };
export default GamificationSystem;
