import './style.css';
import { flashcardsData, quizData } from './data.js';

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

function formatAnswerText(text) {
  if (!text) return '';
  return text.split('\n').map(line => {
      line = line.trim();
      if (!line) return '';
      line = line.replace(/^([^—\-\:]{2,80})([—\-\:]\s*.*)$/, '<strong>$1</strong>$2');
      if (/^\d+\./.test(line)) return `<div class="list-item number-item">${line}</div>`;
      if (/^-/.test(line)) return `<div class="list-item bullet-item">• ${line.substring(1).trim()}</div>`;
      return `<p>${line}</p>`;
  }).join('');
}

// Elements
const categoryNav = document.getElementById('category-nav');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.getElementById('sidebar');

const modeKbBtn = document.getElementById('mode-kb');
const modeQuizBtn = document.getElementById('mode-quiz');
const viewKb = document.getElementById('view-kb');
const viewQuiz = document.getElementById('view-quiz');

// KB Elements
const questionsList = document.getElementById('questions-list');
const searchInput = document.getElementById('search-input');
const currentCategoryTitle = document.getElementById('current-category-title');
const questionsCount = document.getElementById('questions-count');

// Quiz Elements
const quizSetup = document.getElementById('quiz-setup');
const startQuizBtn = document.getElementById('start-quiz-btn');
const quizActive = document.getElementById('quiz-active');
const quizCategoryEl = document.getElementById('quiz-category');
const quizQuestionEl = document.getElementById('quiz-question');
const quizOptionsEl = document.getElementById('quiz-options');
const quizCounterEl = document.getElementById('quiz-counter');
const quizScoreEl = document.getElementById('quiz-score');
const nextQuizBtn = document.getElementById('next-quiz-btn');
const quizResult = document.getElementById('quiz-result');
const finalScoreEl = document.getElementById('final-score');
const restartQuizBtn = document.getElementById('restart-quiz-btn');

// State
let currentCategory = 'all';
let searchQuery = '';
let currentMode = 'kb'; // 'kb' or 'quiz'

let currentQuizQuestions = [];
let currentQuizIndex = 0;
let quizScore = 0;
let optionSelected = false;

// Categories
const categories = ['all', ...new Set(flashcardsData.map(c => c.category))];
const categoryNames = { 'all': 'Все предметы' };

// Helpers
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// Render Sidebar
function renderSidebar() {
  categoryNav.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `category-btn ${cat === currentCategory ? 'active' : ''}`;
    btn.textContent = categoryNames[cat] || cat;
    
    if (cat !== 'all') {
      btn.style.borderLeft = `3px solid transparent`;
      if (cat === currentCategory) {
        btn.style.borderLeftColor = getCategoryColor(cat);
        btn.style.boxShadow = `inset 3px 0 0 ${getCategoryColor(cat)}`;
      }
    }

    btn.addEventListener('click', () => {
      currentCategory = cat;
      searchInput.value = '';
      searchQuery = '';
      
      renderSidebar();
      if (currentMode === 'kb') {
        renderQuestions();
      } else {
        resetQuizSetup();
      }
      
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
      }
    });
    categoryNav.appendChild(btn);
  });
}

// Mode Switching
function switchMode(mode) {
  currentMode = mode;
  if (mode === 'kb') {
    modeKbBtn.classList.add('active');
    modeQuizBtn.classList.remove('active');
    viewKb.classList.add('active');
    viewKb.classList.remove('hidden');
    viewQuiz.classList.remove('active');
    viewQuiz.classList.add('hidden');
    renderQuestions();
  } else {
    modeQuizBtn.classList.add('active');
    modeKbBtn.classList.remove('active');
    viewQuiz.classList.add('active');
    viewQuiz.classList.remove('hidden');
    viewKb.classList.remove('active');
    viewKb.classList.add('hidden');
    resetQuizSetup();
  }
}

modeKbBtn.addEventListener('click', () => switchMode('kb'));
modeQuizBtn.addEventListener('click', () => switchMode('quiz'));

