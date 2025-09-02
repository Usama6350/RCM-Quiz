// ==================== VARIABLES ====================
let quiz = [];
let currentIndex = 0;
let stats = { correct: 0, wrong: 0, skipped: 0 };
let timer;
let timeLeft = 30;
let userInfo = { name:"", company:"", difficulty:"" };

// ==================== FUNCTIONS ====================
function shuffle(arr) {
for(let i=arr.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[arr[i], arr[j]] = [arr[j], arr[i]];
}
return arr;
}

function startQuiz() {
userInfo.name = document.getElementById('userName').value.trim();
userInfo.company = document.getElementById('companyName').value.trim();
userInfo.difficulty = document.getElementById('difficulty').value;
const numQuestionsValue = document.getElementById('numQuestions').value;

// ✅ Check if required fields are filled
if (!userInfo.name || !userInfo.company) {
alert("Please enter your Name and Company Name before starting the quiz.");
return;
}

// ✅ Check if number of questions is selected
if (!numQuestionsValue || isNaN(parseInt(numQuestionsValue))) {
alert("Please select the number of questions before starting the quiz.");
return;
}

// ✅ Filter by difficulty
const filtered = allQuestions.filter(q =>
q.diff.toLowerCase() === userInfo.difficulty.toLowerCase()
);

// ✅ Randomly pick questions
const numQuestions = parseInt(numQuestionsValue);
quiz = shuffle(filtered).slice(0, Math.min(numQuestions, filtered.length));
currentIndex = 0;
stats = { correct: 0, wrong: 0, skipped: 0 };

// ✅ Transition to quiz view
document.getElementById('startSection').classList.add('hidden');
document.getElementById('quizSection').classList.remove('hidden');
document.getElementById('resultSection').classList.add('hidden');
document.getElementById('totalCount').textContent = quiz.length;
document.getElementById('progressFill').style.width = '0%';

updateStats();
showQuestion();
}

function showQuestion() {
clearInterval(timer);
timeLeft = 30;
document.getElementById('timer').textContent = timeLeft;

document.getElementById('skipBtn').disabled = false;
document.getElementById('nextBtn').disabled = true;

timer = setInterval(() => {
timeLeft--;
document.getElementById('timer').textContent = timeLeft;
if (timeLeft <= 0) skipQuestion();
}, 1000);

const endBtn = document.getElementById('endQuizBtn');
if (endBtn) {
endBtn.disabled = false;
endBtn.style.opacity = "1";
endBtn.style.cursor = "pointer";
}

const q = quiz[currentIndex];
const shuffledOptions = shuffle(q.options.map((opt,i)=>({text:opt,index:i})));
let html = `<div class="question"><h3>Q${currentIndex+1}. ${q.question}</h3></div><div class="options">`;
shuffledOptions.forEach(({text,index})=>{
html += `<button data-index="${index}" onclick="selectAnswer(this,${index})">${text}</button>`;
});
html += '</div>';
document.getElementById('questionContainer').innerHTML = html;

// ✅ Change button text if it's the last question
const nextBtn = document.getElementById('nextBtn');
const skipBtn = document.getElementById('skipBtn');
if (currentIndex === quiz.length - 1) {
nextBtn.textContent = "Finish Quiz";
skipBtn.style.display = "none";   // optional: hide skip on last
} else {
nextBtn.textContent = "Next Question";
skipBtn.style.display = "inline-block"; // make sure skip shows otherwise
}
}

function revealAnswer(selectedIndex=null) {
const q = quiz[currentIndex];
const buttons = document.querySelectorAll('.options button');
buttons.forEach(b=>{
const idx = parseInt(b.getAttribute('data-index'));
b.disabled = true;
if(idx===q.answer) b.classList.add('selected','correct');
else if(selectedIndex!==null && idx===selectedIndex) b.classList.add('selected','incorrect');
});
document.getElementById('nextBtn').disabled = false;
updateAttempted();
}

function selectAnswer(btn, selectedIndex) {
clearInterval(timer);
document.getElementById('skipBtn').disabled = true;

// Disable End Quiz button
const endBtn = document.getElementById('endQuizBtn');
if (endBtn) {
endBtn.disabled = true;
endBtn.style.opacity = "0.6";
endBtn.style.cursor = "not-allowed";
}

// Evaluate answer
if (selectedIndex === quiz[currentIndex].answer) {
stats.correct++;
} else {
stats.wrong++;
}

updateStats();
revealAnswer(selectedIndex);
}

