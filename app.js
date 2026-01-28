// ============================================
// APP.JS - Logica Aplicației
// Grile Genetică Medicală
// ============================================

class GeneticaApp {
    constructor() {
        // State
        this.currentCourse = null;
        this.selectedType = 'all';
        this.selectedLimit = 20;
        this.quizMode = 'practice';
        
        // Quiz state
        this.questions = [];
        this.currentIndex = 0;
        this.userAnswers = [];
        this.selectedOptions = [];
        this.startTime = null;
        
        // Initialize
        this.init();
    }
    
    init() {
        console.log('🧬 Grile Genetică Medicală - Pornit');
        this.loadProgress();
    }
    
    // ============================================
    // NAVIGATION
    // ============================================
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
        }
    }
    
    startApp() {
        this.showCoursesScreen();
    }
    
    showCoursesScreen() {
        this.showScreen('coursesScreen');
        this.renderCourses();
        this.updateGlobalStats();
    }
    
    showConfigScreen(courseId) {
        this.currentCourse = COURSES.find(c => c.id === courseId);
        if (!this.currentCourse) {
            console.error('Curs negăsit:', courseId);
            return;
        }
        
        this.showScreen('configScreen');
        this.renderConfig();
    }
    
    // ============================================
    // RENDER COURSES
    // ============================================
    
    renderCourses() {
        const grid = document.getElementById('coursesGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        COURSES.forEach(course => {
            const card = this.createCourseCard(course);
            grid.appendChild(card);
        });
    }
    
    createCourseCard(course) {
        const progress = this.getCourseProgress(course.id);
        const attempted = progress.attempted;
        const total = course.totalQuestions;
        const percentage = total > 0 ? Math.round((attempted / total) * 100) : 0;
        
        const card = document.createElement('div');
        card.className = 'course-card';
        card.onclick = () => this.showConfigScreen(course.id);
        
        card.innerHTML = `
            <div class="course-header-content">
                <div class="course-emoji">${course.icon}</div>
                <div>
                    <div class="course-title">${course.name}</div>
                    <div class="course-subtitle">${course.description}</div>
                </div>
            </div>
            <div class="course-progress-section">
                <div class="progress-info">
                    <span style="color: var(--text-secondary);">Progres</span>
                    <span style="font-weight: 600;">${percentage}%</span>
                </div>
                <div class="progress-track">
                    <div class="progress-bar" style="width: ${percentage}%"></div>
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                    ${attempted}/${total} întrebări
                </div>
            </div>
        `;
        
        return card;
    }
    
    // ============================================
    // CONFIG SCREEN
    // ============================================
    
    renderConfig() {
        const titleEl = document.getElementById('configCourseTitle');
        if (titleEl) {
            titleEl.textContent = this.currentCourse.name;
        }
        
        const stats = getCourseStats(this.currentCourse.id);
        
        const countAll = document.getElementById('countAll');
        const countSimplu = document.getElementById('countSimplu');
        const countMultiplu = document.getElementById('countMultiplu');
        
        if (countAll) countAll.textContent = stats.total;
        if (countSimplu) countSimplu.textContent = stats.simplu;
        if (countMultiplu) countMultiplu.textContent = stats.multiplu;
    }
    
    selectType(type) {
        this.selectedType = type;
        
        document.querySelectorAll('[data-type]').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const btn = document.querySelector(`[data-type="${type}"]`);
        if (btn) {
            btn.classList.add('active');
        }
    }
    
    selectLimit(limit) {
        this.selectedLimit = limit;
        
        document.querySelectorAll('[data-limit]').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const btn = document.querySelector(`[data-limit="${limit}"]`);
        if (btn) {
            btn.classList.add('active');
        }
    }
    
    // ============================================
    // START QUIZ
    // ============================================
    
    startQuiz(mode) {
        this.quizMode = mode;
        
        // Get questions
        let questions = getCourseQuestions(this.currentCourse.id);
        
        if (questions.length === 0) {
            alert('Nu există întrebări disponibile pentru acest curs!');
            return;
        }
        
        // Filter by type
        if (this.selectedType !== 'all') {
            questions = questions.filter(q => q.type === this.selectedType);
        }
        
        // Shuffle
        questions = this.shuffle([...questions]);
        
        // Limit
        if (this.selectedLimit !== 'all') {
            questions = questions.slice(0, this.selectedLimit);
        }
        
        if (questions.length === 0) {
            alert('Nu există întrebări pentru această selecție!');
            return;
        }
        
        // Initialize quiz
        this.questions = questions;
        this.currentIndex = 0;
        this.userAnswers = new Array(questions.length).fill(null);
        this.selectedOptions = [];
        this.startTime = Date.now();
        
        this.showScreen('quizScreen');
        this.renderQuestion();
    }
    
    // ============================================
    // RENDER QUESTION
    // ============================================
    
    renderQuestion() {
        const question = this.questions[this.currentIndex];
        if (!question) return;
        
        // Update progress
        const progressText = document.getElementById('progressText');
        if (progressText) {
            progressText.textContent = `${this.currentIndex + 1} / ${this.questions.length}`;
        }
        
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            const percent = ((this.currentIndex + 1) / this.questions.length) * 100;
            progressBar.style.width = `${percent}%`;
        }
        
        // Update badge
        const badge = document.getElementById('questionBadge');
        if (badge) {
            const text = question.type === 'multiplu' 
                ? 'ℹ️ Selectează 2 răspunsuri corecte' 
                : 'ℹ️ Selectează 1 răspuns corect';
            badge.textContent = text;
        }
        
        // Update question text
        const questionText = document.getElementById('questionText');
        if (questionText) {
            questionText.textContent = question.text;
        }
        
        // Render options
        this.renderOptions();
        
        // Hide feedback
        const feedback = document.getElementById('feedbackBox');
        if (feedback) {
            feedback.style.display = 'none';
        }
        
        // Update buttons
        this.updateButtons();
    }
    
    renderOptions() {
        const question = this.questions[this.currentIndex];
        const grid = document.getElementById('answersGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const userAnswer = this.userAnswers[this.currentIndex];
        const isAnswered = userAnswer !== null;
        
        Object.entries(question.options).forEach(([key, text]) => {
            const option = document.createElement('div');
            option.className = 'answer-option';
            option.dataset.key = key;
            
            // Add click handler only if not answered
            if (!isAnswered) {
                option.onclick = () => this.selectOption(key);
            }
            
            // Check if selected
            const isSelected = this.selectedOptions.includes(key);
            if (isSelected) {
                option.classList.add('selected');
            }
            
            // Show feedback if answered (practice mode only)
            if (isAnswered && this.quizMode === 'practice') {
                const isCorrect = question.correct.includes(key);
                const wasSelected = userAnswer.includes(key);
                
                if (isCorrect) {
                    option.classList.add('correct');
                } else if (wasSelected) {
                    option.classList.add('wrong');
                }
            }
            
            option.innerHTML = `
                <div class="answer-check"></div>
                <span class="answer-label">${key}.</span>
                <span class="answer-text">${text}</span>
            `;
            
            grid.appendChild(option);
        });
    }
    
    selectOption(key) {
        const question = this.questions[this.currentIndex];
        const isMultiple = question.type === 'multiplu';
        
        if (isMultiple) {
            // Toggle selection
            const index = this.selectedOptions.indexOf(key);
            if (index > -1) {
                this.selectedOptions.splice(index, 1);
            } else if (this.selectedOptions.length < 2) {
                this.selectedOptions.push(key);
            }
        } else {
            this.selectedOptions = [key];
        }
        
        this.renderOptions();
        this.updateButtons();
    }
    
    // ============================================
    // CHECK ANSWER
    // ============================================
    
    checkAnswer() {
        if (this.selectedOptions.length === 0) return;
        
        const question = this.questions[this.currentIndex];
        this.userAnswers[this.currentIndex] = [...this.selectedOptions];
        
        if (this.quizMode === 'practice') {
            this.showFeedback();
        }
        
        this.renderOptions();
        this.updateButtons();
    }
    
    showFeedback() {
        const question = this.questions[this.currentIndex];
        const userAnswer = this.userAnswers[this.currentIndex];
        const isCorrect = this.isCorrectAnswer(userAnswer, question.correct);
        
        const feedback = document.getElementById('feedbackBox');
        if (!feedback) return;
        
        feedback.style.display = 'block';
        feedback.className = `feedback-box ${isCorrect ? 'correct' : 'wrong'}`;
        
        const icon = isCorrect ? '✓' : '✗';
        const title = isCorrect ? 'Corect!' : 'Greșit';
        const correctText = !isCorrect ? `<p style="margin-top: 0.5rem;">Răspuns corect: <strong>${question.correct.join(', ')}</strong></p>` : '';
        const explanation = question.explanation ? `<p style="margin-top: 1rem; color: var(--text-secondary);">${question.explanation}</p>` : '';
        
        feedback.innerHTML = `
            <div class="feedback-title">${icon} ${title}</div>
            ${correctText}
            ${explanation}
        `;
    }
    
    isCorrectAnswer(userAnswer, correctAnswer) {
        if (!userAnswer || !correctAnswer) return false;
        if (userAnswer.length !== correctAnswer.length) return false;
        
        const sorted1 = [...userAnswer].sort().join('');
        const sorted2 = [...correctAnswer].sort().join('');
        
        return sorted1 === sorted2;
    }
    
    // ============================================
    // NAVIGATION BUTTONS
    // ============================================
    
    updateButtons() {
        const isAnswered = this.userAnswers[this.currentIndex] !== null;
        const canSubmit = this.selectedOptions.length > 0;
        const isLast = this.currentIndex === this.questions.length - 1;
        
        const btnSubmit = document.getElementById('btnSubmit');
        const btnPrev = document.getElementById('btnPrev');
        const btnNext = document.getElementById('btnNext');
        
        if (btnSubmit) {
            btnSubmit.style.display = isAnswered ? 'none' : 'block';
            btnSubmit.disabled = !canSubmit;
        }
        
        if (btnPrev) {
            btnPrev.disabled = this.currentIndex === 0;
        }
        
        if (btnNext) {
            btnNext.disabled = !isAnswered;
            btnNext.textContent = isLast ? 'Finalizează' : 'Următoarea';
        }
    }
    
    prevQuestion() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.selectedOptions = this.userAnswers[this.currentIndex] ? [...this.userAnswers[this.currentIndex]] : [];
            this.renderQuestion();
        }
    }
    
    nextQuestion() {
        if (this.currentIndex < this.questions.length - 1) {
            this.currentIndex++;
            this.selectedOptions = this.userAnswers[this.currentIndex] ? [...this.userAnswers[this.currentIndex]] : [];
            this.renderQuestion();
        } else {
            this.finishQuiz();
        }
    }
    
    confirmExit() {
        if (confirm('Sigur vrei să ieși? Progresul nesalvat va fi pierdut.')) {
            this.showCoursesScreen();
        }
    }
    
    toggleMenu() {
        alert('Meniu în lucru!');
    }
    
    // ============================================
    // FINISH QUIZ
    // ============================================
    
    finishQuiz() {
        this.saveProgress();
        this.showResults();
    }
    
    showResults() {
        this.showScreen('resultsScreen');
        
        const correct = this.userAnswers.filter((answer, idx) => 
            this.isCorrectAnswer(answer, this.questions[idx].correct)
        ).length;
        
        const total = this.questions.length;
        const percentage = Math.round((correct / total) * 100);
        const timeSpent = Math.floor((Date.now() - this.startTime) / 60000);
        
        // Update UI
        const scoreNumber = document.getElementById('scoreNumber');
        const scoreTotal = document.getElementById('scoreTotal');
        const scorePercent = document.getElementById('scorePercent');
        const correctAnswers = document.getElementById('correctAnswers');
        const wrongAnswers = document.getElementById('wrongAnswers');
        const timeSpentEl = document.getElementById('timeSpent');
        
        if (scoreNumber) scoreNumber.textContent = correct;
        if (scoreTotal) scoreTotal.textContent = `/ ${total}`;
        if (scorePercent) scorePercent.textContent = `${percentage}%`;
        if (correctAnswers) correctAnswers.textContent = correct;
        if (wrongAnswers) wrongAnswers.textContent = total - correct;
        if (timeSpentEl) timeSpentEl.textContent = `${timeSpent}m`;
        
        // Animate score ring
        const circumference = 2 * Math.PI * 90;
        const offset = circumference - (percentage / 100 * circumference);
        const ring = document.getElementById('scoreRing');
        if (ring) {
            setTimeout(() => {
                ring.style.strokeDashoffset = offset;
            }, 100);
        }
    }
    
    reviewQuiz() {
        this.currentIndex = 0;
        this.selectedOptions = this.userAnswers[0] ? [...this.userAnswers[0]] : [];
        this.showScreen('quizScreen');
        this.renderQuestion();
    }
    
    // ============================================
    // PROGRESS & STORAGE
    // ============================================
    
    getCourseProgress(courseId) {
        const key = `progress_${courseId}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : { attempted: 0, correct: 0 };
    }
    
    saveProgress() {
        const correct = this.userAnswers.filter((answer, idx) => 
            this.isCorrectAnswer(answer, this.questions[idx].correct)
        ).length;
        
        const progress = this.getCourseProgress(this.currentCourse.id);
        progress.attempted += this.questions.length;
        progress.correct += correct;
        
        const key = `progress_${this.currentCourse.id}`;
        localStorage.setItem(key, JSON.stringify(progress));
    }
    
    loadProgress() {
        // Progress is loaded on demand
    }
    
    updateGlobalStats() {
        let totalAttempted = 0;
        let totalCorrect = 0;
        const totalQuestions = COURSES.reduce((sum, c) => sum + c.totalQuestions, 0);
        
        COURSES.forEach(course => {
            const progress = this.getCourseProgress(course.id);
            totalAttempted += progress.attempted;
            totalCorrect += progress.correct;
        });
        
        const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
        
        const progressEl = document.getElementById('globalProgress');
        const accuracyEl = document.getElementById('globalAccuracy');
        
        if (progressEl) progressEl.textContent = `${totalAttempted}/${totalQuestions}`;
        if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;
    }
    
    // ============================================
    // HELPERS
    // ============================================
    
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Initialize app
const app = new GeneticaApp();

// Add SVG gradient for results
document.addEventListener('DOMContentLoaded', () => {
    const svg = document.querySelector('.score-ring');
    if (svg) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.id = 'gradient';
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '0%');
        gradient.innerHTML = `
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        `;
        defs.appendChild(gradient);
        svg.appendChild(defs);
    }
});
