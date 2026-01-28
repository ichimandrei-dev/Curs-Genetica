const quizDiv = document.getElementById("quiz");
const resultDiv = document.getElementById("result");
const finishBtn = document.getElementById("finishBtn");
const courseSelect = document.getElementById("courseSelect");

let currentQuestions = [];
let userAnswers = {};

/* ========================
   INIT
======================== */

(function init() {
  const courses = [...new Set(QUESTIONS.map(q => q.course))].sort((a,b)=>a-b);
  courses.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = "Curs " + c;
    courseSelect.appendChild(opt);
  });
})();

/* ========================
   START PRACTICE
======================== */

function startPractice() {
  const course = Number(courseSelect.value);
  if (!course) return alert("Selectează un curs");

  currentQuestions = QUESTIONS.filter(q => q.course === course);
  renderQuiz();
}

/* ========================
   START EXAM
======================== */

function startExam() {
  const singles = shuffle(QUESTIONS.filter(q => q.type === "single")).slice(0,30);
  const multiples = shuffle(QUESTIONS.filter(q => q.type === "multiple")).slice(0,20);

  currentQuestions = shuffle([...singles, ...multiples]);
  renderQuiz();
}

/* ========================
   RENDER QUIZ
======================== */

function renderQuiz() {
  quizDiv.innerHTML = "";
  resultDiv.innerHTML = "";
  finishBtn.style.display = "block";
  userAnswers = {};

  currentQuestions.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "question";

    div.innerHTML = `<strong>${index+1}. ${q.text}</strong>`;

    const opts = document.createElement("div");
    opts.className = "options";

    q.options.forEach((opt, i) => {
      const inputType = q.type === "single" ? "radio" : "checkbox";

      opts.innerHTML += `
        <label>
          <input type="${inputType}" name="q${index}" value="${i}">
          ${opt}
        </label>
      `;
    });

    div.appendChild(opts);
    quizDiv.appendChild(div);
  });
}

/* ========================
   FINISH + SCORE
======================== */

function finishExam() {
  document.querySelectorAll(".question").forEach((div, qi) => {
    const checked = div.querySelectorAll("input:checked");
    if (checked.length === 0) return;

    const values = [...checked].map(i => Number(i.value));
    userAnswers[qi] = values.length === 1 ? values[0] : values;
  });

  let score = 0;

  currentQuestions.forEach((q, i) => {
    const user = userAnswers[i];
    if (user === undefined) return;

    if (q.type === "single" && user === q.correct) score++;

    if (q.type === "multiple") {
      if (
        Array.isArray(user) &&
        user.length === q.correct.length &&
        user.every(v => q.correct.includes(v))
      ) score++;
    }
  });

  resultDiv.innerHTML = `Scor final: ${score} / ${currentQuestions.length}`;
  finishBtn.style.display = "none";
}

/* ========================
   UTILS
======================== */

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}
