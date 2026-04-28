// ============================================
// VoteGuide AI — Quiz Engine & Leaderboard
// ============================================

import { db, collection, addDoc, getDocs, query, orderBy, limit } from './firebase-config.js';
import { getCurrentUser } from './auth.js';
import { showToast } from './utils.js';
import { quizQuestions } from './data.js';
import { unlockBadge } from './badges.js';

let currentQuestion = 0;
let score = 0;
let answered = false;
let quizActive = false;
let userAnswers = [];

export function startQuiz() {
  currentQuestion = 0;
  score = 0;
  answered = false;
  quizActive = true;
  userAnswers = [];
  renderQuestion();
}

export function renderQuestion() {
  const container = document.getElementById('quiz-area');
  if (!container) return;

  if (currentQuestion >= quizQuestions.length) {
    showResults();
    return;
  }

  const q = quizQuestions[currentQuestion];
  const progress = ((currentQuestion) / quizQuestions.length) * 100;
  answered = false;

  container.innerHTML = `
    <div class="quiz-progress-bar">
      <span class="quiz-progress-text">Question ${currentQuestion + 1}/${quizQuestions.length}</span>
      <div class="progress-bar" style="flex:1"><div class="progress-fill" style="width:${progress}%"></div></div>
      <span class="quiz-progress-text">Score: ${score}</span>
    </div>
    <div class="quiz-card">
      <div class="quiz-question">${q.q}</div>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `
          <button class="quiz-option" data-index="${i}" id="quiz-opt-${i}">
            <span class="quiz-option-letter">${String.fromCharCode(65 + i)}</span>
            <span>${opt}</span>
          </button>
        `).join('')}
      </div>
      <div id="quiz-feedback"></div>
    </div>`;

  container.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => handleAnswer(parseInt(btn.dataset.index)));
  });
}

function handleAnswer(selected) {
  if (answered) return;
  answered = true;

  const q = quizQuestions[currentQuestion];
  const isCorrect = selected === q.answer;
  if (isCorrect) score++;
  userAnswers.push({ question: currentQuestion, selected, correct: q.answer, isCorrect });

  // Highlight answers
  document.querySelectorAll('.quiz-option').forEach((btn, i) => {
    btn.style.pointerEvents = 'none';
    if (i === q.answer) btn.classList.add('correct');
    if (i === selected && !isCorrect) btn.classList.add('wrong');
  });

  // Show explanation
  const feedback = document.getElementById('quiz-feedback');
  feedback.innerHTML = `
    <div class="quiz-explanation">
      <strong>${isCorrect ? '✅ Correct!' : '❌ Incorrect!'}</strong><br>
      ${q.explanation}
    </div>
    <button class="btn btn-primary" style="margin-top:16px;width:100%" id="quiz-next-btn">
      ${currentQuestion < quizQuestions.length - 1 ? 'Next Question →' : 'See Results 🎉'}
    </button>`;

  document.getElementById('quiz-next-btn').addEventListener('click', () => {
    currentQuestion++;
    renderQuestion();
  });
}

async function showResults() {
  const container = document.getElementById('quiz-area');
  const pct = Math.round((score / quizQuestions.length) * 100);
  let feedback = '';
  if (pct >= 90) feedback = '🎓 Outstanding! You are an Election Expert!';
  else if (pct >= 70) feedback = '🏆 Great job! You know your elections well!';
  else if (pct >= 50) feedback = '📚 Good effort! Keep learning about democracy!';
  else feedback = '🌱 Keep exploring! Every voter should know these facts.';

  // Unlock badges
  unlockBadge('quiz_complete');
  if (pct >= 80) unlockBadge('quiz_master');

  // Save to leaderboard
  const user = getCurrentUser();
  if (user) {
    try {
      await addDoc(collection(db, 'leaderboard'), {
        name: user.displayName || 'Anonymous',
        photo: user.photoURL || '',
        score: score,
        total: quizQuestions.length,
        pct: pct,
        timestamp: new Date().toISOString()
      });
    } catch (e) { console.log('Leaderboard save error:', e); }
  }

  // Fetch leaderboard
  let leaderboardHTML = '';
  try {
    const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    const entries = [];
    snapshot.forEach(doc => entries.push(doc.data()));
    if (entries.length > 0) {
      leaderboardHTML = `
        <div class="quiz-leaderboard">
          <h4 style="margin-bottom:12px">🏅 Top Scorers</h4>
          ${entries.map((e, i) => {
            const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            return `<div class="leaderboard-item">
              <span class="leaderboard-rank ${rankClass}">${i + 1}</span>
              <span style="flex:1;font-weight:500">${e.name}</span>
              <span class="badge badge-saffron">${e.score}/${e.total}</span>
            </div>`;
          }).join('')}
        </div>`;
    }
  } catch (e) { console.log('Leaderboard fetch error:', e); }

  container.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-result">
        <div style="font-size:64px;margin-bottom:16px">🎉</div>
        <h3 style="margin-bottom:8px">Quiz Complete!</h3>
        <div class="quiz-result-score">${score}/${quizQuestions.length}</div>
        <p style="font-size:1.1rem;margin:12px 0">${feedback}</p>
        <div class="progress-bar" style="max-width:300px;margin:16px auto">
          <div class="progress-fill ${pct >= 70 ? 'progress-fill-emerald' : ''}" style="width:${pct}%"></div>
        </div>
        <p style="color:var(--gray-500)">${pct}% Accuracy</p>
        <div style="display:flex;gap:12px;justify-content:center;margin-top:20px">
          <button class="btn btn-primary" onclick="window.quizRestart()">Retake Quiz</button>
          <button class="btn btn-outline" onclick="location.hash='/'">Back to Home</button>
        </div>
      </div>
      ${leaderboardHTML}
    </div>`;
  
  window.quizRestart = startQuiz;
}
