const fs = require('fs');

// --- Parse Flashcards ---
const text = fs.readFileSync('Вопросы и ответы .txt', 'utf8');
const lines = text.split('\n');
let currentSubject = '';
let currentQuestion = '';
let currentAnswer = '';
const flashcardsData = [];

function saveCard() {
    if (currentSubject && currentQuestion && currentAnswer) {
        flashcardsData.push({
            category: currentSubject,
            question: currentQuestion.trim(),
            answer: currentAnswer.trim()
        });
    }
}

const subjectList = [
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

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    let foundSubject = false;
    for (const sub of subjectList) {
        if (line.toUpperCase().includes(sub)) {
            saveCard();
            currentSubject = sub;
            currentQuestion = '';
            currentAnswer = '';
            foundSubject = true;
            break;
        }
    }
    if (foundSubject) continue;

    if (line.endsWith('?')) {
        saveCard();
        currentQuestion = line;
        currentAnswer = '';
    } else if (currentQuestion !== '') {
        currentAnswer += line + '\n';
    }
}
saveCard();


// --- Parse Quiz ---
const testText = fs.readFileSync('Тест.txt', 'utf8');
let quizData = [];
let qSubject = '';
let qQuestion = '';
let qOptions = [];
let qAnswer = '';

const testLines = testText.split('\n');
for (let i = 0; i < testLines.length; i++) {
  let line = testLines[i].trim();
  if (!line) continue;
  
  if (line.includes('(вопросы')) {
    qSubject = line.substring(0, line.indexOf('(вопросы')).trim();
    if (qSubject.includes("ЕЗОПАСНОСТЬ")) qSubject = "БЕЗОПАСНОСТЬ ЖИЗНЕДЕЯТЕЛЬНОСТИ";
    if (qSubject.includes("ФИЗИЧЕСКАЯ")) qSubject = "ФИЗИЧЕСКАЯ КУЛЬТУРА И СПОРТ";
    if (qSubject.includes("ПРАВОВЫЕ ОСНОВЫ")) qSubject = "ПРАВОВЫЕ ОСНОВЫ ПРОТИВОДЕЙСТВИЯ КОРРУПЦИИ";
    if (qSubject.includes("МЕТОДЫ АНАЛИЗА")) qSubject = "МЕТОДЫ И СПОСОБЫ АНАЛИЗА ДАННЫХ В БИЗНЕСЕ";
    continue;
  }
  
  if (line.startsWith('Вопрос ')) {
    if (qQuestion && qOptions.length > 0) {
      quizData.push({
        category: qSubject,
        question: qQuestion,
        options: qOptions,
        answer: qAnswer
      });
    }
    qQuestion = '';
    qOptions = [];
    qAnswer = '';
    
    i++;
    while (i < testLines.length && !testLines[i].trim().match(/^[A-D]\)/)) {
       if (testLines[i].trim()) {
           qQuestion += testLines[i].trim() + ' ';
       }
       i++;
    }
    qQuestion = qQuestion.trim();
    i--;
    continue;
  }
  
  if (line.match(/^[A-D]\)/)) {
    qOptions.push(line);
    continue;
  }
  
  if (line.startsWith('Правильный ответ:')) {
    qAnswer = line.split(':')[1].trim().substring(0, 1);
    continue;
  }
}
if (qQuestion && qOptions.length > 0) {
  quizData.push({
    category: qSubject,
    question: qQuestion,
    options: qOptions,
    answer: qAnswer
  });
}

const fileContent = `export const flashcardsData = ${JSON.stringify(flashcardsData, null, 2)};\n\nexport const quizData = ${JSON.stringify(quizData, null, 2)};\n`;

fs.writeFileSync('data.js', fileContent);
console.log('Parsed successfully! flashcards:', flashcardsData.length, 'quizzes:', quizData.length);
