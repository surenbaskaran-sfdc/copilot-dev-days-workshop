// Tests use Node's built-in test runner, so nothing needs to be installed.
// Run them with:  npm test
const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  shuffle,
  isCorrect,
  createQuiz,
  answerQuestion,
  advanceQuestion,
  isQuizFinished,
  calculatePercentage,
  formatTimeLeft,
  getGrade,
  getFeedbackMessage,
  isNewBestScore
} = require("../src/quiz.js");

test("isCorrect returns true for the right answer", () => {
  assert.equal(isCorrect({ answer: 2 }, 2), true);
});

test("isCorrect returns false for a wrong answer", () => {
  assert.equal(isCorrect({ answer: 2 }, 0), false);
});

test("createQuiz creates a new state with shuffled questions and initial values", () => {
  const questions = [{ answer: 0 }, { answer: 1 }, { answer: 2 }];
  const state = createQuiz(questions);

  assert.notEqual(state, questions);
  assert.deepEqual([...state.questions].sort((a, b) => a.answer - b.answer), questions);
  assert.deepEqual({ current: state.current, score: state.score }, { current: 0, score: 0 });
  assert.deepEqual(questions, [{ answer: 0 }, { answer: 1 }, { answer: 2 }]);
});

test("answerQuestion returns a new state and reports a correct answer", () => {
  const state = { questions: [{ answer: 1 }], current: 0, score: 0 };
  const result = answerQuestion(state, 1);

  assert.deepEqual(result, {
    state: { questions: state.questions, current: 0, score: 1 },
    correct: true
  });
  assert.equal(state.score, 0);
  assert.notEqual(result.state, state);
});

test("answerQuestion leaves the score unchanged for an incorrect answer", () => {
  const state = { questions: [{ answer: 1 }], current: 0, score: 2 };
  const result = answerQuestion(state, 0);

  assert.equal(result.correct, false);
  assert.equal(result.state.score, 2);
  assert.equal(state.score, 2);
  assert.notEqual(result.state, state);
});

test("advanceQuestion returns a new state at the next index", () => {
  const state = { questions: [{ answer: 0 }, { answer: 1 }], current: 0, score: 1 };
  const nextState = advanceQuestion(state);

  assert.equal(nextState.current, 1);
  assert.equal(state.current, 0);
  assert.notEqual(nextState, state);
});

test("isQuizFinished detects when the current index reaches the end", () => {
  const questions = [{ answer: 0 }];
  assert.equal(isQuizFinished({ questions, current: 0, score: 0 }), false);
  assert.equal(isQuizFinished({ questions, current: 1, score: 0 }), true);
});

test("calculatePercentage rounds to a whole number", () => {
  assert.equal(calculatePercentage(2, 3), 67);
});

test("calculatePercentage returns 0 when there are no questions", () => {
  assert.equal(calculatePercentage(0, 0), 0);
});

test("formatTimeLeft includes the remaining seconds", () => {
  assert.equal(formatTimeLeft(15), "⏱ 15s");
  assert.equal(formatTimeLeft(12), "⏱ 12s");
  assert.equal(formatTimeLeft(1), "⏱ 1s");
  assert.equal(formatTimeLeft(0), "⏱ 0s");
});

test("shuffle keeps every item and does not change the original array", () => {
  const original = [1, 2, 3, 4, 5];
  const result = shuffle(original);
  assert.deepEqual([...result].sort(), [1, 2, 3, 4, 5]);
  assert.deepEqual(original, [1, 2, 3, 4, 5]);
});

test("getGrade gives an A for exactly 90%", () => {
  assert.equal(getGrade(90), "A");
  assert.equal(getGrade(89), "B");
});

test("getGrade gives a B at 75% and C just below it", () => {
  assert.equal(getGrade(75), "B");
  assert.equal(getGrade(74), "C");
});

test("getGrade gives a C at 50% and no grade just below it", () => {
  assert.equal(getGrade(50), "C");
  assert.equal(getGrade(49), "Keep practicing");
});

test("getFeedbackMessage returns encouraging feedback for each grade", () => {
  assert.equal(getFeedbackMessage("A"), "Excellent work!");
  assert.equal(getFeedbackMessage("B"), "Great job!");
  assert.equal(getFeedbackMessage("C"), "Good effort!");
  assert.equal(getFeedbackMessage("Keep practicing"), "Keep practicing!");
});

test("isNewBestScore treats a missing best score as a new record", () => {
  assert.equal(isNewBestScore(0, null), true);
  assert.equal(isNewBestScore(75, null), true);
});

test("isNewBestScore returns true when the current score is higher", () => {
  assert.equal(isNewBestScore(81, 80), true);
});

test("isNewBestScore returns false when the current score ties or trails", () => {
  assert.equal(isNewBestScore(80, 80), false);
  assert.equal(isNewBestScore(79, 80), false);
});
