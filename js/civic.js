 const views = document.querySelectorAll('.view');
    function showView(id) {
        console.log(id);
      views.forEach(v => v.classList.remove('active-view'));
      document.getElementById(id).classList.add('active-view');
    }
    const messageParagraph = document.querySelector('#test-select-view .info-area');
let currentQuestions = [];
let currentFlashCards = [];
let currentQuestionIndex = 0;
let currentCardIndex = 0;
let score = 0;
    ['en', 'vi', 'es'].forEach(id => {
      document.getElementById(id).addEventListener('click', () => {
        showView('test-select-view');
        setUserLanguage(id);
      }); 
    });

    ['civic', 'n400', 'review','vocab'].forEach(id => {
        
      document.getElementById(id).addEventListener('click', () => {
        console.log(userData);
        if (id === 'civic') {
          setTestType('civic');
          loadQuestionsAndStartQuiz();
          showView('quiz-view');
          return;
        }
        if (id === 'n400') {
          setTestType('n400');
          loadQuestionsAndStartQuiz();
          showView('quiz-view');
          return;
        }
        if (id === 'review') {
          if (userData.missedQuestions.length === 0) {
            setTestType('review');
          loadQuestionsFromLocal();
          }
          return;
        }
        if (id === 'vocab') {
            console.log('Loading flashcards...');
            setTestType('vocab');
            loadQuestionsAndStartQuiz();        
        }
      });
    });

    document.getElementById('vocab').addEventListener('click', () => showView('flashcards-view'));

    document.querySelectorAll('.answer-option').forEach(btn => {
      btn.addEventListener('click', () => showView('answer-view'));
    });

    document.getElementById('next-question').addEventListener('click', () => {
        currentQuestionIndex++;
      if (currentQuestionIndex < currentQuestions.length) {
        showView('quiz-view');
        displayQuestion(currentQuestions[currentQuestionIndex]); 
      }else {       
        showView('result-view');
      }
    });

    document.getElementById('quit-to-home').addEventListener('click', () => {
        
        const userData = getUserData();
        const { correct, incorrect, unanswered } = getQuizResults(userData);
        showResultChart(correct, incorrect, unanswered);
        showView('result-view')
    });

    document.getElementById('restart-test').addEventListener('click', () => showView('quiz-view'));
    document.querySelectorAll('.quit').forEach(btn => {
      btn.addEventListener('click', () => showView('home-view'));
    });

    document.getElementById('credit-home').addEventListener('click', () => showView('home-view'));
    document.getElementById('credit').addEventListener('click', () => showView('credit-view'));
    // Dark mode toggle
    const toggleBtn = document.querySelector('.dark-mode-toggle');
    toggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    window.addEventListener('DOMContentLoaded', () => {
      if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
      }
    });

//   document.getElementById('flip-card').addEventListener('click', () => {
//     //flashcard.classList.toggle('flipped');
//   });

  document.getElementById('next-card').addEventListener('click', () => {
    currentCardIndex = (currentCardIndex + 1) % currentFlashCards.length;
    loadFlashcardsAgain(currentCardIndex);
    console.log('Next card index:', currentCardIndex++);
  });

  document.getElementById('prev-card').addEventListener('click', () => {
    currentCardIndex = (currentCardIndex - 1 + userData.flashcards.length) % currentFlashCards.length;
    loadFlashcardsAgain(currentCardIndex);  
  });

  document.getElementById('quit-flashcards').addEventListener('click', () => {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    document.getElementById('home-view').classList.add('active-view');
  });


//   // Handle language selection
// document.getElementById('englishBtn').addEventListener('click', () => {
//   setUserLanguage('en');
//   showView('testSelectView');
// });