function skipQuestion() {
clearInterval(timer);
stats.skipped++;
updateStats();

const q = quiz[currentIndex];
const buttons = document.querySelectorAll('.options button');
buttons.forEach(b=>b.disabled=true);
buttons.forEach(b=>{
const idx=parseInt(b.getAttribute('data-index'));
if(idx===q.answer) b.classList.add('selected','correct');
});

document.getElementById('skipBtn').disabled = true;
document.getElementById('nextBtn').disabled = true;

setTimeout(()=>{ nextQuestion(); }, 500);
}

function nextQuestion() {
if (currentIndex === quiz.length - 1) {
// Last question → finish quiz
clearInterval(timer);  // stop countdown
showResult();    // show results page
} else {
// Not last question → go to next
currentIndex++;
let percent = Math.round((currentIndex / quiz.length) * 100);
document.getElementById('progressFill').style.width = percent + '%';
showQuestion();
}
}

function updateStats() {
document.getElementById('correctCount').textContent = stats.correct;
document.getElementById('wrongCount').textContent = stats.wrong;
document.getElementById('skippedCount').textContent = stats.skipped;
updateAttempted();
}

function updateAttempted() {
const attempted = stats.correct + stats.wrong;
document.getElementById('attemptedCount').textContent = attempted;
}

// ==================== Show Result ====================
function showResult() {
clearInterval(timer);

const name = userInfo?.name || "Participant";
const company = userInfo?.company || "Organization";
const total = quiz.length || 0;
const correct = stats.correct || 0;
const wrong = stats.wrong || 0;
const skipped = stats.skipped || 0;
const attempted = correct + wrong;
const score = total > 0 ? Math.round((correct / total) * 100) : 0;

let grade, feedback;
if (score === 100) {
grade = "Marvelous - 🏆o(*^ω^*)o🏆";
feedback = "YOU ARE A RCM LORD!";
} else if (score >= 90) {
grade = "Excellent 🥇💥🎇 ➖ 🏆o(*^ω^*)o🏆";
feedback = "You're a top performer in RCM logic!";
} else if (score >= 75) {
grade = "🥈 Good (*￣▽￣*)ブ";
feedback = "Solid grasp – Keep sharpening your skills!";
} else if (score >= 50) {
grade = "🥉 Average(*^_^*)";
feedback = "You're getting there – review and retry.";
} else {
grade = "Failed o(一︿一)o";
feedback = "Study & Focus Harder ┻━┻ ︵ヽ(`Д´)ﾉ︵ ┻━┻";
}

const skipNote = getSkipNote(skipped);

document.getElementById('resultText').innerHTML = `
<div style="font-family:'Inter','Segoe UI',sans-serif; background:#121212; border:1px solid #2a2a2a; border-radius:16px; padding:10px; max-width:700px; margin:6vh auto; box-shadow:0 0 20px rgba(0,255,255,0.1); line-height:1.7; font-size:16px; color:#e4e4e4;">
<h2 style="color:#9efeff; font-size:1.8rem; margin-bottom:16px; text-align:center;">🎓 Revenue Cycle Management Quiz Results</h2>
<p style="text-align:center;">Thank you for participating, <strong style="color:#00ffcc;">${name}</strong> from <strong style="color:#ffcc00;">${company}</strong>.</p>
<p style="text-align:center;">
You've scored <strong style="color:#00ff99;">${correct}/${total}</strong> 
(<span style="color:#9efeff;">${score}%</span>) 
on <strong style="color:#ffd700;">${userInfo.difficulty}</strong> difficulty.
</p>
<p style="text-align:center;">Rank: <strong style="color:#ff5722;">${grade}</strong></p>
<p style="font-style:italic; text-align:center; color:#ccc;">${feedback}</p>
<hr style="border:0; border-top:1px solid #444; margin:24px 0;">
<div style="display:flex; justify-content:space-around; font-size:15px; color:#bbb;">
  <div><strong>📊 Attempted:</strong> ${attempted}</div>
  <div><strong>✅ Correct:</strong> ${correct}</div>
  <div><strong>❌ Wrong:</strong> ${wrong}</div>
  <div><strong>⏭️ Skipped:</strong> ${skipped}</div>
</div>
<div style="margin-top:20px; text-align:center; font-size:14px; color:#aaa;">${skipNote}</div>
</div>
`;


// Hide quiz, show result section
document.getElementById("quizSection").classList.add("hidden");
document.getElementById("resultSection").classList.remove("hidden");
}

