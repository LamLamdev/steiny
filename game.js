// game.js
window.addEventListener("DOMContentLoaded", () => {
  const game        = document.querySelector(".game-window");
  const holes       = Array.from(document.querySelectorAll(".hole"));
  const startScreen = document.getElementById("start-screen");
  const startBtn    = document.getElementById("start-btn");
  const overScreen  = document.getElementById("game-over-screen");
  const playBtn     = document.getElementById("play-again-btn");
  const finalScore  = document.getElementById("final-score");
  const scoreEl     = document.getElementById("score");
  const heartsEl    = document.getElementById("hearts");
  const timerEl     = document.getElementById("timer");

  // — BACKGROUND AUDIO SETUP —
  // Assumes your HTML contains:
  // <audio id="bg-audio" src="your-song.mp3" loop></audio>
  // <button id="audio-toggle">🔊</button>
  const audio  = document.getElementById("bg-audio");
  const toggle = document.getElementById("audio-toggle");
  audio.volume = 0.5;
  audio.muted  = false;

  // Play once upon first user interaction
  document.addEventListener("click", () => {
    audio.play().catch(() => {
      // if browser blocks, user can unmute via toggle
    });
  }, { once: true });

  // Toggle mute/unmute
  toggle.addEventListener("click", () => {
    audio.muted = !audio.muted;
    toggle.textContent = audio.muted ? "🔇" : "🔊";
  });

  let timeLeft      = 60;       // seconds
  let timerInterval;
  let score         = 0;
  let lives         = 3;
  let activeHole    = null;
  let activeIsFlag  = false;
  let spawnInterval, hideTimeout;

  function updateTimerDisplay() {
    const m = Math.floor(timeLeft/60);
    const s = timeLeft % 60;
    timerEl.textContent =
      String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");
  }

  function startTimer() {
    timeLeft = 60;
    updateTimerDisplay();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }, 1000);
  }

  // Stein / Flag sprite
  const stein = document.createElement("img");
  stein.id = "stein";
  Object.assign(stein.style, {
    position: "absolute", width: "70px",
    transform: "translate(-50%, -100%)",
    zIndex: 2, display: "none", pointerEvents: "none"
  });
  game.appendChild(stein);

  // Hammer sprite
  const hammer = document.createElement("img");
  hammer.src = "hammer.png";
  hammer.id = "hammer";
  Object.assign(hammer.style, {
    position: "absolute", width: "55px",
    transform: "translate(-50%, -50%)",
    zIndex: 6, display: "none", pointerEvents: "none"
  });
  game.appendChild(hammer);

  // Helpers
  function updateScore() {
    scoreEl.textContent = `Score: ${score}`;
  }
  function updateHearts() {
    heartsEl.textContent = "❤️ ".repeat(lives);
  }

  // Pop up either a mole or flag
  function popUp() {
    if (activeHole) hideStein();

    activeHole   = holes[Math.floor(Math.random() * holes.length)];
    activeIsFlag = Math.random() < 0.24;

    stein.src = activeIsFlag ? "flag.webp" : "hit2.png";

    const { left, top, width, height } = activeHole.getBoundingClientRect();
    const gRect = game.getBoundingClientRect();
    const x = left - gRect.left + width/2;
    const y = top  - gRect.top  + height/2;

    // adjust size if desired
    if (stein.src.endsWith("hit2.png")) {
      stein.style.width = "60px";
    } else {
      stein.style.width = "70px";
    }

    stein.style.left    = `${x}px`;
    stein.style.top     = `255px`;
    stein.style.display = "block";

    hideTimeout = setTimeout(hideStein, 800);
  }

  function hideStein() {
    stein.style.display = "none";
    activeHole    = null;
    activeIsFlag  = false;
    clearTimeout(hideTimeout);
  }

  // End the game
  function gameOver() {
    clearInterval(spawnInterval);
    clearInterval(timerInterval);
    finalScore.textContent = score;
    overScreen.classList.remove("hidden");
  }

  // Start (or restart) the game
  function startGame() {
    score = 0;
    lives = 3;
    updateScore();
    updateHearts();
    startScreen.classList.add("hidden");
    overScreen.classList.add("hidden");

    startTimer();

    spawnInterval = setInterval(popUp, 1000);
    popUp();
  }

  // Hammer follow & click logic
  game.addEventListener("mousemove", e => {
    const r = game.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (x < 0 || y < 0 || x > r.width || y > r.height) {
      hammer.style.display = "none";
      return;
    }
    hammer.style.left    = `${x}px`;
    hammer.style.top     = `${y}px`;
    hammer.style.display = "block";
  });

  game.addEventListener("click", e => {
    const r = game.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    // switch to the "hit" hammer
    hammer.src = "ha.png";
    hammer.style.left    = `${x}px`;
    hammer.style.top     = `${255}px`;
    hammer.style.display = "block";
    setTimeout(() => {
      hammer.src = "hammer.png";
      hammer.style.display = "none";
    }, 200);

    if (!activeHole) return;

    const sr = stein.getBoundingClientRect();
    const sX = sr.left - r.left + sr.width/2;
    const sY = sr.top  - r.top  + sr.height/2;

    if (Math.hypot(x - sX, y - sY) < 60) {
      clearTimeout(hideTimeout);

      if (activeIsFlag) {
        // flag hit
        lives--;
        updateHearts();

        stein.src = "lam.png";
        setTimeout(hideStein, 300);

        if (lives <= 0) return gameOver();
      } else {
        // mole hit
        stein.src = "hit.png";
        score++;
        updateScore();
        setTimeout(hideStein, 300);
      }
    }
  });

  // Bind buttons
  startBtn.addEventListener("click", startGame);
  playBtn.addEventListener("click", startGame);

  // Initial draw of hearts
  updateHearts();
});

// contract‐button copy logic unchanged…

// background audio toggle listener sits in the DOMContentLoaded above