// // Handle test type selection
// document.getElementById('civicBtn').addEventListener('click', () => {
//   setTestType('civic');
//   loadQuestionsAndStartQuiz();
// });
// app.js
function loadQuestionsAndStartQuiz() {
  const userData = getUserData();
  console.log('User data before loading questions:', userData);

  fetchAndSaveData(userData.testType, userData.language)
    .then(questions => {
      if (questions) {
        questions = shuffleArray(questions);
        questions.forEach((question, index) => {
          question = shuffleOptions(question); // Assign an ID to each question
        });
        //showView(userData.testType + '-view');
        if(userData.testType === 'civic' || userData.testType === 'n400') {
          currentQuestions =  shuffleArray([...questions]); 
          currentQuestionIndex = 0;
          userData.currentQuestionIndex = 0;
          localStorage.setItem('userData', JSON.stringify(userData));
          displayQuestion(shuffleOptions(currentQuestions[currentQuestionIndex]));
        }else if(userData.testType === 'vocab') {
            console.log('Loading flashcards...!!!!');
            console.log('Flashcards loaded:', questions);
            currentFlashCards = questions;
            localStorage.setItem('userData', JSON.stringify(userData));
            loadFlashcardsAgain(currentCardIndex);
        }
      } else {
        alert('Could not load questions.');
      }
    });
}
function displayQuestion(questionObj) {
  const infoArea = document.querySelector('#quiz-view .info-area');
  const buttonArea = document.querySelector('#quiz-view .button-area');
  // Show question
  const questionAudio = new Audio(questionObj.audio);
  questionAudio.play();
  infoArea.innerHTML = `<p>${questionObj.question}</p>`;

  // Show answer options
  buttonArea.innerHTML = '';
  questionObj.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice;
    btn.onclick = () => handleAnswer(choice, questionObj.answer);
    buttonArea.appendChild(btn);
  });
}
function handleAnswer(selected, correct) {
    const userData = JSON.parse(localStorage.getItem('userData'));
  const currentQuestion = currentQuestions[currentQuestionIndex];
  
  const isCorrect = selected === correct;
  if (!isCorrect) {
    const incorrectAudio = new Audio('assets/incorrect.mp3');
    const audioSrc = currentQuestion.audio.replace('_q', '_a');
    const missedAudio = new Audio(audioSrc);
    incorrectAudio.addEventListener('ended', () => {
      missedAudio.play();
    });
    incorrectAudio.play();
    const alreadyMissed = userData.missedQuestions.some(q => q.id === currentQuestion.id);
    if (!alreadyMissed) {
      userData.missedQuestions.push(currentQuestion);
      
    }
  }else{
    const correctAudio = new Audio('assets/correct.mp3');
    correctAudio.play();
    const index = userData.missedQuestions.findIndex(q => q.id === currentQuestion.id);
    if (index !== -1) {
      userData.missedQuestions.splice(index, 1);
    }
  }
  // Update currentQuestionIndex and save
  userData.score = isCorrect ? ++score : score;
  userData.currentQuestionIndex += 1;
  localStorage.setItem('userData', JSON.stringify(userData));
  console.log('Missed questions:', userData.missedQuestions);
  showView('answer-view');
  const infoArea = document.querySelector('#answer-view .info-area');
  infoArea.innerHTML = `
  <div id="answerInfo" class="info-area ${isCorrect ? 'correct-answer' : 'incorrect-answer'}"> <!-- or incorrect-answer -->
    <div class="answer-content">
      <p class="question-text"><strong>Question:</strong>${currentQuestions[currentQuestionIndex].question}</p>
      <p class="user-answer"><strong>Your Answer:</strong> ${selected}</p>
      <p class="correct-answer"><strong>Correct Answer:</strong> ${correct}</p>
      <p class="explanation"><strong>Explanation:</strong> ${isCorrect ? '✅ Correct!' : '❌ Incorrect.'}</p>
    </div>
  </div>
  `;
}
function loadQuestionsFromLocal() {
  const userData = getUserData();
  const questions = userData.missedQuestions;
  console.log('Missed questions:', questions);
  currentQuestionIndex = 0;
  userData.currentQuestionIndex = 0;
  localStorage.setItem('userData', JSON.stringify(userData));
  if (questions.length > 0) {
    currentQuestions = questions;
    displayQuestion(shuffleOptions(currentQuestions[currentQuestionIndex]));
  } else {
    messageParagraph.innerHTML = '<p>No missed questions found.</p>';
  }
}
 let front = document.querySelector('.card-front');
  let back = document.querySelector('.card-back');
  let flashcard = document.querySelector('.card');
function loadFlashcardsAgain(index) {
    console.log('Loading flashcards...XXXX');
    console.log('Flashcards loaded:', currentFlashCards);
    console.log('Current card index:', currentCardIndex);
    console.log('Current card:', currentFlashCards[index]);
    const card = currentFlashCards[index];
    console.log('Current card:', card);
    front.textContent = card.word;
    back.textContent = card.definition;
    flashcard.classList.remove('flipped');
     flashcard.addEventListener('click', () => {
    // Toggle the 'flipped' class when the card is clicked
    flashcard.classList.toggle('flipped');
}
);
}
function showResultChart(correct, incorrect, unanswered) {
  const ctx = document.getElementById('resultChart').getContext('2d');

  // Destroy any existing chart before creating a new one
  if (window.resultChartInstance) {
    window.resultChartInstance.destroy();
  }

  window.resultChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Correct', 'Incorrect', 'Unanswered'],
      datasets: [{
        data: [correct, incorrect, unanswered],
        backgroundColor: [
          '#28a745',   // green
          '#dc3545',   // red
          '#ffc107'    // yellow
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: document.body.classList.contains('dark') ? '#fff' : '#000'
          }
        }
      }
    }
  });
}
function getQuizResults(data) {
  const correct = data.score;
  const incorrect = data.missedQuestions.length;
  const unanswered = currentQuestions.length - (correct + incorrect);
  return { correct, incorrect, unanswered };
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
function shuffleOptions(question) {
    console.log('Shuffling options for question:', question);
  const shuffled = shuffleArray([...question.choices]);
    console.log('Shuffled options:', shuffled);
  return {
    ...question,
    choices: shuffled
  };
}
