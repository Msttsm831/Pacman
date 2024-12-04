const grid = document.querySelector('.grid');

const deathSound = new Audio('./Sounds/Deathsound.wav');
const winSound = new Audio('./Sounds/Win.wav');
const backgroundMusic = new Audio('./Sounds/Gamesound.wav');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;
let musicStarted = false;

// Game music
function startBackgroundMusic() {
  if (!musicStarted) {
    backgroundMusic.play().catch((error) => console.error('Music playback failed:', error));
    musicStarted = true;
  }
}

// Maze Layout
const mazeLayout = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1,
  1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1,
  1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1,
  1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1,
  1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1,
  1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
];

const specialDotPositions = [69, 57, 161, 198];
let gameRunning = true;

function createMaze() {
  grid.innerHTML = '';
  mazeLayout.forEach((cell, index) => {
    const div = document.createElement('div');
    div.style.width = '25px';
    div.style.height = '25px';

    if (cell === 1) {
      div.classList.add('wall');
    } else {
      div.classList.add('path');

      if (specialDotPositions.includes(index)) {
        const specialDot = document.createElement('div');
        specialDot.classList.add('special-dot');
        specialDot.dataset.index = index;
        div.appendChild(specialDot);
      } else {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.dataset.index = index;
        div.appendChild(dot);
      }
    }

    grid.appendChild(div);
  });
}

createMaze();

const pacman = document.createElement('div');
pacman.id = 'pacman';
grid.appendChild(pacman);

let pacmanX = 1;
let pacmanY = 1;
const gridSize = 25;
let direction = null;
let isMouthOpen = true;
let lives = 3;
let score = 0;

function updatePacmanPosition() {
  pacman.style.left = `${pacmanX * gridSize}px`;
  pacman.style.top = `${pacmanY * gridSize}px`;
}

function togglePacmanMouth() {
  pacman.style.backgroundImage = isMouthOpen
    ? 'url("https://i.ibb.co/dPGV0y9/images-removebg-preview.png")'
    : 'url("https://i.ibb.co/NWs7K08/Original-Pac-Man.png")';
  isMouthOpen = !isMouthOpen;
}

function updateScore() {
  const scoreDisplay = document.querySelector('.score');
  if (scoreDisplay) {
    scoreDisplay.textContent = `Score: ${score}`;
  }
}

function updateLivesDisplay() {
  const livesDisplay = document.querySelector('.lives');
  if (livesDisplay) {
    livesDisplay.textContent = `Lives: ${lives}`;
  }
}

function resetPacmanAfterCollision() {
  if (!gameRunning) return;

  gameRunning = false;

  backgroundMusic.pause();
  deathSound.play().catch((error) => console.error('Failed to play death sound:', error));
  
  pacman.style.visibility = 'hidden';

  setTimeout(() => {
    pacmanX = 1;
    pacmanY = 1;
    updatePacmanPosition();
    pacman.style.visibility = 'visible';

    backgroundMusic.play().catch((error) => console.error('Failed to resume background music:', error));

    gameRunning = true;
  }, 3000);
}

function checkGameOver() {
  if (lives <= 0) {
    gameRunning = false;

    const title = document.querySelector('.title');
    title.textContent = 'GAME OVER';
    title.classList.add('game-over');

    backgroundMusic.pause();
    deathSound.play().catch((error) => console.error('Failed to play death sound:', error));
    
    pacman.style.visibility = 'hidden';
  }
}

function checkWinCondition() {
  if (score >= 1470) {
    gameRunning = false;

    const title = document.querySelector('.title');
    title.textContent = 'YOU WIN!';
    title.classList.add('game-over');

    backgroundMusic.pause();

    winSound.play().catch((error) => console.error('Failed to play win sound:', error));

    pacman.style.visibility = 'hidden';
    ghosts.forEach((ghost) => {
      const ghostEl = document.getElementById(ghost.id);
      ghostEl.style.visibility = 'hidden';
    });
  }
}

// Collision
function checkCollisionWithGhosts() {
  const pacmanRect = pacman.getBoundingClientRect();

  for (const ghost of ghosts) {
    const ghostEl = document.getElementById(ghost.id);
    const ghostRect = ghostEl.getBoundingClientRect();

    const isColliding =
      pacmanRect.left < ghostRect.right &&
      pacmanRect.right > ghostRect.left &&
      pacmanRect.top < ghostRect.bottom &&
      pacmanRect.bottom > ghostRect.top;

    if (isColliding) {
      lives -= 1;
      updateLivesDisplay();
      checkGameOver();
      if (lives > 0) resetPacmanAfterCollision();
      break;
    }
  }
}

