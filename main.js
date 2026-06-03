import './style.css'
import { flashcardsData, quizQuestions } from './data.js'

const subjectColors = {
  "БЕЗОПАСНОСТЬ ЖИЗНЕДЕЯТЕЛЬНОСТИ": "#ef4444", 
  "БИЗНЕС-ПЛАНИРОВАНИЕ": "#3b82f6", 
  "МЕНЕДЖМЕНТ": "#10b981", 
  "ЭКОНОМИКА ОРГАНИЗАЦИЙ": "#f59e0b", 
  "ОСНОВЫ АЛГОРИТМИЗАЦИИ И ПРОГРАММИРОВАНИЯ": "#8b5cf6", 
  "АНАЛИЗ И МОДЕЛИРОВАНИЕ БИЗНЕС-ПРОЦЕССОВ": "#06b6d4", 
  "УПРАВЛЕНИЕ ТРЕБОВАНИЯМИ И ПРОЕКТИРОВАНИЕ ИС": "#ec4899", 
  "УПРАВЛЕНИЕ ИТ-ПРОЕКТАМИ": "#f97316", 
  "МЕТОДЫ И СПОСОБЫ АНАЛИЗА ДАННЫХ В БИЗНЕСЕ": "#14b8a6", 
  "ЭФФЕКТИВНОСТЬ ИТ": "#6366f1", 
  "ФИЗИЧЕСКАЯ КУЛЬТУРА И СПОРТ": "#84cc16", 
  "ПРАВОВЫЕ ОСНОВЫ ПРОТИВОДЕЙСТВИЯ КОРРУПЦИИ": "#eab308", 
  "ТЕОРИЯ СИСТЕМ И СИСТЕМНЫЙ АНАЛИЗ": "#d946ef", 
};

function getCategoryColor(category) {
  for (let key in subjectColors) {
    if (category.toUpperCase().includes(key)) {
      return subjectColors[key];
    }
  }
  return 'var(--accent)';
}

// --- Navigation ---
const navFlashcardsBtn = document.getElementById('nav-flashcards');
const navQuizBtn = document.getElementById('nav-quiz');
const viewFlashcards = document.getElementById('view-flashcards');
const viewQuiz = document.getElementById('view-quiz');

navFlashcardsBtn.addEventListener('click', () => {
  navFlashcardsBtn.classList.add('active');
  navQuizBtn.classList.remove('active');
  viewFlashcards.classList.add('active');
  viewQuiz.classList.remove('active');
});

navQuizBtn.addEventListener('click', () => {
  navQuizBtn.classList.add('active');
  navFlashcardsBtn.classList.remove('active');
  viewQuiz.classList.add('active');
  viewFlashcards.classList.remove('active');
});

// --- Flashcards Logic ---
const flashcard = document.getElementById('flashcard');
const fcCategory = document.getElementById('fc-category');
const fcQuestion = document.getElementById('fc-question');
const fcAnswer = document.getElementById('fc-answer');
const fcCounter = document.getElementById('fc-counter');
const fcPrev = document.getElementById('fc-prev');
const fcNext = document.getElementById('fc-next');
const fcSubjectSelect = document.getElementById('fc-subject');

let currentCardIndex = 0;
let currentFlashcards = [...flashcardsData];

fcSubjectSelect.addEventListener('change', (e) => {
  const subject = e.target.value;
  if (subject === 'all') {
    currentFlashcards = [...flashcardsData];
  } else {
    currentFlashcards = flashcardsData.filter(c => c.category.toUpperCase() === subject.toUpperCase());
  }
  currentCardIndex = 0;
  renderFlashcard();
});

function renderFlashcard() {
  if (currentFlashcards.length === 0) return;
  const card = currentFlashcards[currentCardIndex];
  fcCategory.textContent = card.category;
  fcQuestion.textContent = card.question;
  fcAnswer.textContent = card.answer;
  fcCounter.textContent = `${currentCardIndex + 1} / ${currentFlashcards.length}`;
  
  const color = getCategoryColor(card.category);
  fcCategory.style.color = color;
  flashcard.style.boxShadow = `0 4px 20px 0 ${color}60`; // Colored glow
  document.querySelector('.card-front').style.borderColor = `${color}40`;
  document.querySelector('.card-back').style.borderColor = `${color}40`;

  flashcard.classList.remove('is-flipped');
}

