let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight,
};

let pipeArrays = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

let velocityX = -2;
let velocityY = 0;
let gravity = 0.2;
let jumpStrength = -5;

let gameOver = false;
let score = 0;

let gameStarted = false;
let difficulty = "medium";

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "../images/flappybird.png";

    topPipeImg = new Image();
    topPipeImg.src = "../images/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "../images/bottompipe.png";

    audioPonto = [
        new Audio("../audios/sfx_point.m4a"),
        new Audio("../audios/sfx_point.m4a"),
        new Audio("../audios/sfx_point.m4a"),
        new Audio("../audios/sfx_point.m4a"),
        new Audio("../audios/sfx_point.m4a")
    ]

    audioPontoEmAndamento = 0

    audioPonto.forEach (a => (a.volume = 0.05))

    // Exibe a tela inicial de seleção de dificuldade
    showStartScreen();
};

function showStartScreen() {
    context.clearRect(0, 0, boardWidth, boardHeight);

    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.fillRect(0, 0, boardWidth, boardHeight); // Fundo escuro para a tela de início

    context.fillStyle = "White";
    context.font = "40px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("Flappy Bird", boardWidth / 2, boardHeight / 4); // Nome do jogo

    context.font = "30px Arial";
    context.fillText("Escolha a Dificuldade", boardWidth / 2, boardHeight / 3); // Instrução

    // Botões de Dificuldade
    context.font = "25px Arial";
    context.fillText("Fácil", boardWidth / 2, boardHeight / 2.5);
    context.fillText("Médio", boardWidth / 2, boardHeight / 1.9);
    context.fillText("Difícil", boardWidth / 2, boardHeight / 1.5);

    // Botão de "Sobre o Jogo"
    context.font = "20px Arial";
    context.fillText("Sobre o Jogo", boardWidth / 2, boardHeight / 1.2);

    // Adiciona o evento de clique para escolher a dificuldade ou abrir o texto explicativo
    board.addEventListener("click", handleStartScreenClick);
}

function handleStartScreenClick(event) {
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    // Verifica o clique na opção de dificuldade
    if (mouseY > boardHeight / 2.6 && mouseY < boardHeight / 2.4) {
        difficulty = "easy";
    } else if (mouseY > boardHeight / 2 && mouseY < boardHeight / 1.8) {
        difficulty = "medium";
    } else if (mouseY > boardHeight / 1.6 && mouseY < boardHeight / 1.3) {
        difficulty = "hard";
    } else if (mouseY > boardHeight / 1.25 && mouseY < boardHeight / 1.15) {
        showAboutGame();
        return;
    } else {
        return;
    }

    // Ajusta a dificuldade e inicia o jogo
    setDifficulty();
    board.removeEventListener("click", handleStartScreenClick);
    startGame();
}

function showAboutGame() {
    context.clearRect(0, 0, boardWidth, boardHeight);

    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.fillRect(0, 0, boardWidth, boardHeight); // Fundo escuro para o texto explicativo

    context.fillStyle = "White";
    context.font = "25px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("Como Jogar", boardWidth / 2, boardHeight / 4);

    context.font = "20px Arial";
    context.fillText(
        "Pressione Espaço para voar.", 
        boardWidth / 2, 
        boardHeight / 2.8
    );
    context.fillText(
        "Desvie dos canos e acumule pontos!", 
        boardWidth / 2, 
        boardHeight / 2.4
    );

    context.fillText(
        "Clique para voltar ao menu.",
        boardWidth / 2,
        boardHeight / 1.5
    );

    board.addEventListener("click", returnToStartScreen);
}

function returnToStartScreen() {
    board.removeEventListener("click", returnToStartScreen);
    showStartScreen();
}

function setDifficulty() {
    if (difficulty === "easy") {
        velocityX = -1; // Velocidade mais lenta para a dificuldade fácil
    } else if (difficulty === "medium") {
        velocityX = -3; // Velocidade média para a dificuldade média
    } else if (difficulty === "hard") {
        velocityX = -5; // Velocidade mais rápida para a dificuldade difícil
    }
}

function startGame() {
    gameStarted = true;
    gameOver = false;
    score = 0;
    bird.y = boardHeight / 2; // Posiciona o pássaro no meio da tela
    velocityY = 0; // Reseta a velocidade do pássaro
    pipeArrays = []; // Limpa os canos
    document.addEventListener("keydown", moveBird);

    // Inicia a criação contínua de pipes
    setInterval(placePipes, 1500); // Gera os pipes a cada 1.5 segundos

    // Inicia o loop de atualização do jogo
    setTimeout(() => {
        requestAnimationFrame(update);
    }, 100);
}


function update() {
    requestAnimationFrame(update);

    context.clearRect(0, 0, boardWidth, boardHeight);

    if (gameOver) {
        showGameOverScreen();
        return;
    }

    if (gameStarted) {
        velocityY += gravity;
        bird.y += velocityY;

        if (bird.y < 0) {
            bird.y = 0;
            velocityY = 0;
        } else if (bird.y + bird.height > boardHeight) {
            bird.y = boardHeight - bird.height;
            velocityY = 0;
        }

        for (let i = 0; i < pipeArrays.length; i++) {
            let pipe = pipeArrays[i];
            pipe.x += velocityX;
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

            if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                playAudioPonto()
                score += 5;
                pipe.passed = true;
            }

            if (detectCollision(bird, pipe)) {
                gameOver = true;
                break;
            }

            if (pipe.x + pipe.width < 0) {
                pipeArrays.splice(i, 1);
                i--;
            }
        }

        context.fillStyle = "White";
        context.font = "45px Arial";
        context.fillText(score, 40, 45);
    }

    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

function placePipes() {
    if (gameOver) {
        return;
    }
    if (!gameStarted) return;

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false,
    };

    pipeArrays.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false,
    };

    pipeArrays.push(bottomPipe);
}

function moveBird(e) {
    if (e.code === "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        if (gameStarted) {
            velocityY = jumpStrength;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function showGameOverScreen() {
    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.fillRect(0, 0, boardWidth, boardHeight); // Fundo escuro para a tela de Game Over

    context.fillStyle = "White";
    context.font = "50px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("Game Over!", boardWidth / 2, boardHeight / 3); // Mensagem de Game Over

    context.font = "30px Arial";
    context.fillText("Score: " + score, boardWidth / 2, boardHeight / 2); // Pontuação final

    context.font = "25 Arial"
    context.fillText("Pressione f5 para reiniciar", boardWidth / 2, boardHeight / 1.5); // Pontuação final
}

function playAudioPonto() {
    audioPonto[audioPontoEmAndamento].currentTime = 0
    audioPonto[audioPontoEmAndamento].play()
    audioPontoEmAndamento = (audioPontoEmAndamento + 1) % 5
}