function movePacman() {
  if (!gameRunning) return;

  let newX = pacmanX;
  let newY = pacmanY;

  if (direction === 'right') newX += 1;
  if (direction === 'left') newX -= 1;
  if (direction === 'down') newY += 1;
  if (direction === 'up') newY -= 1;

  if (!checkCollision(newX, newY)) {
    pacmanX = newX;
    pacmanY = newY;
    updatePacmanPosition();

    const index = pacmanY * 20 + pacmanX;
    const dot = document.querySelector(`.dot[data-index='${index}']`);
    if (dot) {
      dot.remove();
      score += 10;
      updateScore();
      checkWinCondition();
    }

    const specialDot = document.querySelector(`.special-dot[data-index='${index}']`);
    if (specialDot) {
      specialDot.remove();
      score += 50;
      updateScore();
      checkWinCondition();
    }
  }

  checkCollisionWithGhosts();
}

function checkCollision(x, y) {
  if (x < 0 || y < 0 || x >= 20 || y >= 13) return true;
  const index = y * 20 + x;
  return mazeLayout[index] === 1;
}

// Ghosts
const ghosts = [
  { id: 'redGhost', x: 1, y: 11, image: 'https://i.ibb.co/dB1dLxn/2469740-blinky.png' },
  { id: 'pinkGhost', x: 18, y: 11, image: 'https://i.ibb.co/DtB1y3y/2469744-pinky.png' },
  { id: 'cyanGhost', x: 18, y: 1, image: 'https://i.ibb.co/1L8r8WR/Inky8bit.webp' },
];

ghosts.forEach((ghost) => {
  const ghostEl = document.createElement('div');
  ghostEl.id = ghost.id;
  ghostEl.style.width = '25px';
  ghostEl.style.height = '25px';
  ghostEl.style.position = 'absolute';
  ghostEl.style.backgroundImage = `url(${ghost.image})`;
  ghostEl.style.backgroundSize = 'cover';
  ghostEl.style.left = `${ghost.x * gridSize}px`;
  ghostEl.style.top = `${ghost.y * gridSize}px`;
  grid.appendChild(ghostEl);

  setInterval(() => {
    if (!gameRunning) return;

    const moveOptions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ];
    const move = moveOptions[Math.floor(Math.random() * moveOptions.length)];
    const newGhostX = ghost.x + move.dx;
    const newGhostY = ghost.y + move.dy;

    if (!checkCollision(newGhostX, newGhostY)) {
      ghost.x = newGhostX;
      ghost.y = newGhostY;
      ghostEl.style.left = `${ghost.x * gridSize}px`;
      ghostEl.style.top = `${ghost.y * gridSize}px`;
    }

    checkCollisionWithGhosts();
  }, 300);
});

document.getElementById('restart-button').addEventListener('click', () => {
  window.location.reload();
});

// Mute Button
const muteButton = document.getElementById('mute');
let isMuted = false;

function toggleMute() {
  isMuted = !isMuted;
  backgroundMusic.muted = isMuted;
  deathSound.muted = isMuted;
  winSound.muted = isMuted;

  muteButton.textContent = isMuted ? 'Unmute' : 'Mute';
}

muteButton.addEventListener('click', toggleMute);

document.addEventListener('keydown', (e) => {
    startBackgroundMusic();
    if (e.key === 'ArrowRight') {
      direction = 'right';
      pacman.style.transform = 'rotate(180deg)';
    }
    if (e.key === 'ArrowLeft') {
      direction = 'left';
      pacman.style.transform = 'rotate(0deg)';
    }
    if (e.key === 'ArrowUp') {
      direction = 'up';
      pacman.style.transform = 'rotate(90deg)';
    }
    if (e.key === 'ArrowDown') {
      direction = 'down';
      pacman.style.transform = 'rotate(-90deg)';
    }
  });

// Key Controls
document.addEventListener('keydown', (e) => {
  startBackgroundMusic();
  if (e.key === 'ArrowRight') direction = 'right';
  if (e.key === 'ArrowLeft') direction = 'left';
  if (e.key === 'ArrowUp') direction = 'up';
  if (e.key === 'ArrowDown') direction = 'down';
});

updatePacmanPosition();
updateLivesDisplay();

setInterval(() => {
  if (direction) movePacman();
}, 250);

setInterval(togglePacmanMouth, 120);

// Instructions Overlay
const instructionsOverlay = document.createElement('div');
instructionsOverlay.id = 'instructions-overlay';
instructionsOverlay.innerHTML = `
  <div id="instructions-content">
    <p><strong>Game Instructions:</strong></p>
    <ul>
      <li>Use Arrow Keys to move Pac-Man.</li>
      <li>Collect all dots to win the game.</li>
      <li>Avoid the ghosts—colliding with them reduces lives.</li>
      <li>Special dots give extra points.</li>
      <li>You have 3 lives.</li>
      <li>Game over when all lives are lost.</li>
    </ul>
    <button id="close-instructions">Close</button>
  </div>
`;
document.body.appendChild(instructionsOverlay);

const instructionsButton = document.getElementById('instructions-button');
const closeInstructionsButton = document.getElementById('close-instructions');

instructionsButton.addEventListener('click', () => {
  instructionsOverlay.style.display = 'flex';
});

closeInstructionsButton.addEventListener('click', () => {
  instructionsOverlay.style.display = 'none';
});
