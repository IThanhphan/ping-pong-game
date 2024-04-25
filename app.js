const canvas = document.querySelector('#game-play-area');
const ctx = canvas.getContext('2d');
const play_btn = document.querySelector('.start-game');
const player1_score = document.querySelector('.player1-score');
const player2_score = document.querySelector('.player2-score');
const player1_result = document.querySelector('.result-player1');
const player2_result = document.querySelector('.result-player2');
const BOARD_SIZE_WIDTH = 1600;
const BOARD_SIZE_HEIGHT = 700;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 200;
const PLAYER1_LOCATION_START = {
    x: 100,
    y: 250
}
const PLAYER2_LOCATION_START = {
    x: BOARD_SIZE_WIDTH-PLAYER_WIDTH-PLAYER1_LOCATION_START.x,
    y: 250
}
const BALL_LOCATION_START = {
    x: BOARD_SIZE_WIDTH/2,
    y: BOARD_SIZE_HEIGHT/2
}
const BALL_RADIUS = 30;
const PLAYER_COLOR = [
    'red',
    'blue'
]
const BALL_COLOR = 'yellow';

let playing = 0;
let speed = 15;
let ballSpeed = 50;
let dx = 15;
let dy = 15;
let maxScore = 3;
let intervalBall;
let moveUpInterval1;
let moveDownInterval1;
let moveUpInterval2;
let moveDownInterval2;
let timerInterval;

class Board {
    constructor(ctx) {
        this.ctx = ctx;
        this.ctx.canvas.width = BOARD_SIZE_WIDTH;
        this.ctx.canvas.height = BOARD_SIZE_HEIGHT;
    }

    reset() {
        clearInterval(intervalBall);
        clearInterval(moveUpInterval1);
        clearInterval(moveDownInterval1);
        clearInterval(moveUpInterval2);
        clearInterval(moveDownInterval2);
        clearInterval(timerInterval);
        this.clearPlayer(player1.location.x, player1.location.y, player1.width, player1.height);
        this.clearPlayer(player2.location.x, player2.location.y, player2.width, player2.height);
        player1.location.x = PLAYER1_LOCATION_START.x;
        player1.location.y = PLAYER1_LOCATION_START.y;
        player2.location.x = PLAYER2_LOCATION_START.x;
        player2.location.y = PLAYER2_LOCATION_START.y;
        ball.location.x = BALL_LOCATION_START.x;
        ball.location.y = BALL_LOCATION_START.y;
        ball.speed = ballSpeed;
        board.drawBoundary();
        player1.generate();
        player2.generate();
        ball.generateBall();
    }

    generatePlayer(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    drawBoundary() {
        this.ctx.setLineDash([50, 25]);
        this.ctx.beginPath();
        this.ctx.moveTo(BOARD_SIZE_WIDTH/2, 0); 
        this.ctx.lineTo(BOARD_SIZE_WIDTH/2, 700);
        this.ctx.lineWidth = 5;
        this.ctx.stroke();
    }

    clearPlayer(x, y, width, height) {
        this.ctx.clearRect(x, y, width, height);
    }
}

class Player {
    constructor(ctx, width, height, color, location_x, location_y) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.color = color;
        this.location = {
            x: location_x,
            y: location_y
        }
        this.score = 0;
    }

    generate() {
        board.generatePlayer(this.location.x, this.location.y, this.width, this.height, this.color);
    }

    moveUp() {
        if (!this.collisionTop()) {
            board.clearPlayer(this.location.x, this.location.y, this.width, this.height);
            this.location.y -= speed;
            board.generatePlayer(this.location.x, this.location.y, this.width, this.height, this.color);
        }
    }
    moveDown() {
        if (!this.collisionBottom()) {
            board.clearPlayer(this.location.x, this.location.y, this.width, this.height);
            this.location.y += speed;
            board.generatePlayer(this.location.x, this.location.y, this.width, this.height, this.color); 
        }
    }

    collisionTop() {
        if (this.location.y <= 0) {
            return true;
        }
        return false;
    }

    collisionBottom() {
        if (this.location.y+PLAYER_HEIGHT >= BOARD_SIZE_HEIGHT) {
            return true;
        }
        return false;     
    }
}

class Ball {
    constructor(ctx, radius, color, location_x, location_y, speed) {
        this.ctx = ctx;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.location = {
            x: location_x,
            y: location_y
        }
    }