// --- Knowledge Base Logic ---
function renderQuestions() {
  questionsList.innerHTML = '';
  let filtered = flashcardsData;
  
  if (currentCategory !== 'all') {
    filtered = filtered.filter(q => q.category === currentCategory);
    currentCategoryTitle.textContent = currentCategory;
  } else {
    currentCategoryTitle.textContent = 'Все предметы';
  }
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(q => 
      q.question.toLowerCase().includes(query) || 
      q.answer.toLowerCase().includes(query)
    );
  }
  
  questionsCount.textContent = `${filtered.length} вопросов`;
  
  if (filtered.length === 0) {
    questionsList.innerHTML = '<p style="color: var(--text-muted); padding: 2rem;">Ничего не найдено.</p>';
    return;
  }
  
  filtered.forEach((q) => {
    const color = getCategoryColor(q.category);
    const item = document.createElement('div');
    item.className = 'accordion-item';
    
    const header = document.createElement('div');
    header.className = 'accordion-header';
    const titleWrapper = document.createElement('div');
    
    if (currentCategory === 'all') {
      const tag = document.createElement('span');
      tag.className = 'accordion-category-tag';
      tag.style.color = color;
      tag.textContent = q.category;
      titleWrapper.appendChild(tag);
    }
    const title = document.createElement('h3');
    title.className = 'accordion-title';
    title.textContent = q.question;
    titleWrapper.appendChild(title);
    
    const icon = document.createElement('div');
    icon.className = 'accordion-icon';
    icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    
    header.appendChild(titleWrapper);
    header.appendChild(icon);
    
    const content = document.createElement('div');
    content.className = 'accordion-content';
    const inner = document.createElement('div');
    inner.className = 'accordion-inner';
    inner.innerHTML = formatAnswerText(q.answer);
    content.appendChild(inner);
    
    item.appendChild(header);
    item.appendChild(content);
    
    header.addEventListener('click', () => {
      item.classList.toggle('active');
      item.style.borderColor = item.classList.contains('active') ? color : 'var(--card-border)';
    });
    
    questionsList.appendChild(item);
  });
}

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderQuestions();
});

// --- Quiz Logic ---
function resetQuizSetup() {
  quizSetup.classList.remove('hidden');
  quizActive.classList.add('hidden');
  quizResult.classList.add('hidden');
}

function startQuiz() {
  let filtered = quizData;
  if (currentCategory !== 'all') {
    filtered = filtered.filter(q => q.category === currentCategory);
  }
  
  if (filtered.length === 0) {
    alert('Для данного предмета пока нет тестов!');
    return;
  }
  
  // Shuffle all questions
  currentQuizQuestions = shuffle([...filtered]);
  // Limit to 10 max
  if (currentQuizQuestions.length > 10) {
    currentQuizQuestions = currentQuizQuestions.slice(0, 10);
  }
  
  currentQuizIndex = 0;
  quizScore = 0;
  
  quizSetup.classList.add('hidden');
  quizResult.classList.add('hidden');
  quizActive.classList.remove('hidden');
  
  renderQuizQuestion();
}

function renderQuizQuestion() {
  optionSelected = false;
  nextQuizBtn.classList.add('hidden');
  
  const q = currentQuizQuestions[currentQuizIndex];
  quizCategoryEl.textContent = q.category;
  quizCategoryEl.style.color = getCategoryColor(q.category);
  quizQuestionEl.textContent = q.question;
  
  quizCounterEl.textContent = `Вопрос ${currentQuizIndex + 1} / ${currentQuizQuestions.length}`;
  quizScoreEl.textContent = `Очки: ${quizScore}`;
  
  quizOptionsEl.innerHTML = '';
  
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt;
    
    btn.addEventListener('click', () => handleOptionClick(btn, opt, q.answer));
    quizOptionsEl.appendChild(btn);
  });
}

function handleOptionClick(btn, selectedOpt, correctAnswerLetter) {
  if (optionSelected) return;
  optionSelected = true;
  
  const buttons = quizOptionsEl.querySelectorAll('.quiz-option');
  
  const isCorrect = selectedOpt.startsWith(correctAnswerLetter + ')');
  
  if (isCorrect) {
    btn.classList.add('correct');
    quizScore++;
    quizScoreEl.textContent = `Очки: ${quizScore}`;
  } else {
    btn.classList.add('wrong');
  }
  
  buttons.forEach(b => {
    b.disabled = true;
    if (b.textContent.startsWith(correctAnswerLetter + ')')) {
      b.classList.add('correct');
    }
  });
  
  nextQuizBtn.classList.remove('hidden');
}

nextQuizBtn.addEventListener('click', () => {
  currentQuizIndex++;
  if (currentQuizIndex < currentQuizQuestions.length) {
    renderQuizQuestion();
  } else {
    showQuizResult();
  }
});

function showQuizResult() {
  quizActive.classList.add('hidden');
  quizResult.classList.remove('hidden');
  finalScoreEl.textContent = `Вы набрали ${quizScore} из ${currentQuizQuestions.length}`;
}

startQuizBtn.addEventListener('click', startQuiz);
restartQuizBtn.addEventListener('click', startQuiz);

mobileMenuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// Init
renderSidebar();
switchMode('kb'); // default