flashcard.addEventListener('click', () => {
  flashcard.classList.toggle('is-flipped');
});

fcPrev.addEventListener('click', () => {
  if (currentCardIndex > 0) {
    currentCardIndex--;
    renderFlashcard();
  }
});

fcNext.addEventListener('click', () => {
  if (currentCardIndex < currentFlashcards.length - 1) {
    currentCardIndex++;
    renderFlashcard();
  }
});

// Initialize flashcards
if (flashcardsData.length > 0) {
  renderFlashcard();
}

// --- Quiz Logic ---
const startQuizBtn = document.getElementById('start-quiz-btn');
const restartQuizBtn = document.getElementById('restart-quiz-btn');
const quizSetup = document.getElementById('quiz-setup');
const quizActive = document.getElementById('quiz-active');
const quizResult = document.getElementById('quiz-result');

const quizCounter = document.getElementById('quiz-counter');
const quizScoreEl = document.getElementById('quiz-score');
const quizCategory = document.getElementById('quiz-category');
const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');
const finalScoreEl = document.getElementById('final-score');
const quizSubjectSelect = document.getElementById('quiz-subject');

let currentQuizIndex = 0;
let quizScore = 0;
let quizQuestionsMix = [];

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function startQuiz() {
  const subject = quizSubjectSelect.value;
  let cards = subject === 'all' ? flashcardsData : flashcardsData.filter(c => c.category.toUpperCase() === subject.toUpperCase());
  
  if (cards.length < 4) {
    alert("Для создания теста по этому предмету нужно минимум 4 вопроса в базе!");
    return;
  }
  
  // Dynamically generate quiz questions from flashcards
  const generatedQuiz = cards.map(card => {
    // Pick 3 random distractors from all flashcards to avoid having too few options in small categories
    let others = flashcardsData.filter(c => c.answer !== card.answer);
    others = shuffle(others).slice(0, 3);
    
    const options = [card.answer, ...others.map(o => o.answer)];
    const shuffledOptions = shuffle([...options]);
    const correctIndex = shuffledOptions.indexOf(card.answer);
    
    return {
      category: card.category,
      question: card.question,
      options: shuffledOptions,
      correctAnswer: correctIndex
    };
  });
  
  quizQuestionsMix = shuffle(generatedQuiz).slice(0, 10); // 10 random questions per test
  currentQuizIndex = 0;
  quizScore = 0;
  
  quizSetup.classList.add('hidden');
  quizResult.classList.add('hidden');
  quizActive.classList.remove('hidden');
  
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const q = quizQuestionsMix[currentQuizIndex];
  quizCategory.textContent = q.category;
  quizQuestion.textContent = q.question;
  quizCounter.textContent = `Вопрос ${currentQuizIndex + 1} / ${quizQuestionsMix.length}`;
  quizScoreEl.textContent = `Очки: ${quizScore}`;
  
  const color = getCategoryColor(q.category);
  quizCategory.style.color = color;
  const container = document.querySelector('.quiz-question-container');
  container.style.boxShadow = `0 4px 20px 0 ${color}60`;
  container.style.borderColor = `${color}40`;
  
  quizOptions.innerHTML = '';
  
  q.options.forEach((opt, index) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleQuizAnswer(index, q.correctAnswer, btn));
    quizOptions.appendChild(btn);
  });
}

function handleQuizAnswer(selectedIndex, correctIndex, btnElement) {
  // Disable all buttons
  const buttons = quizOptions.querySelectorAll('.quiz-option');
  buttons.forEach(b => b.disabled = true);
  
  if (selectedIndex === correctIndex) {
    btnElement.classList.add('correct');
    quizScore++;
    quizScoreEl.textContent = `Очки: ${quizScore}`;
  } else {
    btnElement.classList.add('wrong');
    buttons[correctIndex].classList.add('correct');
  }
  
  setTimeout(() => {
    if (currentQuizIndex < quizQuestionsMix.length - 1) {
      currentQuizIndex++;
      renderQuizQuestion();
    } else {
      showQuizResult();
    }
  }, 1500);
}

startQuizBtn.addEventListener('click', startQuiz);
restartQuizBtn.addEventListener('click', startQuiz);