// ==================== Skip Note Generator ====================
function getSkipNote(skipped) {
if (skipped === 0) return "";

const messages = [
`Skipped ${skipped} question${skipped > 1 ? 's' : ''}? Were they shy, or did you ghost them like unread emails? 👻`,
`Oops! You skipped ${skipped} question${skipped > 1 ? 's' : ''}. Maybe they were too tricky? 🤔`,
`Notice: ${skipped} question${skipped > 1 ? 's' : ''} left behind. Courage is for next time! 💪`,
`${skipped} question${skipped > 1 ? 's' : ''} skipped – the quiz will forgive you… barely! 😅`,
`Skipped ${skipped}? It's okay, even heroes need a break. 🦸‍♂️`,
`Hmm… ${skipped} question${skipped > 1 ? 's' : ''} skipped. Stealth mode activated? 🕵️‍♀️`,
`You left ${skipped} question${skipped > 1 ? 's' : ''} behind. Fear not, adventure awaits! 🏹`,
`Skipped ${skipped}? Don’t worry, every genius has a few blanks. 🧠`,
`Alert! ${skipped} question${skipped > 1 ? 's' : ''} skipped. Did your brain take a coffee break? ☕`,
`Skipped ${skipped} question${skipped > 1 ? 's' : ''}. That’s one way to keep suspense alive! 🎭`,
`Whoa! ${skipped} skipped – sometimes strategy is key. ♟️`,
`Skipped ${skipped}? Looks like procrastination strikes even in quizzes! 🐢`,
`You bravely skipped ${skipped} question${skipped > 1 ? 's' : ''}. Bold move! ⚡`,
`Oopsie! ${skipped} question${skipped > 1 ? 's' : ''} skipped. Don’t worry, your secrets are safe! 🤫`,
`Skipped ${skipped} question${skipped > 1 ? 's' : ''} – are you training for speed reading next? 📖`,
`Skipped ${skipped} question${skipped > 1 ? 's' : ''}... just like your hopes and dreams. (●'◡'●)`,
`You ghosted ${skipped} question${skipped > 1 ? 's' : ''}. Don’t worry, they’ll haunt you tonight. 👻`,
`${skipped} skipped… kind of like how your brain skipped development in some areas. 🧟`,
`Skipped ${skipped}? Bold choice. Denial is the first stage of failure. ⚰️`,
`${skipped} question${skipped > 1 ? 's' : ''} skipped — the Quiz Lords are disappointed, and they demand an Exercise.🧹`,
];

const randomMessage = messages[Math.floor(Math.random() * messages.length)];
return `<p style="margin-top:15px; color:#ff66cc;">${randomMessage}</p>`;
}

function retakeQuiz() {
startQuiz();
}

function resetQuiz() {
clearInterval(timer);
document.getElementById('startSection').classList.remove('hidden');
document.getElementById('quizSection').classList.add('hidden');
document.getElementById('resultSection').classList.add('hidden');
document.getElementById('progressFill').style.width='0%';
document.getElementById('correctCount').textContent='0';
document.getElementById('wrongCount').textContent='0';
document.getElementById('skippedCount').textContent='0';
document.getElementById('attemptedCount').textContent='0';
}

// Disable right-click context menu
document.addEventListener('contextmenu', function(e) {
e.preventDefault();
alert("Right-click is disabled on this page.");
});

// Disable text selection
document.addEventListener('selectstart', function(e) {
e.preventDefault();
});

// Disable Ctrl+C / Ctrl+S / Ctrl+U / F12
document.addEventListener('keydown', function(e) {
if ((e.ctrlKey && (e.keyCode === 67 || e.keyCode === 83 || e.keyCode === 85)) || e.key === "F12") {
e.preventDefault();
alert("This action is disabled.");
}
});

const endButton = document.createElement('button');
endButton.id = "endQuizBtn"; // 👈 Added for targeting
endButton.textContent = "End Quiz & View Result";
endButton.onclick = function() {
if (currentIndex < quiz.length) {
stats.skipped += (quiz.length - currentIndex);
}
document.getElementById('attemptedCount').textContent = stats.correct + stats.wrong + stats.skipped;
showResult();
};
endButton.style.cssText = `
margin-left: 10px;
padding: 8px 16px;
background-color: #007bff;
color: white;
border: none;
border-radius: 4px;
font-size: 14px;
cursor: pointer;
`;
document.getElementById('quizSection').appendChild(endButton);
