// const audio = new Audio("../assets/count.mp3");
// const startAudio = new Audio("../assets/start.mp3");
// const burstAudio = new Audio("../assets/blast.mp3");
// const gameOverAudio = new Audio("../assets/gameOver.mp3");

function loadAudioSync(url) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();

    // Event listener to check if the audio is fully loaded
    audio.addEventListener("canplaythrough", () => {
      resolve(audio);
    });

    // Event listener to handle any errors during audio loading
    audio.addEventListener("error", (error) => {
      reject(error);
    });

    // Set the audio source URL
    audio.src = url;

    // Start loading the audio
    audio.load();
  });
}

function loadAudiosSync(urls) {
  const audioPromises = urls.map((url) => loadAudioSync(url));

  return Promise.all(audioPromises);
}

// Usage
const audioUrls = [
  "../assets/count.mp3",
  "../assets/start.mp3",
  "../assets/blast.mp3",
  "../assets/gameOver.mp3",
];

loadAudiosSync(audioUrls)
  .then((audios) => {
    console.log("Audios loaded:", audios);

    audio = audios[0];
    startAudio = audios[1];
    burstAudio = audios[2];
    gameOverAudio = audios[3];

    const audioContext = new AudioContext();
    fetch("./assets/audio.mp3")
      .then((response) => response.arrayBuffer())
      .then((buffer) => audioContext.decodeAudioData(buffer))
      .then((audioBuffer) => {
        const sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.loop = true;
        sourceNode.volume = 1;
        sourceNode.connect(audioContext.destination);

        let finalScore = 0;

        //countdown application
        const capp = new PIXI.Application({
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: 0x000000,
        });

        globalThis.__PIXI_APP__ = capp;

        const loader = new PIXI.Loader();
        loader.add("sprite", "../assets/bg.jpg");
        loader.add("explosionSprite", "../assets/explosion.png");
        loader.add("fonts", "../fonts/ARCADE.TTF");

        loader.load((loader, resources) => {
          document.body.appendChild(capp.view);
          const backgroundImage = new PIXI.Sprite(resources.sprite.texture);
          const blurFilter = new PIXI.filters.BlurFilter();
          blurFilter.blur = 5;
          backgroundImage.filters = [blurFilter];

          backgroundImage.width = capp.screen.width;
          backgroundImage.height = capp.screen.height;

          capp.stage.addChild(backgroundImage);

          const countdownText = new PIXI.Text("Dashing Car", {
            fontFamily: '"My Font", fantasy',
            fontSize: 128,
            fill: "white",
          });

          countdownText.anchor.set(0.5);
          countdownText.x = capp.renderer.width / 2;
          countdownText.y = capp.renderer.height / 2;

          capp.stage.addChild(countdownText);

          setTimeout(() => {
            let countdown = 4;
            const countdownInterval = setInterval(() => {
              countdown--;
              if (countdown > 0) {
                audio.play();
              } else if (countdown === 0) {
                startAudio.play();
              }

              if (countdown !== -1) {
                countdownText.text = countdown.toString();
              }

              if (countdown === 0) {
                countdownText.text = "Get Set Goo !!!";
              } else if (countdown === -1) {
                clearInterval(countdownInterval);
                document.body.removeChild(capp.view);

                const htmlBody = document.querySelector("body");
                htmlBody.innerHTML = `<div id="game">
                  <div class="road"></div>
                </div>`;

                const bdy = document.querySelector("body");
                bdy.style.backgroundImage = `url(${bgImage})`;

                sourceNode.start();

                document.body.appendChild(app.view);
                requestAnimationFrame(gameLoop);
                PIXI.Loader.shared.add("../assets/car.png").load(playArea);

                const myTag = document.querySelector("canvas");
                myTag.style.left = "35.2%";
              }
            }, 1000);
          }, 1000);

          //game application
          const app = new PIXI.Application({
            width: 450,
            height: window.innerHeight,
            antialias: true,
            resolution: 1,
          });

          const gameContainer = new PIXI.Container();
          const roadContainer = new PIXI.Container();
          const carContainer = new PIXI.Container();
          const vehicleContainer = new PIXI.Container();
          const lineContainer = new PIXI.Container();
          const scoreContainer = new PIXI.Container();
          scoreContainer.position.set(20, 20);
          const hs = localStorage.getItem("highScore")
            ? localStorage.getItem("highScore")
            : 0;
          const highScoreText = new PIXI.Text("High Score : " + hs, {
            fontFamily: "My Font",
            fontSize: 24,
            fill: 0xffffff,
          });
          const timerText = new PIXI.Text("Time: 0", {
            fontFamily: "My Font",
            fontSize: 24,
            fill: 0xffffff,
          });
          const scoreText = new PIXI.Text("Score: 0", {
            fontFamily: "My Font",
            fontSize: 24,
            fill: 0xffffff,
          });

          app.stage.addChild(scoreContainer);

          scoreContainer.addChild(timerText);

          scoreText.position.set(0, 40);
          scoreContainer.addChild(scoreText);

          highScoreText.position.set(0, 80);
          scoreContainer.addChild(highScoreText);

          let elapsed = 0;
          let score = 0;
          let lastTime = performance.now();

          let player = {
            step: 8,
            x: 0,
            y: 0,
            start: false,
          };

          let keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
          };

          function keyDown(ev) {
            keys[ev.key] = true;
          }

          function keyUp(ev) {
            keys[ev.key] = false;
          }

          function update(dt) {
            if (player.start) {
              elapsed += dt;
              timerText.text = "Time: " + Math.floor(elapsed / 1000);

              score += Math.floor(dt / 10);
              finalScore = score;
              scoreText.text = "Score: " + score;

              if (score > localStorage.getItem("highScore")) {
                highScoreText.text = "High Score: " + score;
              }
            }
          }

          function gameLoop() {
            const currentTime = performance.now();
            const dt = currentTime - lastTime;
            lastTime = currentTime;
            update(dt);
            requestAnimationFrame(gameLoop);
          }

          function moveLines() {
            lineContainer.children.forEach((item) => {
              if (item.y >= 700) {
                item.y -= 850;
              }
              item.y += player.step;
            });
          }

          function moveVehicles(playerCar) {
            vehicleContainer.children.forEach((item) => {
              let otherCarBoun = item.getBounds();
              if (
                !(
                  playerCar.bottom - 20 < otherCarBoun.top ||
                  playerCar.top + 11 > otherCarBoun.bottom ||
                  playerCar.left + 15 > otherCarBoun.right ||
                  playerCar.right - 20 < otherCarBoun.left
                )
              ) {
                player.start = false;

                const centerX = playerCar.x + playerCar.width / 2;
                const centerY = playerCar.y + playerCar.height / 2;

                const explosionTextures = [];
                let sheet = PIXI.BaseTexture.from(
                  resources.explosionSprite.url
                );
                const w = 128;
                const h = 128;
                for (let i = 0; i < 12; i++) {
                  explosionTextures.push(
                    new PIXI.Texture(sheet, new PIXI.Rectangle(i * w, 0, w, h))
                  );
                }
                const animated = new PIXI.AnimatedSprite(explosionTextures);

                animated.anchor.set(0.5);
                animated.animationSpeed = 0.1;
                animated.loop = false;
                animated.x = centerX;
                animated.y = centerY + 3;

                app.stage.addChild(animated);
                burstAudio.play();
                animated.play();
                gameContainer.removeChild(carContainer);

                setTimeout(() => {
                  if (!localStorage.getItem("highScore")) {
                    localStorage.setItem("highScore", finalScore);
                    highScore.text = "New High Score !";
                  } else if (
                    localStorage.getItem("highScore") &&
                    localStorage.getItem("highScore") < finalScore
                  ) {
                    localStorage.setItem("highScore", finalScore);
                    highScore.text = "New High Score !";
                  } else {
                    highScore.text =
                      "High Score: " + localStorage.getItem("highScore");
                  }

                  userScore.text = "Your Score : " + finalScore;
                  document.body.removeChild(app.view);

                  sourceNode.stop();
                  gameOverAudio.play();

                  document.body.appendChild(scoreCard.view);
                }, 2000);
              }

              if (item.y > 750) {
                item.y = -600;
                item.x = Math.ceil(Math.random() * 350);
              }

              item.y += player.step;
            });
          }

          function playArea() {
            carContainer.addChild(
              new PIXI.Sprite(PIXI.Texture.from("../assets/cars3.png"))
            );

            carContainer.children[0].width = 40;
            carContainer.children[0].height = 70;
            carContainer.children[0].position.set(
              195,
              window.innerHeight - 200
            );

            for (let i = 0; i < 6; i++) {
              let line = new PIXI.Graphics();
              line.beginFill(0xffffff).drawRect(0, 0, 15, 100).endFill();
              line.position.set(230, -100 * i);
              lineContainer.addChild(line);
            }

            for (let i = 0; i < 10; i++) {
              let vehicle = new PIXI.Sprite(
                PIXI.Texture.from("../assets/obstacle.png")
              );

              vehicle.width = 60;
              vehicle.height = 100;
              vehicle.position.set(Math.random() * 390, -100 * i - 150);
              vehicleContainer.addChild(vehicle);
            }

            gameContainer.addChild(roadContainer);
            gameContainer.addChild(lineContainer);
            gameContainer.addChild(vehicleContainer);
            gameContainer.addChild(carContainer);

            app.stage.addChild(gameContainer);
            app.stage.addChild(scoreContainer);

            window.addEventListener("keydown", keyDown);
            window.addEventListener("keyup", keyUp);

            app.ticker.add(() => {
              if (elapsed % 15 === 0) {
                player.step += 1;
              }
              if (player.start) {
                if (keys.ArrowLeft && carContainer.children[0].x > 13) {
                  carContainer.children[0].x -= player.step;
                }
                if (keys.ArrowRight && carContainer.children[0].x < 420 - 44) {
                  carContainer.children[0].x += player.step;
                }
                if (keys.ArrowUp && carContainer.children[0].y > 40) {
                  carContainer.children[0].y -= player.step;
                }
                if (keys.ArrowDown && carContainer.children[0].y < 600) {
                  carContainer.children[0].y += player.step;
                }

                moveVehicles(carContainer.children[0].getBounds());

                moveLines();
              }
            });

            player.start = true;
            app.start();
          }

          //score  container
          const scoreCard = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x000000,
          });

          const bgImage = new PIXI.Sprite.from("./assets/bg.jpg");
          const blurFil = new PIXI.filters.BlurFilter();
          blurFil.blur = 5;
          bgImage.filters = [blurFil];

          bgImage.width = scoreCard.screen.width;
          bgImage.height = scoreCard.screen.height;

          scoreCard.stage.addChild(bgImage);

          const userScore = new PIXI.Text("", {
            fontFamily: "My Font",
            fontSize: 120,
            fill: "white",
          });

          userScore.anchor.set(0.5);
          userScore.x = scoreCard.renderer.width / 2;
          userScore.y = scoreCard.renderer.height / 2 + 80;

          const highScore = new PIXI.Text("", {
            fontFamily: "My Font",
            fontSize: 120,
            fill: "white",
          });

          highScore.anchor.set(0.5);
          highScore.x = scoreCard.renderer.width / 2;
          highScore.y = scoreCard.renderer.height / 2 - 50;

          scoreCard.stage.addChild(highScore);

          scoreCard.stage.addChild(userScore);

          const playAgain = new PIXI.Text("Play Again", {
            fontFamily: "My Font",
            fontSize: 60,
            fill: "white",
          });

          playAgain.anchor.set(0.5);
          playAgain.x = scoreCard.renderer.width / 2;
          playAgain.y = scoreCard.renderer.height / 2 + 250;
          playAgain.interactive = true;
          playAgain.buttonMode = true;
          playAgain.on("pointerdown", () => {
            window.location.reload();
          });

          scoreCard.stage.addChild(playAgain);
        });
      });
  })
  .catch((error) => {
    console.error("Error loading audios:", error);
  });
