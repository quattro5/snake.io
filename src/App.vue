<template>
  <div class="endgame" v-if="!die">
    <h2>Вы проиграли!</h2>
    <h2>Ваш счёт: {{ score }}</h2>
    <button @click="start">Начать заново</button>
  </div>

  <div class="score">
    <div>Ваш счёт: {{ score }}</div>
    <div>Длина змеи: {{ snake?.length ?? 0 }}</div>
    <div>Еды на карте: {{ food.length }}</div>
    <div>Скорость: {{ timeout }}</div>
    <div>Скорость: {{ speed }}</div>
  </div>

  <canvas
    id="snakeboard"
    ref="snakeboard"
    :width="boardWidth"
    :height="boardHeight"
  ></canvas>
</template>

<script>
import boardImage from "./assets/sand.jpg";
import foodImage from "./assets/apple.png";

export default {
  name: "App",
  data() {
    return {
      snake: null,
      snakeInit: [],
      otherSnakes: [
        { x: 20 * 12, y: 10 * 12, head: true },
        { x: 19 * 12, y: 10 * 12 },
        { x: 18 * 12, y: 10 * 12 },
        { x: 17 * 12, y: 10 * 12 },
        { x: 16 * 12, y: 10 * 12 },
        { x: 15 * 12, y: 10 * 12 },
        { x: 14 * 12, y: 10 * 12 },
        { x: 13 * 12, y: 10 * 12 },
      ],

      foodNum: 10,
      food: [],
      die: false,
      changingDirection: false,
      score: 0,
      startTimeout: 100,

      scale: 12,
      boardWidth: 80,
      boardHeight: 40,

      board_border: "black",
      snake_col: "green",
      snake_border: "darkblue",
    };
  },

  mounted() {
    this.ctx = this.$refs.snakeboard.getContext("2d");
    document.addEventListener("keydown", this.changeDirection);

    this.snakeInit = [
      { x: 20 * this.scale, y: 20 * this.scale },
      { x: 19 * this.scale, y: 20 * this.scale },
      { x: 18 * this.scale, y: 20 * this.scale },
      { x: 17 * this.scale, y: 20 * this.scale },
      { x: 16 * this.scale, y: 20 * this.scale, head: true },
    ];

    this.boardWidth *= this.scale;
    this.boardHeight *= this.scale;

    this.start();
  },

  computed: {
    endGame() {
      for (let i = 4; i < this.snake.length; i++) {
        if (
          this.snake[i].x === this.snake[0].x &&
          this.snake[i].y === this.snake[0].y
        ) {
          return true;
        }
      }

      for (let i = 0; i < this.otherSnakes.length; i++) {
        if (
          this.otherSnakes[i].x === this.snake[0].x &&
          this.otherSnakes[i].y === this.snake[0].y
        ) {
          return true;
        }
      }
      const hitLeftWall = this.snake[0].x < 0;
      const hitRightWall = this.snake[0].x > this.boardWidth - this.scale;
      const hitTopWall = this.snake[0].y < 0;
      const hitBottomWall = this.snake[0].y > this.boardHeight - this.scale;
      return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
    },

    boardImage() {
      const img = new Image();
      img.src = boardImage;
      return img;
    },

    foodImage() {
      const img = new Image();
      img.src = foodImage;
      return img;
    },

    timeout() {
      return this.startTimeout - this.score / 3;
    },

    speed() {
      return (1 - this.timeout / 100 + 1).toFixed(3);
    },
  },

  methods: {
    start() {
      this.die = false;

      this.score = 0;
      this.dx = this.scale;
      this.dy = 0;
      this.snake = JSON.parse(JSON.stringify(this.snakeInit));

      this.gameTimeout();
      this.generateFood();
    },

    gameTimeout() {
      this.snake = [...this.snake];
      this.food = [...this.food];
      this.otherSnakes = [...this.otherSnakes];

      if (this.endGame) {
        this.die = true;
        return;
      }

      this.changingDirection = false;
      setTimeout(() => {
        this.clearBoard();
        this.moveSnake();
        this.gameTimeout();
      }, this.timeout);
    },

    clearBoard() {
      this.ctx.drawImage(
        this.boardImage,
        0,
        0,
        this.boardWidth,
        this.boardHeight
      );

      this.ctx.strokeStyle = this.board_border;
      this.ctx.strokeRect(0, 0, this.boardWidth, this.boardHeight);
    },

    drawSnakePart(snakePart) {
      this.ctx.fillStyle = snakePart.head ? "red" : this.snake_col;
      this.ctx.strokeStyle = this.snake_border;
      this.ctx.fillRect(snakePart.x, snakePart.y, this.scale, this.scale);
      this.ctx.strokeRect(snakePart.x, snakePart.y, this.scale, this.scale);
    },

    randomFood(min, max) {
      return (
        Math.round((Math.random() * (max - min) + min) / this.scale) *
        this.scale
      );
    },

    generateFood() {
      const foodLength = this.food.length || 1;
      for (let i = 0; i <= this.foodNum - foodLength; i++) {
        this.food.push({
          x: this.randomFood(0, this.boardWidth - this.scale),
          y: this.randomFood(0, this.boardHeight - this.scale),
        });
      }

      this.snake.forEach((part) => {
        const has_eaten = this.hasEatenFood(part);
        if (has_eaten !== -1) {
          this.food = this.food.filter((f, idx) => idx !== has_eaten);
        }
      });
    },

    changeDirection(event) {
      const LEFT_KEY = 37;
      const RIGHT_KEY = 39;
      const UP_KEY = 38;
      const DOWN_KEY = 40;

      if (this.changingDirection) {
        return;
      }
      this.changingDirection = true;

      const keyPressed = event.keyCode;
      const goingUp = this.dy === -this.scale;
      const goingDown = this.dy === this.scale;
      const goingRight = this.dx === this.scale;
      const goingLeft = this.dx === -this.scale;

      if (keyPressed === LEFT_KEY && !goingRight) {
        this.dx = -this.scale;
        this.dy = 0;
      }
      if (keyPressed === UP_KEY && !goingDown) {
        this.dx = 0;
        this.dy = -this.scale;
      }
      if (keyPressed === RIGHT_KEY && !goingLeft) {
        this.dx = this.scale;
        this.dy = 0;
      }
      if (keyPressed === DOWN_KEY && !goingUp) {
        this.dx = 0;
        this.dy = this.scale;
      }
    },

    moveSnake() {
      const head = {
        x: this.snake[0].x + this.dx,
        y: this.snake[0].y + this.dy,
        head: true,
      };
      this.snake.forEach((part) => (part.head = false));
      this.snake.unshift(head);

      if (this.hasEatenFood(this.snake[0]) !== -1) {
        this.score += 1;
        this.generateFood();
      } else {
        this.snake.pop();
      }
    },

    hasEatenFood(part) {
      let i = -1;
      this.food.forEach((f, idx) => {
        if (part.x === f.x && part.y === f.y && i === -1) {
          i = idx;
        }
      });
      return i;
    },
  },

  watch: {
    snake() {
      this.snake.forEach(this.drawSnakePart);
    },

    otherSnakes() {
      this.otherSnakes.forEach((snake) => {
        this.drawSnakePart(snake);
      });
    },

    food() {
      this.food.forEach((food) => {
        this.ctx.drawImage(
          this.foodImage,
          food.x,
          food.y,
          this.scale,
          this.scale
        );
      });
    },
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap");

* {
  font-family: "Roboto", cursive;
}

/*body {*/
/*  background: url("./assets/grass.jpg");*/
/*}*/

.endgame {
  position: fixed;
  top: 30%;
  bottom: 30%;
  left: 0;
  right: 0;
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: linear-gradient(to right, #12c2e9, #c471ed, #f64f59);
}

#snakeboard {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.score {
  position: absolute;
  top: 50%;
  left: 20%;
  transform: translate(-50%, -50%);
  font-size: 26px;
  z-index: 2;
}

.endgame h2 {
  color: white;
  margin: 0 0 30px;
}

button {
  display: flex;
  align-items: center;

  cursor: pointer;
  font-size: 1.2rem;
  padding: 10px 50px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(0deg, white, #eee);
  box-shadow: 0 10px 10px #0003;
  transition: all 0.5s ease;
}

button:hover {
  box-shadow: 0 15px 15px #0005;
}
</style>
