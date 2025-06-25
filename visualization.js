// Advanced Visualization Engine with Interactive Timeline
import { dbService } from './supabase.js';

class CompoundingVisualization {
  constructor() {
    this.timelineChart = null;
    this.comparisonChart = null;
    this.avatarProgression = null;
    this.init();
  }

  init() {
    this.createInteractiveTimeline();
    this.createComparisonVisuals();
    this.createAvatarProgression();
    this.createMilestoneExplosions();
  }

  createInteractiveTimeline() {
    // Add timeline slider to chart section
    const chartSection = document.querySelector('.chart-section');
    if (!chartSection) return;

    const timelineContainer = document.createElement('div');
    timelineContainer.className = 'timeline-container';
    timelineContainer.innerHTML = `
      <div class="timeline-header">
        <h4>Future Growth Timeline</h4>
        <div class="timeline-info">
          <span class="timeline-day">Day <span id="timelineDay">30</span></span>
          <span class="timeline-improvement">+<span id="timelineImprovement">34.78</span>% better</span>
        </div>
      </div>
      
      <div class="timeline-slider-container">
        <input type="range" 
               id="timelineSlider" 
               min="1" 
               max="1000" 
               value="30" 
               class="timeline-slider">
        <div class="timeline-markers">
          <div class="marker" data-day="7">
            <span class="marker-day">7d</span>
            <span class="marker-label">First Week</span>
          </div>
          <div class="marker" data-day="30">
            <span class="marker-day">30d</span>
            <span class="marker-label">One Month</span>
          </div>
          <div class="marker" data-day="100">
            <span class="marker-day">100d</span>
            <span class="marker-label">Major</span>
          </div>
          <div class="marker" data-day="365">
            <span class="marker-day">365d</span>
            <span class="marker-label">One Year</span>
          </div>
          <div class="marker" data-day="1000">
            <span class="marker-day">1000d</span>
            <span class="marker-label">Master</span>
          </div>
        </div>
      </div>

      <div class="timeline-predictions">
        <div class="prediction-grid">
          <div class="prediction-item">
            <div class="prediction-icon">🔥</div>
            <div class="prediction-text">
              <strong>If you started today...</strong>
              <span id="futureProjection">In 30 days you'll be 34.78% better!</span>
            </div>
          </div>
        </div>
      </div>

      <div class="what-if-controls">
        <div class="what-if-grid">
          <div class="control-group">
            <label>Daily Improvement: <span id="improvementDisplay">1.0%</span></label>
            <input type="range" id="improvementRange" min="0.5" max="3.0" step="0.1" value="1.0">
          </div>
          <div class="control-group">
            <label>Consistency: <span id="consistencyDisplay">100%</span></label>
            <input type="range" id="consistencyRange" min="50" max="100" value="100">
          </div>
          <div class="control-group">
            <label>Habit Multiplier: <span id="multiplierDisplay">1.0x</span></label>
            <input type="range" id="multiplierRange" min="0.5" max="2.0" step="0.1" value="1.0">
          </div>
        </div>
      </div>
    `;

    const chartHeader = chartSection.querySelector('.chart-header');
    chartHeader.insertAdjacentElement('afterend', timelineContainer);

    this.setupTimelineListeners();
  }

  setupTimelineListeners() {
    const timelineSlider = document.getElementById('timelineSlider');
    const improvementRange = document.getElementById('improvementRange');
    const consistencyRange = document.getElementById('consistencyRange');
    const multiplierRange = document.getElementById('multiplierRange');

    // Timeline slider
    timelineSlider.addEventListener('input', (e) => {
      this.updateTimelineView(parseInt(e.target.value));
    });

    // What-if controls
    [improvementRange, consistencyRange, multiplierRange].forEach(control => {
      control.addEventListener('input', () => {
        this.updateWhatIfScenario();
      });
    });

    // Marker clicks
    document.querySelectorAll('.marker').forEach(marker => {
      marker.addEventListener('click', (e) => {
        const day = parseInt(e.currentTarget.dataset.day);
        timelineSlider.value = day;
        this.updateTimelineView(day);
      });
    });
  }

  updateTimelineView(days) {
    const improvement = this.calculateAdvancedGrowth(days);
    
    document.getElementById('timelineDay').textContent = days;
    document.getElementById('timelineImprovement').textContent = improvement.toFixed(2);
    
    // Update future projection
    const projectionText = this.generateProjectionText(days, improvement);
    document.getElementById('futureProjection').textContent = projectionText;

    // Update timeline chart
    this.updateTimelineChart(days);
    
    // Update avatar progression
    this.updateAvatarProgression(days);

    // Animate the timeline
    this.animateTimeline(days);
  }

