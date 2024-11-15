const scoreDisplay = document.getElementById("score");
const startButton = document.getElementById("startGame");
const restartButton = document.getElementById("restartGame");
const gameOverMessage = document.getElementById("gameOverMessage");
const audio = document.getElementById("gameMusic");
const player = document.getElementById("player");
let score = 0;
let gameRunning = false;

const initialBeatInterval = 3000; // Initial beat interval (in ms)
const beatSpeed = 2;
const bulletSpeed = 5;
const targetPosition = 420;
let playerPosition = 125;
const playerMoveSpeed = 30;
let beatInterval = initialBeatInterval;
let beatIntervalId = null;

let beatSpawnCount = 1;
let lastBeatSpawnTime = 0; // Track last time beats were spawned
let gameStartTime = 0; // Track when the game started

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);

function startGame() {
    startButton.style.display = "none";
    gameOverMessage.classList.add("hidden");
    score = 0;
    updateScore();
    audio.play();
    gameRunning = true;
    gameStartTime = audio.currentTime; // Track game start time
    beatIntervalId = setInterval(syncBeatsWithMusic, 100); // Sync beats with music
}

function restartGame() {
    gameOverMessage.classList.add("hidden");
    startGame();
}

function gameOver() {
    gameRunning = false;
    audio.pause();
    audio.currentTime = 0;
    clearInterval(beatIntervalId);
    gameOverMessage.classList.remove("hidden");
}

function createBeat() {
    const beat = document.createElement("div");
    beat.classList.add("beat");
    beat.style.left = `${Math.random() * 260 + 20}px`;
    document.querySelector(".game-container").appendChild(beat);

    let position = 0;
    const interval = setInterval(() => {
        if (!gameRunning) {
            clearInterval(interval);
            beat.remove();
            return;
        }

        position += beatSpeed;
        beat.style.top = `${position}px`;

        if (position > targetPosition + 30) {
            beat.remove();
            clearInterval(interval);
            gameOver();
        }
    }, 20);

    beat.dataset.intervalId = interval;
}

function syncBeatsWithMusic() {
    const currentTime = audio.currentTime * 1000; // Convert to milliseconds

    // Only spawn beats if enough time has passed since the last spawn
    if (gameRunning && currentTime - lastBeatSpawnTime >= beatInterval) {
        for (let i = 0; i < beatSpawnCount; i++) {
            createBeat();
        }
        lastBeatSpawnTime = currentTime; // Update the last spawn time
    }

    // Adjust difficulty based on score and playtime
    const playTime = audio.currentTime; // Game's current playtime in seconds
    if (playTime > 30) {
        // After 30 seconds, begin to scale difficulty
        if (score > 0 && score % 150 === 0) {
            beatSpawnCount = Math.min(beatSpawnCount + 1, 3); // Increase number of beats, capped at 3
            beatInterval = Math.max(beatInterval - 50, 2200); // Increase spawn frequency, but slowly
        }

        // Gradually reduce the beatInterval for a smoother difficulty curve
        if (score > 0 && score % 300 === 0) {
            beatInterval = Math.max(beatInterval - 40, 2000); // Keep reducing, but very slowly
        }
    }
}

setInterval(() => {
    // Scale the game's difficulty over time, but at a slower rate
    if (gameRunning && beatInterval > 2000) {
        beatInterval -= 10; // Gradually decrease beat interval to increase difficulty, very slowly
    }
}, 30000); // Slow down the frequency of difficulty adjustments

function shootBullet() {
    const bullet = document.createElement("div");
    bullet.classList.add("bullet");
    bullet.style.left = `${playerPosition + 12.5}px`;
    bullet.style.bottom = "50px";
    document.querySelector(".game-container").appendChild(bullet);

    let position = 0;
    const interval = setInterval(() => {
        if (!gameRunning) {
            clearInterval(interval);
            bullet.remove();
            return;
        }

        position += bulletSpeed;
        bullet.style.bottom = `${50 + position}px`;

        if (position > 500) {
            bullet.remove();
            clearInterval(interval);
        }

        document.querySelectorAll(".beat").forEach((beat) => {
            const beatRect = beat.getBoundingClientRect();
            const bulletRect = bullet.getBoundingClientRect();

            const overlapX = bulletRect.left < beatRect.right && bulletRect.right > beatRect.left;
            const overlapY = bulletRect.top < beatRect.bottom && bulletRect.bottom > beatRect.top;

            if (overlapX && overlapY) {
                score += 10;
                updateScore();
                beat.classList.add("hit");
                clearInterval(beat.dataset.intervalId);
                beat.remove();
                bullet.remove();
                clearInterval(interval);
                document.querySelector(".game-container").removeChild(bullet);
            }
        });
    }, 20);
}

function updateScore() {
    scoreDisplay.innerHTML = `Score: ${score}`;
}

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" && playerPosition > 0) {
        playerPosition -= playerMoveSpeed;
        player.style.left = `${playerPosition}px`;
    } else if (event.key === "ArrowRight" && playerPosition < 270) {
        playerPosition += playerMoveSpeed;
        player.style.left = `${playerPosition}px`;
    }

    if (event.key === " ") {
        shootBullet();
    }
});