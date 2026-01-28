// ============================================
// GRILE GENETICĂ MEDICALĂ - APP LOGIC
// ============================================

class GeneticaApp {
    constructor() {
        this.currentCourse = null;
        this.questions = [];
        this.currentIndex = 0;
        this.userAnswers = [];
        this.selectedOptions = [];
        this.startTime = null;
        this.init();
    }

    init() {
        console.log('🧬 Grile Genetică Medicală - Inițializat');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    startApp() {
        this.showCoursesScreen();
    }

    showCoursesScreen() {
        this.showScreen('coursesScreen');
        this.renderCourses();
        this.updateGlobalStats();
    }

    renderCourses() {
        const grid = document.getElementById('coursesGrid');
        grid.innerHTML = '';

        const courses = [...new Set(QUESTIONS.map(q => q.course))].sort((a,b) => a-b);
        
        const courseNames = {
            1: "Structura acizilor nucleici", 2: "Replicare ADN, ARN, ADN mitocondrial",
            3: "Cromatină și cromozomi", 4: "Gena: structură și funcție",
            5: "Transcripție și translație", 6: "Mutații și evoluție genom",
            7: "Reparare ADN și patologii", 8: "Omics, linkage, HGP",
            9: "Oncogenetică", 10: "Genetică dezvoltare",
            11: "Genetică medicală I", 12: "Genetică medicală II", 13: "Genetică medicală III"
        };

        const courseIcons = {
            1: "🧬", 2: "🔄", 3: "📊", 4: "🧪", 5: "⚡", 6: "🔬",
            7: "🛡️", 8: "🌐", 9: "🎯", 10: "🌱", 11: "🏥", 12: "💊", 13: "🔍"
        };

        courses.forEach(courseNum => {
            const courseQuestions = QUESTIONS.filter(q => q.course === courseNum);
            const progress = this.getCourseProgress(courseNum);
            const percentage = courseQuestions.length > 0 
                ? Math.round((progress.attempted / courseQuestions.length) * 100) 
                : 0;

            const card = document.createElement('div');
            card.className = 'course-card';
            card.onclick = () => this.startCourse(courseNum);

            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <div style="font-size: 2.5rem;">${courseIcons[courseNum] || '📚'}</div>
                    <div>
                        <div class="course-title">Curs ${courseNum}</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">${courseNames[courseNum] || ''}</div>
                    </div>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                    ${courseQuestions.length} întrebări
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                    Progres: ${percentage}%
                </div>
            `;

            grid.appendChild(card);
        });
    }

    startCourse(courseNum) {
        let questions = QUESTIONS.filter(q => q.course === courseNum);
        if (questions.length === 0) return alert('Nu există întrebări!');

        questions = this.shuffle([...questions]);
        this.questions = questions;
        this.currentIndex = 0;
        this.userAnswers = new Array(questions.length).fill(null);
        this.selectedOptions = [];
        this.startTime = Date.now();
        this.currentCourse = courseNum;

        this.showScreen('quizScreen');
        this.renderQuestion();
    }

    renderQuestion() {
        const question = this.questions[this.currentIndex];
        if (!question) return;

        document.getElementById('progressText').textContent = `${this.currentIndex + 1} / ${this.questions.length}`;
        document.getElementById('questionBadge').textContent = 
            question.type === 'multiple' ? 'ℹ️ Selectează toate răspunsurile corecte' : 'ℹ️ Selectează răspunsul corect';
        document.getElementById('questionText').textContent = question.text;

        this.renderOptions();
        document.getElementById('feedbackBox').style.display = 'none';
        this.updateButtons();
    }

    renderOptions() {
        const question = this.questions[this.currentIndex];
        const grid = document.getElementById('answersGrid');
        grid.innerHTML = '';

        const userAnswer = this.userAnswers[this.currentIndex];
        const isAnswered = userAnswer !== null;

        question.options.forEach((text, index) => {
            const option = document.createElement('div');
            option.className = 'answer-option';
            
            if (!isAnswered) option.onclick = () => this.selectOption(index);

            const isSelected = this.selectedOptions.includes(index);
            if (isSelected) option.classList.add('selected');

            if (isAnswered) {
                const isCorrect = question.type === 'single' ? question.correct === index : question.correct.includes(index);
                const wasSelected = Array.isArray(userAnswer) ? userAnswer.includes(index) : userAnswer === index;

                if (isCorrect) option.classList.add('correct');
                else if (wasSelected) option.classList.add('wrong');
            }

            option.innerHTML = `
                <div style="width: 28px; height: 28px; border: 2px solid var(--border-color); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;">
                    ${isSelected || (isAnswered && (question.type === 'single' ? question.correct === index : question.correct.includes(index))) ? '✓' : ''}
                </div>
                <span style="font-weight: 700; margin-right: 0.5rem;">${String.fromCharCode(65 + index)}.</span>
                <span style="flex: 1;">${text}</span>
            `;

            grid.appendChild(option);
        });
    }

    selectOption(index) {
        const question = this.questions[this.currentIndex];
        if (question.type === 'multiple') {
            const idx = this.selectedOptions.indexOf(index);
            if (idx > -1) this.selectedOptions.splice(idx, 1);
            else this.selectedOptions.push(index);
        } else {
            this.selectedOptions = [index];
        }
        this.renderOptions();
        this.updateButtons();
    }

    checkAnswer() {
        if (this.selectedOptions.length === 0) return;
        const question = this.questions[this.currentIndex];
        const answer = question.type === 'multiple' ? [...this.selectedOptions] : this.selectedOptions[0];
        this.userAnswers[this.currentIndex] = answer;
        this.showFeedback();
        this.renderOptions();
        this.updateButtons();
    }

    showFeedback() {
        const question = this.questions[this.currentIndex];
        const userAnswer = this.userAnswers[this.currentIndex];
        
        let isCorrect = false;
        if (question.type === 'single') {
            isCorrect = userAnswer === question.correct;
        } else {
            isCorrect = Array.isArray(userAnswer) && 
                        userAnswer.length === question.correct.length &&
                        userAnswer.every(val => question.correct.includes(val));
        }

        const feedback = document.getElementById('feedbackBox');
        feedback.style.display = 'block';
        feedback.style.background = isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';
        feedback.style.borderLeft = `4px solid ${isCorrect ? 'var(--accent-green)' : 'var(--accent-red)'}`;

        const correctText = question.type === 'single' 
            ? String.fromCharCode(65 + question.correct)
            : question.correct.map(i => String.fromCharCode(65 + i)).join(', ');

        feedback.innerHTML = `
            <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">
                ${isCorrect ? '✓ Corect!' : '✗ Greșit'}
            </div>
            ${!isCorrect ? `<p>Răspuns corect: ${correctText}</p>` : ''}
        `;
    }

    updateButtons() {
        const isAnswered = this.userAnswers[this.currentIndex] !== null;
        document.getElementById('btnSubmit').style.display = isAnswered ? 'none' : 'block';
        document.getElementById('btnSubmit').disabled = this.selectedOptions.length === 0;
        document.getElementById('btnPrev').disabled = this.currentIndex === 0;
        document.getElementById('btnNext').disabled = !isAnswered;
        document.getElementById('btnNext').textContent = 
            this.currentIndex === this.questions.length - 1 ? 'Finalizează →' : 'Următoarea →';
    }

    prevQuestion() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            const userAns = this.userAnswers[this.currentIndex];
            this.selectedOptions = userAns !== null ? (Array.isArray(userAns) ? [...userAns] : [userAns]) : [];
            this.renderQuestion();
        }
    }

    nextQuestion() {
        if (this.currentIndex < this.questions.length - 1) {
            this.currentIndex++;
            const userAns = this.userAnswers[this.currentIndex];
            this.selectedOptions = userAns !== null ? (Array.isArray(userAns) ? [...userAns] : [userAns]) : [];
            this.renderQuestion();
        } else {
            this.finishQuiz();
        }
    }

    finishQuiz() {
        this.saveProgress();
        this.showResults();
    }

    showResults() {
        this.showScreen('resultsScreen');

        let correct = 0;
        this.questions.forEach((q, i) => {
            const userAns = this.userAnswers[i];
            if (q.type === 'single' && userAns === q.correct) correct++;
            else if (q.type === 'multiple' && Array.isArray(userAns) && 
                     userAns.length === q.correct.length &&
                     userAns.every(val => q.correct.includes(val))) correct++;
        });

        const total = this.questions.length;
        const percentage = Math.round((correct / total) * 100);
        const timeSpent = Math.floor((Date.now() - this.startTime) / 60000);

        document.getElementById('scoreNumber').textContent = correct;
        document.getElementById('scoreTotal').textContent = total;
        document.getElementById('scorePercent').textContent = `${percentage}%`;
        document.getElementById('correctAnswers').textContent = correct;
        document.getElementById('wrongAnswers').textContent = total - correct;
        document.getElementById('timeSpent').textContent = `${timeSpent}m`;
    }

    getCourseProgress(courseNum) {
        const key = `progress_${courseNum}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : { attempted: 0, correct: 0 };
    }

    saveProgress() {
        let correct = 0;
        this.questions.forEach((q, i) => {
            const userAns = this.userAnswers[i];
            if (q.type === 'single' && userAns === q.correct) correct++;
            else if (q.type === 'multiple' && Array.isArray(userAns) && 
                     userAns.length === q.correct.length &&
                     userAns.every(val => q.correct.includes(val))) correct++;
        });

        const progress = this.getCourseProgress(this.currentCourse);
        progress.attempted += this.questions.length;
        progress.correct += correct;
        localStorage.setItem(`progress_${this.currentCourse}`, JSON.stringify(progress));
    }

    updateGlobalStats() {
        let totalAttempted = 0;
        const courses = [...new Set(QUESTIONS.map(q => q.course))];
        courses.forEach(courseNum => {
            totalAttempted += this.getCourseProgress(courseNum).attempted;
        });
        document.getElementById('globalProgress').textContent = `${totalAttempted}/${QUESTIONS.length}`;
    }

    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

const app = new GeneticaApp();