  calculateAdvancedGrowth(days, dailyImprovement = 1.01, consistency = 1.0, multiplier = 1.0) {
    const improvementRate = 1 + (dailyImprovement - 1) * multiplier;
    const effectiveDays = days * (consistency / 100);
    return (Math.pow(improvementRate, effectiveDays) - 1) * 100;
  }

  updateWhatIfScenario() {
    const improvement = parseFloat(document.getElementById('improvementRange').value);
    const consistency = parseFloat(document.getElementById('consistencyRange').value);
    const multiplier = parseFloat(document.getElementById('multiplierRange').value);
    const days = parseInt(document.getElementById('timelineSlider').value);

    // Update displays
    document.getElementById('improvementDisplay').textContent = improvement.toFixed(1) + '%';
    document.getElementById('consistencyDisplay').textContent = consistency.toFixed(0) + '%';
    document.getElementById('multiplierDisplay').textContent = multiplier.toFixed(1) + 'x';

    // Recalculate with new parameters
    const dailyRate = 1 + (improvement / 100);
    const newImprovement = this.calculateAdvancedGrowth(days, dailyRate, consistency, multiplier);
    
    document.getElementById('timelineImprovement').textContent = newImprovement.toFixed(2);
    
    // Update charts with new scenario
    this.updateTimelineChart(days, dailyRate, consistency / 100, multiplier);
  }

  generateProjectionText(days, improvement) {
    const scenarios = [
      { days: 7, text: (imp) => `In one week you'll have built a foundation ${imp.toFixed(1)}% stronger!` },
      { days: 30, text: (imp) => `In one month you'll be ${imp.toFixed(1)}% better - that's like getting a month's salary bonus in skill!` },
      { days: 100, text: (imp) => `In 100 days you'll be ${imp.toFixed(0)}% better - over 2.5x your current ability!` },
      { days: 365, text: (imp) => `In one year you'll be ${(imp/100).toFixed(0)}x better - completely transformed!` },
      { days: 1000, text: (imp) => `In 1000 days you'll be ${(imp/1000).toFixed(0)}k% better - virtually superhuman!` }
    ];

    const closest = scenarios.reduce((prev, curr) => 
      Math.abs(curr.days - days) < Math.abs(prev.days - days) ? curr : prev
    );

    return closest.text(improvement);
  }

  createComparisonVisuals() {
    // Add comparison section after daily check-in
    const dailyCheckin = document.querySelector('.daily-checkin');
    if (!dailyCheckin) return;

    const comparisonSection = document.createElement('section');
    comparisonSection.className = 'comparison-visuals';
    comparisonSection.innerHTML = `
      <div class="comparison-header">
        <h3>Your Transformation</h3>
        <p>See how far you've come</p>
      </div>
      
      <div class="comparison-container">
        <div class="comparison-side" id="day1Side">
          <div class="comparison-avatar">
            <div class="avatar-image" id="day1Avatar">🌱</div>
            <div class="avatar-stats">
              <span class="avatar-level">Day 1</span>
              <span class="avatar-power">Baseline</span>
            </div>
          </div>
          <div class="comparison-metrics">
            <div class="metric">
              <span class="metric-label">Skill Level</span>
              <div class="metric-bar">
                <div class="metric-fill" style="width: 10%"></div>
              </div>
              <span class="metric-value">10%</span>
            </div>
          </div>
        </div>

        <div class="comparison-vs">
          <div class="vs-circle">
            <span>VS</span>
            <div class="growth-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>

        <div class="comparison-side" id="todaySide">
          <div class="comparison-avatar">
            <div class="avatar-image" id="todayAvatar">🌱</div>
            <div class="avatar-stats">
              <span class="avatar-level" id="currentDay">Day 1</span>
              <span class="avatar-power" id="currentPower">Baseline</span>
            </div>
          </div>
          <div class="comparison-metrics">
            <div class="metric">
              <span class="metric-label">Skill Level</span>
              <div class="metric-bar">
                <div class="metric-fill" id="currentSkillFill" style="width: 10%"></div>
              </div>
              <span class="metric-value" id="currentSkillValue">10%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="transformation-stats">
        <div class="stat-item">
          <div class="stat-icon">📈</div>
          <div class="stat-info">
            <span class="stat-value" id="improvementStat">0%</span>
            <span class="stat-label">Improvement</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">🔥</div>
          <div class="stat-info">
            <span class="stat-value" id="streakStat">0</span>
            <span class="stat-label">Day Streak</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <span class="stat-value" id="levelStat">Novice</span>
            <span class="stat-label">Level</span>
          </div>
        </div>
      </div>
    `;

    dailyCheckin.insertAdjacentElement('afterend', comparisonSection);
  }