    generateBall() {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.location.x, this.location.y, this.radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    collisionPlayer1() {
        if (this.location.x+dx <= player1.location.x+player1.width && 
            this.location.x+dx >= player1.location.x &&
            this.location.y >= player1.location.y && 
            this.location.y <= player1.location.y+player1.height) {
                return true;
        }
        if (this.location.y+dy >= player1.location.y &&
            this.location.y+dy <= player1.location.y+player1.height &&
            this.location.x >= player1.location.x &&
            this.location.x <= player1.location.x+player1.width) {
                return true;
        }
        return false;
    }

    collisionPlayer2() {
        if (this.location.x+dx >= player2.location.x && 
            this.location.x+dx <= player2.location.x+player2.location.width &&
            this.location.y >= player2.location.y && 
            this.location.y <= player2.location.y+player1.height) {
                return true;
        }
        if (this.location.y+dy >= player2.location.y &&
            this.location.y+dy <= player2.location.y+player2.height &&
            this.location.x >= player2.location.x &&
            this.location.x <= player2.location.x+player1.width) {
                return true;
        }
        return false;
    }

    collisionBar() {
        if (this.location.x+dx <= 0) {
            return {
                player: player1,
                collision: true
            };
        }
        if (this.location.x+dx >= BOARD_SIZE_WIDTH) {
            return {
                player: player2,
                collision: true
            };
        }
        return {
            player: 'player',
            collision: false
        }
    }

    move() {
        board.ctx.clearRect(0, 0, BOARD_SIZE_WIDTH, BOARD_SIZE_HEIGHT);
        board.drawBoundary();
        player1.generate();
        player2.generate();
        if (this.collisionPlayer1() || this.collisionPlayer2()) dx = -dx;
        if (this.location.y+dy <= 0 || 
            this.location.y+dy >= BOARD_SIZE_HEIGHT || 
            this.collisionPlayer1() || 
            this.collisionPlayer2()) dy = -dy;
        this.location.x += dx;
        this.location.y += dy;
        this.generateBall();
        let bars = this.collisionBar();
        if (bars.collision) {
            if (bars.player === player1) {
                player2_score.innerText = ++player2.score;
                if (player2.score === maxScore) {
                    player2_result.innerText = 'You Win!!!';
                    player1_result.innerText = 'You Lose!!!';
                    playing = 0;
                }
            }
            if (bars.player === player2) {
                player1_score.innerText = ++player1.score;
                if (player1.score === maxScore) {
                    player1_result.innerText = 'You Win!!!';
                    player2_result.innerText = 'You Lose!!!';
                    playing = 0;
                    board.ctx.clearRect(0, 0, BOARD_SIZE_WIDTH, BOARD_SIZE_HEIGHT);
                    board.reset();
                }
            }
            if (player1.score < maxScore && player2.score < maxScore) {
                board.ctx.clearRect(0, 0, BOARD_SIZE_WIDTH, BOARD_SIZE_HEIGHT);
                board.reset();
                timerInterval = setInterval(() => {
                    this.speed -= 5;
                    clearInterval(intervalBall);
                    intervalBall = setInterval(() => {
                        this.move();
                    }, this.speed) 
                }, 10000)
                intervalBall = setInterval(() => {
                    this.move();
                }, this.speed) 
            }
        }
    }
}

let board = new Board(ctx);
let player1 = new Player(ctx, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_COLOR[0], PLAYER1_LOCATION_START.x, PLAYER1_LOCATION_START.y);
let player2 = new Player(ctx, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_COLOR[1], PLAYER2_LOCATION_START.x, PLAYER2_LOCATION_START.y);
let ball = new Ball(ctx, BALL_RADIUS, BALL_COLOR, BALL_LOCATION_START.x, BALL_LOCATION_START.y, ballSpeed);

play_btn.addEventListener('click', function(e) {
    playing = 1;
    board.reset();
    player1.score = 0;
    player2.score = 0;
    player1_score.innerText = player1.score;
    player2_score.innerText = player2.score;
    player1_result.innerText = '';
    player2_result.innerText = '';
    timerInterval = setInterval(() => {
        ball.speed -= 5;
        clearInterval(intervalBall);
        intervalBall = setInterval(() => {
            ball.move();
        }, ball.speed) 
    }, 10000)
    intervalBall = setInterval(() => {
        ball.move();
    }, ball.speed) 
})

document.addEventListener('keyup', function(e) {
    if (playing) {
        switch (e.code) {
            case 'KeyW':
                clearInterval(moveUpInterval1);
                clearInterval(moveDownInterval1);
                moveUpInterval1 = setInterval(() => {
                    player1.moveUp();
                }, 30)
                break;
            case 'KeyS':
                clearInterval(moveUpInterval1);
                clearInterval(moveDownInterval1);
                moveDownInterval1 = setInterval(() => {
                    player1.moveDown();
                }, 30)
                break;
            case 'ArrowUp':
                clearInterval(moveUpInterval2);
                clearInterval(moveDownInterval2);
                moveUpInterval2 = setInterval(() => {
                    player2.moveUp();
                }, 30)
                break;
            case 'ArrowDown':
                clearInterval(moveUpInterval2);
                clearInterval(moveDownInterval2);
                moveDownInterval2 = setInterval(() => {
                    player2.moveDown();
                }, 30)
                break;
            default:
                break;
        }
    }
});

