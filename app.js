// Global Variables
let habits = [];
let selectedIcon = null;
let selectedColor = '#6366f1';
let completedToday = new Set();
let streaks = {};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadHabits();
    initializeEventListeners();
    renderApp();
    createSampleHabits();
});

// Theme Management
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    updateThemeIcon();
});

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon();
    }
}

function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Initialize Event Listeners
function initializeEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = link.getAttribute('href').substring(1);
            switchTab(tabName);
        });
    });

    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const filter = e.target.dataset.filter;
            filterHabits(filter);
        });
    });

    // Add Habit Form
    document.getElementById('createHabitBtn').addEventListener('click', createHabit);
    document.getElementById('cancelBtn').addEventListener('click', () => switchTab('home'));
    document.querySelector('.add-habit-link').addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('add');
    });

    // Icon Selector
    document.querySelectorAll('.icon-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            selectedIcon = this.dataset.icon;
        });
    });

    // Color Selector
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            selectedColor = this.dataset.color;
        });
    });
}

// Tab Switching
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector(`[href="#${tabName}"]`).classList.add('active');

    if (tabName === 'home') {
        renderApp();
    } else if (tabName === 'social') {
        renderSocial();
    } else if (tabName === 'add') {
        resetForm();
    } else if (tabName === 'profile') {
        updateStats();
    }
}

// Create Sample Habits
function createSampleHabits() {
    if (habits.length === 0) {
        const sampleHabits = [
            {
                id: 1,
                name: 'Morning Meditation',
                description: 'Start the day with mindfulness',
                icon: '🧘',
                color: '#6366f1',
                frequency: 'daily',
                goal: 7,
                completedDates: [],
                createdDate: new Date()
            },
            {
                id: 2,
                name: 'Exercise',
                description: 'Keep your body active and strong',
                icon: '🏃',
                color: '#ec4899',
                frequency: 'daily',
                goal: 5,
                completedDates: [],
                createdDate: new Date()
            },
            {
                id: 3,
                name: 'Read 30 Minutes',
                description: 'Expand your knowledge',
                icon: '📚',
                color: '#f59e0b',
                frequency: 'daily',
                goal: 7,
                completedDates: [],
                createdDate: new Date()
            },
            {
                id: 4,
                name: 'Coding Practice',
                description: 'Improve programming skills',
                icon: '💻',
                color: '#10b981',
                frequency: 'daily',
                goal: 6,
                completedDates: [],
                createdDate: new Date()
            }
        ];
        habits = sampleHabits;
        saveHabits();
    }
}

// Create Habit
function createHabit() {
    const name = document.getElementById('habitName').value.trim();
    const description = document.getElementById('habitDescription').value.trim();
    const frequency = document.getElementById('habitFrequency').value;
    const goal = parseInt(document.getElementById('habitGoal').value);

    if (!name) {
        showNotification('Please enter a habit name!', 'error');
        return;
    }

    if (!selectedIcon) {
        showNotification('Please select an icon!', 'error');
        return;
    }

    const habit = {
        id: Date.now(),
        name,
        description,
        icon: selectedIcon,
        color: selectedColor,
        frequency,
        goal,
        completedDates: [],
        createdDate: new Date()
    };

    habits.push(habit);
    saveHabits();
    showNotification('🎉 Habit created successfully!');
    triggerConfetti();
    switchTab('home');
}

// Delete Habit
function deleteHabit(id) {
    if (confirm('Are you sure you want to delete this habit?')) {
        habits = habits.filter(h => h.id !== id);
        saveHabits();
        renderApp();
        showNotification('Habit deleted');
    }
}

// Mark Habit as Complete
function completeHabit(id) {
    const today = new Date().toDateString();
    const habit = habits.find(h => h.id === id);

    if (!habit.completedDates.includes(today)) {
        habit.completedDates.push(today);
        completedToday.add(id);
        saveHabits();
        showNotification(`🎉 Great job! ${habit.name} completed!`);
        triggerConfetti();
    }

    renderApp();
}

// Filter Habits
function filterHabits(filter) {
    const container = document.getElementById('todayHabits');
    let filtered = habits;

    if (filter === 'completed') {
        filtered = habits.filter(h => h.completedDates.includes(new Date().toDateString()));
    } else if (filter === 'active') {
        filtered = habits.filter(h => !h.completedDates.includes(new Date().toDateString()));
    }

    renderHabits(filtered, container);
}

