const corsProxy = "https://api.allorigins.win/get?url=";
const apiUrl = "https://api.jsonserve.com/Uw5CrX";

const buttonE1 = document.querySelector(".button"); // Ensure button exists
const clickHandler = async () => {
//   console.log("Is button working?");
  try {
    const response = await fetch(corsProxy + encodeURIComponent(apiUrl));

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    // Parse the first JSON response from the proxy
    const rawData = await response.json();

    // Parse the actual API JSON from `contents`
    const data = JSON.parse(rawData.contents);
    // console.log(data);

    if (data.questions && data.questions.length > 1) {
      const description = data.questions[0].description;
      console.log(description);

      const headingElement = document.querySelector(".heading");
      if (headingElement) {
        headingElement.innerHTML = `${description}`;
      } else {
        console.error("Element with class 'heading' not found.");
      }
    } else {
      console.error("Questions data is not available or insufficient.");
    }

    if (data.questions && data.questions.length > 0 && data.questions[0].options && data.questions[0].options.length >= 4) {
      const optionLetters = ['A', 'B', 'C', 'D'];
      for (let i = 0; i < 4; i++) {
        if (data.questions[0].options[i].description) {
          const optionDescription = data.questions[0].options[i].description;
          console.log(optionDescription);

          const optionElement = document.querySelector(`.option${i + 1}`);
          if (optionElement) {
            optionElement.innerHTML = `${optionLetters[i]}: ${optionDescription}`;
          } else {
            console.error(`Element with class 'option${i + 1}' not found.`);
          }
        } else {
          console.error(`Option ${i + 1} description not found.`);
        }
      }
    } else {
      console.error("Questions or options data is not available or insufficient.");
    }
  } catch (err) {
    console.error("Fetch Error:", err);
  }
};

if (buttonE1) {
  buttonE1.addEventListener("click", clickHandler);
} else {
  console.error("Button not found! Check your HTML.");
}

let currentQuestionIndex = 0;
let totalQuestions = 0;
let score = 0;
let timerInterval;

document.getElementById('start-button').addEventListener('click', startQuiz);
document.getElementById('next-btn').addEventListener('click', nextQuestion);

async function startQuiz() {
  document.getElementById('start_screen').style.display = 'none';
  document.querySelector('.question_box').style.display = 'block';
  currentQuestionIndex = 0;
  score = 0; // Reset score
  startTimer(15 * 60); // Start 15-minute timer
  await loadQuestion();
}

async function loadQuestion() {
  try {
    const response = await fetch(corsProxy + encodeURIComponent(apiUrl)); // Using CORS proxy
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const rawData = await response.json();

    // Parse the actual API JSON from `contents`
    const data = JSON.parse(rawData.contents);
    console.log(data);

    if (data.questions && data.questions.length > 0 && data.questions[currentQuestionIndex].options && data.questions[currentQuestionIndex].options.length >= 4) {
      totalQuestions = data.questions.length;

      const description = `${currentQuestionIndex + 1}. ${data.questions[currentQuestionIndex].description}`;
      const headingElement = document.querySelector(".heading");
      if (headingElement) {
        headingElement.innerHTML = `${description}`;
      } else {
        console.error("Element with class 'heading' not found.");
      }

      const optionLetters = ['A', 'B', 'C', 'D'];
      for (let i = 0; i < 4; i++) {
        const optionElement = document.querySelector(`.option${i + 1}`);
        if (optionElement) {
          optionElement.innerHTML = `${optionLetters[i]}: ${data.questions[currentQuestionIndex].options[i].description}`;
          optionElement.onclick = () => checkAnswer(i, data.questions[currentQuestionIndex].options);
          optionElement.style.backgroundColor = ''; // Reset background color
          optionElement.disabled = false; // Enable button
        } else {
          console.error(`Element with class 'option${i + 1}' not found.`);
        }
      }

      // Update progress bar
      updateProgressBar();
    } else {
      console.error("Questions or options data is not available or insufficient.");
    }
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

function checkAnswer(selectedIndex, options) {
  const optionElements = document.querySelectorAll('#answer-buttons button');
  optionElements.forEach((button, index) => {
    button.disabled = true; // Disable all buttons after selection
    if (options[index].is_correct) {
      button.style.backgroundColor = 'rgb(61, 168, 61)'; // Correct answer
      if (index === selectedIndex) {
        score++; // Increment score if the selected answer is correct
      }
    } else if (index === selectedIndex) {
      button.style.backgroundColor = 'rgb(233, 39, 39)'; // Incorrect answer
    }
  });
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < totalQuestions) {
    loadQuestion();
  } else {
    displayScore();
  }
}

function displayScore() {
  clearInterval(timerInterval); // Stop the timer
  document.querySelector('.question_box').style.display = 'none';
  const scoreElement = document.createElement('div');
  scoreElement.className = 'score';
  scoreElement.innerHTML = `<h2>Your Score: ${score} / ${totalQuestions}</h2>
                            <button id="restart-button" class="button">Start Again</button>`;
  document.body.appendChild(scoreElement);

  document.getElementById('restart-button').addEventListener('click', restartQuiz);
}

function restartQuiz() {
  document.querySelector('.score').remove();
  document.getElementById('start_screen').style.display = 'block';
}

function updateProgressBar() {
  const progressElement = document.getElementById('progress');
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  progressElement.style.width = `${progressPercentage}%`;
}

function startTimer(duration) {
  let timer = duration, minutes, seconds;
  const timerElement = document.createElement('div');
  timerElement.id = 'timer';
  document.body.appendChild(timerElement);

  timerInterval = setInterval(() => {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    timerElement.textContent = `Time Remaining: ${minutes}:${seconds}`;

    if (--timer < 0) {
      clearInterval(timerInterval);
      displayScore();
    }
  }, 1000);
}
