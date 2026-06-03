import './style.css';
import { flashcardsData } from './data.js';

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

// Elements
const categoryNav = document.getElementById('category-nav');
const questionsList = document.getElementById('questions-list');
const searchInput = document.getElementById('search-input');
const currentCategoryTitle = document.getElementById('current-category-title');
const questionsCount = document.getElementById('questions-count');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.getElementById('sidebar');

// State
let currentCategory = 'all';
let searchQuery = '';

// Get unique categories
const categories = ['all', ...new Set(flashcardsData.map(c => c.category))];

const categoryNames = {
  'all': 'Все предметы',
};

// Render Sidebar
function renderSidebar() {
  categoryNav.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `category-btn ${cat === currentCategory ? 'active' : ''}`;
    btn.textContent = categoryNames[cat] || cat;
    
    // Add color accent
    if (cat !== 'all') {
      btn.style.borderLeft = `3px solid transparent`;
      if (cat === currentCategory) {
        btn.style.borderLeftColor = getCategoryColor(cat);
        btn.style.boxShadow = `inset 3px 0 0 ${getCategoryColor(cat)}`;
      }
    }

    btn.addEventListener('click', () => {
      currentCategory = cat;
      searchInput.value = ''; // Clear search on category change
      searchQuery = '';
      
      renderSidebar(); // re-render to update active class
      renderQuestions();
      
      // Close mobile sidebar if open
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
      }
    });
    categoryNav.appendChild(btn);
  });
}

// Filter and Render Questions
function renderQuestions() {
  questionsList.innerHTML = '';
  
  let filtered = flashcardsData;
  
  // Filter by category
  if (currentCategory !== 'all') {
    filtered = filtered.filter(q => q.category === currentCategory);
    currentCategoryTitle.textContent = currentCategory;
  } else {
    currentCategoryTitle.textContent = 'Все предметы';
  }
  
  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(q => 
      q.question.toLowerCase().includes(query) || 
      q.answer.toLowerCase().includes(query)
    );
  }
  
  questionsCount.textContent = `${filtered.length} вопросов`;
  
  if (filtered.length === 0) {
    questionsList.innerHTML = '<p style="color: var(--text-muted); padding: 2rem;">Ничего не найдено по вашему запросу.</p>';
    return;
  }
  
  filtered.forEach((q, index) => {
    const color = getCategoryColor(q.category);
    
    const item = document.createElement('div');
    item.className = 'accordion-item';
    
    // Header
    const header = document.createElement('div');
    header.className = 'accordion-header';
    
    const titleWrapper = document.createElement('div');
    
    const tag = document.createElement('span');
    tag.className = 'accordion-category-tag';
    tag.style.color = color;
    tag.textContent = q.category;
    
    const title = document.createElement('h3');
    title.className = 'accordion-title';
    title.textContent = q.question;
    
    // Only show tag if 'all' is selected
    if (currentCategory === 'all') {
      titleWrapper.appendChild(tag);
    }
    titleWrapper.appendChild(title);
    
    const icon = document.createElement('div');
    icon.className = 'accordion-icon';
    icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    
    header.appendChild(titleWrapper);
    header.appendChild(icon);
    
    // Content
    const content = document.createElement('div');
    content.className = 'accordion-content';
    
    const inner = document.createElement('div');
    inner.className = 'accordion-inner';
    inner.textContent = q.answer;
    
    content.appendChild(inner);
    
    item.appendChild(header);
    item.appendChild(content);
    
    // Toggle Logic
    header.addEventListener('click', () => {
      item.classList.toggle('active');
      if (item.classList.contains('active')) {
        item.style.borderColor = color;
      } else {
        item.style.borderColor = 'var(--card-border)';
      }
    });
    
    questionsList.appendChild(item);
  });
}

// Search Listeners
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderQuestions();
});

// Mobile menu listener
mobileMenuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// Init
renderSidebar();
renderQuestions();
