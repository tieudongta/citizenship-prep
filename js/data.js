const userData = {
  language: 'en',
  testType: 'civic',
  score: 0,
  currentQuestionIndex: 0,
  missedQuestions: [], // Initialize as an empty array
  flashcards: [], // Initialize as an empty array
};

localStorage.setItem('userData', JSON.stringify(userData));

function getSavedQuestions() {
  const { language, testType } = getUserData();
  console.log(language, testType);
  return JSON.parse(localStorage.getItem(`${testType}_${language}_data`)) || [];
}
// Save data to localStorage
function saveTestData(testType, language, data) {
  const key = `${testType}_${language}_data`;
  localStorage.setItem(key, JSON.stringify(data));
}

// Load data from localStorage
function getTestData(testType, language) {
  const key = `${testType}_${language}_data`;
  const rawData = localStorage.getItem(key);
  return rawData ? JSON.parse(rawData) : null;
}

// Load JSON file from URL and save to localStorage
async function fetchAndSaveData(testType, language) {
  const fileName = `data/${testType}_${language}.json`; // e.g., civic_en.json
  try {
    const response = await fetch(fileName);
    if (!response.ok) throw new Error(`Failed to fetch ${fileName}`);
    const data = await response.json();
    saveTestData(testType, language, data);
    console.log("Data loaded and saved to localStorage:", data);
    return data;
  } catch (err) {
    console.error("Error loading JSON:", err);
    return null;
  }
}
function setUserLanguage(lang) {
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  userData.language = lang;
  localStorage.setItem('userData', JSON.stringify(userData));
}
 function setTestType(type) {
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    userData.testType = type;
    localStorage.setItem('userData', JSON.stringify(userData));
    }
function getUserData() {
   
  return JSON.parse(localStorage.getItem('userData')) || {};
}
function setUserScore(score) {
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  userData.score = score;
  localStorage.setItem('userData', JSON.stringify(userData));
}