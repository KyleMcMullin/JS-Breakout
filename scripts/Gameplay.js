MyGame.screens['game-play'] = (function (game, input) {
    'use strict';


    let lastTimeStamp = performance.now();
    let cancelNextRequest = true;

    let myKeyboard = input.Keyboard();

    let gameState = {
        movable: false,
        score: 0,
        lives: function () {
            let count = 3;
            let image = new Image();
            image.src = 'assets/lives.png';
            let reset = function () {
                this.count = 3;
            }
            return {
                count: count,
                image: image,
                reset: reset
            }
        }(),
        roundEnd: false,
        newBallScore: 0
    }

    let balls = [];
    balls.push(createBall());

    let paddle = {
        center: { x: 540, y: 801 },
        width: 180,
        height: 32,
        position: {
            x: 450,
            y: 785
        },
        speed: 400,
        fillColor: 'rgba(85, 85, 85, 1)',
        strokeColor: 'rgba(255, 255, 255, 1)',
        moveLeft: function () {
            if (this.position.x < 35) return;
            this.center.x -= this.speed * 0.016;
            this.position.x -= this.speed * 0.016;
        },
        moveRight: function () {
            if (this.position.x + this.width > 965) return;
            this.center.x += this.speed * 0.016;
            this.position.x += this.speed * 0.016;
        },
        shrink: function () {
            this.width = 90;
        },
        intersects: function (ball) {
            if (
                (ball.center.x + ball.radius > this.position.x && ball.center.x + ball.radius < this.position.x + this.width)
                || (ball.center.x - ball.radius > this.position.x && ball.center.x - ball.radius < this.position.x + this.width)
            ) {
                if (
                    (ball.center.y + ball.radius > this.position.y && ball.center.y + ball.radius < this.position.y + this.height)
                    || (ball.center.y - ball.radius > this.position.y && ball.center.y - ball.radius < this.position.y + this.height)) {
                    return true;
                }
            }
            return false;
        },
        collapse: function () {
            this.width -= 5;
            this.position.x += 2.5;
        },
        reset: function () {
            this.center.x = 500;
            this.position.x = 450;
            this.center.y = 700;
            this.position.y = 785;
            this.width = 180;
        }
    }

    let openCount = {
        display: false,
        count: 3,
        elapsedTime: 0,
        check: function () {
            if (this.elapsedTime > 1000) {
                this.elapsedTime = 0;
                this.count--;
            }
            if (this.count === -1) {
                this.display = false;
                gameState.movable = true;
            }
        },
        reset: function () {
            this.display = true;
            this.count = 3;
            gameState.movable = false;
        }
    };

    let bricks = {
        destroyedBrickCount: 0,
        destroyedRowCount: 0,
        destroyedTopRow: false, // transfer to per brick
        gameBricks: initializeBreakableBricks(),
        borderBricks: initializeBorderBricks(),
        reset: function () {
            this.destroyedCount = 0;
            this.destroyedTopRow = false;
        }
    }

    function gameOver() {
        gameState.lives.count--;
        if (gameState.lives.count === 0) {
            gameState.movable = false;
            const highScores = MyGame.persistence.report();
            for (let i = 0; i < 5; i++) {
                if (highScores[`${i}`] === undefined) {
                    MyGame.persistence.add(i, gameState.score);
                    break;
                } else {
                    if (gameState.score > highScores[i]) {
                        MyGame.persistence.remove(highScores[`${highScores.length - 1}`]);
                        MyGame.persistence.add(i, gameState.score);
                        break;
                    }
                }
            }
            cancelNextRequest = true;
            game.showScreen('main-menu');
        } else {
            gameState.roundEnd = true;
            gameState.movable = false;
        }
    }

    function processInput(elapsedTime) {
        myKeyboard.update(elapsedTime);
    }

    function update(elapsedTime) {
        if (gameState.roundEnd) {
            paddle.collapse();
            if (paddle.width <= 0) {
                resetRound();
            }
        }
        if (openCount.display) {
            openCount.elapsedTime += elapsedTime;
            openCount.check();
        }
        for (let i = 0; i < balls.length; i++) {
            if (balls[i].isAlive) {
                balls[i].update(elapsedTime);
            }
        }
        for (let i = 0; i < bricks.gameBricks.length; i++) {
            for (let j = 0; j < bricks.gameBricks[i].row.length; j++) {
                if (!bricks.gameBricks[i].row[j].isAlive) {
                    bricks.gameBricks[i].row[j].particleSystem.update(elapsedTime);
                    // console.log(bricks.gameBricks[i].row[j].particleSystem.particles);
                }
            }
        }
    }

    function render() {
        MyGame.graphics.clear();
        for (let i = bricks.gameBricks.length - 1; i >= 0; i--) {
            for (let j = 0; j < bricks.gameBricks[i].row.length; j++) {
                if (bricks.gameBricks[i].row[j].isAlive) {
                    MyGame.graphics.drawRectangle(bricks.gameBricks[i].row[j]);
                } else {
                    bricks.gameBricks[i].row[j].renderParticles.render();
                }
            }
        }
        for (let i = 0; i < bricks.borderBricks.length; i++) {
            MyGame.graphics.drawRectangle(bricks.borderBricks[i]);
        }
        if (openCount.display) {
            let x = MyGame.graphics.canvas.width / (openCount.count === 0 ? 2.2 : 2);
            let y = MyGame.graphics.canvas.height / 1.8;
            MyGame.graphics.drawText({
                font: '86px Arial',
                fillStyle: 'rgba(195, 223, 21, 0.8)',
                strokeStyle: 'rgba(255, 0, 0, 1)',
                position: { x: x, y: y },
                rotation: 0,
                text: openCount.count === 0 ? 'GO!' : openCount.count
            });
        }
        MyGame.graphics.drawText({
            font: '40px Arial',
            fillStyle: 'rgba(195, 223, 21, 0.8)',
            strokeStyle: 'rgba(255, 0, 0, 1)',
            position: { x: 800, y: 900 },
            rotation: 0,
            text: `Score: ${gameState.score}`
        });
        for (let i = 0; i < gameState.lives.count; i++) {
            MyGame.graphics.drawTexture(
                gameState.lives.image,
                { x: 50 + (i * 100), y: 920 },
                0,
                { width: 100, height: 100 }
            );
        }
        MyGame.graphics.drawRectangle(paddle);
        for (let i = 0; i < balls.length; i++) {
            if (balls[i].isAlive) {
                MyGame.graphics.drawCircle(balls[i]);
            }
        }
    }

    function gameLoop(time) {
        let elapsedTime = time - lastTimeStamp;
        lastTimeStamp = time;

        processInput(elapsedTime);
        update(elapsedTime);
        render();

        if (!cancelNextRequest) {
            requestAnimationFrame(gameLoop);
        }
    }

    function makeBrick(center, start, width, height, rotation, outlineColor, fillColor, isBreakable, points = 0, topRow = false) {
        let particleSystem = MyGame.systems.ParticleSystem({
            center: { x: center.x, y: center.y },
            height: height,
            width: width,
            size: { mean: 1, stdev: .2 },
            speed: { mean: 40, stdev: 10 },
            lifetime: { mean: .25, stdev: 0.05 },
            outlineColor: outlineColor,
            fillColor: fillColor,
        })
        return {
            center: center,
            position: start,
            width: width,
            height: height,
            rotation: rotation,
            outlineColor: outlineColor,
            fillColor: fillColor,
            isBreakable: isBreakable,
            topRow: topRow,
            points: points,
            isAlive: true,
            intersects: function (ball) {
                if (
                    (ball.center.x + ball.radius > this.position.x && ball.center.x + ball.radius < this.position.x + this.width)
                    || (ball.center.x - ball.radius > this.position.x && ball.center.x - ball.radius < this.position.x + this.width)
                ) {
                    if (
                        (ball.center.y + ball.radius > this.position.y && ball.center.y + ball.radius < this.position.y + this.height)
                        || (ball.center.y - ball.radius > this.position.y && ball.center.y - ball.radius < this.position.y + this.height)) {
                        return true;
                    }
                }
                return false;
            },
            particleSystem: particleSystem, 
            renderParticles: MyGame.render.ParticleSystem(particleSystem, MyGame.graphics)
        }
    }

    function initializeBreakableBricks() {
        let bricks = [];
        // 8 rows of bricks
        for (let i = 0; i < 8; i++) {
            let row = [];
            // 14 bricks per row
            let gray = 'rgba(85, 85, 85, 0.8)';
            let color = 'rgba(85, 85, 85, 0.8)';
            let points = 0;
            let topRow = false;
            switch (i) {
                case 0:
                    color = 'rgba(46, 243, 56, 1';
                    points = 5;
                    topRow = true;
                    break;
                case 1:
                    color = 'rgba(46, 243, 56, 1';
                    points = 5;
                    break;
                case 2: case 3:
                    color = 'rgba(46, 134, 243, 1)';
                    points = 3;
                    break;
                case 4: case 5:
                    color = 'rgba(243, 142, 46, 1)';
                    points = 2;
                    break;
                case 6: case 7:
                    color = 'rgba(216, 243, 46, 1)';
                    points = 1;
                    break;
            }
            for (let j = 0; j < 14; j++) {
                row.push(makeBrick(
                    { x: (j * 64) + 83, y: i * 30 + 278 },
                    { x: (j * 64) + 53, y: i * 30 + 265 },
                    60,
                    25,
                    0,
                    gray,
                    color,
                    true,
                    points,
                    topRow
                ));
            }
            bricks.push({
                row: row,
                bounds: {
                    topLeft: { x: 53, y: i * 30 + 265 },
                    bottomRight: { x: 945, y: 680 },
                    intersects: function (ball) {
                        if (
                            (ball.center.x + ball.radius > this.topLeft.x && ball.center.x + ball.radius < this.bottomRight.x)
                            || (ball.center.x - ball.radius > this.topLeft.x && ball.center.x - ball.radius < this.bottomRight.x)
                        ) {
                            if (
                                (ball.center.y + ball.radius > this.topLeft.y && ball.center.y + ball.radius < this.bottomRight.y)
                                || (ball.center.y - ball.radius > this.topLeft.y && ball.center.y - ball.radius < this.bottomRight.y)) {
                                return true;
                            }
                        }
                        return false;
                    }
                },
                rowDestroyedCount: 0
            });
        }
        return bricks;
    }

    function initializeBorderBricks() {
        let bricks = [];
        for (let i = 0; i < 12; i++) {
            bricks.push(makeBrick(
                { x: 20, y: (i * 65) + 71 },
                { x: 5, y: (i * 65) + 40 },
                30,
                62,
                0,
                'rgba(255, 0, 0, 1)',
                'rgba(85, 85, 85, 1)',
                false,
                0,
                false
            ));
            bricks.push(makeBrick(
                { x: 980, y: (i * 65) + 71 },
                { x: 965, y: (i * 65) + 40 },
                30,
                62,
                0,
                'rgba(255, 0, 0, 1)',
                'rgba(85, 85, 85, 1)',
                false,
                0,
                false
            ));
        }
        for (let i = 0; i < 15; i++) {
            bricks.push(makeBrick(
                { x: ((i * 66) + 68), y: 5 },
                { x: (i * 66) + 6, y: 5 },
                64,
                30,
                0,
                'rgba(255, 0, 0, 1)',
                'rgba(85, 85, 85, 1)',
                false,
                0,
                false
            ));
        }
        return bricks;
    }

    function createBall(center = { x: 480, y: 760 }, direction = { x: -0.4, y: 0.4 }) {
        return {
            center: { x: center.x, y: center.y },
            radius: 16,
            direction: { x: direction.x, y: direction.y },
            speed: 0.33,
            outlineColor: 'rgba(255, 37, 37, 1)',
            fillColor: 'rgba(255, 37, 37, 1)',
            isAlive: true,
            ballDestroyedBricks: 0,
            update: function (elapsedTime) {
                if (!gameState.movable) return;
                this.center.x += this.direction.x * this.speed * elapsedTime;
                this.center.y += this.direction.y * this.speed * elapsedTime;
                this.HandleWallCollision();
                this.HandlePaddleCollision();
                this.HandleGameBrickCollision();
            },
            incrementSpeed: function () {
                this.speed += 0.06;
            },
            reset: function () {
                this.center = { x: 480, y: 760 };
                this.velocity = { x: 0.4, y: 0.4 };
                this.speed = 0.33;
            },
            HandlePaddleCollision() {
                if (this.direction.y > 0 && paddle.intersects(this)) {
                    this.direction.y = -this.direction.y;
                    this.center.y = paddle.position.y - paddle.height;
                    this.direction.x = (this.center.x - paddle.center.x) / (paddle.width / 2);
                    this.direction = normalize(this.direction);

                }
            },
            HandleGameBrickCollision() {
                let ball = this;
                for (let i = 0; i < bricks.gameBricks.length; i++) {
                    let row = bricks.gameBricks[i];
                    if (row.bounds.intersects(ball)) {
                        for (let j = 0; j < row.row.length; j++) {
                            if (!row.row[j].isAlive) continue;
                            let brick = row.row[j];
                            if (brick.intersects(ball)) {
                                bricks.destroyedBrickCount += 1;
                                brick.isAlive = false;
                                row.rowDestroyedCount += 1;
                                this.ballDestroyedBricks += 1;
                                ball.direction.y = (this.center.y - brick.center.y) / (13);
                                ball.direction.x = (this.center.x - brick.center.x) / (30);
                                ball.direction = normalize(ball.direction);
                                gameState.score += brick.points;
                                gameState.newBallScore += brick.points;
                                if (brick.topRow) {
                                    paddle.shrink();
                                }
                                switch (this.ballDestroyedBricks) {
                                    case 4: case 12: case 32: case 62:
                                        ball.incrementSpeed();
                                        break;

                                }
                                if (row.rowDestroyedCount === row.row.length) {
                                    gameState.score += 25;
                                }
                                if (bricks.destroyedBrickCount === bricks.gameBricks.length * 14) {
                                    for (let i = 0; i < gameState.lives.count; i++) {
                                        gameState.score += 20;
                                        gameState.lives.count--;
                                    }
                                    gameOver();
                                }
                                if (gameState.newBallScore >= 100) {
                                    gameState.newBallScore = 0;
                                    balls.push(createBall({ x: paddle.center.x, y: paddle.center.y }, { x: 0.4, y: -0.4 }));
                                }
                                // return;
                            }
                        }
                    }
                }
            },
            HandleWallCollision() {
                if (this.center.x < 51) {
                    this.center.x = 51;
                    this.direction.x = 0.4;
                }
                if (this.center.x > 944) {
                    this.center.x = 944;
                    this.direction.x = -0.4;
                }
                if (this.center.y < 48) {
                    this.center.y = 48;
                    this.direction.y = 0.4;
                }
                if (this.center.y > 960) {
                    if (balls.length > 1) {
                        balls[balls.indexOf(this)].isAlive = false;
                        for (let i = 0; i < balls.length; i++) {
                            if (balls[i].isAlive) {
                                return;
                            }
                        }
                    }
                    gameOver();
                }
            },
        };
    }

    function normalize(vectory) {
        let length = Math.sqrt(vectory.x * vectory.x + vectory.y * vectory.y);
        return {
            x: vectory.x / length,
            y: vectory.y / length
        };
    }

    function resetRound() {
        gameState.roundEnd = false;
        gameState.topRow = false;
        gameState.movable = false;
        paddle.reset();
        balls = [];
        balls.push(createBall());
        openCount.reset();
    }

    function resetGame() {
        gameState.roundEnd = false;
        gameState.lives.reset();
        gameState.score = 0;
        gameState.topRow = false;
        gameState.movable = false;
        paddle.reset();
        balls = [];
        balls.push(createBall());
        bricks.gameBricks = initializeBreakableBricks();
        bricks.borderBricksm = initializeBorderBricks();
        openCount.reset();
    }

    function initialize() {
        myKeyboard.register('Escape', function () {
            //
            // Stop the game loop by canceling the request for the next animation frame
            cancelNextRequest = true;
            //
            // Then, return to the main menu
            // Add stuff here to show optional menu, ends in result of request animation frame or show main menu
            game.showScreen('pause-menu');
            document.getElementById('pause-resume').addEventListener(
                'click',
                function () {
                    game.showScreenNoRun('game-play');
                    cancelNextRequest = false;
                    MyGame.sounds.play();
                    openCount.reset();
                    requestAnimationFrame(gameLoop);
                }
            );
            MyGame.sounds.pause();
            openCount.reset();
        });

        myKeyboard.register('ArrowRight', function (elapsedTime) {
            if (gameState.movable) {
                paddle.moveRight(elapsedTime);
            }
        });

        myKeyboard.register('ArrowLeft', function (elapsedTime) {
            if (gameState.movable) {
                paddle.moveLeft(elapsedTime);
            }
        });

        // HELPER FUNCTION - desroy all but bottom row of bricks
        // myKeyboard.register('k', function () {
        //     if (bricks.destroyedRowCount > 0) return;
        //     for (let i = 0; i < bricks.gameBricks.length - 1; i++) {
        //         let row = bricks.gameBricks[i];
        //         for (let j = 0; j < row.row.length; j++) {
        //             row.row[j].isAlive = false;
        //             bricks.destroyedBrickCount += 1;
        //         }
        //         bricks.destroyedRowCount+=1;
        //     }
        // });

        // HELPER FUNCTION - generate new ball on next hit
        // myKeyboard.register('j', function () {
        //     gameState.newBallScore += 100;            
        // });
    }

    function run() {
        lastTimeStamp = performance.now();
        cancelNextRequest = false;
        resetGame();
        MyGame.sounds.play();
        openCount.reset();
        bricks.reset();
        requestAnimationFrame(gameLoop);
    }

    return {
        initialize: initialize,
        run: run
    };

}(MyGame.game, MyGame.input));
