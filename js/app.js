const appState = {
  language: null,
  testType: null,
  score: 0,
  questions: [],
  questionsAnswered: 0,
  answers: [],
  missedQuestions: [],
  flashcardSource: null, // 'missed' or 'vocab'
  flashcards: []
};
const flashcards = {
  missed: [], // from incorrect answers
  vocab: []   // static list or fetched separately
};

console.log("App state initialized:", appState);
// Get references
const langButtons = document.querySelectorAll('.langBtn');
const homePage = document.getElementById('homePage');
const testTypePage = document.getElementById('testTypePage');
const testTypeButtons = document.querySelectorAll('.testTypeBtn');
const testPage = document.getElementById('testPage');
const quitBtn = document.getElementById('quitBtn');
const resultPage = document.getElementById('resultPage');
const restartBtn = document.getElementById('restartBtn');
const homeBtn = document.getElementById('homeBtn');
const explanationPage = document.getElementById('explanationPage');
const explanationFeedback = document.getElementById('explanationFeedback');
const explanationText = document.getElementById('explanationText');
const continueBtn = document.getElementById('continueBtn');
const flashcardPage = document.getElementById('flashcardPage');
let myChart = null;
let currentAudio = null;
// Load Quiz data
async function loadQuizData() {
  const lang = appState.language;
  const type = appState.testType;

  const filePath = `data/${type}_${lang}.json`;
  try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load quiz data: ${response.status}`);
      }
      const data = await response.json();
      appState.questions = data;
      appState.questions = shuffleArray(appState.questions);
      appState.questions.forEach((question, index) => {
        question.choices = shuffleArray(question.choices);
      });
      //console.log("Quiz data loaded:", data);
    } catch (error) {
      console.error("Error loading quiz data:", error);
      alert("Unable to load quiz questions. Please check your data files.");
    }
//   if (appState.testType === 'missed') {
//     const missed = localStorage.getItem(`missed_${lang}`);
//     if (missed) {
//       appState.questions = shuffleArray(JSON.parse(missed));
//     } else {
//       appState.questions = [];
//     }
//   }
// else {
    
//   }
}

// Load the app state from local storage
//reset the app state if the user is on the result page
function resetAppState() {
  appState.language = null;
  appState.testType = null;
  appState.score = 0;
  appState.questionsAnswered = 0;
  appState.totalQuestions = 0;
  appState.answers = [];
}

// Shuffle array function (Fisher-Yates algorithm)
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
  }
  return arr;
}

// write missed questions to  missed_en.json
function saveMissedQuestions() {
  
  localStorage.setItem(`missed_${appState.language}`, JSON.stringify(appState.missed));
}

// Check if the app state is empty
if (appState.language && !appState.testType) {
  homePage.classList.add('hidden');
  testTypePage.classList.remove('hidden');
} else if (appState.testType) {
  homePage.classList.add('hidden');
  testTypePage.classList.add('hidden');
  testPage.classList.remove('hidden');
}
langButtons.forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const selectedLang = e.target.dataset.lang;
    appState.language = selectedLang;
    await loadVocabulary(appState.language);
    saveAppState();
    console.log("Language selected:", appState.language);
    homePage.classList.add('hidden');
    testTypePage.classList.remove('hidden');
  });
});

// Function show explanation page


// Function to show ex

testTypeButtons.forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const testType = e.target.dataset.type;
    appState.testType = testType;
    appState.score = 0;
    appState.questionsAnswered = 0;
    appState.answers = [];
    saveAppState();
    console.log("Test type selected:", testType);
    // Placeholder score
    console.log("Score:",appState.score);
    await loadQuizData();
    displayQuestion(0);
    testTypePage.classList.add('hidden');
    testPage.classList.remove('hidden');
  });
});



quitBtn.addEventListener('click', () => {
  console.log(`User quit the test. Score: ${appState.score}`);
  console.log("Chart ID", myChart);
  showTestResults();
  testPage.classList.add('hidden');
  resultPage.classList.remove('hidden');
  saveAppState();
});



restartBtn.addEventListener('click', () => {
 // Reset the app state to restart the test
 appState.score = 0;
 appState.questionsAnswered = 0;
 appState.answers = [];
  resultPage.classList.add('hidden');
  testPage.classList.remove('hidden');
});

homeBtn.addEventListener('click', () => {
  console.log(`Return to home page, language: ${appState.language}, test type: ${appState.testType}`);
  resultPage.classList.add('hidden');
  homePage.classList.remove('hidden');
  resetAppState();
  saveAppState();
});

//reset the app state
function resetAppState() {
  appState.language = null;
  appState.testType = null;
  appState.score = 0;
  appState.questionsAnswered = 0;
  appState.totalQuestions = 0;
  appState.answers = [];
}

// Display questions
function displayQuestion(index) {
  const container = document.getElementById('questionContainer');
  const questionData = appState.questions[index];

  // Clear existing content
  container.innerHTML = '';

  // Add question text
  const questionEl = document.createElement('h3');
  questionEl.textContent = questionData.question;
  container.appendChild(questionEl);
  playAudio(questionData.audio); // Play audio if available
  // Add answer buttons
  questionData.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.textContent = choice;
    btn.className = 'answerBtn';
    btn.dataset.index = i;
    container.appendChild(btn);
    btn.addEventListener('click', () => {
      const isCorrect = choice === questionData.answer;
      //store result
      appState.answers.push({
        questionIndex: index,
        selected: parseInt(btn.dataset.index),
        answer: questionData.answer,
        isCorrect: isCorrect
      });
      if (isCorrect) {
        appState.score++;
        let correctAudio = 'assets/correct.mp3';
        playAudio(correctAudio); // Play correct answer audio
      }else{
        console.log("Missed question:", appState.questions[appState.questionsAnswered]);
        appState.missedQuestions.push(appState.questions[appState.questionsAnswered]);
        audioSrc = 'assets/incorrect.mp3';
        const audio1 = new Audio(audioSrc); // Play incorrect answer audio 
        audioSrc = questionData.audio.replace('_q', '_a');
        console.log("Audio source:", audioSrc);
        const audio2 = new Audio(audioSrc);
        audio1.addEventListener('ended', () => {
          audio2.play();
        });
        audio1.play();
        flashcards.missed.push({
          front: questionData.question,
          back: questionData.correct,
          explanation: questionData.explanation || ""
        });
      }
      appState.questionsAnswered++;
      saveAppState();
      console.log("Answer selected:", choice, "Correct:", isCorrect);
      console.log("Score:", appState.score);

      //show explanation page
       showExplanation(questionData.description, isCorrect);
  });
  });

  // Update progress
  document.getElementById('progressText').textContent = `${index + 1} / ${appState.questions.length}`;
  document.getElementById('progressBar').value = (index + 1) / appState.questions.length * 100;
}
// Show explanation page
// show explanation page
  function showExplanation(explanation, isCorrect) {
    explanationText.textContent = explanation;
    explanationFeedback.textContent = isCorrect ? "Correct!" : "Incorrect!";
    explanationPage.classList.remove('hidden');
    testPage.classList.add('hidden');
  }
  function handleContinue() {
    console.log("Continue to next question");
    const currentQuestionIndex = appState.questionsAnswered;
    if (currentQuestionIndex < appState.questions.length) {
      displayQuestion(currentQuestionIndex);
      explanationPage.classList.add('hidden');
      testPage.classList.remove('hidden');
    } else {
      explanationPage.classList.add('hidden');
      resultPage.classList.remove('hidden');
      showTestResults();
    } 
  }
// Calculate score
function calculateScore() {
  // let correctAnswers = 0;

  // // Loop through each question to check answers
  // appState.questions.forEach((question, index) => {
  //   if (appState.answers[index] === question.correctAnswer) {
  //     correctAnswers++;
  //   }
  // });

  // appState.score = correctAnswers; // Update score
  console.log("Calculating score...", Object.keys(appState));
  console.log("Answered:", appState.questionsAnswered);
  console.log("Questions:", appState.questions.length);
  //wrong answer = appState.quesionsAnswer - score;
  appState.totalQuestions = appState.questions.length; // Total questions
  console.log("Score:", appState.score, "Total:", appState.totalQuestions);
}
function showTestResults() {
  calculateScore(); // Calculate the score

  // Display the score summary
  const scoreSummary = document.getElementById('scoreSummary');
  scoreSummary.innerHTML = `You answered correctly ${appState.score} out of ${appState.questionsAnswered} questions correctly.`;

  // Show the result page
  const resultPage = document.getElementById('resultPage');
  resultPage.classList.remove('hidden');

  // Optionally, display a pie chart (using Chart.js)
  displayPieChart();

  // Hide test page
  const testPage = document.getElementById('testPage');
  testPage.classList.add('hidden');
}

function displayPieChart() {
  const chartCanvas = document.getElementById('scoreChart');
  
  // Clear the canvas before drawing
  chartCanvas.width = 400; // Set the width of the canvas
  chartCanvas.height = 400; // Set the height of the canvas
  // Clear the canvas
  if (chartCanvas.getContext) {
    chartCanvas.getContext('2d').clearRect(0, 0, chartCanvas.width, chartCanvas.height);
  }
  chartCanvas.getContext('2d').clearRect(0, 0, chartCanvas.width, chartCanvas.height);
  const ctx = document.getElementById('scoreChart').getContext('2d');
  if(myChart !== null){
    myChart.destroy();
  }
  const correct = appState.score;
  const incorrect = appState.questionsAnswered - correct;
  const unanswered = appState.totalQuestions - correct - incorrect;
  // Create the pie chart
  myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Correct', 'Incorrect','Unanswered'],
      datasets: [{
        data: [correct, incorrect, unanswered],
        backgroundColor: ['#00b4d8', '#ff6347','#9E9E9E'],
        borderColor: ['#fff', '#fff','#fff'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true
    }
  });
}

// Load the app state from local storage
function loadAppState() {
  const savedState = localStorage.getItem('appState');
  if (savedState) {
    Object.assign(appState, JSON.parse(savedState));
  }
}
// Save the app state to local storage
function saveAppState() {
  localStorage.setItem('appState', JSON.stringify(appState));
}
/** LOGIC PART */
// Togle the dark mode
document.addEventListener("DOMContentLoaded", function () {
  const themeBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");

  // Apply saved theme on load
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeIcon.classList.replace("fa-moon", "fa-sun");
  }

  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");

    // Store the theme choice
    localStorage.setItem("theme", isDark ? "dark" : "light");

    // Toggle icon
    themeIcon.classList.replace(
      isDark ? "fa-moon" : "fa-sun",
      isDark ? "fa-sun" : "fa-moon"
    );
  });
});
// move to section

window.addEventListener('DOMContentLoaded', () => {
  loadAppState();
  // Check if the app state is not empty
   if (appState.questions.length > 0 && appState.currentQuestionIndex < appState.questions.length) {
    // User left mid-quiz, resume it
    console.log("Resuming quiz...");
  } 
  
});
function showHomePage() {
  homePage.classList.remove('hidden');
  testTypePage.classList.add('hidden');
  testPage.classList.add('hidden');
  resultPage.classList.add('hidden');
  explanationPage.classList.add('hidden');
}
// function showTestPage() {
//   homePage.classList.add('hidden');
//   testTypePage.classList.add('hidden');
//   testPage.classList.remove('hidden');
//   resultPage.classList.add('hidden');
//   explanationPage.classList.add('hidden');
//   displayQuestion(appState.currentQuestionIndex);
//   // Update progress
//   document.getElementById('progressText').textContent = `${appState.currentQuestionIndex + 1} / ${appState.questions.length}`;
//   document.getElementById('progressBar').value = (appState.currentQuestionIndex + 1) / appState.questions.length * 100;
// }
// document.getElementById('continueBtn').addEventListener('click', () => {
//   showTestPage();
// });

document.querySelector('[data-type="missed"]').addEventListener('click', () => {
  if (!appState.missedQuestions || appState.missedQuestions.length === 0) {
    alert("No missed questions to review.");
    return;
  }

  appState.testType = "missed";
  appState.questions = [...appState.missedQuestions];
  appState.missedQuestions = []; // Optionally clear them
  appState.score = 0;
  appState.questionsAnswered = 0;
  appState.answers = [];

  saveAppState();
  displayQuestion(0);
  testTypePage.classList.add('hidden');
  testPage.classList.remove('hidden');
});
const reviewMissedBtn = document.getElementById('reviewMissedBtn');

reviewMissedBtn.addEventListener('click', () => {
  if (!appState.missedQuestions || appState.missedQuestions.length === 0) {
    alert("No missed questions to review.");
    return;
  }

  appState.testType = "review";
  appState.questions = [...appState.missedQuestions];
  appState.missedQuestions = [];
  appState.questionsAnswered = 0;
  appState.answers = [];
  appState.score = 0;

  saveAppState();

  resultPage.classList.add('hidden');
  displayQuestion(0);
  testPage.classList.remove('hidden');
});
let currentCardIndex = 0;
let CardType = 'vocab'; // Default to vocab
function showFlashcard(card) {
  console.log("Showing flashcard:", card[currentCardIndex]);
  console.log("Current card type:", CardType);
  document.getElementById('cardFront').textContent = card[currentCardIndex].front;
  document.getElementById('cardBack').textContent = card[currentCardIndex].back;
  document.getElementById('cardBack').classList.add('hidden');
}



// document.getElementById('nextCardBtn').onclick = () => {
//   currentCardIndex++;
//   console.log("Current card index:", currentCardIndex);
//   console.log("Current card type:", CardType);
//   if(appState.CardType === 'vocab'){
//     if (currentCardIndex >= flashcards.vocab.length) {
//       currentCardIndex = 0;
//     }
//     showFlashcard(flashcards.vocab[currentCardIndex]);
//   }else{
//     if (currentCardIndex < flashcards.missed.length) {
//     showFlashcard(flashcards.missed[currentCardIndex]);
//   } else {
//     alert("You've reviewed all missed questions!");
//     flashcardPage.classList.add('hidden');
//     homePage.classList.remove('hidden');
//   }
//   }
// };
document.getElementById('reviewFlashcardsBtn').onclick = () => {
  if (flashcards.missed.length === 0) {
    alert("No missed questions to review.");
    return;
  }
  currentCardIndex = 0;
  showFlashcard(flashcards.missed[0]);
  testResultPage.classList.add('hidden');
  flashcardPage.classList.remove('hidden');
};
async function loadVocabulary(languageCode) {
  const fileName = `data/vocab_${languageCode}.json`;
  try {
    const response = await fetch(fileName);
    if (!response.ok) throw new Error("Failed to load vocabulary file");
    const vocabList = await response.json();
    flashcards.vocab = vocabList.map(item => ({
      front: item.word,
      back: `${item.definition}\n\nExample: ${item.example}`
    }));
    appState.flashcardSource = 'vocab';
    appState.flashcards = flashcards.vocab;
    appState.currentFlashcardIndex = 0;
    // Save the app state
    saveAppState();
    console.log("Vocabulary flashcards loaded:", flashcards.vocab.length);
  } catch (error) {
    console.error("Error loading vocabulary:", error);
  }
}

document.getElementById('reviewFlashcardsBtn').onclick = () => {
  if (flashcards.vocab.length === 0) {
    alert("No vocabulary loaded.");
    return;
  }
  currentCardIndex = 0;
  showFlashcardPage();
  // homePage.classList.add('hidden');
  // flashcardPage.classList.remove('hidden');
};
function showFlashcardPage() {
  const flashcard = appState.flashcards[appState.currentFlashcardIndex];
  homePage.classList.add('hidden');
  testTypePage.classList.add('hidden');
  testPage.classList.add('hidden');
  resultPage.classList.add('hidden');
  explanationPage.classList.add('hidden');
  flashcardPage.classList.remove('hidden');
  console.log(flashcards);
  if (flashcards.vocab.length === 0) {
    flashcardPage.innerHTML = "<p>No flashcards available.</p>";
    return;
  }
  const flashcardContent = document.getElementById('flashcardContent');
  // Clear the flashcard page
  flashcardContent.innerHTML = '';
  // Create the flashcard element

  flashcardContent.innerHTML = `
    <div class="flashcard">
      <h2>${flashcards.vocab[currentCardIndex].front}</h2>
      <p><strong>Meaning:</strong> ${flashcards.vocab[currentCardIndex].back}</p>
      <p><strong>Example:</strong> ${flashcards.vocab[currentCardIndex].example || "N/A"}</p>
      <button id="flipBtnF">Flip</button>
      <button id="nextCardBtn">Next</button>
    </div>
  `;

  // Flip logic
  document.getElementById('#flipBtnF').forEach(btn => {
    btn.onclick = () => {
      document.getElementById('cardBack').classList.toggle('hidden');
      document.getElementById('cardFront').classList.toggle('hidden');
    };
  });

  document.getElementById('nextFlashcardBtn').onclick = () => {
    appState.currentFlashcardIndex = (appState.currentFlashcardIndex + 1) % appState.flashcards.length;
    showFlashcardPage();
  };
}

function playAudio(audioSrc) {
  // Stop any currently playing audio
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
    currentAudio.currentTime = 0; // rewind
  }

  // Create and play new audio
  currentAudio = new Audio(audioSrc);
  currentAudio.play().catch(err => {
    console.warn("Audio playback failed:", err);
  });
}