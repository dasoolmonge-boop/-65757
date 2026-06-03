const fs = require('fs');

const text = fs.readFileSync('Вопросы и ответы .txt', 'utf8');
const lines = text.split('\n');

const flashcards = [];
let currentCategory = 'ОБЩЕЕ';
let currentQuestion = '';
let currentAnswer = [];

const categoriesList = [
  "БЕЗОПАСНОСТЬ ЖИЗНЕДЕЯТЕЛЬНОСТИ",
  "БИЗНЕС-ПЛАНИРОВАНИЕ",
  "МЕНЕДЖМЕНТ",
  "ЭКОНОМИКА ОРГАНИЗАЦИЙ",
  "ОСНОВЫ АЛГОРИТМИЗАЦИИ И ПРОГРАММИРОВАНИЯ",
  "АНАЛИЗ И МОДЕЛИРОВАНИЕ БИЗНЕС-ПРОЦЕССОВ",
  "УПРАВЛЕНИЕ ТРЕБОВАНИЯМИ И ПРОЕКТИРОВАНИЕ ИС",
  "УПРАВЛЕНИЕ ИТ-ПРОЕКТАМИ",
  "МЕТОДЫ И СПОСОБЫ АНАЛИЗА ДАННЫХ В БИЗНЕСЕ",
  "ЭФФЕКТИВНОСТЬ ИТ",
  "ФИЗИЧЕСКАЯ КУЛЬТУРА И СПОРТ",
  "ПРАВОВЫЕ ОСНОВЫ ПРОТИВОДЕЙСТВИЯ КОРРУПЦИИ",
  "ТЕОРИЯ СИСТЕМ И СИСТЕМНЫЙ АНАЛИЗ"
];

// Helper to match category loosely
const getMatchedCategory = (line) => {
  const t = line.trim().toUpperCase();
  if (t.includes('БЕЗОПАСНОСТЬ ЖИЗНЕДЕЯТЕЛЬНОСТИ')) return categoriesList[0];
  if (t.includes('БИЗНЕС-ПЛАНИРОВАНИЕ')) return categoriesList[1];
  if (t.includes('МЕНЕДЖМЕНТ')) return categoriesList[2];
  if (t.includes('ЭКОНОМИКА ОРГАНИЗАЦИЙ') || (t.includes('ЭКОНОМИКА') && t.length < 30)) return categoriesList[3];
  if (t.includes('ОСНОВЫ АЛГОРИТМИЗАЦИИ')) return categoriesList[4];
  if (t.includes('АНАЛИЗ И МОДЕЛИРОВАНИЕ')) return categoriesList[5];
  if (t.includes('УПРАВЛЕНИЕ ТРЕБОВАНИЯМИ')) return categoriesList[6];
  if (t.includes('УПРАВЛЕНИЕ ИТ-ПРОЕКТАМИ') || t.includes('УПРАВЛЕНИЕ ИТ ПРОЕКТАМИ')) return categoriesList[7];
  if (t.includes('МЕТОДЫ И СПОСОБЫ АНАЛИЗА ДАННЫХ')) return categoriesList[8];
  if (t.includes('ЭФФЕКТИВНОСТЬ ИТ')) return categoriesList[9];
  if (t.includes('ФИЗИЧЕСКАЯ КУЛЬТУРА')) return categoriesList[10];
  if (t.includes('ПРАВОВЫЕ ОСНОВЫ') || t.includes('ПРОТИВОДЕЙСТВИЯ КОРРУПЦИИ')) return categoriesList[11];
  if (t.includes('ТЕОРИЯ СИСТЕМ')) return categoriesList[12];
  
  return null;
}

const questionRegex = /^(?:Вопрос\s*\d+\.|\d+\.)\s*(.+)/;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const matchedCat = getMatchedCategory(line);
  if (matchedCat) {
    if (currentQuestion) {
      flashcards.push({ category: currentCategory, question: currentQuestion, answer: currentAnswer.join('\n') });
      currentQuestion = '';
      currentAnswer = [];
    }
    currentCategory = matchedCat;
    continue;
  }

  const qMatch = line.match(questionRegex);
  if (qMatch) {
    if (currentQuestion) {
      flashcards.push({ category: currentCategory, question: currentQuestion, answer: currentAnswer.join('\n') });
    }
    currentQuestion = qMatch[1].trim();
    currentAnswer = [];
  } else {
    if (currentQuestion) {
      currentAnswer.push(line);
    }
  }
}
if (currentQuestion) {
  flashcards.push({ category: currentCategory, question: currentQuestion, answer: currentAnswer.join('\n') });
}

const existingDataJs = fs.readFileSync('data.js', 'utf8');
const quizQuestionsMatch = existingDataJs.match(/export const quizQuestions = (\[[\s\S]*?\]);/);
const quizQuestionsStr = quizQuestionsMatch ? quizQuestionsMatch[0] : 'export const quizQuestions = [];';

const subjects = [...new Set(flashcards.map(f => f.category))];

const outContent = `export const flashcardsData = ${JSON.stringify(flashcards, null, 2)};\n\n${quizQuestionsStr}`;

fs.writeFileSync('data.js', outContent);
console.log('Parsed flashcards: ', flashcards.length);
console.log('Subjects found: ', subjects.join(', '));
