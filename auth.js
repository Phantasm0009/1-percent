// Authentication UI Components
import { authService } from './supabase.js';

class AuthUI {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  async init() {
    // Check for existing session
    const { data: { user } } = await authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
      await this.ensureUserProfile(user);
      this.showAuthenticatedState();
    } else {
      this.showAuthModal();
    }

    // Listen for auth changes
    authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.currentUser = session.user;
        await this.ensureUserProfile(session.user);
        this.showAuthenticatedState();
        this.hideAuthModal();
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        this.showAuthModal();
      }
    });
  }

  showAuthModal() {
    if (document.getElementById('authModal')) return;

    const authModal = document.createElement('div');
    authModal.id = 'authModal';
    authModal.className = 'auth-modal';
    authModal.innerHTML = `
      <div class="auth-overlay">
        <div class="auth-content">
          <div class="auth-header">
            <h2>Welcome to Daily 1%</h2>
            <p>Join millions improving 1% every day</p>
          </div>
          
          <div class="auth-tabs">
            <button class="auth-tab active" data-tab="signin">Sign In</button>
            <button class="auth-tab" data-tab="signup">Sign Up</button>
          </div>

          <!-- Sign In Form -->
          <form id="signinForm" class="auth-form active">
            <div class="social-auth">
              <button type="button" id="googleSignIn" class="social-btn google">
                <i class="fab fa-google"></i>
                Continue with Google
              </button>
            </div>
            
            <div class="divider">
              <span>or</span>
            </div>
            
            <div class="form-group">
              <input type="email" id="signinEmail" placeholder="Email" required>
            </div>
            <div class="form-group">
              <input type="password" id="signinPassword" placeholder="Password" required>
            </div>
            <button type="submit" class="auth-submit">Sign In</button>
            
            <p class="auth-footer">
              Don't have an account? <a href="#" data-switch="signup">Sign up</a>
            </p>
          </form>

          <!-- Sign Up Form -->
          <form id="signupForm" class="auth-form">
            <div class="social-auth">
              <button type="button" id="googleSignUp" class="social-btn google">
                <i class="fab fa-google"></i>
                Continue with Google
              </button>
            </div>
            
            <div class="divider">
              <span>or</span>
            </div>
            
            <div class="form-group">
              <input type="text" id="signupUsername" placeholder="Username" required>
            </div>
            <div class="form-group">
              <input type="email" id="signupEmail" placeholder="Email" required>
            </div>
            <div class="form-group">
              <input type="password" id="signupPassword" placeholder="Password (min 6 chars)" required minlength="6">
            </div>
            <button type="submit" class="auth-submit">Create Account</button>
            
            <p class="auth-footer">
              Already have an account? <a href="#" data-switch="signin">Sign in</a>
            </p>
          </form>

          <div class="auth-benefits">
            <div class="benefit">
              <i class="fas fa-chart-line"></i>
              <span>Track your compound growth</span>
            </div>
            <div class="benefit">
              <i class="fas fa-users"></i>
              <span>Join global challenges</span>
            </div>
            <div class="benefit">
              <i class="fas fa-share-alt"></i>
              <span>Share your progress</span>
            </div>
            <div class="benefit">
              <i class="fas fa-trophy"></i>
              <span>Unlock achievements</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(authModal);
    this.setupAuthEventListeners();
  }

  hideAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
      authModal.remove();
    }
  }

  setupAuthEventListeners() {
    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = e.target.dataset.tab;
        this.switchAuthTab(targetTab);
      });
    });

    // Form switching links
    document.querySelectorAll('[data-switch]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = e.target.dataset.switch;
        this.switchAuthTab(targetTab);
      });
    });

    // Sign in form
    document.getElementById('signinForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSignIn(e);
    });

    // Sign up form
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSignUp(e);
    });

    // Google auth
    document.getElementById('googleSignIn').addEventListener('click', () => {
      this.handleGoogleAuth();
    });
    document.getElementById('googleSignUp').addEventListener('click', () => {
      this.handleGoogleAuth();
    });
  }

  switchAuthTab(tab) {
    // Update tabs
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    // Update forms
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById(`${tab}Form`).classList.add('active');
  }

  async handleSignIn(e) {
    const submitBtn = e.target.querySelector('.auth-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Signing in...';
    submitBtn.disabled = true;

    try {
      const email = document.getElementById('signinEmail').value;
      const password = document.getElementById('signinPassword').value;

      const { data, error } = await authService.signIn(email, password);
      
      if (error) {
        this.showAuthError(error.message);
      } else {
        this.showAuthSuccess('Welcome back!');
      }
    } catch (error) {
      this.showAuthError('An unexpected error occurred');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  async handleSignUp(e) {
    const submitBtn = e.target.querySelector('.auth-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;

    try {
      const username = document.getElementById('signupUsername').value;
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;

      const { data, error } = await authService.signUp(email, password, username);
      
      if (error) {
        if (error.message && error.message.includes('429')) {
          this.showAuthError('Too many signup attempts. Please wait a few minutes and try again.');
        } else if (error.message && error.message.includes('rate limit')) {
          this.showAuthError('Rate limit exceeded. Please wait before trying again.');
        } else {
          this.showAuthError(error.message);
        }
      } else {
        this.showAuthSuccess('Account created! Check your email to verify.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      if (error.message && error.message.includes('429')) {
        this.showAuthError('⏰ Too many requests. Please wait 5 minutes before trying again.');
      } else if (error.message && error.message.includes('rate')) {
        this.showAuthError('⏰ Rate limit reached. Please try again in a few minutes.');
      } else {
        this.showAuthError('An unexpected error occurred. Please try again.');
      }
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  async handleGoogleAuth() {
    try {
      // Show loading state
      const googleBtns = document.querySelectorAll('#googleSignIn, #googleSignUp');
      googleBtns.forEach(btn => {
        btn.textContent = 'Connecting to Google...';
        btn.disabled = true;
      });

      const { data, error } = await authService.signInWithGoogle();
      
      if (error) {
        console.error('Google sign-in error:', error);
        this.showAuthError('Google sign-in failed: ' + error.message);
        // Reset buttons
        googleBtns.forEach(btn => {
          btn.innerHTML = '<i class="fab fa-google"></i> Continue with Google';
          btn.disabled = false;
        });
      } else {
        // OAuth redirect will happen, so we don't need to handle success here
        console.log('Google OAuth initiated');
      }
    } catch (error) {
      console.error('Google auth exception:', error);
      this.showAuthError('An unexpected error occurred during Google sign-in');
      // Reset buttons
      const googleBtns = document.querySelectorAll('#googleSignIn, #googleSignUp');
      googleBtns.forEach(btn => {
        btn.innerHTML = '<i class="fab fa-google"></i> Continue with Google';
        btn.disabled = false;
      });
    }
  }

  showAuthError(message) {
    this.showAuthMessage(message, 'error');
  }

  showAuthSuccess(message) {
    this.showAuthMessage(message, 'success');
  }

  showAuthMessage(message, type) {
    // Remove existing messages
    const existing = document.querySelector('.auth-message');
    if (existing) existing.remove();

    const messageEl = document.createElement('div');
    messageEl.className = `auth-message ${type}`;
    messageEl.textContent = message;

    const authContent = document.querySelector('.auth-content');
    authContent.insertBefore(messageEl, authContent.firstChild);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove();
      }
    }, 5000);
  }

  showAuthenticatedState() {
    // Update header with user info
    this.updateHeaderWithUser();
    
    // Show authenticated features
    this.enableAuthenticatedFeatures();
  }

  async ensureUserProfile(user) {
    try {
      // For Google OAuth users, we need to ensure their profile exists
      if (user.app_metadata?.provider === 'google') {
        const username = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.email?.split('@')[0];
        
        await authService.createUserProfile(user.id, user.email, username);
      }
    } catch (error) {
      console.warn('Error ensuring user profile:', error);
      // Don't block the authentication flow for profile creation errors
    }
  }

  updateHeaderWithUser() {
    if (!this.currentUser) return;

    const header = document.querySelector('header .container');
    if (!header) return;

    // Remove existing user menu
    const existingMenu = document.getElementById('userMenu');
    if (existingMenu) existingMenu.remove();

    // Add user menu
    const userMenu = document.createElement('div');
    userMenu.id = 'userMenu';
    userMenu.className = 'user-menu';
    userMenu.innerHTML = `
      <div class="user-info">
        <div class="user-avatar">
          <img src="${this.currentUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${this.currentUser.email}&background=667eea&color=fff`}" alt="Avatar">
        </div>
        <div class="user-details">
          <span class="username">${this.currentUser.user_metadata?.username || this.currentUser.email}</span>
          <span class="user-level">Novice</span>
        </div>
      </div>
      <div class="user-dropdown">
        <button class="user-menu-btn">
          <i class="fas fa-chevron-down"></i>
        </button>
        <div class="user-dropdown-content">
          <a href="#" id="profileLink"><i class="fas fa-user"></i> Profile</a>
          <a href="#" id="challengesLink"><i class="fas fa-trophy"></i> Challenges</a>
          <a href="#" id="publicProfileLink"><i class="fas fa-globe"></i> Public Profile</a>
          <a href="#" id="settingsLink"><i class="fas fa-cog"></i> Settings</a>
          <div class="dropdown-divider"></div>
          <a href="#" id="signOutLink"><i class="fas fa-sign-out-alt"></i> Sign Out</a>
        </div>
      </div>
    `;

    header.appendChild(userMenu);

    // Setup user menu event listeners
    this.setupUserMenuListeners();
  }

  setupUserMenuListeners() {
    // Dropdown toggle
    const menuBtn = document.querySelector('.user-menu-btn');
    const dropdown = document.querySelector('.user-dropdown-content');
    
    menuBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      dropdown?.classList.remove('show');
    });

    // Menu item actions
    document.getElementById('signOutLink')?.addEventListener('click', async (e) => {
      e.preventDefault();
      await this.handleSignOut();
    });

    document.getElementById('profileLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showProfileModal();
    });

    document.getElementById('challengesLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showChallengesModal();
    });

    document.getElementById('publicProfileLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showPublicProfileModal();
    });
  }

  async handleSignOut() {
    try {
      const { error } = await authService.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  enableAuthenticatedFeatures() {
    // Enable social features
    this.enableSocialFeatures();
    
    // Enable advanced analytics
    this.enableAdvancedAnalytics();
    
    // Enable public profile
    this.enablePublicProfile();
  }

  enableSocialFeatures() {
    // Add social buttons to share section
    const shareSection = document.querySelector('.share-section');
    if (!shareSection) return;

    const socialFeatures = document.createElement('div');
    socialFeatures.className = 'social-features';
    socialFeatures.innerHTML = `
      <div class="social-buttons">
        <button id="challengeFriendsBtn" class="social-btn">
          <i class="fas fa-users"></i>
          Challenge Friends
        </button>
        <button id="joinChallengeBtn" class="social-btn">
          <i class="fas fa-trophy"></i>
          Join Challenge
        </button>
        <button id="publicProfileBtn" class="social-btn">
          <i class="fas fa-globe"></i>
          Public Profile
        </button>
      </div>
    `;

    shareSection.appendChild(socialFeatures);
  }

  enableAdvancedAnalytics() {
    // This will be implemented in the analytics module
  }

  enablePublicProfile() {
    // This will be implemented in the public profile module
  }

  showProfileModal() {
    // Implementation for profile modal
    console.log('Show profile modal');
  }

  showChallengesModal() {
    // Implementation for challenges modal
    console.log('Show challenges modal');
  }

  showPublicProfileModal() {
    // Implementation for public profile modal
    console.log('Show public profile modal');
  }
}

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.authUI = new AuthUI();
});

export { AuthUI };
export default AuthUI;
