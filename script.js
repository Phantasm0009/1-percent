// Enhanced Daily 1% App with Supabase Integration
import { 
    supabase, 
    habitService, 
    checkinService, 
    milestoneService, 
    authService,
    challengeService,
    profileService 
} from './supabase.js';
import { AuthUI } from './auth.js';
import { VisualizationEngine } from './visualization.js';
import { SocialFeatures } from './social.js';
import { GamificationSystem } from './gamification.js';

// Application State
class App {
    constructor() {
        this.currentUser = null;
        this.currentHabit = null;
        this.streak = 0;
        this.history = [];
        this.milestones = {};
        this.growthChart = null;
        this.isInitialized = false;
        
        // Initialize modules
        this.auth = new AuthUI();
        this.visualization = new VisualizationEngine();
        this.social = new SocialFeatures();
        this.gamification = new GamificationSystem();
        
        this.init();
    }

    async init() {
        try {
            // Check authentication state
            const { data: { user } } = await authService.getCurrentUser();
            
            if (user) {
                this.currentUser = user;
                await this.initializeApp();
            } else {
                this.showOnboarding();
            }

            // Listen for auth changes
            authService.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    this.currentUser = session.user;
                    this.initializeApp();
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.showOnboarding();
                }
            });

            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showOnboarding();
        }
    }

    async initializeApp() {
        try {
            // Load user data
            await this.loadUserData();
            
            // Initialize modules with user data
            await this.visualization.init(this.currentUser.id);
            await this.social.init(this.currentUser.id);
            await this.gamification.init(this.currentUser.id);
            
            // Show dashboard
            this.showDashboard();
            
            // Update UI
            this.updateUI();
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize app for user:', error);
        }
    }

    async loadUserData() {
        try {
            // Load current habit
            const habits = await habitService.getUserHabits(this.currentUser.id);
            this.currentHabit = habits.find(h => h.is_active) || null;
            
            if (this.currentHabit) {
                // Load check-ins and calculate streak
                const checkins = await checkinService.getHabitCheckins(this.currentHabit.id);
                this.history = checkins;
                this.streak = this.calculateCurrentStreak(checkins);
                
                // Load milestones
                const milestones = await milestoneService.getHabitMilestones(this.currentHabit.id);
                this.milestones = this.formatMilestones(milestones);
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    }

    calculateCurrentStreak(checkins) {
        if (!checkins.length) return 0;
        
        const today = new Date();
        let streak = 0;
        let currentDate = new Date(today);
        
        // Check if today is done
        const todayString = this.formatDate(today);
        const todayCheckin = checkins.find(c => c.date === todayString);
        
        if (!todayCheckin) {
            // Check if yesterday was done
            currentDate.setDate(currentDate.getDate() - 1);
        }
        
        // Count consecutive days backwards
        while (currentDate >= new Date(checkins[0].date)) {
            const dateString = this.formatDate(currentDate);
            const checkin = checkins.find(c => c.date === dateString);
            
            if (checkin) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    }

    formatMilestones(milestones) {
        const formatted = {
            7: { achieved: false, date: null },
            21: { achieved: false, date: null },
            100: { achieved: false, date: null },
            365: { achieved: false, date: null }
        };
        
        milestones.forEach(m => {
            if (formatted[m.days]) {
                formatted[m.days] = {
                    achieved: m.achieved,
                    date: m.achieved_at
                };
            }
        });
        
        return formatted;
    }

    setupEventListeners() {
        // Onboarding
        const habitInput = document.getElementById('habitInput');
        const startJourney = document.getElementById('startJourney');
        
        if (habitInput) {
            habitInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                if (startJourney) {
                    startJourney.disabled = value.length < 3;
                }
            });
        }
        
        if (startJourney) {
            startJourney.addEventListener('click', () => this.startJourney());
        }

        // Daily check-in
        const dailyCheckbox = document.getElementById('dailyCheckbox');
        if (dailyCheckbox) {
            dailyCheckbox.addEventListener('click', () => this.handleDailyCheckIn());
        }

        // Chart view modes
        const viewModes = document.querySelectorAll('.chart-btn');
        viewModes.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.id;
                this.switchChartView(mode);
            });
        });

        // Timeline slider
        const timelineBtn = document.getElementById('timelineBtn');
        if (timelineBtn) {
            timelineBtn.addEventListener('click', () => {
                this.visualization.toggleTimeline();
            });
        }

        // User menu
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', () => {
                userDropdown.classList.toggle('hidden');
            });
        }

        // Settings
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        // Share
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.showShareModal());
        }

        // Sign out
        const signOutBtn = document.getElementById('signOutBtn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => this.signOut());
        }

        // Social tabs
        const socialTabs = document.querySelectorAll('.social-tab');
        socialTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchSocialTab(tabName);
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', (e) => {
                document.body.classList.toggle('dark-theme', e.target.checked);
                localStorage.setItem('darkTheme', e.target.checked);
            });
        }

        // Ambient sounds
        const ambientSounds = document.getElementById('ambientSounds');
        if (ambientSounds) {
            ambientSounds.addEventListener('change', (e) => {
                this.playAmbientSound(e.target.value);
            });
        }

        // Export data
        const exportData = document.getElementById('exportData');
        if (exportData) {
            exportData.addEventListener('click', () => this.exportUserData());
        }

        // Close modals
        this.setupModalCloseListeners();
    }

    setupModalCloseListeners() {
        const modals = ['shareModal', 'celebrationModal', 'scenarioModal', 'settingsPanel'];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            const closeBtn = modal?.querySelector('.close-btn');
            const overlay = modal?.querySelector('.modal-overlay');
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.hideModal(modalId));
            }
            
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        this.hideModal(modalId);
                    }
                });
            }
        });
    }

    async startJourney() {
        const habitInput = document.getElementById('habitInput');
        const habitName = habitInput.value.trim();
        
        if (!habitName) return;

        try {
            // Check if user is authenticated
            if (!this.currentUser) {
                // Show auth modal first
                this.auth.showAuthModal();
                
                // Wait for auth completion
                return new Promise((resolve) => {
                    const checkAuth = setInterval(async () => {
                        const { data: { user } } = await authService.getCurrentUser();
                        if (user) {
                            clearInterval(checkAuth);
                            this.currentUser = user;
                            this.createHabitAndStart(habitName);
                            resolve();
                        }
                    }, 1000);
                });
            } else {
                await this.createHabitAndStart(habitName);
            }
        } catch (error) {
            console.error('Failed to start journey:', error);
        }
    }

    async createHabitAndStart(habitName) {
        try {
            // Create new habit
            this.currentHabit = await habitService.createHabit(this.currentUser.id, {
                name: habitName,
                multiplier: 1.01,
                icon: this.getHabitIcon(habitName),
                color: this.getRandomColor()
            });

            // Initialize app
            await this.initializeApp();
            
        } catch (error) {
            console.error('Failed to create habit:', error);
        }
    }

    async handleDailyCheckIn() {
        if (!this.currentHabit || !this.currentUser) return;

        const today = this.formatDate(new Date());
        
        // Check if already checked in today
        const existingCheckin = this.history.find(h => h.date === today);
        if (existingCheckin) return;

        try {
            // Calculate improvement
            const newStreak = this.streak + 1;
            const improvement = this.calculateGrowth(newStreak);

            // Create check-in
            const checkin = await checkinService.createCheckin(this.currentUser.id, {
                habit_id: this.currentHabit.id,
                date: today,
                improvement_percent: improvement,
                streak_day: newStreak
            });

            // Update local state
            this.history.push(checkin);
            this.streak = newStreak;

            // Update UI
            this.updateUI();
            this.updateChart();

            // Check for milestones
            await this.checkMilestones();

            // Update gamification
            await this.gamification.recordCheckIn(this.currentUser.id, this.currentHabit.id);

            // Show success feedback
            this.showCheckInSuccess();

        } catch (error) {
            console.error('Failed to record check-in:', error);
        }
    }

    async checkMilestones() {
        const milestoneDays = [7, 21, 100, 365];
        
        for (const days of milestoneDays) {
            if (this.streak >= days && !this.milestones[days]?.achieved) {
                try {
                    // Record milestone
                    await milestoneService.createMilestone(this.currentUser.id, {
                        habit_id: this.currentHabit.id,
                        days: days,
                        achieved: true,
                        achieved_at: new Date().toISOString()
                    });

                    // Update local state
                    this.milestones[days] = {
                        achieved: true,
                        date: new Date().toISOString()
                    };

                    // Show celebration
                    this.showMilestoneCelebration(days);

                    // Update milestone UI
                    this.updateMilestoneUI(days);

                } catch (error) {
                    console.error('Failed to record milestone:', error);
                }
            }
        }
    }

    updateUI() {
        // Update streak display
        const streakNumber = document.getElementById('streakNumber');
        if (streakNumber) {
            streakNumber.textContent = this.streak;
        }

        // Update improvement display
        const improvementPercent = document.getElementById('improvementPercent');
        if (improvementPercent) {
            const improvement = this.calculateGrowth(this.streak);
            improvementPercent.textContent = `${improvement.toFixed(2)}%`;
        }

        // Update habit display
        const currentHabitEl = document.getElementById('currentHabit');
        if (currentHabitEl && this.currentHabit) {
            currentHabitEl.textContent = this.currentHabit.name;
        }

        // Update reliability score
        this.updateReliabilityScore();

        // Update check-in button state
        this.updateCheckInButton();

        // Update user info
        this.updateUserInfo();
    }

    updateReliabilityScore() {
        const reliabilityScore = document.getElementById('reliabilityScore');
        if (!reliabilityScore || !this.history.length) return;

        const totalDays = this.getDaysSinceStart();
        const checkinDays = this.history.length;
        const reliability = totalDays > 0 ? Math.round((checkinDays / totalDays) * 100) : 100;
        
        reliabilityScore.textContent = `${reliability}%`;
    }

    updateCheckInButton() {
        const dailyCheckbox = document.getElementById('dailyCheckbox');
        if (!dailyCheckbox) return;

        const today = this.formatDate(new Date());
        const todayCheckin = this.history.find(h => h.date === today);

        if (todayCheckin) {
            dailyCheckbox.classList.add('checked');
            dailyCheckbox.disabled = true;
            dailyCheckbox.innerHTML = '<i class="fas fa-check"></i><span>Completed today!</span>';
        } else {
            dailyCheckbox.classList.remove('checked');
            dailyCheckbox.disabled = false;
            dailyCheckbox.innerHTML = '<i class="fas fa-check"></i><span>I did my 1% today</span>';
        }
    }

    updateUserInfo() {
        if (!this.currentUser) return;

        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');

        if (userName) {
            userName.textContent = this.currentUser.user_metadata?.username || 
                                   this.currentUser.email?.split('@')[0] || 'User';
        }

        if (userAvatar) {
            userAvatar.src = this.currentUser.user_metadata?.avatar_url || 
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(userName?.textContent || 'User')}&background=667eea&color=fff`;
        }
    }

    updateChart() {
        if (!this.growthChart) {
            this.initializeChart();
        } else {
            this.refreshChart();
        }
    }

    initializeChart() {
        const ctx = document.getElementById('growthChart');
        if (!ctx) return;

        const data = this.generateChartData(30);
        
        this.growthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Your Growth',
                    data: data.actual,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Potential Growth',
                    data: data.potential,
                    borderColor: '#ff9f43',
                    backgroundColor: 'rgba(255, 159, 67, 0.1)',
                    fill: false,
                    borderDash: [5, 5],
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    generateChartData(days) {
        const labels = [];
        const actual = [];
        const potential = [];
        
        const startDate = this.currentHabit ? 
            new Date(this.currentHabit.created_at) : 
            new Date();
        
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            // Actual growth (based on check-ins)
            const checkinDate = this.formatDate(date);
            const checkin = this.history.find(h => h.date === checkinDate);
            actual.push(checkin ? checkin.improvement_percent : 0);
            
            // Potential growth (perfect consistency)
            potential.push(this.calculateGrowth(i + 1));
        }
        
        return { labels, actual, potential };
    }

    refreshChart() {
        if (!this.growthChart) return;
        
        const data = this.generateChartData(30);
        this.growthChart.data.labels = data.labels;
        this.growthChart.data.datasets[0].data = data.actual;
        this.growthChart.data.datasets[1].data = data.potential;
        this.growthChart.update();
    }

    switchChartView(mode) {
        // Remove active class from all buttons
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        document.getElementById(mode).classList.add('active');
        
        let days;
        switch (mode) {
            case 'viewMode1':
                days = 30;
                break;
            case 'viewMode2':
                days = 365;
                break;
            case 'viewMode3':
                this.showScenarioModal();
                return;
            default:
                days = 30;
        }
        
        const data = this.generateChartData(days);
        this.growthChart.data.labels = data.labels;
        this.growthChart.data.datasets[0].data = data.actual;
        this.growthChart.data.datasets[1].data = data.potential;
        this.growthChart.update();
    }

    showScenarioModal() {
        const modal = document.getElementById('scenarioModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.setupScenarioControls();
        }
    }

    setupScenarioControls() {
        const consistencySlider = document.getElementById('consistencySlider');
        const improvementSlider = document.getElementById('improvementSlider');
        const consistencyValue = document.getElementById('consistencyValue');
        const improvementValue = document.getElementById('improvementValue');
        const oneYearGrowth = document.getElementById('oneYearGrowth');
        const fiveYearGrowth = document.getElementById('fiveYearGrowth');

        if (!consistencySlider || !improvementSlider) return;

        const updateScenario = () => {
            const consistency = parseInt(consistencySlider.value) / 100;
            const improvement = parseFloat(improvementSlider.value) / 100 + 1;
            
            if (consistencyValue) consistencyValue.textContent = `${consistencySlider.value}%`;
            if (improvementValue) improvementValue.textContent = `${improvementSlider.value}%`;
            
            const oneYear = this.calculateGrowth(365, improvement, consistency);
            const fiveYears = this.calculateGrowth(365 * 5, improvement, consistency);
            
            if (oneYearGrowth) oneYearGrowth.textContent = `+${oneYear.toFixed(0)}%`;
            if (fiveYearGrowth) fiveYearGrowth.textContent = `+${fiveYears.toLocaleString()}%`;
        };

        consistencySlider.addEventListener('input', updateScenario);
        improvementSlider.addEventListener('input', updateScenario);
        
        updateScenario();
    }

    showMilestoneCelebration(days) {
        const modal = document.getElementById('celebrationModal');
        const message = document.getElementById('celebrationMessage');
        
        if (modal && message) {
            const milestoneMessages = {
                7: "You've built momentum! 7 days of consistent growth.",
                21: "Incredible! You're forming a lasting habit. 21 days strong!",
                100: "Phenomenal achievement! 100 days of compound growth!",
                365: "LEGENDARY! You've completed a full year of 1% improvements!"
            };
            
            message.textContent = milestoneMessages[days] || `${days} days of amazing progress!`;
            modal.classList.remove('hidden');
            
            // Trigger celebration animation
            this.visualization.triggerMilestoneExplosion(days);
        }
    }

    updateMilestoneUI(days) {
        const milestoneEl = document.getElementById(`milestone${days}`);
        if (milestoneEl) {
            milestoneEl.innerHTML = '<i class="fas fa-trophy"></i>';
            milestoneEl.parentElement.classList.add('achieved');
        }
    }

    showCheckInSuccess() {
        const toast = document.getElementById('achievementToast');
        const message = document.getElementById('toastMessage');
        
        if (toast && message) {
            message.textContent = `Day ${this.streak} completed! Keep building momentum!`;
            toast.classList.remove('hidden');
            
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
    }

    switchSocialTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.social-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) activeTab.classList.add('active');
        
        // Update panels
        document.querySelectorAll('.social-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        const activePanel = document.getElementById(`${tabName}Tab`);
        if (activePanel) activePanel.classList.add('active');
        
        // Load content based on tab
        switch (tabName) {
            case 'challenges':
                this.social.loadChallenges();
                break;
            case 'leaderboard':
                if(typeof this.social.loadLeaderboard === 'function') {
                  this.social.loadLeaderboard();
                } else {
                  console.warn('Leaderboard feature not available');
                }
                break;
            case 'community':
                if(typeof this.social.loadLiveMap === 'function') {
                  this.social.loadLiveMap();
                } else {
                  console.warn('Live map feature not available');
                }
                break;
        }
    }

    showSettings() {
        const panel = document.getElementById('settingsPanel');
        if (panel) {
            panel.classList.remove('hidden');
            
            // Load current settings
            const darkTheme = localStorage.getItem('darkTheme') === 'true';
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.checked = darkTheme;
            }
        }
    }

    showShareModal() {
        const modal = document.getElementById('shareModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.social.generateProgressSnapshot();
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showOnboarding() {
        const onboarding = document.getElementById('onboarding');
        const dashboard = document.getElementById('dashboard');
        if (onboarding) onboarding.classList.remove('hidden');
        if (dashboard) dashboard.classList.add('hidden');
    }

    showDashboard() {
        const onboarding = document.getElementById('onboarding');
        const dashboard = document.getElementById('dashboard');
        if (onboarding) onboarding.classList.add('hidden');
        if (dashboard) dashboard.classList.remove('hidden');
    }

    async signOut() {
        try {
            await authService.signOut();
            this.currentUser = null;
            this.currentHabit = null;
            this.history = [];
            this.streak = 0;
            this.milestones = {};
            
            this.showOnboarding();
        } catch (error) {
            console.error('Failed to sign out:', error);
        }
    }

    async exportUserData() {
        try {
            const data = {
                user: this.currentUser,
                habit: this.currentHabit,
                checkins: this.history,
                milestones: this.milestones,
                streak: this.streak,
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `daily-1-percent-export-${this.formatDate(new Date())}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export data:', error);
        }
    }

    playAmbientSound(soundType) {
        // Implementation for ambient sounds
        // This would integrate with Web Audio API
        console.log('Playing ambient sound:', soundType);
    }

    // Utility functions
    calculateGrowth(days, dailyImprovement = 1.01, consistency = 1.0) {
        const effectiveDays = days * consistency;
        return (Math.pow(dailyImprovement, effectiveDays) - 1) * 100;
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    getDaysSinceStart() {
        if (!this.currentHabit) return 0;
        
        const start = new Date(this.currentHabit.created_at);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getHabitIcon(habitName) {
        const iconMap = {
            'meditation': '🧘',
            'reading': '📚',
            'exercise': '💪',
            'writing': '✍️',
            'coding': '💻',
            'walking': '🚶',
            'learning': '🎓'
        };
        
        const key = Object.keys(iconMap).find(k => 
            habitName.toLowerCase().includes(k)
        );
        
        return iconMap[key] || '🎯';
    }

    getRandomColor() {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

export default App;

// Add stubs to handle undefined methods
App.prototype.loadLeaderboard = function() {
  console.log('Leaderboard loading not implemented yet');
};
App.prototype.loadLiveMap = function() {
  console.log('Live map loading not implemented yet');
};