  createAvatarProgression() {
    this.avatarStages = [
      { min: 1, max: 6, emoji: '🌱', name: 'Seedling', color: '#90EE90' },
      { min: 7, max: 20, emoji: '🌿', name: 'Sprout', color: '#32CD32' },
      { min: 21, max: 49, emoji: '🌳', name: 'Sapling', color: '#228B22' },
      { min: 50, max: 99, emoji: '🌲', name: 'Young Tree', color: '#006400' },
      { min: 100, max: 199, emoji: '🎋', name: 'Strong Tree', color: '#2E8B57' },
      { min: 200, max: 364, emoji: '🌳', name: 'Mighty Oak', color: '#8B4513' },
      { min: 365, max: 999, emoji: '🌟', name: 'Legendary', color: '#FFD700' },
      { min: 1000, max: Infinity, emoji: '👑', name: 'Master', color: '#8A2BE2' }
    ];
  }

  updateAvatarProgression(days) {
    const stage = this.avatarStages.find(s => days >= s.min && days <= s.max) || this.avatarStages[0];
    
    const todayAvatar = document.getElementById('todayAvatar');
    const currentDay = document.getElementById('currentDay');
    const currentPower = document.getElementById('currentPower');
    
    if (todayAvatar) {
      todayAvatar.textContent = stage.emoji;
      todayAvatar.style.backgroundColor = stage.color + '20';
      todayAvatar.style.borderColor = stage.color;
    }
    
    if (currentDay) currentDay.textContent = `Day ${days}`;
    if (currentPower) currentPower.textContent = stage.name;

    // Update skill metrics
    const improvement = this.calculateAdvancedGrowth(days);
    const skillLevel = Math.min(100, 10 + (improvement / 10)); // Scale to 100%
    
    const currentSkillFill = document.getElementById('currentSkillFill');
    const currentSkillValue = document.getElementById('currentSkillValue');
    
    if (currentSkillFill) {
      currentSkillFill.style.width = `${skillLevel}%`;
      currentSkillFill.style.backgroundColor = stage.color;
    }
    if (currentSkillValue) currentSkillValue.textContent = `${skillLevel.toFixed(0)}%`;

    // Update transformation stats
    this.updateTransformationStats(days, improvement, stage.name);
  }

  updateTransformationStats(days, improvement, level) {
    const improvementStat = document.getElementById('improvementStat');
    const streakStat = document.getElementById('streakStat');
    const levelStat = document.getElementById('levelStat');

    if (improvementStat) improvementStat.textContent = `+${improvement.toFixed(1)}%`;
    if (streakStat) streakStat.textContent = days.toString();
    if (levelStat) levelStat.textContent = level;
  }

  createMilestoneExplosions() {
    this.milestoneAnimations = {
      7: () => this.createExplosionAnimation('🔥', 'First Week Complete!'),
      21: () => this.createExplosionAnimation('💪', 'Habit Formed!'),
      30: () => this.createExplosionAnimation('📈', 'One Month Strong!'),
      100: () => this.createExplosionAnimation('🚀', 'Triple Digits!'),
      365: () => this.createExplosionAnimation('👑', 'Year Master!'),
      1000: () => this.createExplosionAnimation('⭐', 'Legend Status!')
    };
  }