// Calculate Streak
function getStreak(habit) {
    let streak = 0;
    let date = new Date();

    for (let i = 0; i < 365; i++) {
        const dateStr = date.toDateString();
        if (habit.completedDates.includes(dateStr)) {
            streak++;
        } else if (i > 0) {
            break;
        }
        date.setDate(date.getDate() - 1);
    }

    return streak;
}

// Render App
function renderApp() {
    renderTodayHabits();
    renderWeekChart();
    renderCompletedToday();
    updateStats();
}

// Render Today's Habits
function renderTodayHabits() {
    const container = document.getElementById('todayHabits');
    renderHabits(habits, container);
}

// Render Habits Grid
function renderHabits(habitsToRender, container) {
    container.innerHTML = habitsToRender.map(habit => {
        const today = new Date().toDateString();
        const isCompleted = habit.completedDates.includes(today);
        const streak = getStreak(habit);
        const progress = (habit.completedDates.length / (habit.goal * 4)) * 100; // Approximate

        return `
            <div class="habit-card ${isCompleted ? 'completed' : ''}" style="border-color: ${habit.color};">
                <span class="habit-icon">${habit.icon}</span>
                <h3 class="habit-name">${habit.name}</h3>
                <p class="habit-description">${habit.description}</p>
                <div class="habit-streak">
                    <i class="fas fa-fire"></i>
                    ${streak} day streak
                </div>
                <div class="habit-progress">
                    <div class="habit-progress-bar" style="width: ${Math.min(progress, 100)}%; background: ${habit.color};"></div>
                </div>
                <div class="habit-actions">
                    <button class="check-btn ${isCompleted ? 'checked' : ''}" onclick="completeHabit(${habit.id})">
                        <i class="fas fa-check"></i> ${isCompleted ? 'Completed' : 'Complete'}
                    </button>
                    <button class="delete-btn" onclick="deleteHabit(${habit.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Render Week Chart
function renderWeekChart() {
    const container = document.getElementById('weekChart');
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let html = '';

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
        const percentage = (completedCount / habits.length) * 100;

        html += `
            <div class="day-chart ${completedCount > 0 ? 'active' : ''}">
                <div class="day-name">${days[(6 - i) % 7]}</div>
                <div class="day-bar">
                    <div class="day-fill" style="height: ${percentage}%;"></div>
                    <div class="day-number">${completedCount}/${habits.length}</div>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

// Render Completed Today
function renderCompletedToday() {
    const today = new Date().toDateString();
    const completed = habits.filter(h => h.completedDates.includes(today));
    const container = document.getElementById('completedToday');

    if (completed.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 20px;">No habits completed yet. Start now! 💪</p>';
        return;
    }

    container.innerHTML = completed.map(habit => `
        <div class="completed-item">
            <span class="icon">${habit.icon}</span>
            <div class="info">
                <div class="name">${habit.name}</div>
                <div class="time">Completed today</div>
            </div>
            <span class="checkmark"><i class="fas fa-check-circle"></i></span>
        </div>
    `).join('');
}

// Render Social Tab
function renderSocial() {
    renderLeaderboard();
    renderFriendsActivity();
    renderChallenges();
}

// Render Leaderboard
function renderLeaderboard() {
    const leaderboard = [
        { rank: 1, name: 'You', avatar: 'christochinni', streak: 45, points: 2450 },
        { rank: 2, name: 'John Doe', avatar: 'john', streak: 32, points: 2100 },
        { rank: 3, name: 'Sarah Smith', avatar: 'sarah', streak: 28, points: 1890 },
        { rank: 4, name: 'Mike Johnson', avatar: 'mike', streak: 21, points: 1560 },
        { rank: 5, name: 'Emma Wilson', avatar: 'emma', streak: 18, points: 1320 }
    ];

    const container = document.getElementById('leaderboard');
    container.innerHTML = leaderboard.map(item => `
        <div class="leaderboard-item">
            <div class="rank ${item.rank <= 3 ? 'top' : ''}">
                ${item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : item.rank}
            </div>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${item.avatar}" alt="Avatar" class="lb-avatar">
            <div class="lb-info">
                <div class="lb-name">${item.name}</div>
                <div class="lb-streak"><i class="fas fa-fire"></i> ${item.streak} day streak</div>
            </div>
            <div class="lb-points">${item.points} pts</div>
        </div>
    `).join('');
}

// Render Friends Activity
function renderFriendsActivity() {
    const activities = [
        { user: 'John Doe', action: 'completed 5 habits', time: '2 hours ago' },
        { user: 'Sarah Smith', action: 'started a 30-day challenge', time: '4 hours ago' },
        { user: 'Mike Johnson', action: 'reached a 10 day streak', time: '1 day ago' },
        { user: 'Emma Wilson', action: 'completed Morning Meditation', time: '1 day ago' }
    ];

    const container = document.getElementById('friendsActivity');
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-user">👤 ${activity.user}</div>
            <div class="activity-action">${activity.action}</div>
            <div class="activity-time">${activity.time}</div>
        </div>
    `).join('');
}

// Render Challenges
function renderChallenges() {
    const challenges = [
        { title: '🔥 7-Day Meditation', progress: 5, goal: 7 },
        { title: '💪 30-Day Workout', progress: 12, goal: 30 },
        { title: '📚 Read Every Day', progress: 8, goal: 30 }
    ];

    const container = document.getElementById('challenges');
    container.innerHTML = challenges.map(challenge => {
        const percentage = (challenge.progress / challenge.goal) * 100;
        return `
            <div class="challenge-item">
                <div class="challenge-title">${challenge.title}</div>
                <div class="challenge-progress">
                    <div class="challenge-progress-bar" style="width: ${percentage}%;"></div>
                </div>
                <div class="challenge-info">
                    <span>${challenge.progress}/${challenge.goal}</span>
                    <span>${Math.round(percentage)}%</span>
                </div>
            </div>
        `;
    }).join('');
}

// Update Stats
function updateStats() {
    const today = new Date().toDateString();
    const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
    const totalCompleted = habits.reduce((sum, h) => sum + h.completedDates.length, 0);
    const maxStreak = Math.max(...habits.map(h => getStreak(h)), 0);
    const dailyGoal = habits.length * 7; // Assume all are daily, 7 day goal
    const weekProgress = Math.round((completedToday / dailyGoal) * 100);

    document.getElementById('currentStreak').textContent = maxStreak;
    document.getElementById('totalCompleted').textContent = totalCompleted;
    document.getElementById('habitsTracked').textContent = habits.length;
    document.getElementById('progressPercent').textContent = Math.min(weekProgress, 100) + '%';

    // Update progress circle
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (weekProgress / 100) * circumference;
    document.getElementById('progressCircle').style.strokeDashoffset = offset;
}

// Reset Form
function resetForm() {
    document.getElementById('habitName').value = '';
    document.getElementById('habitDescription').value = '';
    document.getElementById('habitFrequency').value = 'daily';
    document.getElementById('habitGoal').value = 7;
    document.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
    document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
    selectedIcon = null;
    selectedColor = '#6366f1';
}

// Notifications
function showNotification(message, type = 'success') {
    const toast = document.getElementById('notificationToast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Confetti Animation
function triggerConfetti() {
    const canvas = document.getElementById('confetti');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height - canvas.height;
            this.size = Math.random() * 10 + 5;
            this.speedX = Math.random() * 4 - 2;
            this.speedY = Math.random() * 5 + 2;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 10 - 5;
            this.color = ['#6366f1', '#ec4899', '#f59e0b', '#10b981'][Math.floor(Math.random() * 4)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
            this.speedY += 0.2; // gravity
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }

    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();

            if (particles[i].y > canvas.height) {
                particles.splice(i, 1);
            }
        }

        if (particles.length > 0) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

// Local Storage
function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

function loadHabits() {
    const stored = localStorage.getItem('habits');
    if (stored) {
        habits = JSON.parse(stored);
    }
}

// Update motivational text
function updateMotivationalText() {
    const texts = [
        "Let's build some amazing habits today! 💪",
        "You got this! Every day is a new opportunity! 🌟",
        "Small steps lead to big changes! 🚀",
        "Progress over perfection! 📈",
        "Your future self will thank you! 🙏"
    ];
    const random = texts[Math.floor(Math.random() * texts.length)];
    document.getElementById('motivationalText').textContent = random;
}

// Call motivational text on load
updateMotivationalText();

console.log('🔥 HabitFlow App is running! Build better habits, one day at a time!');
