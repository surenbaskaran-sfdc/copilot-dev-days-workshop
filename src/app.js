// UI code: connects the quiz logic (quiz.js) to the page (index.html).

let state = createQuiz([]);
const QUESTION_TIME_LIMIT = 15;
let timerInterval = null;
let remainingSeconds = QUESTION_TIME_LIMIT;
let questionResolved = false;
const BEST_SCORE_KEY = "dev-days-quiz-best-score";

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const progressText = document.getElementById("progress");
const quizProgress = document.getElementById("quiz-progress");
const timerText = document.getElementById("timer");
const questionText = document.getElementById("question-text");
const optionsList = document.getElementById("options");
const feedbackText = document.getElementById("feedback");
const nextButton = document.getElementById("next-btn");
const scoreText = document.getElementById("score-text");
const gradeText = document.getElementById("grade-text");
const startBestScoreText = document.getElementById("best-score-start");
const resultBestScoreText = document.getElementById("best-score-result");

function readBestScore() {
  try {
    const storedScore = window.localStorage.getItem(BEST_SCORE_KEY);
    if (storedScore === null || storedScore.trim() === "") {
      return { score: null, available: true };
    }

    const score = Number(storedScore);
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      return { score: null, available: true };
    }
    return { score, available: true };
  } catch (error) {
    console.warn("Unable to read the best score from localStorage.", error);
    return { score: null, available: false };
  }
}

function writeBestScore(score) {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(score));
    return true;
  } catch (error) {
    console.warn("Unable to save the best score to localStorage.", error);
    return false;
  }
}

function renderStartBestScore() {
  const storedBest = readBestScore();
  if (!storedBest.available) {
    startBestScoreText.textContent = "Best score unavailable.";
  } else if (storedBest.score === null) {
    startBestScoreText.textContent = "Best score: No score yet";
  } else {
    startBestScoreText.textContent = `Best score: ${storedBest.score}%`;
  }
}

function showScreen(screenToShow) {
  [startScreen, quizScreen, resultScreen].forEach((screen) => {
    screen.hidden = screen !== screenToShow;
  });
}

function startQuiz() {
  stopQuestionTimer();
  state = createQuiz(QUESTIONS);
  renderStartBestScore();
  showScreen(quizScreen);
  renderQuestion();
}

function renderQuestion() {
  stopQuestionTimer();
  questionResolved = false;
  const question = state.questions[state.current];
  progressText.textContent = `Question ${state.current + 1} of ${state.questions.length}`;
  quizProgress.max = state.questions.length;
  quizProgress.value = Math.min(state.current + 1, state.questions.length);
  questionText.textContent = question.question;
  feedbackText.textContent = "";
  nextButton.hidden = true;
  optionsList.innerHTML = "";

  question.options.forEach((option, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.className = "option";
    button.textContent = option;
    button.addEventListener("click", () => selectAnswer(index, button));
    item.appendChild(button);
    optionsList.appendChild(item);
  });

  startQuestionTimer();
}

function startQuestionTimer() {
  remainingSeconds = QUESTION_TIME_LIMIT;
  timerText.textContent = formatTimeLeft(remainingSeconds);
  timerText.classList.remove("warning");

  timerInterval = setInterval(() => {
    remainingSeconds--;
    timerText.textContent = formatTimeLeft(remainingSeconds);
    timerText.classList.toggle("warning", remainingSeconds <= 5);

    if (remainingSeconds === 0) {
      handleTimeExpired();
    }
  }, 1000);
}

function stopQuestionTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function handleTimeExpired() {
  if (questionResolved) return;
  questionResolved = true;
  stopQuestionTimer();

  const question = state.questions[state.current];
  const buttons = optionsList.querySelectorAll("button");
  buttons.forEach((button) => (button.disabled = true));
  buttons[question.answer].classList.add("correct");
  feedbackText.textContent = "Time's up! The correct answer is highlighted.";
  nextButton.hidden = false;
  nextButton.focus();
}

function selectAnswer(selectedIndex, selectedButton) {
  if (questionResolved) return;
  questionResolved = true;
  stopQuestionTimer();

  const question = state.questions[state.current];
  const buttons = optionsList.querySelectorAll("button");
  buttons.forEach((button) => (button.disabled = true));

  const result = answerQuestion(state, selectedIndex);
  state = result.state;

  if (result.correct) {
    selectedButton.classList.add("correct");
    feedbackText.textContent = "Correct!";
  } else {
    selectedButton.classList.add("wrong");
    buttons[question.answer].classList.add("correct");
    feedbackText.textContent = "Not quite. The correct answer is highlighted.";
  }

  nextButton.hidden = false;
  nextButton.focus();
}

function nextQuestion() {
  stopQuestionTimer();
  state = advanceQuestion(state);
  if (!isQuizFinished(state)) {
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  stopQuestionTimer();
  const total = state.questions.length;
  const percentage = calculatePercentage(state.score, total);
  scoreText.textContent = `You scored ${state.score} out of ${total} (${percentage}%)`;
  gradeText.textContent = `Grade: ${getGrade(percentage)}`;

  const storedBest = readBestScore();
  if (!storedBest.available) {
    resultBestScoreText.textContent = "Best score unavailable.";
  } else if (isNewBestScore(percentage, storedBest.score)) {
    const saved = writeBestScore(percentage);
    resultBestScoreText.textContent = saved
      ? `New best score: ${percentage}%!`
      : `New best score this round: ${percentage}%. It could not be saved.`;
    renderStartBestScore();
  } else {
    resultBestScoreText.textContent = `Best score: ${storedBest.score}%`;
  }

  showScreen(resultScreen);
}

document.getElementById("start-btn").addEventListener("click", startQuiz);
document.getElementById("restart-btn").addEventListener("click", startQuiz);
nextButton.addEventListener("click", nextQuestion);
renderStartBestScore();