  createExplosionAnimation(emoji, message) {
    const explosion = document.createElement('div');
    explosion.className = 'milestone-explosion';
    explosion.innerHTML = `
      <div class="explosion-content">
        <div class="explosion-emoji">${emoji}</div>
        <div class="explosion-message">${message}</div>
        <div class="explosion-particles">
          ${Array.from({length: 12}, (_, i) => 
            `<div class="particle" style="--delay: ${i * 0.1}s; --angle: ${i * 30}deg"></div>`
          ).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(explosion);

    // Trigger animation
    setTimeout(() => explosion.classList.add('animate'), 100);

    // Remove after animation
    setTimeout(() => {
      if (explosion.parentNode) {
        explosion.remove();
      }
    }, 3000);

    // Update chart with explosion effect
    this.addChartExplosionEffect();
  }

  addChartExplosionEffect() {
    // Add visual explosion effect to the growth chart
    if (this.timelineChart) {
      // Temporarily change chart colors and add glow effect
      const originalColor = this.timelineChart.data.datasets[0].borderColor;
      this.timelineChart.data.datasets[0].borderColor = '#FFD700';
      this.timelineChart.data.datasets[0].borderWidth = 5;
      this.timelineChart.data.datasets[0].backgroundColor = 'rgba(255, 215, 0, 0.3)';
      this.timelineChart.update('none');

      // Reset after 2 seconds
      setTimeout(() => {
        this.timelineChart.data.datasets[0].borderColor = originalColor;
        this.timelineChart.data.datasets[0].borderWidth = 3;
        this.timelineChart.data.datasets[0].backgroundColor = 'rgba(102, 126, 234, 0.1)';
        this.timelineChart.update('none');
      }, 2000);
    }
  }

  updateTimelineChart(days, dailyImprovement = 1.01, consistency = 1.0, multiplier = 1.0) {
    if (!this.timelineChart) {
      this.initTimelineChart();
    }

    // Generate data points for smooth curve
    const dataPoints = [];
    const labels = [];
    const maxDays = Math.max(days, 365);
    const step = Math.max(1, Math.floor(maxDays / 100)); // Max 100 points for performance

    for (let i = 1; i <= maxDays; i += step) {
      const improvement = this.calculateAdvancedGrowth(i, dailyImprovement, consistency, multiplier);
      dataPoints.push(improvement);
      labels.push(i === 1 ? 'Day 1' : i.toString());
    }

    // Mark current position
    const currentIndex = Math.floor((days - 1) / step);
    const pointColors = dataPoints.map((_, index) => 
      index === currentIndex ? '#e74c3c' : '#667eea'
    );
    const pointSizes = dataPoints.map((_, index) => 
      index === currentIndex ? 8 : 4
    );

    this.timelineChart.data.labels = labels;
    this.timelineChart.data.datasets[0].data = dataPoints;
    this.timelineChart.data.datasets[0].pointBackgroundColor = pointColors;
    this.timelineChart.data.datasets[0].pointRadius = pointSizes;
    
    this.timelineChart.update('none');
  }

  initTimelineChart() {
    const ctx = document.getElementById('growthChart').getContext('2d');
    // Destroy existing chart to prevent duplicate errors
    if (this.timelineChart) {
      this.timelineChart.destroy();
    }
    this.timelineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          { label: 'Actual', data: [], borderColor: '#667eea' },
          { label: 'Potential', data: [], borderColor: '#764ba2' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Day ${context.label}: +${context.parsed.y.toFixed(2)}% better`
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Days' },
            grid: { color: 'rgba(0,0,0,0.1)' }
          },
          y: {
            title: { display: true, text: 'Improvement (%)' },
            grid: { color: 'rgba(0,0,0,0.1)' },
            ticks: {
              callback: (value) => '+' + value.toFixed(0) + '%'
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    });
  }

  toggleTimeline() {
    console.log('Toggling timeline display');
    const timelineElem = document.getElementById('timelineContainer');
    if (timelineElem) {
      timelineElem.classList.toggle('hidden');
    }
  }

  animateTimeline(days) {
    // Add pulse animation to timeline elements
    const timelineDay = document.getElementById('timelineDay');
    const timelineImprovement = document.getElementById('timelineImprovement');
    
    [timelineDay, timelineImprovement].forEach(el => {
      if (el) {
        el.classList.add('pulse-animation');
        setTimeout(() => el.classList.remove('pulse-animation'), 600);
      }
    });

    // Animate slider thumb
    const slider = document.getElementById('timelineSlider');
    if (slider) {
      slider.classList.add('slider-glow');
      setTimeout(() => slider.classList.remove('slider-glow'), 800);
    }
  }

  // Public method to trigger milestone explosion
  triggerMilestoneExplosion(day) {
    if (this.milestoneAnimations[day]) {
      this.milestoneAnimations[day]();
    }
  }

  // Update visualization when user data changes
  updateWithUserData(userData) {
    if (!userData) return;

    const { streak, currentHabit, improvement } = userData;
    
    // Update timeline to current position
    const timelineSlider = document.getElementById('timelineSlider');
    if (timelineSlider && streak > 0) {
      timelineSlider.value = streak;
      this.updateTimelineView(streak);
    }

    // Update avatar progression
    this.updateAvatarProgression(streak);

    // Update transformation stats
    const improvementValue = improvement || this.calculateAdvancedGrowth(streak);
    this.updateTransformationStats(streak, improvementValue, this.getCurrentLevel(streak));
  }

  getCurrentLevel(days) {
    const stage = this.avatarStages.find(s => days >= s.min && days <= s.max);
    return stage ? stage.name : 'Novice';
  }
}

// Initialize visualization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.compoundingViz = new CompoundingVisualization();
});

export { CompoundingVisualization as VisualizationEngine };
export default CompoundingVisualization;
