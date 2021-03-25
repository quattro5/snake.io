<template>
  <div class="endgame" v-if="die">
    <h2>Вы проиграли!</h2>
    <h2>Ваш счёт: {{ score }}</h2>
    <button @click="start">Начать заново</button>
  </div>
  <div class="score">
    <div>Ваш счёт: {{ score }}</div>
    <div>Длина змеи: {{ snake?.length ?? 0 }}</div>
    <div>Еды на карте: {{ food.length }}</div>
  </div>
  <canvas
    id="snakeboard"
    ref="snakeboard"
    :width="boardWidth"
    :height="boardHeight"
  ></canvas>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      food_img: null,
      board_bg_image: null,
      board_border: "black",
      snake_col: "green",
      snake_border: "darkblue",

      snake: null,
      snakeInit: [
        { x: 200, y: 200 },
        { x: 190, y: 200 },
        { x: 180, y: 200 },
        { x: 170, y: 200 },
        { x: 160, y: 200 },
      ],

      foodNum: 10,
      food: [],

      score: 0,
      changing_direction: false,
      dx: 10,
      dy: 0,
      die: false,
      boardWidth: 400,
      boardHeight: 400,
    };
  },

  mounted() {
    this.snakeboard_ctx = this.$refs.snakeboard.getContext("2d");
    document.addEventListener("keydown", this.change_direction);
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
      const hitLeftWall = this.snake[0].x < 0;
      const hitRightWall = this.snake[0].x > this.boardWidth - 10;
      const hitTopWall = this.snake[0].y < 0;
      const hitBottomWall = this.snake[0].y > this.boardHeight - 10;
      return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
    },

    boardImage() {
      const img = new Image(400, 400);
      img.src =
        "http://static9.depositphotos.com/1008280/1225/i/450/depositphotos_12251693-Sand-Texture.jpg";
      return img;
    },

    foodImage() {
      const img = new Image(10, 10);
      img.src =
        "https://sun9-9.userapi.com/impg/AQ8m1qpKcB0r_XRi7UPDhkYG9oCQnIFb3EyEwQ/FYGWAroZaYg.jpg?size=10x10&quality=96&sign=09a0fcd6f1d983e86ee875e80e112e95&type=album";
      return img;
    },
  },

  methods: {
    start() {
      this.die = false;
      this.board_bg_image = this.boardImage;
      this.food_img = this.foodImage;

      this.score = 0;
      this.dx = 10;
      this.dy = 0;
      this.snake = JSON.parse(JSON.stringify(this.snakeInit));

      this.main();
      this.gen_food();
    },

    main() {
      if (this.endGame) {
        this.die = true;
        return;
      }

      this.changing_direction = false;
      setTimeout(() => {
        this.clear_board();
        this.drawFood();
        this.move_snake();
        this.drawSnake();

        this.main();
      }, 70 - this.score);
    },

    clear_board() {
      this.snakeboard_ctx.drawImage(this.board_bg_image, 0, 0);

      this.snakeboard_ctx.strokeStyle = this.board_border;
      this.snakeboard_ctx.strokeRect(0, 0, this.boardWidth, this.boardHeight);
    },

    drawSnake() {
      this.snake.forEach(this.drawSnakePart);
    },

    drawFood() {
      this.food.forEach((food) => {
        this.snakeboard_ctx.drawImage(this.food_img, food.x, food.y);
      });
    },

    drawSnakePart(snakePart) {
      this.snakeboard_ctx.fillStyle = this.snake_col;
      this.snakeboard_ctx.strokeStyle = this.snake_border;
      this.snakeboard_ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
      this.snakeboard_ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
    },

    random_food(min, max) {
      return Math.round((Math.random() * (max - min) + min) / 10) * 10;
    },

    gen_food() {
      const foodLength = this.food.length || 1;
      for (let i = 0; i <= this.foodNum - foodLength; i++) {
        this.food.push({
          x: this.random_food(0, this.boardWidth - 10),
          y: this.random_food(0, this.boardHeight - 10),
        });
      }

      this.snake.forEach((part) => {
        const has_eaten = this.has_eaten_food(part);
        if (has_eaten !== -1) {
          this.food = this.food.filter((f, idx) => idx !== has_eaten);
        }
      });
    },

    change_direction(event) {
      const LEFT_KEY = 37;
      const RIGHT_KEY = 39;
      const UP_KEY = 38;
      const DOWN_KEY = 40;

      if (this.changing_direction) {
        return;
      }
      this.changing_direction = true;
      const keyPressed = event.keyCode;
      const goingUp = this.dy === -10;
      const goingDown = this.dy === 10;
      const goingRight = this.dx === 10;
      const goingLeft = this.dx === -10;

      if (keyPressed === LEFT_KEY && !goingRight) {
        this.dx = -10;
        this.dy = 0;
      }
      if (keyPressed === UP_KEY && !goingDown) {
        this.dx = 0;
        this.dy = -10;
      }
      if (keyPressed === RIGHT_KEY && !goingLeft) {
        this.dx = 10;
        this.dy = 0;
      }
      if (keyPressed === DOWN_KEY && !goingUp) {
        this.dx = 0;
        this.dy = 10;
      }
    },

    move_snake() {
      const head = {
        x: this.snake[0].x + this.dx,
        y: this.snake[0].y + this.dy,
      };

      this.snake.unshift(head);

      if (this.has_eaten_food(this.snake[0]) !== -1) {
        this.score += 1;
        this.gen_food();
      } else {
        this.snake.pop();
      }
    },

    has_eaten_food(part) {
      let i = -1;
      this.food.forEach((f, idx) => {
        if (part.x === f.x && part.y === f.y && i === -1) {
          i = idx;
        }
      });
      return i;
    },
  },

  watch: {},
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap");

* {
  font-family: "Roboto", cursive;
}

.endgame {
  position: fixed;
  top: 30%;
  bottom: 30%;
  left: 0;
  right: 0;
  z-index: 9999;
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
}

.endgame h2 {
  color: white;
  margin: 0 0 30px;
}

button {
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
